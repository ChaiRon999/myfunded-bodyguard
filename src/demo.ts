import { FloorGuardian } from "./engine/floor-guardian.js";
import type { MyFundedPerpsClient } from "./client/api.js";
import type { AccountSnapshot } from "./client/types.js";

// A mock client so we can run the engine without an API key
const mockClient = {
  cancelAllOrders: async (accountId: string) => {
    console.log(`[DEMO] -> API Call: POST /v1/accounts/${accountId}/cancel-all-orders`);
  },
} as unknown as MyFundedPerpsClient;

export async function runDemo(): Promise<void> {
  console.log("=== Bodyguard Demo ===");
  console.log("Simulating a MyFundedPerps account snapshot...\n");

  const account: AccountSnapshot = {
    id: "demo-account-123",
    equity: 50500,
    unrealized_pnl: 500,
    reserved_margin: 1000,
    available_balance: 49500,
    gross_exposure: 5000,
    remaining_profit_target: 8000,
    marks_complete: true,
    loss_floors: [
      { name: "Daily Loss", level: 48000, room: 2500 },
      { name: "Max Drawdown", level: 45000, room: 5500 },
    ],
  };

  console.log(`Account Equity: $${account.equity}`);
  console.log(`Daily Loss Floor: $${account.loss_floors[0]?.level}`);
  console.log(`Remaining Room: $${account.loss_floors[0]?.room}\n`);

  const guardian = new FloorGuardian(mockClient, {
    accountId: account.id,
    maxLossPercent: 2, // 2% of equity = $1010
    alertOnly: false,
  });

  console.log("Evaluating risk thresholds (max loss allowed: 2% = $1010)...");
  await guardian.evaluate(account);
  
  console.log("\n=== Demo Complete ===");
}
