import Logo from "./Logo";

export default function HeroSection() {
  return (
    <section className="hero-section glass">
      <div className="hero-logo-wrap">
        <Logo />
      </div>
      <h1 className="hero-title">MVCatCoin</h1>
      <p className="hero-tagline">
        A friendly ERC-20 on Sepolia with swap, staking, and safety tools built
        in.
      </p>
      <div className="hero-actions">
        <a href="#wallet" className="btn-primary">
          Try Live Demo
        </a>
        <a
          href="https://mvwallet.pages.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          MV Wallet
        </a>
      </div>
      <p className="hero-note">Sepolia testnet · No real value</p>
    </section>
  );
}