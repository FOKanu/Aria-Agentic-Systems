# Access Features: Agentic Runtime & System Integration

## Overview
This document outlines the **Local Agent Runtime (Sidecar)**, a critical component that gives ARIA "hands" to interact with the host operating system. This is what differentiates ARIA from a web app and makes it an "Agentic IDE".

---

## The "Sidecar" Pattern

ARIA runs as a secure web application (React/Vite). Browsers are sandboxed and cannot run `npm install`, read `/etc/hosts`, or execute Python scripts. To bypass this safely, we implement a **Local Runtime Server** that runs alongside the frontend.

**Architecture:**
`React Frontend (The Brain)` <--> `HTTP/WebSocket` <--> `Python Sidecar (The Hands)` <--> `Operating System`

---

## 1. API Schema (Sidecar Interface)

The Sidecar exposes a REST API (FastAPI) on `http://localhost:8000`.

### A. Terminal Execution
**Endpoint:** `POST /execute`
**Description:** Run a shell command in a specific directory.

**Request:**
```json
{
  "command": "npm run test",
  "cwd": "/Users/francis/projects/my-app",
  "timeout": 30000
}
```

**Response (Streaming or JSON):**
```json
{
  "stdout": "> my-app@1.0.0 test\n> vitest\n\n...",
  "stderr": "",
  "exit_code": 0
}
```

**Security Controls:**
*   **Allowlist:** Only permit safe commands (`git`, `npm`, `ls`, `cat`) by default.
*   **Blocklist:** Block dangerous commands (`rm -rf /`, `mkfs`, `dd`).
*   **Approval Gate:** Commands categorized as "High Risk" require user confirmation in the UI before execution.

### B. File System Operations
**Endpoint:** `POST /fs/read`
**Request:** `{ "path": "src/App.tsx" }`
**Response:** `{ "content": "..." }`

**Endpoint:** `POST /fs/write`
**Request:** `{ "path": "src/App.tsx", "content": "..." }`
**Response:** `{ "success": true, "bytes_written": 1024 }`

**Endpoint:** `POST /fs/tree`
**Request:** `{ "path": ".", "depth": 2 }`
**Response:** JSON tree structure of the project.

### C. Analysis Tools
**Endpoint:** `POST /analyze/grep`
**Request:** `{ "pattern": "TODO:", "path": "src" }`

**Endpoint:** `POST /analyze/ast`
**Request:** `{ "path": "src/utils.ts" }`
**Response:** Parsed Abstract Syntax Tree (for smarter code editing).

---

## 2. Implementation Plan

### Step 1: Python Server Setup
1.  Initialize `server/` directory.
2.  Install `fastapi`, `uvicorn`, `pydantic`.
3.  Create `main.py` with CORS configured for `localhost:5173`.

### Step 2: Secure Command Runner
1.  Implement `subprocess.run` wrapper.
2.  Create `Sandbox` class to validate paths (prevent `../` traversal out of project root).
3.  Implement `CommandValidator` with regex rules.

### Step 3: Frontend Integration
1.  Create `src/agent-engine/services/runtimeBridge.ts`.
2.  Implement `executeCommand(cmd: string)` function.
3.  Update `AIService` to route tool calls:
    *   If tool is `run_terminal` -> Call `runtimeBridge`.
    *   If tool is `web_search` -> Call `lovableAI`.

### Step 4: UI Feedback
1.  Add "Terminal" tab to `FloatingChatPanel`.
2.  Render live stdout/stderr streams.
3.  Add "Approve Execution" modal for sensitive commands.

---

## 3. Security & Safety (Non-Negotiable)

1.  **Localhost Only:** The Sidecar MUST bind to `127.0.0.1` only. Never `0.0.0.0`.
2.  **Auth Token:** Generated on startup, printed to console. User must enter this token in ARIA Settings to "pair" the UI with the Runtime.
3.  **Scoped Access:** Sidecar defaults to the directory it was started in. Accessing parent directories is forbidden.

---

## 4. Future Expansion: Visual Control (Phase 3)

Once the Terminal/File API is stable, we can add:
*   **Screen Capture:** `GET /screen/capture` returns base64 image.
*   **Mouse/Keyboard:** `POST /input/click` (via PyAutoGUI).
*   *Note:* This is dangerous and requires strict "Human-in-the-loop" supervision.
