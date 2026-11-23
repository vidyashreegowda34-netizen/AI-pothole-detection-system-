import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  HelpCircle,
  FileText,
  Zap,
} from 'lucide-react';

export default function AiCivicChatbot() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKannada = i18n.language === 'kn';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: isKannada
        ? 'ನಮಸ್ಕಾರ! ನಾನು "ನಮ್ಮ ಪರಿಷ್ಕಾರ AI" ಪೌರ ನೀತಿ ಸಹಾಯಕ (RAG Assistant). ರಸ್ತೆ ಗುಂಡಿ, ವಿದ್ಯುತ್, ನೀರು ಅಥವಾ ಕಸದ ನಿಯಮಾವಳಿ ಮತ್ತು ಪರಿಹಾರ ಕಾಲಮಿತಿ (SLA) ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.'
        : 'Hello! I am "Namma Parishkara AI" Civic Policy Assistant (RAG Engine). Ask me about municipal turnaround SLAs, PWD road standards, BESCOM safety, or citizen rights under the Sakala Act.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = isKannada
    ? [
        { label: '🕳️ ರಸ್ತೆ ಗುಂಡಿ SLA ನಿಯಮ', query: 'ರಸ್ತೆ ಗುಂಡಿ ಮುಚ್ಚಲು ಎಷ್ಟು ಸಮಯ ನೀಡಲಾಗುತ್ತದೆ? PWD ನಿಯಮವೇನು?' },
        { label: '⚡ ತುಂಡಾದ ವಿದ್ಯುತ್ ತಂತಿ', query: 'ವಿದ್ಯುತ್ ತಂತಿ ತುಂಡಾಗಿದ್ದರೆ ಬೆಸ್ಕಾಂ ತುರ್ತು ನಿಯಮವೇನು?' },
        { label: '🚰 ನೀರು ಪೈಪ್ ಸೋರಿಕೆ', query: 'ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದಿದ್ದರೆ ಪರಿಹಾರ ಗಡುವು ಎಷ್ಟು?' },
        { label: '🔄 ದೂರು ಮರುತೆರೆಯುವುದು', query: 'ಸಮಸ್ಯೆ ಸರಿಯಾಗಿ ಬಗೆಹರಿಯದಿದ್ದರೆ ದೂರು ಮರುತೆರೆಯಲು ಸಕಾಲ ನಿಯಮವೇನು?' },
      ]
    : [
        { label: '🕳️ Pothole Repair SLA', query: 'What is the PWD policy and turnaround SLA for repairing potholes?' },
        { label: '⚡ Live Wire Protocol', query: 'What is the emergency protocol for snapped live electric wires?' },
        { label: '🚰 Water Pipeline Leak', query: 'What is the SLA deadline for drinking water pipe bursts?' },
        { label: '🔄 How to Reopen Issue', query: 'How does a citizen reopen an issue under the Sakala Citizen Charter?' },
      ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat-rag', {
        query,
        language: isKannada ? 'kn' : 'en',
      });

      if (res.data.success) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.answer,
          matchedPolicy: res.data.matchedPolicy,
          suggestedComplaint: res.data.suggestedComplaint,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error('RAG Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: isKannada
            ? 'ಕ್ಷಮಿಸಿ, ಪೌರ ನಿಯಮಾವಳಿ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Sorry, could not retrieve the civic policy at this moment. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDraftComplaint = (complaint) => {
    setIsOpen(false);
    navigate('/report', {
      state: {
        prefillTitle: complaint.title,
        prefillCategoryCode: complaint.categoryCode,
        prefillUrgency: complaint.urgency,
      },
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-5 z-40 flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-3 rounded-full shadow-2xl shadow-amber-600/40 active:scale-95 transition-all group border border-amber-300/40"
          aria-label="Open AI Civic Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            {isKannada ? 'ಪರಿಷ್ಕಾರ AI ಚಾಟ್‌ಬಾಟ್' : 'Parishkara AI Chatbot'}
          </span>
          <span className="bg-black/30 text-amber-200 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
            RAG
          </span>
        </button>
      )}

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black tracking-tight flex items-center space-x-1.5">
                  <span>{isKannada ? 'ನಮ್ಮ ಪರಿಷ್ಕಾರ AI ಚಾಟ್‌ಬಾಟ್' : 'Namma Parishkara AI'}</span>
                  <span className="bg-emerald-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-amber-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  <span>RAG Civic Policy Engine • Mistral / Ollama</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Matched Policy Citation Badge */}
                  {msg.matchedPolicy && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        {msg.matchedPolicy.department}
                      </span>
                      <span className="bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                        SLA: {msg.matchedPolicy.standardSLA}
                      </span>
                    </div>
                  )}

                  {/* Actionable Auto-Draft Button */}
                  {msg.suggestedComplaint && (
                    <button
                      type="button"
                      onClick={() => handleAutoDraftComplaint(msg.suggestedComplaint)}
                      className="mt-3 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-xs flex items-center justify-center space-x-1 transition-all active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isKannada ? 'ಈ ಮಾಹಿತಿಯಿಂದ ದೂರು ದಾಖಲಿಸಿ' : 'Auto-Draft Complaint Ticket'}</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs py-2 bg-white px-3 rounded-xl border border-slate-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>{isKannada ? 'ಪೌರ ನೀತಿ ಶೋಧಿಸಲಾಗುತ್ತಿದೆ...' : 'Retrieving municipal policies...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.query)}
                className="shrink-0 text-[10px] font-semibold bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isKannada ? 'ಪೌರ ನೀತಿ ಅಥವಾ SLA ಬಗ್ಗೆ ಕೇಳಿ...' : 'Ask about bylaws, SLAs, or policies...'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
