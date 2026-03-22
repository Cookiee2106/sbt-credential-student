import { Student } from '../../students/entities/student.entity';

export class Credential {
  id: string;
  studentId: string;
  schoolId: string;
  student: Student;
  name: string;
  description: string | null;
  ipfsHash: string | null;
  fileHash: string | null;
  status: 'pending' | 'issued' | 'confirmed' | 'revoked' | 'expired';
  txHash: string | null;
  tokenId: string | null;
  verifyCode: string;
  issuedAt: Date | null;
  expiryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
