import type {
  CaseStudyBlock,
  CaseStudyImagePayload,
  CaseStudyPhotoGridPayload,
  CaseStudyTextPayload,
  CaseStudyVideoPayload,
  CaseStudyEmbedPayload
} from '../../types/case-study';
import { cn } from '../../lib/utils';
import { BentoPhotoGrid } from './BentoPhotoGrid';
import { CaseStudyMediaImage } from './CaseStudyMediaImage';
import { textBlockContainerClass, textBlockContentClass } from './textBlockStyles';

const mediaFrameClass = 'overflow-hidden rounded-xl bg-[#ececec]';

const ImageBlock = ({
  payload,
  priority = false
}: {
  payload: CaseStudyImagePayload;
  priority?: boolean;
}) => {
  if (!payload.url) return null;
  return (
    <figure className="w-full">
      <div className={mediaFrameClass}>
        <CaseStudyMediaImage
          src={payload.url}
          alt={payload.alt ?? ''}
          width={payload.width}
          height={payload.height}
          priority={priority}
          className="w-full"
        />
      </div>
      {payload.caption ? (
        <figcaption className="mt-4 text-sm text-gray-500 text-center max-w-2xl mx-auto">
          {payload.caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

const TextBlock = ({ payload }: { payload: CaseStudyTextPayload }) => {
  if (!payload.body?.trim()) return null;
  return (
    <div className={textBlockContainerClass(payload)}>
      <div className={textBlockContentClass(payload)}>{payload.body}</div>
    </div>
  );
};

const PhotoGridBlock = ({ payload }: { payload: CaseStudyPhotoGridPayload }) => {
  if (!payload.items?.length) return null;
  return <BentoPhotoGrid items={payload.items} />;
};

const VideoBlock = ({ payload }: { payload: CaseStudyVideoPayload }) => {
  if (!payload.url) return null;
  return (
    <div className={cn(mediaFrameClass, 'bg-black')}>
      <video
        src={payload.url}
        poster={payload.poster}
        autoPlay={payload.autoplay ?? true}
        muted={payload.muted ?? true}
        loop={payload.loop ?? true}
        playsInline
        controls={false}
        className="block w-full h-auto"
      />
    </div>
  );
};

const EmbedBlock = ({ payload }: { payload: CaseStudyEmbedPayload }) => {
  if (payload.embedUrl) {
    return (
      <div
        className={cn(mediaFrameClass, 'relative ring-1 ring-black/10')}
        style={{ aspectRatio: payload.aspectRatio ?? '16/9' }}
      >
        <iframe
          src={payload.embedUrl}
          title="Embedded content"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
        />
      </div>
    );
  }
  if (payload.html) {
    return (
      <div
        className={cn(mediaFrameClass, 'ring-1 ring-black/10 p-4')}
        dangerouslySetInnerHTML={{ __html: payload.html }}
      />
    );
  }
  return null;
};

export const CaseStudyBlockView = ({
  block,
  priority = false
}: {
  block: CaseStudyBlock;
  priority?: boolean;
}) => {
  switch (block.block_type) {
    case 'image':
      return (
        <ImageBlock payload={block.payload as CaseStudyImagePayload} priority={priority} />
      );
    case 'text':
      return <TextBlock payload={block.payload as CaseStudyTextPayload} />;
    case 'photo_grid':
      return <PhotoGridBlock payload={block.payload as CaseStudyPhotoGridPayload} />;
    case 'video':
      return <VideoBlock payload={block.payload as CaseStudyVideoPayload} />;
    case 'embed':
      return <EmbedBlock payload={block.payload as CaseStudyEmbedPayload} />;
    default:
      return null;
  }
};
