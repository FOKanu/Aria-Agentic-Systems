# Implementation Plan: Local Agent Runtime & Agent Memory System

**Project:** ARIA - Agent Command Center
**Date:** December 25, 2025
**Focus:** Phase 16 (Local Runtime) + Phase 11 (Agent Memory)

---

## Executive Summary

This document outlines a comprehensive plan to implement two critical features:
1. **Local Agent Runtime (Sidecar)** - Enables agents to execute terminal commands and access the file system
2. **Agent Memory System** - Provides persistent context and knowledge retention across conversations

**Estimated Total Time:** 2-3 days
**Priority:** Critical (both features are blockers for MVP)

---

## Part 1: Local Agent Runtime (Phase 16)

### Overview
A Python FastAPI server that runs locally and bridges the browser sandbox gap, allowing ARIA agents to execute real commands and interact with the host operating system.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Browser)                               │
│  └─> src/agent-engine/services/runtimeBridge.ts         │
│      └─> HTTP/WebSocket ────────────────────────────────┐ │
└─────────────────────────────────────────────────────────┘ │
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────┐
│  Python Sidecar (localhost:8000)                       │
│  ├─> main.py (FastAPI app)                             │
│  ├─> routers/                                          │
│  │   ├─> terminal.py (Command execution)               │
│  │   ├─> filesystem.py (File operations)               │
│  │   └─> health.py (Status checks)                     │
│  ├─> security/                                         │
│  │   ├─> auth.py (Token validation)                    │
│  │   ├─> sandbox.py (Path validation)                  │
│  │   └─> validator.py (Command allowlist)              │
│  └─> utils/                                            │
│      └─> workspace.py (Workspace root management)      │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1.1: Initialize Python Server (30 min)

**Files to Create:**
```
server/
├── main.py
├── requirements.txt
├── .env.example
└── README.md
```

**Tasks:**
1. Create `server/` directory
2. Initialize Python virtual environment
3. Create `requirements.txt`:
   ```txt
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   pydantic==2.5.0
   python-multipart==0.0.6
   websockets==12.0
   python-dotenv==1.0.0
   ```
4. Create basic `main.py` with FastAPI app, CORS middleware
5. Add `.env.example` for configuration

**Acceptance Criteria:**
- Server starts on `http://127.0.0.1:8000`
- `/health` endpoint returns `{"status": "ok"}`
- CORS allows `localhost:5173` (Vite dev server)

---

#### Step 1.2: Security Layer (1 hour)

**Files to Create:**
```
server/
├── security/
│   ├── __init__.py
│   ├── auth.py
│   ├── sandbox.py
│   └── validator.py
```

**Tasks:**

**1.2.1: Token Authentication (`security/auth.py`)**
- Generate random UUID4 token on startup
- Print token to console: `"ARIA_ACCESS_TOKEN: <token>"`
- Store token in memory (or `.env` file)
- Create `verify_token()` dependency for FastAPI routes
- Reject requests without valid `Authorization: Bearer <token>` header

**1.2.2: Path Sandbox (`security/sandbox.py`)**
- Define `WORKSPACE_ROOT` (default: current directory or `--workspace` arg)
- Create `validate_path(path: str) -> bool`:
  - Resolve relative paths
  - Check `os.path.commonpath([resolved, WORKSPACE_ROOT]) == WORKSPACE_ROOT`
  - Reject paths outside workspace (prevent `../../etc/passwd`)
- Create `sanitize_path(path: str) -> str` to normalize paths

**1.2.3: Command Validator (`security/validator.py`)**
- Define `ALLOWED_COMMANDS` (regex patterns):
  - `^git\s+`
  - `^npm\s+`
  - `^npm run\s+`
  - `^ls\s+`
  - `^cat\s+`
  - `^pwd$`
  - `^echo\s+`
- Define `BLOCKED_COMMANDS`:
  - `rm\s+-rf`
  - `mkfs`
  - `dd\s+`
  - `sudo\s+`
  - `chmod\s+777`
- Create `validate_command(cmd: str) -> tuple[bool, str]`:
  - Returns `(is_safe, risk_level)`
  - Risk levels: `"low"`, `"medium"`, `"high"`
  - High-risk commands require approval

**Acceptance Criteria:**
- Token auth blocks unauthorized requests
- Path validation prevents directory traversal
- Command validator categorizes commands correctly

---

#### Step 1.3: Terminal Execution API (1.5 hours)

**Files to Create:**
```
server/
├── routers/
│   ├── __init__.py
│   └── terminal.py
```

**Tasks:**

**1.3.1: Basic Command Execution (`routers/terminal.py`)**
- Create `POST /execute` endpoint:
  ```python
  {
    "command": "npm test",
    "cwd": "./",
    "timeout": 30000
  }
  ```
- Use `subprocess.run()` with:
  - `cwd` (validated via sandbox)
  - `timeout` (seconds)
  - `capture_output=True`
  - `text=True`
- Return:
  ```python
  {
    "stdout": "...",
    "stderr": "...",
    "exit_code": 0,
    "execution_time_ms": 1234
  }
  ```

**1.3.2: Streaming Execution (Optional)**
- Create `WebSocket /terminal/ws/{session_id}` for interactive sessions
- Stream stdout/stderr in real-time
- Handle PTY for interactive commands

**Acceptance Criteria:**
- `/execute` runs safe commands successfully
- Returns proper stdout/stderr
- Timeout works correctly
- High-risk commands return `{"requires_approval": true}`

---

#### Step 1.4: Filesystem API (1 hour)

**Files to Create:**
```
server/
├── routers/
│   └── filesystem.py
```

**Tasks:**

**1.4.1: File Operations (`routers/filesystem.py`)**
- `POST /fs/read`:
  - Body: `{"path": "src/App.tsx"}`
  - Validate path via sandbox
  - Read file content
  - Return: `{"content": "...", "size_bytes": 1024}`

- `POST /fs/write`:
  - Body: `{"path": "src/App.tsx", "content": "..."}`
  - Validate path via sandbox
  - Write file (create if not exists)
  - Return: `{"success": true, "bytes_written": 1024}`

- `POST /fs/list`:
  - Body: `{"path": "./src", "depth": 2}`
  - Return directory tree as JSON:
    ```json
    {
      "type": "directory",
      "name": "src",
      "children": [...]
    }
    ```

**Acceptance Criteria:**
- Read/write operations work within workspace
- Path validation prevents access outside workspace
- Directory listing is recursive up to `depth`

---

#### Step 1.5: Frontend Bridge (1.5 hours)

**Files to Create:**
```
src/
├── agent-engine/
│   └── services/
│       └── runtimeBridge.ts
```

**Tasks:**

**1.5.1: Runtime Client (`runtimeBridge.ts`)**
```typescript
export class RuntimeClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('aria_runtime_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('aria_runtime_token', token);
  }

  async executeCommand(cmd: string, cwd?: string, timeout?: number) {
    // POST /execute
  }

  async readFile(path: string) {
    // POST /fs/read
  }

  async writeFile(path: string, content: string) {
    // POST /fs/write
  }

  async listDirectory(path: string, depth?: number) {
    // POST /fs/list
  }

  async checkHealth() {
    // GET /health
  }
}

export const runtimeClient = new RuntimeClient();
```

**1.5.2: Settings UI Integration**
- Add "Runtime Settings" section to `SettingsPage.tsx`
- Input field for "ARIA Access Token"
- "Test Connection" button
- Display connection status (connected/disconnected)

**Acceptance Criteria:**
- `RuntimeClient` can communicate with Sidecar
- Token is stored in localStorage
- Settings UI allows pairing

---

#### Step 1.6: Agent Engine Integration (1 hour)

**Files to Modify:**
```
src/
├── lib/
│   └── ai.ts (or agent-engine/lib/router.ts)
```

**Tasks:**

**1.6.1: Tool Call Routing**
- Update `AIService` or router to detect tool calls:
  - `run_terminal` → Call `runtimeClient.executeCommand()`
  - `read_file` → Call `runtimeClient.readFile()`
  - `write_file` → Call `runtimeClient.writeFile()`
- Add tool definitions to system prompts:
  ```typescript
  const tools = [
    {
      name: "run_terminal",
      description: "Execute a shell command",
      parameters: {
        command: "string",
        cwd: "string (optional)",
        timeout: "number (optional)"
      }
    },
    // ... more tools
  ];
  ```

**1.6.2: Approval Gate UI**
- If command requires approval, show modal:
  - Command preview
  - Risk level badge
  - "Approve" / "Reject" buttons
- Only execute after user approval

**Acceptance Criteria:**
- LLM tool calls route to Sidecar
- Approval modal appears for high-risk commands
- Command results feed back to LLM for next step

---

### Testing Checklist

- [ ] Server starts and `/health` responds
- [ ] Token auth blocks unauthorized requests
- [ ] Path sandbox prevents `../` traversal
- [ ] Command validator categorizes commands
- [ ] `/execute` runs `npm test` successfully
- [ ] `/fs/read` reads file within workspace
- [ ] `/fs/write` writes file within workspace
- [ ] Frontend `RuntimeClient` connects to Sidecar
- [ ] Settings UI allows token pairing
- [ ] Agent can execute commands via chat
- [ ] Approval modal appears for `rm -rf`

---

## Part 2: Agent Memory System (Phase 11)

### Overview
A persistent memory system that allows agents to store and retrieve context across conversations, enabling long-term knowledge retention and context-aware responses.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Chat Interface                                         │
│  └─> useAIChat hook                                     │
│      └─> useAgentMemory hook ─────────────────────────┐ │
└─────────────────────────────────────────────────────────┘ │
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────┐
│  Memory Service Layer                                   │
│  ├─> useAgentMemory.ts (React Hook)                     │
│  ├─> memoryService.ts (Business Logic)                 │
│  └─> memoryRetrieval.ts (Semantic Search)              │
└─────────────────────────────────────────────────────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Database                                      │
│  └─> agent_memory table (already exists)                │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 2.1: Memory Service Layer (1.5 hours)

**Files to Create:**
```
src/
├── features/
│   └── memory/
│       ├── index.ts
│       ├── hooks/
│       │   └── useAgentMemory.ts
│       ├── services/
│       │   ├── memoryService.ts
│       │   └── memoryRetrieval.ts
│       └── types/
│           └── index.ts
```

**Tasks:**

**2.1.1: Type Definitions (`types/index.ts`)**
```typescript
export type MemoryScope = 'global' | 'agent' | 'task' | 'session' | 'conversation';
export type MemoryType = 'fact' | 'preference' | 'context' | 'instruction' | 'learned' | 'summary';

export interface AgentMemory {
  id: string;
  user_id: string;
  key: string;
  value: string;
  scope: MemoryScope;
  memory_type: MemoryType;
  agent_id?: string;
  task_id?: string;
  conversation_id?: string;
  metadata?: Record<string, unknown>;
  relevance_score?: number;
  access_count: number;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_permanent: boolean;
}

export interface CreateMemoryInput {
  key: string;
  value: string;
  scope?: MemoryScope;
  memory_type?: MemoryType;
  agent_id?: string;
  task_id?: string;
  conversation_id?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  is_permanent?: boolean;
}

export interface MemorySearchParams {
  query: string;
  scope?: MemoryScope;
  agent_id?: string;
  limit?: number;
  min_relevance?: number;
}
```

**2.1.2: Memory Service (`services/memoryService.ts`)**
```typescript
import { supabase } from '@/integrations/supabase/client';
import type { AgentMemory, CreateMemoryInput, MemorySearchParams } from '../types';

export class MemoryService {
  // Create memory
  async create(input: CreateMemoryInput): Promise<AgentMemory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('agent_memory')
      .insert({
        user_id: user.id,
        ...input,
        scope: input.scope || 'global',
        memory_type: input.memory_type || 'fact',
        is_permanent: input.is_permanent ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AgentMemory;
  }

  // Get memory by key
  async getByKey(key: string, agent_id?: string, scope?: MemoryScope): Promise<AgentMemory | null> {
    // Implementation
  }

  // Update memory
  async update(id: string, updates: Partial<CreateMemoryInput>): Promise<AgentMemory> {
    // Implementation
  }

  // Delete memory
  async delete(id: string): Promise<void> {
    // Implementation
  }

  // Search memories (semantic search placeholder - can enhance with embeddings later)
  async search(params: MemorySearchParams): Promise<AgentMemory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('agent_memory')
      .select('*')
      .eq('user_id', user.id)
      .or(`key.ilike.%${params.query}%,value.ilike.%${params.query}%`);

    if (params.scope) query = query.eq('scope', params.scope);
    if (params.agent_id) query = query.eq('agent_id', params.agent_id);

    const { data, error } = await query
      .order('relevance_score', { ascending: false, nullsFirst: false })
      .limit(params.limit || 10);

    if (error) throw error;
    return (data || []) as AgentMemory[];
  }

  // Get context for agent (retrieve relevant memories)
  async getContext(agent_id: string, conversation_id?: string, limit = 5): Promise<AgentMemory[]> {
    // Implementation
  }

  // Increment access count
  async recordAccess(id: string): Promise<void> {
    // Implementation
  }
}

export const memoryService = new MemoryService();
```

**Acceptance Criteria:**
- CRUD operations work correctly
- Search returns relevant results
- Access tracking increments correctly

---

#### Step 2.2: React Hook (`hooks/useAgentMemory.ts`) (1 hour)

**Tasks:**

```typescript
import { useState, useCallback } from 'react';
import { memoryService } from '../services/memoryService';
import type { AgentMemory, CreateMemoryInput, MemorySearchParams } from '../types';

export function useAgentMemory() {
  const [memories, setMemories] = useState<AgentMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (input: CreateMemoryInput) => {
    setLoading(true);
    try {
      const memory = await memoryService.create(input);
      setMemories(prev => [...prev, memory]);
      return memory;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (params: MemorySearchParams) => {
    setLoading(true);
    try {
      const results = await memoryService.search(params);
      setMemories(results);
      return results;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getContext = useCallback(async (agent_id: string, conversation_id?: string) => {
    return await memoryService.getContext(agent_id, conversation_id);
  }, []);

  // ... more methods

  return {
    memories,
    loading,
    error,
    create,
    search,
    getContext,
    // ... more methods
  };
}
```

**Acceptance Criteria:**
- Hook provides clean API for components
- Loading/error states handled correctly
- State updates correctly

---

#### Step 2.3: Memory Retrieval Integration (1.5 hours)

**Files to Modify:**
```
src/
├── agent-engine/
│   ├── hooks/
│   │   └── useAIChat.ts
│   └── lib/
│       └── prompts.ts
```

**Tasks:**

**2.3.1: Context Injection (`useAIChat.ts`)**
- Before sending message to LLM:
  1. Call `useAgentMemory().getContext(agent_id, conversation_id)`
  2. Format memories as context:
     ```
     Previous Context:
     - [Memory 1]: value
     - [Memory 2]: value
     ```
  3. Append to system prompt or messages

**2.3.2: Auto-Save Memories (`useAIChat.ts`)**
- After LLM response, extract key facts:
  - Use simple pattern matching or LLM extraction
  - Save as `memory_type: 'fact'` or `'learned'`
- Example: "User prefers dark mode" → Save as preference

**2.3.3: Memory Summarization (Optional)**
- For long conversations, create summary memory:
  - `memory_type: 'summary'`
  - `scope: 'conversation'`
  - Compress conversation history

**Acceptance Criteria:**
- Context is injected into LLM prompts
- Key facts are automatically saved
- Memory retrieval improves response relevance

---

#### Step 2.4: Memory Management UI (1 hour)

**Files to Create/Modify:**
```
src/
├── pages/
│   └── MemoryPage.tsx (already exists, enhance it)
├── components/
│   └── memory/
│       ├── MemoryList.tsx
│       ├── MemoryCard.tsx
│       └── MemorySearch.tsx
```

**Tasks:**

**2.4.1: Memory List View**
- Display all memories in a table/cards
- Filter by scope, agent_id, memory_type
- Show access_count, last_accessed_at
- Allow edit/delete

**2.4.2: Memory Search**
- Search bar with real-time results
- Highlight matching text
- Sort by relevance_score

**2.4.3: Memory Creation Form**
- Manual memory creation
- Select scope, type, agent
- Set expiration date

**Acceptance Criteria:**
- UI displays memories correctly
- Search works in real-time
- CRUD operations work from UI

---

### Testing Checklist

- [ ] Memory CRUD operations work
- [ ] Search returns relevant results
- [ ] Context is injected into LLM prompts
- [ ] Auto-save extracts key facts
- [ ] Memory UI displays correctly
- [ ] Access tracking increments
- [ ] Expired memories are filtered out

---

## Implementation Order & Timeline

### Day 1: Local Runtime Foundation
**Morning (4 hours):**
- Step 1.1: Initialize Python Server
- Step 1.2: Security Layer

**Afternoon (4 hours):**
- Step 1.3: Terminal Execution API
- Step 1.4: Filesystem API

### Day 2: Runtime Integration + Memory Foundation
**Morning (4 hours):**
- Step 1.5: Frontend Bridge
- Step 1.6: Agent Engine Integration

**Afternoon (4 hours):**
- Step 2.1: Memory Service Layer
- Step 2.2: React Hook

### Day 3: Memory Integration & Polish
**Morning (4 hours):**
- Step 2.3: Memory Retrieval Integration
- Step 2.4: Memory Management UI

**Afternoon (4 hours):**
- Testing & Bug Fixes
- Documentation Updates

---

## Dependencies & Prerequisites

### Local Runtime
- Python 3.11+ installed
- `pip` available
- Port 8000 available
- Workspace directory exists

### Agent Memory
- Supabase connection working
- `agent_memory` table exists (✅ Already done)
- User authentication working (✅ Already done)

---

## Risk Mitigation

### Security Risks (Local Runtime)
- **Risk:** Malicious command execution
- **Mitigation:** Strict allowlist, approval gates, path sandboxing

### Performance Risks (Memory)
- **Risk:** Too many memories slow down retrieval
- **Mitigation:** Limit context window, use relevance scoring, implement pagination

### Integration Risks
- **Risk:** Frontend/Sidecar communication fails
- **Mitigation:** Health checks, error handling, graceful degradation

---

## Success Metrics

### Local Runtime
- ✅ Agent can execute `npm test` via chat
- ✅ Agent can read/write files via chat
- ✅ Approval modal appears for high-risk commands
- ✅ Zero security incidents

### Agent Memory
- ✅ Context improves LLM response relevance by 30%+
- ✅ Memories persist across sessions
- ✅ Search finds relevant memories in <100ms
- ✅ Auto-save captures 80%+ of key facts

---

## Next Steps After Completion

1. **Enhance Memory System:**
   - Add vector embeddings for semantic search
   - Implement memory summarization
   - Cross-agent memory sharing

2. **Enhance Runtime:**
   - WebSocket streaming for terminal
   - Git operations API
   - Docker container management

3. **Integration:**
   - Connect memory to calendar events
   - Use memory in workflow automation
   - Memory-driven agent selection

---

*Plan created: December 25, 2025*
*Status: Ready for Implementation*
