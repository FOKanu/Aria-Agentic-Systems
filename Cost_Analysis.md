# ARIA - Cost Analysis

**Project Creator:** Francis Okorie Iyeke-Kanu  
**Contact:** francis.okorie.Ik@gmail.com  
**Version:** 0.2.0-alpha  
**Last Updated:** December 20, 2025

---

## Table of Contents

1. [Cost Overview](#cost-overview)
2. [AI Model Costs](#ai-model-costs)
3. [Infrastructure Costs](#infrastructure-costs)
4. [Local-First Strategy ROI](#local-first-strategy-roi)
5. [Cost Projections](#cost-projections)
6. [Optimization Strategies](#optimization-strategies)

---

## Cost Overview

### Philosophy
ARIA employs a **Local-First AI Strategy** to minimize cloud API costs while maintaining high-quality responses. The goal is 95% local processing with 5% cloud fallback for complex tasks.

### Current Cost Structure

| Category | Monthly Estimate | Notes |
|----------|------------------|-------|
| Lovable Cloud (Supabase) | $0 - $25 | Free tier covers dev |
| Lovable AI | Usage-based | Free tier available |
| Edge Functions | Included | Part of Cloud |
| Storage | Included | Part of Cloud |
| Local Models | $0 | Self-hosted |

---

## AI Model Costs

### Lovable AI (Cloud Fallback)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Best For |
|-------|----------------------|------------------------|----------|
| `gemini-2.5-flash` | ~$0.075 | ~$0.30 | Default, balanced |
| `gemini-2.5-flash-lite` | ~$0.015 | ~$0.06 | Simple tasks |
| `gemini-2.5-pro` | ~$1.25 | ~$5.00 | Complex reasoning |
| `gpt-5-nano` | Low | Low | Fast, simple |
| `gpt-5-mini` | Medium | Medium | Balanced |
| `gpt-5` | High | High | Accuracy-critical |

### Cost per User Action (Estimates)

| Action | Tokens | Model | Est. Cost |
|--------|--------|-------|-----------|
| Simple chat message | ~500 | gemini-2.5-flash | ~$0.0002 |
| Code generation | ~2,000 | gemini-2.5-pro | ~$0.012 |
| Document analysis | ~5,000 | gemini-2.5-flash | ~$0.002 |
| Image analysis | ~1,000 | gemini-2.5-pro | ~$0.006 |
| Long research query | ~10,000 | gpt-5 | Variable |

### Monthly Cost Scenarios

| Usage Level | Messages/Month | Est. Monthly Cost |
|-------------|----------------|-------------------|
| Light (Personal) | 1,000 | $1 - $5 |
| Moderate (Professional) | 5,000 | $5 - $25 |
| Heavy (Team) | 20,000 | $25 - $100 |
| Enterprise | 100,000+ | Custom pricing |

---

## Infrastructure Costs

### Lovable Cloud (Current)

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Database | 500MB | 8GB+ |
| Edge Functions | 500K invocations | 2M+ |
| Storage | 1GB | 100GB+ |
| Bandwidth | 5GB | 250GB+ |
| Realtime | 200 concurrent | 500+ |

### Local Infrastructure (Optional)

| Component | One-Time Cost | Monthly Cost |
|-----------|---------------|--------------|
| GPU Server (for local models) | $500 - $5,000 | Electricity |
| Ollama (Docker) | $0 | $0 |
| Local Storage | Existing hardware | $0 |

---

## Local-First Strategy ROI

### Comparison: Full Cloud vs Local-First

#### Scenario: 10,000 messages/month

**Full Cloud Approach:**
```
10,000 messages × ~1,000 tokens avg × $0.30/1M tokens = ~$3.00/month (output only)
Including input: ~$5-10/month
```

**Local-First Approach (95% local):**
```
9,500 messages → Local ($0)
500 messages → Cloud ($0.25 - $0.50)
Total: $0.25 - $0.50/month
```

**Savings: 90-95%**

### Break-Even Analysis

| Investment | Payback Period |
|------------|----------------|
| $0 (Ollama on existing hardware) | Immediate |
| $500 (Dedicated mini-PC) | 6-12 months |
| $2,000 (GPU workstation) | 12-24 months |

---

## Cost Projections

### Year 1 Estimates (Personal Use)

| Month | Users | Messages | Cloud Cost | Local Cost | Total |
|-------|-------|----------|------------|------------|-------|
| 1-3 | 1 | 3,000 | $5 | $0 | $5 |
| 4-6 | 1-2 | 6,000 | $8 | $0 | $8 |
| 7-9 | 2-5 | 10,000 | $12 | $0 | $12 |
| 10-12 | 5-10 | 20,000 | $20 | $0 | $20 |

**Year 1 Total: ~$135**

### Year 1 Estimates (Small Team - 10 users)

| Quarter | Messages | Cloud Cost | Local Cost | Total |
|---------|----------|------------|------------|-------|
| Q1 | 15,000 | $25 | $0 | $75 |
| Q2 | 30,000 | $50 | $0 | $150 |
| Q3 | 50,000 | $75 | $0 | $225 |
| Q4 | 80,000 | $100 | $0 | $300 |

**Year 1 Total: ~$750**

---

## Optimization Strategies

### 1. Model Selection Routing

```
Task Complexity Analysis:
├── Simple (chat, Q&A) → gemini-2.5-flash-lite (cheapest)
├── Moderate (summarization, translation) → gemini-2.5-flash
├── Complex (reasoning, research) → gemini-2.5-pro
└── Vision → gemini-2.5-pro (required for images)
```

### 2. Response Caching

| Cache Type | Hit Rate Target | Cost Reduction |
|------------|-----------------|----------------|
| Exact match | 10-15% | 10-15% |
| Semantic similarity | 20-30% | 15-25% |
| Template responses | 5-10% | 5-10% |

### 3. Token Optimization

- **System prompts:** Compress to essential instructions
- **Context window:** Summarize long conversations
- **Response length:** Set appropriate max_tokens
- **Prompt engineering:** Minimize input tokens

### 4. Local Model Priority

| Task Type | Recommended Model | Reason |
|-----------|-------------------|--------|
| Code completion | CodeLlama 34B | Excellent for code |
| Simple chat | Llama 3.2 8B | Fast, good quality |
| Classification | Phi-3 3.8B | Tiny, efficient |
| Summarization | Mistral 7B | Good balance |

### 5. Batch Processing

- Combine related requests
- Process documents in batches
- Defer non-urgent tasks to off-peak

---

## Cost Monitoring

### Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Cloud API calls/day | < 100 | > 200 |
| Tokens/message avg | < 800 | > 1,500 |
| Local model % | > 90% | < 80% |
| Cache hit rate | > 20% | < 10% |
| Monthly spend | Budget | > 120% budget |

### Dashboard Recommendations

1. Real-time API cost tracker
2. Model usage breakdown
3. Local vs cloud ratio
4. Cost per user/agent
5. Monthly trend analysis

---

## Summary

| Metric | Target | Current |
|--------|--------|---------|
| Local Processing % | 95% | TBD (pending local setup) |
| Monthly Cloud Cost | < $25 | < $10 (dev phase) |
| Cost per Active User | < $5 | < $2 (dev phase) |
| ROI vs Full Cloud | 90%+ savings | Projected |

---

*Cost analysis last updated: December 20, 2025*
