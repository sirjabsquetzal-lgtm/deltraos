// DeltraOS app store — reducer + localStorage persistence + context.
// A faithful, typed port of the Component class's state/handlers from the
// DeltraOS.dc.html prototype (dead/vestigial fields from its edit history
// dropped: `reaction`, `cvdDiv`, `liq1m`/`va1m`, the unused `capital` field,
// the removed manual session-start setting).

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type {
  Account, AppState, CapitalMovement, Dream, InstrumentCode, PickerKind, Plan, Screen, Tab, TradeSnapshot,
} from './types';
import { goalDaysFor, perPointFor, planRow, sessionKey } from './logic';

const STORAGE_KEY = 'deltraos:v1';

/** Resolves a public/why/ asset against the app's base path (root or a subpath like GitHub Pages). */
function dreamAsset(file: string): string {
  return import.meta.env.BASE_URL + 'why/' + file;
}

function defaultSnapshot(): TradeSnapshot {
  return {
    acct: 'Funded', eco: 'No', bias: 'Bullish',
    t1d: 'Bullish', s1d: 'Uptrend', z1d: 'Yes',
    t1h: 'Bullish', s1h: 'Pennant', z1h: 'Yes',
    t15: 'Bullish', s15: 'Consolidation', z15: 'No',
    t5m: 'Bullish', s5m: 'Consolidation', cvd5m: 'None', h5m: 'Above price',
    t3m: 'Bullish', s3m: 'Bart', cvd3m: 'Bullish', h3m: 'Above price',
    vaMatch: 'Yes', strength: 'High', divZone: 'VAL',
    pattern: 'Doji', reason: 'Take Profit', result: 'Profit',
    insaneLines: 'Above level 0', insaneSide: 'Long confirmed',
  };
}

export function defaultState(): AppState {
  return {
    tab: 'dash', screen: null, sheet: null,
    plans: [], activeId: null, trades: [], day: 1, locked: false, streak: 0,
    flow: 'first', instrument: 'MBT', instruments: ['MBT', 'MGC'],
    pickPlan: null, pickAcct: null, detailId: null, copied: false, tradePlanId: null,
    med: { totalSec: 600, remaining: 600, running: false, endAt: null, ready: false },
    sessKey: null,
    picker: null,
    dreams: [
      { id: 'd1', src: dreamAsset('house.png'), ratio: 1.333 },
      { id: 'd2', src: dreamAsset('school.png'), ratio: 0.346 },
      { id: 'd3', src: dreamAsset('truck.png'), ratio: 1.146 },
      { id: 'd4', src: dreamAsset('studio.png'), ratio: 0.561 },
      { id: 'd5', src: dreamAsset('venue.png'), ratio: 0.563 },
      { id: 'd6', src: dreamAsset('flight.png'), ratio: 0.857 },
      { id: 'd7', src: dreamAsset('desk.png'), ratio: 1.779 },
    ],
    dragId: null, overId: null,
    settings: { medMin: 10, theme: 'Black', lang: 'ES' },
    moves: [], moneyPlanId: null, confirmId: null,
    m: { moneyType: 'Deposit', mAmount: '', mNote: '', mRebase: false },
    f: { fName: '', fCapital: '50', fGoal: '5000000', fWin: '10', fLoss: '5', fAccount: 'Funded' },
    s: defaultSnapshot(),
    chk: { liq5m: true, va5m: true, book: false, retest: false },
    reg: { entry: '', sl: '', tp: '', closePx: '', notes: '', manualPnl: '' },
  };
}

function medTotalFor(min: number): number { return min * 60; }

// ── actions ──────────────────────────────────────────────────────────────
export type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'GO'; screen: Screen | 'newplan' | 'plantab' | 'dash' | 'demo'; v?: string }
  | { type: 'BACK' }
  | { type: 'CLOSE_SHEET' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'PLUS' }
  | { type: 'GO_NEW_PLAN' }
  | { type: 'CREATE_PLAN' }
  | { type: 'PLAN_ACTION'; k: 'deposit' | 'withdraw' | 'delete' | 'delmove' | 'activate'; v: string }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'SAVE_MONEY' }
  | { type: 'SET_MONEY_FIELD'; k: 'mAmount' | 'mNote'; v: string }
  | { type: 'SET_MONEY_TYPE'; v: 'Deposit' | 'Withdrawal' }
  | { type: 'TOGGLE_REBASE' }
  | { type: 'SET_PLAN_FORM_FIELD'; k: 'fName' | 'fCapital' | 'fGoal' | 'fWin' | 'fLoss'; v: string }
  | { type: 'SET_PLAN_FORM_ACCOUNT'; v: Account }
  | { type: 'SELECT_TRADE_PLAN'; planId: string }
  | { type: 'SET_PICK_ACCOUNT'; v: Account }
  | { type: 'SET_PICK_PLAN'; v: string }
  | { type: 'SET_INSTRUMENT'; v: InstrumentCode }
  | { type: 'TOGGLE_INSTRUMENT_ENABLED'; code: InstrumentCode }
  | { type: 'LETS_TRADE' }
  | { type: 'OPEN_PICKER'; kind: PickerKind; key: keyof TradeSnapshot }
  | { type: 'CLOSE_PICKER' }
  | { type: 'PICK_OPTION'; v: string }
  | { type: 'SET_SNAP'; k: keyof TradeSnapshot; v: TradeSnapshot[keyof TradeSnapshot] }
  | { type: 'SET_REASON'; v: TradeSnapshot['reason'] }
  | { type: 'TOGGLE_CHK'; k: 'liq5m' | 'va5m' | 'book' | 'retest' }
  | { type: 'SET_REG_FIELD'; k: 'entry' | 'sl' | 'tp' | 'closePx' | 'notes' | 'manualPnl'; v: string }
  | { type: 'ON_MED' }
  | { type: 'MED_DONE' }
  | { type: 'COPY_PROMPT' }
  | { type: 'ASK_BE' }
  | { type: 'CONFIRM_BE' }
  | { type: 'FINALIZE' }
  | { type: 'SET_LANG'; v: 'ES' | 'EN' }
  | { type: 'SET_THEME'; v: 'Paper' | 'Black' }
  | { type: 'SET_MED_MIN'; v: 5 | 10 | 15 }
  | { type: 'ADD_DREAMS'; items: Dream[] }
  | { type: 'UPDATE_DREAM_RATIO'; id: string; ratio: number }
  | { type: 'REMOVE_DREAM'; id: string }
  | { type: 'DREAM_DRAG_START'; id: string }
  | { type: 'DREAM_DRAG_OVER'; id: string }
  | { type: 'DREAM_DRAG_END' }
  | { type: 'DREAM_DROP'; toId: string }
  | { type: 'INIT_SESSION_KEY'; key: string }
  | { type: 'ROLL_DAY'; key: string }
  | { type: 'RESET_ALL' };

function patchPlan(plans: Plan[], id: string, patch: Partial<Plan>): Plan[] {
  return plans.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

function rollDay(st: AppState): Partial<AppState> {
  return {
    day: st.day + 1,
    locked: false,
    plans: st.plans.map((p) => ({ ...p, dayBase: p.equity })),
    med: { totalSec: st.med.totalSec, remaining: st.med.totalSec, running: false, endAt: null, ready: false },
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.tab, screen: null, sheet: null };

    case 'GO': {
      const sc = action.screen;
      if (sc === 'newplan') return { ...state, sheet: 'newplan' };
      if (sc === 'plantab') return { ...state, screen: null, tab: 'plan', sheet: null };
      if (sc === 'dash') return { ...state, screen: null, tab: 'dash', sheet: null };
      if (sc === 'detail') return { ...state, screen: 'detail', detailId: action.v ?? null, sheet: null };
      if (sc === 'demo') return { ...state, sheet: 'pick', screen: null };
      if (sc === 'step1') {
        const total = medTotalFor(state.settings.medMin);
        return { ...state, screen: 'step1', sheet: null, med: { totalSec: total, remaining: total, running: false, endAt: null, ready: false } };
      }
      return { ...state, screen: sc as Screen, sheet: null };
    }

    case 'BACK': {
      const map: Record<string, Screen> = { step2: 'step1', step3: 'step2', step4: 'step3', buy: 'step4', register: 'buy' };
      const prev = state.screen ? map[state.screen] : undefined;
      if (!prev) return { ...state, screen: null, tab: 'dash', sheet: null };
      return { ...state, screen: prev };
    }

    case 'CLOSE_SHEET':
      return { ...state, sheet: null };

    case 'OPEN_SETTINGS':
      return { ...state, sheet: 'settings' };

    case 'PLUS': {
      if (!state.plans.length) return { ...state, sheet: 'noplan' };
      if (state.locked) return { ...state, screen: 'nomore', sheet: null };
      const tradedToday = state.trades.some((t) => t.day === state.day);
      return { ...state, sheet: 'pick', flow: tradedToday ? 'next' : 'first', pickPlan: state.pickPlan || state.activeId };
    }

    case 'GO_NEW_PLAN':
      return { ...state, sheet: 'newplan' };

    case 'CREATE_PLAN': {
      const f = state.f;
      const capital = Math.max(1, parseFloat(f.fCapital) || 50);
      const win = Math.max(0.1, parseFloat(f.fWin) || 10);
      const loss = Math.max(0.1, parseFloat(f.fLoss) || 5);
      const goal = Math.max(capital * (1 + win / 100), parseFloat(f.fGoal) || capital * 100);
      const plan: Plan = {
        id: 'p' + Date.now(), name: f.fName.trim() || 'Liberty Plan',
        capital, equity: capital, dayBase: capital, win, loss, goal, account: f.fAccount,
        days: goalDaysFor(capital, win, goal),
      };
      return {
        ...state,
        plans: [plan, ...state.plans], activeId: plan.id, day: 1,
        sheet: null, tab: 'dash', screen: null, pickPlan: plan.id,
      };
    }

    case 'PLAN_ACTION': {
      const { k, v } = action;
      if (k === 'activate') return { ...state, activeId: v, pickPlan: v, tradePlanId: v, screen: null, tab: 'plan' };
      if (k === 'delete') return { ...state, sheet: 'confirm', confirmId: v };
      if (k === 'delmove') {
        const mv = state.moves.find((x) => x.id === v);
        if (!mv) return state;
        return {
          ...state,
          moves: state.moves.filter((x) => x.id !== v),
          plans: state.plans.map((pl) => {
            if (pl.id !== mv.planId) return pl;
            const patch: Partial<Plan> = { equity: Math.max(0, pl.equity - mv.signed) };
            if (mv.rebase) {
              patch.capital = mv.prevCapital;
              patch.days = mv.prevDays;
            }
            return { ...pl, ...patch };
          }),
        };
      }
      return { ...state, sheet: 'money', moneyPlanId: v, m: { moneyType: k === 'withdraw' ? 'Withdrawal' : 'Deposit', mAmount: '', mNote: '', mRebase: false } };
    }

    case 'CONFIRM_DELETE': {
      const plans = state.plans.filter((x) => x.id !== state.confirmId);
      return {
        ...state,
        plans,
        moves: state.moves.filter((m) => m.planId !== state.confirmId),
        activeId: state.activeId === state.confirmId ? (plans[0]?.id ?? null) : state.activeId,
        pickPlan: state.pickPlan === state.confirmId ? (plans[0]?.id ?? null) : state.pickPlan,
        sheet: null, confirmId: null,
      };
    }

    case 'SET_MONEY_FIELD':
      return { ...state, m: { ...state.m, [action.k]: action.v } };
    case 'SET_MONEY_TYPE':
      return { ...state, m: { ...state.m, moneyType: action.v } };
    case 'TOGGLE_REBASE':
      return { ...state, m: { ...state.m, mRebase: !state.m.mRebase } };

    case 'SAVE_MONEY': {
      const amount = Math.abs(parseFloat(state.m.mAmount) || 0);
      if (!amount) return { ...state, sheet: null };
      const pl = state.plans.find((x) => x.id === state.moneyPlanId);
      if (!pl) return { ...state, sheet: null };
      const signed = state.m.moneyType === 'Withdrawal' ? -amount : amount;
      const equity = Math.max(0, pl.equity + signed);
      const rebase = state.m.mRebase;
      const move: CapitalMovement = {
        id: 'm' + Date.now(), planId: pl.id, planName: pl.name, type: state.m.moneyType,
        amount, signed, note: state.m.mNote, rebase, time: Date.now(), day: state.day,
        prevCapital: pl.capital, prevDays: pl.days,
      };
      const plans = state.plans.map((x) => {
        if (x.id !== pl.id) return x;
        const patch: Partial<Plan> = { equity, dayBase: Math.max(0, (typeof x.dayBase === 'number' ? x.dayBase : x.capital) + signed) };
        if (rebase) {
          patch.capital = equity;
          patch.dayBase = equity;
          patch.days = goalDaysFor(equity, x.win, x.goal);
        }
        return { ...x, ...patch };
      });
      return { ...state, moves: [move, ...state.moves], plans, sheet: null };
    }

    case 'SET_PLAN_FORM_FIELD':
      return { ...state, f: { ...state.f, [action.k]: action.v } };
    case 'SET_PLAN_FORM_ACCOUNT':
      return { ...state, f: { ...state.f, fAccount: action.v } };

    case 'SELECT_TRADE_PLAN':
      return { ...state, tradePlanId: action.planId };

    case 'SET_PICK_ACCOUNT': {
      const first = state.plans.find((x) => x.account === action.v);
      return { ...state, pickAcct: action.v, pickPlan: first ? first.id : null };
    }
    case 'SET_PICK_PLAN':
      return { ...state, pickPlan: action.v };

    case 'SET_INSTRUMENT':
      return { ...state, instrument: action.v };

    case 'TOGGLE_INSTRUMENT_ENABLED': {
      const on = state.instruments.includes(action.code);
      const next = on ? state.instruments.filter((c) => c !== action.code) : state.instruments.concat([action.code]);
      const list = next.length ? next : state.instruments;
      return { ...state, instruments: list, instrument: list.includes(state.instrument) ? state.instrument : list[0] };
    }

    case 'LETS_TRADE': {
      const chosen = state.plans.find((x) => x.id === state.pickPlan);
      if (!chosen) return { ...state, sheet: 'newplan' };
      const row = planRow(chosen, state.day, state.day);
      const btc = state.instrument.indexOf('BT') !== -1 || state.instrument === 'BFF';
      const entry = btc ? 120000 : 4000;
      const dist = row.risk / perPointFor(state.instrument) || (btc ? 500 : 3);
      const reg = {
        entry: entry.toFixed(2),
        sl: (entry - dist).toFixed(2),
        tp: (entry + dist * 2).toFixed(2),
        closePx: (entry + dist * 2).toFixed(2),
        notes: '', manualPnl: '',
      };
      if (state.flow === 'next') return { ...state, sheet: 'warn', reg, activeId: chosen.id };
      const total = medTotalFor(state.settings.medMin);
      return { ...state, sheet: null, screen: 'step1', med: { totalSec: total, remaining: total, running: false, endAt: null, ready: false }, reg, activeId: chosen.id };
    }

    case 'OPEN_PICKER':
      return { ...state, picker: { kind: action.kind, key: action.key } };
    case 'CLOSE_PICKER':
      return { ...state, picker: null };
    case 'PICK_OPTION': {
      if (!state.picker) return state;
      return { ...state, s: { ...state.s, [state.picker.key]: action.v }, picker: null };
    }

    case 'SET_SNAP':
      return { ...state, s: { ...state.s, [action.k]: action.v } };

    case 'SET_REASON': {
      const r = state.reg;
      const px = action.v === 'Take Profit' ? r.tp : action.v === 'Stop Loss' ? r.sl : action.v === 'Break even' ? r.entry : r.closePx;
      return { ...state, s: { ...state.s, reason: action.v }, reg: { ...r, closePx: px } };
    }

    case 'TOGGLE_CHK':
      return { ...state, chk: { ...state.chk, [action.k]: !state.chk[action.k] } };

    case 'SET_REG_FIELD': {
      const reg = { ...state.reg, [action.k]: action.v };
      return { ...state, reg };
    }

    case 'ON_MED': {
      const med = state.med;
      if (med.ready) return state;
      if (med.running) {
        const left = med.endAt ? Math.max(0, Math.round((med.endAt - Date.now()) / 1000)) : med.remaining;
        return { ...state, med: { ...med, running: false, endAt: null, remaining: left } };
      }
      const left = med.remaining === 0 ? med.totalSec : med.remaining;
      return { ...state, med: { ...med, running: true, endAt: Date.now() + left * 1000, remaining: left } };
    }

    case 'MED_DONE':
      return { ...state, med: { ...state.med, running: false, endAt: null, remaining: 0, ready: true } };

    case 'COPY_PROMPT':
      return { ...state, copied: true };

    case 'ASK_BE':
      return { ...state, sheet: 'beask' };

    case 'CONFIRM_BE': {
      const p = state.plans.find((x) => x.id === state.activeId) || null;
      const trade = {
        id: 't' + Date.now(), day: state.day, instrument: state.instrument,
        side: (state.s.t3m === 'Bearish' ? 'SELL' : 'BUY') as 'BUY' | 'SELL',
        result: 'BE' as const, pnl: 0,
        account: p ? p.account : 'Funded', planId: p ? p.id : null,
        zone: state.s.divZone, notes: state.reg.notes, reg: { ...state.reg },
        snap: { ...state.s }, time: Date.now(),
      };
      return {
        ...state,
        trades: [trade, ...state.trades],
        sheet: null, screen: 'buy',
        chk: { ...state.chk, book: false, retest: false },
        reg: { ...state.reg, notes: '', manualPnl: '' },
      };
    }

    case 'FINALIZE': {
      const p = state.plans.find((x) => x.id === state.activeId) || null;
      const row = p ? planRow(p, state.day, state.day) : null;
      const res = state.s.result;
      const mpF = parseFloat(state.reg.manualPnl);
      const pnl = !isNaN(mpF)
        ? (res === 'Lose' ? -Math.abs(mpF) : Math.abs(mpF))
        : res === 'Profit' ? (row ? row.tp : 0) : res === 'Lose' ? -(row ? row.risk : 0) : 0;
      const trade = {
        id: 't' + Date.now(), day: state.day, instrument: state.instrument,
        side: (state.s.t3m === 'Bearish' ? 'SELL' : 'BUY') as 'BUY' | 'SELL',
        result: res, pnl,
        account: p ? p.account : 'Funded', planId: p ? p.id : null,
        zone: state.s.divZone, notes: state.reg.notes, reg: { ...state.reg },
        snap: { ...state.s }, time: Date.now(),
      };
      const plans = p ? patchPlan(state.plans, p.id, { equity: p.equity + pnl }) : state.plans;
      return {
        ...state,
        plans,
        trades: [trade, ...state.trades],
        streak: res === 'Profit' ? state.streak + 1 : 0,
        locked: res === 'Lose',
        screen: res === 'Lose' ? 'nomore' : null,
        tab: 'dash', sheet: null,
      };
    }

    case 'SET_LANG':
      return { ...state, settings: { ...state.settings, lang: action.v } };
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.v } };
    case 'SET_MED_MIN': {
      const total = medTotalFor(action.v);
      return { ...state, settings: { ...state.settings, medMin: action.v }, med: { totalSec: total, remaining: total, running: false, endAt: null, ready: false } };
    }
    case 'ADD_DREAMS':
      return { ...state, dreams: [...action.items, ...state.dreams] };
    case 'UPDATE_DREAM_RATIO':
      return { ...state, dreams: state.dreams.map((d) => (d.id === action.id ? { ...d, ratio: action.ratio } : d)) };
    case 'REMOVE_DREAM':
      return { ...state, dreams: state.dreams.filter((d) => d.id !== action.id) };
    case 'DREAM_DRAG_START':
      return { ...state, dragId: action.id, overId: null };
    case 'DREAM_DRAG_OVER':
      return state.overId === action.id ? state : { ...state, overId: action.id };
    case 'DREAM_DRAG_END':
      return { ...state, dragId: null, overId: null };
    case 'DREAM_DROP': {
      const from = state.dragId;
      const to = action.toId;
      if (!from || from === to) return { ...state, dragId: null, overId: null };
      const list = state.dreams.slice();
      const fi = list.findIndex((d) => d.id === from);
      const ti = list.findIndex((d) => d.id === to);
      if (fi === -1 || ti === -1) return { ...state, dragId: null, overId: null };
      const [moved] = list.splice(fi, 1);
      list.splice(ti, 0, moved);
      return { ...state, dreams: list, dragId: null, overId: null };
    }

    case 'INIT_SESSION_KEY':
      return state.sessKey ? state : { ...state, sessKey: action.key };
    case 'ROLL_DAY':
      return { ...state, sessKey: action.key, ...rollDay(state) };

    case 'RESET_ALL':
      return defaultState();

    default:
      return state;
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  // Keep the CME session key correct + roll the trading day forward automatically.
  useEffect(() => {
    if (!state.sessKey) dispatch({ type: 'INIT_SESSION_KEY', key: sessionKey(new Date()) });
  }, [state.sessKey]);

  useEffect(() => {
    if (!state.sessKey) return;
    const id = setInterval(() => {
      const key = sessionKey(new Date());
      if (key !== state.sessKey) dispatch({ type: 'ROLL_DAY', key });
    }, 1000);
    return () => clearInterval(id);
  }, [state.sessKey]);

  // Meditation countdown: check for completion once a second while running.
  useEffect(() => {
    if (!state.med.running || !state.med.endAt) return;
    const id = setInterval(() => {
      if (state.med.endAt != null && Date.now() >= state.med.endAt) dispatch({ type: 'MED_DONE' });
    }, 250);
    return () => clearInterval(id);
  }, [state.med.running, state.med.endAt]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const s = useContext(StateCtx);
  if (!s) throw new Error('useAppState must be used within StoreProvider');
  return s;
}
export function useDispatch(): React.Dispatch<Action> {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error('useDispatch must be used within StoreProvider');
  return d;
}

/** A shared 1Hz clock for session windows / med countdown display, kept out of the persisted store. */
const ClockCtx = createContext<Date>(new Date());

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = React.useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <ClockCtx.Provider value={now}>{children}</ClockCtx.Provider>;
}
export function useNow(): Date {
  return useContext(ClockCtx);
}

export function medLeftSeconds(state: AppState, now: Date): number {
  const med = state.med;
  if (med.running && med.endAt != null) return Math.max(0, Math.ceil((med.endAt - now.getTime()) / 1000));
  return med.remaining;
}

export const _internal = { medTotalFor };
