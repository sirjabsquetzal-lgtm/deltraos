import { useAppState, useDispatch, useNow } from '../store';
import { useTranslator, tZoneDetected } from '../i18n';
import { SheetOverlay, SheetPanel, Seg } from '../ui';
import { getLocalClock, getLocalZone, INSTRUMENTS } from '../view';
import { useMediaTrack } from '../mediaContext';
import type { InstrumentCode } from '../types';

export default function SettingsSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const now = useNow();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const track = useMediaTrack();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) track.setFile(file);
  };

  return (
    <SheetOverlay>
      <SheetPanel title={t('settingsTitle')} subtitle={tZoneDetected(lang, getLocalZone(), getLocalClock(now))} onClose={() => dispatch({ type: 'CLOSE_SHEET' })}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('language')}</div>
          <div style={{ marginBottom: 16 }}>
            <Seg
              name="lang"
              value={lang}
              onChange={(v) => dispatch({ type: 'SET_LANG', v })}
              options={[{ value: 'ES', label: t('spanish') }, { value: 'EN', label: t('english') }]}
            />
          </div>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('appearance')}</div>
          <Seg
            name="theme"
            value={state.settings.theme}
            onChange={(v) => dispatch({ type: 'SET_THEME', v })}
            options={[{ value: 'Paper', label: t('paper') }, { value: 'Black', label: t('black') }]}
          />
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('meditationTrack')}</div>
          <input className="dos-file" type="file" accept="audio/*" onChange={onFile} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
            <span className="dos-num" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {track.fileName || t('noTrackSelected')}
            </span>
            {track.hasTrack && (
              <button className="btn btn-ghost" onClick={track.clear}>{t('removeBtn')}</button>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('tracksWhilePlays')}</div>
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 4 }}>{t('aLossLocks')}</div>
          <div style={{ fontSize: 14 }}>{t('lossLocksBody')}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('notConfigurable')}</div>
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('instrumentsYouTrade')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {INSTRUMENTS.map((i) => {
              const on = state.instruments.includes(i.code);
              return (
                <label key={i.code} style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); dispatch({ type: 'TOGGLE_INSTRUMENT_ENABLED', code: i.code as InstrumentCode }); }}>
                  <span className={'tag ' + (on ? 'tag-accent' : 'tag-neutral')} style={{ padding: '6px 12px', fontSize: 12 }}>{i.code}</span>
                </label>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('onlySelectedAppear')}</div>
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('meditationLength')}</div>
          <select className="input" value={state.settings.medMin} onChange={(e) => dispatch({ type: 'SET_MED_MIN', v: Number(e.currentTarget.value) as 5 | 10 | 15 })}>
            <option value={10}>{t('min10')}</option>
            <option value={5}>{t('min5')}</option>
            <option value={15}>{t('min15')}</option>
          </select>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('stepOneNotSkippable')}</div>
        </div>

        <div style={{ padding: 16 }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('sessionState')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span className={'tag ' + (state.locked ? 'tag-accent' : 'tag-neutral')}>{state.locked ? t('sessionLocked') : t('sessionOpen')}</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{t('day')} {state.day}</span>
          </div>
        </div>
      </SheetPanel>
    </SheetOverlay>
  );
}
