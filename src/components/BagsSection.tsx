import React, { useMemo, useState } from 'react';
import {
  Backpack,
  CheckSquare,
  Edit3,
  ListPlus,
  MapPin,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { BagItem, ChecklistItem, EmergencyBag } from '../types';
import { formatJapaneseDate, getStockStatus } from '../utils/dateAndReminder';
import { BackpackHeroIllustration } from './Illustrations';

interface Props {
  bags: EmergencyBag[];
  bagItems: BagItem[];
  checklistItems: ChecklistItem[];
  onSaveBag: (bag: EmergencyBag) => Promise<void>;
  onDeleteBag: (bagId: string) => Promise<void>;
  onSaveBagItem: (item: BagItem) => Promise<void>;
  onDeleteBagItem: (itemId: string) => Promise<void>;
}

export const BagsSection: React.FC<Props> = ({
  bags,
  bagItems,
  checklistItems,
  onSaveBag,
  onDeleteBag,
  onSaveBagItem,
  onDeleteBagItem,
}) => {
  const [activeBagId, setActiveBagId] = useState<string>(bags[0]?.id || '');

  // Bag create/edit modal
  const [bagModalOpen, setBagModalOpen] = useState(false);
  const [editingBag, setEditingBag] = useState<EmergencyBag | null>(null);
  const [bagName, setBagName] = useState('');
  const [bagLocation, setBagLocation] = useState('');
  const [bagAssignee, setBagAssignee] = useState('');
  const [bagMemo, setBagMemo] = useState('');

  // Free-input item modal
  const [freeModalOpen, setFreeModalOpen] = useState(false);
  const [freeName, setFreeName] = useState('');
  const [freeQty, setFreeQty] = useState('1個');
  const [freeExpiry, setFreeExpiry] = useState('');
  const [freeMemo, setFreeMemo] = useState('');

  // Pick from checklist modal
  const [pickModalOpen, setPickModalOpen] = useState(false);
  const [pickSearch, setPickSearch] = useState('');
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<Set<string>>(new Set());

  const currentBag = useMemo(
    () => bags.find((b) => b.id === activeBagId) || bags[0] || null,
    [bags, activeBagId]
  );

  const currentBagItems = useMemo(() => {
    if (!currentBag) return [];
    return bagItems.filter((item) => item.bagId === currentBag.id);
  }, [bagItems, currentBag]);

  const packedCount = useMemo(
    () => currentBagItems.filter((i) => i.checked).length,
    [currentBagItems]
  );

  const filteredChecklist = useMemo(() => {
    const q = pickSearch.trim().toLowerCase();
    return checklistItems.filter((c) => {
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [checklistItems, pickSearch]);

  const openNewBagModal = () => {
    setEditingBag(null);
    setBagName('');
    setBagLocation('');
    setBagAssignee('');
    setBagMemo('');
    setBagModalOpen(true);
  };

  const openEditBagModal = (bag: EmergencyBag) => {
    setEditingBag(bag);
    setBagName(bag.name);
    setBagLocation(bag.location);
    setBagAssignee(bag.assignee || '');
    setBagMemo(bag.memo || '');
    setBagModalOpen(true);
  };

  const handleBagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bagName.trim()) return;
    const newId = editingBag ? editingBag.id : `bag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await onSaveBag({
      id: newId,
      name: bagName.trim(),
      location: bagLocation.trim() || '未設定',
      assignee: bagAssignee.trim() || undefined,
      memo: bagMemo.trim() || undefined,
      createdAt: editingBag ? editingBag.createdAt : new Date().toISOString(),
    });
    setActiveBagId(newId);
    setBagModalOpen(false);
  };

  const handleFreeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBag || !freeName.trim()) return;
    await onSaveBagItem({
      id: `bi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bagId: currentBag.id,
      name: freeName.trim(),
      quantity: freeQty.trim() || '1個',
      expiryDate: freeExpiry || undefined,
      memo: freeMemo.trim() || undefined,
      checked: true,
    });
    setFreeName('');
    setFreeQty('1個');
    setFreeExpiry('');
    setFreeMemo('');
    setFreeModalOpen(false);
  };

  const openPickModal = () => {
    setPickSearch('');
    setSelectedChecklistIds(new Set());
    setPickModalOpen(true);
  };

  const togglePickId = (id: string) => {
    setSelectedChecklistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddPickedItems = async () => {
    if (!currentBag || selectedChecklistIds.size === 0) return;
    for (const id of selectedChecklistIds) {
      const source = checklistItems.find((c) => c.id === id);
      if (!source) continue;
      await onSaveBagItem({
        id: `bi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        bagId: currentBag.id,
        name: source.name,
        category: source.category,
        quantity: source.recommendedQty || '1セット',
        checked: true,
        sourceChecklistId: source.id,
      });
    }
    setPickModalOpen(false);
  };

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-banner-left">
          <BackpackHeroIllustration size={80} />
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>
              非常用持ち出し袋の管理
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              玄関用・車載用・子ども用など、複数のバッグを登録して中身を記録できます
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNewBagModal}>
          <Plus size={18} />
          新しいバッグを追加
        </button>
      </div>

      {/* バッグ切り替えタブ */}
      {bags.length > 0 && (
        <div className="bag-tabs" role="tablist" aria-label="非常用持ち出し袋の一覧">
          {bags.map((bag) => {
            const count = bagItems.filter((i) => i.bagId === bag.id).length;
            const isActive = currentBag?.id === bag.id;
            return (
              <button
                key={bag.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`bag-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveBagId(bag.id)}
              >
                <Backpack size={17} />
                <span>{bag.name}</span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.05rem 0.45rem',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!currentBag ? (
        <div className="card empty-state">
          <p style={{ fontWeight: 700 }}>持ち出し袋が登録されていません</p>
          <button type="button" className="btn btn-primary" onClick={openNewBagModal}>
            <Plus size={18} />
            最初のバッグを作成する
          </button>
        </div>
      ) : (
        <div className="card">
          {/* バッグ情報ヘッダー */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.75rem',
              paddingBottom: '0.9rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: 800 }}>
                {currentBag.name}
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.9rem',
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={15} />
                  保管場所: {currentBag.location}
                </span>
                {currentBag.assignee && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={15} />
                    担当: {currentBag.assignee}
                  </span>
                )}
              </div>
              {currentBag.memo && (
                <div style={{ fontSize: '0.88rem', marginTop: '0.35rem' }}>📝 {currentBag.memo}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openEditBagModal(currentBag)}
              >
                <Edit3 size={15} />
                バッグ編集
              </button>
              <button
                type="button"
                className="btn btn-danger-ghost btn-sm"
                onClick={() => {
                  if (confirm(`「${currentBag.name}」と中身の記録を削除しますか？`)) {
                    onDeleteBag(currentBag.id);
                  }
                }}
              >
                <Trash2 size={15} />
                削除
              </button>
            </div>
          </div>

          {/* 中身追加ボタン */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              バッグの中身（収納確認済み: {packedCount} / {currentBagItems.length} 品）
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={openPickModal}>
                <ListPlus size={16} />
                リストから選んで追加
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setFreeModalOpen(true)}
              >
                <Plus size={16} />
                フリー入力で追加
              </button>
            </div>
          </div>

          {/* 中身一覧 */}
          {currentBagItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.75rem 0.5rem' }}>
              このバッグにはまだ中身が記録されていません。
              <br />
              上の「リストから選んで追加」または「フリー入力で追加」から登録してください。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {currentBagItems.map((item) => {
                const expiryStatus = item.expiryDate ? getStockStatus(item.expiryDate) : null;
                return (
                  <div
                    key={item.id}
                    className={`checklist-item ${item.checked ? 'checked' : ''}`}
                    style={{ alignItems: 'center' }}
                  >
                    <input
                      type="checkbox"
                      className="big-checkbox"
                      style={{ marginTop: 0 }}
                      checked={item.checked}
                      onChange={() => onSaveBagItem({ ...item, checked: !item.checked })}
                      aria-label={`${item.name}を収納済みにする`}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.65rem',
                          fontSize: '0.84rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>数量: {item.quantity}</span>
                        {item.category && <span>[{item.category}]</span>}
                        {item.expiryDate && expiryStatus && (
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                expiryStatus.status === 'expired'
                                  ? 'var(--danger)'
                                  : expiryStatus.status === 'remind'
                                    ? 'var(--warn)'
                                    : 'var(--primary)',
                            }}
                          >
                            期限: {formatJapaneseDate(item.expiryDate)}
                          </span>
                        )}
                      </div>
                      {item.memo && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {item.memo}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => onDeleteBagItem(item.id)}
                      aria-label={`${item.name}をバッグから削除`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* バッグ作成・編集モーダル */}
      {bagModalOpen && (
        <div className="modal-backdrop" onClick={() => setBagModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingBag ? 'バッグを編集' : '新しい持ち出し袋を追加'}</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setBagModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBagSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="bag-name">
                  バッグ名 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="bag-name"
                  type="text"
                  className="input"
                  required
                  placeholder="例：玄関用メインリュック、車載用バッグ、子ども用"
                  value={bagName}
                  onChange={(e) => setBagName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bag-location">
                  保管場所
                </label>
                <input
                  id="bag-location"
                  type="text"
                  className="input"
                  placeholder="例：玄関、車のトランク、寝室クローゼット"
                  value={bagLocation}
                  onChange={(e) => setBagLocation(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bag-assignee">
                  担当者・対象者（任意）
                </label>
                <input
                  id="bag-assignee"
                  type="text"
                  className="input"
                  placeholder="例：家族共用、長男用、ペット用"
                  value={bagAssignee}
                  onChange={(e) => setBagAssignee(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="bag-memo">
                  メモ（任意）
                </label>
                <textarea
                  id="bag-memo"
                  rows={2}
                  className="textarea"
                  value={bagMemo}
                  onChange={(e) => setBagMemo(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBagModalOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* フリー入力追加モーダル */}
      {freeModalOpen && currentBag && (
        <div className="modal-backdrop" onClick={() => setFreeModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">「{currentBag.name}」にフリー入力で追加</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setFreeModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFreeSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="free-name">
                  品名 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="free-name"
                  type="text"
                  className="input"
                  required
                  placeholder="例：予備のメガネ、子どもの好きなお菓子"
                  value={freeName}
                  onChange={(e) => setFreeName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="free-qty">
                  数量・目安
                </label>
                <input
                  id="free-qty"
                  type="text"
                  className="input"
                  placeholder="例：2本、1袋"
                  value={freeQty}
                  onChange={(e) => setFreeQty(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="free-expiry">
                  賞味・使用期限（任意）
                </label>
                <input
                  id="free-expiry"
                  type="date"
                  className="input"
                  value={freeExpiry}
                  onChange={(e) => setFreeExpiry(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="free-memo">
                  メモ（任意）
                </label>
                <input
                  id="free-memo"
                  type="text"
                  className="input"
                  placeholder="例：ジップロックに入れて外ポケットへ"
                  value={freeMemo}
                  onChange={(e) => setFreeMemo(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setFreeModalOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  バッグに追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* チェックリストから選んで追加モーダル */}
      {pickModalOpen && currentBag && (
        <div className="modal-backdrop" onClick={() => setPickModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <CheckSquare size={20} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                物品リストから選んで追加
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPickModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '2.3rem' }}
                placeholder="品名やカテゴリで絞り込み..."
                value={pickSearch}
                onChange={(e) => setPickSearch(e.target.value)}
              />
            </div>

            <div
              style={{
                maxHeight: '45vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                marginBottom: '1rem',
              }}
            >
              {filteredChecklist.map((c) => {
                const selected = selectedChecklistIds.has(c.id);
                return (
                  <label
                    key={c.id}
                    className={`checklist-item ${selected ? 'checked' : ''}`}
                    style={{ padding: '0.6rem 0.75rem', cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      className="big-checkbox"
                      checked={selected}
                      onChange={() => togglePickId(c.id)}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.category}
                        {c.recommendedQty ? ` ・ 目安: ${c.recommendedQty}` : ''}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                {selectedChecklistIds.size} 件選択中
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPickModalOpen(false)}>
                  キャンセル
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={selectedChecklistIds.size === 0}
                  onClick={handleAddPickedItems}
                >
                  選択した項目を追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
