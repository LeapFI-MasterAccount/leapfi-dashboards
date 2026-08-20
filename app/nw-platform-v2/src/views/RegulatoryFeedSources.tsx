/**
 * RegulatoryFeedSources — view composed into `OnSideFeed.tsx` (Step 2 script
 * screen), below its existing, unchanged FilterBar+DataTable signal feed.
 * Dispatch: parity_ia_addendum.md Batch 2 ("OnSide · Regulatory feed
 * parity"), §1.1 rows `feed-sources` + `src:`.
 *
 * Base engine anchors: digest & alerts (`digestCard`/`DIGEST`/`FREQ`)
 * leapfi-platform.html 3345-3387; source index (`osSources`) 3389-3403;
 * source detail (`osSourcePage`) 3404-3450.
 *
 * Region: "Sources & connectors" section — intro paragraph, a digest &
 * alerts card, then the 15 `SRC_ROWS` sources rendered as one DataTable
 * (C6) per `SRC_LAYERS` group (Financial / Systemic / Regional), matching
 * `osSources()`'s own per-layer `<table>` split (3396-3399). Row action
 * opens the source's detail — per this dispatch's TASK line, that detail
 * is meant to render inside `OnSideFeed.tsx`'s *existing* shared Drawer
 * (survey_map.md §d-5: never a second drawer instance), not a Drawer owned
 * by this file.
 *
 * ALLOWLIST BOUNDARY (STOP-item, read before wiring this in) — this
 * dispatch's file ALLOWLIST is this file plus RegulatoryFeedLifecycle.tsx
 * and RegulatoryFeedInforce.tsx only. `OnSideFeed.tsx` is an existing,
 * already-shipped screen; the persona's HARD RULES forbid touching it
 * ("never touch ... existing screens"). parity_ia_addendum.md's own
 * "Method note" (top of file) and its Batch 2 section both describe the
 * `OnSideFeed.tsx` Drawer/selectedRow extension as "one small,
 * explicitly-flagged wiring edit ... follow-up integration work, not part
 * of the [batch] allowlist." This file therefore does NOT import or modify
 * `OnSideFeed.tsx`. Instead it exposes exactly the seam a follow-up wiring
 * dispatch needs: an `onOpenSource` callback fired with a fully-formed
 * `SourceDetailRow` (see below) on every source row's "Open" press. That
 * follow-up dispatch's job is to extend `OnSideFeed.tsx`'s `selectedRow`
 * union type to also accept `SourceDetailRow`, pass this component
 * `onOpenSource={(row) => { setSelectedRow(row); setDrawerOpen(true); }}`,
 * and branch `drawerFields`/`drawerTags` on which shape `selectedRow` is —
 * exactly the "small, additive edit, existing Drawer instance reused"
 * the addendum describes. Flagging explicitly rather than silently
 * building it, per persona directive 4 (STOP-and-report on an ALLOWLIST
 * boundary, don't improvise past it).
 *
 * `SourceDetailRow` carries the six fields this dispatch's TASK line names
 * for the Drawer detail verbatim: "source name, layer, method, 30-day
 * activity, connector phase, alert toggle." Per-source alert state
 * (`SRC_ALERTS` in source, `toggleSrcAlert` 3365-3370) has to live
 * somewhere that can also compute this section's own "N sources set to
 * alert immediately" digest-card line (3383) — so it is owned here, inside
 * this component, and exposed to the (out-of-allowlist) Drawer via a bound
 * `onToggleAlert` closure on each row rather than requiring the wiring
 * dispatch to duplicate alert-state storage. This keeps state ownership
 * with the component that already needs it for its own rendering, while
 * still letting a Drawer built elsewhere read and flip it.
 *
 * AMBIGUITY RESOLVED — digest-frequency picker as 5 single-select Chips,
 * not a new Select primitive: flagged and pre-authorized in
 * parity_ia_addendum.md §3 item 1 ("Chip (P5, `filter` variant) ...
 * screen enforces mutual exclusivity ... No new component requested").
 * Implemented as 5 `Chip` (`variant="filter"`) with `selected` driven by a
 * single `frequency` state value (one `setFrequency` call per press, never
 * a toggle) so exactly one is ever pressed — the cardinality-1 constraint
 * the addendum flags as screen-owned, not Chip's.
 *
 * AMBIGUITY RESOLVED — port of the base engine's `freqDays()` `||1` quirk
 * (source line 3349: `r[1]||1`): for the `Real-time` option (`daysThreshold
 * === 0`), `0||1` evaluates to `1` in the base engine, so its "in this
 * digest" count for Real-time silently behaves like a 1-day window rather
 * than "everything from the instant sweep." This reads as a base-engine
 * defect, not an intentional design — but this file's TASK is UI parity,
 * not a behavior fix, so `freqDaysFor` ports the exact `|| 1` expression
 * rather than silently correcting it. Flagged for the record, not hidden.
 *
 * Entity decoding: `&amp;` and `&ndash;` are the only HTML entities
 * present anywhere in `SRC_ROWS`/`SRC_LAYERS`/`SRC_ITEMS` keys (verified via
 * `grep` against `data/onside.ts`) — `decodeEntities` below is scoped to
 * exactly those two, not a general HTML decoder, matching this codebase's
 * established per-file decoding precedent (`OnSideFeed.tsx`'s
 * `normalizeAmp`, `OnSideDocuments.tsx`'s `decodeDocText`).
 *
 * Accessibility: source tables are real `<table>` semantics via DataTable
 * (C6); the digest frequency Chips are real toggle-buttons
 * (`aria-pressed`, per Chip's own baseline) with a visible "Next send"
 * text line so cadence is never color/position-only; delivery Switches
 * (P8) render a visible On/Off text pairing per Switch's own a11y
 * baseline; every Tag pairs color with a text status word (Tag's own
 * baseline, unmodified here).
 *
 * FIX WAVE (ONSIDE-09) — toast confirmations ported: the base fires a
 * toast on every digest-frequency change ('Digest set to {freq} · {next
 * send}', source 3363), every delivery toggle ('Digest preferences
 * updated', 3363), and every per-source alert toggle ('Alerts on for
 * {name}. You will be notified the moment a sweep finds a change.' /
 * 'Alerts off for {name}. It still appears in your digest.', 3366–3371).
 * This view owns digest + alert truth, so it owns the toasts too — the
 * drawer-fired alert toggle (bound `onToggleAlert` closure) routes
 * through the same `toggleAlert` and confirms identically. Rendered via
 * the Toast composite (C17), auto-dismissing, fixed top-right (same
 * placement OnSideDocuments already uses).
 *
 * FIX WAVE (ONSIDE-08) — the `SrcRow.i` instrument key is now rendered:
 * source names whose row carries `i` render as a link-styled button
 * firing `onOpenInstrument` (base osSources 3391 `r.i?instrLink(r.i,
 * r.n):r.n`), guarded on `INSTR[key]` exactly as base instrLink is
 * (source 2306). The instrument detail itself renders in `OnSideFeed`'s
 * shared Drawer (that screen's `openInstr` port).
 *
 * FIX WAVE (A-overlap-04 cleanup) — `Toast.tsx` is now self-positioning
 * (fixed bottom-center, its own anchor); the local fixed top-right wrapper
 * this view's toast render used is removed as the now-inert leftover that
 * fix's header flagged for the screen-owning batch to clear.
 *
 * Tests: this worktree now carries Vitest + Testing Library — regression
 * coverage lives in `src/__tests__/onside/` (the earlier "no test runner
 * installed" STOP-item recorded here is resolved and removed).
 */
import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Toast } from '../components/Toast';
import { Chip } from '../components/primitives/Chip';
import { Switch } from '../components/primitives/Switch';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant } from '../components/primitives/Tag';
import { DIGEST, FREQ, INSTR, SRC_ITEMS, SRC_LAYERS, SRC_ROWS } from '../data/onside';
import type { SrcRow } from '../data/onside';
import { PANEL_STYLE } from '../theme/panelStyle';

const ENTITY_MAP: Record<string, string> = { '&amp;': '&', '&ndash;': '–' };

/** See file header "Entity decoding." */
function decodeEntities(text: string): string {
  return text.replace(/&(amp|ndash);/g, (match) => ENTITY_MAP[match] ?? match);
}

/** Fully-formed detail this view hands to the (out-of-allowlist) Drawer
 * wiring on a source row's "Open" press. See file header. */
export interface SourceDetailRow {
  name: string;
  layerLabel: string;
  method: string;
  activity30d: number;
  phaseLabel: string;
  alertOn: boolean;
  onToggleAlert: () => void;
}

export interface RegulatoryFeedSourcesProps {
  /** Fired when a source row's "Open" action is pressed. See file header
   * ALLOWLIST BOUNDARY note — this component never opens a Drawer itself. */
  onOpenSource: (row: SourceDetailRow) => void;
  /** Fired when a source name carrying an `SrcRow.i` instrument key is
   * pressed (base instrLink → openInstr; see file header ONSIDE-08 note).
   * The owning screen renders the instrument detail in the shared Drawer. */
  onOpenInstrument: (instrumentKey: string) => void;
}

const LAYER_LABEL_BY_KEY = new Map<string, string>(SRC_LAYERS.map(([key, label]) => [key, decodeEntities(label)]));

const SRC_ITEMS_BY_NORMALIZED_NAME = new Map(
  Object.entries(SRC_ITEMS).map(([key, entry]) => [decodeEntities(key), entry]),
);

function activity30dFor(sourceName: string): number {
  const entry = SRC_ITEMS_BY_NORMALIZED_NAME.get(decodeEntities(sourceName));
  return entry ? entry.items.filter((item) => item[0] <= 30).length : 0;
}

const PHASE_TAG_VARIANT: NonRaciTagVariant = 'status-positive';
const PHASE_TAG_VARIANT_PENDING: NonRaciTagVariant = 'count';

/** Ports `freqDays()`'s `||1` quirk verbatim — see file header. */
function freqDaysFor(label: string): number {
  const match = FREQ.find((option) => option[0] === label);
  return match ? match[1] || 1 : 1;
}

function freqWhenFor(label: string): string {
  const match = FREQ.find((option) => option[0] === label);
  return match ? match[2] : '';
}

function computeDigestCount(frequency: string, bindingOnly: boolean): number {
  const days = freqDaysFor(frequency);
  let count = 0;
  for (const row of SRC_ROWS) {
    if (bindingOnly && !row.c.includes('Binding')) continue;
    const entry = SRC_ITEMS_BY_NORMALIZED_NAME.get(decodeEntities(row.n));
    if (!entry) continue;
    for (const item of entry.items) {
      if (item[0] <= days) count++;
    }
  }
  return count;
}

const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const LAYER_HEADING_STYLE: CSSProperties = { margin: '0 0 0.25rem', font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
const LAYER_BLOCK_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };

export const CARD_STYLE: CSSProperties = {
  ...PANEL_STYLE,
  borderRadius: 'var(--radius-sm, 6px)', // differs from the shared default (var(--radius-md, 10px)) — preserved, not flattened
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const DIGEST_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
  gap: '1.5rem',
};

const DIGEST_FIELD_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const CHIP_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const SWITCH_COLUMN_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.6rem' };
// FIX WAVE (Class C, C1): rendered inside CARD_STYLE (spreads
// PANEL_STYLE) — --ink2 fails AA on --panel in light theme; --chart-axis
// is the prescribed panel-seated substitute.
const DIGEST_HINT_STYLE: CSSProperties = { margin: 0, fontSize: '0.8125rem', color: 'var(--chart-axis)' };
const DIGEST_COUNT_STYLE: CSSProperties = { margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' };

interface SourceListRow {
  id: string;
  name: string;
  covers: string;
  method: string;
  phaseKey: string;
  phaseLabel: string;
  activity30d: number;
  layerKey: string;
  /** `SrcRow.i` — instrument key behind the source name, when one exists
   * (base osSources 3391; see file header ONSIDE-08 note). */
  instrumentKey: string | null;
}

const ALL_SOURCE_ROWS: SourceListRow[] = SRC_ROWS.map((row: SrcRow) => {
  const name = decodeEntities(row.n);
  return {
    id: name,
    name,
    covers: decodeEntities(row.c),
    method: row.m,
    phaseKey: row.ph,
    phaseLabel: row.phl,
    activity30d: activity30dFor(row.n),
    layerKey: row.l,
    instrumentKey: row.i,
  };
});

/** Link-styled real `<button>` for an in-cell instrument link — the base
 * `.doclink` affordance (source 3391) rendered accessibly. */
const INSTRUMENT_LINK_STYLE: CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  fontWeight: 700,
  color: 'var(--accent)',
  textDecoration: 'underline',
  cursor: 'pointer',
  textAlign: 'left',
};

export function RegulatoryFeedSources({ onOpenSource, onOpenInstrument }: RegulatoryFeedSourcesProps) {
  const [frequency, setFrequency] = useState<string>(DIGEST.freq);
  const [deliveryEmail, setDeliveryEmail] = useState(DIGEST.email);
  const [deliveryApp, setDeliveryApp] = useState(DIGEST.app);
  const [deliveryBindingOnly, setDeliveryBindingOnly] = useState(DIGEST.bindingOnly);
  const [sourceAlerts, setSourceAlerts] = useState<Record<string, boolean>>({});
  // ONSIDE-09 — toast confirmations (base setDigest/toggleSrcAlert, source
  // 3360–3371). Keyed by a monotonically-increasing id so a fresh toast
  // remounts (and restarts its auto-dismiss) even with identical text.
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastSeqRef = useRef(0);
  // Always-current mirror of `sourceAlerts` so the drawer-bound
  // `onToggleAlert` closure (captured at row-open time) still computes the
  // right next value and toast copy on later presses.
  const sourceAlertsRef = useRef(sourceAlerts);
  sourceAlertsRef.current = sourceAlerts;

  const alertCount = useMemo(() => Object.values(sourceAlerts).filter(Boolean).length, [sourceAlerts]);
  const digestCount = useMemo(
    () => computeDigestCount(frequency, deliveryBindingOnly),
    [frequency, deliveryBindingOnly],
  );

  const showToast = (message: string) => {
    toastSeqRef.current += 1;
    setToast({ id: toastSeqRef.current, message });
  };

  const toggleAlert = (sourceName: string) => {
    const next = !sourceAlertsRef.current[sourceName];
    setSourceAlerts((current) => ({ ...current, [sourceName]: next }));
    // Verbatim base toggleSrcAlert toast copy (source 3370).
    showToast(
      next
        ? `Alerts on for ${sourceName}. You will be notified the moment a sweep finds a change.`
        : `Alerts off for ${sourceName}. It still appears in your digest.`,
    );
  };

  // Base setDigest toast copy (source 3363).
  const handleFrequencyPress = (label: string) => {
    if (label === frequency) return;
    setFrequency(label);
    showToast(`Digest set to ${label} · ${freqWhenFor(label)}`);
  };

  const handleDeliveryChange = (apply: (value: boolean) => void) => (value: boolean) => {
    apply(value);
    showToast('Digest preferences updated');
  };

  const columns: DataTableColumn<SourceListRow>[] = [
    {
      id: 'name',
      header: 'Source',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          {row.instrumentKey !== null && INSTR[row.instrumentKey] ? (
            // ONSIDE-08 — base `r.i?instrLink(r.i,r.n):r.n` (source 3391).
            <button
              type="button"
              style={INSTRUMENT_LINK_STYLE}
              onClick={() => onOpenInstrument(row.instrumentKey as string)}
            >
              {row.name}
            </button>
          ) : (
            <strong style={{ color: 'var(--ink)' }}>{row.name}</strong>
          )}
          {sourceAlerts[row.name] ? <Tag text="Alerts on" variant="hitl" /> : null}
        </span>
      ),
    },
    { id: 'covers', header: 'Covers', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.covers}</span> },
    { id: 'method', header: 'Method', render: (row) => <span style={{ color: 'var(--ink2)' }}>{row.method}</span> },
    { id: 'activity', header: '30d', align: 'end', render: (row) => <span>{row.activity30d}</span> },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Tag
          text={row.phaseLabel}
          variant={row.phaseKey === 'live' ? PHASE_TAG_VARIANT : PHASE_TAG_VARIANT_PENDING}
        />
      ),
    },
  ];

  const rowAction: DataTableRowAction<SourceListRow> = {
    label: () => 'Open',
    onPress: (row) => {
      onOpenSource({
        name: row.name,
        layerLabel: LAYER_LABEL_BY_KEY.get(row.layerKey) ?? row.layerKey,
        method: row.method,
        activity30d: row.activity30d,
        phaseLabel: row.phaseLabel,
        alertOn: Boolean(sourceAlerts[row.name]),
        onToggleAlert: () => toggleAlert(row.name),
      });
    },
  };

  return (
    <section aria-labelledby="regulatory-feed-sources-heading" style={SECTION_STYLE}>
      <h2 id="regulatory-feed-sources-heading" style={SUBHEADING_STYLE}>
        Sources &amp; connectors
      </h2>

      <div style={CARD_STYLE}>
        <h3 style={LAYER_HEADING_STYLE}>Digest &amp; alerts</h3>
        <div style={DIGEST_GRID_STYLE}>
          <div style={DIGEST_FIELD_STYLE}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>Digest frequency</span>
            <div style={CHIP_ROW_STYLE} role="group" aria-label="Digest frequency">
              {FREQ.map(([label]) => (
                <Chip key={label} text={label} variant="filter" selected={frequency === label} onPress={() => handleFrequencyPress(label)} />
              ))}
            </div>
            <p style={DIGEST_HINT_STYLE}>Next send: {freqWhenFor(frequency)}</p>
          </div>

          <div style={DIGEST_FIELD_STYLE}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>Delivery</span>
            <div style={SWITCH_COLUMN_STYLE}>
              <Switch checked={deliveryEmail} label="Email" onChange={handleDeliveryChange(setDeliveryEmail)} />
              <Switch checked={deliveryApp} label="In-app" onChange={handleDeliveryChange(setDeliveryApp)} />
              <Switch checked={deliveryBindingOnly} label="Binding rules only" onChange={handleDeliveryChange(setDeliveryBindingOnly)} />
            </div>
            <p style={DIGEST_HINT_STYLE}>
              {alertCount} source{alertCount === 1 ? '' : 's'} set to alert immediately
            </p>
          </div>

          <div style={DIGEST_FIELD_STYLE}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>In this digest</span>
            <p style={DIGEST_COUNT_STYLE}>{digestCount}</p>
            <p style={DIGEST_HINT_STYLE}>
              item{digestCount === 1 ? '' : 's'} captured in the{' '}
              {frequency === 'Real-time' ? 'last sweep' : freqDaysFor(frequency) === 1 ? 'last day' : `last ${freqDaysFor(frequency)} days`}
              {deliveryBindingOnly ? ' · binding rules only' : ''}
            </p>
          </div>
        </div>
      </div>

      {SRC_LAYERS.map(([layerKey, layerLabel]) => {
        const rows = ALL_SOURCE_ROWS.filter((row) => row.layerKey === layerKey);
        return (
          <div key={layerKey} style={LAYER_BLOCK_STYLE}>
            <h3 style={LAYER_HEADING_STYLE}>{decodeEntities(layerLabel)}</h3>
            <div style={SCROLL_WRAP_STYLE}>
              <DataTable
                caption={`${decodeEntities(layerLabel)} sources`}
                columns={columns}
                rows={rows}
                getRowId={(row) => row.id}
                rowAction={rowAction}
                emptyMessage="No sources in this layer."
              />
            </div>
          </div>
        );
      })}

      {toast ? (
        // ONSIDE-09 — base toast() confirmations; auto-dismisses like the
        // base's transient toast, close control always present (C17).
        // Toast.tsx self-positions (fixed bottom-center) since the
        // A-overlap-04 fix — no local fixed wrapper needed or wanted.
        <Toast key={toast.id} variant="info" message={toast.message} onDismiss={() => setToast(null)} autoDismissMs={4000} />
      ) : null}
    </section>
  );
}
