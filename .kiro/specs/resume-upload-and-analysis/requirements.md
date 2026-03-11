# Requirements Document: Resume Upload and Analysis

## Derived Requirements from Design

### R1. Resume Upload Functionality

**Priority**: Critical

**Description**: Fix the resume upload functionality to ensure resumes are properly parsed and stored after upload.

**Source**: Design Section - ResumeUpload Component, ResumeParser

**Acceptance Criteria**:
1. User can upload PDF or DOCX files up to 5MB
2. File type validation occurs on both frontend and backend
3. Upload progress is displayed during processing
4. Parsed data is stored in the Candidate model
5. Error messages are displayed for invalid files
6. Upload completes within 15 seconds for 5MB files

**Test Cases**:
- R1.T1: Upload valid PDF resume
- R1.T2: Upload valid DOCX resume
- R1.T3: Reject invalid file type (e.g., TXT)
- R1.T4: Reject file larger than 5MB
- R1.T5: Handle upload timeout gracefully
- R1.T6: Display upload progress correctly

**Dependencies**: R2, R3

---

### R2. Multi-Language Support for Interviews

**Priority**: High

**Description**: Add Japanese language support for interviews, including speech recognition and voice synthesis.

**Source**: Design Section - InterviewLanguageManager, Japanese Language Support Algorithm

**Acceptance Criteria**:
1. User can select Japanese (ja-JP) as interview language
2. Speech recognition works with Japanese language
3. Voice synthesis produces Japanese audio
4. UI elements are localized to Japanese
5. AI interview prompts are in Japanese
6. Fallback to English if Japanese voice unavailable

**Test Cases**:
- R2.T1: Select Japanese language in interview settings
- R2.T2: Verify speech recognition works with Japanese
- R2.T3: Verify voice synthesis produces Japanese audio
- R2.T4: Verify UI localization to Japanese
- R2.T5: Verify AI prompts are in Japanese
- R2.T6: Fallback to English when Japanese voice unavailable

**Dependencies**: R1, R3

---

### R3. Resume-JD Matching Section

**Priority**: Critical

**Description**: Create a dedicated section for resume-JD matching with comprehensive analysis.

**Source**: Design Section - ResumeJdMatcher, ResumeJdMatchingSection

**Acceptance Criteria**:
1. Match score is calculated for candidate-job pairs
2. Skill matching breakdown is displayed
3. Experience alignment is shown
4. Cultural fit analysis is provided
5. Recommendations are generated
6. Concerns are identified
7. Match method (vector/keyword/hybrid) is displayed

**Test Cases**:
- R3.T1: Calculate match score for valid candidate-job pair
- R3.T2: Display skill matching breakdown
- R3.T3: Show experience alignment
- R3.T4: Provide cultural fit analysis
- R3.T5: Generate actionable recommendations
- R3.T6: Identify concerns for candidate
- R3.T7: Display match method correctly

**Dependencies**: R1

---

### R4. Pattern Analysis

**Priority**: High

**Description**: Ensure pattern analysis is performed on uploaded resumes with all 12 metrics.

**Source**: Design Section - Pattern Scores, Algorithmic Pseudocode

**Acceptance Criteria**:
1. All 12 pattern scores are calculated (0-100)
2. Technical aptitude score is calculated
3. Leadership potential score is calculated
4. Cultural alignment score is calculated
5. Creativity score is calculated
6. Confidence score is calculated
7. Communication skill score is calculated
8. Problem-solving ability score is calculated
9. Adaptability score is calculated
10. Domain expertise score is calculated
11. Teamwork orientation score is calculated
12. Self-awareness score is calculated
13. Growth mindset score is calculated

**Test Cases**:
- R4.T1: Calculate all 12 pattern scores
- R4.T2: Verify score bounds (0-100)
- R4.T3: Handle missing data gracefully
- R4.T4: Store patterns in Candidate model

**Dependencies**: R1

---

### R5. Data Persistence

**Priority**: Critical

**Description**: Ensure parsed resume data and match results are properly stored in the database.

**Source**: Design Section - Data Models

**Acceptance Criteria**:
1. Parsed resume data is stored in Candidate model
2. Embedding vector is stored (may be empty)
3. Pattern scores are stored in Candidate model
4. Match results are stored in Application model
5. Data is organization-scoped
6. Data is user-scoped for creation tracking

**Test Cases**:
- R5.T1: Store parsed resume data
- R5.T2: Store embedding vector
- R5.T3: Store pattern scores
- R5.T4: Store match results
- R5.T5: Verify organization scoping
- R5.T6: Verify user scoping

**Dependencies**: R1, R3

---

### R6. Error Handling

**Priority**: High

**Description**: Implement comprehensive error handling for all operations.

**Source**: Design Section - Error Handling

**Acceptance Criteria**:
1. Invalid file type error is displayed
2. File size exceeded error is displayed
3. Text extraction failure error is displayed
4. Japanese voice not found error is displayed
5. Matching service unavailable warning is displayed
6. Network errors are handled gracefully
7. User-friendly error messages are shown

**Test Cases**:
- R6.T1: Display invalid file type error
- R6.T2: Display file size exceeded error
- R6.T3: Display text extraction failure error
- R6.T4: Display Japanese voice not found error
- R6.T5: Display matching service unavailable warning
- R6.T6: Handle network errors gracefully
- R6.T7: Show user-friendly error messages

**Dependencies**: R1, R2, R3

---

### R7. Performance

**Priority**: Medium

**Description**: Ensure operations complete within acceptable timeframes.

**Source**: Design Section - Performance Considerations

**Acceptance Criteria**:
1. Resume upload completes in < 5 seconds for 5MB file
2. Resume parsing completes in < 10 seconds
3. Match calculation completes in < 2 seconds
4. Japanese voice setup completes in < 1 second
5. UI remains responsive during operations
6. Loading indicators are displayed for long operations

**Test Cases**:
- R7.T1: Upload 5MB file in < 5 seconds
- R7.T2: Parse resume in < 10 seconds
- R7.T3: Calculate match in < 2 seconds
- R7.T4: Setup Japanese voice in < 1 second
- R7.T5: UI remains responsive
- R7.T6: Loading indicators display correctly

**Dependencies**: R1, R2, R3

---

### R8. Security

**Priority**: Critical

**Description**: Ensure all operations are secure and data is protected.

**Source**: Design Section - Security Considerations

**Acceptance Criteria**:
1. File type validation on frontend and backend
2. File size limits enforced
3. AI service API keys are protected
4. User data is organization-scoped
5. Authentication is required for all operations
6. CORS is properly configured
7. Rate limiting is implemented

**Test Cases**:
- R8.T1: Validate file types on both frontend and backend
- R8.T2: Enforce file size limits
- R8.T3: Protect AI service API keys
- R8.T4: Verify organization scoping
- R8.T5: Require authentication
- R8.T6: Verify CORS configuration
- R8.T7: Implement rate limiting

**Dependencies**: R1, R2, R3

---

## Requirements Traceability Matrix

| ID | Requirement | Priority | Source | Test Coverage |
|----|-------------|----------|--------|---------------|
| R1 | Resume Upload Functionality | Critical | Design: ResumeUpload, ResumeParser | R1.T1-R1.T6 |
| R2 | Multi-Language Support | High | Design: InterviewLanguageManager | R2.T1-R2.T6 |
| R3 | Resume-JD Matching Section | Critical | Design: ResumeJdMatcher | R3.T1-R3.T7 |
| R4 | Pattern Analysis | High | Design: Pattern Scores | R4.T1-R4.T4 |
| R5 | Data Persistence | Critical | Design: Data Models | R5.T1-R5.T6 |
| R6 | Error Handling | High | Design: Error Handling | R6.T1-R6.T7 |
| R7 | Performance | Medium | Design: Performance | R7.T1-R7.T6 |
| R8 | Security | Critical | Design: Security | R8.T1-R8.T7 |

---

## Non-Functional Requirements

### NFR1. Usability

- Resume upload interface is intuitive
- Error messages are clear and actionable
- Progress indicators are visible
- Language selection is straightforward
- Match results are easy to understand

### NFR2. Maintainability

- Code is modular and well-documented
- Tests cover all requirements
- Error handling is comprehensive
- Configuration is externalized

### NFR3. Scalability

- System handles 100+ concurrent uploads
- AI service calls are cached where possible
- Database queries are optimized
- Frontend components are memoized

### NFR4. Reliability

- Resume parsing succeeds 95% of the time
- Match calculation completes 99% of the time
- Error recovery is automatic where possible
- Data is backed up regularly

---

## Assumptions

1. AI service (OpenRouter) is available and configured
2. Japanese language pack is installed for voice synthesis
3. Users have valid authentication tokens
4. Organization-scoped data isolation is in place
5. Database connections are stable

---

## Constraints

1. File size limited to 5MB
2. Resume parsing time depends on AI service response
3. Japanese voice availability depends on browser installation
4. Match calculation uses existing embedding infrastructure
5. All operations must respect organization scoping