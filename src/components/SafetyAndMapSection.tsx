import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  Edit3,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { MeetingPoint } from '../types';
import { SafetyHeroIllustration } from './Illustrations';

interface Props {
  meetingPoints: MeetingPoint[];
  safetyNote: string;
  onSaveMeetingPoint: (mp: MeetingPoint) => Promise<void>;
  onDeleteMeetingPoint: (id: string) => Promise<void>;
  onChangeSafetyNote: (note: string) => void;
}

interface PlaceCandidate {
  id: string;
  label: string;
  source: '施設・地名' | '住所';
  lat: number;
  lng: number;
}

interface GsiSearchFeature {
  geometry: { coordinates: [number, number] }; // [lng, lat]
  properties: { title: string };
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

const CARRIER_BOARDS = [
  {
    name: 'NTT 災害用伝言ダイヤル（171）',
    badge: '固定・携帯から通話',
    desc: '「171」に発信し、録音は「1」、再生は「2」を押して自宅等の電話番号を入力します。毎月1日・15日などに体験利用可能。',
    infoUrl: 'https://www.ntt-east.co.jp/saigai/voice171/',
    tel: 'tel:171',
  },
  {
    name: 'NTT 災害用伝言板（web171）',
    badge: '全キャリア・PC対応',
    desc: 'インターネットから電話番号で安否を登録・確認できます。平時は体験利用が可能です。',
    infoUrl: 'https://www.web171.jp/',
  },
  {
    name: 'NTTドコモ 災害用伝言板',
    badge: 'docomo / ahamo',
    desc: '震度6弱以上の災害時などに稼働。事前に「災害用キット」アプリやMy docomoからも確認できます。',
    infoUrl: 'https://www.docomo.ne.jp/info/disaster/disaster_board/index.html',
    directUrl: 'http://dengon.docomo.ne.jp/top.cgi',
  },
  {
    name: 'au 災害用伝言板',
    badge: 'au / UQ / povo',
    desc: '大規模災害発生時に安否情報の登録・確認が可能。登録した安否情報をメールで自動通知する設定も可能です。',
    infoUrl: 'https://www.au.com/mobile/anti-disaster/saigai-dengon/',
    directUrl: 'http://dengon.ezweb.ne.jp/',
  },
  {
    name: 'ソフトバンク 災害用伝言板',
    badge: 'SoftBank / Y!mobile / LINEMO',
    desc: '大規模災害発生時にブラウザやアプリから安否登録・検索ができます。',
    infoUrl: 'https://www.softbank.jp/mobile/service/dengon/',
    directUrl: 'http://dengon.softbank.ne.jp/',
  },
  {
    name: 'J-ANPI（安否情報まとめて検索）',
    badge: '横断検索',
    desc: '携帯各社の災害用伝言板やweb171、報道機関の安否情報を氏名や電話番号でまとめて検索できます。',
    infoUrl: 'https://anpi.jp/',
  },
];

type HazardKey = 'flood' | 'landslide' | 'tsunami' | 'hightide';

const HAZARD_LAYERS: Record<HazardKey, { label: string; urls: string[] }> = {
  flood: {
    label: '🌊 洪水浸水想定（想定最大規模）',
    urls: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
  },
  landslide: {
    label: '⛰️ 土砂災害警戒区域（急傾斜地・土石流）',
    urls: [
      'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
      'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
    ],
  },
  tsunami: {
    label: '🌊 津波浸水想定',
    urls: ['https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'],
  },
  hightide: {
    label: '🌀 高潮浸水想定',
    urls: ['https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png'],
  },
};

export const SafetyAndMapSection: React.FC<Props> = ({
  meetingPoints,
  safetyNote,
  onSaveMeetingPoint,
  onDeleteMeetingPoint,
  onChangeSafetyNote,
}) => {
  const [selectedPointId, setSelectedPointId] = useState<string>(meetingPoints[0]?.id || '');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MeetingPoint | null>(null);
  const [mpName, setMpName] = useState('');
  const [mpAddress, setMpAddress] = useState('');
  const [mpLat, setMpLat] = useState<number>(35.681236); // 東京駅デフォルト
  const [mpLng, setMpLng] = useState<number>(139.767125);
  const [mpRule, setMpRule] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Hazard layers toggle
  const [activeHazards, setActiveHazards] = useState<Record<HazardKey, boolean>>({
    flood: true,
    landslide: true,
    tsunami: false,
    hightide: false,
  });

  const activePoint = useMemo(
    () => meetingPoints.find((m) => m.id === selectedPointId) || meetingPoints[0] || null,
    [meetingPoints, selectedPointId]
  );

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const hazardLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const mapLat = activePoint ? activePoint.lat : 35.681236;
  const mapLng = activePoint ? activePoint.lng : 139.767125;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [mapLat, mapLng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      maxZoom: 18,
    }).addTo(map);

    hazardLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      hazardLayerGroupRef.current = null;
    };
  }, []);

  // Update map center & marker when activePoint changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([mapLat, mapLng], 15);

    if (markerRef.current) {
      markerRef.current.remove();
    }
    if (activePoint) {
      markerRef.current = L.circleMarker([activePoint.lat, activePoint.lng], {
        radius: 10,
        color: '#ffffff',
        weight: 3,
        fillColor: '#e07a5f',
        fillOpacity: 1,
      })
        .bindPopup(`<strong>${activePoint.name}</strong><br/>${activePoint.address}`)
        .addTo(map)
        .openPopup();
    }
  }, [mapLat, mapLng, activePoint]);

  // Update hazard map tile layers when toggles change
  useEffect(() => {
    const group = hazardLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    (Object.keys(HAZARD_LAYERS) as HazardKey[]).forEach((key) => {
      if (!activeHazards[key]) return;
      for (const url of HAZARD_LAYERS[key].urls) {
        L.tileLayer(url, {
          opacity: 0.65,
          maxNativeZoom: 17,
          maxZoom: 18,
          attribution: '<a href="https://disaportal.gsi.go.jp/" target="_blank">重ねるハザードマップ</a>',
        }).addTo(group);
      }
    });
  }, [activeHazards]);

  const handleAddressSearch = async () => {
    const q = mpAddress.trim();
    if (!q) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    try {
      const [nomRes, gsiRes] = await Promise.allSettled([
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&accept-language=ja&countrycodes=jp&limit=6&q=${encodeURIComponent(q)}`
        ),
        fetch(
          `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`
        ),
      ]);

      const candidates: PlaceCandidate[] = [];

      if (nomRes.status === 'fulfilled' && nomRes.value.ok) {
        const nomData = (await nomRes.value.json()) as NominatimItem[];
        for (const item of nomData) {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
          // display_name を読みやすく整形（日本、郵便番号などを後ろから整理）
          const parts = item.display_name
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s && s !== '日本' && !/^\d{3}-\d{4}$/.test(s));
          const shortLabel = parts.reverse().join(' ');
          candidates.push({
            id: `nom-${item.place_id}`,
            label: shortLabel || item.display_name,
            source: '施設・地名',
            lat,
            lng,
          });
        }
      }

      if (gsiRes.status === 'fulfilled' && gsiRes.value.ok) {
        const gsiData = (await gsiRes.value.json()) as GsiSearchFeature[];
        for (let i = 0; i < Math.min(gsiData.length, 5); i++) {
          const feat = gsiData[i];
          const [lng, lat] = feat.geometry.coordinates;
          // 検索語と全く関係ない北海道の地名などが先頭に出るケースを避け、住所として追加
          candidates.push({
            id: `gsi-${i}-${feat.properties.title}`,
            label: feat.properties.title,
            source: '住所',
            lat,
            lng,
          });
        }
      }

      if (candidates.length === 0) {
        setSearchError('候補が見つかりませんでした。市区町村名や駅名・学校名などを入れてみてください。');
      } else {
        setSearchResults(candidates);
        setMpLat(candidates[0].lat);
        setMpLng(candidates[0].lng);
      }
    } catch {
      setSearchError('場所の検索に接続できませんでした（オフラインの可能性があります）。');
    } finally {
      setSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('この端末・ブラウザは位置情報取得に対応していません。');
      return;
    }
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMpLat(Number(pos.coords.latitude.toFixed(6)));
        setMpLng(Number(pos.coords.longitude.toFixed(6)));
        if (!mpAddress.trim()) {
          setMpAddress('現在地周辺');
        }
        setSearching(false);
      },
      () => {
        setSearchError('現在地を取得できませんでした。位置情報の許可をご確認ください。');
        setSearching(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const openAddModal = () => {
    setEditingPoint(null);
    setMpName('');
    setMpAddress('');
    setMpLat(35.681236);
    setMpLng(139.767125);
    setMpRule('');
    setSearchResults([]);
    setSearchError('');
    setModalOpen(true);
  };

  const openEditModal = (mp: MeetingPoint) => {
    setEditingPoint(mp);
    setMpName(mp.name);
    setMpAddress(mp.address);
    setMpLat(mp.lat);
    setMpLng(mp.lng);
    setMpRule(mp.ruleMemo || '');
    setSearchResults([]);
    setSearchError('');
    setModalOpen(true);
  };

  const handleSavePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpName.trim()) return;
    const newId = editingPoint
      ? editingPoint.id
      : `mp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await onSaveMeetingPoint({
      id: newId,
      name: mpName.trim(),
      address: mpAddress.trim() || `${mpLat.toFixed(4)}, ${mpLng.toFixed(4)}`,
      lat: mpLat,
      lng: mpLng,
      ruleMemo: mpRule.trim() || undefined,
      createdAt: editingPoint ? editingPoint.createdAt : new Date().toISOString(),
    });
    setSelectedPointId(newId);
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="hero-banner" style={{ marginBottom: 0 }}>
        <div className="hero-banner-left">
          <SafetyHeroIllustration size={80} />
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>
              安否確認・集合場所・ハザードマップ
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              携帯各社の災害用伝言板と、家族の集合場所・周囲のハザードマップをまとめて確認できます
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          集合場所を登録
        </button>
      </div>

      {/* 集合場所メモ ＆ 地図・ハザードマップ */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.85rem',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={20} color="var(--accent)" />
            災害時の集合場所メモ & 周囲のハザードマップ
          </h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={openAddModal}>
            <Plus size={15} />
            場所を追加
          </button>
        </div>

        {meetingPoints.length > 0 && (
          <div className="bag-tabs">
            {meetingPoints.map((mp) => {
              const isActive = activePoint?.id === mp.id;
              return (
                <button
                  key={mp.id}
                  type="button"
                  className={`bag-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedPointId(mp.id)}
                >
                  <MapPin size={16} />
                  <span>{mp.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {activePoint ? (
          <div
            style={{
              background: 'var(--bg-page)',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              padding: '0.9rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.08rem' }}>{activePoint.name}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  📍 {activePoint.address}（緯度: {activePoint.lat.toFixed(4)}, 経度: {activePoint.lng.toFixed(4)}）
                </div>
                {activePoint.ruleMemo && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.92rem' }}>
                    📝 {activePoint.ruleMemo}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditModal(activePoint)}
                  aria-label="集合場所を編集"
                >
                  <Edit3 size={15} />
                  編集
                </button>
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => {
                    if (confirm(`集合場所「${activePoint.name}」を削除しますか？`)) {
                      onDeleteMeetingPoint(activePoint.id);
                    }
                  }}
                  aria-label="集合場所を削除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              <a
                href={`https://disaportal.gsi.go.jp/maps/?ll=${activePoint.lat},${activePoint.lng}&z=15`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={15} />
                国交省ハザードマップで開く
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activePoint.lat},${activePoint.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Navigation size={15} />
                Googleマップで経路を見る
              </a>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '1.2rem 0.5rem' }}>
            まだ集合場所が登録されていません（下の地図は東京駅周辺を表示中）。
            <br />
            「集合場所を登録」から自宅近くの小学校や公園を登録すると、自動で周囲の地図とハザードマップを表示します。
          </div>
        )}

        {/* ハザードマップ重ね合わせチェック */}
        <div
          style={{
            background: 'var(--primary-light)',
            borderRadius: '14px',
            padding: '0.75rem 0.9rem',
            marginBottom: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Layers size={16} />
            地図に重ねるハザードマップ（自動取得）
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {(Object.keys(HAZARD_LAYERS) as HazardKey[]).map((key) => (
              <label
                key={key}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}
              >
                <input
                  type="checkbox"
                  checked={activeHazards[key]}
                  onChange={() =>
                    setActiveHazards((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  style={{ width: '1.15rem', height: '1.15rem', accentColor: 'var(--primary)' }}
                />
                {HAZARD_LAYERS[key].label}
              </label>
            ))}
          </div>
        </div>

        {/* 地図本体 */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '360px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1.5px solid var(--border)',
            zIndex: 1,
          }}
        />
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
          ※ 地図・ハザード情報は国土地理院「地理院タイル」および国土交通省「重ねるハザードマップ」のオープンデータから自動取得しています。浸水の色が濃い場所ほど想定水深が深くなります（黄: 0.5m未満 / 桃: 0.5〜3m / 赤〜紫: 3m以上）。
        </div>
      </section>

      {/* 携帯会社各社の災害用伝言板 */}
      <section className="card">
        <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Phone size={20} color="var(--primary)" />
          携帯各社の災害用伝言板・安否確認リンク
        </h3>
        <p style={{ margin: '0 0 0.9rem', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          災害発生時は電話が繋がりにくくなります。各社の伝言板や「171」「web171」をご活用ください（※直接アクセス用URLは災害発生時および体験利用日のみ稼働します）。
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.1rem',
          }}
        >
          {CARRIER_BOARDS.map((board) => (
            <div
              key={board.name}
              style={{
                border: '1.5px solid var(--border)',
                borderRadius: '16px',
                padding: '0.9rem',
                background: 'var(--bg-page)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div>
                <span className="genre-pill">{board.badge}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>{board.name}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', flex: 1 }}>
                {board.desc}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                {board.tel && (
                  <a href={board.tel} className="btn btn-primary btn-sm">
                    <Phone size={14} />
                    171に発信
                  </a>
                )}
                <a
                  href={board.infoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} />
                  公式案内を開く
                </a>
                {board.directUrl && (
                  <a
                    href={board.directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-warn btn-sm"
                  >
                    <ExternalLink size={14} />
                    伝言板(災害時)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 家族の安否確認メモ */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="family-safety-note">
            家族の安否確認ルール・登録電話番号メモ（自動保存）
          </label>
          <textarea
            id="family-safety-note"
            rows={3}
            className="textarea"
            placeholder="例：171やweb171で登録する基準番号は「090-XXXX-XXXX」（母の番号）。合言葉は「〇〇」。"
            value={safetyNote}
            onChange={(e) => onChangeSafetyNote(e.target.value)}
          />
        </div>
      </section>

      {/* 集合場所登録モーダル */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Compass size={20} style={{ verticalAlign: 'text-bottom', marginRight: '0.35rem' }} />
                {editingPoint ? '集合場所を編集' : '災害時の集合場所を登録'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePoint}>
              <div className="form-group">
                <label className="form-label" htmlFor="mp-name">
                  集合場所の名前 <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="mp-name"
                  type="text"
                  className="input"
                  required
                  placeholder="例：第1集合場所（〇〇小学校）、〇〇公園"
                  value={mpName}
                  onChange={(e) => setMpName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mp-address">
                  住所・施設名（入力して検索すると地図・ハザードを自動取得）
                </label>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <input
                    id="mp-address"
                    type="text"
                    className="input"
                    style={{ flex: '1 1 200px' }}
                    placeholder="例：渋谷区宇田川町、〇〇市〇〇小学校"
                    value={mpAddress}
                    onChange={(e) => setMpAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddressSearch}
                    disabled={searching}
                  >
                    <Search size={15} />
                    {searching ? '検索中...' : '場所を検索'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleUseCurrentLocation}
                    disabled={searching}
                  >
                    <Navigation size={15} />
                    現在地
                  </button>
                </div>

                {searchError && (
                  <div className="form-hint" style={{ color: 'var(--danger)' }}>
                    {searchError}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      border: '1.5px solid var(--primary)',
                      borderRadius: '12px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      background: 'var(--bg-page)',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                      }}
                    >
                      候補をタップして場所を確定してください：
                    </div>
                    {searchResults.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => {
                          setMpAddress(cand.label);
                          setMpLat(cand.lat);
                          setMpLng(cand.lng);
                          setSearchResults([]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.45rem',
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.55rem 0.75rem',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.88rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '6px',
                            background: cand.source === '施設・地名' ? 'var(--accent-light)' : 'var(--primary-light)',
                            color: cand.source === '施設・地名' ? 'var(--accent)' : 'var(--primary)',
                            flexShrink: 0,
                          }}
                        >
                          {cand.source}
                        </span>
                        <span>{cand.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="form-hint">
                  選択中の座標：緯度 {mpLat.toFixed(5)} / 経度 {mpLng.toFixed(5)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mp-rule">
                  集合のルール・メモ（任意）
                </label>
                <textarea
                  id="mp-rule"
                  rows={2}
                  className="textarea"
                  placeholder="例：震度5強以上で学校に集合。連絡がつかない時は正門前の掲示板を確認。"
                  value={mpRule}
                  onChange={(e) => setMpRule(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  保存して地図を表示
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
