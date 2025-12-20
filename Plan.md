# ARIA - Project Plan

**Project Creator:** Francis Okorie Iyeke-Kanu
**Contact:** francis.okorie.Ik@gmail.com
**Version:** 0.2.1-alpha
**Last Updated:** December 20, 2025

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

---

## Current Status

### ✅ Completed Phases

| Phase | Name | Description |
|-------|------|-------------|
| 1-5 | Core Infrastructure | UI components, navigation, agent system |
| 7 | Database Integration | Supabase tables, RLS policies, enums |
| 8 | Authentication | Login, signup, password recovery |

### 🟡 In Progress

| Phase | Name | Progress | Next Steps |
|-------|------|----------|------------|
| 6 | Chat Edge Function | 60% | Create edge function, SSE streaming |
| 9 | Capability Pages | 30% | DevOps complete, Legal/Finance pending |
| 10 | Provider Configuration | 40% | Settings UI, multi-provider support |

### 🔵 Ready to Start

| Phase | Name | Dependencies |
|-------|------|--------------|
| 11 | Agent Memory & Context | Phase 7 ✅ |
| 12 | Voice Integration | ElevenLabs API |
| 13 | Local Model Integration | Ollama setup |

---

## Phase Breakdown
**Goal:** Replace mock responses with real AI

| Task | Status | Details |
|------|--------|---------|
| Create `supabase/functions/chat/index.ts` | 🔴 | SSE streaming with Lovable AI Gateway |
| Agent role injection | 🔴 | System prompts based on selected agent(s) |
| Page context integration | 🔴 | Include current page data in prompts |
| Error handling | 🔴 | 429 rate limits, 402 payment, network failures |
| Token management | 🔴 | Track usage, implement context window limits |
| Update ChatPage.tsx | 🔴 | Connect to real AI endpoint |

### Phase 9: Capability Pages
**Priority:** High
**Effort:** 2-3 weeks
**Build Order:** Optimized for dependencies

#### Build Order
1. **Admin Hub** (foundation) → Calendar, Contacts, Email, Tasks
2. **Finance Module** → Invoices, Expenses, Budget, Reports
3. **Legal Module** → Contracts, NDA Generator, Compliance
4. **Social Media** → Scheduler, Analytics, Content Generation

#### Admin Hub
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| Calendar Management | 🟡 Basic | Secretary | 1 day |
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

#### Legal Module
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| Contract Drafting | 🔴 Not Started | Lawyer | 2 days |
| Document Review | 🔴 Not Started | Lawyer | 2 days |
| Compliance Monitoring | 🔴 Not Started | Lawyer | 1 day |
| NDA Generator | 🔴 Not Started | Lawyer | 1 day |
| IP Management | 🔴 Not Started | Lawyer | 1 day |
| Case Research | 🔴 Not Started | Lawyer | 1 day |

#### DevOps Module
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| CI/CD Pipelines | ✅ Basic UI | DevOps | Enhancement |
| Code Review | ✅ Basic UI | DevOps | Enhancement |
| Deployment Automation | ✅ Basic UI | DevOps | Enhancement |
| Infrastructure Monitoring | ✅ Basic UI | DevOps | Enhancement |
| Security Scanning | ✅ Basic UI | DevOps | Enhancement |
| Log Analysis | ✅ Basic UI | DevOps | Enhancement |

#### Social Media Module
| Page | Status | Agent | Effort |
|------|--------|-------|--------|
| Content Scheduling | 🔴 Not Started | Social Media | 2 days |
| Post Generation | 🔴 Not Started | Social Media | 2 days |
| Analytics Dashboard | 🔴 Not Started | Social Media | 2 days |
| Community Management | 🔴 Not Started | Social Media | 1 day |
| Influencer Outreach | 🔴 Not Started | Social Media | 1 day |
| Trend Monitoring | 🔴 Not Started | Social Media | 1 day |

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

### Phase 12: Voice Integration
**Priority:** Medium
**Effort:** 3-4 days

| Task | Status | Details |
|------|--------|---------|
| ElevenLabs STT | 🔴 | Real transcription via `scribe_v2_realtime` |
| ElevenLabs TTS | 🔴 | Voice responses from agents |
| Voice activity detection | 🔴 | Smart silence handling |
| Edge function for tokens | 🔴 | Secure token generation |
| Audio visualization | 🟡 | Waveform animation (basic implemented) |

### Phase 13: Local Model Integration
**Priority:** Low (Post-MVP)
**Effort:** 5-7 days

| Task | Status | Details |
|------|--------|---------|
| Ollama setup guide | 🔴 | Docker/native installation docs |
| Local model detection | 🔴 | Check for available local models |
| Model routing | 🔴 | Route requests based on task type |
| Offline mode | 🔴 | Full functionality without internet |
| Model management UI | 🔴 | Download/update models |

### Phase 14: Security Hardening
**Priority:** High (Pre-Production)
**Effort:** 3-4 days

| Task | Status | Details |
|------|--------|---------|
| RLS audit | 🔴 | Review all table policies |
| Input sanitization | 🔴 | Prevent XSS/injection attacks |
| Rate limiting | 🔴 | Protect API endpoints |
| Auth hardening | 🔴 | Session management, 2FA |
| Security headers | 🔴 | CSP, HSTS, etc. |

### Phase 15: Performance Optimization
**Priority:** Medium (Pre-Production)
**Effort:** 2-3 days

| Task | Status | Details |
|------|--------|---------|
| Code splitting | 🔴 | Lazy load capability pages |
| Bundle optimization | 🔴 | Tree shaking, minification |
| Caching strategy | 🔴 | Service worker, API caching |
| Image optimization | 🔴 | WebP, lazy loading |
| Database indexing | 🔴 | Query performance |

---

## Critical Path to MVP

```
Week 1: Phase 6 (Chat) → Real AI responses
        └── Edge function + SSE streaming
        └── Agent role injection
        └── Error handling (429/402)

Week 2-3: Phase 9 (Admin Hub + Finance)
        └── Calendar CRUD
        └── Contacts CRUD
        └── Invoice generation
        └── Expense tracking

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
- [ ] Chat with real AI responses
- [ ] All capability page UIs
- [ ] Basic CRUD for tasks, contacts, documents
- [ ] File upload/download

### v1.1.0 - Target: February 2025
- [ ] Voice input with ElevenLabs STT
- [ ] Voice output with ElevenLabs TTS
- [ ] Agent memory persistence
- [ ] Multi-provider storage

### v1.2.0 - Target: March 2025
- [ ] Local model integration (Ollama)
- [ ] Offline mode
- [ ] Advanced workflow automation
- [ ] API integrations (calendar, email)

---

## Technical Debt

### High Priority
1. **Mock Responses:** Replace mock chat responses with real AI
2. **Voice Transcription:** Currently mock, needs ElevenLabs integration
3. **File Upload:** UI exists, backend integration pending

### Medium Priority
1. **Error Boundaries:** Add React error boundaries to all pages
2. **Loading States:** Skeleton components need refinement
3. **Form Validation:** Some forms lack Zod validation

### Low Priority
1. **Animation Performance:** Some animations cause reflows
2. **Bundle Size:** Consider code splitting for large pages
3. **Accessibility:** ARIA labels incomplete in some components

---

## Risk Assessment

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
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

### December 20, 2025
- ✅ Global floating chat panel across all pages
- ✅ Page context injection into chat
- ✅ Floating voice input button with recording panel
- ✅ DevOps module routing fixed
- ✅ AgentRail navigation corrections
- ✅ Comprehensive documentation (Config.md, Plan.md, Cost_Analysis.md)

### December 17-19, 2025
- ✅ Database schema and migrations
- ✅ Authentication system
- ✅ Provider configuration table
- ✅ Agent memory schema

---

*Plan last updated: December 20, 2025*
