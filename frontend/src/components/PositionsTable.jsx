export default function PositionsTable({ stakeInfo, pendingRewards, onClaim }) {
  if (!stakeInfo) {
    return (
      <section className="animate-fade-in">
        <h2 className="text-xl font-bold tracking-tight mb-6">Your Positions</h2>
        <div className="bg-surface-low rounded-xl p-12 text-center">
          <p className="text-on-surface-variant text-sm">
            No active positions. Stake tokens to start earning yield.
          </p>
        </div>
      </section>
    );
  }

  const lockDays = Math.round(
    (stakeInfo.unlockTime - stakeInfo.startTime) / 86400
  );
  const unlockDate = new Date(stakeInfo.unlockTime * 1000).toLocaleDateString(
    "en-US",
    { month: "short", day: "2-digit", year: "numeric" }
  );
  const isUnlocked = Date.now() / 1000 >= stakeInfo.unlockTime;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight">Your Positions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
              <th className="pb-4 font-bold">Staked Amount</th>
              <th className="pb-4 font-bold">Lock Period</th>
              <th className="pb-4 font-bold">Unlock Date</th>
              <th className="pb-4 font-bold text-right">Rewards</th>
              <th className="pb-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="group hover:bg-surface-low/50 transition-colors">
              <td className="py-6 font-bold">
                {Number(stakeInfo.amount).toLocaleString()} SFORGE
              </td>
              <td className="py-6 text-on-surface-variant">{lockDays} Days</td>
              <td className="py-6 text-on-surface-variant">{unlockDate}</td>
              <td className="py-6 text-right font-mono text-primary">
                +{Number(pendingRewards).toFixed(4)}
              </td>
              <td className="py-6 text-right">
                {isUnlocked ? (
                  <button
                    onClick={onClaim}
                    className="px-3 py-1.5 bg-surface-high rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-surface-high rounded-lg text-[10px] font-black uppercase tracking-wider opacity-50 cursor-not-allowed inline-block">
                    Locked
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
