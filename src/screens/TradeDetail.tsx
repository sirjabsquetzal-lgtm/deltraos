import { useAppState, useDispatch } from '../store';
import { useTranslator, enumLabel } from '../i18n';
import { BackLink } from '../ui';
import { money } from '../view';

export default function TradeDetail() {
  const state = useAppState();
  const dispatch = useDispatch();
  const lang = state.settings.lang;
  const t = useTranslator(lang);
  const trade = state.trades.find((x) => x.id === state.detailId);

  if (!trade) {
    return (
      <div style={{ padding: '14px 16px' }}>
        <BackLink label={t('back')} onClick={() => dispatch({ type: 'GO', screen: 'dash' })} />
      </div>
    );
  }

  const g = trade.snap;
  const title = `${trade.instrument} ${enumLabel(lang, trade.side)} · ${enumLabel(lang, trade.result)}`;
  const meta = `${t('day')} ${trade.day} · ${new Date(trade.time).toLocaleString()}`;

  const rows: { k: string; v: string }[] = [
    { k: t('entry'), v: trade.reg.entry },
    { k: t('stopLossField'), v: trade.reg.sl },
    { k: t('takeProfitField'), v: trade.reg.tp },
    { k: t('closePrice'), v: trade.reg.closePx },
    { k: t('result'), v: enumLabel(lang, trade.result) },
    { k: t('closeReason'), v: enumLabel(lang, g.reason) },
    { k: t('pnlLabel'), v: (trade.pnl > 0 ? '+' : '') + money(trade.pnl) },
    { k: t('duration'), v: '18 min' },
    { k: t('mentalState'), v: t('mentalStateDone') },
    { k: t('highImpactNews'), v: enumLabel(lang, g.eco) },
    { k: t('aiBias'), v: enumLabel(lang, g.bias) },
    { k: t('trendStructure1d'), v: `${enumLabel(lang, g.t1d)} · ${enumLabel(lang, g.s1d)}` },
    { k: t('trendStructure1h'), v: `${enumLabel(lang, g.t1h)} · ${enumLabel(lang, g.s1h)}` },
    { k: t('trendStructure15m'), v: `${enumLabel(lang, g.t15)} · ${enumLabel(lang, g.s15)}` },
    { k: t('structureCvd5m'), v: `${enumLabel(lang, g.s5m)} · ${enumLabel(lang, g.cvd5m)}` },
    { k: t('structureCvd3m'), v: `${enumLabel(lang, g.s3m)} · ${enumLabel(lang, g.cvd3m)}` },
    { k: t('divergenceStrength'), v: enumLabel(lang, g.strength) },
    { k: t('operatingZone'), v: trade.zone },
    { k: t('insaneScalpConfirmation'), v: `${enumLabel(lang, g.insaneLines)} · ${enumLabel(lang, g.insaneSide)}` },
    { k: t('candlePattern'), v: enumLabel(lang, g.pattern) },
  ];

  return (
    <div>
      <div style={{ padding: '14px 16px', borderBottom: '2px solid var(--color-divider)' }}>
        <BackLink label={t('back')} onClick={() => dispatch({ type: 'GO', screen: 'dash' })} />
        <h3 style={{ margin: '6px 0 0' }}>{title}</h3>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>{meta}</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '9px 16px', borderBottom: '1px solid var(--color-divider)' }}>
          <span className="dos-k">{r.k}</span>
          <span className="dos-num" style={{ fontSize: 14, textAlign: 'right' }}>{r.v}</span>
        </div>
      ))}
      <div style={{ padding: '14px 16px' }}>
        <div className="dos-k" style={{ marginBottom: 6 }}>{t('capture')}</div>
        <div style={{ border: '1px dashed var(--color-neutral-500)', background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 6px, var(--color-neutral-100) 6px 12px)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--color-neutral-700)' }}>{t('uploadChartCapture')}</span>
        </div>
        <div className="dos-k" style={{ margin: '14px 0 4px' }}>{t('notes')}</div>
        <p style={{ fontSize: 14, margin: 0 }}>{trade.notes || t('noNotes')}</p>
      </div>
      <div style={{ padding: '20px 16px' }} />
    </div>
  );
}
