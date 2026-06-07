/**
 * DeepSeek provider — server-side only.
 * Uses process.env.DEEPSEEK_API_KEY (never VITE_*).
 * Do not import from React / Vite client bundles.
 */

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export const DEEPSEEK_MODELS = {
  flash: 'deepseek-v4-flash',
  pro: 'deepseek-v4-pro',
} as const;

export type DeepSeekModelId = (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS];

export type DeepSeekRole = 'system' | 'user' | 'assistant';

export interface DeepSeekMessage {
  role: DeepSeekRole;
  content: string;
}

export interface DeepSeekChatOptions {
  model: DeepSeekModelId;
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface DeepSeekChatResult {
  content: string;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  raw: unknown;
}

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'DeepSeek provider is server-only. Import only from Node scripts or server functions.'
    );
  }
}

function getApiKey(): string {
  assertServerOnly();
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      'DEEPSEEK_API_KEY is missing. Set it in .env.local (server-side only, no VITE_ prefix).'
    );
  }
  return key.trim();
}

export function getDeepSeekBaseUrl(): string {
  return DEEPSEEK_BASE_URL;
}

/**
 * Low-level chat completion against DeepSeek (OpenAI-compatible API).
 */
export async function deepseekChat(options: DeepSeekChatOptions): Promise<DeepSeekChatResult> {
  const apiKey = getApiKey();
  const url = `${DEEPSEEK_BASE_URL}/v1/chat/completions`;

  const body: Record<string, unknown> = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
  };

  if (options.maxTokens != null) {
    body.max_tokens = options.maxTokens;
  }

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const raw = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const errMsg =
      (raw.error as { message?: string } | undefined)?.message ??
      `DeepSeek API error (${response.status})`;
    throw new Error(errMsg);
  }

  const choices = raw.choices as Array<{ message?: { content?: string } }> | undefined;
  const content = choices?.[0]?.message?.content ?? '';

  if (!content) {
    throw new Error('DeepSeek API returned an empty response.');
  }

  return {
    content,
    model: String(raw.model ?? options.model),
    usage: raw.usage as DeepSeekChatResult['usage'],
    raw,
  };
}

/**
 * Chat completion with JSON output. Parses and returns the object.
 */
export async function deepseekChatJson<T = Record<string, unknown>>(
  options: Omit<DeepSeekChatOptions, 'jsonMode'>
): Promise<{ data: T; result: DeepSeekChatResult }> {
  const result = await deepseekChat({ ...options, jsonMode: true });

  try {
    const data = JSON.parse(result.content) as T;
    return { data, result };
  } catch {
    throw new Error(
      `DeepSeek response is not valid JSON. Raw content: ${result.content.slice(0, 200)}`
    );
  }
}
