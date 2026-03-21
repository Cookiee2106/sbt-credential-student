'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, User, Building2, Wallet, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'admin'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  const handleConnectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
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
      setError('Không thể kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <a href="/" className="inline-block">
            <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">SBT Credential</h1>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-center text-lg">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <div className="space-y-4">
                {loginMethod === 'wallet' ? (
                  <>
                    <Button 
                      onClick={handleConnectMetaMask}
                      className="w-full h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Wallet className="mr-2 h-5 w-5" />
                      )}
                      Kết nối MetaMask
                    </Button>

                    <Button 
                      onClick={() => setLoginMethod('admin')}
                      variant="outline"
                      className="w-full h-12"
                    >
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Đăng nhập Super Admin
                    </Button>

                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <div className="text-center text-sm text-gray-500">
                      Chưa có tài khoản?{' '}
                      <button 
                        onClick={() => setMode('register')}
                        className="text-primary hover:underline"
                      >
                        Đăng ký
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleAdminLogin} className="space-y-3">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setLoginMethod('wallet'); setError(''); }}
                        className="w-full justify-start px-0 h-8"
                      >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Quay lại
                      </Button>
                      
                      <div className="space-y-1">
                        <Label htmlFor="username" className="text-xs">Username</Label>
                        <Input
                          id="username"
                          placeholder="admin"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="password" className="text-xs">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Đăng nhập
                      </Button>
                    </form>

                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* REGISTER MODE */}
            {mode === 'register' && (
              <div className="space-y-3">
                <a href="/register/student">
                  <Button variant="outline" className="w-full h-12 justify-start">
                    <User className="mr-3 h-5 w-5" />
                    Đăng ký Student
                  </Button>
                </a>
                
                <a href="/register/school">
                  <Button variant="outline" className="w-full h-12 justify-start">
                    <Building2 className="mr-3 h-5 w-5" />
                    Đăng ký School
                  </Button>
                </a>

                <div className="text-center text-sm text-gray-500">
                  Đã có tài khoản?{' '}
                  <button 
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          Văn bằng được lưu trữ bất biến trên Blockchain Polygon
        </p>
      </div>
    </div>
  );
}
