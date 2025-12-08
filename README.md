# DELTA - Diff Explanation & Linguistic Transformation Assistant

An intelligent GitLab Merge Request summarizer powered by Azure OpenAI (GPT-4). DELTA provides natural-language summaries of complex code changes with smart caching to minimize costs and latency.

## Overview

DELTA is a full-stack application that:
- Authenticates with GitLab via OAuth 2.0
- Fetches MR metadata, discussions, and diffs
- Generates AI-powered summaries using Azure OpenAI
- Caches results to avoid re-processing unchanged MRs
- Provides a sleek, dark-mode UI for analysis and history tracking

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
10. ✅ **UI/UX Polish** - Dark mode, toasts, animations
11. ✅ **Integration & Testing** - E2E testing
12. ✅ **Documentation** - Deployment guides

## Key Features

- **Smart Caching**: SHA-based cache invalidation prevents unnecessary re-processing
- **Intelligent Chunking**: Map-reduce strategy for large diffs that exceed token limits
- **Security**: HTTPOnly cookies, OAuth 2.0, encrypted tokens
- **Modern UI**: Dark mode, skeleton loaders, toast notifications
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

## Deployment

### Production Environment Setup

#### Backend Deployment

1. **Prepare environment variables** (`.env`):
   ```env
   # Production settings
   SECRET_KEY=<strong-random-secret>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080

   # GitLab
   GITLAB_URL=https://gitlab.com
   GITLAB_CLIENT_ID=<your-client-id>
   GITLAB_CLIENT_SECRET=<your-client-secret>
   GITLAB_REDIRECT_URI=https://your-domain.com/auth/callback

   # Azure OpenAI
   AZURE_OPENAI_API_KEY=<your-api-key>
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
   AZURE_OPENAI_API_VERSION=2024-02-01

   # CORS
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Update GitLab OAuth Application**:
   - Change redirect URI to production domain
   - Update CORS origins

3. **Deploy with Gunicorn** (recommended):
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   ```

4. **Nginx reverse proxy** (example):
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **Enable HTTPS**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.your-domain.com
   ```

#### Frontend Deployment

1. **Build production bundle**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy static files** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Update environment variables**:
   - Set `VITE_API_URL` to production backend URL
   - Rebuild after changing environment variables

4. **Enable HTTPS**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Docker Deployment (Optional)

**Backend Dockerfile**:
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

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
