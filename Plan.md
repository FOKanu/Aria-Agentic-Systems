# ARIA - Project Plan

**Project Creator:** Francis Okorie Iyeke-Kanu
**Contact:** francis.okorie.Ik@gmail.com
**Version:** 0.2.2-beta
**Last Updated:** December 25, 2025

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
| 6a | Hybrid AI Strategy | Local-first routing with Supabase Edge Function fallback |
| 7 | Database Integration | Supabase tables, RLS policies, enums |
| 8 | Authentication | Login, signup, password recovery |
| 17 | Calendar Automation | Workflow engine, event monitoring, persistence |

### 🟡 In Progress

| Phase | Name | Progress | Next Steps |
|-------|------|----------|------------|
| 9 | Capability Pages | 30% | DevOps complete, Legal/Finance pending |
| 10 | Provider Configuration | 40% | Settings UI, multi-provider support |
| 16 | Local Agent Runtime | 0% | Create Python Sidecar (Server) |

### 🔵 Ready to Start

| Phase | Name | Dependencies |
|-------|------|--------------|
| 6b | Migrate Imports | Use feature module public APIs |
| 11 | Agent Memory & Context | Phase 7 ✅ |
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
**Effort:** 1 week

| Task | Status | Details |
|------|--------|---------|
| Sidecar Setup | 🔴 | Python FastAPI server scaffold |
| Command Executor | 🔴 | `subprocess.run` with sandbox validation |
| Filesystem API | 🔴 | Read/Write/List endpoints |
| Frontend Bridge | 🔴 | `runtimeBridge.ts` client service |
| Terminal UI | 🔴 | Live stream component for stdout |

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
Week 1: Phase 16 (Local Runtime) → Give Agents "Hands"
        └── Python Sidecar Server
        └── Terminal/File API
        └── Frontend Integration

Week 2-3: Phase 9 (Finance + Legal)
        └── Invoice generation
        └── Expense tracking
        └── Contract drafting

Week 4: Phase 11 (Memory)
        └── useAgentMemory hook
        └── Context retrieval
        └── Memory persistence

Week 5: Phase 12 (Voice)
        └── ElevenLabs STT integration
        └── ElevenLabs TTS integration
        └── Full voice conversation loop

Week 6: Security + Testing
        └── RLS policy audit
        └── End-to-end testing
        └── Bug fixes
```

---

## Key Decisions

### Pending Decisions

| Decision | Options | Impact | Status |
|----------|---------|--------|--------|
| Voice provider | ElevenLabs vs OpenAI Whisper/TTS | Cost, quality, latency | 🔴 Pending |
| Local model priority | Ollama now vs post-MVP | Development time | 🔴 Pending |
| Sync strategy | Real-time vs periodic | Complexity, reliability | 🔴 Pending |
| Storage provider | Supabase vs external S3 | Cost, performance | 🔴 Pending |

### Made Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime Architecture | Sidecar (Python) | Bypasses browser sandbox safely |
| AI Gateway | Lovable AI | Pre-configured, no API key needed |
| Database | Supabase (Lovable Cloud) | Native integration, RLS support |
| UI Framework | React + Tailwind + shadcn | Modern, maintainable |
| State Management | React Context + TanStack Query | Simple, effective |

---

## Milestone Timeline

### MVP (v1.0.0) - Target: January 2025
- [x] Core UI and navigation
- [x] Database schema
- [x] Authentication system
- [x] Chat with real AI responses (Hybrid: Cloud + Local)
- [x] Calendar Automation (v0.3.0)
- [ ] Local Agent Runtime (Sidecar)
- [ ] All capability page UIs
- [ ] Basic CRUD for tasks, contacts, documents
- [ ] File upload/download

### v1.1.0 - Target: February 2025
- [ ] Voice input with ElevenLabs STT
- [ ] Voice output with ElevenLabs TTS
- [ ] Agent memory persistence
- [ ] Multi-provider storage

### v1.2.0 - Target: March 2025
- [ ] Advanced Local model management UI
- [ ] Offline mode enhancements
- [ ] Advanced workflow automation
- [ ] API integrations (calendar, email)

---

## Technical Debt

### High Priority
1.  **Local Runtime:** Missing entirely; required for terminal/file features.
2.  **Voice Transcription:** Currently mock, needs ElevenLabs integration.
3.  **File Upload:** UI exists, backend integration pending.
4.  **Feature Hydration:** Connect Finance/Legal UIs to real database tables.

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

*Plan last updated: December 25, 2025*
