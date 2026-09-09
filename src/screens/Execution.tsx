import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel } from '../i18n';
import { StepHeader } from '../ui';
import { IconChevronDown, IconForward } from '../icons';
import { getGeneralTrend, getSide } from '../view';

export default function Execution() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const s = state.s;
  const chk = state.chk;
  const side = getSide(getGeneralTrend(s));

  return (
    <div>
      <StepHeader kicker={t('execution')} title={`${t('letsPrefix')} ${enumLabel(lang, side)}`} onBack={() => dispatch({ type: 'BACK' })} />

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <label className="dos-row" style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 0, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_CHK', k: 'book' }); }}>
          <span className="card-title">{t('openBookmap')}</span>
          <span className={'tag ' + (chk.book ? 'tag-accent' : 'tag-neutral')}>{chk.book ? t('done') : t('pending')}</span>
        </label>
        <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--color-neutral-800)' }}>{t('bookmapDesc')}</p>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <label className="dos-row" style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 0, cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_CHK', k: 'retest' }); }}>
          <span className="card-title">{t('zoneRetest')}</span>
          <span className={'tag ' + (chk.retest ? 'tag-accent' : 'tag-neutral')}>{chk.retest ? t('done') : t('pending')}</span>
        </label>
        <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--color-neutral-800)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800 }}>{t('patience')}</span> {t('patienceDesc')}
        </p>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="dos-k" style={{ marginBottom: 4 }}>{t('candlePatternWithDivergence')}</div>
        <button className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => dispatch({ type: 'OPEN_PICKER', kind: 'pattern', key: 'pattern' })}>
          <span>{enumLabel(lang, s.pattern)}</span>
          <IconChevronDown style={{ flex: 'none' }} />
        </button>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="card-title" style={{ marginBottom: 10 }}>{t('insaneScalpConfirmation')}</div>
        <div className="dos-k" style={{ marginBottom: 4 }}>{t('linesAboveBelow')}</div>
        <select className="input" value={s.insaneLines} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'insaneLines', v: e.currentTarget.value })}>
          <option value="Above level 0">{t('aboveLevel0')}</option>
          <option value="Below level 0">{t('belowLevel0')}</option>
        </select>
        <div className="dos-k" style={{ margin: '12px 0 4px' }}>{t('longShortConfirmation')}</div>
        <select className="input" value={s.insaneSide} onChange={(e) => dispatch({ type: 'SET_SNAP', k: 'insaneSide', v: e.currentTarget.value })}>
          <option value="Long confirmed">{t('longConfirmed')}</option>
          <option value="Short confirmed">{t('shortConfirmed')}</option>
          <option value="Not confirmed">{t('notConfirmed')}</option>
        </select>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: 'var(--color-accent-100)', borderLeft: '2px solid var(--color-accent)', padding: '10px 12px', fontSize: 12, color: 'var(--color-accent-800)' }}>
          {t('insaneScalpNote')}
        </div>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'register' })}>
          {t('registerTradeBtn')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  );
}
