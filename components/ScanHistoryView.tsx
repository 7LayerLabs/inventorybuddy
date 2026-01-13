
import React from 'react';
import { ScanLogEntry } from '../types';

interface ScanHistoryViewProps {
  logs: ScanLogEntry[];
  onClose: () => void;
  onClearLogs: () => void;
}

const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({ logs, onClose, onClearLogs }) => {
  const actionStyles = {
    received: { bg: 'bg-green-100', text: 'text-green-700', icon: '📦' },
    used: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '✂️' },
    counted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📋' },
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = new Date(log.timestamp).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {} as Record<string, ScanLogEntry[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">Scan History</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {logs.length} entries
              </p>
            </div>
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {logs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-slate-500 font-bold">No scans yet</p>
            <p className="text-slate-400 text-sm mt-1">Start scanning items to see history here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2 border-l-2 border-blue-500">
                  {formatDate(groupedLogs[dateKey][0].timestamp)}
                </h3>
                <div className="space-y-2">
                  {groupedLogs[dateKey]
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log) => {
                      const style = actionStyles[log.action];
                      return (
                        <div
                          key={log.id}
                          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center text-lg`}>
                              {style.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 truncate">{log.itemName}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={`${style.bg} ${style.text} px-2 py-0.5 rounded-full font-bold uppercase text-[10px]`}>
                                  {log.action}
                                </span>
                                <span className="text-slate-400">×{log.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-600">{formatTime(log.timestamp)}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{log.barcode.slice(-8)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistoryView;
