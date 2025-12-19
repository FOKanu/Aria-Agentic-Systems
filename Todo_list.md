# Agent Fleet - Implementation Roadmap

## Overview
This document tracks the remaining phases and tasks for completing the Agent Fleet multi-agent AI system.

---

## Phase 6: Chat Edge Function with Lovable AI Integration
**Status:** 🔴 Not Started  
**Priority:** High  
**Dependencies:** None

### Tasks
- [ ] Enable Lovable Cloud for edge functions and LOVABLE_API_KEY
- [ ] Create `supabase/functions/chat/index.ts` edge function
- [ ] Configure `supabase/config.toml` with chat function settings
- [ ] Update `ChatPage.tsx` to use real AI instead of mock responses
- [ ] Implement SSE streaming for real-time token delivery
- [ ] Add error handling for rate limits (429) and payment issues (402)

### Technical Details
- **Endpoint:** POST `/functions/v1/chat`
- **Payload:** `{ messages, model, agentRole, stream }`
- **Default Model:** `google/gemini-2.5-flash`
- **Gateway:** `https://ai.gateway.lovable.dev/v1/chat/completions`

### Architecture Flow
```
User Input → ChatPage → Edge Function → Lovable AI Gateway
                ↑                              ↓
           SSE Stream ←←←←←←←←←←←←←←← Streaming Tokens
```

---

## Phase 7: Database Integration
**Status:** 🔴 Not Started  
**Priority:** High  
**Dependencies:** Phase 6

### Tasks
- [ ] Design database schema for conversations, messages, agents
- [ ] Create SQL migrations for all tables
- [ ] Implement Row Level Security (RLS) policies
- [ ] Create database utility functions/hooks
- [ ] Migrate from localStorage to persistent database storage

### Database Tables
| Table | Description |
|-------|-------------|
| `conversations` | Chat sessions with agents |
| `messages` | Individual chat messages |
| `agents` | Agent configurations and metadata |
| `user_preferences` | User settings and customizations |
| `tasks` | User tasks and missions |

---

## Phase 8: Real Authentication
**Status:** 🔴 Not Started  
**Priority:** High  
**Dependencies:** Phase 7

### Tasks
- [ ] Implement Supabase Auth with email/password
- [ ] Add social login providers (Google, GitHub)
- [ ] Create protected routes and auth guards
- [ ] Build login/signup UI components
- [ ] Implement session management
- [ ] Add user profile management

### Auth Features
- Email/password authentication
- OAuth providers (Google, GitHub)
- Password reset flow
- Email verification
- Session persistence

---

## Phase 9: File Storage
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Dependencies:** Phase 8

### Tasks
- [ ] Configure Supabase Storage buckets
- [ ] Implement file upload functionality
- [ ] Add file permission system
- [ ] Create file sharing between agents
- [ ] Build file preview components
- [ ] Implement file versioning (optional)

### Storage Buckets
| Bucket | Purpose | Access |
|--------|---------|--------|
| `user-files` | User uploaded documents | Private |
| `agent-outputs` | AI-generated content | Private |
| `shared-files` | Collaborative files | Team |

---

## Phase 10: Task Persistence
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Dependencies:** Phase 7

### Tasks
- [ ] Create tasks table with proper schema
- [ ] Implement CRUD operations for tasks
- [ ] Add task assignment to agents
- [ ] Build task status tracking
- [ ] Create task history/audit log
- [ ] Implement task notifications

### Task Schema
```sql
tasks (
  id, user_id, agent_id, title, description,
  status, priority, due_date, created_at, updated_at
)
```

---

## Phase 11: Agent Memory & Context
**Status:** 🔴 Not Started  
**Priority:** Medium  
**Dependencies:** Phase 7, Phase 10

### Tasks
- [ ] Implement conversation memory storage
- [ ] Create context window management
- [ ] Add agent-specific memory isolation
- [ ] Build memory retrieval system
- [ ] Implement context summarization
- [ ] Add long-term memory with embeddings (optional)

### Memory Types
| Type | Scope | Duration |
|------|-------|----------|
| Short-term | Single conversation | Session |
| Long-term | Cross-conversation | Persistent |
| Agent-specific | Per agent | Persistent |
| Shared | All agents | Persistent |

---

## Phase 12: Deployment & Polish
**Status:** 🔴 Not Started  
**Priority:** Low  
**Dependencies:** All previous phases

### Tasks
- [ ] Performance optimization and code splitting
- [ ] Error boundary implementation
- [ ] Loading state improvements
- [ ] Accessibility audit and fixes
- [ ] SEO optimization
- [ ] Production environment configuration
- [ ] Monitoring and analytics setup
- [ ] Documentation updates

### Checklist
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Screen reader compatible

---

## Dependency Graph

```
Phase 6 (Chat Edge Function)
    ↓
Phase 7 (Database) ←→ Phase 10 (Tasks)
    ↓                      ↓
Phase 8 (Auth)        Phase 11 (Memory)
    ↓
Phase 9 (Storage)
    ↓
Phase 12 (Deploy & Polish)
```

---

## Quick Reference

| Phase | Name | Status | Est. Effort |
|-------|------|--------|-------------|
| 6 | Chat Edge Function | 🔴 Not Started | 2-3 days |
| 7 | Database Integration | 🔴 Not Started | 2-3 days |
| 8 | Real Authentication | 🔴 Not Started | 1-2 days |
| 9 | File Storage | 🔴 Not Started | 1-2 days |
| 10 | Task Persistence | 🔴 Not Started | 1-2 days |
| 11 | Agent Memory | 🔴 Not Started | 2-3 days |
| 12 | Deployment | 🔴 Not Started | 1-2 days |

---

## Notes
- Phases can be worked on in parallel where dependencies allow
- Phase 6 is the critical path - enables real AI functionality
- Phase 12 should be ongoing throughout development

*Last Updated: 2025-12-19*
