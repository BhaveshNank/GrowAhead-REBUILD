import { create } from 'zustand';

interface Transaction {
  id: number;
  merchant_name: string;
  amount: string;
  category: string;
  date: string;
}

interface Roundup {
  id: number;
  transaction_id: number;
  roundup_amount: string;
  created_at: string;
}

interface GrowthData {
  roundup_count: number;
  data: {
    conservative: ProfileData;
    balanced: ProfileData;
    aggressive: ProfileData;
  };
}

interface ProfileData {
  annual_rate_pct: number;
  total_invested: number;
  current_value: number;
  projections: {
    '1yr': number;
    '3yr': number;
    '5yr': number;
    '10yr': number;
  };
}

interface AppState {
  transactions: Transaction[];
  roundups: Roundup[];
  growth: GrowthData | null;
  setTransactions: (transactions: Transaction[]) => void;
  setRoundups: (roundups: Roundup[]) => void;
  setGrowth: (growth: GrowthData) => void;
}

export const useAppStore = create<AppState>((set) => ({
  transactions: [],
  roundups: [],
  growth: null,

  setTransactions: (transactions) => set({ transactions }),
  setRoundups: (roundups) => set({ roundups }),
  setGrowth: (growth) => set({ growth }),
}));