import { useState, useEffect, useCallback, useRef } from "react";
import { Contract, formatEther, parseEther } from "ethers";
import toast from "react-hot-toast";
import { CONTRACTS, APY_BPS } from "../config";
import SFORGETokenABI from "../abi/SFORGEToken.json";
import StakeForgeABI from "../abi/StakeForge.json";

export function useContracts(signer, provider, account) {
  const [balance, setBalance] = useState("0");
  const [tvl, setTvl] = useState("0");
  const [stakeInfo, setStakeInfo] = useState(null);
  const [pendingRewards, setPendingRewards] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [contractsReady, setContractsReady] = useState(false);

  // Use refs so callbacks always access the latest contract instances
  const tokenRef = useRef(null);
  const stakingRef = useRef(null);
  const accountRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  // Initialize contracts
  useEffect(() => {
    if (!signer) {
      setContractsReady(false);
      return;
    }
    try {
      const token = new Contract(CONTRACTS.SFORGE_TOKEN, SFORGETokenABI, signer);
      const staking = new Contract(CONTRACTS.STAKE_FORGE, StakeForgeABI, signer);
      tokenRef.current = token;
      stakingRef.current = staking;
      setContractsReady(true);
    } catch (err) {
      console.error("Contract init failed:", err);
      setContractsReady(false);
    }
  }, [signer]);

  // Check if a contract actually exists at the address
  const verifyContract = useCallback(async (address) => {
    if (!provider) return false;
    try {
      const code = await provider.getCode(address);
      return code !== "0x";
    } catch {
      return false;
    }
  }, [provider]);

  // Fetch user data — uses refs to always get latest contracts
  const fetchData = useCallback(async () => {
    const token = tokenRef.current;
    const staking = stakingRef.current;
    const addr = accountRef.current;
    if (!addr) return;

    // 1. Token balance (independent)
    if (token) {
      try {
        const bal = await token.balanceOf(addr);
        setBalance(formatEther(bal));
      } catch (err) {
        if (err.code === "BAD_DATA") {
          console.warn("[StakeForge] Token contract not found on this network. Check config.js addresses and connected chain.");
          setContractsReady(false);
        } else {
          console.error("Balance fetch error:", err);
        }
      }
    }

    // 2. Staking data (independent)
    if (staking) {
      try {
        const [totalStaked, stake, rewards] = await Promise.all([
          staking.getTVL(),
          staking.stakes(addr),
          staking.getPendingRewards(addr),
        ]);
        setTvl(formatEther(totalStaked));
        setPendingRewards(formatEther(rewards));

        if (stake.amount > 0n) {
          setStakeInfo({
            amount: formatEther(stake.amount),
            startTime: Number(stake.startTime),
            unlockTime: Number(stake.unlockTime),
            apyBps: Number(stake.apyBps),
            rewardsClaimed: formatEther(stake.rewardsClaimed),
          });
        } else {
          setStakeInfo(null);
        }
      } catch (err) {
        if (err.code !== "BAD_DATA") {
          console.error("Staking data fetch error:", err);
        }
      }
    }
  }, []);

  // Poll data every 10 seconds + fetch on account/signer change
  useEffect(() => {
    if (!account || !contractsReady) return;
    const timer = setTimeout(() => fetchData(), 200);
    const interval = setInterval(fetchData, 10000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [account, signer, contractsReady, fetchData]);

  // ─── Contract Actions ──────────────────────────────────────

  const requestFaucet = useCallback(async () => {
    const token = tokenRef.current;
    const addr = accountRef.current;
    if (!token || !addr) return;
    setIsLoading(true);
    const toastId = toast.loading("Requesting tokens from faucet...");
    try {
      const tx = await token.faucet();
      toast.loading("Confirming transaction...", { id: toastId });
      await tx.wait();
      toast.success("1,000 SFORGE received!", { id: toastId });
      // Fetch fresh balance directly
      try {
        const newBal = await token.balanceOf(addr);
        setBalance(formatEther(newBal));
      } catch {
        // Fallback: wait and refetch
        setTimeout(() => fetchData(), 1000);
      }
    } catch (err) {
      const msg = err?.reason || err?.message || "Faucet request failed";
      toast.error(msg.includes("FaucetCooldown") ? "Faucet on cooldown — try again in 24h" : msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const stakeTokens = useCallback(
    async (amount, durationChoice) => {
      const token = tokenRef.current;
      const staking = stakingRef.current;
      if (!token || !staking) return;
      setIsLoading(true);
      const toastId = toast.loading("Approving tokens...");
      try {
        const amountWei = parseEther(amount);
        const approveTx = await token.approve(CONTRACTS.STAKE_FORGE, amountWei);
        await approveTx.wait();
        toast.loading("Staking tokens...", { id: toastId });
        const stakeTx = await staking.stake(amountWei, durationChoice);
        await stakeTx.wait();
        toast.success("Tokens staked successfully!", { id: toastId });
        await fetchData();
      } catch (err) {
        const msg = err?.reason || err?.message || "Staking failed";
        toast.error(msg, { id: toastId });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData]
  );

  const unstakeTokens = useCallback(async () => {
    const staking = stakingRef.current;
    if (!staking) return;
    setIsLoading(true);
    const toastId = toast.loading("Unstaking tokens...");
    try {
      const tx = await staking.unstake();
      toast.loading("Confirming transaction...", { id: toastId });
      await tx.wait();
      toast.success("Unstaked successfully! Principal + rewards returned.", { id: toastId });
      await fetchData();
    } catch (err) {
      const msg = err?.reason || err?.message || "Unstake failed";
      toast.error(msg.includes("StakeLocked") ? "Stake still locked!" : msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const claimRewards = useCallback(async () => {
    const staking = stakingRef.current;
    if (!staking) return;
    setIsLoading(true);
    const toastId = toast.loading("Claiming rewards...");
    try {
      const tx = await staking.claimRewards();
      toast.loading("Confirming transaction...", { id: toastId });
      await tx.wait();
      toast.success("Rewards claimed!", { id: toastId });
      await fetchData();
    } catch (err) {
      const msg = err?.reason || err?.message || "Claim failed";
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  return {
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
    fetchData,
  };
}
