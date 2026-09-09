import { useDispatch, useAppState } from '../store';
import { useTranslator } from '../i18n';
import { IconForward } from '../icons';

export default function NoMoreTrades() {
  const dispatch = useDispatch();
  const state = useAppState();
  const t = useTranslator(state.settings.lang);

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ border: '2px solid var(--color-text)', padding: '24px 18px' }}>
        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.05 }}>{t('noMoreTitle')}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="var(--color-accent)" strokeWidth={3}>
            <circle cx="50" cy="50" r="46" />
            <line x1="18" y1="82" x2="82" y2="18" />
          </svg>
        </div>
        <p style={{ fontSize: 14, margin: 0 }}>{t('noMoreBody')}</p>
      </div>
      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        <button className="btn btn-secondary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'demo' })}>
          {t('continueOnDemo')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'GO', screen: 'dash' })}>{t('backToDashboard')}</button>
      </div>
    </div>
  );
}
