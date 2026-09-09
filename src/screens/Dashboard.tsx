import { useAppState, useDispatch, useNow } from '../store';
import { useTranslator, enumLabel, tCmeNote, tOpensIn, tClosesIn, tYourTime } from '../i18n';
import { getCmeNoteParts, getEquityCurve, getLocalClock, getLocalZone, getPlan, getRowToday, getSessions, getWinRate, getAvgR, tradeRow, money } from '../view';
import { IconForward } from '../icons';

export default function Dashboard() {
  const state = useAppState();
  const dispatch = useDispatch();
  const now = useNow();
  const lang = state.settings.lang;
  const t = useTranslator(lang);

  const sessions = getSessions(now);
  const plan = getPlan(state);
  const row = getRowToday(state);
  const { projPath, realPath } = getEquityCurve(state, plan);
  const winRate = getWinRate(state);
  const avgR = getAvgR(state);
  const recent = state.trades.slice(0, 4).map(tradeRow);
  const { reset, nowStr } = getCmeNoteParts(now);

  return (
    <div>
      <div style={{ borderBottom: '2px solid var(--color-divider)' }}>
        <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <div className="dos-k">{t('marketSessions')}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>{getLocalZone()} · {getLocalClock(now)}</div>
        </div>
        {sessions.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid var(--color-divider)' }}>
            <span style={{ width: 9, height: 9, flex: 'none', background: s.open ? 'var(--color-accent)' : 'var(--color-neutral-500)' }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="dos-num" style={{ fontSize: 14 }}>{t(s.name)}</span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>{tYourTime(lang, s.window)}</span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--color-neutral-500)' }}>{s.src}</span>
            </span>
            <span style={{ textAlign: 'right', flex: 'none' }}>
              <span className="dos-num" style={{ fontSize: 12, color: s.open ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }}>
                {s.open ? t('sessOpen') : t('sessClosed')}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                {s.nextIsOpensClose === 'weekend' ? t('opensMonday') : s.nextIsOpensClose === 'closes' ? tClosesIn(lang, s.next) : tOpensIn(lang, s.next)}
              </span>
            </span>
          </div>
        ))}
        <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--color-divider)', fontSize: 11, color: 'var(--color-neutral-700)' }}>
          {tCmeNote(lang, reset, nowStr)}
        </div>
      </div>

      {!plan && (
        <div style={{ padding: '32px 16px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{t('setupRequired')}</div>
          <h2 style={{ margin: '8px 0 0', fontSize: 34, lineHeight: 1.05 }}>{t('noPlanLine1')}<br />{t('noPlanLine2')}</h2>
          <hr className="hr" />
          <p style={{ fontSize: 14, maxWidth: '30ch' }}>{t('noPlanBody')}</p>
          <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO', screen: 'newplan' })}>
            {t('newPlanBtn')}
            <IconForward style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      )}

      {plan && (
        <div>
          <div style={{ padding: 16, borderBottom: '2px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="dos-k">{plan.name} · {enumLabel(lang, plan.account)}</div>
              <span className={'tag ' + (state.locked ? 'tag-accent' : 'tag-neutral')}>{state.locked ? t('sessionLocked') : t('sessionOpen')}</span>
            </div>
            <div className="dos-dot-num" style={{ fontSize: 44, lineHeight: 1.05, marginTop: 8 }}>{money(plan.equity)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 14, borderTop: '1px solid var(--color-divider)' }}>
              <div style={{ padding: '10px 10px 0 0', borderRight: '1px solid var(--color-divider)' }}>
                <div className="dos-k">{t('day')}</div>
                <div className="dos-num" style={{ fontSize: 17 }}>{state.day}</div>
              </div>
              <div style={{ padding: '10px 10px 0', borderRight: '1px solid var(--color-divider)' }}>
                <div className="dos-k">{t('targetTp')}</div>
                <div className="dos-num" style={{ fontSize: 17 }}>{row ? money(row.tp) : '—'}</div>
              </div>
              <div style={{ padding: '10px 0 0 10px' }}>
                <div className="dos-k">{t('riskCap')}</div>
                <div className="dos-num" style={{ fontSize: 17, color: 'var(--color-accent-700)' }}>{row ? money(row.risk) : '—'}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 16, borderBottom: '2px solid var(--color-divider)' }}>
            <div className="dos-k">{t('equityVsProjection')}</div>
            <svg viewBox="0 0 340 120" style={{ width: '100%', height: 120, marginTop: 10, display: 'block' }}>
              <line x1="0" y1="119" x2="340" y2="119" stroke="var(--color-neutral-400)" strokeWidth={1} />
              <path d={projPath} fill="none" stroke="var(--color-neutral-500)" strokeWidth={2} strokeDasharray="4 4" />
              <path d={realPath} fill="none" stroke="var(--color-accent)" strokeWidth={3} />
            </svg>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-neutral-700)' }}>
              <span><span style={{ display: 'inline-block', width: 14, height: 3, background: 'var(--color-accent)', verticalAlign: 'middle', marginRight: 5 }} />{t('actual')}</span>
              <span><span style={{ display: 'inline-block', width: 14, height: 2, background: 'var(--color-neutral-500)', verticalAlign: 'middle', marginRight: 5 }} />{t('planLegend')}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '2px solid var(--color-divider)' }}>
            <div style={{ padding: '12px 16px', borderRight: '1px solid var(--color-divider)' }}>
              <div className="dos-k">{t('winRate')}</div>
              <div className="dos-num" style={{ fontSize: 20 }}>{winRate === null ? '—' : winRate + '%'}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRight: '1px solid var(--color-divider)' }}>
              <div className="dos-k">{t('avgR')}</div>
              <div className="dos-num" style={{ fontSize: 20 }}>{avgR === null ? '—' : avgR.toFixed(1) + 'R'}</div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div className="dos-k">{t('streak')}</div>
              <div className="dos-num" style={{ fontSize: 20 }}>{state.streak ? state.streak + 'W' : '0'}</div>
            </div>
          </div>

          <div style={{ padding: '14px 16px 6px' }}>
            <div className="dos-k">{t('recentTrades')}</div>
          </div>
          {recent.length === 0 && (
            <div style={{ padding: '0 16px 20px', fontSize: 13, color: 'var(--color-neutral-700)' }}>{t('noTradesDash')}</div>
          )}
          {recent.map((r) => (
            <button key={r.id} className="dos-row" onClick={() => dispatch({ type: 'GO', screen: 'detail', v: r.id })}>
              <span>
                <span className="dos-num" style={{ fontSize: 14 }}>{r.instrument} {enumLabel(lang, r.side)}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-700)' }}>
                  {t('day')} {r.meta.day} · {r.meta.zone} · {enumLabel(lang, r.meta.result)}
                </span>
              </span>
              <span className="dos-num" style={{ fontSize: 15, color: r.pnl > 0 ? 'var(--color-text)' : r.pnl < 0 ? 'var(--color-accent)' : 'var(--color-neutral-700)' }}>
                {(r.pnl > 0 ? '+' : '') + money(r.pnl)}
              </span>
            </button>
          ))}
          <div style={{ padding: '20px 16px 8px' }} />
        </div>
      )}
    </div>
  );
}
