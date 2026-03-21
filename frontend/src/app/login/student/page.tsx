'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function StudentLoginPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      localStorage.setItem('walletAddress', walletAddress);

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      
      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userType', data.user?.role);
        
        if (data.user?.role === 'student' && data.user?.id) {
          localStorage.setItem('studentId', data.user.id);
          router.push('/student');
        } else if (data.user?.role === 'school_admin' && data.user?.schoolId) {
          localStorage.setItem('schoolId', data.user.schoolId);
          router.push('/school');
        } else {
          setError('Tài khoản chưa được đăng ký');
        }
      } else {
        const errorData = await loginRes.json();
        setError(errorData.message || 'Wallet chưa được đăng ký');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsConnecting(false);
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
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Wallet className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đăng nhập Student</CardTitle>
          <CardDescription className="text-center">
            Kết nối ví MetaMask để đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleConnectMetaMask} 
              className="w-full h-12 text-base"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-5 w-5" />
              )}
              {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <p className="text-xs text-gray-500 text-center">
              Wallet phải được đăng ký trước bởi Admin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
