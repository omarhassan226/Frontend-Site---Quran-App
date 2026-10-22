export interface Zikr {
  _id?: string;
  category: string;
  text: string;
  count: number;
  benefit: string;
  reference: string;
  order: number;
  // UI state for counter
  currentCount?: number;
  completed?: boolean;
}
