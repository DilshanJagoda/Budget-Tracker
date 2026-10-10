import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro } from '../../utils/formatters';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  Key, 
  RefreshCw, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC = () => {
  const { 
    summary, 
    accounts, 
    transactions, 
    budget, 
    recurring, 
    savingsGoals, 
    selectedMonth, 
    settings, 
    t 
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: settings.language === 'de'
        ? `Hallo! Ich bin dein studentischer Finanzberater in **StudentFlow**. Ich habe Zugriff auf deine aktuellen Kontostände (${formatEuro(summary.liquidBalanceCents)} verfügbar), dein freies Budget (${formatEuro(summary.safeToSpendCents)}) und anstehende Fixkosten wie Miete. Wie kann ich dir heute bei deinem Studentenbudget helfen?`
        : `Hello! I am your AI Financial Advisor in **StudentFlow**. I have access to your live balances (${formatEuro(summary.liquidBalanceCents)} available), your Safe-to-Spend allowance (${formatEuro(summary.safeToSpendCents)}), and your upcoming bills. How can I help you optimize your student finances today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isContextVisible, setIsContextVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Suggested prompt pills
  const promptPills = [
    t.ai.pill1,
    t.ai.pill2,
    t.ai.pill3,
    t.ai.pill4,
    t.ai.pill5,
    t.ai.pill6,
  ];

  // Construct financial context snapshot for the AI
  const financialContext = {
    selectedMonth,
    currency: 'EUR',
    liquidBalance: formatEuro(summary.liquidBalanceCents),
    depositBalanceLocked: formatEuro(summary.depositBalanceCents),
    totalNetWorth: formatEuro(summary.totalNetWorthCents),
    incomeThisMonth: formatEuro(summary.incomeThisMonthCents),
    expensesThisMonth: formatEuro(summary.expensesThisMonthCents),
    savingsThisMonth: formatEuro(summary.savingsThisMonthCents),
    savingsRate: `${summary.savingsRatePercent}%`,
    safeToSpendAllowance: formatEuro(summary.safeToSpendCents),
    dailySafeToSpend: formatEuro(summary.dailySafeToSpendCents),
    weeklySafeToSpend: formatEuro(summary.weeklySafeToSpendCents),
    daysRemainingInMonth: summary.remainingDaysInPeriod,
    monthlyBudgetLimit: formatEuro(summary.monthlyBudgetLimitCents),
    remainingBudget: formatEuro(summary.remainingBudgetCents),
    budgetUsagePercent: `${summary.budgetUsagePercent}%`,
    upcomingEssentialBillsTotal: formatEuro(summary.upcomingEssentialBillsCents),
    upcomingBills: recurring
      .filter(r => r.isActive && r.nextDueDate.startsWith(selectedMonth))
      .map(r => ({ title: r.title, amount: formatEuro(r.amountCents), dueDate: r.nextDueDate, isEssential: r.isEssential })),
    recentExpenses: transactions.slice(0, 10).map(t => ({
      merchant: t.merchantOrPayee,
      amount: formatEuro(t.amountCents),
      date: t.date,
      essential: t.isEssential,
      category: t.categoryId,
    })),
    savingsGoals: savingsGoals.map(g => ({
      name: g.name,
      target: formatEuro(g.targetCents),
      saved: formatEuro(g.currentCents),
      targetDate: g.targetDate,
      isEmergencyFund: Boolean(g.isEmergencyFund),
    })),
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isLoading) return;

    setErrorMessage(null);
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          financialContext,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'MISSING_API_KEY') {
          setErrorMessage(
            settings.language === 'de'
              ? 'Der GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt. Hinterlege den Schlüssel in den Secrets, um Live-Antworten zu erhalten.'
              : 'The GEMINI_API_KEY is not configured in the environment secrets. Please configure it to enable live Gemini AI advisor answers.'
          );
        } else {
          setErrorMessage(data.message || 'Error communicating with AI service.');
        }
        setIsLoading(false);
        return;
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to contact /api/ai/chat:', err);
      setErrorMessage(
        settings.language === 'de'
          ? 'Verbindung zum KI-Dienst fehlgeschlagen. Bitte prüfe die Serververbindung.'
          : 'Failed to contact AI service. Please verify server connectivity.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.ai.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              Gemini 3.8 Flash
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.ai.subtitle}
          </p>
        </div>

        {/* Live Context Toggle */}
        <button
          onClick={() => setIsContextVisible(!isContextVisible)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isContextVisible ? 'Hide Data Snapshot' : 'View Data Snapshot'}</span>
          {isContextVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Financial Context Inspector Drawer */}
      {isContextVisible && (
        <div className="p-4 rounded-3xl bg-slate-900 text-emerald-300 font-mono text-[11px] border border-slate-800 shadow-md max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 text-slate-400 font-sans">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Live Grounded Financial Context Passed to Gemini
            </span>
            <span>Real Student Data</span>
          </div>
          <pre className="whitespace-pre-wrap">{JSON.stringify(financialContext, null, 2)}</pre>
        </div>
      )}

      {/* Suggested Prompt Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {t.ai.promptPillsTitle}
        </span>
        <div className="flex flex-wrap gap-2">
          {promptPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-medium transition-all shadow-xs disabled:opacity-50 text-left"
            >
              "{pill}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-3xl rounded-tl-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Analyzing student balances & expenditures...</span>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">{t.ai.apiKeyNotice}</div>
                <div className="mt-0.5 opacity-90">{errorMessage}</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.ai.inputPlaceholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.ai.send}</span>
            </button>
          </form>
          <div className="text-[10px] text-slate-400 mt-2 text-center">
            {t.ai.disclaimer}
          </div>
        </div>

      </div>

    </div>
  );
};
