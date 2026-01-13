
export type SectionName = 'DEPOT' | 'STORE' | 'BAKERY' | 'OTHER';

export interface InventoryItem {
  name: string;
  par?: number; // Standard amount to keep in stock
  barcode?: string; // Associated barcode
}

export interface SelectedItemState {
  id: string;
  currentCount: string; // What we have now
  status: 'needed' | 'not-needed' | 'none';
  manualQuantity?: string; // Fallback for items without pars
}

export interface InventoryData {
  [section: string]: {
    [category: string]: InventoryItem[];
  };
}

// Barcode mapping: barcode string -> item name
export interface BarcodeMapping {
  [barcode: string]: {
    itemName: string;
    section: SectionName;
    category: string;
    createdAt: string;
  };
}

// Scan log entry
export interface ScanLogEntry {
  id: string;
  barcode: string;
  itemName: string;
  quantity: number;
  timestamp: string;
  action: 'received' | 'used' | 'counted';
}
