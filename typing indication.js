import { Brain } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
        <Brain className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
