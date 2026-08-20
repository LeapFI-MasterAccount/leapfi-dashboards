/**
 * DomainsAccordion — view composed into `screens/OnSideOverview.tsx`
 * (parity_ia_addendum.md §Batch 1 "OnSide · Overview & Domains"). Ports
 * `osDomainsMaster`/`domBody`/`osToggleDom` (leapfi-platform.html
 * 3664-3709) as an in-page accordion: one card per domain (`DOMAINS`,
 * data/onside.ts), expand/collapse on the header press, and — on a
 * `dom-KEY` deep-link entry (the owning screen's `deepLinkDomainKey`
 * prop, or its own posture-grid row action) — the matching row force-
 * expands and scrolls into view, exactly matching `onsideShow`'s router
 * (source 3021-3054: `expandedDoms[domKey]=true` + `acc.scrollIntoView(...)`
 * on a ~80ms delay) rather than a plain toggle.
 *
 * Expanded-row body content branches exactly as source's `domBody()`
 * does: `d.deep && OBL[key]` (mrm, tprm only) renders the obligation
 * register FILTERED to open items — base 3684 `OBL[key].filter(o=>
 * o.st!=='met')`, headed 'Gaps &amp; partials · N of M shown obligations'
 * with the met set summarized in a separate soft pill ('{met} met
 * obligations and the full register with provenance: all {appl}
 * enumerated', base 3687) — the ONSIDE-06 fix wave restored this curated
 * gaps-first presentation (the shipped full-table + '{rows} of {appl}
 * shown' heading mixed units and matched neither the base nor the screen).
 * Every other domain renders its `DOM_OPEN` top-open-items list in a
 * second, simpler DataTable (`row kind: generic`) instead of a full
 * register — the same branch, not a new one. `aigov`'s extra CRI-function coverage table
 * (source 3119-3123, `[['GOVERN',68,81],...]`) is NOT ported: those
 * numbers are a local literal inside `domBody()`, never exported from
 * `data/onside.ts`, and this dispatch's Data modules line names only
 * `DOMAINS, OBL` (+ `DOM_OPEN`, read from the same file) — flagged here
 * as a STOP-item rather than silently fabricated, matching this file's
 * companion evidence return.
 *
 * AMBIGUITY RESOLVED — target lever (Slider, P7): parity_ia_addendum.md's
 * own component list for this row gates the Slider on "roles permitted to
 * move a domain's target" but no role/permission system exists anywhere
 * in this worktree yet (no auth, no persona-to-permission map). Rendering
 * an unconditional, always-enabled Slider would let every viewer silently
 * mutate `DOMAINS` — a shared module-level array — from a screen with no
 * authorization model behind it, which this persona's Core Principle 1
 * ("the screen is a claim about the server; make it a true one") rules
 * out for a change with no real commit path. The target is rendered as
 * read-only text (current score vs. target band) instead. STOP-item for
 * whoever lands the permission system: wire the lever in once a real
 * gate and a real commit path exist.
 *
 * FIX WAVE (B-dead-interactions-02) — the "Gaps & partials" obligation
 * register's rows were inert (no `rowAction`, matching base's oblRow
 * `onclick="openObl(domKey,id)"`, source 3106, with nothing on the twin
 * side): this file now accepts an optional `onOpenObligation` seam, fired
 * per pressed row, plus an exported `findRedlineDocForObligation` helper
 * the owning screen uses to offer a real "Approve & adopt" action when a
 * redline draft actually closes the obligation. `OnSideOverview.tsx`
 * (this dispatch's sibling file) wires both and hosts the obligation-
 * detail Drawer; `OnSideDocuments.tsx`'s own obligation-register tables
 * wire the same pattern independently (that screen already owns a Drawer
 * and the live doc-adopt mutation it reuses).
 *
 * A11y: each domain's obligation/open-items table is a real DataTable
 * (C6) with its own caption; the accordion header is a real `<button>`
 * with `aria-expanded`; PosturePillBar (C12) is reused verbatim from
 * `components/PosturePillBar.tsx` (not re-implemented) — its own a11y
 * baseline ("segment meaning is labelled in text, never color alone")
 * carries over unmodified. Row-updating live-region announcements do not
 * apply here (no cascade originates in this view — Adopt/cascade writes
 * live in `state/demoStore.ts`'s `applyGapClosure`, driven from
 * `OnSideDocuments.tsx`; this view reads the live `OBL`/`DOMAINS`
 * singletons those writes mutate, and re-renders through its owning
 * screen's `useDemoStore()` subscription).
 */
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { PosturePillBar } from '../components/PosturePillBar';
import { Icon } from '../components/primitives/Icon';
import { Label } from '../components/primitives/Label';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import { BANDS } from '../data/studio';
import { DOM_OPEN, GAPS, OBL } from '../data/onside';
import type { DomOpenItem, ObligationRow, OnsideDomain } from '../data/onside';
import type { PostureSegment } from '../engine/plan';

/* ============ shared status/posture derivations — source lines 1881-1885 ============
 * Exported so the owning screen (OnSideOverview.tsx) can reuse the exact
 * same numbers for its KPI strip and posture-grid cards — one source of
 * truth for `curOf`/`oblToClose`/`statusOf`, not two copies that can
 * drift apart (data/onside.ts's own file header: these are render/derive
 * functions, deliberately not ported into the data module itself). */

/** Source line 1881: `function curOf(d){return d.met/d.appl*5;}` */
export function curOf(domain: OnsideDomain): number {
  return (domain.met / domain.appl) * 5;
}

/** Source line 1882: `Math.max(0,Math.round(d.target/5*d.appl - d.met))` */
export function oblToClose(domain: OnsideDomain): number {
  return Math.max(0, Math.round((domain.target / 5) * domain.appl - domain.met));
}

export type DomainStatus = 'below' | 'at' | 'above';

/** Source line 1883: below if any obligations remain to close; else above
 * when current score clears target+0.5, otherwise at. */
export function statusOf(domain: OnsideDomain): DomainStatus {
  if (oblToClose(domain) > 0) return 'below';
  return curOf(domain) >= domain.target + 0.5 ? 'above' : 'at';
}

export const DOMAIN_STATUS_LABEL: Record<DomainStatus, string> = {
  below: 'Below target',
  at: 'At target',
  above: 'Above target',
};

/** Tag's closed variant vocabulary has no third "neutral-good" color
 * distinct from `status-positive` (source's CSS gives `below`/`at`/`above`
 * three different colors — amber/teal/cyan — that don't map 1:1 onto
 * Tag's positive/caution/alert set). `at` and `above` both collapse to
 * `status-positive` here (both are "meeting or exceeding the target you
 * set"); the visible text ("At target" vs. "Above target") is what
 * actually carries the distinction, per Tag's own a11y baseline ("never
 * the sole carrier of meaning"). */
export const DOMAIN_STATUS_VARIANT: Record<DomainStatus, NonRaciTagVariant> = {
  below: 'status-caution',
  at: 'status-positive',
  above: 'status-positive',
};

/**
 * Builds PosturePillBar's (C12) `segments` prop for one domain — the same
 * shape `engine/plan.ts`'s `deriveRecomputeView` builds for Studio's
 * slider-driven posture bar (source line 1278 suffix convention:
 * `' • now'` / `' • goal'`), applied here to a domain's continuous
 * `curOf(d)` (rounded to the nearest of the 5 bands) and its `target`
 * instead of Studio's `CUR`/`L.amb`. `engine/plan.ts` itself is read-only
 * here (only its exported `PostureSegment` type is used) — no change to
 * that file.
 */
/** B-dead-interactions-02 — the reverse lookup of `OnSideDocuments.tsx`'s
 * own `cascadeTargetsForDoc`: given a domain + obligation id, find the
 * GAPS entry that closes it and the redline doc id whose Adopt actually
 * closes it (base openObl's "Approve & adopt" affordance, ~source
 * 2988-2991), matching the exact `(g.rl||g.doc)` doc-closes-obligation
 * semantics `applyGapClosure`/`cascadeTargetsForDoc` already use for the
 * doc-driven path — one real closing mechanism, read in both directions.
 * Returns null when no redline draft closes this obligation yet (most
 * `gap`/`partial` rows: their `fx` remediation plan is a real-world task,
 * not a redline waiting on Approve & adopt). */
export function findRedlineDocForObligation(domainKey: string, oblId: string): string | null {
  const gap = GAPS.find((g) => g.obl !== null && g.obl[0] === domainKey && g.obl[1] === oblId);
  return gap ? (gap.rl ?? gap.doc ?? null) : null;
}

export function domainPostureSegments(current: number, target: number): PostureSegment[] {
  const currentIndex = Math.max(0, Math.min(BANDS.length - 1, Math.round(current) - 1));
  const targetIndex = Math.max(0, Math.min(BANDS.length - 1, target - 1));
  return BANDS.map((band, i) => {
    const isCurrent = i === currentIndex;
    const isTarget = i === targetIndex;
    const isBetween = !isTarget && i > currentIndex && i < targetIndex;
    const suffix = isCurrent ? ' • now' : isTarget && !isCurrent ? ' • goal' : '';
    return { index: i, band, isCurrent, isTarget, isBetween, label: `${i + 1} · ${band}${suffix}` };
  });
}

const OBL_STATUS_LABEL: Record<ObligationRow['st'], string> = { met: 'Met', partial: 'Partial', gap: 'Gap' };
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], NonRaciTagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};
const REVIEW_LABEL: Record<ObligationRow['rev'], string> = { ok: 'Approved', q: 'HITL queue' };
const REVIEW_VARIANT: Record<ObligationRow['rev'], NonRaciTagVariant> = { ok: 'status-positive', q: 'hitl' };

function obligationColumns(): DataTableColumn<ObligationRow>[] {
  return [
    { id: 'id', header: 'Obligation', render: (row) => <strong>{row.id}</strong> },
    {
      id: 'requirement',
      header: 'Requirement',
      render: (row) => (
        <span>
          {row.s}
          <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--ink2)' }}>{row.cite}</span>
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Tag text={OBL_STATUS_LABEL[row.st]} variant={OBL_STATUS_VARIANT[row.st]} />,
    },
    {
      id: 'evidence',
      header: 'Evidence',
      render: (row) => (row.docs.length > 0 ? <span>{row.docs.join(' · ')}</span> : <span style={{ color: 'var(--ink3)' }}>None on file</span>),
    },
    {
      id: 'review',
      header: 'Review',
      render: (row) => <Tag text={REVIEW_LABEL[row.rev]} variant={REVIEW_VARIANT[row.rev]} />,
    },
  ];
}

function openItemColumns(): DataTableColumn<DomOpenItem & { id: string }>[] {
  return [
    { id: 'item', header: 'Open item', render: (row) => <span>{row.t}</span> },
    {
      id: 'citation',
      header: 'Citation',
      render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.cite ?? '—'}</span>,
    },
  ];
}

const cardStyle = (open: boolean): CSSProperties => ({
  border: '1px solid var(--border)',
  borderColor: open ? 'var(--accent)' : 'var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  background: 'var(--panel)',
  boxSizing: 'border-box',
  outline: 'none',
});

const headerButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  width: '100%',
  boxSizing: 'border-box',
  padding: '1rem 1.25rem',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
  color: 'inherit',
  outline: 'none',
};

const nameStyle: CSSProperties = { fontSize: '0.9375rem', fontWeight: 700, color: 'var(--ink)' };
const scopeStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };
/** Title + meta wrapper — matches the sibling composite convention
 * (SetupCard.tsx's `BODY_STYLE`: flex column + gap) so the domain name
 * and its "bodies · N obligations in scope" meta line always render on
 * distinct lines, gapped, never concatenated onto one run of text. Both
 * children are plain inline `<span>`s (nameStyle/scopeStyle carry no
 * `display`), so the stacking here — not their own display value — is
 * what keeps them apart. */
const titleMetaWrapStyle: CSSProperties = { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' };
const bodyWrapStyle: CSSProperties = {
  borderTop: '1px solid var(--border)',
  padding: '1rem 1.25rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
};
const scoreLineStyle: CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' };
const scoreSubStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)', marginTop: '0.15rem' };
const targetLineStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };
const sectionHeadingStyle: CSSProperties = { margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink)' };
const footStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink2)' };
const scrollWrapStyle: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
/** Base `.pill-soft` (met-obligations summary, source 3687). */
const pillSoftStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--ink2)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-pill, 999px)',
  padding: '0.2rem 0.65rem',
};

export interface DomainsAccordionProps {
  domains: OnsideDomain[];
  /** Manually-toggled + deep-link-forced expand state, owned by the parent screen (osToggleDom / dom- deep link are the same underlying state in source). */
  expandedKeys: ReadonlySet<string>;
  /** Header press — pure toggle, matching `osToggleDom`. */
  onToggle: (key: string) => void;
  /** Set by the owning screen when a domain must force-expand and scroll into view (posture-grid row action, or a `dom-KEY` deep link) — matching `onsideShow`'s `domKey` branch (source 3031, 3052). Cleared via `onScrollHandled` once applied so it does not re-fire on unrelated re-renders. */
  pendingScrollKey: string | null;
  onScrollHandled: () => void;
  /** B-dead-interactions-02 — fired when a "Gaps & partials" obligation row
   * is pressed (base every oblRow: `onclick="openObl(domKey,id)"`, source
   * 3106). The owning screen opens the obligation-detail drawer. Optional
   * so a caller with no drawer of its own (none exist yet) still renders
   * the table as a plain register rather than a broken prop-required
   * contract. */
  onOpenObligation?: (domainKey: string, row: ObligationRow) => void;
}

export function DomainsAccordion({ domains, expandedKeys, onToggle, pendingScrollKey, onScrollHandled, onOpenObligation }: DomainsAccordionProps) {
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!pendingScrollKey) return;
    // 80ms delay matches source's own `setTimeout(function(){acc.scrollIntoView(...)},80)`
    // (onsideShow, source line 3052) — gives the just-expanded row's body a
    // frame to lay out before the scroll measures its position.
    const timeoutId = window.setTimeout(() => {
      const el = rowRefs.current[pendingScrollKey];
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.focus();
      onScrollHandled();
    }, 80);
    return () => window.clearTimeout(timeoutId);
  }, [pendingScrollKey, onScrollHandled]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {domains.map((domain) => {
        const open = expandedKeys.has(domain.key);
        const current = curOf(domain);
        const toClose = oblToClose(domain);
        const status = statusOf(domain);
        const obligations = OBL[domain.key];
        const openItems = DOM_OPEN[domain.key] ?? [];
        const headingId = `dom-acc-heading-${domain.key}`;
        const bodyId = `dom-acc-body-${domain.key}`;
        const domainKey = domain.key;
        const obligationRowAction: DataTableRowAction<ObligationRow> | undefined = onOpenObligation
          ? { label: () => 'Open', onPress: (row) => onOpenObligation(domainKey, row) }
          : undefined;

        return (
          <div
            key={domain.key}
            id={`dom-acc-${domain.key}`}
            ref={(el) => {
              rowRefs.current[domain.key] = el;
            }}
            tabIndex={-1}
            style={cardStyle(open)}
            data-lf-composite="domains-accordion-row"
            data-state={open ? 'open' : 'closed'}
          >
            <button
              type="button"
              style={headerButtonStyle}
              aria-expanded={open}
              aria-controls={open ? bodyId : undefined}
              onClick={() => onToggle(domain.key)}
            >
              <span style={titleMetaWrapStyle}>
                <span id={headingId} style={nameStyle}>
                  {domain.name}
                </span>
                <span style={scopeStyle}>
                  {domain.bodies} · {domain.appl}
                  {domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope
                </span>
              </span>
              <Tag text={DOMAIN_STATUS_LABEL[status]} variant={DOMAIN_STATUS_VARIANT[status]} />
              <Icon
                name="chevron-right"
                size={16}
                tone="default"
                style={{ transform: `rotate(${open ? 90 : 0}deg)`, transition: 'transform 120ms ease' }}
              />
            </button>

            {open ? (
              <div id={bodyId} role="region" aria-labelledby={headingId} style={bodyWrapStyle}>
                <div>
                  <div style={scoreLineStyle}>
                    {current.toFixed(1)} of target {domain.target} · {BANDS[domain.target - 1] ?? ''}
                  </div>
                  <div style={scoreSubStyle}>
                    {domain.met} of {domain.appl} obligations met at required maturity
                    {toClose === 0 && openItems.length > 0 ? ' · the open items below are improvements tracked beyond your bar' : ''}
                  </div>
                </div>

                <PosturePillBar segments={domainPostureSegments(current, domain.target)} />

                <div style={targetLineStyle}>
                  <Label text={`Target · ${domain.target} · ${BANDS[domain.target - 1] ?? ''}`} variant="body-secondary" />
                  {' — '}
                  {toClose > 0 ? `${toClose} obligation${toClose === 1 ? '' : 's'} to close for this target` : 'At your bar today'}
                </div>

                {obligations ? (
                  // Base domBody 3684-3687: open items only, met set
                  // summarized in the soft pill — see ONSIDE-06 header note.
                  <div>
                    <h4 style={sectionHeadingStyle}>
                      Gaps &amp; partials · {obligations.filter((o) => o.st !== 'met').length} of {obligations.length} shown obligations
                    </h4>
                    <div style={scrollWrapStyle}>
                      <DataTable
                        caption={`${domain.name} gaps and partials`}
                        columns={obligationColumns()}
                        rows={obligations.filter((o) => o.st !== 'met')}
                        getRowId={(row) => row.id}
                        emptyMessage="No open gaps or partials in this domain."
                        {...(obligationRowAction ? { rowAction: obligationRowAction } : {})}
                      />
                    </div>
                    <div style={{ marginTop: '0.625rem' }}>
                      <span style={pillSoftStyle}>
                        {obligations.filter((o) => o.st === 'met').length} met obligations and the full register with provenance: all{' '}
                        {domain.appl} enumerated
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={sectionHeadingStyle}>Top open items</h4>
                    <div style={scrollWrapStyle}>
                      <DataTable
                        caption={`${domain.name} top open items`}
                        columns={openItemColumns()}
                        rows={openItems.map((item, index) => ({ ...item, id: `${domain.key}-${index}` }))}
                        getRowId={(row) => row.id}
                        emptyMessage="Nothing open in this domain."
                      />
                    </div>
                  </div>
                )}

                <div style={footStyle}>
                  {domain.appl}
                  {domain.tot > domain.appl ? ` of ${domain.tot}` : ''} obligations in scope · {domain.met} at required maturity ·{' '}
                  {domain.docs} documents · Owner: {domain.owner} · {domain.inst}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
