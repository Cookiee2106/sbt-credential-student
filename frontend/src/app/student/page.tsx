'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, FileCheck, ExternalLink, FileDown, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportCredentialPDF } from '@/lib/export';

interface Credential {
  id: string;
  name: string;
  description: string;
  status: string;
  verifyCode: string;
  issuedAt: string;
  tokenId: string;
  student: {
    name: string;
    email: string;
    studentCode?: string;
  };
  classification?: string;
  major?: string;
  expiryDate?: string;
  issuerName?: string;
}

const MOCK_STUDENT = {
  id: '1',
  name: 'Nguyễn Văn A',
  email: 'a@email.com',
  studentCode: 'SV001',
  walletAddress: '',
};

const MOCK_CREDENTIALS: Credential[] = [
  { 
    id: '1', 
    name: 'Cử nhân Công nghệ Thông tin', 
    description: 'Hoàn thành chương trình đào tạo Cử nhân Công nghệ Thông tin', 
    status: 'confirmed', 
    verifyCode: 'CRED-20240115-ABC123', 
    issuedAt: '2024-01-15', 
    tokenId: '1', 
    student: { name: 'Nguyễn Văn A', email: 'a@email.com' },
    classification: 'Giỏi',
    major: 'Công nghệ phần mềm',
    issuerName: 'Trường Đại học Bách Khoa'
  },
  { 
    id: '2', 
    name: 'Cử nhân Kinh tế', 
    description: 'Hoàn thành chương trình đào tạo Cử nhân Kinh tế', 
    status: 'confirmed', 
    verifyCode: 'CRED-20240125-DEF456', 
    issuedAt: '2024-01-25', 
    tokenId: '2', 
    student: { name: 'Nguyễn Văn A', email: 'a@email.com' },
    classification: 'Khá',
    major: 'Kinh tế quốc tế',
    issuerName: 'Trường Đại học Kinh Tế'
  },
  { 
    id: '3', 
    name: 'Chứng chỉ An toàn Thông tin', 
    description: 'Hoàn thành khóa đào tạo An toàn Thông tin cơ bản', 
    status: 'issued', 
    verifyCode: 'CRED-20240201-GHI789', 
    issuedAt: '2024-02-01', 
    tokenId: '3', 
    student: { name: 'Nguyễn Văn A', email: 'a@email.com' },
    classification: 'Xuất sắc',
    major: 'An toàn Thông tin',
    issuerName: 'Trường Đại học Công Nghệ',
    expiryDate: '2027-02-01'
  },
  { 
    id: '4', 
    name: 'Chứng chỉ Tiếng Anh B1', 
    description: 'Hoàn thành khóa đào tạo Tiếng Anh B1', 
    status: 'expired', 
    verifyCode: 'CRED-20200115-EXP001', 
    issuedAt: '2020-01-15', 
    tokenId: '4', 
    student: { name: 'Nguyễn Văn A', email: 'a@email.com' },
    classification: 'Khá',
    major: 'Tiếng Anh',
    issuerName: 'Trường Đại học Ngoại Ngữ',
    expiryDate: '2023-01-15'
  },
];

export default function StudentPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [currentStudent, setCurrentStudent] = useState<{id: string, name: string, email: string, studentCode: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterSort, setFilterSort] = useState('all');

  useEffect(() => {
    const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
    if (studentId) {
      fetchStudentData(studentId);
    } else {
      // Demo mode - use mock data
      setCurrentStudent({ id: '1', name: 'Nguyễn Văn A', email: 'a@email.com', studentCode: 'SV001' });
      setCredentials(MOCK_CREDENTIALS);
      setLoading(false);
    }
  }, []);

  const fetchStudentData = async (studentId: string) => {
    const token = localStorage.getItem('token');
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCurrentStudent(data);
        
        // Use new endpoint: /credentials/student/:studentId
        const credRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/student/${studentId}`, { headers });
        if (credRes.ok) {
          const credData = await credRes.json();
          setCredentials(credData.data || credData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'issued': return 'Đã cấp';
      case 'pending': return 'Chờ xử lý';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Đã hết hạn';
      default: return status;
    }
  };

  const filteredCredentials = credentials.filter((cred) => {
    if (filterSort === 'all') return true;
    return cred.status === filterSort;
  }).sort((a, b) => {
    if (filterSort === 'date-asc') {
      return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
    } else if (filterSort === 'newest') {
      return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">Student Portal</h1>
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
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{currentStudent?.name?.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentStudent?.name}</h2>
                <p className="text-gray-500">{currentStudent?.email}</p>
                <p className="text-sm text-gray-400">Mã SV: {currentStudent?.studentCode}</p>
              </div>
            </div>
          </div>
        </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Danh sách văn bằng</h2>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterSort('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'all' ? 'bg-primary text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilterSort('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Chờ xử lý
                </button>
                <button
                  onClick={() => setFilterSort('issued')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'issued' ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Đã cấp
                </button>
                <button
                  onClick={() => setFilterSort('confirmed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'confirmed' ? 'bg-green-500 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Đã xác nhận
                </button>
                <button
                  onClick={() => setFilterSort('revoked')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'revoked' ? 'bg-red-500 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Đã thu hồi
                </button>
                <button
                  onClick={() => setFilterSort('expired')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSort === 'expired' ? 'bg-gray-500 text-white' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  Đã hết hạn
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-gray-500">Đang tải dữ liệu...</span>
              </div>
            ) : filteredCredentials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filterSort !== 'all' ? 'Không có văn bằng phù hợp' : 'Chưa có văn bằng nào'}
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">{filteredCredentials.length} văn bằng</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCredentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCredential(cred)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${cred.status === 'expired' ? 'bg-gray-100' : 'bg-primary/10'}`}>
                          <FileCheck className={`h-6 w-6 ${cred.status === 'expired' ? 'text-gray-400' : 'text-primary'}`} />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getStatusColor(cred.status)}>{getStatusText(cred.status)}</Badge>
                          {cred.classification && cred.status !== 'expired' && (
                            <span className="text-xs font-medium text-green-600">{cred.classification}</span>
                          )}
                        </div>
                      </div>
                      <h3 className={`font-semibold text-lg mb-1 ${cred.status === 'expired' ? 'text-gray-400' : ''}`}>{cred.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{cred.issuerName}</p>
                      <p className="text-sm text-gray-400 mb-3">{cred.major}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t">
                        <span>Ngày cấp: {cred.issuedAt || 'Chưa cấp'}</span>
                        {cred.expiryDate && <span className={cred.status === 'expired' ? 'text-red-500' : 'text-orange-500'}>
                          {cred.status === 'expired' ? 'Đã hết hạn' : `Hết hạn: ${cred.expiryDate}`}
                        </span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
      </main>

      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedCredential?.name}</DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedCredential.status)}>
                  {getStatusText(selectedCredential.status)}
                </Badge>
                {selectedCredential.classification && selectedCredential.status !== 'expired' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Xếp loại: {selectedCredential.classification}
                  </Badge>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sinh viên:</span>
                  <span className="font-medium">{selectedCredential.student?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-sm text-gray-600">{selectedCredential.student?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Đơn vị cấp bằng</p>
                  <p className="font-medium text-sm">{selectedCredential.issuerName || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Chuyên ngành</p>
                  <p className="font-medium text-sm">{selectedCredential.major || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ngày cấp</p>
                  <p className="font-medium">{selectedCredential.issuedAt || 'Chưa cấp'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ngày hết hạn</p>
                  <p className={`font-medium ${selectedCredential.status === 'expired' ? 'text-red-600' : selectedCredential.expiryDate ? 'text-orange-600' : ''}`}>
                    {selectedCredential.expiryDate ? (selectedCredential.status === 'expired' ? `Đã hết hạn (${selectedCredential.expiryDate})` : selectedCredential.expiryDate) : 'Không có'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Token ID</p>
                  <p className="font-medium font-mono">
                    {selectedCredential.tokenId ? `#${selectedCredential.tokenId}` : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mã xác minh</p>
                  <p className="font-mono text-xs">{selectedCredential.verifyCode}</p>
                </div>
              </div>

              {selectedCredential.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                  <p className="text-sm">{selectedCredential.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <a
                  href={`/verify/${selectedCredential?.verifyCode}`}
                  target="_blank"
                  className="flex-1 bg-primary text-white text-center py-2 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Verify
                </a>
                <Button variant="outline" size="icon" title="Export PDF" onClick={() => selectedCredential && exportCredentialPDF(selectedCredential)}>
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Copy link" onClick={() => {
                  const url = `${window.location.origin}/verify/${selectedCredential?.verifyCode}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={() => setSelectedCredential(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
