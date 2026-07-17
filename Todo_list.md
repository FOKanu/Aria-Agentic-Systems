# ARIA Agent Control Center — Implementation Roadmap

## Overview
This document tracks remaining phases for ARIA as an **Agent Control Center**: agents must **act** (tools + sidecar), not only chat. Prefer wiring the existing agent-engine stack over adopting external frameworks (Hermes / OpenClaw) until the internal loop is live.

**Last Updated:** 2026-07-17

---

## Current Snapshot (July 2026)

| Area | Status | Notes |
|------|--------|-------|
| Hybrid chat LLM | ✅ Done | Ollama via SSH tunnel (`qwen3:8b`) → Gemini fallback (`AIService`) |
| Python sidecar | ✅ Built | `server/` FastAPI on `:8000` (token, FS, execute) |
| `runtimeBridge` + Settings pairing | ✅ Built | Not used by Chat yet |
| `useAIChat` + `toolRegistry` | ✅ Built | **Disconnected** from Chat UI |
| Approvals / Monitoring / Agents pages | 🟡 UI only | Mostly mocks; not driven by real tool events |
| Agent memory in chat loop | 🔴 Not wired | Provider/schema exist; Memory page is mock |

**Gap:** Chat talks via `AIService`; acting stack (`useAIChat` → tools → sidecar) is unused.

---

## Phase 6: Chat Edge Function with Lovable AI Integration
**Status:** 🟢 Mostly Complete  
**Priority:** High  

### Tasks
- [x] Enable Lovable Cloud for edge functions and LOVABLE_API_KEY
- [x] Create `supabase/functions/chat/index.ts` edge function
- [x] Update `ChatPage.tsx` to use real AI instead of mock responses
- [x] Implement SSE streaming for real-time token delivery
- [x] Hybrid local-first: Ollama (`localhost:11434/v1`) → Gemini fallback
- [x] Wire remote GPU Ollama via SSH tunnel + `VITE_LOCAL_MODEL_*` env
- [ ] Forward `tools` through cloud edge function (optional; tools may stay local-only for MVP)
- [ ] Add error handling polish for rate limits (429) and payment issues (402)

---

## Phase 7: Database Integration
**Status:** 🟢 Completed  

- [x] Database schema for tasks, contacts, documents, agent_memory
- [x] SQL migrations executed
- [x] Row Level Security (RLS) policies implemented
- [x] Provider abstraction layer created
- [x] Supabase client configured

---

## Phase 8: Authentication
**Status:** 🟢 Completed  

- [x] useAuth hook with Supabase Auth
- [x] Login / Signup / Forgot password pages
- [x] Auto-confirm email enabled

---

## Phase 16: Local Agent Runtime (The "Hands")
**Status:** 🟡 Built — not wired to Chat  
**Priority:** Critical  

### Completed
- [x] Python FastAPI sidecar scaffold (`server/`)
- [x] Token auth, path sandbox, command validator
- [x] `POST /execute`, `/execute/stream`, `/fs/read|write|list`, `GET /health`
- [x] Frontend `runtimeBridge.ts` + Settings Runtime pairing UI
- [x] `TerminalOutput` component mounted in app shell

### Remaining (ops / polish)
- [ ] Fix sidecar CORS for Vite port **8080** (currently allows `:5173` only)
- [ ] Document pairing + tunnel checklist for Mac ↔ Windows Ollama box
- [ ] HITL path for stream mode (approval-needed cmds currently rejected on stream)

---

## Phase 18: Agent Layer Integration (Control Center Core)
**Status:** 🔴 Not Started — **NEXT CRITICAL PATH**  
**Priority:** Critical  
**Goal:** One execution path where Chat / floating chat / workflows drive `useAIChat` → tools → sidecar, with HITL and observability.

### Design principles
1. One execution path for all agent actions  
2. Brain (Ollama) decides; hands (sidecar) execute  
3. Policy before power (Settings autonomy gates tools)  
4. HITL for medium/high risk  
5. Observable by default  
6. Reuse existing code; defer Hermes/OpenClaw until Phase 18 MVP ships  

### Sprint 1 — Unify chat on agent loop
- [x] Fix sidecar CORS for `http://localhost:8080`
- [x] Switch `ChatPage` off bare `AIService.chat` → shared `runAgentChatTurn`
- [x] Switch `useChatContext` / FloatingChat to same runner
- [x] Map agent selector → engine role prompts (`prompts.ts` via runner)
- [x] Show active model + routing reason in chat chrome
- [x] Keep `AIService` for vision / simple helpers only
- [x] Tools remain **disabled** (`enableTools: false`) until Sprint 2

### Sprint 2 — Real tool-calling to the model
- [x] Pass `tools` in `callLocalModelStreaming` / `callLocalModel` bodies
- [x] Non-stream tool rounds via `callLocalModelForTools` (more reliable with Ollama)
- [x] Soft JSON tool-call text fallback
- [x] Agent runner tool loop (max 3 rounds), **local-only** when sidecar ready
- [x] Enable tools in Chat / floating chat (`enableTools: true`, gated on runtime)
- [x] Verified Ollama `qwen3:8b` returns `tool_calls` for `fs_list`
- [ ] Smoke test end-to-end `fs_list` with sidecar paired (user: start `server/` + token)
- [x] Cloud path stays text-only for MVP (no tools forward)

### Sprint 3 — Hands loop + HITL
- [x] Emit `terminalSignals` from non-stream `/execute` (Terminal panel)
- [x] Server `approved` flag for post-HITL re-run; hard blocks never run
- [x] `onApprovalRequired` pause in tool loop (`execute_command`, `fs_write`)
- [x] Drive `ApprovalInline` on ChatPage + FloatingChat
- [x] Gate tools when runtime unpaired (from Sprint 2)
- [ ] Prefer stream for allowlisted cmds (optional polish; non-stream + signals works)
- [ ] End-to-end smoke with live sidecar on free port

### Sprint 4 — Policy layer
- [ ] Enforce autonomy modes: `manual` / `assisted` / `autonomous`
- [ ] Enforce Settings toggles (terminal, files, etc.) inside `executeToolCall`
- [ ] Persist policy (not local React state only)

### Sprint 5 — Control-center surfaces
- [ ] Emit structured events (tool, args, risk, exit, agent id)
- [ ] Bind Monitoring / Execution Trace / Tool Monitor to real events
- [ ] Home pending approvals from live queue
- [ ] Agents page: live status for active run (single session first)

### Sprint 6 — Memory in the loop
- [ ] Inject/retrieve via `LovableCloudMemoryProvider` in `useAIChat`
- [ ] Auto-save key facts after turns
- [ ] Replace Memory page mocks with live data

### Sprint 7 — Workflows as triggers
- [ ] Workflow “Run” invokes same agent job loop
- [ ] Calendar / event monitor can enqueue approved agent tasks

### Sprint 8 — Optional external runtime (later)
- [ ] Evaluate Hermes / OpenClaw as **sidecar peer** only if internal loop outgrown
- [ ] Do **not** replace Phases 18.1–18.5 with an external framework

### MVP definition (“agents can act”)
- [ ] User chats in UI  
- [ ] Agent can list/read a file or run an allowlisted command via sidecar  
- [ ] Risky command shows Approve/Reject and does not run until approved  
- [ ] Terminal / monitoring shows the real result  
- [ ] Sidecar/Ollama down → clear degrade (chat-only / Gemini; tools disabled)

---

## Phase 9: Capability Pages
**Status:** 🟡 In Progress  
**Priority:** High (after Phase 18 MVP preferred for agent-driven features)

### Admin Hub
| Sub-Category | Status | Agent | Description |
|-------------|--------|-------|-------------|
| Calendar Management | 🟡 Basic | Orion | Scheduling, reminders, meeting coordination |
| Email Automation | 🟡 Basic | Aria | Drafting, filtering, auto-responses |
| Reservations & Booking | 🔴 Not Started | Orion | Restaurant, travel, venue bookings |
| Contact Management | 🟡 Basic | Echo | CRM updates, contact organization |
| Workflow Automation | 🟡 Basic | Atlas | Task chains — needs Phase 18 for real runs |

### Finance / Legal / DevOps / Social
(Unchanged detail tables — most pages still UI shells; connect to agent loop after Phase 18.)

| Module | Status |
|--------|--------|
| Finance | 🔴 Mostly not started |
| Legal | 🟡 Partial UI |
| DevOps | 🟡 Partial UI |
| Social Media | 🔴 Not started |

---

## Phase 10: Provider Configuration
**Status:** 🟡 In Progress  
**Priority:** Medium  

- [x] Database table for provider_config
- [ ] Settings UI for provider switching
- [ ] Support for: Lovable Cloud, Local Storage, AWS S3, Custom API

---

## Phase 11: Agent Memory & Context
**Status:** 🟡 Schema ready — loop not wired  
**Priority:** High (after Sprint 3; detailed in Sprint 6)  
**Dependencies:** Phase 7 ✅, Phase 18 Sprints 1–3 preferred

- [x] Database schema for agent_memory
- [x] `LovableCloudMemoryProvider` CRUD (exists)
- [ ] Memory hooks for chat inject/save (`useAgentMemory` or provider in `useAIChat`)
- [ ] Context retrieval system in live chat
- [ ] Memory summarization
- [ ] Live Memory page (replace mocks)

---

## Explicit non-goals (for now)

- Do **not** replace Ollama wiring with Hermes/OpenClaw before Phase 18 MVP  
- Do **not** build more Agents UI chrome while Chat cannot call tools  
- Do **not** enable Autonomous mode until policy + approval are real  

---

## Quick Reference

| Phase | Name | Status |
|-------|------|--------|
| 6 | Chat / Hybrid LLM | 🟢 Done (tools on cloud pending) |
| 7 | Database | 🟢 Complete |
| 8 | Authentication | 🟢 Complete |
| 9 | Capability Pages | 🟡 In Progress |
| 10 | Provider Configuration | 🟡 In Progress |
| 11 | Agent Memory | 🟡 Schema ready |
| 16 | Local Agent Runtime | 🟡 Built, not wired to Chat |
| **18** | **Agent Layer Integration** | **🔴 Next critical path** |

### Recommended build order
1. Phase 18 Sprint 1–3 (unify loop + tools + HITL) → **MVP agents can act**  
2. Sprint 4–5 (policy + monitoring)  
3. Phase 11 / Sprint 6 (memory)  
4. Sprint 7 (workflows)  
5. Phase 9 capability pages that need real agent actions  
6. Sprint 8 external frameworks only if needed  

---

*Last Updated: 2026-07-17*
