import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { config } from "./wagmi";
import HeroSection from "./components/HeroSection";
import StatsRow from "./components/StatsRow";
import WalletCard from "./components/WalletCard";
import TokenInfoCard from "./components/TokenInfoCard";
import TokenSecurityCard from "./components/TokenSecurityCard";
import SwapCard from "./components/SwapCard";
import StakingCard from "./components/StakingCard";
import HowItWorks from "./components/HowItWorks";
import Sidebar from "./components/Sidebar";
import MenuButton from "./components/MenuButton";
import MarketTicker from "./components/MarketTicker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="bg-orbs" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>

        <MenuButton onClick={() => setMenuOpen(true)} />
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main>
          <MarketTicker />
          <HeroSection />
          <StatsRow />
          <div id="wallet">
            <WalletCard />
          </div>
          <TokenInfoCard />
          <TokenSecurityCard />
          <SwapCard />
          <StakingCard />
          <HowItWorks />
          <footer className="glass">
            <p className="mono">MIT &middot; MVCatCoin &middot; 2026</p>
          </footer>
        </main>

        <Toaster position="top-center" theme="dark" richColors />
      </QueryClientProvider>
    </WagmiProvider>
  );
}