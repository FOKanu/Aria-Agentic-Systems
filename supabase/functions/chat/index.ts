import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, systemPrompt: clientSystemPrompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Chat request received:", {
      messageCount: messages?.length,
      context: context?.pageName,
      hasClientPrompt: !!clientSystemPrompt
    });

    // Build system prompt: Use client provided prompt (Agent persona) or default (Atlas)
    // We append context to whichever prompt is used
    const basePrompt = clientSystemPrompt || buildSystemPrompt(context);
    const finalSystemPrompt = context ? appendContext(basePrompt, context) : basePrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash", // Using stable 1.5 flash
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(context?: { pageName?: string; pageCategory?: string; contextData?: unknown }): string {
  return `You are Atlas, an intelligent AI assistant for a fleet management and productivity platform. You help users manage their AI agents, tasks, files, calendar, contacts, and more.

Your capabilities include:
- Answering questions about the current page context
- Helping manage tasks, agents, and workflows
- Providing insights from data and analytics
- Assisting with scheduling and calendar management
- Helping organize files and documents
- Supporting DevOps, Legal, and Finance operations

Be concise, helpful, and proactive. When appropriate, suggest actions the user could take.`;
}

function appendContext(prompt: string, context?: { pageName?: string; pageCategory?: string; contextData?: unknown }): string {
  if (!context?.pageName) return prompt;

  return `${prompt}

Current Context:
- Page: ${context.pageName}
- Category: ${context.pageCategory || 'general'}
${context.contextData ? `- Additional Context: ${JSON.stringify(context.contextData)}` : ''}

Tailor your responses to be relevant to the user's current page and activity.`;
}
