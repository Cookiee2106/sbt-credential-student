'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Building2, User, Wallet, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type UserType = 'school' | 'student' | null;

interface School {
  id: string;
  name: string;
  isActive: boolean;
}

interface WalletCheckResponse {
  exists: boolean;
  role?: 'school' | 'student';
  studentId?: string;
  schoolId?: string;
  name?: string;
  message?: string;
}

interface RegistrationRequest {
  id: string;
  type: 'school' | 'student';
  name: string;
  email: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  description?: string;
}

const MOCK_REQUESTS: RegistrationRequest[] = [
  {
    id: 'req-1',
    type: 'school',
    name: 'Đại học Công Nghệ',
    email: 'admin@uct.edu.vn',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1234',
    status: 'pending',
    createdAt: '2024-03-01',
    description: 'Đăng ký làm trường đại học',
  },
  {
    id: 'req-2',
    type: 'student',
    name: 'Nguyễn Văn D',
    email: 'dnguyen@email.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    status: 'pending',
    createdAt: '2024-03-02',
    description: 'Sinh viên đại học',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'connect' | 'super-admin' | 'select-type' | 'select-school' | 'register'>('connect');
  const [userType, setUserType] = useState<UserType>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [registerData, setRegisterData] = useState({ name: '', email: '', description: '', studentCode: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [superAdminLoggedIn, setSuperAdminLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    
    if (mode === 'register') {
      // Show registration options - user needs to connect MetaMask first
      setStep('select-type');
    } else if (mode === 'login') {
      setStep('connect');
    }
  }, []);

  const handleSelectUserType = async (type: 'school' | 'student') => {
    setUserType(type);
    if (type === 'student') {
      // Fetch schools list for student to choose
      try {
        const res = await fetch('http://localhost:3000/schools');
        const data = await res.json();
        setSchools(data.data || data);
        setStep('select-school');
      } catch (err) {
        // Fallback mock schools for demo
        setSchools([
          { id: 'school-001', name: 'Đại học Bách Khoa', isActive: true },
          { id: 'school-002', name: 'Đại học Kinh Tế', isActive: true },
        ]);
        setStep('select-school');
      }
    } else {
      setStep('register');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('Vui lòng cài đặt MetaMask!');
        setIsConnecting(false);
        return;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const walletAddress = accounts[0];
      setWalletAddress(walletAddress);
      localStorage.setItem('walletAddress', walletAddress);
      
      // Demo mode - for now, go to school page
      localStorage.setItem('userType', 'school');
      localStorage.setItem('schoolId', 'school-001');
      router.push('/school');
      
    } catch (err) {
      setError('Lỗi kết nối MetaMask. Vui lòng thử lại.');
      setIsConnecting(false);
    }
  };

  const goToSchool = () => {
    localStorage.setItem('userType', 'school');
    localStorage.setItem('schoolId', 'school-001');
    router.push('/school');
  };

  const goToStudent = () => {
    localStorage.setItem('userType', 'student');
    localStorage.setItem('studentId', 'student-001');
    router.push('/student');
  };

  const handleSubmitRegistration = async () => {
    if (!walletAddress || !userType || !registerData.name || !registerData.email) return;
    
    setIsSubmitting(true);
    setError('');
    
    // Demo mode - redirect directly to dashboard
    if (userType === 'school') {
      localStorage.setItem('userType', 'school');
      localStorage.setItem('schoolId', 'school-001');
      alert('Đăng ký thành công! (Demo mode)');
      router.push('/school');
    } else {
      localStorage.setItem('userType', 'student');
      localStorage.setItem('studentId', 'student-001');
      alert('Đăng ký thành công! (Demo mode)');
      router.push('/student');
    }
    
    setIsSubmitting(false);
  };

  if (superAdminLoggedIn) {
    return <SuperAdminDashboard onLogout={() => setSuperAdminLoggedIn(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === 'register' ? 'Đăng ký tài khoản' : 'SBT Credential'}
          </CardTitle>
          <CardDescription>
            {step === 'connect' && 'Kết nối ví MetaMask hoặc đăng nhập Super Admin'}
            {step === 'select-type' && 'Chọn loại tài khoản'}
            {step === 'register' && 'Điền thông tin đăng ký'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'connect' && (
            <div className="space-y-4">
              <Button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="w-full h-12 text-lg"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-5 w-5" />
                )}
                {isConnecting ? 'Đang kết nối...' : 'Kết nối MetaMask'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={goToSchool}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  School Dashboard (Demo)
                </Button>
                
                <Button
                  onClick={goToStudent}
                  variant="outline"
                  className="w-full h-12"
                >
                  <User className="mr-2 h-5 w-5" />
                  Student Dashboard (Demo)
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">hoặc</span>
                </div>
              </div>

              <Button
                onClick={() => setStep('super-admin')}
                variant="outline"
                className="w-full h-12"
              >
                <ShieldCheck className="mr-2 h-5 w-5" />
                Đăng nhập Super Admin
              </Button>
            </div>
          )}

          {step === 'super-admin' && (
            <SuperAdminLogin onLogin={() => setSuperAdminLoggedIn(true)} />
          )}

          {step === 'select-type' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Địa chỉ ví: <span className="font-mono">{walletAddress?.substring(0, 10)}...</span>
              </p>
              
              <Button
                onClick={() => handleSelectUserType('school')}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                <Building2 className="mr-3 h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Đăng ký School</div>
                  <div className="text-xs text-gray-500">Trường học / Tổ chức giáo dục</div>
                </div>
              </Button>

              <Button
                onClick={() => handleSelectUserType('student')}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                <User className="mr-3 h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Đăng ký Student</div>
                  <div className="text-xs text-gray-500">Sinh viên / Học sinh</div>
                </div>
              </Button>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">hoặc</span>
                </div>
              </div>

              <Button
                onClick={() => { setWalletAddress(null); setStep('connect'); }}
                variant="secondary"
                className="w-full"
              >
                Đã có tài khoản? Đăng nhập
              </Button>
            </div>
          )}

          {step === 'select-school' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="outline" className="text-sm py-1 px-3">
                  👨‍🎓 Đăng ký Student
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                Chọn trường học
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {schools.map((school) => (
                  <Button
                    key={school.id}
                    onClick={() => { setSelectedSchool(school.id); setStep('register'); }}
                    className="w-full h-12 text-left"
                    variant={selectedSchool === school.id ? 'default' : 'outline'}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {school.name}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setStep('select-type')}
                className="w-full"
              >
                Quay lại
              </Button>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Badge variant="outline" className="text-sm py-1 px-3">
                  {userType === 'school' ? '🏫 Đăng ký School' : '👨‍🎓 Đăng ký Student'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {userType === 'school' ? 'Tên trường' : 'Họ và tên'}
                </Label>
                <Input
                  id="name"
                  placeholder={userType === 'school' ? 'Đại học ABC' : 'Nguyễn Văn A'}
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>

              {userType === 'school' && (
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả về trường"
                    value={registerData.description}
                    onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
                  />
                </div>
              )}

              {userType === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="studentCode">Mã sinh viên</Label>
                  <Input
                    id="studentCode"
                    placeholder="SV001"
                    value={registerData.studentCode}
                    onChange={(e) => setRegisterData({ ...registerData, studentCode: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Địa chỉ ví</Label>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {walletAddress}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => userType === 'student' ? setStep('select-school') : setStep('select-type')}
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmitRegistration}
                  disabled={isSubmitting || !registerData.name || !registerData.email || (userType === 'student' && !registerData.studentCode)}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Gửi yêu cầu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SuperAdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [requests, setRequests] = useState<RegistrationRequest[]>(MOCK_REQUESTS);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleApprove = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
            </div>
            <div className="flex gap-4 items-center">
              <Button variant="outline" onClick={() => { onLogout(); window.location.href = '/'; }}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Schools</CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-xs text-gray-500">Trường học đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Students</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">120</div>
              <p className="text-xs text-gray-500">Sinh viên đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-gray-500">Yêu cầu chờ duyệt</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Schools</CardTitle>
              <CardDescription>Quản lý các trường học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Đại học Bách Khoa', 'Đại học Kinh Tế', 'Đại học Ngoại Ngữ', 'Đại học Công Nghệ', 'Học Viện Tài Chính'].map((school, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{school}</p>
                        <p className="text-xs text-gray-500">50 students</p>
                      </div>
                    </div>
                    <Badge variant={i < 2 ? 'default' : 'secondary'}>
                      {i < 2 ? 'Hoạt động' : 'Chờ duyệt'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Yêu cầu đăng ký chờ duyệt</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có yêu cầu nào</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${request.type === 'school' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {request.type === 'school' ? (
                              <Building2 className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{request.name}</p>
                            <p className="text-sm text-gray-500">{request.email}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">
                              {request.walletAddress.substring(0, 16)}...
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{request.type}</Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 mt-2 ml-11">{request.description}</p>
                      )}
                      <div className="flex gap-2 mt-3 ml-11">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SuperAdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Try API first
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        onLogin();
      } else {
        // Demo mode - accept admin/admin123
        if (username === 'admin' && password === 'admin123') {
          localStorage.setItem('userType', 'super_admin');
          router.push('/admin');
        } else {
          setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
      }
    } catch (err) {
      // Demo mode - accept admin/admin123
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('userType', 'super_admin');
        router.push('/admin');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="text-center mb-6">
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Super Admin</h3>
        <p className="text-sm text-gray-500">Đăng nhập bằng username/password</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onLogin()}
          className="flex-1"
        >
          Quay lại
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !username || !password}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Đăng nhập
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Demo: admin / admin123
      </p>
    </form>
  );
}
