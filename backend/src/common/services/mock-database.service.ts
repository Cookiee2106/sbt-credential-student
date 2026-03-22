import { Injectable } from '@nestjs/common';
import { Student } from '../../students/entities/student.entity';
import { Credential } from '../../credentials/entities/credential.entity';
import { User } from '../../auth/entities/user.entity';

export interface School {
  id: string;
  name: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationRequest {
  id: string;
  walletAddress: string;
  type: 'school' | 'student';
  schoolName?: string;
  schoolDocument?: string;
  studentCode?: string;
  schoolId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MockDatabaseService {
  private users: User[] = [];
  private schools: School[] = [];
  private students: Student[] = [];
  private credentials: Credential[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private idCounter = 1;

  constructor() {
    this.seedData();
  }

  // Helper method to check and update credential status based on expiry
  private checkAndUpdateExpiredStatus(cred: Credential): Credential {
    if (cred.expiryDate && cred.status !== 'revoked') {
      const now = new Date();
      const expiry = new Date(cred.expiryDate);
      if (expiry < now) {
        return { ...cred, status: 'expired' as const };
      }
    }
    return cred;
  }

  private seedData() {
    // Users (Super Admin)
    this.users = [
      {
        id: 'super-admin-001',
        username: 'admin',
        passwordHash: '$2b$10$xVqYLGQKkL8ZqJ3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOq',
        role: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Schools
    this.schools = [
      {
        id: 'school-001',
        name: 'Đại học Bách Khoa',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: 'school-002',
        name: 'Đại học Kinh Tế',
        walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA7',
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
    ];

    // Students
    this.students = [
      {
        id: 'student-001',
        schoolId: 'school-001',
        userId: null,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        studentCode: 'SV001',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'student-002',
        schoolId: 'school-001',
        userId: null,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        walletAddress: '0x2222222222222222222222222222222222222222',
        studentCode: 'SV002',
        status: 'active',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: 'student-003',
        schoolId: 'school-001',
        userId: null,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        walletAddress: '0x3333333333333333333333333333333333333333',
        studentCode: 'SV003',
        status: 'active',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
      {
        id: 'student-004',
        schoolId: 'school-002',
        userId: null,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        walletAddress: '0x4444444444444444444444444444444444444444',
        studentCode: 'SV101',
        status: 'active',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: 'student-005',
        schoolId: 'school-002',
        userId: null,
        name: 'Vũ Văn E',
        email: 'vuvane@example.com',
        walletAddress: '0x5555555555555555555555555555555555555555',
        studentCode: 'SV102',
        status: 'active',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
      },
    ];

    // Credentials
    this.credentials = [
      {
        id: 'cred-001',
        studentId: 'student-001',
        schoolId: 'school-001',
        student: null as any,
        name: 'Certificate of Completion - Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics với điểm trung bình 9.0',
        ipfsHash: 'QmXyZ1234567890abcdef',
        fileHash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678',
        status: 'confirmed',
        txHash: '0xabc123def456789',
        tokenId: '1',
        verifyCode: 'CRED-20240115-ABC123',
        issuedAt: new Date('2024-01-20'),
        expiryDate: null,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
      },
      {
        id: 'cred-002',
        studentId: 'student-001',
        schoolId: 'school-001',
        student: null as any,
        name: 'Certificate of Completion - Smart Contract Development',
        description: 'Hoàn thành khóa học Smart Contract Development với điểm trung bình 8.5',
        ipfsHash: 'QmXyZ0987654321fedcba',
        fileHash: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890',
        status: 'confirmed',
        txHash: '0xdef456789abc123',
        tokenId: '2',
        verifyCode: 'CRED-20240125-DEF456',
        issuedAt: new Date('2024-01-25'),
        expiryDate: null,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-27'),
      },
      {
        id: 'cred-003',
        studentId: 'student-002',
        schoolId: 'school-001',
        student: null as any,
        name: 'Certificate of Completion - Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics với điểm trung bình 8.0',
        ipfsHash: 'QmXyZ1111222233334444',
        fileHash: 'c3d4e5f678901234567890abcdef01234567890abcdef0123456789',
        status: 'issued',
        txHash: '0x789abc123def456',
        tokenId: '3',
        verifyCode: 'CRED-20240201-GHI789',
        issuedAt: new Date('2024-02-01'),
        expiryDate: new Date('2027-02-01'),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'cred-004',
        studentId: 'student-003',
        schoolId: 'school-001',
        student: null as any,
        name: 'Certificate of Completion - DeFi Fundamentals',
        description: 'Hoàn thành khóa học DeFi Fundamentals',
        ipfsHash: null,
        fileHash: null,
        status: 'pending',
        txHash: null,
        tokenId: null,
        verifyCode: 'CRED-20240210-JKL012',
        issuedAt: null,
        expiryDate: null,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
      {
        id: 'cred-005',
        studentId: 'student-004',
        schoolId: 'school-002',
        student: null as any,
        name: 'Certificate of Completion - Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics với điểm trung bình 8.5',
        ipfsHash: 'QmXyZ5555666677777888',
        fileHash: 'd4e5f678901234567890abcdef01234567890abcdef01234567890a',
        status: 'confirmed',
        txHash: '0xaaa111bbb222ccc',
        tokenId: '4',
        verifyCode: 'CRED-20240215-MNO456',
        issuedAt: new Date('2024-02-15'),
        expiryDate: null,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
      },
      {
        id: 'cred-006',
        studentId: 'student-001',
        schoolId: 'school-001',
        student: null as any,
        name: 'Chứng chỉ Tiếng Anh B1',
        description: 'Hoàn thành khóa đào tạo Tiếng Anh B1',
        ipfsHash: 'QmXyZ99990000001111',
        fileHash: 'e5f678901234567890abcdef01234567890abcdef012345678901',
        status: 'expired',
        txHash: '0xexpired001',
        tokenId: '5',
        verifyCode: 'CRED-20200115-EXP001',
        issuedAt: new Date('2020-01-15'),
        expiryDate: new Date('2023-01-15'),
        createdAt: new Date('2020-01-15'),
        updatedAt: new Date('2020-01-15'),
      },
    ];

    // Registration Requests
    this.registrationRequests = [
      {
        id: 'req-001',
        walletAddress: '0x9999999999999999999999999999999999999999',
        type: 'school',
        schoolName: 'Đại học FPT',
        schoolDocument: 'QmDoc123456789',
        status: 'pending',
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
      },
      {
        id: 'req-002',
        walletAddress: '0x8888888888888888888888888888888888888888',
        type: 'student',
        studentCode: 'SV201',
        schoolId: 'school-001',
        status: 'pending',
        createdAt: new Date('2024-02-21'),
        updatedAt: new Date('2024-02-21'),
      },
    ];

    // Link students to credentials
    this.credentials.forEach(cred => {
      cred.student = this.students.find(s => s.id === cred.studentId)!;
    });
  }

  // ==================== USERS ====================
  findAllUsers(): User[] {
    return this.users;
  }

  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // ==================== SCHOOLS ====================
  findAllSchools(): School[] {
    return this.schools;
  }

  findSchoolById(id: string): School | undefined {
    return this.schools.find(s => s.id === id);
  }

  findSchoolByWalletAddress(walletAddress: string): School | undefined {
    return this.schools.find(s => s.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }

  createSchool(data: Partial<School>): School {
    const school: School = {
      id: `school-${String(this.idCounter++).padStart(3, '0')}`,
      name: data.name,
      walletAddress: data.walletAddress,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.schools.push(school);
    return school;
  }

  // ==================== STUDENTS ====================
  findAllStudents(): Student[] {
    return this.students;
  }

  findStudentsBySchoolId(schoolId: string): Student[] {
    return this.students.filter(s => s.schoolId === schoolId);
  }

  findStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  findStudentByEmail(email: string): Student | undefined {
    return this.students.find(s => s.email === email);
  }

  findStudentByWalletAddress(walletAddress: string): Student | undefined {
    return this.students.find(s => s.walletAddress?.toLowerCase() === walletAddress.toLowerCase());
  }

  findStudentByStudentCode(studentCode: string): Student | undefined {
    return this.students.find(s => s.studentCode === studentCode);
  }

  createStudent(data: Partial<Student>): Student {
    const student: Student = {
      id: `student-${String(this.idCounter++).padStart(3, '0')}`,
      schoolId: data.schoolId || 'school-001',
      userId: data.userId || null,
      name: data.name,
      email: data.email,
      walletAddress: data.walletAddress || null,
      studentCode: data.studentCode || `SV${String(this.idCounter).padStart(3, '0')}`,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.students.push(student);
    return student;
  }

  updateStudent(id: string, data: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...data, updatedAt: new Date() };
    return this.students[index];
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.students.splice(index, 1);
    return true;
  }

  // ==================== CREDENTIALS ====================
  findAllCredentials(): Credential[] {
    return this.credentials.map(cred => {
      const updated = this.checkAndUpdateExpiredStatus(cred);
      return {
        ...updated,
        student: this.students.find(s => s.id === cred.studentId)!,
      };
    });
  }

  findCredentialsBySchoolId(schoolId: string): Credential[] {
    return this.credentials
      .filter(c => c.schoolId === schoolId)
      .map(cred => {
        const updated = this.checkAndUpdateExpiredStatus(cred);
        return {
          ...updated,
          student: this.students.find(s => s.id === cred.studentId)!,
        };
      });
  }

  findCredentialById(id: string): Credential | undefined {
    const cred = this.credentials.find(c => c.id === id);
    if (!cred) return undefined;
    const updated = this.checkAndUpdateExpiredStatus(cred);
    return {
      ...updated,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialByVerifyCode(code: string): Credential | undefined {
    const cred = this.credentials.find(c => c.verifyCode === code);
    if (!cred) return undefined;
    const updated = this.checkAndUpdateExpiredStatus(cred);
    return {
      ...updated,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialsByStudentId(studentId: string): Credential[] {
    return this.credentials
      .filter(c => c.studentId === studentId)
      .map(cred => {
        const updated = this.checkAndUpdateExpiredStatus(cred);
        return {
          ...updated,
          student: this.students.find(s => s.id === cred.studentId)!,
        };
      });
  }

  createCredential(data: Partial<Credential>): Credential {
    const verifyCode = `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const credential: Credential = {
      id: `cred-${String(this.idCounter++).padStart(3, '0')}`,
      studentId: data.studentId,
      schoolId: data.schoolId,
      student: this.students.find(s => s.id === data.studentId)!,
      name: data.name,
      description: data.description || null,
      ipfsHash: data.ipfsHash || null,
      fileHash: data.fileHash || null,
      status: 'pending',
      txHash: null,
      tokenId: null,
      verifyCode,
      issuedAt: null,
      expiryDate: data.expiryDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.credentials.push(credential);
    return credential;
  }

  updateCredential(id: string, data: Partial<Credential>): Credential | undefined {
    const index = this.credentials.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.credentials[index] = { 
      ...this.credentials[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.findCredentialById(id);
  }

  // ==================== REGISTRATION REQUESTS ====================
  findAllRegistrationRequests(): RegistrationRequest[] {
    return this.registrationRequests;
  }

  findRegistrationRequestsByStatus(status: 'pending' | 'approved' | 'rejected'): RegistrationRequest[] {
    return this.registrationRequests.filter(r => r.status === status);
  }

  findRegistrationRequestById(id: string): RegistrationRequest | undefined {
    return this.registrationRequests.find(r => r.id === id);
  }

  findRegistrationRequestByWallet(walletAddress: string): RegistrationRequest | undefined {
    return this.registrationRequests.find(r => r.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }

  createRegistrationRequest(data: Partial<RegistrationRequest>): RegistrationRequest {
    const request: RegistrationRequest = {
      id: `req-${String(this.idCounter++).padStart(3, '0')}`,
      walletAddress: data.walletAddress,
      type: data.type,
      schoolName: data.schoolName || null,
      schoolDocument: data.schoolDocument || null,
      studentCode: data.studentCode || null,
      schoolId: data.schoolId || null,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.registrationRequests.push(request);
    return request;
  }

  updateRegistrationRequest(id: string, data: Partial<RegistrationRequest>): RegistrationRequest | undefined {
    const index = this.registrationRequests.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.registrationRequests[index] = { 
      ...this.registrationRequests[index], 
      ...data, 
      updatedAt: new Date() 
    };
    return this.registrationRequests[index];
  }
}
