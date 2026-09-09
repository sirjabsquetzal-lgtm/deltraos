import { useAppState, useDispatch } from '../store';
import { useTranslator } from '../i18n';
import { SheetOverlay, AlertPanel } from '../ui';
import { IconForward } from '../icons';

export default function BEAskSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const t = useTranslator(state.settings.lang);

  return (
    <SheetOverlay>
      <AlertPanel kicker={t('breakEvenLabel')} title={t('registerBeTitle')} onClose={() => dispatch({ type: 'CLOSE_SHEET' })}>
        <p style={{ fontSize: 14, margin: '8px 0 0' }}>{t('registerBeBody')}</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'CONFIRM_BE' })}>
          {t('continueBtn')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
      </AlertPanel>
    </SheetOverlay>
  );
}
