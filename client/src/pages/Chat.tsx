import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { slm, SLMResponse } from '@/lib/slm';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, Category } from '@/lib/mockData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  chartType?: 'bar' | 'pie' | 'line';
  timestamp: Date;
}

const SUGGESTIONS = [
  "How much did I spend on food?",
  "Show my investment trends",
  "Why did my expenses increase?",
  "What counts as 'utilities'?"
];

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your personal finance assistant. I process all your data locally on your device. Ask me about your spending, investments, or trends!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Local SLM
    try {
      const response: SLMResponse = await slm.processQuery(userMsg.content);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        data: response.data,
        chartType: response.chartType,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      // Error handling
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50">
        <div className="px-5 pt-6 pb-2 bg-background sticky top-0 z-10 border-b border-border/40">
           <h1 className="text-xl font-bold flex items-center gap-2">
             <Bot className="w-6 h-6 text-primary" />
             Finance Assistant
           </h1>
           <p className="text-xs text-muted-foreground ml-8">Powered by Local SLM • Private & Secure</p>
        </div>

        <ScrollArea className="flex-1 px-5 py-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-white dark:bg-card border border-border/50 shadow-sm rounded-tl-sm text-foreground"
                  )}>
                    {msg.content}
                  </div>

                  {/* Render Charts if present */}
                  {msg.chartType === 'pie' && msg.data && (
                    <div className="bg-white dark:bg-card border border-border/50 p-4 rounded-xl shadow-sm w-full h-64">
                       <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={msg.data} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={40}
                            outerRadius={70} 
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {msg.data.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#8884d8'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-secondary-foreground animate-pulse" />
                </div>
                <div className="bg-white dark:bg-card border border-border/50 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length < 3 && (
            <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {SUGGESTIONS.map((s, i) => (
                    <Button 
                        key={i} 
                        variant="outline" 
                        size="sm" 
                        className="whitespace-nowrap rounded-full text-xs h-8 bg-background/50 backdrop-blur-sm"
                        onClick={() => handleSuggestionClick(s)}
                    >
                        {s}
                    </Button>
                ))}
            </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/40">
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your finances..."
              className="rounded-full bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary pl-4"
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-full w-10 h-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
