import { callLocalModel, checkLocalModelHealth } from '@/agent-engine/services/localModel';
import { AIModel, AIRequestPayload } from '@/agent-engine/types';
import { VisionData } from '@/types/agent';

// Re-export types
export type { AIModel };

// Configuration
const VISION_MODEL: AIModel = 'moondream';
const CHAT_MODEL: AIModel = 'llama3.1:8b';

/**
 * Service to handle AI interactions
 */
export const AIService = {
  /**
   * Check if local AI is available
   */
  checkHealth: async () => {
    return await checkLocalModelHealth();
  },

  /**
   * Send a chat message to the local AI
   */
  chat: async (message: string, systemPrompt?: string) => {
    const messages: AIRequestPayload['messages'] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    return await callLocalModel({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
    });
  },

  /**
   * Analyze a screen/image using Moondream
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
        temperature: 0.1, // Low temp for more deterministic JSON
        maxTokens: 500,
      });

      // Parse JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          ocrText: data.description,
          nextAction: data.nextAction,
          confidence: data.confidence,
          // Note: detectedElements need mapping to bounding boxes, which Moondream assumes
          // are text descriptions here. Real coordinates require a second pass or OCR.
          detectedElements: data.elements?.map((label: string, idx: number) => ({
            id: `el-${idx}`,
            type: 'element',
            label,
            bounds: { x: 0, y: 0, width: 0, height: 0 }, // Placeholder
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
