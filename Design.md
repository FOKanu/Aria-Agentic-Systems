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
