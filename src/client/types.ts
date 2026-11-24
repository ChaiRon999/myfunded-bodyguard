export interface AccountSnapshot {
  id: string;
  equity: number | null;
  unrealized_pnl: number | null;
  reserved_margin: number | null;
  available_balance: number | null;
  gross_exposure: number | null;
  loss_floors: LossFloor[];
  remaining_profit_target: number | null;
  marks_complete: boolean;
}

export interface LossFloor {
  name: string;
  level: number;
  room: number | null;
}

export interface Quote {
  mid: number;
  estimated_fill_price: number | null;
  slippage_bps: number | null;
  estimated_notional: number | null;
  estimated_fee: number | null;
  fillable: boolean;
}

export interface OrderRequest {
  client_order_id: string;
  account_id: string;
  market_id: string;
  side: "buy" | "sell";
  size: number;
  expected_price: number;
  leverage: number;
  margin_mode: "cross" | "isolated";
}

export interface OrderResponse {
  id: string;
  client_order_id: string;
  status: "pending" | "filled" | "rejected" | "cancelled";
}
