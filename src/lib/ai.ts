import { callLocalModel, checkLocalModelHealth, callLocalModelStreaming } from '@/agent-engine/services/localModel';
import { AIModel, AIRequestPayload } from '@/agent-engine/types';
import { VisionData } from '@/types/agent';
import { streamChat as cloudStreamChat } from '@/lib/chatStream';

// Re-export types
export type { AIModel };

// Configuration — Ollama via SSH tunnel to remote GPU (localhost:11434)
const VISION_MODEL: AIModel = 'moondream';
const CHAT_MODEL: AIModel =
  (import.meta.env.VITE_LOCAL_MODEL_NAME as AIModel | undefined) || 'qwen3:8b';

/**
 * Service to handle AI interactions
 * Hybrid strategy:
 * 1. Prefer tunneled Ollama when reachable
 * 2. Fall back to Cloud (Supabase → Gemini) if Ollama is offline or errors
 */
export const AIService = {
  /**
   * Check if local AI is available
   */
  checkHealth: async () => {
    return await checkLocalModelHealth();
  },

  /**
   * Send a chat message using the Hybrid Strategy (Streaming)
   */
  streamChat: async (
    message: string,
    systemPrompt: string | undefined,
    context: any,
    onDelta: (delta: string) => void,
    onDone: () => void,
    onError: (error: any) => void
  ) => {
    const isLocalAlive = await checkLocalModelHealth();

    if (isLocalAlive) {
      console.log(`🤖 Using Local LLM (Ollama) — ${CHAT_MODEL}`);
      const messages: AIRequestPayload['messages'] = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: message });

      try {
        const response = await callLocalModelStreaming({
          model: CHAT_MODEL,
          messages,
          temperature: 0.7,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No stream body');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const cleanLine = line.startsWith('data: ') ? line.slice(6) : line;
              if (cleanLine === '[DONE]') continue;

              const parsed = JSON.parse(cleanLine);
              const content =
                parsed.choices?.[0]?.delta?.content ||
                parsed.message?.content ||
                parsed.response ||
                '';

              if (content) onDelta(content);
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
        onDone();
        return;
      } catch (error) {
        console.error('Local Stream Error — falling back to cloud:', error);
        // Prefer Ollama when up; if the request fails, still try Gemini
      }
    }

    console.log('☁️ Local LLM offline/errored. Switching to Cloud (Gemini via Supabase)');

    await cloudStreamChat({
      messages: [{ role: 'user', content: message }],
      context,
      onDelta,
      onDone,
      onError,
    });
  },

  /**
   * Send a chat message using the Hybrid Strategy (Promise-based)
   */
  chat: async (message: string, systemPrompt?: string, context?: any) => {
    return new Promise<{ id: string; content: string; model: string; provider: string; }>((resolve, reject) => {
      let fullContent = '';

      AIService.streamChat(
        message,
        systemPrompt,
        context,
        (delta) => { fullContent += delta; },
        () => {
          resolve({
            id: `msg-${Date.now()}`,
            content: fullContent,
            model: CHAT_MODEL,
            provider: 'hybrid'
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  },

  /**
   * Analyze a screen/image using Moondream (Local Only for now)
   */
  analyzeScreen: async (base64Image: string): Promise<Partial<VisionData>> => {
    const prompt = `
      Describe this UI screen in detail.
      1. Identify the main detected elements (buttons, inputs, text).
      2. Suggest the most likely next action for a user.
      3. Rate confidence (0-1).

      Format response as JSON:
      {
        "description": "...",
        "elements": ["Button: Login", "Input: Email"],
        "nextAction": "...",
        "confidence": 0.9
      }
    `;

    try {
      const isLocalAlive = await checkLocalModelHealth();

      if (!isLocalAlive) {
         return {
            ocrText: "Local Vision AI is offline. Cloud Vision is not yet enabled.",
            confidence: 0
         }
      }

      const response = await callLocalModel({
        model: VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        temperature: 0.1,
        maxTokens: 500,
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          ocrText: data.description,
          nextAction: data.nextAction,
          confidence: data.confidence,
          detectedElements: data.elements?.map((label: string, idx: number) => ({
            id: `el-${idx}`,
            type: 'element',
            label,
            bounds: { x: 0, y: 0, width: 0, height: 0 },
            confidence: 0.8
          }))
        };
      }

      return {
        ocrText: response.content,
        confidence: 0.5
      };

    } catch (error) {
      console.error('Vision analysis failed:', error);
      return {
        ocrText: 'Failed to analyze screen.',
        confidence: 0
      };
    }
  }
};
