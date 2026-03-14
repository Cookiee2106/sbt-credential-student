'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Building2, User, Plus, CheckCircle, XCircle, FileCheck, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  walletAddress: string;
  status: 'active' | 'inactive' | 'graduated';
}

interface Credential {
  id: string;
  studentId: string;
  name: string;
  description: string;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked' | 'expired';
  verifyCode: string;
  issuedAt: string;
  classification?: string;
  major?: string;
  issuerName?: string;
  student: {
    name: string;
    studentCode: string;
  };
}

interface RegistrationRequest {
  id: string;
  type: 'student';
  name: string;
  email: string;
  walletAddress: string;
  studentCode: string;
  schoolId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
}

export default function SchoolDashboard() {
  const schoolId = typeof window !== 'undefined' ? localStorage.getItem('schoolId') || 'school-001' : 'school-001';
  const [school, setSchool] = useState<School | null>(null);
  
  const [activeTab, setActiveTab] = useState<'students' | 'credentials' | 'requests'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newCredential, setNewCredential] = useState({ 
    name: '', 
    description: '',
    classification: '',
    major: '',
    issuerName: school?.name || '',
    expiryDate: ''
  });
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentCode: '',
    walletAddress: ''
  });
  const [editStudent, setEditStudent] = useState({
    id: '',
    name: '',
    email: '',
    studentCode: '',
    walletAddress: '',
    status: 'active' as 'active' | 'inactive' | 'graduated'
  });

  useEffect(() => {
    fetchData();
    fetchSchoolDetails();
  }, [schoolId]);

  const fetchSchoolDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schools/${schoolId}`);
      if (res.ok) {
        const data = await res.json();
        setSchool(data);
        setNewCredential(prev => ({ ...prev, issuerName: data.name || '' }));
      }
    } catch (err) {
      console.error('Failed to fetch school:', err);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const [studentsRes, credentialsRes, requestsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/students?schoolId=${schoolId}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/school/${schoolId}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests?type=student&schoolId=${schoolId}`, { headers }),
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.data || studentsData);
      }

      if (credentialsRes.ok) {
        const credentialsData = await credentialsRes.json();
        setCredentials(credentialsData.data || credentialsData);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRegistrationRequests(requestsData.data || requestsData);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi duyệt yêu cầu');
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registration-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi từ chối yêu cầu');
    }
  };

  const handleIssueCredential = async () => {
    if (!selectedStudent || !newCredential.name) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          name: newCredential.name,
          description: newCredential.description,
          classification: newCredential.classification,
          major: newCredential.major,
          issuerName: newCredential.issuerName,
          expiryDate: newCredential.expiryDate || null,
        }),
      });
      
      if (res.ok) {
        alert('Phát hành văn bằng thành công!');
        setShowIssueModal(false);
        setNewCredential({ name: '', description: '', classification: '', major: '', issuerName: 'Đại học Bách Khoa', expiryDate: '' });
        setSelectedStudent(null);
        fetchData();
      } else {
        alert('Lỗi phát hành văn bằng');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleRevokeCredential = async (id: string) => {
    const cred = credentials.find(c => c.id === id);
    if (!cred) return;
    if (!confirm(`Bạn có chắc muốn thu hồi văn bằng "${cred.name}"?`)) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/${id}/revoke`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi thu hồi văn bằng');
    }
  };

  const handleConfirmCredential = async (id: string) => {
    const cred = credentials.find(c => c.id === id);
    if (!cred) return;
    if (!confirm(`Bạn có chắc muốn xác nhận văn bằng "${cred.name}"?`)) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credentials/${id}/confirm`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi xác nhận văn bằng');
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.studentCode) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newStudent,
          schoolId: schoolId
        }),
      });
      
      if (res.ok) {
        alert('Tạo sinh viên thành công!');
        setShowCreateStudentModal(false);
        setNewStudent({ name: '', email: '', studentCode: '', walletAddress: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi tạo sinh viên');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleUpdateStudent = async () => {
    if (!editStudent.name || !editStudent.email || !editStudent.studentCode) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editStudent.name,
          email: editStudent.email,
          studentCode: editStudent.studentCode,
          walletAddress: editStudent.walletAddress,
          status: editStudent.status
        }),
      });
      
      if (res.ok) {
        alert('Cập nhật sinh viên thành công!');
        setShowEditStudentModal(false);
        setSelectedStudent(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi cập nhật sinh viên');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        alert('Xóa sinh viên thành công!');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Lỗi xóa sinh viên');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const pendingRequests = registrationRequests.filter(r => r.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'issued': return 'Đã cấp';
      case 'pending': return 'Chờ xử lý';
      case 'revoked': return 'Đã thu hồi';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">School Dashboard</h1>
              <Badge variant="outline" className="ml-2">{school?.name || 'Đại học Bách Khoa'}</Badge>
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
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng sinh viên</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sinh viên Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{students.filter(s => s.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Văn bằng đã cấp</CardTitle>
              <FileCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credentials.filter(c => c.status === 'confirmed').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yêu cầu chờ duyệt</CardTitle>
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'students' ? 'default' : 'outline'}
            onClick={() => setActiveTab('students')}
          >
            <User className="mr-2 h-4 w-4" />
            Sinh viên
          </Button>
          <Button
            variant={activeTab === 'credentials' ? 'default' : 'outline'}
            onClick={() => setActiveTab('credentials')}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            Văn bằng
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Yêu cầu chờ duyệt
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </Button>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Danh sách sinh viên</CardTitle>
                <CardDescription>Quản lý sinh viên của trường</CardDescription>
              </div>
              <Button onClick={() => setShowCreateStudentModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sinh viên
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Đang tải...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SV</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{student.studentCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{student.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setEditStudent({ id: student.id, name: student.name, email: student.email, studentCode: student.studentCode, walletAddress: student.walletAddress, status: student.status }); setShowEditStudentModal(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(student); setShowIssueModal(true); }}>
                                Cấp văn bằng
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách văn bằng</CardTitle>
              <CardDescription>Tất cả văn bằng đã phát hành</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Đang tải...</p>
              ) : credentials.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Chưa có văn bằng nào</p>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{cred.name}</p>
                        <p className="text-sm text-gray-500">{cred.student?.name}</p>
                        <p className="text-xs text-gray-400">Mã xác minh: {cred.verifyCode}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(cred.status)}>{getStatusText(cred.status)}</Badge>
                          {cred.issuedAt && <p className="text-xs text-gray-500 mt-1">Ngày cấp: {cred.issuedAt}</p>}
                        </div>
                        {(cred.status === 'confirmed' || cred.status === 'issued') && (
                          <div className="flex gap-2">
                            {cred.status === 'issued' && (
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleConfirmCredential(cred.id)}
                              >
                                Xác nhận
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRevokeCredential(cred.id)}
                            >
                              Thu hồi
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đăng ký chờ duyệt</CardTitle>
              <CardDescription>Sinh viên đăng ký chờ xác nhận</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8">Đang tải...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có yêu cầu nào</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{request.name}</p>
                        <p className="text-sm text-gray-500">{request.email}</p>
                        <p className="text-xs text-gray-400">Mã SV: {request.studentCode}</p>
                        <p className="text-xs text-gray-400 font-mono">{request.walletAddress.substring(0, 16)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600" onClick={() => handleApproveRequest(request.id)}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                          <XCircle className="mr-1 h-4 w-4" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Issue Credential Modal */}
      {showIssueModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Cấp văn bằng</h3>
            <p className="text-sm text-gray-500 mb-4">Sinh viên: {selectedStudent.name} ({selectedStudent.studentCode})</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên văn bằng *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Cử nhân Công nghệ Thông tin" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea 
                  placeholder="Mô tả chi tiết về văn bằng" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.description}
                  onChange={(e) => setNewCredential({ ...newCredential, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Xếp loại *</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.classification}
                  onChange={(e) => setNewCredential({ ...newCredential, classification: e.target.value })}
                >
                  <option value="">Chọn xếp loại</option>
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Giỏi">Giỏi</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngành/Chuyên ngành *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Công nghệ phần mềm" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.major}
                  onChange={(e) => setNewCredential({ ...newCredential, major: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đơn vị cấp *</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.issuerName}
                  onChange={(e) => setNewCredential({ ...newCredential, issuerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày hết hạn (optional)</label>
                <input 
                  type="date" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newCredential.expiryDate}
                  onChange={(e) => setNewCredential({ ...newCredential, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowIssueModal(false); setSelectedStudent(null); }}>Hủy</Button>
              <Button className="flex-1" onClick={handleIssueCredential}>Phát hành</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Student Modal */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Thêm sinh viên mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã sinh viên *</label>
                <input 
                  type="text" 
                  placeholder="SV001" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={newStudent.studentCode}
                  onChange={(e) => setNewStudent({ ...newStudent, studentCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ ví (optional)</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  value={newStudent.walletAddress}
                  onChange={(e) => setNewStudent({ ...newStudent, walletAddress: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCreateStudentModal(false); setNewStudent({ name: '', email: '', studentCode: '', walletAddress: '' }); }}>Hủy</Button>
              <Button className="flex-1" onClick={handleCreateStudent}>Tạo</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && editStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Cập nhật sinh viên</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input 
                  type="email" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={editStudent.email}
                  onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã sinh viên *</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2"
                  value={editStudent.studentCode}
                  onChange={(e) => setEditStudent({ ...editStudent, studentCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ ví</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  value={editStudent.walletAddress}
                  onChange={(e) => setEditStudent({ ...editStudent, walletAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2"
                  value={editStudent.status}
                  onChange={(e) => setEditStudent({ ...editStudent, status: e.target.value as 'active' | 'inactive' | 'graduated' })}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="graduated">Đã tốt nghiệp</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowEditStudentModal(false); setEditStudent({ id: '', name: '', email: '', studentCode: '', walletAddress: '', status: 'active' }); }}>Hủy</Button>
              <Button className="flex-1" onClick={handleUpdateStudent}>Lưu</Button>
            </div>
            <div className="mt-4">
              <Button variant="destructive" className="w-full" onClick={() => { handleDeleteStudent(editStudent.id); setShowEditStudentModal(false); }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa sinh viên
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
