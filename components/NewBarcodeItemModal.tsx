
import React, { useState } from 'react';
import { SectionName, InventoryData } from '../types';

interface NewBarcodeItemModalProps {
  barcode: string;
  inventoryData: InventoryData;
  onConfirm: (itemName: string, section: SectionName, category: string) => void;
  onCancel: () => void;
}

const NewBarcodeItemModal: React.FC<NewBarcodeItemModalProps> = ({
  barcode,
  inventoryData,
  onConfirm,
  onCancel,
}) => {
  const [itemName, setItemName] = useState('');
  const [selectedSection, setSelectedSection] = useState<SectionName>('DEPOT');
  const [selectedCategory, setSelectedCategory] = useState('');

  const sections: SectionName[] = ['DEPOT', 'STORE', 'BAKERY', 'OTHER'];

  const categories = Object.keys(inventoryData[selectedSection] || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && selectedCategory) {
      onConfirm(itemName.trim().toUpperCase(), selectedSection, selectedCategory);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">New Item Found</h2>
              <p className="text-white/70 text-sm font-medium">Barcode: {barcode}</p>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            This barcode isn't linked yet. Name this item and it'll be remembered for next time.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., CHICKEN BREAST 40LB"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
              autoFocus
            />
          </div>

          {/* Section */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Section
            </label>
            <div className="grid grid-cols-4 gap-2">
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => {
                    setSelectedSection(section);
                    setSelectedCategory('');
                  }}
                  className={`py-2.5 px-2 rounded-xl text-[10px] font-black tracking-wider transition-all ${
                    selectedSection === section
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Category
            </label>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No categories in this section</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!itemName.trim() || !selectedCategory}
              className="flex-1 py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBarcodeItemModal;
