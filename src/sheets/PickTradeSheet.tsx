import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tPickPlanMeta } from '../i18n';
import { SheetOverlay, SheetPanel, Seg } from '../ui';
import { IconForward } from '../icons';
import { getPickAccount, getPickList, INSTRUMENTS, money } from '../view';
import { planRow } from '../logic';
import type { Account, InstrumentCode } from '../types';

const ACCOUNTS: Account[] = ['Funded', 'Evaluation', 'Live', 'Demo'];

export default function PickTradeSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const acct = getPickAccount(state);
  const list = getPickList(state);
  const selected = list.find((p) => p.id === state.pickPlan) || list[0] || null;
  const instrOptions = INSTRUMENTS.filter((i) => state.instruments.includes(i.code));

  return (
    <SheetOverlay>
      <SheetPanel title={t('newTradeTitle')} subtitle={t('newTradeDesc')} onClose={() => dispatch({ type: 'CLOSE_SHEET' })}>
        <div style={{ padding: 16 }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('chooseAccount')}</div>
          <Seg
            name="pickAcct"
            value={acct}
            onChange={(v) => dispatch({ type: 'SET_PICK_ACCOUNT', v })}
            options={ACCOUNTS.map((a) => ({ value: a, label: enumLabel(lang, a) }))}
          />

          <div className="dos-k" style={{ margin: '14px 0 6px' }}>{t('choosePlanLabel')}</div>
          {list.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginBottom: 8 }}>{t('noPlansForAccount')}</div>
          )}
          {list.map((p) => {
            const on = selected?.id === p.id;
            const row = planRow(p, state.day, state.day);
            return (
              <label
                key={p.id}
                className="dos-row"
                style={{ cursor: 'pointer', border: '1px solid var(--color-divider)', marginBottom: 8, background: on ? 'var(--color-accent-100)' : 'transparent' }}
                onClick={() => dispatch({ type: 'SET_PICK_PLAN', v: p.id })}
              >
                <span>
                  <span className="dos-num" style={{ fontSize: 14 }}>{p.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                    {tPickPlanMeta(lang, money(p.equity), state.day, money(row.risk))}
                  </span>
                </span>
              </label>
            );
          })}

          <div className="dos-k" style={{ margin: '14px 0 6px' }}>{t('instrumentLabel')}</div>
          <div className="seg" style={{ flexWrap: 'wrap' }}>
            {instrOptions.map((i) => (
              <button
                key={i.code}
                type="button"
                className="seg-opt"
                data-on={state.instrument === i.code ? '1' : '0'}
                onClick={() => dispatch({ type: 'SET_INSTRUMENT', v: i.code as InstrumentCode })}
              >
                {i.code} — {enumLabel(lang, i.code)}
              </button>
            ))}
          </div>

          {state.locked && (
            <div style={{ marginTop: 12, background: 'var(--color-accent-100)', borderLeft: '2px solid var(--color-accent)', padding: '8px 12px', fontSize: 12, color: 'var(--color-accent-800)' }}>
              {t('lockedWarnBody')}
            </div>
          )}

          <button className="btn btn-primary btn-block" disabled={list.length === 0} onClick={() => dispatch({ type: 'LETS_TRADE' })}>
            {t('letsTradeBtn')}
            <IconForward style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      </SheetPanel>
    </SheetOverlay>
  );
}
