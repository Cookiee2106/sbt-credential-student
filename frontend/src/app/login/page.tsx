'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Wallet, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'super-admin'>('home');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [error, setError] = useState('');

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userType', data.user?.role || 'super_admin');
        router.push('/admin');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Không thể kết nối server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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
        
        if (data.user?.role === 'school_admin' && data.user?.schoolId) {
          localStorage.setItem('schoolId', data.user.schoolId);
          router.push('/school');
        } else if (data.user?.role === 'student' && data.user?.id) {
          localStorage.setItem('studentId', data.user.id);
          router.push('/student');
        } else if (data.user?.role === 'super_admin') {
          router.push('/admin');
        } else {
          setError('Tài khoản chưa được đăng ký. Vui lòng đăng ký tài khoản mới.');
        }
      } else {
        const errorData = await loginRes.json();
        setError(errorData.message || 'Wallet chưa được đăng ký trong hệ thống');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  if (view === 'super-admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setView('home')} className="p-0 h-8 w-8">
                ←
              </Button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Super Admin</CardTitle>
            <CardDescription className="text-center">
              Đăng nhập bằng username/password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSuperAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SBT Credential</h1>
          <p className="text-gray-500 mt-2">Hệ thống quản lý văn bằng Blockchain</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Đăng nhập</CardTitle>
            <CardDescription className="text-center">
              Kết nối ví MetaMask hoặc đăng nhập Admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleConnectMetaMask} 
              className="w-full h-12 text-base"
              disabled={isConnectingWallet}
            >
              {isConnectingWallet ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-5 w-5" />
              )}
              {isConnectingWallet ? 'Đang kết nối...' : 'Kết nối MetaMask'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">hoặc</span>
              </div>
            </div>

            <Button 
              onClick={() => setView('super-admin')} 
              variant="outline" 
              className="w-full h-12 text-base"
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Đăng nhập Super Admin
            </Button>

            {error && (
              <p className="text-sm text-red-500 text-center mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-6">
          Văn bằng được lưu trữ bất biến trên Blockchain Polygon
        </p>
      </div>
    </div>
  );
}
