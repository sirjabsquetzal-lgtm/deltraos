import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tEquityGoal, tMoveMeta, tPlanMeta, tSessions } from '../i18n';
import { IconChevronDown, IconPlus, IconTrash } from '../icons';
import { getPlan, money } from '../view';
import { planDays, planRow } from '../logic';

export default function PlanTab() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const plan = getPlan(state);

  const rows = plan ? Array.from({ length: planDays(plan, state.day) }, (_, i) => planRow(plan, i + 1, state.day)) : [];

  return (
    <div>
      <div style={{ padding: 16, borderBottom: '2px solid var(--color-divider)' }}>
        <h3 style={{ margin: '0 0 4px' }}>{t('planTitle')}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', margin: 0 }}>{t('planSubtitle')}</p>
        <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => dispatch({ type: 'GO', screen: 'plans' })}>
          {t('choosePlanBtn')}
          <IconChevronDown style={{ marginLeft: 'auto' }} />
        </button>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'newplan' })}>
          {t('addNewPlanBtn')}
          <IconPlus style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {!plan && (
        <div style={{ padding: '28px 16px', fontSize: 13, color: 'var(--color-neutral-700)' }}>{t('noPlansSaved')}</div>
      )}

      {plan && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <span>
              <span className="dos-num" style={{ fontSize: 15 }}>{plan.name}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                {tPlanMeta(lang, enumLabel(lang, plan.account), money(plan.capital), plan.win, plan.loss)}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                {tEquityGoal(lang, money(plan.equity), money(plan.goal))}
              </span>
            </span>
            <span className="tag tag-accent">{t('activeTag')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'PLAN_ACTION', k: 'deposit', v: plan.id })}>{t('deposit')}</button>
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'PLAN_ACTION', k: 'withdraw', v: plan.id })}>{t('withdraw')}</button>
            <button className="btn btn-ghost" onClick={() => dispatch({ type: 'PLAN_ACTION', k: 'delete', v: plan.id })}>{t('delete')}</button>
          </div>
        </div>
      )}

      {state.moves.length > 0 && (
        <div>
          <div style={{ padding: '16px 16px 6px' }}>
            <div className="dos-k">{t('capitalMovements')}</div>
          </div>
          {state.moves.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--color-divider)' }}>
              <span>
                <span className="dos-num" style={{ fontSize: 14 }}>{m.type === 'Deposit' ? t('depositOpt') : t('withdrawalOpt')}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                  {tMoveMeta(lang, m.planName, m.day, m.note || null, m.rebase)}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dos-num" style={{ fontSize: 15, color: m.signed > 0 ? 'var(--color-text)' : 'var(--color-accent)' }}>
                  {(m.signed > 0 ? '+' : '') + money(m.signed)}
                </span>
                <button className="btn btn-ghost" aria-label={t('delete')} onClick={() => dispatch({ type: 'PLAN_ACTION', k: 'delmove', v: m.id })}>
                  <IconTrash />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {plan && (
        <div style={{ padding: '8px 0 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid var(--color-divider)' }}>
            <div style={{ padding: '10px 16px', borderRight: '1px solid var(--color-divider)' }}>
              <div className="dos-k">{t('goal')}</div>
              <div className="dos-num" style={{ fontSize: 17 }}>{money(plan.goal)}</div>
            </div>
            <div style={{ padding: '10px 16px' }}>
              <div className="dos-k">{t('sessionsToGoal')}</div>
              <div className="dos-num" style={{ fontSize: 17 }}>{tSessions(lang, rows.length)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr><th>{t('tableDay')}</th><th>{t('tableCapital')}</th><th>{t('tableFirstTp')}</th><th>{t('tableRisk')}</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} style={{ background: r.day === state.day ? 'var(--color-accent-100)' : 'transparent' }}>
                  <td className="dos-num">{r.day}</td>
                  <td className="dos-num">{money(r.cap)}</td>
                  <td className="dos-num">{money(r.tp)}</td>
                  <td className="dos-num" style={{ color: 'var(--color-accent-700)' }}>{money(r.risk)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '14px 16px 28px', fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('planFootnote')}</div>
        </div>
      )}
    </div>
  );
}
