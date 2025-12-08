# DELTA Frontend - React + Vite + TypeScript

Frontend application for the GitLab MR Summarizer (DELTA).

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui (New York style, Zinc theme)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Icons**: Lucide React

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

3. Run development server:
```bash
pnpm dev
```

The app will be available at http://localhost:5173

## Project Structure

```
frontend/src/
├── components/
│   ├── ui/            # shadcn/ui components
│   └── layout/        # Layout components
├── pages/             # Page components
│   ├── LoginPage.tsx
│   ├── AnalysisPage.tsx
│   └── HistoryPage.tsx
├── services/          # API client and services
│   └── api.ts
├── types/             # TypeScript type definitions
│   └── api.ts
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── lib/               # Library configurations
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add tabs
# etc.
```
