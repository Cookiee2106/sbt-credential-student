# Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      users      │       │    schools     │       │    students    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)        │       │ id (PK)         │
│ username        │       │ name           │       │ school_id (FK)  │
│ password_hash   │       │ wallet_address │◄──────│ user_id (FK)    │
│ role            │       │ is_active      │       │ name            │
│ created_at      │       │ created_at     │       │ email           │
│ updated_at      │       │ updated_at     │       │ wallet_address  │
└─────────────────┘       └─────────────────┘       │ student_code    │
                                                  │ status          │
                                                  │ created_at      │
                                                  │ updated_at      │
                                                  └────────┬────────┘
                                                           │
                                        ┌─────────────────┼─────────────────┐
                                        │                 │                 │
                                        ▼                 ▼                 ▼
                               ┌─────────────────┐  ┌─────────────────┐
                               │   credentials  │  │registration_req│
                               ├─────────────────┤  ├─────────────────┤
                               │ id (PK)         │  │ id (PK)         │
                               │ student_id (FK)│  │ wallet_address  │
                               │ school_id (FK) │  │ type            │
                               │ name            │  │ school_name     │
                               │ description     │  │ school_document │
                               │ ipfs_hash       │  │ student_code    │
                               │ file_hash       │  │ school_id (FK)  │
                               │ status          │  │ status          │
                               │ tx_hash         │  │ created_at      │
                               │ token_id        │  │ updated_at      │
                               │ verify_code     │  └─────────────────┘
                               │ issued_at       │
                               │ created_at     │
                               │ updated_at     │
                               └─────────────────┘
```

## Tables

### 1. users (Super Admin only)
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | User ID |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | ENUM | NOT NULL | 'super_admin' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 2. schools
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | School ID |
| name | VARCHAR(255) | NOT NULL | School name |
| wallet_address | VARCHAR(42) | UNIQUE | School's Polygon wallet address (for minting SBT) |
| is_active | BOOLEAN | DEFAULT TRUE | School active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 3. students
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | Student ID |
| school_id | UUID | FK → schools.id | School the student belongs to |
| user_id | UUID | FK → users.id | Related user account |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| wallet_address | VARCHAR(42) | | Polygon wallet address (for receiving SBT) |
| student_code | VARCHAR(50) | UNIQUE | Student code (e.g., SV001) |
| status | ENUM | DEFAULT 'active' | 'active', 'inactive', 'graduated' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 4. credentials (IMMUTABLE - Blockchain)
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | Credential ID |
| student_id | UUID | FK → students.id | Owner student |
| school_id | UUID | FK → schools.id | School that issued this credential |
| name | VARCHAR(255) | NOT NULL | Credential name (e.g., "Cử nhân Công nghệ Thông tin") |
| description | TEXT | | Detailed description |
| classification | VARCHAR(50) | | Grade/Classification (Xuất sắc, Giỏi, Khá) |
| major | VARCHAR(255) | | Major/Specialization (e.g., Công nghệ phần mềm) |
| issuer_name | VARCHAR(255) | | Issuer/School name (e.g., "Trường Đại học Bách Khoa") |
| ipfs_hash | VARCHAR(255) | | IPFS file hash (PDF) |
| file_hash | VARCHAR(64) | | SHA-256 hash of file |
| status | ENUM | DEFAULT 'pending' | 'pending', 'issued', 'confirmed', 'revoked', 'expired' |
| tx_hash | VARCHAR(66) | | Blockchain transaction hash |
| token_id | BIGINT | | ERC721 token ID |
| verify_code | VARCHAR(50) | UNIQUE | Public verification code |
| issued_at | TIMESTAMP | | Issue date |
| expiry_date | TIMESTAMP | | Expiry date (for short-term certificates) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

### 5. registration_requests
| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | UUID | PK | Request ID |
| wallet_address | VARCHAR(42) | NOT NULL | Requester's wallet address |
| type | ENUM | NOT NULL | 'school' or 'student' |
| school_name | VARCHAR(255) | | School name (if type = school) |
| school_document | VARCHAR(255) | | IPFS hash of document (if type = school) |
| student_code | VARCHAR(50) | | Student code (if type = student) |
| school_id | UUID | FK → schools.id | School (if type = student) |
| status | ENUM | DEFAULT 'pending' | 'pending', 'approved', 'rejected' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | | Last update |

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_schools_wallet ON schools(wallet_address);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_wallet ON students(wallet_address);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_credentials_student ON credentials(student_id);
CREATE INDEX idx_credentials_school ON credentials(school_id);
CREATE INDEX idx_credentials_verify_code ON credentials(verify_code);
CREATE INDEX idx_credentials_status ON credentials(status);
CREATE INDEX idx_requests_wallet ON registration_requests(wallet_address);
CREATE INDEX idx_requests_status ON registration_requests(status);
```

## Status Flow

```
Credential:
pending → issued → confirmed
                    ↓
                  revoked

Auto-expired: (when expiry_date passes and status is confirmed/issued)

Registration Request:
pending → approved / rejected
```

## API Response Examples

### GET /schools
```json
{
  "data": [
    {
      "id": "school-001",
      "name": "Đại học Bách Khoa",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /students
```json
{
  "data": [
    {
      "id": "student-001",
      "schoolId": "school-001",
      "name": "Nguyễn Văn A",
      "email": "a.nguyenvan@example.com",
      "walletAddress": "0x1111111111111111111111111111111111111111",
      "studentCode": "SV001",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /credentials
```json
{
  "data": [
    {
      "id": "cred-001",
      "studentId": "student-001",
      "schoolId": "school-001",
      "name": "Cử nhân Công nghệ Thông tin",
      "description": "Hoàn thành chương trình đào tạo Cử nhân Công nghệ Thông tin",
      "classification": "Giỏi",
      "major": "Công nghệ phần mềm",
      "issuerName": "Trường Đại học Bách Khoa",
      "status": "confirmed",
      "verifyCode": "CRED-20240115-ABC123",
      "txHash": "0xabc123...",
      "tokenId": "1",
      "issuedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### GET /registration-requests
```json
{
  "data": [
    {
      "id": "req-001",
      "walletAddress": "0x9999999999999999999999999999999999999999",
      "type": "school",
      "schoolName": "Đại học FPT",
      "schoolDocument": "QmDoc123456789",
      "status": "pending",
      "createdAt": "2024-02-20T00:00:00Z"
    }
  ]
}
```
