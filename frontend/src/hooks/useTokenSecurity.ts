import { useCallback, useState } from "react";

export interface TokenSecurityResult {
  isHoneypot: boolean;
  buyTax: number;
  sellTax: number;
  isOpenSource: boolean;
  isProxy: boolean;
  canMint: boolean;
  ownerCanChangeBalance: boolean;
  isBlacklisted: boolean;
  isPausable: boolean;
  holderCount: number;
  riskScore: number;
  raw: Record<string, unknown>;
}

interface GoPlusResponse {
  code: number;
  message: string;
  result: Record<string, Record<string, unknown>>;
}

function safeNumber(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function safeBool(val: unknown): boolean {
  return val === "1" || val === "true" || val === true;
}

function computeRiskScore(r: Record<string, unknown>): number {
  let score = 0;
  if (safeBool(r.is_honeypot)) score += 40;
  if (safeBool(r.can_take_back_ownership)) score += 15;
  if (safeBool(r.owner_change_balance)) score += 15;
  if (safeBool(r.hidden_owner)) score += 10;
  if (!safeBool(r.is_open_source)) score += 10;
  if (safeBool(r.is_mintable)) score += 5;
  if (safeBool(r.transfer_pausable)) score += 5;
  const tax = safeNumber(r.sell_tax) + safeNumber(r.buy_tax);
  if (tax > 10) score += 10;
  return Math.min(score, 100);
}

export function useTokenSecurity() {
  const [result, setResult] = useState<TokenSecurityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (address: string, chainId = 11155111) => {
    if (!address || address.length !== 42) {
      setError("Invalid contract address");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/check-token?chainId=${chainId}&address=${address}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as GoPlusResponse;
      const key = address.toLowerCase();
      const raw = json.result?.[key] ?? json.result?.[address];

      if (!raw || Object.keys(raw).length === 0) {
        throw new Error("No data returned for this address");
      }

      const entry = raw as Record<string, unknown>;

      setResult({
        isHoneypot: safeBool(entry.is_honeypot),
        buyTax: safeNumber(entry.buy_tax) * 100,
        sellTax: safeNumber(entry.sell_tax) * 100,
        isOpenSource: safeBool(entry.is_open_source),
        isProxy: safeBool(entry.is_proxy),
        canMint: safeBool(entry.is_mintable),
        ownerCanChangeBalance: safeBool(entry.owner_change_balance),
        isBlacklisted: safeBool(entry.is_blacklisted),
        isPausable: safeBool(entry.transfer_pausable),
        holderCount: safeNumber(entry.holder_count),
        riskScore: computeRiskScore(entry),
        raw: entry,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, check, reset };
}