// ─── Contract Addresses (Update after deployment) ───────────
// Sepolia testnet addresses — replace with your deployed addresses
export const CONTRACTS = {
  SFORGE_TOKEN: "0x0000000000000000000000000000000000000000",
  STAKE_FORGE: "0x0000000000000000000000000000000000000000",
};

// ─── Chain Config ────────────────────────────────────────────
export const SUPPORTED_CHAIN_IDS = [31337, 11155111]; // Hardhat localhost + Sepolia
export const SEPOLIA_CHAIN_ID = 11155111;
export const HARDHAT_CHAIN_ID = 31337;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const SEPOLIA_NETWORK = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Testnet",
  rpcUrls: ["https://rpc.sepolia.org"],
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// ─── Staking Constants ──────────────────────────────────────
export const DURATION_OPTIONS = [
  { label: "30 DAYS", value: 0, days: 30, apy: "5%" },
  { label: "90 DAYS", value: 1, days: 90, apy: "12%" },
  { label: "180 DAYS", value: 2, days: 180, apy: "20%" },
];

export const APY_BPS = { 0: 500, 1: 1200, 2: 2000 };
