// Derived view data — a typed port of the prototype's renderVals() math.
// Pure functions only: components call these, then translate labels with
// STR/enumLabel themselves at render time.

import { INSTRUMENTS, gap, goalDaysFor, hhmm, money, nySession, perPointFor, planRow, tkSession, tzMin, CME_TZ } from './logic';
import type { Account, AppState, Plan, Trade, TradeSnapshot } from './types';
import type { StrKey } from './i18n';

export function getPlan(state: AppState): Plan | null {
  return state.plans.find((p) => p.id === state.activeId) || null;
}

export function getRowToday(state: AppState) {
  const p = getPlan(state);
  return p ? planRow(p, state.day, state.day) : null;
}

// ── market sessions ─────────────────────────────────────────────────────
export interface SessionView {
  name: 'newYorkRth' | 'tokyo';
  open: boolean;
  window: string; // translated with tYourTime()
  src: string;
  next: string; // 'opensMonday' key OR a gap string to feed tOpensIn/tClosesIn
  nextIsOpensClose: 'opens' | 'closes' | 'weekend';
}

export function getSessions(now: Date): SessionView[] {
  const ny = nySession(now);
  const tk = tkSession(now);
  const toView = (name: 'newYorkRth' | 'tokyo', s: ReturnType<typeof nySession>): SessionView => ({
    name, open: s.open, window: s.window, src: s.src,
    next: s.nextIsWeekend ? '' : s.next,
    nextIsOpensClose: s.nextIsWeekend ? 'weekend' : s.open ? 'closes' : 'opens',
  });
  return [toView('newYorkRth', ny), toView('tokyo', tk)];
}

export function getLocalZone(): string {
  return (Intl.DateTimeFormat().resolvedOptions().timeZone || 'local').split('/').pop()!.replace(/_/g, ' ');
}
export function getLocalClock(now: Date): string {
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
export function getCmeNoteParts(now: Date): { reset: string; nowStr: string } {
  const cme = tzMin(CME_TZ, now);
  return { reset: hhmm(1020), nowStr: hhmm(cme.min) };
}

// ── dashboard stats ─────────────────────────────────────────────────────
export function getWinRate(state: AppState): number | null {
  const closed = state.trades.filter((t) => t.result !== 'BE').length;
  const wins = state.trades.filter((t) => t.pnl > 0).length;
  return closed ? Math.round((wins / closed) * 100) : null;
}
export function getAvgR(state: AppState): number | null {
  const closed = state.trades.filter((t) => t.result !== 'BE').length;
  const wins = state.trades.filter((t) => t.pnl > 0).length;
  return closed ? (wins * 2 - (closed - wins)) / closed : null;
}

export function getEquityCurve(state: AppState, plan: Plan | null): { projPath: string; realPath: string } {
  if (!plan) return { projPath: '', realPath: '' };
  const N = 30;
  const maxCap = plan.capital * Math.pow(1 + plan.win / 100, N - 1);
  const y = (v: number) => 119 - (v / maxCap) * 112;
  const x = (i: number) => (i / (N - 1)) * 338 + 1;
  const projPath = Array.from({ length: N }, (_, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(plan.capital * Math.pow(1 + plan.win / 100, i)).toFixed(1)).join(' ');

  const pts = [plan.capital];
  const events = state.trades
    .map((t) => ({ at: t.time, v: t.pnl }))
    .concat(state.moves.filter((m) => m.planId === plan.id).map((m) => ({ at: m.time, v: m.signed })))
    .sort((a, b) => a.at - b.at);
  events.forEach((ev) => pts.push(pts[pts.length - 1] + ev.v));
  let realPath = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  if (pts.length === 1) realPath = `M${x(0).toFixed(1)} ${y(pts[0]).toFixed(1)} L${x(0.4).toFixed(1)} ${y(pts[0]).toFixed(1)}`;
  return { projPath, realPath };
}

export interface TradeRow { id: string; instrument: string; side: string; meta: { day: number; zone: string; result: string }; pnl: number; account: Account; planId: string | null; }

export function tradeRow(t: Trade): TradeRow {
  return { id: t.id, instrument: t.instrument, side: t.side, meta: { day: t.day, zone: t.zone, result: t.result }, pnl: t.pnl, account: t.account, planId: t.planId };
}

// ── trades tab scoping ──────────────────────────────────────────────────
export function getAccountPlans(state: AppState, account: Account): Plan[] {
  return state.plans.filter((p) => p.account === account);
}
export function getSelectedTradePlan(state: AppState, account: Account): Plan | null {
  const list = getAccountPlans(state, account);
  return list.find((p) => p.id === state.tradePlanId) || list[0] || null;
}
export function getAccountTrades(state: AppState, account: Account): Trade[] {
  const plan = getSelectedTradePlan(state, account);
  if (!plan) return [];
  return state.trades.filter((t) => t.account === account && (!t.planId || t.planId === plan.id));
}

// ── plan tab / pick sheet ───────────────────────────────────────────────
export function getPickAccount(state: AppState): Account {
  if (state.pickAcct) return state.pickAcct;
  const p = getPlan(state);
  return p ? p.account : 'Funded';
}
export function getPickList(state: AppState): Plan[] {
  return state.plans.filter((p) => p.account === getPickAccount(state));
}
export function getPickSelected(state: AppState): Plan | null {
  const list = getPickList(state);
  return list.find((p) => p.id === state.pickPlan) || list[0] || null;
}

// ── trade-flow math ─────────────────────────────────────────────────────
export function getGeneralTrend(s: TradeSnapshot): 'Bullish' | 'Bearish' | 'Mixed' {
  const trends = [s.t1d, s.t1h, s.t15];
  const bull = trends.filter((t) => t === 'Bullish').length;
  const bear = trends.filter((t) => t === 'Bearish').length;
  return bull > bear ? 'Bullish' : bear > bull ? 'Bearish' : 'Mixed';
}
export function getSide(general: 'Bullish' | 'Bearish' | 'Mixed'): 'BUY' | 'SELL' {
  return general === 'Bearish' ? 'SELL' : 'BUY';
}
export function getConfidencePct(s: TradeSnapshot): number {
  const conf = 50
    + (s.strength === 'High' ? 25 : s.strength === 'Medium' ? 12 : 0)
    + (s.vaMatch === 'Yes' ? 10 : 0)
    + (s.cvd3m !== 'None' ? 15 : 0);
  return Math.min(95, conf);
}

export function getTpHintKey(s: TradeSnapshot, side: 'BUY' | 'SELL'): StrKey {
  if (s.divZone === 'VAL') return 'poc5mUpper';
  if (s.divZone === 'VAH') return 'poc5mLower';
  return side === 'BUY' ? 'vah5mUpper' : 'val5mLower';
}
export function getSlHintKey(s: TradeSnapshot): StrKey {
  if (s.divZone === 'VAH') return 'highestLiquidityZone';
  if (s.divZone === 'POC 5m') return 'nearestLiquidityZone';
  return 'lowestLiquidityZone';
}

export function getRR(reg: { entry: string; sl: string; tp: string }): string {
  const nEntry = parseFloat(reg.entry), nSl = parseFloat(reg.sl), nTp = parseFloat(reg.tp);
  const riskDist = Math.abs(nEntry - nSl), rewardDist = Math.abs(nTp - nEntry);
  return riskDist > 0 ? '1:' + (rewardDist / riskDist).toFixed(1).replace('.0', '') : '—';
}

export function getContracts(row: { risk: number } | null, reg: { entry: string; sl: string }, instrument: AppState['instrument']): number {
  const riskDist = Math.abs(parseFloat(reg.entry) - parseFloat(reg.sl));
  if (!row || !(riskDist > 0)) return 1;
  return Math.max(1, Math.floor(row.risk / (riskDist * perPointFor(instrument))));
}

export function getPnlPreview(s: TradeSnapshot, reg: { manualPnl: string }, row: { tp: number; risk: number } | null): number {
  const mp = parseFloat(reg.manualPnl);
  const basePnl = s.result === 'Profit' ? (row ? row.tp : 0) : s.result === 'Lose' ? -(row ? row.risk : 0) : 0;
  if (isNaN(mp)) return basePnl;
  return s.result === 'Lose' ? -Math.abs(mp) : s.result === 'Profit' ? Math.abs(mp) : mp;
}

// ── new-plan sheet preview ──────────────────────────────────────────────
export function getNewPlanPreview(f: AppState['f']) {
  const cap = parseFloat(f.fCapital) || 0;
  const win = parseFloat(f.fWin) || 0;
  const loss = parseFloat(f.fLoss) || 0;
  const goalVal = parseFloat(f.fGoal) || 0;
  return {
    tp: (cap * win) / 100,
    risk: (cap * loss) / 100,
    days: goalDaysFor(cap, win, goalVal),
  };
}

export { INSTRUMENTS, money, gap };
