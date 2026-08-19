/**
 * OnSideDocuments — Screen anatomy §5.3 "OnSide · Documents — Step 3 'Rules
 * made executable'" (design_system_spec.md), fed by demo_script_draft.md
 * Step 3 and its G4 gap-register entry.
 *
 * Region map (§5.3): Topbar → page title → FilterBar (doc-status filters,
 * optional) → DataTable (`row kind: redline-row/doc-row`, ~130 entries) →
 * (on row open) Drawer with RedlineDiffView (C9) + HITL Tag (P4) + footer
 * actions. Components used per spec: Topbar, Sidebar, FilterBar (C5),
 * DataTable (C6), Drawer (C7), DrawerContent (C8, `kind: doc`),
 * RedlineDiffView (C9), Tag (`hitl`), Button (`primary`/`ghost`/`row`),
 * Toast (C17).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical passthrough
 * pattern to the already-landed `Home.tsx`/`BoardDeck.tsx` screens in this
 * worktree — `topbar: TopbarProps` full bundle, `onNavigate:
 * SidebarProps['onNavigate']`, `activeId` hardcoded to `'onside.documents'`
 * (intrinsic to this screen, not a prop the integrator could get wrong).
 *
 * AMBIGUITY RESOLVED — Drawer single-instance scoping (C7 a11y baseline:
 * "single shared instance app-wide... never a second instance"): this
 * dispatch's allowlist is this file alone, and no router/shell wiring
 * exists yet in this worktree (`App.tsx` is still the D14 scaffold
 * placeholder) — screens are standalone. This file mounts its own local
 * `<Drawer>`, which trivially satisfies "never a second simultaneous
 * instance" under normal SPA routing (only one screen mounts at a time);
 * same "defer final ownership to the integrator" pattern `Home.tsx` already
 * uses for Topbar/Sidebar. STOP-item for whoever wires real routing: confirm
 * only one screen's Drawer is ever mounted at a time, or hoist Drawer to a
 * shared shell.
 *
 * FIX WAVE (ONSIDE-02 / ONSIDE-11) — Adopt cascade routed through the
 * shared demo store, base semantics VERBATIM: the earlier screen-local
 * cascade (`cascadeTargetsForDoc` + `obligationOverrides`/
 * `resolvedGapKeys` useState) trapped the Step-3 adoption inside this
 * screen — OnSide Overview and the Domains accordion still showed the
 * pre-adopt truth ("every view moves together" is the base's own
 * guarantee, applyGapClosure comment at source 3204), and navigating away
 * discarded the adoption entirely. Now:
 *   - `handleAdopt` calls `state/demoStore.ts`'s `applyGapClosure(docId)`
 *     (base 3205–3211 verbatim: keyed STRICTLY on `(g.rl||g.doc)===docId`
 *     over GAPS, flips the OBL row + `d.met++` on the live singletons and
 *     emits to every subscribed screen). The screen's former extra
 *     `doc.obl`-driven branch (b) — which closed MRM-11 on gen-ai-draft
 *     adoption, EXCEEDING the base anchor — is REMOVED per ONSIDE-11: in
 *     base, adopting gen-ai-draft flips nothing.
 *   - Document-level adopted state is no longer session-local `useState`:
 *     the base rlAction('adopted') cosmetics (source 2474–2483 — version
 *     minor bump, `status='good'`, an `rlState` marker) are applied to
 *     the live `DOCLIB` entry, so the adoption survives navigation, every
 *     DOCLIB reader agrees, and `resetDemo()` restores it (the store
 *     reseeds DOCLIB from its DEMO_SEED snapshot). Gap-board closure is
 *     derived from that same `rlState` (base gapState, source 3195–3202).
 *   - This screen subscribes via `useDemoStore()`; obligation registers
 *     render the live `OBL` rows directly (no overrides layer).
 *
 * AMBIGUITY RESOLVED — no dedicated "domain view" screen: §5.3 describes a
 * post-Adopt `dom-` deep link landing on "a separate domain view (below),
 * one hop deeper... still reached via the existing single-level nav
 * engine... not a new nesting layer" — but design_system_spec.md §2.3's own
 * 7-screen inventory has no dedicated domain-view screen, and this
 * dispatch's allowlist is `OnSideDocuments.tsx`/`StudioAsk.tsx` only, with
 * no domain-view file named anywhere. The "Domain impact" section below is
 * therefore built as an in-page section of this same screen (visible below
 * the fold, scrolled/focused into on Toast's "View impact →" link) rather
 * than a new screen file — literally "one hop deeper," not a new screen.
 *
 * AMBIGUITY RESOLVED — cascade timing vs. spec's `CascadePlaying`/
 * `CascadeAnnounced` states (§5.3 state machine): the obligation data
 * itself flips the moment the (simulated) server commit resolves
 * (`Adopted`) — Core Principle 3 forbids a screen showing stale/wrong
 * status once the server has actually confirmed a change, so the source of
 * truth updates immediately, not lazily. What is deliberately *deferred*
 * to the "View impact →" click (`CascadePlaying`) is the **presentational**
 * cascade — the transient row-highlight pulse and the single summarized
 * `aria-live` announcement — matching the spec's own reasoning for not
 * auto-navigating on Adopt ("keeps the next click visible and
 * discoverable... a pattern that depends on presenter memory is not a
 * pattern").
 *
 * HTML entity/inline-tag decoding: doclib.ts's own file header notes the
 * source renders `t`/`line`/`secs`/`redline` fields via `innerHTML` and
 * instructs the consuming component to decode them the same way to
 * reproduce the original output. `DrawerContent`, `RedlineDiffView`, and
 * `DataTable` cell text all take plain strings (no `dangerouslySetInnerHTML`
 * anywhere in this worktree's composites), so `decodeDocText` below decodes
 * the small set of named entities this dataset actually uses and strips the
 * handful of inline tags (`<b>`, `&amp;` etc.) rather than leaving literal
 * "&rsquo;"/"<b>" text on screen — not a general HTML parser, deliberately
 * scoped to this dataset's known vocabulary.
 *
 * Irreversibility gate (persona directive 6): Adopt is the "irreversible-
 * feeling approval action" §7 names explicitly. Double-submission is
 * prevented two ways: (1) UX courtesy — the Adopt Button's own `loading`
 * state disables it the instant a press starts; (2) the actual guarantee —
 * a monotonically-incrementing `requestSeqRef` counter is captured at press
 * time and re-checked when the simulated commit resolves, so only the
 * *latest* Adopt press for a screen ever applies its cascade (a stale,
 * superseded commit is a silent no-op), and the live `rlState` adopted
 * marker plus `adoptingDocId` both serialize Adopt globally (only one
 * commit in flight at a time, and a doc already adopted can never be
 * re-adopted). The cascade write itself is also idempotent by construction
 * (the store's `applyGapClosure` skips GAPS entries already `applied` and
 * obligations already `'met'`), so even a slipped-through double-press
 * cannot double-apply a state change.
 *
 * FIX WAVE (ONSIDE-13) — focus fallback after a filtered-away Adopt: with
 * the "Pending" redline filter active, adopting removes the triggering
 * row from the table, so Drawer's own restore-to-trigger guard
 * (`document.body.contains(target)`) correctly skips and focus would land
 * on `document.body`. The adopt commit therefore schedules a fallback
 * (after the Drawer's 200ms close transition): if focus is on body, it
 * moves to this screen's page heading (`tabIndex={-1}`) — never fighting
 * the Drawer's own restore when the row is still mounted.
 *
 * Accessibility gate (persona directive 7): main document table and both
 * obligation registers are real `<table>` semantics via `DataTable` (C6);
 * FilterBar (C5) supplies keyboard-operable disclosure filters; Drawer (C7)
 * traps focus, moves initial focus to its heading, and restores focus to
 * the triggering row button on close (all inherited from `Drawer.tsx`,
 * unmodified here); the redline diff is never color-only (`RedlineDiffView`
 * C9's own +/− glyph + `<ins>`/`<del>` baseline, unmodified here); the
 * cascade's status change is announced once via a screen-owned
 * `aria-live="polite"` region (never per-row, matching C6's own a11y
 * baseline reservation) triggered by the discoverable Toast link, not
 * silently on Adopt.
 *
 * Tests: this worktree now carries Vitest + Testing Library — this
 * screen's regression suite lives in `src/__tests__/onside/` (the earlier
 * "no test runner installed" STOP-item recorded here is resolved and
 * removed). FIX WAVE (ONSIDE-12): Status filter chip counts are computed
 * per render from the same live doc status the filter matches against —
 * the previous module-scope `DOC_STATUS_COUNTS` snapshot advertised
 * pre-adoption counts while the filter yielded post-adoption rows.
 *
 * Layout constants (240px sidebar column, 2rem content padding): not in
 * design_system_spec.md §1.4's token-only scope by design; copied verbatim
 * from `Home.tsx`'s own documented implementer judgment call for visual
 * consistency across screens, not re-derived independently.
 */
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { FilterBar } from '../components/FilterBar';
import type { FilterGroup } from '../components/FilterBar';
import { Drawer } from '../components/Drawer';
import { DrawerContent } from '../components/DrawerContent';
import type { DrawerContentField, DrawerContentTag } from '../components/DrawerContent';
import { RedlineDiffView } from '../components/RedlineDiffView';
import { Toast } from '../components/Toast';
import { Button } from '../components/primitives/Button';
import { Tag } from '../components/primitives/Tag';
import type { TagVariant } from '../components/primitives/Tag';
import { DOCLIB } from '../data/doclib';
import type { DocEntry, DocStatus } from '../data/doclib';
import { DOMAINS, GAPS, OBL } from '../data/onside';
import type { GapItem, ObligationRow } from '../data/onside';
import { CURRENT } from '../data/studio';
import { applyGapClosure, useDemoStore } from '../state/demoStore';

/** Base rlAction's document-level adopted marker (source 2478) — runtime
 * bookkeeping attached to the live DOCLIB entry, not part of doclib.ts's
 * seeded shape (same intersection pattern the store uses for GAPS'
 * `applied` flag). */
interface DocRlState {
  act: 'adopted';
  who: string;
  when: string;
}

type LiveDoc = DocEntry & { rlState?: DocRlState };

const LIVE_DOCLIB = DOCLIB as Record<string, LiveDoc>;

type DocRow = LiveDoc & { id: string };

interface CascadeTarget {
  domain: string;
  oblId: string;
}

interface ToastState {
  variant: 'success' | 'info';
  message: string;
  cascade: CascadeTarget[];
}

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

/** See file header "HTML entity/inline-tag decoding." */
function decodeDocText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => HTML_ENTITY_MAP[match] ?? match);
}

const DOMAIN_LABEL: Record<string, string> = Object.fromEntries(DOMAINS.map((d) => [d.key, d.name]));

const STATUS_TAG_VARIANT: Record<DocStatus, TagVariant> = {
  good: 'status-positive',
  warn: 'status-caution',
  crit: 'status-alert',
};

const STATUS_LABEL: Record<DocStatus, string> = {
  good: 'Current',
  warn: 'Needs attention',
  crit: 'Critical',
};

const OBL_STATUS_LABEL: Record<ObligationRow['st'], string> = { met: 'Met', partial: 'Partial', gap: 'Gap' };
const OBL_STATUS_VARIANT: Record<ObligationRow['st'], TagVariant> = {
  met: 'status-positive',
  partial: 'status-caution',
  gap: 'status-alert',
};

// Domain membership and redline presence are structural (never mutated at
// runtime; resetDemo reseeds identical structure), so these two stay
// module-scope. Status counts are NOT here — they are live (ONSIDE-12).
const DOC_DOMAIN_COUNTS: Record<string, number> = {};
for (const doc of Object.values(DOCLIB)) DOC_DOMAIN_COUNTS[doc.dom] = (DOC_DOMAIN_COUNTS[doc.dom] ?? 0) + 1;

const REDLINE_DOC_COUNT = Object.values(DOCLIB).filter((doc) => doc.redline).length;

function isDocAdopted(docId: string): boolean {
  return LIVE_DOCLIB[docId]?.rlState?.act === 'adopted';
}

/** Base gapState (source 3195–3202): a gap board entry is closed when the
 * doc behind it (`g.rl||g.doc`) carries an adopted rlState. */
function isGapClosed(gap: GapItem): boolean {
  const key = gap.rl ?? gap.doc;
  return key !== null && key !== undefined && isDocAdopted(key);
}

/** Which obligations THIS adoption will flip — the store's applyGapClosure
 * semantics (base 3205–3211: GAPS keyed on `(g.rl||g.doc)===docId`, target
 * obligation not yet met). No `doc.obl` branch — ONSIDE-11. */
function cascadeTargetsForDoc(docId: string): CascadeTarget[] {
  const targets: CascadeTarget[] = [];
  for (const gap of GAPS) {
    if ((gap.rl ?? gap.doc) !== docId || !gap.obl) continue;
    const [domainKey, oblId] = gap.obl;
    const row = OBL[domainKey]?.find((o) => o.id === oblId);
    if (row && row.st !== 'met') targets.push({ domain: domainKey, oblId });
  }
  return targets;
}

function gapKey(gap: GapItem): string {
  return gap.t;
}

/** ADOPT_COMMIT_DELAY_MS: implementer judgment call (no value in
 * design_system_spec.md §1.4's token-only scope) — long enough that the
 * Button's `loading` state is visibly a real wait, matching Core Principle
 * 1 ("the UI said done before anything was" is this persona's formative
 * failure) rather than an instant, indistinguishable-from-fake flip. */
const ADOPT_COMMIT_DELAY_MS = 650;

/** Drawer.tsx's close transition is 200ms; the ONSIDE-13 focus fallback
 * runs just after it so it never races the Drawer's own restore. */
const FOCUS_FALLBACK_DELAY_MS = 260;

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};

const BODY_ROW_STYLE: CSSProperties = { display: 'flex', flex: '1 1 auto', minHeight: 0 };
const SIDEBAR_REGION_STYLE: CSSProperties = { flex: '0 0 240px' };
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.875rem' };
const SUBHEADING_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
};
const COUNT_BADGE_STYLE: CSSProperties = {
  font: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--ink2)',
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-pill, 999px)',
  padding: '0.15rem 0.6rem',
};
const DOMAIN_HEADING_STYLE: CSSProperties = { margin: '0 0 0.625rem', font: 'inherit', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' };
const DOMAIN_SECTION_STYLE: CSSProperties = { outline: 'none' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const TOAST_WRAP_STYLE: CSSProperties = { position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 60 };
const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface OnSideDocumentsProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('onside.documents') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
}

export function OnSideDocuments({ topbar, onNavigate, sidebarVersionLabel }: OnSideDocumentsProps) {
  // Re-renders this screen on every demo-store write (its own adopt
  // cascade included) — see the ONSIDE-02 file-header note.
  useDemoStore();
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRedlineFilter, setSelectedRedlineFilter] = useState<string[]>([]);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [adoptingDocId, setAdoptingDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [updatingObligationIds, setUpdatingObligationIds] = useState<ReadonlySet<string>>(new Set());
  const [cascadeAnnouncement, setCascadeAnnouncement] = useState('');

  const requestSeqRef = useRef(0);
  const domainSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const updatingTimeoutRef = useRef<number | undefined>(undefined);
  const lastOpenDocRef = useRef<DocRow | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Rebuilt per render from the LIVE DOCLIB singleton — adoption mutates
  // doc status/version in place (ONSIDE-02/ONSIDE-12).
  const allDocs: DocRow[] = Object.entries(LIVE_DOCLIB).map(([id, doc]) => ({ id, ...doc }));

  // ONSIDE-12 — live counts from the same status the filter matches.
  const docStatusCounts: Record<DocStatus, number> = { good: 0, warn: 0, crit: 0 };
  for (const doc of allDocs) docStatusCounts[doc.status]++;
  const adoptedCount = allDocs.filter((doc) => doc.rlState?.act === 'adopted').length;

  const openDoc = openDocId ? (allDocs.find((d) => d.id === openDocId) ?? null) : null;
  if (openDoc) lastOpenDocRef.current = openDoc;
  // Keeps Drawer's title/body populated with the last real doc through its
  // ~200ms closing animation instead of blanking the instant openDocId is
  // cleared (Adopt/Reject both clear it immediately) — a genuinely closed
  // Drawer (open=false, phase 'closed') still renders nothing at all, since
  // Drawer.tsx returns null in that phase regardless of what we pass it.
  const displayDoc = openDoc ?? lastOpenDocRef.current;

  const handleAdopt = (doc: DocRow) => {
    if (isDocAdopted(doc.id) || adoptingDocId !== null) return;
    const requestKey = ++requestSeqRef.current;
    setAdoptingDocId(doc.id);
    window.setTimeout(() => {
      // Superseded (a later Adopt press started, or requestSeqRef moved on)
      // — this stale commit never applies. See file header irreversibility
      // gate note.
      if (requestSeqRef.current !== requestKey) return;

      // Computed BEFORE the store write so the toast/impact view knows
      // exactly which rows this adoption flipped.
      const cascade = cascadeTargetsForDoc(doc.id);

      // Base rlAction('adopted') document cosmetics (source 2474–2483):
      // version minor bump, status flip, adopted marker — on the live
      // DOCLIB entry so every reader agrees and resetDemo restores it.
      const live = LIVE_DOCLIB[doc.id];
      if (live) {
        const versionMatch = /^v(\d+)\.(\d+)/.exec(live.v || '');
        if (versionMatch) live.v = `v${versionMatch[1]}.${Number(versionMatch[2]) + 1}`;
        live.status = 'good';
        live.rlState = {
          act: 'adopted',
          who: `${CURRENT.first} ${CURRENT.role ? `(${CURRENT.role})` : ''}`.trim(),
          when: 'Aug 15, 2026',
        };
      }

      // The store's base-verbatim cascade (applyGapClosure 3205–3211);
      // its emit() re-renders this screen and every other subscriber.
      applyGapClosure(doc.id);

      setAdoptingDocId(null);
      setOpenDocId(null);
      setToast({ variant: 'success', message: `${decodeDocText(doc.t)} adopted.`, cascade });

      // ONSIDE-13 — if the Drawer's restore-to-trigger found the row
      // unmounted (e.g. "Pending" filter active), catch focus from body.
      window.setTimeout(() => {
        const active = document.activeElement;
        if (active === null || active === document.body) titleRef.current?.focus();
      }, FOCUS_FALLBACK_DELAY_MS);
    }, ADOPT_COMMIT_DELAY_MS);
  };

  const handleReject = (doc: DocRow) => {
    setOpenDocId(null);
    setToast({ variant: 'info', message: `${decodeDocText(doc.t)} redline rejected — no changes made.`, cascade: [] });
  };

  const handleViewImpact = () => {
    if (!toast || toast.cascade.length === 0) return;
    const domains = Array.from(new Set(toast.cascade.map((c) => c.domain)));
    setUpdatingObligationIds(new Set(toast.cascade.map((c) => c.oblId)));
    if (updatingTimeoutRef.current !== undefined) window.clearTimeout(updatingTimeoutRef.current);
    updatingTimeoutRef.current = window.setTimeout(() => setUpdatingObligationIds(new Set()), 1600);

    const summary = domains
      .map((domain) => {
        const rows = OBL[domain] ?? [];
        const closedNow = toast.cascade.filter((c) => c.domain === domain).length;
        const stillOpen = rows.filter((row) => row.st !== 'met').length;
        const label = DOMAIN_LABEL[domain] ?? domain;
        return `${label}: ${closedNow} obligation${closedNow === 1 ? '' : 's'} closed — ${stillOpen} of ${rows.length} still open`;
      })
      .join('. ');
    setCascadeAnnouncement(summary);

    const firstDomain = domains[0];
    const target = firstDomain ? domainSectionRefs.current[firstDomain] : null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus();
  };

  const filteredDocs = allDocs.filter((doc) => {
    if (selectedDomains.length > 0 && !selectedDomains.includes(doc.dom)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(doc.status)) return false;
    if (selectedRedlineFilter.length > 0) {
      const isAdopted = doc.rlState?.act === 'adopted';
      const isPending = Boolean(doc.redline) && !isAdopted;
      const matches = (selectedRedlineFilter.includes('pending') && isPending) || (selectedRedlineFilter.includes('adopted') && isAdopted);
      if (!matches) return false;
    }
    return true;
  });

  const columns: DataTableColumn<DocRow>[] = [
    { id: 'title', header: 'Document', sortable: true, sortValue: (row) => decodeDocText(row.t), render: (row) => <span>{decodeDocText(row.t)}</span> },
    {
      id: 'domain',
      header: 'Domain',
      sortable: true,
      sortValue: (row) => DOMAIN_LABEL[row.dom] ?? row.dom,
      render: (row) => <span>{DOMAIN_LABEL[row.dom] ?? row.dom}</span>,
    },
    { id: 'type', header: 'Type', render: (row) => <span>{row.type}</span> },
    { id: 'owner', header: 'Owner', render: (row) => <span>{decodeDocText(row.owner)}</span> },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <Tag text={STATUS_LABEL[row.status]} variant={STATUS_TAG_VARIANT[row.status]} />,
    },
    {
      id: 'redline',
      header: 'Redline',
      render: (row) => {
        if (!row.redline) return <span style={{ color: 'var(--ink3)' }}>—</span>;
        return row.rlState?.act === 'adopted' ? <Tag text="Adopted" variant="status-positive" /> : <Tag text="Redline pending" variant="hitl" />;
      },
    },
  ];

  const rowAction: DataTableRowAction<DocRow> = {
    label: (row) => (row.redline ? 'Review' : 'View'),
    onPress: (row) => setOpenDocId(row.id),
  };

  const domainFilterGroup: FilterGroup = {
    id: 'domain',
    label: 'Domain',
    options: DOMAINS.map((d) => ({ id: d.key, label: d.name, count: DOC_DOMAIN_COUNTS[d.key] ?? 0 })),
    selectedIds: selectedDomains,
    onToggle: (id) => setSelectedDomains((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const statusFilterGroup: FilterGroup = {
    id: 'status',
    label: 'Status',
    // Live counts (ONSIDE-12) — same source the filter predicate reads.
    options: (['good', 'warn', 'crit'] as DocStatus[]).map((s) => ({ id: s, label: STATUS_LABEL[s], count: docStatusCounts[s] })),
    selectedIds: selectedStatuses,
    onToggle: (id) => setSelectedStatuses((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const redlineFilterGroup: FilterGroup = {
    id: 'redline',
    label: 'Redlines',
    options: [
      { id: 'pending', label: 'Pending', count: REDLINE_DOC_COUNT - adoptedCount },
      { id: 'adopted', label: 'Adopted', count: adoptedCount },
    ],
    selectedIds: selectedRedlineFilter,
    onToggle: (id) => setSelectedRedlineFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  // Live read by id (never the displayDoc snapshot, which is pre-adoption
  // during the Drawer's closing animation).
  const isDisplayDocAdopted = displayDoc ? isDocAdopted(displayDoc.id) : false;
  const isAdoptingDisplayDoc = displayDoc ? adoptingDocId === displayDoc.id : false;

  const drawerFields: DrawerContentField[] = displayDoc
    ? [
        { label: 'Version', value: displayDoc.v },
        { label: 'Domain', value: DOMAIN_LABEL[displayDoc.dom] ?? displayDoc.dom },
        { label: 'Type', value: displayDoc.type },
        { label: 'Owner', value: decodeDocText(displayDoc.owner) },
        { label: 'Summary', value: decodeDocText(displayDoc.line) },
        ...(displayDoc.obl.length > 0 ? [{ label: 'Obligations evidenced', value: displayDoc.obl.join(', ') }] : []),
        ...displayDoc.secs.map(([heading, body]) => ({ label: heading, value: decodeDocText(body) })),
      ]
    : [];

  const displayDocStatus: DocStatus = displayDoc ? (LIVE_DOCLIB[displayDoc.id]?.status ?? displayDoc.status) : 'good';
  const drawerTags: DrawerContentTag[] = displayDoc
    ? [{ text: STATUS_LABEL[displayDocStatus], variant: STATUS_TAG_VARIANT[displayDocStatus] }]
    : [];

  const drawerFooter: ReactNode = displayDoc && displayDoc.redline && !isDisplayDocAdopted && (
    <>
      <Button
        variant="primary"
        label="Adopt"
        loading={isAdoptingDisplayDoc}
        disabled={adoptingDocId !== null && adoptingDocId !== displayDoc.id}
        onPress={() => handleAdopt(displayDoc)}
      />
      <Button variant="ghost" label="Reject" disabled={isAdoptingDisplayDoc} onPress={() => handleReject(displayDoc)} />
    </>
  );

  // Base gapState-derived closure (see isGapClosed) — survives navigation,
  // resets with resetDemo.
  const openGaps = GAPS.filter((g) => !isGapClosed(g));

  const gapColumns: DataTableColumn<GapItem>[] = [
    {
      id: 'sev',
      header: 'Severity',
      render: (g) => <Tag text={g.sev === 'crit' ? 'Critical' : 'Warning'} variant={g.sev === 'crit' ? 'status-alert' : 'status-caution'} />,
    },
    { id: 'item', header: 'Open item', render: (g) => <span>{decodeDocText(g.t)}</span> },
    { id: 'domain', header: 'Domain', render: (g) => <span>{g.dom}</span> },
    { id: 'owner', header: 'Owner', render: (g) => <span>{decodeDocText(g.owner)}</span> },
    { id: 'action', header: 'Action', render: (g) => <span style={{ color: 'var(--ink2)' }}>{decodeDocText(g.act)}</span> },
  ];

  function obligationColumns(): DataTableColumn<ObligationRow>[] {
    return [
      { id: 'id', header: 'Obligation', render: (row) => <strong>{row.id}</strong> },
      { id: 'requirement', header: 'Requirement', render: (row) => <span>{decodeDocText(row.s)}</span> },
      { id: 'citation', header: 'Citation', render: (row) => <span style={{ color: 'var(--ink2)' }}>{decodeDocText(row.cite)}</span> },
      {
        id: 'status',
        header: 'Status',
        // Live OBL rows — the store's applyGapClosure mutates row.st/rev
        // in place (no overrides layer; ONSIDE-02).
        render: (row) => <Tag text={OBL_STATUS_LABEL[row.st]} variant={OBL_STATUS_VARIANT[row.st]} />,
      },
    ];
  }

  const sidebarProps: SidebarProps = {
    activeId: 'onside.documents',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="onside-documents" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="onside-documents-main" style={MAIN_STYLE} aria-labelledby="onside-documents-title">
          <h1 id="onside-documents-title" ref={titleRef} tabIndex={-1} style={TITLE_STYLE}>
            OnSide · Documents
          </h1>

          <FilterBar groups={[domainFilterGroup, statusFilterGroup, redlineFilterGroup]} />

          <div style={SCROLL_WRAP_STYLE}>
            <DataTable
              caption="Document library"
              columns={columns}
              rows={filteredDocs}
              getRowId={(row) => row.id}
              rowAction={rowAction}
              emptyMessage="No documents match the current filters."
              defaultSortColumnId="title"
            />
          </div>

          <section aria-labelledby="onside-gaps-heading" style={SECTION_STYLE}>
            <h2 id="onside-gaps-heading" style={SUBHEADING_STYLE}>
              Open governance gaps
              <span style={COUNT_BADGE_STYLE}>{openGaps.length} open</span>
            </h2>
            <div style={SCROLL_WRAP_STYLE}>
              <DataTable caption="Open governance gaps board" columns={gapColumns} rows={openGaps} getRowId={gapKey} emptyMessage="All tracked gaps closed." />
            </div>
          </section>

          <section aria-labelledby="onside-domain-impact-heading" style={SECTION_STYLE}>
            <h2 id="onside-domain-impact-heading" style={SUBHEADING_STYLE}>
              Domain impact
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ink2)' }}>
              Obligation status by governance domain. Adopting a redline above can flip a row here from open to met — a toast&rsquo;s &ldquo;View
              impact&rdquo; link jumps straight to the change.
            </p>
            <span role="status" aria-live="polite" style={SR_ONLY_STYLE}>
              {cascadeAnnouncement}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(OBL).map(([domainKey, rows]) => (
                <div
                  key={domainKey}
                  ref={(el) => {
                    domainSectionRefs.current[domainKey] = el;
                  }}
                  tabIndex={-1}
                  style={DOMAIN_SECTION_STYLE}
                >
                  <h3 style={DOMAIN_HEADING_STYLE}>{DOMAIN_LABEL[domainKey] ?? domainKey}</h3>
                  <div style={SCROLL_WRAP_STYLE}>
                    <DataTable
                      caption={`${DOMAIN_LABEL[domainKey] ?? domainKey} obligation register`}
                      columns={obligationColumns()}
                      rows={rows}
                      getRowId={(row) => row.id}
                      updatingRowIds={updatingObligationIds}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Drawer open={openDocId !== null} title={displayDoc ? decodeDocText(displayDoc.t) : ''} onClose={() => setOpenDocId(null)} footer={drawerFooter}>
        {displayDoc ? (
          <>
            <DrawerContent kind="doc" fields={drawerFields} tags={drawerTags} />
            {displayDoc.redline ? (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <RedlineDiffView
                  before={decodeDocText(displayDoc.redline.old)}
                  after={decodeDocText(displayDoc.redline.nw)}
                  hitl
                  hitlText={isDisplayDocAdopted ? 'Adopted' : 'HITL review'}
                />
                <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--ink2)' }}>{decodeDocText(displayDoc.redline.note)}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </Drawer>

      {toast ? (
        <div style={TOAST_WRAP_STYLE}>
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
            {...(toast.cascade.length > 0 ? { linkLabel: 'View impact →', onLinkPress: handleViewImpact, dismissOnLinkPress: true } : {})}
          />
        </div>
      ) : null}
    </div>
  );
}
