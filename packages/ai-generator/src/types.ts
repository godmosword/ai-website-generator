export type LLMProvider = "openai" | "anthropic";

export interface GenerateOptions {
  /** 自然語言描述，例如「一家台北的咖啡廳，主色橙色，自然風格」 */
  prompt: string;
  /** 使用的 LLM 供應商，預設自動偵測可用 API Key */
  provider?: LLMProvider;
  /** OpenAI API Key（或從 OPENAI_API_KEY 環境變數讀取） */
  openaiApiKey?: string;
  /** Anthropic API Key（或從 ANTHROPIC_API_KEY 環境變數讀取） */
  anthropicApiKey?: string;
  /** OpenAI model，預設 gpt-4o */
  openaiModel?: string;
  /** Anthropic model，預設 claude-opus-4-5 */
  anthropicModel?: string;
  /** 最多驗證重試次數，預設 3 */
  maxRetries?: number;
  /** 進度回調，接收狀態訊息 */
  onProgress?: (message: string) => void;
}

export interface GenerateResult {
  /** 產生的 SiteSpec JSON 物件 */
  spec: import("@webomate/site-spec").SiteSpec;
  /** 使用的 LLM 供應商 */
  provider: LLMProvider;
  /** 實際嘗試次數 */
  attempts: number;
}
