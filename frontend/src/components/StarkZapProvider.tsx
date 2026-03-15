"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";

/**
 * Wallet Provider — Direct window.starknet integration
 * Works with Argent X & Braavos without any SDK abstraction issues
 */

const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

interface StarkZapContextType {
  isConnected: boolean;
  address: string;
  balance: number;
  login: () => Promise<void>;
  loginWithExtension: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  walletType: "cartridge" | "extension" | "mock" | null;
  transferSTRK: (toAddress: string, amount: number) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const StarkZapContext = createContext<StarkZapContextType>({
  isConnected: false,
  address: "",
  balance: 0,
  login: async () => {},
  loginWithExtension: async () => {},
  logout: () => {},
  isLoading: false,
  walletType: null,
  transferSTRK: async () => null,
  refreshBalance: async () => {},
});

export const useStarkZap = () => useContext(StarkZapContext);

// Helper to get available starknet wallet from window
function getStarknetWallet(): any {
  if (typeof window === "undefined") return null;
  const win = window as any;
  // Try Argent X first, then Braavos, then generic
  return win.starknet_argentX || win.starknet_braavos || win.starknet || null;
}

export default function StarkZapProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [walletType, setWalletType] = useState<"cartridge" | "extension" | "mock" | null>(null);
  
  const walletRef = useRef<any>(null);

  // Fetch STRK balance via our API route
  const fetchBalance = useCallback(async (userAddress?: string) => {
    const addr = userAddress || address;
    if (!addr) return;
    try {
      const res = await fetch(`/api/balance?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (data.balance) {
        setBalance(Number(data.balance));
      }
    } catch (e) {
      console.warn("[Wallet] Could not fetch balance", e);
      setBalance(0);
    }
  }, [address]);

  // Connect wallet via window.starknet (Argent X / Braavos)
  const loginWithExtension = useCallback(async () => {
    setIsLoading(true);
    try {
      const starknetWallet = getStarknetWallet();
      
      if (!starknetWallet) {
        alert("No Starknet wallet found!\n\nPlease install Argent X or Braavos browser extension.");
        setIsLoading(false);
        return;
      }

      console.log("[Wallet] Found wallet:", starknetWallet.id || starknetWallet.name || "unknown");

      // Enable the wallet — this triggers the popup
      await starknetWallet.enable();
      
      console.log("[Wallet] Enabled. isConnected:", starknetWallet.isConnected);
      console.log("[Wallet] selectedAddress:", starknetWallet.selectedAddress);
      console.log("[Wallet] account:", starknetWallet.account);
      console.log("[Wallet] account keys:", starknetWallet.account ? Object.keys(starknetWallet.account) : "none");

      const walletAddress = starknetWallet.selectedAddress || starknetWallet.account?.address || "";
      
      if (!walletAddress) {
        alert("Could not get wallet address. Please unlock your wallet on the Sepolia network.");
        setIsLoading(false);
        return;
      }

      walletRef.current = starknetWallet;
      setAddress(walletAddress);
      setIsConnected(true);
      setWalletType("extension");
      console.log("[Wallet] Connected:", walletAddress);

      await fetchBalance(walletAddress);

    } catch (err: any) {
      console.error("[Wallet] Connection error:", err);
      alert(`Wallet Connection Error: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalance]);

  const loginWithCartridge = useCallback(async () => {
    await loginWithExtension();
  }, [loginWithExtension]);

  // Transfer STRK tokens — uses the wallet's account.execute()
  const transferSTRK = useCallback(async (toAddress: string, amount: number): Promise<string | null> => {
    const wallet = walletRef.current;
    if (!wallet || !wallet.account) {
      alert("Wallet not connected! Please connect your wallet first.");
      return null;
    }

    try {
      // Convert to uint256 as decimal strings (low, high)
      const amountWei = BigInt(Math.floor(amount * 1e18));
      const low = (amountWei & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toString(10);
      const high = (amountWei >> BigInt(128)).toString(10);

      console.log(`[Wallet] Transferring ${amount} STRK to ${toAddress}`);
      console.log(`[Wallet] Amount uint256: low=${low}, high=${high}`);

      let txHash: string | null = null;

      if (typeof wallet.account.execute === "function") {
        console.log("[Wallet] Using account.execute()");
        // execute() expects an ARRAY of calls, each with calldata as string array
        const result = await wallet.account.execute([
          {
            contractAddress: STRK_ADDRESS,
            entrypoint: "transfer",
            calldata: [toAddress, low, high]
          }
        ]);
        txHash = result.transaction_hash;
      } else {
        console.error("[Wallet] No execute method found. Account keys:", 
          Object.getOwnPropertyNames(Object.getPrototypeOf(wallet.account))
        );
        throw new Error("Wallet does not support execute(). Please update your wallet.");
      }

      console.log("[Wallet] Tx submitted:", txHash);
      setTimeout(() => fetchBalance(), 5000);
      return txHash;

    } catch (err: any) {
      if (err.message?.includes("abort") || err.message?.includes("reject") || err.message?.includes("cancel") || err.message?.includes("denied")) {
        console.log("[Wallet] User rejected transaction");
        return null;
      }
      console.error("[Wallet] Transfer error:", err);
      throw err;
    }
  }, [fetchBalance]);

  const logout = useCallback(() => {
    walletRef.current = null;
    setIsConnected(false);
    setAddress("");
    setBalance(0);
    setWalletType(null);
  }, []);

  return (
    <StarkZapContext.Provider
      value={{ 
        isConnected, address, balance, 
        login: loginWithCartridge,
        loginWithExtension,
        logout, isLoading, walletType,
        transferSTRK,
        refreshBalance: fetchBalance
      }}
    >
      {children}
    </StarkZapContext.Provider>
  );
}
