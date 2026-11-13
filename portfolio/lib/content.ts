import { ApiError, fetchApi } from "./api";

/** Cache tags the backend may ask us to revalidate after a CMS save. */
export const CONTENT_TAGS = [
  "projects",
  "posts",
  "field-notes",
  "home-content",
  "about-content",
] as const;

export type ContentTag = (typeof CONTENT_TAGS)[number];

/**
 * How long a public page may serve cached content before refetching.
 * CMS saves normally refresh pages straight away through /api/revalidate; this
 * is the safety net for when that call is not configured or fails.
 */
export const REVALIDATE_SECONDS = 300;

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Fetch public CMS content for a server-rendered page.
 *
 * Returns `null` when the content does not exist yet (404), so pages can show
 * their empty state. Any other failure (backend down, database over quota,
 * timeout) is thrown: during background regeneration Next.js then keeps
 * serving the last good copy of the page instead of caching an empty one.
 * The exception is `next build`, where a failure also returns `null` so an API
 * outage cannot fail a deploy; the page retries after REVALIDATE_SECONDS.
 */
export async function fetchContent<T>(
  endpoint: string,
  tag: ContentTag,
): Promise<T | null> {
  try {
    return await fetchApi(endpoint, {
      next: { tags: [tag], revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    console.error(`Failed to fetch ${endpoint}:`, error);
    if (IS_BUILD) return null;
    throw error;
  }
}
