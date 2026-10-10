import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, getMonthYearLabel } from '../../utils/formatters';
import { 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X,
  Wallet
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    settings, 
    setLanguage, 
    setTheme, 
    summary, 
    alerts, 
    dismissAlert, 
    openAddTxModal, 
    setActiveTab,
    t 
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);

  const activeAlerts = alerts.filter(a => !a.isDismissed);

  // Close alerts popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(prevMonthStr);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextMonthStr);
  };

  const isDark = settings.theme === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Title & Month Picker */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-emerald-500/30">
              SF
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">StudentFlow</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Dilshan Jagoda</div>
            </div>
          </div>

          {/* Month selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-1 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[100px] text-center select-none">
              {getMonthYearLabel(selectedMonth, settings.language)}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Safe-to-Spend quick indicator on medium+ screens */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t.dashboard.safeToSpendDaily}: </span>
            <span className={`font-extrabold ${summary.dailySafeToSpendCents < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {formatEuro(summary.dailySafeToSpendCents)}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">/ {t.common.today.toLowerCase()}</span>
          </div>
        </div>

        {/* Right Actions: Add Tx, Language, Theme, Notifications */}
        <div className="flex items-center gap-2">
          
          {/* Quick Add Transaction Button */}
          <button
            onClick={() => openAddTxModal('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.common.addTransaction}</span>
            <span className="sm:hidden">{t.common.addTransaction.split(' ')[0]}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                settings.language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="English interface"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                settings.language === 'de'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              title="Deutsche Benutzeroberfläche"
            >
              DE
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {settings.language === 'de' ? 'Benachrichtigungen' : 'Alerts & Reminders'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {activeAlerts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5">
                  {activeAlerts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-emerald-500 opacity-80" />
                      {settings.language === 'de' ? 'Keine ungelesenen Hinweise.' : 'All clear! No alerts at this time.'}
                    </div>
                  ) : (
                    activeAlerts.map(alt => (
                      <div
                        key={alt.id}
                        className={`p-3 rounded-xl border text-xs transition-colors flex items-start gap-2.5 ${
                          alt.type === 'danger'
                            ? 'bg-red-50/70 border-red-200 dark:bg-red-950/30 dark:border-red-900/40 text-red-900 dark:text-red-200'
                            : alt.type === 'warning'
                            ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {alt.type === 'danger' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : alt.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold">{alt.title}</div>
                          <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">{alt.message}</div>
                          {alt.linkTab && (
                            <button
                              onClick={() => {
                                setActiveTab(alt.linkTab!);
                                setIsAlertsOpen(false);
                              }}
                              className="mt-1.5 text-[10px] font-bold underline hover:opacity-80"
                            >
                              {settings.language === 'de' ? 'Zu den Details →' : 'View section →'}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => dismissAlert(alt.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
