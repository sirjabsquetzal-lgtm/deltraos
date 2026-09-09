import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tFlowLabel, tSizeHint, tStepOf4, tProbability } from '../i18n';
import { StepHeader } from '../ui';
import { IconChevronDown, IconForward } from '../icons';
import { getConfidencePct, getContracts, getGeneralTrend, getRowToday, getSide, getSlHintKey, getTpHintKey, money } from '../view';
import { INSTRUMENTS } from '../logic';

export default function Step4AuctionZone() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const s = state.s;
  const chk = state.chk;

  const general = getGeneralTrend(s);
  const side = getSide(general);
  const conf = getConfidencePct(s);
  const row = getRowToday(state);
  const tpHintKey = getTpHintKey(s, side);
  const slHintKey = getSlHintKey(s);
  const contracts = getContracts(row, state.reg, state.instrument);
  const instrumentName = INSTRUMENTS.find((i) => i.code === state.instrument)?.code ?? state.instrument;

  return (
    <div>
      <StepHeader kicker={`${tFlowLabel(lang, state.flow)} ${tStepOf4(lang, 4)}`} title={t('scalpingTitle')} onBack={() => dispatch({ type: 'BACK' })} />

      {/* 5m row */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="dos-num" style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '3px 8px', fontSize: 12 }}>5m</span>
          <select className="input" style={{ flex: 1 }} value={s.t5m} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 't5m', v: e.currentTarget.value })}>
            <option value="Bullish">{t('trendBullish')}</option>
            <option value="Bearish">{t('trendBearish')}</option>
            <option value="Range">{t('trendRange')}</option>
          </select>
        </div>
        <div className="dos-k" style={{ margin: '12px 0 4px' }}>{t('structure')}</div>
        <button className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'structure', key: 's5m' })}>
          <span>{enumLabel(lang, s.s5m)}</span>
          <IconChevronDown style={{ flex: 'none' }} />
        </button>

        <label className="dos-row" style={{ paddingLeft: 0, paddingRight: 0, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_CHK', k: 'liq5m' }); }}>
          <span style={{ fontSize: 14 }}>{t('liquidityZonesMarked')}</span>
          <span className={'tag ' + (chk.liq5m ? 'tag-accent' : 'tag-neutral')}>{chk.liq5m ? t('done') : t('pending')}</span>
        </label>
        <label className="dos-row" style={{ paddingLeft: 0, paddingRight: 0, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_CHK', k: 'va5m' }); }}>
          <span style={{ fontSize: 14 }}>{t('vahValPoc')}</span>
          <span className={'tag ' + (chk.va5m ? 'tag-accent' : 'tag-neutral')}>{chk.va5m ? t('done') : t('pending')}</span>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div>
            <div className="dos-k" style={{ marginBottom: 4 }}>{t('cvdDivergence')}</div>
            <button className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'cvd', key: 'cvd5m' })}>
              <span>{enumLabel(lang, s.cvd5m)}</span>
              <IconChevronDown style={{ flex: 'none' }} />
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="dos-k" style={{ marginBottom: 4 }}>{t('heatmapLiquidity')}</div>
          <select className="input" value={s.h5m} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'h5m', v: e.currentTarget.value })}>
            <option value="Above price">{t('abovePrice')}</option>
            <option value="Below price">{t('belowPrice')}</option>
          </select>
        </div>
      </div>

      {/* 3m row */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="dos-num" style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '3px 8px', fontSize: 12 }}>3m</span>
          <select className="input" style={{ flex: 1 }} value={s.t3m} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 't3m', v: e.currentTarget.value })}>
            <option value="Bullish">{t('trendBullish')}</option>
            <option value="Bearish">{t('trendBearish')}</option>
            <option value="Range">{t('trendRange')}</option>
          </select>
        </div>
        <div className="dos-k" style={{ margin: '12px 0 4px' }}>{t('structure')}</div>
        <button className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'structure', key: 's3m' })}>
          <span>{enumLabel(lang, s.s3m)}</span>
          <IconChevronDown style={{ flex: 'none' }} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div>
            <div className="dos-k" style={{ marginBottom: 4 }}>{t('cvdDivergence')}</div>
            <button className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'cvd', key: 'cvd3m' })}>
              <span>{enumLabel(lang, s.cvd3m)}</span>
              <IconChevronDown style={{ flex: 'none' }} />
            </button>
          </div>
          <div>
            <div className="dos-k" style={{ marginBottom: 4 }}>{t('divergenceStrength')}</div>
            <select className="input" value={s.strength} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'strength', v: e.currentTarget.value })}>
              <option value="Low">{t('low')}</option>
              <option value="Medium">{t('medium')}</option>
              <option value="High">{t('high')}</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="dos-k" style={{ marginBottom: 4 }}>{t('heatmapLiquidity')}</div>
          <select className="input" value={s.h3m} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'h3m', v: e.currentTarget.value })}>
            <option value="Above price">{t('abovePrice')}</option>
            <option value="Below price">{t('belowPrice')}</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="dos-k" style={{ marginBottom: 4 }}>{t('divergenceZone')}</div>
        <select className="input" value={s.divZone} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'divZone', v: e.currentTarget.value })}>
          <option value="VAL">VAL</option>
          <option value="VAH">VAH</option>
          <option value="POC 5m">POC 5m</option>
        </select>
      </div>

      <div style={{ padding: 16, background: 'var(--color-text)', color: 'var(--color-bg)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-500)' }}>{t('results')}</div>
        <div className="dos-dot-num" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 6 }}>
          {enumLabel(lang, side)} <span className="dos-num" style={{ fontSize: 14, color: 'var(--color-neutral-400)' }}>{tProbability(lang, conf)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 14, background: 'var(--color-neutral-700)' }}>
          <div style={{ background: 'var(--color-text)', padding: '10px 12px 10px 0' }}>
            <div className="dos-k" style={{ color: 'var(--color-neutral-500)' }}>{t('zone')}</div>
            <div className="dos-num" style={{ fontSize: 15 }}>{s.divZone}</div>
          </div>
          <div style={{ background: 'var(--color-text)', padding: '10px 0 10px 12px' }}>
            <div className="dos-k" style={{ color: 'var(--color-neutral-500)' }}>{t('stopLoss')}</div>
            <div className="dos-num" style={{ fontSize: 15 }}>{t(slHintKey)}</div>
          </div>
          <div style={{ background: 'var(--color-text)', padding: '10px 12px 10px 0' }}>
            <div className="dos-k" style={{ color: 'var(--color-neutral-500)' }}>{t('takeProfit')}</div>
            <div className="dos-num" style={{ fontSize: 15 }}>{t(tpHintKey)}</div>
          </div>
          <div style={{ background: 'var(--color-text)', padding: '10px 0 10px 12px' }}>
            <div className="dos-k" style={{ color: 'var(--color-neutral-500)' }}>{t('maxLoss')}</div>
            <div className="dos-num" style={{ fontSize: 15, color: 'var(--color-accent-500)' }}>{row ? money(row.risk) : '—'}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-neutral-400)' }}>
          {tSizeHint(lang, contracts, instrumentName, row ? money(row.risk) : '—')}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'buy' })}>
          {t('startTrade')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  );
}
