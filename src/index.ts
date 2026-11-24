#!/usr/bin/env bun
import { loadConfig } from "./config.js";
import { watch } from "./cli/watch.js";
import { MyFundedPerpsClient } from "./client/api.js";
import { runDemo } from "./demo.js";

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    console.error("Usage: bodyguard <watch|quote|--demo> [options]");
    process.exit(1);
  }

  if (command === "--demo") {
    await runDemo();
    return;
  }

  if (command === "watch") {
    const accountId = getFlag(args, "--account");
    if (!accountId) {
      console.error("Usage: bodyguard watch --account <account-id>");
      process.exit(1);
    }
    await watch(accountId, loadConfig());
    return;
  }

  if (command === "quote") {
    const market = getFlag(args, "--market");
    const side = getFlag(args, "--side") as "buy" | "sell" | undefined;
    const size = getFlag(args, "--size");
    if (!market || !side || !size) {
      console.error('Usage: bodyguard quote --market "binance|BTCUSDT" --side buy --size 0.001');
      process.exit(1);
    }
    const config = loadConfig();
    const client = new MyFundedPerpsClient(config.apiBaseUrl, config.apiKey);
    const quote = await client.getQuote(market, side, Number(size));
    console.log(JSON.stringify(quote, null, 2));
    return;
  }

  console.error("Usage: bodyguard <watch|quote|--demo> [options]");
  process.exit(1);
}

function getFlag(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
