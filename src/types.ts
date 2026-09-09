// Core domain types for DeltraOS.

export type Account = 'Funded' | 'Evaluation' | 'Live' | 'Demo';
export type Lang = 'ES' | 'EN';
export type Theme = 'Paper' | 'Black';
export type Trend = 'Bullish' | 'Bearish' | 'Range';
export type YesNo = 'Yes' | 'No';
export type HeatSide = 'Above price' | 'Below price';
export type CloseReason = 'Take Profit' | 'Stop Loss' | 'Manual close' | 'Break even';
export type Result = 'Profit' | 'Lose' | 'BE';
export type DivZone = 'VAL' | 'VAH' | 'POC 5m';
export type Strength = 'Low' | 'Medium' | 'High';
export type InsaneLines = 'Above level 0' | 'Below level 0';
export type InsaneSide = 'Long confirmed' | 'Short confirmed' | 'Not confirmed';
/** The lower timeframe of the two auction-zone rows: user-selectable, only for that second row. */
export type LtfTimeframe = '1m' | '3m';

export type InstrumentCode = 'MBT' | 'MGC' | 'BTC' | 'BFF' | 'GC' | '1OZ';

export interface Instrument {
  code: InstrumentCode;
  name: string;
  perPoint: number;
}

export interface Plan {
  id: string;
  name: string;
  capital: number; // basis used for "past day" rows in the table
  dayBase: number; // basis used for "today and future" rows; rolls forward at day close
  equity: number; // live running total shown as the headline number
  win: number; // % profit per day
  loss: number; // % risk per trade
  goal: number;
  account: Account;
  days: number; // estimate captured at creation/rebase time (display uses planDays() live)
}

export interface CapitalMovement {
  id: string;
  planId: string;
  planName: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  signed: number;
  note: string;
  rebase: boolean;
  time: number; // epoch ms
  day: number;
  prevCapital: number;
  prevDays: number;
}

export interface TradeSnapshot {
  acct: Account;
  eco: YesNo;
  bias: 'Bullish' | 'Bearish';
  t1d: Trend; s1d: string; z1d: YesNo;
  t1h: Trend; s1h: string; z1h: YesNo;
  t15: Trend; s15: string; z15: YesNo;
  t5m: Trend; s5m: string; cvd5m: string; h5m: HeatSide;
  /** Timeframe the second auction-zone row (below) is currently reading — chosen via its 1m/3m toggle. */
  tf2: LtfTimeframe;
  t3m: Trend; s3m: string; cvd3m: string; h3m: HeatSide;
  vaMatch: YesNo;
  strength: Strength;
  divZone: DivZone;
  pattern: string;
  reason: CloseReason;
  result: Result;
  insaneLines: InsaneLines;
  insaneSide: InsaneSide;
}

export interface RegisterFields {
  entry: string;
  sl: string;
  tp: string;
  closePx: string;
  notes: string;
  manualPnl: string;
}

export interface Trade {
  id: string;
  day: number;
  instrument: InstrumentCode;
  side: 'BUY' | 'SELL';
  result: Result;
  pnl: number;
  account: Account;
  planId: string | null;
  zone: DivZone;
  notes: string;
  reg: RegisterFields;
  snap: TradeSnapshot;
  time: number;
}

export interface MedState {
  totalSec: number;
  remaining: number; // seconds left, valid when not running
  running: boolean;
  endAt: number | null; // epoch ms the countdown reaches zero, valid when running
  ready: boolean;
}

export type Screen =
  | null
  | 'plans'
  | 'step1' | 'step2' | 'step3' | 'step4'
  | 'buy' | 'register' | 'nomore' | 'detail';

export type Tab = 'dash' | 'trades' | 'plan' | 'dreams';

export type Sheet =
  | null
  | 'newplan'
  | 'pick'
  | 'money'
  | 'confirm'
  | 'settings'
  | 'noplan'
  | 'beask'
  | 'warn';

export type PickerKind = 'structure' | 'structureHtf' | 'cvd' | 'pattern';

export interface PickerState {
  kind: PickerKind;
  key: keyof TradeSnapshot;
}

export interface Dream {
  id: string;
  src: string;
  ratio: number;
}

export interface Settings {
  medMin: 5 | 10 | 15;
  theme: Theme;
  lang: Lang;
}

export interface NewPlanForm {
  fName: string;
  fCapital: string;
  fGoal: string;
  fWin: string;
  fLoss: string;
  fAccount: Account;
}

export interface MoneyForm {
  moneyType: 'Deposit' | 'Withdrawal';
  mAmount: string;
  mNote: string;
  mRebase: boolean;
}

export interface Checks {
  liq5m: boolean;
  va5m: boolean;
  book: boolean;
  retest: boolean;
}

export type Flow = 'first' | 'next';

export interface AppState {
  tab: Tab;
  screen: Screen;
  sheet: Sheet;

  plans: Plan[];
  activeId: string | null;
  trades: Trade[];
  day: number;
  locked: boolean;
  streak: number;

  flow: Flow;
  instrument: InstrumentCode;
  instruments: InstrumentCode[];
  pickPlan: string | null;
  pickAcct: Account | null;
  detailId: string | null;
  copied: boolean;
  tradePlanId: string | null;

  med: MedState;

  sessKey: string | null;
  picker: PickerState | null;

  dreams: Dream[];
  dragId: string | null;
  overId: string | null;

  settings: Settings;

  moves: CapitalMovement[];
  moneyPlanId: string | null;
  confirmId: string | null;

  m: MoneyForm;
  f: NewPlanForm;
  s: TradeSnapshot;
  chk: Checks;
  reg: RegisterFields;
}
