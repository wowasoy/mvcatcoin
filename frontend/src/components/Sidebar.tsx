import { useEffect } from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${open ? "open" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Project information"
      >
        <header className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">MV</div>
            <div>
              <h3>MVCatCoin</h3>
              <p>Friendly ERC-20 · Sepolia</p>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={onClose}
            type="button"
            aria-label="Close menu"
          >
            ×
          </button>
        </header>

        <nav className="sidebar-body">
          <section className="sidebar-section">
            <h4>About</h4>
            <p>
              MVCatCoin is a friendly ERC-20 token built as a full-stack Web3
              demonstration. It showcases secure Solidity development, modern
              frontend integration, and DeFi primitives on Ethereum Sepolia.
            </p>
            <p className="sidebar-muted">
              Open source · MIT licensed · Portfolio project
            </p>
          </section>

          <section className="sidebar-section">
            <h4>Utility</h4>
            <ul className="sidebar-list">
              <li>ERC-20 with capped supply</li>
              <li>Gasless approvals via ERC-20 Permit</li>
              <li>On-chain governance with ERC-20 Votes</li>
              <li>Burnable token supply</li>
              <li>Staking pool with per-second rewards</li>
              <li>Multi-token swap via Uniswap V2</li>
              <li>Chainlink price feeds for USD quotes</li>
            </ul>
          </section>

          <section className="sidebar-section">
            <h4>Project Info</h4>
            <dl className="sidebar-dl">
              <div>
                <dt>Network</dt>
                <dd>Sepolia testnet</dd>
              </div>
              <div>
                <dt>Chain ID</dt>
                <dd>11155111</dd>
              </div>
              <div>
                <dt>Standard</dt>
                <dd>ERC-20 · OpenZeppelin v5</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>Solidity · Foundry · React · Viem</dd>
              </div>
            </dl>

            <div className="sidebar-links">
              <a
                href="https://github.com/wowasoy/mvcatcoin"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repository
              </a>
              <a
                href="https://mvcatcoin.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live demo
              </a>
              <a
                href="https://t.me/MVrocketRuns"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram contact
              </a>
            </div>
          </section>

          <section className="sidebar-section sidebar-warning">
            <h4>⚠ Security Warning</h4>
            <ul className="sidebar-list">
              <li>
                <strong>Testnet only.</strong> MVCatCoin is deployed on Sepolia.
                Tokens have no real-world value.
              </li>
              <li>
                <strong>Not audited.</strong> Contract has not been audited by
                an external firm. Use at your own risk.
              </li>
              <li>
                <strong>Do not use with real funds.</strong> Never send mainnet
                assets to any Sepolia contract address.
              </li>
              <li>
                <strong>Educational purpose.</strong> This project is for
                learning and portfolio demonstration.
              </li>
            </ul>
          </section>
        </nav>

        <footer className="sidebar-footer">
          <p>MIT &middot; MVCatCoin &middot; 2026</p>
        </footer>
      </aside>
    </>
  );
}