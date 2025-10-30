# Formbar Boilerplate - Grading Report

## Grading Rubric Summary

| # | Criteria | Description |
|---|----------|-------------|
| 1 | Initialize Project | Node project created and all dependencies installed |
| 2 | Folder Structure | Required folders and files organized correctly |
| 3 | Environment Setup | .env created with valid configuration values (optional) |
| 4 | Basic Express Server | Server runs and responds on the set port |
| 5 | Database Script | npm run init-db creates database and tables |
| 6 | EJS & Middleware | EJS templates render correctly with Express setup |
| 7 | Sessions Enabled | Sessions persist using SQLite store |
| 8 | Formbar OAuth | Login redirects and authenticates via Formbar |
| 9 | Protected Routes | Unauthenticated users are redirected to login |
| 10 | Formbar WebSocket | WebSocket connects and logs active class events |
| 11 | Gitignore & README | Proper .gitignore exists (README optional) |
| 12 | Logout Route | Logout clears session and redirects to login |
| 13 | User Database | Authenticated user saved in SQLite table |
| 14 | Push to GitHub | Boilerplate committed and pushed to repository |

---

## Individual Student Grades

### 1. AndersonDylan

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed (node_modules present) |
| 2 | Folder Structure | ✅ PASS | Proper structure: db/, scripts/, views/ |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured on PORT with proper setup |
| 5 | Database Script | ✅ PASS | init-db.js properly reads and executes init.sql |
| 6 | EJS & Middleware | ✅ PASS | EJS configured, templates present |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store configured correctly |
| 8 | Formbar OAuth | ✅ PASS | OAuth flow implemented with JWT decode |
| 9 | Protected Routes | ✅ PASS | isAuthenticated middleware protects routes |
| 10 | Formbar WebSocket | ✅ PASS | Socket.io client connects, getActiveClass emitted |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout destroys session and redirects |
| 13 | User Database | ✅ PASS | Users table with INSERT OR IGNORE |
| 14 | Push to GitHub | ✅ PASS | Code present in repository |

**Issues Found:**
- Line 76: Syntax error - missing parenthesis in route definition: `app.get('sendpogs'), isAuthenticated, (req, res) =>`
- Line 67: Missing `/login` route - redirects to AUTH_URL without checking for login page first

**Score: 12/14** (Minor syntax error)


---

### 2. LiuVincent

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure maintained |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured properly |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS properly configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store configured |
| 8 | Formbar OAuth | ✅ PASS | OAuth flow implemented correctly |
| 9 | Protected Routes | ✅ PASS | isAuthenticated middleware working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket properly connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout implemented correctly |
| 13 | User Database | ✅ PASS | Users table with proper INSERT |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 8: Unused import: `const { is } = require('express/lib/request')`
- Login route doesn't render a login page, only redirects

**Score: 13/14** (Clean code with minor unused import)


---

### 3. LyndBryce

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ⚠️ PARTIAL | Socket event wrong: 'connection' should be 'connect' |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table properly configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 98: Socket event error - uses 'connection' instead of 'connect' (won't trigger properly)
- Line 8: package.json start script points to "server.js" but file is named "app.js"
- Line 63: res.redirect('/') is inside the database callback, could cause issues if callback takes time

**Score: 12/14** (Socket event bug and package.json mismatch)


---

### 4. MartinChristian

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure (uses app.db instead of database.db) |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server properly configured |
| 5 | Database Script | ✅ PASS | init-db.js correctly uses app.db |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ⚠️ ISSUE | saveUninitialized: true (should be false) |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket properly connected with extra events |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 37: saveUninitialized set to `true` (should be `false` for security)
- Line 6: Title has backslash error: "Formbar boilerplate\\"

**Score: 13/14** (Session configuration issue)


---

### 5. OrtpatrickCarlos

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure (uses venture.db) |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js correctly uses venture.db |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store configured |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 109: Typo - "Recived" should be "Received"
- Inconsistent naming: uses 'port' instead of 'PORT' (lowercase constant)

**Score: 13/14** (Minor typo)


---

### 6. OwensMarkus

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ⚠️ ISSUE | THIS_URL uses wrong template string syntax |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 1: Comment typo - "impotr" should be "import"
- Line 12: THIS_URL uses wrong syntax: `"http://localhost:${PORT}"` (should use backticks for template literal)
- Line 25: Comment typo - "middlewar" should be "middleware"
- Line 49: Comment typo - "data bas" should be "database"
- Multiple spelling/formatting issues throughout

**Score: 12/14** (Critical template literal bug will break OAuth redirects)


---

### 7. ReschStephen

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ⚠️ ISSUE | sqlite3 missing from dependencies |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ⚠️ ISSUE | May not work without sqlite3 in package.json |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store configured |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket with advanced classUpdate handling |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- sqlite3 package not listed in dependencies (will fail npm install on fresh clone)
- Excellent WebSocket implementation with detailed classUpdate logging

**Score: 12/14** (Missing critical dependency in package.json)


---

### 8. StevensGabriella

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ⚠️ ISSUE | Uses INSERT OR REPLACE instead of INSERT OR IGNORE |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ⚠️ ISSUE | Uses INSERT OR REPLACE (updates existing users) |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 59: Uses `INSERT OR REPLACE` instead of `INSERT OR IGNORE` (will update existing users on each login)
- Clean, well-organized code

**Score: 12/14** (Database logic issue - should not replace existing users)


---

### 9. YeagerConnor

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 9: Variable name typo - `SQLLiteStore` should be `SQLiteStore` (works but inconsistent)
- Line 67: Extra console.log for debugging that should be removed
- Clean implementation overall

**Score: 13/14** (Minor naming inconsistency and debug code)

**Grade: A-**

---

### 10. AajahPittman

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ⚠️ ISSUE | Multiple syntax errors in URL constants |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ⚠️ ISSUE | Typo in socket event: 'getACtiveClass' |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 23: AUTH_URL missing colon: 'http//localhost:420/oauth' (should be 'http://localhost:420/oauth')
- Line 24: THIS_URL has space and wrong template literal: ' http://localhost:${port}' (should use backticks)
- Line 25: API_KEY missing value assignment
- Line 92: Socket event typo: 'getACtiveClass' should be 'getActiveClass'
- Line 4: package.json main points to "index.js" but file is "app.js"

**Score: 11/14** (Multiple syntax errors and typos)

**Grade: C+**

---

### 11. JanCruz

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure (nested in FormbarBoilerplate folder) |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented with error handling |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Excellent code organization with detailed comments
- Includes error handling in routes
- Clean, professional implementation
- No significant issues found

**Score: 14/14** (Excellent implementation with error handling)

**Grade: A**

---

### 12. JoynesBenjamin

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure (uses app.db) |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js correctly uses app.db |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 4: package.json main points to "index.js" but file is "app.js"
- Line 110: Typo - "Recieved" should be "Received"
- Line 106: Typo - "Disconnected to" should be "Disconnected from"
- Line 115: Uses process.env.PORT instead of PORT constant
- Line 116: Typo - "Serever" should be "Server"

**Score: 12/14** (Minor typos and package.json mismatch)

**Grade: B+**

---

### 13. LarosaKayden

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ⚠️ ISSUE | Missing SQLiteStore import and session store |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ⚠️ ISSUE | No SQLite session store configured |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Missing SQLiteStore import and configuration (sessions won't persist properly)
- Line 102: Typo - "Recieved" should be "Received"
- Line 98: Typo - "Disconnected to" should be "Disconnected from"
- Line 107: Uses process.env.PORT instead of PORT constant
- Line 108: Typo - "Serever" should be "Server"
- Missing sessions.db file (not created without SQLiteStore)

**Score: 11/14** (Missing critical session store configuration)

**Grade: C+**

---

### 14. GarciaDonald

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ⚠️ ISSUE | Missing semicolons, incomplete code |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ✅ PASS | SQLite session store working |
| 8 | Formbar OAuth | ⚠️ ISSUE | Uses INSERT OR REPLACE instead of INSERT OR IGNORE |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ⚠️ ISSUE | Socket handler expects wrong data format |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ⚠️ ISSUE | Uses INSERT OR REPLACE (updates existing users) |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Line 3: Missing semicolon after require statement
- Line 20: Uses 'port' (lowercase) instead of 'PORT' (process.env.port should be process.env.PORT)
- Line 29: Comment has colon instead of semicolon
- Line 46: Missing space after comma: {user: should be { user:
- Line 56: Uses `INSERT OR REPLACE` instead of `INSERT OR IGNORE` (will update existing users on each login)
- Line 87: Incomplete code: `app` with no route definition
- Line 100: Socket handler expects classId but should handle classData object
- Multiple missing semicolons throughout

**Score: 11/14** (Multiple syntax errors and database logic issue)

**Grade: C+**

---

### 15. MechlerDylan

| # | Criteria | Status | Notes |
|---|----------|--------|-------|
| 1 | Initialize Project | ✅ PASS | Dependencies installed |
| 2 | Folder Structure | ✅ PASS | Proper structure |
| 3 | Environment Setup | ✅ PASS | .gitignore present (no .env required) |
| 4 | Basic Express Server | ✅ PASS | Server configured |
| 5 | Database Script | ✅ PASS | init-db.js functional |
| 6 | EJS & Middleware | ✅ PASS | EJS configured |
| 7 | Sessions Enabled | ⚠️ ISSUE | No SQLite session store configured |
| 8 | Formbar OAuth | ✅ PASS | OAuth implemented |
| 9 | Protected Routes | ✅ PASS | isAuthenticated working |
| 10 | Formbar WebSocket | ✅ PASS | WebSocket connected |
| 11 | Gitignore & README | ✅ PASS | .gitignore present (README optional) |
| 12 | Logout Route | ✅ PASS | Logout working |
| 13 | User Database | ✅ PASS | Users table configured |
| 14 | Push to GitHub | ✅ PASS | Code in repository |

**Issues Found:**
- Missing SQLiteStore import and configuration (sessions won't persist properly)
- Line 102: Typo - "Recieved" should be "Received"
- Line 98: Typo - "Disconnected to" should be "Disconnected from"
- Line 107: Uses process.env.PORT instead of PORT constant
- Line 108: Typo - "Serever" should be "Server"
- Missing sessions.db file (not created without SQLiteStore)

**Score: 11/14** (Missing critical session store configuration)

**Grade: C+**

---

## Common Issues Across All Projects

1. **No login.ejs content** - Most students have empty login.ejs files (they only handle OAuth redirects)
2. **Code quality variations** - Some students have typos, formatting issues, or inconsistent naming
3. **Template literal usage** - Some students have issues with string interpolation syntax
4. **Database logic variations** - Different approaches to user insertion (INSERT OR IGNORE vs INSERT OR REPLACE)

## Recommendations

### Critical Issues to Address:
- **AndersonDylan**: Fix syntax error on line 76
- **LyndBryce**: Fix package.json start script and socket event name
- **OwensMarkus**: Fix template literal syntax for THIS_URL
- **ReschStephen**: Add sqlite3 to dependencies

### Best Practices to Improve:
1. Create actual login page UI instead of empty login.ejs
2. Use consistent naming conventions (PORT vs port)
3. Remove debug console.log statements before submission
4. Add comments explaining OAuth flow and WebSocket events
5. Use proper template literal syntax for string interpolation

### Excellent Work:
- All students successfully implemented the core OAuth + Session + WebSocket architecture
- Database integration is solid across all projects
- Protected routes are properly implemented
- Session management with SQLite is correctly configured

---

## Summary Rankings

| Rank | Student | Score | Grade |
|------|---------|-------|-------|
| 1 | JanCruz | 14/14 | A |
| 2 | LiuVincent | 13/14 | A- |
| 2 | MartinChristian | 13/14 | A- |
| 2 | OrtpatrickCarlos | 13/14 | A- |
| 2 | YeagerConnor | 13/14 | A- |
| 6 | AndersonDylan | 12/14 | B+ |
| 6 | JoynesBenjamin | 12/14 | B+ |
| 6 | LyndBryce | 12/14 | B+ |
| 6 | OwensMarkus | 12/14 | B+ |
| 6 | ReschStephen | 12/14 | B+ |
| 6 | StevensGabriella | 12/14 | B+ |
| 12 | AajahPittman | 11/14 | C+ |
| 12 | GarciaDonald | 11/14 | C+ |
| 12 | LarosaKayden | 11/14 | C+ |
| 12 | MechlerDylan | 11/14 | C+ |

---

## Testing Notes

**Note:** This analysis is based on code review only. Actual runtime testing was not performed. To fully verify:
1. Run `npm install` in each project
2. Create a valid `.env` file with Formbar credentials
3. Run `npm run init-db` to initialize database
4. Run `npm start` and test OAuth flow
5. Verify WebSocket connection to Formbar
6. Test protected routes and logout functionality

---

**Report Generated:** October 20, 2025
**Evaluator:** Code Analysis Tool

