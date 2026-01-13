
import React, { useState } from 'react';
import { SectionName, InventoryData } from '../types';

interface PromotionModalProps {
  itemName: string;
  inventoryData: InventoryData;
  onConfirm: (section: SectionName, category: string) => void;
  onCancel: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ itemName, inventoryData, onConfirm, onCancel }) => {
  const sections: SectionName[] = ['DEPOT', 'STORE', 'BAKERY'];
  const [selectedSection, setSelectedSection] = useState<SectionName | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = selectedSection ? Object.keys(inventoryData[selectedSection]) : [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Add Permanently</h3>
          <p className="text-blue-600 font-bold text-sm mb-6 uppercase truncate">{itemName}</p>
          
          <div className="space-y-6">
            {/* Section Selection */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">1. Select Section</p>
              <div className="grid grid-cols-3 gap-2">
                {sections.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSection(s); setSelectedCategory(null); }}
                    className={`py-3 rounded-xl text-[10px] font-black tracking-wider transition-all border-2 ${
                      selectedSection === s 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-100 text-gray-400 hover:border-blue-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            {selectedSection && (
              <div className="animate-in slide-in-from-top-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">2. Select Category</p>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                        selectedCategory === cat 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 rounded-2xl"
              >
                Cancel
              </button>
              <button
                disabled={!selectedSection || !selectedCategory}
                onClick={() => selectedSection && selectedCategory && onConfirm(selectedSection, selectedCategory)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  selectedSection && selectedCategory 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
