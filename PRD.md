# PRD: Intelligent GitLab MR Summarizer (DELTA - Diff Explanation & Linguistic Transformation Assistant )

## 1. Executive Summary
A local, browser-based tool that leverages Azure OpenAI (GPT-4) to generate intelligent, natural-language summaries of GitLab Merge Requests. It features a modern, "sleek" UI with historical tracking and smart caching to minimize costs and latency.

**Key Value Proposition:** Rapidly digest complex code changes without manually parsing hundreds of lines of diffs.

---

## 2. User Flow & Experience

### 2.1 The "Happy Path"
1.  **Authentication:** User opens the app. If not logged in, they see a "Connect with GitLab" button. They authorize via GitLab OAuth.
2.  **Input:** User lands on the **Analysis Tab**. They paste a GitLab Merge Request URL (e.g., `https://gitlab.custom.com/group/project/-/merge_requests/42`) and hit "Analyze".
3.  **Processing:**
    * The UI shows a beautiful skeleton loader/spinner state.
    * The backend checks the cache.
    * If the MR is new or updated, it fetches data from GitLab and sends it to Azure OpenAI.
4.  **Result:** The summary appears, broken down by "Context", "Key Changes", and "Risk Assessment".
5.  **History:** The user switches to the **History Tab** to see a list of previously scanned MRs. Clicking one instantly loads the cached result.

### 2.2 System Architecture


---

## 3. Functional Requirements

### 3.1 Frontend (Vite + React + TS + Tailwind + Shadcn)

**Authentication:**
* Implement GitLab OAuth 2.0 flow (Authorization Code with PKCE is preferred for security, or standard server-side exchange).
* Persist session/token securely (HTTPOnly cookies preferred, or local storage for MVP).

**Tab 1: Analysis (Main View)**
* **Input Field:** Large, centralized input with validation (must match GitLab URL pattern).
* **Action Button:** "Summarize Changes" (Button disabled if input is empty).
* **Loading State:** A skeleton UI that mimics the structure of the final report (Title block, text blocks) with a subtle pulse animation.
* **Output View:**
    * **MR Header:** Title, Author, Status (Open/Merged), and Link.
    * **AI Summary:** Rendered Markdown support (for bolding, lists, code blocks).

**Tab 2: History**
* **List View:** A card-based list of past scans.
* **Metadata:** Show MR Title, Repository Name, Date Scanned, and "Up to date" status.
* **Search/Filter:** Simple text search to find past MRs by title.

**UX/UI Details:**
* **Theme:** Light theme with zinc color palette.
* **Feedback:** Toast notifications with Sonner for errors (e.g., "MR not found", "Token expired").

### 3.2 Backend (FastAPI + Python + SQLite)

**API Endpoints:**
* `GET /auth/login`: Initiates OAuth flow.
* `GET /auth/callback`: Handles GitLab callback and token exchange.
* `POST /analyze`:
    * Input: `{ url: string }`
    * Logic: Check Cache -> Fetch GitLab Metadata -> Compare `updated_at` -> (Optionally) Generate Summary -> Update DB -> Return.
* `GET /history`: Returns list of scanned MRs (ordered by `created_at` desc).

**GitLab Integration:**
* Use `python-gitlab` library (or direct `httpx` calls ONLY IF THE LIBRARY DOESN'T INCLUDE THE FEATURE).
* Fetch: MR Details (Title, Desc), Notes (System notes excluded), and Diffs.

**The "Smart Cache" Logic:**
1.  Receive URL.
2.  Extract Project ID and MR IID.
3.  Query GitLab API for the MR's current `sha` (latest commit hash) and `updated_at` timestamp.
4.  Query SQLite: `SELECT sha FROM scans WHERE mr_iid = ?`.
5.  **Decision:**
    * If Record exists AND `db.sha` == `gitlab.sha`: Return Cached Summary.
    * If Record does not exist OR `db.sha` != `gitlab.sha`: Proceed to Summarization (Rescan).

### 3.3 AI Processing (Azure OpenAI)

**Model:** GPT-4 (Turbo or 4o recommended for window size).

**Chunking Strategy (Critical for "Diffs"):**
Since diffs can be massive, we cannot simply paste the whole string.
1.  **Preprocessing:** Ignore lock files (`package-lock.json`, `poetry.lock`) and binary files.
2.  **Token Estimation:** Count tokens of (Title + Desc + Clean Diffs).
3.  **Route:**
    * *Fits in Context:* Send single prompt.
    * *Exceeds Context:* Split diffs by file.
    * **Map Phase:** Summarize each file/chunk individually.
    * **Reduce Phase:** Send file summaries + Title/Desc to generate final summary.

**System Prompt (Draft):**
> "You are a senior technical lead. You will be provided with a GitLab Merge Request title, description, and code diffs. Produce a summary structured as: 1. **Context** (What is this for?), 2. **Key Changes** (Technical details), 3. **Potential Risks**. Be concise and technical."

---

## 4. Data Model (SQLite)

We need a simple relational schema.

**Table: `users`** (Local context)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | INTEGER PK | |
| `gitlab_user_id` | STRING | From GitLab |
| `access_token` | TEXT | Encrypted (optional if just local) |
| `refresh_token` | TEXT | |

**Table: `scans`**
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | INTEGER PK | |
| `project_id` | INTEGER | GitLab Project ID |
| `mr_iid` | INTEGER | GitLab MR Internal ID |
| `mr_url` | TEXT | |
| `title` | TEXT | Cached for display in history |
| `last_commit_sha`| TEXT | Used for cache invalidation |
| `summary_markdown`| TEXT | The AI output |
| `scanned_at` | DATETIME | |

---

## 5. Non-Functional Requirements

* **Performance:**
    * GitLab metadata fetch: < 1s.
    * AI Generation: < 15s (dependent on Azure latency).
    * UI Interaction: < 100ms.
* **Security:**
    * Store GitLab Tokens securely.
    * Ensure `.env` file containing Azure keys is not committed.
* **Tech Constraints:**
    * Python 3.10+
    * Node 18+

---

## 6. Implementation Checklist

**Phase 1: Foundation**
- [ ] Set up FastAPI repo with SQLite connection.
- [ ] Set up Vite + React repo with Shadcn/Tailwind.
- [ ] Configure GitLab OAuth Application (in your instance).
- [ ] Implement Login flow (Frontend <-> Backend <-> GitLab).

**Phase 2: Logic**
- [ ] Implement GitLab Data Fetcher (Title, Desc, Diffs).
- [ ] Implement "Smart Cache" logic (SHA comparison).
- [ ] Implement Azure OpenAI Client + Chunking algorithm.

**Phase 3: UI Polish**
- [ ] Build Analysis View (Input + Result display).
- [ ] Build History View.
- [ ] Add Loading Skeletons and Error Toasts.

