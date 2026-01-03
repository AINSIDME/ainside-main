import { useEffect, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
}

const getBotQuestionsAndAnswers = (t: any) => ({
  [t('chat.questions.q1')]: t('chat.answers.a1'),
  [t('chat.questions.q2')]: t('chat.answers.a2'),
  [t('chat.questions.q3')]: t('chat.answers.a3'),
  [t('chat.questions.q4')]: t('chat.answers.a4'),
  [t('chat.questions.q5')]: t('chat.answers.a5'),
  [t('chat.questions.q6')]: t('chat.answers.a6'),
  [t('chat.questions.q7')]: t('chat.answers.a7'),
  [t('chat.questions.q8')]: t('chat.answers.a8'),
});

const getSuggestedQuestions = (t: any) => Object.keys(getBotQuestionsAndAnswers(t));

const getAutomaticResponse = (message: string, t: any): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for multilingual keywords
  const vwapKeywords = ["vwap", "indicador", "indicator", "ligne", "линия", "خط", "קו"];
  const realKeywords = ["real", "verdad", "true", "vrai", "реальный", "حقيقي", "אמיתי"];
  const pnlKeywords = ["pnl", "p&l", "ganancia", "profit", "прибыль", "ربح", "רווח"];
  const streamKeywords = ["stream", "vivo", "live", "direct", "прямой", "مباشر", "חי"];
  
  if (vwapKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return t('chat.responses.vwap');
  }
  
  if (realKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return t('chat.responses.real');
  }
  
  if (pnlKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return t('chat.responses.pnl');
  }
  
  if (streamKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return t('chat.responses.stream');
  }
  
  return t('chat.responses.default');
};

export const ChatSidebar = () => {
  const { t, i18n } = useTranslation();
  const botQuestionsAndAnswers = getBotQuestionsAndAnswers(t);
  const suggestedQuestions = getSuggestedQuestions(t);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t('chat.welcome'),
      timestamp: new Date(),
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const resetToMainMenu = () => {
    setMessages([
      {
        id: "1",
        text: t('chat.welcome'),
        timestamp: new Date(),
        isUser: false,
      },
    ]);
  };

  useEffect(() => {
    resetToMainMenu();
  }, [i18n.language]);
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Check if user clicked back to menu
    if (newMessage.includes(t('chat.backToMenu'))) {
      resetToMainMenu();
      setNewMessage("");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Bot responds with automatic response based on message content
    setTimeout(() => {
      const botResponse = getAutomaticResponse(newMessage, t);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, response]);
      
      // Add "Back to main menu" option after bot response
      setTimeout(() => {
        const backToMenuMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: t('chat.backToMenu'),
          timestamp: new Date(),
          isUser: false,
        };
        setMessages(prev => [...prev, backToMenuMessage]);
      }, 1000);
    }, 800);
  };

  const handleSuggestedQuestion = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);

    // Bot responds with predefined answer
    setTimeout(() => {
      const botAnswer = botQuestionsAndAnswers[question];
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: botAnswer || t('chat.responses.fallback'),
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, response]);
      
      // Add "Back to main menu" option after bot response
      setTimeout(() => {
        const backToMenuMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: t('chat.backToMenu'),
          timestamp: new Date(),
          isUser: false,
        };
        setMessages(prev => [...prev, backToMenuMessage]);
      }, 1000);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-full bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm border-l border-slate-700/50">
      {/* Professional Header */}
      <div className="px-6 py-4 border-b border-slate-700/30 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100 tracking-tight">{t('chat.title')}</h3>
            <p className="text-xs text-slate-400 font-medium">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Messages Container */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              >
                {message.text === t('chat.backToMenu') ? (
                  <button
                    onClick={resetToMainMenu}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    <span>{message.text}</span>
                  </button>
                ) : (
                  <div className={`max-w-[280px] sm:max-w-xs md:max-w-sm group ${message.isUser ? 'ml-2 sm:ml-8' : 'mr-2 sm:mr-8'}`}>
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">AI</span>
                        </div>
                        <span className="text-xs font-medium text-slate-400">{t('chat.assistant')}</span>
                      </div>
                    )}
                    <div
                      className={`relative rounded-2xl px-3 sm:px-4 py-3 shadow-sm ${
                        message.isUser
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/20 rounded-br-md"
                          : "bg-slate-800/60 text-slate-100 border border-slate-700/40 rounded-bl-md backdrop-blur-sm"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed font-medium break-words whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium ${
                          message.isUser ? "text-blue-100/70" : "text-slate-400"
                        }`}>
                          {message.timestamp.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.isUser && (
                          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Professional Suggested Questions */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-700/30 bg-slate-900/60 backdrop-blur p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-3 tracking-wide">{t('chat.frequentQuestions')}</h4>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left p-3 text-sm text-slate-300 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-600/20 hover:border-slate-500/40 rounded-lg transition-all duration-200 hover:shadow-md group min-h-[44px] flex items-center"
              >
                <span className="group-hover:text-slate-200 transition-colors duration-200 leading-relaxed break-words">
                  {question}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Professional Input Section */}
      <div className="border-t border-slate-700/30 bg-slate-900/70 backdrop-blur p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="min-h-[60px] resize-none bg-slate-800/50 text-slate-100 border-slate-600/40 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-4 py-3 shadow-sm transition-all duration-200 placeholder:text-slate-400 backdrop-blur-sm"
              aria-label={t('chat.writeMessage')}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="default"
            className="shrink-0 h-[60px] px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
            aria-label={t('chat.sendMessage')}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center font-medium">
          {t('chat.instructions')}
        </p>
      </div>
    </div>
  );
};