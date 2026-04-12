'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { connectSocket, disconnectSocket, onCredentialStatusChanged, onTxConfirmed, CredentialStatusChangedEvent, TxConfirmedEvent } from '@/lib/socket';

interface Credential {
  id: string;
  name: string;
  description: string;
  status: string;
  verifyCode: string;
  issuedAt: string;
  expiryDate?: string;
  txHash: string;
  tokenId: string;
  ipfsHash: string;
  fileHash: string;
  student: {
    name: string;
    email: string;
    studentCode: string;
  };
  issuerName: string;
  major: string;
  classification?: string;
}

interface VerifyByTxHashResponse {
  studentName?: string;
  credentialName?: string;
  issuedAt?: string;
}

function VerifyContent() {
  const params = useParams();
  const code = params.code as string;
  
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hashMatch, setHashMatch] = useState<boolean | null>(null);
  const [inputHash, setInputHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'hash' | 'file'>('hash');
  const [checkingHash, setCheckingHash] = useState(false);
  const [hashResultMessage, setHashResultMessage] = useState('');

  useEffect(() => {
    if (!credential) return;

    connectSocket();
    const cleanups: Array<() => void> = [];

    cleanups.push(onCredentialStatusChanged((data: CredentialStatusChangedEvent) => {
      if (data.credentialId === credential.id) {
        setCredential((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    }));

    cleanups.push(onTxConfirmed((data: TxConfirmedEvent) => {
      if (data.credentialId === credential.id) {
        setCredential((prev) => (prev ? { ...prev, txHash: data.txHash, tokenId: data.tokenId, status: 'confirmed' } : prev));
      }
    }));

    return () => {
      cleanups.forEach((fn) => fn());
      disconnectSocket();
    };
  }, [credential?.id]);

  useEffect(() => {
    if (!code) {
      setError('Thiếu mã xác minh');
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/verify/${code}`)
      .then(res => {
        if (!res.ok) {
          setError('Không tìm thấy văn bằng với mã: ' + code);
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setCredential(data);
        }
      })
      .catch(() => {
        setError('Lỗi kết nối server');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'issued': return 'Đã phát hành';
      case 'pending': return 'Chờ xử lý';
      case 'revoked': return 'Đã thu hồi';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 text-white';
      case 'issued': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-amber-500 text-white';
      case 'revoked': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-red-500">✕</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Văn bằng không hợp lệ</h1>
          <p className="text-gray-500 mb-6">{error || 'Không tìm thấy văn bằng với mã này'}</p>
          <a href="/" className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">SBT Credential</span>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Trang chủ</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-8">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getStatusStyle(credential.status)}`}>
              {getStatusText(credential.status)}
            </span>
            <h1 className="text-2xl font-bold text-white mb-2">{credential.name}</h1>
            <p className="text-indigo-100 text-sm font-mono">{credential.verifyCode}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Họ và tên</p>
                <p className="text-gray-900 font-medium">{credential.student?.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Đơn vị cấp bằng</p>
                <p className="text-gray-900 font-medium">{credential.issuerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Chuyên ngành</p>
                <p className="text-gray-900 font-medium">{credential.major}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ngày cấp</p>
                <p className="text-gray-900 font-medium">
                  {credential.issuedAt ? new Date(credential.issuedAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Ngày hết hạn</p>
                <p className="text-gray-900 font-medium">
                  {credential.expiryDate ? new Date(credential.expiryDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Không thời hạn'}
                </p>
              </div>
              {credential.classification && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Xếp loại</p>
                  <p className="text-gray-900 font-medium">{credential.classification}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Mô tả</h2>
              <p className="text-gray-600 leading-relaxed">{credential.description}</p>
            </div>

            {credential.fileHash && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Xác minh chứng chỉ</h2>
                
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setVerifyMode('hash');
                      setHashMatch(null);
                      setInputHash('');
                      setHashResultMessage('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      verifyMode === 'hash' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Nhập mã hash
                  </button>
                  <button
                    onClick={() => {
                      setVerifyMode('file');
                      setHashMatch(null);
                      setInputHash('');
                      setHashResultMessage('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      verifyMode === 'file' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tải lên file PDF
                  </button>
                </div>
                
                {verifyMode === 'hash' && (
                <div className="bg-gray-50 rounded-xl p-5 mb-4">
                  <p className="text-gray-500 text-sm mb-3">Nhập mã hash để xác minh:</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputHash}
                      onChange={(e) => {
                        setInputHash(e.target.value);
                        setHashMatch(null);
                        setHashResultMessage('');
                      }}
                      placeholder="Dán mã hash (txHash hoặc fileHash)..."
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm font-mono focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={async () => {
                        const normalizedInput = inputHash.trim().toLowerCase();
                        const normalizedStoredHash = (credential.fileHash || '').trim().toLowerCase();

                        if (!normalizedInput) {
                          setHashMatch(false);
                          setHashResultMessage('Vui lòng nhập hash để xác minh');
                          return;
                        }

                        if (normalizedInput === normalizedStoredHash) {
                          setHashMatch(true);
                          setHashResultMessage('Hash file khớp với dữ liệu đã lưu');
                          return;
                        }

                        if (normalizedInput.startsWith('0x')) {
                          setCheckingHash(true);
                          try {
                            const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/verify-by-txhash/${encodeURIComponent(normalizedInput)}`);
                            if (!txRes.ok) {
                              setHashMatch(false);
                              setHashResultMessage('Không tìm thấy văn bằng với txHash này');
                              return;
                            }

                            const txData = (await txRes.json()) as VerifyByTxHashResponse;
                            const sameCredential = (txData.credentialName || '').trim() === (credential.name || '').trim();
                            const sameStudent = (txData.studentName || '').trim() === (credential.student?.name || '').trim();

                            if (sameCredential && sameStudent) {
                              setHashMatch(true);
                              setHashResultMessage('txHash hợp lệ và thuộc đúng văn bằng này');
                            } else {
                              setHashMatch(false);
                              setHashResultMessage('txHash tồn tại nhưng không thuộc văn bằng đang xem');
                            }
                          } catch {
                            setHashMatch(false);
                            setHashResultMessage('Không thể kiểm tra txHash. Vui lòng thử lại');
                          } finally {
                            setCheckingHash(false);
                          }
                          return;
                        }

                        setHashMatch(false);
                        setHashResultMessage('Hash không khớp với fileHash hoặc txHash');
                      }}
                      disabled={checkingHash}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {checkingHash ? 'Đang kiểm tra...' : 'Kiểm tra'}
                    </button>
                  </div>
                  {hashMatch !== null && (
                    <div className="mt-4">
                      {hashMatch ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-700 font-medium">Chứng chỉ hợp lệ - Xác thực thành công</p>
                          {hashResultMessage && <p className="text-green-700 text-sm mt-1">{hashResultMessage}</p>}
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700 font-medium">Mã hash không khớp - Chứng chỉ không hợp lệ</p>
                          {hashResultMessage && <p className="text-red-700 text-sm mt-1">{hashResultMessage}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                {verifyMode === 'file' && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-500 text-sm mb-3">Hoặc tải lên file PDF để kiểm tra:</p>
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={verifying}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setVerifying(true);
                      setInputHash('');
                      setHashMatch(null);
                      
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('verifyCode', code);
                        
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/verify-file`, {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (res.ok) {
                          const data = await res.json();
                          setHashMatch(data.isValid || false);
                          if (data.isValid) {
                            setInputHash('verified');
                          } else {
                            setInputHash('invalid');
                          }
                        } else {
                          const buffer = await file.arrayBuffer();
                          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                          const hashArray = Array.from(new Uint8Array(hashBuffer));
                          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                          setInputHash(hashHex);
                          setHashMatch(hashHex.toLowerCase() === credential.fileHash?.toLowerCase());
                        }
                      } catch (err) {
                        const buffer = await file.arrayBuffer();
                        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                        setInputHash(hashHex);
                        setHashMatch(hashHex.toLowerCase() === credential.fileHash?.toLowerCase());
                      } finally {
                        setVerifying(false);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                  {verifying && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-500">Đang xác minh...</span>
                    </div>
                  )}
                  {hashMatch !== null && !verifying && (
                    <div className="mt-4">
                      {hashMatch ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-700 font-medium">Chứng chỉ hợp lệ - Xác thực thành công</p>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700 font-medium">Mã hash không khớp - Chứng chỉ không hợp lệ</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
              </div>
            )}

            {credential.status !== 'revoked' && credential.txHash && (
              <a
                href={`https://amoy.polygonscan.com/tx/${credential.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <ExternalLink className="h-5 w-5 text-purple-600" />
                <span className="text-purple-600 font-medium">Xem trên Polygon Scan</span>
              </a>
            )}

            {credential.ipfsHash && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">File gốc</h2>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${credential.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Xem file gốc trên IPFS</span>
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-400 text-xs text-center">
                Token ID: {credential.status === 'revoked' ? '-' : `#${credential.tokenId}`} • IPFS: {credential.ipfsHash}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
