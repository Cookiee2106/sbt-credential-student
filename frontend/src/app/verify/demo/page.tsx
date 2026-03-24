'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const demoCredential = {
    name: 'Cử nhân Công nghệ Thông tin',
    status: 'confirmed',
    verifyCode: 'CRED-DEMO-001',
    issuedAt: '2024-01-15',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    tokenId: '1',
    ipfsHash: 'QmDemoHash123456789',
    fileHash: 'demo1234567890abcdef',
    student: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      studentCode: 'SV2020001'
    },
    issuerName: 'Trường Đại học Bách Khoa TP.HCM',
    major: 'Công nghệ Thông tin',
    classification: 'Giỏi',
    description: 'Hoàn thành chương trình đào tạo Cử nhân Công nghệ Thông tin với kết quả Giỏi, chuyên ngành Công nghệ Phần mềm.'
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 text-white';
      case 'issued': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'issued': return 'Đã phát hành';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
            ← Quay lại
          </Link>
          <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            Mẫu văn bằng demo
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatusStyle(demoCredential.status)}`}>
              {getStatusText(demoCredential.status)}
            </span>
            <h1 className="text-2xl font-bold text-white mb-2">{demoCredential.name}</h1>
            <p className="text-indigo-100 text-sm font-mono">{demoCredential.verifyCode}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Họ và tên</p>
                <p className="text-gray-900 font-medium">{demoCredential.student.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Mã sinh viên</p>
                <p className="text-gray-900 font-medium">{demoCredential.student.studentCode}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Đơn vị cấp bằng</p>
                <p className="text-gray-900 font-medium">{demoCredential.issuerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chuyên ngành</p>
                <p className="text-gray-900 font-medium">{demoCredential.major}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Xếp loại</p>
                <p className="text-gray-900 font-medium">{demoCredential.classification}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ngày cấp</p>
                <p className="text-gray-900 font-medium">{demoCredential.issuedAt}</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Mô tả</h2>
              <p className="text-gray-600 leading-relaxed">{demoCredential.description}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Xác minh chứng chỉ</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Văn bằng hợp lệ</p>
                    <p className="text-sm text-green-600">Đã được xác minh trên Blockchain</p>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  Hash: <span className="font-mono">{demoCredential.fileHash}</span>
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Thử xác minh:</p>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-500 text-sm mb-3">Nhận diện khuôn mặt và xác minh thông tin</p>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">Tải ảnh chứng chỉ</p>
                    </div>
                    <button className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                      Đang phát triển
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={`https://amoy.polygonscan.com/tx/${demoCredential.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-purple-600" />
              <span className="text-purple-600 font-medium">Xem trên Polygon Scan</span>
            </a>

            <a
              href="#"
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-not-allowed opacity-50"
            >
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Xem file gốc trên IPFS (sẽ có khi phát hành thật)</span>
            </a>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-400 text-xs text-center">
                Token ID: #{demoCredential.tokenId} • IPFS: {demoCredential.ipfsHash}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Đây là văn bằng mẫu</h3>
          <p className="text-sm text-yellow-700">
            Văn bằng thật sẽ có đầy đủ thông tin sinh viên, được cấp bởi trường đại học và lưu trữ bất biến trên Blockchain Polygon.
          </p>
        </div>
      </main>
    </div>
  );
}
