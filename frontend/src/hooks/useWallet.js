import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import { SUPPORTED_CHAIN_IDS, SEPOLIA_CHAIN_ID, SEPOLIA_NETWORK } from "../config";

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isCorrectChain = SUPPORTED_CHAIN_IDS.includes(chainId);

  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_NETWORK.chainId }],
      });
    } catch (err) {
      // Chain not added — add it
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_NETWORK],
        });
      }
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      const bp = new BrowserProvider(window.ethereum);
      const accounts = await bp.send("eth_requestAccounts", []);
      const network = await bp.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      if (!SUPPORTED_CHAIN_IDS.includes(currentChainId)) {
        await switchToSepolia();
      }

      const s = await bp.getSigner();
      setProvider(bp);
      setSigner(s);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [switchToSepolia]);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
        // Reconnect to get fresh signer
        connect();
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(Number(chainIdHex));
      // Reconnect on chain change
      connect();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connect]);

  // Auto-connect if already authorized
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) connect();
      })
      .catch(() => {});
  }, [connect]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
  }, []);

  return {
    account,
    provider,
    signer,
    chainId,
    isCorrectChain,
    isConnecting,
    connect,
    disconnect,
    switchToSepolia,
  };
}
