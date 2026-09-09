import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tFlowLabel, tStepOf4 } from '../i18n';
import { StepHeader } from '../ui';
import { IconChevronDown, IconForward } from '../icons';
import { getGeneralTrend } from '../view';
import type { TradeSnapshot } from '../types';

const ROWS: { tf: string; trendKey: keyof TradeSnapshot; structureKey: keyof TradeSnapshot; zoneKey: keyof TradeSnapshot }[] = [
  { tf: '1D', trendKey: 't1d', structureKey: 's1d', zoneKey: 'z1d' },
  { tf: '1H', trendKey: 't1h', structureKey: 's1h', zoneKey: 'z1h' },
  { tf: '15m', trendKey: 't15', structureKey: 's15', zoneKey: 'z15' },
];

export default function Step3GeneralTrend() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const s = state.s;
  const general = getGeneralTrend(s);

  return (
    <div>
      <StepHeader kicker={`${tFlowLabel(lang, state.flow)} ${tStepOf4(lang, 3)}`} title={t('generalTrendTitle')} onBack={() => dispatch({ type: 'BACK' })} />

      {ROWS.map((r) => (
        <div key={r.tf} style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="dos-num" style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: '3px 8px', fontSize: 12 }}>{r.tf}</span>
            <select
              className="input"
              style={{ flex: 1 }}
              value={s[r.trendKey] as string}
              onChange={(e) => dispatch({ type: 'SET_SNAP', k: r.trendKey, v: e.currentTarget.value })}
            >
              <option value="Bullish">{t('trendBullish')}</option>
              <option value="Bearish">{t('trendBearish')}</option>
              <option value="Range">{t('trendRange')}</option>
            </select>
          </div>
          <div className="dos-k" style={{ margin: '12px 0 4px' }}>{t('structure')}</div>
          <button
            className="input"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'structureHtf', key: r.structureKey })}
          >
            <span>{enumLabel(lang, s[r.structureKey] as string)}</span>
            <IconChevronDown style={{ flex: 'none' }} />
          </button>
          <div className="dos-k" style={{ margin: '12px 0 4px' }}>{t('nearHighImpactZone')}</div>
          <select
            className="input"
            value={s[r.zoneKey] as string}
            onChange={(e) => dispatch({ type: 'SET_SNAP', k: r.zoneKey, v: e.currentTarget.value })}
          >
            <option value="Yes">{t('yes')}</option>
            <option value="No">{t('no')}</option>
          </select>
        </div>
      ))}

      <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="dos-k">{t('generalTrendLabel')}</div>
        <div className="dos-num" style={{ fontSize: 18, color: 'var(--color-accent-700)' }}>
          {general === 'Mixed' ? t('trendMixed') : enumLabel(lang, general)}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'step4' })}>
          {t('continueToAuctionZone')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  );
}
