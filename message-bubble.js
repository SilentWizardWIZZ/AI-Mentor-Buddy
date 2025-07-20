import { format } from "date-fns";
import { Brain, User, Copy, Share, Construction } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex items-start space-x-3 animate-fade-in ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
          <Brain className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-2xl p-4 max-w-2xl ${
          isUser 
            ? 'bg-primary text-white rounded-tr-sm' 
            : 'bg-gray-50 rounded-tl-sm'
        }`}>
          <div className={`prose prose-sm ${isUser ? 'prose-invert' : ''}`}>
            {message.content.split('\n').map((line, index) => {
              if (line.trim().startsWith('•')) {
                return (
                  <div key={index} className="flex items-start space-x-2 my-1">
                    <span className="text-sm mt-0.5">•</span>
                    <span className="text-sm">{line.replace('•', '').trim()}</span>
                  </div>
                );
              }
              return line.trim() ? (
                <p key={index} className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'} mb-2 last:mb-0`}>
                  {line}
                </p>
              ) : (
                <div key={index} className="h-2" />
              );
            })}
          </div>
        </div>
        
        {/* Message metadata and actions */}
        <div className={`flex items-center space-x-4 mt-3 ${isUser ? 'justify-end' : ''}`}>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{isUser ? 'You' : 'AI Mentor Buddy'}</span>
            <span>•</span>
            <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
          
          {!isUser && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-100"
                title="Copy message"
              >
                <Copy className="h-3 w-3 text-gray-400" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-100"
                title="Generate roadmap"
              >
                <Construction className="h-3 w-3 text-gray-400" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-100"
                title="Share message"
              >
                <Share className="h-3 w-3 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
