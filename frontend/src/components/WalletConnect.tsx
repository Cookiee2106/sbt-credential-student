'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, AlertCircle, X } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (walletAddress: string) => void;
  isConnected: boolean;
  walletAddress: string | null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnect({ onConnect, isConnected, walletAddress }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = window.ethereum;
    if (provider) {
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          onConnect('');
        } else {
          onConnect(accounts[0]);
        }
      });
      provider.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleConnect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Vui lòng cài đặt MetaMask!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) {
        onConnect(accounts[0]);
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Bạn đã từ chối kết nối ví');
      } else {
        setError('Không thể kết nối ví');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setError(null);
    onConnect('');
  };

  const dismissError = () => {
    setError(null);
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-mono text-gray-600">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Ngắt kết nối
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Đang kết nối...' : 'Kết nối MetaMask'}
      </Button>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 max-w-[250px]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={dismissError} className="hover:bg-red-100 rounded p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
