import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro } from '../../utils/formatters';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Sliders, 
  CalendarCheck2, 
  ShoppingBag, 
  PiggyBank, 
  BarChart3, 
  Sparkles, 
  CreditCard, 
  Settings, 
  GraduationCap,
  FlaskConical
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, summary, user, loadTestFixture, t, settings } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'transactions', label: t.nav.transactions, icon: ArrowLeftRight },
    { id: 'budgets', label: t.nav.budgets, icon: Sliders },
    { id: 'bills', label: t.nav.billsCalendar, icon: CalendarCheck2 },
    { id: 'groceries', label: t.nav.groceries, icon: ShoppingBag },
    { id: 'savings', label: t.nav.savings, icon: PiggyBank },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
    { 
      id: 'ai', 
      label: t.nav.aiAssistant, 
      icon: Sparkles, 
      badge: 'Gemini' 
    },
    { id: 'accounts', label: t.nav.accounts, icon: CreditCard },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-screen sticky top-0 shrink-0">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                StudentFlow
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                DE
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Dilshan Jagoda
            </p>
          </div>
        </div>

        {/* Student Profile snippet */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
          <div className="truncate text-slate-600 dark:text-slate-300 font-medium">
            <span className="block font-bold text-slate-800 dark:text-slate-200">{user.university || 'Uni München'}</span>
            <span className="text-[10px] text-slate-400">{user.city || 'Germany'}</span>
          </div>
          <span className="text-sm">🇩🇪</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 translate-x-0.5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Student Financial Status & Test Fixture shortcut */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Quick balance card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-800 dark:to-slate-950 border border-slate-700/50 shadow-md">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>{t.dashboard.availableBalance}</span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">Liquid</span>
          </div>
          <div className="text-lg font-black tracking-tight mt-0.5 text-white">
            {formatEuro(summary.liquidBalanceCents)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/70 flex items-center justify-between text-[10px] text-slate-300">
            <span>{t.dashboard.safeToSpendDaily}:</span>
            <span className={`font-bold font-mono ${summary.dailySafeToSpendCents < 0 ? 'text-rose-400' : 'text-emerald-300'}`}>
              {formatEuro(summary.dailySafeToSpendCents)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
