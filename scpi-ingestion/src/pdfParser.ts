import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// pdf-parse v2 uses a class-based API — PDFParse({ data }) + getText()
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (opts: { data: Uint8Array; verbosity?: number }) => {
    getText(): Promise<{ text: string; total: number }>;
    destroy(): Promise<void>;
  };
};

/**
 * Extracts raw UTF-8 text from a PDF buffer.
 * Returns the concatenated text of all pages.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
