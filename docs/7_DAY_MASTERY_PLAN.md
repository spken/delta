# 7-Day DELTA Codebase Mastery Plan

**Goal**: Achieve complete fluency in the DELTA codebase - understanding every component, architectural decision, and code pattern within one week.

---

## Day 1: Foundation & Mental Models (3-4 hours)

### Morning: Big Picture Understanding
1. **Read these docs in order** (90 min):
   - `README.md` - Overview & setup
   - `ARCHITECTURE.md` - System design diagrams
   - `PRD.md` - Product vision & requirements
   - `backend/API_DOCUMENTATION.md` - API contracts

2. **Draw the architecture** (45 min):
   - On paper/whiteboard, sketch:
     - User → Frontend → Backend → GitLab flow
     - User → Frontend → Backend → Azure OpenAI flow
     - OAuth flow with all redirects
     - Database schema (users, scans)
   - This forces active processing vs passive reading

### Afternoon: Environment Setup & First Run
3. **Get everything running** (90 min):
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/Scripts/activate  # or venv/Scripts/activate on Windows
   pip install -r requirements.txt
   # Configure .env (use .env.example)
   uvicorn app.main:app --reload

   # Frontend (new terminal)
   cd frontend
   pnpm install
   pnpm dev
   ```

4. **Make your first API call** (30 min):
   - Open browser DevTools Network tab
   - Click through the app: login → analyze → history
   - Watch request/response for each action
   - Match what you see to the API docs

**Day 1 Checkpoint**: Can you explain the entire OAuth flow from memory? Can you trace a single MR analysis request through all layers?

---

## Day 2: Backend Deep Dive (4-5 hours)

### Morning: Core Infrastructure
1. **Read in this exact order** (2 hours):
   - `backend/app/main.py` - App initialization
   - `backend/app/core/config.py` - Configuration pattern
   - `backend/app/core/database.py` - SQLAlchemy setup
   - `backend/app/models/user.py` - User model
   - `backend/app/models/scan.py` - Scan model
   - `backend/app/core/security.py` - JWT implementation

2. **Answer these questions** (write answers):
   - Why is `get_db()` a generator function?
   - What's the purpose of the `lifespan` context manager in `main.py`?
   - How does the app ensure database tables exist on startup?
   - What fields are indexed in the `scans` table and why?

### Afternoon: Request Flow Tracing
3. **Trace one complete request** (2 hours):
   - Pick: `POST /api/analyze`
   - Open these files side-by-side:
     - `backend/app/api/routes/analyze.py:analyze_mr`
     - `backend/app/services/mr_analysis_service.py:analyze_mr`
     - `backend/app/services/gitlab_service.py:fetch_mr_details`
     - `backend/app/services/openai_service.py:generate_mr_summary`
     - `backend/app/services/scan_service.py:create_scan`

4. **Create a call graph**:
   ```
   analyze_mr (route)
     ↓
   mr_analysis_service.analyze_mr
     ↓ (checks cache)
   scan_service.get_scan_by_mr
     ↓ (if cache miss)
   gitlab_service.fetch_mr_details
   gitlab_service.fetch_mr_changes
     ↓
   openai_service.generate_mr_summary
     ↓ (map-reduce if large)
   openai_service._generate_summary_chunked
     ↓
   scan_service.create_scan
   ```

5. **Debugging exercise**:
   - Add print statements at each service method entry
   - Make a real MR analysis request
   - Watch the console output flow
   - Remove prints when done

**Day 2 Checkpoint**: Can you explain why the caching strategy uses `last_commit_sha` instead of timestamp? What happens if the OpenAI API fails halfway through?

---

## Day 3: AI & GitLab Integration (4-5 hours)

### Morning: GitLab Service
1. **Read deeply** (90 min):
   - `backend/app/services/gitlab_service.py` - All methods
   - `backend/OAUTH_SETUP.md` - OAuth configuration
   - `backend/app/services/oauth_service.py` - OAuth flow
   - `backend/app/api/routes/auth.py` - Auth endpoints

2. **Hands-on exercise**:
   - Run `backend/test_gitlab_integration.py`
   - Read the test code before running
   - Watch what data comes back from GitLab API
   - Try modifying the test to fetch different MR fields

3. **Critical understanding**:
   - Why store both `access_token` AND `refresh_token`?
   - What's the `state` parameter protecting against?
   - How does the app know which GitLab instance to use?

### Afternoon: OpenAI Service
4. **Study the AI logic** (2 hours):
   - `backend/app/services/openai_service.py` - Complete file
   - `backend/app/core/token_counter.py` - Token estimation
   - Focus on `_should_use_chunked_summary()` logic
   - Understand the map-reduce pattern in `_generate_summary_chunked()`

5. **Run the OpenAI test**:
   ```bash
   python backend/test_openai_integration.py
   ```
   - Watch token counts in output
   - See the difference between direct vs chunked summaries

6. **Experiment**:
   - In `openai_service.py`, find `MAX_SAFE_INPUT_TOKENS = 100000`
   - Lower it temporarily to `10000`
   - Analyze a large MR and watch it switch to map-reduce
   - Revert the change

**Day 3 Checkpoint**: Can you explain when and why the system switches to map-reduce? What files are excluded from analysis and why?

---

## Day 4: Frontend Architecture (4-5 hours)

### Morning: React Structure
1. **Read in order** (2 hours):
   - `frontend/src/main.tsx` - Entry point
   - `frontend/src/App.tsx` - Routing setup
   - `frontend/src/contexts/AuthContext.tsx` - Global state
   - `frontend/src/components/ProtectedRoute.tsx` - Auth guard
   - `frontend/src/services/api.ts` - HTTP client

2. **Trace authentication flow**:
   - Follow code from:
     - `LoginPage.tsx` → GitLab OAuth
     - `CallbackPage.tsx` → token exchange
     - `AuthContext.tsx` → user state update
     - `ProtectedRoute.tsx` → route protection

3. **Answer**:
   - Why use `createContext` instead of prop drilling?
   - How does `api.ts` automatically include credentials?
   - What happens if the user's JWT expires?

### Afternoon: Pages Deep Dive
4. **Read each page** (2 hours):
   - `frontend/src/pages/LoginPage.tsx` - Ultra-minimal design
   - `frontend/src/pages/AnalysisPage.tsx` - Main feature
   - `frontend/src/pages/HistoryPage.tsx` - Search & pagination

5. **UI component study**:
   - Open `frontend/src/components/ui/`
   - Read 2-3 shadcn components (button, card, input)
   - Understand the `cn()` utility in `lib/utils.ts`

6. **Hands-on**:
   - In `AnalysisPage.tsx`, find the `handleSubmit` function
   - Add a `console.log` before the API call
   - Make a request and watch DevTools Console + Network tab
   - Remove the log

**Day 4 Checkpoint**: Can you explain the entire flow from clicking "Analyze MR" to displaying the summary? Where are error messages shown?

---

## Day 5: Cross-Cutting Concerns (3-4 hours)

### Morning: Error Handling
1. **Study error patterns** (90 min):
   - Read `ERROR_HANDLING.md`
   - Search codebase for `raise HTTPException`
   - Search frontend for `toast.error`
   - Trace how backend errors become user-facing toasts

2. **Exercise**:
   - Backend: `backend/app/api/routes/analyze.py:analyze_mr`
   - Find all error cases (invalid URL, GitLab auth fail, etc.)
   - For each, trace to the frontend toast

### Afternoon: Data Flow
3. **Type system study** (90 min):
   - `backend/app/schemas/analyze.py` - Pydantic schemas
   - `frontend/src/types/api.ts` - TypeScript types
   - **Critical**: These must stay in sync!

4. **Schema sync exercise**:
   - Pick `AnalyzeRequest`
   - Find its definition in both backend and frontend
   - Verify all fields match
   - Do the same for `ScanResponse`

5. **Caching deep dive** (60 min):
   - Read `backend/app/services/mr_analysis_service.py:analyze_mr`
   - Understand the cache hit vs miss logic
   - Look at `backend/app/services/scan_service.py`
   - Answer: How does the app invalidate stale cache entries?

**Day 5 Checkpoint**: Can you add a new field to the API response end-to-end? (Backend schema → Database model → Frontend type → UI display)

---

## Day 6: Testing & Edge Cases (3-4 hours)

### Morning: Test Suite Study
1. **Run all tests** (30 min):
   ```bash
   cd backend
   python test_database.py
   python test_gitlab_integration.py
   python test_openai_integration.py
   ```

2. **Read test code** (90 min):
   - Understand the test patterns
   - See how tests use fixtures/setup
   - Notice what's being tested vs mocked

3. **Write a test**:
   - Add a new test to `test_database.py`
   - Test: "Creating a scan with duplicate project_id/mr_iid should succeed"
   - This tests that the system allows re-scanning

### Afternoon: Edge Cases
4. **Code spelunking** (2 hours):
   - Search for `# TODO` comments
   - Search for `# FIXME` comments
   - Look for defensive programming patterns:
     - `if not user:` checks
     - `try/except` blocks
     - Input validation

5. **Break the app exercise**:
   - Try to make the app fail in interesting ways:
     - Submit invalid MR URLs
     - Analyze a non-existent MR
     - Log out mid-analysis
     - Analyze an empty MR
   - For each failure, trace the error handling

**Day 6 Checkpoint**: Can you explain 3 potential failure modes and how the app handles them?

---

## Day 7: Integration & Architecture Decisions (3-4 hours)

### Morning: Why These Choices?
1. **Research architectural decisions** (2 hours):

   Study these files and answer WHY:

   - **Why FastAPI over Flask/Django?**
     - Hint: `async/await` support, auto-docs, type hints

   - **Why SQLite over PostgreSQL?**
     - Hint: Simplicity, local dev, deployment ease

   - **Why HTTP-only cookies over localStorage?**
     - Read: `backend/app/api/routes/auth.py:callback`
     - Answer: XSS protection

   - **Why map-reduce for large MRs?**
     - Read: `backend/app/services/openai_service.py`
     - Answer: Token limits (128K context window)

   - **Why index `last_commit_sha`?**
     - Read: `backend/app/models/scan.py`
     - Answer: Fast cache lookups

   - **Why shadcn over Material-UI/Chakra?**
     - Read: `docs/plans/2026-01-14-shadcn-light-mode-refactor-design.md`
     - Answer: Copy-paste components, full control, Tailwind integration

### Afternoon: Full System Trace
2. **The ultimate exercise** (90 min):

   **Task**: Trace a complete MR analysis from click to display

   Open these files in tabs (in order):
   1. `frontend/src/pages/AnalysisPage.tsx:handleSubmit`
   2. `frontend/src/services/api.ts:api.post`
   3. `backend/app/api/routes/analyze.py:analyze_mr`
   4. `backend/app/services/mr_analysis_service.py:analyze_mr`
   5. `backend/app/services/scan_service.py:get_scan_by_mr` (cache check)
   6. `backend/app/services/gitlab_service.py:fetch_mr_changes`
   7. `backend/app/services/openai_service.py:generate_mr_summary`
   8. `backend/app/services/scan_service.py:create_scan`
   9. Back to `frontend/src/pages/AnalysisPage.tsx` (display)

   **Step through mentally**:
   - What data goes in?
   - What transformations happen?
   - Where are database queries?
   - Where are external API calls?
   - What error handling exists?
   - What gets returned to the user?

3. **Document your understanding**:
   - Create a sequence diagram on paper
   - Label every function call
   - Mark sync vs async operations
   - Highlight where errors could occur

**Day 7 Checkpoint**: **THE FLUENCY TEST** - Can you answer these without looking at code?
- What happens if GitLab returns a 401 during analysis?
- Where is the AI prompt defined?
- How does the frontend know if a user is logged in?
- What prevents analyzing the same MR twice (cache)?
- Why does the app exclude `.lock` files from analysis?

---

## Bonus: Mastery Exercises

Once you complete Day 7, try these to solidify:

### Exercise 1: Add a Feature
**Task**: Add "Export to PDF" button on analysis results
- Plan which files you'd modify
- Sketch the data flow
- Identify required dependencies

### Exercise 2: Optimize Performance
**Task**: Reduce analysis time by 20%
- Where would you look first?
- What's the bottleneck (hint: OpenAI API calls)?
- How could you parallelize file summaries?

### Exercise 3: Debug a Bug
**Scenario**: Users report cached results showing even when MR changes
- Which file would you check first? (`mr_analysis_service.py`)
- What could cause this? (SHA comparison failing)
- How would you reproduce it?

### Exercise 4: Security Audit
**Task**: Find 3 potential security issues
- Hint areas: Token storage, CORS, input validation
- Check: `backend/app/core/security.py`, `backend/app/api/routes/auth.py`

---

## Study Tips for Maximum Retention

1. **Active Reading**: Don't just read code - run it, modify it, break it
2. **Teach It Back**: Explain each concept out loud (rubber duck debugging)
3. **Draw Everything**: Architecture diagrams, sequence diagrams, data flow
4. **Use Git Blame**: See why code was written (`git blame <file>`)
5. **Check Recent PRs**: Recent commits show latest thinking
6. **Create Flashcards**: Key concepts (e.g., "What does `get_db()` do?")
7. **Write Comments**: Add comments to complex code as you understand it
8. **Pair with AI**: Ask me specific questions as you go!

---

## Time Allocation Summary

| Day | Focus | Hours |
|-----|-------|-------|
| 1 | Foundation & Setup | 3-4 |
| 2 | Backend Core | 4-5 |
| 3 | AI & GitLab | 4-5 |
| 4 | Frontend | 4-5 |
| 5 | Cross-cutting | 3-4 |
| 6 | Testing | 3-4 |
| 7 | Integration | 3-4 |
| **Total** | | **24-31 hours** |

Spread across 7 days = **3-5 hours/day**

---

## Success Criteria

By end of Week 1, you should be able to:

✅ Explain the entire OAuth flow from memory
✅ Trace any API request through all layers
✅ Understand why map-reduce is used for large MRs
✅ Add a new API endpoint end-to-end
✅ Debug production issues by knowing where to look
✅ Explain architectural decisions to stakeholders
✅ Onboard new developers to the codebase
✅ Answer "why X instead of Y?" for major tech choices

---

## Progress Tracking

Use this checklist to track your progress:

- [ ] Day 1: Foundation & Mental Models
- [ ] Day 2: Backend Deep Dive
- [ ] Day 3: AI & GitLab Integration
- [ ] Day 4: Frontend Architecture
- [ ] Day 5: Cross-Cutting Concerns
- [ ] Day 6: Testing & Edge Cases
- [ ] Day 7: Integration & Architecture Decisions
- [ ] Bonus Exercise 1: Add a Feature
- [ ] Bonus Exercise 2: Optimize Performance
- [ ] Bonus Exercise 3: Debug a Bug
- [ ] Bonus Exercise 4: Security Audit

---

## Learning Journal Template

Keep notes as you progress through each day:

### Day X: [Topic]

**What I learned:**
1.
2.
3.

**Questions/Uncertainties:**
1.
2.

**Aha moments:**
1.
2.

**Action items:**
1.
2.

---

**Pro tip**: Keep a "learning journal" - write down 3 things you learned each day. By Day 7, you'll have 21 insights documented.

Good luck on your mastery journey! 🚀
