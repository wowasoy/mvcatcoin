/**
 * Cloudflare Pages Function: /api/check-token
 *
 * Proxy for GoPlus Security Token Security API.
 * Free tier: 100 req/min, no API key required.
 * @see https://docs.gopluslabs.io/reference/token-security-api
 *
 * Attribution required: "Powered by Go+ Security"
 * @see https://docs.gopluslabs.io/reference/api-license-agreement-new
 */

const BASE_URL = "https://api.gopluslabs.io/api/v1/token_security";

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const chainId = url.searchParams.get("chainId") ?? "11155111";
  const tokenAddress = url.searchParams.get("address");

  if (!tokenAddress) {
    return new Response(JSON.stringify({ error: "Missing address parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstreamUrl = `${BASE_URL}/${chainId}?contract_addresses=${tokenAddress}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: "Upstream error", status: upstream.status }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Fetch failed",
        detail: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};