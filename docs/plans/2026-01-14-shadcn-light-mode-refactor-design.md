# Frontend Refactor: shadcn Components + Light Mode

**Date:** 2026-01-14
**Status:** Approved

## Goals

1. Replace custom UI elements with shadcn components for consistency and polish
2. Accelerate future development with ready-made component primitives
3. Reduce custom code by using battle-tested components
4. Switch to light-mode-only UI with zinc color scheme

## shadcn Components to Install

| Component | Purpose |
|-----------|---------|
| button | Primary actions (login, analyze, submit) |
| card | Content containers on Analysis and History pages |
| input | MR URL input, search fields |
| badge | Status indicators, metadata labels |
| skeleton | Loading states |
| alert | Error messages and warnings |
| sonner | Toast notifications (replacing existing sonner) |
| tabs | Page navigation (Analysis/History) |

Install via: `npx shadcn@latest add <component>`

## Page Designs

### Login Page

- Full viewport height, zinc-50 background
- Content vertically and horizontally centered
- **No card wrapper** - ultra-minimal for OAuth-only flow

**Elements (top to bottom):**
1. App name/logo
2. Optional tagline
3. "Continue with GitLab" button with GitLab icon

**States:**
- Loading: Button shows spinner during OAuth redirect
- Error: Alert component below button if OAuth fails

### Analysis Page

**Layout:**
- Navbar at top
- Tab navigation below navbar (Analysis | History)
- Max-width container, zinc-50 background

**Input Section (Card):**
- Heading: "Analyze Merge Request"
- Input for MR URL
- Submit button

**Results Section (Card, shown after analysis):**
- Badge components for metadata (MR status, file count)
- Markdown-rendered summary (react-markdown)
- Skeleton components while loading

**Error Handling:**
- Alert with destructive variant for API errors
- Sonner toast for transient notifications

### History Page

**Layout:**
- Same navbar and tab navigation as Analysis page
- Max-width container, zinc-50 background

**Search Section:**
- Input with search icon (no card wrapper)

**History List:**
- Card per history item containing:
  - MR title/URL as heading
  - Badge for scan status
  - Timestamp in muted text
  - Click to expand/navigate

**Empty State:**
- Centered message with muted text

**Loading State:**
- Stack of Skeleton cards

**Pagination:**
- Simple "Load more" or previous/next buttons

### Navbar

**Layout:**
- Sticky top position
- White background with zinc-200 bottom border
- Max-width container matching page content

**Left Side:**
- App name/logo (links to home)

**Right Side:**
- User display (username from GitLab)
- Logout button (ghost variant)

**Note:** Navigation links moved to in-page tabs, not navbar.

### Tab Navigation

- Rendered at top of main content on both Analysis and History pages
- Tabs: "Analysis" | "History"
- Active: zinc-900 text + underline
- Inactive: zinc-500 text
- URL-synced via React Router (`/analysis`, `/history`)

## Theming

### Light-Mode-Only Approach

Remove dark mode CSS entirely. Keep only light zinc values in `:root`.

### CSS Variable Updates (index.css)

| Variable | Value |
|----------|-------|
| background | zinc-50 |
| foreground | zinc-950 |
| card | white |
| card-foreground | zinc-950 |
| primary | zinc-900 |
| primary-foreground | zinc-50 |
| muted | zinc-100 |
| muted-foreground | zinc-500 |
| border | zinc-200 |
| input | zinc-200 |
| ring | zinc-400 |

### Code Changes

- **index.css:** Remove `.dark` selector block, update `:root` to light zinc
- **App.tsx:** Remove hardcoded `bg-zinc-950 text-white` classes
- **All pages:** Use semantic tokens (`bg-background`, `text-foreground`, etc.)

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/index.css` | Strip dark theme, update to light zinc values |
| `frontend/src/App.tsx` | Remove hardcoded dark classes |
| `frontend/src/pages/LoginPage.tsx` | Full rewrite - minimal centered layout |
| `frontend/src/pages/AnalysisPage.tsx` | Full rewrite with shadcn components |
| `frontend/src/pages/HistoryPage.tsx` | Full rewrite with shadcn components |
| `frontend/src/components/Navbar.tsx` | Simplify to logo + user/logout |

## New Files

| File | Purpose |
|------|---------|
| `frontend/src/components/ui/*` | shadcn component installs |
| `frontend/src/components/TabNav.tsx` | Shared tab navigation component |

## Implementation Order

1. Install shadcn components
2. Update index.css theming (light-mode-only zinc)
3. Update App.tsx (remove dark classes)
4. Create TabNav component
5. Refactor Navbar
6. Refactor LoginPage
7. Refactor AnalysisPage
8. Refactor HistoryPage
9. Remove old sonner, verify new Sonner works
10. Test all pages and flows
