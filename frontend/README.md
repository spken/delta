# DELTA Frontend

React frontend for DELTA (Diff Explanation & Linguistic Transformation Assistant) - an intelligent GitLab MR Summarizer powered by Azure OpenAI.

## Features

### Authentication
- GitLab OAuth 2.0 integration
- Protected routes with automatic redirects
- Session management with HTTP-only cookies
- User profile display in navbar

### Analysis Page
- GitLab MR URL input with validation
- Real-time AI-generated summaries
- Cache indicators (instant for cached results)
- Markdown-rendered summaries
- MR header display with external links

### History Page
- View all previously analyzed MRs
- Real-time search by title or URL
- Pagination controls (20 per page)
- Status indicators (up-to-date vs outdated)
- Relative timestamps

### UI/UX
- Dark mode with zinc color palette
- Professional gradient branding
- Toast notifications
- Loading states with animations
- Responsive design

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **TailwindCSS v4** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Sonner** - Toast notifications
- **React Markdown** - Markdown rendering
- **Lucide React** - Icon library

## Setup

### Prerequisites
- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file (optional):

```env
VITE_API_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`.

### Running the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── ProtectedRoute.tsx  # Auth guard wrapper
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication state
│   ├── pages/              # Route pages
│   │   ├── LoginPage.tsx   # OAuth login
│   │   ├── CallbackPage.tsx  # OAuth callback handler
│   │   ├── AnalysisPage.tsx  # MR analysis interface
│   │   └── HistoryPage.tsx   # Scan history list
│   ├── services/           # API clients
│   │   └── api.ts          # Axios-based API client
│   ├── types/              # TypeScript definitions
│   │   └── api.ts          # API request/response types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # TailwindCSS configuration
└── package.json            # Dependencies
```

## API Integration

The frontend communicates with the backend via the `apiClient` singleton:

```typescript
import { apiClient } from '@/services/api';

// Login (redirects to backend OAuth)
apiClient.login();

// Check auth status
const { authenticated, user } = await apiClient.getAuthStatus();

// Analyze MR
const result = await apiClient.analyzeMR({ url: mrUrl });

// Get history
const { scans, total } = await apiClient.getHistory({
  search: 'search term',
  limit: 20,
  offset: 0,
});

// Logout
await apiClient.logout();
```

## Routing

Routes are defined in `App.tsx`:
- `/` - Redirects to `/login`
- `/login` - Login page (public)
- `/callback` - OAuth callback (public)
- `/analysis` - MR analysis (protected)
- `/history` - Scan history (protected)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Styling Guide

### Color Palette

- Background: `bg-zinc-950`, `bg-zinc-900`
- Borders: `border-zinc-800`, `border-zinc-700`
- Text: `text-white`, `text-gray-400`
- Accent: `text-blue-400`, `bg-blue-600`
- Success: `text-green-400`
- Error: `text-red-400`

## License

MIT
