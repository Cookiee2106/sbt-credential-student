'use client';

import { useState } from 'react';
import { WalletConnect } from '@/components/student/WalletConnect';
import { StudentInfo } from '@/components/student/StudentInfo';
import { CredentialCard } from '@/components/student/CredentialCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_STUDENT, MOCK_CREDENTIALS } from '@/lib/mock-data';
import { FileCheck, GraduationCap, ExternalLink } from 'lucide-react';

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
  };
  school?: string;
  grade?: string;
}

export default function StudentPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<typeof MOCK_STUDENT | null>(null);

  const handleConnect = (address: string, student: typeof MOCK_STUDENT | null, credentials: Credential[]) => {
    if (address && student) {
      setWalletAddress(address);
      setCurrentStudent(student);
      setIsConnected(true);
      setCredentials(credentials);
    } else {
      setWalletAddress(null);
      setCurrentStudent(null);
      setIsConnected(false);
      setCredentials([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
            </div>
            <div className="flex gap-4 items-center">
              <a href="/" className="text-gray-600 hover:text-gray-900">Trang chủ</a>
              <a href="/admin" className="text-gray-600 hover:text-gray-900">Admin</a>
              <WalletConnect 
                onConnect={handleConnect} 
                isConnected={isConnected} 
                walletAddress={walletAddress}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <FileCheck className="h-20 w-20 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chào mừng đến với Student Portal
            </h2>
            <p className="text-gray-600 mb-6">
              Kết nối wallet để xem văn bằng của bạn
            </p>
            <p className="text-sm text-gray-500">
              Demo: Click &quot;Connect Wallet&quot; để xem thử
            </p>
          </div>
        ) : (
          <>
            <StudentInfo student={currentStudent} />

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Danh sách văn bằng</h2>
              <p className="text-gray-600">
                {credentials.length} văn bằng được tìm thấy
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Chưa có văn bằng nào</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {credentials.map((cred) => (
                  <CredentialCard
                    key={cred.id}
                    credential={cred}
                    onViewDetails={setSelectedCredential}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCredential?.name}</DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedCredential.status)}>
                  {selectedCredential.status}
                </Badge>
                {selectedCredential.grade && (
                  <Badge variant="outline">{selectedCredential.grade}</Badge>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedCredential.student?.name}</p>
                <p className="text-sm text-gray-500">{selectedCredential.student?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Ngày cấp</p>
                  <p className="font-medium">
                    {selectedCredential.issuedAt 
                      ? new Date(selectedCredential.issuedAt).toLocaleDateString('vi-VN')
                      : 'Chưa cấp'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token ID</p>
                  <p className="font-medium font-mono">
                    {selectedCredential.tokenId ? `#${selectedCredential.tokenId}` : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Mã xác minh</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {selectedCredential.verifyCode}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                {selectedCredential.description}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <a 
              href={`/verify/${selectedCredential?.verifyCode}`}
              target="_blank"
              className="flex-1 bg-primary text-white text-center py-2 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Xem công khai
            </a>
            <Button variant="outline" onClick={() => setSelectedCredential(null)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
