import { useState } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";
import { useTokenSecurity } from "../hooks/useTokenSecurity";

function riskLabel(score: number): string {
  if (score >= 60) return "High Risk";
  if (score >= 30) return "Moderate Risk";
  if (score > 0) return "Low Risk";
  return "No Flags";
}

function riskColor(score: number): string {
  if (score >= 60) return "danger";
  if (score >= 30) return "warn";
  if (score > 0) return "info";
  return "safe";
}

export default function TokenSecurityCard() {
  const [address, setAddress] = useState("");
  const { result, loading, error, check, reset } = useTokenSecurity();

  const handleCheck = () => {
    if (!isAddress(address)) {
      toast.error("Enter a valid contract address");
      return;
    }
    check(address);
  };

  return (
    <section className="card glass">
      <div className="card-header">
        <h2>Token Safety Check</h2>
        <span className="card-tag live">GoPlus</span>
      </div>

      <p className="card-subtitle">
        Scan any ERC-20 contract for honeypot behavior, taxes, and ownership
        risks before interacting.
      </p>

      <label htmlFor="securityAddress">Contract Address</label>
      <input
        id="securityAddress"
        type="text"
        placeholder="0x..."
        autoComplete="off"
        spellCheck={false}
        value={address}
        onChange={(e) => {
          setAddress(e.target.value.trim());
          reset();
        }}
      />

      <button
        className="btn-primary"
        onClick={handleCheck}
        disabled={loading || address.length === 0}
        type="button"
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {error && <p className="mono security-error">{error}</p>}

      {result && (
        <div className="security-result">
          <div className={`security-badge ${riskColor(result.riskScore)}`}>
            {riskLabel(result.riskScore)} · {result.riskScore}/100
          </div>

          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Honeypot</span>
              <span
                className={`stat-value ${
                  result.isHoneypot ? "danger" : "safe"
                }`}
              >
                {result.isHoneypot ? "YES" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Buy Tax</span>
              <span className="stat-value">{result.buyTax.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sell Tax</span>
              <span className="stat-value">{result.sellTax.toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Open Source</span>
              <span
                className={`stat-value ${
                  result.isOpenSource ? "safe" : "danger"
                }`}
              >
                {result.isOpenSource ? "Yes" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Can Mint</span>
              <span
                className={`stat-value ${result.canMint ? "danger" : "safe"}`}
              >
                {result.canMint ? "Yes" : "No"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pausable</span>
              <span
                className={`stat-value ${
                  result.isPausable ? "danger" : "safe"
                }`}
              >
                {result.isPausable ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <p className="security-attribution">
            Powered by Go+ Security · Informational only, not financial advice
          </p>
        </div>
      )}
    </section>
  );
}