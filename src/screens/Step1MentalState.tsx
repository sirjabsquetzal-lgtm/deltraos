import { medLeftSeconds, useAppState, useDispatch, useNow } from '../store';
import { useTranslator, tFlowLabel, tStepOf4 } from '../i18n';
import { StepHeader } from '../ui';

export default function Step1MentalState() {
  const state = useAppState();
  const dispatch = useDispatch();
  const now = useNow();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const med = state.med;
  const left = medLeftSeconds(state, now);
  const dash = (584 * (1 - left / med.totalSec)).toFixed(1) + ' 584';
  const clock = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  const label = med.ready ? t('mindClear') : med.running ? t('eyesClosedBreathing') : t('tapToBegin');

  return (
    <div>
      <StepHeader kicker={`${tFlowLabel(lang, state.flow)} ${tStepOf4(lang, 1)}`} title={t('mentalState')} onBack={() => dispatch({ type: 'BACK' })} />
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 14, margin: 0 }}>{t('mentalP1')}</p>
        <p style={{ fontSize: 14, margin: '10px 0 0' }}>{t('mentalP2')}</p>
        <div style={{ marginTop: 16, borderLeft: '2px solid var(--color-accent)', padding: '8px 0 8px 12px' }}>
          <div className="dos-k">{t('mantraLabel')}</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, lineHeight: 1.15, marginTop: 3 }}>
            “Construyo con estrategia libertad plena y estable”
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '26px 0 10px' }}>
          <button
            style={{ width: 196, height: 196, borderRadius: '50%', border: '2px solid var(--color-text)', background: 'transparent', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, font: 'inherit', color: 'var(--color-text)' }}
            onClick={() => dispatch({ type: 'ON_MED' })}
          >
            <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: -2, width: 200, height: 200, transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="93" fill="none" stroke="var(--color-accent)" strokeWidth={12} strokeDasharray={dash} />
            </svg>
            <span className="dos-dot-num" style={{ fontSize: 46, lineHeight: 1 }}>{clock}</span>
            <span className="dos-k" style={{ maxWidth: 140, textAlign: 'center', lineHeight: 1.4 }}>{label}</span>
          </button>
        </div>
        {med.ready && (
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'step2' })}>
            {t('readyContinue')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ marginLeft: 'auto' }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
