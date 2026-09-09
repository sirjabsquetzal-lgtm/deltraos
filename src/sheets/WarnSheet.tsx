import { useAppState, useDispatch } from '../store';
import { useTranslator } from '../i18n';
import { SheetOverlay, AlertPanel } from '../ui';
import { IconForward } from '../icons';

export default function WarnSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const t = useTranslator(state.settings.lang);

  return (
    <SheetOverlay>
      <AlertPanel kicker={t('warningLabel')} title={t('nextTradeTitle')}>
        <p style={{ fontSize: 14, margin: '8px 0 0' }}>{t('nextTradeBody')}</p>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'step4' })}>
          {t('understoodBtn')}
          <IconForward style={{ marginLeft: 'auto' }} />
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>{t('notNowBtn')}</button>
      </AlertPanel>
    </SheetOverlay>
  );
}
