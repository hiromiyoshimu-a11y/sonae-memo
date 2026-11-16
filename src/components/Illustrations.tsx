import React from 'react';
import { ChecklistCategory, StockGenre } from '../types';

/** ヘッダー用：おうちと若葉のロゴイラスト */
export const BrandHomeIllustration: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#FDF8F2" fillOpacity="0.95" />
    <path
      d="M14 31L32 16L50 31V49C50 50.6569 48.6569 52 47 52H17C15.3431 52 14 50.6569 14 49V31Z"
      fill="#F4E4D4"
      stroke="#4A8B7C"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M10 33L32 14L54 33"
      stroke="#E07A5F"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 45C32 45 25 40.5 25 35.5C25 32.8 27.1 31 29.3 31C30.7 31 31.6 31.8 32 32.6C32.4 31.8 33.3 31 34.7 31C36.9 31 39 32.8 39 35.5C39 40.5 32 45 32 45Z"
      fill="#E07A5F"
    />
  </svg>
);

/** バナー用：パントリー・備蓄品イラスト */
export const PantryHeroIllustration: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="54" fill="#EBF5F2" />
    {/* 棚 */}
    <rect x="20" y="90" width="80" height="7" rx="3.5" fill="#C9A88A" />
    {/* 水ボトル */}
    <rect x="28" y="45" width="20" height="45" rx="6" fill="#A8DADC" stroke="#457B9D" strokeWidth="2.2" />
    <rect x="33" y="38" width="10" height="7" rx="2" fill="#457B9D" />
    <rect x="28" y="60" width="20" height="14" fill="#FFFFFF" fillOpacity="0.7" />
    {/* 缶詰 */}
    <rect x="54" y="60" width="24" height="30" rx="4" fill="#F4A261" stroke="#B55D28" strokeWidth="2.2" />
    <ellipse cx="66" cy="60" rx="12" ry="3.5" fill="#FCE3C8" stroke="#B55D28" strokeWidth="2" />
    <circle cx="66" cy="75" r="5" fill="#FFFFFF" fillOpacity="0.8" />
    {/* パック・箱 */}
    <rect x="82" y="52" width="16" height="38" rx="4" fill="#E9C46A" stroke="#9C7A22" strokeWidth="2.2" />
    <path d="M82 62H98" stroke="#9C7A22" strokeWidth="2" />
    {/* キラキラ */}
    <path d="M92 26L94 31L99 33L94 35L92 40L90 35L85 33L90 31L92 26Z" fill="#E07A5F" />
    <circle cx="28" cy="28" r="3" fill="#81B29A" />
  </svg>
);

/** 持ち出し袋用：おしゃれなリュックイラスト */
export const BackpackHeroIllustration: React.FC<{ size?: number }> = ({ size = 88 }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" fill="none" aria-hidden="true">
    <circle cx="55" cy="55" r="50" fill="#FDF0EB" />
    {/* 持ち手 */}
    <path d="M43 27C43 20 67 20 67 27" stroke="#B55D28" strokeWidth="4" strokeLinecap="round" />
    {/* リュック本体 */}
    <rect x="30" y="28" width="50" height="60" rx="18" fill="#E07A5F" stroke="#9E4731" strokeWidth="2.5" />
    {/* フタ */}
    <path d="M30 46C30 34 38 28 55 28C72 28 80 34 80 46V51H30V46Z" fill="#F29E85" stroke="#9E4731" strokeWidth="2.5" />
    {/* 前ポケット */}
    <rect x="37" y="59" width="36" height="22" rx="8" fill="#FDF8F2" stroke="#9E4731" strokeWidth="2.2" />
    <path d="M45 66H65" stroke="#E07A5F" strokeWidth="2.5" strokeLinecap="round" />
    {/* バックル */}
    <rect x="51" y="47" width="8" height="7" rx="2" fill="#E9C46A" stroke="#9E4731" strokeWidth="1.8" />
    {/* 葉っぱ */}
    <path d="M84 26C89 26 92 30 92 34C87 34 84 31 84 26Z" fill="#81B29A" />
  </svg>
);

/** チェックリスト用：クリップボード＆お花イラスト */
export const ChecklistHeroIllustration: React.FC<{ size?: number }> = ({ size = 84 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#EFF6F0" />
    <rect x="27" y="22" width="46" height="58" rx="8" fill="#FFFFFF" stroke="#4A8B7C" strokeWidth="2.5" />
    <rect x="40" y="16" width="20" height="10" rx="4" fill="#F4A261" stroke="#4A8B7C" strokeWidth="2" />
    <path d="M36 40L40 44L47 36" stroke="#E07A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 40H65" stroke="#84A99E" strokeWidth="3" strokeLinecap="round" />
    <path d="M36 54L40 58L47 50" stroke="#E07A5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 54H65" stroke="#84A99E" strokeWidth="3" strokeLinecap="round" />
    <circle cx="39" cy="68" r="3" stroke="#84A99E" strokeWidth="2" />
    <path d="M52 68H63" stroke="#C5D9D3" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** 備蓄品ジャンルごとの可愛いプレースホルダーイラスト */
export const GenreIllustration: React.FC<{ genre: StockGenre; size?: number }> = ({
  genre,
  size = 86,
}) => {
  switch (genre) {
    case '飲料水':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#E3F2F8" />
          <rect x="35" y="25" width="26" height="50" rx="8" fill="#90D5EC" stroke="#3D7A96" strokeWidth="2.4" />
          <rect x="42" y="18" width="12" height="7" rx="2" fill="#3D7A96" />
          <rect x="35" y="43" width="26" height="15" fill="#FFFFFF" fillOpacity="0.85" />
          <path d="M48 46C48 46 43 51 43 54C43 56.8 45.2 59 48 59C50.8 59 53 56.8 53 54C53 51 48 46 48 46Z" fill="#5AB4D6" />
        </svg>
      );
    case '主食・レトルト':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#FDF3E7" />
          {/* おにぎり / ご飯 */}
          <path
            d="M48 24C57 24 72 52 70 64C68 71 58 72 48 72C38 72 28 71 26 64C24 52 39 24 48 24Z"
            fill="#FFFFFF"
            stroke="#8D6E63"
            strokeWidth="2.4"
          />
          <rect x="38" y="55" width="20" height="17" rx="3" fill="#4E5D52" />
          <circle cx="42" cy="44" r="2" fill="#8D6E63" />
          <circle cx="54" cy="44" r="2" fill="#8D6E63" />
          <path d="M45 48C46.5 50 49.5 50 51 48" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case '缶詰・おかず':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#FDECE6" />
          <rect x="27" y="34" width="42" height="38" rx="6" fill="#F4A261" stroke="#9C4D27" strokeWidth="2.4" />
          <ellipse cx="48" cy="34" rx="21" ry="6" fill="#FCE5CD" stroke="#9C4D27" strokeWidth="2.2" />
          <rect x="27" y="45" width="42" height="16" fill="#FFFFFF" fillOpacity="0.88" />
          <ellipse cx="48" cy="53" rx="9" ry="5" fill="#E07A5F" />
          <path d="M57 53L63 49V57L57 53Z" fill="#E07A5F" />
        </svg>
      );
    case 'お菓子・栄養補助':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#FEF5E4" />
          <circle cx="48" cy="49" r="22" fill="#E9B872" stroke="#8C5A2B" strokeWidth="2.4" />
          <circle cx="40" cy="43" r="3" fill="#6D4123" />
          <circle cx="54" cy="41" r="2.5" fill="#6D4123" />
          <circle cx="45" cy="56" r="3" fill="#6D4123" />
          <circle cx="57" cy="54" r="2.8" fill="#6D4123" />
        </svg>
      );
    case '日用品・衛生':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#EAF5EF" />
          <rect x="28" y="32" width="36" height="36" rx="6" fill="#FFFFFF" stroke="#4A8B7C" strokeWidth="2.4" />
          <ellipse cx="46" cy="32" rx="18" ry="6" fill="#E2EFEA" stroke="#4A8B7C" strokeWidth="2.2" />
          <ellipse cx="46" cy="32" rx="6" ry="2.2" fill="#4A8B7C" />
          <path d="M64 42H70C72 42 73 44 73 47V64C73 66 71 68 68 68H64" fill="#FFFFFF" stroke="#4A8B7C" strokeWidth="2.2" />
        </svg>
      );
    case '医薬品・救急':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#FCEAEA" />
          <path d="M40 31V26C40 24.3 41.3 23 43 23H53C54.7 23 56 24.3 56 26V31" stroke="#C05656" strokeWidth="2.4" />
          <rect x="24" y="31" width="48" height="38" rx="8" fill="#FFFFFF" stroke="#C05656" strokeWidth="2.4" />
          <rect x="44" y="40" width="8" height="20" rx="2" fill="#E07A5F" />
          <rect x="38" y="46" width="20" height="8" rx="2" fill="#E07A5F" />
        </svg>
      );
    case '燃料・電池':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#FFF7DF" />
          <path d="M36 28C36 21 60 21 60 28" stroke="#9C7A22" strokeWidth="2.4" />
          <rect x="33" y="32" width="30" height="36" rx="6" fill="#F4D35E" stroke="#9C7A22" strokeWidth="2.4" />
          <rect x="38" y="40" width="20" height="18" rx="4" fill="#FFFDF5" />
          <circle cx="48" cy="49" r="5" fill="#F4A261" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#F1EEF8" />
          <rect x="27" y="33" width="42" height="36" rx="7" fill="#D4C6E8" stroke="#6E5B8E" strokeWidth="2.4" />
          <path d="M27 44H69" stroke="#6E5B8E" strokeWidth="2.2" />
          <path d="M48 33V69" stroke="#6E5B8E" strokeWidth="2.2" />
        </svg>
      );
  }
};

/** チェックリストカテゴリ用のミニバッジアイコン */
export const CategoryEmojiBadge: React.FC<{ category: ChecklistCategory }> = ({ category }) => {
  const map: Record<ChecklistCategory, { bg: string; icon: string }> = {
    '飲料・食料': { bg: '#FEF3E2', icon: '🍙' },
    '衛生・トイレ': { bg: '#E6F4F0', icon: '🧻' },
    '救急・常備薬': { bg: '#FCEAEA', icon: '🩹' },
    '情報・電源・明かり': { bg: '#FFF7DB', icon: '🔦' },
    '防寒・安全・工具': { bg: '#EAF0F8', icon: '🧤' },
    '貴重品・その他': { bg: '#F2ECFA', icon: '👛' },
    '乳幼児・高齢者・ペット': { bg: '#FCECF2', icon: '🐾' },
  };
  const info = map[category];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        borderRadius: '10px',
        background: info.bg,
        fontSize: '1.15rem',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {info.icon}
    </span>
  );
};
