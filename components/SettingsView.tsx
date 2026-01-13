
import React, { useState } from 'react';
import { InventoryData, SectionName, InventoryItem } from '../types';

interface SettingsViewProps {
  inventory: InventoryData;
  onUpdateInventory: (data: InventoryData) => void;
  onClose: () => void;
  logoUrl?: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ inventory, onUpdateInventory, onClose, logoUrl }) => {
  const [activeSection, setActiveSection] = useState<SectionName>('DEPOT');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPar, setNewItemPar] = useState('');
  const [targetCategory, setTargetCategory] = useState<string>('');

  const sections: SectionName[] = ['DEPOT', 'STORE', 'BAKERY', 'OTHER'];
  const categories = Object.keys(inventory[activeSection] || {});

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !targetCategory) return;

    const updated = { ...inventory };
    const newItem: InventoryItem = { 
      name: newItemName.toUpperCase(), 
      par: newItemPar ? parseFloat(newItemPar) : undefined 
    };

    updated[activeSection][targetCategory] = [
      ...(updated[activeSection][targetCategory] || []),
      newItem
    ];

    onUpdateInventory(updated);
    setNewItemName('');
    setNewItemPar('');
  };

  const removeItem = (category: string, index: number) => {
    const updated = { ...inventory };
    updated[activeSection][category] = updated[activeSection][category].filter((_, i) => i !== index);
    onUpdateInventory(updated);
  };

  const updatePar = (category: string, index: number, val: string) => {
    const updated = { ...inventory };
    const num = parseFloat(val);
    updated[activeSection][category][index].par = isNaN(num) ? undefined : num;
    onUpdateInventory(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <header className="p-4 border-b flex items-center justify-between bg-slate-900 text-white sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-sm">
            {logoUrl ? (
               <img src={logoUrl} alt="Logo" className="w-full h-full object-cover scale-110" />
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            )}
          </div>
          <h2 className="font-black uppercase tracking-tighter text-lg">Inventory Settings</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 pb-10">
        <div className="max-w-2xl mx-auto p-4 space-y-8">
          
          {/* Section Selector */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {sections.map(s => (
              <button
                key={s}
                onClick={() => { setActiveSection(s); setTargetCategory(''); }}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  activeSection === s ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Add Item Form */}
          <form onSubmit={addItem} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Add Permanent Item</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Par Level"
                value={newItemPar}
                onChange={(e) => setNewItemPar(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500"
              />
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-[0.98] transition-all">
              Add to Permanent List
            </button>
          </form>

          {/* List Management */}
          <div className="space-y-6">
            {categories.map(cat => (
              <div key={cat} className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex justify-between">
                  {cat}
                  <span>{inventory[activeSection][cat].length} Items</span>
                </h3>
                <div className="space-y-2">
                  {inventory[activeSection][cat].map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <label className="text-[8px] font-black text-slate-300 uppercase">Par</label>
                          <input
                            type="number"
                            value={item.par || ''}
                            onChange={(e) => updatePar(cat, idx, e.target.value)}
                            className="w-12 py-1 text-center bg-slate-50 border border-slate-100 rounded text-xs font-bold"
                          />
                        </div>
                        <button 
                          onClick={() => removeItem(cat, idx)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
