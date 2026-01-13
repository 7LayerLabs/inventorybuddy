
export type SectionName = 'DEPOT' | 'STORE' | 'BAKERY' | 'OTHER';

export interface InventoryItem {
  name: string;
  par?: number; // Standard amount to keep in stock
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
