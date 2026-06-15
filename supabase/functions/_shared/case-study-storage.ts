import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from 'npm:@aws-sdk/client-s3@3';
import { createServiceClient } from './supabase.ts';

export const STORAGE_BUCKET = 'case-study-media';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const sanitizeCaseStudyId = (id: string) => {
  const trimmed = id.trim().toLowerCase();
  if (!UUID_RE.test(trimmed)) return null;
  return trimmed;
};

export const extForMime = (mime: string) => {
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('quicktime')) return 'mov';
  return 'bin';
};

export const r2Client = (): S3Client | null => {
  const endpoint =
    Deno.env.get('R2_S3_ENDPOINT') ??
    Deno.env.get('CLOUDFLARE_S3_API') ??
    (Deno.env.get('R2_ACCOUNT_ID')
      ? `https://${Deno.env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`
      : '');

  const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID') ?? Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
  const secretAccessKey =
    Deno.env.get('R2_SECRET_ACCESS_KEY') ?? Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY');

  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  });
};

export const r2Config = () => {
  const bucket =
    Deno.env.get('R2_BUCKET') ??
    Deno.env.get('R2_BUCKET_NAME') ??
    Deno.env.get('CLOUDFLARE_R2_BUCKET');
  const publicBase = (Deno.env.get('R2_PUBLIC_BASE_URL') ?? '').replace(/\/$/, '');
  const prefix = (Deno.env.get('R2_CASE_STUDY_PREFIX') ?? 'case-studies').replace(/^\/|\/$/g, '');
  const client = r2Client();

  if (!bucket || !publicBase || !client) return null;

  return { bucket, publicBase, prefix, client };
};

export const uploadToR2 = async (bytes: Uint8Array, mime: string, caseStudyId: string) => {
  const config = r2Config();
  if (!config) return null;

  const ext = extForMime(mime);
  const objectKey = `${config.prefix}/${caseStudyId}/${crypto.randomUUID()}.${ext}`;

  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKey,
      Body: bytes,
      ContentType: mime,
      CacheControl: 'public, max-age=31536000, immutable'
    })
  );

  return {
    url: `${config.publicBase}/${objectKey}`,
    storageKey: objectKey,
    storage: 'r2' as const
  };
};

export const uploadToSupabaseStorage = async (
  bytes: Uint8Array,
  mime: string,
  caseStudyId: string
) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) return null;

  const ext = extForMime(mime);
  const objectPath = `${caseStudyId}/${crypto.randomUUID()}.${ext}`;
  const supabase = createServiceClient();

  const upload = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, bytes, {
    contentType: mime,
    upsert: false,
    cacheControl: '31536000'
  });

  if (upload.error) {
    console.error('Case study media upload error', upload.error);
    throw new Error(
      upload.error.message.includes('Bucket not found')
        ? `Storage bucket "${STORAGE_BUCKET}" is missing — run supabase db push.`
        : 'We could not upload your file — please try again.'
    );
  }

  return {
    url: `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`,
    storageKey: objectPath,
    storage: 'supabase' as const
  };
};

const deleteR2Keys = async (client: S3Client, bucket: string, keys: string[]) => {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return 0;

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: unique.map((Key) => ({ Key })), Quiet: true }
    })
  );

  return unique.length;
};

export const deleteR2Prefix = async (client: S3Client, bucket: string, prefix: string) => {
  let deleted = 0;
  let continuationToken: string | undefined;

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      })
    );

    const keys = (list.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key));

    deleted += await deleteR2Keys(client, bucket, keys);
    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (continuationToken);

  return deleted;
};

export const deleteR2CaseStudyMedia = async (caseStudyId: string, extraKeys: string[] = []) => {
  const config = r2Config();
  if (!config) return { deleted: 0, storage: 'r2' as const, configured: false };

  const prefix = `${config.prefix}/${caseStudyId}/`;
  let deleted = await deleteR2Prefix(config.client, config.bucket, prefix);
  deleted += await deleteR2Keys(config.client, config.bucket, extraKeys);

  return { deleted, storage: 'r2' as const, configured: true };
};

export const deleteSupabaseCaseStudyMedia = async (caseStudyId: string) => {
  const supabase = createServiceClient();
  const folder = caseStudyId;
  const paths: string[] = [];

  const listFolder = async (path: string) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(path, {
      limit: 1000
    });
    if (error) {
      console.error('Supabase storage list error', error);
      return;
    }

    for (const entry of data ?? []) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.id) {
        paths.push(entryPath);
      } else {
        await listFolder(entryPath);
      }
    }
  };

  await listFolder(folder);

  if (paths.length === 0) return { deleted: 0, storage: 'supabase' as const };

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  if (error) {
    console.error('Supabase storage delete error', error);
    throw new Error('Could not delete Supabase storage files.');
  }

  return { deleted: paths.length, storage: 'supabase' as const };
};

type MediaPayload = {
  url?: string;
  r2Key?: string;
  items?: Array<{ url?: string; r2Key?: string }>;
};

export const collectR2KeysFromBlocks = (
  blocks: Array<{ payload: MediaPayload }>,
  coverUrl: string | null | undefined
) => {
  const keys = new Set<string>();

  const addFromPayload = (payload: MediaPayload | undefined) => {
    if (!payload) return;
    if (payload.r2Key) keys.add(payload.r2Key);
    if (payload.items) {
      for (const item of payload.items) {
        if (item.r2Key) keys.add(item.r2Key);
      }
    }
  };

  for (const block of blocks) addFromPayload(block.payload);
  if (coverUrl) {
    const config = r2Config();
    if (config && coverUrl.startsWith(`${config.publicBase}/`)) {
      keys.add(coverUrl.slice(config.publicBase.length + 1));
    }
  }

  return [...keys];
};

export const parseSupabaseStoragePath = (url: string) => {
  const supabaseUrl = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  if (!supabaseUrl || !url.startsWith(supabaseUrl)) return null;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
};

export const collectSupabasePathsFromBlocks = (
  blocks: Array<{ payload: MediaPayload }>,
  coverUrl: string | null | undefined
) => {
  const paths = new Set<string>();

  const addUrl = (url: string | undefined) => {
    if (!url) return;
    const path = parseSupabaseStoragePath(url);
    if (path) paths.add(path);
  };

  const addFromPayload = (payload: MediaPayload | undefined) => {
    if (!payload) return;
    addUrl(payload.url);
    if (payload.items) {
      for (const item of payload.items) addUrl(item.url);
    }
  };

  for (const block of blocks) addFromPayload(block.payload);
  addUrl(coverUrl ?? undefined);

  return [...paths];
};

export const deleteSupabasePaths = async (paths: string[]) => {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return 0;

  const supabase = createServiceClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(unique);
  if (error) {
    console.error('Supabase storage delete paths error', error);
    throw new Error('Could not delete Supabase storage files.');
  }

  return unique.length;
};
