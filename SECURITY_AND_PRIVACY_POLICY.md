# jobpostingmatch.com
# Security, Privacy & Data Handling Policy (Hard Rules)

Status: Mandatory. Must be followed by all code changes now and in the future.

This policy governs all handling of resumes, job descriptions, AI prompts, and derived data.
No exceptions without explicit owner approval.

1. Data Classification (Non-Negotiable)
The following are classified as Sensitive Personal Data (PII):
- Resume files (PDF, DOCX, DOC, TXT)
- Parsed resume text
- Job descriptions uploaded by users
- AI-generated analysis derived from resumes
- Optimized resumes

All code must treat this data as private and high-risk.

2. Storage Rules (Hard Constraints)
Allowed storage locations:
- Original resume files: Firebase Storage (encrypted at rest)
- Parsed resume text: Database (user-scoped)
- AI analysis output: Database (user-scoped)
- Generated PDFs/DOCX: Temporary server storage only

Explicitly forbidden:
- Storing resumes in public buckets
- Storing resumes or parsed text in logs
- Using original filenames
- Embedding PII in URLs or metadata
- Sharing resume data across users
- Reusing resume content for any purpose other than the owner’s analysis

3. Storage Structure (Required)
Firebase Storage path:
/resumes/{userId}/{resumeUUID}

Rules:
- resumeUUID must be generated server-side
- No PII in filenames or metadata
- Access scoped strictly to request.auth.uid

4. Access Control (Mandatory)
Every API endpoint dealing with resumes must:
- Require authentication
- Scope queries by user_id
- Verify ownership before read/write/delete

Forbidden pattern:
getResumeById(resumeId) // without user scope

Required pattern:
getResumeById(userId, resumeId) // with user scope

5. AI Usage Rules (Claude / Anthropic)
Allowed:
- Sending parsed resume text to AI for analysis
- Receiving structured feedback and recommendations

Forbidden:
- Using resume data to train models
- Storing AI prompts long-term
- Sending raw files or storage URLs to AI
- Reusing one user’s resume content for another user

Mandatory assumption:
- Resume data is never used for model training.

6. Logging Policy (Zero Tolerance)
Must never be logged:
- Resume content
- Parsed text
- Job descriptions
- AI prompts or responses
- Generated resume content

Allowed to log:
- User ID
- Resume ID
- Operation type (upload, analyze, delete)
- Timestamp

7. Data Deletion (Required)
When a user deletes a resume:
- Delete the Firebase file
- Delete parsed text
- Delete AI analysis
- Delete generated exports
- Invalidate signed URLs

Deletion must be permanent within a reasonable window.

Forbidden:
- Soft deletes without follow-up purge
- Hidden retention of resume data

8. Retention Policy (Default)
- Resume data is retained while the account is active
- Users can delete resumes at any time
- Account deletion removes all associated data
- Retention changes must be documented

9. Export Rules (PDF / DOCX)
- Generate exports on demand
- Serve immediately
- Delete temporary files after response
- Never reuse export files across users

10. UI & UX Trust Rules
Required UI copy (exact):
Your resume is private and never shared.

Forbidden UI patterns:
- Social proof using resume content
- Examples derived from real user resumes
- “Community insights” sourced from user data

11. Future Development Rule (Critical)
Any new feature must answer YES to all:
- Does this respect user data ownership?
- Can the user delete this data completely?
- Does this avoid cross-user exposure?
- Does this avoid logging sensitive content?

If any answer is NO, the feature must not ship.

12. Codex / Cursor Directive
All resume, job description, and AI-derived data must be treated as sensitive personal data.
Do not log, share, reuse, train on, or expose this data in any form.
Enforce strict user-based access control.
Follow the storage, deletion, and AI usage rules defined in SECURITY_AND_PRIVACY_POLICY.md.
When uncertain, default to NOT storing or NOT exposing the data.

Absolute red line:
Resume data belongs to the user, not the platform.
