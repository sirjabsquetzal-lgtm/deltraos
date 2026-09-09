import { useAppState, useDispatch } from '../store';
import { useTranslator, tPlanEquityLine } from '../i18n';
import { SheetOverlay, SheetPanel, Seg } from '../ui';
import { IconCheck } from '../icons';
import { money } from '../view';

export default function MoneySheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const t = useTranslator(state.settings.lang);
  const m = state.m;
  const plan = state.plans.find((p) => p.id === state.moneyPlanId) || null;
  const after = plan
    ? money(Math.max(0, plan.equity + (m.moneyType === 'Withdrawal' ? -1 : 1) * Math.abs(parseFloat(m.mAmount) || 0)))
    : '—';

  return (
    <SheetOverlay>
      <SheetPanel
        title={m.moneyType === 'Withdrawal' ? t('withdrawFromCapital') : t('addToCapital')}
        subtitle={tPlanEquityLine(state.settings.lang, plan ? plan.name : '—', plan ? money(plan.equity) : '—')}
        onClose={() => dispatch({ type: 'CLOSE_SHEET' })}
      >
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <Seg
            name="moneyType"
            value={m.moneyType}
            onChange={(v) => dispatch({ type: 'SET_MONEY_TYPE', v })}
            options={[{ value: 'Deposit', label: t('depositOpt') }, { value: 'Withdrawal', label: t('withdrawalOpt') }]}
          />
          <div className="field">
            <label>{t('amountUsd')}</label>
            <input className="input dos-num" value={m.mAmount} onChange={(e) => dispatch({ type: 'SET_MONEY_FIELD', k: 'mAmount', v: e.currentTarget.value })} />
          </div>
          <div className="field">
            <label>{t('noteLabel')}</label>
            <input className="input" value={m.mNote} onChange={(e) => dispatch({ type: 'SET_MONEY_FIELD', k: 'mNote', v: e.currentTarget.value })} placeholder={t('notePh')} />
          </div>
          <label className="dos-row" style={{ cursor: 'pointer', border: '1px solid var(--color-divider)' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_REBASE' }); }}>
            <span>
              <span style={{ fontSize: 14 }}>{t('rebasePlan')}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('rebaseDesc')}</span>
            </span>
            <span className={'tag ' + (m.mRebase ? 'tag-accent' : 'tag-neutral')}>{m.mRebase ? t('on') : t('off')}</span>
          </label>
          <div style={{ borderTop: '2px solid var(--color-divider)', paddingTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span className="dos-k">{t('equityAfter')}</span>
            <span className="dos-num" style={{ fontSize: 20 }}>{after}</span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'SAVE_MONEY' })}>
            {t('recordMovementBtn')}
            <IconCheck style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      </SheetPanel>
    </SheetOverlay>
  );
}
