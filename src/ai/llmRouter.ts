/**
 * LLM router — server-side only.
 * Routes tasks to the appropriate DeepSeek model.
 * Do not import from React / Vite client bundles.
 */

import {
  DEEPSEEK_MODELS,
  type DeepSeekChatOptions,
  type DeepSeekChatResult,
  type DeepSeekMessage,
  type DeepSeekModelId,
  deepseekChat,
  deepseekChatJson,
} from './providers/deepseek';

export type LlmTaskKind = 'fast' | 'reasoning' | 'extraction';

export interface LlmRouterChatInput {
  /** fast → flash ; reasoning / extraction → pro */
  task: LlmTaskKind;
  messages: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmRouterJsonInput extends LlmRouterChatInput {
  /** Hint for structured extraction pipelines (SCPI bulletins, QA, etc.) */
  schemaHint?: string;
}

function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error('llmRouter is server-only. Import only from Node scripts or server functions.');
  }
}

/**
 * Maps task kind to DeepSeek model.
 * - fast: low-latency responses (QA, classification, simple transforms)
 * - reasoning / extraction: structured SCPI extraction, multi-step analysis
 */
export function resolveModelForTask(task: LlmTaskKind): DeepSeekModelId {
  switch (task) {
    case 'fast':
      return DEEPSEEK_MODELS.flash;
    case 'reasoning':
    case 'extraction':
      return DEEPSEEK_MODELS.pro;
    default: {
      const _exhaustive: never = task;
      return _exhaustive;
    }
  }
}

function buildMessages(input: LlmRouterJsonInput): DeepSeekMessage[] {
  if (!input.schemaHint) {
    return input.messages;
  }

  const schemaMessage: DeepSeekMessage = {
    role: 'system',
    content: `Respond only with valid JSON. ${input.schemaHint}`,
  };

  const hasSystem = input.messages.some((m) => m.role === 'system');
  return hasSystem ? [schemaMessage, ...input.messages] : [schemaMessage, ...input.messages];
}

/**
 * Routed chat completion (text).
 */
export async function llmChat(input: LlmRouterChatInput): Promise<DeepSeekChatResult> {
  assertServerOnly();
  const model = resolveModelForTask(input.task);
  const options: DeepSeekChatOptions = {
    model,
    messages: input.messages,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
  };
  return deepseekChat(options);
}

/**
 * Routed chat completion with JSON parsing.
 * Intended for SCPI extraction pipelines (bulletins, indicator matrices, QA).
 */
export async function llmChatJson<T = Record<string, unknown>>(
  input: LlmRouterJsonInput
): Promise<{ data: T; result: DeepSeekChatResult; model: DeepSeekModelId }> {
  assertServerOnly();
  const model = resolveModelForTask(input.task);
  const { data, result } = await deepseekChatJson<T>({
    model,
    messages: buildMessages(input),
    temperature: input.temperature ?? (input.task === 'extraction' ? 0 : 0.2),
    maxTokens: input.maxTokens,
  });
  return { data, result, model };
}

export { DEEPSEEK_MODELS };
