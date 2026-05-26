import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface PdfParseResult {
  readonly text: string;
  readonly numpages: number;
}

// pdf-parse is CJS — import via createRequire for NodeNext ESM compatibility
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pdfParse: (buf: Buffer) => Promise<PdfParseResult> = require("pdf-parse");

/**
 * Extracts raw UTF-8 text from a PDF buffer.
 * Returns the concatenated text of all pages.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
