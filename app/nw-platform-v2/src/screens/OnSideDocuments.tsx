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
 * AMBIGUITY RESOLVED — Adopt→cascade mapping is authored here, not ported:
 * `data/onside.ts`'s own file header states plainly that "adoptTarget,
 * oblToClose... render/derive functions... are not ported [as data];
 * those... belong to whichever component consumes this data." This screen
 * is that consumer. `cascadeTargetsForDoc` below builds the mapping from
 * two verbatim relations already present in the ported data:
 *   (a) `GAPS` board entries reference a redline doc via `doc` (direct) or
 *       `rl` (redline-document pointer — used when the open item's
 *       evidence doc differs from the doc actually carrying the redline,
 *       e.g. TPRM-08's gap item has `doc:'exit-draft'` but
 *       `rl:'tprm-program'`, the doc this screen's Adopt button acts on).
 *       A matched entry's own `obl` tuple names the domain + obligation id
 *       to flip.
 *   (b) `DocEntry.obl` ("Obligation ids this document evidences," per
 *       doclib.ts) for any id not already `'met'` — reaches obligations a
 *       redline closes even with no curated GAPS board entry (e.g.
 *       `gen-ai-draft` → MRM-11), while never re-flipping an obligation the
 *       document merely evidences as already-satisfied (`tprm-program`'s
 *       own `obl` list is all-`'met'` baseline evidence, unrelated to the
 *       TPRM-08 gap its redline actually closes — source (a) already
 *       covers that one correctly, so (b) is a no-op for it).
 * Flagging this mapping for design-authority confirmation since it is a
 * genuine judgment call, not a literal spec table.
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
 * superseded commit is a silent no-op), and `adoptedDocIds`/`adoptingDocId`
 * both serialize Adopt globally (only one commit in flight at a time, and a
 * doc already adopted can never be re-adopted). The cascade write itself is
 * also idempotent by construction (flipping an obligation already `'met'`
 * to `'met'` is a no-op), so even a slipped-through double-press cannot
 * double-apply a state change. No component test can execute this path in
 * this worktree today (see STOP-item below) — a verifier dispatch should
 * exercise: rapid double-click on Adopt, and closing the drawer mid-commit
 * (the commit still resolves and the Toast still surfaces truth once ready,
 * per Core Principle 1: "queued/pending... displayed as pending, not hidden
 * behind a spinner that implies progress it cannot see").
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
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner or component-testing
 * library installed, matching every sibling screen/composite already
 * landed here (`Home.tsx`, `BoardDeck.tsx`). TDD-with-executed-output is
 * therefore not achievable within this dispatch's file boundary; verified
 * instead via `npx tsc --noEmit` against the whole `src/` tree (strict
 * mode, `exactOptionalPropertyTypes`) to confirm this file type-checks
 * against the real `DataTable`/`Drawer`/`DrawerContent`/`RedlineDiffView`/
 * `FilterBar`/`Toast`/`Topbar`/`Sidebar` prop shapes. Recommending the same
 * test-tooling follow-up dispatch `Home.tsx`/`BoardDeck.tsx` already
 * recommend.
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

type DocRow = DocEntry & { id: string };

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

const ALL_DOCS: DocRow[] = Object.entries(DOCLIB).map(([id, doc]) => ({ id, ...doc }));

const DOC_DOMAIN_COUNTS: Record<string, number> = {};
for (const doc of ALL_DOCS) DOC_DOMAIN_COUNTS[doc.dom] = (DOC_DOMAIN_COUNTS[doc.dom] ?? 0) + 1;

const DOC_STATUS_COUNTS: Record<DocStatus, number> = { good: 0, warn: 0, crit: 0 };
for (const doc of ALL_DOCS) DOC_STATUS_COUNTS[doc.status]++;

const REDLINE_DOC_COUNT = ALL_DOCS.filter((doc) => doc.redline).length;

/** See file header "no dedicated 'domain view' screen." */
function findObligationDomain(oblId: string): string | null {
  for (const domainKey of Object.keys(OBL)) {
    if (OBL[domainKey]?.some((row) => row.id === oblId)) return domainKey;
  }
  return null;
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
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRedlineFilter, setSelectedRedlineFilter] = useState<string[]>([]);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [adoptingDocId, setAdoptingDocId] = useState<string | null>(null);
  const [adoptedDocIds, setAdoptedDocIds] = useState<ReadonlySet<string>>(new Set());
  const [obligationOverrides, setObligationOverrides] = useState<Record<string, Record<string, ObligationRow['st']>>>({});
  const [resolvedGapKeys, setResolvedGapKeys] = useState<ReadonlySet<string>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [updatingObligationIds, setUpdatingObligationIds] = useState<ReadonlySet<string>>(new Set());
  const [cascadeAnnouncement, setCascadeAnnouncement] = useState('');

  const requestSeqRef = useRef(0);
  const domainSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const updatingTimeoutRef = useRef<number | undefined>(undefined);
  const lastOpenDocRef = useRef<DocRow | null>(null);

  const openDoc = openDocId ? (ALL_DOCS.find((d) => d.id === openDocId) ?? null) : null;
  if (openDoc) lastOpenDocRef.current = openDoc;
  // Keeps Drawer's title/body populated with the last real doc through its
  // ~200ms closing animation instead of blanking the instant openDocId is
  // cleared (Adopt/Reject both clear it immediately) — a genuinely closed
  // Drawer (open=false, phase 'closed') still renders nothing at all, since
  // Drawer.tsx returns null in that phase regardless of what we pass it.
  const displayDoc = openDoc ?? lastOpenDocRef.current;

  function statusOf(domain: string, oblId: string): ObligationRow['st'] {
    const override = obligationOverrides[domain]?.[oblId];
    if (override) return override;
    return OBL[domain]?.find((row) => row.id === oblId)?.st ?? 'met';
  }

  function cascadeTargetsForDoc(doc: DocRow): CascadeTarget[] {
    const targets = new Map<string, string>(); // oblId -> domain

    for (const gap of GAPS) {
      if ((gap.doc === doc.id || gap.rl === doc.id) && gap.obl) {
        targets.set(gap.obl[1], gap.obl[0]);
      }
    }
    for (const oblId of doc.obl) {
      const domain = findObligationDomain(oblId);
      if (domain && statusOf(domain, oblId) !== 'met') targets.set(oblId, domain);
    }

    return Array.from(targets, ([oblId, domain]) => ({ domain, oblId }));
  }

  function effectiveDocStatus(doc: DocRow): DocStatus {
    return adoptedDocIds.has(doc.id) && doc.status !== 'good' ? 'good' : doc.status;
  }

  const handleAdopt = (doc: DocRow) => {
    if (adoptedDocIds.has(doc.id) || adoptingDocId !== null) return;
    const requestKey = ++requestSeqRef.current;
    setAdoptingDocId(doc.id);
    window.setTimeout(() => {
      // Superseded (a later Adopt press started, or requestSeqRef moved on)
      // — this stale commit never applies. See file header irreversibility
      // gate note.
      if (requestSeqRef.current !== requestKey) return;

      const cascade = cascadeTargetsForDoc(doc);
      if (cascade.length > 0) {
        setObligationOverrides((prev) => {
          const next: Record<string, Record<string, ObligationRow['st']>> = { ...prev };
          for (const { domain, oblId } of cascade) {
            next[domain] = { ...(next[domain] ?? {}), [oblId]: 'met' };
          }
          return next;
        });
      }

      const resolvedTitles = GAPS.filter((g) => g.doc === doc.id || g.rl === doc.id).map(gapKey);
      if (resolvedTitles.length > 0) {
        setResolvedGapKeys((prev) => new Set([...prev, ...resolvedTitles]));
      }

      setAdoptedDocIds((prev) => new Set(prev).add(doc.id));
      setAdoptingDocId(null);
      setOpenDocId(null);
      setToast({ variant: 'success', message: `${decodeDocText(doc.t)} adopted.`, cascade });
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
        const stillOpen = rows.filter((row) => statusOf(domain, row.id) !== 'met').length;
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

  const filteredDocs = ALL_DOCS.filter((doc) => {
    if (selectedDomains.length > 0 && !selectedDomains.includes(doc.dom)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(effectiveDocStatus(doc))) return false;
    if (selectedRedlineFilter.length > 0) {
      const isAdopted = adoptedDocIds.has(doc.id);
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
      render: (row) => {
        const status = effectiveDocStatus(row);
        return <Tag text={STATUS_LABEL[status]} variant={STATUS_TAG_VARIANT[status]} />;
      },
    },
    {
      id: 'redline',
      header: 'Redline',
      render: (row) => {
        if (!row.redline) return <span style={{ color: 'var(--ink3)' }}>—</span>;
        return adoptedDocIds.has(row.id) ? <Tag text="Adopted" variant="status-positive" /> : <Tag text="Redline pending" variant="hitl" />;
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
    options: (['good', 'warn', 'crit'] as DocStatus[]).map((s) => ({ id: s, label: STATUS_LABEL[s], count: DOC_STATUS_COUNTS[s] })),
    selectedIds: selectedStatuses,
    onToggle: (id) => setSelectedStatuses((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const redlineFilterGroup: FilterGroup = {
    id: 'redline',
    label: 'Redlines',
    options: [
      { id: 'pending', label: 'Pending', count: REDLINE_DOC_COUNT - adoptedDocIds.size },
      { id: 'adopted', label: 'Adopted', count: adoptedDocIds.size },
    ],
    selectedIds: selectedRedlineFilter,
    onToggle: (id) => setSelectedRedlineFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
  };

  const isDisplayDocAdopted = displayDoc ? adoptedDocIds.has(displayDoc.id) : false;
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

  const drawerTags: DrawerContentTag[] = displayDoc
    ? [{ text: STATUS_LABEL[effectiveDocStatus(displayDoc)], variant: STATUS_TAG_VARIANT[effectiveDocStatus(displayDoc)] }]
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

  const openGaps = GAPS.filter((g) => !resolvedGapKeys.has(gapKey(g)));

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

  function obligationColumns(domainKey: string): DataTableColumn<ObligationRow>[] {
    return [
      { id: 'id', header: 'Obligation', render: (row) => <strong>{row.id}</strong> },
      { id: 'requirement', header: 'Requirement', render: (row) => <span>{decodeDocText(row.s)}</span> },
      { id: 'citation', header: 'Citation', render: (row) => <span style={{ color: 'var(--ink2)' }}>{decodeDocText(row.cite)}</span> },
      {
        id: 'status',
        header: 'Status',
        render: (row) => {
          const st = obligationOverrides[domainKey]?.[row.id] ?? row.st;
          return <Tag text={OBL_STATUS_LABEL[st]} variant={OBL_STATUS_VARIANT[st]} />;
        },
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
          <h1 id="onside-documents-title" style={TITLE_STYLE}>
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
                      columns={obligationColumns(domainKey)}
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
