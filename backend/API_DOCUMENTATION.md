# DELTA API Documentation

Complete REST API documentation for the GitLab MR Summarizer backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Most endpoints require authentication via JWT token stored in HTTP-only cookie.

Cookie name: `access_token`

---

## Authentication Endpoints

### `GET /auth/login`

Initiates GitLab OAuth flow.

**Response:**
- Redirects to GitLab authorization page

**Example:**
```bash
curl http://localhost:8000/auth/login
```

---

### `GET /auth/callback`

OAuth callback handler (called by GitLab).

**Query Parameters:**
- `code` (string): Authorization code from GitLab
- `state` (string): CSRF protection state parameter

**Response:**
- Sets HTTP-only cookie with JWT token
- Redirects to frontend `/analysis` page

---

### `GET /auth/me`

Get current authenticated user profile.

**Authentication:** Required

**Response:**
```json
{
  "gitlab_user_id": "123456",
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/auth/me \
  --cookie "access_token=YOUR_JWT_TOKEN"
```

---

### `POST /auth/logout`

Logout current user.

**Authentication:** Required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### `GET /auth/status`

Check authentication status (no auth required).

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "gitlab_user_id": "123456",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

## Analysis Endpoints

### `POST /api/analyze`

Analyze a GitLab merge request and generate AI summary.

**Authentication:** Required

**Request Body:**
```json
{
  "url": "https://gitlab.com/group/project/-/merge_requests/123"
}
```

**Response:**
```json
{
  "mr_header": {
    "title": "Add user authentication feature",
    "author": "John Doe",
    "status": "opened",
    "url": "https://gitlab.com/group/project/-/merge_requests/123"
  },
  "summary_markdown": "## Context\n\nThis MR implements...\n\n## Key Changes\n...",
  "cached": false,
  "scanned_at": "2025-12-08T19:30:45.123456"
}
```

**Flow:**
1. Parse and validate MR URL
2. Fetch MR metadata from GitLab
3. Check cache (SHA comparison)
4. If cache HIT: Return cached summary (instant!)
5. If cache MISS:
   - Fetch complete MR data
   - Filter changes (remove lock files)
   - Generate AI summary
   - Store in database
   - Return new summary

**Error Responses:**

`400 Bad Request` - Invalid URL
```json
{
  "detail": "Invalid GitLab MR URL. Please provide a valid URL from the configured GitLab instance."
}
```

`404 Not Found` - MR not found
```json
{
  "detail": "Merge request not found or you don't have access to it."
}
```

`500 Internal Server Error` - GitLab or OpenAI failure
```json
{
  "detail": "Failed to generate summary. Please try again."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://gitlab.com/group/project/-/merge_requests/123"}' \
  --cookie "access_token=YOUR_JWT_TOKEN"
```

---

### `GET /api/history`

Get list of previously scanned MRs.

**Authentication:** Required

**Query Parameters:**
- `search` (string, optional): Search term for MR title or URL
- `limit` (integer, optional): Number of results (1-100, default: 50)
- `offset` (integer, optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "scans": [
    {
      "id": 1,
      "project_id": 12345,
      "mr_iid": 123,
      "mr_url": "https://gitlab.com/group/project/-/merge_requests/123",
      "title": "Add user authentication feature",
      "scanned_at": "2025-12-08T19:30:45.123456",
      "is_up_to_date": true
    }
  ],
  "total": 42
}
```

**Example:**
```bash
# Get all scans
curl -X GET http://localhost:8000/api/history \
  --cookie "access_token=YOUR_JWT_TOKEN"

# Search for specific MRs
curl -X GET "http://localhost:8000/api/history?search=authentication" \
  --cookie "access_token=YOUR_JWT_TOKEN"

# With pagination
curl -X GET "http://localhost:8000/api/history?limit=10&offset=20" \
  --cookie "access_token=YOUR_JWT_TOKEN"
```

---

### `GET /api/history/{scan_id}`

Get detailed information for a specific scan.

**Authentication:** Required

**Path Parameters:**
- `scan_id` (integer): Scan ID

**Response:**
```json
{
  "id": 1,
  "project_id": 12345,
  "mr_iid": 123,
  "mr_url": "https://gitlab.com/group/project/-/merge_requests/123",
  "title": "Add user authentication feature",
  "summary_markdown": "## Context\n\nThis MR...",
  "last_commit_sha": "abc123def456",
  "scanned_at": "2025-12-08T19:30:45.123456"
}
```

**Error Responses:**

`404 Not Found` - Scan not found
```json
{
  "detail": "Scan with ID 123 not found"
}
```

**Example:**
```bash
curl -X GET http://localhost:8000/api/history/1 \
  --cookie "access_token=YOUR_JWT_TOKEN"
```

---

## Health Check Endpoints

### `GET /`

Root health check.

**Response:**
```json
{
  "name": "DELTA - GitLab MR Summarizer",
  "version": "1.0.0",
  "status": "running"
}
```

---

### `GET /health`

Detailed health check.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "gitlab": "configured",
  "azure_openai": "configured"
}
```

---

## Interactive API Documentation

Once the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.

---

## Error Handling

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server-side failure)

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- Rate limiting per user
- Rate limiting per IP
- API key quotas

---

## Security Notes

1. **HTTPS:** Always use HTTPS in production
2. **CORS:** Configure allowed origins in `.env`
3. **Cookies:** HTTP-only, secure flag enabled in production
4. **JWT:** Tokens expire after 7 days (configurable)
5. **OAuth:** State parameter validates CSRF attacks

---

## Example Workflow

```bash
# 1. Login (browser)
open http://localhost:8000/auth/login

# 2. After OAuth callback, analyze an MR
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://gitlab.com/group/project/-/merge_requests/123"}' \
  --cookie "access_token=YOUR_JWT_TOKEN"

# 3. View history
curl -X GET http://localhost:8000/api/history \
  --cookie "access_token=YOUR_JWT_TOKEN"

# 4. Get specific scan details
curl -X GET http://localhost:8000/api/history/1 \
  --cookie "access_token=YOUR_JWT_TOKEN"

# 5. Logout
curl -X POST http://localhost:8000/auth/logout \
  --cookie "access_token=YOUR_JWT_TOKEN"
```
