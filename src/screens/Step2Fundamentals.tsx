import { useAppState, useDispatch } from '../store';
import { useTranslator, tFlowLabel, tStepOf4 } from '../i18n';
import { StepHeader, Seg } from '../ui';
import { IconCopy, IconForward } from '../icons';
import { aiPrompt } from '../logic';

export default function Step2Fundamentals() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const s = state.s;

  const onCopyPrompt = () => {
    const prompt = aiPrompt(state.instrument);
    if (navigator.clipboard) navigator.clipboard.writeText(prompt).catch(() => {});
    dispatch({ type: 'COPY_PROMPT' });
  };

  return (
    <div>
      <StepHeader kicker={`${tFlowLabel(lang, state.flow)} ${tStepOf4(lang, 2)}`} title={t('fundamentals')} onBack={() => dispatch({ type: 'BACK' })} />

      <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
        <div className="card-title">{t('economicCalendar')}</div>
        <p style={{ fontSize: 13, margin: '4px 0 10px', color: 'var(--color-neutral-800)' }}>{t('anyHighImpact')}</p>
        <Seg
          name="eco"
          value={s.eco}
          onChange={(v) => dispatch({ type: 'SET_SNAP', k: 'eco', v })}
          options={[{ value: 'Yes', label: t('yes') }, { value: 'No', label: t('no') }]}
        />
        {s.eco === 'Yes' && (
          <div style={{ marginTop: 10, background: 'var(--color-accent-100)', borderLeft: '2px solid var(--color-accent)', padding: '8px 12px', fontSize: 12, color: 'var(--color-accent-800)' }}>
            {t('carefulHighImpact')}
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
        <div className="card-title">{t('aiAnalysis')}</div>
        <p style={{ fontSize: 13, margin: '4px 0 10px', color: 'var(--color-neutral-800)' }}>{t('copyPromptDesc')}</p>
        <button className="btn btn-secondary btn-block" onClick={onCopyPrompt}>
          {state.copied ? t('aiPromptCopied') : t('copyAiPrompt')}
          <IconCopy style={{ marginLeft: 'auto' }} />
        </button>
        <div className="dos-k" style={{ margin: '14px 0 6px' }}>{t('higherProbability')}</div>
        <Seg
          name="bias"
          value={s.bias}
          onChange={(v) => dispatch({ type: 'SET_SNAP', k: 'bias', v })}
          options={[{ value: 'Bullish', label: t('trendBullish') }, { value: 'Bearish', label: t('trendBearish') }]}
        />
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-neutral-700)' }}>{t('treatAsProbability')}</div>
      </div>

      <div style={{ padding: 16 }}>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'step3' })}>
          {t('continueToGeneralTrend')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </div>
  );
}
