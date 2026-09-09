import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tEquityGoal, tPlanMeta } from '../i18n';
import { BackLink } from '../ui';
import { money } from '../view';

export default function ChoosePlan() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);

  return (
    <div>
      <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)' }}>
        <BackLink label={t('back')} onClick={() => dispatch({ type: 'GO', screen: 'plantab' })} />
        <h3 style={{ margin: '6px 0 0' }}>{t('choosePlanTitle')}</h3>
      </div>

      {state.plans.length === 0 && (
        <div style={{ padding: '28px 16px', fontSize: 13, color: 'var(--color-neutral-700)' }}>{t('noPlansSaved')}</div>
      )}

      {state.plans.map((p) => {
        const on = p.id === state.activeId;
        return (
          <button
            key={p.id}
            className="dos-row"
            style={{ background: on ? 'var(--color-accent-100)' : 'transparent' }}
            onClick={() => dispatch({ type: 'PLAN_ACTION', k: 'activate', v: p.id })}
          >
            <span>
              <span className="dos-num" style={{ fontSize: 15 }}>{p.name}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                {tPlanMeta(lang, enumLabel(lang, p.account), money(p.capital), p.win, p.loss)}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                {tEquityGoal(lang, money(p.equity), money(p.goal))}
              </span>
            </span>
            <span className={'tag ' + (on ? 'tag-accent' : 'tag-outline')}>{on ? t('selected') : t('select')}</span>
          </button>
        );
      })}
      <div style={{ padding: '24px 16px' }} />
    </div>
  );
}
