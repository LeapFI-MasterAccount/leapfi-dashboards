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
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of ALLOWLIST) has no test runner installed, matching every sibling
 * screen/view already landed here. Verified via `npx tsc --noEmit`
 * against the whole `src/` tree instead.
 */
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Chip } from '../components/primitives/Chip';
import { Switch } from '../components/primitives/Switch';
import { Tag } from '../components/primitives/Tag';
import type { TagVariant } from '../components/primitives/Tag';
import { DIGEST, FREQ, SRC_ITEMS, SRC_LAYERS, SRC_ROWS } from '../data/onside';
import type { SrcRow } from '../data/onside';

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
}

const LAYER_LABEL_BY_KEY = new Map<string, string>(SRC_LAYERS.map(([key, label]) => [key, decodeEntities(label)]));

const SRC_ITEMS_BY_NORMALIZED_NAME = new Map(
  Object.entries(SRC_ITEMS).map(([key, entry]) => [decodeEntities(key), entry]),
);

function activity30dFor(sourceName: string): number {
  const entry = SRC_ITEMS_BY_NORMALIZED_NAME.get(decodeEntities(sourceName));
  return entry ? entry.items.filter((item) => item[0] <= 30).length : 0;
}

const PHASE_TAG_VARIANT: TagVariant = 'status-positive';
const PHASE_TAG_VARIANT_PENDING: TagVariant = 'count';

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
const INTRO_TEXT_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)', maxWidth: '62rem' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const LAYER_BLOCK_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };

const CARD_STYLE: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  background: 'var(--panel)',
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
const DIGEST_HINT_STYLE: CSSProperties = { margin: 0, fontSize: '0.8125rem', color: 'var(--ink2)' };
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
  };
});

export function RegulatoryFeedSources({ onOpenSource }: RegulatoryFeedSourcesProps) {
  const [frequency, setFrequency] = useState<string>(DIGEST.freq);
  const [deliveryEmail, setDeliveryEmail] = useState(DIGEST.email);
  const [deliveryApp, setDeliveryApp] = useState(DIGEST.app);
  const [deliveryBindingOnly, setDeliveryBindingOnly] = useState(DIGEST.bindingOnly);
  const [sourceAlerts, setSourceAlerts] = useState<Record<string, boolean>>({});

  const alertCount = useMemo(() => Object.values(sourceAlerts).filter(Boolean).length, [sourceAlerts]);
  const digestCount = useMemo(
    () => computeDigestCount(frequency, deliveryBindingOnly),
    [frequency, deliveryBindingOnly],
  );

  const toggleAlert = (sourceName: string) => {
    setSourceAlerts((current) => ({ ...current, [sourceName]: !current[sourceName] }));
  };

  const columns: DataTableColumn<SourceListRow>[] = [
    {
      id: 'name',
      header: 'Source',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <strong style={{ color: 'var(--ink)' }}>{row.name}</strong>
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
      <p style={INTRO_TEXT_STYLE}>
        Every source is monitored continuously and grouped into three layers, tracked separately because
        obligations stack: a federal rule, a state law, and a municipal ordinance can all touch the same
        policy. Every captured item carries a verbatim source span, a resolvable pin-cite, and a SHA-256
        hash — nothing becomes authoritative until a qualified human approves it.
      </p>

      <div style={CARD_STYLE}>
        <h3 style={LAYER_HEADING_STYLE}>Digest &amp; alerts</h3>
        <p style={DIGEST_HINT_STYLE}>
          Everything monitored, delivered on your schedule. Alerts are the exception path — turn one on
          for a source and a change from it reaches you the moment a sweep finds it, whatever the digest
          cadence.
        </p>
        <div style={DIGEST_GRID_STYLE}>
          <div style={DIGEST_FIELD_STYLE}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>Digest frequency</span>
            <div style={CHIP_ROW_STYLE} role="group" aria-label="Digest frequency">
              {FREQ.map(([label]) => (
                <Chip key={label} text={label} variant="filter" selected={frequency === label} onPress={() => setFrequency(label)} />
              ))}
            </div>
            <p style={DIGEST_HINT_STYLE}>Next send: {freqWhenFor(frequency)}</p>
          </div>

          <div style={DIGEST_FIELD_STYLE}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>Delivery</span>
            <div style={SWITCH_COLUMN_STYLE}>
              <Switch checked={deliveryEmail} label="Email" onChange={setDeliveryEmail} />
              <Switch checked={deliveryApp} label="In-app" onChange={setDeliveryApp} />
              <Switch checked={deliveryBindingOnly} label="Binding rules only" onChange={setDeliveryBindingOnly} />
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

      {SRC_LAYERS.map(([layerKey, layerLabel, layerDescription]) => {
        const rows = ALL_SOURCE_ROWS.filter((row) => row.layerKey === layerKey);
        return (
          <div key={layerKey} style={LAYER_BLOCK_STYLE}>
            <h3 style={LAYER_HEADING_STYLE}>{decodeEntities(layerLabel)}</h3>
            <p style={DIGEST_HINT_STYLE}>{decodeEntities(layerDescription)}</p>
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
    </section>
  );
}
