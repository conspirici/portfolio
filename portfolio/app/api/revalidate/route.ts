import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_TAGS, type ContentTag } from '@/lib/content';

function secretMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called by the backend after a CMS save:
 *   POST /api/revalidate  { "tags": ["about-content"] }
 *   X-Revalidate-Secret: <REVALIDATION_SECRET>
 */
export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) {
    return NextResponse.json({ message: 'Revalidation is not configured' }, { status: 503 });
  }

  let body: { tag?: unknown; tags?: unknown; secret?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const provided =
    request.headers.get('x-revalidate-secret') ??
    (typeof body.secret === 'string' ? body.secret : '');
  if (!secretMatches(provided, expected)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const requested = Array.isArray(body.tags) ? body.tags : [body.tag];
  const tags = requested.filter((tag): tag is ContentTag =>
    (CONTENT_TAGS as readonly unknown[]).includes(tag),
  );
  if (tags.length === 0) {
    return NextResponse.json({ message: 'No known tag to revalidate' }, { status: 400 });
  }

  // `expire: 0` drops the cached data immediately, so the next visitor gets the
  // saved content rather than one more stale render.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
