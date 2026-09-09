// Line-art glyphs for the visual selector sheets (structure / CVD / candle pattern).
// Ported 1:1 from the DeltraOS.dc.html GLYPHS table.

const GI = 'var(--color-text)';
const GR = 'var(--color-accent-700)';
const GG = 'var(--color-neutral-500)';

interface GPath { d: string; s: string; w: number; dash: string }
interface GRect { x: number; y: number; w: number; h: number; fill: string }
export interface Glyph { v: string; paths: GPath[]; rects: GRect[] }

const PT = (d: string, s = GI, w = 2, dash = '0'): GPath => ({ d, s, w, dash });
const RC = (x: number, y: number, w: number, h: number, fill = GI): GRect => ({ x, y, w, h, fill });

const structure: Glyph[] = [
  { v: 'Uptrend', paths: [PT('M4 27 L15 19 L21 23 L32 13 L38 17 L56 5')], rects: [] },
  { v: 'Downtrend', paths: [PT('M4 5 L15 13 L21 9 L32 19 L38 15 L56 27')], rects: [] },
  { v: 'Consolidation', paths: [PT('M4 8 L56 8', GG, 1.5, '4 4'), PT('M4 24 L56 24', GG, 1.5, '4 4'), PT('M4 20 L13 11 L22 22 L31 11 L40 22 L49 11 L56 18')], rects: [] },
  { v: 'Bart', paths: [PT('M4 26 L14 8 L44 8 L54 26')], rects: [] },
  { v: 'Pennant', paths: [PT('M4 28 L20 8'), PT('M20 8 L52 16', GG, 1.5, '4 4'), PT('M20 26 L52 16', GG, 1.5, '4 4'), PT('M46 15 L56 5', GR)], rects: [] },
];

const structureHtf: Glyph[] = structure.concat([
  { v: 'Double top', paths: [PT('M4 26 L14 8 L24 20 L34 8 L44 20 L56 28'), PT('M18 20 L52 20', GG, 1.5, '4 4')], rects: [] },
  { v: 'Double bottom', paths: [PT('M4 6 L14 24 L24 12 L34 24 L44 12 L56 4'), PT('M18 12 L52 12', GG, 1.5, '4 4')], rects: [] },
  { v: 'Head & shoulders', paths: [PT('M4 24 L12 16 L18 22 L28 5 L38 22 L44 16 L56 26'), PT('M14 22 L50 22', GG, 1.5, '4 4')], rects: [] },
]);

const cvd: Glyph[] = [
  { v: 'None', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 13 L20 9 L36 6 L56 3'), PT('M4 29 L20 25 L36 22 L56 19', GR)], rects: [] },
  { v: 'Bullish', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 4 L20 8 L36 10 L56 13'), PT('M4 29 L20 26 L36 23 L56 20', GR)], rects: [] },
  { v: 'Bearish', paths: [PT('M0 16 L60 16', GG, 1, '3 3'), PT('M4 13 L20 10 L36 7 L56 4'), PT('M4 20 L20 23 L36 26 L56 29', GR)], rects: [] },
];

const pattern: Glyph[] = [
  { v: 'Doji', paths: [PT('M30 4 L30 28', GI, 1.5)], rects: [RC(24, 15, 13, 3)] },
  { v: 'Hammer', paths: [PT('M30 7 L30 29', GI, 1.5)], rects: [RC(24, 7, 13, 7)] },
  { v: 'Shooting star', paths: [PT('M30 3 L30 25', GI, 1.5)], rects: [RC(24, 18, 13, 7)] },
  { v: 'Engulfing', paths: [PT('M18 10 L18 24', GG, 1.5), PT('M38 4 L38 29', GI, 1.5)], rects: [RC(13, 13, 10, 8, GG), RC(31, 7, 14, 19)] },
  { v: 'None', paths: [PT('M6 16 L54 16', GG, 2, '5 4')], rects: [] },
];

export const GLYPHS = { structure, structureHtf, cvd, pattern } as const;
export type GlyphKind = keyof typeof GLYPHS;

export function GlyphSvg({ glyph }: { glyph: Glyph }) {
  return (
    <svg width="78" height="42" viewBox="0 0 60 32" fill="none" style={{ flex: 'none', background: 'var(--color-neutral-100)', border: '1px solid var(--color-divider)' }}>
      {glyph.rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
      {glyph.paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.s} strokeWidth={p.w} strokeDasharray={p.dash} />
      ))}
    </svg>
  );
}
