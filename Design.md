# ARIA - AI Research & Intelligence Assistant
## Design & Architecture Documentation

---

**Project Creator:** Francis Okorie Iyeke-Kanu
**Contact:** francis.okorie.Ik@gmail.com
**Version:** 0.3.0-beta
**Last Updated:** December 25, 2025

---

## Recent Changes (v0.3.0)

### Local Agent Runtime (Planned)
- **Sidecar Architecture:** Introduced a Python/FastAPI local server design to bridge the browser sandbox gap.
- **Terminal & File Access:** Defined secure protocols for agents to interact with the host operating system.
- **Tool Sandbox:** "Human-in-the-loop" execution model for dangerous commands.

### Calendar Automation
- **Workflow Engine:** Integrated `useEventMonitor` for auto-executing agent tasks based on calendar events.
- **Demo Mode:** Added local storage persistence for unauthenticated testing.

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Architecture Overview](#architecture-overview)
3. [AI Strategy](#ai-strategy)
4. [System Components](#system-components)
5. [Configuration Requirements](#configuration-requirements)
6. [Implementation Progress](#implementation-progress)
7. [MVP Roadmap](#mvp-roadmap)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Technology Stack](#technology-stack)

---

## Project Vision

ARIA is my beloved project, a sophisticated multi-agent AI command center designed to orchestrate multiple AI agents for research, development, and automation tasks. The system emphasizes **local-first AI processing** with cloud fallback, ensuring privacy, speed, and cost efficiency.

### Core Philosophy
- **Local-First AI:** 95% of workloads handled by local models (Ollama/Docker)
- **Cloud Fallback:** Lovable AI Gateway as intelligent fallback for complex tasks
- **Multi-Agent Orchestration:** Specialized agents for different task domains
- **Privacy-Centric:** Sensitive data processed locally
- **Active Execution:** Agents can execute real commands via the Local Runtime Sidecar

---

## Agent Capability Categories

ARIA organizes agent capabilities into structured categories for efficient task routing and specialized automation:

### Admin
| Capability | Description | Icon |
|------------|-------------|------|
| Calendar Management | Scheduling, reminders, meeting coordination | Calendar |
| Email Automation | Drafting, filtering, auto-responses | Mail |
| Phone & Calls | Call scheduling, transcription, VoIP | Phone |
| Reservations & Booking | Restaurant, travel, appointment booking | Bookmark |
| Contact Management | CRM integration, contact sync | Contact |
| Workflow Automation | Task triggers, process automation | Workflow |

### Finance
| Capability | Description | Icon |
|------------|-------------|------|
| Invoice Generation | Auto-create and send invoices | Receipt |
| Expense Tracking | Categorize and monitor spending | CreditCard |
| Budget Planning | Forecasting and allocation | PieChart |
| Financial Reports | P&L, cash flow, custom reports | BarChart3 |
| Payment Processing | Payment gateway integration | DollarSign |
| Tax Preparation | Document gathering, form prep | FileCheck |

### Legal
| Capability | Description | Icon |
|------------|-------------|------|
| Contract Drafting | Template-based contract creation | FileText |
| Document Review | AI-powered clause analysis | FileCheck |
| Compliance Monitoring | Regulatory tracking and alerts | Shield |
| NDA Generator | Automated NDA creation | Gavel |
| IP Management | Patent/trademark tracking | Scale |
| Case Research | Legal precedent search | Search |

### DevOps
| Capability | Description | Icon |
|------------|-------------|------|
| CI/CD Pipelines | Build and deploy automation | GitMerge |
| Code Review | Automated code analysis | Code |
| Deployment Automation | Zero-downtime deployments | GitBranch |
| Infrastructure Monitoring | Server health and metrics | Monitor |
| Security Scanning | Vulnerability detection | Shield |
| Log Analysis | Error tracking and insights | Activity |

### Social Media
| Capability | Description | Icon |
|------------|-------------|------|
| Content Scheduling | Multi-platform post scheduling | Calendar |
| Post Generation | AI-powered content creation | Megaphone |
| Analytics Dashboard | Engagement metrics and insights | TrendingUp |
| Community Management | Comment moderation, replies | Users |
| Influencer Outreach | Partnership management | Heart |
| Trend Monitoring | Hashtag and topic tracking | BarChart3 |

### Standalone Capabilities
| Capability | Description | Icon |
|------------|-------------|------|
| Documents | File management and processing | FileText |
| Memory | Context and knowledge retention | Brain |
| Tasks | Task creation and tracking | ListTodo |

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ARIA COMMAND CENTER                             │
│                           (Browser / Electron App)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   Chat UI    │    │  Agent Rail  │    │  Dashboard   │    │  Monitors  │ │
│  │  Interface   │    │   Sidebar    │    │   Widgets    │    │   & Logs   │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘ │
│         │                   │                   │                  │        │
│         └───────────────────┼───────────────────┴──────────────────┘        │
│                             ▼                                               │
│                   ┌───────────────────────┐                                 │
│                   │     Agent Engine      │                                 │
│                   │    (Browser Logic)    │                                 │
│                   └─────────┬─────────────┘                                 │
│                             │                                               │
│           ┌─────────────────┼────────────────────────┐                      │
│           ▼                 ▼                        ▼                      │
│  ┌────────────────┐  ┌──────────────┐      ┌─────────────────────┐          │
│  │  Ollama API    │  │  Supabase    │      │  Local Runtime API  │◄─────────NEW!
│  │  (Inference)   │  │  (Cloud DB)  │      │  (System Access)    │          │
│  └────────────────┘  └──────────────┘      └──────────┬──────────┘          │
│                                                       │                     │
└───────────────────────────────────────────────────────┼─────────────────────┘
                                                        │
                                                        ▼
                                           ┌───────────────────────────┐
                                           │   ARIA SIDECAR (Python)   │
                                           │   running on host machine │
                                           ├───────────────────────────┤
                                           │ • Terminal Execution      │
                                           │ • File System Access      │
                                           │ • Native Tools (Git, etc) │
                                           └───────────────────────────┘
```

### Component Interaction Flow

1.  **User Input:** User types "Run tests and fix bugs" in Chat.
2.  **Agent Engine:**
    *   Analyzes intent.
    *   Determines "Terminal" and "File Read" tools are needed.
3.  **Inference (Brain):**
    *   Sends prompt to Local Ollama or Cloud Gemini.
    *   LLM responds with Tool Calls: `[{ name: "run_terminal", args: { cmd: "npm test" } }]`.
4.  **Runtime Bridge (Nervous System):**
    *   Frontend sends HTTP POST to `http://localhost:8000/execute` (Sidecar).
    *   **Sidecar** validates command against allowlist/sandbox rules.
    *   **Sidecar** executes `npm test` in a subprocess.
    *   **Sidecar** streams stdout/stderr back to Frontend.
5.  **Feedback Loop:**
    *   Agent Engine feeds output back to LLM.
    *   LLM decides next step (e.g., "Read file src/App.test.tsx").

---

## AI Strategy

### Local-First Architecture (95% Local / 5% Cloud)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI WORKLOAD DISTRIBUTION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LOCAL MODELS (95%)                   LOVABLE AI (5%)           │
│  ═══════════════════                  ═══════════════           │
│                                                                 │
│  ✓ Simple Q&A                         ✓ Complex reasoning       │
│  ✓ Code completion                    ✓ Vision/image analysis   │
│  ✓ Text summarization                 ✓ Multi-step research     │
│  ✓ Classification                     ✓ Advanced code gen        │
│  ✓ Basic chat                         ✓ Long context (>32k)      │
│  ✓ Quick translations                 ✓ Local model unavailable  │
│  ✓ JSON extraction                                               │
│  ✓ Template filling                                              │
│                                                                  │
│  Models:                              Models:                    │
│  • Llama 3.2 (8B/70B)                 • Gemini 2.5 Flash         │
│  • Mistral (7B)                       • Gemini 2.5 Pro           │
│  • CodeLlama (34B)                    • GPT-5                    │
│  • Phi-3 (3.8B)                       • GPT-5 Mini               │
│                                                                  │
│  Benefits:                            Use Cases:                 │
│  • Zero API costs                     • Fallback when local fails│
│  • Privacy preserved                  • Complex multi-agent tasks│
│  • Low latency                        • Image understanding      │
│  • Offline capable                    • Web research synthesis   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Task Routing Decision Tree

```
                          ┌───────────────────┐
                          │  Incoming Message │
                          └─────────┬─────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Check Local Model Health    │
                    │   (AIService.checkHealth)     │
                    └───────────────┬───────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                          ▼                   ▼
                   ┌──────────┐         ┌──────────┐
                   │  Alive   │         │  Dead    │
                   │ (Ollama) │         │(Offline) │
                   └────┬─────┘         └────┬─────┘
                        │                    │
                        ▼                    ▼
           ┌────────────────────────┐  ┌────────────────────────┐
           │   LOCAL EXECUTION      │  │    CLOUD FALLBACK      │
           │   (Privacy Mode)       │  │    (Zero Setup)        │
           │                        │  │                        │
           │   • Llama 3.1 8B       │  │   • Supabase Edge Fn   │
           │   • Moondream (Vision) │  │   • Gemini 1.5 Flash   │
           │   • No Data Egress     │  │   • Context Injection  │
           └────────────────────────┘  └────────────────────────┘
```

### Complexity Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Multi-step Tasks | +0.2 | Keywords: "then", "after", "steps" |
| Reasoning Required | +0.15 | Keywords: "analyze", "compare", "evaluate" |
| Code Generation | +0.15 | Keywords: "code", "function", "implement" |
| Research Tasks | +0.2 | Keywords: "research", "find", "search" |
| Vision Required | +0.3 | Image attachments or vision keywords |
| Message Length | +0.1 | >200 chars adds complexity |
| File Context | +0.1 | Files attached to message |
| Conversation Length | +0.05 | Per 5 messages in history |

---

## System Components

### Codebase Architecture

```
src/
├── core/                        # Shared resources & utilities
├── shell/                       # App chrome & navigation
├── features/                    # Feature modules (public API pattern)
│   ├── chat/                    # Chat feature
│   ├── agents/                  # Agent management
│   ├── dashboard/               # Dashboard & analytics
│   ├── auth/                    # Authentication
│   ├── files/                   # File management
│   ├── tasks/                   # Task management
│   ├── calendar/                # Calendar & scheduling
│   ├── contacts/                # Contact management
│   ├── finance/                 # Budget, expenses, invoices
│   ├── devops/                  # CI/CD, deployments
│   ├── legal/                   # Contracts, compliance
│   ├── monitoring/              # Alerts, logs, traces
│   └── index.ts                 # Barrel exports
│
├── agent-engine/                # AI processing core
│   ├── services/
│   │   ├── lovableAI.ts         # Lovable AI Gateway client
│   │   ├── localModel.ts        # Local model client
│   │   └── runtimeBridge.ts     # NEW: Client for Local Sidecar
│   ├── lib/
│   │   ├── router.ts            # Task routing logic
│   │   ├── prompts.ts           # System prompts
│   │   └── streaming.ts         # SSE stream handlers
│   └── ...
│
├── components/                  # Shared UI components
├── pages/                       # Page components
└── integrations/                # External integrations (Supabase)

# NEW COMPONENT
server/                          # Local Sidecar (Python/FastAPI)
├── main.py                      # API Entry point
├── sandbox.py                   # Security enforcement
├── tools/                       # Tool implementations
│   ├── terminal.py
│   ├── filesystem.py
│   └── git.py
└── requirements.txt
```

---

## Configuration Requirements

### Developer Configuration

#### Local Model Setup (Required for 95% Local Processing)

```bash
# Option 1: Ollama (Recommended)
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:8b
ollama serve

# Local Runtime Setup (New)
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

#### Environment Variables

```env
# .env.local (Development)

# Local Model Configuration
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:11434/v1
VITE_LOCAL_RUNTIME_URL=http://localhost:8000  # Sidecar

# Lovable Cloud (Fallback)
# LOVABLE_API_KEY provided by platform
```

---

## Implementation Progress

### Completed Features ✅

#### Phase 1: Project Foundation
- [x] React + Vite + TypeScript setup
- [x] Tailwind CSS with custom design system
- [x] Shadcn UI component library
- [x] React Router navigation

#### Phase 2-5: Core Infrastructure
- [x] Agent System (7 specialized agents)
- [x] Chat Interface with streaming
- [x] Hybrid AI Engine (Local + Cloud)
- [x] File management system
- [x] Calendar Automation & Event Monitoring

### In Progress 🔄

#### Phase 16: Local Agent Runtime (Sidecar)
- [ ] Create Python FastAPI server
- [ ] Implement secure terminal execution
- [ ] Implement filesystem API
- [ ] Connect Frontend `runtimeBridge` to Sidecar

---

## MVP Roadmap

### MVP Feature Set

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARIA MVP v1.0 SCOPE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CORE FEATURES (Must Have)                                       │
│  ════════════════════════                                        │
│  ✓ Local-first AI chat                                           │
│  ✓ Intelligent cloud fallback                                    │
│  ✓ Multi-agent orchestration                                     │
│  ✓ Calendar & Task Automation                                    │
│  ○ Local System Access (via Sidecar)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Phases

```
Phase 6 (Cloud) ──► Phase 7-12 (Features) ──► Phase 16 (Runtime) ──► MVP
                                                    │
                                                    ▼
                                             ┌──────────────┐
                                             │ Python API   │
                                             │ Terminal     │
                                             │ Filesystem   │
                                             └──────────────┘
```

---

*Design document updated: December 25, 2025*
