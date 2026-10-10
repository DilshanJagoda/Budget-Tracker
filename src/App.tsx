/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetView } from './components/budget/BudgetView';
import { BillsCalendarView } from './components/bills/BillsCalendarView';
import { GroceryView } from './components/grocery/GroceryView';
import { SavingsView } from './components/savings/SavingsView';
import { ReportsView } from './components/reports/ReportsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AccountsView } from './components/accounts/AccountsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab, isAddTxOpen, closeAddTxModal, initialTxType } = useApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'budgets':
        return <BudgetView />;
      case 'bills':
        return <BillsCalendarView />;
      case 'groceries':
        return <GroceryView />;
      case 'savings':
        return <SavingsView />;
      case 'reports':
        return <ReportsView />;
      case 'ai':
        return <AIAssistantView />;
      case 'accounts':
        return <AccountsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 md:pb-0">
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveTab()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={closeAddTxModal}
        initialType={initialTxType}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
