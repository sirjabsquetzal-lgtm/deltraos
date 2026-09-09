import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel } from '../i18n';
import { StepHeader } from '../ui';
import { IconCheck } from '../icons';
import { getPlan, getPnlPreview, getRowToday, getRR, money } from '../view';
import type { CloseReason } from '../types';

export default function RegisterTrade() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const s = state.s;
  const reg = state.reg;
  const plan = getPlan(state);
  const row = getRowToday(state);
  const rr = getRR(reg);
  const pnlPreview = getPnlPreview(s, reg, row);
  const closeLocked = s.reason !== 'Manual close';

  const setField = (k: keyof typeof reg) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: 'SET_REG_FIELD', k, v: e.currentTarget.value });

  const onReason = (v: CloseReason) => dispatch({ type: 'SET_REASON', v });

  const isProfit = s.result === 'Profit';
  const isLose = s.result === 'Lose';

  return (
    <div>
      <StepHeader kicker={`${state.instrument} · ${plan ? enumLabel(lang, plan.account) : ''}`} title={t('registerTradeTitle')} onBack={() => dispatch({ type: 'BACK' })} />

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div className="field">
          <label>{t('entry')}</label>
          <input className="input dos-num" value={reg.entry} onChange={setField('entry')} />
        </div>
        <div className="field">
          <label>{t('stopLossField')}</label>
          <input className="input dos-num" value={reg.sl} onChange={setField('sl')} />
        </div>
        <div className="field">
          <label>{t('takeProfitField')}</label>
          <input className="input dos-num" value={reg.tp} onChange={setField('tp')} />
        </div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="dos-k">{t('riskReward')}</div>
        <div className="dos-num" style={{ fontSize: 24 }}>{rr}</div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="dos-k" style={{ marginBottom: 6 }}>{t('result')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'stretch' }}>
          <button
            style={{ cursor: 'pointer', border: '2px solid var(--color-text)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, background: isProfit ? 'var(--color-text)' : 'transparent', color: isProfit ? 'var(--color-bg)' : 'var(--color-text)', textAlign: 'left' }}
            onClick={() => dispatch({ type: 'SET_SNAP', k: 'result', v: 'Profit' })}
          >
            <span className="dos-k" style={{ color: isProfit ? 'var(--color-bg)' : 'var(--color-neutral-700)' }}>{isProfit ? t('selected') : t('takeProfitState')}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>{t('profit')}</span>
            <span className="dos-num" style={{ fontSize: 12 }}>+{row ? money(row.tp) : '—'}</span>
          </button>
          <button
            style={{ cursor: 'pointer', border: '2px solid var(--color-text)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, background: isLose ? 'var(--color-accent-700)' : 'transparent', color: isLose ? 'var(--color-bg)' : 'var(--color-text)', textAlign: 'left' }}
            onClick={() => dispatch({ type: 'SET_SNAP', k: 'result', v: 'Lose' })}
          >
            <span className="dos-k" style={{ color: isLose ? 'var(--color-bg)' : 'var(--color-neutral-700)' }}>{isLose ? t('selected') : t('stopLossState')}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>{t('lose')}</span>
            <span className="dos-num" style={{ fontSize: 12 }}>−{row ? money(row.risk) : '—'}</span>
          </button>
          <button
            style={{ border: '2px solid var(--color-neutral-500)', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: '0 14px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15 }}
            onClick={() => dispatch({ type: 'ASK_BE' })}
          >
            {t('beQuestion')}
          </button>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <label>{t('actualAmountClosed')}</label>
          <input className="input dos-num" value={reg.manualPnl} onChange={setField('manualPnl')} placeholder={t('leaveEmptyHint')} />
        </div>

        <div className="dos-k" style={{ margin: '14px 0 4px' }}>{t('closeReason')}</div>
        <select className="input" value={s.reason} onChange={(e) => onReason(e.currentTarget.value as CloseReason)}>
          <option value="Take Profit">{t('takeProfitOpt')}</option>
          <option value="Stop Loss">{t('stopLossOpt')}</option>
          <option value="Manual close">{t('manualCloseOpt')}</option>
          <option value="Break even">{t('breakEvenOpt')}</option>
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div className="field">
            <label>{t('closePriceLabel')}</label>
            <input className="input dos-num" value={reg.closePx} onChange={setField('closePx')} disabled={closeLocked} />
          </div>
          <div>
            <div className="dos-k" style={{ marginBottom: 4 }}>{t('pnlLabel')}</div>
            <div className="dos-num" style={{ fontSize: 20, color: pnlPreview > 0 ? 'var(--color-text)' : pnlPreview < 0 ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}>
              {(pnlPreview > 0 ? '+' : '') + money(pnlPreview)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="field">
          <label>{t('notes')}</label>
          <textarea className="input" style={{ minHeight: 70 }} value={reg.notes} onChange={setField('notes')} />
        </div>
        <div className="dos-k" style={{ margin: '12px 0 6px' }}>{t('screenshot')}</div>
        <div style={{ border: '1px dashed var(--color-neutral-500)', background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 6px, var(--color-neutral-100) 6px 12px)', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('uploadChartCapture')}</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'FINALIZE' })}>
          {t('finalizeBtn')}
          <IconCheck style={{ marginLeft: 'auto' }} />
        </button>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-neutral-700)' }}>{t('finalizeHint')}</div>
      </div>
    </div>
  );
}
