interface Step {
  num: string;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Connect Wallet",
    desc: "Use MetaMask, Rabby, OKX, or any EVM wallet on the Sepolia network.",
  },
  {
    num: "02",
    title: "Get Test Tokens",
    desc: "Claim free MVCAT from the built-in faucet. No signup required.",
  },
  {
    num: "03",
    title: "Swap or Stake",
    desc: "Trade tokens on Uniswap V2 or stake to earn rewards every second.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works glass">
      <div className="card-header">
        <h2>How It Works</h2>
        <span className="card-tag">3 Steps</span>
      </div>

      <div className="steps-grid">
        {STEPS.map((step) => (
          <div className="step-item" key={step.num}>
            <span className="step-num">{step.num}</span>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}