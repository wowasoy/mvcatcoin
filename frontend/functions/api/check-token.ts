/**
 * Cloudflare Pages Function: /api/check-token
 *
 * Proxy for GoPlus Security Token Security API.
 * Tries multiple chains in order and returns the first with data.
 * Free tier: 100 req/min, no API key required.
 * @see https://docs.gopluslabs.io/reference/token-security-api
 *
 * Attribution required: "Powered by Go+ Security"
 */

const BASE_URL = "https://api.gopluslabs.io/api/v1/token_security";

// Ordered by coverage quality — mainnet first, then L2s, then testnet
const CHAIN_PRIORITY = [1, 8453, 56, 137, 42161, 10, 11155111];

interface GpResult {
  code: number;
  message: string;
  result: Record<string, Record<string, unknown>>;
}

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const tokenAddress = url.searchParams.get("address");
  const preferredChain = url.searchParams.get("chainId");

  if (!tokenAddress || tokenAddress.length !== 42) {
    return jsonResponse({ error: "Missing or invalid address parameter" }, 400);
  }

  const chains = preferredChain
    ? [
        Number(preferredChain),
        ...CHAIN_PRIORITY.filter((c) => c !== Number(preferredChain)),
      ]
    : CHAIN_PRIORITY;

  for (const chainId of chains) {
    try {
      const upstream = await fetch(
        `${BASE_URL}/${chainId}?contract_addresses=${tokenAddress}`,
        { headers: { Accept: "application/json" } }
      );

      if (!upstream.ok) continue;

      const data = (await upstream.json()) as GpResult;
      const key = tokenAddress.toLowerCase();
      const entry = data.result?.[key] ?? data.result?.[tokenAddress];

      if (entry && Object.keys(entry).length > 0) {
        return jsonResponse(
          { chainId, result: data.result },
          200,
          "public, max-age=300"
        );
      }
    } catch {
      continue;
    }
  }

  return jsonResponse(
    {
      error: "no_data",
      message: "Token not indexed by GoPlus on any supported network",
    },
    404
  );
};

function jsonResponse(body: unknown, status: number, cache?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  if (cache) headers["Cache-Control"] = cache;
  return new Response(JSON.stringify(body), { status, headers });
}