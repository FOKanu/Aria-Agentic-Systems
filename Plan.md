# ARIA - Project Plan

**Project Creator:** Francis Okorie Iyeke-Kanu
**Contact:** francis.okorie.Ik@gmail.com
**Version:** 0.2.3-beta
**Last Updated:** July 17, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Phase Breakdown](#phase-breakdown)
4. [Critical Path to MVP](#critical-path-to-mvp)
5. [Milestone Timeline](#milestone-timeline)
6. [Key Decisions](#key-decisions)
7. [Technical Debt](#technical-debt)
8. [Risk Assessment](#risk-assessment)

---

## Project Overview

ARIA (AI Research & Intelligence Assistant) is a multi-agent AI command center designed to orchestrate specialized AI agents for research, development, and automation tasks across multiple domains.

### Key Objectives
- **Multi-Agent Orchestration:** Coordinate 8+ specialized AI agents
- **Local-First AI:** 95% local processing, 5% cloud fallback
- **Privacy-Centric:** Sensitive data processed locally
- **Cross-Platform:** Web-first, mobile-responsive design
- **Active Agentic Runtime:** Bridge gap between Web UI and Local System (Terminal/Files)

---

## Current Status

### ✅ Completed Phases

| Phase | Name | Description |
|-------|------|-------------|
| 1-5 | Core Infrastructure | UI components, navigation, agent system |
| 6 | Codebase Architecture | core/, shell/, features/ modules established |
| 6a | Hybrid AI Strategy | Local-first Ollama + Supabase/Gemini fallback |
| 6c | Remote Ollama wiring | SSH-tunneled Ollama (`qwen3:8b` default) via `VITE_LOCAL_MODEL_*` |
| 7 | Database Integration | Supabase tables, RLS policies, enums |
| 8 | Authentication | Login, signup, password recovery |
| 16a | Sidecar + Bridge | Python runtime, `runtimeBridge`, Settings pairing (built) |
| 17 | Calendar Automation | Workflow engine, event monitoring, persistence |

### 🟡 In Progress

| Phase | Name | Progress | Next Steps |
|-------|------|----------|------------|
| 9 | Capability Pages | 30% | Wire to agent loop after Phase 18 MVP |
| 10 | Provider Configuration | 40% | Settings UI, multi-provider support |
| 16 | Local Agent Runtime | 80% built / 0% chat-wired | CORS `:8080`; HITL stream path |
| **18** | **Agent Layer Integration** | **0%** | **Unify Chat → `useAIChat` → tools → sidecar** |

### 🔵 Ready to Start

| Phase | Name | Dependencies |
|-------|------|--------------|
| 6b | Migrate Imports | Use feature module public APIs |
| 11 | Agent Memory in loop | Phase 7 ✅; after Phase 18 Sprints 1–3 |
| 12 | Voice Integration | ElevenLabs API |

---

## Phase Breakdown

### Phase 9: Capability Pages
**Priority:** High
**Effort:** 2-3 weeks
**Build Order:** Optimized for dependencies

#### Build Order
1. **Admin Hub** (foundation) → Calendar (✅), Contacts, Email, Tasks
2. **Finance Module** → Invoices, Expenses, Budget, Reports
3. **Legal Module** → Contracts, NDA Generator, Compliance
4. **Social Media** → Scheduler, Analytics, Content Generation

#### Admin Hub
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| Calendar Management | ✅ Done | Secretary | Completed |
| Email Automation | 🟡 Basic | Secretary | 2 days |
| Reservations & Booking | 🔴 Not Started | Secretary | 2 days |
| Contact Management | 🟡 Basic | Secretary | 1 day |
| Workflow Automation | 🟡 Basic | Secretary | 3 days |

#### Finance Module
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| Invoice Generation | 🔴 Not Started | Accountant | 2 days |
| Expense Tracking | 🔴 Not Started | Accountant | 2 days |
| Budget Planning | 🔴 Not Started | Accountant | 2 days |
| Financial Reports | 🔴 Not Started | Accountant | 2 days |
| Payment Processing | 🔴 Not Started | Accountant | 1 day |
| Tax Preparation | 🔴 Not Started | Accountant | 1 day |

### Phase 16: Local Agent Runtime (The "Hands")
**Priority:** Critical (for active agent features)
**Effort:** Remaining ~2–3 days (wiring), not greenfield

| Task | Status | Details |
|------|--------|---------|
| Sidecar Setup | ✅ | Python FastAPI server under `server/` |
| Command Executor | ✅ | `/execute` + stream with validation |
| Filesystem API | ✅ | Read/Write/List endpoints |
| Frontend Bridge | ✅ | `runtimeBridge.ts` + Settings pairing |
| Terminal UI | 🟡 | Component exists; needs live agent events |
| CORS for `:8080` | 🔴 | Currently oriented to `:5173` |
| Chat → tools wiring | 🔴 | See Phase 18 |

### Phase 18: Agent Layer Integration (Control Center)
**Priority:** Critical — **next MVP blocker**
**Effort:** 1–2 weeks
**Docs:** `Todo_list.md`, `Implementation_Plan_Runtime_Memory.md` Part 3

| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Chat/Floating → `useAIChat`; CORS | 🔴 |
| 2 | Pass `tools` to Ollama; smoke `fs_list` | 🔴 |
| 3 | HITL approvals + Terminal | 🔴 |
| 4 | Settings policy enforcement | 🔴 |
| 5 | Monitoring / Home / Agents live events | 🔴 |
| 6 | Memory inject/save in loop | 🔴 |
| 7 | Workflows trigger agent jobs | 🔴 |
| 8 | Optional Hermes/OpenClaw peer (later) | ⏸ Deferred |

**MVP (“agents can act”):** chat → allowlisted tool via sidecar → risky cmds approve/reject → monitoring shows real I/O → clear degrade if runtime/Ollama down.

**Non-goal:** Do not adopt Hermes/OpenClaw *instead of* Phase 18; evaluate only after MVP.

### Phase 10: Provider Configuration
**Priority:** Medium
**Effort:** 3-4 days

| Task | Status | Details |
|------|--------|---------|
| Database table | ✅ | `provider_config` table created |
| Settings page UI | 🔴 | Provider selection per data type |
| Provider switching logic | 🔴 | Runtime provider selection |
| Multi-provider sync | 🔴 | Conflict resolution strategy |
| Fallback handling | 🔴 | Graceful degradation when primary fails |

### Phase 11: Agent Memory & Context
**Priority:** Medium
**Effort:** 4-5 days

| Task | Status | Details |
|------|--------|---------|
| Database schema | ✅ | `agent_memory` table complete |
| `useAgentMemory` hook | 🔴 | CRUD operations on memory table |
| Memory retrieval | 🔴 | Semantic search for context retrieval |
| Relevance scoring | 🔴 | Score memories by relevance to current task |
| Context window management | 🔴 | Limit tokens sent to AI |
| Memory summarization | 🔴 | Compress long conversations |
| Cross-agent memory | 🔴 | Shared knowledge between agents |

---

## Critical Path to MVP

```
Now:   Phase 18 (Agent Layer) → Agents can ACT
       └── Sprint 1: Chat → useAIChat + CORS :8080
       └── Sprint 2: Tools in Ollama requests
       └── Sprint 3: HITL + Terminal + runtime gate
       └── MVP checklist: file/cmd via chat, approvals, monitoring

Next:  Phase 18 Sprints 4–5 → Policy + live control-center surfaces
Then:  Phase 11 / Sprint 6 → Memory in the loop
Then:  Sprint 7 → Workflows as agent triggers
Then:  Phase 9 capability pages that need real actions
Later: Phase 12 Voice; optional external agent peer (Hermes/OpenClaw)
```

**Note:** Phase 16 sidecar greenfield is largely done. The remaining MVP gap is **wiring**, not scaffolding.

---

## Key Decisions

### Pending Decisions

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| Voice provider | ElevenLabs vs OpenAI Whisper/TTS | Cost, quality, latency | 🔴 Pending |
| Tools on cloud path | Local-only tools vs edge `tools` forward | Complexity, reliability | 🔴 Pending |
| Sync strategy | Real-time vs periodic | Complexity, reliability | 🔴 Pending |
| Storage provider | Supabase vs external S3 | Cost, performance | 🔴 Pending |
| External agent runtime | Hermes / OpenClaw / none | Scope, ops burden | ⏸ After Phase 18 MVP |

### Made Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime Architecture | Sidecar (Python) | Bypasses browser sandbox safely |
| AI Gateway | Lovable AI + local Ollama | Hybrid privacy / zero-setup fallback |
| Default local chat model | `qwen3:8b` (tunneled) | Fast default; 32B for coding/strong chat |
| Agent layer approach | Wire existing `useAIChat` first | Control center needs act loop before new frameworks |
| Database | Supabase (Lovable Cloud) | Native integration, RLS support |
| UI Framework | React + Tailwind + shadcn | Modern, maintainable |
| State Management | React Context + TanStack Query | Simple, effective |

---

## Milestone Timeline

### MVP (v1.0.0) - Target: revised after Phase 18
- [x] Core UI and navigation
- [x] Database schema
- [x] Authentication system
- [x] Chat with real AI responses (Hybrid: Cloud + Local Ollama)
- [x] Calendar Automation (v0.3.0)
- [x] Local Agent Runtime sidecar + bridge (built)
- [ ] **Agent Layer wired** (Chat → tools → sidecar + HITL) — Phase 18
- [ ] All capability page UIs
- [ ] Basic CRUD for tasks, contacts, documents
- [ ] File upload/download

### v1.1.0
- [ ] Agent memory in chat loop
- [ ] Live Monitoring / Approvals / Agents status
- [ ] Voice input/output (ElevenLabs)
- [ ] Multi-provider storage

### v1.2.0
- [ ] Workflows as agent job triggers
- [ ] Advanced local model management UI
- [ ] Optional external agent peer (Hermes/OpenClaw) if needed
- [ ] API integrations (calendar, email)

---

## Technical Debt

### High Priority
1.  **Agent Layer wiring:** Sidecar exists but Chat uses text-only `AIService`; tools unused.
2.  **CORS / runtime UX:** Sidecar must allow app origin `:8080`; unpaired runtime must fail clearly.
3.  **Voice Transcription:** Currently mock, needs ElevenLabs integration.
4.  **File Upload:** UI exists, backend integration pending.
5.  **Feature Hydration:** Connect Finance/Legal UIs to real database tables / agent jobs.

### Medium Priority
1. **Error Boundaries:** Add React error boundaries to all pages.
2. **Loading States:** Skeleton components need refinement.
3. **Form Validation:** Some forms lack Zod validation.

### Low Priority
1. **Animation Performance:** Some animations cause reflows.
2. **Bundle Size:** Consider code splitting for large pages.
3. **Accessibility:** ARIA labels incomplete in some components.

---

## Risk Assessment

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Security (Local Runtime) | Malicious command execution | Strict allowlists, confirmation gates |
| API Rate Limits | Service disruption | Implement retry logic, caching |
| Local Model Performance | Poor UX on low-end devices | Graceful degradation to cloud |

### Medium Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Third-party API Changes | Feature breakage | Abstract API calls, version pinning |
| Database Scale | Performance issues | Indexing, query optimization |

### Low Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser Compatibility | UI issues | Target modern browsers only |
| Storage Limits | File size constraints | Implement quotas, compression |

---

## Recent Accomplishments

### July 17, 2026 (Local LLM + Agent Layer Plan)
- ✅ Wired UI chat to tunneled Ollama (`qwen3:8b` default) with Gemini fallback.
- ✅ Documented Phase 18 Agent Layer Integration (reuse `useAIChat` / sidecar; defer Hermes/OpenClaw).
- ✅ Updated `Todo_list.md`, `Implementation_Plan_Runtime_Memory.md`, and this plan.

### December 25, 2025 (Calendar Automation)
- ✅ Implemented `useEventMonitor` for background task execution.
- ✅ Added `instructions`, `workflow_id`, and `auto_start` to Calendar Schema.
- ✅ Enabled "Demo Mode" with local storage persistence.
- ✅ Updated `Design.md` and `Access Features.md` with Local Runtime architecture.

### December 21, 2025 (Hybrid AI Strategy)
- ✅ Implemented **Supabase Edge Function** for chat (Gemini 1.5 Flash).
- ✅ Updated `AIService` to act as "Traffic Cop" (Local First -> Cloud Fallback).
- ✅ Unified streaming architecture for seamless UI experience.

---

*Plan last updated: July 17, 2026*
