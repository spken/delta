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

This project is being built in structured milestones:

1. ✓ **Foundation** - Project setup and structure
2. **Database & Models** - SQLite schema initialization
3. **Core API** - OAuth endpoints
4. **GitLab Integration** - MR fetching & smart cache
5. **Azure OpenAI** - Chunking & summarization
6. **Analysis Endpoint** - Complete backend logic
7. **Auth UI** - OAuth flow frontend
8. **Analysis Tab** - MR input & results display
9. **History Tab** - List & search interface
10. **UI/UX Polish** - Dark mode, toasts, animations
11. **Integration & Testing** - E2E testing
12. **Documentation** - Deployment guides

## Key Features

- **Smart Caching**: SHA-based cache invalidation prevents unnecessary re-processing
- **Intelligent Chunking**: Map-reduce strategy for large diffs that exceed token limits
- **Security**: HTTPOnly cookies, OAuth 2.0, encrypted tokens
- **Modern UI**: Dark mode, skeleton loaders, toast notifications
- **Performance**: Sub-second metadata fetch, <15s AI generation

## License

MIT

## Contributing

See PRD.md for detailed requirements and implementation checklist.
