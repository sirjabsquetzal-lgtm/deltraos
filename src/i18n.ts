// DeltraOS i18n — Spanish (default) / English.
// A clean key-based reimplementation of the prototype's translation table
// (same wording, ported from its I18N dictionary) rather than its DOM-walking
// mechanism, which doesn't fit real componentized code.

import type { Lang } from './types';

type Pair = { es: string; en: string };
const S = (es: string, en: string): Pair => ({ es, en });

export const STR = {
  // shell
  tabDash: S('Panel', 'Dashboard'),
  tabTrades: S('Trades', 'Trades'),
  tabPlan: S('Plan', 'Plan'),
  tabDreams: S('Sueños', 'Dreams'),
  exit: S('Salir', 'Exit'),
  back: S('Atrás', 'Back'),
  cancel: S('Cancelar', 'Cancel'),

  // accounts / trends (kept identical across languages — proper nouns)
  accFunded: S('Funded', 'Funded'),
  accEvaluation: S('Evaluation', 'Evaluation'),
  accLive: S('Live', 'Live'),
  accDemo: S('Demo', 'Demo'),
  trendBullish: S('Alcista', 'Bullish'),
  trendBearish: S('Bajista', 'Bearish'),
  trendRange: S('Rango', 'Range'),

  // dashboard
  marketSessions: S('Sesiones de mercado', 'Market sessions'),
  setupRequired: S('Falta configurar', 'Setup required'),
  noPlanLine1: S('Sin plan de', 'No investment'),
  noPlanLine2: S('inversión aún.', 'plan yet.'),
  noPlanBody: S(
    'Cada trade en DeltraOS se dimensiona con tu plan. Crea uno para desbloquear el flujo.',
    'Every trade in DeltraOS is sized by your plan. Create one to unlock the trade flow.'
  ),
  newPlanBtn: S('Nuevo plan', 'New plan'),
  day: S('Día', 'Day'),
  targetTp: S('TP objetivo', 'Target TP'),
  riskCap: S('Riesgo máx.', 'Risk cap'),
  equityVsProjection: S('Equity vs. proyección', 'Equity vs. projection'),
  actual: S('Real', 'Actual'),
  planLegend: S('Plan', 'Plan'),
  winRate: S('Aciertos', 'Win rate'),
  avgR: S('R promedio', 'Avg R'),
  streak: S('Racha', 'Streak'),
  recentTrades: S('Trades recientes', 'Recent trades'),
  noTradesDash: S('Nada registrado aún. Toca + para correr el modelo.', 'Nothing logged yet. Tap + to run the model.'),
  newYorkRth: S('Nueva York — RTH', 'New York — RTH'),
  tokyo: S('Tokio', 'Tokyo'),
  opensMonday: S('abre el lunes', 'opens Monday'),
  sessOpen: S('ABIERTO', 'OPEN'),
  sessClosed: S('CERRADO', 'CLOSED'),
  sessionLocked: S('SESIÓN BLOQUEADA', 'SESSION LOCKED'),
  sessionOpen: S('SESIÓN ABIERTA', 'SESSION OPEN'),

  // trades tab
  tradesTitle: S('Trades', 'Trades'),
  account: S('Cuenta', 'Account'),
  planLabel: S('Plan', 'Plan'),
  noPlansForAccount: S('Sin planes para esta cuenta.', 'No plans for this account.'),
  noTradesOnPlanTitle: S('Sin trades en este plan.', 'No trades on this plan.'),
  noTradesOnPlanBody: S(
    'Cada trade que corre JABS se resume aquí. Toca una fila para ver la lista completa.',
    'Each trade JABS runs is summarised here. Tap a row for the full checklist.'
  ),

  // plan tab
  planTitle: S('Plan', 'Plan'),
  planSubtitle: S('Riesgo y take-profit por día, compuestos desde tu capital.', 'Risk and take-profit per day, compounded from your capital.'),
  choosePlanBtn: S('Elegir plan', 'Choose plan'),
  addNewPlanBtn: S('Agregar plan', 'Add new plan'),
  noPlansSaved: S('Sin planes guardados.', 'No plans saved.'),
  deposit: S('Depósito', 'Deposit'),
  withdraw: S('Retiro', 'Withdraw'),
  delete: S('Eliminar', 'Delete'),
  capitalMovements: S('Movimientos de capital', 'Capital movements'),
  goal: S('Meta', 'Goal'),
  sessionsToGoal: S('Sesiones a la meta', 'Sessions to goal'),
  tableDay: S('Día', 'Day'),
  tableCapital: S('Capital', 'Capital'),
  tableFirstTp: S('Primer TP', 'First TP'),
  tableRisk: S('Riesgo', 'Risk'),
  planFootnote: S(
    'El tamaño de posición debe mantener la distancia al stop dentro del riesgo del día. El TP es una aproximación de 1:2 — puede ser mayor.',
    "Position size must keep the stop distance at or under the day's risk. The TP is an approximation of a 1:2 target — it can be larger."
  ),
  selected: S('ELEGIDO', 'SELECTED'),
  select: S('ELEGIR', 'SELECT'),
  activeTag: S('ACTIVO', 'ACTIVE'),
  choosePlanTitle: S('Elegir plan', 'Choose plan'),

  // sueños
  suenosPhrase: S(
    'Todo aquello por lo que luchas merece tu paciencia, dedicación y disciplina.',
    'Everything you fight for deserves your patience, dedication and discipline.'
  ),
  addImages: S('Añadir imágenes', 'Add images'),
  dragToRearrange: S('arrastra para reordenar', 'drag to rearrange'),
  emptyTitle: S('Vacío', 'Empty'),
  emptyBody: S(
    'Añade las imágenes de aquello por lo que luchas. La app las acomoda sola.',
    'Add the images of what you fight for. The app arranges them on its own.'
  ),

  // step 1 — mental state
  mentalState: S('Estado mental', 'Mental state'),
  mentalP1: S(
    'Empieza el día con una meditación de 10 minutos. Llega a ese estado frío, disciplinado, eficiente. Deja atrás cualquier impulso eufórico o autodestructivo.',
    'Start your day with a 10-minute meditation. Get to that cold, disciplined, efficient state. Leave behind any euphoric or self-destructive impulse.'
  ),
  mentalP2: S(
    'Todo está en orden. Confía en tu plan, en tu modelo, en ti. Lo de afuera no importa — importa el ahora.',
    'Everything is in order. Trust your plan, trust your model, trust yourself. The outside does not matter — the now matters.'
  ),
  mantraLabel: S('Mantra', 'Mantra'),
  tapToBegin: S('Toca para empezar la meditación', 'Tap to begin the meditation'),
  eyesClosedBreathing: S('Ojos cerrados · inhala lento · exhala más lento', 'Eyes closed · slow inhale · slower exhale'),
  mindClear: S('Mente clara — puedes operar', 'Mind clear — you may trade'),
  readyContinue: S('Listo — ir a fundamentales', 'Ready — go to fundamentals'),

  // step 2 — fundamentals
  fundamentals: S('Fundamentales', 'Fundamentals'),
  economicCalendar: S('Calendario económico', 'Economic calendar'),
  anyHighImpact: S('¿Hay eventos de alto impacto hoy?', 'Any high-impact events today?'),
  yes: S('Sí', 'Yes'),
  no: S('No', 'No'),
  carefulHighImpact: S(
    'Cuidado — con noticias de alto impacto el mercado puede no respetar el modelo.',
    'Careful — the market may not respect the model on high-impact news.'
  ),
  aiAnalysis: S('Análisis y perspectiva con IA', 'AI analysis & perspective'),
  copyPromptDesc: S(
    'Copia el prompt, córrelo en tu IA y registra el sesgo que devuelve.',
    'Copy the research prompt, run it in your AI, then record the bias it returns.'
  ),
  copyAiPrompt: S('Copiar prompt de IA', 'Copy AI prompt'),
  aiPromptCopied: S('Prompt copiado', 'AI prompt copied'),
  higherProbability: S('Mayor probabilidad', 'Higher probability'),
  treatAsProbability: S('Tómalo solo como probabilidad, nunca como certeza.', 'Treat it only as a probability, never a certainty.'),
  continueToGeneralTrend: S('Continuar a tendencia general', 'Continue to general trend'),

  // step 3 — general trend
  generalTrendTitle: S('Tendencia general', 'General trend'),
  structure: S('Estructura', 'Structure'),
  nearHighImpactZone: S('Cerca de zona de alto impacto', 'Near high-impact zone'),
  generalTrendLabel: S('Tendencia general', 'General trend'),
  continueToAuctionZone: S('Continuar a zona de subasta', 'Continue to auction zone'),
  trendMixed: S('Mixto', 'Mixed'),

  // step 4 — scalping auction zone
  scalpingTitle: S('Zona de subasta scalping', 'Scalping auction zone'),
  liquidityZonesMarked: S('Zonas de liquidez marcadas', 'Liquidity zones marked'),
  vahValPoc: S('Zonas VAH, VAL, POC', 'VAH, VAL, POC zones'),
  cvdDivergence: S('Divergencia de CVD', 'CVD divergence'),
  divergenceStrength: S('Fuerza de la divergencia', 'Divergence strength'),
  low: S('Baja', 'Low'),
  medium: S('Media', 'Medium'),
  high: S('Alta', 'High'),
  heatmapLiquidity: S('Liquidez del heatmap', 'Heatmap liquidity'),
  abovePrice: S('Arriba del precio', 'Above price'),
  belowPrice: S('Abajo del precio', 'Below price'),
  divergenceZone: S('Zona de divergencia', 'Divergence zone'),
  results: S('Resultados', 'Results'),
  zone: S('Zona', 'Zone'),
  stopLoss: S('Stop loss', 'Stop loss'),
  takeProfit: S('Take profit', 'Take profit'),
  maxLoss: S('Pérdida máx.', 'Max loss'),
  startTrade: S('Iniciar trade', 'Start trade'),
  pending: S('PENDIENTE', 'PENDING'),
  done: S('HECHO', 'DONE'),
  lowestLiquidityZone: S('Zona de menor liquidez', 'Lowest liquidity zone'),
  highestLiquidityZone: S('Zona de mayor liquidez', 'Highest liquidity zone'),
  nearestLiquidityZone: S('Zona de liquidez más cercana', 'Nearest liquidity zone'),
  poc5mUpper: S('POC 5m (límite superior)', 'POC 5m (upper limit)'),
  poc5mLower: S('POC 5m (límite inferior)', 'POC 5m (lower limit)'),
  vah5mUpper: S('VAH 5m (límite superior)', 'VAH 5m (upper limit)'),
  val5mLower: S('VAL 5m (límite inferior)', 'VAL 5m (lower limit)'),

  // buy / execution
  execution: S('Ejecución', 'Execution'),
  letsPrefix: S('Vamos a', 'Let’s'),
  openBookmap: S('Abrir Bookmap', 'Open Bookmap'),
  bookmapDesc: S(
    'Identifica la zona de interés y espera a que el precio se acerque. Al tocarla: el volumen aumenta (DOTS), los vendedores se absorben y aparece el primer rechazo. Usualmente suele verse un patrón de vela acompañado de dicho movimiento.',
    'Identify the zone of interest and wait for price to approach it. Once it touches: volume increases (DOTS), sellers get absorbed, and the first rejection prints. Usually a candle pattern accompanies that move.'
  ),
  zoneRetest: S('Retest de la zona', 'Zone retest'),
  patience: S('PACIENCIA.', 'PATIENCE.'),
  patienceDesc: S('El precio debe volver a probar la zona.', 'Price must retest the zone.'),
  candlePatternWithDivergence: S('Patrón de vela con la divergencia', 'Candle pattern with the divergence'),
  insaneScalpConfirmation: S('Confirmación InsaneScalp', 'InsaneScalp confirmation'),
  linesAboveBelow: S('¿Líneas por debajo o por encima del nivel 0?', 'Lines below or above level 0?'),
  aboveLevel0: S('Por encima del nivel 0', 'Above level 0'),
  belowLevel0: S('Por debajo del nivel 0', 'Below level 0'),
  longShortConfirmation: S('Confirmación long / short', 'Long / short confirmation'),
  longConfirmed: S('Long confirmado', 'Long confirmed'),
  shortConfirmed: S('Short confirmado', 'Short confirmed'),
  notConfirmed: S('Sin confirmar', 'Not confirmed'),
  insaneScalpNote: S(
    'Esta confirmación marca una nueva zona de liquidez — que puedes usar como stop loss — y confirma el cambio de tendencia hacia el siguiente punto de interés.',
    'This confirmation marks a new liquidity zone — usable as your stop loss — and confirms the change of trend toward the next point of interest.'
  ),
  registerTradeBtn: S('Registrar trade', 'Register trade'),

  // register
  registerTradeTitle: S('Registrar trade', 'Register trade'),
  entry: S('Entrada', 'Entry'),
  stopLossField: S('Stop loss', 'Stop loss'),
  takeProfitField: S('Take profit', 'Take profit'),
  riskReward: S('Riesgo / beneficio', 'Risk / reward'),
  result: S('Resultado', 'Result'),
  profit: S('Ganancia', 'Profit'),
  lose: S('Pérdida', 'Lose'),
  beQuestion: S('BE?', 'BE?'),
  actualAmountClosed: S('Monto real cerrado (USD)', 'Actual amount closed (USD)'),
  leaveEmptyHint: S('Déjalo vacío para usar la cifra del plan', 'Leave empty to use the plan figure'),
  closeReason: S('Motivo de cierre', 'Close reason'),
  takeProfitOpt: S('Take Profit', 'Take Profit'),
  stopLossOpt: S('Stop Loss', 'Stop Loss'),
  manualCloseOpt: S('Cierre manual', 'Manual close'),
  breakEvenOpt: S('Break even', 'Break even'),
  closePriceLabel: S('Precio de cierre', 'Close price'),
  pnlLabel: S('P&L', 'P&L'),
  notes: S('Notas', 'Notes'),
  screenshot: S('Captura', 'Screenshot'),
  uploadChartCapture: S('sube la captura del gráfico', 'upload chart capture'),
  finalizeBtn: S('Finalizar', 'Finalize'),
  finalizeHint: S(
    'Una ganancia mantiene la sesión abierta. Una pérdida bloquea las cuentas reales hasta la próxima sesión. El break even registra el trade y regresa aquí.',
    'A win keeps the session open. A loss locks real accounts until the next session. Break even logs the trade and returns here.'
  ),
  takeProfitState: S('TAKE PROFIT', 'TAKE PROFIT'),
  stopLossState: S('STOP LOSS', 'STOP LOSS'),

  // no more trades
  noMoreTitle: S('No hay más trades en la sesión', 'No more trades in the session'),
  noMoreBody: S(
    'Espera a la próxima sesión o a mañana. Si quieres seguir operando, cambia a la cuenta DEMO.',
    'Wait until the next session or tomorrow. If you want to keep trading, switch to the DEMO account.'
  ),
  continueOnDemo: S('Continuar en DEMO', 'Continue on DEMO'),
  backToDashboard: S('Volver al panel', 'Back to dashboard'),

  // trade detail
  closePrice: S('Precio de cierre', 'Close price'),
  capture: S('Captura', 'Capture'),
  duration: S('Duración', 'Duration'),
  mentalStateDone: S('Meditación completada', 'Meditation completed'),
  highImpactNews: S('Noticias de alto impacto', 'High-impact news'),
  aiBias: S('Sesgo de la IA', 'AI bias'),
  operatingZone: S('Zona de operación', 'Operating zone'),
  candlePattern: S('Patrón de vela', 'Candle pattern'),
  trendStructure1d: S('Tendencia / estructura 1D', '1D trend / structure'),
  trendStructure1h: S('Tendencia / estructura 1H', '1H trend / structure'),
  trendStructure15m: S('Tendencia / estructura 15m', '15m trend / structure'),
  structureCvd5m: S('Estructura / CVD 5m', '5m structure / CVD'),
  structureCvd3m: S('Estructura / CVD 3m', '3m structure / CVD'),
  noNotes: S('Sin notas.', 'No notes.'),

  // new plan sheet
  newPlanTitle: S('Nuevo plan', 'New plan'),
  newPlanDesc: S(
    'La tabla compone desde tu capital. El riesgo y el TP son porcentajes del capital del día.',
    'The table compounds from your capital. Risk and TP are percentages of the current day’s capital.'
  ),
  planNameLabel: S('Nombre del plan', 'Plan name'),
  planNamePh: S('Plan Libertad', 'Liberty Plan'),
  startingCapital: S('Capital inicial (USD)', 'Starting capital (USD)'),
  goalWhereEnds: S('Meta — donde termina el plan (USD)', 'Goal — where the plan ends (USD)'),
  profitPerDay: S('Ganancia por día (%)', 'Profit per day (%)'),
  riskPerTrade: S('Riesgo por trade (%)', 'Risk per trade (%)'),
  accountLabel: S('Cuenta', 'Account'),
  day1Tp: S('TP del día 1', 'Day 1 TP'),
  day1Risk: S('Riesgo del día 1', 'Day 1 risk'),
  goalIn: S('Meta en', 'Goal in'),
  createPlanBtn: S('Crear plan', 'Create plan'),

  // pick (new trade) sheet
  newTradeTitle: S('Nuevo trade', 'New trade'),
  newTradeDesc: S('Elige la cuenta, su plan y el instrumento a operar.', 'Pick the account, its plan, and the instrument to operate.'),
  chooseAccount: S('Elegir cuenta', 'Choose account'),
  choosePlanLabel: S('Elegir plan', 'Choose plan'),
  instrumentLabel: S('Instrumento', 'Instrument'),
  lockedWarnBody: S(
    'Las cuentas reales están bloqueadas esta sesión. Solo DEMO está disponible.',
    'Real accounts are locked for this session. Only DEMO is available.'
  ),
  letsTradeBtn: S('Vamos a operar', "Let’s trade"),

  // money sheet
  addToCapital: S('Sumar al capital', 'Add to capital'),
  withdrawFromCapital: S('Retirar del capital', 'Withdraw from capital'),
  depositOpt: S('Depósito', 'Deposit'),
  withdrawalOpt: S('Retiro', 'Withdrawal'),
  amountUsd: S('Monto (USD)', 'Amount (USD)'),
  noteLabel: S('Nota', 'Note'),
  notePh: S('Retiro, aporte, split de prop firm…', 'Payout, top-up, prop firm split…'),
  rebasePlan: S('Rebasar el plan', 'Rebase the plan'),
  rebaseDesc: S(
    'Recalcula la tabla y los días a la meta desde el nuevo capital',
    'Recompute the table and the days to goal from the new capital'
  ),
  on: S('ON', 'ON'),
  off: S('OFF', 'OFF'),
  equityAfter: S('Equity después', 'Equity after'),
  recordMovementBtn: S('Registrar movimiento', 'Record movement'),
  noNote: S('sin nota', 'no note'),
  rebased: S('rebasado', 'rebased'),

  // confirm delete
  deletePlanLabel: S('Eliminar plan', 'Delete plan'),
  deletePlanBody: S(
    'Su tabla, equity y movimientos de capital se van con él. Los trades registrados se quedan en el historial.',
    'Its table, equity and capital movements go with it. Logged trades stay in the history.'
  ),
  deleteItBtn: S('Eliminarlo', 'Delete it'),
  keepItBtn: S('Conservarlo', 'Keep it'),

  // settings
  settingsTitle: S('Ajustes', 'Settings'),
  language: S('Idioma', 'Language'),
  spanish: S('Español', 'Español'),
  english: S('English', 'English'),
  appearance: S('Apariencia', 'Appearance'),
  paper: S('Papel', 'Paper'),
  black: S('Negro', 'Black'),
  meditationTrack: S('Audio de meditación', 'Meditation track'),
  noTrackSelected: S('Sin audio seleccionado', 'No track selected'),
  removeBtn: S('Quitar', 'Remove'),
  tracksWhilePlays: S('Suena mientras corre la cuenta y se detiene al terminar.', 'Plays while the countdown runs and stops when it ends.'),
  aLossLocks: S('Una pérdida bloquea', 'A loss locks'),
  lossLocksBody: S(
    'Las cuentas reales quedan bloqueadas hasta la próxima sesión. DEMO sigue abierta.',
    'Real accounts stay locked until the next session. DEMO stays open.'
  ),
  notConfigurable: S(
    'No configurable — esta regla es la base del modelo.',
    'Not configurable — this rule is what the model is built on.'
  ),
  instrumentsYouTrade: S('Instrumentos que operas', 'Instruments you trade'),
  onlySelectedAppear: S('Solo los seleccionados aparecen al abrir un trade.', 'Only the selected ones appear when you open a trade.'),
  meditationLength: S('Duración de la meditación', 'Meditation length'),
  min5: S('5 minutos', '5 minutes'),
  min10: S('10 minutos', '10 minutes'),
  min15: S('15 minutos', '15 minutes'),
  stepOneNotSkippable: S(
    'El paso 1 no se puede omitir — solo tú defines su duración.',
    'Step 1 cannot be skipped — only its length is yours to set.'
  ),
  sessionState: S('Estado de la sesión', 'Session state'),

  // backup / restore
  backupRestore: S('Respaldo y restauración', 'Backup & restore'),
  backupBody: S(
    'Todo vive solo en este navegador: trades, plan, Sueños y el audio de meditación. Descarga un respaldo para guardarlo o llevarlo a otro dispositivo.',
    'Everything lives only in this browser: trades, plan, Sueños, and the meditation audio. Download a backup to keep it safe or move it to another device.'
  ),
  downloadBackup: S('Descargar respaldo', 'Download backup'),
  downloadingBackup: S('Preparando…', 'Preparing…'),
  restoreBackup: S('Restaurar desde un respaldo', 'Restore from a backup'),
  restoringBackup: S('Restaurando…', 'Restoring…'),
  restoreConfirm: S(
    'Esto reemplaza todos los datos actuales de este dispositivo (trades, plan, Sueños, audio) con los del respaldo. Esta acción no se puede deshacer. ¿Continuar?',
    'This replaces all current data on this device (trades, plan, Sueños, audio) with what is in the backup. This cannot be undone. Continue?'
  ),
  restoreInvalidFile: S(
    'Ese archivo no parece un respaldo de DeltraOS.',
    "That file doesn't look like a DeltraOS backup."
  ),
  restoreGenericError: S(
    'No se pudo leer el respaldo. Verifica el archivo e inténtalo de nuevo.',
    "Couldn't read the backup. Check the file and try again."
  ),

  // no plan ask
  noPlanFoundLabel: S('No hay plan', 'No plan found'),
  createAPlanFirstTitle: S('Crea un plan primero', 'Create a plan first'),
  noPlanFoundBody: S(
    'Un trade necesita un plan activo: define el objetivo diario, el riesgo y la cuenta. Crea uno para empezar a operar.',
    'A trade needs an active plan: it defines the daily target, the risk and the account. Create one to start operating.'
  ),

  // BE ask
  breakEvenLabel: S('Break even', 'Break even'),
  registerBeTitle: S('¿Registrar BE?', 'Register BE?'),
  registerBeBody: S(
    'Al registrar el trade como BE se realiza el registro y se empieza un registro nuevo considerando los datos capturados anteriormente hasta la pantalla de Execution. ¿Deseas continuar?',
    'Logging the trade as BE records it and starts a new entry carrying the data captured up to the Execution screen. Continue?'
  ),
  continueBtn: S('Continuar', 'Continue'),

  // warn (next trade of session)
  warningLabel: S('Aviso', 'Warning'),
  nextTradeTitle: S('Siguiente trade de la sesión', 'Next trade of the session'),
  nextTradeBody: S(
    'Los pasos 1 y 2 se quedan guardados de tu primer trade. Solo vuelves a leer la zona de subasta. No fuerces un beneficio por necesidad — el día ya está en verde.',
    'Steps 1 and 2 stay saved from your first trade. You only re-read the auction zone. Do not force a reward out of need — the day is already green.'
  ),
  understoodBtn: S('Entendido — leer la zona', 'Understood — read the zone'),
  notNowBtn: S('Ahora no', 'Not now'),

  // pickers
  pickerStructure: S('Estructura de mercado', 'Market structure'),
  pickerCvd: S('Divergencia de CVD', 'CVD divergence'),
  pickerPattern: S('Patrón de vela con la divergencia', 'Candle pattern with the divergence'),

  // glyph option names
  gUptrend: S('Tendencia alcista', 'Uptrend'),
  gDowntrend: S('Tendencia bajista', 'Downtrend'),
  gConsolidation: S('Consolidación', 'Consolidation'),
  gBart: S('Bart', 'Bart'),
  gPennant: S('Banderín', 'Pennant'),
  gDoubleTop: S('Doble techo', 'Double top'),
  gDoubleBottom: S('Doble piso', 'Double bottom'),
  gHeadShoulders: S('Hombro-cabeza-hombro', 'Head & shoulders'),
  gNone: S('Ninguna', 'None'),
  gBullish: S('Alcista', 'Bullish'),
  gBearish: S('Bajista', 'Bearish'),
  gDoji: S('Doji', 'Doji'),
  gHammer: S('Martillo', 'Hammer'),
  gShootingStar: S('Estrella fugaz', 'Shooting star'),
  gEngulfing: S('Envolvente', 'Engulfing'),

  // instruments
  iMBT: S('Micro Bitcoin', 'Micro Bitcoin'),
  iMGC: S('Micro Oro', 'Micro Gold'),
  iBTC: S('Bitcoin', 'Bitcoin'),
  iBFF: S('Bitcoin Friday', 'Bitcoin Friday'),
  iGC: S('Oro', 'Gold'),
  i1OZ: S('Oro una onza', 'One Ounce Gold'),
} as const;

export type StrKey = keyof typeof STR;

export function useTranslator(lang: Lang) {
  return (key: StrKey) => STR[key][lang === 'EN' ? 'en' : 'es'];
}

// ── templated strings (built directly, not via regex substitution) ─────────

export function tDayN(lang: Lang, n: number): string {
  return lang === 'EN' ? `Day ${n}` : `Día ${n}`;
}
export function tSessions(lang: Lang, n: number): string {
  return lang === 'EN' ? `${n} sessions` : `${n} sesiones`;
}
export function tDays(lang: Lang, n: number): string {
  return lang === 'EN' ? `${n} days` : `${n} días`;
}
export function tOpensIn(lang: Lang, g: string): string {
  return lang === 'EN' ? `opens in ${g}` : `abre en ${g}`;
}
export function tClosesIn(lang: Lang, g: string): string {
  return lang === 'EN' ? `closes in ${g}` : `cierra en ${g}`;
}
export function tYourTime(lang: Lang, range: string): string {
  return lang === 'EN' ? `${range} your time` : `${range} tu hora`;
}
export function tFlowCrumb(lang: Lang, flow: 'first' | 'next', day: number): string {
  if (flow === 'next') return lang === 'EN' ? `Next trade · day ${day}` : `Trade siguiente · día ${day}`;
  return lang === 'EN' ? `First trade · day ${day}` : `Primer trade · día ${day}`;
}
export function tFlowLabel(lang: Lang, flow: 'first' | 'next'): string {
  if (flow === 'next') return lang === 'EN' ? 'Next trade' : 'Trade siguiente';
  return lang === 'EN' ? 'First trade' : 'Primer trade';
}
export function tSizeHint(lang: Lang, contracts: number, instrument: string, riskFmt: string): string {
  return lang === 'EN'
    ? `Suggested size: ${contracts} ${instrument} — keeps the stop within the day’s risk of ${riskFmt}.`
    : `Tamaño sugerido: ${contracts} ${instrument} — mantiene el stop dentro del riesgo del día de ${riskFmt}.`;
}
export function tProbability(lang: Lang, pct: number): string {
  return lang === 'EN' ? `${pct}% probability` : `${pct}% de probabilidad`;
}
export function tImagesCount(lang: Lang, n: number): string {
  if (lang === 'EN') return n === 1 ? '1 image' : `${n} images`;
  return n === 1 ? '1 imagen' : `${n} imágenes`;
}
export function tRestoreSummary(lang: Lang, imageCount: number, hasAudio: boolean): string {
  const images = tImagesCount(lang, imageCount);
  if (lang === 'EN') return `Restored — ${images}${hasAudio ? ' and the meditation track' : ''}.`;
  return `Restaurado — ${images}${hasAudio ? ' y el audio de meditación' : ''}.`;
}
export function tCmeNote(lang: Lang, resetHhmm: string, nowHhmm: string): string {
  return lang === 'EN'
    ? `Trading day resets at ${resetHhmm} CT · now ${nowHhmm} CT`
    : `El día de trading reinicia a las ${resetHhmm} CT · ahora ${nowHhmm} CT`;
}
export function tPlanMeta(lang: Lang, account: string, base: string, win: number, loss: number): string {
  return lang === 'EN' ? `${account} · ${base} base · ${win}% TP / ${loss}% risk` : `${account} · ${base} base · ${win}% TP / ${loss}% riesgo`;
}
export function tEquityGoal(lang: Lang, equity: string, g: string): string {
  return lang === 'EN' ? `Equity ${equity} · goal ${g}` : `Equity ${equity} · meta ${g}`;
}
export function tPlanEquityLine(lang: Lang, planName: string, equity: string): string {
  return lang === 'EN' ? `${planName} · equity ${equity}` : `${planName} · equity ${equity}`;
}
export function tZoneDetected(lang: Lang, zone: string, clock: string): string {
  return lang === 'EN' ? `${zone} detected automatically · ${clock}` : `${zone} detectada automáticamente · ${clock}`;
}
export function tMoveMeta(lang: Lang, planName: string, day: number, note: string | null, rebase: boolean): string {
  const dayTxt = lang === 'EN' ? `day ${day}` : `día ${day}`;
  const parts = [planName, dayTxt];
  if (note) parts.push(note);
  else if (!rebase) parts.push(lang === 'EN' ? 'no note' : 'sin nota');
  if (rebase && note) parts.push(lang === 'EN' ? 'rebased' : 'rebasado');
  else if (rebase && !note) parts[parts.length - 1] = lang === 'EN' ? 'rebased' : 'rebasado';
  return parts.join(' · ');
}
export function tStepOf4(lang: Lang, n: number): string {
  return lang === 'EN' ? `— Step ${n} of 4` : `— Paso ${n} de 4`;
}

export function tDayRiskLine(lang: Lang, day: string, risk: string): string {
  return lang === 'EN' ? `${day} risk ${risk}` : `${day} riesgo ${risk}`;
}
export function tPickPlanMeta(lang: Lang, equityFmt: string, day: number, riskFmt: string): string {
  const dayTxt = lang === 'EN' ? `day ${day}` : `día ${day}`;
  return lang === 'EN' ? `${equityFmt} · ${dayTxt} risk ${riskFmt}` : `${equityFmt} · ${dayTxt} riesgo ${riskFmt}`;
}

// ── raw domain-value labels (trend words, structure/CVD/pattern names,
// dropdown option values, account/instrument codes) — translated the same
// way wherever they surface: dropdown options, glyph pickers, trade detail. ──
const ENUM: Record<string, Pair> = {
  Bullish: S('Alcista', 'Bullish'), Bearish: S('Bajista', 'Bearish'), Range: S('Rango', 'Range'),
  None: S('Ninguna', 'None'),
  Uptrend: S('Tendencia alcista', 'Uptrend'), Downtrend: S('Tendencia bajista', 'Downtrend'),
  Consolidation: S('Consolidación', 'Consolidation'), Bart: S('Bart', 'Bart'), Pennant: S('Banderín', 'Pennant'),
  'Double top': S('Doble techo', 'Double top'), 'Double bottom': S('Doble piso', 'Double bottom'),
  'Head & shoulders': S('Hombro-cabeza-hombro', 'Head & shoulders'),
  Doji: S('Doji', 'Doji'), Hammer: S('Martillo', 'Hammer'), 'Shooting star': S('Estrella fugaz', 'Shooting star'),
  Engulfing: S('Envolvente', 'Engulfing'),
  'Above price': S('Arriba del precio', 'Above price'), 'Below price': S('Abajo del precio', 'Below price'),
  'Above level 0': S('Por encima del nivel 0', 'Above level 0'), 'Below level 0': S('Por debajo del nivel 0', 'Below level 0'),
  'Long confirmed': S('Long confirmado', 'Long confirmed'), 'Short confirmed': S('Short confirmado', 'Short confirmed'),
  'Not confirmed': S('Sin confirmar', 'Not confirmed'),
  Yes: S('Sí', 'Yes'), No: S('No', 'No'),
  Low: S('Baja', 'Low'), Medium: S('Media', 'Medium'), High: S('Alta', 'High'),
  'Take Profit': S('Take Profit', 'Take Profit'), 'Stop Loss': S('Stop Loss', 'Stop Loss'),
  'Manual close': S('Cierre manual', 'Manual close'), 'Break even': S('Break even', 'Break even'),
  Profit: S('Ganancia', 'Profit'), Lose: S('Pérdida', 'Lose'), BE: S('BE', 'BE'),
  Funded: S('Funded', 'Funded'), Evaluation: S('Evaluation', 'Evaluation'), Live: S('Live', 'Live'), Demo: S('Demo', 'Demo'),
  VAL: S('VAL', 'VAL'), VAH: S('VAH', 'VAH'), 'POC 5m': S('POC 5m', 'POC 5m'),
  BUY: S('COMPRA', 'BUY'), SELL: S('VENTA', 'SELL'),
  MBT: S('Micro Bitcoin', 'Micro Bitcoin'), MGC: S('Micro Oro', 'Micro Gold'), BTC: S('Bitcoin', 'Bitcoin'),
  BFF: S('Bitcoin Friday', 'Bitcoin Friday'), GC: S('Oro', 'Gold'), '1OZ': S('Oro una onza', 'One Ounce Gold'),
};

export function enumLabel(lang: Lang, raw: string): string {
  const pair = ENUM[raw];
  return pair ? pair[lang === 'EN' ? 'en' : 'es'] : raw;
}
