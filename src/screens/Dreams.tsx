import type { DragEvent } from 'react';
import { useAppState, useDispatch } from '../store';
import { useTranslator, tImagesCount } from '../i18n';
import { IconX } from '../icons';

export default function Dreams() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    e.currentTarget.value = '';
    if (!files.length) return;
    const items = files.map((f, i) => ({ id: 'd' + Date.now() + '-' + i, src: URL.createObjectURL(f), ratio: 1 }));
    dispatch({ type: 'ADD_DREAMS', items });
    items.forEach((item) => {
      const probe = new Image();
      probe.onload = () => {
        dispatch({ type: 'UPDATE_DREAM_RATIO', id: item.id, ratio: probe.width / probe.height });
      };
      probe.src = item.src;
    });
  };

  return (
    <div>
      <div style={{ padding: 16, borderBottom: '2px solid var(--color-divider)' }}>
        <h3 style={{ margin: '0 0 6px' }}>{t('tabDreams')}</h3>
        <p style={{ fontSize: 15, margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: 1.2, borderLeft: '2px solid var(--color-accent)', paddingLeft: 10 }}>
          {t('suenosPhrase')}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 16px', borderBottom: '2px solid var(--color-divider)' }}>
        <span className="dos-k">{tImagesCount(lang, state.dreams.length)}</span>
        <span className="dos-k" style={{ color: 'var(--color-neutral-600)' }}>{t('dragToRearrange')}</span>
        <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
          {t('addImages')}
          <input type="file" accept="image/*" multiple onChange={onAddFiles} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        </label>
      </div>
      <div style={{ padding: 2 }}>
        <div style={{ columnCount: 2, columnGap: 2 }}>
          {state.dreams.map((d) => {
            const dragging = state.dragId === d.id;
            const over = state.overId === d.id && state.dragId !== d.id;
            const onDragStart = (e: DragEvent<HTMLDivElement>) => {
              if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', d.id); } catch { /* noop */ } }
              dispatch({ type: 'DREAM_DRAG_START', id: d.id });
            };
            const onDragOver = (e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
              dispatch({ type: 'DREAM_DRAG_OVER', id: d.id });
            };
            const onDrop = (e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              dispatch({ type: 'DREAM_DROP', toId: d.id });
            };
            return (
              <div
                key={d.id}
                className="dream-tile"
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onDragEnd={() => dispatch({ type: 'DREAM_DRAG_END' })}
                style={{ opacity: dragging ? 0.4 : 1, outline: over ? '2px solid var(--color-accent)' : 'none', outlineOffset: -2 }}
              >
                <div style={{ width: '100%', aspectRatio: String(d.ratio), backgroundColor: 'var(--color-neutral-200)', backgroundImage: `url(${d.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <button
                  onClick={() => dispatch({ type: 'REMOVE_DREAM', id: d.id })}
                  style={{ position: 'absolute', top: 0, right: 0, width: 26, height: 26, border: 0, background: 'var(--color-accent-700)', color: 'var(--color-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  aria-label={t('delete')}
                >
                  <IconX size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {state.dreams.length === 0 && (
        <div style={{ padding: '40px 16px', textAlign: 'left', borderTop: '1px solid var(--color-divider)' }}>
          <div className="dos-k" style={{ marginBottom: 6 }}>{t('emptyTitle')}</div>
          <p style={{ fontSize: 14, margin: 0 }}>{t('emptyBody')}</p>
        </div>
      )}
      <div style={{ padding: '24px 16px' }} />
    </div>
  );
}
