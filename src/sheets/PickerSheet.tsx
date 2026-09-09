import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel } from '../i18n';
import { SheetOverlay } from '../ui';
import { GLYPHS, GlyphSvg } from '../glyphs';

const TITLE_KEY = {
  structure: 'pickerStructure',
  structureHtf: 'pickerStructure',
  cvd: 'pickerCvd',
  pattern: 'pickerPattern',
} as const;

export default function PickerSheet() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const picker = state.picker;
  if (!picker) return null;

  const options = GLYPHS[picker.kind];
  const current = state.s[picker.key];

  return (
    <SheetOverlay>
      <div className="dos-sheet-body">
        <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)' }}>
          <h3 style={{ margin: 0 }}>{t(TITLE_KEY[picker.kind])}</h3>
        </div>
        {options.map((o) => {
          const on = current === o.v;
          return (
            <button
              key={o.v}
              onClick={() => dispatch({ type: 'PICK_OPTION', v: o.v })}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', border: 0, borderBottom: '1px solid var(--color-divider)', background: on ? 'var(--color-accent-100)' : 'transparent', color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
            >
              <GlyphSvg glyph={o} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15 }}>{enumLabel(lang, o.v)}</span>
              <span className="dos-k" style={{ color: 'var(--color-accent-700)' }}>{on ? t('selected') : ''}</span>
            </button>
          );
        })}
        <div style={{ padding: 16 }}>
          <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'CLOSE_PICKER' })}>{t('cancel')}</button>
        </div>
      </div>
    </SheetOverlay>
  );
}
