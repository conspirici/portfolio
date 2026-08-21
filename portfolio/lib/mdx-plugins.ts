import rehypePrettyCode from 'rehype-pretty-code';
import { visit } from 'unist-util-visit';

export function rehypeIgnoreMermaid() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'code') {
        const classNames = node.properties?.className || [];
        if (Array.isArray(classNames) && classNames.includes('language-mermaid')) {
          // Remove language-mermaid so rehype-pretty-code ignores it
          node.properties.className = classNames.filter((c: string) => c !== 'language-mermaid');
          // Add a custom attribute to identify it later
          node.properties['data-mermaid'] = 'true';
        }
      }
    });
  };
}

export const sharedRehypePlugins = [
  rehypeIgnoreMermaid,
  [rehypePrettyCode as any, { theme: 'github-dark' }]
];
