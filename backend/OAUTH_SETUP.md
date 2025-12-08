# GitLab OAuth Setup Guide

This guide explains how to configure GitLab OAuth for DELTA.

## Step 1: Create GitLab OAuth Application

1. Log in to your GitLab instance
2. Go to **User Settings** → **Applications**
3. Click **Add new application**

### Application Settings:

- **Name:** DELTA - MR Summarizer
- **Redirect URI:** `http://localhost:8000/auth/callback`
- **Confidential:** ✓ (checked)
- **Scopes:** Select the following:
  - `api` - Full API access
  - `read_user` - Read user information
  - `read_repository` - Read repository data

4. Click **Save application**
5. Copy the **Application ID** (Client ID) and **Secret** (Client Secret)

## Step 2: Configure Backend Environment

Edit `backend/.env`:

```bash
# GitLab OAuth Configuration
GITLAB_URL=https://gitlab.your-instance.com  # Your GitLab instance URL
GITLAB_CLIENT_ID=your_application_id_here     # From Step 1
GITLAB_CLIENT_SECRET=your_secret_here         # From Step 1
GITLAB_REDIRECT_URI=http://localhost:8000/auth/callback
```

## Step 3: Generate Secret Key

Generate a secure secret key for JWT signing:

```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows (PowerShell):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Add to `backend/.env`:

```bash
SECRET_KEY=your_generated_secret_key_here
```

## OAuth Flow

### 1. Login (`GET /auth/login`)
- User clicks "Connect with GitLab"
- Redirects to GitLab authorization page
- State parameter included for CSRF protection

### 2. Callback (`GET /auth/callback`)
- GitLab redirects back with authorization code
- Backend validates state parameter
- Exchanges code for access token
- Fetches user info from GitLab
- Creates/updates user in database
- Creates JWT session token
- Sets HTTP-only cookie
- Redirects to frontend `/analysis`

### 3. Protected Routes
- Use `access_token` cookie for authentication
- JWT token contains GitLab user ID
- Token expires after 7 days (configurable)

### 4. Logout (`POST /auth/logout`)
- Clears session cookie
- User must re-authenticate

## API Endpoints

### Public Endpoints
- `GET /auth/login` - Start OAuth flow
- `GET /auth/callback` - OAuth callback handler
- `GET /auth/status` - Check auth status (no auth required)

### Protected Endpoints
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout current user

## Security Features

- **CSRF Protection:** State parameter validation
- **HTTP-Only Cookies:** Token not accessible via JavaScript
- **JWT Expiration:** Tokens expire after configured time
- **Secure Flag:** Set to `true` in production (HTTPS only)

## Testing OAuth Locally

1. Start backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start frontend:
   ```bash
   cd frontend
   pnpm dev
   ```

3. Navigate to `http://localhost:5173/login`
4. Click "Connect with GitLab"
5. Authorize the application
6. You should be redirected to `/analysis`

## Production Considerations

1. **HTTPS Required:** Set `secure=True` in cookie settings
2. **State Storage:** Replace in-memory dict with Redis
3. **Token Refresh:** Implement refresh token flow
4. **Rate Limiting:** Add rate limiting to OAuth endpoints
5. **Logging:** Add comprehensive logging for security events

## Troubleshooting

### "Invalid state parameter"
- Clear browser cookies
- Ensure you're using the same browser session
- Check that state isn't expired

### "Failed to exchange authorization code"
- Verify `GITLAB_CLIENT_ID` and `GITLAB_CLIENT_SECRET`
- Check redirect URI matches exactly
- Ensure GitLab instance is accessible

### "Could not validate credentials"
- Token may have expired
- Clear cookies and re-login
- Check `SECRET_KEY` is set correctly
