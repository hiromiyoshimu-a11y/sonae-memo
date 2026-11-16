export type StockGenre =
  | '飲料水'
  | '主食・レトルト'
  | '缶詰・おかず'
  | 'お菓子・栄養補助'
  | '日用品・衛生'
  | '医薬品・救急'
  | '燃料・電池'
  | 'その他';

export const STOCK_GENRES: StockGenre[] = [
  '飲料水',
  '主食・レトルト',
  '缶詰・おかず',
  'お菓子・栄養補助',
  '日用品・衛生',
  '医薬品・救急',
  '燃料・電池',
  'その他',
];

export const STORAGE_LOCATIONS: string[] = [
  'キッチン・パントリー',
  '床下収納',
  '玄関・シューズボックス',
  'リビング',
  '寝室・クローゼット',
  '洗面所・トイレ',
  '車内・トランク',
  '物置・倉庫',
];

export interface StockItem {
  id: string;
  name: string;
  genre: StockGenre;
  photoDataUrl?: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  unit: string;
  location?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChecklistCategory =
  | '飲料・食料'
  | '衛生・トイレ'
  | '救急・常備薬'
  | '情報・電源・明かり'
  | '防寒・安全・工具'
  | '貴重品・その他'
  | '乳幼児・高齢者・ペット';

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  '飲料・食料',
  '衛生・トイレ',
  '救急・常備薬',
  '情報・電源・明かり',
  '防寒・安全・工具',
  '貴重品・その他',
  '乳幼児・高齢者・ペット',
];

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  name: string;
  description?: string;
  recommendedQty?: string;
  checked: boolean;
  isCustom?: boolean;
}

export interface EmergencyBag {
  id: string;
  name: string;
  location: string;
  assignee?: string;
  memo?: string;
  createdAt: string;
}

export interface BagItem {
  id: string;
  bagId: string;
  name: string;
  quantity: string;
  category?: string;
  memo?: string;
  checked: boolean;
  sourceChecklistId?: string;
  expiryDate?: string;
}

export type FontSizeOption = 'standard' | 'large' | 'xlarge';

export const FONT_SIZE_LABELS: Record<FontSizeOption, { label: string; short: string; px: number }> = {
  standard: { label: '標準 (16px)', short: '標準', px: 16 },
  large: { label: '大 (18px)', short: '大', px: 18 },
  xlarge: { label: '特大 (21px)', short: '特大', px: 21 },
};

export type TabKey = 'stock' | 'checklist' | 'bags';
