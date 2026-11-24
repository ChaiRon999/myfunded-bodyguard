import { MyFundedPerpsClient } from "../client/api.js";
import { FloorGuardian } from "../engine/floor-guardian.js";
import { reportProfitTarget } from "../engine/profit-tracker.js";
import type { Config } from "../config.js";

export async function watch(accountId: string, config: Config): Promise<void> {
  const client = new MyFundedPerpsClient(config.apiBaseUrl, config.apiKey);
  const guardian = new FloorGuardian(client, {
    accountId,
    maxLossPercent: config.maxLossPercent,
    alertOnly: config.alertOnly,
  });

  console.log(`[bodyguard] Watching account ${accountId}`);
  console.log(`[bodyguard] max_loss=${config.maxLossPercent}% alert_only=${config.alertOnly}`);

  const tick = async () => {
    try {
      const snapshot = await client.getAccount(accountId);
      reportProfitTarget(snapshot);
      await guardian.evaluate(snapshot);
    } catch (err) {
      console.error("[bodyguard] tick failed:", err);
    }
  };

  await tick();
  setInterval(tick, 5_000);
}
