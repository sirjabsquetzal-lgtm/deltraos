// Small shared UI primitives built directly on the Modernist CSS classes.
import type { ReactNode } from 'react';
import { IconBack, IconX } from './icons';

export function Seg<T extends string>({ options, value, onChange, name }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; name: string;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg-opt"
          data-on={o.value === value ? '1' : '0'}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SheetOverlay({ children }: { children: ReactNode }) {
  return <div className="dos-sheet">{children}</div>;
}

export function SheetPanel({ title, subtitle, onClose, children, scroll = true }: {
  title: string; subtitle?: ReactNode; onClose?: () => void; children: ReactNode; scroll?: boolean;
}) {
  return (
    <div className="dos-sheet-body" style={scroll ? undefined : { maxHeight: 'none' }}>
      <div className="dos-sheet-head">
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 13, margin: '4px 0 0', color: 'var(--color-neutral-700)' }}>{subtitle}</p>}
        </div>
        {onClose && (
          <button aria-label="Close" className="dos-sheet-x" onClick={onClose}><IconX /></button>
        )}
      </div>
      {children}
    </div>
  );
}

export function AlertPanel({ kicker, title, onClose, children }: {
  kicker: string; title: string; onClose?: () => void; children: ReactNode;
}) {
  return (
    <div style={{ background: 'var(--color-bg)', borderTop: '2px solid var(--color-accent)', padding: '20px 16px' }}>
      <div className="dos-k" style={{ color: 'var(--color-accent-700)' }}>{kicker}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ margin: '6px 0 0' }}>{title}</h3>
        {onClose && (
          <button aria-label="Close" className="dos-sheet-x" onClick={onClose}><IconX /></button>
        )}
      </div>
      {children}
    </div>
  );
}

export function StepHeader({ kicker, title, onBack }: { kicker: string; title: string; onBack: () => void }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)' }}>
      <BackLink onClick={onBack} />
      <div className="dos-k" style={{ color: 'var(--color-accent-700)' }}>{kicker}</div>
      <h3 style={{ margin: '4px 0 0' }}>{title}</h3>
    </div>
  );
}

export function BackLink({ onClick, label = 'Atrás' }: { onClick: () => void; label?: string }) {
  return (
    <button className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 2 }} onClick={onClick}>
      <IconBack />{label}
    </button>
  );
}
