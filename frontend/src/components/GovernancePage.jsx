import { useState } from "react";
import DelegationModal from "./DelegationModal";

// Mock governance data (since governance is a UI-only feature for the portfolio)
const MOCK_PROPOSALS = {
  active: [
    {
      id: "SFP-04",
      title: "Adjust Staking Rewards for 180-day Locks",
      timeLeft: "2d 14h 22m",
      forVotes: "4,430",
      quorum: "55%",
      status: "ACTIVE",
    },
    {
      id: "SFP-05",
      title: "Integration with Polygon zkEVM Liquidity Pools",
      timeLeft: "5d 08h 13m",
      forVotes: "4,400k",
      quorum: "39%",
      status: "ACTIVE",
    },
    {
      id: "SFP-06",
      title: "Treasury Allocation for Q3 Security Audits",
      timeLeft: "6d 01h 44m",
      forVotes: "15.4M",
      quorum: "28%",
      status: "ACTIVE",
    },
  ],
  past: [
    {
      id: "SFP-03",
      title: "Enable Cross-Chain Forge Minting",
      status: "CLOSED",
      forVotes: "FOR 63%",
      againstVotes: "AGAINST 37%",
      result: "PASSED",
    },
    {
      id: "SFP-02",
      title: "Increase Base Rate for Faucet Drips",
      status: "CLOSED",
      forVotes: "FOR 41%",
      againstVotes: "AGAINST 59%",
      result: "FAILED",
    },
    {
      id: "SFP-01",
      title: "Initial Forge Protocol Parameter Set",
      status: "CLOSED",
      forVotes: "FOR 91%",
      againstVotes: "AGAINST 9%",
      result: "PASSED",
    },
  ],
};

function ProposalCard({ proposal }) {
  const [hasVoted, setHasVoted] = useState(false);

  return (
    <div className="bg-surface-container rounded-xl overflow-hidden group hover:ambient-shadow transition-all duration-300 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-0">
        <span className="text-[10px] font-black tracking-widest text-on-surface-variant bg-surface-highest px-3 py-1 rounded-full">
          {proposal.id}
        </span>
        <span className="text-[10px] font-black tracking-widest text-on-primary bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-neon" />
          {proposal.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 pt-4">
        <h3 className="text-lg font-bold tracking-tight leading-snug mb-6 min-h-[3.2rem]">
          {proposal.title}
        </h3>

        {/* Stats */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
              Time Left
            </span>
            <span className="text-sm font-mono font-bold text-on-surface">
              {proposal.timeLeft}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-5">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              For:
            </span>{" "}
            <span className="text-primary font-bold text-xs">
              {proposal.forVotes}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Quorum:
            </span>{" "}
            <span className="text-on-surface font-bold text-xs">
              {proposal.quorum}
            </span>
          </div>
        </div>

        {/* Quorum bar */}
        <div className="h-1.5 w-full bg-surface-highest rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000"
            style={{ width: proposal.quorum }}
          />
        </div>

        {/* Vote Button */}
        <button
          onClick={() => setHasVoted(true)}
          disabled={hasVoted}
          className="w-full bg-surface-high py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-primary hover:text-on-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasVoted ? "✓ Vote Cast" : "Cast Vote"}
        </button>
      </div>
    </div>
  );
}

function PastProposalRow({ proposal, index }) {
  return (
    <tr
      className="border-b border-outline-variant/10 hover:bg-surface-low/30 transition-colors animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <td className="py-5 pr-4">
        <span className="text-[10px] font-black tracking-widest text-on-surface-variant bg-surface-highest px-3 py-1 rounded-full">
          {proposal.id}
        </span>
      </td>
      <td className="py-5 font-medium text-sm">{proposal.title}</td>
      <td className="py-5 text-center">
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          {proposal.status}
        </span>
      </td>
      <td className="py-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="text-primary">{proposal.forVotes}</span>
              <span className="text-error">{proposal.againstVotes}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-highest rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary rounded-l-full"
                style={{
                  width: proposal.forVotes.replace(/[^\d]/g, "") + "%",
                }}
              />
              <div
                className="h-full bg-error rounded-r-full"
                style={{
                  width: proposal.againstVotes.replace(/[^\d]/g, "") + "%",
                }}
              />
            </div>
          </div>
        </div>
      </td>
      <td className="py-5 text-right">
        <span
          className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full ${
            proposal.result === "PASSED"
              ? "bg-primary/10 text-primary"
              : "bg-error/10 text-error"
          }`}
        >
          {proposal.result}
        </span>
      </td>
    </tr>
  );
}

export default function GovernancePage({ account, balance }) {
  const votingPower = balance ? Number(balance).toFixed(0) : "0";
  const [showDelegation, setShowDelegation] = useState(false);

  return (
    <section id="governance" className="mt-20 animate-fade-in">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
        {/* Left — Title & Stats */}
        <div className="lg:col-span-2 bg-surface-low p-10 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-3 block">
              Protocol Governance
            </span>
            <h2 className="text-[4rem] font-black leading-[0.95] tracking-tighter font-headline mb-10">
              THE FORGE
              <br />
              COUNCIL
            </h2>
            <div className="flex gap-16">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                  Your Voting Power
                </span>
                <span className="text-3xl font-black tracking-tight">
                  {Number(votingPower).toLocaleString()}{" "}
                  <span className="text-sm font-medium text-on-surface-variant tracking-normal">
                    vSFORGE
                  </span>
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">
                  Total Delegated
                </span>
                <span className="text-3xl font-black tracking-tight">
                  1.2M{" "}
                  <span className="text-sm font-medium text-on-surface-variant tracking-normal">
                    SFORGE
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Delegate Card */}
        <div className="bg-primary rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-on-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-on-primary/20 flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-on-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-black tracking-tight text-on-primary-container mb-3 uppercase">
              Delegate Your
              <br />
              Strength.
            </h3>
            <p className="text-on-primary/70 text-sm leading-relaxed mb-8">
              Earn secondary rewards by delegating your voting power to active
              Council members.
            </p>
          </div>
          <button
            onClick={() => setShowDelegation(true)}
            className="w-full bg-on-primary-container text-primary py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-on-primary-container/90 transition-all active:scale-95"
          >
            Manage Delegation
          </button>
        </div>
      </div>

      {/* Active Proposals */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tighter font-headline">
            ACTIVE PROPOSALS
          </h2>
          <button className="text-xs font-bold text-primary hover:underline underline-offset-4 tracking-widest uppercase flex items-center gap-1">
            View All
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {MOCK_PROPOSALS.active.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      </div>

      {/* Past Proposals */}
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tighter font-headline mb-8">
          PAST PROPOSALS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                <th className="pb-4 font-bold pr-4 w-24">ID</th>
                <th className="pb-4 font-bold">Title</th>
                <th className="pb-4 font-bold text-center">Status</th>
                <th className="pb-4 font-bold w-64">Final Votes</th>
                <th className="pb-4 font-bold text-right w-24">Result</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROPOSALS.past.map((p, i) => (
                <PastProposalRow key={p.id} proposal={p} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delegation Modal */}
      <DelegationModal
        isOpen={showDelegation}
        onClose={() => setShowDelegation(false)}
        balance={balance}
      />
    </section>
  );
}
