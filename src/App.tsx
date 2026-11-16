import React, { useEffect, useMemo, useState } from 'react';
import { Backpack, CheckSquare, MapPin, Package, Type } from 'lucide-react';
import { BrandHomeIllustration } from './components/Illustrations';
import {
  BagItem,
  ChecklistItem,
  EmergencyBag,
  FONT_SIZE_LABELS,
  FontSizeOption,
  MeetingPoint,
  StockItem,
  TabKey,
} from './types';
import {
  initializeIfNeeded,
  loadBagItems,
  loadBags,
  loadChecklist,
  loadFontSize,
  loadMeetingPoints,
  loadSafetyNote,
  loadStocks,
  removeBag,
  removeBagItem,
  removeChecklistItem,
  removeMeetingPoint,
  removeStock,
  saveBag,
  saveBagItem,
  saveChecklistItem,
  saveFontSize,
  saveMeetingPoint,
  saveSafetyNote,
  saveStock,
} from './utils/storage';
import { getStockStatus, getTodayStr } from './utils/dateAndReminder';
import { StockSection } from './components/StockSection';
import { ChecklistSection } from './components/ChecklistSection';
import { BagsSection } from './components/BagsSection';
import { SafetyAndMapSection } from './components/SafetyAndMapSection';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('stock');
  const [fontSize, setFontSize] = useState<FontSizeOption>(() => loadFontSize());
  const [loading, setLoading] = useState(true);

  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [bags, setBags] = useState<EmergencyBag[]>([]);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
  const [safetyNote, setSafetyNote] = useState<string>(() => loadSafetyNote());

  useEffect(() => {
    const px = FONT_SIZE_LABELS[fontSize].px;
    document.documentElement.style.fontSize = `${px}px`;
    saveFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await initializeIfNeeded();
        const [loadedStocks, loadedChecklist, loadedBags, loadedBagItems, loadedMeetingPoints] =
          await Promise.all([
            loadStocks(),
            loadChecklist(),
            loadBags(),
            loadBagItems(),
            loadMeetingPoints(),
          ]);
        if (!active) return;
        setStocks(loadedStocks);
        setChecklist(loadedChecklist);
        setBags(loadedBags);
        setBagItems(loadedBagItems);
        setMeetingPoints(loadedMeetingPoints);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const alertCount = useMemo(() => {
    const today = getTodayStr();
    return stocks.filter((s) => {
      const st = getStockStatus(s.expiryDate, today).status;
      return st === 'remind' || st === 'expired';
    }).length;
  }, [stocks]);

  const handleSaveStock = async (item: StockItem) => {
    await saveStock(item);
    setStocks((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      return exists ? prev.map((s) => (s.id === item.id ? item : s)) : [...prev, item];
    });
  };

  const handleDeleteStock = async (id: string) => {
    await removeStock(id);
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    const updated = { ...item, checked: !item.checked };
    await saveChecklistItem(updated);
    setChecklist((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleAddChecklist = async (item: ChecklistItem) => {
    await saveChecklistItem(item);
    setChecklist((prev) => [...prev, item]);
  };

  const handleDeleteChecklist = async (id: string) => {
    await removeChecklistItem(id);
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveBag = async (bag: EmergencyBag) => {
    await saveBag(bag);
    setBags((prev) => {
      const exists = prev.some((b) => b.id === bag.id);
      return exists ? prev.map((b) => (b.id === bag.id ? bag : b)) : [...prev, bag];
    });
  };

  const handleDeleteBag = async (bagId: string) => {
    await removeBag(bagId);
    const itemsToDelete = bagItems.filter((i) => i.bagId === bagId);
    for (const bi of itemsToDelete) {
      await removeBagItem(bi.id);
    }
    setBags((prev) => prev.filter((b) => b.id !== bagId));
    setBagItems((prev) => prev.filter((i) => i.bagId !== bagId));
  };

  const handleSaveBagItem = async (item: BagItem) => {
    await saveBagItem(item);
    setBagItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
  };

  const handleDeleteBagItem = async (itemId: string) => {
    await removeBagItem(itemId);
    setBagItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSaveMeetingPoint = async (mp: MeetingPoint) => {
    await saveMeetingPoint(mp);
    setMeetingPoints((prev) => {
      const exists = prev.some((m) => m.id === mp.id);
      return exists ? prev.map((m) => (m.id === mp.id ? mp : m)) : [...prev, mp];
    });
  };

  const handleDeleteMeetingPoint = async (id: string) => {
    await removeMeetingPoint(id);
    setMeetingPoints((prev) => prev.filter((m) => m.id !== id));
  };

  const handleChangeSafetyNote = (note: string) => {
    setSafetyNote(note);
    saveSafetyNote(note);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <BrandHomeIllustration size={44} />
            <div>
              <h1 className="brand-title">そなえメモ</h1>
              <p className="brand-sub">おうちのローリングストック & 持ち出し袋</p>
            </div>
          </div>

          <div className="font-switcher" role="group" aria-label="文字サイズ選択">
            <span className="font-switcher-label">
              <Type size={15} />
              文字サイズ
            </span>
            {(['standard', 'large', 'xlarge'] as FontSizeOption[]).map((opt) => (
              <button
                key={opt}
                type="button"
                className={`font-btn ${fontSize === opt ? 'active' : ''}`}
                onClick={() => setFontSize(opt)}
                aria-pressed={fontSize === opt}
              >
                {FONT_SIZE_LABELS[opt].short}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="nav-tabs" aria-label="メインメニュー">
        <div className="nav-tabs-inner">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <Package size={19} />
            <span>備蓄・賞味期限</span>
            {alertCount > 0 && <span className="badge-count">{alertCount}</span>}
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={19} />
            <span>防災チェックリスト</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'bags' ? 'active' : ''}`}
            onClick={() => setActiveTab('bags')}
          >
            <Backpack size={19} />
            <span>持ち出し袋 ({bags.length})</span>
          </button>

          <button
            type="button"
            className={`nav-tab ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <MapPin size={19} />
            <span>安否・避難</span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="card empty-state">データを読み込んでいます...</div>
        ) : (
          <>
            {activeTab === 'stock' && (
              <StockSection
                stocks={stocks}
                onSaveStock={handleSaveStock}
                onDeleteStock={handleDeleteStock}
              />
            )}
            {activeTab === 'checklist' && (
              <ChecklistSection
                items={checklist}
                onToggleItem={handleToggleChecklist}
                onAddCustomItem={handleAddChecklist}
                onDeleteItem={handleDeleteChecklist}
              />
            )}
            {activeTab === 'bags' && (
              <BagsSection
                bags={bags}
                bagItems={bagItems}
                checklistItems={checklist}
                onSaveBag={handleSaveBag}
                onDeleteBag={handleDeleteBag}
                onSaveBagItem={handleSaveBagItem}
                onDeleteBagItem={handleDeleteBagItem}
              />
            )}
            {activeTab === 'safety' && (
              <SafetyAndMapSection
                meetingPoints={meetingPoints}
                safetyNote={safetyNote}
                onSaveMeetingPoint={handleSaveMeetingPoint}
                onDeleteMeetingPoint={handleDeleteMeetingPoint}
                onChangeSafetyNote={handleChangeSafetyNote}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
