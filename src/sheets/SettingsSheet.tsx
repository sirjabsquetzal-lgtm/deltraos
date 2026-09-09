import { useState } from 'react';
import { useAppState, useDispatch, useNow } from '../store';
import { useTranslator, tZoneDetected, tRestoreSummary } from '../i18n';
import { SheetOverlay, SheetPanel, Seg } from '../ui';
import { getLocalClock, getLocalZone, INSTRUMENTS } from '../view';
import { useMediaTrack } from '../mediaContext';
import type { InstrumentCode } from '../types';
import { exportBackup, importBackup } from '../backup';

export default function SettingsSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const now = useNow();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const track = useMediaTrack();
  const [backupBusy, setBackupBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) track.setFile(file);
  };

  const onDownloadBackup = async () => {
    setBackupBusy(true);
    setBackupStatus(null);
    try {
      await exportBackup(state);
    } catch {
      setBackupStatus(t('restoreGenericError'));
    } finally {
      setBackupBusy(false);
    }
  };

  const onRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    if (!window.confirm(t('restoreConfirm'))) return;
    setRestoreBusy(true);
    setBackupStatus(null);
    try {
      const { state: restored, imageCount, hasAudio } = await importBackup(file);
      dispatch({ type: 'RESTORE_STATE', state: restored });
      setBackupStatus(tRestoreSummary(lang, imageCount, hasAudio));
      // Sueños images and the meditation track only load from IndexedDB
      // once, on mount — a full reload is the simplest reliable way to get
      // every screen to pick up what restore just wrote, exactly like a
      // normal app start.
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setBackupStatus((err as Error)?.message === 'not-a-backup' ? t('restoreInvalidFile') : t('restoreGenericError'));
      setRestoreBusy(false);
    }
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

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('sessionState')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span className={'tag ' + (state.locked ? 'tag-accent' : 'tag-neutral')}>{state.locked ? t('sessionLocked') : t('sessionOpen')}</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{t('day')} {state.day}</span>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('backupRestore')}</div>
          <p style={{ fontSize: 12, margin: '0 0 10px', color: 'var(--color-neutral-700)' }}>{t('backupBody')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onDownloadBackup} disabled={backupBusy || restoreBusy}>
              {backupBusy ? t('downloadingBackup') : t('downloadBackup')}
            </button>
            <label className="btn btn-ghost" style={{ cursor: restoreBusy ? 'default' : 'pointer', margin: 0, opacity: restoreBusy ? 0.6 : 1 }}>
              {restoreBusy ? t('restoringBackup') : t('restoreBackup')}
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={onRestoreFile}
                disabled={backupBusy || restoreBusy}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
            </label>
          </div>
          {backupStatus && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-accent)' }}>{backupStatus}</div>
          )}
        </div>
      </SheetPanel>
    </SheetOverlay>
  );
}
