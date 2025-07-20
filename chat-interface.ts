import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Menu, Send } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import type { Message, ChatRequest, ChatResponse } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId?: number;
  onConversationCreate: (id: number) => void;
  onMenuToggle: () => void;
}

export default function ChatInterface({ 
  conversationId, 
  onConversationCreate, 
  onMenuToggle 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch conversation messages
  const { data: conversationData, isLoading } = useQuery({
    queryKey: ['/api/conversations', conversationId],
    queryFn: async () => {
      if (!conversationId) return { conversation: null, messages: [] };
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) throw new Error('Failed to fetch conversation');
      return res.json() as Promise<{ conversation: any; messages: Message[] }>;
    },
    enabled: !!conversationId,
  });

  const messages = conversationData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (chatRequest: ChatRequest) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest),
      });
      if (!res.ok) {
        // Throw the response object so we can access the error details in onError
        throw res;
      }
      return res.json() as Promise<ChatResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (response) => {
      if (!conversationId) {
        onConversationCreate(response.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', response.conversationId] });
      setMessage("");
      setIsTyping(false);
    },
    onError: async (error) => {
      setIsTyping(false);
      
      // Try to get more specific error information
      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          if (errorData.error_type === "quota_exceeded") {
            toast({
              title: "OpenAI API Quota Exceeded",
              description: "Your OpenAI API credits have been used up. Please add billing to your OpenAI account at platform.openai.com",
              variant: "destructive",
            });
            return;
          }
          if (errorData.error_type === "invalid_api_key") {
            toast({
              title: "Invalid API Key",
              description: "Please check your OpenAI API key configuration in Replit secrets.",
              variant: "destructive",
            });
            return;
          }
          if (errorData.message) {
            toast({
              title: "Error",
              description: errorData.message,
              variant: "destructive",
            });
            return;
          }
        } catch (e) {
          // If JSON parsing fails, fall through to generic error
        }
      }
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      conversationId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const welcomeMessage = {
    id: -1,
    role: "assistant" as const,
    content: `Welcome to AI Mentor Buddy! I'm here to help you discover and plan your ideal career path.

I can help you with:
• Career exploration based on your interests and skills
• Personalized roadmaps with learning resources  
• Industry insights and job market trends
• Skill gap analysis and development plans

What would you like to explore today?`,
    createdAt: new Date(),
    conversationId: 0,
  };

  const allMessages = messages.length === 0 ? [welcomeMessage] : messages;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Career Guidance Chat</h2>
              <p className="text-sm text-gray-500">Ask me anything about your career path</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {allMessages.map((msg, index) => (
              <MessageBubble key={msg.id || index} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about career paths, skills, or industry insights..."
              className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              rows={1}
              maxLength={2000}
              disabled={sendMessageMutation.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{message.length}/2000 characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
