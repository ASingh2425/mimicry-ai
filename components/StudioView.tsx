import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Download, ArrowLeft, Copy, Check } from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../types';
import StyleRadarChart from './RadarChart';
import { generateInStyle } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface Props {
  analysis: AnalysisResult;
  onReset: () => void;
}

const StudioView: React.FC<Props> = ({ analysis, onReset }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: prompt, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      // Convert internal ChatMessage to Gemini API history format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await generateInStyle(userMsg.text, analysis.systemInstruction, history);
      
      const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'model', text: "Error: Failed to generate content. Please try again.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInstruction = () => {
    navigator.clipboard.writeText(analysis.systemInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto overflow-hidden animate-fade-in">
      
      {/* Left Sidebar: Model Specs */}
      <div className="w-full lg:w-80 bg-charcoal/20 border-r border-charcoal/50 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-charcoal/50">
          <button onClick={onReset} className="flex items-center text-xs text-mist hover:text-white transition-colors mb-4 gap-1">
            <ArrowLeft size={12} /> Back to Tuning
          </button>
          <h2 className="text-xl font-bold text-white font-mono">Model Specs</h2>
          <p className="text-xs text-mist mt-1">Status: <span className="text-green-400">Ready</span></p>
        </div>

        <div className="p-6 border-b border-charcoal/50">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">Style Fingerprint</h3>
          <StyleRadarChart metrics={analysis.metrics} />
        </div>

        <div className="p-6 flex-1">
          <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Style Summary</h3>
          <p className="text-sm text-gray-300 italic mb-6">"{analysis.summary}"</p>

          <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex justify-between items-center">
            System Instruction
            <button onClick={handleCopyInstruction} className="text-mist hover:text-white">
                {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </h3>
          <div className="bg-obsidian rounded p-3 text-[10px] text-gray-400 font-mono h-40 overflow-y-auto border border-charcoal">
            {analysis.systemInstruction}
          </div>
        </div>
      </div>

      {/* Right: Chat/Generation Area */}
      <div className="flex-1 flex flex-col bg-obsidian relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-mist opacity-50">
              <RefreshCw size={48} className="mb-4" />
              <p className="font-serif text-lg">Model is primed. Start writing.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-6 ${
                  msg.role === 'user' 
                    ? 'bg-charcoal text-white rounded-br-none' 
                    : 'bg-transparent text-gray-100 font-serif text-lg leading-relaxed border-l-2 border-accent pl-6'
                }`}
              >
                {msg.role === 'model' ? (
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-mist font-mono text-xs pl-6">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div>
                Generating...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-obsidian border-t border-charcoal/50">
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter a prompt to generate text in your style..."
              className="w-full bg-charcoal/50 text-white placeholder-gray-500 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-charcoal transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!prompt.trim() || loading}
              className="absolute right-2 top-2 p-2 bg-accent text-obsidian rounded-full hover:bg-sky-400 disabled:opacity-50 disabled:bg-gray-600 transition-colors"
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioView;