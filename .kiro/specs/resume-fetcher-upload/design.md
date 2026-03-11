# Design Document: Resume Fetcher Upload

## Overview

This design document outlines the technical implementation for the resume-fetcher-upload feature, which enables users to upload resumes for external processing and analysis based on provided job descriptions.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Upload API    │────▶│  Resume Service  │────▶│  External API   │
│   (REST/GraphQL)│     │  (Core Logic)    │     │  (Processing)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  File Storage   │     │  Session Manager │     │  Result Cache   │
│  (Encrypted)    │     │  (Redis/DB)      │     │  (Redis/DB)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Components

### 1. Resume Upload Service

**File:** `src/services/resumeUploadService.ts`

```typescript
interface ResumeUploadService {
  uploadResume(file: File, jobDescriptionIds: string[]): Promise<UploadResult>;
  uploadMultipleResumes(files: File[], jobDescriptionIds: string[]): Promise<BatchUploadResult>;
  getResumeById(resumeId: string): Promise<UploadedResume | null>;
  getProcessingResult(resumeId: string): Promise<ProcessingResult | null>;
  cancelUpload(resumeId: string): Promise<void>;
}

interface UploadResult {
  resumeId: string;
  metadata: ResumeMetadata;
  status: UploadStatus;
  processingResult?: ProcessingResult;
}

interface ResumeMetadata {
  fileName: string;
  fileSize: number;
  format: ResumeFormat;
  uploadTimestamp: Date;
  jobDescriptionIds: string[];
}

type ResumeFormat = 'pdf' | 'doc' | 'docx' | 'txt';
type UploadStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

### 2. File Validator

**File:** `src/services/fileValidator.ts`

```typescript
interface FileValidator {
  validate(file: File): ValidationResult;
  isSupportedFormat(file: File): boolean;
  isWithinSizeLimit(file: File): boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  format?: ResumeFormat;
}
```

### 3. Text Extractor

**File:** `src/services/textExtractor.ts`

```typescript
interface TextExtractor {
  extractText(file: File): Promise<ExtractionResult>;
  extractWithFormatting(file: File): Promise<FormattedExtractionResult>;
}

interface ExtractionResult {
  text: string;
  format: ResumeFormat;
  charCount: number;
}

interface FormattedExtractionResult extends ExtractionResult {
  sections: ExtractedSection[];
  formattingInfo: FormattingInfo;
}

interface ExtractedSection {
  type: 'header' | 'experience' | 'education' | 'skills' | 'other';
  content: string;
  formatting: FormattingInfo;
}
```

### 4. External Service Client

**File:** `src/services/externalServiceClient.ts`

```typescript
interface ExternalServiceClient {
  submitForProcessing(resume: ProcessedResume, jobDescription: JobDescription): Promise<ProcessingResult>;
  submitBatch(resumes: ProcessedResume[], jobDescription: JobDescription): Promise<BatchProcessingResult>;
  getStatus(requestId: string): Promise<ProcessingStatus>;
}

interface ProcessedResume {
  id: string;
  text: string;
  formattedText?: FormattedExtractionResult;
  metadata: ResumeMetadata;
}

interface ProcessingResult {
  requestId: string;
  overallScore: number;
  matchedQualifications: MatchedQualification[];
  missingQualifications: string[];
  recommendations: string[];
  processingTimestamp: Date;
}
```

### 5. Session Manager

**File:** `src/services/sessionManager.ts`

```typescript
interface SessionManager {
  createSession(userId: string): Promise<UploadSession>;
  addResumeToSession(sessionId: string, resumeId: string): void;
  getSession(sessionId: string): Promise<UploadSession | null>;
  cancelSession(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}

interface UploadSession {
  sessionId: string;
  userId: string;
  resumeIds: string[];
  status: SessionStatus;
  createdAt: Date;
  expiresAt: Date;
}

type SessionStatus = 'active' | 'completed' | 'cancelled' | 'expired';
```

### 6. Encryption Service

**File:** `src/services/encryptionService.ts`

```typescript
interface EncryptionService {
  encrypt(file: Buffer, keyId: string): Promise<EncryptedFile>;
  decrypt(encryptedFile: EncryptedFile): Promise<Buffer>;
  rotateKey(oldKeyId: string, newKeyId: string): Promise<void>;
}

interface EncryptedFile {
  encryptedData: Buffer;
  keyId: string;
  iv: Buffer;
  authTag?: Buffer;
}
```

## API Design

### Upload Resume Endpoint

```
POST /api/v1/resumes/upload
Content-Type: multipart/form-data

Request:
{
  "files": File[],
  "jobDescriptionIds": string[]
}

Response (200):
{
  "uploadId": "uuid",
  "resumes": [
    {
      "resumeId": "uuid",
      "fileName": "resume.pdf",
      "status": "pending"
    }
  ],
  "sessionId": "uuid"
}
```

### Get Processing Result Endpoint

```
GET /api/v1/resumes/:resumeId/result

Response (200):
{
  "resumeId": "uuid",
  "status": "completed",
  "processingResult": {
    "overallScore": 85,
    "matchedQualifications": [...],
    "missingQualifications": [...],
    "recommendations": [...]
  }
}
```

### Batch Upload Endpoint

```
POST /api/v1/resumes/batch
Content-Type: multipart/form-data

Request:
{
  "files": File[],
  "jobDescriptionIds": string[]
}

Response (200):
{
  "batchId": "uuid",
  "totalResumes": 5,
  "completed": 2,
  "pending": 3,
  "results": [...]
}
```

## Data Models

### Database Schema (PostgreSQL)

```sql
CREATE TABLE uploaded_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_format VARCHAR(10) NOT NULL,
    encrypted_content BYTEA NOT NULL,
    encryption_key_id VARCHAR(100) NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processing_request_id VARCHAR(255),
    processing_result JSONB,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE resume_job_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES uploaded_resumes(id),
    job_description_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resume_id, job_description_id)
);

CREATE TABLE upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_resumes_user_id ON uploaded_resumes(user_id);
CREATE INDEX idx_resumes_status ON uploaded_resumes(status);
CREATE INDEX idx_resumes_expires_at ON uploaded_resumes(expires_at);
```

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| FILE_TOO_LARGE | File exceeds maximum size limit |
| UNSUPPORTED_FORMAT | File format not supported |
| NETWORK_ERROR | Upload failed due to network issue |
| FILE_CORRUPTED | File could not be read/processed |
| INVALID_JOB_DESCRIPTION | Job description missing required fields |
| NO_EXTRACTABLE_CONTENT | File contains no parseable text |
| EXTERNAL_SERVICE_UNAVAILABLE | Processing service temporarily unavailable |
| SESSION_EXPIRED | Upload session has expired |

### Retry Logic

```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2
};
```

## Security Considerations

1. **Encryption at Rest**: All uploaded files encrypted with AES-256-GCM
2. **TLS 1.2+**: All data transmission over HTTPS
3. **Rate Limiting**: 100 uploads per hour per user
4. **File Content Validation**: Magic byte verification for file types
5. **PII Masking**: Sensitive information masked in logs
6. **Retention Policy**: Configurable automatic deletion after processing

## Configuration

```typescript
interface ResumeUploadConfig {
  maxFileSize: number; // in bytes
  supportedFormats: ResumeFormat[];
  retentionPeriodDays: number;
  rateLimitPerHour: number;
  retryConfig: RetryConfig;
  encryption: {
    algorithm: string;
    keyRotationDays: number;
  };
}
```

## Correctness Properties

### Property 1: Upload Integrity
For any successfully uploaded resume, the system SHALL return a unique identifier that can be used to retrieve the exact same resume content.

### Property 2: Format Preservation
For any supported file format, the text extraction SHALL preserve the semantic structure of the original document.

### Property 3: Processing Consistency
For the same resume and job description, the external service SHALL return consistent processing results within a 24-hour period.

### Property 4: Session Expiration
All session data SHALL become inaccessible after the configured expiration period.

### Property 5: Error Determinism
For the same input error condition, the system SHALL return the same error code and message.