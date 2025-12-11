# Error Handling & Logging Strategy (G16)

**Project:** DELTA - Diff Explanation & Linguistic Transformation Assistant
**Document Type:** Fehlerbehandlung und Protokollierung
**Version:** 2.0
**Last Updated:** 2025-12-11

## Executive Summary

This document details the error handling and logging strategy for DELTA, demonstrating compliance with **G16: Fehlerbehandlung und Protokollierung**.

---

## Error Handling Flow

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    
    B -->|Network Error| C[Retry Logic]
    B -->|Validation Error| D[400 Bad Request]
    B -->|Auth Error| E[401 Unauthorized]
    B -->|Not Found| F[404 Not Found]
    B -->|Server Error| G[500 Internal Server Error]
    
    C --> C1{Retry Count < 3?}
    C1 -->|Yes| C2[Exponential Backoff]
    C1 -->|No| G
    
    C2 --> H[Log & Retry]
    D --> I[Return Error Message]
    E --> J[Redirect to Login]
    F --> I
    G --> I
    
    I --> K[Display Toast to User]
    
    style G fill:#ef4444,color:#fff
    style D fill:#eab308,color:#000
    style K fill:#3b82f6,color:#fff
```

---

## HTTP Error Codes

| Code | Name | Usage | Frontend Action |
|------|------|-------|-----------------|
| 200 | OK | Success | Display result |
| 400 | Bad Request | Invalid input | Show error toast |
| 401 | Unauthorized | Auth required | Redirect to /login |
| 404 | Not Found | Resource missing | Show error toast |
| 500 | Internal Server Error | Server failure | Show generic error |

---

## Retry Strategy

```mermaid
graph LR
    A[API Call] --> B{Success?}
    B -->|Yes| C[Return Result]
    B -->|No| D{Retryable?}
    
    D -->|Yes| E{Attempt < 3?}
    D -->|No| F[Return Error]
    
    E -->|Yes| G[Wait 2^attempt seconds]
    E -->|No| F
    
    G --> A
    
    style C fill:#22c55e,color:#000
    style F fill:#ef4444,color:#fff
```

### Retry Implementation

```python
# backend/app/services/openai_service.py
async def generate_summary(...):
    for attempt in range(3):
        try:
            return await self._call_api(...)
        except OpenAIError as e:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** attempt)
```

---

## Logging Architecture

```mermaid
graph TD
    A[Application] --> B[Log Event]
    B --> C{Log Level}
    
    C -->|DEBUG| D[Development Only]
    C -->|INFO| E[General Info]
    C -->|WARNING| F[Potential Issues]
    C -->|ERROR| G[Errors]
    C -->|CRITICAL| H[System Failures]
    
    D --> I[Console Output]
    E --> I
    F --> I
    F --> J[File: delta.log]
    G --> I
    G --> J
    H --> I
    H --> J
    
    style H fill:#ef4444,color:#fff
    style G fill:#f97316,color:#fff
```

---

## Error Catalog

### Backend Errors

| Error Code | Type | Message | Resolution |
|------------|------|---------|------------|
| AUTH-001 | Unauthorized | "Could not validate credentials" | Re-login |
| AUTH-002 | Forbidden | "Access denied to resource" | Check permissions |
| GL-001 | GitLab API | "Merge request not found" | Verify URL |
| GL-002 | GitLab API | "GitLab API error" | Retry later |
| AI-001 | OpenAI | "Failed to generate summary" | Retry analysis |
| AI-002 | OpenAI | "Rate limit exceeded" | Wait & retry |
| DB-001 | Database | "Database error" | Contact admin |
| VAL-001 | Validation | "Invalid GitLab MR URL" | Check URL format |

### Frontend Errors

| Error Code | Component | Message | User Action |
|------------|-----------|---------|-------------|
| UI-001 | AnalysisPage | "Please enter a valid MR URL" | Fix URL |
| UI-002 | API Client | "Network error. Please try again" | Retry |
| UI-003 | Protected Route | "Please login to continue" | Login |

---

## Logging Examples

### Success Logging
```
[2025-12-09 14:23:45] [INFO] Analyzing MR: https://gitlab.com/group/proj/-/merge_requests/123
[2025-12-09 14:23:46] [INFO] Project: group/proj, MR: !123
[2025-12-09 14:23:47] [INFO] Current SHA: abc123def456
[2025-12-09 14:23:47] [INFO] Cache HIT! Returning cached summary
[2025-12-09 14:23:47] [INFO] Analysis complete! Scan ID: 1
```

### Error Logging
```
[2025-12-09 15:10:23] [ERROR] Failed to fetch MR group/proj!999: 404 Not Found
[2025-12-09 15:10:23] [ERROR] Merge request not found or you don't have access to it.
```

---

## User-Facing Error Messages

```mermaid
graph LR
    A[Error Occurs] --> B[Generic Message]
    B --> C["An error occurred.<br/>Please try again."]
    
    A --> D[Specific Message]
    D --> E["Invalid GitLab MR URL.<br/>Please check the format."]
    
    style C fill:#ef4444,color:#fff
    style E fill:#eab308,color:#000
```

### Toast Notification Examples

**Success:**
```
✅ Analysis complete!
```

**Error:**
```
❌ Failed to analyze MR. Please try again.
```

**Warning:**
```
⚠️ This MR has not been updated since last analysis.
```

---

## Error Handling Best Practices

1. **Never expose sensitive info** - Generic errors to users
2. **Log everything** - Detailed logs for debugging
3. **Retry transient errors** - Network, rate limits
4. **Fail fast on validation** - Don't retry bad input
5. **User-friendly messages** - Clear next steps

---

**End of Error Handling Documentation**
