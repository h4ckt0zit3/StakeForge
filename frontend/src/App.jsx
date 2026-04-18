import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useWallet } from "./hooks/useWallet";
import { useContracts } from "./hooks/useContracts";
import Navbar from "./components/Navbar";
import HeroStats from "./components/HeroStats";
import StakingPanel from "./components/StakingPanel";
import PositionsTable from "./components/PositionsTable";
import FaucetCard from "./components/FaucetCard";
import GovernancePage from "./components/GovernancePage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const {
    account,
    provider,
    signer,
    chainId,
    isCorrectChain,
    isConnecting,
    connect,
    switchToSepolia,
  } = useWallet();

  const {
    balance,
    tvl,
    stakeInfo,
    pendingRewards,
    isLoading,
    contractsReady,
    requestFaucet,
    stakeTokens,
    unstakeTokens,
    claimRewards,
  } = useContracts(signer, provider, account);

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#19191b",
            color: "#ffffff",
            border: "1px solid rgba(72, 72, 73, 0.2)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#00fd87", secondary: "#005b2c" },
          },
          error: {
            iconTheme: { primary: "#ff716c", secondary: "#490006" },
          },
        }}
      />

      <Navbar
        account={account}
        balance={balance}
        isConnecting={isConnecting}
        onConnect={connect}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="max-w-[1440px] mx-auto px-6 pt-28 pb-32">
        {/* Wrong chain banner */}
        {account && !isCorrectChain && (
          <div className="mb-8 p-4 bg-error-dim/10 border border-error/20 rounded-xl flex items-center justify-between animate-fade-in">
            <span className="text-error text-sm font-medium">
              ⚠ Wrong network (Chain ID: {chainId}). Switch to Hardhat localhost (31337) or Sepolia (11155111).
            </span>
            <button
              onClick={switchToSepolia}
              className="px-4 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-error-dim transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        )}

        {/* Contracts not found banner */}
        {account && isCorrectChain && !contractsReady && (
          <div className="mb-8 p-4 bg-error-dim/10 border border-error/20 rounded-xl animate-fade-in">
            <span className="text-error text-sm font-medium block mb-1">
              ⚠ Contracts not detected on Chain ID {chainId}.
            </span>
            <span className="text-on-surface-variant text-xs">
              Make sure you've deployed contracts to this network and the addresses in <code className="text-primary">config.js</code> match.
              For localhost testing: run <code className="text-primary">npx hardhat node</code> + <code className="text-primary">npx hardhat run scripts/deploy.js --network localhost</code>
            </span>
          </div>
        )}

        {/* Not connected state */}
        {!account && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center mb-8 border border-primary/10 animate-float">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 15H6l7-14v8h5l-7 14v-8z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-4 font-headline">
              Welcome to <span className="text-primary neon-glow">StakeForge</span>
            </h2>
            <p className="text-on-surface-variant max-w-md mb-8 leading-relaxed">
              Connect your wallet to start staking SFORGE tokens, earn yield,
              and participate in the Forge protocol on Sepolia testnet.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-primary to-primary-container px-8 py-4 rounded-xl text-on-primary font-black uppercase tracking-widest text-sm neon-shadow hover:neon-shadow-hover transition-all active:scale-95"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        {/* Connected state */}
        {account && isCorrectChain && (
          <>
            {/* Dashboard Page */}
            {activePage === "dashboard" && (
              <section id="dashboard">
                <HeroStats
                  tvl={tvl}
                  stakedAmount={stakeInfo?.amount || "0"}
                  pendingRewards={pendingRewards}
                  stakeInfo={stakeInfo}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <StakingPanel
                    balance={balance}
                    stakeInfo={stakeInfo}
                    pendingRewards={pendingRewards}
                    isLoading={isLoading}
                    onStake={stakeTokens}
                    onUnstake={unstakeTokens}
                    onClaim={claimRewards}
                  />

                  <div className="lg:col-span-8 space-y-12">
                    <PositionsTable
                      stakeInfo={stakeInfo}
                      pendingRewards={pendingRewards}
                      onClaim={claimRewards}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Faucet Page */}
            {activePage === "faucet" && (
              <FaucetCard
                account={account}
                isLoading={isLoading}
                onRequestFaucet={requestFaucet}
              />
            )}

            {/* Governance Page */}
            {activePage === "governance" && (
              <GovernancePage account={account} balance={balance} />
            )}
          </>
        )}
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary/5 blur-[100px] rounded-full" />
      </div>
    </>
  );
}
