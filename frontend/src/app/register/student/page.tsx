'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface School {
  id: string;
  name: string;
  isActive: boolean;
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentCode: '',
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools`);
      const data = await res.json();
      setSchools(data.data || data);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
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
      
      const wallet = accounts[0];
      setWalletAddress(wallet);
      localStorage.setItem('walletAddress', wallet);
    } catch (err) {
      setError('Lỗi kết nối MetaMask');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      alert('Vui lòng kết nối MetaMask trước');
      return;
    }
    
    if (!formData.name || !formData.email || !formData.studentCode || !selectedSchool) {
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
          walletAddress,
          type: 'student',
          name: formData.name,
          email: formData.email,
          studentCode: formData.studentCode,
          schoolId: selectedSchool,
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
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Đăng ký Student</CardTitle>
          <CardDescription className="text-center">
            Đăng ký tài khoản sinh viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!walletAddress ? (
              <Button 
                type="button" 
                onClick={handleConnectMetaMask}
                variant="outline"
                className="w-full h-12"
                disabled={isConnectingWallet}
              >
                {isConnectingWallet ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Kết nối MetaMask
              </Button>
            ) : (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Địa chỉ ví</p>
                <p className="text-sm font-mono truncate">{walletAddress}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentCode">Mã sinh viên</Label>
              <Input
                id="studentCode"
                placeholder="SV001"
                value={formData.studentCode}
                onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Trường học</Label>
              <select
                className="w-full h-10 px-3 border rounded-md bg-white"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                required
              >
                <option value="">Chọn trường</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !walletAddress || !selectedSchool}
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
