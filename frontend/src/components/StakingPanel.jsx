import { useState } from "react";
import { DURATION_OPTIONS, APY_BPS } from "../config";

export default function StakingPanel({
  balance,
  stakeInfo,
  pendingRewards,
  isLoading,
  onStake,
  onUnstake,
  onClaim,
}) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(1); // default 90 days

  const selectedOption = DURATION_OPTIONS[duration];
  const apyBps = APY_BPS[duration];
  const estimatedYield =
    amount && !isNaN(amount)
      ? ((Number(amount) * apyBps * selectedOption.days) / (10000 * 365)).toFixed(2)
      : "0.00";

  const unlockDate = new Date(
    Date.now() + selectedOption.days * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const handleStake = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onStake(amount, duration);
    setAmount("");
  };

  const isUnlocked =
    stakeInfo && Date.now() / 1000 >= stakeInfo.unlockTime;

  return (
    <div className="lg:col-span-4 bg-surface-container rounded-xl shadow-2xl relative overflow-hidden group animate-fade-in">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <div className="p-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-xl font-bold tracking-tight">Forge Tokens</h2>
          <span className="text-xs text-on-surface-variant">
            Pending:{" "}
            <span className="text-primary">
              {Number(pendingRewards).toFixed(4)} SFORGE
            </span>
          </span>
        </div>

        {stakeInfo ? (
          /* ── Active Stake View ─────────────────────── */
          <div className="space-y-6">
            <div className="bg-surface-low p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Staked</span>
                <span className="text-on-surface font-bold">
                  {Number(stakeInfo.amount).toLocaleString()} SFORGE
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">APY</span>
                <span className="text-primary font-bold">
                  {stakeInfo.apyBps / 100}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Unlock Date</span>
                <span className="text-on-surface">
                  {new Date(stakeInfo.unlockTime * 1000).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "2-digit", year: "numeric" }
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Pending Rewards</span>
                <span className="text-primary font-bold">
                  {Number(pendingRewards).toFixed(6)} SFORGE
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Status</span>
                <span
                  className={`font-bold ${
                    isUnlocked ? "text-primary" : "text-error"
                  }`}
                >
                  {isUnlocked ? "✓ Unlocked" : "🔒 Locked"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={onClaim}
              disabled={isLoading || Number(pendingRewards) === 0}
              className="w-full bg-surface-high py-4 rounded-xl text-primary font-black uppercase tracking-widest text-sm hover:bg-surface-highest transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Claim Rewards
            </button>
            <button
              onClick={onUnstake}
              disabled={isLoading || !isUnlocked}
              className="w-full bg-gradient-to-r from-primary to-primary-container py-5 rounded-xl text-on-primary font-black uppercase tracking-widest text-sm neon-shadow hover:neon-shadow-hover transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUnlocked ? "Unstake + Claim All" : "Locked"}
            </button>
          </div>
        ) : (
          /* ── New Stake View ────────────────────────── */
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 block">
                Amount to Stake
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface-highest border-none rounded-lg p-4 text-xl font-bold focus:ring-1 focus:ring-primary-dim/40 text-on-surface placeholder:text-outline/50 outline-none"
                />
                <button
                  onClick={() => setAmount(balance)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3 block">
                Lock Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={`py-3 rounded-lg text-xs font-bold transition-all ${
                      duration === opt.value
                        ? "bg-primary text-on-primary-container shadow-[0_0_20px_rgba(0,253,135,0.2)] font-black"
                        : "bg-surface-high border border-outline-variant/20 hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            <div className="bg-surface-low p-4 rounded-lg border border-outline-variant/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Estimated Yield</span>
                <span className="text-primary font-bold">
                  ~ {estimatedYield} SFORGE
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Unlock Date</span>
                <span className="text-on-surface">{unlockDate}</span>
              </div>
            </div>

            {/* Stake Button */}
            <button
              onClick={handleStake}
              disabled={
                isLoading ||
                !amount ||
                isNaN(amount) ||
                Number(amount) <= 0
              }
              className="w-full bg-gradient-to-r from-primary to-primary-container py-5 rounded-xl text-on-primary font-black uppercase tracking-widest text-sm neon-shadow hover:neon-shadow-hover transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Stake Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
