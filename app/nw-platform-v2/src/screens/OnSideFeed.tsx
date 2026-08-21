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
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: this screen never called it directly (every internal
 * action here is a Drawer open/close or a deep-link), so that plumbing was
 * dead the moment its only consumer (the local `sidebarProps`
 * construction) was removed.
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
 * source name, title, note, AND layer label — the last added by the
 * ONSIDE-01 fix wave: `SRC_LAYERS`' Regional label carries a verbatim
 * `&amp;` too, and the base injects it via innerHTML where the entity
 * decodes, source 3335), matching the documented source engine behavior
 * rather than inventing new behavior — React does not decode HTML
 * entities embedded in JS string literals, so without this an un-reconciled
 * `&amp;` would otherwise leak into the rendered UI as literal text.
 *
 * FIX WAVE (ONSIDE-07) — Date-column sort semantics: `sortValue` is the
 * NEGATED `daysAgo` and the default direction is `descending`, so the
 * announced `aria-sort` matches the calendar order actually on screen
 * (default view: newest first = descending calendar date). The previous
 * shipped pairing (raw `daysAgo` + `ascending`) announced the exact
 * inverse of the visible order to assistive tech.
 *
 * FIX WAVE (ONSIDE-04) — the source-detail alert toggle is a screen-owned
 * Button rendered in the Drawer body after `DrawerContent`, NOT a
 * `DrawerContent` `actions` entry: `DrawerContent.tsx` keys action
 * Buttons by `action.label`, and this toggle's label flips on every press
 * ('Turn alerts on' ⇄ 'Turn alerts off'), so as an `actions` entry each
 * press remounted the button under the user's focus — dropping focus to
 * `document.body` and breaking the Drawer's focus trap and
 * Escape-to-close (both live on the dialog's own onKeyDown). A
 * screen-owned Button at a stable JSX position keeps the same DOM node
 * across label flips, so focus stays put. (`DrawerContent.tsx` itself is
 * the reporting batch's file — flagged there as the keying root cause.)
 *
 * FIX WAVE (ONSIDE-08) — instrument deep-links ported: the base makes
 * source names (`osSources` 3391 `instrLink`), tracked-rule items
 * (3477), and every in-force row (3494) clickable into the instrument
 * detail (`openInstr`, 2932–2949, rendered into the shared drawer). The
 * three parity views now fire an `onOpenInstrument(key)` seam and this
 * screen renders the `INSTR` entry (kind, issuer, effective, source,
 * review line, summary, domains driven — the fields base `openInstr`
 * shows) as a third branch of the shared Drawer's selection union. The
 * base's domain chips ("Domains this instrument drives" → `dom-` deep
 * links) render as a plain text field here: no navigation-with-payload
 * mechanism exists from this screen (same gap OnSideOverview's
 * `deepLinkDomainKey` header note documents).
 *
 * FIX WAVE (B-dead-interactions-07) — the instrument drawer's "Domains
 * this instrument drives" field (base openInstr's domain chips → `dom-`
 * deep links, source 2934) was a plain joined string here (this file's own
 * earlier ONSIDE-08 note: "no navigation-with-payload mechanism exists
 * from this screen"). App.tsx's NAVIGATION-WITH-PAYLOAD contract (its own
 * file header) now exists and is already spread onto every routed screen,
 * including this one, whether or not the screen had declared the props —
 * this file now declares `extends DeepLinkScreenProps` (type-only import
 * from `App.tsx`, erased at build) and renders one real `DrawerContent`
 * action Button per domain, firing `onDeepLink({screen:'onside.overview',
 * kind:'domain', id: domKey})` — the exact 'domain' kind the contract
 * already bridges onto `OnSideOverview`'s `deepLinkDomainKey` prop. Falls
 * back to no action buttons (never a dead click) if a consumer mounts this
 * screen without wiring `onDeepLink`.
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
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed).
 *
 * FIX WAVE (A-overlap-06) — the signal DataTable was the one table on this
 * screen (and the only one app-wide) rendered without the per-table
 * `overflowX:'auto'` wrapper every sibling table in this codebase uses (base
 * anchor: `.raci-wrap{overflow-x:auto}`, leapfi-platform.html:146) — on a
 * narrow viewport its nowrap header cells forced the whole `<main>` region
 * (title, FilterBar, and the three below-the-fold sections included) to
 * scroll horizontally as one unit instead of scrolling just the table. Now
 * wrapped in the same `SCROLL_WRAP_STYLE` div every other screen's tables
 * use.
 *
 * FIX WAVE (B-dead-interactions-16) — `RegulatoryFeedLifecycle`'s "Newly
 * proposed" rows now fire `onOpenSources` (see that file's own header
 * note); this screen scrolls/focuses its already-composed
 * `RegulatoryFeedSources` section (ref'd via `sourcesSectionRef`, wrapping
 * that section — not editing `RegulatoryFeedSources.tsx` itself, which is
 * outside this dispatch's allowlist).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * L3 UPDATE (PI-3, D6/call-07, sprint-plan.md Sprint 2 L3) — SOURCES &
 * CONNECTORS RELOCATED TO SETTINGS: `RegulatoryFeedSources` (and its Digest
 * & Alerts panel) no longer composes on this screen. The W1/SEAM 2 history
 * that used to document its wiring here (source-detail Drawer branch,
 * `'feed-source'` deep-link consumption, the "Open in Sources & connectors
 * →" action) is superseded — see `SettingsToggles.tsx`'s own header for the
 * current, accurate version of that whole seam, now hosted there against
 * the same `onOpenSource`/`onOpenInstrument` props `RegulatoryFeedSources`
 * already exposed (D6: reuse the existing wiring seam, never re-invent).
 * `RegulatoryFeedLifecycle` and `RegulatoryFeedInforce` are UNCHANGED and
 * still compose here, in the same 1→2 (lifecycle→in-force) order below the
 * signal feed (`RegulatoryFeedSources` no longer occupies the "1" slot).
 *
 * `RegulatoryFeedLifecycle`'s "Newly proposed" row action still requires an
 * `onOpenSources: () => void` prop (that file is out of this lane's
 * ALLOWLIST, so its own call site cannot change) — with no Sources section
 * left on THIS screen to scroll/focus, `handleOpenSources` now closes any
 * open Drawer content first (H1's existing "close before you move focus"
 * discipline, preserved) and then fires this screen's own `onDeepLink`
 * (already live-wired by App.tsx's `deepLinkProps` spread, no App.tsx edit
 * needed) at `{ screen: 'settings.toggles', kind: 'feed-source', id:
 * 'sources' }` — a real cross-screen navigation to where that content now
 * lives, reusing the `'feed-source'` kind App.tsx's own KIND VOCABULARY
 * already reserves for "the source-connector surface" (CLASS 3, "no
 * producer yet" — this is that kind's first live producer). STOP-item,
 * flagged not silently approximated: `SettingsToggles.tsx` does not (yet)
 * receive `deepLinkProps` from App.tsx (out of this lane's ALLOWLIST), so
 * this lands the operator on the right SCREEN but does not scroll/focus or
 * pre-open a specific source there — closing that gap needs an App.tsx edit
 * (spread `deepLinkProps` onto `<SettingsToggles />`) plus a `deepLink`
 * consumption effect on that screen, both out of scope here.
 *
 * The former per-source, non-live `'feed-source'` Drawer branch (the
 * "PARTIAL FIDELITY, HONESTLY SCOPED" shape that omitted "Immediate
 * alerts") is retired along with it: that content's live, toggleable home
 * is now Settings itself, so a same-screen non-live echo of it here would
 * only drift from the real source of truth.
 *
 * HOSTILE-REVIEW FIX WAVE (Class A, finding A3) — PARTIALLY RESOLVED: the
 * 'section' kind (id `'lifecycle'`/`'gaps'`, both targeting `onside.feed`
 * per App.tsx's KIND VOCABULARY, source 869/878) previously had no
 * consumer here at all (this note's earlier "ALSO STILL OPEN" text,
 * superseded). This screen now consumes id `'lifecycle'`: it resolves to
 * a real, unambiguous section already rendered below
 * (`RegulatoryFeedLifecycle`) and scrolls/focuses it — closing the dead
 * click on `HomePanels.tsx`'s "Full lifecycle →" link and its Strategic
 * Signal drawer action.
 *
 * STILL OPEN (STOP-item, a design decision, not an implementation one):
 * id `'gaps'` (fired by `InvestmentDesign.tsx`'s "See the gap queue" play-
 * drawer action) is NOT resolved here — this screen renders no "gaps"
 * content anywhere (only Lifecycle, Inforce sections, since L3 relocated
 * Sources to Settings — see the L3 UPDATE note above), and
 * `HomePanels.tsx`'s own file header documents a live disagreement in
 * this codebase about where the base's "gaps" concept even belongs:
 * App.tsx's KIND VOCABULARY comment and this exact `InvestmentDesign.tsx`
 * producer both name `onside.feed`, but `HomePanels.tsx`'s own
 * established, test-pinned convention (`buildQueueBucket`'s rows, "All
 * open items →") targets `onside.documents` instead for the same base
 * verb — and `investment-design.test.tsx` independently pins the current
 * `onside.feed` dispatch as correct base-anchor behavior. Silently
 * picking either side would contradict the other's passing test; flagged
 * for the design authority, not guessed here. An id this effect does not
 * recognize (including 'gaps') still consumes the nonce but opens
 * nothing — never a fabricated destination.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { FilterBar } from '../components/FilterBar';
import type { FilterGroup, FilterOption } from '../components/FilterBar';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { Button } from '../components/primitives/Button';
import { Tag } from '../components/primitives/Tag';
import { AskChatPanel } from '../components/AskChatPanel';
import { RegulatoryFeedLifecycle } from '../views/RegulatoryFeedLifecycle';
import { RegulatoryFeedInforce } from '../views/RegulatoryFeedInforce';
import { DOMAINS, INSTR, SRC_ITEMS, SRC_ROWS, SRC_LAYERS } from '../data/onside';
import type { OnsideInstrument } from '../data/onside';
import { ONSIDE_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';
import type { DeepLinkScreenProps } from '../App';

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

/** L3 UPDATE (see file header) — discriminated selection for the single
 * shared Drawer: the pre-existing signal shape, plus (fix wave, ONSIDE-08)
 * an instrument shape for the base `openInstr` port. The former `'source'`/
 * `'feed-source'` branches (W1/SEAM 2) retired with the Sources & connectors
 * relocation — see `SettingsToggles.tsx` for their current home. */
/** §2.9.1 item 2 — the chat is one more discriminated content state of this
 * SAME shared Drawer, never a second Drawer instance (amendment A16,
 * PI2-D42). */
type DrawerSelection =
  | { kind: 'signal'; row: SignalRow }
  | { kind: 'instrument'; instrumentKey: string; instrument: OnsideInstrument }
  | { kind: 'chat' };

// normalizeAmp on the label — ONSIDE-01: the Regional layer label is the
// verbatim-ported 'Regional · national, state &amp; local' (base 3335,
// where innerHTML decodes it); without reconciliation the raw entity
// rendered in the signal drawer's "Regulatory layer" field.
const LAYER_LABEL_BY_KEY = new Map<string, string>(SRC_LAYERS.map(([key, label]) => [key, normalizeAmp(label)]));

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

/** PI2-D5 (Sprint 1 DeepLinkKind union extension) — 'signal'-kind deep-link
 * lookup by the row's own id (`${sourceKey}::${itemIndex}`, ALL_SIGNAL_ROWS'
 * derivation above). Mirrors SOURCE_LOOKUP_BY_NAME's precedent: a small
 * pure Map built once from the already-computed rows, not re-derived per
 * press. */
const SIGNAL_ROW_BY_ID = new Map<string, SignalRow>(ALL_SIGNAL_ROWS.map((row) => [row.id, row]));

// `position: 'relative'` makes this scrolling region the containing
// block for any absolutely-positioned descendant (sr-only spans today,
// third-party overlays tomorrow) so an unpinned absolute box resolves
// inside the scroll context instead of against the document root —
// see the invariant note on DataTable.tsx's `srOnlyStyle`.
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  position: 'relative',
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

/** §5.8 region map addition (amendment A16, PI2-D42) — "utility corner"
 * (§5.1's originally-named placement, Home.tsx/PI2-D40 precedent), seated
 * beside the page title. */
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' };

/** A-overlap-06 — the per-table horizontal-scroll wrapper every other
 * table in this codebase uses (base `.raci-wrap{overflow-x:auto}`,
 * leapfi-platform.html:146); this screen's own signal table was the sole
 * omission.
 *
 * FIX WAVE (feed-scroll-collapse) — `flexShrink: 0` added: this div is a
 * flex ITEM of `MAIN_STYLE`'s `flex-direction:column` container (`main` has
 * a resolved, height-constrained size — flexed to fill the viewport minus
 * Topbar — which is the intentional "scroll inside the shell" pattern via
 * `overflowY:'auto'` on `main`, not itself a defect). Declaring only
 * `overflowX:'auto'` here, with `overflow-y` left at its initial `visible`,
 * trips the CSS Overflow spec's implicit rule that the *other* axis also
 * computes to `auto` whenever one axis is non-visible — so this element is
 * actually a scroll container in both axes. Per CSS Flexbox, a scroll
 * container's automatic `min-height:auto` resolves to `0`, while this div's
 * non-scroll-container siblings (`h1`, `FilterBar`, the three below-the-fold
 * sections) keep their content-based automatic minimum and refuse to
 * shrink below it. With the default `flex-shrink:1` this wrapper was
 * therefore the ONLY sibling the flex algorithm could shrink to fit
 * `main`'s constrained height — and it shrank to 0, taking the entire
 * 40-row signal `<table>` down with it (regression test:
 * `src/__tests__/onside/feed-scroll-collapse.test.tsx`). `flexShrink: 0`
 * excludes it from shrinking at all, so it renders at its full
 * content height and `main`'s existing `overflow-y:auto` scrolls the page,
 * exactly as that property was already set up to do. Deliberately NOT
 * touching `MAIN_STYLE`'s height/overflow behavior: that flex-resolved
 * height plus `overflowY:'auto'` is the "scroll inside the shell" fix a
 * prior wave already put in place on purpose — reintroducing a page-level
 * scroll there would resurrect the sr-only/scroll-past-shell bug that wave
 * fixed (see `DataTable.tsx`'s `srOnlyStyle` invariant note and this
 * screen's `MAIN_STYLE` `position:'relative'` comment). */
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };

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
    // Negated so the sort value runs in calendar order (larger = more
    // recent) and the announced aria-sort direction matches the visible
    // order — see the ONSIDE-07 note in the file header.
    sortValue: (row) => -row.daysAgo,
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

/** No screen-specific members beyond deep-link consumption — `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount moved to App.tsx's Shell (see file header); this screen never called `onNavigate` directly, only fed it to the Sidebar it no longer renders. */
export type OnSideFeedProps = DeepLinkScreenProps;

export function OnSideFeed({ deepLink, onDeepLink, onDeepLinkConsumed }: OnSideFeedProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selection, setSelection] = useState<DrawerSelection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // §2.9.5 fresh-open reseed — bumped on every "Ask OnSide" press and used
  // as AskChatPanel's `key`, forcing a fresh mount (fresh greeting +
  // suggestion Chips, no carried-forward transcript) even on a same-screen
  // re-open with no navigation in between.
  const [chatOpenNonce, setChatOpenNonce] = useState(0);

  // §2.9 chat-drawer mutual-exclusivity (design_system_spec.md §2.9.1 item
  // 2 / A16 exclusivity intent) — HOSTILE-REVIEW FIX WAVE finding H1: a
  // page-node scroll/focus handoff (below) is NOT a Drawer content swap
  // (unlike the 'signal'/'feed-source'/'source'/'instrument' selections,
  // which overwrite this screen's discriminated `selection` union and so
  // inherit RPT-05's own focus handling for free). Moving focus to a page
  // node while ANY Drawer content — chat included — is still open+
  // aria-modal leaves the dialog open with focus outside its own subtree.
  // `handleDrawerClose` is declared here (ahead of every page-node
  // scroll/focus handoff below) so each of them can close the Drawer FIRST,
  // then focus — the same "close it first, then focus" pattern this file
  // already used at the "Open in Sources & connectors →" drawer action,
  // now owned by the handoff functions themselves so every caller gets it
  // for free, not just that one call site.
  const handleDrawerClose = () => setDrawerOpen(false);

  // L3 UPDATE (see file header) — Sources & connectors no longer renders on
  // this screen. `RegulatoryFeedLifecycle`'s "Newly proposed" row action
  // still requires this callback (that file is out of ALLOWLIST); it now
  // closes any open Drawer content first (same §2.9 discipline every other
  // handoff on this screen uses), then fires a real cross-screen navigate
  // to where Sources & connectors now lives. See file header for the
  // STOP-item on why this cannot also pre-open/focus a specific source yet.
  const handleOpenSources = () => {
    handleDrawerClose();
    onDeepLink?.({ screen: 'settings.toggles', kind: 'feed-source', id: 'sources' });
  };

  // HOSTILE-REVIEW FIX WAVE (Class A, finding A3) — scroll/focus target
  // for `RegulatoryFeedLifecycle`, the real section the 'section'-kind
  // 'lifecycle' id resolves to. Identical shape to `sourcesSectionRef`/
  // `handleOpenSources` immediately above (same handoff technique, one
  // section earlier in this screen's own 1→2→3 section order).
  const lifecycleSectionRef = useRef<HTMLDivElement | null>(null);
  const handleOpenLifecycle = () => {
    // §2.9 — same close-first-then-focus guarantee as handleOpenSources
    // above (HOSTILE-REVIEW FIX WAVE finding H1: this was the one caller
    // that used to skip it — the chat's own scripted 'onside-reg-lifecycle'
    // entry fires exactly this same-screen 'section' deep link).
    handleDrawerClose();
    lifecycleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    lifecycleSectionRef.current?.focus();
  };

  // PI2-D5 (Sprint 1 DeepLinkKind union extension) — 'signal'-kind deep-link
  // consumption: this screen's OWN primary row type, previously never
  // wired (r09 acceptance criterion, "the feed's own primary row type").
  // Same nonce-keyed CONSUME pattern as the 'feed-source' effect above; a
  // stale/unknown id still consumes the nonce but opens nothing.
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'signal') return;
    const row = SIGNAL_ROW_BY_ID.get(deepLink.id);
    if (row) {
      setSelection({ kind: 'signal', row });
      setDrawerOpen(true);
    }
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  // HOSTILE-REVIEW FIX WAVE (Class A, finding A3) — 'section'-kind deep
  // link: id names a section key on THIS screen (App.tsx KIND VOCABULARY).
  // Only 'lifecycle' resolves to a real, unambiguous section here today —
  // scrolls/focuses `RegulatoryFeedLifecycle` via `handleOpenLifecycle`,
  // the same "close Drawer, then move focus/navigate" discipline
  // `handleOpenSources` also follows (though that one now navigates
  // cross-screen instead of scrolling — see file header). Confirmed live
  // producers (Sprint 1 hostile review,
  // finding A3): HomePanels.tsx's "Full lifecycle →" panel-header link and
  // its Strategic Signal drawer action (both id 'lifecycle') — both
  // previously landed here and opened nothing (this file's own former
  // header note, "ALSO STILL OPEN").
  //
  // The 'gaps' id (InvestmentDesign.tsx's "See the gap queue" play-drawer
  // action) is DELIBERATELY left unresolved — a STOP-item, not an
  // oversight: `HomePanels.tsx`'s own file header documents a live
  // disagreement between App.tsx's KIND VOCABULARY comment / this exact
  // 'gaps' producer (both name `onside.feed` as its target) and
  // `HomePanels.tsx`'s own established, test-pinned convention (its
  // `buildQueueBucket` rows and "All open items →" link) that targets
  // `onside.documents` instead for the same base "gaps" concept —
  // `investment-design.test.tsx` also already pins the current dispatch
  // (`{ screen: 'onside.feed', kind: 'section', id: 'gaps' }`) as correct
  // base-anchor behavior, so silently redirecting it to onside.documents
  // here would contradict a passing, pinned test. Picking a side is a
  // design decision, not an implementation one — flagged for the design
  // authority rather than resolved here. An id this effect does not
  // recognize (including 'gaps') still consumes the nonce (never gets
  // stuck) but opens nothing — the same defensive "no fabricated
  // destination" shape the 'feed-source'/'signal' effects above already
  // use for an unresolvable id.
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'section') return;
    if (deepLink.id === 'lifecycle') {
      handleOpenLifecycle();
    }
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

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
      setSelection({ kind: 'signal', row });
      setDrawerOpen(true);
    },
  };

  // Fix wave (ONSIDE-08) — base openInstr port (source 2932–2949): the
  // three parity views fire this with an INSTR key; the entry renders as
  // the shared Drawer's third selection branch. Guarded on INSTR[key]
  // exactly as base instrLink/openInstr are (source 2306, 2933).
  const handleOpenInstrument = (instrumentKey: string) => {
    const instrument = INSTR[instrumentKey];
    if (!instrument) return;
    setSelection({ kind: 'instrument', instrumentKey, instrument });
    setDrawerOpen(true);
  };

  /** §2.9.5 entry affordance — "Ask OnSide" utility-corner trigger. Always
   * opens (or content-swaps, §2.9.1 item 2) at the fresh idle state. */
  const handleOpenChat = () => {
    setChatOpenNonce((n) => n + 1);
    setSelection({ kind: 'chat' });
    setDrawerOpen(true);
  };

  // Signal branch below is behavior-identical to pre-W1 (same title format,
  // same five fields, same badge Tag); the instrument branch is additive.
  // The former source/feed-source branches (W1/SEAM 2) retired with the
  // Sources & connectors relocation — see file header.
  const drawerTitle =
    selection === null
      ? 'Signal'
      : selection.kind === 'signal'
        ? `Signal — ${selection.row.source}`
        : selection.kind === 'chat'
          ? ONSIDE_CHAT_MODULE_CONFIG.drawerTitle
          : normalizeAmp(selection.instrument.n);

  const drawerFields: DrawerContentField[] =
    selection === null
      ? []
      : selection.kind === 'signal'
        ? [
            { label: 'Source', value: selection.row.source },
            { label: 'Regulatory layer', value: LAYER_LABEL_BY_KEY.get(selection.row.layer) ?? selection.row.layer },
            { label: 'Date', value: selection.row.date },
            { label: 'Signal', value: selection.row.title },
            { label: 'Note', value: selection.row.note },
          ]
        : selection.kind === 'chat'
          ? [] // AskChatPanel owns its own body content — DrawerContent renders nothing for this branch (see the Drawer body below).
          : [
              // Base openInstr detail fields, source 2937–2947.
              { label: 'Kind', value: normalizeAmp(selection.instrument.kind) },
              { label: 'Issuer', value: normalizeAmp(selection.instrument.issuer) },
              { label: 'Effective', value: normalizeAmp(selection.instrument.eff) },
              { label: 'Source', value: normalizeAmp(selection.instrument.src) },
              // Verbatim base review line (source 2944).
              { label: 'Review', value: 'Nothing read from this instrument becomes authoritative before a qualified human approves it' },
              { label: 'Summary', value: normalizeAmp(selection.instrument.sum) },
            ];

  // B-dead-interactions-07 — "Domains this instrument drives" un-flattened
  // from a joined string into real deep-link action Buttons (see file
  // header note). Only rendered when a consumer wired `onDeepLink` — never
  // a dead click if one hasn't.
  const drawerActions: DrawerContentAction[] =
    selection !== null && selection.kind === 'instrument' && onDeepLink
      ? selection.instrument.doms.map((domKey) => ({
          label: `${DOMAINS.find((d) => d.key === domKey)?.name ?? domKey} →`,
          variant: 'ghost' as const,
          onPress: () => onDeepLink({ screen: 'onside.overview', kind: 'domain', id: domKey }),
        }))
      : [];

  const drawerTags: DrawerContentTag[] =
    selection === null
      ? []
      : selection.kind === 'signal'
        ? selection.row.badge
          ? [{ text: selection.row.badge, variant: 'count' }]
          : []
        : selection.kind === 'chat'
          ? []
          : [{ text: 'Regulatory instrument', variant: 'count' }];

  return (
    <>
      <main id="onside-feed-main" style={MAIN_STYLE} aria-labelledby="onside-feed-title">
          <div style={HEADER_ROW_STYLE}>
            <h1 id="onside-feed-title" style={TITLE_STYLE}>
              Regulatory feed
            </h1>
            {/* §5.8 entry affordance (amendment A16, PI2-D42) — uniform
                across all four onside.* screens. */}
            <Button variant="secondary" label={ONSIDE_CHAT_MODULE_CONFIG.entryLabel} onPress={handleOpenChat} />
          </div>
          <FilterBar groups={filterGroups} />
          <div style={SCROLL_WRAP_STYLE}>
            <DataTable
              caption="Regulatory signals feed"
              columns={COLUMNS}
              rows={filteredRows}
              getRowId={(row) => row.id}
              rowAction={rowAction}
              defaultSortColumnId="date"
              defaultSortDirection="descending"
              emptyMessage="No signals match the selected filters."
            />
          </div>
          {/* L3 UPDATE (see file header) — Sources & connectors (former
              slot "1" of this 1→2→3 order) relocated to Settings; lifecycle
              and in-force keep their below-the-fold order, one slot earlier. */}
          <div ref={lifecycleSectionRef} tabIndex={-1} data-lf-section="lifecycle">
            <RegulatoryFeedLifecycle onOpenInstrument={handleOpenInstrument} onOpenSources={handleOpenSources} />
          </div>
          <RegulatoryFeedInforce onOpenInstrument={handleOpenInstrument} />
      </main>
      <Drawer open={drawerOpen} title={drawerTitle} onClose={handleDrawerClose}>
        {selection !== null && selection.kind === 'chat' ? (
          // §2.9.1 item 2 — one more content state of this SAME Drawer;
          // AskChatPanel owns its own body, no DrawerContent involved.
          // `key={chatOpenNonce}` forces a fresh mount (fresh greeting +
          // Chips) on every "Ask OnSide" press (§2.9.5 fresh-open reseed).
          <AskChatPanel key={chatOpenNonce} config={ONSIDE_CHAT_MODULE_CONFIG} {...(onDeepLink ? { onDeepLinkPress: onDeepLink } : {})} />
        ) : (
          <DrawerContent kind="signal" fields={drawerFields} tags={drawerTags} actions={drawerActions} />
        )}
      </Drawer>
    </>
  );
}
