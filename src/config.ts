export interface Config {
  apiKey: string;
  apiBaseUrl: string;
  accountStreamUrl: string;
  maxLossPercent: number;
  maxSlippageBps: number;
  alertOnly: boolean;
}

export function loadConfig(): Config {
  const apiKey = process.env.FP_API_KEY;
  if (!apiKey) {
    throw new Error("FP_API_KEY is not set. Use a sandbox key (fp_test_...).");
  }
  return {
    apiKey,
    apiBaseUrl: process.env.FP_API_BASE_URL ?? "https://developers.myfundedperpetuals.com",
    accountStreamUrl: process.env.FP_ACCOUNT_STREAM_URL ?? "wss://account-stream.myfundedperpetuals.com/v1/stream",
    maxLossPercent: Number(process.env.FP_MAX_LOSS_PERCENT ?? "2"),
    maxSlippageBps: Number(process.env.FP_MAX_SLIPPAGE_BPS ?? "25"),
    alertOnly: (process.env.FP_ALERT_ONLY ?? "false") === "true",
  };
}
