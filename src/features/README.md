# Features Directory

This directory contains feature modules following a consistent pattern for organization and maintainability.

## Module Structure

Each feature module follows this convention:

```
src/features/{feature-name}/
├── components/        # Feature-specific UI components
├── hooks/            # Feature-specific React hooks
├── types/            # Feature-specific TypeScript types
├── utils/            # Feature-specific utility functions
├── pages/            # Page components (if applicable)
└── index.ts          # Public API exports
```

## Feature Modules

| Module | Description |
|--------|-------------|
| `chat` | AI chat interface, messaging, voice input |
| `agents` | Agent management, profiles, fleet command |
| `dashboard` | Home dashboard, analytics, monitoring |
| `auth` | Authentication, login, signup, profiles |
| `files` | File management, uploads, permissions |
| `tasks` | Task management, workflows |
| `calendar` | Calendar events, scheduling |
| `contacts` | Contact management |
| `finance` | Budget, expenses, invoices, payments |
| `devops` | CI/CD, deployments, infrastructure |
| `legal` | Contracts, compliance, NDAs |
| `monitoring` | Alerts, logs, execution traces |

## Import Convention

Always import from the feature's public API (index.ts):

```typescript
// ✅ Correct - import from public API
import { ChatPage, useChatContext } from '@/features/chat';

// ❌ Avoid - importing internal modules directly
import { ChatPage } from '@/features/chat/pages/ChatPage';
```

## Creating a New Feature Module

1. Create the feature directory: `src/features/{feature-name}/`
2. Add the standard subdirectories as needed
3. Create an `index.ts` that exports the public API
4. Update this README with the new module description

## Guidelines

- Keep feature modules self-contained
- Minimize cross-feature dependencies
- Shared utilities go in `@/core`
- UI primitives go in `@/components/ui`
