export default function Navbar({ account, balance, isConnecting, onConnect, activePage, onNavigate }) {
  const shortAddr = account
    ? `${account.slice(0, 4)}...${account.slice(-4)}`
    : null;

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "faucet", label: "Faucet" },
    { key: "governance", label: "Governance" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full glass-panel ambient-shadow">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
        {/* Brand */}
        <button
          onClick={() => onNavigate?.("dashboard")}
          className="text-xl font-black text-primary-container tracking-tighter uppercase font-headline hover:text-primary transition-colors"
        >
          StakeForge
        </button>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={`font-medium text-sm tracking-wide transition-colors duration-300 ${
                activePage === item.key
                  ? "text-primary-container font-bold border-b-2 border-primary-container pb-1"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-4">
          {account && (
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Balance
              </span>
              <span className="text-primary font-bold text-sm">
                {Number(balance).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                SFORGE
              </span>
            </div>
          )}
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/20 font-mono text-sm text-primary hover:bg-surface-high transition-all active:scale-95 disabled:opacity-50"
          >
            {isConnecting
              ? "Connecting..."
              : account
              ? shortAddr
              : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
