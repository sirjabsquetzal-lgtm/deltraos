import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel, tDays } from '../i18n';
import { SheetOverlay, SheetPanel, Seg } from '../ui';
import { IconCheck } from '../icons';
import { getNewPlanPreview, money } from '../view';
import type { Account } from '../types';

const ACCOUNTS: Account[] = ['Funded', 'Evaluation', 'Live', 'Demo'];

export default function NewPlanSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const f = state.f;
  const preview = getNewPlanPreview(f);

  const setF = (k: 'fName' | 'fCapital' | 'fGoal' | 'fWin' | 'fLoss') => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET_PLAN_FORM_FIELD', k, v: e.currentTarget.value });

  return (
    <SheetOverlay>
      <SheetPanel title={t('newPlanTitle')} subtitle={t('newPlanDesc')} onClose={() => dispatch({ type: 'CLOSE_SHEET' })}>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div className="field">
            <label>{t('planNameLabel')}</label>
            <input className="input" value={f.fName} onChange={setF('fName')} placeholder={t('planNamePh')} />
          </div>
          <div className="field">
            <label>{t('startingCapital')}</label>
            <input className="input dos-num" value={f.fCapital} onChange={setF('fCapital')} />
          </div>
          <div className="field">
            <label>{t('goalWhereEnds')}</label>
            <input className="input dos-num" value={f.fGoal} onChange={setF('fGoal')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>{t('profitPerDay')}</label>
              <input className="input dos-num" value={f.fWin} onChange={setF('fWin')} />
            </div>
            <div className="field">
              <label>{t('riskPerTrade')}</label>
              <input className="input dos-num" value={f.fLoss} onChange={setF('fLoss')} />
            </div>
          </div>
          <div>
            <div className="dos-k" style={{ marginBottom: 6 }}>{t('accountLabel')}</div>
            <Seg
              name="fAccount"
              value={f.fAccount}
              onChange={(v) => dispatch({ type: 'SET_PLAN_FORM_ACCOUNT', v })}
              options={ACCOUNTS.map((a) => ({ value: a, label: enumLabel(lang, a) }))}
            />
          </div>
          <div style={{ borderTop: '2px solid var(--color-divider)', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div className="dos-k">{t('day1Tp')}</div>
              <div className="dos-num" style={{ fontSize: 16 }}>{money(preview.tp)}</div>
            </div>
            <div>
              <div className="dos-k">{t('day1Risk')}</div>
              <div className="dos-num" style={{ fontSize: 16, color: 'var(--color-accent-700)' }}>{money(preview.risk)}</div>
            </div>
            <div>
              <div className="dos-k">{t('goalIn')}</div>
              <div className="dos-num" style={{ fontSize: 16 }}>{tDays(lang, preview.days)}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'CREATE_PLAN' })}>
            {t('createPlanBtn')}
            <IconCheck style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      </SheetPanel>
    </SheetOverlay>
  );
}
