import type { AccountSnapshot, OrderRequest, OrderResponse, Quote } from "./types.js";

export class MyFundedPerpsClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...(init.headers as Record<string, string> | undefined),
    };
    const response = await fetch(url, { ...init, headers });
    if (response.status === 429 || response.status === 503) {
      const retryAfter = response.headers.get("Retry-After");
      throw new RateLimitedError(retryAfter ? Number(retryAfter) : 1);
    }
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return (await response.json()) as T;
  }

  async getAccount(accountId: string): Promise<AccountSnapshot> {
    return this.request<AccountSnapshot>(`/v1/accounts/${accountId}`);
  }

  async getQuote(marketId: string, side: "buy" | "sell", size: number): Promise<Quote> {
    const encoded = encodeURIComponent(marketId);
    const params = new URLSearchParams({ side, size: String(size) });
    return this.request<Quote>(`/v1/markets/${encoded}/quote?${params}`);
  }

  async placeOrder(order: OrderRequest, idempotencyKey: string): Promise<OrderResponse> {
    return this.request<OrderResponse>("/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(order),
    });
  }

  async findOrderByClientId(clientOrderId: string): Promise<OrderResponse> {
    const params = new URLSearchParams({ client_order_id: clientOrderId });
    return this.request<OrderResponse>(`/v1/orders?${params}`);
  }

  async closePosition(positionId: string): Promise<void> {
    await this.request(`/v1/positions/${positionId}/close`, { method: "POST" });
  }

  async cancelAllOrders(accountId: string): Promise<void> {
    await this.request(`/v1/accounts/${accountId}/cancel-all-orders`, { method: "POST" });
  }
}

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

export class RateLimitedError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Rate limited. Retry after ${retryAfterSeconds}s.`);
    this.name = "RateLimitedError";
  }
}
