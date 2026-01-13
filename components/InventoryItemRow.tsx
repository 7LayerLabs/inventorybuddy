
import React from 'react';
import { SelectedItemState, InventoryItem } from '../types';

interface InventoryItemRowProps {
  item: InventoryItem;
  state: SelectedItemState | undefined;
  onCountChange: (count: string) => void;
  onStatusChange: (status: 'needed' | 'not-needed' | 'none') => void;
  onPromote?: () => void;
}

const InventoryItemRow: React.FC<InventoryItemRowProps> = ({ item, state, onCountChange, onStatusChange, onPromote }) => {
  const currentVal = state?.currentCount || '';
  const isNotNeeded = state?.status === 'not-needed';
  
  // Calculate order quantity
  const currentNum = parseFloat(currentVal);
  const orderQty = (!isNaN(currentNum) && item.par) ? Math.max(0, item.par - currentNum) : 0;
  const isNeeded = state?.status === 'needed' || (orderQty > 0 && state?.status !== 'not-needed');

  return (
    <div className={`flex flex-col p-4 border-2 rounded-2xl transition-all ${
      isNotNeeded 
        ? 'bg-gray-50 border-transparent opacity-60' 
        : isNeeded 
          ? 'bg-white border-blue-500 shadow-lg shadow-blue-50' 
          : 'bg-white border-slate-100'
    }`}>
      <div className="flex items-center gap-3">
        {/* Toggle Status */}
        <button
          onClick={() => onStatusChange(isNotNeeded ? 'none' : 'not-needed')}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border-2 ${
            isNotNeeded 
              ? 'bg-red-500 border-red-500 text-white' 
              : 'border-slate-100 text-slate-300 hover:border-red-200'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-black text-sm uppercase tracking-tight truncate ${isNotNeeded ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {item.name}
            </h3>
            {onPromote && (
              <button onClick={onPromote} className="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">+ SAVE</button>
            )}
          </div>
          {item.par !== undefined && (
            <p className="text-[10px] font-bold text-slate-400">STANDARD: {item.par}</p>
          )}
        </div>

        {/* Current Count Input */}
        <div className="flex flex-col items-end gap-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Have</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={currentVal}
            onChange={(e) => onCountChange(e.target.value)}
            className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Result Footer */}
      {(orderQty > 0 || isNeeded) && !isNotNeeded && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Order Suggestion</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">
            {orderQty > 0 ? `GET ${orderQty.toFixed(1)}` : 'NEEDED'}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItemRow;
