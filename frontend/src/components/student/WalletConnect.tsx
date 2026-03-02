'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { MOCK_STUDENT, MOCK_CREDENTIALS, MockCredential } from '@/lib/mock-data';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

interface WalletConnectProps {
  onConnect: (walletAddress: string, student: typeof MOCK_STUDENT | null, credentials: MockCredential[]) => void;
  isConnected: boolean;
  walletAddress: string | null;
}

export function WalletConnect({ onConnect, isConnected, walletAddress }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);

  const loadWeb3 = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) return null;

    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    const chainIdHex = '0x' + chainId.toString(16);

    if (chainIdHex !== SEPOLIA_CHAIN_ID) {
      return null;
    }

    return web3;
  };

  const getAccount = async () => {
    const web3 = await loadWeb3();
    if (!web3) return false;
    const accounts = await web3.eth.getAccounts();
    return accounts?.[0] || false;
  };

  const requestAccounts = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) throw new Error('No MetaMask');

    // CÁCH 2: Ép buộc hiện bảng chọn ví mỗi lần Connect (Bỏ comment để dùng cho trang Admin)
    /* 
    await (provider as any).request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    }); 
    */
    // CÁCH 1 (Mặc định web3): Tự động ghi nhớ và kết nối lại ví cũ (Thích hợp UX cho Student)
    return (provider as any).request({ method: 'eth_requestAccounts' });
  };

  const switchToSepolia = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) return;
    try {
      await (provider as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Please add Sepolia network');
      }
      throw error;
    }
  };

  useEffect(() => {
    const provider = (window as any).ethereum;
    if (provider) {
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          onConnect('', null, []);
        } else {
          onConnect(accounts[0], MOCK_STUDENT, MOCK_CREDENTIALS);
        }
      });
      provider.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);

    try {
      let web3 = await loadWeb3();

      if (!web3) {
        await switchToSepolia();
        web3 = await loadWeb3();
        if (!web3) {
          alert('Please switch to Sepolia network manually in MetaMask');
          setLoading(false);
          return;
        }
      }

      await requestAccounts();
      const account = await getAccount();

      if (account) {
        onConnect(account, MOCK_STUDENT, MOCK_CREDENTIALS);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to connect');
    }

    setLoading(false);
  };

  const handleDisconnect = () => {
    onConnect('', null, []);
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-mono text-gray-600">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      <Wallet className="mr-2 h-4 w-4" />
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
