import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { CHECKLIST_CATEGORIES, ChecklistCategory, ChecklistItem } from '../types';
import { CategoryEmojiBadge, ChecklistHeroIllustration } from './Illustrations';

interface Props {
  items: ChecklistItem[];
  onToggleItem: (item: ChecklistItem) => Promise<void>;
  onAddCustomItem: (item: ChecklistItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}

export const ChecklistSection: React.FC<Props> = ({
  items,
  onToggleItem,
  onAddCustomItem,
  onDeleteItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('飲料・食料');
  const [newQty, setNewQty] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items]);
  const progressPct = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const grouped = useMemo(() => {
    const categories =
      selectedCategory === 'ALL'
        ? CHECKLIST_CATEGORIES
        : CHECKLIST_CATEGORIES.filter((c) => c === selectedCategory);

    return categories
      .map((cat) => {
        const catItems = items.filter((i) => {
          if (i.category !== cat) return false;
          if (showUncheckedOnly && i.checked) return false;
          return true;
        });
        const totalInCat = items.filter((i) => i.category === cat).length;
        const checkedInCat = items.filter((i) => i.category === cat && i.checked).length;
        return { category: cat, items: catItems, totalInCat, checkedInCat };
      })
      .filter((g) => g.totalInCat > 0 || g.items.length > 0);
  }, [items, selectedCategory, showUncheckedOnly]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await onAddCustomItem({
      id: `chk-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: newCategory,
      name: newName.trim(),
      recommendedQty: newQty.trim() || undefined,
      description: newDesc.trim() || undefined,
      checked: false,
      isCustom: true,
    });
    setNewName('');
    setNewQty('');
    setNewDesc('');
    setIsAddOpen(false);
  };

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-banner-left">
          <ChecklistHeroIllustration size={78} />
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>
              災害時の必要・推奨物品リスト
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              ご家庭の備えをチェックして抜け漏れを防ぎましょう（持ち出し袋への追加にも使えます）
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={18} />
          項目を追加
        </button>
      </div>

      {/* 進捗カード */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontWeight: 800 }}>全体の準備状況</span>
          <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
            {checkedCount} / {items.length} 項目（{progressPct}%）
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 絞り込み */}
      <div className="filter-bar" style={{ alignItems: 'center' }}>
        <select
          className="select filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">すべてのカテゴリ</option>
          {CHECKLIST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            fontWeight: 700,
            padding: '0.4rem 0.6rem',
          }}
        >
          <input
            type="checkbox"
            className="big-checkbox"
            style={{ marginTop: 0 }}
            checked={showUncheckedOnly}
            onChange={(e) => setShowUncheckedOnly(e.target.checked)}
          />
          未チェックのみ表示
        </label>
      </div>

      {/* カテゴリ別リスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {grouped.map((group) => (
          <section key={group.category} className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                }}
              >
                <CategoryEmojiBadge category={group.category} />
                {group.category}
              </h3>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>
                {group.checkedInCat} / {group.totalInCat}
              </span>
            </div>

            {group.items.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                このカテゴリの未チェック項目はありません。
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {group.items.map((item) => (
                  <label key={item.id} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      className="big-checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(item)}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          textDecoration: item.checked ? 'line-through' : 'none',
                          color: item.checked ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        {item.name}
                      </div>
                      {item.recommendedQty && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 700 }}>
                          目安: {item.recommendedQty}
                        </div>
                      )}
                      {item.description && (
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.isCustom && (
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm(`「${item.name}」をリストから削除しますか？`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        aria-label="カスタム項目を削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </label>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* カスタム項目追加モーダル */}
      {isAddOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">チェックリストに項目を追加</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-name">
                  品目名 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="chk-name"
                  type="text"
                  className="input"
                  required
                  placeholder="例：コンタクトレンズ予備、生理用品"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="chk-cat">
                  カテゴリ
                </label>
                <select
                  id="chk-cat"
                  className="select"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ChecklistCategory)}
                >
                  {CHECKLIST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="chk-qty">
                  目安数量（任意）
                </label>
                <input
                  id="chk-qty"
                  type="text"
                  className="input"
                  placeholder="例：1週間分、2パック"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="chk-desc">
                  メモ・補足（任意）
                </label>
                <textarea
                  id="chk-desc"
                  rows={2}
                  className="textarea"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
