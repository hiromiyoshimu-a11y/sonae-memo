import { StockItem } from '../types';

/**
 * 賞味期限(YYYY-MM-DD)の半年(6ヶ月)前の月の1日を計算する
 * 例: 2027-05-20 -> 6ヶ月前は 2026-11-20 -> その月の1日は 2026-11-01
 * 例: 2026-08-31 -> 6ヶ月前は 2026-02-28(月末補正) -> その月の1日は 2026-02-01
 */
export function getReminderDateStr(expiryDateStr: string): string {
  const [yStr, mStr] = expiryDateStr.split('-');
  const year = Number(yStr);
  const month = Number(mStr); // 1-12
  if (!year || !month) return expiryDateStr;

  // 6ヶ月前を計算（1月始まりで計算）
  let targetMonth = month - 6;
  let targetYear = year;
  if (targetMonth <= 0) {
    targetMonth += 12;
    targetYear -= 1;
  }

  const mm = String(targetMonth).padStart(2, '0');
  return `${targetYear}-${mm}-01`;
}

export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type StockStatus = 'expired' | 'remind' | 'safe';

export interface StockStatusInfo {
  status: StockStatus;
  reminderDate: string;
  daysUntilExpiry: number;
  label: string;
}

export function getStockStatus(expiryDateStr: string, todayStr: string = getTodayStr()): StockStatusInfo {
  const reminderDate = getReminderDateStr(expiryDateStr);

  const todayTime = new Date(`${todayStr}T00:00:00`).getTime();
  const expiryTime = new Date(`${expiryDateStr}T00:00:00`).getTime();
  const daysUntilExpiry = Math.ceil((expiryTime - todayTime) / (1000 * 60 * 60 * 24));

  if (expiryDateStr < todayStr) {
    return {
      status: 'expired',
      reminderDate,
      daysUntilExpiry,
      label: `期限切れ (${Math.abs(daysUntilExpiry)}日超過)`,
    };
  }

  if (todayStr >= reminderDate) {
    return {
      status: 'remind',
      reminderDate,
      daysUntilExpiry,
      label: `リマインド中 (残り${daysUntilExpiry}日)`,
    };
  }

  return {
    status: 'safe',
    reminderDate,
    daysUntilExpiry,
    label: `期限まで余裕あり`,
  };
}

export function formatJapaneseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/**
 * リマインド予定日をカレンダー(.ics)ファイルとしてダウンロードする
 */
export function downloadReminderIcs(item: StockItem): void {
  const reminderDate = getReminderDateStr(item.expiryDate);
  const dtStart = reminderDate.replace(/-/g, '');
  // 翌日の日付
  const nextDay = new Date(`${reminderDate}T00:00:00`);
  nextDay.setDate(nextDay.getDate() + 1);
  const dtEnd = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, '0')}${String(
    nextDay.getDate()
  ).padStart(2, '0')}`;

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const summary = `【ローリングストック】${item.name} の入れ替え時期`;
  const description = `備蓄品「${item.name}」（ジャンル: ${item.genre} / 数量: ${item.quantity}${item.unit}）の賞味期限（${formatJapaneseDate(
    item.expiryDate
  )}）が約6ヶ月後に迫っています。日常生活で消費して新しいものと入れ替えましょう。`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SonaeMemo//RollingStock//JP',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${item.id}@sonae-memo`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'TRIGGER:PT9H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `remind-${item.name.replace(/[/\\?%*:|"<>]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
