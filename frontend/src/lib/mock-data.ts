export const MOCK_STUDENT = {
  id: '1',
  schoolId: 'school-001',
  name: 'Nguyễn Văn A',
  email: 'a.nguyenvan@example.com',
  studentCode: 'SV001',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1'
};

export interface MockCredential {
  id: string;
  schoolId: string;
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

export const MOCK_CREDENTIALS: MockCredential[] = [
  { 
    id: '1', 
    schoolId: 'school-001',
    name: 'Cử nhân Công nghệ Thông tin', 
    description: 'Bằng Cử nhân ngành Công nghệ Thông tin, chuyên ngành Phát triển Ứng dụng',
    status: 'confirmed', 
    verifyCode: 'CRED-20240115-ABC123', 
    tokenId: '1',
    issuedAt: '2024-01-15',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    school: 'Đại học Công nghệ',
    grade: 'Giỏi'
  },
  { 
    id: '2', 
    schoolId: 'school-001',
    name: 'Chứng chỉ React Developer', 
    description: 'Hoàn thành khóa học React Developer với thời lượng 40 giờ',
    status: 'confirmed', 
    verifyCode: 'CRED-20240125-DEF456', 
    tokenId: '2',
    issuedAt: '2024-01-25',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    school: 'FPT Tech Academy',
    grade: 'Xuất sắc'
  },
  { 
    id: '3', 
    schoolId: 'school-001',
    name: 'Chứng chỉ Node.js Backend', 
    description: 'Hoàn thành khóa học Node.js Backend Development',
    status: 'pending', 
    verifyCode: 'CRED-20240210-JKL012', 
    tokenId: '',
    issuedAt: '',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    school: 'FPT Tech Academy',
    grade: ''
  },
  { 
    id: '4', 
    schoolId: 'school-001',
    name: 'Chứng chỉ TypeScript', 
    description: 'Hoàn thành khóa học TypeScript Fundamentals',
    status: 'issued', 
    verifyCode: 'CRED-20240215-MNO345', 
    tokenId: '3',
    issuedAt: '2024-02-15',
    student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' },
    school: 'FPT Tech Academy',
    grade: 'Giỏi'
  },
];

export interface MockSchool {
  id: string;
  name: string;
  walletAddress: string;
}

export const MOCK_SCHOOLS: MockSchool[] = [
  { id: 'school-001', name: 'Đại học Bách Khoa', walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1' },
  { id: 'school-002', name: 'Đại học Kinh Tế', walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA7' },
];
