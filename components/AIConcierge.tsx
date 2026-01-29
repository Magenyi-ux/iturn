
import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, Send, Crown, Bot } from 'lucide-react';

const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Greetings, Master Tailor. I am your Imperial Concierge. How may I assist your craft today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "An excellent inquiry. For such a silhouette, I recommend a structured silk-wool blend with a high thread count to maintain the royal drape."
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <div className="absolute inset-0 bg-[var(--color-secondary)] rounded-full animate-ping opacity-20 group-hover:opacity-40" />
        <Crown className="w-8 h-8 text-[var(--color-secondary)] relative z-10" />
      </button>

      {/* Concierge Panel */}
      {isOpen && (
        <div className="fixed bottom-24 lg:bottom-32 right-6 lg:right-10 w-[calc(100%-3rem)] sm:w-96 h-[500px] bg-[var(--color-surface)] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] border border-[var(--color-primary)]/10 flex flex-col z-[60] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-[var(--color-primary)] text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-[var(--color-secondary)]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">Imperial Concierge</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">Online & Attentive</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] p-5 rounded-3xl text-sm font-medium leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-[var(--color-primary)] text-white rounded-tr-none'
                    : 'bg-[var(--color-background)] text-[var(--color-primary)] rounded-tl-none border border-[var(--color-primary)]/5 font-serif italic'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-[var(--color-primary)]/5 bg-[var(--color-background)]/50">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consult the oracle..."
                className="w-full bg-[var(--color-surface)] border border-[var(--color-primary)]/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-[var(--color-secondary)] transition-all shadow-inner"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-accent)] transition-all shadow-lg"
              >
                <Send className="w-4 h-4 text-[var(--color-secondary)]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIConcierge;
