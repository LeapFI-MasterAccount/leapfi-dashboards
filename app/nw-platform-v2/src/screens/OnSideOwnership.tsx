/**
 * OnSideOwnership — new screen under the already-reserved `onside.ownership`
 * Sidebar leaf (`Sidebar.tsx` `NAV`, unmodified here; `App.tsx` `SCREEN_IDS`/
 * `SCREEN_LABEL`, unmodified here — see STOP-item below on the routing
 * case). Batch 3 of parity_ia_addendum.md §6 ("OnSide · Ownership (RACI +
 * Onboarding)"), base anchors osRaci (leapfi-platform.html 3498–3573) and
 * osOnboarding (3648–3663).
 *
 * Region map (per dispatch TASK line): Topbar → page title → RACI matrix
 * (DataTable C6, grouped by domain per `M`, rows = governance documents,
 * columns = the 8 named roles from `ROLES`, cells state
 * Responsible/Accountable/Consulted/Informed as plain text) → role legend →
 * each document row opens the app's existing shared Drawer (C7) +
 * DrawerContent (C8) for its own doc detail → below that, an in-page "How
 * onboarding works" section: 5 numbered SetupCard (C15, `locked` variant —
 * informational, non-interactive) steps, 3 StatCard (C1) checkmarks (Hours
 * back / Exam-ready / One answer), and a closing "Two engines, one
 * platform" Label (P3) block. Satisfies design_system_spec.md §3.1's
 * disposition that Onboarding is "not a separate nested sidebar entry —
 * reachable via in-screen links only" (no 5th OnSide child added; this
 * screen already exists at the reserved `onside.ownership` leaf).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: this screen never called it directly (every internal
 * action here is a Drawer open/close), so that plumbing was dead the
 * moment its only consumer (the local `sidebarProps` construction) was
 * removed.
 *
 * STOP-ITEM RESOLVED — App.tsx routing (stale claim corrected by the
 * fix-wave gate dispatch, RPT-10 class; an earlier revision of this
 * header still reported the case as "not wired" pending an App-owning
 * follow-up): `App.tsx` routes `case 'onside.ownership'` to this screen
 * (parity-assembly wave), exactly per the two-line recipe this header
 * originally specified. The `OutOfScopeScreen` fallback this paragraph
 * once referenced no longer exists at all — every ScreenId now routes to
 * a real screen (see App.tsx's "EVERY SIDEBAR DESTINATION ROUTES TO A
 * REAL SCREEN" header section, SH-4/RAIL-06).
 *
 * STOP-ITEM / DEVIATION — onboarding data ported locally, not into a shared
 * data module: parity_ia_addendum.md §2 item 1 recommends porting the
 * 5-step array + two paragraphs of osOnboarding copy into `data/onside.ts`
 * or a new `data/onboarding.ts`. Both are outside this dispatch's ALLOWLIST
 * (single file, this screen only), and neither existed yet in this
 * worktree at dispatch time (`data/onside.ts` ports only ROLES/M from the
 * osRaci range, per that file's own header — the osOnboarding range was not
 * ported by any prior dispatch). Rather than leave the "How onboarding
 * works" section unbuilt over a data-file-location technicality, the exact
 * same trivial literal values (verbatim from source 3649–3663, no business
 * logic, same as every other ported dataset in this codebase) are declared
 * as module-scope constants below (`ONBOARDING_STEPS`, `ONBOARDING_STATS`,
 * etc.). If a shared `data/onboarding.ts` is later created, these constants
 * are a direct cut/paste move with no shape changes needed.
 *
 * AMBIGUITY RESOLVED — Drawer single-instance scoping: same reasoning
 * `OnSideDocuments.tsx` already documents and App.tsx's own header now
 * confirms is satisfied ("routed one-at-a-time... none of the 7 screens has
 * cross-screen drawer content that would justify lifting ownership up to
 * [App.tsx]"). This screen mounts its own local `<Drawer>` — the existing
 * shared Drawer/DrawerContent *components*, not a new composite — which is
 * the established, already-approved pattern for exactly this single-
 * screen-mounted-at-a-time SPA shape. Reading the brief's "reuse the
 * already-built Drawer/DrawerContent, never a new instance" as "never a
 * second *simultaneously open* Drawer instance" (the C7 a11y baseline's
 * actual constraint), not as "never mount a `<Drawer>` element in this
 * file" — the latter reading would make the requirement impossible to
 * satisfy from a single-screen-file allowlist at all, since some component
 * in this file has to render the Drawer JSX for the row-open interaction
 * to exist.
 *
 * FIX WAVE (RACI DENSITY REGRESSION) — this screen now renders v1's exact
 * shape, ONE table: the earlier revision of this header documented
 * DataTable (C6) as having "no spanning group-row primitive" and worked
 * around that gap by rendering one `<h3>` + one `DataTable` per `M` domain
 * — 8 separate tables, each re-declaring the full 8-role header row, each
 * sizing its own columns independently so the same role column landed at
 * a different x-position in every block (you could not scan one role
 * DOWN the page — the entire reason a RACI matrix exists). That was a
 * measurable regression from the base engine's `osRaci()` (leapfi-
 * platform.html 3498–3573), which renders ONE `<table class="raci">` with
 * `<tr class="dgroup">` domain-divider rows spanning all columns (source
 * 3552, 3562) inside it. Per D24 (reuse over invention; retire drift),
 * the fix is not an Ownership-specific special case: `DataTable.tsx` gains
 * a general `grouping` (`key`/`renderHeader`) capability (its own file header,
 * "GROUP-ROW CAPABILITY") — this screen is that capability's first call
 * site, not a fork of DataTable. `RACI_ROWS` below flattens `M` into one
 * ordered row list (still M's authored domain order, still each domain's
 * authored document order) with a `domainKey` carried per row so a single
 * `DataTable` can group by it; every role column is now declared exactly
 * once and aligns for the full page. Sorting the document column (still
 * user-sortable, ONSIDE-10 below) reorders rows WITHIN a domain only —
 * DataTable's own group-aware sort — never across domains.
 *
 * Domain group-row label deep-links (v1 parity, source 3552's
 * `onsideShow('dom-'+g[0])`): renders via this screen's own established
 * `DeepLinkScreenProps`/`onDeepLink` contract (App.tsx "NAVIGATION-WITH-
 * PAYLOAD / DEEP LINKS"; identical `{ screen: 'onside.overview', kind:
 * 'domain', id: domainKey }` shape `Reporting.tsx`'s `handleOpenDomain`
 * and `StudioAsk.tsx` already use) — lands on OnSide · Overview with that
 * domain's card expanded and scrolled into view, i.e. its gaps and
 * levers, matching the base's own `dom-` destination. This screen did not
 * previously declare `DeepLinkScreenProps` even though App.tsx's routing
 * switch already spread `deepLinkProps` onto it (dead/unused props);
 * `OnSideOwnershipProps` now extends it so `onDeepLink` is actually read.
 *
 * RACI cells as R/A/C/I badges (v1 parity, source 3558's `raci-badge
 * raci-R` etc.; supersedes an earlier revision of this header that
 * rendered full words citing `Tag`'s "never the sole carrier of meaning"
 * baseline): that baseline is satisfied here without spelling every word
 * out four times per row — each badge is `role="img"` with `aria-label`
 * carrying the full word ("Responsible" etc.) as its ONLY accessible
 * name (the visible letter is not also read; this is the same name-
 * replaces-content technique `Icon.tsx`'s own labelled/`role="img"` mode
 * already uses, D24 reuse), so sighted users scan a compact letter and
 * assistive tech gets the complete word — meaning is carried by text
 * (the accessible name), never color alone. See "THEME-SAFE BADGE
 * COLORS" below for why each badge's token pairing was chosen. Empty
 * cells render v1's quiet middot ("·", source 3558's `&middot;`), not a
 * heavy em-dash — muted `--ink3`, `aria-hidden` (nothing to announce; a
 * screen-reader user already gets silence — no R/A/C/I badge — for that
 * role, which is itself the "no assignment" signal, same as v1's own
 * middot carrying no semantic markup either).
 *
 * THEME-SAFE BADGE COLORS (D13 dual-theme, brand_doctrine 4.5:1 AA
 * floor) — v1's badge colors are hard-coded rgba tuned for its dark-only
 * page (CSS `.raci-R`/`.raci-A`/`.raci-C`/`.raci-I`, leapfi-platform.html
 * ~155–158) and are NOT reused verbatim: this screen's main content is
 * theme-aware (D13/D21 — only the shell chrome is dark-locked), so a
 * badge's text color must clear 4.5:1 against its own background in BOTH
 * themes. Of tokens.css's roles, only three actually swap value per
 * theme AND independently clear 4.5:1 on `--panel` in both themes:
 * `--accent` (13.16:1 dark / 5.57:1 light), `--chart-axis` (5.33:1 dark /
 * 4.97:1 light), `--ink3` (4.98:1 dark / 6.87:1 light) — used for R, C,
 * I respectively. `--accent2` (Cobalt, v1's "A" hue) does NOT swap
 * between themes (`#2d5bff` both) and measures only 3.52:1 on dark
 * `--panel` — below the 4.5:1 floor — so it is NOT used as badge TEXT.
 * Per this dispatch's own fallback instruction ("propose the nearest
 * compliant token rather than shipping a failing colour"), "A" instead
 * uses `--ink` (the app's own primary-text pairing, 18.24:1 dark /
 * 14.39:1 light on `--panel` — the largest margin of the four) for text,
 * with `--accent2` kept only as a decorative border (no text-contrast
 * requirement applies to a border; it still clears the lower 3:1 non-
 * text-UI floor in both themes: 3.52:1 dark / 4.73:1 light) so the "A"
 * badge still carries a distinct, v1-adjacent blue identity without
 * shipping failing text. All eight ratios (hex inputs, both themes) are
 * reported in this dispatch's return, not just asserted here.
 *
 * Adjacent fix, same file, same section: the existing 8-role legend
 * below (`ROLE_LEGEND_STYLE`, pre-dating this dispatch) rendered its
 * labels via `<Label variant="body-secondary">`, which is `--ink2` —
 * tokens.css's OWN comment bans `--ink2` on `--panel` ("never on
 * --panel" / light: "FAILS AA (4.34:1) on --panel... use --chart-axis
 * ... instead for panel-seated labels") and `ROLE_LEGEND_STYLE` paints
 * `--panel` as its background, so that pre-existing pairing was already
 * failing AA in light mode. Fixed in place here (same file, same RACI
 * section, the token file's own prescribed substitute) rather than left
 * inconsistent next to the new legend below it, which uses the same
 * `--chart-axis` token from the start.
 *
 * "Domain owners" sub-table intentionally omitted: the base engine's
 * `osRaci()` also renders a second "Domain owners" table from a local,
 * unnamed `domOwners` literal (source 3565–3566) — outside the ROLES/3499–
 * 3549 range `data/onside.ts`'s own header says was actually ported, and
 * not named in parity_ia_addendum.md §6 Batch 3's "Data modules" line
 * (`ROLES, M` only) or its own region-map prose. Left out rather than
 * silently re-deriving a second, unported literal table.
 *
 * SetupCard `locked` variant for onboarding steps (dispatch TASK line:
 * "informational/non-interactive use"): `SetupCard.tsx`'s only non-
 * interactive variant is `locked`, which renders a trailing `lock` glyph
 * (a status marker per that component's own header, substituted for the
 * `interactive` variant's chevron specifically so a non-clickable card
 * never implies a hidden action). There is no third "plain informational,
 * no icon" SetupCard variant in this component today. Using `locked` here
 * is the only way to satisfy "non-interactive" with this composite as
 * built, but it does mean each onboarding step visually carries a lock
 * glyph that has nothing to do with access being restricted — flagging for
 * design-authority review rather than inventing a new SetupCard variant
 * outside this dispatch's allowlist.
 *
 * No Drawer footer / no Adopt-Reject actions on this screen: per
 * parity_ia_addendum.md §4's action-hierarchy audit, "OnSide → Ownership:
 * no screen-level primary CTA (reference content)". This screen's Drawer
 * is read-only detail — `Drawer.tsx`'s own `footer` prop doc says to
 * "Omit for drawers with no footer actions (e.g. read-only detail views)",
 * which is exactly this case. A document's pending redline (if any) is
 * still shown via `RedlineDiffView` for informational completeness (the
 * base engine's `docLink` click opens the identical doc detail from this
 * view as from Documents), just with no `adoptSlot`/`rejectSlot` wired —
 * this screen owns no adoption state. FIX WAVE: adoption truth now lives
 * in the shared data layer (`OnSideDocuments.tsx` mutates the `DOCLIB`
 * doc's status/version/rlState on adopt and routes the cascade through
 * `state/demoStore.ts`'s `applyGapClosure`), so this screen simply reads
 * the live `DOCLIB` singleton per render and subscribes via
 * `useDemoStore()` — the earlier cross-screen-state STOP-item recorded
 * here is resolved by that store, not by duplicating state locally.
 *
 * HTML entity/inline-tag decoding: `decodeText` below is a straight,
 * intentional duplicate of `OnSideDocuments.tsx`'s own `decodeDocText` —
 * both `doclib.ts` doc text and the osOnboarding copy ported into this file
 * use the same small ported-HTML vocabulary (`&amp;`, `&rsquo;`, `<b>`,
 * etc.), and this dispatch's allowlist has no shared-utils file to host one
 * copy in (same reasoning `RedlineDiffView.tsx`'s own header already gives
 * for its local word-diff implementation).
 *
 * Accessibility gate (persona directive 7): RACI and onboarding sections
 * are real `<table>`/`<h2>`/`<h3>`/`<ol>` semantics (`DataTable` C6's own
 * `<table>`/`<caption>`/`scope="col"` baseline, an `<ol>` for the 5
 * *numbered* steps per the TASK line, native list semantics conveying
 * order to assistive tech without relying on the visible "01" text alone).
 * `Drawer` (C7, unmodified) supplies focus trap/initial-focus/restore-on-
 * close; `RedlineDiffView` (C9, unmodified) keeps its own non-color-only
 * insert/delete markers. No live-region is added on this screen: nothing
 * here mutates row-by-row status the way `OnSideDocuments.tsx`'s cascade
 * does (this screen writes no state that changes RACI/document data), so
 * there is no async status change to announce.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed).
 *
 * FIX WAVE (ONSIDE-10) — RACI tables render in the base's AUTHORED `M`
 * order (policy first, evidence, drafts last — base osRaci 3552-3562
 * renders `g[2]` with no sorting), not alphabetically: the previous
 * `defaultSortColumnId="doc"` re-ordered every domain group by title on
 * mount, drifting from the base's deliberate ordering. The document
 * column stays user-sortable; only the default is the authored order.
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently.
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { DocumentBody } from '../components/DocumentBody';
import { SetupCard } from '../components/SetupCard';
import { StatCard } from '../components/StatCard';
import { Icon } from '../components/primitives/Icon';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant, RaciMark } from '../components/primitives/Tag';
import { Button } from '../components/primitives/Button';
import { AskChatPanel } from '../components/AskChatPanel';
import type { DeepLinkScreenProps } from '../App';
import { ROLES, M } from '../data/onside';
import type { DocRaci } from '../data/onside';
import { DOCLIB } from '../data/doclib';
import type { DocEntry, DocStatus } from '../data/doclib';
import { useDemoStore } from '../state/demoStore';
import { PANEL_STYLE } from '../theme/panelStyle';
import { ONSIDE_CHAT_MODULE_CONFIG } from '../data/askChatModuleConfig';

type DisplayDoc = DocEntry & { id: string };

/* ============ HTML entity/inline-tag decoding — see file header ============ */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&quot;': '"',
  '&#39;': '’',
  '&nbsp;': ' ',
};

function decodeText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => HTML_ENTITY_MAP[match] ?? match);
}

/* ============ onboarding data — verbatim literal port, osOnboarding, ============ */
/* ============ leapfi-platform.html 3648-3663 — see file header STOP-item ============ */

const ONBOARDING_HEADING = 'How onboarding works · five steps to automated monitoring';

type OnboardingStep = readonly [num: string, title: string, description: string];

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  [
    '01',
    'Share your current state',
    'Policies, procedures, and supporting evidence in whatever shape they are already in: Word files, PDFs, scans, spreadsheets, board minutes. We connect to your repository (SharePoint, GRC) or store a copy securely.',
  ],
  [
    '02',
    'Build a baseline',
    'One clear picture of governance readiness, measured against financial-services risk standards, and the targets you set for each domain.',
  ],
  [
    '03',
    'We monitor regulators',
    'Federal guidance, state law, local ordinances, the applicable risk frameworks, and your own documents. Monitored separately, because obligations stack.',
  ],
  [
    '04',
    'Early alerts &amp; suggestions',
    'The moment a change is sensed on any layer, the entire document set is checked. You see what moved, which layer it came from, and what requires updating.',
  ],
  [
    '05',
    'We propose, you approve',
    'Every gap arrives with proposed language to close it. The LeapFI risk team reviews first, suggestions are pushed electronically, and nothing changes until you approve.',
  ],
] as const;

interface OnboardingStat {
  label: string;
  sub: string;
}

const ONBOARDING_STATS: readonly OnboardingStat[] = [
  {
    label: 'Hours back',
    sub: 'the reading, cross-referencing, and hunting stops being a job a person performs; what remains is judgement',
  },
  {
    label: 'Exam-ready',
    sub: 'documentation current in near real time. Nobody assembles history from email threads before an exam',
  },
  {
    label: 'One answer',
    sub: 'a single current view of where the institution stands, in language a board can act on',
  },
] as const;

const TWO_ENGINES_HEADING = 'Two engines, one platform';

/* ============ RACI derived lookups ============ */

const DOMAIN_LABEL_BY_KEY: Record<string, string> = Object.fromEntries(M.map(([key, label]) => [key, label]));

const ROLE_DESCRIPTOR: Record<string, string> = Object.fromEntries(ROLES.map(([code, title, name]) => [code, `${title} (${name})`]));

const RACI_BY_DOC_ID: Record<string, DocRaci> = Object.fromEntries(M.flatMap(([, , docs]) => docs.map((doc) => [doc[0], doc] as const)));

const RACI_WORD: Record<RaciMark, string> = {
  A: 'Accountable',
  R: 'Responsible',
  C: 'Consulted',
  I: 'Informed',
};

function raciMarkFor(doc: DocRaci, roleCode: string): RaciMark | null {
  const [, accountable, responsible, consulted, informed] = doc;
  if (accountable === roleCode) return 'A';
  if (responsible === roleCode) return 'R';
  if (consulted.includes(roleCode)) return 'C';
  if (informed.includes(roleCode)) return 'I';
  return null;
}

/* ============ RACI badges ============ */
/* Relocated into Tag.tsx as the P4 `raci-mark` variant (design_system_
 * spec.md §2.5, delta §8 R-4(c)) — this screen is that variant's first
 * and only call site (both usages below). The `role="img"` +
 * `accessibleText` mechanism and the theme-safe per-mark colors (the
 * former `RaciBadge`/`RACI_BADGE_TEXT`/`RACI_BADGE_BORDER` that used to
 * live here) now live in `Tag.tsx`'s own header, unchanged — see that
 * file for "THEME-SAFE MARK COLORS", including the "A" pairing HELD at
 * §10 OQ-6. */

/** v1's quiet middot for "no assignment" (source 3558 `&middot;`) — see
 * file header. `aria-hidden`: absence of a badge already is the signal. */
function RaciEmptyCell() {
  return (
    <span aria-hidden="true" style={{ color: 'var(--ink3)' }}>
      ·
    </span>
  );
}

const RACI_LEGEND_ITEMS: readonly { mark: RaciMark; description: string }[] = [
  { mark: 'R', description: 'does the work' },
  { mark: 'A', description: 'owns the outcome' },
  { mark: 'C', description: 'input before decisions' },
  { mark: 'I', description: 'kept current' },
];

/** One row per governance document, carrying its domain key — the flat
 * shape `DataTable`'s new `grouping` (`key`/`renderHeader`) capability
 * groups by (file header "FIX WAVE (RACI DENSITY REGRESSION)"). Order is
 * `M`'s own authored order, domain-major then document-minor — identical
 * traversal order to the pre-fix per-domain tables, just one array now. */
interface RaciRow {
  domainKey: string;
  doc: DocRaci;
}

const RACI_ROWS: RaciRow[] = M.flatMap(([domainKey, , docs]) => docs.map((doc) => ({ domainKey, doc })));

const RACI_COLUMNS: DataTableColumn<RaciRow>[] = [
  {
    id: 'doc',
    header: 'Governance document',
    sortable: true,
    sortValue: (row) => decodeText(DOCLIB[row.doc[0]]?.t ?? row.doc[0]),
    render: (row) => <span>{decodeText(DOCLIB[row.doc[0]]?.t ?? row.doc[0])}</span>,
  },
  ...ROLES.map(
    ([code]): DataTableColumn<RaciRow> => ({
      id: code,
      header: code,
      render: (row) => {
        const mark = raciMarkFor(row.doc, code);
        return mark ? <Tag variant="raci-mark" text={mark} accessibleText={RACI_WORD[mark]} /> : <RaciEmptyCell />;
      },
    }),
  ),
];

const GROUP_LINK_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  font: 'inherit',
  fontSize: 'inherit',
  fontWeight: 700,
  color: 'var(--accent)',
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
};

const STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
};

const STATUS_TAG_VARIANT: Record<DocStatus, NonRaciTagVariant> = {
  good: 'status-positive',
  warn: 'status-caution',
  crit: 'status-alert',
};

/* ============ layout constants — see file header ============ */

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
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
/** §5.8 region map addition (amendment A16, PI2-D42) — utility corner
 * (§5.1's originally-named placement), seated beside the page title. */
const HEADER_ROW_STYLE: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const DOMAIN_HEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
/** Shared by the R/A/C/I mark legend and the 8-role legend below it — both
 * are "legend on a panel" boxes, kept visually paired. Label text in both
 * uses `--chart-axis`, not `--ink2` — see file header "Adjacent fix". */
export const ROLE_LEGEND_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '0.5rem',
  padding: '0.875rem 1rem',
  ...PANEL_STYLE,
};
export const RACI_MARK_LEGEND_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  padding: '0.875rem 1rem',
  ...PANEL_STYLE,
};
const RACI_MARK_LEGEND_ITEM_STYLE: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
const LEGEND_TEXT_STYLE: CSSProperties = { fontSize: '0.875rem', fontWeight: 500, color: 'var(--chart-axis)' };
const STEP_LIST_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' };
const STEP_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220 };
const STAT_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem' };
const STAT_ITEM_STYLE: CSSProperties = { flex: '1 1 220px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '0.5rem' };
export const TWO_ENGINES_CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1.1rem 1.25rem',
  ...PANEL_STYLE,
};

/** No screen-specific members beyond deep-link — `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount moved to App.tsx's Shell (see file header); this screen never called `onNavigate` directly, only fed it to the Sidebar it no longer renders. */
export type OnSideOwnershipProps = DeepLinkScreenProps;

export function OnSideOwnership({ onDeepLink }: OnSideOwnershipProps) {
  // Re-renders on demo-store writes so live DOCLIB reads (doc status /
  // version after an adopt on OnSideDocuments) stay current — see the
  // file-header adoption-state note.
  useDemoStore();
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const lastOpenDocRef = useRef<DisplayDoc | null>(null);
  // §2.9 — the "Ask OnSide" chat as a second, mutually-exclusive content
  // target on this SAME shared Drawer (never a second instance). Bumping
  // `chatOpenNonce` forces AskChatPanel to remount fresh on every open
  // (§2.9.5 fresh-open reseed, AC-A16-8).
  const [chatOpen, setChatOpen] = useState(false);
  const [chatOpenNonce, setChatOpenNonce] = useState(0);

  const openDoc: DisplayDoc | null = openDocId && DOCLIB[openDocId] ? { id: openDocId, ...DOCLIB[openDocId] } : null;
  if (openDoc) lastOpenDocRef.current = openDoc;
  // Keeps Drawer's title/body populated with the last real doc through its
  // ~200ms closing animation instead of blanking the instant openDocId is
  // cleared — same technique OnSideDocuments.tsx uses, see its own header.
  const displayDoc = openDoc ?? lastOpenDocRef.current;

  // Whole-row click affordance, not a `rowAction` "Open" column — v1 has
  // no such column (the document name IS the control, source 3556's
  // `docLink`); see file header "The redundant 'Open' column" in the
  // dispatch return, and DataTable.tsx's own CLICK-AFFORDANCE STANDARD
  // for the chevron/hover/focus treatment this reuses unmodified.
  const handleOpenRaciRow = (row: RaciRow) => {
    setChatOpen(false);
    setOpenDocId(row.doc[0]);
  };

  /** §2.9.5 entry affordance — "Ask OnSide" utility-corner trigger. */
  const handleOpenChat = () => {
    setOpenDocId(null);
    setChatOpenNonce((n) => n + 1);
    setChatOpen(true);
  };

  const raciRow = displayDoc ? RACI_BY_DOC_ID[displayDoc.id] : undefined;

  // Screen-owned metadata rows only — the document's own full `secs` text
  // is appended by the shared `DocumentBody` (design_system_spec.md
  // §2.11/A18 export side; see that component's own file header), same
  // change as `OnSideDocuments.tsx`'s identical `drawerFields`.
  const drawerFields: DrawerContentField[] = displayDoc
    ? [
        { label: 'Domain', value: DOMAIN_LABEL_BY_KEY[displayDoc.dom] ?? displayDoc.dom },
        { label: 'Version', value: displayDoc.v },
        { label: 'Type', value: displayDoc.type },
        { label: 'Owner', value: decodeText(displayDoc.owner) },
        { label: 'Summary', value: decodeText(displayDoc.line) },
        ...(raciRow ? [{ label: 'Accountable', value: ROLE_DESCRIPTOR[raciRow[1]] ?? raciRow[1] }] : []),
        ...(raciRow ? [{ label: 'Responsible', value: ROLE_DESCRIPTOR[raciRow[2]] ?? raciRow[2] }] : []),
        ...(raciRow && raciRow[3].length > 0
          ? [{ label: 'Consulted', value: raciRow[3].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(raciRow && raciRow[4].length > 0
          ? [{ label: 'Informed', value: raciRow[4].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(displayDoc.obl.length > 0 ? [{ label: 'Obligations evidenced', value: displayDoc.obl.join(', ') }] : []),
      ]
    : [];

  const drawerTags: DrawerContentTag[] = displayDoc ? [{ text: STATUS_LABEL[displayDoc.status], variant: STATUS_TAG_VARIANT[displayDoc.status] }] : [];

  return (
    <>
      <main id="onside-ownership-main" style={MAIN_STYLE} aria-labelledby="onside-ownership-title">
          <div style={HEADER_ROW_STYLE}>
            <h1 id="onside-ownership-title" style={TITLE_STYLE}>
              OnSide · Ownership
            </h1>
            {/* §5.8 entry affordance (amendment A16, PI2-D42) — uniform
                across all four onside.* screens. */}
            <Button variant="ghost" label={ONSIDE_CHAT_MODULE_CONFIG.entryLabel} onPress={handleOpenChat} />
          </div>

          <section aria-labelledby="onside-raci-heading" style={SECTION_STYLE}>
            <h2 id="onside-raci-heading" style={SUBHEADING_STYLE}>
              RACI · policy ownership matrix
            </h2>

            <div style={SCROLL_WRAP_STYLE}>
              <DataTable
                caption="RACI · policy ownership matrix"
                columns={RACI_COLUMNS}
                rows={RACI_ROWS}
                getRowId={(row) => `${row.domainKey}:${row.doc[0]}`}
                onRowClick={handleOpenRaciRow}
                emptyMessage="No governance documents mapped."
                grouping={{
                  key: (row) => row.domainKey,
                  renderHeader: (domainKey) => (
                    <button
                      type="button"
                      onClick={() => onDeepLink?.({ screen: 'onside.overview', kind: 'domain', id: domainKey })}
                      style={GROUP_LINK_STYLE}
                    >
                      {DOMAIN_LABEL_BY_KEY[domainKey] ?? domainKey}
                      <Icon name="arrow-right" size={16} tone="interactive" />
                    </button>
                  ),
                }}
              />
            </div>

            <div style={RACI_MARK_LEGEND_STYLE}>
              {RACI_LEGEND_ITEMS.map(({ mark, description }) => (
                <span key={mark} style={RACI_MARK_LEGEND_ITEM_STYLE}>
                  <Tag variant="raci-mark" text={mark} accessibleText={RACI_WORD[mark]} />
                  <span style={LEGEND_TEXT_STYLE}>
                    {RACI_WORD[mark]} · {description}
                  </span>
                </span>
              ))}
            </div>

            <div style={ROLE_LEGEND_STYLE}>
              {ROLES.map(([code, title, name]) => (
                <span key={code} style={LEGEND_TEXT_STYLE}>
                  {code} · {title} ({name})
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="onside-onboarding-heading" style={SECTION_STYLE}>
            <h2 id="onside-onboarding-heading" style={SUBHEADING_STYLE}>
              {ONBOARDING_HEADING}
            </h2>

            <ol style={STEP_LIST_STYLE}>
              {ONBOARDING_STEPS.map(([num, title]) => (
                <li key={num} style={STEP_ITEM_STYLE}>
                  <SetupCard title={`${num} · ${decodeText(title)}`} variant="locked" />
                </li>
              ))}
            </ol>

            <div style={STAT_ROW_STYLE}>
              {ONBOARDING_STATS.map((stat) => (
                <div key={stat.label} style={STAT_ITEM_STYLE}>
                  <StatCard label={stat.label} value="✓" />
                </div>
              ))}
            </div>

            <div style={TWO_ENGINES_CARD_STYLE}>
              <h3 style={DOMAIN_HEADING_STYLE}>{TWO_ENGINES_HEADING}</h3>
            </div>
          </section>
      </main>

      <Drawer
        open={openDocId !== null || chatOpen}
        title={chatOpen ? ONSIDE_CHAT_MODULE_CONFIG.drawerTitle : displayDoc ? decodeText(displayDoc.t) : ''}
        onClose={() => {
          setOpenDocId(null);
          setChatOpen(false);
        }}
      >
        {chatOpen ? (
          // §2.9.1 item 2 — one more content state of this SAME Drawer.
          <AskChatPanel key={chatOpenNonce} config={ONSIDE_CHAT_MODULE_CONFIG} {...(onDeepLink ? { onDeepLinkPress: onDeepLink } : {})} />
        ) : displayDoc ? (
          <DocumentBody docId={displayDoc.id} metadataFields={drawerFields} tags={drawerTags} decodeText={decodeText} />
        ) : null}
      </Drawer>
    </>
  );
}
