import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { resolveUploadFile } from '@/lib/uploads/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Serves user uploads written at runtime. Next.js only serves `public/` files that
 * existed at build time, and UPLOAD_ROOT may point at a mounted volume outside `public/`.
 */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const file = resolveUploadFile((await params).path);
  if (!file) return new Response('Not found', { status: 404 });

  const info = await stat(/* turbopackIgnore: true */ file.path).catch(() => null);
  if (!info?.isFile()) return new Response('Not found', { status: 404 });

  const headers = new Headers({
    'Content-Type': file.contentType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
  });

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  const partial = Boolean(range && (range[1] || range[2]));
  let start = 0;
  let end = info.size - 1;
  if (range && partial) {
    start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
    if (start > end || start >= info.size) {
      headers.set('Content-Range', `bytes */${info.size}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${info.size}`);
  }
  headers.set('Content-Length', String(end - start + 1));

  const stream = createReadStream(/* turbopackIgnore: true */ file.path, { start, end });
  return new Response(Readable.toWeb(stream) as ReadableStream, { status: partial ? 206 : 200, headers });
}
