# Implementation Plan: Resume Fetcher Upload

## Overview

This implementation plan converts the resume-fetcher-upload feature design into discrete coding tasks. The feature enables users to upload resumes for external processing and analysis based on provided job descriptions. Tasks are organized to build incrementally, with each step validating core functionality before proceeding.

## Tasks

- [x] 1. Set up project structure and core types
  - Create directory structure for resume upload feature
  - Define TypeScript interfaces for ResumeUploadService, UploadResult, ResumeMetadata, ResumeFormat, UploadStatus
  - Set up configuration interface ResumeUploadConfig
  - Set up testing framework (Jest + Supertest)
  - _Requirements: 1.1, 1.4, 1.5_

- [ ] 2. Implement file validation service
  - [x] 2.1 Create FileValidator class with validate, isSupportedFormat, isWithinSizeLimit methods
    - Implement magic byte validation for file type verification
    - Add support for pdf, doc, docx, txt formats
    - Set max file size limit (configurable)
    - _Requirements: 1.1, 1.2, 1.3, 6.4_

  - [ ]* 2.2 Write property test for file validation
    - **Property 5: Error Determinism**
    - **Validates: Requirements 6.1-6.4**
    - Test that same invalid input returns same error code and message

  - [ ]* 2.3 Write unit tests for file validation
    - Test supported formats validation
    - Test file size limit enforcement
    - Test unsupported format rejection
    - _Requirements: 1.1, 1.2, 1.3_

- [-] 3. Implement text extraction service
  - [x] 3.1 Create TextExtractor class with extractText and extractWithFormatting methods
    - Implement PDF text extraction using pdf-parse or similar
    - Implement DOC/DOCX text extraction using mammoth or similar
    - Implement plain text handling
    - Extract section information (header, experience, education, skills)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 3.2 Write property test for text extraction
    - **Property 2: Format Preservation**
    - **Validates: Requirements 5.4, 5.5**
    - Test that extracted text maintains semantic structure

  - [ ]* 3.3 Write unit tests for text extraction
    - Test PDF extraction accuracy
    - Test DOCX extraction accuracy
    - Test plain text handling
    - Test section extraction
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [-] 4. Implement encryption service
  - [x] 4.1 Create EncryptionService class with encrypt, decrypt, rotateKey methods
    - Implement AES-256-GCM encryption
    - Handle key management and rotation
    - _Requirements: 8.1, 8.5_

  - [ ]* 4.2 Write unit tests for encryption service
    - Test encryption/decryption round-trip
    - Test key rotation functionality
    - _Requirements: 8.1_

- [-] 5. Implement session manager
  - [x] 5.1 Create SessionManager class with createSession, addResumeToSession, getSession, cancelSession, cleanupExpiredSessions methods
    - Implement session expiration (24 hours default)
    - Track session status (active, completed, cancelled, expired)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 5.2 Write unit tests for session manager
    - Test session creation and expiration
    - Test session cancellation
    - Test cleanup of expired sessions
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ]* 5.3 Write property test for session manager
    - **Property 4: Session Expiration**
    - **Validates: Requirements 7.4**
    - Test that expired sessions are inaccessible

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 7. Implement external service client
  - [x] 7.1 Create ExternalServiceClient class with submitForProcessing, submitBatch, getStatus methods
    - Implement HTTP client for external API communication
    - Handle authentication with external service
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 7.2 Implement retry logic with exponential backoff
    - Configure max attempts, initial delay, max delay, backoff multiplier
    - Handle transient failures gracefully
    - _Requirements: 3.4, 3.5_

  - [ ]* 7.3 Write unit tests for external service client
    - Test successful processing request
    - Test retry logic behavior
    - Test batch submission
    - _Requirements: 3.4, 3.5_

  - [ ]* 7.4 Write property test for external service client
    - **Property 3: Processing Consistency**
    - **Validates: Requirements 3.3**
    - Test that same inputs produce consistent results

- [-] 8. Implement resume upload service core
  - [x] 8.1 Create ResumeUploadService class with uploadResume, uploadMultipleResumes, getResumeById, getProcessingResult, cancelUpload methods
    - Implement single resume upload flow
    - Implement batch upload flow
    - Integrate file validation, text extraction, encryption
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3_

  - [x] 8.2 Implement job description association logic
    - Support multiple resumes per job description
    - Support multiple job descriptions per resume
    - Implement re-processing on job description update
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 8.3 Implement error handling and logging
    - Implement error codes (FILE_TOO_LARGE, UNSUPPORTED_FORMAT, NETWORK_ERROR, etc.)
    - Mask PII in logs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 8.4 Write unit tests for resume upload service
    - Test single upload flow
    - Test batch upload flow
    - Test job description association
    - Test error handling
    - _Requirements: 1.1-1.5, 2.1-2.4, 6.1-6.5_

  - [ ]* 8.5 Write property test for resume upload service
    - **Property 1: Upload Integrity**
    - **Validates: Requirements 1.5**
    - Test that uploaded resume returns unique ID for retrieval

- [x] 9. Implement API endpoints
  - [x] 9.1 Create upload endpoint (POST /api/v1/resumes/upload)
    - Handle multipart/form-data upload
    - Validate request parameters
    - Return upload result with resume IDs and session ID
    - _Requirements: 1.1, 1.5, 7.1, 7.2_

  - [x] 9.2 Create processing result endpoint (GET /api/v1/resumes/:resumeId/result)
    - Return processing result with match scores, qualifications, recommendations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 9.3 Create batch upload endpoint (POST /api/v1/resumes/batch)
    - Handle multiple file uploads
    - Return batch status with individual results
    - _Requirements: 7.1, 7.2_

  - [x] 9.4 Create cancel endpoint (DELETE /api/v1/resumes/:resumeId)
    - Cancel pending upload requests
    - _Requirements: 7.5_

  - [ ]* 9.5 Write integration tests for API endpoints
    - Test full upload flow through API
    - Test error responses
    - Test rate limiting
    - _Requirements: 1.1-1.5, 6.1-6.5, 8.3_

- [x] 10. Implement database layer
  - [x] 10.1 Create database schema for uploaded_resumes table
    - UUID primary key, user_id, file metadata, encrypted content, status
    - Add indexes for user_id, status, expires_at
    - _Requirements: 1.4, 8.1_

  - [x] 10.2 Create database schema for resume_job_associations table
    - Link resumes to job descriptions
    - Composite unique constraint
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 10.3 Create database schema for upload_sessions table
    - Session tracking with expiration
    - _Requirements: 7.3, 7.4_

  - [ ]* 10.4 Write database integration tests
    - Test CRUD operations for resumes
    - Test session management
    - Test association queries
    - _Requirements: 1.4, 2.1-2.3, 7.3, 7.4_

- [x] 11. Implement rate limiting and security middleware
  - [x] 11.1 Add rate limiting middleware (100 uploads/hour per user)
    - Track upload counts per user
    - Return 429 Too Many Requests when limit exceeded
    - _Requirements: 8.3_

  - [x] 11.2 Add TLS verification and secure headers
    - Ensure HTTPS only
    - Add security headers (HSTS, X-Content-Type-Options)
    - _Requirements: 8.2_

  - [ ]* 11.3 Write tests for security middleware
    - Test rate limiting enforcement
    - Test security headers presence
    - _Requirements: 8.2, 8.3_

- [x] 12. Implement retention policy cleanup
  - [x] 12.1 Create scheduled job for expired resume cleanup
    - Delete expired resumes and associated data
    - Log cleanup actions
    - _Requirements: 8.5_

  - [ ]* 12.2 Write tests for retention policy
    - Test automatic deletion of expired resumes
    - _Requirements: 8.5_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All code should follow TypeScript best practices and include JSDoc comments