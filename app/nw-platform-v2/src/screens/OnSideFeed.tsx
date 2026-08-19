/**
 * OnSideFeed — Screen anatomy §5.2 "OnSide · Regulatory Feed — Step 2 'The
 * treadmill'" (design_system_spec.md), fed by demo_script_draft.md Step 2
 * and its G2/G3 gap-register entries, seeded from `data/onside.ts`
 * (`SRC_ITEMS`, `SRC_ROWS`, `SRC_LAYERS`).
 *
 * Region map (§5.2): Topbar → page title → FilterBar (C5: source/severity
 * filters, count Chips) → DataTable (C6, `row kind: signal-row`) seeded
 * from `SRC_ITEMS`/digest (survey_map.md 3243–3403). No screen-level
 * primary CTA (stated reason, §5.2/§6: this is a continuously-monitoring
 * screen; a manual "Scan" CTA would contradict the Step-2 `say` line
 * itself). Row-level "Review" (Button, `row`) per signal row opens Drawer
 * (C7) with DrawerContent (C8, `kind: signal`) — this dispatch's TASK line.
 * Components used per spec: Topbar, Sidebar, FilterBar (C5), DataTable
 * (C6), Drawer (C7), DrawerContent (C8, `kind: signal`), Tag, Button (`row`).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical passthrough
 * pattern to `Home.tsx`/`BoardDeck.tsx` (`topbar: TopbarProps` bundle;
 * Sidebar's `activeId` hardcoded here to `'onside.feed'`, only `onNavigate`
 * + optional `sidebarVersionLabel` accepted).
 *
 * AMBIGUITY RESOLVED — "source/severity filters" (§5.2 region map): the
 * ported `data/onside.ts` dataset has no severity field anywhere in
 * `SRC_ITEMS`/`SRC_ROWS`/`SRC_LAYERS` (the only dataset this screen's
 * anchor, survey_map.md 3243–3403, actually covers) — severity as a
 * concept belongs to a different dataset (`GAPS[].sev`, §5.3's open-gaps
 * board) that is out of this screen's scope. Inventing a severity taxonomy
 * with no data anchor would violate this persona's Core Principle 3
 * ("renders server truth, including the unflattering parts" — never
 * fabricate a dimension the data doesn't carry). This file therefore
 * implements exactly one, data-backed FilterBar group — "Source," built
 * from the 15 `SRC_ROWS` entries with real per-source item counts — and
 * ships no severity group. STOP-item, flagged for the spec/data-owning
 * lane: either "severity" needs a real field added to `onside.ts`'s
 * `SrcItem`/`SrcRow` shape, or the spec's filter-group naming should be
 * corrected to match the shipped dataset.
 *
 * AMBIGUITY RESOLVED — "seeded from SRC_ITEMS/digest": `DIGEST` (the
 * settings object `{freq, email, app, bindingOnly}`) has no per-row shape
 * and no anchor connecting it to individual signal rows anywhere in
 * `onside.ts`'s file header or its cited source lines. Read "digest" here
 * as the informal description of the compiled signal feed itself (i.e.
 * "today's digest of regulatory items"), not a literal binding to the
 * `DIGEST` constant — the latter is a global cadence *setting*, not a
 * per-signal field this table has anything to join it on.
 *
 * AMBIGUITY RESOLVED — "status tags on signal rows" (§5.2 Components
 * used): rather than inventing an unfounded status taxonomy (see the
 * severity note above), this file uses the one piece of literal,
 * already-ported status-shaped data present in `SRC_ITEMS`: a small subset
 * of `note` strings under `'Federal Reserve · 12 CFR Ch. II'` carry an
 * embedded `<span class="tag info">New</span>` prefix (verbatim source
 * markup, not this file's invention). `parseNoteBadge` extracts that
 * prefix and renders it through the real `Tag` primitive (`count` variant)
 * instead of `dangerouslySetInnerHTML`'ing raw source markup into the
 * page — the latter would both violate this component system's "style
 * only via components/tokens" discipline and inject unsanitized HTML
 * strings from a data file directly into the DOM. Rows without an embedded
 * badge render no Tag at all (never a fabricated "normal" status pill).
 *
 * AMBIGUITY RESOLVED — `&amp;` entity normalization: `onside.ts`'s own file
 * header documents that some `SRC_ITEMS` keys/titles and `SRC_ROWS.n`
 * values carry a literal-`&` vs. `&amp;`-entity mismatch, "reconciled at
 * lookup time in source by srcRow()/srcItems() doing `.replace(/&amp;/g,
 * '&')`" — and states both forms are preserved verbatim in the ported data
 * (not normalized at the data layer, since that would no longer be a
 * verbatim port). This file ports that exact reconciliation behavior at
 * the render layer instead (`normalizeAmp`, applied to every displayed
 * source name, title, and note), matching the documented source engine
 * behavior rather than inventing new behavior — React does not decode HTML
 * entities embedded in JS string literals, so without this an un-reconciled
 * `&amp;` would otherwise leak into the rendered UI as literal text.
 *
 * AMBIGUITY RESOLVED — the raw `action` tuple element (`SrcItem[4]`, e.g.
 * `"goOnside('dom-mrm')"`) is intentionally excluded from every rendered
 * field, including the Drawer. `onside.ts`'s own file header documents this
 * as "a verbatim source-code string ... not executable here" — it is
 * ported data, not display copy, and showing a raw JS-call string to a
 * presenter/audience would read as a bug, not a signal detail. It stays on
 * each row's derived data model in case a future engine-wiring dispatch
 * needs it for real navigation; nothing in this file renders it.
 *
 * AMBIGUITY RESOLVED — single local `<Drawer>` instance, not hoisted:
 * `Drawer.tsx`'s own header names mounting it "once (e.g. in App.tsx,
 * outside this dispatch's allowlist)" as an example, not a mandate, and
 * this dispatch's ALLOWLIST contains no shared-state file to hoist Drawer
 * ownership to. This screen therefore mounts its own `<Drawer>` instance,
 * scoped to its own local `drawerOpen`/`selectedRow` state. In a standard
 * single-active-route SPA (one screen component mounted at a time), this
 * never produces two simultaneously-open Drawer instances in the DOM, so
 * the binding "never add a second drawer" constraint (survey_map.md §d-5)
 * holds in practice. STOP-item for whichever dispatch does true
 * app-shell/routing integration: if screens are ever composed
 * side-by-side rather than routed one-at-a-time, Drawer ownership should
 * be hoisted to that shared shell instead of staying per-screen.
 *
 * Layout constants: same implementer-judgment category as `Home.tsx`'s
 * header note (§1.4 carries no px/spacing values by design).
 *
 * STOP-item — no executable test run: identical to `Home.tsx`/
 * `BoardDeck.tsx` — no test runner is installed in this worktree
 * (`package.json` out of allowlist). Verified via `npx tsc --noEmit`
 * against the whole `src/` tree instead; recommending the same test-tooling
 * follow-up dispatch.
 */
import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { FilterBar } from '../components/FilterBar';
import type { FilterGroup, FilterOption } from '../components/FilterBar';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { Tag } from '../components/primitives/Tag';
import { SRC_ITEMS, SRC_ROWS, SRC_LAYERS } from '../data/onside';

/** Ports the source engine's `srcRow()`/`srcItems()` `.replace(/&amp;/g,'&')`
 * reconciliation (see file header) at the render layer. */
function normalizeAmp(value: string): string {
  return value.replace(/&amp;/g, '&');
}

const NOTE_BADGE_PATTERN = /^<span[^>]*>([^<]*)<\/span>\s*/i;

/** Extracts a verbatim-ported inline status badge (e.g. `<span class="tag
 * info">New</span>`) from a `SrcItem` note string, if present (see file
 * header "status tags on signal rows" note). Never invents a badge. */
function parseNoteBadge(note: string): { badge: string | null; text: string } {
  const match = NOTE_BADGE_PATTERN.exec(note);
  if (!match) return { badge: null, text: note };
  const badgeText = match[1] ?? '';
  return { badge: badgeText || null, text: note.slice(match[0].length).trim() };
}

interface SignalRow {
  id: string;
  source: string;
  layer: string;
  daysAgo: number;
  date: string;
  title: string;
  badge: string | null;
  note: string;
  /** Raw, unexecuted source-code action token (see file header) — never rendered. */
  action: string;
}

const LAYER_LABEL_BY_KEY = new Map<string, string>(SRC_LAYERS.map(([key, label]) => [key, label]));

const SOURCE_ROW_BY_NORMALIZED_NAME = new Map(SRC_ROWS.map((row) => [normalizeAmp(row.n), row]));

const ALL_SIGNAL_ROWS: SignalRow[] = (() => {
  const rows: SignalRow[] = [];
  for (const [sourceKey, entry] of Object.entries(SRC_ITEMS)) {
    const normalizedSource = normalizeAmp(sourceKey);
    const rowMeta = SOURCE_ROW_BY_NORMALIZED_NAME.get(normalizedSource);
    const layerKey = rowMeta?.l ?? 'Unknown';
    entry.items.forEach((item, index) => {
      const [daysAgo, date, title, note, action] = item;
      const { badge, text } = parseNoteBadge(note);
      rows.push({
        id: `${normalizedSource}::${index}`,
        source: normalizedSource,
        layer: layerKey,
        daysAgo,
        date,
        title: normalizeAmp(title),
        badge,
        note: normalizeAmp(text),
        action,
      });
    });
  }
  return rows;
})();

const SOURCE_FILTER_OPTIONS: FilterOption[] = (() => {
  const countBySource = new Map<string, number>();
  for (const row of ALL_SIGNAL_ROWS) {
    countBySource.set(row.source, (countBySource.get(row.source) ?? 0) + 1);
  }
  return SRC_ROWS.map((row) => {
    const name = normalizeAmp(row.n);
    return { id: name, label: name, count: countBySource.get(name) ?? 0 };
  });
})();

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};

const BODY_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  minHeight: 0,
};

const SIDEBAR_REGION_STYLE: CSSProperties = {
  flex: '0 0 240px',
};

const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--ink)',
};

const SIGNAL_CELL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  maxWidth: '32rem',
};

const SIGNAL_TITLE_STYLE: CSSProperties = {
  color: 'var(--ink)',
  fontSize: '0.9375rem',
  fontWeight: 600,
};

const SIGNAL_NOTE_STYLE: CSSProperties = {
  color: 'var(--ink2)',
  fontSize: '0.8125rem',
};

const COLUMNS: DataTableColumn<SignalRow>[] = [
  {
    id: 'source',
    header: 'Source',
    render: (row) => row.source,
    sortable: true,
    sortValue: (row) => row.source,
  },
  {
    id: 'date',
    header: 'Date',
    render: (row) => row.date,
    sortable: true,
    sortValue: (row) => row.daysAgo,
  },
  {
    id: 'signal',
    header: 'Signal',
    render: (row): ReactNode => (
      <span style={SIGNAL_CELL_STYLE}>
        {row.badge ? <Tag text={row.badge} variant="count" /> : null}
        <span style={SIGNAL_TITLE_STYLE}>{row.title}</span>
        <span style={SIGNAL_NOTE_STYLE}>{row.note}</span>
      </span>
    ),
  },
];

export interface OnSideFeedProps {
  /** Full Topbar prop bundle — same passthrough pattern as `Home.tsx`/`BoardDeck.tsx`. */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('onside.feed') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function OnSideFeed({ topbar, onNavigate, sidebarVersionLabel }: OnSideFeedProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<SignalRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredRows = useMemo(
    () =>
      selectedSources.length === 0
        ? ALL_SIGNAL_ROWS
        : ALL_SIGNAL_ROWS.filter((row) => selectedSources.includes(row.source)),
    [selectedSources],
  );

  const toggleSource = (id: string) => {
    setSelectedSources((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    );
  };

  const filterGroups: FilterGroup[] = [
    {
      id: 'source',
      label: 'Source',
      options: SOURCE_FILTER_OPTIONS,
      selectedIds: selectedSources,
      onToggle: toggleSource,
    },
  ];

  const rowAction: DataTableRowAction<SignalRow> = {
    label: () => 'Review',
    onPress: (row) => {
      setSelectedRow(row);
      setDrawerOpen(true);
    },
  };

  const handleDrawerClose = () => setDrawerOpen(false);

  const drawerTitle = selectedRow ? `Signal — ${selectedRow.source}` : 'Signal';

  const drawerFields: DrawerContentField[] = selectedRow
    ? [
        { label: 'Source', value: selectedRow.source },
        { label: 'Regulatory layer', value: LAYER_LABEL_BY_KEY.get(selectedRow.layer) ?? selectedRow.layer },
        { label: 'Date', value: selectedRow.date },
        { label: 'Signal', value: selectedRow.title },
        { label: 'Note', value: selectedRow.note },
      ]
    : [];

  const drawerTags: DrawerContentTag[] = selectedRow?.badge
    ? [{ text: selectedRow.badge, variant: 'count' }]
    : [];

  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) — see `Home.tsx`'s identical note on `exactOptionalPropertyTypes`.
  const sidebarProps: SidebarProps = {
    activeId: 'onside.feed',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="onside-feed" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="onside-feed-main" style={MAIN_STYLE} aria-labelledby="onside-feed-title">
          <h1 id="onside-feed-title" style={TITLE_STYLE}>
            Regulatory feed
          </h1>
          <FilterBar groups={filterGroups} />
          <DataTable
            caption="Regulatory signals feed"
            columns={COLUMNS}
            rows={filteredRows}
            getRowId={(row) => row.id}
            rowAction={rowAction}
            defaultSortColumnId="date"
            defaultSortDirection="ascending"
            emptyMessage="No signals match the selected filters."
          />
        </main>
      </div>
      <Drawer open={drawerOpen} title={drawerTitle} onClose={handleDrawerClose}>
        <DrawerContent kind="signal" fields={drawerFields} tags={drawerTags} />
      </Drawer>
    </div>
  );
}
