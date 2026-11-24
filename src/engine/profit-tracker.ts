import type { AccountSnapshot } from "../client/types.js";

export function reportProfitTarget(snapshot: AccountSnapshot): void {
  if (snapshot.remaining_profit_target === null) {
    console.log("[profit-tracker] remaining_profit_target is null.");
    return;
  }
  console.log(`[profit-tracker] Remaining profit target: ${snapshot.remaining_profit_target.toFixed(2)}`);
}
