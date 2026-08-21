import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tag, secret } = await request.json();

    // Ideally, check the secret here to ensure only the backend can revalidate
    // if (secret !== process.env.REVALIDATION_SECRET) {
    //   return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    // }

    if (!tag) {
      return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
    }

    // @ts-ignore: Next.js types might be outdated or strict
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
