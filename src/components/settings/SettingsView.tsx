import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Moon, 
  Sun, 
  FlaskConical, 
  Download, 
  Upload, 
  Trash2, 
  User, 
  ShieldCheck, 
  Bell, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    setLanguage, 
    setTheme, 
    user, 
    updateProfile, 
    loadTestFixture, 
    resetAllData, 
    exportDataJson, 
    importDataJson, 
    t 
  } = useApp();

  const [userName, setUserName] = useState(user.name);
  const [university, setUniversity] = useState(user.university || '');
  const [city, setCity] = useState(user.city || '');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: userName,
      university,
      city,
    });
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studentflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportStatus('Data imported successfully!');
      } else {
        setImportStatus('Error: Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.settings.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          StudentFlow • Dilshan Jagoda • University Edition
        </p>
      </div>

      {/* Language & Theme Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{settings.language === 'de' ? 'Sprache & Erscheinungsbild' : 'Language & Display'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.settings.language}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  settings.language === 'en'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                English (Default)
              </button>
              <button
                onClick={() => setLanguage('de')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  settings.language === 'de'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Deutsch (German)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t.settings.theme}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Thresholds & Month Cycle */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.thresholds}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t.settings.threshold1}
            </label>
            <input
              type="number"
              value={settings.budgetWarnThreshold1}
              onChange={e => updateSettings({ budgetWarnThreshold1: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Standard: 75%</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t.settings.threshold2}
            </label>
            <input
              type="number"
              value={settings.budgetWarnThreshold2}
              onChange={e => updateSettings({ budgetWarnThreshold2: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Standard: 90%</span>
          </div>
        </div>
      </div>

      {/* Requirement 22 Test Suite Loader (HIGHLIGHT QA FEATURE) */}
      <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.settings.loadScenario}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {t.settings.loadScenarioDesc}
              </p>
            </div>
          </div>

          <button
            onClick={loadTestFixture}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
          >
            {settings.language === 'de' ? 'Jetzt laden' : 'Run Test'}
          </button>
        </div>
      </div>

      {/* Student Profile Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.studentProfile}</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Student Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.settings.university}</label>
              <input
                type="text"
                value={university}
                onChange={e => setUniversity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{t.settings.city}</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            {t.common.save}
          </button>
        </form>
      </div>

      {/* Data Management & Export / Import */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.dataManagement}</span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your personal budget data is stored with complete user-level isolation in persistent local storage. No bank account passwords or PINs are ever collected.
        </p>

        {importStatus && (
          <div className="p-3 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl font-medium">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.common.exportJson}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{t.common.importJson}</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.common.resetData}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title={t.common.resetData}
        message="Möchtest du wirklich alle Transaktionen und Budgets zurücksetzen? Deine Daten werden auf die Standard-Studentenkonfiguration zurückgesetzt."
        confirmLabel="Ja, alles zurücksetzen"
        cancelLabel={t.common.cancel}
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

    </div>
  );
};
