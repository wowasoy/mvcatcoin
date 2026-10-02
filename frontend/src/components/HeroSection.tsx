export default function HeroSection() {
  return (
    <section className="hero-section glass">
      <div className="hero-banner-wrap">
        <img
          src="/hero-banner.webp"
          alt="MVCatCoin mascot"
          className="hero-banner"
          loading="eager"
          decoding="async"
          width={1280}
          height={720}
        />
        <div className="hero-banner-overlay" aria-hidden="true" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">MVCatCoin</h1>
        <p className="hero-tagline">
          A friendly ERC-20 on Sepolia with swap, staking, and safety tools
          built in.
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
      </div>
    </section>
  );
}