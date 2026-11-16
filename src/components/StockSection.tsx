import React, { useMemo, useRef, useState } from 'react';
import { MapPin, Bell, CalendarPlus, Camera, Edit3, Image as ImageIcon, Plus, RefreshCw, Search, Sparkles, Trash2, X } from 'lucide-react';
import { STOCK_GENRES, STORAGE_LOCATIONS, StockGenre, StockItem } from '../types';
import {
  downloadReminderIcs,
  formatJapaneseDate,
  getReminderDateStr,
  getStockStatus,
  getTodayStr,
} from '../utils/dateAndReminder';
import { compressImageFile } from '../utils/imageUtils';
import { GenreIllustration, PantryHeroIllustration } from './Illustrations';

interface Props {
  stocks: StockItem[];
  onSaveStock: (item: StockItem) => Promise<void>;
  onDeleteStock: (id: string) => Promise<void>;
}

export const StockSection: React.FC<Props> = ({ stocks, onSaveStock, onDeleteStock }) => {
  const [searchText, setSearchText] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'remind_or_expired' | 'safe'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Rotate modal
  const [rotatingItem, setRotatingItem] = useState<StockItem | null>(null);
  const [rotateNewExpiry, setRotateNewExpiry] = useState('');
  const [rotateNewQty, setRotateNewQty] = useState(1);

  // Form state
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<StockGenre>('飲料水');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('個');
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [photoLoading, setPhotoLoading] = useState(false);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = getTodayStr();

  const enrichedStocks = useMemo(() => {
    return stocks
      .map((item) => ({
        item,
        info: getStockStatus(item.expiryDate, todayStr),
      }))
      .sort((a, b) => a.item.expiryDate.localeCompare(b.item.expiryDate));
  }, [stocks, todayStr]);

  const remindItems = useMemo(
    () => enrichedStocks.filter((s) => s.info.status === 'remind'),
    [enrichedStocks]
  );
  const expiredItems = useMemo(
    () => enrichedStocks.filter((s) => s.info.status === 'expired'),
    [enrichedStocks]
  );

  const filteredStocks = useMemo(() => {
    return enrichedStocks.filter(({ item, info }) => {
      if (genreFilter !== 'ALL' && item.genre !== genreFilter) return false;
      if (statusFilter === 'remind_or_expired' && info.status === 'safe') return false;
      if (statusFilter === 'safe' && info.status !== 'safe') return false;
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        const matchMemo = (item.memo || '').toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchMemo) return false;
      }
      return true;
    });
  }, [enrichedStocks, genreFilter, statusFilter, searchText]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGenre('飲料水');
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split('T')[0]);
    setQuantity(1);
    setUnit('本');
    setLocation('');
    setMemo('');
    setPhotoDataUrl(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setName(item.name);
    setGenre(item.genre);
    setExpiryDate(item.expiryDate);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setLocation(item.location || '');
    setMemo(item.memo || '');
    setPhotoDataUrl(item.photoDataUrl);
    setIsModalOpen(true);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoLoading(true);
      const compressed = await compressImageFile(file);
      setPhotoDataUrl(compressed);
    } catch {
      alert('画像の読み込みに失敗しました。別の画像をお試しください。');
    } finally {
      setPhotoLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !expiryDate) return;
    const now = new Date().toISOString();
    const item: StockItem = {
      id: editingItem ? editingItem.id : `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      genre,
      photoDataUrl,
      expiryDate,
      quantity: Math.max(1, Number(quantity) || 1),
      unit: unit.trim() || '個',
      location: location.trim() || undefined,
      memo: memo.trim() || undefined,
      createdAt: editingItem ? editingItem.createdAt : now,
      updatedAt: now,
    };
    await onSaveStock(item);
    setIsModalOpen(false);
  };

  const openRotateModal = (item: StockItem) => {
    setRotatingItem(item);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setRotateNewExpiry(d.toISOString().split('T')[0]);
    setRotateNewQty(item.quantity);
  };

  const addMonthsToDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setRotateNewExpiry(d.toISOString().split('T')[0]);
  };

  const handleRotateConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rotatingItem || !rotateNewExpiry) return;
    await onSaveStock({
      ...rotatingItem,
      expiryDate: rotateNewExpiry,
      quantity: Math.max(1, Number(rotateNewQty) || 1),
      updatedAt: new Date().toISOString(),
    });
    setRotatingItem(null);
  };

  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === 'granted' && (remindItems.length > 0 || expiredItems.length > 0)) {
      new Notification('そなえメモ：備蓄リマインド', {
        body: `入れ替え時期の備蓄品が ${remindItems.length + expiredItems.length} 件あります。`,
      });
    }
  };

  const handleAddSampleData = async () => {
    const now = new Date();
    const addMonths = (m: number) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + m);
      return d.toISOString().split('T')[0];
    };
    const samples: StockItem[] = [
      {
        id: `stk-sample-1-${Date.now()}`,
        name: '保存水 2L（6本入り）',
        genre: '飲料水',
        expiryDate: addMonths(5), // 6ヶ月前を過ぎているためリマインド対象になる
        quantity: 2,
        unit: '箱',
        memo: 'キッチンの床下収納',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `stk-sample-2-${Date.now()}`,
        name: 'さば味噌煮 缶詰',
        genre: '缶詰・おかず',
        expiryDate: addMonths(14),
        quantity: 6,
        unit: '缶',
        memo: '普段の夕飯で消費して買い足す',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: `stk-sample-3-${Date.now()}`,
        name: 'パックご飯（白飯）',
        genre: '主食・レトルト',
        expiryDate: addMonths(6),
        quantity: 10,
        unit: '食',
        memo: 'パントリー上段',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];
    for (const s of samples) {
      await onSaveStock(s);
    }
  };

  const previewReminder = expiryDate ? getReminderDateStr(expiryDate) : '';

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-banner-left">
          <PantryHeroIllustration size={82} />
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>
              ローリングストック管理
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              賞味期限の<strong>約6ヶ月前の月の1日</strong>に、やさしくお知らせします🌿
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {notifPermission !== 'unsupported' && notifPermission !== 'granted' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleRequestNotification}>
              <Bell size={16} />
              通知を有効にする
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            備蓄品を登録
          </button>
        </div>
      </div>

      {/* 期限切れアラート */}
      {expiredItems.length > 0 && (
        <div className="alert-banner danger" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Bell size={20} />
            賞味期限が過ぎている備蓄品が {expiredItems.length} 件あります
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {expiredItems.map(({ item }) => (
              <button
                key={item.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openRotateModal(item)}
              >
                {item.name}（{formatJapaneseDate(item.expiryDate)}）→ 入れ替え
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 半年前の1日リマインドアラート */}
      {remindItems.length > 0 && (
        <div className="alert-banner warn" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Bell size={20} />
            ローテーション時期（期限の約半年前）の備蓄品が {remindItems.length} 件あります
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            日常の食事や生活で消費し、新しいものを買い足して「入れ替え」を押してください。
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {remindItems.map(({ item }) => (
              <button
                key={item.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openRotateModal(item)}
              >
                {item.name}（期限: {formatJapaneseDate(item.expiryDate)}）→ 入れ替え
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 検索・フィルター */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search
            size={18}
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
            style={{ paddingLeft: '2.35rem' }}
            placeholder="名称・保管場所・メモで検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <select
          className="select"
          style={{ flex: '0 1 180px' }}
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="ALL">すべてのジャンル</option>
          {STOCK_GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ flex: '0 1 200px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'remind_or_expired' | 'safe')}
        >
          <option value="ALL">すべての状態</option>
          <option value="remind_or_expired">リマインド中・期限切れ</option>
          <option value="safe">期限まで余裕あり</option>
        </select>
      </div>

      {/* 一覧 */}
      {stocks.length === 0 ? (
        <div className="card empty-state">
          <div style={{ marginBottom: '0.75rem' }}>
            <PantryHeroIllustration size={104} />
          </div>
          <p style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            まだ備蓄品が登録されていません
          </p>
          <p style={{ marginBottom: '1.25rem' }}>
            普段食べているものや保存水を、写真や賞味期限と一緒に登録してみましょう。
          </p>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              最初の備蓄品を登録
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleAddSampleData}>
              <Sparkles size={18} />
              サンプルデータを試す
            </button>
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="card empty-state">条件に一致する備蓄品がありません。</div>
      ) : (
        <div className="stock-grid">
          {filteredStocks.map(({ item, info }) => (
            <article key={item.id} className={`stock-card status-${info.status}`}>
              <div className="stock-photo-wrap">
                {item.photoDataUrl ? (
                  <img src={item.photoDataUrl} alt={item.name} />
                ) : (
                  <div className="stock-photo-placeholder">
                    <GenreIllustration genre={item.genre} size={96} />
                    <span>写真未登録（{item.genre}）</span>
                  </div>
                )}
                <span className={`status-pill ${info.status}`}>{info.label}</span>
              </div>

              <div className="stock-body">
                <div>
                  <span className="genre-pill">{item.genre}</span>
                </div>
                <h3 className="stock-name">{item.name}</h3>
                <div className="stock-meta">
                  <div>
                    <strong>賞味期限:</strong> {formatJapaneseDate(item.expiryDate)}
                  </div>
                  <div>
                    <strong>リマインド予定:</strong> {formatJapaneseDate(info.reminderDate)}
                  </div>
                  <div>
                    <strong>数量:</strong> {item.quantity} {item.unit}
                  </div>
                  {item.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <MapPin size={14} />
                      <span>保管場所: {item.location}</span>
                    </div>
                  )}
                  {item.memo && (
                    <div style={{ color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      📝 {item.memo}
                    </div>
                  )}
                </div>

                <div className="stock-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${info.status === 'safe' ? 'btn-secondary' : 'btn-warn'}`}
                    onClick={() => openRotateModal(item)}
                    title="消費して新しい賞味期限に更新"
                  >
                    <RefreshCw size={15} />
                    入れ替え
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadReminderIcs(item)}
                    title="リマインド日をカレンダー(.ics)に保存"
                  >
                    <CalendarPlus size={15} />
                    予定保存
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(item)}
                    aria-label={`${item.name}を編集`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => {
                      if (confirm(`「${item.name}」を削除しますか？`)) {
                        onDeleteStock(item.id);
                      }
                    }}
                    aria-label={`${item.name}を削除`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 登録・編集モーダル */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? '備蓄品を編集' : '備蓄品を登録'}</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsModalOpen(false)}
                aria-label="閉じる"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="stock-name">
                  名称 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="stock-name"
                  type="text"
                  className="input"
                  required
                  placeholder="例：保存水 2L、さば味噌煮缶"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stock-genre">
                  ジャンル
                </label>
                <select
                  id="stock-genre"
                  className="select"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as StockGenre)}
                >
                  {STOCK_GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <span className="form-label">外観（写真で撮影・選択）</span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    カメラで撮影
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={16} />
                    画像を選ぶ
                  </button>
                  {photoDataUrl && (
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => setPhotoDataUrl(undefined)}
                    >
                      写真を削除
                    </button>
                  )}
                </div>
                {photoLoading && <div className="form-hint">画像を処理中...</div>}
                {photoDataUrl && (
                  <img
                    src={photoDataUrl}
                    alt="プレビュー"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stock-expiry">
                  賞味期限 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="stock-expiry"
                  type="date"
                  className="input"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                {previewReminder && (
                  <div className="form-hint" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    🔔 リマインド通知日（半年前の月の1日）：{formatJapaneseDate(previewReminder)}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="stock-qty">
                    数量
                  </label>
                  <input
                    id="stock-qty"
                    type="number"
                    min={1}
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="stock-unit">
                    単位
                  </label>
                  <input
                    id="stock-unit"
                    type="text"
                    className="input"
                    placeholder="個 / 本 / 缶 / 箱"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stock-location">
                  保管場所（候補から選択 または フリー入力）
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {STORAGE_LOCATIONS.map((loc) => {
                    const isSelected = location === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setLocation(loc)}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
                <input
                  id="stock-location"
                  type="text"
                  className="input"
                  placeholder="上のボタンから選ぶか、自由に入力（例：パントリー2段目）"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="stock-memo">
                  メモ
                </label>
                <textarea
                  id="stock-memo"
                  rows={2}
                  className="textarea"
                  placeholder="例：災害時はそのまま食べられる"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
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

      {/* ローテート（入れ替え）モーダル */}
      {rotatingItem && (
        <div className="modal-backdrop" onClick={() => setRotatingItem(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">ストックを入れ替える（ローテート）</h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRotatingItem(null)}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ marginTop: 0 }}>
              <strong>{rotatingItem.name}</strong> を消費して、新しく購入した商品の賞味期限に更新します。
            </p>
            <form onSubmit={handleRotateConfirm}>
              <div className="form-group">
                <label className="form-label" htmlFor="rotate-expiry">
                  新しい賞味期限
                </label>
                <input
                  id="rotate-expiry"
                  type="date"
                  className="input"
                  required
                  value={rotateNewExpiry}
                  onChange={(e) => setRotateNewExpiry(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addMonthsToDate(6)}
                  >
                    +6ヶ月
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addMonthsToDate(12)}
                  >
                    +1年
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addMonthsToDate(36)}
                  >
                    +3年
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addMonthsToDate(60)}
                  >
                    +5年
                  </button>
                </div>
                {rotateNewExpiry && (
                  <div className="form-hint" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    新しいリマインド日：{formatJapaneseDate(getReminderDateStr(rotateNewExpiry))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rotate-qty">
                  数量（{rotatingItem.unit}）
                </label>
                <input
                  id="rotate-qty"
                  type="number"
                  min={1}
                  className="input"
                  value={rotateNewQty}
                  onChange={(e) => setRotateNewQty(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRotatingItem(null)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  <RefreshCw size={16} />
                  入れ替えを完了
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
