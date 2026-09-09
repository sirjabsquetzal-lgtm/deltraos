import { useAppState, useDispatch } from '../store';
import { useTranslator } from '../i18n';
import { SheetOverlay, AlertPanel } from '../ui';
import { IconPlus } from '../icons';

export default function NoPlanSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const t = useTranslator(state.settings.lang);

  return (
    <SheetOverlay>
      <AlertPanel kicker={t('noPlanFoundLabel')} title={t('createAPlanFirstTitle')} onClose={() => dispatch({ type: 'CLOSE_SHEET' })}>
        <p style={{ fontSize: 14, margin: '8px 0 0' }}>{t('noPlanFoundBody')}</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO_NEW_PLAN' })}>
          {t('createPlanBtn')}
          <IconPlus style={{ marginLeft: 'auto' }} />
        </button>
      </AlertPanel>
    </SheetOverlay>
  );
}
