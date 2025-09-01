// src/lib/date.js
// —— 本地时区安全的日期工具 ——
// 目标：避免 2025-08-29 被显示成 2025-08-28 的“时区回跳”问题。

/** 内部：把各种输入安全转成 Date（本地时区） */
function toDate(input) {
  if (input instanceof Date) return new Date(input.getTime());

  if (typeof input === 'string') {
    // 纯 YYYY-MM-DD 走本地构造，避免被当作 UTC
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    // 其它格式（带时间的 ISO 等）交给原生解析
  }
  return new Date(input);
}

/** 当天 00:00:00（本地时区） */
export function startOfDay(d) {
  const x = toDate(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 左侧补零 */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/** 把日期转成 YYYY-MM-DD（本地时区） */
export function toYMD(d) {
  const x = toDate(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

/** 解析 YYYY-MM-DD 为本地时区的日期对象（00:00） */
export function parseYMD(ymd) {
  return startOfDay(toDate(ymd));
}

/**
 * 按格式化输出（本地时区）
 * 例：format(new Date(), 'YYYY-MM-DD HH:mm')
 */
export function format(input, fmt) {
  const d = toDate(input);
  const map = {
    YYYY: d.getFullYear(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm/g, (k) => map[k]);
}

/** 加减天（返回新对象） */
export function addDays(d, days) {
  const x = toDate(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** 是否同一天（本地时区） */
export function isSameDay(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** 当月天数（本地时区） */
export function daysInMonth(d) {
  const x = toDate(d);
  return new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
}

/** 当月第一天（本地时区） */
export function startOfMonth(d) {
  const x = toDate(d);
  return new Date(x.getFullYear(), x.getMonth(), 1);
}

/** 当月最后一天（本地时区） */
export function endOfMonth(d) {
  const x = toDate(d);
  return new Date(x.getFullYear(), x.getMonth() + 1, 0);
}
