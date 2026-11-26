import type { CodeLanguage, CodeSnippet } from '../../types/course';

export function defineSnippet(
  id: string,
  filename: string,
  language: CodeLanguage,
  code: string,
  notes: string[],
  caption?: string,
): CodeSnippet {
  const lineCount = code.split('\n').length;
  if (notes.length !== lineCount) {
    throw new Error(`Snippet ${id} has ${lineCount} code lines but ${notes.length} notes.`);
  }
  return { id, filename, language, code, notes, caption };
}
