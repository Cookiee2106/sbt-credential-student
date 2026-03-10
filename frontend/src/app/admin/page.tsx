'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Building2, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RegistrationRequest {
  id: string;
  type: 'school' | 'student';
  name: string;
  email: string;
  walletAddress: string;
  schoolName?: string;
  studentCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/`);
      if (res.ok) {
        const data = await res.json();
        setSchools(data.data || data);
      } else {
        setSchools([
          { id: 'school-001', name: 'Đại học Bách Khoa', email: 'admin@bkhn.edu.vn', walletAddress: '0x1111111111111111111111111111111111111111', isActive: true, createdAt: '2024-01-01' },
          { id: 'school-002', name: 'Đại học Kinh Tế', email: 'admin@ueh.edu.vn', walletAddress: '0x2222222222222222222222222222222222222222', isActive: true, createdAt: '2024-01-15' },
          { id: 'school-003', name: 'Đại học Ngoại Ngữ', email: 'admin@huflit.edu.vn', walletAddress: '0x3333333333333333333333333333333333333333', isActive: true, createdAt: '2024-02-01' },
        ]);
      }
    } catch (err) {
      setSchools([
        { id: 'school-001', name: 'Đại học Bách Khoa', email: 'admin@bkhn.edu.vn', walletAddress: '0x1111111111111111111111111111111111111111', isActive: true, createdAt: '2024-01-01' },
        { id: 'school-002', name: 'Đại học Kinh Tế', email: 'admin@ueh.edu.vn', walletAddress: '0x2222222222222222222222222222222222222222', isActive: true, createdAt: '2024-01-15' },
        { id: 'school-003', name: 'Đại học Ngoại Ngữ', email: 'admin@huflit.edu.vn', walletAddress: '0x3333333333333333333333333333333333333333', isActive: true, createdAt: '2024-02-01' },
      ]);
    } finally {
      setRequests([
        { id: 'req-1', type: 'school', name: 'Đại học Công Nghệ', email: 'admin@uct.edu.vn', walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1234', schoolName: 'Đại học Công Nghệ', status: 'pending', createdAt: '2024-03-01' },
        { id: 'req-2', type: 'school', name: 'Đại học FPT', email: 'admin@fpt.edu.vn', walletAddress: '0x9999999999999999999999999999999999999999', schoolName: 'Đại học FPT', status: 'pending', createdAt: '2024-03-02' },
      ]);
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    // Demo mode - update local state
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    alert('Đã duyệt yêu cầu! (Demo mode)');
  };

  const handleReject = (id: string) => {
    if (!confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
    // Demo mode - update local state
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    alert('Đã từ chối yêu cầu! (Demo mode)');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

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
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng số Schools</CardTitle>
              <Building2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{schools.length}</div>
              <p className="text-xs text-gray-500">Trường học đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yêu cầu chờ duyệt</CardTitle>
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-gray-500">Yêu cầu đăng ký School</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requests.filter(r => r.status === 'approved').length}</div>
              <p className="text-xs text-gray-500">Yêu cầu đã duyệt</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Danh sách Schools</CardTitle>
            <CardDescription>Các trường học đã được duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-xs text-gray-500">{school.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đăng ký School</CardTitle>
            <CardDescription>Quản lý yêu cầu đăng ký từ các trường học</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Đang tải...</p>
            ) : error ? (
              <p className="text-center py-8 text-red-500">{error}</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Không có yêu cầu nào</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Building2 className="h-4 w-4 text-blue-600" />
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
                    <div className="flex gap-2 mt-4">
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

        {/* All Requests History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lịch sử yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.filter(r => r.status !== 'pending').length === 0 ? (
              <p className="text-center py-4 text-gray-500">Chưa có lịch sử</p>
            ) : (
              <div className="space-y-2">
                {requests.filter(r => r.status !== 'pending').map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-xs text-gray-500">{request.email}</p>
                      </div>
                    </div>
                    <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
