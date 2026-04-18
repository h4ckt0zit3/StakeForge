export default function HeroStats({ tvl, stakedAmount, pendingRewards, stakeInfo }) {
  const apyDisplay = stakeInfo
    ? (stakeInfo.apyBps / 100).toFixed(1)
    : "18.5";

  return (
    <section className="mb-16 animate-fade-in">
      <h1 className="text-on-surface-variant text-xs uppercase tracking-[0.2em] font-bold mb-4 opacity-70">
        Protocol Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-outline-variant/10 stagger">
        {/* TVL */}
        <div className="md:col-span-2 bg-surface-low p-8 flex flex-col justify-between animate-fade-in">
          <div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">
              Total Value Locked
            </p>
            <h2 className="text-6xl font-black tracking-tighter text-on-surface">
              {Number(tvl) > 0
                ? `${Number(tvl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : "$0"}
            </h2>
            <span className="text-on-surface-variant text-xs mt-1 block">SFORGE</span>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <span className="text-primary-dim text-xs font-bold px-2 py-1 bg-primary/10 rounded-full">
              LIVE ON SEPOLIA
            </span>
          </div>
        </div>

        {/* Staked Amount */}
        <div className="bg-surface-low p-8 animate-fade-in">
          <p className="text-on-surface-variant text-sm font-medium mb-1">
            Your Staked Amount
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-on-surface">
            {stakeInfo
              ? Number(stakeInfo.amount).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "0"}{" "}
            <span className="text-sm font-medium text-on-surface-variant">
              SFORGE
            </span>
          </h3>
          <div className="mt-4 h-1 w-full bg-surface-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary shadow-[0_0_10px_#a4ffb9] transition-all duration-1000"
              style={{
                width: stakeInfo
                  ? `${Math.min(100, (Number(stakeInfo.amount) / Math.max(Number(tvl), 1)) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        {/* APY */}
        <div className="bg-surface-low p-8 animate-fade-in">
          <p className="text-on-surface-variant text-sm font-medium mb-1">
            {stakeInfo ? "Your APY" : "Best APY"}
          </p>
          <h3 className="text-5xl font-black tracking-tighter text-primary neon-glow">
            {apyDisplay}%
          </h3>
          <p className="text-[10px] text-on-surface-variant mt-2 uppercase tracking-widest">
            Compounding Daily
          </p>
        </div>
      </div>
    </section>
  );
}
