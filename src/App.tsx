import { useMeditationTrack } from './media';
import { useAppState, useDispatch } from './store';
import { useTranslator, tFlowCrumb } from './i18n';
import { IconSettings } from './icons';
import { MediaCtx } from './mediaContext';

import Dashboard from './screens/Dashboard';
import Trades from './screens/Trades';
import PlanTab from './screens/PlanTab';
import ChoosePlan from './screens/ChoosePlan';
import Dreams from './screens/Dreams';
import Step1MentalState from './screens/Step1MentalState';
import Step2Fundamentals from './screens/Step2Fundamentals';
import Step3GeneralTrend from './screens/Step3GeneralTrend';
import Step4AuctionZone from './screens/Step4AuctionZone';
import Execution from './screens/Execution';
import RegisterTrade from './screens/RegisterTrade';
import NoMoreTrades from './screens/NoMoreTrades';
import TradeDetail from './screens/TradeDetail';
import Sheets from './sheets/Sheets';
import { IconPlus } from './icons';

const IN_FLOW = ['step1', 'step2', 'step3', 'step4', 'buy', 'register'];
const NO_TABS = [...IN_FLOW, 'nomore', 'detail'];

export default function App() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const track = useMeditationTrack(state.med.running);

  const rootClass = 'dos-shell' + (state.settings.theme === 'Black' ? ' dos-dark' : '');
  const inFlow = !!state.screen && IN_FLOW.includes(state.screen);
  const showTabs = !state.screen || !NO_TABS.includes(state.screen);

  return (
    <div className="dos-page">
      <div className={rootClass}>
        <MediaCtx.Provider value={track}>
          <div className="dos-bar" style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span className="dos-glyph" style={{ background: 'var(--color-accent)' }} />
                <div className="dos-dot-num" style={{ fontSize: 25, lineHeight: 1, letterSpacing: '0.06em' }}>
                  DELTRA<span style={{ color: '#ff5c3d' }}>OS</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: "'Chivo Mono', monospace", fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8c8988' }}>
                  by JABS
                </div>
                <button
                  style={{ width: 38, height: 38, flex: 'none', background: 'transparent', color: 'inherit', border: '1px solid var(--color-neutral-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => dispatch({ type: 'OPEN_SETTINGS' })}
                  aria-label="Settings"
                >
                  <IconSettings />
                </button>
              </div>
            </div>
          </div>

          {showTabs && (
            <div style={{ flex: 'none', borderBottom: '2px solid var(--color-divider)', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'stretch' }}>
              {([
                ['dash', t('tabDash')],
                ['trades', t('tabTrades')],
                ['plan', t('tabPlan')],
                ['dreams', t('tabDreams')],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  className="dos-tab"
                  data-on={!state.screen && state.tab === tab ? '1' : '0'}
                  onClick={() => dispatch({ type: 'SET_TAB', tab })}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {inFlow && (
            <div style={{ flex: 'none', borderBottom: '2px solid var(--color-divider)', background: 'var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 0 4px' }}>
              <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO', screen: 'dash' })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
                {t('exit')}
              </button>
              <span className="dos-k">{tFlowCrumb(lang, state.flow, state.day)}</span>
            </div>
          )}

          <div className="scrollarea">
            {!state.screen && state.tab === 'dash' && <Dashboard />}
            {!state.screen && state.tab === 'trades' && <Trades />}
            {!state.screen && state.tab === 'plan' && <PlanTab />}
            {!state.screen && state.tab === 'dreams' && <Dreams />}
            {state.screen === 'plans' && <ChoosePlan />}
            {state.screen === 'step1' && <Step1MentalState />}
            {state.screen === 'step2' && <Step2Fundamentals />}
            {state.screen === 'step3' && <Step3GeneralTrend />}
            {state.screen === 'step4' && <Step4AuctionZone />}
            {state.screen === 'buy' && <Execution />}
            {state.screen === 'register' && <RegisterTrade />}
            {state.screen === 'nomore' && <NoMoreTrades />}
            {state.screen === 'detail' && <TradeDetail />}
          </div>

          <div style={{ flex: 'none', height: 22, background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)' }} />

          <button className="dos-fab" onClick={() => dispatch({ type: 'PLUS' })} aria-label="New trade">
            <IconPlus size={26} />
          </button>

          <Sheets />
        </MediaCtx.Provider>
      </div>
    </div>
  );
}
