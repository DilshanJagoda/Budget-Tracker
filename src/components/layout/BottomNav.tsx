import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Plus, 
  Sliders, 
  Menu, 
  X,
  CalendarCheck2, 
  ShoppingBag, 
  PiggyBank, 
  BarChart3, 
  Sparkles, 
  CreditCard, 
  Settings 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddTxModal, t } = useApp();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const moreItems = [
    { id: 'bills', label: t.nav.billsCalendar, icon: CalendarCheck2 },
    { id: 'groceries', label: t.nav.groceries, icon: ShoppingBag },
    { id: 'savings', label: t.nav.savings, icon: PiggyBank },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
    { id: 'ai', label: t.nav.aiAssistant, icon: Sparkles, badge: 'AI' },
    { id: 'accounts', label: t.nav.accounts, icon: CreditCard },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                StudentFlow Navigation
              </span>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t.nav.dashboard}</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>{t.nav.transactions}</span>
        </button>

        {/* Floating Center Action Button */}
        <button
          onClick={() => openAddTxModal('expense')}
          aria-label="Add transaction"
          className="-mt-5 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 border-4 border-white dark:border-slate-900 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
            activeTab === 'budgets' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span>{t.nav.budgets}</span>
        </button>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-colors ${
            isMoreOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
