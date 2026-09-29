import Logo from "./Logo";

export default function Header() {
  return (
    <header className="hero glass">
      <Logo />
      <h1>MVCatCoin</h1>
      <p className="subtitle">ERC20 Governance Token &amp; Staking Pool</p>
      <p className="tag">MVCAT &middot; DeFi 2026</p>
    </header>
  );
}