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
 * ENTRY POINTS (dispatch brief's explicit documentation ask — none of these
 * three is wired yet, since each lives in a screen outside this batch's
 * allowlist; `initialCaseId`/`onNavigate` below are this screen's half of
 * each integration):
 *   1. OnSide · Overview's "Cases · approvals" link row — Batch 1
 *      (`screens/OnSideOverview.tsx`), not yet landed in this worktree as
 *      of this dispatch.
 *   2. The Notification Bell panel — Batch 7 (`views/NotificationBellPanel.tsx`).
 *      Per-notification rows should route here with the notification's
 *      `cid` as `initialCaseId`.
 *   3. Reporting's Gap Closure Board Approval Report "Open cases" link —
 *      Batch 5 (`views/ReportView.tsx`, `gapboard` kind), matching base
 *      engine 1504/3722 exactly ("Open cases" -> `onsideShow('cases')`).
 * Whichever dispatch wires `App.tsx`'s routing for this screen (out of
 * every batch's allowlist per the addendum's own "wiring note" convention)
 * is also the dispatch that gives this screen a `ScreenId` case and threads
 * `currentUser`/`initialCaseId` from shell state — see `CasesProps` below.
 *
 * ROLE-GATED PRIMARY ACTION (task line, Core Principle 2): enforced in
 * `../views/CaseDetail.tsx`, not here — see that file's header. This screen
 * supplies the `currentUser` the gating is checked against.
 *
 * CASES SEEDING (STOP-item, flagged rather than silently worked around):
 * `data/cases.ts`'s `seedCases(DOCLIB)` is never invoked anywhere in this
 * worktree — the base engine calls it once at boot (`seedCases();`, source
 * line 3924), but no `App.tsx`-level boot sequence exists yet to port that
 * call to (App.tsx is out of this dispatch's allowlist, and seeding is
 * cross-cutting demo-data setup, not this screen's own concern). Without
 * seeding, `CASES` stays permanently empty and this screen has nothing to
 * show. Resolved here, at this module's top level, guarded so it only ever
 * seeds once (`if (CASES.length === 0)`) — idempotent against React
 * StrictMode's double-invoke and against this screen mounting more than
 * once per session, and, because `CASES` is a shared module-level array
 * (not this component's local state), case data now persists across this
 * screen's own mount/unmount cycles exactly like the base engine's global
 * `CASES` does. Recommending this seed call be relocated to a real
 * app-boot sequence once one exists, rather than living on the first
 * screen that happens to need the data.
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
 * true pessimistic-render flow, not a disabled-button-only guarantee. No
 * component/interaction test exists in this worktree to execute the
 * double-click path (see STOP-item below) — a verifier dispatch should
 * exercise: rapid double-press on "Final approval & adopt," and navigating
 * back to the list mid-commit (the commit still resolves against the
 * shared `CASES` array and the next detail-view open of that case reflects
 * the true outcome, since `CASES` is not screen-local state that a
 * navigate-away would discard).
 *
 * Accessibility gate (persona directive 7): both case tables are real
 * `<table>` semantics via `DataTable` (C6); the toast confirming a
 * committed action is `role="status"`/`aria-live="polite"` (`Toast`, C17,
 * unmodified here); detail-view accessibility (real buttons, labelled
 * textarea, text-paired status Tags) is documented in
 * `../views/CaseDetail.tsx`'s own header.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner installed, matching
 * every sibling screen already landed here. Verified via `npx tsc --noEmit`
 * against the whole `src/` tree (strict mode, `exactOptionalPropertyTypes`,
 * `noUnusedLocals`) to confirm this file and `CaseDetail.tsx` type-check
 * against the real `DataTable`/`Topbar`/`Sidebar`/`Toast`/`RedlineDiffView`
 * prop shapes and against `data/cases.ts`'s actual exported `Case` shape.
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
const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
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
const TOAST_WRAP_STYLE: CSSProperties = { position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 60 };

export interface CasesProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `Home.tsx`/`OnSideDocuments.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen and deliberately matches nothing in `Sidebar.tsx`'s `NAV` table — see file header "NO SIDEBAR LEAF." */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /** Defaults to `CURRENT` (Rachel Fischer, CRO), matching `App.tsx`'s own default persona. See file header ENTRY POINTS. */
  currentUser?: StudioUser;
  /** Deep-entry hook for the three named entry points — opens straight to a case's detail state instead of the list. Unused by any caller in this worktree today (none of the three entry points is wired yet); present so this screen's prop shape doesn't need to change once one is. */
  initialCaseId?: string;
}

export function Cases({ topbar, onNavigate, sidebarVersionLabel, currentUser = CURRENT, initialCaseId }: CasesProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCaseId ?? null);
  const [pendingAction, setPendingAction] = useState<{ caseId: string; kind: CaseActionKind } | null>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [toast, setToast] = useState<{ variant: 'success' | 'info'; message: string } | null>(null);
  const requestSeqRef = useRef(0);

  function logEntry(c: Case, what: string, note: string): void {
    c.history.unshift({ when: stamp(), who: currentUser.name, role: currentUser.role, what, note });
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
      setToast({ variant: 'success', message: toastMessage(c) });
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
            />
          ) : (
            <>
              <div>
                <h1 id="cases-title" style={TITLE_STYLE}>
                  Cases
                </h1>
                <p style={{ ...NOTE_STYLE, marginTop: '0.5rem' }}>
                  OnSide opens a case the moment it detects a change and drafts the language to close it. The case is the record: who edited, who
                  accepted, who approved, and when — timestamped from detection to adoption. It is what the examiner reads.
                  {undecidedCount > 0 ? ` ${undecidedCount === openCases.length ? 'None' : `${undecidedCount} of ${openCases.length}`} ${undecidedCount === 1 ? 'has' : 'have'} been decided yet.` : ''}
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
                  <p style={NOTE_STYLE}>Adopted or returned. The full history stays on the case either way.</p>
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
        <div style={TOAST_WRAP_STYLE}>
          <Toast variant={toast.variant} message={toast.message} onDismiss={() => setToast(null)} autoDismissMs={5000} />
        </div>
      ) : null}
    </div>
  );
}
