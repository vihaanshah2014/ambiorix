import React, { useState, FormEvent } from 'react';

interface ChatProps {
  uploadedFile: File | null;
  onCodeGenerated: (code: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChartConfig {
  chartType: string;
  xAxis: string;
  yAxis: string;
  title?: string;
  color?: string;
  borderColor?: string;
}

export default function Chat({ uploadedFile, onCodeGenerated }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !uploadedFile) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      setInput('');

      const formData = new FormData();
      formData.append('prompt', input);
      formData.append('file', uploadedFile);

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      
      if (data.chartConfig) {
        onCodeGenerated(JSON.stringify(data.chartConfig));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages Display */}
      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-3 ${
              msg.role === 'user' ? 'text-blue-600' : 'text-gray-800'
            }`}
          >
            <span className="font-semibold">
              {msg.role === 'user' ? 'You: ' : 'AI: '}
            </span>
            {msg.content}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            Start by asking about your data or requesting a specific chart type
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={uploadedFile 
            ? "Ask about your data or request a chart..." 
            : "Please upload a file first"
          }
          disabled={!uploadedFile || isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!uploadedFile || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
