import { useState, useEffect } from "react";
import { useParams } from "wouter";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatInterface from "@/components/chat/chat-interface";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>(
    conversationId ? parseInt(conversationId) : undefined
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(parseInt(conversationId));
    }
  }, [conversationId]);

  const handleConversationSelect = (id: number) => {
    setCurrentConversationId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentConversationId={currentConversationId}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main chat interface */}
      <ChatInterface 
        conversationId={currentConversationId}
        onConversationCreate={setCurrentConversationId}
        onMenuToggle={() => setSidebarOpen(true)}
      />
    </div>
  );
}
