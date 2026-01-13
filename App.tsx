
import React, { useState, useMemo, useEffect } from 'react';
import { SectionName, SelectedItemState, InventoryData, InventoryItem, BarcodeMapping, ScanLogEntry } from './types';
import { INVENTORY_DATA } from './constants';
import InventoryItemRow from './components/InventoryItemRow';
import ConfirmModal from './components/ConfirmModal';
import PromotionModal from './components/PromotionModal';
import SettingsView from './components/SettingsView';
import BarcodeScanner from './components/BarcodeScanner';
import NewBarcodeItemModal from './components/NewBarcodeItemModal';
import ScanActionModal from './components/ScanActionModal';
import ScanHistoryView from './components/ScanHistoryView';

// Bobola's chef logo
const LOGO_URL = "/logo.jpg";

const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryData>(() => {
    const saved = localStorage.getItem('bobola_inventory_data_v2');
    return saved ? JSON.parse(saved) : INVENTORY_DATA;
  });

  const [selectedStates, setSelectedStates] = useState<Record<string, SelectedItemState>>(() => {
    const saved = localStorage.getItem('bobola_item_states_v2');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<SectionName>('DEPOT');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [promotionItem, setPromotionItem] = useState<{ name: string; id: string } | null>(null);

  // Barcode scanning state
  const [barcodeMapping, setBarcodeMapping] = useState<BarcodeMapping>(() => {
    const saved = localStorage.getItem('bobola_barcode_mapping');
    return saved ? JSON.parse(saved) : {};
  });
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>(() => {
    const saved = localStorage.getItem('bobola_scan_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showScanner, setShowScanner] = useState(false);
  const [showScanHistory, setShowScanHistory] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<{ barcode: string; itemName: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('bobola_inventory_data_v2', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('bobola_item_states_v2', JSON.stringify(selectedStates));
  }, [selectedStates]);

  useEffect(() => {
    localStorage.setItem('bobola_barcode_mapping', JSON.stringify(barcodeMapping));
  }, [barcodeMapping]);

  useEffect(() => {
    localStorage.setItem('bobola_scan_logs', JSON.stringify(scanLogs));
  }, [scanLogs]);

  const handleStatusChange = (name: string, status: 'needed' | 'not-needed' | 'none') => {
    const id = name;
    setSelectedStates(prev => {
      if (status === 'none') {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: { id, status, currentCount: prev[id]?.currentCount || '' }
      };
    });
  };

  const handleCountChange = (name: string, count: string) => {
    const id = name;
    setSelectedStates(prev => ({
      ...prev,
      [id]: { 
        id, 
        status: prev[id]?.status || 'none', 
        currentCount: count 
      }
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const name = searchQuery.toUpperCase().trim();
    let existsInInventory = false;
    
    Object.values(inventory).forEach(section => {
      Object.values(section).forEach(items => {
        if (items.some(i => i.name === name)) existsInInventory = true;
      });
    });

    if (!existsInInventory) {
      setInventory(prev => ({
        ...prev,
        OTHER: {
          ...prev.OTHER,
          "TEMPORARY ITEMS": Array.from(new Set([...(prev.OTHER["TEMPORARY ITEMS"] || []), { name }]))
        }
      }));
      setActiveSection('OTHER');
    }
    
    handleStatusChange(name, 'needed');
    setSearchQuery('');
  };

  const promoteItem = (section: SectionName, category: string) => {
    if (promotionItem) {
      setInventory(prev => {
        const next = { ...prev };
        next.OTHER["TEMPORARY ITEMS"] = (next.OTHER["TEMPORARY ITEMS"] || []).filter(i => i.name !== promotionItem.name);
        if (!next[section]) next[section] = {};
        if (!next[section][category]) next[section][category] = [];
        if (!next[section][category].some(i => i.name === promotionItem.name)) {
          next[section][category].push({ name: promotionItem.name });
        }
        return next;
      });
      setPromotionItem(null);
    }
  };

  const clearAll = () => {
    setSelectedStates({});
    setShowClearConfirm(false);
  };

  // Barcode scanning handlers
  const handleBarcodeScan = (barcode: string) => {
    setShowScanner(false);
    if (barcodeMapping[barcode]) {
      setScannedItem({
        barcode,
        itemName: barcodeMapping[barcode].itemName,
      });
    } else {
      setPendingBarcode(barcode);
    }
  };

  const handleNewBarcodeItem = (itemName: string, section: SectionName, category: string) => {
    if (!pendingBarcode) return;
    setBarcodeMapping(prev => ({
      ...prev,
      [pendingBarcode]: {
        itemName,
        section,
        category,
        createdAt: new Date().toISOString(),
      },
    }));
    setInventory(prev => {
      const sectionData = prev[section] || {};
      const categoryData = sectionData[category] || [];
      if (!categoryData.some(i => i.name === itemName)) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [category]: [...categoryData, { name: itemName, barcode: pendingBarcode }],
          },
        };
      }
      return prev;
    });
    setScannedItem({ barcode: pendingBarcode, itemName });
    setPendingBarcode(null);
  };

  const handleScanAction = (action: 'received' | 'used' | 'counted', quantity: number) => {
    if (!scannedItem) return;
    const logEntry: ScanLogEntry = {
      id: Date.now().toString(),
      barcode: scannedItem.barcode,
      itemName: scannedItem.itemName,
      quantity,
      timestamp: new Date().toISOString(),
      action,
    };
    setScanLogs(prev => [logEntry, ...prev]);
    if (action === 'received') {
      handleStatusChange(scannedItem.itemName, 'not-needed');
    } else if (action === 'counted') {
      handleCountChange(scannedItem.itemName, quantity.toString());
    }
    setScannedItem(null);
  };

  const clearScanLogs = () => setScanLogs([]);

  const neededItemsCount = Object.values(selectedStates).filter((s: SelectedItemState) => {
    let itemRef: InventoryItem | undefined;
    Object.values(inventory).forEach(sec => Object.values(sec).forEach(cat => {
      const found = cat.find(i => i.name === s.id);
      if (found) itemRef = found;
    }));

    if (s.status === 'needed') return true;
    if (s.status === 'not-needed') return false;
    
    const count = parseFloat(s.currentCount);
    if (!isNaN(count) && itemRef?.par !== undefined) {
      return count < itemRef.par;
    }
    return false;
  }).length;

  const sections: SectionName[] = ['DEPOT', 'STORE', 'BAKERY', 'OTHER'];

  const filteredData = useMemo(() => {
    const sectionData = inventory[activeSection];
    if (!sectionData) return [];

    const results: { category: string; items: InventoryItem[] }[] = [];
    (Object.entries(sectionData) as [string, InventoryItem[]][]).forEach(([category, items]) => {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        results.push({ category, items: filtered.sort((a, b) => a.name.localeCompare(b.name)) });
      }
    });
    return results;
  }, [activeSection, inventory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border-2 border-slate-100 flex-shrink-0 flex items-center justify-center p-0 shadow-sm">
              <img src={LOGO_URL} alt="Bobola Prep Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                BOBOLA <span className="text-blue-600 uppercase">PREP</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kitchen Inventory</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowScanHistory(true)}
              className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all active:scale-95 relative"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {scanLogs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {scanLogs.length > 99 ? '99+' : scanLogs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex gap-3">
          <form onSubmit={handleAddItem} className="relative group flex-1">
            <input
              type="text"
              placeholder="Search items or add temporary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-bold"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-transform"
              >
                Add
              </button>
            )}
          </form>
          <button
            onClick={() => setShowScanner(true)}
            className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg shadow-green-200 flex items-center justify-center hover:from-green-600 hover:to-green-700 active:scale-95 transition-all flex-shrink-0"
            title="Scan Barcode"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-shrink-0 px-6 py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                activeSection === section 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {filteredData.length > 0 ? (
            filteredData.map(({ category, items }) => (
              <div key={category} className="space-y-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 border-l-2 border-blue-500">
                  {category}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {items.map(item => (
                    <InventoryItemRow
                      key={item.name}
                      item={item}
                      state={selectedStates[item.name]}
                      onCountChange={(count) => handleCountChange(item.name, count)}
                      onStatusChange={(status) => handleStatusChange(item.name, status)}
                      onPromote={activeSection === 'OTHER' ? () => setPromotionItem({ name: item.name, id: item.name }) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 px-10">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No matching items</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-between border border-white/10 overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Today's Order List</p>
            <p className="text-2xl font-black tracking-tighter">{neededItemsCount} <span className="text-slate-500">To Get</span></p>
          </div>
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 relative z-10 transition-transform group-hover:scale-105">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
        </div>
      </div>

      {showSettings && (
        <SettingsView
          inventory={inventory}
          onUpdateInventory={setInventory}
          onClose={() => setShowSettings(false)}
          logoUrl={LOGO_URL}
        />
      )}

      {showClearConfirm && (
        <ConfirmModal
          title="Reset Inventory counts?"
          message="This will clear your current counts for today. Your permanent item list and pars will stay safe."
          onConfirm={clearAll}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {promotionItem && (
        <PromotionModal
          itemName={promotionItem.name}
          inventoryData={inventory}
          onConfirm={promoteItem}
          onCancel={() => setPromotionItem(null)}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {pendingBarcode && (
        <NewBarcodeItemModal
          barcode={pendingBarcode}
          inventoryData={inventory}
          onConfirm={handleNewBarcodeItem}
          onCancel={() => setPendingBarcode(null)}
        />
      )}

      {scannedItem && (
        <ScanActionModal
          itemName={scannedItem.itemName}
          barcode={scannedItem.barcode}
          onConfirm={handleScanAction}
          onCancel={() => setScannedItem(null)}
        />
      )}

      {showScanHistory && (
        <ScanHistoryView
          logs={scanLogs}
          onClose={() => setShowScanHistory(false)}
          onClearLogs={clearScanLogs}
        />
      )}
    </div>
  );
};

export default App;
