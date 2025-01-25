import React, { useState, FormEvent } from 'react';

interface ChatProps {
  uploadedFile: File | null;
  onCodeGenerated: (code: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC<ChatProps> = ({ uploadedFile, onCodeGenerated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to local state
    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      setLoading(true);

      // Prepare form data for the request
      const formData = new FormData();
      formData.append('prompt', userMessage.content);
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      // Call our API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.answer };

      // Add assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      // If the API returned `codeSnippet`, pass to onCodeGenerated
      if (data.codeSnippet) {
        onCodeGenerated(data.codeSnippet);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Unable to generate response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="max-h-72 overflow-y-auto border border-gray-300 bg-white p-3 rounded-md">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-blue-600' : 'text-gray-800'}`}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center space-x-2">
        <input
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Ask the AI about your file or request a chart..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
