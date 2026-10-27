# Implementation Plan: Local Agent Runtime, Agent Memory & Agent Layer Integration

**Project:** ARIA - Agent Command Center  
**Created:** December 25, 2025  
**Last Updated:** July 17, 2026  
**Focus:** Phase 16 (Local Runtime) + Phase 11 (Agent Memory) + **Phase 18 (Agent Layer / Control Center wiring)**

---

## Executive Summary

ARIA is an **Agent Control Center**. Chat alone is insufficient; agents must **act** via tools and the local sidecar.

| Workstream | Status (July 2026) |
|------------|-------------------|
| 1. Local Agent Runtime (Sidecar) | ✅ **Built** (`server/`, `runtimeBridge`, Settings pairing). CORS for `:8080` and Chat wiring still open. |
| 2. Agent Memory System | 🟡 Schema + provider exist; **not** in the live chat loop; Memory page still mock. |
| 3. Agent Layer Integration (Phase 18) | 🔴 **Critical path** — connect Chat UI → `useAIChat` → `toolRegistry` → sidecar + HITL + monitoring. |

**LLM wiring (done):** Tunneled Ollama (`http://localhost:11434/v1`, default `qwen3:8b`) with Gemini cloud fallback via `AIService`. That is the brain for Q&A; Phase 18 makes it the brain for **acting**.

**Decision:** Reuse the homegrown agent-engine first. Evaluate Hermes / OpenClaw only after Phase 18 MVP as an optional peer runtime — not as a replacement for wiring Chat to tools.

**Priority:** Phase 18 Sprints 1–3 are the blocker for “agents can act.”

---

## Status vs original plan (doc drift corrected)

| Original Step | Plan said | Reality (July 2026) |
|---------------|-----------|---------------------|
| 1.1–1.5 Sidecar + bridge | To build | Implemented under `server/` and `src/agent-engine/services/runtimeBridge.ts` |
| 1.6 Agent engine integration | Wire tools into chat | `useAIChat` + `toolRegistry` exist but **ChatPage still uses `AIService` (no tools)** |
| Part 2 Memory | To build | Provider/CRUD largely present; inject/save/UI not wired |
| External frameworks | Not in scope | Still out of scope until Phase 18 MVP |

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

**Status (July 2026):** Partially done offline from Chat.

**Already exists:**
- `src/agent-engine/hooks/useAIChat.ts` — tool loop + recursive follow-up
- `src/agent-engine/services/toolRegistry.ts` — `fs_list`, `fs_read`, `fs_write`, `execute_command`
- `src/agent-engine/lib/prompts.ts` — role system prompts
- Approval UI components (`ApprovalInline`) — not driven by real sidecar events

**Still open (moved to Part 3 / Phase 18):**
- ChatPage / FloatingChat still call `AIService` (text-only hybrid chat)
- `callLocalModelStreaming` does not send `tools` in the request body
- Sidecar CORS likely limited to `:5173`; app runs on `:8080`
- Settings autonomy toggles not enforced on tool execution
- Monitoring / Agents pages not bound to live tool events

See **Part 3** below for the full control-center wiring plan.

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

## Part 3: Agent Layer Integration — Control Center Wiring (Phase 18)

**Priority:** Critical  
**Depends on:** Part 1 sidecar (✅), Ollama hybrid chat (✅)  
**Outcome:** ARIA behaves as an Agent Control Center — agents act with HITL and observability.

### Target architecture

```
User (Chat / Floating / Workflow)
        │
        ▼
   useAIChat (+ router, role prompts, memory)
        │
        ├─► Ollama (tunneled) ── tool_calls ──┐
        │                                     │
        └─► Gemini fallback (chat-only if tools local-only)
                                              ▼
                                       toolRegistry
                                              │
                                    policy gate (Settings)
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                     allowlisted execute              requires_approval
                              │                               │
                              ▼                               ▼
                       runtimeBridge                  ApprovalInline
                              │                         (Approve/Reject)
                              ▼                               │
                    Sidecar :8000 ◄───────────────────────────┘
                              │
                              ▼
                    Terminal / Monitoring events
```

### Design principles
1. **One execution path** — Chat, floating chat, workflows share `useAIChat` + tools  
2. **Brain vs hands** — Ollama decides; sidecar executes  
3. **Policy before power** — autonomy + permission toggles gate tools  
4. **HITL for risk** — medium/high commands pause for Approve/Reject  
5. **Observable by default** — every tool call emits structured events  
6. **Reuse first** — no Hermes/OpenClaw until this MVP ships  

### Sprint 3.1 — Unify chat on the agent loop
**Files:** `ChatPage.tsx`, `useChatContext.tsx`, `FloatingChatPanel.tsx`, `server/` CORS, `prompts.ts`

**Tasks:**
1. Allow CORS origins `http://localhost:8080` and `http://127.0.0.1:8080` on sidecar  
2. Replace `AIService.chat` / stream paths in Chat + floating chat with `useAIChat`  
3. Map agent selector IDs to engine role prompts  
4. Surface model + routing reason in chat chrome  
5. Keep `AIService` for vision / non-agent helpers only  

**Acceptance:**
- Chat still works with Ollama / Gemini  
- Single code path for conversational brain  
- Tools may still be disabled until Sprint 3.2  

---

### Sprint 3.2 — Real tool-calling to the model
**Files:** `localModel.ts`, `useAIChat.ts`, `toolRegistry.ts`, optionally `supabase/functions/chat`

**Tasks:**
1. Include OpenAI-style `tools` (and `tool_choice`) in local streaming/non-streaming requests  
2. Validate against tunneled Ollama + `qwen3:8b` / prefer `qwen2.5-coder:32b` for tool demos  
3. Add prompt/JSON fallback if the model omits structured `tool_calls`  
4. Decide: tools **local-only** for MVP vs forward tools through edge function  

**Acceptance:**
- Model can emit at least one tool call for “list files in this project”  
- `fs_list` executes via sidecar and result returns to the model  

---

### Sprint 3.3 — Hands loop + HITL
**Files:** `runtimeBridge.ts`, `ApprovalInline.tsx`, `ChatPage.tsx`, `TerminalOutput.tsx`

**Tasks:**
1. Ensure live chat executes tools only when runtime is paired + healthy  
2. Map `requires_approval` → pending approval UI (replace mock random approvals)  
3. Prefer `POST /execute` for gated commands; stream allowlisted cmds to Terminal  
4. Feed tool results back into `useAIChat` continuation  

**Acceptance:**
- Allowlisted command runs end-to-end from chat  
- High-risk command waits for Approve/Reject and does not run until decided  
- Terminal shows real stdout/stderr  

---

### Sprint 3.4 — Policy layer
**Files:** `SettingsPage.tsx`, tool execution gate, persistence (localStorage or DB)

**Tasks:**
1. Enforce `manual` / `assisted` / `autonomous` in `executeToolCall`  
2. Enforce terminal/files (and other) permission toggles  
3. Persist policy across reloads  

**Acceptance:**
- Disabled terminal toggle blocks `execute_command` with a clear error  
- Manual mode always requires approval for side-effecting tools  

---

### Sprint 3.5 — Control-center surfaces
**Files:** Monitoring pages, Home approvals, Agents pages, event bus/store

**Tasks:**
1. Define a small event schema: `{ id, agentId, tool, args, risk, status, exitCode, ts }`  
2. Publish from tool loop; subscribe in Monitoring / Tool Monitor / Execution Trace  
3. Home “pending approvals” reads live queue  
4. Agents page shows active run status (single session first; multi-agent later)  

**Acceptance:**
- Running a tool updates Monitoring without mocks  
- Approvals appear on Home when pending  

---

### Sprint 3.6 — Memory in the loop (aligns with Part 2 Steps 2.3–2.4)
**Files:** `useAIChat.ts`, memory provider, `MemoryPage.tsx`

**Tasks:**
1. Inject relevant memories into system context before each agent turn  
2. Persist notable facts after turns  
3. Replace Memory page mocks with provider data  

**Acceptance:**
- Second session can recall a stored preference  
- Memory page lists real rows for the signed-in user  

---

### Sprint 3.7 — Workflows as triggers
**Files:** `WorkflowsPage.tsx`, `useEventMonitor.ts`

**Tasks:**
1. Workflow Run enqueues the same agent job loop  
2. Calendar auto-start can request approved agent tasks  

**Acceptance:**
- “Run workflow” produces a real tool/chat agent run, not a toast-only simulation  

---

### Sprint 3.8 — Optional external agent runtime (later)
**Only if** persistent skills, multi-channel gateways, or long-running cron outgrow the custom loop.

- Evaluate Hermes / OpenClaw as a **peer** process ARIA supervises  
- Do **not** rip out Phase 18; keep ARIA as the control UI  

---

### Phase 18 MVP checklist (“agents can act”)

- [ ] User chats in UI  
- [ ] Agent lists/reads a file or runs an allowlisted command via sidecar  
- [ ] Risky command shows Approve/Reject and does not run until approved  
- [ ] Terminal / monitoring shows the real result  
- [ ] Sidecar or Ollama down → clear degrade (tools off; chat may use Gemini)  

---

### Risks (Phase 18)

| Risk | Mitigation |
|------|------------|
| Qwen/Ollama weak tool calling | Prefer coder model for demos; JSON tool-prompt fallback |
| Dual chat paths (`AIService` vs `useAIChat`) | Migrate Chat in Sprint 3.1 immediately |
| Stream execute skips approval | Gated cmds via `/execute` + UI pause |
| CORS `:8080` vs `:5173` | Fix in Sprint 3.1 before tool testing |
| Sidecar = real OS access | Keep localhost-only, token pairing, allowlist, HITL |
| Premature framework adoption | Defer Hermes/OpenClaw until MVP checklist passes |

---

## Implementation Order & Timeline (updated July 2026)

### Done
- Day 1–2 equivalent: Sidecar + security + FS/terminal APIs + frontend bridge + Settings pairing  
- Hybrid LLM: Ollama tunnel + Gemini fallback for chat  

### Now (Week 1) — Phase 18 MVP
- Sprint 3.1 Unify chat on `useAIChat` + CORS  
- Sprint 3.2 Tools in Ollama requests + smoke test  
- Sprint 3.3 HITL + Terminal  

### Next (Week 2)
- Sprint 3.4 Policy  
- Sprint 3.5 Monitoring / Approvals / Agents status  

### Then (Week 3)
- Sprint 3.6 Memory inject/save + Memory UI  
- Sprint 3.7 Workflows as triggers  
- Resume capability pages that need real agent actions  

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
- ✅ Sidecar runs on `127.0.0.1:8000` with token pairing
- ⬜ Agent can execute allowlisted command **via chat** (Phase 18)
- ⬜ Agent can read/write files **via chat** (Phase 18)
- ⬜ Approval UI appears for high-risk commands (Phase 18)
- ⬜ Zero security incidents

### Agent Layer / Control Center
- ⬜ Single execution path (`useAIChat`) for Chat + floating chat
- ⬜ Tools reach Ollama request body
- ⬜ Monitoring shows live tool events (no mocks for active run)
- ⬜ Settings policy actually blocks disallowed tools

### Agent Memory
- ⬜ Context improves continuity across sessions
- ⬜ Memories persist and appear on Memory page
- ⬜ Search finds relevant memories in <100ms

---

## Next Steps After Phase 18 MVP

1. **Memory depth:** embeddings, summarization, cross-agent shared memory  
2. **Runtime depth:** richer streaming HITL, git helpers, optional analyze endpoints  
3. **Capability pages:** Finance/Legal/DevOps actions that call the same agent job API  
4. **Optional peer agents:** Hermes / OpenClaw supervised by ARIA UI if needed  

---

*Plan created: December 25, 2025*  
*Updated: July 17, 2026 — Part 3 Agent Layer Integration; Part 1 marked built; critical path = Phase 18 wiring*  
*Status: Phase 16 built; Phase 18 ready for implementation*
