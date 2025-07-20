import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Brain, MessageCircle, Plus, Construction, Download, Book, User, Settings, X, Menu } from "lucide-react";
import type { Conversation } from "@shared/schema";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: number;
  onConversationSelect: (id: number) => void;
  onNewConversation: () => void;
}

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  currentConversationId, 
  onConversationSelect, 
  onNewConversation 
}: ChatSidebarProps) {
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json() as Promise<Conversation[]>;
    },
  });

  return (
    <div className={cn(
      "w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50",
      "lg:block lg:relative lg:translate-x-0",
      isOpen 
        ? "fixed inset-y-0 left-0 translate-x-0" 
        : "fixed inset-y-0 left-0 -translate-x-full lg:translate-x-0"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Brain className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Mentor Buddy</h1>
            <p className="text-sm text-gray-500">Your Career Guide</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewConversation}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-4 pb-4">
        {conversations.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Recent Conversations
            </h3>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors",
                    currentConversationId === conversation.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100"
                  )}
                >
                  <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{conversation.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors">
              <Construction className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700">Generate Roadmap</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors">
              <Download className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700">Export as PDF</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg hover:bg-gray-100 transition-colors">
              <Book className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-700">Resource Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Settings className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
