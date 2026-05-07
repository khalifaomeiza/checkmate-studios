import { corsHeaders } from './cors.ts';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FieldError[];
}

const json = <T>(
  status: number,
  body: ApiBody<T>,
  origin: string | null
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin)
    }
  });

export const ok = <T>(message: string, data: T | undefined, origin: string | null) =>
  json(200, { success: true, message, data }, origin);

export const created = <T>(
  message: string,
  data: T | undefined,
  origin: string | null
) => json(201, { success: true, message, data }, origin);

export const fail = (
  status: number,
  message: string,
  origin: string | null,
  errors?: FieldError[]
) => json(status, { success: false, message, errors }, origin);

export const requestMeta = (req: Request) => ({
  ipAddress:
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null,
  userAgent: req.headers.get('user-agent') ?? null
});
