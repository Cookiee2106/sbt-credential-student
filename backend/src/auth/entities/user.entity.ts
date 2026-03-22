export class User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'super_admin' | 'admin' | 'student' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
