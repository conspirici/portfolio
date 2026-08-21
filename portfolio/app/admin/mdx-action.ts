"use server";

import { serialize } from 'next-mdx-remote/serialize';
import { sharedRehypePlugins } from '@/lib/mdx-plugins';

export async function compileMdx(source: string) {
  try {
    const compiledSource = await serialize(source, {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: sharedRehypePlugins as any,
      },
    });
    return { compiledSource, error: null };
  } catch (error: any) {
    return { compiledSource: null, error: error.message };
  }
}
