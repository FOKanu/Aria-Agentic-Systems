# Task Breakdown: Local Runtime & Agent Memory Implementation

**Date:** December 25, 2025
**Status:** Ready to Start

---

## Task Organization

Tasks are organized by feature and ordered by dependencies. Each task is:
- **Atomic:** Can be completed independently
- **Testable:** Has clear acceptance criteria
- **Sequential:** Dependencies are clearly marked

---

## Part 1: Local Agent Runtime (Phase 16)

### Task 1.1: Create Server Directory Structure
**Priority:** Critical
**Estimated Time:** 15 minutes
**Dependencies:** None

**Actions:**
1. Create `server/` directory in project root
2. Create `server/requirements.txt` with dependencies
3. Create `server/.env.example` template
4. Create `server/README.md` with setup instructions

**Files to Create:**
- `server/requirements.txt`
- `server/.env.example`
- `server/README.md`

**Acceptance Criteria:**
- [ ] `server/` directory exists
- [ ] `requirements.txt` lists all dependencies
- [ ] `.env.example` has placeholder values
- [ ] `README.md` explains how to set up the server

---

### Task 1.2: Initialize FastAPI Application
**Priority:** Critical
**Estimated Time:** 30 minutes
**Dependencies:** Task 1.1

**Actions:**
1. Create `server/main.py` with FastAPI app
2. Configure CORS for `localhost:5173`
3. Add `/health` endpoint returning `{"status": "ok"}`
4. Bind server to `127.0.0.1:8000` (NOT `0.0.0.0`)

**Files to Create:**
- `server/main.py`

**Code Structure:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ARIA Sidecar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
```

**Acceptance Criteria:**
- [ ] Server starts with `uvicorn main:app --host 127.0.0.1 --port 8000`
- [ ] `/health` returns `{"status": "ok"}`
- [ ] CORS allows requests from `localhost:5173`
- [ ] Server binds to `127.0.0.1` only

---

### Task 1.3: Implement Token Authentication
**Priority:** Critical
**Estimated Time:** 45 minutes
**Dependencies:** Task 1.2

**Actions:**
1. Create `server/security/__init__.py`
2. Create `server/security/auth.py`
3. Generate UUID4 token on startup
4. Print token to console: `"ARIA_ACCESS_TOKEN: <token>"`
5. Create `verify_token()` FastAPI dependency
6. Protect `/health` endpoint with token (optional, for testing)

**Files to Create:**
- `server/security/__init__.py`
- `server/security/auth.py`

**Code Structure:**
```python
# security/auth.py
import uuid
from fastapi import HTTPException, Depends, Header

ARIA_TOKEN = str(uuid.uuid4())

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid token")
    token = authorization.replace("Bearer ", "")
    if token != ARIA_TOKEN:
        raise HTTPException(401, "Invalid token")
    return token
```

**Acceptance Criteria:**
- [ ] Token is generated on startup
- [ ] Token is printed to console
- [ ] `verify_token()` dependency works
- [ ] Unauthorized requests return 401
- [ ] Authorized requests with valid token pass

---

### Task 1.4: Implement Path Sandbox
**Priority:** Critical
**Estimated Time:** 45 minutes
**Dependencies:** Task 1.3

**Actions:**
1. Create `server/security/sandbox.py`
2. Define `WORKSPACE_ROOT` (default: current directory)
3. Implement `validate_path(path: str) -> bool`
4. Implement `sanitize_path(path: str) -> str`
5. Test with `../../etc/passwd` (should reject)

**Files to Create:**
- `server/security/sandbox.py`

**Code Structure:**
```python
import os
from pathlib import Path

WORKSPACE_ROOT = Path.cwd()

def validate_path(path: str) -> bool:
    resolved = Path(path).resolve()
    try:
        common = Path(os.path.commonpath([resolved, WORKSPACE_ROOT]))
        return common == WORKSPACE_ROOT
    except ValueError:
        return False

def sanitize_path(path: str) -> str:
    return str(Path(path).resolve())
```

**Acceptance Criteria:**
- [ ] `validate_path("src/App.tsx")` returns `True`
- [ ] `validate_path("../../etc/passwd")` returns `False`
- [ ] `sanitize_path()` normalizes paths correctly
- [ ] Workspace root is correctly identified

---

### Task 1.5: Implement Command Validator
**Priority:** Critical
**Estimated Time:** 1 hour
**Dependencies:** Task 1.4

**Actions:**
1. Create `server/security/validator.py`
2. Define `ALLOWED_COMMANDS` regex patterns
3. Define `BLOCKED_COMMANDS` regex patterns
4. Implement `validate_command(cmd: str) -> tuple[bool, str, str]`
5. Return: `(is_safe, risk_level, reason)`

**Files to Create:**
- `server/security/validator.py`

**Risk Levels:**
- `"low"`: Safe commands (git, npm, ls, cat, pwd)
- `"medium"`: Commands that modify files (write operations)
- `"high"`: Dangerous commands (rm, sudo, chmod 777) - require approval

**Acceptance Criteria:**
- [ ] `validate_command("npm test")` returns `(True, "low", "safe")`
- [ ] `validate_command("rm -rf /")` returns `(False, "high", "blocked")`
- [ ] `validate_command("git status")` returns `(True, "low", "safe")`
- [ ] All blocked commands are rejected

---

### Task 1.6: Create Terminal Execution Endpoint
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.5

**Actions:**
1. Create `server/routers/__init__.py`
2. Create `server/routers/terminal.py`
3. Implement `POST /execute` endpoint
4. Use `subprocess.run()` with timeout
5. Validate command via `validate_command()`
6. Validate `cwd` via `validate_path()`
7. Return stdout, stderr, exit_code, execution_time

**Files to Create:**
- `server/routers/__init__.py`
- `server/routers/terminal.py`

**Request Schema:**
```python
{
  "command": "npm test",
  "cwd": "./",
  "timeout": 30
}
```

**Response Schema:**
```python
{
  "stdout": "...",
  "stderr": "...",
  "exit_code": 0,
  "execution_time_ms": 1234,
  "requires_approval": false
}
```

**Acceptance Criteria:**
- [ ] `/execute` runs `npm test` successfully
- [ ] Returns proper stdout/stderr
- [ ] Timeout works (test with `sleep 60`)
- [ ] High-risk commands return `{"requires_approval": true}`
- [ ] Invalid paths are rejected

---

### Task 1.7: Create Filesystem Read Endpoint
**Priority:** High
**Estimated Time:** 30 minutes
**Dependencies:** Task 1.6

**Actions:**
1. Create `server/routers/filesystem.py`
2. Implement `POST /fs/read` endpoint
3. Validate path via `validate_path()`
4. Read file content
5. Return content and size

**Files to Create:**
- `server/routers/filesystem.py`

**Request Schema:**
```python
{
  "path": "src/App.tsx"
}
```

**Response Schema:**
```python
{
  "content": "...",
  "size_bytes": 1024
}
```

**Acceptance Criteria:**
- [ ] `/fs/read` reads file within workspace
- [ ] Rejects paths outside workspace
- [ ] Returns file content correctly
- [ ] Handles missing files gracefully

---

### Task 1.8: Create Filesystem Write Endpoint
**Priority:** High
**Estimated Time:** 30 minutes
**Dependencies:** Task 1.7

**Actions:**
1. Add `POST /fs/write` to `filesystem.py`
2. Validate path via `validate_path()`
3. Write file content (create if not exists)
4. Return success and bytes written

**Request Schema:**
```python
{
  "path": "src/App.tsx",
  "content": "..."
}
```

**Response Schema:**
```python
{
  "success": true,
  "bytes_written": 1024
}
```

**Acceptance Criteria:**
- [ ] `/fs/write` writes file within workspace
- [ ] Creates file if it doesn't exist
- [ ] Rejects paths outside workspace
- [ ] Returns correct bytes_written

---

### Task 1.9: Create Filesystem List Endpoint
**Priority:** Medium
**Estimated Time:** 45 minutes
**Dependencies:** Task 1.8

**Actions:**
1. Add `POST /fs/list` to `filesystem.py`
2. Validate path via `validate_path()`
3. Recursively list directory up to `depth`
4. Return JSON tree structure

**Request Schema:**
```python
{
  "path": "./src",
  "depth": 2
}
```

**Response Schema:**
```python
{
  "type": "directory",
  "name": "src",
  "path": "src",
  "children": [
    {
      "type": "file",
      "name": "App.tsx",
      "path": "src/App.tsx",
      "size_bytes": 1024
    }
  ]
}
```

**Acceptance Criteria:**
- [ ] `/fs/list` returns directory structure
- [ ] Respects `depth` parameter
- [ ] Includes file sizes
- [ ] Handles empty directories

---

### Task 1.10: Create Runtime Bridge Client
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.9

**Actions:**
1. Create `src/agent-engine/services/runtimeBridge.ts`
2. Implement `RuntimeClient` class
3. Add methods: `executeCommand()`, `readFile()`, `writeFile()`, `listDirectory()`, `checkHealth()`
4. Store token in localStorage
5. Add error handling

**Files to Create:**
- `src/agent-engine/services/runtimeBridge.ts`

**Acceptance Criteria:**
- [ ] `RuntimeClient` can call `/health`
- [ ] `executeCommand()` works
- [ ] `readFile()` and `writeFile()` work
- [ ] Token is stored in localStorage
- [ ] Error handling works correctly

---

### Task 1.11: Add Runtime Settings UI
**Priority:** High
**Estimated Time:** 1 hour
**Dependencies:** Task 1.10

**Actions:**
1. Read `src/pages/SettingsPage.tsx`
2. Add "Runtime Settings" section
3. Add input field for "ARIA Access Token"
4. Add "Test Connection" button
5. Display connection status (connected/disconnected)
6. Save token to localStorage on submit

**Files to Modify:**
- `src/pages/SettingsPage.tsx`

**Acceptance Criteria:**
- [ ] Settings page has Runtime section
- [ ] Token input field works
- [ ] "Test Connection" calls `runtimeClient.checkHealth()`
- [ ] Connection status displays correctly
- [ ] Token persists after page refresh

---

### Task 1.12: Integrate Runtime with Agent Engine
**Priority:** Critical
**Estimated Time:** 2 hours
**Dependencies:** Task 1.11

**Actions:**
1. Read `src/lib/ai.ts` and `src/agent-engine/lib/router.ts`
2. Add tool definitions to system prompts
3. Detect tool calls in LLM responses
4. Route `run_terminal` → `runtimeClient.executeCommand()`
5. Route `read_file` → `runtimeClient.readFile()`
6. Route `write_file` → `runtimeClient.writeFile()`
7. Feed results back to LLM

**Files to Modify:**
- `src/lib/ai.ts` (or `src/agent-engine/lib/router.ts`)
- `src/agent-engine/lib/prompts.ts`

**Acceptance Criteria:**
- [ ] LLM receives tool definitions
- [ ] Tool calls are detected correctly
- [ ] Commands route to RuntimeClient
- [ ] Results feed back to LLM
- [ ] Next LLM step uses command output

---

### Task 1.13: Create Approval Gate UI
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task 1.12

**Actions:**
1. Create `src/components/runtime/CommandApprovalDialog.tsx`
2. Show command preview
3. Display risk level badge
4. Add "Approve" / "Reject" buttons
5. Integrate with RuntimeClient (only execute after approval)

**Files to Create:**
- `src/components/runtime/CommandApprovalDialog.tsx`

**Acceptance Criteria:**
- [ ] Modal appears for high-risk commands
- [ ] Command preview is accurate
- [ ] Risk level badge displays correctly
- [ ] Approve executes command
- [ ] Reject cancels execution

---

## Part 2: Agent Memory System (Phase 11)

### Task 2.1: Create Memory Type Definitions
**Priority:** Critical
**Estimated Time:** 30 minutes
**Dependencies:** None

**Actions:**
1. Create `src/features/memory/` directory
2. Create `src/features/memory/types/index.ts`
3. Define `MemoryScope`, `MemoryType` enums
4. Define `AgentMemory`, `CreateMemoryInput`, `MemorySearchParams` interfaces

**Files to Create:**
- `src/features/memory/types/index.ts`

**Acceptance Criteria:**
- [ ] Types match database schema
- [ ] All enums are defined
- [ ] Interfaces are complete
- [ ] Types are exported

---

### Task 2.2: Implement Memory Service - Create
**Priority:** Critical
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.1

**Actions:**
1. Create `src/features/memory/services/memoryService.ts`
2. Implement `MemoryService` class
3. Implement `create()` method
4. Insert into `agent_memory` table
5. Handle authentication

**Files to Create:**
- `src/features/memory/services/memoryService.ts`

**Acceptance Criteria:**
- [ ] `create()` inserts memory successfully
- [ ] User authentication is checked
- [ ] Default values are applied (scope, memory_type)
- [ ] Returns created memory object

---

### Task 2.3: Implement Memory Service - Read Operations
**Priority:** High
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.2

**Actions:**
1. Implement `getByKey()` method
2. Implement `getById()` method
3. Implement `getAll()` method (with filters)
4. Handle expired memories (filter out)

**Acceptance Criteria:**
- [ ] `getByKey()` retrieves memory correctly
- [ ] `getById()` works
- [ ] `getAll()` respects filters
- [ ] Expired memories are excluded

---

### Task 2.4: Implement Memory Service - Update & Delete
**Priority:** High
**Estimated Time:** 30 minutes
**Dependencies:** Task 2.3

**Actions:**
1. Implement `update()` method
2. Implement `delete()` method
3. Implement `recordAccess()` method (increment access_count)

**Acceptance Criteria:**
- [ ] `update()` modifies memory correctly
- [ ] `delete()` removes memory
- [ ] `recordAccess()` increments count and updates timestamp

---

### Task 2.5: Implement Memory Search
**Priority:** High
**Estimated Time:** 1 hour
**Dependencies:** Task 2.4

**Actions:**
1. Implement `search()` method
2. Use Supabase `ilike` for text search
3. Filter by scope, agent_id
4. Sort by relevance_score
5. Limit results

**Acceptance Criteria:**
- [ ] Search finds memories by key/value
- [ ] Filters work correctly
- [ ] Results are sorted by relevance
- [ ] Limit is respected

---

### Task 2.6: Implement Context Retrieval
**Priority:** Critical
**Estimated Time:** 45 minutes
**Dependencies:** Task 2.5

**Actions:**
1. Implement `getContext()` method
2. Retrieve memories for specific agent
3. Optionally filter by conversation_id
4. Return top N most relevant memories
5. Sort by access_count and relevance_score

**Acceptance Criteria:**
- [ ] `getContext()` returns relevant memories
- [ ] Agent-specific filtering works
- [ ] Conversation filtering works
- [ ] Results are limited correctly

---

### Task 2.7: Create useAgentMemory Hook
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.6

**Actions:**
1. Create `src/features/memory/hooks/useAgentMemory.ts`
2. Implement state management (memories, loading, error)
3. Wrap all MemoryService methods
4. Handle loading/error states
5. Export hook

**Files to Create:**
- `src/features/memory/hooks/useAgentMemory.ts`

**Acceptance Criteria:**
- [ ] Hook provides all CRUD operations
- [ ] Loading state works correctly
- [ ] Error state is handled
- [ ] State updates correctly

---

### Task 2.8: Export Memory Feature Module
**Priority:** Medium
**Estimated Time:** 15 minutes
**Dependencies:** Task 2.7

**Actions:**
1. Create `src/features/memory/index.ts`
2. Export hook, types, service
3. Add to `src/features/index.ts`

**Files to Create:**
- `src/features/memory/index.ts`

**Files to Modify:**
- `src/features/index.ts`

**Acceptance Criteria:**
- [ ] Memory module is exported
- [ ] Can import from `@/features/memory`
- [ ] All exports are available

---

### Task 2.9: Integrate Memory into useAIChat - Context Injection
**Priority:** Critical
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.8

**Actions:**
1. Read `src/agent-engine/hooks/useAIChat.ts`
2. Import `useAgentMemory` hook
3. Before sending message, call `getContext(agent_id, conversation_id)`
4. Format memories as context string
5. Append to system prompt or messages array

**Files to Modify:**
- `src/agent-engine/hooks/useAIChat.ts`

**Context Format:**
```
Previous Context:
- [User prefers dark mode]: preference
- [Project uses TypeScript]: fact
```

**Acceptance Criteria:**
- [ ] Context is retrieved before LLM call
- [ ] Memories are formatted correctly
- [ ] Context is injected into prompt
- [ ] LLM receives context

---

### Task 2.10: Implement Auto-Save Memories
**Priority:** High
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.9

**Actions:**
1. After LLM response, analyze for key facts
2. Extract patterns (e.g., "User prefers X", "Project uses Y")
3. Save as `memory_type: 'fact'` or `'preference'`
4. Use simple regex or LLM extraction

**Files to Modify:**
- `src/agent-engine/hooks/useAIChat.ts`

**Extraction Patterns:**
- "User prefers X" → preference
- "Project uses X" → fact
- "Remember that X" → instruction

**Acceptance Criteria:**
- [ ] Key facts are extracted from responses
- [ ] Memories are saved automatically
- [ ] Memory type is assigned correctly
- [ ] Duplicate memories are avoided

---

### Task 2.11: Enhance MemoryPage UI - List View
**Priority:** Medium
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.10

**Actions:**
1. Read `src/pages/MemoryPage.tsx`
2. Replace mock data with `useAgentMemory()` hook
3. Display memories in table/cards
4. Add filters (scope, agent_id, memory_type)
5. Show access_count, last_accessed_at

**Files to Modify:**
- `src/pages/MemoryPage.tsx`

**Acceptance Criteria:**
- [ ] Memories are loaded from database
- [ ] Filters work correctly
- [ ] Access stats are displayed
- [ ] UI is responsive

---

### Task 2.12: Enhance MemoryPage UI - Search
**Priority:** Medium
**Estimated Time:** 1 hour
**Dependencies:** Task 2.11

**Actions:**
1. Add search bar to MemoryPage
2. Call `useAgentMemory().search()` on input
3. Display results in real-time
4. Highlight matching text
5. Sort by relevance_score

**Files to Modify:**
- `src/pages/MemoryPage.tsx`

**Acceptance Criteria:**
- [ ] Search bar works
- [ ] Results update in real-time
- [ ] Matching text is highlighted
- [ ] Results are sorted correctly

---

### Task 2.13: Enhance MemoryPage UI - CRUD Operations
**Priority:** Medium
**Estimated Time:** 1.5 hours
**Dependencies:** Task 2.12

**Actions:**
1. Add "Create Memory" button
2. Create memory form dialog
3. Add edit/delete buttons to each memory
4. Implement edit functionality
5. Implement delete functionality

**Files to Modify:**
- `src/pages/MemoryPage.tsx`

**Files to Create (Optional):**
- `src/components/memory/MemoryFormDialog.tsx`

**Acceptance Criteria:**
- [ ] Create memory form works
- [ ] Edit memory works
- [ ] Delete memory works
- [ ] UI updates after operations

---

## Task Dependencies Graph

```
Runtime Tasks:
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10 → 1.11 → 1.12 → 1.13

Memory Tasks:
2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9 → 2.10 → 2.11 → 2.12 → 2.13
```

**Note:** Runtime and Memory tasks can be worked on in parallel after their initial setup tasks.

---

## Quick Start Checklist

### Before Starting:
- [ ] Python 3.11+ installed
- [ ] `pip` available
- [ ] Port 8000 available
- [ ] Supabase connection working
- [ ] User authentication working

### First Task:
- [ ] **Task 1.1:** Create Server Directory Structure

---

## Progress Tracking

Use this section to track your progress:

### Runtime Tasks:
- [ ] 1.1 - Server Directory
- [ ] 1.2 - FastAPI App
- [ ] 1.3 - Token Auth
- [ ] 1.4 - Path Sandbox
- [ ] 1.5 - Command Validator
- [ ] 1.6 - Terminal Endpoint
- [ ] 1.7 - FS Read
- [ ] 1.8 - FS Write
- [ ] 1.9 - FS List
- [ ] 1.10 - Runtime Bridge
- [ ] 1.11 - Settings UI
- [ ] 1.12 - Agent Integration
- [ ] 1.13 - Approval Gate

### Memory Tasks:
- [ ] 2.1 - Type Definitions
- [ ] 2.2 - Service Create
- [ ] 2.3 - Service Read
- [ ] 2.4 - Service Update/Delete
- [ ] 2.5 - Service Search
- [ ] 2.6 - Context Retrieval
- [ ] 2.7 - React Hook
- [ ] 2.8 - Module Export
- [ ] 2.9 - Context Injection
- [ ] 2.10 - Auto-Save
- [ ] 2.11 - UI List View
- [ ] 2.12 - UI Search
- [ ] 2.13 - UI CRUD

---

*Task breakdown created: December 25, 2025*
