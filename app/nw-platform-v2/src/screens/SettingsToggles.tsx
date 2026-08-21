/**
 * SettingsToggles — parity_ia_addendum.md §1.4 "Settings" row 1
 * ("Identity & access + Notifications toggles + Approval matrix card"),
 * dispatched as Batch 6. Not one of the 7 script screens
 * (design_system_spec.md §9: "Settings toggles / About (1032–1140) — Switch
 * (P8), Label (P3) — no new composite; not one of the 7 screens, minimal
 * coverage per scope").
 *
 * Base engine anchors ported: settings toggles/cards markup
 * leapfi-platform.html 1032–1140 (Identity & access rows 44–47,
 * Notifications rows 51–54); approval matrix `renderApprovalSettings()`
 * 3968–3983.
 *
 * L3 UPDATE (PI-3, D6/call-07/call-08, sprint-plan.md Sprint 2 L3;
 * DECISIONS.md D6 "Settings consolidation IA: stays one flat screen") — TWO
 * MORE STACKED CARD SECTIONS, no new nested Sidebar children:
 *
 * 1. "Sources & connectors" (call-07) — `RegulatoryFeedSources.tsx`
 *    (unmodified; that file's own header documents its screen-agnostic
 *    `onOpenSource`/`onOpenInstrument` seam) mounted directly, exactly as
 *    `OnSideFeed.tsx` used to. Its Digest & Alerts panel moves with it —
 *    this is the SAME panel L7 (call-12, D7) extends later; L7 must not
 *    build a second, independent digest UI (D7, sprint-plan.md L3 note).
 *    This screen owns the Drawer that `onOpenSource`/`onOpenInstrument`
 *    open into (below) — the identical "own a local `<Drawer>`,
 *    discriminated `selection` union" pattern `OnSideFeed.tsx` used before
 *    L3, now here instead (reuse of an established pattern, not a new one).
 *
 * 2. "RACI · policy ownership matrix" (call-08) — the whole matrix section
 *    (grouped DataTable C6, both legends, whole-row-click document-detail
 *    Drawer) moved verbatim from `OnSideOwnership.tsx` (that file's own
 *    header carries the L3 pointer + the historical implementation notes
 *    this file inherits: group-row/badge/theme-safe-color rationale,
 *    "Domain owners" sub-table omission, `--chart-axis` legend-text fix).
 *    `ROLE_LEGEND_STYLE`/`RACI_MARK_LEGEND_STYLE` are IMPORTED from
 *    `OnSideOwnership.tsx` (reuse, not a second declaration — that file
 *    still exports them for exactly this reuse, and because
 *    `theme/__tests__/panelStyle.test.ts` — out of this lane's ALLOWLIST —
 *    asserts them against that file directly); every other RACI-only
 *    style/data-derivation const below is a small, non-exported duplicate
 *    of what `OnSideOwnership.tsx` used to declare (this lane's ALLOWLIST
 *    has no shared-utils file to host one copy in — the same reasoning
 *    this codebase already uses at every ALLOWLIST-boundary duplication,
 *    e.g. `OnSideFeed.tsx`'s former SEAM 2 note). `decodeText`+
 *    `HTML_ENTITY_MAP` are likewise duplicated verbatim from
 *    `OnSideOwnership.tsx` (RACI document titles/summaries need the same
 *    ported-HTML vocabulary). The RACI table's own document-detail Drawer
 *    reads the live `DOCLIB` singleton via `useDemoStore()` (unchanged
 *    live-adoption-reactivity behavior — see the historical note this
 *    inherits) and shares this screen's OWN Drawer/`selection` union with
 *    the Sources section above (never a second Drawer instance).
 *
 * Both new sections' cross-screen navigation (RACI's domain group-header
 * link; the instrument detail's "Domains this instrument drives" actions)
 * fire this screen's own, now-declared `onDeepLink` prop — STOP-item,
 * flagged not silently worked around: `App.tsx` does not (yet) spread
 * `deepLinkProps` onto `<SettingsToggles />` (that edit is out of this
 * lane's ALLOWLIST), so `onDeepLink` is `undefined` in the live app today
 * and those links no-op (`onDeepLink?.(...)`, the same optional-guard
 * pattern this codebase already uses everywhere a screen may or may not
 * receive it — e.g. `OnSideOwnership.tsx`'s own pre-L3 RACI group header).
 * Closing that gap needs an App.tsx edit (spread `deepLinkProps` onto this
 * screen), out of scope here.
 *
 * Region map: Topbar (shell) → page title → Approval-matrix card (full
 * width, matches source's `#approval-card` sitting above the two-column
 * `.set-grid` — now itself carrying one committee-vote Switch per tier
 * plus the committee-name input, B-15) → Identity & access card +
 * Notifications card (two-column row, 4 Switch (P8) each = 8, matching
 * parity_ia_addendum.md's "Switch (P8) ×8" component budget for THOSE two
 * cards specifically — see the B-15 header note below on why the matrix's
 * own controls are additional, not counted against that figure).
 *
 * SUPERSEDED — Topbar/Sidebar data ownership (amendment A11,
 * design_system_spec.md §3.0): both composites now mount exactly once, in
 * App.tsx's persistent Shell — this screen no longer accepts a `topbar`
 * prop or builds a local `SidebarProps`. It also no longer accepts
 * `onNavigate`: this screen never called it directly (every control here
 * is a local Switch/input, no cross-screen action), so that plumbing was
 * dead the moment its only consumer (the local `sidebarProps`
 * construction) was removed.
 *
 * AMBIGUITY RESOLVED — toggle persistence/backend: the base engine's own
 * toggle handler is `onclick="this.classList.toggle('on')"` — a pure
 * client-side visual flip with no server call, no confirmation, and no
 * claim beyond "this control now reads on/off." Porting this 1:1 as local
 * `useState` per card is therefore full behavior fidelity, not a shortcut:
 * there is no irreversible operation here (Core Principle 1 does not apply
 * — nothing is submitted, nothing can double-fire), and no backend this
 * screen could honestly claim to have written to (Core Principle 3 — a
 * toggle that silently claimed persistence it doesn't have would be the
 * violation, not the other way around).
 *
 * PER-TIER COMMITTEE-VOTE TOGGLE + EDITABLE COMMITTEE NAME RESTORED (B-15
 * fix batch — supersedes this note's earlier "Approval-matrix card carries
 * no Switch" resolution): the base engine's `renderApprovalSettings()`
 * (source 3968-3983) rendered a per-tier "Committee vote" `.toggle`
 * (`toggleTierCommittee`) and an editable committee-name `<input>`
 * (`setCommitteeName`). Both are, by this same file's own earlier-cited
 * `data/cases.ts` header, "a pure client-side visual flip with no server
 * call, no confirmation, and no claim beyond 'this control now reads
 * on/off'" — i.e. exactly the same no-persistence contract the Identity/
 * Notification `Switch` rows above already implement as local `useState`.
 * `data/cases.ts` (outside this dispatch's allowlist) still exports no
 * `toggleTierCommittee`/`setCommitteeName` mutator, so these two controls
 * are ported the identical way: local component state, seeded from
 * `APPROVAL.tiers[].committee`/`APPROVAL.committee`, never written back to
 * the shared `APPROVAL` singleton. This does overrun
 * parity_ia_addendum.md §1.4's literal "Switch (P8) ×8" count (8 Identity/
 * Notification Switches + `APPROVAL.tiers.length` committee-vote Switches +
 * 1 committee-name input) — the ratified trim this note previously
 * described is reversed by the fix dispatch's own brief, which named this
 * finding directly; flagged for design-authority sign-off same as every
 * other "AMBIGUITY RESOLVED" note in this file. `Cases.tsx`'s CS-12
 * reconciliation note (that screen's header, outside this file) is updated
 * to match: the "per-tier committee-vote toggle and editable committee
 * name" reduction it recorded as sanctioned no longer holds.
 *
 * AMBIGUITY RESOLVED — live open-case count depends on `seedCases()` having
 * run: `data/cases.ts` exports `CASES` as `export let CASES: Case[] = []`,
 * populated only when some other module calls `seedCases(DOCLIB)` (App.tsx
 * wiring, outside this dispatch's allowlist per the dispatch's own HARD
 * RULES). This screen reads the live module-level `CASES` binding directly
 * at render time rather than caching or re-deriving it — if the app hasn't
 * seeded cases yet when this screen mounts, every tier honestly reads "0
 * open cases" rather than a fabricated placeholder number (Core Principle
 * 3: render truth, including the unflattering "nothing seeded yet" case).
 * STOP-item for the wiring dispatch: confirm `seedCases()` runs before a
 * user can reach this screen, or the count will legitimately read 0.
 *
 * Accessibility: each Switch (P8) already renders `role="switch"`,
 * `aria-checked`, and a visible on/off word (never color-only) per its own
 * primitive contract. The row description sits immediately after the
 * Switch in DOM/reading order so a screen-reader user reaches it on the
 * very next stop; `Switch` (out of this dispatch's allowlist) exposes no
 * `aria-describedby` hook to associate it formally, so this is an
 * adjacency-based association, the same fallback every sibling screen uses
 * for description text next to a primitive with a fixed prop surface.
 * Card and section headings are real heading elements (`h1`/`h2`), and
 * `main` carries `aria-labelledby` pointing at the page `h1`, matching
 * every sibling screen's landmark pattern.
 *
 * No screen-level primary CTA: design_system_spec.md §9 and
 * parity_ia_addendum.md §4 both classify Settings as "a settings/reference
 * panel" with the explicit stated-reason exemption under Core Principle 2
 * ("one primary [CTA], or a stated reason none applies").
 *
 * Tests: this worktree now carries Vitest + Testing Library (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed) — this screen's regression suite lives in
 * `src/__tests__/shell/`. Also verified via `npx tsc --noEmit` (strict
 * mode, `exactOptionalPropertyTypes`) against the whole `src/` tree.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Switch } from '../components/primitives/Switch';
import { Label } from '../components/primitives/Label';
import { Button } from '../components/primitives/Button';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentAction, DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { DocumentBody } from '../components/DocumentBody';
import { Icon } from '../components/primitives/Icon';
import { Tag } from '../components/primitives/Tag';
import type { NonRaciTagVariant, RaciMark } from '../components/primitives/Tag';
import { RegulatoryFeedSources } from '../views/RegulatoryFeedSources';
import type { SourceDetailRow } from '../views/RegulatoryFeedSources';
import { APPROVAL, CASES } from '../data/cases';
import { DOMAINS, INSTR, M, ROLES } from '../data/onside';
import type { DocRaci, OnsideInstrument } from '../data/onside';
import { DOCLIB } from '../data/doclib';
import type { DocEntry, DocStatus } from '../data/doclib';
import { useDemoStore } from '../state/demoStore';
import { ROLE_LEGEND_STYLE, RACI_MARK_LEGEND_STYLE } from './OnSideOwnership';
import { PANEL_STYLE } from '../theme/panelStyle';
import type { DeepLinkRequest, DeepLinkTarget } from '../App';

interface ToggleRow {
  key: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}

/* ============ RACI section — HTML entity/inline-tag decoding ============ */
/* Duplicated verbatim from OnSideOwnership.tsx (L3 relocation, see file    */
/* header) — that file's own header explains why a shared-utils copy isn't */
/* available inside either lane's ALLOWLIST.                               */

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

/* ============ RACI derived lookups (moved from OnSideOwnership.tsx) ============ */

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

/** v1's quiet middot for "no assignment" — see OnSideOwnership.tsx's prior
 * header for the full rationale this inherits. `aria-hidden`: absence of a
 * badge already is the signal. */
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

/** One row per governance document, carrying its domain key — flattens `M`
 * into one ordered list (domain-major, document-minor, both in authored
 * order) so a single grouped `DataTable` (C6) can group by `domainKey`. */
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

const RACI_MARK_LEGEND_ITEM_STYLE: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
const LEGEND_TEXT_STYLE: CSSProperties = { fontSize: '0.875rem', fontWeight: 500, color: 'var(--chart-axis)' };
const RACI_SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto', flexShrink: 0 };
const RACI_SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)' };
const RACI_SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };

type DisplayDoc = DocEntry & { id: string };

/** This screen's own local Drawer selection (own `<Drawer>` instance,
 * mirroring the pattern `OnSideFeed.tsx` used pre-L3): `source`/
 * `instrument` from the relocated Sources & connectors section
 * (`onOpenSource`/`onOpenInstrument`, consumed not re-invented — D6), and
 * `raci-doc` from the relocated RACI section's whole-row-click document
 * detail. `raci-doc` carries a `docId`, not a snapshot, so the open Drawer
 * re-derives `DOCLIB[docId]` live on every render (via `useDemoStore()`
 * below) — same adoption-reactivity fidelity `OnSideOwnership.tsx` had
 * before the relocation. */
type SettingsDrawerSelection =
  | { kind: 'source'; row: SourceDetailRow }
  | { kind: 'instrument'; instrumentKey: string; instrument: OnsideInstrument }
  | { kind: 'raci-doc'; docId: string };

// Verbatim port, leapfi-platform.html 44–47 ("Identity & access" card).
const IDENTITY_TOGGLES: ToggleRow[] = [
  {
    key: 'ad-sync',
    label: 'Active Directory sync',
    description: "Profiles, photos & roles inherited from Entra ID · last sync 6:02 AM ET",
    defaultChecked: true,
  },
  {
    key: 'sso',
    label: 'Single sign-on',
    description: "SSO via the institution's identity provider · MFA inherited",
    defaultChecked: true,
  },
  {
    key: 'rbac',
    label: 'Role-based access',
    description: 'Homepage & module permissions derived from directory role',
    defaultChecked: true,
  },
  {
    key: 'audit-log',
    label: 'Audit logging',
    description: 'Every query, approval, alert & export logged end to end',
    defaultChecked: true,
  },
];

// Verbatim port, leapfi-platform.html 51–54 ("Notifications" card). Weekly
// digest ships off (no `on` class in source) — every other row ships on.
const NOTIFICATION_TOGGLES: ToggleRow[] = [
  {
    key: 'reg-alerts',
    label: 'Regulatory change alerts',
    description: 'Same-day detection across 15 sources on three layers',
    defaultChecked: true,
  },
  {
    key: 'approval-requests',
    label: 'Approval requests',
    description: 'Policy redlines routed to your approval chain',
    defaultChecked: true,
  },
  {
    key: 'breach-alerts',
    label: 'Control breach alerting',
    description: 'SLA-tracked alerts when a monitored control drifts',
    defaultChecked: true,
  },
  {
    key: 'weekly-digest',
    label: 'Weekly digest',
    description: 'Monday morning summary to your inbox',
    defaultChecked: false,
  },
];

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
  gap: '1.75rem',
};
const HEADER_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.375rem' };
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const GRID_STYLE: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' };
export const CARD_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
  padding: '1.1rem 1.25rem',
  ...PANEL_STYLE,
  boxSizing: 'border-box',
  minWidth: 0,
};
const CARD_TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const TOGGLE_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.625rem 0',
  borderTop: '1px solid var(--border)',
};
const TOGGLE_ROW_FIRST_STYLE: CSSProperties = { ...TOGGLE_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const TIER_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem 0',
  borderTop: '1px solid var(--border)',
};
const TIER_ROW_FIRST_STYLE: CSSProperties = { ...TIER_ROW_STYLE, borderTop: 'none', paddingTop: 0 };
const TIER_DESC_STYLE: CSSProperties = { margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5 };
const TIER_META_ROW_STYLE: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', marginTop: '0.125rem' };
const STATIC_ROW_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem 0', borderTop: '1px solid var(--border)' };
/** Visually-hidden recipe — `top`/`left` pinned to 0 is load-bearing;
 * see the invariant note on `DataTable.tsx`'s `srOnlyStyle`. Without it
 * an unpositioned absolute box falls back to its in-flow static
 * position, which can extend `html.scrollHeight` past this screen's
 * scrolling `<main>` (now also `position: 'relative'`, same reason). */
const srOnlyStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
const COMMITTEE_NAME_INPUT_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.875rem',
  color: 'var(--ink)',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm, 6px)',
  padding: '0.4rem 0.6rem',
  maxWidth: '22rem',
  width: '100%',
  boxSizing: 'border-box',
};

/** `topbar`/`onNavigate` were removed as dead once Sidebar/Topbar mount
 * moved to App.tsx's Shell (see file header); this screen never called
 * `onNavigate` directly, only fed it to the Sidebar it no longer renders.
 * `deepLink`/`onDeepLink`/`onDeepLinkConsumed` are new (L3 UPDATE, file
 * header) — the same three-prop `DeepLinkScreenProps` shape every other
 * routed screen declares, kept as separate optional fields here (rather
 * than `extends DeepLinkScreenProps`) because App.tsx does not yet spread
 * `deepLinkProps` onto `<SettingsToggles />` (STOP-item, file header): all
 * three are optional and every use below is guarded so this screen never
 * crashes, and degrades to a no-op cross-screen link, until that App.tsx
 * wiring lands. `deepLink`'s `'feed-source'`-kind consumption (below) is a
 * real, tested consumer effect today — it just never fires in the live app
 * yet because `deepLink` is never actually passed in. */
export interface SettingsTogglesProps {
  deepLink?: DeepLinkTarget | null;
  onDeepLink?: (request: DeepLinkRequest) => void;
  onDeepLinkConsumed?: (nonce: number) => void;
}

function initialToggleState(rows: ToggleRow[]): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  rows.forEach((row) => {
    state[row.key] = row.defaultChecked;
  });
  return state;
}

function initialCommitteeState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  APPROVAL.tiers.forEach((tier) => {
    state[tier.k] = tier.committee;
  });
  return state;
}

export function SettingsToggles({ deepLink, onDeepLink, onDeepLinkConsumed }: SettingsTogglesProps = {}) {
  const [identityState, setIdentityState] = useState<Record<string, boolean>>(() => initialToggleState(IDENTITY_TOGGLES));
  const [notificationState, setNotificationState] = useState<Record<string, boolean>>(() => initialToggleState(NOTIFICATION_TOGGLES));
  // B-15: base `toggleTierCommittee`/`setCommitteeName` (source 3968-3983) —
  // same local, unpersisted visual-flip contract as identity/notification
  // toggles above (see file header). Seeded from the live `APPROVAL`
  // singleton, never written back to it.
  const [committeeState, setCommitteeState] = useState<Record<string, boolean>>(initialCommitteeState);
  const [committeeName, setCommitteeName] = useState<string>(APPROVAL.committee);

  // L3 UPDATE (file header) — RACI section reads the live `DOCLIB`
  // singleton per render (adoption-reactivity fidelity ported from
  // OnSideOwnership.tsx), so this screen re-renders on demo-store writes.
  useDemoStore();

  // This screen's own local Drawer (file header "SettingsDrawerSelection")
  // — never nulled on close so the Drawer's exit-transition window still
  // shows the last real content, same technique OnSideFeed.tsx used pre-L3.
  const [selection, setSelection] = useState<SettingsDrawerSelection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerClose = () => setDrawerOpen(false);

  // L3 UPDATE (file header) — scroll/focus target for the relocated
  // Sources & connectors section, consumed by the 'feed-source' deep-link
  // effect below (OnSideFeed.tsx's `handleOpenSources` is its one live
  // producer today — see that file's own header). Same nonce-keyed CONSUME
  // pattern every other deep-link-consuming screen in this codebase uses
  // (App.tsx's documented CONSUME contract); an id this effect does not
  // recognize still consumes the nonce but scrolls/focuses nothing (never a
  // fabricated destination).
  const sourcesSectionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!deepLink || deepLink.kind !== 'feed-source') return;
    sourcesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sourcesSectionRef.current?.focus();
    onDeepLinkConsumed?.(deepLink.nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires only on a NEW nonce, per the documented CONSUME contract (App.tsx header); onDeepLinkConsumed read fresh from closure, not tracked as a re-trigger dep
  }, [deepLink?.nonce]);

  // Relocated Sources & connectors seam (D6: consumed, not re-invented).
  const handleOpenSource = (row: SourceDetailRow) => {
    setSelection({ kind: 'source', row });
    setDrawerOpen(true);
  };

  // Same INSTR-guard discipline OnSideFeed.tsx used pre-L3 (base openInstr,
  // source 2932–2949) — never a fabricated detail for an unknown key.
  const handleOpenInstrument = (instrumentKey: string) => {
    const instrument = INSTR[instrumentKey];
    if (!instrument) return;
    setSelection({ kind: 'instrument', instrumentKey, instrument });
    setDrawerOpen(true);
  };

  // Relocated RACI section — whole-row click affordance, not a `rowAction`
  // "Open" column (same reasoning OnSideOwnership.tsx's prior header gave:
  // the document name IS the control, no v1 "Open" column exists).
  const handleOpenRaciRow = (row: RaciRow) => {
    setSelection({ kind: 'raci-doc', docId: row.doc[0] });
    setDrawerOpen(true);
  };

  const raciDisplayDoc: DisplayDoc | null = (() => {
    if (selection === null || selection.kind !== 'raci-doc') return null;
    const entry = DOCLIB[selection.docId];
    return entry ? { id: selection.docId, ...entry } : null;
  })();
  const raciDrawerRow = raciDisplayDoc ? RACI_BY_DOC_ID[raciDisplayDoc.id] : undefined;

  // Screen-owned metadata rows only — the document's own full `secs` text
  // is appended by the shared `DocumentBody` (design_system_spec.md
  // §2.11/A18), same as OnSideOwnership.tsx's identical former
  // `drawerFields` (moved here verbatim, file header).
  const raciDrawerFields: DrawerContentField[] = raciDisplayDoc
    ? [
        { label: 'Domain', value: DOMAIN_LABEL_BY_KEY[raciDisplayDoc.dom] ?? raciDisplayDoc.dom },
        { label: 'Version', value: raciDisplayDoc.v },
        { label: 'Type', value: raciDisplayDoc.type },
        { label: 'Owner', value: decodeText(raciDisplayDoc.owner) },
        { label: 'Summary', value: decodeText(raciDisplayDoc.line) },
        ...(raciDrawerRow ? [{ label: 'Accountable', value: ROLE_DESCRIPTOR[raciDrawerRow[1]] ?? raciDrawerRow[1] }] : []),
        ...(raciDrawerRow ? [{ label: 'Responsible', value: ROLE_DESCRIPTOR[raciDrawerRow[2]] ?? raciDrawerRow[2] }] : []),
        ...(raciDrawerRow && raciDrawerRow[3].length > 0
          ? [{ label: 'Consulted', value: raciDrawerRow[3].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(raciDrawerRow && raciDrawerRow[4].length > 0
          ? [{ label: 'Informed', value: raciDrawerRow[4].map((code) => ROLE_DESCRIPTOR[code] ?? code).join('; ') }]
          : []),
        ...(raciDisplayDoc.obl.length > 0 ? [{ label: 'Obligations evidenced', value: raciDisplayDoc.obl.join(', ') }] : []),
      ]
    : [];

  const raciDrawerTags: DrawerContentTag[] = raciDisplayDoc
    ? [{ text: STATUS_LABEL[raciDisplayDoc.status], variant: STATUS_TAG_VARIANT[raciDisplayDoc.status] }]
    : [];

  // B-dead-interactions-07-equivalent — "Domains this instrument drives"
  // as real deep-link action Buttons, guarded on `onDeepLink` (never a
  // dead click if this screen wasn't wired one — see file header STOP-item).
  const drawerActions: DrawerContentAction[] =
    selection !== null && selection.kind === 'instrument' && onDeepLink
      ? selection.instrument.doms.map((domKey) => ({
          label: `${DOMAINS.find((d) => d.key === domKey)?.name ?? domKey} →`,
          variant: 'ghost' as const,
          onPress: () => onDeepLink({ screen: 'onside.overview', kind: 'domain', id: domKey }),
        }))
      : [];

  const drawerTitle =
    selection === null
      ? ''
      : selection.kind === 'source'
        ? `Source — ${selection.row.name}`
        : selection.kind === 'instrument'
          ? decodeText(selection.instrument.n)
          : raciDisplayDoc
            ? decodeText(raciDisplayDoc.t)
            : '';

  function renderToggleCard(title: string, rows: ToggleRow[], state: Record<string, boolean>, setState: (next: Record<string, boolean>) => void, headingId: string) {
    // A14 (design_system_spec.md §2.7): CARD_STYLE spreads PANEL_STYLE —
    // every Label inside it is panel-seated.
    return (
      <div style={CARD_STYLE} role="group" aria-labelledby={headingId}>
        <h2 id={headingId} style={CARD_TITLE_STYLE}>
          {title}
        </h2>
        {rows.map((row, index) => (
          <div key={row.key} style={index === 0 ? TOGGLE_ROW_FIRST_STYLE : TOGGLE_ROW_STYLE}>
            <Switch
              checked={state[row.key] ?? row.defaultChecked}
              label={row.label}
              onChange={(checked) => setState({ ...state, [row.key]: checked })}
            />
            <Label text={row.description} variant="body-secondary" surface="panel" />
          </div>
        ))}
      </div>
    );
  }

  const conditionsText = APPROVAL.conditions.join(' · ');

  // Source/instrument Drawer content — ported verbatim from OnSideFeed.tsx's
  // pre-L3 'source'/'instrument' branches (file header).
  const nonRaciDrawerFields: DrawerContentField[] =
    selection === null
      ? []
      : selection.kind === 'source'
        ? [
            { label: 'Source', value: selection.row.name },
            { label: 'Regulatory layer', value: selection.row.layerLabel },
            { label: 'Method', value: selection.row.method },
            { label: '30-day activity', value: String(selection.row.activity30d) },
            { label: 'Connector phase', value: selection.row.phaseLabel },
            { label: 'Immediate alerts', value: selection.row.alertOn ? 'On' : 'Off' },
          ]
        : selection.kind === 'instrument'
          ? [
              { label: 'Kind', value: decodeText(selection.instrument.kind) },
              { label: 'Issuer', value: decodeText(selection.instrument.issuer) },
              { label: 'Effective', value: decodeText(selection.instrument.eff) },
              { label: 'Source', value: decodeText(selection.instrument.src) },
              { label: 'Review', value: 'Nothing read from this instrument becomes authoritative before a qualified human approves it' },
              { label: 'Summary', value: decodeText(selection.instrument.sum) },
            ]
          : [];

  const nonRaciDrawerTags: DrawerContentTag[] =
    selection === null
      ? []
      : selection.kind === 'source'
        ? selection.row.alertOn
          ? [{ text: 'Alerts on', variant: 'hitl' }]
          : []
        : selection.kind === 'instrument'
          ? [{ text: 'Regulatory instrument', variant: 'count' }]
          : [];

  // ONSIDE-04-equivalent — stable-node alert toggle (see OnSideFeed.tsx's
  // former header note): a screen-owned Button, not a DrawerContent
  // `actions` entry, so its flipping label never remounts under focus.
  const handleAlertTogglePress = () => {
    if (selection === null || selection.kind !== 'source') return;
    selection.row.onToggleAlert();
    setSelection({ kind: 'source', row: { ...selection.row, alertOn: !selection.row.alertOn } });
  };

  return (
    <>
    <main id="settings-toggles-main" style={MAIN_STYLE} aria-labelledby="settings-toggles-title">
          <div style={HEADER_STYLE}>
            <Label text="Platform" variant="eyebrow" />
            <h1 id="settings-toggles-title" style={TITLE_STYLE}>
              Settings · Toggles
            </h1>
          </div>

          {/* A14 (design_system_spec.md §2.7): CARD_STYLE spreads
              PANEL_STYLE — every Label inside it is panel-seated. */}
          <div style={CARD_STYLE} role="group" aria-labelledby="approval-matrix-heading">
            <h2 id="approval-matrix-heading" style={CARD_TITLE_STYLE}>
              Approval matrix
            </h2>
            {APPROVAL.tiers.map((tier, index) => {
              const openCount = CASES.filter((c) => c.tier === tier.k).length;
              const caseCountText = `${openCount} open case${openCount === 1 ? '' : 's'}`;
              const requiresCommittee = committeeState[tier.k] ?? tier.committee;
              return (
                <div key={tier.k} style={index === 0 ? TIER_ROW_FIRST_STYLE : TIER_ROW_STYLE}>
                  <Label text={tier.n} variant="eyebrow" surface="panel" />
                  <p style={TIER_DESC_STYLE}>{tier.d}</p>
                  <Label text={`Example: ${tier.ex}`} variant="body-secondary" surface="panel" />
                  <div style={TIER_META_ROW_STYLE}>
                    <Label text={caseCountText} variant="body-secondary" surface="panel" />
                  </div>
                  {/* B-15: base per-tier `.toggle` (`toggleTierCommittee`, source 3975). */}
                  <Switch
                    checked={requiresCommittee}
                    label="Committee vote required before final approval"
                    onChange={(checked) => setCommitteeState({ ...committeeState, [tier.k]: checked })}
                  />
                </div>
              );
            })}
            <div style={STATIC_ROW_STYLE}>
              <Label text="Approving committee" variant="eyebrow" surface="panel" />
              {/* B-15: base editable committee-name `<input>` (`setCommitteeName`, source 3968-3983). */}
              <label>
                <span style={srOnlyStyle}>Approving committee name</span>
                <input
                  type="text"
                  value={committeeName}
                  onChange={(event) => setCommitteeName(event.target.value)}
                  style={COMMITTEE_NAME_INPUT_STYLE}
                />
              </label>
            </div>
            <div style={STATIC_ROW_STYLE}>
              <Label text="Conditions the CRO can attach" variant="eyebrow" surface="panel" />
              <Label text={conditionsText} variant="body-secondary" surface="panel" />
            </div>
          </div>

          <div style={GRID_STYLE}>
            {renderToggleCard('Identity & access', IDENTITY_TOGGLES, identityState, setIdentityState, 'identity-access-heading')}
            {renderToggleCard('Notifications', NOTIFICATION_TOGGLES, notificationState, setNotificationState, 'notifications-heading')}
          </div>

          {/* L3 UPDATE (call-07, D6/D7, file header) — Sources & connectors
              (with its Digest & Alerts panel) as an additional stacked card
              section. `RegulatoryFeedSources` renders its own <section>/<h2>. */}
          <div ref={sourcesSectionRef} tabIndex={-1}>
            <RegulatoryFeedSources onOpenSource={handleOpenSource} onOpenInstrument={handleOpenInstrument} />
          </div>

          {/* L3 UPDATE (call-08, D6, file header) — RACI matrix as an
              additional stacked card section. */}
          <section aria-labelledby="settings-raci-heading" style={RACI_SECTION_STYLE}>
            <h2 id="settings-raci-heading" style={RACI_SUBHEADING_STYLE}>
              RACI · policy ownership matrix
            </h2>

            <div style={RACI_SCROLL_WRAP_STYLE}>
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
    </main>

      <Drawer open={drawerOpen} title={drawerTitle} onClose={handleDrawerClose}>
        {selection !== null && selection.kind === 'raci-doc' ? (
          raciDisplayDoc ? (
            <DocumentBody docId={raciDisplayDoc.id} metadataFields={raciDrawerFields} tags={raciDrawerTags} decodeText={decodeText} />
          ) : null
        ) : (
          <>
            <DrawerContent
              kind={selection !== null && selection.kind === 'source' ? 'source' : 'signal'}
              fields={nonRaciDrawerFields}
              tags={nonRaciDrawerTags}
              actions={drawerActions}
            />
            {selection !== null && selection.kind === 'source' ? (
              // ONSIDE-04-equivalent — stable-node alert toggle; see file
              // header / handleAlertTogglePress comment above.
              <div style={{ marginTop: '1.25rem' }}>
                <Button
                  variant="secondary"
                  label={selection.row.alertOn ? 'Turn alerts off' : 'Turn alerts on'}
                  onPress={handleAlertTogglePress}
                />
              </div>
            ) : null}
          </>
        )}
      </Drawer>
    </>
  );
}
