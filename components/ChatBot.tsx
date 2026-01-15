
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi there! I'm your Magic Companion. Have a question about a story or anything else?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm not sure what to say, but I'm here!" }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Oh no, my magic is a bit fizzy right now. Let's try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl flex flex-col border-4 border-sky-100 overflow-hidden transform transition-all animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-sky-500 p-4 text-white font-fun flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span>Magic Buddy</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-sky-600 p-1 rounded-full transition-colors">
              ✕
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-sky-500 text-white rounded-tr-none shadow-md' 
                  : 'bg-white text-sky-800 rounded-tl-none border border-sky-100 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-sky-400 p-3 rounded-2xl rounded-tl-none border border-sky-100 italic text-sm animate-pulse">
                  Magic Buddy is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-sky-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-sky-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-300 transition-all outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-sky-500 text-white p-2 rounded-xl hover:bg-sky-600 transition-colors"
            >
              🚀
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-sky-500 text-white w-16 h-16 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center text-3xl animate-bounce"
        >
          🤖
        </button>
      )}
    </div>
  );
};
