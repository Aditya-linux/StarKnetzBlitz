"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";
import { StarkSDK } from "starkzap";
import starknetCore from "get-starknet-core";

/**
 * StarkZap SDK Integration Provider
 * 
 * Supports both Cartridge Controller (Passkeys/Socials) and Standard Wallet Extensions (Braavos/Argent X)
 */

interface StarkZapContextType {
  isConnected: boolean;
  address: string;
  balance: number;
  login: () => Promise<void>; // Backward compatible, aliases to Cartridge
  loginWithExtension: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  walletType: "cartridge" | "extension" | "mock" | null;
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
});

export const useStarkZap = () => useContext(StarkZapContext);

export default function StarkZapProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [walletType, setWalletType] = useState<"cartridge" | "extension" | "mock" | null>(null);
  
  const sdkRef = useRef<StarkSDK | null>(null);
  const walletRef = useRef<any>(null);

  // Fetch STRK balance via our own API route (no CORS issues!)
  const fetchBalance = async (userAddress: string) => {
    try {
      const res = await fetch(`/api/balance?address=${encodeURIComponent(userAddress)}`);
      const data = await res.json();
      if (data.balance) {
        setBalance(Number(data.balance));
      }
    } catch (e) {
      console.warn("[StarkZap] Non-critical: Could not fetch balance", e);
      setBalance(0);
    }
  };

  const loginWithCartridge = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!sdkRef.current) {
        sdkRef.current = new StarkSDK({ network: "sepolia" });
      }

      // Use Cartridge Controller — opens a popup for social login / passkeys
      const wallet = await sdkRef.current.connectCartridge();
      walletRef.current = wallet;

      // Get the wallet address
      const addressVal = (wallet as any).address;
      const walletAddress = typeof addressVal === "function"
        ? await addressVal()
        : addressVal || "0xCartridgeUser";

      const addrStr = String(walletAddress);
      setAddress(addrStr);
      setIsConnected(true);
      setWalletType("cartridge");
      console.log("[StarkZap] Connected via Cartridge with address:", addrStr);

      await fetchBalance(addrStr);

    } catch (err: any) {
      const errorMessage = err?.message || "";
      
      if (errorMessage.includes("closed") || errorMessage.includes("cancel")) {
        console.log("[StarkZap] User cancelled Cartridge login");
        setIsLoading(false);
        return;
      }

      if (errorMessage.includes("initialize")) {
        console.warn("[StarkZap] Cartridge Controller timed out or failed to initialize.");
      } else {
        console.error("[StarkZap] Cartridge login error:", err);
      }

      /* Mock Fallback (Disabled)
      console.warn("[StarkZap] Falling back to mock wallet");
      await new Promise((res) => setTimeout(res, 800));
      const mockAddr = "0x0492BcF8A5B3E689C819F95fA612dDfFd8Aa99F2";
      setAddress(mockAddr);
      setIsConnected(true);
      setWalletType("mock");
      */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithExtension = useCallback(async () => {
    setIsLoading(true);
    try {
      // User explicitly requested to only connect this specific ready wallet address
      const MY_READY_WALLET = "0x022f5A1244c8FFC30f00260bCC6ed0D6eD8343DA4065592970A7D2BE4e811F60";
      
      setAddress(MY_READY_WALLET);
      setIsConnected(true);
      setWalletType("extension");
      console.log(`[StarkZap] Connected via specific ready wallet account:`, MY_READY_WALLET);

      // Fetch balance via our server-side API route (no CORS!)
      await fetchBalance(MY_READY_WALLET);

    } catch (err: any) {
      console.error("[StarkZap] Ready wallet login error:", err);
      alert(`Wallet Connection Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sdkRef.current = null;
    walletRef.current = null;
    setIsConnected(false);
    setAddress("");
    setBalance(0);
    setWalletType(null);
  }, []);

  return (
    <StarkZapContext.Provider
      value={{ 
        isConnected, 
        address, 
        balance, 
        login: loginWithCartridge, // Maintain backwards compatibility
        loginWithExtension,
        logout, 
        isLoading,
        walletType
      }}
    >
      {children}
    </StarkZapContext.Provider>
  );
}
