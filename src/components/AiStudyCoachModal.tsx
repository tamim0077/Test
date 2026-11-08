import { apiFetch as fetch } from '../utils/api.ts';
import React, { useState, useEffect, useRef } from 'react';
import { UserMistakeEntry } from '../types';
import {
  Sparkles,
  Send,
  User,
  X,
  BookOpen,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Target,
  BrainCircuit,
  HelpCircle,
  Clock,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';

interface AiStudyCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: UserMistakeEntry[];
  initialQuestion?: string;
  initialExplanation?: string;
  currentSubject?: string;
}

export type CoachRole = 'concept_tutor' | 'mistake_analyst' | 'board_strategist' | 'speed_formula';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  roleUsed?: CoachRole;
}

interface CoachPersona {
  id: CoachRole;
  nameBn: string;
  shortTitle: string;
  taglineBn: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeBg: string;
  welcomeMessage: string;
  quickPrompts: string[];
}

export const COACH_PERSONAS: Record<CoachRole, CoachPersona> = {
  concept_tutor: {
    id: 'concept_tutor',
    nameBn: 'বিষয়ভিত্তিক শিক্ষক',
    shortTitle: 'কনসেপ্ট টিউটর',
    taglineBn: 'গণিত ও বিজ্ঞান বিষয়ের সহজ ও বাস্তবসম্মত ব্যাখ্যা',
    icon: <BookOpen className="w-4 h-4" />,
    accentColor: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    welcomeMessage: 'আসসালামু আলাইকুম! আমি তোমার বিষয়ভিত্তিক গণিত ও বিজ্ঞান শিক্ষক। যেকোনো সূত্র, উপপাদ্য বা অঙ্কের নিয়ম না বুঝলে নির্দ্বিধায় আমাকে জিজ্ঞাসা করো।',
    quickPrompts: [
      'বীজগাণিতিক রাশির প্রধান অনুসিদ্ধান্তগুলো বুঝিয়ে দিন',
      'গতির ৩টি মূল সমীকরণ কীভাবে তৈরি হলো?',
      'নিউটনের ৩য় সূত্রের বাস্তব উদাহরণ কী?',
      'মাইটোকন্ড্রিয়াকে পাওয়ার হাউস কেন বলা হয়?'
    ],
  },
  mistake_analyst: {
    id: 'mistake_analyst',
    nameBn: 'ভুল বিশ্লেষক (Mistake Analyst)',
    shortTitle: 'ভুল বিশ্লেষক',
    taglineBn: 'পরীক্ষার অসাবধানতা ও চিহ্নের বিভ্রান্তি শনাক্তকরণ',
    icon: <BrainCircuit className="w-4 h-4" />,
    accentColor: 'from-amber-600 to-rose-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    welcomeMessage: 'নমস্কার / আসসালামু আলাইকুম! আমি তোমার ভুল বিশ্লেষণ বিশেষজ্ঞ। পরীক্ষার ভুলগুলো লুকানোর কিছু নেই—ভুল বিশ্লেষণ করাই ১০০% নম্বর তোলার আসল রহস্য!',
    quickPrompts: [
      'আমি এই অঙ্কটাতে কেন ভুল করলাম?',
      'চিহ্নের (+/-) ভুল এড়ানোর সবচেয়ে সহজ উপায় কী?',
      'বর্গের সূত্রের সাথে অনুসিদ্ধান্তের বিভ্রান্তি কীভাবে দূর করব?',
      'মিস্টেক নোটবুকের প্রশ্নগুলো কতদিন পর রিভিশন দেওয়া উচিত?'
    ],
  },
  board_strategist: {
    id: 'board_strategist',
    nameBn: 'পরীক্ষার কৌশলবিদ (Board Strategist)',
    shortTitle: 'কৌশলবিদ',
    taglineBn: 'এসএসসি নৈর্ব্যক্তিক ও সৃজনশীলে সময় ব্যবস্থাপনা রণকৌশল',
    icon: <Target className="w-4 h-4" />,
    accentColor: 'from-purple-600 to-indigo-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    welcomeMessage: 'স্বাগতম! আমি তোমার এসএসসি বোর্ড পরীক্ষার কৌশলবিদ। শুধু পড়ালেখা নয়, পরীক্ষার হলে ৩০ মিনিটে ৩০টি MCQ সঠিকভাবে সমাধান করার স্ট্র্যাটেজিই পার্থক্য গড়ে দেয়।',
    quickPrompts: [
      '৩০ মিনিটে ৩০টি MCQ কীভাবে দাগাবো?',
      'কঠিন প্রশ্নে আটকে গেলে তখন কী সিদ্ধান্ত নেওয়া উচিত?',
      'বোর্ড পরীক্ষার জন্য আগামী ৭ দিনের রিভিশন রুটিন কী?',
      'বিকল্প এলিমিনেশন (Elimination Method) কীভাবে কাজে লাগাব?'
    ],
  },
  speed_formula: {
    id: 'speed_formula',
    nameBn: 'দ্রুত সূত্র ও কুইজ কোচ',
    shortTitle: 'সূত্র ও ট্রিকস',
    taglineBn: 'মুখস্থ ছন্দ, একক, মাত্রা ও দ্রুত রিভিশন কুইজ',
    icon: <Zap className="w-4 h-4" />,
    accentColor: 'from-emerald-600 to-teal-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    welcomeMessage: 'হ্যালো চ্যাম্পিয়ন! আমি তোমার স্পিড ফর্মুলা ও শর্টকাট ট্রেইনার। প্রয়োজনীয় সব সূত্র, মাত্রা ও একক চোখের পলকে মনে করিয়ে দিতে আমি প্রস্তুত।',
    quickPrompts: [
      'পদার্থবিজ্ঞানের গতি ও বলের সব সূত্র একসাথে দিন',
      'ত্রিকোণমিতিক অনুপাত মনে রাখার শর্টকাট ছন্দ কী?',
      'কাজের ও ক্ষমতার একক এবং মাত্রা কী?',
      'আমাকে যাচাই করার জন্য একটি কুইজ প্রশ্ন দিন'
    ],
  },
};

export const AiStudyCoachModal: React.FC<AiStudyCoachModalProps> = ({
  isOpen,
  onClose,
  mistakes,
  initialQuestion,
  initialExplanation,
  currentSubject = 'সাধারণ গণিত',
}) => {
  const [selectedRole, setSelectedRole] = useState<CoachRole>('concept_tutor');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation when modal opens or initial context changes
  useEffect(() => {
    if (!isOpen) return;

    const initialRole: CoachRole = initialQuestion ? 'mistake_analyst' : 'concept_tutor';
    setSelectedRole(initialRole);

    let initialWelcome = COACH_PERSONAS[initialRole].welcomeMessage;
    if (initialQuestion) {
      initialWelcome = `আমি দেখতে পাচ্ছি তুমি এই প্রশ্নটি নিয়ে ভাবছো:\n"${initialQuestion}"\n\nসঠিক ধারণাটি কীভাবে তৈরি হবে বা কোনো লাইনে খটকা লেগেছে তা আমাকে লিখে জানাও!`;
    }

    setMessages([
      {
        id: 'msg-init-' + Date.now(),
        role: 'assistant',
        text: initialWelcome,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        roleUsed: initialRole,
      },
    ]);
  }, [isOpen, initialQuestion, initialExplanation]);

  // Smooth scroll to bottom on every message update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activePersona = COACH_PERSONAS[selectedRole];

  const handleRoleChange = (newRole: CoachRole) => {
    if (newRole === selectedRole) return;
    setSelectedRole(newRole);

    const persona = COACH_PERSONAS[newRole];
    const systemNotice: ChatMessage = {
      id: 'role-switch-' + Date.now(),
      role: 'assistant',
      text: `🔄 কোচ পরিবর্তন: এখন তুমি "${persona.nameBn}" এর সাথে কথা বলছো। ${persona.welcomeMessage}`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      roleUsed: newRole,
    };
    setMessages((prev) => [...prev, systemNotice]);
  };

  const handleClearHistory = () => {
    const freshMessage: ChatMessage = {
      id: 'clear-' + Date.now(),
      role: 'assistant',
      text: `নতুন চ্যাট শুরু হলো! ${activePersona.welcomeMessage}`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      roleUsed: selectedRole,
    };
    setMessages([freshMessage]);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputVal).trim();
    if (!textToSend || isTyping) return;

    setInputVal('');

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsTyping(true);

    try {
      const mistakeSummary = mistakes.slice(0, 5).map((m) => ({
        topic: m.question.topic,
        questionText: m.question.questionText,
        userSelected: m.question.options[m.selectedOptionIndex],
        correct: m.question.options[m.correctOptionIndex],
      }));

      // Send multi-turn history with zero-cost model config
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          role: selectedRole,
          subject: currentSubject,
          messages: updatedHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          userMistakeSummary: mistakeSummary,
          context: {
            initialQuestion,
            initialExplanation,
          },
        }),
      });

      const data = await res.json();
      const assistantReply = data.reply || 'আপনার প্রশ্নটির সমাধান করার চেষ্টা করছি। সূত্রটি আরেকবার লক্ষ্য করুন।';

      const assistantMsg: ChatMessage = {
        id: 'asst-' + Date.now(),
        role: 'assistant',
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        roleUsed: selectedRole,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        text: 'সংযোগ ব্যাহত হলেও মনে রেখো: বীজগাণিতিক সূত্রে বর্গের অনুসিদ্ধান্ত যেমন ab = ((a+b)/2)² - ((a-b)/2)² মুখস্থ লিখে অনুশীলন করা সবচেয়ে জরুরি। পুনরায় চেষ্টা করো!',
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        roleUsed: selectedRole,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full h-[92vh] max-h-[760px] flex flex-col shadow-2xl border border-slate-200/90 overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. MODAL HEADER (Zero Cost Starter Tier + Brand Persona)       */}
        {/* ============================================================== */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between gap-3">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                    ExamDNA বাংলা AI স্টাডি কোচ
                  </h3>
                  {/* Verified Zero Cost Badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>১০০% ফ্রি টিয়ার ($0 API Cost • Gemini 3.8 Flash)</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-blue-200/90 mt-0.5">
                  এনসিটিবি এসএসসি ২০২৩–২০২৭ সিলেবাস ও ভুলের ইতিহাস ভিত্তিক ব্যক্তিগত সহকারী
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="চ্যাট হিস্ট্রি রিসেট করুন"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. ROLE SELECTOR PILLS                                         */}
          {/* ============================================================== */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-blue-200/80 font-medium shrink-0 flex items-center gap-1">
              <span>কোচ নির্বাচন:</span>
            </span>
            {(Object.keys(COACH_PERSONAS) as CoachRole[]).map((roleKey) => {
              const p = COACH_PERSONAS[roleKey];
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleRoleChange(roleKey)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-blue-900 shadow-md shadow-white/10 scale-102 ring-2 ring-white/50'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {p.icon}
                  <span>{p.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. ACTIVE ROLE BANNER (Contextual Guidance)                    */}
        {/* ============================================================== */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-900">{activePersona.nameBn}:</span>
            <span className="text-slate-600 hidden sm:inline">{activePersona.taglineBn}</span>
          </div>
          <div className="text-[11px] font-semibold text-blue-600 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
            বিষয়: {currentSubject}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. SCROLLABLE MESSAGE THREAD CONTAINER                         */}
        {/* ============================================================== */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8FAFC]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const roleInfo = msg.roleUsed ? COACH_PERSONAS[msg.roleUsed] : activePersona;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm group ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${roleInfo.accentColor} text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5`}
                  >
                    {roleInfo.icon}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Name & Timestamp */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      {isUser ? 'তুমি (শিক্ষার্থী)' : roleInfo.nameBn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap relative shadow-xs transition-shadow ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    <div className="text-xs sm:text-[13.5px] font-normal leading-relaxed">{msg.text}</div>

                    {/* Copy action for Assistant messages */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-[10px] text-slate-400 font-medium">NCTB কারিকুলাম সমর্থিত</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="কপি করুন"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Typing & Thinking Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-500 animate-in fade-in duration-150">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${activePersona.accentColor} text-white flex items-center justify-center shrink-0 shadow-sm`}
              >
                {activePersona.icon}
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200/90 shadow-xs flex items-center gap-2">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {activePersona.shortTitle} উত্তর তৈরি করছেন (Free Tier Gemini)...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ============================================================== */}
        {/* 5. DYNAMIC QUICK PROMPT CHIPS                                  */}
        {/* ============================================================== */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">দ্রুত প্রশ্ন:</span>
          {activePersona.quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              disabled={isTyping}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl whitespace-nowrap transition-all border border-slate-200/80 hover:border-blue-200 shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* 6. INPUT TEXTAREA & SEND BAR                                   */}
        {/* ============================================================== */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="অঙ্ক, সূত্র বা পরীক্ষার কৌশল সম্পর্কে বাংলায় প্রশ্ন লিখুন (Enter চাপলে পাঠানো হবে)..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 resize-none leading-relaxed"
            />
            <button
              type="button"
              disabled={!inputVal.trim() || isTyping}
              onClick={() => handleSend()}
              className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <span>পাঠাও</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Zero Cost Guarantee Footer Notice */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ExamDNA BD ফ্রি টিয়ার অ্যাক্টিভ • $০ এপিআই খরচ • কোনো পেইড বিলিং নেই</span>
            </span>
            <span className="hidden sm:inline font-mono-numbers">Shift + Enter নতুন লাইনের জন্য</span>
          </div>
        </div>

      </div>
    </div>
  );
};

