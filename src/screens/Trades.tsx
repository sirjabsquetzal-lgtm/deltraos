import type { Account } from '../types';
import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel } from '../i18n';
import { Seg } from '../ui';
import { getAccountPlans, getAccountTrades, getSelectedTradePlan, money, tradeRow } from '../view';

const ACCOUNTS: Account[] = ['Funded', 'Evaluation', 'Live', 'Demo'];

export default function Trades() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const acct = state.s.acct;

  const acctPlans = getAccountPlans(state, acct);
  const selectedPlan = getSelectedTradePlan(state, acct);
  const trades = getAccountTrades(state, acct).map(tradeRow);

  return (
    <div>
      <div style={{ padding: '16px 16px 12px', borderBottom: '2px solid var(--color-divider)' }}>
        <h3 style={{ margin: '0 0 10px' }}>{t('tradesTitle')}</h3>
        <div className="dos-k" style={{ marginBottom: 6 }}>{t('account')}</div>
        <Seg
          name="acct"
          value={acct}
          onChange={(v) => dispatch({ type: 'SET_SNAP', k: 'acct', v })}
          options={ACCOUNTS.map((a) => ({ value: a, label: enumLabel(lang, a) }))}
        />
        <div className="dos-k" style={{ margin: '12px 0 6px' }}>{t('planLabel')}</div>
        {acctPlans.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{t('noPlansForAccount')}</div>
        ) : (
          <select
            className="input"
            value={selectedPlan?.id ?? ''}
            onChange={(e) => dispatch({ type: 'SELECT_TRADE_PLAN', planId: e.currentTarget.value })}
          >
            {acctPlans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedPlan && trades.length === 0 && (
        <div style={{ padding: '28px 16px' }}>
          <h4 style={{ margin: 0 }}>{t('noTradesOnPlanTitle')}</h4>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 6 }}>{t('noTradesOnPlanBody')}</p>
        </div>
      )}

      {trades.map((r) => (
        <button key={r.id} className="dos-row" onClick={() => dispatch({ type: 'GO', screen: 'detail', v: r.id })}>
          <span>
            <span className="dos-num" style={{ fontSize: 14 }}>{r.instrument} {enumLabel(lang, r.side)}</span>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
              {t('day')} {r.meta.day} · {r.meta.zone} · {enumLabel(lang, r.meta.result)}
            </span>
          </span>
          <span style={{ textAlign: 'right' }}>
            <span className="dos-num" style={{ fontSize: 15, color: r.pnl > 0 ? 'var(--color-text)' : r.pnl < 0 ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}>
              {(r.pnl > 0 ? '+' : '') + money(r.pnl)}
            </span>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>{r.meta.zone}</span>
          </span>
        </button>
      ))}
      <div style={{ padding: '24px 16px' }} />
    </div>
  );
}
