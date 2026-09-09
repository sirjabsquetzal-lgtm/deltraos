import { useAppState, useDispatch } from '../store';
import { useTranslator } from '../i18n';
import { SheetOverlay, AlertPanel } from '../ui';
import { IconTrash } from '../icons';

export default function ConfirmDeleteSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const t = useTranslator(state.settings.lang);
  const plan = state.plans.find((p) => p.id === state.confirmId);

  return (
    <SheetOverlay>
      <AlertPanel kicker={t('deletePlanLabel')} title={plan ? plan.name : ''}>
        <p style={{ fontSize: 14, margin: '8px 0 0' }}>{t('deletePlanBody')}</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'CONFIRM_DELETE' })}>
          {t('deleteItBtn')}
          <IconTrash style={{ marginLeft: 'auto' }} />
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>{t('keepItBtn')}</button>
      </AlertPanel>
    </SheetOverlay>
  );
}
