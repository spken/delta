# System Architecture Documentation

**Project:** DELTA - Diff Explanation & Linguistic Transformation Assistant
**Document Type:** Systemarchitektur
**Version:** 2.0
**Last Updated:** 2025-12-11

## Executive Summary

This document presents the complete system architecture for DELTA with comprehensive diagrams covering all layers from infrastructure to components.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser<br/>React 19 SPA]
    end

    subgraph "Application Layer"
        B[FastAPI Backend<br/>Python 3.10]
        C[Frontend Assets<br/>Vite Build]
    end

    subgraph "Business Logic"
        D[GitLab Service]
        E[OpenAI Service]
        F[Analysis Service]
        G[OAuth Service]
    end

    subgraph "Data Layer"
        H[SQLite Database]
        I[File System]
    end

    subgraph "External Services"
        J[GitLab API<br/>OAuth + MR Data]
        K[Azure OpenAI<br/>GPT-4 Turbo]
    end

    A -->|HTTPS| B
    A <-->|Static Assets| C
    B --> D
    B --> E
    B --> F
    B --> G
    D --> J
    E --> K
    F --> H
    G --> H
    H -.-> I

    style A fill:#3b82f6,color:#fff
    style B fill:#22c55e,color:#000
    style J fill:#fc6d26,color:#fff
    style K fill:#00a4ef,color:#fff
```

---

## Component Architecture

```mermaid
graph TD
    subgraph "Frontend Components"
        A[App.tsx] --> B[Router]
        B --> C[LoginPage]
        B --> D[ProtectedRoute]
        D --> E[AnalysisPage]
        D --> F[HistoryPage]
        E --> G[Navbar]
        E --> H[AnalysisForm]
        E --> I[ResultsDisplay]
        F --> G
        F --> J[SearchBar]
        F --> K[ScanCard]
    end

    subgraph "Backend Routes"
        L[main.py] --> M[auth routes]
        L --> N[analyze routes]
        L --> O[history routes]
    end

    subgraph "Services Layer"
        M --> P[oauth_service]
        N --> Q[mr_analysis_service]
        N --> R[gitlab_service]
        N --> S[openai_service]
        O --> T[scan_service]
    end

    subgraph "Data Models"
        P --> U[User Model]
        Q --> V[Scan Model]
        R --> V
        T --> V
        U --> W[SQLite DB]
        V --> W
    end

    style A fill:#61dafb,color:#000
    style L fill:#009688,color:#fff
```

---

## Data Flow Architecture

### Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as Backend API
    participant GL as GitLab Service
    participant AI as OpenAI Service
    participant DB as Database

    U->>UI: Enter MR URL
    UI->>API: POST /api/analyze
    API->>GL: Fetch MR metadata
    GL-->>API: SHA + basic info
    API->>DB: Check cache (SHA)

    alt Cache Hit
        DB-->>API: Return cached summary
        API-->>UI: Summary + cached=true
    else Cache Miss
        API->>GL: Fetch full MR data
        GL-->>API: Diffs, commits, notes
        API->>AI: Generate summary
        AI-->>API: AI summary
        API->>DB: Store summary + SHA
        DB-->>API: Scan ID
        API-->>UI: Summary + cached=false
    end

    UI-->>U: Display summary
```

---

## Security Architecture

```mermaid
graph TD
    subgraph "Security Layers"
        A[Browser] -->|HTTPS| B[CORS Middleware]
        B -->|Origin Check| C[Authentication]
        C -->|JWT Verify| D[Authorization]
        D -->|Permission Check| E[Business Logic]
    end

    subgraph "Token Flow"
        F[OAuth State] --> G[CSRF Protection]
        H[Access Token] --> I[HTTP-only Cookie]
        J[GitLab Token] --> K[Database Encrypted]
    end

    subgraph "Input Validation"
        L[URL Input] --> M[Pydantic Schema]
        M --> N[GitLab API Call]
    end

    style C fill:#22c55e,color:#000
    style G fill:#22c55e,color:#000
    style M fill:#22c55e,color:#000
```

---

## Database Schema

```mermaid
erDiagram
    USER ||--o{ SCAN : creates
    USER {
        int id PK
        string gitlab_user_id UK
        string access_token
        string refresh_token
        string username
        string email
        datetime created_at
    }
    SCAN {
        int id PK
        int project_id
        int mr_iid
        string mr_url
        string title
        string last_commit_sha
        text summary_markdown
        datetime scanned_at
    }
```

---

## Technology Stack

```mermaid
graph LR
    A[DELTA] --> B[Backend]
    A --> C[Frontend]
    A --> D[Infrastructure]

    B --> B1[FastAPI 0.115.6]
    B --> B2[SQLAlchemy 2.0]
    B --> B3[python-gitlab 5.2]
    B --> B4[Azure OpenAI SDK]

    C --> C1[React 19]
    C --> C2[TypeScript 5.9]
    C --> C3[Vite 7.2]
    C --> C4[TailwindCSS 4.1]
    C --> C5[shadcn/ui]

    D --> D1[SQLite 3]
    D --> D2[Uvicorn]
    D --> D3[Git]

    style A fill:#9333ea,color:#fff
    style B fill:#22c55e,color:#000
    style C fill:#3b82f6,color:#fff
```

---

**End of Architecture Documentation**
