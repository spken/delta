# DELTA - Diff Explanation & Linguistic Transformation Assistant

An intelligent GitLab Merge Request summarizer powered by Azure OpenAI (GPT-4). DELTA provides natural-language summaries of complex code changes with smart caching to minimize costs and latency.

## Overview

DELTA is a full-stack application that:
- Authenticates with GitLab via OAuth 2.0
- Fetches MR metadata, discussions, and diffs
- Generates AI-powered summaries using Azure OpenAI
- Caches results to avoid re-processing unchanged MRs
- Provides a sleek, modern UI with light theme for analysis and history tracking

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **GitLab Integration**: python-gitlab
- **AI**: Azure OpenAI (GPT-4)
- **Authentication**: OAuth 2.0 with JWT

### Frontend
- **Framework**: React 19 + Vite + TypeScript
- **UI**: shadcn/ui + TailwindCSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: Sonner

## Project Structure

```
delta/
├── backend/              # FastAPI server
│   ├── app/
│   │   ├── api/routes/  # API endpoints
│   │   ├── core/        # Config & database
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API client
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── .env.example
│
└── PRD.md              # Product Requirements Document
```

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run server
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env

# Run development server
pnpm dev
```

Frontend will be available at http://localhost:5173

## Configuration

### GitLab OAuth Application

1. Go to your GitLab instance: **Settings > Applications**
2. Create a new application:
   - Name: DELTA
   - Redirect URI: `http://localhost:8000/auth/callback`
   - Scopes: `api`, `read_user`, `read_repository`
3. Copy Client ID and Secret to backend `.env`

### Azure OpenAI

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a GPT-4 model (gpt-4-turbo recommended)
3. Copy endpoint, API key, and deployment name to backend `.env`

## Development Milestones

All 12 milestones have been completed:

1. ✅ **Foundation** - Project setup and structure
2. ✅ **Database & Models** - SQLite schema initialization
3. ✅ **Core API** - OAuth endpoints
4. ✅ **GitLab Integration** - MR fetching & smart cache
5. ✅ **Azure OpenAI** - Chunking & summarization
6. ✅ **Analysis Endpoint** - Complete backend logic
7. ✅ **Auth UI** - OAuth flow frontend
8. ✅ **Analysis Tab** - MR input & results display
9. ✅ **History Tab** - List & search interface
10. ✅ **UI/UX Polish** - Light theme with shadcn/ui, toasts
11. ✅ **Integration & Testing** - E2E testing
12. ✅ **Documentation** - Deployment guides

## Key Features

- **Smart Caching**: SHA-based cache invalidation prevents unnecessary re-processing
- **Intelligent Chunking**: Map-reduce strategy for large diffs that exceed token limits
- **Security**: HTTPOnly cookies, OAuth 2.0, encrypted tokens
- **Modern UI**: Light theme with shadcn/ui, skeleton loaders, toast notifications
- **Performance**: Sub-second metadata fetch, <15s AI generation

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide covering:
- Backend unit tests (Database, GitLab, OpenAI)
- Frontend build verification
- Integration testing procedures
- End-to-end testing scenarios
- Performance benchmarks
- Security testing checklist

Run backend tests:
```bash
cd backend
python test_database.py
python test_gitlab_integration.py
python test_openai_integration.py
```

## Deployment1

### Environment Variables

#### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key | Random 32-char string |
| `GITLAB_URL` | GitLab instance URL | `https://gitlab.com` |
| `GITLAB_CLIENT_ID` | OAuth client ID | From GitLab OAuth app |
| `GITLAB_CLIENT_SECRET` | OAuth client secret | From GitLab OAuth app |
| `GITLAB_REDIRECT_URI` | OAuth callback URL | `https://api.domain.com/auth/callback` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | From Azure portal |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | `https://resource.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment name | `gpt-4-turbo` |
| `FRONTEND_URL` | Frontend domain for CORS | `https://domain.com` |

#### Frontend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

### Production Checklist

- [ ] Update GitLab OAuth redirect URI to production domain
- [ ] Set strong `SECRET_KEY` in backend `.env`
- [ ] Configure HTTPS for both frontend and backend
- [ ] Set `secure=True` for cookies in production (backend)
- [ ] Update CORS origins to production frontend domain
- [ ] Configure proper error logging
- [ ] Set up database backups (SQLite file)
- [ ] Monitor Azure OpenAI API usage and costs
- [ ] Test full OAuth flow in production
- [ ] Verify cache persistence across server restarts
- [ ] Set up uptime monitoring
- [ ] Configure firewall rules

## Documentation

- **[Backend README](backend/README.md)** - Backend architecture and API details
- **[Frontend README](frontend/README.md)** - Frontend setup and component guide
- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](TESTING.md)** - Comprehensive testing procedures
- **[PRD](PRD.md)** - Product requirements and implementation details

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check all environment variables are set in `.env`
- Verify virtual environment is activated
- Ensure SQLite database has write permissions

**GitLab OAuth fails:**
- Verify redirect URI matches exactly (including protocol and trailing slash)
- Check OAuth application has correct scopes (`api`, `read_user`, `read_repository`)
- Ensure client ID and secret are correct

**Azure OpenAI errors:**
- Verify API key is valid
- Check deployment name matches exactly
- Ensure API version is supported
- Monitor rate limits and quotas

**Frontend can't connect to backend:**
- Check CORS configuration in backend
- Verify `VITE_API_URL` points to correct backend
- Ensure both frontend and backend use same protocol (HTTP vs HTTPS)

**Cache not working:**
- Check SQLite database file permissions
- Verify `delta.db` file exists in backend directory
- Check database initialization completed successfully

## Architecture Highlights

### Smart Caching System

DELTA uses SHA-based cache invalidation:
1. Fetches MR metadata to get current commit SHA
2. Compares SHA with cached scan
3. If SHA matches → returns cached summary (instant)
4. If SHA differs → generates new summary

### Map-Reduce for Large MRs

For MRs exceeding token limits:
1. **MAP Phase**: Summarize each file individually
2. **REDUCE Phase**: Combine file summaries into final output

This allows handling MRs with 500+ files without context overflow.

### Security Features

- **OAuth 2.0**: Standard authorization flow with state parameter
- **JWT Tokens**: Secure session management with 7-day expiry
- **HTTP-only Cookies**: Prevents XSS attacks
- **CSRF Protection**: State parameter validation
- **Input Validation**: Pydantic schemas on backend, client-side validation on frontend

## Performance

- **Cached MR**: < 1 second response time
- **Small MR** (< 10 files): 3-10 seconds
- **Large MR** (100+ files): 30-120 seconds
- **Frontend bundle**: < 500 KB total

## License

MIT

## Contributing

See [PRD.md](PRD.md) for detailed requirements and implementation checklist.

## Support

For issues, questions, or contributions, please open an issue on the repository.
