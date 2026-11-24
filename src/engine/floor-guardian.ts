import type { MyFundedPerpsClient } from "../client/api.js";
import type { AccountSnapshot } from "../client/types.js";

export interface FloorGuardianConfig {
  accountId: string;
  maxLossPercent: number;
  alertOnly: boolean;
}

export class FloorGuardian {
  constructor(private readonly client: MyFundedPerpsClient, private readonly config: FloorGuardianConfig) {}

  async evaluate(snapshot: AccountSnapshot): Promise<void> {
    if (!snapshot.marks_complete) {
      console.warn("[floor-guardian] marks_complete=false — skipping.");
      return;
    }
    if (snapshot.equity === null) return;
    for (const floor of snapshot.loss_floors) {
      if (floor.room === null) continue;
      const roomPercent = (floor.room / snapshot.equity) * 100;
      if (roomPercent <= this.config.maxLossPercent * 0.5) {
        console.warn(`[floor-guardian] CRITICAL: ${roomPercent.toFixed(2)}% room above "${floor.name}".`);
        if (!this.config.alertOnly) await this.client.cancelAllOrders(this.config.accountId);
      } else if (roomPercent <= this.config.maxLossPercent) {
        console.warn(`[floor-guardian] WARNING: ${roomPercent.toFixed(2)}% room above "${floor.name}".`);
      }
    }
  }
}
