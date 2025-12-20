# ARIA - AI Research & Intelligence Assistant
## Design & Architecture Documentation

---

**Project Creator:** Francis Okorie Iyeke-Kanu  
**Contact:** francis.okorie.Ik@gmail.com  
**Version:** 0.1.0-alpha  
**Last Updated:** December 17, 2025

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

ARIA is My beloved project, a sophisticated multi-agent AI command center designed to orchestrate multiple AI agents for research, development, and automation tasks. The system emphasizes **local-first AI processing** with cloud fallback, ensuring privacy, speed, and cost efficiency.

### Core Philosophy
- **Local-First AI:** 95% of workloads handled by local models (Ollama/Docker)
- **Cloud Fallback:** Lovable AI Gateway as intelligent fallback for complex tasks
- **Multi-Agent Orchestration:** Specialized agents for different task domains
- **Privacy-Centric:** Sensitive data processed locally

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
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │   Chat UI    │    │  Agent Rail  │    │  Dashboard   │    │  Monitors  │ │
│  │  Interface   │    │   Sidebar    │    │   Widgets    │    │   & Logs   │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └─────┬──────┘ │
│         │                   │                   │                  │        │
│         └───────────────────┴───────────────────┴──────────────────┘        │
│                                    │                                         │
│                          ┌─────────▼─────────┐                              │
│                          │   Agent Engine    │                              │
│                          │  (Task Router)    │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                         │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │                     │                     │                  │
│     ┌────────▼────────┐   ┌────────▼────────┐   ┌───────▼───────┐          │
│     │  Local Models   │   │  Task Analyzer  │   │ Lovable AI    │          │
│     │  (95% Traffic)  │   │  & Complexity   │   │ (5% Fallback) │          │
│     │                 │   │    Scoring      │   │               │          │
│     │ • Ollama        │   │                 │   │ • Gemini 2.5  │          │
│     │ • Docker LLMs   │   │ • Simple → Local│   │ • GPT-5       │          │
│     │ • Llama 3.2     │   │ • Complex → API │   │               │          │
│     │ • Mistral       │   │ • Vision → API  │   │               │          │
│     │ • CodeLlama     │   │                 │   │               │          │
│     └────────┬────────┘   └─────────────────┘   └───────┬───────┘          │
│              │                                          │                   │
│              └──────────────────┬───────────────────────┘                   │
│                                 │                                            │
│                       ┌─────────▼─────────┐                                 │
│                       │  Response Handler │                                 │
│                       │  & Stream Parser  │                                 │
│                       └───────────────────┘                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Chat Input Bar                           │
│  • Message composition                                           │
│  • Agent mentions (@agent)                                       │
│  • File attachments                                              │
│  • Voice input                                                   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      useAIChat Hook                              │
│  • Message state management                                      │
│  • Conversation history                                          │
│  • Agent context injection                                       │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Task Router                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Complexity Analysis                         │    │
│  │  • Message length & content                              │    │
│  │  • Multi-step detection                                  │    │
│  │  • Code generation needs                                 │    │
│  │  • Vision requirements                                   │    │
│  │  • Research complexity                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│     LOCAL MODEL PATH      │   │      CLOUD FALLBACK PATH      │
│        (95% tasks)        │   │         (5% tasks)            │
│                           │   │                               │
│  Complexity < 0.6         │   │  Complexity >= 0.6            │
│  OR preferLocal = true    │   │  OR vision required           │
│  OR localModelAvailable   │   │  OR research heavy            │
│                           │   │  OR local unavailable         │
│  ┌─────────────────────┐  │   │  ┌─────────────────────────┐  │
│  │ localModel.ts       │  │   │  │ lovableAI.ts            │  │
│  │ • Health check      │  │   │  │ • Gateway call          │  │
│  │ • Model selection   │  │   │  │ • Stream parsing        │  │
│  │ • API call          │  │   │  │ • Error handling        │  │
│  │ • Stream handling   │  │   │  │                         │  │
│  └─────────────────────┘  │   │  └─────────────────────────┘  │
└───────────────────────────┘   └───────────────────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Streaming Response Handler                    │
│  • SSE parsing                                                   │
│  • Token-by-token updates                                        │
│  • Error recovery                                                │
│  • Activity logging                                              │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Conversation Stream                         │
│  • Real-time message display                                     │
│  • Typing indicators                                             │
│  • Agent avatars                                                 │
│  • Tool call visualization                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Strategy

### Local-First Architecture (95% Local / 5% Cloud)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI WORKLOAD DISTRIBUTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LOCAL MODELS (95%)                   LOVABLE AI (5%)           │
│  ═══════════════════                  ═══════════════           │
│                                                                  │
│  ✓ Simple Q&A                         ✓ Complex reasoning       │
│  ✓ Code completion                    ✓ Vision/image analysis   │
│  ✓ Text summarization                 ✓ Multi-step research     │
│  ✓ Classification                     ✓ Advanced code gen       │
│  ✓ Basic chat                         ✓ Long context (>32k)     │
│  ✓ Quick translations                 ✓ Local model unavailable │
│  ✓ JSON extraction                                              │
│  ✓ Template filling                                             │
│                                                                  │
│  Models:                              Models:                    │
│  • Llama 3.2 (8B/70B)                 • Gemini 2.5 Flash        │
│  • Mistral (7B)                       • Gemini 2.5 Pro          │
│  • CodeLlama (34B)                    • GPT-5                   │
│  • Phi-3 (3.8B)                       • GPT-5 Mini              │
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
                    └───────────────┬───────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                          ▼                   ▼
                   ┌──────────┐         ┌──────────┐
                   │ Healthy  │         │Unhealthy │
                   └────┬─────┘         └────┬─────┘
                        │                    │
                        ▼                    │
           ┌────────────────────────┐        │
           │ Analyze Task Complexity│        │
           └───────────┬────────────┘        │
                       │                     │
         ┌─────────────┼─────────────┐       │
         │             │             │       │
         ▼             ▼             ▼       │
    ┌─────────┐  ┌──────────┐  ┌─────────┐  │
    │Score<0.3│  │0.3-0.6   │  │Score>0.6│  │
    │ Simple  │  │ Medium   │  │ Complex │  │
    └────┬────┘  └────┬─────┘  └────┬────┘  │
         │            │             │       │
         │            │             │       │
         ▼            ▼             ▼       ▼
    ┌─────────────────────┐   ┌─────────────────┐
    │    LOCAL MODEL      │   │   LOVABLE AI    │
    │  • llama3.2:8b      │   │   GATEWAY       │
    │  • mistral:7b       │   │  • gemini-flash │
    │  • codellama:34b    │   │  • gpt-5        │
    └─────────────────────┘   └─────────────────┘
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

### Frontend Components

```
src/
├── components/
│   ├── chat/                    # Chat interface components
│   │   ├── ChatHeader.tsx       # Conversation header with agent info
│   │   ├── ChatInputBar.tsx     # Message input with mentions
│   │   ├── ChatMessage.tsx      # Individual message rendering
│   │   ├── ConversationStream.tsx # Real-time message stream
│   │   ├── AgentMentionPopover.tsx # @mention autocomplete
│   │   ├── AgentSelectorModal.tsx  # Agent selection UI
│   │   ├── ApprovalInline.tsx   # Tool approval interface
│   │   ├── MessageTemplates.tsx # Quick message templates
│   │   ├── QuickActions.tsx     # Common action buttons
│   │   └── TypingIndicator.tsx  # Agent typing animation
│   │
│   ├── ui/                      # Shadcn UI components
│   │   └── [50+ components]     # Button, Card, Dialog, etc.
│   │
│   ├── AgentRail.tsx            # Agent sidebar navigation
│   ├── AgentProfile.tsx         # Agent details display
│   ├── AgentCreationWizard.tsx  # Custom agent creator
│   ├── TopBar.tsx               # Main navigation bar
│   ├── BottomNav.tsx            # Mobile navigation
│   ├── StatusBar.tsx            # System status display
│   ├── EventsFeed.tsx           # Activity event stream
│   ├── ActivityLog.tsx          # Detailed activity history
│   ├── MatrixRain.tsx           # Visual background effect
│   └── [20+ more components]
│
├── pages/
│   ├── Index.tsx                # Landing/home page
│   ├── DashboardPage.tsx        # Main dashboard
│   ├── ChatPage.tsx             # Chat interface
│   ├── AgentsPage.tsx           # Agent management
│   ├── AgentDetailsPage.tsx     # Individual agent view
│   ├── TasksPage.tsx            # Task management
│   ├── FilesPage.tsx            # File browser
│   ├── MemoryPage.tsx           # Agent memory viewer
│   ├── AnalyticsPage.tsx        # Usage analytics
│   ├── MonitoringPage.tsx       # System monitoring
│   ├── SettingsPage.tsx         # User settings
│   └── [5+ more pages]
│
├── agent-engine/                # AI processing core
│   ├── services/
│   │   ├── lovableAI.ts         # Lovable AI Gateway client
│   │   └── localModel.ts        # Local model client
│   ├── lib/
│   │   ├── router.ts            # Task routing logic
│   │   ├── prompts.ts           # System prompts
│   │   └── streaming.ts         # SSE stream handlers
│   ├── hooks/
│   │   └── useAIChat.ts         # Chat state management
│   └── types/
│       └── index.ts             # TypeScript definitions
│
├── file-management/             # File handling system
│   ├── components/              # File UI components
│   ├── hooks/                   # File management hooks
│   ├── lib/                     # File utilities
│   └── types/                   # File type definitions
│
├── hooks/                       # Shared React hooks
│   ├── useTheme.tsx             # Theme management
│   ├── useNotifications.tsx     # Notification system
│   ├── useFavorites.tsx         # Favorite items
│   ├── useActivityLog.tsx       # Activity tracking
│   ├── useKeyboardShortcuts.ts  # Keyboard navigation
│   ├── useVoiceInput.ts         # Voice recognition
│   ├── useTextToSpeech.ts       # TTS output
│   └── [5+ more hooks]
│
└── data/
    ├── agentsData.ts            # Agent definitions
    └── mockData.ts              # Development data
```

### Agent Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGENT ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    useAIChat Hook                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │  Messages   │  │  Loading    │  │  Agent Context  │    │  │
│  │  │  State      │  │  State      │  │  Management     │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Router (router.ts)                      │  │
│  │  • analyzeTaskComplexity()                                 │  │
│  │  • routeTask() → { provider, model, reason, fallback }     │  │
│  │  • getModelDisplayName()                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              ▼                               ▼                  │
│  ┌────────────────────────┐   ┌────────────────────────────┐   │
│  │  localModel.ts         │   │  lovableAI.ts              │   │
│  │  ─────────────────     │   │  ────────────────          │   │
│  │  • checkLocalHealth()  │   │  • callLovableAI()         │   │
│  │  • getAvailableModels()│   │  • callLovableAIStreaming()│   │
│  │  • callLocalModel()    │   │  • Models:                 │   │
│  │  • callLocalStreaming()│   │    - gemini-2.5-flash     │   │
│  │  • Models:             │   │    - gemini-2.5-pro       │   │
│  │    - llama3.2:8b       │   │    - gpt-5                │   │
│  │    - mistral:7b        │   │    - gpt-5-mini           │   │
│  │    - codellama:34b     │   │                            │   │
│  │    - phi3:mini         │   │                            │   │
│  └────────────────────────┘   └────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  streaming.ts                              │  │
│  │  • parseSSEStream()                                        │  │
│  │  • handleStreamChunk()                                     │  │
│  │  • buildConversationContext()                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Requirements

### Developer Configuration

#### Local Model Setup (Required for 95% Local Processing)

```bash
# Option 1: Ollama (Recommended)
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended models
ollama pull llama3.2:8b        # General purpose
ollama pull mistral:7b         # Fast responses
ollama pull codellama:34b      # Code generation
ollama pull phi3:mini          # Lightweight tasks

# Start Ollama server
ollama serve
# Default endpoint: http://localhost:11434

# Option 2: Docker with OpenAI-compatible API
docker run -d \
  --gpus all \
  -p 8080:8080 \
  -v ./models:/models \
  ghcr.io/ggerganov/llama.cpp:server \
  -m /models/llama-3.2-8b.gguf \
  --host 0.0.0.0 \
  --port 8080
```

#### Environment Variables

```env
# .env.local (Development)

# Local Model Configuration
VITE_LOCAL_MODEL_ENDPOINT=http://localhost:11434/v1
VITE_LOCAL_MODEL_DEFAULT=llama3.2:8b
VITE_LOCAL_MODEL_TIMEOUT=60000

# Lovable Cloud (Fallback - Auto-configured)
# LOVABLE_API_KEY is automatically provided by Lovable Cloud

# Feature Flags
VITE_PREFER_LOCAL_MODELS=true
VITE_LOCAL_FIRST_ENABLED=true
VITE_FALLBACK_TO_CLOUD=true
```

#### Recommended VRAM Requirements

| Model | Min VRAM | Recommended | Use Case |
|-------|----------|-------------|----------|
| Phi-3 Mini (3.8B) | 4GB | 6GB | Quick tasks, classification |
| Mistral 7B | 6GB | 8GB | General chat, summaries |
| Llama 3.2 8B | 8GB | 12GB | Primary model, balanced |
| CodeLlama 34B | 24GB | 32GB | Code generation |
| Llama 3.2 70B | 48GB | 64GB | Complex reasoning |

### User Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                     ARIA Settings Panel                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI Provider Settings                                            │
│  ────────────────────                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ Local Models Only (Offline mode)                       │    │
│  │ ● Local First + Cloud Fallback (Recommended)             │    │
│  │ ○ Cloud Only (Requires internet)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Local Model Endpoint                                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ http://localhost:11434/v1                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Preferred Local Model                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ▼ llama3.2:8b                                            │    │
│  │   mistral:7b                                             │    │
│  │   codellama:34b                                          │    │
│  │   phi3:mini                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Complexity Threshold (for cloud routing)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ═══════════════════●══════════════════  0.6              │    │
│  │ Low (more cloud)          High (more local)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ☑ Enable streaming responses                                    │
│  ☑ Show model indicator in chat                                  │
│  ☐ Enable voice input                                            │
│  ☐ Enable text-to-speech output                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Progress

### Completed Features ✅

#### Phase 1: Project Foundation
- [x] React + Vite + TypeScript setup
- [x] Tailwind CSS with custom design system
- [x] Shadcn UI component library (50+ components)
- [x] React Router navigation
- [x] Dark/light theme support

#### Phase 2: UI Framework
- [x] Responsive layout system
- [x] TopBar with navigation
- [x] BottomNav for mobile
- [x] AgentRail sidebar
- [x] StatusBar system status
- [x] Matrix rain background effect
- [x] Command palette (Cmd+K)

#### Phase 3: Agent System
- [x] Agent data models and types
- [x] 7 specialized agents defined:
  - ARIA (Orchestrator)
  - Nova (Research)
  - Pixel (Design)
  - Logic (Development)
  - Echo (Communication)
  - Sentinel (Security)
  - Cipher (Data)
- [x] Agent profiles and avatars
- [x] Agent capabilities mapping
- [x] Agent status tracking

#### Phase 4: Chat Interface
- [x] ConversationStream component
- [x] ChatInputBar with @mentions
- [x] ChatMessage with markdown
- [x] AgentMentionPopover autocomplete
- [x] AgentSelectorModal
- [x] TypingIndicator animation
- [x] QuickActions menu
- [x] MessageTemplates

#### Phase 5: Agent Engine (AI Core)
- [x] Type system (AIProvider, AIModel, etc.)
- [x] Task complexity analyzer
- [x] Intelligent task router
- [x] Local model service (localModel.ts)
- [x] Lovable AI service (lovableAI.ts)
- [x] SSE streaming parser
- [x] useAIChat hook
- [x] System prompt builder
- [x] Fallback chain logic

#### Additional Features
- [x] File management system
- [x] Activity logging
- [x] Notification system
- [x] Keyboard shortcuts
- [x] Dashboard customization
- [x] Favorites system
- [x] Voice input hook
- [x] Text-to-speech hook

### In Progress 🔄

#### Phase 6: Cloud Integration
- [ ] Enable Lovable Cloud
- [ ] Chat edge function
- [ ] Streaming response handler
- [ ] Rate limit handling

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
│                                                                  │
│  ✓ Local-first AI chat (95% local processing)                   │
│  ✓ Intelligent cloud fallback (5% complex tasks)                │
│  ✓ Multi-agent system with @mentions                            │
│  ✓ Real-time streaming responses                                │
│  ✓ Conversation persistence                                      │
│  ○ User authentication                                           │
│  ○ Basic file context for AI                                     │
│                                                                  │
│  NICE TO HAVE (v1.1)                                             │
│  ═══════════════════                                             │
│                                                                  │
│  ○ Agent memory/learning                                         │
│  ○ Task automation                                               │
│  ○ Team collaboration                                            │
│  ○ Custom agent creation                                         │
│  ○ Advanced analytics                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Phases

```
Phase 6 ──► Phase 7 ──► Phase 8 ──► Phase 9 ──► MVP v1.0
   │           │           │           │
   │           │           │           │
   ▼           ▼           ▼           ▼
┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│Cloud │   │ DB   │   │ Auth │   │Files │
│Edge  │   │Setup │   │Flow  │   │Store │
│Func  │   │      │   │      │   │      │
└──────┘   └──────┘   └──────┘   └──────┘

Week 1      Week 2     Week 3     Week 4
```

### Phase 6: Chat Edge Function (Week 1)

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: LOVABLE AI EDGE FUNCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tasks:                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. Enable Lovable Cloud                              □   │    │
│  │ 2. Create supabase/functions/chat/index.ts          □   │    │
│  │ 3. Implement streaming response handler              □   │    │
│  │ 4. Add CORS and error handling                       □   │    │
│  │ 5. Handle rate limits (429) and credits (402)        □   │    │
│  │ 6. Update frontend to use edge function              □   │    │
│  │ 7. Test local → cloud fallback flow                  □   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Technical Notes:                                                │
│  • Edge function serves as cloud fallback only                   │
│  • Primary traffic goes to local models                          │
│  • Uses LOVABLE_API_KEY (auto-provisioned)                       │
│  • Default model: google/gemini-2.5-flash                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 7: Database Schema (Week 2)

```sql
-- Core Tables for MVP

-- Users (managed by Supabase Auth)
-- conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- messages  
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  agent_id TEXT,
  model_used TEXT,
  provider TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- agent_preferences
CREATE TABLE agent_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_id TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);
```

### Phase 8: Authentication (Week 3)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Login   │───►│ Supabase │───►│  Session │───►│   App    │  │
│  │   Page   │    │   Auth   │    │  Created │    │  Access  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  Supported Methods:                                              │
│  • Email + Password                                              │
│  • Magic Link (Email)                                            │
│  • Google OAuth (Future)                                         │
│  • GitHub OAuth (Future)                                         │
│                                                                  │
│  Protected Routes:                                               │
│  • /dashboard                                                    │
│  • /chat                                                         │
│  • /agents                                                       │
│  • /tasks                                                        │
│  • /files                                                        │
│  • /settings                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 9: File Storage (Week 4)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FILE STORAGE SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Supabase Storage Buckets:                                       │
│  ─────────────────────────                                       │
│                                                                  │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────────┐  │
│  │  user-uploads   │   │  chat-attachments│   │  agent-assets │  │
│  │  ─────────────  │   │  ───────────────│   │  ───────────  │  │
│  │  • Documents    │   │  • Images        │   │  • Avatars    │  │
│  │  • Images       │   │  • Files shared  │   │  • Icons      │  │
│  │  • Data files   │   │    in chat       │   │  • Configs    │  │
│  │                 │   │                  │   │               │  │
│  │  Max: 50MB/file │   │  Max: 10MB/file  │   │  System only  │  │
│  └─────────────────┘   └─────────────────┘   └───────────────┘  │
│                                                                  │
│  File Context for AI:                                            │
│  ────────────────────                                            │
│  • Extract text from PDFs                                        │
│  • Parse structured data (JSON, CSV)                             │
│  • Image descriptions (via vision model)                         │
│  • Relevance scoring for context window                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARIA REQUEST LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER INPUT                                                               │
│  ─────────────                                                               │
│  User types: "@nova research latest AI frameworks"                          │
│                           │                                                  │
│                           ▼                                                  │
│  2. INPUT PROCESSING                                                         │
│  ───────────────────                                                         │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ ChatInputBar.tsx                                            │             │
│  │ • Parse @mention → agent: "nova"                            │             │
│  │ • Extract message → "research latest AI frameworks"         │             │
│  │ • Check attachments → none                                  │             │
│  └────────────────────────────────────────────────────────────┘             │
│                           │                                                  │
│                           ▼                                                  │
│  3. HOOK PROCESSING                                                          │
│  ──────────────────                                                          │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ useAIChat Hook                                              │             │
│  │ • Add to messages state                                     │             │
│  │ • Set loading = true                                        │             │
│  │ • Get agent context for "nova"                              │             │
│  │ • Build conversation history                                │             │
│  └────────────────────────────────────────────────────────────┘             │
│                           │                                                  │
│                           ▼                                                  │
│  4. ROUTING DECISION                                                         │
│  ───────────────────                                                         │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ router.ts - analyzeTaskComplexity()                         │             │
│  │                                                             │             │
│  │ Factors:                                                    │             │
│  │ • "research" keyword → +0.2                                 │             │
│  │ • Message length (36 chars) → +0.0                          │             │
│  │ • No vision → +0.0                                          │             │
│  │ • Nova = research agent → +0.1                              │             │
│  │ ─────────────────────────                                   │             │
│  │ Total complexity: 0.3 → LOCAL MODEL                         │             │
│  └────────────────────────────────────────────────────────────┘             │
│                           │                                                  │
│                           ▼                                                  │
│  5. LOCAL MODEL CALL                                                         │
│  ───────────────────                                                         │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ localModel.ts - callLocalModelStreaming()                   │             │
│  │                                                             │             │
│  │ Request:                                                    │             │
│  │ POST http://localhost:11434/v1/chat/completions             │             │
│  │ {                                                           │             │
│  │   "model": "llama3.2:8b",                                   │             │
│  │   "messages": [                                             │             │
│  │     { "role": "system", "content": "[Nova's prompt]" },     │             │
│  │     { "role": "user", "content": "research latest..." }     │             │
│  │   ],                                                        │             │
│  │   "stream": true                                            │             │
│  │ }                                                           │             │
│  └────────────────────────────────────────────────────────────┘             │
│                           │                                                  │
│              ┌────────────┴────────────┐                                    │
│              │                         │                                    │
│              ▼                         ▼                                    │
│        ┌──────────┐            ┌──────────────┐                            │
│        │ Success  │            │    Error     │                            │
│        └────┬─────┘            └──────┬───────┘                            │
│             │                         │                                     │
│             │                         ▼                                     │
│             │           ┌────────────────────────────────┐                 │
│             │           │ FALLBACK TO LOVABLE AI         │                 │
│             │           │ lovableAI.ts                   │                 │
│             │           │                                │                 │
│             │           │ POST to edge function          │                 │
│             │           │ → ai.gateway.lovable.dev       │                 │
│             │           │ Model: gemini-2.5-flash        │                 │
│             │           └────────────────────────────────┘                 │
│             │                         │                                     │
│             └────────────┬────────────┘                                    │
│                          │                                                  │
│                          ▼                                                  │
│  6. STREAM PROCESSING                                                        │
│  ────────────────────                                                        │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ streaming.ts - parseSSEStream()                             │             │
│  │                                                             │             │
│  │ data: {"choices":[{"delta":{"content":"Based on"}}]}        │             │
│  │ data: {"choices":[{"delta":{"content":" my"}}]}             │             │
│  │ data: {"choices":[{"delta":{"content":" research"}}]}       │             │
│  │ data: {"choices":[{"delta":{"content":"..."}}]}             │             │
│  │ data: [DONE]                                                │             │
│  │                                                             │             │
│  │ → Tokens streamed to UI in real-time                        │             │
│  └────────────────────────────────────────────────────────────┘             │
│                          │                                                  │
│                          ▼                                                  │
│  7. UI UPDATE                                                                │
│  ────────────                                                                │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │ ConversationStream.tsx                                      │             │
│  │                                                             │             │
│  │ • Display typing indicator                                  │             │
│  │ • Stream tokens into message bubble                         │             │
│  │ • Show model indicator (Local: llama3.2:8b)                 │             │
│  │ • Complete message, hide typing                             │             │
│  │ • Log activity                                              │             │
│  └────────────────────────────────────────────────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Mention Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    @MENTION AUTOCOMPLETE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User types: "@"                                                 │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ useAgentMention Hook                                     │    │
│  │ • Detect "@" trigger                                     │    │
│  │ • Filter agents by query                                 │    │
│  │ • Track cursor position                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ AgentMentionPopover                                      │    │
│  │ ┌─────────────────────────────────────────────────────┐ │    │
│  │ │ 🤖 ARIA - Orchestrator                              │ │    │
│  │ │ 🔬 Nova - Research                                   │ │    │
│  │ │ 🎨 Pixel - Design                        ◄─ hover   │ │    │
│  │ │ 💻 Logic - Development                               │ │    │
│  │ │ 📢 Echo - Communication                              │ │    │
│  │ │ 🛡️ Sentinel - Security                              │ │    │
│  │ │ 📊 Cipher - Data                                     │ │    │
│  │ └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │                                                          │
│       │ User selects "Nova"                                      │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Input: "@nova research latest AI frameworks"             │    │
│  │                                                          │    │
│  │ • Replace "@" with "@nova "                              │    │
│  │ • Set active agent context                               │    │
│  │ • Close popover                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Shadcn/UI | Latest | Component library |
| React Router | 6.30.1 | Navigation |
| TanStack Query | 5.83.0 | Data fetching |
| Framer Motion | - | Animations (planned) |
| Recharts | 2.15.4 | Charts |
| Lucide React | 0.462.0 | Icons |

### Backend (Lovable Cloud)

| Technology | Purpose |
|------------|---------|
| Supabase | Database, Auth, Storage |
| PostgreSQL | Primary database |
| Edge Functions | Serverless compute |
| Lovable AI Gateway | AI model access |

### AI Infrastructure

| Component | Technology | Role |
|-----------|------------|------|
| Local Models | Ollama / Docker | 95% of requests |
| Cloud Fallback | Lovable AI Gateway | 5% complex tasks |
| Primary Local | Llama 3.2 8B | General purpose |
| Code Local | CodeLlama 34B | Code generation |
| Cloud Default | Gemini 2.5 Flash | Fast cloud inference |
| Cloud Heavy | Gemini 2.5 Pro / GPT-5 | Complex reasoning |

---

## Social Media Automation System

### Overview

The Social Media Automation system provides AI-powered content scheduling, automated message responses, and multi-platform management across 7 major platforms.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOCIAL MEDIA AUTOMATION HUB                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     AI CONTENT CALENDAR (Drag & Drop)                  │ │
│  │                                                                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │ │
│  │  │   Mon    │  │   Tue    │  │   Wed    │  │   Thu    │  │   Fri    │ │ │
│  │  │ ═════════│  │ ═════════│  │ ═════════│  │ ═════════│  │ ═════════│ │ │
│  │  │ 📸 IG    │  │ 🐦 Tweet │  │ 📺 YT    │  │ 💼 LinkedIn│ │ 🎵 TikTok│ │ │
│  │  │ 9:00 AM  │  │ 12:00 PM │  │ 3:00 PM  │  │ 10:00 AM │  │ 6:00 PM  │ │ │
│  │  │          │  │          │  │          │  │          │  │          │ │ │
│  │  │ 🔮 OF    │  │          │  │ 🎮 Twitch│  │          │  │ 📸 IG    │ │ │
│  │  │ 8:00 PM  │  │          │  │ 7:00 PM  │  │          │  │ 9:00 PM  │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │ │
│  │                                                                         │ │
│  │  [AI Suggestions] [Optimal Timing] [Bulk Schedule] [Export Calendar]   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         AUTO-RESPONSE SYSTEM                            │ │
│  │                     (Hybrid: Local First → Cloud Fallback)             │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐ │ │
│  │  │  Incoming DM    │───▶│  Local Model    │───▶│  Response Sent      │ │ │
│  │  │  or Comment     │    │  (Ollama/Docker)│    │  (< 2s latency)     │ │ │
│  │  └─────────────────┘    └────────┬────────┘    └─────────────────────┘ │ │
│  │                                  │                                      │ │
│  │                       ┌──────────▼──────────┐                           │ │
│  │                       │ Stuck/Timeout (>5s) │                           │ │
│  │                       │ or Complex Query    │                           │ │
│  │                       └──────────┬──────────┘                           │ │
│  │                                  │                                      │ │
│  │                       ┌──────────▼──────────┐                           │ │
│  │                       │  Lovable AI Gateway │                           │ │
│  │                       │  (Gemini 2.5 Flash) │                           │ │
│  │                       └─────────────────────┘                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        PLATFORM ADAPTERS (7)                            │ │
│  │                                                                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │ │
│  │  │ Twitter │ │Instagram│ │LinkedIn │ │ YouTube │ │ TikTok  │          │ │
│  │  │   /X    │ │         │ │         │ │         │ │         │          │ │
│  │  │ ─────── │ │ ─────── │ │ ─────── │ │ ─────── │ │ ─────── │          │ │
│  │  │ • Post  │ │ • Post  │ │ • Post  │ │ • Upload│ │ • Upload│          │ │
│  │  │ • Reply │ │ • Story │ │ • Article│ │ • Shorts│ │ • Video │          │ │
│  │  │ • DM    │ │ • Reel  │ │ • DM    │ │ • Comment│ │ • Comment│         │ │
│  │  │ • Like  │ │ • DM    │ │ • Comment│ │ • Reply │ │ • Reply │          │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │ │
│  │                                                                         │ │
│  │  ┌─────────┐ ┌─────────┐                                               │ │
│  │  │OnlyFans │ │  Twitch │                                               │ │
│  │  │         │ │         │                                               │ │
│  │  │ ─────── │ │ ─────── │                                               │ │
│  │  │ • Post  │ │ • Stream│                                               │ │
│  │  │ • Message│ │ • Title│                                               │ │
│  │  │ • PPV   │ │ • Chat  │                                               │ │
│  │  │ • Tip   │ │ • Clip  │                                               │ │
│  │  └─────────┘ └─────────┘                                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- ═══════════════════════════════════════════════════════════════════════════
-- SOCIAL MEDIA AUTOMATION TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform connection types
CREATE TYPE public.social_platform AS ENUM (
  'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'onlyfans', 'twitch'
);

-- Post status tracking
CREATE TYPE public.post_status AS ENUM (
  'draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'
);

-- Auto-response mode
CREATE TYPE public.response_mode AS ENUM (
  'ai_generated', 'template', 'hybrid'
);

-- ───────────────────────────────────────────────────────────────────────────
-- PLATFORM CONNECTIONS
-- Stores OAuth tokens and platform-specific settings per user
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform social_platform NOT NULL,
  account_id TEXT NOT NULL,                    -- Platform-specific account ID
  account_name TEXT,                           -- Display name (@handle)
  account_avatar TEXT,                         -- Profile image URL
  access_token TEXT NOT NULL,                  -- Encrypted OAuth token
  refresh_token TEXT,                          -- For token refresh
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],                               -- Granted API scopes
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',                 -- Platform-specific data
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  
  UNIQUE(user_id, platform, account_id)
);

-- ───────────────────────────────────────────────────────────────────────────
-- SCHEDULED POSTS
-- Content queue with drag-drop calendar support
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  content TEXT NOT NULL,                       -- Post text/caption
  media_urls TEXT[],                           -- Attached media URLs
  media_types TEXT[],                          -- 'image', 'video', 'gif'
  link_url TEXT,                               -- Optional link attachment
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status post_status DEFAULT 'scheduled',
  
  -- Calendar positioning (for drag-drop)
  calendar_order INTEGER DEFAULT 0,            -- Order within same time slot
  color_tag TEXT,                              -- Visual color coding
  
  -- AI Suggestions
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,                              -- Prompt used to generate content
  optimal_time_suggested BOOLEAN DEFAULT false,
  engagement_prediction REAL,                  -- 0-1 predicted engagement score
  
  -- Tracking
  platform_post_id TEXT,                       -- ID returned after publishing
  published_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for calendar queries (7+ days range)
CREATE INDEX idx_scheduled_posts_calendar 
  ON public.scheduled_posts(user_id, scheduled_for, status);

-- ───────────────────────────────────────────────────────────────────────────
-- AUTO-RESPONSE RULES
-- Template and AI-based response configurations
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.auto_response_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE,
  
  -- Rule definition
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,                  -- Higher = evaluated first
  
  -- Trigger conditions
  trigger_type TEXT NOT NULL,                  -- 'dm', 'comment', 'mention', 'all'
  keyword_triggers TEXT[],                     -- Keywords to match
  keyword_match_mode TEXT DEFAULT 'any',       -- 'any', 'all', 'exact'
  exclude_keywords TEXT[],                     -- Skip if these present
  
  -- Response configuration
  response_mode response_mode DEFAULT 'hybrid',
  template_response TEXT,                      -- Static template (with variables)
  ai_system_prompt TEXT,                       -- Custom AI persona/instructions
  ai_context TEXT,                             -- Additional context for AI
  
  -- AI Model routing
  prefer_local_model BOOLEAN DEFAULT true,     -- Try local first
  local_timeout_ms INTEGER DEFAULT 5000,       -- Fallback to cloud after
  cloud_model TEXT DEFAULT 'google/gemini-2.5-flash',
  
  -- Rate limiting
  max_responses_per_hour INTEGER DEFAULT 60,
  delay_min_seconds INTEGER DEFAULT 30,        -- Min delay before responding
  delay_max_seconds INTEGER DEFAULT 120,       -- Max delay (randomized)
  
  -- Tracking
  responses_sent INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- AUTO-RESPONSE LOGS
-- History of all automated responses for audit/analytics
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.auto_response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.auto_response_rules(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE NOT NULL,
  
  -- Original message
  incoming_message_id TEXT,                    -- Platform-specific ID
  incoming_content TEXT NOT NULL,
  incoming_author TEXT,
  incoming_author_id TEXT,
  
  -- Response details
  response_content TEXT NOT NULL,
  response_model TEXT,                         -- 'local:llama3.2' or 'cloud:gemini-2.5-flash'
  response_latency_ms INTEGER,
  
  -- Status
  was_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Human review
  flagged_for_review BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  review_outcome TEXT,                         -- 'approved', 'rejected', 'edited'
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- CONTENT ANALYTICS
-- Performance tracking for scheduled and auto-response content
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE NOT NULL,
  
  -- Engagement metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Platform-specific
  retweets INTEGER,                            -- Twitter
  story_views INTEGER,                         -- Instagram
  video_views INTEGER,                         -- YouTube/TikTok/Twitch
  watch_time_seconds INTEGER,
  subscribers_gained INTEGER,
  
  -- Calculated
  engagement_rate REAL,                        -- (interactions / impressions) * 100
  
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────────────────
-- OPTIMAL POSTING TIMES
-- AI-learned best times to post per platform/user
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE public.optimal_posting_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.platform_connections(id) ON DELETE CASCADE NOT NULL,
  
  day_of_week INTEGER NOT NULL,                -- 0 = Sunday, 6 = Saturday
  hour_utc INTEGER NOT NULL,                   -- 0-23
  
  avg_engagement_rate REAL,
  sample_size INTEGER DEFAULT 0,
  confidence_score REAL,                       -- 0-1, higher = more reliable
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(connection_id, day_of_week, hour_utc)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_response_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_response_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimal_posting_times ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users access own connections" ON public.platform_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own rules" ON public.auto_response_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own logs" ON public.auto_response_logs
  FOR ALL USING (
    connection_id IN (
      SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users access own analytics" ON public.content_analytics
  FOR ALL USING (
    connection_id IN (
      SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users access own optimal times" ON public.optimal_posting_times
  FOR ALL USING (
    connection_id IN (
      SELECT id FROM public.platform_connections WHERE user_id = auth.uid()
    )
  );
```

### Edge Functions

#### 1. `process-auto-reply` - Hybrid AI Response Handler

```typescript
// supabase/functions/process-auto-reply/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncomingMessage {
  platform: string;
  messageId: string;
  content: string;
  authorId: string;
  authorName: string;
  connectionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { message }: { message: IncomingMessage } = await req.json();
    
    // 1. Find matching auto-response rule
    const { data: rules } = await supabase
      .from('auto_response_rules')
      .select('*')
      .eq('connection_id', message.connectionId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    const matchedRule = rules?.find(rule => {
      if (rule.keyword_triggers?.length) {
        const hasKeyword = rule.keyword_triggers.some(
          (kw: string) => message.content.toLowerCase().includes(kw.toLowerCase())
        );
        if (!hasKeyword) return false;
      }
      return true;
    });

    if (!matchedRule) {
      return new Response(JSON.stringify({ skipped: true, reason: 'No matching rule' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Generate response based on mode
    let response: string;
    let modelUsed: string;
    const startTime = Date.now();

    if (matchedRule.response_mode === 'template') {
      response = matchedRule.template_response
        .replace('{{author}}', message.authorName)
        .replace('{{message}}', message.content);
      modelUsed = 'template';
    } else {
      // Try local model first
      if (matchedRule.prefer_local_model) {
        try {
          const localResponse = await Promise.race([
            callLocalModel(message.content, matchedRule.ai_system_prompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('timeout')), matchedRule.local_timeout_ms)
            )
          ]);
          response = localResponse as string;
          modelUsed = 'local:llama3.2';
        } catch {
          // Fallback to cloud
          response = await callLovableAI(message.content, matchedRule);
          modelUsed = `cloud:${matchedRule.cloud_model}`;
        }
      } else {
        response = await callLovableAI(message.content, matchedRule);
        modelUsed = `cloud:${matchedRule.cloud_model}`;
      }
    }

    const latency = Date.now() - startTime;

    // 3. Log the response
    await supabase.from('auto_response_logs').insert({
      rule_id: matchedRule.id,
      connection_id: message.connectionId,
      incoming_message_id: message.messageId,
      incoming_content: message.content,
      incoming_author: message.authorName,
      incoming_author_id: message.authorId,
      response_content: response,
      response_model: modelUsed,
      response_latency_ms: latency,
    });

    return new Response(JSON.stringify({ response, modelUsed, latency }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Auto-reply error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callLocalModel(content: string, systemPrompt: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:8b',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful social media assistant.' },
        { role: 'user', content }
      ],
      stream: false,
    }),
  });
  const data = await response.json();
  return data.message.content;
}

async function callLovableAI(content: string, rule: any): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: rule.cloud_model,
      messages: [
        { role: 'system', content: rule.ai_system_prompt || 'You are a helpful social media assistant.' },
        { role: 'user', content }
      ],
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

#### 2. `schedule-post` - CRON-based Post Publisher

```typescript
// supabase/functions/schedule-post/index.ts
// Triggered by pg_cron every minute

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Get posts due for publishing
    const now = new Date().toISOString();
    const { data: duePosts } = await supabase
      .from('scheduled_posts')
      .select('*, platform_connections(*)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(10);

    const results = [];

    for (const post of duePosts || []) {
      try {
        // Mark as publishing
        await supabase
          .from('scheduled_posts')
          .update({ status: 'publishing' })
          .eq('id', post.id);

        // Publish via platform adapter
        const platformPostId = await publishToPlatform(post);

        // Mark as published
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'published',
            platform_post_id: platformPostId,
            published_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        results.push({ id: post.id, status: 'published' });
      } catch (error) {
        // Mark as failed with retry
        await supabase
          .from('scheduled_posts')
          .update({
            status: post.retry_count < 3 ? 'scheduled' : 'failed',
            retry_count: post.retry_count + 1,
            error_message: error.message,
          })
          .eq('id', post.id);

        results.push({ id: post.id, status: 'failed', error: error.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function publishToPlatform(post: any): Promise<string> {
  const platform = post.platform_connections.platform;
  const token = post.platform_connections.access_token;

  // Platform-specific publishing logic
  switch (platform) {
    case 'twitter':
      return await publishToTwitter(post.content, post.media_urls, token);
    case 'instagram':
      return await publishToInstagram(post.content, post.media_urls, token);
    case 'linkedin':
      return await publishToLinkedIn(post.content, post.media_urls, token);
    // ... other platforms
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
```

#### 3. `ai-content-generator` - AI Content Suggestions

```typescript
// supabase/functions/ai-content-generator/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, topic, tone, count = 5 } = await req.json();

    const systemPrompt = `You are a social media content strategist. Generate ${count} post ideas for ${platform}.
Tone: ${tone || 'professional but engaging'}
Topic: ${topic}

For each post, provide:
1. The post content (platform-appropriate length)
2. Suggested hashtags
3. Best time to post (day and hour)
4. Expected engagement level (high/medium/low)

Format as JSON array.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate content ideas about: ${topic}` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_posts',
            description: 'Generate social media post suggestions',
            parameters: {
              type: 'object',
              properties: {
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      content: { type: 'string' },
                      hashtags: { type: 'array', items: { type: 'string' } },
                      bestDay: { type: 'string' },
                      bestHour: { type: 'number' },
                      engagementLevel: { type: 'string', enum: ['high', 'medium', 'low'] }
                    },
                    required: ['content', 'hashtags', 'bestDay', 'bestHour', 'engagementLevel']
                  }
                }
              },
              required: ['suggestions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_posts' } }
      }),
    });

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Platform Integration Specs

| Platform | API | Auth Method | Rate Limits | Capabilities |
|----------|-----|-------------|-------------|--------------|
| **Twitter/X** | Twitter API v2 | OAuth 2.0 | 300 tweets/3hr (free), 100 DMs/day | Post, Reply, DM, Like, Retweet |
| **Instagram** | Meta Graph API | OAuth 2.0 | 200 posts/day, 1000 DMs/day | Post, Story, Reel, DM, Comment |
| **LinkedIn** | LinkedIn API | OAuth 2.0 | 100 posts/day | Post, Article, DM, Comment |
| **YouTube** | YouTube Data API v3 | OAuth 2.0 | 10,000 units/day | Upload, Shorts, Comment, Reply |
| **TikTok** | TikTok API | OAuth 2.0 | 100 videos/day | Upload, Comment, Reply |
| **OnlyFans** | OnlyFans API | API Key | Varies | Post, Message, PPV, Tips |
| **Twitch** | Twitch Helix API | OAuth 2.0 | 800/min | Stream Title, Chat, Clips |

### UI Components

```
src/
├── social-media/
│   ├── components/
│   │   ├── ContentCalendar.tsx       # Drag-drop 7+ day calendar
│   │   ├── PostCard.tsx              # Draggable post card
│   │   ├── AutoResponseRules.tsx     # Rule configuration UI
│   │   ├── PlatformConnectionCard.tsx # OAuth connect buttons
│   │   ├── ContentSuggestions.tsx    # AI-generated content
│   │   ├── AnalyticsDashboard.tsx    # Engagement metrics
│   │   └── OptimalTimesChart.tsx     # Best posting times
│   ├── hooks/
│   │   ├── useScheduledPosts.ts      # CRUD for scheduled posts
│   │   ├── useAutoResponses.ts       # Auto-response rule management
│   │   ├── usePlatformConnections.ts # OAuth connection state
│   │   └── useContentGenerator.ts    # AI content suggestions
│   ├── lib/
│   │   ├── platformAdapters.ts       # Platform-specific formatting
│   │   └── calendarUtils.ts          # Drag-drop calendar logic
│   └── types/
│       └── index.ts                  # TypeScript interfaces
```

### Implementation Priority

| Phase | Feature | Complexity | Dependencies |
|-------|---------|------------|--------------|
| **1** | Database schema + migrations | Medium | Lovable Cloud |
| **2** | Platform OAuth connections | High | Platform API keys |
| **3** | Content Calendar UI | Medium | scheduled_posts table |
| **4** | AI Content Generator | Medium | Lovable AI Gateway |
| **5** | Auto-Response System | High | Local model + Cloud fallback |
| **6** | Analytics Dashboard | Medium | content_analytics table |
| **7** | CRON job for publishing | Medium | Edge function + pg_cron |

---

## Appendix

### Contact & Support

**Project Creator:** Francis Okorie Iyeke-Kanu  
**Email:** francis.okorie.Ik@gmail.com

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0-alpha | Dec 2024 | Initial architecture, UI framework, agent engine |

### License

Patented by Francis Okorie Iyeke-Kanu

---

*This document is maintained alongside the codebase and should be updated as the project evolves.*
