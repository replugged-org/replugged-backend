import type { MarkdownNode } from '../../../../spoonfeed/src/types/markdown';
import { createHash } from 'crypto';
import { MarkdownType } from '../../../../spoonfeed/src/types/markdown';
import parseMarkup from '../../../../spoonfeed/src/markdown/parser.js';
// import { flattenToText } from '../../../../spoonfeed/src/markdown/util.js';

export type Document = { title: string | null, hash: string, contents: MarkdownNode[] }

export default function (markdown: string): Document {
  const parsed = parseMarkup(markdown);
  // const el = parsed.find((node) => node.type === MarkdownType.HEADING && node.level === 1);
  // const title = el ? flattenToText(el) : null;

  return {
    title: null,
    hash: createHash('sha1').update(markdown).digest('base64'),
    contents: parsed.filter((node) => node.type !== MarkdownType.COMMENT && (node.type !== MarkdownType.HEADING || node.level !== 1))
  };
}
