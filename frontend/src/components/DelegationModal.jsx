import { useState } from "react";
import toast from "react-hot-toast";

export default function DelegationModal({ isOpen, onClose, balance }) {
  const [delegateAddress, setDelegateAddress] = useState("");
  const [delegateAmount, setDelegateAmount] = useState("");
  const [isDelegating, setIsDelegating] = useState(false);

  if (!isOpen) return null;

  const handleDelegate = async () => {
    if (!delegateAddress || !delegateAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(delegateAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }

    setIsDelegating(true);
    const toastId = toast.loading("Delegating voting power...");

    // Simulate delegation (UI-only for portfolio)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success(
      `Delegated ${Number(delegateAmount).toLocaleString()} vSFORGE to ${delegateAddress.slice(0, 6)}...${delegateAddress.slice(-4)}`,
      { id: toastId }
    );

    setIsDelegating(false);
    setDelegateAddress("");
    setDelegateAmount("");
    onClose();
  };

  // Council members for quick delegation
  const councilMembers = [
    { name: "forge.eth", address: "0x1234...abcd", power: "245K vSFORGE" },
    { name: "council.sforge", address: "0x5678...ef01", power: "180K vSFORGE" },
    { name: "validator.eth", address: "0x9abc...2345", power: "120K vSFORGE" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden animate-fade-in shadow-2xl">
        {/* Gradient top accent */}
        <div className="h-1 bg-gradient-to-r from-primary to-tertiary" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight font-headline">
                Manage Delegation
              </h2>
              <p className="text-on-surface-variant text-xs mt-1">
                Delegate your voting power to a Council member
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-surface-highest flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-high transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Delegate — Council Members */}
          <div className="mb-8">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3 block">
              Top Council Members
            </span>
            <div className="space-y-2">
              {councilMembers.map((member) => (
                <button
                  key={member.name}
                  onClick={() =>
                    setDelegateAddress(
                      member.address === "0x1234...abcd"
                        ? "0x1234567890abcdef1234567890abcdef12345678"
                        : member.address === "0x5678...ef01"
                        ? "0x567890abcdef1234567890abcdef1234567890ab"
                        : "0x9abcdef1234567890abcdef1234567890abcdef1"
                    )
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-low hover:bg-surface-high transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold block">{member.name}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {member.address}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Select →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Delegate Address */}
          <div className="mb-5">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 block">
              Delegate Address
            </label>
            <input
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-surface-highest border-none rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-primary-dim/40 text-on-surface placeholder:text-outline/50 outline-none"
            />
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 block">
              Amount (vSFORGE)
            </label>
            <div className="relative">
              <input
                type="text"
                value={delegateAmount}
                onChange={(e) => setDelegateAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-highest border-none rounded-lg p-4 text-sm font-mono focus:ring-1 focus:ring-primary-dim/40 text-on-surface placeholder:text-outline/50 outline-none"
              />
              <button
                onClick={() => setDelegateAmount(balance || "0")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface-low p-4 rounded-xl border border-outline-variant/10 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Delegating does not transfer your tokens. You retain full
                ownership and can revoke delegation at any time. Your delegate
                will vote on proposals on your behalf.
              </p>
            </div>
          </div>

          {/* Delegate Button */}
          <button
            onClick={handleDelegate}
            disabled={isDelegating || !delegateAddress || !delegateAmount}
            className="w-full bg-gradient-to-r from-primary to-primary-container py-4 rounded-xl text-on-primary font-black uppercase tracking-widest text-sm neon-shadow hover:neon-shadow-hover transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDelegating ? "Delegating..." : "Confirm Delegation"}
          </button>
        </div>
      </div>
    </div>
  );
}
