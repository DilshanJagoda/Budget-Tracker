import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatEuro, formatDateGerman, parseEuroInputToCents } from '../../utils/formatters';
import { GroceryItem } from '../../types';
import { 
  ShoppingBag, 
  Plus, 
  Check, 
  Trash2, 
  Store, 
  AlertTriangle, 
  Utensils, 
  CheckSquare, 
  Square,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

export const GroceryView: React.FC = () => {
  const { 
    groceryItems, 
    addGroceryItem, 
    toggleGroceryItem, 
    deleteGroceryItem, 
    groceryTrips, 
    addGroceryTrip, 
    deleteGroceryTrip, 
    transactions, 
    selectedMonth, 
    settings, 
    summary, 
    t 
  } = useApp();

  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [storeName, setStoreName] = useState('ALDI Süd');
  const [tripAmountStr, setTripAmountStr] = useState('');
  const [itemCount, setItemCount] = useState(10);
  const [tripSummary, setTripSummary] = useState('');

  // Shopping list item input
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<GroceryItem['subCategory']>('produce');
  const [newItemPriceStr, setNewItemPriceStr] = useState('');

  // Calculate actual groceries spent this month from transactions
  const grocerySpentThisMonthCents = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.categoryId === 'cat-groceries')
      .reduce((sum, t) => sum + t.amountCents, 0);
  }, [transactions, selectedMonth]);

  const monthlyBudgetCents = settings.groceryMonthlyBudgetCents || 20000;
  const remainingGroceryCents = monthlyBudgetCents - grocerySpentThisMonthCents;
  const dailyFoodAllowanceCents = Math.round(remainingGroceryCents / summary.remainingDaysInPeriod);

  // Expensive week detector
  const isExpensiveWeek = grocerySpentThisMonthCents > (monthlyBudgetCents * 0.4);

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const cents = parseEuroInputToCents(tripAmountStr);
    if (cents <= 0) return;

    addGroceryTrip({
      date: new Date().toISOString().split('T')[0],
      storeName,
      totalCents: cents,
      itemCount,
      itemsSummary: tripSummary,
    });

    setIsAddTripOpen(false);
    setTripAmountStr('');
    setTripSummary('');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const estCents = parseEuroInputToCents(newItemPriceStr);
    addGroceryItem({
      name: newItemName.trim(),
      subCategory: newItemCat,
      estimatedPriceCents: estCents,
      isPurchased: false,
    });

    setNewItemName('');
    setNewItemPriceStr('');
  };

  const germanStores = ['ALDI Süd', 'ALDI Nord', 'Lidl', 'Rewe', 'Edeka', 'Penny', 'Netto', 'dm-drogerie markt', 'Rossmann', 'Kaufland'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t.groceries.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.groceries.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddTripOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>{t.groceries.recordTrip}</span>
        </button>
      </div>

      {/* Grocery Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.groceries.monthlyGroceryBudget}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatEuro(monthlyBudgetCents)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            ~{formatEuro(Math.round(monthlyBudgetCents / 4))} / Woche
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.groceries.spentOnGroceries}
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatEuro(grocerySpentThisMonthCents)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {Math.round((grocerySpentThisMonthCents / monthlyBudgetCents) * 100)}% ausgeschöpft
          </span>
        </div>

        <div className={`p-4 rounded-3xl border shadow-sm ${
          remainingGroceryCents < 0
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.groceries.remainingGroceryBudget}
          </span>
          <div className={`text-2xl font-black mt-1 ${remainingGroceryCents < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatEuro(remainingGroceryCents)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            für {summary.remainingDaysInPeriod} verbleibende Tage
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            {t.groceries.suggestedDailyFood}
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {formatEuro(dailyFoodAllowanceCents)}
          </div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block mt-1">
            pro Tag (z.B. Mensa + Kochen)
          </span>
        </div>

      </div>

      {/* Expensive Week Warning */}
      {isExpensiveWeek && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {settings.language === 'de'
              ? 'Hinweis: Deine Lebensmittelausgaben sind in dieser Periode überdurchschnittlich hoch. Versuche Angebote bei ALDI/Lidl oder die Mensa zu nutzen.'
              : 'Alert: Grocery spending has accelerated this period. Consider planning bulk meals or taking advantage of discount supermarkets (ALDI/Lidl) and Mensa.'}
          </span>
        </div>
      )}

      {/* Two Column Layout: Smart Shopping List & Supermarket Trips History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Shopping List Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>{t.groceries.shoppingList}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {groceryItems.filter(i => i.isPurchased).length} / {groceryItems.length} {settings.language === 'de' ? 'gekauft' : 'bought'}
            </span>
          </div>

          {/* Add item inline form */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="e.g. Haferflocken, Äpfel, Reis..."
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
            <input
              type="text"
              value={newItemPriceStr}
              onChange={e => setNewItemPriceStr(e.target.value)}
              placeholder="€1.50"
              className="w-20 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-center"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List of items */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {groceryItems.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                  item.isPurchased
                    ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/40 text-slate-400 line-through'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div 
                  onClick={() => toggleGroceryItem(item.id)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1"
                >
                  {item.isPurchased ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-semibold">{item.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {item.estimatedPriceCents > 0 && (
                    <span className="font-mono text-slate-500 text-[11px]">
                      ~{formatEuro(item.estimatedPriceCents)}
                    </span>
                  )}
                  <button
                    onClick={() => deleteGroceryItem(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supermarket Trips History Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              <span>{t.groceries.recentTrips}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {groceryTrips.length} {settings.language === 'de' ? 'Einkäufe' : 'trips'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {groceryTrips.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t.common.emptyTitle}
              </div>
            ) : (
              groceryTrips.map(trip => (
                <div
                  key={trip.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {trip.storeName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {formatDateGerman(trip.date)}
                      </span>
                    </div>
                    {trip.itemsSummary && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {trip.itemsSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="font-black font-mono text-slate-900 dark:text-white">
                      {formatEuro(trip.totalCents)}
                    </div>
                    <button
                      onClick={() => deleteGroceryTrip(trip.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal: Record Supermarket Trip */}
      {isAddTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t.groceries.recordTrip}
              </h3>
              <button onClick={() => setIsAddTripOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Supermarket</label>
                <select
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  {germanStores.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Total Bill (€)</label>
                  <input
                    type="text"
                    required
                    value={tripAmountStr}
                    onChange={e => setTripAmountStr(e.target.value)}
                    placeholder="28.50"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Item Count</label>
                  <input
                    type="number"
                    value={itemCount}
                    onChange={e => setItemCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Items Summary (optional)</label>
                <input
                  type="text"
                  value={tripSummary}
                  onChange={e => setTripSummary(e.target.value)}
                  placeholder="e.g. Vegetables, pasta, eggs, milk"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTripOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Record Trip & Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
