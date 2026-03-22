'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function SchoolRegisterPage() {
  const router = useRouter();
  const [walletMethod, setWalletMethod] = useState<'connect' | 'manual'>('connect');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [manualWallet, setManualWallet] = useState<string>('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleConnectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }

    setIsConnectingWallet(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const wallet = accounts[0];
      setWalletAddress(wallet);
      setManualWallet(wallet);
    } catch (err) {
      setError('Lỗi kết nối MetaMask');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalWallet = walletMethod === 'manual' ? manualWallet : walletAddress;
    
    if (!finalWallet) {
      alert('Vui lòng kết nối hoặc nhập địa chỉ ví');
      return;
    }
    
    if (!formData.name || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: finalWallet,
          type: 'school',
          name: formData.name,
          email: formData.email,
          schoolName: formData.name,
        }),
      });

      if (res.ok) {
        alert('Đăng ký thành công! Vui lòng chờ admin duyệt.');
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/login')}
              className="p-0 h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đăng ký School</CardTitle>
          <CardDescription className="text-center">
            Đăng ký tài khoản quản lý trường học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Wallet Section */}
            <div className="space-y-2">
              <Label>Địa chỉ ví</Label>
              
              {walletMethod === 'connect' ? (
                <div className="space-y-2">
                  <Button 
                    type="button" 
                    onClick={handleConnectMetaMask}
                    variant="outline"
                    className="w-full"
                    disabled={isConnectingWallet}
                  >
                    {isConnectingWallet ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Kết nối MetaMask
                  </Button>
                  
                  {walletAddress && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Đã kết nối</p>
                      <p className="text-sm font-mono truncate">{walletAddress}</p>
                    </div>
                  )}
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setWalletMethod('manual')}
                    className="w-full"
                  >
                    Hoặc nhập địa chỉ ví thủ công
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="0x..."
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    className="font-mono text-sm"
                  />
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setWalletMethod('connect')}
                    className="w-full"
                  >
                    Hoặc kết nối MetaMask
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên trường</Label>
              <Input
                id="name"
                placeholder="Đại học ABC"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@abc.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || (!walletAddress && !manualWallet)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu đăng ký
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Sau khi đăng ký, vui lòng chờ Super Admin duyệt
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
