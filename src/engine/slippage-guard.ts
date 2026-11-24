import type { MyFundedPerpsClient } from "../client/api.js";

export interface SlippageGuardConfig {
  maxSlippageBps: number;
}

export class SlippageGuard {
  constructor(private readonly client: MyFundedPerpsClient, private readonly config: SlippageGuardConfig) {}

  async check(marketId: string, side: "buy" | "sell", size: number): Promise<{ allowed: boolean; reason?: string }> {
    const quote = await this.client.getQuote(marketId, side, size);
    if (!quote.fillable) return { allowed: false, reason: "Size not valid at market precision." };
    if (quote.slippage_bps !== null && quote.slippage_bps > this.config.maxSlippageBps) {
      return { allowed: false, reason: `slippage_bps=${quote.slippage_bps} exceeds ${this.config.maxSlippageBps}.` };
    }
    return { allowed: true };
  }
}
