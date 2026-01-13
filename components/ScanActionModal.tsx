
import React, { useState } from 'react';

interface ScanActionModalProps {
  itemName: string;
  barcode: string;
  onConfirm: (action: 'received' | 'used' | 'counted', quantity: number) => void;
  onCancel: () => void;
}

const ScanActionModal: React.FC<ScanActionModalProps> = ({
  itemName,
  barcode,
  onConfirm,
  onCancel,
}) => {
  const [action, setAction] = useState<'received' | 'used' | 'counted'>('received');
  const [quantity, setQuantity] = useState(1);

  const actions = [
    { id: 'received' as const, label: 'Received', icon: '📦', color: 'bg-green-500' },
    { id: 'used' as const, label: 'Used', icon: '✂️', color: 'bg-orange-500' },
    { id: 'counted' as const, label: 'Counted', icon: '📋', color: 'bg-blue-500' },
  ];

  const quickQuantities = [1, 2, 5, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">{itemName}</h2>
              <p className="text-white/50 text-xs font-mono">{barcode}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Action Selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              What are you doing?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {actions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAction(a.id)}
                  className={`py-4 px-3 rounded-2xl text-center transition-all ${
                    action === a.id
                      ? `${a.color} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-2xl block mb-1">{a.icon}</span>
                  <span className="text-[10px] font-black tracking-wider">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-3xl font-black py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Quick quantity buttons */}
            <div className="flex gap-2 mt-3">
              {quickQuantities.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    quantity === q
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
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
              type="button"
              onClick={() => onConfirm(action, quantity)}
              className="flex-1 py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Log It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanActionModal;
