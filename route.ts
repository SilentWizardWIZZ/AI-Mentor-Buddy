import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { chatRequestSchema, insertConversationSchema } from "@shared/schema";
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-openai-api-key"
});

const CAREER_SYSTEM_PROMPT = `You are AI Mentor Buddy, a specialized assistant focused on helping people with their career development and professional growth. Your expertise includes:

- Career exploration and path planning
- Skills assessment and development recommendations  
- Industry insights and job market trends
- Interview preparation and resume guidance
- Professional networking advice
- Education and certification recommendations
- Work-life balance and career transitions

Always provide actionable, personalized advice. Ask follow-up questions to better understand the user's situation, goals, and preferences. Be encouraging and supportive while being realistic about career challenges and opportunities.

Keep responses conversational, well-structured, and focused on practical next steps the user can take.`;

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get conversation with messages
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(conversationId);
      res.json({ conversation, messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, conversationId } = chatRequestSchema.parse(req.body);

      let currentConversationId = conversationId;

      // Create new conversation if none provided
      if (!currentConversationId) {
        const conversation = await storage.createConversation({
          title: message.substring(0, 50) + (message.length > 50 ? "..." : "")
        });
        currentConversationId = conversation.id;
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: currentConversationId,
        role: "user",
        content: message,
      });

      // Get conversation history for context
      const messageHistory = await storage.getMessagesByConversation(currentConversationId);
      
      // Prepare messages for OpenAI (exclude the current user message as it's already in the array)
      const openaiMessages = [
        { role: "system" as const, content: CAREER_SYSTEM_PROMPT },
        ...messageHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openaiMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";

      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId: currentConversationId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        message: aiResponse,
        conversationId: currentConversationId,
        messageId: aiMessage.id,
      });

    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request format" });
      }
      
      // Handle OpenAI specific errors
      if (error && typeof error === 'object' && 'status' in error) {
        const openaiError = error as any;
        if (openaiError.status === 429) {
          return res.status(429).json({ 
            message: "OpenAI API quota exceeded. Please check your billing details at platform.openai.com or add credits to your account.",
            error_type: "quota_exceeded"
          });
        }
        if (openaiError.status === 401) {
          return res.status(401).json({ 
            message: "Invalid OpenAI API key. Please check your API key configuration.",
            error_type: "invalid_api_key"
          });
        }
        if (openaiError.status === 400) {
          return res.status(400).json({ 
            message: "OpenAI API request error. Please try again.",
            error_type: "api_request_error"
          });
        }
      }
      
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Export conversation as text
  app.get("/api/conversations/:id/export", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(conversationId);
      
      let exportText = `AI Mentor Buddy Conversation: ${conversation.title}\n`;
      exportText += `Date: ${conversation.createdAt.toLocaleDateString()}\n\n`;
      
      messages.forEach(msg => {
        const speaker = msg.role === "user" ? "You" : "AI Mentor Buddy";
        exportText += `${speaker}:\n${msg.content}\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="mentor-buddy-chat-${conversationId}.txt"`);
      res.send(exportText);
      
    } catch (error) {
      res.status(500).json({ message: "Failed to export conversation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
