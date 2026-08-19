/**
 * Cases — screen (parity_ia_addendum.md §1.1 `cases`/`case:ID` rows, Batch 4
 * "Cases · approvals").
 *
 * Base engine anchors: CASES + full state machine (leapfi-platform.html
 * 2567-2768); case action handlers, `caseAccept`…`caseReopen` (2668-2767);
 * case views, `osCases` (list, 2793-2810) + `osCasePage` (detail, delegated
 * to `../views/CaseDetail.tsx`, 2854-2903).
 *
 * NO SIDEBAR LEAF (design_system_spec.md §3.1's own explicit disposition:
 * "`Cases`/`Lifecycle`/`board-update`/`Onboarding` (OnSide) are **not**
 * separate nested sidebar entries — reachable via in-screen links only").
 * This screen still renders the full Topbar+Sidebar+`<main>` shell (the
 * addendum's own `screens/` vs `views/` method note: a `screens/` file "has
 * its own ScreenId in App.tsx, is a full Topbar+Sidebar+<main>
 * composition") — it just never appears as a highlighted `Sidebar` item.
 * `sidebarProps.activeId` below is set to `'cases'`, an id that matches no
 * entry in `Sidebar.tsx`'s `NAV` table by construction, so nothing
 * highlights and no group force-expands — an honest "you are somewhere the
 * primary nav doesn't name" state, not a fabricated match onto an unrelated
 * item (Core Principle 3).
 *
 * ENTRY POINTS (all three are now wired — this paragraph previously
 * claimed "none of these three is wired yet", stale since the shell gave
 * this screen its `ScreenId` case and threads `currentUser`/`initialCaseId`
 * from shell state):
 *   1. OnSide · Overview's "Cases · approvals" link row
 *      (`OnSideOverview.tsx` → `onNavigate('cases')`).
 *   2. The Notification Bell panel (`views/NotificationBellPanel.tsx`):
 *      App.tsx routes per-notification rows here with the notification's
 *      `cid` as `initialCaseId` (and a press-nonce key so re-opening the
 *      same case remounts — see App.tsx's own header).
 *   3. Reporting's Gap Closure Board Approval Report "Open cases" link
 *      (`Reporting.tsx` → `onNavigate('cases')`), matching base engine
 *      1504/3722 ("Open cases" -> `onsideShow('cases')`).
 *
 * NOTIFICATIONS (CS-01, cases-batch half): every stage transition the base
 * pairs with a `notify()` call (leapfi-platform.html 2691/2707/2715/2724/
 * 2749/2758) now calls the matching `state/demoStore.ts` helper inside its
 * `performAction` mutation, so the bell the toasts point at actually
 * receives the notification. Titles are entity-decoded at the write site
 * (the base decodes via innerHTML at render; the twin's panel renders
 * text).
 *
 * RELEASE-NOTES RECONCILIATION (CS-12 — disposition note; every control
 * surface involved is outside this batch's allowlist, so the disposition
 * is recorded here per the dispatch's own allowance): `SettingsAbout.tsx`'s
 * verbatim-ported release notes promised three affordances the twin had
 * reduced. UPDATED (B-15 fix batch): the first of the three is now BUILT —
 * `SettingsToggles.tsx`'s approval matrix regained v1.060's per-tier
 * committee-vote toggle and editable committee name (both as local,
 * unpersisted component state, the same no-backend contract the base's own
 * `toggleTierCommittee`/`setCommitteeName` carried) — so that changelog
 * entry is no longer a reduction to reconcile. The other two remain
 * sanctioned reductions: v1.057's "Reset demo lives under your avatar, or
 * Shift + Alt + R" (the twin's full reset is the presenter rail's Restart →
 * `state/demoStore.ts` `resetDemo()`; no avatar-menu reset entry or
 * Shift+Alt+R chord exists — `App.tsx`/`Topbar.tsx`), and v1.071's "the
 * Cases tab carries the count" (no Cases sidebar leaf by
 * design_system_spec.md §3.1's own disposition — see NO SIDEBAR LEAF
 * above). The residual defect is the unreconciled changelog copy itself
 * (still promising all three verbatim), which lives in
 * `SettingsAbout.tsx` — fix belongs there (trim/annotate the now-stale
 * v1.060 entry, keep the other two flagged), by whichever dispatch holds
 * that file.
 *
 * ROLE-GATED PRIMARY ACTION (task line, Core Principle 2): enforced in
 * `../views/CaseDetail.tsx`, not here — see that file's header. This screen
 * supplies the `currentUser` the gating is checked against.
 *
 * CASES SEEDING: the base engine calls `seedCases()` once at boot
 * (`seedCases();`, source line 3924); the twin still has no dedicated
 * boot sequence, so the call lives at this module's top level, guarded so
 * it only ever seeds once (`if (CASES.length === 0)`) — idempotent
 * against React StrictMode's double-invoke and against this screen
 * mounting more than once per session — and, because `CASES` is a shared
 * module-level array (not this component's local state), case data
 * persists across this screen's own mount/unmount cycles exactly like the
 * base engine's global `CASES` does. (An earlier header claim that
 * seedCases was "never invoked anywhere in this worktree" is stale and
 * removed: `views/HomePanels.tsx` carries the same import-time guard, and
 * `state/demoStore.ts`'s `resetDemo()` re-runs `seedCases(DOCLIB)` on
 * every presenter-rail Restart — base source 3946.) Still recommending
 * the boot-time seed be relocated to a real app-boot sequence once one
 * exists, rather than living on the first screens that need the data.
 *
 * FORCE-RENDER ON SHARED-STATE MUTATION: case-data mutations write directly
 * onto `CASES` array entries (mirroring the base engine's own mutate-in-
 * place model — `data/cases.ts`'s own header notes this "export let CASES"
 * pattern is deliberate), which is not React state and produces no render
 * on its own. `renderTick` is bumped after every committed mutation purely
 * to force this component to re-render and re-derive its view from the
 * now-changed `CASES`/`DOCLIB` — the same problem `OnSideDocuments.tsx`
 * solves with real `useState` because its mutable fields
 * (`obligationOverrides` etc.) are screen-local; here the source of truth
 * is a cross-screen singleton instead, so a plain force-update counter is
 * the correct tool, not a design shortcut.
 *
 * Irreversibility gate (persona directive 6): `performAction` is this
 * file's single commit pipeline for every case-stage transition (Accept,
 * Reject, Route to counsel, Conditional approval, Counsel opinion, Attach
 * minutes, Record condition met, Final approval & adopt, Reopen, Save/
 * revert language). One case action is ever in flight at a time
 * (`pendingAction`, mirroring `OnSideDocuments.tsx`'s `adoptingDocId`
 * single-flight precedent); a monotonic `requestSeqRef` counter is
 * captured per press and re-checked when the simulated commit resolves, so
 * a stale, superseded commit (e.g. a slipped-through double-press) is a
 * silent no-op rather than a double-applied state change — the UI only
 * ever shows "done" once the (simulated) server commit has actually
 * resolved (Core Principle 1). `../views/CaseDetail.tsx` renders the
 * in-flight action's own Button as `loading` and disables every other
 * action Button on the case while a commit is outstanding, so this is a
 * true pessimistic-render flow, not a disabled-button-only guarantee.
 * Paths still worth a dedicated interaction test: rapid double-press on
 * "Final approval & adopt," and navigating back to the list mid-commit
 * (the commit still resolves against the shared `CASES` array and the
 * next detail-view open of that case reflects the true outcome, since
 * `CASES` is not screen-local state that a navigate-away would discard).
 *
 * Accessibility gate (persona directive 7): both case tables are real
 * `<table>` semantics via `DataTable` (C6); the toast confirming a
 * committed action is `role="status"`/`aria-live="polite"` (`Toast`, C17,
 * unmodified here); detail-view accessibility (real buttons, labelled
 * textarea, text-paired status Tags) is documented in
 * `../views/CaseDetail.tsx`'s own header.
 *
 * Tests: this screen's regression coverage lives in
 * `src/__tests__/reporting_cases/` (vitest + Testing Library; the earlier
 * header claim that no test runner existed is stale and removed). Also
 * verified via `npx tsc --noEmit` (strict mode,
 * `exactOptionalPropertyTypes`, `noUnusedLocals`).
 *
 * Layout constants (240px sidebar column, 2rem content padding): copied
 * verbatim from `Home.tsx`'s/`OnSideDocuments.tsx`'s own documented
 * implementer judgment call for visual consistency across screens, not
 * re-derived independently.
 */
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn, DataTableRowAction } from '../components/DataTable';
import { Toast } from '../components/Toast';
import { Tag } from '../components/primitives/Tag';
import type { TagVariant } from '../components/primitives/Tag';
import { CaseDetail } from '../views/CaseDetail';
import type { CaseActionKind } from '../views/CaseDetail';
import { APPROVAL, CASES, seedCases, stamp, tierOf } from '../data/cases';
import type { Case } from '../data/cases';
import { DOCLIB } from '../data/doclib';
import { CURRENT } from '../data/studio';
import type { StudioUser } from '../data/studio';
import {
  notifyCaseAdopted,
  notifyCaseCommittee,
  notifyCaseOpinion,
  notifyCaseRejected,
  notifyCaseRouted,
  notifyCaseRoutedLegal,
} from '../state/demoStore';

// See file header "CASES SEEDING."
if (CASES.length === 0) {
  seedCases(DOCLIB);
}

const ENTITY_MAP: Record<string, string> = {
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

/** See `OnSideDocuments.tsx`'s identical-purpose `decodeDocText`. */
function decodeText(input: string): string {
  return input
    .replace(/<\/?(b|strong|em|br)\s*\/?>/gi, '')
    .replace(/&[a-z#0-9]+;/gi, (match) => ENTITY_MAP[match] ?? match);
}

function isUntouched(c: Case): boolean {
  return c.stage === 'analyst' && !c.edited && c.history.length <= 1;
}

function stagePill(c: Case): { text: string; variant: TagVariant } {
  if (c.stage === 'closed') return { text: 'Adopted', variant: 'status-positive' };
  if (c.stage === 'rejected') return { text: 'Returned', variant: 'status-alert' };
  if (c.stage === 'cro') return { text: 'With the CRO', variant: 'status-caution' };
  if (c.stage === 'legal') return { text: 'With counsel', variant: 'status-caution' };
  if (c.stage === 'committee') return { text: `At ${APPROVAL.committee}`, variant: 'status-caution' };
  if (c.stage === 'final') return { text: 'Conditional · final approval open', variant: 'status-caution' };
  if (isUntouched(c)) return { text: 'Not decided yet', variant: 'count' };
  return { text: 'Back with the analyst', variant: 'status-caution' };
}

/** Ported verbatim, `caseWaitingOn` (leapfi-platform.html 2617-2622). */
function waitingOnRoleKey(stage: string): string | null {
  if (stage === 'analyst') return 'analyst';
  if (stage === 'cro' || stage === 'final' || stage === 'committee') return 'cro';
  if (stage === 'legal') return 'legal';
  return null;
}

/** Simulated commit latency for every case-stage transition below — same
 * judgment call as `OnSideDocuments.tsx`'s `ADOPT_COMMIT_DELAY_MS` (no
 * value named in design_system_spec.md §1.4's token-only scope): long
 * enough that a Button's `loading` state reads as a real wait, per Core
 * Principle 1, rather than an instant flip indistinguishable from fake. */
const ACTION_COMMIT_DELAY_MS = 550;

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
const TITLE_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' };
const SUBHEADING_STYLE: CSSProperties = { margin: 0, font: 'inherit', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--ink)' };
const SECTION_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const NOTE_STYLE: CSSProperties = { margin: 0, fontSize: '0.875rem', color: 'var(--ink2)', maxWidth: '52rem' };
const SCROLL_WRAP_STYLE: CSSProperties = { overflowX: 'auto' };
const CITE_STYLE: CSSProperties = { margin: '0.15rem 0 0', fontSize: '0.8125rem', color: 'var(--ink2)' };

export interface CasesProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`/`OnSideDocuments.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen and deliberately matches nothing in `Sidebar.tsx`'s `NAV` table — see file header "NO SIDEBAR LEAF." */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** Defaults to `CURRENT` (Rachel Fischer, CRO), matching `App.tsx`'s own default persona. See file header ENTRY POINTS. */
  currentUser?: StudioUser;
  /** Deep-entry hook for the three named entry points — opens straight to a case's detail state instead of the list. App.tsx passes the bell row's case id here (see file header ENTRY POINTS). */
  initialCaseId?: string;
}

export function Cases({ topbar, onNavigate, sidebarVersionLabel, currentUser = CURRENT, initialCaseId }: CasesProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId ?? null);
  const [pendingAction, setPendingAction] = useState<{ caseId: string; kind: CaseActionKind } | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  // `key` (CS-09): a fresh value per committed action, used as the Toast's
  // React key so a replacement message REMOUNTS the Toast and re-arms its
  // 5s auto-dismiss timer — a re-propped Toast keeps the prior mount's
  // timer and can vanish almost immediately.
  const [toast, setToast] = useState<{ key: number; variant: 'success' | 'info'; message: string } | null>(null);
  const requestSeqRef = useRef(0);

  function logEntry(c: Case, what: string, note: string): void {
    c.history.unshift({ when: stamp(), who: currentUser.name, role: currentUser.role, what, note });
  }

  /** Decoded (display-safe) case ref for the store's notification helpers
   * (CS-01): the base writes `c.title` into `innerHTML`, which decodes the
   * entities at render time — the twin's bell panel renders text, so the
   * decode happens here at the write site instead. */
  function notifRef(c: Case): { id: string; title: string } {
    return { id: c.id, title: decodeText(c.title) };
  }

  /** Single commit pipeline for every case-stage transition — see file
   * header "Irreversibility gate." `mutate` receives the live `Case`
   * (found fresh from `CASES`, so it always sees the latest state even if
   * called after other mutations) and the matching `DOCLIB` entry, if any. */
  function performAction(caseId: string, kind: CaseActionKind, mutate: (c: Case, doc: (typeof DOCLIB)[string] | undefined) => void, toastMessage: (c: Case) => string): void {
    if (pendingAction !== null) return; // single in-flight, matches OnSideDocuments.tsx's adoptingDocId precedent
    const c = CASES.find((x) => x.id === caseId);
    if (!c) return;
    const requestKey = ++requestSeqRef.current;
    setPendingAction({ caseId, kind });
    window.setTimeout(() => {
      if (requestSeqRef.current !== requestKey) return; // superseded — stale commit is a no-op
      mutate(c, DOCLIB[c.doc]);
      setPendingAction(null);
      setRenderTick((t) => t + 1);
      setToast({ key: requestKey, variant: 'success', message: toastMessage(c) });
    }, ACTION_COMMIT_DELAY_MS);
  }

  function handleAction(kind: CaseActionKind, payload?: string): void {
    if (!selectedCaseId) return;
    const caseId = selectedCaseId;

    if (kind === 'accept') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.stage = 'cro';
          logEntry(c, c.edited ? 'Accepted with edits and routed for approval' : 'Accepted as drafted and routed for approval', 'Sent to R. Fischer, Chief Risk Officer.');
          notifyCaseRouted(notifRef(c)); // base caseAccept notify(), source 2691 (CS-01)
        },
        () => 'Routed to the CRO. Notified in the app and by email.',
      );
    } else if (kind === 'reject') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.stage = 'rejected';
          logEntry(c, 'Rejected · returned to OnSide', 'Nothing changes in the in-force document until a draft is approved.');
          notifyCaseRejected(notifRef(c)); // base caseReject notify(), source 2758 (CS-01)
        },
        () => 'Returned to OnSide to redraft. The in-force document is untouched.',
      );
    } else if (kind === 'route-legal') {
      // See CaseDetail.tsx file header "backTo simplification": this
      // action is only ever reachable from the `cro` stage in this
      // build's UI, so the opinion handlers below can resolve back to
      // 'cro' directly without a separate stored return-stage.
      performAction(
        caseId,
        kind,
        (c) => {
          c.stage = 'legal';
          logEntry(c, 'Routed to legal counsel', 'Sent to D. Reyes, General Counsel, to validate the language before approval.');
          notifyCaseRoutedLegal(notifRef(c)); // base caseRouteLegal notify(), source 2715 (CS-01)
        },
        () => 'Routed to counsel. Notified in the app and by email.',
      );
    } else if (kind === 'opinion-clear') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.opinion = 'Cleared as drafted';
          c.stage = 'cro';
          logEntry(c, 'Counsel opinion recorded · Cleared as drafted', 'No change required to the proposed language.');
          notifyCaseOpinion(notifRef(c), true); // base caseOpinion notify(), source 2724 (CS-01)
        },
        () => 'Counsel cleared it. Back with the CRO.',
      );
    } else if (kind === 'opinion-return') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.opinion = 'Returned with drafting notes';
          c.stage = 'analyst';
          logEntry(c, 'Counsel opinion recorded · Returned with drafting notes', 'Counsel asked for narrower wording. Back to the analyst to redraft.');
          notifyCaseOpinion(notifRef(c), false); // base caseOpinion notify(), source 2724 (CS-01)
        },
        () => 'Counsel returned notes. Back with the analyst.',
      );
    } else if (kind === 'conditional') {
      const cond = payload ?? APPROVAL.conditions[0] ?? '';
      performAction(
        caseId,
        kind,
        (c) => {
          c.cond = cond;
          c.condMet = false;
          const isCommittee = cond === APPROVAL.conditions[0];
          c.stage = isCommittee ? 'committee' : 'final';
          logEntry(
            c,
            'Conditional approval',
            isCommittee
              ? `Approved subject to ${APPROVAL.committee} approval. Added to the Gap Closure Board Approval Report.`
              : `Approved subject to: ${cond}. Final approval follows once the condition is evidenced.`,
          );
          if (isCommittee) notifyCaseCommittee(notifRef(c)); // base caseConditional notify(), source 2707 (CS-01)
        },
        (c) => (c.cond === APPROVAL.conditions[0] ? `Conditional approval recorded. ${decodeText(c.title)} is now in the Gap Closure Board Approval Report.` : `Conditional approval recorded. Waiting on: ${c.cond ?? ''}.`),
      );
    } else if (kind === 'attach-minutes') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.minutes = `${APPROVAL.committee} minutes · Aug 15, 2026 · carried 6-0`;
          c.condMet = true;
          c.stage = 'final';
          logEntry(c, `${APPROVAL.committee} approved · minutes attached`, `${c.minutes}. The vote is now part of the evidence chain.`);
        },
        () => 'Minutes attached. The condition is satisfied and final approval is open.',
      );
    } else if (kind === 'condition-met') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.condMet = true;
          logEntry(c, `Condition evidenced · ${c.cond ?? ''}`, 'Final approval is now open.');
        },
        () => 'Condition recorded as met. Final approval is now open.',
      );
    } else if (kind === 'approve') {
      performAction(
        caseId,
        kind,
        (c, doc) => {
          if (c.stage !== 'cro' && c.stage !== 'final') return;
          if (c.stage === 'final' && !c.condMet) return;
          c.stage = 'closed';
          if (doc?.redline) doc.redline.nw = c.lang;
          logEntry(c, 'Final approval · adopted', `${c.cond ? `Condition satisfied: ${c.cond}. ` : ''}Prior text archived, the fingerprint re-sealed, connected systems notified.`);
          notifyCaseAdopted(notifRef(c)); // base caseApprove notify(), source 2749 (CS-01)
        },
        () => 'Adopted. The obligation behind it is now met and the gap has left the queue.',
      );
    } else if (kind === 'reopen') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.stage = 'analyst';
          logEntry(c, 'Reopened for redraft', '');
        },
        () => 'Reopened for redraft.',
      );
    } else if (kind === 'save-language') {
      performAction(
        caseId,
        kind,
        (c) => {
          const value = (payload ?? '').trim();
          if (!value) return;
          const changed = value !== c.lang;
          c.lang = value;
          if (changed) {
            c.edited = true;
            logEntry(c, 'Edited the proposed language', 'OnSide’s draft kept as the base version. Both texts stay in the case.');
          }
        },
        (c) => (c.edited ? 'Language updated. The original OnSide draft is kept in the case.' : 'No change to the language.'),
      );
    } else if (kind === 'revert-language') {
      performAction(
        caseId,
        kind,
        (c) => {
          c.lang = c.base;
          c.edited = false;
          logEntry(c, 'Reverted to the OnSide draft', '');
        },
        () => 'Reverted to the language OnSide proposed.',
      );
    }
  }

  const selectedCase = selectedCaseId ? (CASES.find((c) => c.id === selectedCaseId) ?? null) : null;
  const openCases = CASES.filter((c) => c.stage !== 'closed' && c.stage !== 'rejected');
  const doneCases = CASES.filter((c) => c.stage === 'closed' || c.stage === 'rejected');
  const undecidedCount = CASES.filter(isUntouched).length;
  const waitingOnMeCount = CASES.filter((c) => waitingOnRoleKey(c.stage) === currentUser.roleKey).length;

  const columns: DataTableColumn<Case>[] = [
    { id: 'id', header: 'Case', sortable: true, sortValue: (row) => row.id, render: (row) => <strong>{row.id}</strong> },
    {
      id: 'title',
      header: 'Title',
      sortable: true,
      sortValue: (row) => decodeText(row.title),
      render: (row) => (
        <div>
          <span>{decodeText(row.title)}</span>
          {waitingOnRoleKey(row.stage) === currentUser.roleKey ? (
            <span style={{ marginLeft: '0.5rem' }}>
              <Tag text="Waiting on you" variant="hitl" />
            </span>
          ) : null}
          <div style={CITE_STYLE}>{decodeText(row.trigger).split(' · ')[0]}</div>
        </div>
      ),
    },
    { id: 'stage', header: 'Stage', render: (row) => { const pill = stagePill(row); return <Tag text={pill.text} variant={pill.variant} />; } },
    { id: 'owner', header: 'Owner', sortable: true, sortValue: (row) => decodeText(row.owner), render: (row) => <span>{decodeText(row.owner)}</span> },
    { id: 'tier', header: 'Approval tier', render: (row) => <span>{tierOf(row.tier).n}</span> },
  ];

  const rowAction: DataTableRowAction<Case> = {
    label: () => 'Open',
    onPress: (row) => setSelectedCaseId(row.id),
  };

  const sidebarProps: SidebarProps = {
    activeId: 'cases',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="cases" data-lf-render-tick={renderTick} style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="cases-main" style={MAIN_STYLE} aria-labelledby="cases-title">
          {selectedCase ? (
            <CaseDetail
              caseItem={selectedCase}
              doc={DOCLIB[selectedCase.doc]}
              currentUser={currentUser}
              onBack={() => setSelectedCaseId(null)}
              onAction={handleAction}
              pendingAction={pendingAction && pendingAction.caseId === selectedCase.id ? pendingAction.kind : null}
              onNavigate={onNavigate}
              // Base switchUser doclinks (CS-08): the persona rows this
              // screen already owns via the Topbar bundle are the twin's
              // switch-user mechanism — only offered when the shell
              // actually supplied persona rows (the fixture case of an
              // empty menu renders no dead links).
              {...(topbar.profileMenuItems.length > 0
                ? {
                    onSwitchUser: (userId: string) => {
                      topbar.profileMenuItems.find((item) => item.id === userId)?.onPress();
                    },
                  }
                : {})}
            />
          ) : (
            <>
              <div>
                <h1 id="cases-title" style={TITLE_STYLE}>
                  Cases
                </h1>
                <p style={{ ...NOTE_STYLE, marginTop: '0.5rem' }}>
                  {undecidedCount > 0 ? `${undecidedCount === openCases.length ? 'None' : `${undecidedCount} of ${openCases.length}`} ${undecidedCount === 1 ? 'has' : 'have'} been decided yet.` : ''}
                  {waitingOnMeCount > 0 ? ` ${waitingOnMeCount} ${waitingOnMeCount === 1 ? 'case is' : 'cases are'} waiting on you.` : ''}
                </p>
              </div>

              <section aria-labelledby="cases-open-heading" style={SECTION_STYLE}>
                <h2 id="cases-open-heading" style={SUBHEADING_STYLE}>
                  {openCases.length} open
                </h2>
                <div style={SCROLL_WRAP_STYLE}>
                  <DataTable
                    caption="Open cases"
                    columns={columns}
                    rows={openCases}
                    getRowId={(row) => row.id}
                    rowAction={rowAction}
                    emptyMessage="No open cases."
                    defaultSortColumnId="id"
                  />
                </div>
              </section>

              {doneCases.length > 0 ? (
                <section aria-labelledby="cases-closed-heading" style={SECTION_STYLE}>
                  <h2 id="cases-closed-heading" style={SUBHEADING_STYLE}>
                    Closed cases · {doneCases.length}
                  </h2>
                  <div style={SCROLL_WRAP_STYLE}>
                    <DataTable caption="Closed cases" columns={columns} rows={doneCases} getRowId={(row) => row.id} rowAction={rowAction} />
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>
      </div>

      {toast ? (
        // A-overlap-04: `Toast` is now self-positioning (fixed bottom-center,
        // its own internal anchor — see components/Toast.tsx's
        // SELF-POSITIONING note) — the screen-level fixed top-right wrapper
        // this mount used is removed; it occluded the Topbar's bell/date/
        // theme/profile cluster and is inert against Toast's own anchor
        // regardless. `key` still remounts the Toast per committed action
        // (CS-09) so every confirmation gets its full 5s.
        <Toast key={toast.key} variant={toast.variant} message={toast.message} onDismiss={() => setToast(null)} autoDismissMs={5000} />
      ) : null}
    </div>
  );
}
