'use strict';
/* ==========================================================================
   DeltraOS — trading journal & session-locked execution model.
   Vanilla JS, no build step, no framework. Single global state object (ST),
   re-rendered to innerHTML on structural changes; live clocks/counters and
   text-field-driven previews patch specific DOM nodes so inputs never lose
   focus. State (minus binary blobs) lives in localStorage; images/audio
   live in IndexedDB.
   ========================================================================== */

/* ---------------------------------------------------------------- consts */
const NY = { tz: 'America/New_York', open: 570, close: 960, label: 'ET' };
const TK = { tz: 'Asia/Tokyo', open: 540, close: 900, label: 'JST' };
const CME_TZ = 'America/Chicago';

const INSTRUMENTS = [
  { code: 'MBT', name: 'Micro Bitcoin', perPoint: 0.1 },
  { code: 'MGC', name: 'Micro Gold', perPoint: 10 },
  { code: 'BTC', name: 'Bitcoin', perPoint: 5 },
  { code: 'BFF', name: 'Bitcoin Friday', perPoint: 0.02 },
  { code: 'GC', name: 'Gold', perPoint: 100 },
  { code: '1OZ', name: 'One Ounce Gold', perPoint: 1 }
];

const GI = 'var(--text)', GR = 'var(--a700)', GG = 'var(--n500)';
const PT = (d, s, w, dash) => ({ d, s: s || GI, w: w || 2, dash: dash || '0' });
const RC = (x, y, w, h, fill) => ({ x, y, w, h, fill: fill || GI });
const GLYPHS = {
  structure: [
    { v: 'Uptrend', paths: [PT('M4 27 L15 19 L21 23 L32 13 L38 17 L56 5')], rects: [] },
    { v: 'Downtrend', paths: [PT('M4 5 L15 13 L21 9 L32 19 L38 15 L56 27')], rects: [] },
    { v: 'Consolidation', paths: [PT('M4 8 L56 8', GG, 1.5, '4 4'), PT('M4 24 L56 24', GG, 1.5, '4 4'), PT('M4 20 L13 11 L22 22 L31 11 L40 22 L49 11 L56 18')], rects: [] },
    { v: 'Bart', paths: [PT('M4 26 L14 8 L44 8 L54 26')], rects: [] },
    { v: 'Pennant', paths: [PT('M4 28 L20 8'), PT('M20 8 L52 16', GG, 1.5, '4 4'), PT('M20 26 L52 16', GG, 1.5, '4 4'), PT('M46 15 L56 5', GR)], rects: [] }
  ],
  cvd: [
    { v: 'None', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 13 L20 9 L36 6 L56 3'), PT('M4 29 L20 25 L36 22 L56 19', GR)], rects: [] },
    { v: 'Bullish', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 4 L20 8 L36 10 L56 13'), PT('M4 29 L20 26 L36 23 L56 20', GR)], rects: [] },
    { v: 'Bearish', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 13 L20 10 L36 7 L56 4'), PT('M4 20 L20 23 L36 26 L56 29', GR)], rects: [] }
  ],
  reaction: [
    { v: 'False breakout', paths: [PT('M4 11 L56 11', GG, 1.5, '4 4'), PT('M4 24 L18 13 L26 5 L34 15 L56 25')], rects: [] },
    { v: 'Rejection', paths: [PT('M4 11 L56 11', GG, 1.5, '4 4'), PT('M4 26 L22 12 L30 12 L56 27')], rects: [] },
    { v: 'Breakout', paths: [PT('M4 16 L56 16', GG, 1.5, '4 4'), PT('M4 27 L24 17 L34 17 L56 4')], rects: [] },
    { v: 'Liquidity sweep (SFP)', paths: [PT('M4 13 L56 13', GG, 1.5, '4 4'), PT('M4 21 L20 21 L26 4 L31 19 L56 27')], rects: [] }
  ],
  pattern: [
    { v: 'Doji', paths: [PT('M30 4 L30 28', GI, 1.5)], rects: [RC(24, 15, 13, 3)] },
    { v: 'Hammer', paths: [PT('M30 7 L30 29', GI, 1.5)], rects: [RC(24, 7, 13, 7)] },
    { v: 'Shooting star', paths: [PT('M30 3 L30 25', GI, 1.5)], rects: [RC(24, 18, 13, 7)] },
    { v: 'Engulfing', paths: [PT('M18 10 L18 24', GG, 1.5), PT('M38 4 L38 29', GI, 1.5)], rects: [RC(13, 13, 10, 8, GG), RC(31, 7, 14, 19)] },
    { v: 'None', paths: [PT('M6 16 L54 16', GG, 2, '5 4')], rects: [] }
  ]
};
GLYPHS.structureHtf = GLYPHS.structure.concat([
  { v: 'Double top', paths: [PT('M4 26 L14 8 L24 20 L34 8 L44 20 L56 28'), PT('M18 20 L52 20', GG, 1.5, '4 4')], rects: [] },
  { v: 'Double bottom', paths: [PT('M4 6 L14 24 L24 12 L34 24 L44 12 L56 4'), PT('M18 12 L52 12', GG, 1.5, '4 4')], rects: [] },
  { v: 'Head & shoulders', paths: [PT('M4 24 L12 16 L18 22 L28 5 L38 22 L44 16 L56 26'), PT('M14 22 L50 22', GG, 1.5, '4 4')], rects: [] }
]);
const PICKER_TITLES = { structure: ['Market structure', 'Estructura de mercado'], structureHtf: ['Market structure', 'Estructura de mercado'], cvd: ['CVD divergence', 'Divergencia de CVD'], reaction: ['Market reaction', 'Reacción del mercado'], pattern: ['Candle pattern with the divergence', 'Patrón de vela con la divergencia'] };
const GLYPH_NAMES_ES = {
  'Uptrend': 'Tendencia alcista', 'Downtrend': 'Tendencia bajista', 'Consolidation': 'Consolidación', 'Bart': 'Bart', 'Pennant': 'Banderín',
  'Double top': 'Doble techo', 'Double bottom': 'Doble piso', 'Head & shoulders': 'Hombro-cabeza-hombro',
  'None': 'Ninguna', 'Bullish': 'Alcista', 'Bearish': 'Bajista',
  'False breakout': 'Ruptura falsa', 'Rejection': 'Rechazo', 'Breakout': 'Ruptura', 'Liquidity sweep (SFP)': 'Barrido de liquidez (SFP)',
  'Doji': 'Doji', 'Hammer': 'Martillo', 'Shooting star': 'Estrella fugaz', 'Engulfing': 'Envolvente'
};

const ES = {
  'Dashboard': 'Panel', 'Trades': 'Trades', 'Plan': 'Plan', 'Dreams': 'Sueños', 'Exit': 'Salir',
  'Market sessions': 'Sesiones de mercado', 'Setup required': 'Falta configurar',
  'No investment plan yet.': 'Sin plan de inversión aún.',
  'Every trade in DeltraOS is sized by your plan. Create one to unlock the trade flow.': 'Cada trade en DeltraOS se dimensiona con tu plan. Crea uno para desbloquear el flujo.',
  'New plan': 'Nuevo plan', 'Day': 'Día', 'Target TP': 'TP objetivo', 'Risk cap': 'Riesgo máx.',
  'Equity vs. projection': 'Equity vs. proyección', 'Actual': 'Real',
  'Win rate': 'Aciertos', 'Avg R': 'R promedio', 'Streak': 'Racha', 'Recent trades': 'Trades recientes',
  'Nothing logged yet. Tap + to run the model.': 'Nada registrado aún. Toca + para correr el modelo.',
  'Account': 'Cuenta', 'No trades on this account.': 'Sin trades en esta cuenta.',
  'Each trade JABS runs is summarised here. Tap a row for the full checklist.': 'Cada trade que corre JABS se resume aquí. Toca una fila para ver la lista completa.',
  'Risk and take-profit per day, compounded from your capital. One plan is active; the rest stay archived.': 'Riesgo y take-profit por día, compuestos desde tu capital. Un plan está activo; el resto queda archivado.',
  'Add new plan': 'Agregar plan', 'No plans saved.': 'Sin planes guardados.',
  'Set active': 'Activar', 'Deposit': 'Depósito', 'Withdraw': 'Retiro', 'Delete': 'Eliminar',
  'Capital movements': 'Movimientos de capital', 'Goal': 'Meta', 'Sessions to goal': 'Sesiones a la meta',
  'Capital': 'Capital', 'First TP': 'Primer TP', 'Risk': 'Riesgo',
  'Position size must keep the stop distance at or under the day’s risk. The TP is an approximation of a 1:2 target — it can be larger.': 'El tamaño de posición debe mantener la distancia al stop dentro del riesgo del día. El TP es una aproximación de 1:2 — puede ser mayor.',
  'Everything you fight for deserves your patience, dedication and discipline.': 'Todo aquello por lo que luchas merece tu paciencia, dedicación y disciplina.',
  'Add images': 'Añadir imágenes', 'Empty': 'Vacío',
  'Add the images of what you fight for. The app arranges them on its own.': 'Añade las imágenes de aquello por lo que luchas. La app las acomoda sola.',
  'Mental state': 'Estado mental',
  'Start your day with a meditation. Get to that cold, disciplined, efficient state. Leave behind any euphoric or self-destructive impulse.': 'Empieza el día con una meditación. Llega a ese estado frío, disciplinado, eficiente. Deja atrás cualquier impulso eufórico o autodestructivo.',
  'Everything is in order. Trust your plan, trust your model, trust yourself. The outside does not matter — the now matters.': 'Todo está en orden. Confía en tu plan, en tu modelo, en ti. Lo de afuera no importa — importa el ahora.',
  'Mantra': 'Mantra', 'Ready — go to fundamentals': 'Listo — ir a fundamentales',
  'Tap to begin the meditation': 'Toca para empezar la meditación',
  'Eyes closed · slow inhale · slower exhale': 'Ojos cerrados · inhala lento · exhala más lento',
  'Mind clear — you may trade': 'Mente clara — puedes operar',
  'Fundamentals': 'Fundamentales', 'Economic calendar': 'Calendario económico',
  'Any high-impact events today?': '¿Hay eventos de alto impacto hoy?', 'Yes': 'Sí', 'No': 'No',
  'Careful — the market may not respect the model on high-impact news.': 'Cuidado — con noticias de alto impacto el mercado puede no respetar el modelo.',
  'AI analysis & perspective': 'Análisis y perspectiva con IA',
  'Copy the research prompt, run it in your AI, then record the bias it returns.': 'Copia el prompt, córrelo en tu IA y registra el sesgo que devuelve.',
  'Copy AI prompt': 'Copiar prompt de IA', 'AI prompt copied': 'Prompt copiado',
  'Higher probability': 'Mayor probabilidad',
  'Treat it only as a probability, never a certainty.': 'Tómalo solo como probabilidad, nunca como certeza.',
  'Continue to general trend': 'Continuar a tendencia general', 'General trend': 'Tendencia general',
  'Range': 'Rango', 'Structure': 'Estructura', 'Near high-impact zone': 'Cerca de zona de alto impacto',
  'Heatmap liquidity': 'Liquidez del heatmap', 'Above price': 'Arriba del precio', 'Below price': 'Abajo del precio',
  'Continue to auction zone': 'Continuar a zona de subasta', 'Scalping auction zone': 'Zona de subasta scalping',
  'Liquidity zones marked': 'Zonas de liquidez marcadas', 'VAH, VAL, POC zones': 'Zonas VAH, VAL, POC',
  'CVD divergence': 'Divergencia de CVD', 'VA 1m / 5m match': 'Coincide VA 1m / 5m',
  'Divergence strength': 'Fuerza de la divergencia', 'Low': 'Baja', 'Medium': 'Media', 'High': 'Alta',
  'Divergence zone — trades are always taken in the value area': 'Zona de divergencia — los trades siempre se toman en el value area',
  'Results': 'Resultados', 'Zone': 'Zona', 'Stop loss': 'Stop loss', 'Take profit': 'Take profit',
  'Max loss': 'Pérdida máx.', 'Start trade': 'Iniciar trade', 'Execution': 'Ejecución',
  'Open Bookmap': 'Abrir Bookmap',
  'Identify the zone of interest and wait for price to approach it. Once it touches: volume increases (DOTS), sellers get absorbed, and the first rejection prints. Confirm with a CVD candle divergence.': 'Identifica la zona de interés y espera a que el precio se acerque. Al tocarla: el volumen aumenta (DOTS), los vendedores se absorben y aparece el primer rechazo. Confirma con una divergencia de vela en CVD.',
  'Zone retest': 'Retest de la zona', 'PATIENCE.': 'PACIENCIA.',
  'Price must retest the zone — that is the key moment to trade.': 'El precio debe volver a probar la zona — ese es el momento clave para operar.',
  'Market reaction': 'Reacción del mercado', 'CVD candle divergence': 'Divergencia de vela en CVD',
  'Candle pattern with the divergence': 'Patrón de vela con la divergencia',
  'This confirmation marks a new liquidity zone — usable as your stop loss — and confirms the change of trend toward the next point of interest.': 'Esta confirmación marca una nueva zona de liquidez — que puedes usar como stop loss — y confirma el cambio de tendencia hacia el siguiente punto de interés.',
  'Register trade': 'Registrar trade', 'Entry': 'Entrada', 'Risk / reward': 'Riesgo / beneficio',
  'Result': 'Resultado', 'Profit': 'Ganancia', 'Lose': 'Pérdida', 'TAKE PROFIT': 'TAKE PROFIT', 'STOP LOSS': 'STOP LOSS',
  'Close reason': 'Motivo de cierre', 'Take Profit': 'Take Profit', 'Stop Loss': 'Stop Loss',
  'Manual close': 'Cierre manual', 'Break even': 'Break even', 'Time stop': 'Cierre por tiempo',
  'Close price': 'Precio de cierre', 'Notes': 'Notas', 'Screenshot': 'Captura',
  'upload chart capture': 'sube la captura del gráfico', 'Finalize': 'Finalizar',
  'A win keeps the session open. A loss locks real accounts until the next session. Break even logs the trade and returns here.': 'Una ganancia mantiene la sesión abierta. Una pérdida bloquea las cuentas reales hasta la próxima sesión. El break even registra el trade y regresa aquí.',
  'Starter values — adjust to your real fill.': 'Valores de partida — ajústalos a tu precio real.',
  'No more trades in the session': 'No hay más trades en la sesión',
  'Wait until the next session or tomorrow. If you want to keep trading, switch to the DEMO account.': 'Espera a la próxima sesión o a mañana. Si quieres seguir operando, cambia a la cuenta DEMO.',
  'Continue on DEMO': 'Continuar en DEMO', 'Back to dashboard': 'Volver al panel', 'Back': 'Atrás',
  'Capture': 'Captura', 'trade screenshot': 'captura del trade',
  'The table compounds from your capital. Risk and TP are percentages of the current day’s capital.': 'La tabla compone desde tu capital. El riesgo y el TP son porcentajes del capital del día.',
  'Plan name': 'Nombre del plan', 'Starting capital (USD)': 'Capital inicial (USD)',
  'Goal — where the plan ends (USD)': 'Meta — donde termina el plan (USD)',
  'Profit per day (%)': 'Ganancia por día (%)', 'Risk per trade (%)': 'Riesgo por trade (%)',
  'Day 1 TP': 'TP del día 1', 'Day 1 risk': 'Riesgo del día 1', 'Goal in': 'Meta en', 'Create plan': 'Crear plan',
  'Cancel': 'Cancelar', 'New trade': 'Nuevo trade',
  'Pick the plan — it carries the account — and the instrument to operate.': 'Elige el plan — trae la cuenta — y el instrumento a operar.',
  'Instrument': 'Instrumento',
  'Real accounts are locked for this session. Only DEMO is available.': 'Las cuentas reales están bloqueadas esta sesión. Solo DEMO está disponible.',
  'Let’s trade': 'Vamos a operar', 'Withdrawal': 'Retiro', 'Amount (USD)': 'Monto (USD)', 'Note': 'Nota',
  'Rebase the plan': 'Rebasar el plan',
  'Recompute the table and the days to goal from the new capital': 'Recalcula la tabla y los días a la meta desde el nuevo capital',
  'Equity after': 'Equity después', 'Record movement': 'Registrar movimiento', 'Delete plan': 'Eliminar plan',
  'Its table, equity and capital movements go with it. Logged trades stay in the history.': 'Su tabla, equity y movimientos de capital se van con él. Los trades registrados se quedan en el historial.',
  'Delete it': 'Eliminarlo', 'Keep it': 'Conservarlo', 'Settings': 'Ajustes', 'Language': 'Idioma',
  'Appearance': 'Apariencia', 'Paper': 'Papel', 'Black': 'Negro', 'Meditation track': 'Audio de meditación',
  'Remove': 'Quitar', 'Plays while the countdown runs and stops when it ends.': 'Suena mientras corre la cuenta y se detiene al terminar.',
  'A loss locks': 'Una pérdida bloquea',
  'Real accounts stay locked until the next session. DEMO stays open.': 'Las cuentas reales quedan bloqueadas hasta la próxima sesión. DEMO sigue abierta.',
  'Not configurable — this rule is what the model is built on.': 'No configurable — esta regla es la base del modelo.',
  'Instruments you trade': 'Instrumentos que operas',
  'Only the selected ones appear when you open a trade.': 'Solo los seleccionados aparecen al abrir un trade.',
  'Meditation length': 'Duración de la meditación', '10 minutes': '10 minutos', '5 minutes': '5 minutos', '15 minutes': '15 minutos',
  'Step 1 cannot be skipped — only its length is yours to set.': 'El paso 1 no se puede omitir — solo tú defines su duración.',
  'Session state': 'Estado de la sesión', 'Close': 'Cerrar', 'No plan found': 'No hay plan',
  'Create a plan first': 'Crea un plan primero',
  'A trade needs an active plan: it defines the daily target, the risk and the account. Create one to start operating.': 'Un trade necesita un plan activo: define el objetivo diario, el riesgo y la cuenta. Crea uno para empezar a operar.',
  'Break even': 'Break even', '¿Registrar BE?': '¿Registrar BE?',
  'Logging the trade as BE records it and starts a new entry carrying the data captured up to the Execution screen. Continue?': 'Al registrar el trade como BE se realiza el registro y se empieza un registro nuevo considerando los datos capturados anteriormente hasta la pantalla de Execution. ¿Deseas continuar?',
  'Continue': 'Continuar', 'Warning': 'Aviso', 'Next trade of the session': 'Siguiente trade de la sesión',
  'Steps 1 and 2 stay saved from your first trade. You only re-read the auction zone. Do not force a reward out of need — the day is already green.': 'Los pasos 1 y 2 se quedan guardados de tu primer trade. Solo vuelves a leer la zona de subasta. No fuerces un beneficio por necesidad — el día ya está en verde.',
  'Understood — read the zone': 'Entendido — leer la zona', 'Not now': 'Ahora no',
  'OPEN': 'ABIERTO', 'CLOSED': 'CERRADO', 'opens Monday': 'abre el lunes', 'PAUSE': 'PAUSA',
  'daily 60-min pause': 'pausa diaria de 60 min', 'Mixed': 'Mixto', 'No notes.': 'Sin notas.',
  'Duration': 'Duración', 'Meditation completed': 'Meditación completada',
  'High-impact news': 'Noticias de alto impacto', 'AI bias': 'Sesgo de la IA',
  'VA 1m/5m match': 'Coincide VA 1m/5m', 'Operating zone': 'Zona de operación',
  'Confirmed': 'Confirmado', 'Not confirmed': 'Sin confirmar', 'Candle pattern': 'Patrón de vela',
  'New York — RTH': 'Nueva York — RTH', 'Tokyo': 'Tokio',
  'SESSION LOCKED': 'SESIÓN BLOQUEADA', 'SESSION OPEN': 'SESIÓN ABIERTA',
  'ACTIVE': 'ACTIVO', 'ARCHIVED': 'ARCHIVADO', 'DONE': 'HECHO', 'PENDING': 'PENDIENTE',
  'ACTUAL': 'ACTUAL', 'SELECTED': 'ELEGIDO',
  'no note': 'sin nota', 'rebased': 'rebasado', 'Withdraw from capital': 'Retirar del capital', 'Add to capital': 'Sumar al capital',
  'ON': 'ON', 'OFF': 'OFF', 'No track selected': 'Sin audio seleccionado', 'Next trade': 'Trade siguiente',
  'First trade': 'Primer trade',
  'Lowest liquidity zone': 'Zona de menor liquidez', 'POC 5m (upper limit)': 'POC 5m (límite superior)',
  'Micro Bitcoin': 'Micro Bitcoin', 'Micro Gold': 'Micro Oro', 'Bitcoin': 'Bitcoin', 'Bitcoin Friday': 'Bitcoin Friday',
  'Gold': 'Oro', 'One Ounce Gold': 'Oro una onza', 'Funded': 'Fondeada', 'Evaluation': 'Evaluación', 'Live': 'Live', 'Demo': 'Demo',
  'your time': 'tu hora', 'Cancelar': 'Cancelar', 'None': 'Ninguna'
};
Object.assign(ES, GLYPH_NAMES_ES); // glyph/structure names are plain vocabulary too (trend selects, reaction text)
function t(s) { return (ST.settings.lang === 'EN') ? s : (ES[s] !== undefined ? ES[s] : s); }
function gname(v) { return t(v); }

/* ---------------------------------------------------------------- utils */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function money(n) {
  if (!isFinite(n)) return '$0.00';
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/* ------------------------------------------------------------- storage */
const LS_KEY = 'deltraos_state_v1';
function defaultState() {
  return {
    tab: 'dash', screen: null, sheet: null,
    plans: [], activeId: null, trades: [], day: 1, locked: false, streak: 0,
    flow: 'first', instrument: 'MBT', pickPlan: null, detailId: null,
    sessKey: null,
    picker: null,
    dreams: [
      { id: 'd1', src: 'assets/dreams/house.png', ratio: '1.333', builtin: true },
      { id: 'd2', src: 'assets/dreams/school.png', ratio: '0.346', builtin: true },
      { id: 'd3', src: 'assets/dreams/truck.png', ratio: '1.146', builtin: true },
      { id: 'd4', src: 'assets/dreams/studio.png', ratio: '0.561', builtin: true },
      { id: 'd5', src: 'assets/dreams/venue.png', ratio: '0.563', builtin: true },
      { id: 'd6', src: 'assets/dreams/flight.png', ratio: '0.857', builtin: true },
      { id: 'd7', src: 'assets/dreams/desk.png', ratio: '1.779', builtin: true }
    ],
    settings: { medMin: '10 minutes', theme: 'Black', lang: 'ES', trackName: null, trackId: null },
    instruments: ['MBT', 'MGC'],
    moves: [], moneyPlanId: null, confirmId: null,
    m: { moneyType: 'Deposit', mAmount: '', mNote: '', mRebase: false },
    f: { fName: '', fCapital: '50', fGoal: '5000000', fWin: '10', fLoss: '5', fAccount: 'Funded' },
    s: {
      acct: 'Funded', eco: 'No', bias: 'Bullish',
      t1d: 'Bullish', s1d: 'Uptrend', z1d: 'Yes', h1d: 'Above price',
      t1h: 'Bullish', s1h: 'Pennant', z1h: 'Yes', h1h: 'Above price',
      t15: 'Bullish', s15: 'Consolidation', z15: 'No', h15: 'Above price',
      t5m: 'Bullish', s5m: 'Consolidation', cvd5m: 'None',
      t1m: 'Bullish', s1m: 'Bart', cvd1m: 'Bullish',
      vaMatch: 'Yes', strength: 'High', divZone: 'VAL',
      h5m: 'Above price', h1m: 'Above price',
      reaction: 'False breakout', pattern: 'Doji', reason: 'Take Profit', result: null
    },
    chk: { liq5m: true, va5m: true, liq1m: true, va1m: true, book: false, retest: false, cvdDiv: false },
    reg: { entry: '', sl: '', tp: '', closePx: '', notes: '' },
    med: { left: 600, running: false, ready: false }
  };
}
let ST = load();
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    return Object.assign(base, saved, {
      f: Object.assign(base.f, saved.f),
      s: Object.assign(base.s, saved.s),
      chk: Object.assign(base.chk, saved.chk),
      reg: Object.assign(base.reg, saved.reg),
      m: Object.assign(base.m, saved.m),
      settings: Object.assign(base.settings, saved.settings),
      med: { left: base.med.left, running: false, ready: false },
      screen: null, sheet: null, picker: null
    });
  } catch (e) { return defaultState(); }
}
function save() {
  try {
    const copy = Object.assign({}, ST);
    // Blob: URLs die with the page — persist only builtin (static-path) dream
    // sources; user-added ones are re-hydrated from IndexedDB on next boot.
    copy.dreams = ST.dreams.map(d => d.builtin ? d : Object.assign({}, d, { src: null }));
    localStorage.setItem(LS_KEY, JSON.stringify(copy));
  } catch (e) { /* storage full or unavailable — app still works this session */ }
}

/* --------------------------------------------------------- indexeddb ---
   Binary blobs (user-added dream photos, meditation track, trade
   screenshots) live here — localStorage is too small and not meant for
   this. Keyed by arbitrary string id. */
const DB_NAME = 'deltraos-files', DB_STORE = 'files';
function idbOpen() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DB_NAME, 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore(DB_STORE);
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbPut(id, blob) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(id) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const rq = tx.objectStore(DB_STORE).get(id);
    rq.onsuccess = () => res(rq.result || null);
    rq.onerror = () => rej(rq.error);
  });
}
async function idbDel(id) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
let pendingShot = null; // File picked on the Register screen, committed on Finalize
let pendingShotUrl = null;

/* ------------------------------------------------------------- clocks */
function tzMin(tz, d) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false })
    .formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return { min: (Number(p.hour) % 24) * 60 + Number(p.minute), dow: p.weekday };
}
function hhmm(m) {
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + mm + ' ' + ap;
}
function gap(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? h + 'h ' + m + 'm' : m + 'm';
}
function session(s, now) {
  const there = tzMin(s.tz, now);
  const here = (now.getHours() * 60) + now.getMinutes();
  const delta = here - there.min;
  const weekend = there.dow === 'Sat' || there.dow === 'Sun';
  const open = !weekend && there.min >= s.open && there.min < s.close;
  const afterClose = there.min >= s.close;
  const nextIsWeekend = weekend || (there.dow === 'Fri' && afterClose);
  return {
    open,
    state: t(open ? 'OPEN' : 'CLOSED'),
    color: open ? 'var(--a700)' : 'var(--n700)',
    dot: open ? 'var(--accent)' : 'var(--n500)',
    window: hhmm(s.open + delta) + '–' + hhmm(s.close + delta) + ' ' + t('your time'),
    src: hhmm(s.open) + '–' + hhmm(s.close) + ' ' + s.label,
    next: nextIsWeekend ? t('opens Monday') : (open ? (t('closes in') + ' ' + gap(s.close - there.min)) : (t('opens in') + ' ' + gap(s.open - there.min)))
  };
}
ES['opens in'] = 'abre en'; ES['closes in'] = 'cierra en';
function sessionKey(d) {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: CME_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const base = new Date(ymd + 'T00:00:00Z');
  if (tzMin(CME_TZ, d).min >= 17 * 60) base.setUTCDate(base.getUTCDate() + 1);
  return base.toISOString().slice(0, 10);
}

/* --------------------------------------------------------------- plan */
function activePlan() { return ST.plans.find(p => p.id === ST.activeId) || null; }
function planRow(p, day) {
  if (!p) return null;
  const cur = ST.day;
  const base = typeof p.dayBase === 'number' ? p.dayBase : p.capital;
  const cap = day >= cur
    ? base * Math.pow(1 + p.win / 100, day - cur)
    : p.capital * Math.pow(1 + p.win / 100, day - 1);
  return { day, cap, tp: cap * p.win / 100, risk: cap * p.loss / 100 };
}
function goalDaysFor(capital, win, goal) {
  if (!(goal > capital) || !(win > 0)) return 1;
  return Math.min(600, Math.ceil(Math.log(goal / capital) / Math.log(1 + win / 100)) + 1);
}
function planDays(p) {
  if (!p) return 0;
  const base = typeof p.dayBase === 'number' ? p.dayBase : p.capital;
  return Math.min(600, (ST.day - 1) + goalDaysFor(base, p.win, p.goal));
}
function perPoint() {
  const i = INSTRUMENTS.find(x => x.code === ST.instrument);
  return i ? i.perPoint : 10;
}
function rollDay() {
  ST.day += 1;
  ST.locked = false;
  ST.plans.forEach(p => { p.dayBase = p.equity; });
  ST.med = { left: medTotal(), running: false, ready: false };
}
function medTotal() { return (parseInt(ST.settings.medMin, 10) || 10) * 60; }

/* =========================================================== rendering
   The whole app renders as HTML strings into #app. Free-text fields use
   oninput handlers that mutate ST directly (no render() call) so focus
   and cursor position are never disturbed; anything else re-renders. */
const $app = () => document.getElementById('app');

function iconSvg(name, size) {
  size = size || 16;
  const ICONS = {
    plus: 'M12 5v14M5 12h14',
    close: 'M18 6 6 18M6 6l12 12',
    chevronDown: 'm6 9 6 6 6-6',
    chevronRight: 'M5 12h14M13 6l6 6-6 6',
    chevronLeft: 'M19 12H5M11 18l-6-6 6-6',
    check: 'M20 6 9 17l-5-5',
    trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
    copy: '<rect x="9" y="9" width="11" height="11"></rect><path d="M15 5H5v10"></path>',
    gear: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>'
  };
  const body = ICONS[name] || '';
  const inner = body.indexOf('<') === 0 ? body : `<path d="${body}"></path>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

function glyphSvg(o, w, h) {
  w = w || 60; h = h || 32;
  const rects = (o.rects || []).map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.fill}"></rect>`).join('');
  const paths = (o.paths || []).map(p => `<path d="${p.d}" fill="none" stroke="${p.s}" stroke-width="${p.w}" stroke-dasharray="${p.dash}"></path>`).join('');
  return `<svg class="glyphbox" width="${w}" height="${h}" viewBox="0 0 60 32">${rects}${paths}</svg>`;
}

/* ---------------------------------------------------------- top shell */
const FLOW_SCREENS = ['step1', 'step2', 'step3', 'step4', 'buy', 'register'];
const NO_CHROME_SCREENS = FLOW_SCREENS.concat(['nomore', 'detail']);

function render() {
  const sc = ST.screen;
  const showTabs = NO_CHROME_SCREENS.indexOf(sc) === -1;
  const inFlow = FLOW_SCREENS.indexOf(sc) !== -1;
  let html = renderHeader();
  if (showTabs) html += renderTabs();
  if (inFlow) html += renderFlowBar();
  html += `<div class="view" id="view">${renderScreen()}</div>`;
  html += renderFab();
  html += renderSheet();
  $app().innerHTML = html;
  document.documentElement.setAttribute('data-theme', ST.settings.theme === 'Black' ? 'dark' : 'light');
  document.documentElement.setAttribute('lang', ST.settings.lang === 'EN' ? 'en' : 'es');
  wireLiveOnce();
  save();
}

function renderHeader() {
  return `
  <div class="bar">
    <div class="bar-row">
      <div class="brand">
        <span class="brand-dot"></span>
        <div class="brand-word">DELTRA<b>OS</b></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="brand-by">by JABS</div>
        <button class="gear" onclick="openSettings()">${iconSvg('gear', 19)}</button>
      </div>
    </div>
  </div>`;
}
function renderTabs() {
  const tabs = [['dash', 'Dashboard'], ['trades', 'Trades'], ['plan', 'Plan'], ['dreams', 'Dreams']];
  return `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${ST.tab === k && !ST.screen ? 'on' : ''}" onclick="goTab('${k}')">${esc(t(l))}</button>`).join('')}</div>`;
}
function renderFlowBar() {
  const crumb = ST.flow === 'next' ? (t('Next trade') + ' · ' + t('Day') + ' ' + ST.day) : (t('First trade') + ' · ' + t('Day') + ' ' + ST.day);
  return `<div class="flowbar">
    <button class="btn btn-ghost" onclick="exitFlow()">${iconSvg('close', 16)}${esc(t('Exit'))}</button>
    <span class="k">${esc(crumb)}</span>
  </div>`;
}
function renderFab() {
  return `<button class="fab" onclick="onPlus()">${iconSvg('plus', 26)}</button>`;
}

function renderScreen() {
  const sc = ST.screen;
  if (sc === null) {
    if (ST.tab === 'trades') return renderTrades();
    if (ST.tab === 'plan') return renderPlan();
    if (ST.tab === 'dreams') return renderDreams();
    return renderDash();
  }
  if (sc === 'step1') return renderStep1();
  if (sc === 'step2') return renderStep2();
  if (sc === 'step3') return renderStep3();
  if (sc === 'step4') return renderStep4();
  if (sc === 'buy') return renderBuy();
  if (sc === 'register') return renderRegister();
  if (sc === 'nomore') return renderNoMore();
  if (sc === 'detail') return renderDetail();
  return renderDash();
}

/* ------------------------------------------------------------ dashboard */
function renderDash() {
  const p = activePlan();
  const row = planRow(p, ST.day);
  const now = new Date();
  const ny = session(NY, now), tk = session(TK, now);
  const cme = tzMin(CME_TZ, now);
  const localClock = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const localZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'local').split('/').pop().replace(/_/g, ' ');

  let out = `<div class="section">
    <div class="pad" style="padding-bottom:8px;display:flex;align-items:baseline;justify-content:space-between;gap:10px;">
      <div class="k">${esc(t('Market sessions'))}</div>
      <div style="font-size:11px;color:var(--n700)" id="localClock">${esc(localZone)} · ${esc(localClock)}</div>
    </div>
    ${[Object.assign({ name: 'New York — RTH' }, ny), Object.assign({ name: 'Tokyo' }, tk)].map((m, i) => `
    <div class="hair" style="display:flex;align-items:center;gap:10px;padding:10px 16px;" id="sess-${i}">
      <span style="width:9px;height:9px;flex:none;background:${m.dot};"></span>
      <span style="flex:1;min-width:0;">
        <span class="num" style="font-size:14px;">${esc(t(m.name))}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(m.window)}</span>
        <span style="display:block;font-size:10px;color:var(--n500);">${esc(m.src)}</span>
      </span>
      <span style="text-align:right;flex:none;">
        <span class="num" style="font-size:12px;color:${m.color};">${esc(m.state)}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(m.next)}</span>
      </span>
    </div>`).join('')}
    <div class="hair" style="padding:8px 16px 12px;font-size:11px;color:var(--n700);" id="cmeNote">${esc(cmeNoteText(cme))}</div>
  </div>`;

  if (!p) {
    out += `<div class="pad">
      <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--a700);">${esc(t('Setup required'))}</div>
      <h2 style="margin-top:8px;">${esc(t('No investment plan yet.'))}</h2>
      <hr class="hr">
      <p style="font-size:14px;max-width:30ch;">${esc(t('Every trade in DeltraOS is sized by your plan. Create one to unlock the trade flow.'))}</p>
      <button class="btn btn-primary btn-block" onclick="openNewPlan()">${esc(t('New plan'))}${iconSvg('plus')}</button>
    </div>`;
    return out;
  }

  const trades = tradesView();
  const closed = trades.filter(x => x.result !== 'BE');
  const wins = trades.filter(x => x.pnl > 0);
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) + '%' : '—';
  const avgR = closed.length ? (((wins.length * 2) - (closed.length - wins.length)) / closed.length).toFixed(1) + 'R' : '—';
  const { projPath, realPath } = equityPaths(p);

  out += `
  <div class="pad section">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div class="k">${esc(p.name)} · ${esc(t(p.account))}</div>
      <span class="tag ${ST.locked ? 'tag-accent' : 'tag-neutral'}">${esc(t(ST.locked ? 'SESSION LOCKED' : 'SESSION OPEN'))}</span>
    </div>
    <div class="dotnum" style="font-size:40px;margin-top:8px;">${money(p.equity)}</div>
    <div class="grid3" style="margin-top:14px;border-top:1px solid var(--divider);gap:0;">
      <div style="padding:10px 10px 0 0;border-right:1px solid var(--divider);">
        <div class="k">${esc(t('Day'))}</div><div class="num" style="font-size:17px;">${ST.day}</div>
      </div>
      <div style="padding:10px 10px 0;border-right:1px solid var(--divider);">
        <div class="k">${esc(t('Target TP'))}</div><div class="num" style="font-size:17px;">${row ? money(row.tp) : '—'}</div>
      </div>
      <div style="padding:10px 0 0 10px;">
        <div class="k">${esc(t('Risk cap'))}</div><div class="num" style="font-size:17px;color:var(--a700);">${row ? money(row.risk) : '—'}</div>
      </div>
    </div>
  </div>
  <div class="pad section">
    <div class="k">${esc(t('Equity vs. projection'))}</div>
    <svg viewBox="0 0 340 120" style="width:100%;height:120px;margin-top:10px;display:block;">
      <line x1="0" y1="119" x2="340" y2="119" stroke="var(--n400)" stroke-width="1"></line>
      <path d="${projPath}" fill="none" stroke="var(--n500)" stroke-width="2" stroke-dasharray="4 4"></path>
      <path d="${realPath}" fill="none" stroke="var(--accent)" stroke-width="3"></path>
    </svg>
    <div style="display:flex;gap:16px;font-size:11px;color:var(--n700);">
      <span><span style="display:inline-block;width:14px;height:3px;background:var(--accent);vertical-align:middle;margin-right:5px;"></span>${esc(t('Actual'))}</span>
      <span><span style="display:inline-block;width:14px;height:2px;background:var(--n500);vertical-align:middle;margin-right:5px;"></span>${esc(t('Plan'))}</span>
    </div>
  </div>
  <div class="grid3" style="gap:0;" class="section">
    <div style="padding:12px 16px;border-right:1px solid var(--divider);border-bottom:2px solid var(--divider);">
      <div class="k">${esc(t('Win rate'))}</div><div class="num" style="font-size:20px;">${winRate}</div>
    </div>
    <div style="padding:12px 16px;border-right:1px solid var(--divider);border-bottom:2px solid var(--divider);">
      <div class="k">${esc(t('Avg R'))}</div><div class="num" style="font-size:20px;">${avgR}</div>
    </div>
    <div style="padding:12px 16px;border-bottom:2px solid var(--divider);">
      <div class="k">${esc(t('Streak'))}</div><div class="num" style="font-size:20px;">${ST.streak ? ST.streak + 'W' : '0'}</div>
    </div>
  </div>
  <div class="pad" style="padding-bottom:6px;"><div class="k">${esc(t('Recent trades'))}</div></div>
  ${trades.length === 0 ? `<div class="pad" style="padding-top:0;font-size:13px;color:var(--n700);">${esc(t('Nothing logged yet. Tap + to run the model.'))}</div>` : trades.slice(0, 4).map(tr => tradeRowHtml(tr)).join('')}
  <div style="padding:20px 16px 8px;"></div>`;
  return out;
}
ES['Plan'] = 'Plan';
function cmeNoteText(cme) {
  const label = ST.settings.lang === 'EN' ? 'Trading day resets at' : 'El día de trading reinicia a las';
  const now = ST.settings.lang === 'EN' ? 'now' : 'ahora';
  return `${label} ${hhmm(1020)} CT · ${now} ${hhmm(cme.min)} CT`;
}
function equityPaths(p) {
  const N = 30;
  const maxCap = p.capital * Math.pow(1 + p.win / 100, N - 1);
  const y = v => 119 - (v / maxCap) * 112;
  const x = i => (i / (N - 1)) * 338 + 1;
  const projPath = Array.from({ length: N }, (_, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.capital * Math.pow(1 + p.win / 100, i)).toFixed(1)).join(' ');
  const pts = [p.capital];
  const events = ST.trades.map(tr => ({ at: new Date(tr.time).getTime(), v: tr.pnl }))
    .concat(ST.moves.filter(m => m.planId === p.id).map(m => ({ at: new Date(m.time).getTime(), v: m.signed })))
    .sort((a, b) => a.at - b.at);
  events.forEach(ev => pts.push(pts[pts.length - 1] + ev.v));
  let realPath = pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  if (pts.length === 1) realPath = 'M' + x(0).toFixed(1) + ' ' + y(pts[0]).toFixed(1) + ' L' + x(0.4).toFixed(1) + ' ' + y(pts[0]).toFixed(1);
  return { projPath, realPath };
}
function tradesView() {
  return ST.trades.map(tr => ({
    id: tr.id, instrument: tr.instrument, side: tr.side, account: tr.account, zone: tr.zone, result: tr.result, pnl: tr.pnl,
    meta: t('Day') + ' ' + tr.day + ' · ' + tr.zone + ' · ' + t(tr.result === 'BE' ? 'Break even' : tr.result),
    pnlFmt: (tr.pnl > 0 ? '+' : '') + money(tr.pnl),
    color: tr.pnl > 0 ? 'var(--text)' : tr.pnl < 0 ? 'var(--accent)' : 'var(--n700)'
  }));
}
function tradeRowHtml(tr) {
  return `<button class="row" onclick="openDetail('${tr.id}')">
    <span><span class="num" style="font-size:14px;">${esc(tr.instrument)} ${esc(tr.side)}</span>
    <span style="display:block;font-size:11px;color:var(--n700);">${esc(tr.meta)}</span></span>
    <span class="num" style="font-size:15px;color:${tr.color};">${esc(tr.pnlFmt)}</span>
  </button>`;
}

/* --------------------------------------------------------------- trades */
function renderTrades() {
  const accounts = ['Funded', 'Evaluation', 'Live', 'Demo'];
  const trades = tradesView().filter(tr => tr.account === ST.s.acct);
  return `
  <div class="pad section">
    <h3>${esc(t('Trades'))}</h3>
    <div class="k" style="margin-bottom:6px;">${esc(t('Account'))}</div>
    <div class="seg">${accounts.map(a => `<label class="seg-opt ${ST.s.acct === a ? 'on' : ''}"><input type="radio" name="acct" ${ST.s.acct === a ? 'checked' : ''} onchange="setField('s','acct','${a}')"><span>${esc(t(a))}</span></label>`).join('')}</div>
  </div>
  ${trades.length === 0 ? `<div class="pad"><h4>${esc(t('No trades on this account.'))}</h4><p style="font-size:13px;color:var(--n700);margin-top:6px;">${esc(t('Each trade JABS runs is summarised here. Tap a row for the full checklist.'))}</p></div>` :
    trades.map(tr => `<button class="row" onclick="openDetail('${tr.id}')">
      <span><span class="num" style="font-size:14px;">${esc(tr.instrument)} ${esc(tr.side)}</span>
      <span style="display:block;font-size:11px;color:var(--n700);">${esc(tr.meta)}</span></span>
      <span style="text-align:right;"><span class="num" style="font-size:15px;color:${tr.color};">${esc(tr.pnlFmt)}</span>
      <span style="display:block;font-size:11px;color:var(--n700);">${esc(tr.zone)}</span></span>
    </button>`).join('')}
  <div style="padding:24px 16px;"></div>`;
}

/* ----------------------------------------------------------------- plan */
function renderPlan() {
  const p = activePlan();
  let out = `<div class="pad section">
    <h3>${esc(t('Plan'))}</h3>
    <p style="font-size:13px;color:var(--n700);margin:0;">${esc(t('Risk and take-profit per day, compounded from your capital. One plan is active; the rest stay archived.'))}</p>
    <button class="btn btn-primary btn-block" onclick="openNewPlan()">${esc(t('Add new plan'))}${iconSvg('plus')}</button>
  </div>`;
  if (!ST.plans.length) {
    out += `<div class="pad" style="font-size:13px;color:var(--n700);">${esc(t('No plans saved.'))}</div>`;
  }
  ST.plans.forEach(pl => {
    const isActive = pl.id === ST.activeId;
    out += `<div class="pad hair">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <span><span class="num" style="font-size:15px;">${esc(pl.name)}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(t(pl.account))} · ${money(pl.capital)} ${ST.settings.lang === 'EN' ? 'base' : 'base'} · ${pl.win}% TP / ${pl.loss}% ${esc(t('Risk')).toLowerCase()}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(t('Equity after')).split(' ')[0]} ${money(pl.equity)} · ${esc(t('Goal').toLowerCase())} ${money(pl.goal)}</span></span>
        <span class="tag ${isActive ? 'tag-accent' : 'tag-neutral'}">${esc(t(isActive ? 'ACTIVE' : 'ARCHIVED'))}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
        <button class="btn btn-secondary" onclick="planAction('activate','${pl.id}')">${esc(t('Set active'))}</button>
        <button class="btn btn-secondary" onclick="planAction('deposit','${pl.id}')">${esc(t('Deposit'))}</button>
        <button class="btn btn-secondary" onclick="planAction('withdraw','${pl.id}')">${esc(t('Withdraw'))}</button>
        <button class="btn btn-ghost" onclick="planAction('delete','${pl.id}')">${esc(t('Delete'))}</button>
      </div>
    </div>`;
  });
  if (ST.moves.length) {
    out += `<div class="pad" style="padding-bottom:6px;"><div class="k">${esc(t('Capital movements'))}</div></div>`;
    ST.moves.forEach(m => {
      const note = m.note ? esc(m.note) : (m.rebase ? esc(t('rebased')) : esc(t('no note')));
      out += `<div class="hair" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;">
        <span><span class="num" style="font-size:14px;">${esc(t(m.type))}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(m.planName || 'Plan')} · ${esc(t('Day').toLowerCase())} ${m.day} · ${note}${m.rebase && m.note ? ' · ' + esc(t('rebased')) : ''}</span></span>
        <span style="display:flex;align-items:center;gap:8px;">
          <span class="num" style="font-size:15px;color:${m.signed > 0 ? 'var(--text)' : 'var(--accent)'};">${m.signed > 0 ? '+' : ''}${money(m.signed)}</span>
          <button class="btn btn-ghost" onclick="deleteMove('${m.id}')">${iconSvg('trash', 15)}</button>
        </span>
      </div>`;
    });
  }
  if (p) {
    const days = planDays(p);
    const rows = Array.from({ length: days }, (_, i) => planRow(p, i + 1));
    out += `<div style="padding-top:8px;">
      <div class="grid2" style="gap:0;border-bottom:2px solid var(--divider);">
        <div style="padding:10px 16px;border-right:1px solid var(--divider);"><div class="k">${esc(t('Goal'))}</div><div class="num" style="font-size:17px;">${money(p.goal)}</div></div>
        <div style="padding:10px 16px;"><div class="k">${esc(t('Sessions to goal'))}</div><div class="num" style="font-size:17px;">${days} ${esc(ST.settings.lang === 'EN' ? 'sessions' : 'sesiones')}</div></div>
      </div>
      <div style="overflow-x:auto;"><table class="table"><thead><tr><th>${esc(t('Day'))}</th><th>${esc(t('Capital'))}</th><th>${esc(t('First TP'))}</th><th>${esc(t('Risk'))}</th></tr></thead><tbody>
      ${rows.map(r => `<tr style="background:${r.day === ST.day ? 'var(--a100)' : 'transparent'};"><td class="num">${r.day}</td><td class="num">${money(r.cap)}</td><td class="num">${money(r.tp)}</td><td class="num" style="color:var(--a700);">${money(r.risk)}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="pad" style="font-size:11px;color:var(--n700);">${esc(t('Position size must keep the stop distance at or under the day’s risk. The TP is an approximation of a 1:2 target — it can be larger.'))}</div>
    </div>`;
  }
  return out;
}

/* ------------------------------------------------------------- dreams */
function renderDreams() {
  const count = ST.dreams.length === 1 ? '1 ' + (ST.settings.lang === 'EN' ? 'image' : 'imagen') : ST.dreams.length + ' ' + (ST.settings.lang === 'EN' ? 'images' : 'imágenes');
  let out = `<div class="pad section">
    <h3>${esc(t('Dreams'))}</h3>
    <p style="font-size:15px;margin:0;font-weight:800;line-height:1.2;border-left:2px solid var(--accent);padding-left:10px;">${esc(t('Everything you fight for deserves your patience, dedication and discipline.'))}</p>
  </div>
  <div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;">
    <span class="k">${esc(count)}</span>
    <label class="btn btn-secondary" style="cursor:pointer;margin:0;">${esc(t('Add images'))}
      <input type="file" accept="image/*" multiple onchange="addDreams(this)" style="position:absolute;opacity:0;width:0;height:0;">
    </label>
  </div>
  <div class="dream-grid">
    ${ST.dreams.map(d => `<div class="dream-item">
      <div class="dream-img" style="aspect-ratio:${d.ratio};${d.src ? `background-image:url('${d.src}');` : ''}"></div>
      <button class="dream-x" onclick="removeDream('${d.id}')">${iconSvg('close', 13)}</button>
    </div>`).join('')}
  </div>
  ${ST.dreams.length === 0 ? `<div class="pad hair" style="padding-top:40px;"><div class="k" style="margin-bottom:6px;">${esc(t('Empty'))}</div><p style="font-size:14px;margin:0;">${esc(t('Add the images of what you fight for. The app arranges them on its own.'))}</p></div>` : ''}
  <div style="padding:24px 16px;"></div>`;
  return out;
}

/* ----------------------------------------------------------- flow: 1-4 */
function renderStep1() {
  const left = ST.med.left, ready = ST.med.ready, running = ST.med.running;
  const total = medTotal();
  const dash = (584 * (1 - left / total)).toFixed(1) + ' 584';
  const clock = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  const label = ready ? t('Mind clear — you may trade') : running ? t('Eyes closed · slow inhale · slower exhale') : t('Tap to begin the meditation');
  return `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(flowLabelStep(1))}</div>
    <h3 style="margin-top:4px;">${esc(t('Mental state'))}</h3>
  </div>
  <div class="pad">
    <p style="font-size:14px;">${esc(t('Start your day with a meditation. Get to that cold, disciplined, efficient state. Leave behind any euphoric or self-destructive impulse.'))}</p>
    <p style="font-size:14px;">${esc(t('Everything is in order. Trust your plan, trust your model, trust yourself. The outside does not matter — the now matters.'))}</p>
    <div style="margin-top:16px;border-left:2px solid var(--accent);padding:8px 0 8px 12px;">
      <div class="k">${esc(t('Mantra'))}</div>
      <div style="font-weight:800;font-size:19px;line-height:1.15;margin-top:3px;">“Construyo con estrategia libertad plena y estable”</div>
    </div>
    <div style="display:flex;justify-content:center;padding:26px 0 10px;">
      <button id="medBtn" style="width:196px;height:196px;border-radius:50%;border:2px solid var(--text);background:transparent;cursor:pointer;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:inherit;color:inherit;" onclick="onMed()">
        <svg viewBox="0 0 200 200" style="position:absolute;inset:-2px;width:200px;height:200px;transform:rotate(-90deg);">
          <circle cx="100" cy="100" r="93" fill="none" stroke="var(--accent)" stroke-width="12" stroke-dasharray="${dash}" id="medRing"></circle>
        </svg>
        <span class="dotnum" id="medClock" style="font-size:44px;line-height:1;">${clock}</span>
        <span class="k" id="medLabel" style="max-width:140px;text-align:center;line-height:1.4;">${esc(label)}</span>
      </button>
    </div>
    ${ready ? `<button class="btn btn-primary btn-block" onclick="goScreen('step2')">${esc(t('Ready — go to fundamentals'))}${iconSvg('chevronRight')}</button>` : ''}
    <div style="height:20px;"></div>
  </div>`;
}
function flowLabelStep(n) {
  const flow = ST.flow === 'next' ? t('Next trade') : t('First trade');
  const stepWord = ST.settings.lang === 'EN' ? ('— Step ' + n + ' of 4') : ('— Paso ' + n + ' de 4');
  return flow + ' ' + stepWord;
}
function renderStep2() {
  const s = ST.s;
  return `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(flowLabelStep(2))}</div>
    <h3 style="margin-top:4px;">${esc(t('Fundamentals'))}</h3>
  </div>
  <div class="pad hair">
    <div class="card-title">${esc(t('Economic calendar'))}</div>
    <p style="font-size:13px;margin:4px 0 10px;color:var(--n800);">${esc(t('Any high-impact events today?'))}</p>
    <div class="seg">${['Yes', 'No'].map(v => `<label class="seg-opt ${s.eco === v ? 'on' : ''}"><input type="radio" ${s.eco === v ? 'checked' : ''} onchange="setFieldR('eco','${v}')"><span>${esc(t(v))}</span></label>`).join('')}</div>
    ${s.eco === 'Yes' ? `<div class="callout" style="margin-top:10px;">${esc(t('Careful — the market may not respect the model on high-impact news.'))}</div>` : ''}
  </div>
  <div class="pad hair">
    <div class="card-title">${esc(t('AI analysis & perspective'))}</div>
    <p style="font-size:13px;margin:4px 0 10px;color:var(--n800);">${esc(t('Copy the research prompt, run it in your AI, then record the bias it returns.'))}</p>
    <button class="btn btn-secondary btn-block" id="copyBtn" onclick="copyPrompt()">${esc(t('Copy AI prompt'))}${iconSvg('copy')}</button>
    <div class="k" style="margin:14px 0 6px;">${esc(t('Higher probability'))}</div>
    <div class="seg">${['Bullish', 'Bearish'].map(v => `<label class="seg-opt ${s.bias === v ? 'on' : ''}"><input type="radio" ${s.bias === v ? 'checked' : ''} onchange="setFieldR('bias','${v}')"><span>${esc(t(v))}</span></label>`).join('')}</div>
    <div style="margin-top:10px;font-size:12px;color:var(--n700);">${esc(t('Treat it only as a probability, never a certainty.'))}</div>
  </div>
  <div class="pad">
    <button class="btn btn-primary btn-block" onclick="goScreen('step3')">${esc(t('Continue to general trend'))}${iconSvg('chevronRight')}</button>
  </div>`;
}
function selectHtml(k, val, options, onchange) {
  // value stays the canonical English token (calc code compares against it);
  // only the visible label is translated.
  return `<select class="input" onchange="${onchange}">${options.map(o => `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(t(o))}</option>`).join('')}</select>`;
}
function renderStep3() {
  const s = ST.s;
  const rows = [
    ['1D', 't1d', 's1d', 'z1d', 'h1d'], ['1H', 't1h', 's1h', 'z1h', 'h1h'], ['15m', 't15', 's15', 'z15', 'h15']
  ];
  const trends = [s.t1d, s.t1h, s.t15];
  const bull = trends.filter(x => x === 'Bullish').length, bear = trends.filter(x => x === 'Bearish').length;
  const general = bull > bear ? 'Bullish' : bear > bull ? 'Bearish' : 'Mixed';
  let out = `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(flowLabelStep(3))}</div>
    <h3 style="margin-top:4px;">${esc(t('General trend'))}</h3>
  </div>`;
  rows.forEach(([tf, tk_, sk, zk, hk]) => {
    out += `<div class="pad hair">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="num" style="background:var(--text);color:var(--bg);padding:3px 8px;font-size:12px;">${tf}</span>
        <div style="flex:1;">${selectHtml(tk_, s[tk_], ['Bullish', 'Bearish', 'Range'], `setFieldSel('${tk_}',this.value)`)}</div>
      </div>
      <div class="k" style="margin:12px 0 4px;">${esc(t('Structure'))}</div>
      <button class="input" onclick="openPicker('structureHtf','${sk}')" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;">
        <span>${esc(gname(s[sk]))}</span>${iconSvg('chevronDown', 14)}
      </button>
      <div class="k" style="margin:12px 0 4px;">${esc(t('Near high-impact zone'))}</div>
      ${selectHtml(zk, s[zk], ['Yes', 'No'], `setFieldSel('${zk}',this.value)`)}
    </div>`;
  });
  out += `<div class="section pad" style="display:flex;align-items:center;justify-content:space-between;">
    <div class="k">${esc(t('General trend'))}</div><div class="num" style="font-size:18px;color:var(--a700);">${esc(t(general))}</div>
  </div>
  <div class="pad"><button class="btn btn-primary btn-block" onclick="goScreen('step4')">${esc(t('Continue to auction zone'))}${iconSvg('chevronRight')}</button></div>`;
  return out;
}
function renderStep4() {
  const s = ST.s, chk = ST.chk;
  const ltf = [
    ['5m', 't5m', 's5m', 'cvd5m', 'liq5m', 'va5m', 'h5m', true],
    ['1m', 't1m', 's1m', 'cvd1m', 'liq1m', 'va1m', 'h1m', true]
  ];
  let out = `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(flowLabelStep(4))}</div>
    <h3 style="margin-top:4px;">${esc(t('Scalping auction zone'))}</h3>
  </div>`;
  ltf.forEach(([tf, tk_, sk, ck, liqKey, vaKey, hk]) => {
    out += `<div class="pad hair">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="num" style="background:var(--text);color:var(--bg);padding:3px 8px;font-size:12px;">${tf}</span>
        <div style="flex:1;">${selectHtml(tk_, s[tk_], ['Bullish', 'Bearish', 'Range'], `setFieldSel('${tk_}',this.value)`)}</div>
      </div>
      <div class="k" style="margin:12px 0 4px;">${esc(t('Structure'))}</div>
      <button class="input" onclick="openPicker('structure','${sk}')" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;">
        <span>${esc(gname(s[sk]))}</span>${iconSvg('chevronDown', 14)}
      </button>
      <label class="chk-row"><span style="font-size:14px;">${esc(t('Liquidity zones marked'))}</span>
        <span class="tag ${chk[liqKey] ? 'tag-accent' : 'tag-neutral'}" onclick="event.preventDefault();toggleChk('${liqKey}')" style="cursor:pointer;">${esc(t(chk[liqKey] ? 'DONE' : 'PENDING'))}</span></label>
      <label class="chk-row"><span style="font-size:14px;">${esc(t('VAH, VAL, POC zones'))}</span>
        <span class="tag ${chk[vaKey] ? 'tag-accent' : 'tag-neutral'}" onclick="event.preventDefault();toggleChk('${vaKey}')" style="cursor:pointer;">${esc(t(chk[vaKey] ? 'DONE' : 'PENDING'))}</span></label>
      <div class="grid2" style="margin-top:12px;">
        <div><div class="k" style="margin-bottom:4px;">${esc(t('CVD divergence'))}</div>
          <button class="input" onclick="openPicker('cvd','${ck}')" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;">
            <span>${esc(gname(s[ck]))}</span>${iconSvg('chevronDown', 14)}</button></div>
        <div><div class="k" style="margin-bottom:4px;">${esc(t('Heatmap liquidity'))}</div>
          ${selectHtml(hk, s[hk], ['Above price', 'Below price'], `setFieldSel('${hk}',this.value)`)}</div>
      </div>
    </div>`;
  });
  out += `<div class="pad hair">
    <div class="grid2">
      <div><div class="k" style="margin-bottom:4px;">${esc(t('VA 1m / 5m match'))}</div>${selectHtml('vaMatch', s.vaMatch, ['Yes', 'No'], `setFieldSel('vaMatch',this.value)`)}</div>
      <div><div class="k" style="margin-bottom:4px;">${esc(t('Divergence strength'))}</div>${selectHtml('strength', s.strength, ['Low', 'Medium', 'High'], `setFieldSel('strength',this.value)`)}</div>
    </div>
    <div class="k" style="margin:12px 0 4px;">${esc(t('Divergence zone — trades are always taken in the value area'))}</div>
    ${selectHtml('divZone', s.divZone, ['VAL', 'VAH', 'POC 1m', 'POC 5m'], `setFieldSel('divZone',this.value)`)}
  </div>`;
  const side = general3(s) === 'Bearish' ? 'SELL' : 'BUY';
  const conf = 50 + (s.strength === 'High' ? 25 : s.strength === 'Medium' ? 12 : 0) + (s.vaMatch === 'Yes' ? 10 : 0) + (s.cvd1m !== 'None' ? 15 : 0);
  const p = activePlan(), row = planRow(p, ST.day);
  const riskFmt = row ? money(row.risk) : '—';
  const dist = row ? row.risk / perPoint() : null;
  const contracts = row ? Math.max(1, Math.floor(row.risk / (0.0001 + (dist || 1) * perPoint()))) : 1;
  const sizeHint = ST.settings.lang === 'EN'
    ? `Suggested size: ${contracts} ${ST.instrument} — keeps the stop within the day’s risk of ${riskFmt}.`
    : `Tamaño sugerido: ${contracts} ${ST.instrument} — mantiene el stop dentro del riesgo del día de ${riskFmt}.`;
  out += `<div class="pad" style="background:var(--text);color:var(--bg);">
    <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--a500,var(--accent));">${esc(t('Results'))}</div>
    <div class="dotnum" style="font-size:32px;margin-top:6px;">${side} <span class="num" style="font-size:14px;color:var(--n400);">${Math.min(95, conf)}${ST.settings.lang === 'EN' ? '% probability' : '% de probabilidad'}</span></div>
    <div class="grid2" style="gap:1px;margin-top:14px;background:var(--n700);">
      <div style="background:var(--bg);padding:10px 12px 10px 0;"><div class="k" style="color:var(--n500);">${esc(t('Zone'))}</div><div class="num" style="font-size:15px;">${esc(s.divZone)}</div></div>
      <div style="background:var(--bg);padding:10px 0 10px 12px;"><div class="k" style="color:var(--n500);">${esc(t('Stop loss'))}</div><div class="num" style="font-size:15px;">${esc(t('Lowest liquidity zone'))}</div></div>
      <div style="background:var(--bg);padding:10px 12px 10px 0;"><div class="k" style="color:var(--n500);">${esc(t('Take profit'))}</div><div class="num" style="font-size:15px;">${esc(t('POC 5m (upper limit)'))}</div></div>
      <div style="background:var(--bg);padding:10px 0 10px 12px;"><div class="k" style="color:var(--n500);">${esc(t('Max loss'))}</div><div class="num" style="font-size:15px;color:var(--accent);">${riskFmt}</div></div>
    </div>
    <div style="margin-top:12px;font-size:12px;color:var(--n400);">${esc(sizeHint)}</div>
  </div>
  <div class="pad"><button class="btn btn-primary btn-block" onclick="startTrade()">${esc(t('Start trade'))}${iconSvg('chevronRight')}</button></div>`;
  return out;
}
function general3(s) {
  const trends = [s.t1d, s.t1h, s.t15];
  const bull = trends.filter(x => x === 'Bullish').length, bear = trends.filter(x => x === 'Bearish').length;
  return bull > bear ? 'Bullish' : bear > bull ? 'Bearish' : 'Mixed';
}

/* ---------------------------------------------------------------- buy */
function renderBuy() {
  const chk = ST.chk, s = ST.s;
  const side = general3(s) === 'Bearish' ? 'SELL' : 'BUY';
  return `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(t('Execution'))}</div>
    <h3 style="margin-top:4px;">Let’s ${side}</h3>
  </div>
  <div class="pad hair">
    <label class="chk-row"><span class="card-title">${esc(t('Open Bookmap'))}</span>
      <span class="tag ${chk.book ? 'tag-accent' : 'tag-neutral'}" onclick="event.preventDefault();toggleChk('book')" style="cursor:pointer;">${esc(t(chk.book ? 'DONE' : 'PENDING'))}</span></label>
    <p style="font-size:13px;margin:4px 0 0;color:var(--n800);">${esc(t('Identify the zone of interest and wait for price to approach it. Once it touches: volume increases (DOTS), sellers get absorbed, and the first rejection prints. Confirm with a CVD candle divergence.'))}</p>
  </div>
  <div class="pad hair">
    <label class="chk-row"><span class="card-title">${esc(t('Zone retest'))}</span>
      <span class="tag ${chk.retest ? 'tag-accent' : 'tag-neutral'}" onclick="event.preventDefault();toggleChk('retest')" style="cursor:pointer;">${esc(t(chk.retest ? 'DONE' : 'PENDING'))}</span></label>
    <p style="font-size:13px;margin:4px 0 0;color:var(--n800);"><b>${esc(t('PATIENCE.'))}</b> ${esc(t('Price must retest the zone — that is the key moment to trade.'))}</p>
  </div>
  <div class="pad hair">
    <div class="k" style="margin-bottom:4px;">${esc(t('Market reaction'))}</div>
    <button class="input" onclick="openPicker('reaction','reaction')" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;">
      <span>${esc(t(s.reaction))}</span>${iconSvg('chevronDown', 14)}</button>
    <label class="chk-row" style="margin-top:12px;"><span style="font-size:14px;">${esc(t('CVD candle divergence'))}</span>
      <span class="tag ${chk.cvdDiv ? 'tag-accent' : 'tag-neutral'}" onclick="event.preventDefault();toggleChk('cvdDiv')" style="cursor:pointer;">${esc(t(chk.cvdDiv ? 'DONE' : 'PENDING'))}</span></label>
    <div class="k" style="margin:12px 0 4px;">${esc(t('Candle pattern with the divergence'))}</div>
    <button class="input" onclick="openPicker('pattern','pattern')" style="display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;">
      <span>${esc(gname(s.pattern))}</span>${iconSvg('chevronDown', 14)}</button>
  </div>
  <div class="pad">
    <div class="callout">${esc(t('This confirmation marks a new liquidity zone — usable as your stop loss — and confirms the change of trend toward the next point of interest.'))}</div>
    <button class="btn btn-primary btn-block" onclick="goScreen('register')">${esc(t('Register trade'))}${iconSvg('chevronRight')}</button>
  </div>`;
}

/* ----------------------------------------------------------- register */
function regNumbers() {
  const reg = ST.reg;
  const nEntry = parseFloat(reg.entry), nSl = parseFloat(reg.sl), nTp = parseFloat(reg.tp);
  const riskDist = Math.abs(nEntry - nSl), rewardDist = Math.abs(nTp - nEntry);
  const rr = riskDist > 0 ? '1:' + (rewardDist / riskDist).toFixed(1).replace('.0', '') : '—';
  const p = activePlan(), row = planRow(p, ST.day);
  const pnl = ST.s.result === 'Profit' ? (row ? row.tp : 0) : ST.s.result === 'Lose' ? -(row ? row.risk : 0) : 0;
  return { rr, pnl, row };
}
function renderRegister() {
  const s = ST.s, reg = ST.reg;
  const { rr, pnl, row } = regNumbers();
  const p = activePlan();
  const tpFmt = row ? money(row.tp) : '—', riskFmt = row ? money(row.risk) : '—';
  return `<div class="section pad">
    <div class="k" style="color:var(--a700);">${esc(ST.instrument)} · ${esc(t(s.acct))}</div>
    <h3 style="margin-top:4px;">${esc(t('Register trade'))}</h3>
  </div>
  <div class="pad hair grid3">
    <div class="field"><label>${esc(t('Entry'))}</label><input class="input num" id="f_entry" value="${esc(reg.entry)}" oninput="ST.reg.entry=this.value;save();updateRegisterPreview()"></div>
    <div class="field"><label>${esc(t('Stop loss'))}</label><input class="input num" id="f_sl" value="${esc(reg.sl)}" oninput="ST.reg.sl=this.value;save();updateRegisterPreview()"></div>
    <div class="field"><label>${esc(t('Take profit'))}</label><input class="input num" id="f_tp" value="${esc(reg.tp)}" oninput="ST.reg.tp=this.value;save();updateRegisterPreview()"></div>
  </div>
  <div style="font-size:11px;color:var(--n700);padding:0 16px 12px;margin-top:-4px;">${esc(t('Starter values — adjust to your real fill.'))}</div>
  <div class="pad hair" style="display:flex;align-items:center;justify-content:space-between;">
    <div class="k">${esc(t('Risk / reward'))}</div><div class="num" id="rrOut" style="font-size:24px;">${esc(rr)}</div>
  </div>
  <div class="pad hair">
    <div class="k" style="margin-bottom:6px;">${esc(t('Result'))}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:stretch;">
      <label style="cursor:pointer;border:2px solid var(--text);padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:${s.result === 'Profit' ? 'var(--text)' : 'transparent'};color:${s.result === 'Profit' ? 'var(--bg)' : 'var(--text)'};">
        <span class="k" style="color:${s.result === 'Profit' ? 'var(--bg)' : 'var(--n700)'};">${esc(t(s.result === 'Profit' ? 'SELECTED' : 'TAKE PROFIT'))}</span>
        <span style="font-weight:800;font-size:17px;line-height:1;">${esc(t('Profit'))}</span>
        <span class="num" style="font-size:12px;">+${tpFmt}</span>
        <input type="radio" name="res" ${s.result === 'Profit' ? 'checked' : ''} onchange="setResult('Profit')" style="position:absolute;opacity:0;">
      </label>
      <label style="cursor:pointer;border:2px solid var(--text);padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:${s.result === 'Lose' ? 'var(--a700)' : 'transparent'};color:${s.result === 'Lose' ? 'var(--bg)' : 'var(--text)'};">
        <span class="k" style="color:${s.result === 'Lose' ? 'var(--bg)' : 'var(--n700)'};">${esc(t(s.result === 'Lose' ? 'SELECTED' : 'STOP LOSS'))}</span>
        <span style="font-weight:800;font-size:17px;line-height:1;">${esc(t('Lose'))}</span>
        <span class="num" style="font-size:12px;">−${riskFmt}</span>
        <input type="radio" name="res" ${s.result === 'Lose' ? 'checked' : ''} onchange="setResult('Lose')" style="position:absolute;opacity:0;">
      </label>
      <button style="border:2px solid var(--n500);background:transparent;color:inherit;cursor:pointer;padding:0 14px;font-weight:800;font-size:15px;" onclick="askBE()">BE?</button>
    </div>
    <div class="k" style="margin:14px 0 4px;">${esc(t('Close reason'))}</div>
    ${selectHtml('reason', s.reason, ['Take Profit', 'Stop Loss', 'Manual close', 'Break even', 'Time stop'], `setFieldSel('reason',this.value)`)}
    <div class="grid2" style="margin-top:12px;">
      <div class="field"><label>${esc(t('Close price'))}</label><input class="input num" value="${esc(reg.closePx)}" oninput="ST.reg.closePx=this.value;save()"></div>
      <div><div class="k" style="margin-bottom:4px;">P&amp;L</div><div class="num" id="pnlOut" style="font-size:20px;color:${pnl > 0 ? 'var(--text)' : pnl < 0 ? 'var(--accent)' : 'var(--n700)'};">${pnl > 0 ? '+' : ''}${money(pnl)}</div></div>
    </div>
  </div>
  <div class="pad hair">
    <div class="field"><label>${esc(t('Notes'))}</label><textarea class="input" oninput="ST.reg.notes=this.value;save()">${esc(reg.notes)}</textarea></div>
    <div class="k" style="margin:12px 0 6px;">${esc(t('Screenshot'))}</div>
    <label style="display:block;cursor:pointer;">
      <div class="dashed" id="shotPreview">${pendingShotUrl ? `<img src="${pendingShotUrl}">` : `<span style="font-family:var(--font-mono);font-size:11px;color:var(--n700);">${esc(t('upload chart capture'))}</span>`}</div>
      <input type="file" accept="image/*" onchange="pickShot(this)" style="position:absolute;opacity:0;width:0;height:0;">
    </label>
  </div>
  <div class="pad">
    <button class="btn btn-primary btn-block" onclick="finalizeTrade()">${esc(t('Finalize'))}${iconSvg('check')}</button>
    <div style="margin-top:10px;font-size:12px;color:var(--n700);">${esc(t('A win keeps the session open. A loss locks real accounts until the next session. Break even logs the trade and returns here.'))}</div>
  </div>`;
}
function updateRegisterPreview() {
  const { rr, pnl } = regNumbers();
  const rrEl = document.getElementById('rrOut'); if (rrEl) rrEl.textContent = rr;
  const pnlEl = document.getElementById('pnlOut');
  if (pnlEl) { pnlEl.textContent = (pnl > 0 ? '+' : '') + money(pnl); pnlEl.style.color = pnl > 0 ? 'var(--text)' : pnl < 0 ? 'var(--accent)' : 'var(--n700)'; }
}

/* ------------------------------------------------------------- no more */
function renderNoMore() {
  return `<div class="pad">
    <div style="border:2px solid var(--text);padding:24px 18px;">
      <h2>${esc(t('No more trades in the session'))}</h2>
      <div style="display:flex;justify-content:center;padding:30px 0;">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="var(--accent)" stroke-width="3">
          <circle cx="50" cy="50" r="46"></circle><line x1="18" y1="82" x2="82" y2="18"></line>
        </svg>
      </div>
      <p style="font-size:14px;margin:0;">${esc(t('Wait until the next session or tomorrow. If you want to keep trading, switch to the DEMO account.'))}</p>
    </div>
    <div style="margin-top:16px;display:grid;gap:8px;">
      <button class="btn btn-secondary btn-block" onclick="continueOnDemo()">${esc(t('Continue on DEMO'))}${iconSvg('chevronRight')}</button>
      <button class="btn btn-ghost btn-block" onclick="goDash()">${esc(t('Back to dashboard'))}</button>
    </div>
  </div>`;
}

/* --------------------------------------------------------------- detail */
function renderDetail() {
  const tr = ST.trades.find(x => x.id === ST.detailId);
  if (!tr) return renderDash();
  const g = tr.snap;
  const title = `${tr.instrument} ${tr.side} · ${t(tr.result === 'BE' ? 'Break even' : tr.result)}`;
  const meta = `${t('Day')} ${tr.day} · ${new Date(tr.time).toLocaleString()}`;
  const rows = [
    [t('Entry'), tr.reg.entry], [t('Stop loss'), tr.reg.sl], [t('Take profit'), tr.reg.tp],
    [t('Close price'), tr.reg.closePx], [t('Result'), t(tr.result === 'BE' ? 'Break even' : tr.result)], [t('Close reason'), t(g.reason)],
    ['P&L', (tr.pnl > 0 ? '+' : '') + money(tr.pnl)],
    [t('High-impact news'), t(g.eco)], [t('AI bias'), t(g.bias)],
    ['1D ' + (ST.settings.lang === 'EN' ? 'trend / structure' : 'tendencia / estructura'), t(g.t1d) + ' · ' + gname(g.s1d)],
    ['1H ' + (ST.settings.lang === 'EN' ? 'trend / structure' : 'tendencia / estructura'), t(g.t1h) + ' · ' + gname(g.s1h)],
    ['15m ' + (ST.settings.lang === 'EN' ? 'trend / structure' : 'tendencia / estructura'), t(g.t15) + ' · ' + gname(g.s15)],
    ['5m ' + (ST.settings.lang === 'EN' ? 'structure / CVD' : 'estructura / CVD'), gname(g.s5m) + ' · ' + gname(g.cvd5m)],
    ['1m ' + (ST.settings.lang === 'EN' ? 'structure / CVD' : 'estructura / CVD'), gname(g.s1m) + ' · ' + gname(g.cvd1m)],
    [t('VA 1m/5m match'), t(g.vaMatch)], [t('Divergence strength'), t(g.strength)],
    [t('Operating zone'), tr.zone], [t('Market reaction'), t(g.reaction)],
    [t('CVD candle divergence'), t(tr.cvdDiv ? 'Confirmed' : 'Not confirmed')], [t('Candle pattern'), gname(g.pattern)]
  ];
  let out = `<div class="section pad">
    <button class="btn btn-ghost" style="padding-left:0;" onclick="goDash()">${iconSvg('chevronLeft')}${esc(t('Back'))}</button>
    <h3 style="margin:6px 0 0;">${esc(title)}</h3>
    <div style="font-size:12px;color:var(--n700);">${esc(meta)}</div>
  </div>`;
  rows.forEach(([k, v]) => {
    out += `<div class="hair" style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:9px 16px;">
      <span class="k">${esc(k)}</span><span class="num" style="font-size:14px;text-align:right;">${esc(v)}</span>
    </div>`;
  });
  out += `<div class="pad">
    <div class="k" style="margin-bottom:6px;">${esc(t('Capture'))}</div>
    <div class="dashed" id="detailShot"><span style="font-family:var(--font-mono);font-size:11px;color:var(--n700);">${esc(t('trade screenshot'))}</span></div>
    <div class="k" style="margin:14px 0 4px;">${esc(t('Notes'))}</div>
    <p style="font-size:14px;margin:0;">${esc(tr.notes || t('No notes.'))}</p>
  </div>
  <div style="padding:20px 16px;"></div>`;
  loadDetailShot(tr.id);
  return out;
}
async function loadDetailShot(id) {
  try {
    const blob = await idbGet('shot_' + id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const el = document.getElementById('detailShot');
    if (el) el.innerHTML = `<img src="${url}">`;
  } catch (e) { /* no screenshot stored */ }
}

/* -------------------------------------------------------------- sheets */
function renderSheet() {
  // The visual picker (structure/CVD/reaction/pattern) opens over a flow
  // screen independently of ST.sheet, so it takes priority when set.
  if (ST.picker) return sheetPicker();
  const sh = ST.sheet;
  if (!sh) return '';
  if (sh === 'newplan') return sheetNewPlan();
  if (sh === 'pick') return sheetPick();
  if (sh === 'money') return sheetMoney();
  if (sh === 'confirm') return sheetConfirm();
  if (sh === 'settings') return sheetSettings();
  if (sh === 'noplan') return sheetNoPlan();
  if (sh === 'beask') return sheetBEAsk();
  if (sh === 'warn') return sheetWarn();
  return '';
}
function sheetNewPlan() {
  const f = ST.f;
  const fCap = parseFloat(f.fCapital) || 0, fWin = parseFloat(f.fWin) || 0, fLoss = parseFloat(f.fLoss) || 0, fGoal = parseFloat(f.fGoal) || 0;
  const prevTp = money(fCap * fWin / 100), prevRisk = money(fCap * fLoss / 100);
  const prevDays = goalDaysFor(fCap, fWin, fGoal) + ' ' + (ST.settings.lang === 'EN' ? 'days' : 'días');
  const accounts = ['Funded', 'Evaluation', 'Live', 'Demo'];
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
    <div class="pad section"><h3>${esc(t('New plan'))}</h3><p style="font-size:13px;color:var(--n700);margin:4px 0 0;">${esc(t('The table compounds from your capital. Risk and TP are percentages of the current day’s capital.'))}</p></div>
    <div class="pad" style="display:grid;gap:12px;">
      <div class="field"><label>${esc(t('Plan name'))}</label><input class="input" id="np_name" value="${esc(f.fName)}" oninput="ST.f.fName=this.value;save()" placeholder="${esc(t(ST.settings.lang === 'EN' ? 'Liberty Plan' : 'Plan Libertad'))}"></div>
      <div class="field"><label>${esc(t('Starting capital (USD)'))}</label><input class="input num" id="np_cap" value="${esc(f.fCapital)}" oninput="ST.f.fCapital=this.value;save();updateNewPlanPreview()"></div>
      <div class="field"><label>${esc(t('Goal — where the plan ends (USD)'))}</label><input class="input num" id="np_goal" value="${esc(f.fGoal)}" oninput="ST.f.fGoal=this.value;save();updateNewPlanPreview()"></div>
      <div class="grid2">
        <div class="field"><label>${esc(t('Profit per day (%)'))}</label><input class="input num" id="np_win" value="${esc(f.fWin)}" oninput="ST.f.fWin=this.value;save();updateNewPlanPreview()"></div>
        <div class="field"><label>${esc(t('Risk per trade (%)'))}</label><input class="input num" id="np_loss" value="${esc(f.fLoss)}" oninput="ST.f.fLoss=this.value;save();updateNewPlanPreview()"></div>
      </div>
      <div><div class="k" style="margin-bottom:6px;">${esc(t('Account'))}</div>
        <div class="seg">${accounts.map(a => `<label class="seg-opt ${f.fAccount === a ? 'on' : ''}"><input type="radio" name="facct" ${f.fAccount === a ? 'checked' : ''} onchange="setField('f','fAccount','${a}')"><span>${esc(t(a))}</span></label>`).join('')}</div></div>
      <div class="grid3" style="border-top:2px solid var(--divider);padding-top:12px;">
        <div><div class="k">${esc(t('Day 1 TP'))}</div><div class="num" id="np_prevTp" style="font-size:16px;">${prevTp}</div></div>
        <div><div class="k">${esc(t('Day 1 risk'))}</div><div class="num" id="np_prevRisk" style="font-size:16px;color:var(--a700);">${prevRisk}</div></div>
        <div><div class="k">${esc(t('Goal in'))}</div><div class="num" id="np_prevDays" style="font-size:16px;">${prevDays}</div></div>
      </div>
      <button class="btn btn-primary btn-block" onclick="createPlan()">${esc(t('Create plan'))}${iconSvg('check')}</button>
      <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Cancel'))}</button>
    </div>
  </div></div>`;
}
function updateNewPlanPreview() {
  const f = ST.f;
  const fCap = parseFloat(f.fCapital) || 0, fWin = parseFloat(f.fWin) || 0, fLoss = parseFloat(f.fLoss) || 0, fGoal = parseFloat(f.fGoal) || 0;
  const a = document.getElementById('np_prevTp'), b = document.getElementById('np_prevRisk'), c = document.getElementById('np_prevDays');
  if (a) a.textContent = money(fCap * fWin / 100);
  if (b) b.textContent = money(fCap * fLoss / 100);
  if (c) c.textContent = goalDaysFor(fCap, fWin, fGoal) + ' ' + (ST.settings.lang === 'EN' ? 'days' : 'días');
}
function sheetPick() {
  const pickId = ST.pickPlan || ST.activeId;
  const avail = ST.instruments.map(code => INSTRUMENTS.find(i => i.code === code)).filter(Boolean);
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
    <div class="pad section"><h3>${esc(t('New trade'))}</h3><p style="font-size:13px;color:var(--n700);margin:4px 0 0;">${esc(t('Pick the plan — it carries the account — and the instrument to operate.'))}</p></div>
    <div class="pad">
      <div class="k" style="margin-bottom:6px;">${esc(t('Plan'))}</div>
      ${ST.plans.map((p, i) => `<label class="row" style="cursor:pointer;border:1px solid var(--divider);margin-bottom:8px;background:${pickId === p.id ? 'var(--a100)' : 'transparent'};">
        <span><span class="num" style="font-size:14px;">${esc(p.name)}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(t(p.account))} · ${esc(t('Day').toLowerCase())} ${ST.day} ${esc(t('Risk').toLowerCase())} ${money(planRow(p, ST.day).risk)}</span></span>
        <span class="tag ${p.id === ST.activeId ? 'tag-accent' : 'tag-neutral'}">${esc(t(p.id === ST.activeId ? 'ACTIVE' : 'ARCHIVED'))}</span>
        <input type="radio" name="pickplan" ${pickId === p.id ? 'checked' : ''} onchange="ST.pickPlan='${p.id}';ST.activeId='${p.id}';render()" style="position:absolute;opacity:0;">
      </label>`).join('')}
      <div class="k" style="margin:14px 0 6px;">${esc(t('Instrument'))}</div>
      <div class="seg" style="flex-wrap:wrap;">${avail.map(i => `<label class="seg-opt ${ST.instrument === i.code ? 'on' : ''}"><input type="radio" name="inst" ${ST.instrument === i.code ? 'checked' : ''} onchange="ST.instrument='${i.code}';render()"><span>${i.code} — ${esc(t(i.name))}</span></label>`).join('')}</div>
      ${ST.locked ? `<div class="callout" style="margin-top:12px;">${esc(t('Real accounts are locked for this session. Only DEMO is available.'))}</div>` : ''}
      <button class="btn btn-primary btn-block" onclick="letsTrade()">${esc(t('Let’s trade'))}${iconSvg('chevronRight')}</button>
      <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Cancel'))}</button>
    </div>
  </div></div>`;
}
function sheetMoney() {
  const pl = ST.plans.find(x => x.id === ST.moneyPlanId);
  const amt = Math.abs(parseFloat(ST.m.mAmount) || 0);
  const after = pl ? Math.max(0, pl.equity + (ST.m.moneyType === 'Withdrawal' ? -1 : 1) * amt) : 0;
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
    <div class="pad section"><h3>${esc(t(ST.m.moneyType === 'Withdrawal' ? 'Withdraw from capital' : 'Add to capital'))}</h3>
    <p style="font-size:13px;color:var(--n700);margin:4px 0 0;">${pl ? esc(pl.name) : '—'} · ${esc(t('Equity after')).split(' ')[0]} ${pl ? money(pl.equity) : '—'}</p></div>
    <div class="pad" style="display:grid;gap:12px;">
      <div class="seg">${['Deposit', 'Withdrawal'].map(v => `<label class="seg-opt ${ST.m.moneyType === v ? 'on' : ''}"><input type="radio" name="mtype" ${ST.m.moneyType === v ? 'checked' : ''} onchange="setField('m','moneyType','${v}')"><span>${esc(t(v))}</span></label>`).join('')}</div>
      <div class="field"><label>${esc(t('Amount (USD)'))}</label><input class="input num" id="m_amount" value="${esc(ST.m.mAmount)}" oninput="ST.m.mAmount=this.value;save();updateMoneyPreview()"></div>
      <div class="field"><label>${esc(t('Note'))}</label><input class="input" value="${esc(ST.m.mNote)}" oninput="ST.m.mNote=this.value;save()" placeholder="${esc(t(ST.settings.lang === 'EN' ? 'Payout, top-up, prop firm split…' : 'Retiro, aporte, split de prop firm…'))}"></div>
      <label class="row" style="cursor:pointer;border:1px solid var(--divider);"><span><span style="font-size:14px;">${esc(t('Rebase the plan'))}</span>
        <span style="display:block;font-size:11px;color:var(--n700);">${esc(t('Recompute the table and the days to goal from the new capital'))}</span></span>
        <span class="tag ${ST.m.mRebase ? 'tag-accent' : 'tag-neutral'}">${esc(t(ST.m.mRebase ? 'ON' : 'OFF'))}</span>
        <input type="checkbox" ${ST.m.mRebase ? 'checked' : ''} onchange="ST.m.mRebase=!ST.m.mRebase;render()" style="position:absolute;opacity:0;"></label>
      <div style="border-top:2px solid var(--divider);padding-top:12px;display:flex;align-items:baseline;justify-content:space-between;">
        <span class="k">${esc(t('Equity after'))}</span><span class="num" id="m_after" style="font-size:20px;">${money(after)}</span>
      </div>
      <button class="btn btn-primary btn-block" onclick="saveMoney()">${esc(t('Record movement'))}${iconSvg('check')}</button>
      <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Cancel'))}</button>
    </div>
  </div></div>`;
}
function updateMoneyPreview() {
  const pl = ST.plans.find(x => x.id === ST.moneyPlanId);
  const amt = Math.abs(parseFloat(ST.m.mAmount) || 0);
  const after = pl ? Math.max(0, pl.equity + (ST.m.moneyType === 'Withdrawal' ? -1 : 1) * amt) : 0;
  const el = document.getElementById('m_after'); if (el) el.textContent = money(after);
}
function sheetConfirm() {
  const pl = ST.plans.find(x => x.id === ST.confirmId);
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet accent-top pad">
    <div class="k" style="color:var(--a700);">${esc(t('Delete plan'))}</div>
    <h3 style="margin:6px 0 0;">${esc(pl ? pl.name : '')}</h3>
    <p style="font-size:14px;margin:8px 0 0;">${esc(t('Its table, equity and capital movements go with it. Logged trades stay in the history.'))}</p>
    <button class="btn btn-primary btn-block" onclick="confirmDeletePlan()">${esc(t('Delete it'))}${iconSvg('trash')}</button>
    <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Keep it'))}</button>
  </div></div>`;
}
function sheetSettings() {
  const now = new Date();
  const localZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'local').split('/').pop().replace(/_/g, ' ');
  const localClock = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet">
    <div class="pad section"><h3>${esc(t('Settings'))}</h3><p style="font-size:13px;color:var(--n700);margin:4px 0 0;">${esc(localZone)} ${ST.settings.lang === 'EN' ? 'detected automatically' : 'detectada automáticamente'} · ${esc(localClock)}</p></div>
    <div class="pad hair">
      <div class="k" style="margin-bottom:6px;">${esc(t('Language'))}</div>
      <div class="seg" style="margin-bottom:16px;">
        <label class="seg-opt ${ST.settings.lang === 'ES' ? 'on' : ''}"><input type="radio" name="lang" ${ST.settings.lang === 'ES' ? 'checked' : ''} onchange="setLang('ES')"><span>Español</span></label>
        <label class="seg-opt ${ST.settings.lang === 'EN' ? 'on' : ''}"><input type="radio" name="lang" ${ST.settings.lang === 'EN' ? 'checked' : ''} onchange="setLang('EN')"><span>English</span></label>
      </div>
      <div class="k" style="margin-bottom:6px;">${esc(t('Appearance'))}</div>
      <div class="seg">
        <label class="seg-opt ${ST.settings.theme !== 'Black' ? 'on' : ''}"><input type="radio" name="theme" ${ST.settings.theme !== 'Black' ? 'checked' : ''} onchange="setTheme('Paper')"><span>${esc(t('Paper'))}</span></label>
        <label class="seg-opt ${ST.settings.theme === 'Black' ? 'on' : ''}"><input type="radio" name="theme" ${ST.settings.theme === 'Black' ? 'checked' : ''} onchange="setTheme('Black')"><span>${esc(t('Black'))}</span></label>
      </div>
    </div>
    <div class="pad hair">
      <div class="k" style="margin-bottom:6px;">${esc(t('Meditation track'))}</div>
      <input class="fileinput" type="file" accept="audio/*" onchange="pickTrack(this)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;">
        <span class="num" style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(ST.settings.trackName || t('No track selected'))}</span>
        ${ST.settings.trackName ? `<button class="btn btn-ghost" onclick="clearTrack()">${esc(t('Remove'))}</button>` : ''}
      </div>
      <div style="margin-top:6px;font-size:11px;color:var(--n700);">${esc(t('Plays while the countdown runs and stops when it ends.'))}</div>
    </div>
    <div class="pad hair">
      <div class="k" style="margin-bottom:4px;">${esc(t('A loss locks'))}</div>
      <div style="font-size:14px;">${esc(t('Real accounts stay locked until the next session. DEMO stays open.'))}</div>
      <div style="margin-top:4px;font-size:11px;color:var(--n700);">${esc(t('Not configurable — this rule is what the model is built on.'))}</div>
    </div>
    <div class="pad hair">
      <div class="k" style="margin-bottom:6px;">${esc(t('Instruments you trade'))}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${INSTRUMENTS.map(i => `<label style="cursor:pointer;"><span class="tag ${ST.instruments.indexOf(i.code) !== -1 ? 'tag-accent' : 'tag-neutral'}" style="padding:6px 12px;font-size:12px;" onclick="toggleInstr('${i.code}')">${i.code}</span></label>`).join('')}
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--n700);">${esc(t('Only the selected ones appear when you open a trade.'))}</div>
    </div>
    <div class="pad hair">
      <div class="k" style="margin-bottom:6px;">${esc(t('Meditation length'))}</div>
      ${selectHtml('medMin', ST.settings.medMin, ['10 minutes', '5 minutes', '15 minutes'], `setMedMin(this.value)`)}
      <div style="margin-top:6px;font-size:11px;color:var(--n700);">${esc(t('Step 1 cannot be skipped — only its length is yours to set.'))}</div>
    </div>
    <div class="pad">
      <div class="k" style="margin-bottom:6px;">${esc(t('Session state'))}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <span class="tag ${ST.locked ? 'tag-accent' : 'tag-neutral'}">${esc(t(ST.locked ? 'SESSION LOCKED' : 'SESSION OPEN'))}</span>
        <span style="font-size:12px;color:var(--n700);">${esc(t('Day'))} ${ST.day}</span>
      </div>
      <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Close'))}</button>
    </div>
  </div></div>`;
}
function sheetPicker() {
  const kind = ST.picker.kind, key = ST.picker.key;
  const options = GLYPHS[kind] || [];
  const cur = ST.s[key];
  const title = PICKER_TITLES[kind] ? (ST.settings.lang === 'EN' ? PICKER_TITLES[kind][0] : PICKER_TITLES[kind][1]) : '';
  return `<div class="backdrop" onclick="if(event.target===this)closePicker()"><div class="sheet">
    <div class="pad section"><h3>${esc(title)}</h3></div>
    ${options.map(o => `<button class="pickopt ${cur === o.v ? 'on' : ''}" onclick="pickOption('${o.v.replace(/'/g, "\\'")}')">
      ${glyphSvg(o, 78, 42)}
      <span class="pickopt-name">${esc(gname(o.v))}</span>
      <span class="k" style="color:var(--a700);">${cur === o.v ? esc(t('ACTUAL')) : ''}</span>
    </button>`).join('')}
    <div class="pad"><button class="btn btn-ghost btn-block" onclick="closePicker()">${esc(t('Cancel'))}</button></div>
  </div></div>`;
}
function sheetNoPlan() {
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet accent-top pad">
    <div class="k" style="color:var(--a700);">${esc(t('No plan found'))}</div>
    <h3 style="margin:6px 0 0;">${esc(t('Create a plan first'))}</h3>
    <p style="font-size:14px;margin:8px 0 0;">${esc(t('A trade needs an active plan: it defines the daily target, the risk and the account. Create one to start operating.'))}</p>
    <button class="btn btn-primary btn-block" onclick="openNewPlan()">${esc(t('Create plan'))}${iconSvg('plus')}</button>
    <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Cancel'))}</button>
  </div></div>`;
}
function sheetBEAsk() {
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet accent-top pad">
    <div class="k" style="color:var(--a700);">${esc(t('Break even'))}</div>
    <h3 style="margin:6px 0 0;">${esc(t('¿Registrar BE?'))}</h3>
    <p style="font-size:14px;margin:8px 0 0;">${esc(t('Logging the trade as BE records it and starts a new entry carrying the data captured up to the Execution screen. Continue?'))}</p>
    <button class="btn btn-primary btn-block" onclick="confirmBE()">${esc(t('Continue'))}${iconSvg('chevronRight')}</button>
    <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Cancel'))}</button>
  </div></div>`;
}
function sheetWarn() {
  return `<div class="backdrop" onclick="if(event.target===this)closeSheet()"><div class="sheet accent-top pad">
    <div class="k" style="color:var(--a700);">${esc(t('Warning'))}</div>
    <h3 style="margin:6px 0 0;">${esc(t('Next trade of the session'))}</h3>
    <p style="font-size:14px;margin:8px 0 0;">${esc(t('Steps 1 and 2 stay saved from your first trade. You only re-read the auction zone. Do not force a reward out of need — the day is already green.'))}</p>
    <button class="btn btn-primary btn-block" onclick="ST.sheet=null;goScreen('step4')">${esc(t('Understood — read the zone'))}${iconSvg('chevronRight')}</button>
    <button class="btn btn-ghost btn-block" onclick="closeSheet()">${esc(t('Not now'))}</button>
  </div></div>`;
}

/* ============================================================ handlers */
function goTab(k) { ST.tab = k; ST.screen = null; ST.sheet = null; render(); }
function goScreen(sc) { ST.screen = sc; ST.sheet = null; render(); }
function goDash() { ST.screen = null; ST.tab = 'dash'; ST.sheet = null; render(); }
function exitFlow() { goDash(); }
function openSettings() { ST.sheet = 'settings'; render(); }
function closeSheet() { ST.sheet = null; render(); }
function openNewPlan() { ST.sheet = 'newplan'; render(); }
function openDetail(id) { ST.screen = 'detail'; ST.detailId = id; ST.sheet = null; render(); }
function continueOnDemo() { ST.sheet = 'pick'; ST.screen = null; render(); }
function setField(group, key, val) { ST[group][key] = val; render(); }
function setFieldR(key, val) { ST.s[key] = val; render(); }
function setFieldSel(key, val) { ST.s[key] = val; render(); }
function toggleChk(key) { ST.chk[key] = !ST.chk[key]; render(); }
function setResult(v) { ST.s.result = v; render(); }
function setLang(v) { ST.settings.lang = v; render(); }
function setTheme(v) { ST.settings.theme = v; render(); }
function setMedMin(v) {
  ST.settings.medMin = v;
  ST.med = { left: (parseInt(v, 10) || 10) * 60, running: false, ready: false };
  playTrack(false);
  render();
}
function toggleInstr(code) {
  const on = ST.instruments.indexOf(code) !== -1;
  const next = on ? ST.instruments.filter(c => c !== code) : ST.instruments.concat([code]);
  ST.instruments = next.length ? next : ST.instruments;
  if (ST.instruments.indexOf(ST.instrument) === -1) ST.instrument = ST.instruments[0];
  render();
}

function onPlus() {
  if (!ST.plans.length) { ST.sheet = 'noplan'; render(); return; }
  if (ST.locked) { ST.screen = 'nomore'; ST.sheet = null; render(); return; }
  const traded = ST.trades.some(tr => tr.day === ST.day);
  ST.sheet = 'pick'; ST.flow = traded ? 'next' : 'first'; ST.pickPlan = ST.pickPlan || ST.activeId;
  render();
}

/* ---- plans ---- */
function createPlan() {
  const f = ST.f;
  const capital = Math.max(1, parseFloat(f.fCapital) || 50);
  const win = Math.max(0.1, parseFloat(f.fWin) || 10);
  const loss = Math.max(0.1, parseFloat(f.fLoss) || 5);
  const goal = Math.max(capital * (1 + win / 100), parseFloat(f.fGoal) || capital * 100);
  const plan = {
    id: uid('p'), name: (f.fName || '').trim() || (ST.settings.lang === 'EN' ? 'Liberty Plan' : 'Plan Libertad'),
    capital, equity: capital, dayBase: capital, win, loss, goal, account: f.fAccount,
    days: goalDaysFor(capital, win, goal)
  };
  ST.plans.unshift(plan);
  ST.activeId = plan.id; ST.day = ST.day || 1; ST.pickPlan = plan.id;
  ST.sheet = null; ST.tab = 'dash'; ST.screen = null;
  ST.f = defaultState().f;
  render();
}
function planAction(k, v) {
  if (k === 'activate') { ST.activeId = v; ST.pickPlan = v; render(); return; }
  if (k === 'delete') { ST.sheet = 'confirm'; ST.confirmId = v; render(); return; }
  ST.sheet = 'money'; ST.moneyPlanId = v;
  ST.m = { moneyType: k === 'withdraw' ? 'Withdrawal' : 'Deposit', mAmount: '', mNote: '', mRebase: false };
  render();
}
function deleteMove(id) {
  const mv = ST.moves.find(x => x.id === id);
  if (!mv) return;
  ST.moves = ST.moves.filter(x => x.id !== id);
  const pl = ST.plans.find(p => p.id === mv.planId);
  if (pl) {
    pl.equity = Math.max(0, pl.equity - mv.signed);
    if (mv.rebase && mv.prevCapital != null) { pl.capital = mv.prevCapital; pl.days = mv.prevDays; }
  }
  render();
}
function saveMoney() {
  const amount = Math.abs(parseFloat(ST.m.mAmount) || 0);
  if (!amount) { ST.sheet = null; render(); return; }
  const pl = ST.plans.find(x => x.id === ST.moneyPlanId);
  if (!pl) { ST.sheet = null; render(); return; }
  const signed = ST.m.moneyType === 'Withdrawal' ? -amount : amount;
  const equity = Math.max(0, pl.equity + signed);
  const rebase = ST.m.mRebase;
  const move = {
    id: uid('m'), planId: pl.id, planName: pl.name, type: ST.m.moneyType, amount, signed,
    note: ST.m.mNote, rebase, time: new Date().toISOString(), day: ST.day,
    prevCapital: pl.capital, prevDays: planDays(pl)
  };
  ST.moves.unshift(move);
  pl.equity = equity;
  pl.dayBase = Math.max(0, (typeof pl.dayBase === 'number' ? pl.dayBase : pl.capital) + signed);
  if (rebase) { pl.capital = equity; pl.dayBase = equity; pl.days = goalDaysFor(equity, pl.win, pl.goal); }
  ST.sheet = null;
  render();
}
function confirmDeletePlan() {
  const id = ST.confirmId;
  ST.plans = ST.plans.filter(x => x.id !== id);
  ST.moves = ST.moves.filter(m => m.planId !== id);
  if (ST.activeId === id) ST.activeId = ST.plans[0] ? ST.plans[0].id : null;
  if (ST.pickPlan === id) ST.pickPlan = ST.plans[0] ? ST.plans[0].id : null;
  ST.sheet = null; ST.confirmId = null;
  render();
}

/* ---- pickers ---- */
function openPicker(kind, key) { ST.picker = { kind, key }; render(); }
function closePicker() { ST.picker = null; render(); }
function pickOption(v) { if (ST.picker) ST.s[ST.picker.key] = v; ST.picker = null; render(); }

/* ---- meditation ---- */
function onMed() {
  if (ST.med.ready) return;
  if (ST.med.running) { playTrack(false); ST.med.running = false; render(); return; }
  if (ST.med.left === 0) ST.med.left = medTotal();
  ST.med.running = true; ST.med.ready = false;
  playTrack(true);
  render();
}
function playTrack(on) {
  if (!window.__medAudio) return;
  if (on) { const r = window.__medAudio.play(); if (r && r.catch) r.catch(() => {}); }
  else window.__medAudio.pause();
}
function setupTrackAudio(blob) {
  if (window.__medAudio) { try { window.__medAudio.pause(); } catch (e) {} }
  const url = URL.createObjectURL(blob);
  window.__medAudio = new Audio(url);
  window.__medAudio.loop = true;
}
function pickTrack(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  idbPut('meditationTrack', f).then(() => {
    ST.settings.trackName = f.name; ST.settings.trackId = 'meditationTrack';
    setupTrackAudio(f);
    render();
  });
}
function clearTrack() {
  idbDel('meditationTrack').catch(() => {});
  ST.settings.trackName = null; ST.settings.trackId = null;
  if (window.__medAudio) { try { window.__medAudio.pause(); } catch (e) {} window.__medAudio = null; }
  render();
}

/* ---- ai prompt ---- */
function copyPrompt() {
  const p = 'Eres un analista de mercados especializado en instrumentos financieros. Necesito que realices una investigacion web actualizada sobre [' + ST.instrument + '] siguiendo estos pasos: 1) Calendario economico de alto impacto hoy y los proximos 2-3 dias (hora Central). 2) Noticias de impacto de las ultimas 24-48h y su sesgo. 3) Foros y sentimiento de traders y niveles que vigilan. 4) Sintesis del comportamiento esperado: volatilidad, rangos y catalizadores. 5) Probabilidad estimada de direccion intradia y a mediano plazo, aclarando que es un ejercicio probabilistico y no una prediccion garantizada.';
  if (navigator.clipboard) navigator.clipboard.writeText(p).catch(() => {});
  const btn = document.getElementById('copyBtn');
  if (btn) btn.innerHTML = esc(t('AI prompt copied')) + iconSvg('copy');
  showToast(t('AI prompt copied'));
}

/* ---- dreams ---- */
function addDreams(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  files.forEach(f => {
    const id = uid('d');
    idbPut(id, f).catch(() => {});
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const ratio = (img.width / img.height).toFixed(3);
      ST.dreams.unshift({ id, src: url, ratio, builtin: false });
      render();
    };
    img.onerror = () => {
      ST.dreams.unshift({ id, src: url, ratio: '1', builtin: false });
      render();
    };
    img.src = url;
  });
}
function removeDream(id) {
  const d = ST.dreams.find(x => x.id === id);
  ST.dreams = ST.dreams.filter(x => x.id !== id);
  if (d && !d.builtin) idbDel(id).catch(() => {});
  render();
}

/* ---- trade flow ---- */
function startTrade() { goScreen('buy'); }
function letsTrade() {
  const p = activePlan();
  const row = planRow(p, ST.day);
  const btc = ST.instrument.indexOf('BT') !== -1 || ST.instrument === 'BFF';
  const entry = btc ? 120000 : 4000;
  const dist = row ? row.risk / perPoint() : (btc ? 500 : 3);
  ST.reg = {
    entry: entry.toFixed(2), sl: (entry - dist).toFixed(2), tp: (entry + dist * 2).toFixed(2),
    closePx: (entry + dist * 2).toFixed(2), notes: ''
  };
  if (ST.flow === 'next') { ST.sheet = 'warn'; render(); return; }
  ST.sheet = null; ST.screen = 'step1'; ST.med = { left: medTotal(), running: false, ready: false };
  render();
}
function pickShot(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  pendingShot = f;
  if (pendingShotUrl) URL.revokeObjectURL(pendingShotUrl);
  pendingShotUrl = URL.createObjectURL(f);
  const el = document.getElementById('shotPreview');
  if (el) el.innerHTML = `<img src="${pendingShotUrl}">`;
}
function askBE() { ST.sheet = 'beask'; render(); }
function confirmBE() {
  const p = activePlan();
  const trade = {
    id: uid('t'), day: ST.day, instrument: ST.instrument,
    side: ST.s.t1m === 'Bearish' ? 'SELL' : 'BUY', result: 'BE', pnl: 0,
    account: p ? p.account : 'Funded',
    zone: ST.s.divZone, notes: ST.reg.notes, reg: Object.assign({}, ST.reg),
    snap: Object.assign({}, ST.s), cvdDiv: ST.chk.cvdDiv, time: new Date().toISOString()
  };
  ST.trades.unshift(trade);
  ST.sheet = null; ST.screen = 'buy';
  ST.chk.book = false; ST.chk.retest = false; ST.chk.cvdDiv = false;
  ST.reg.notes = '';
  render();
}
function finalizeTrade() {
  const p = activePlan();
  const row = planRow(p, ST.day);
  const res = ST.s.result;
  if (!res) { showToast(ST.settings.lang === 'EN' ? 'Pick Profit or Lose first' : 'Elige Ganancia o Pérdida primero'); return; }
  const pnl = res === 'Profit' ? (row ? row.tp : 0) : -(row ? row.risk : 0);
  const id = uid('t');
  const trade = {
    id, day: ST.day, instrument: ST.instrument,
    side: ST.s.t1m === 'Bearish' ? 'SELL' : 'BUY', result: res, pnl,
    account: p ? p.account : 'Funded',
    zone: ST.s.divZone, notes: ST.reg.notes, reg: Object.assign({}, ST.reg),
    snap: Object.assign({}, ST.s), cvdDiv: ST.chk.cvdDiv, time: new Date().toISOString()
  };
  ST.trades.unshift(trade);
  if (p) p.equity = p.equity + pnl;
  ST.streak = res === 'Profit' ? ST.streak + 1 : 0;
  ST.locked = res === 'Lose';
  ST.screen = ST.locked ? 'nomore' : null;
  ST.tab = 'dash'; ST.sheet = null;
  const shot = pendingShot; pendingShot = null;
  if (pendingShotUrl) { URL.revokeObjectURL(pendingShotUrl); pendingShotUrl = null; }
  render();
  if (shot) idbPut('shot_' + id, shot).catch(() => {});
}

/* ================================================================ live
   Session clocks / countdowns only ever appear on views with zero free-
   text inputs (Dashboard, Settings sheet, Step 1 meditation), so a full
   render() there every second is safe and never steals focus. */
let __liveWired = false;
function wireLiveOnce() {
  if (__liveWired) return; __liveWired = true;
  setInterval(tick, 1000);
}
function tick() {
  const now = new Date();
  const key = sessionKey(now);
  if (ST.sessKey && key !== ST.sessKey) {
    ST.sessKey = key;
    rollDay();
    render();
    return;
  }
  ST.sessKey = ST.sessKey || key;
  let changed = false;
  if (ST.med.running && ST.med.left > 0) {
    ST.med.left -= 1; changed = true;
    if (ST.med.left === 0) { ST.med.ready = true; ST.med.running = false; playTrack(false); }
  }
  const liveScreen = (ST.screen === null && ST.tab === 'dash' && !ST.sheet) || ST.sheet === 'settings' || ST.screen === 'step1';
  if (liveScreen) { render(); return; }
  if (changed) save();
}

/* ================================================================ boot */
async function hydrateAsync() {
  for (const d of ST.dreams) {
    if (!d.builtin && !d.src) {
      try { const blob = await idbGet(d.id); if (blob) d.src = URL.createObjectURL(blob); } catch (e) {}
    }
  }
  if (ST.settings.trackId) {
    try { const blob = await idbGet(ST.settings.trackId); if (blob) setupTrackAudio(blob); } catch (e) {}
  }
  render();
}
function showErr(msg) {
  let el = document.getElementById('errbox');
  if (!el) { el = document.createElement('div'); el.id = 'errbox'; el.className = 'err'; document.body.appendChild(el); }
  el.textContent = String(msg);
  clearTimeout(window.__errT);
  window.__errT = setTimeout(() => { if (el) el.remove(); }, 6000);
}
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('on');
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => el.classList.remove('on'), 1800);
}
function boot() {
  const now = new Date();
  const key = sessionKey(now);
  if (!ST.sessKey) ST.sessKey = key;
  else if (ST.sessKey !== key) { ST.sessKey = key; rollDay(); }
  render();
  hydrateAsync();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  window.addEventListener('error', e => showErr((e.error && e.error.message) || e.message || 'error'));
  window.addEventListener('unhandledrejection', e => showErr((e.reason && e.reason.message) || String(e.reason)));
}
boot();
