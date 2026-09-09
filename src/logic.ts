// Pure domain logic — market sessions, plan math, formatting.
// Ported 1:1 from the DeltraOS.dc.html prototype's Component class.

import type { Instrument, InstrumentCode, Plan } from './types';

export const CME_TZ = 'America/Chicago';
const NY = { tz: 'America/New_York', open: 570, close: 960, label: 'ET' };
const TK = { tz: 'Asia/Tokyo', open: 540, close: 900, label: 'JST' };

export const INSTRUMENTS: Instrument[] = [
  { code: 'MBT', name: 'Micro Bitcoin', perPoint: 0.1 },
  { code: 'MGC', name: 'Micro Gold', perPoint: 10 },
  { code: 'BTC', name: 'Bitcoin', perPoint: 5 },
  { code: 'BFF', name: 'Bitcoin Friday', perPoint: 0.02 },
  { code: 'GC', name: 'Gold', perPoint: 100 },
  { code: '1OZ', name: 'One Ounce Gold', perPoint: 1 },
];

export function perPointFor(code: InstrumentCode): number {
  return INSTRUMENTS.find((i) => i.code === code)?.perPoint ?? 10;
}

export function money(n: number): string {
  if (!isFinite(n)) return '$0.00';
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Minutes-of-day (0-1439) and weekday abbreviation for a date in a given IANA timezone. */
export function tzMin(tz: string, d: Date): { min: number; dow: string } {
  const p: Record<string, string> = {};
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false })
    .formatToParts(d)
    .forEach((x) => { p[x.type] = x.value; });
  return { min: (Number(p.hour) % 24) * 60 + Number(p.minute), dow: p.weekday };
}

export function hhmm(m: number): string {
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ap}`;
}

export function gap(mins: number): string {
  mins = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export interface SessionInfo {
  open: boolean;
  state: 'OPEN' | 'CLOSED';
  window: string;
  src: string;
  next: string;
  nextIsWeekend: boolean;
}

function sessionInfo(s: { tz: string; open: number; close: number; label: string }, now: Date): SessionInfo {
  const there = tzMin(s.tz, now);
  const here = now.getHours() * 60 + now.getMinutes();
  const delta = here - there.min;
  const weekend = there.dow === 'Sat' || there.dow === 'Sun';
  const open = !weekend && there.min >= s.open && there.min < s.close;
  const afterClose = there.min >= s.close;
  const nextIsWeekend = weekend || (there.dow === 'Fri' && afterClose);
  return {
    open,
    state: open ? 'OPEN' : 'CLOSED',
    window: `${hhmm(s.open + delta)}–${hhmm(s.close + delta)}`,
    src: `${hhmm(s.open)}–${hhmm(s.close)} ${s.label}`,
    next: nextIsWeekend ? '' : open ? gap(s.close - there.min) : gap(s.open - there.min),
    nextIsWeekend,
  };
}

export function nySession(now: Date): SessionInfo { return sessionInfo(NY, now); }
export function tkSession(now: Date): SessionInfo { return sessionInfo(TK, now); }

/** CME trading-day key (YYYY-MM-DD, rolling at 5:00 PM CT) for the given instant. */
export function sessionKey(d: Date): string {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: CME_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const base = new Date(ymd + 'T00:00:00Z');
  if (tzMin(CME_TZ, d).min >= 17 * 60) base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

export function goalDaysFor(capital: number, win: number, goal: number): number {
  if (!(goal > capital) || !(win > 0)) return 1;
  return Math.min(600, Math.ceil(Math.log(goal / capital) / Math.log(1 + win / 100)) + 1);
}

export interface PlanRow { day: number; cap: number; tp: number; risk: number }

/** A plan's capital/TP/risk on a given day of the current app-wide day counter. */
export function planRow(p: Plan, day: number, currentDay: number): PlanRow {
  const base = typeof p.dayBase === 'number' ? p.dayBase : p.capital;
  const cap = day >= currentDay
    ? base * Math.pow(1 + p.win / 100, day - currentDay)
    : p.capital * Math.pow(1 + p.win / 100, day - 1);
  return { day, cap, tp: (cap * p.win) / 100, risk: (cap * p.loss) / 100 };
}

/** Total rows in the plan's table: elapsed days plus the days still needed to reach goal. */
export function planDays(p: Plan, currentDay: number): number {
  const base = typeof p.dayBase === 'number' ? p.dayBase : p.capital;
  return Math.min(600, currentDay - 1 + goalDaysFor(base, p.win, p.goal));
}

export function aiPrompt(instrument: string): string {
  return (
    'Eres un analista de mercados especializado en instrumentos financieros. Necesito que realices una ' +
    `investigacion web actualizada sobre [${instrument}] siguiendo estos pasos: 1) Calendario economico de alto ` +
    'impacto hoy y los proximos 2-3 dias (hora Central). 2) Noticias de impacto de las ultimas 24-48h y su sesgo. ' +
    '3) Foros y sentimiento de traders y niveles que vigilan. 4) Sintesis del comportamiento esperado: volatilidad, ' +
    'rangos y catalizadores. 5) Probabilidad estimada de direccion intradia y a mediano plazo, aclarando que es un ' +
    'ejercicio probabilistico y no una prediccion garantizada.'
  );
}
