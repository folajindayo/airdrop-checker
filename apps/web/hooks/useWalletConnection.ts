import { useState, useEffect, useCallback } from "react";
import { WalletInfo, walletService } from "@/lib/services/walletService";

interface UseWalletConnectionResult {
  wallet: WalletInfo | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

export function useWalletConnection(): UseWalletConnectionResult {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const walletInfo = await walletService.connectWallet();
      setWallet(walletInfo);

      // Save connection state
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_address", walletInfo.address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);

    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_address");

    walletService.disconnectWallet();
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!wallet) {
      setError("No wallet connected");
      return;
    }

    try {
      const success = await walletService.switchNetwork(chainId);

      if (success) {
        setWallet((prev) => (prev ? { ...prev, chainId } : null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch network");
    }
  }, [wallet]);

  // Auto-reconnect on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet_connected");

    if (wasConnected === "true") {
      connect();
    }
  }, [connect]);

  return {
    wallet,
    connecting,
    error,
    connect,
    disconnect,
    switchNetwork,
  };
}

