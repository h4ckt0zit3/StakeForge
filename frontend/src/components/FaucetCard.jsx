export default function FaucetCard({ account, isLoading, onRequestFaucet }) {
  return (
    <section id="faucet" className="mt-20 flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-2xl mb-12 flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-2 block">
            Testnet Environment
          </span>
          <h2 className="text-[3.5rem] font-black leading-none tracking-tighter font-headline">
            The Faucet
          </h2>
        </div>
        <div className="text-right hidden sm:block">
          <span className="block text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">
            Status
          </span>
          <span className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
            Operational
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="relative group">
          {/* Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000" />

          <div className="relative bg-surface-low rounded-[2rem] overflow-hidden border border-outline-variant/10">
            <div className="p-12 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-surface-highest flex items-center justify-center mb-8 border border-primary/10">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold font-headline mb-4 tracking-tight">
                Get Test SFORGE Tokens
              </h3>
              <p className="text-on-surface-variant max-w-sm mb-10 leading-relaxed">
                The StakeForge Testnet Faucet distributes small amounts of
                SFORGE to developers and testers.
              </p>

              {/* Wallet display */}
              {account && (
                <div className="w-full bg-surface-container mb-8 p-6 rounded-2xl border border-outline-variant/10">
                  <span className="block text-[10px] uppercase font-black tracking-[0.15em] text-on-surface-variant mb-3">
                    Destination Address
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-white">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(account)}
                      className="p-2 hover:bg-surface-highest rounded-lg transition-colors text-primary/60 hover:text-primary"
                      title="Copy address"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Request Button */}
              <button
                onClick={onRequestFaucet}
                disabled={isLoading || !account}
                className="w-full bg-primary-container text-on-primary-container font-black text-lg py-5 rounded-xl neon-shadow hover:neon-shadow-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 15H6l7-14v8h5l-7 14v-8z" />
                </svg>
                {isLoading ? "Processing..." : "Request Tokens"}
              </button>

              {/* Limit info */}
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-highest rounded-full border border-outline-variant/10">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
                <span className="text-[11px] uppercase font-bold tracking-widest text-on-surface-variant">
                  Limit: 1000 SFORGE every 24 hours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-surface-low rounded-3xl border border-outline-variant/5">
            <svg className="w-6 h-6 text-primary mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <h4 className="font-bold text-lg mb-2">Secure Hardening</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              StakeForge uses advanced anti-sybil mechanisms. Ensure your wallet
              has minimum activity to qualify for larger faucet drops.
            </p>
          </div>
          <div className="p-8 bg-surface-low rounded-3xl border border-outline-variant/5">
            <svg className="w-6 h-6 text-secondary mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59z" />
            </svg>
            <h4 className="font-bold text-lg mb-2">API Access</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Integrate the faucet directly into your testing scripts using our
              automated endpoint for CI/CD pipelines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
