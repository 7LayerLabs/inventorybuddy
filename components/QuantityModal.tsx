
import React, { useState, useEffect, useRef } from 'react';

interface QuantityModalProps {
  itemName: string;
  initialValue: string;
  onConfirm: (quantity: string) => void;
  onCancel: () => void;
}

const QuantityModal: React.FC<QuantityModalProps> = ({ itemName, initialValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState(initialValue || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount for faster mobile entry
    if (inputRef.current) {
      inputRef.current.focus();
    }
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Quantity for:</h3>
          <p className="text-blue-600 font-medium mb-6 uppercase tracking-wide">{itemName}</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder="e.g. 5, 2 cases, 10lb"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-xl font-bold"
            />
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;
