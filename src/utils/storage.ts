import { BagItem, ChecklistItem, EmergencyBag, FontSizeOption, MeetingPoint, StockItem } from '../types';
import { DEFAULT_CHECKLIST_ITEMS } from '../data/defaultChecklist';

const DB_NAME = 'SonaeMemoDB';
const DB_VERSION = 2;

const STORES = {
  STOCKS: 'stocks',
  CHECKLIST: 'checklist',
  BAGS: 'bags',
  BAG_ITEMS: 'bagItems',
  MEETING_POINTS: 'meetingPoints',
} as const;

const FONT_SIZE_KEY = 'sonae_memo_font_size';
const INITIALIZED_KEY = 'sonae_memo_initialized_v1';
const SAFETY_NOTE_KEY = 'sonae_memo_safety_note';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORES.STOCKS)) {
        db.createObjectStore(STORES.STOCKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.CHECKLIST)) {
        db.createObjectStore(STORES.CHECKLIST, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.BAGS)) {
        db.createObjectStore(STORES.BAGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.BAG_ITEMS)) {
        db.createObjectStore(STORES.BAG_ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MEETING_POINTS)) {
        db.createObjectStore(STORES.MEETING_POINTS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function initializeIfNeeded(): Promise<void> {
  const initialized = localStorage.getItem(INITIALIZED_KEY);
  if (initialized) return;

  const existingChecklist = await getAllFromStore<ChecklistItem>(STORES.CHECKLIST);
  if (existingChecklist.length === 0) {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.CHECKLIST, 'readwrite');
      const store = tx.objectStore(STORES.CHECKLIST);
      for (const item of DEFAULT_CHECKLIST_ITEMS) {
        store.put({ ...item, checked: false });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  const existingBags = await getAllFromStore<EmergencyBag>(STORES.BAGS);
  if (existingBags.length === 0) {
    await putToStore<EmergencyBag>(STORES.BAGS, {
      id: 'bag-default-main',
      name: '玄関用メインリュック',
      location: '玄関のシューズボックス横',
      assignee: '家族共用',
      memo: '一次避難時にすぐ持ち出せる基本セット',
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(INITIALIZED_KEY, 'true');
}

// Stocks
export const loadStocks = () => getAllFromStore<StockItem>(STORES.STOCKS);
export const saveStock = (item: StockItem) => putToStore(STORES.STOCKS, item);
export const removeStock = (id: string) => deleteFromStore(STORES.STOCKS, id);

// Checklist
export const loadChecklist = () => getAllFromStore<ChecklistItem>(STORES.CHECKLIST);
export const saveChecklistItem = (item: ChecklistItem) => putToStore(STORES.CHECKLIST, item);
export const removeChecklistItem = (id: string) => deleteFromStore(STORES.CHECKLIST, id);

// Bags
export const loadBags = () => getAllFromStore<EmergencyBag>(STORES.BAGS);
export const saveBag = (bag: EmergencyBag) => putToStore(STORES.BAGS, bag);
export const removeBag = (id: string) => deleteFromStore(STORES.BAGS, id);

// Bag Items
export const loadBagItems = () => getAllFromStore<BagItem>(STORES.BAG_ITEMS);
export const saveBagItem = (item: BagItem) => putToStore(STORES.BAG_ITEMS, item);
export const removeBagItem = (id: string) => deleteFromStore(STORES.BAG_ITEMS, id);

// Meeting Points
export const loadMeetingPoints = () => getAllFromStore<MeetingPoint>(STORES.MEETING_POINTS);
export const saveMeetingPoint = (mp: MeetingPoint) => putToStore(STORES.MEETING_POINTS, mp);
export const removeMeetingPoint = (id: string) => deleteFromStore(STORES.MEETING_POINTS, id);

// Safety Note
export function loadSafetyNote(): string {
  return localStorage.getItem(SAFETY_NOTE_KEY) || '';
}

export function saveSafetyNote(note: string): void {
  localStorage.setItem(SAFETY_NOTE_KEY, note);
}

// Font Size
export function loadFontSize(): FontSizeOption {
  const saved = localStorage.getItem(FONT_SIZE_KEY) as FontSizeOption | null;
  if (saved === 'standard' || saved === 'large' || saved === 'xlarge') {
    return saved;
  }
  return 'standard';
}

export function saveFontSize(size: FontSizeOption): void {
  localStorage.setItem(FONT_SIZE_KEY, size);
}
