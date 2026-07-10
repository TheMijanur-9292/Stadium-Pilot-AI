'use client';

import Avatar from '@/components/Avatar';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip } from '@heroui/react';
import { 
  Send, Bot, User as UserIcon, Sparkles, Navigation, 
  ShieldAlert, Settings, Globe, AlertTriangle, Trash2,
  MapPin, Utensils, Calendar, Bus, Flame, Clock, Clipboard, Plus
} from 'lucide-react';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface BotJSONResponse {
  title: string;
  summary: string;
  recommendations: string[];
  warnings: string[];
  estimatedTime: string;
  nextSteps: string[];
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  contentParsed?: BotJSONResponse | null;
  typing?: boolean;
}

function TypewriterText({ text, speed = 8, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let current = '';
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        current += text.charAt(index);
        setDisplayedText(current);
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
}

const LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Spanish', name: 'Spanish (Español)' },
  { code: 'French', name: 'French (Français)' },
  { code: 'Arabic', name: 'Arabic (العربية)' },
  { code: 'Hindi', name: 'Hindi (हिन्दी)' },
  { code: 'Bengali', name: 'Bengali (বাংলা)' }
];

export default function AIAssistantPage() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  
  // Local preferences context
  const [language, setLanguage] = useState('English');
  const [venues, setVenues] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/api/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await api.get('/api/venues/all');
      setVenues(res.data);
      if (res.data.length > 0) {
        setSelectedVenue(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load venues:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchVenues();
  }, []);

  useEffect(() => {
    if (user) {
      setLanguage(user.preferredLanguage || 'English');
      startNewChat();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  function getPresetQuestions(role: string) {
    switch (role) {
      case 'FAN':
        return [
          'Where is the nearest wheelchair elevator?',
          'Recommend vegan options near Section 112.',
          'How do I take transit to the subway after USA vs England?',
        ];
      case 'VOLUNTEER':
        return [
          'What is the check-in protocol for my VIP Lounge shift?',
          'Where is the water restocking station B located?',
          'What is the procedure for handling a lost child incident?',
        ];
      case 'VENUE_STAFF':
        return [
          'What are the priority safety coordinates for Section 112?',
          'How should I report a queue bottleneck at Gate A?',
          'What is the checklist for cleaning up a chemical spill?',
        ];
      case 'ORGANIZER':
      case 'ADMIN':
        return [
          'Summarize active incident severity trends.',
          'What is the status of stadium utilities and power grid?',
          'Are volunteer check-in rates meeting our safety quorum?',
        ];
      default:
        return ['Help me navigate the stadium.', 'Show match schedules.', 'Find concession stands.'];
    }
  }

  const loadConversation = async (id: string) => {
    try {
      setLoading(true);
      setCurrentConvId(id);
      const res = await api.get(`/api/chat/conversation/${id}`);
      
      const loadedMessages = res.data.messages.map((m: any) => ({
        sender: m.role === 'user' ? 'user' : 'bot',
        text: m.role === 'user' ? m.content : (m.contentParsed?.summary || m.content),
        contentParsed: m.role === 'user' ? null : m.contentParsed,
        timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typing: false,
      }));
      setMessages(loadedMessages);
      setSuggestedQuestions(getPresetQuestions(user.role));
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    } finally {
      setLoading(false);
    }
  };

  function startNewChat() {
    setCurrentConvId(null);
    setMessages([
      {
        sender: 'bot',
        text: `Hello ${user?.fullName || 'User'}! I am your StadiumPilot operations assistant. I see you are signed in as a **${user?.role?.toLowerCase().replace('_', ' ') || 'guest'}**. How can I assist you with World Cup operations today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typing: false,
        contentParsed: {
          title: 'System Initialized',
          summary: `Hello ${user?.fullName || 'User'}! I am your StadiumPilot operations assistant. I see you are signed in as a ${user?.role?.toLowerCase().replace('_', ' ') || 'guest'}. How can I assist you with World Cup operations today?`,
          recommendations: ['Select a topic to begin', 'Select language or venue in the side panel'],
          warnings: [],
          estimatedTime: 'N/A',
          nextSteps: ['Ask a question', 'Click on preset options']
        }
      }
    ]);
    setSuggestedQuestions(getPresetQuestions(user?.role || 'FAN'));
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chat/conversation/${id}`);
      if (currentConvId === id) {
        startNewChat();
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.post('/api/chat/ask-ai', { 
        message: text,
        conversationId: currentConvId || undefined,
        page: 'AI Copilot Assistant',
        venueId: selectedVenue || undefined
      });

      if (response.data.conversationId && !currentConvId) {
        setCurrentConvId(response.data.conversationId);
        fetchConversations();
      }

      const botMsg: Message = {
        sender: 'bot',
        text: response.data.response?.summary || response.data.text,
        contentParsed: response.data.response || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typing: true,
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        sender: 'bot',
        text: `Sorry, I encountered an error: ${err.message || 'Server timeout.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typing: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Basic toast replacement
    alert('Copied response summary to clipboard!');
  };

  const renderBotResponse = (parsed: BotJSONResponse, typing?: boolean, onComplete?: () => void) => {
    const isEmergency = Array.isArray(parsed?.warnings) && parsed.warnings.some(w => w && typeof w === 'string' && (w.toLowerCase().includes('emergency') || w.toLowerCase().includes('collaps') || w.toLowerCase().includes('collapse')));
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Title & Timing */}
        <div className="flex justify-between items-start border-b border-default-100/50 pb-2">
          <h4 className="font-extrabold text-[12px] text-primary-500 uppercase tracking-wider">{parsed?.title || 'Notification'}</h4>
          {parsed?.estimatedTime && parsed?.estimatedTime !== 'N/A' && (
            <Chip size="sm" variant="soft" color="accent" className="text-[9px] h-5 font-semibold">
              <Clock size={10} className="inline mr-1" /> {parsed.estimatedTime}
            </Chip>
          )}
        </div>

        {/* Summary */}
        <p className="text-[11px] text-default-800 dark:text-default-200 leading-relaxed font-medium">
          {typing ? (
            <TypewriterText text={parsed?.summary || ''} speed={8} onComplete={onComplete} />
          ) : (
            parsed?.summary
          )}
        </p>

        {/* Warnings Alert Box */}
        {Array.isArray(parsed?.warnings) && parsed.warnings.length > 0 && (
          <div className={`p-3 rounded-xl border flex gap-2 items-start ${
            isEmergency 
              ? 'border-danger/30 bg-danger-500/10 text-danger-600 dark:text-danger-400 animate-pulse' 
              : 'border-warning/30 bg-warning-500/10 text-warning-600 dark:text-warning-400'
          }`}>
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <div className="text-[10px] font-bold leading-normal">
              {parsed.warnings.map((w, idx) => (
                <p key={idx}>{w}</p>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {Array.isArray(parsed?.recommendations) && parsed.recommendations.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-default-400 uppercase font-bold tracking-wider">Recommendations</span>
            <div className="grid grid-cols-1 gap-1.5">
              {parsed.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-default-50/50 dark:bg-default-900/30 p-2 rounded-xl border border-default-100/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>
                  <span className="text-[10px] text-default-700 dark:text-default-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {Array.isArray(parsed?.nextSteps) && parsed.nextSteps.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-default-400 uppercase font-bold tracking-wider">Next Action Steps</span>
            <div className="space-y-1.5">
              {parsed.nextSteps.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 items-center text-[10px]">
                  <span className="w-5 h-5 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center font-bold text-[9px] flex-shrink-0 border border-primary-500/20">
                    {idx + 1}
                  </span>
                  <span className="text-default-700 dark:text-default-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clipboard action */}
        <div className="flex justify-end pt-1">
          <button 
            onClick={() => copyToClipboard(parsed?.summary || '')}
            className="text-[9px] text-default-400 hover:text-primary-500 flex items-center gap-1 transition-colors"
          >
            <Clipboard size={10} /> Copy summary
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-10rem)] max-h-[850px] animate-fade-in">
        
        {/* Left Conversation List (1 Column) */}
        <Card className="glass-card border border-default-100 shadow-sm flex flex-col justify-between hidden lg:flex">
          <div className="p-4 border-b border-default-100 flex items-center justify-between">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-default-500">Conversations</span>
            <Button 
              size="sm" 
              color="primary" 
              isIconOnly 
              onClick={startNewChat}
              className="rounded-lg w-7 h-7"
            >
              <Plus size={14} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => {
              const isActive = currentConvId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 rounded-xl text-[10px] font-semibold flex justify-between items-center cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-600' 
                      : 'border-transparent hover:bg-default-50 text-default-600'
                  }`}
                >
                  <span className="truncate pr-2">{conv.title}</span>
                  <button 
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="text-default-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <p className="text-[9px] text-default-400 text-center py-4">No active conversations saved.</p>
            )}
          </div>
          
          <div className="p-3 border-t border-default-100 bg-default-50/50 dark:bg-default-900/20 text-center">
            <span className="text-[8px] text-default-400 font-medium">Auto-saved to PostgreSQL</span>
          </div>
        </Card>

        {/* Middle Chat Panel (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full gap-4">
          
          <Card className="glass-card flex-1 overflow-hidden border border-default-100 flex flex-col justify-between shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-default-100 flex items-center justify-between bg-default-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-success-500 absolute"></div>
                <div>
                  <h3 className="font-bold text-xs text-foreground">Operations Assistant</h3>
                  <p className="text-[9px] text-default-400 uppercase tracking-widest font-bold">FIFA World Cup 2026</p>
                </div>
              </div>
              
              <button 
                onClick={startNewChat}
                className="lg:hidden text-[10px] text-primary-500 font-semibold border border-primary-500/20 px-2.5 py-1 rounded-lg"
              >
                + New Chat
              </button>
            </div>

            {/* Chat Messages */}
            <CardContent className="p-6 overflow-y-auto space-y-4 flex-1">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
                    >
                      <Avatar
                        color={isBot ? 'default' : 'accent'}
                        size="sm"
                        className="flex-shrink-0 mt-1 shadow-sm"
                      >
                        {isBot ? <Bot size={16} /> : <UserIcon size={16} />}
                      </Avatar>
                      <div className="space-y-1">
                        <div
                          className={`p-4 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                            isBot
                              ? 'bg-default-100 text-default-800 rounded-tl-none dark:bg-default-200/50 w-full'
                              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-tr-none'
                          }`}
                        >
                          {isBot && msg.contentParsed ? (
                            renderBotResponse(msg.contentParsed, msg.typing, () => {
                              msg.typing = false;
                            })
                          ) : (
                            isBot && msg.typing ? (
                              <TypewriterText 
                                text={msg.text} 
                                speed={8} 
                                onComplete={() => {
                                  msg.typing = false;
                                }} 
                              />
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )
                          )}
                        </div>
                        <p className={`text-[8px] text-default-400 ${isBot ? 'text-left' : 'text-right'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loading && (
                <div className="flex gap-3 self-start max-w-[85%] animate-pulse">
                  <Avatar color="default" size="sm">
                    <Bot size={16} />
                  </Avatar>
                  <div className="bg-default-100 p-4 rounded-2xl rounded-tl-none dark:bg-default-200/50 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 animate-bounce bg-primary-500 rounded-full"></div>
                      <div className="h-2 w-2 animate-bounce bg-primary-500 rounded-full [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 animate-bounce bg-primary-500 rounded-full [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[10px] text-default-600 dark:text-default-400 font-semibold italic">
                      Assistant is thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>

          {/* Preset / Suggested Chips */}
          <div className="flex flex-wrap gap-2 px-1">
            {suggestedQuestions.map((chip, idx) => (
              <Chip
                key={idx}
                color="default"
                variant="soft"
                className="cursor-pointer hover:bg-secondary-100 text-xs px-2.5 py-1.5 rounded-xl border border-secondary-200 dark:border-secondary-900 transition-colors"
                onClick={() => handleSendMessage(chip)}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={10} className="text-secondary-500" />
                  {chip}
                </span>
              </Chip>
            ))}
          </div>

          {/* Form Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about gate gates, seat routing, emergency SOPs, vegan food stalls..."
              variant="primary"
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              color="primary"
              isIconOnly
              className="w-12 h-12 rounded-xl"
              isDisabled={!inputValue.trim() || loading}
              aria-label="Send Message"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>

        {/* Right Operations Sidebar (1 Column) */}
        <div className="space-y-4 h-full flex flex-col justify-between">
          
          {/* Active Context Panel */}
          <Card className="glass-card border border-default-100 shadow-sm flex-1 flex flex-col justify-between">
            <CardContent className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-primary-500 border-b border-default-100 pb-2.5">
                <Settings size={16} />
                <span className="font-extrabold text-[10px] uppercase tracking-wider">Operational Context</span>
              </div>

              <div className="space-y-3.5">
                {/* Venue selector */}
                <div>
                  <span className="text-[8px] text-default-400 uppercase font-semibold">Active Venue</span>
                  <select
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="w-full bg-default-100 dark:bg-default-900 text-xs border border-transparent hover:border-default-200 rounded-lg px-2 py-1.5 focus:bg-background focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all mt-1"
                  >
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.stadiumName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language selection */}
                <div>
                  <span className="text-[8px] text-default-400 uppercase font-semibold flex items-center gap-1">
                    <Globe size={10} className="text-secondary-500" />
                    Assistant Language
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-default-100 dark:bg-default-900 text-xs border border-transparent hover:border-default-200 rounded-lg px-2 py-1.5 focus:bg-background focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all mt-1"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Accessibility preference info */}
                <div>
                  <span className="text-[8px] text-default-400 uppercase font-semibold">Accessibility Needs</span>
                  <div className="mt-1 text-xs text-foreground font-semibold bg-default-50 p-2.5 rounded-xl border border-default-100">
                    {user.accessibilityPreference || 'None'}
                  </div>
                </div>

                {/* User Role Badge */}
                <div>
                  <span className="text-[8px] text-default-400 uppercase font-semibold">Active Persona</span>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-foreground bg-primary-500/10 border border-primary-500/20 w-fit px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                    {user.role}
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-default-100 bg-default-50/20 text-center">
              <span className="text-[8px] text-default-400 uppercase font-semibold">FIFA 2026 Command Center</span>
            </div>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}
