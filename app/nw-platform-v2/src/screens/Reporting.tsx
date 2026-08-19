/**
 * Reporting — new screen under the already-reserved `reporting` Sidebar leaf
 * (design_system_spec.md §2.2 C15; parity_ia_addendum.md §1.3 "Reporting" +
 * §6 "Batch 5 — Reporting").
 *
 * Region map: Topbar → Sidebar → page title → 11-card ReportIndex (SetupCard
 * C15, `interactive`, equal weight — Talon S4 entity pattern, the exact shape
 * `Roadmap.tsx`'s own "What's next" row already proves) → the app's existing
 * shared Drawer (C7), opened on card press, hosting `views/ReportView.tsx`'s
 * kind-dispatching content. No screen-level primary CTA (addendum §4: "11
 * equal-weight SetupCards... inside a report, 'Print / Save as PDF' is `ghost`
 * utility, matching §3.2's BoardDeckButton precedent").
 *
 * 11-vs-9 defect closed (revision_plan.md §3.5, "cards ADDED for unreached
 * kinds, nothing cut"): base engine anchor `osReports()` only ever built 9
 * cards (source lines 3710-3725) against 11 real `openReport()` kinds
 * (1474-1686) — `plan` and `roadmap` have no `openReport('plan'/'roadmap')`
 * call site anywhere in source. `views/ReportView.tsx`'s `REPORT_KIND_ORDER`
 * carries all 11; nothing from the original 9 is cut or reordered away from
 * `osReports()`'s own sequence.
 *
 * See `views/ReportView.tsx`'s file header for the notes this screen
 * inherits by composition: dropped decorative charts (OQ-B) and the
 * `regchange` standing-table data-ownership note. Two formerly-inherited
 * STOP-items are closed: Drawer now ships the addendum-required `wide`
 * variant (RPT-03 fix wave — this screen passes `size="wide"` in report
 * mode; the base's `boardUpdate` form drawer is NOT wide, `showDrawer(html,
 * false)` source 3577-3587, so form mode stays default width), and the
 * `gapboard` → Cases route is live (`'cases'` is a wired `ScreenId`).
 *
 * AMBIGUITY RESOLVED — SetupCard `icon` omitted on every card: identical
 * resolution to `Roadmap.tsx`'s own "What's next" row — `osReports()`'s `rc()`
 * helper carries arbitrary Unicode glyphs ('▤', '◈', '◔', …) per card that
 * don't map onto Icon's (P1) closed `IconName` vocabulary, and `SetupCard.tsx`'s
 * own file header already flags this exact mismatch as a STOP-item, typing
 * `icon` to the real `IconName` contract rather than a widened `string`. Left
 * unset on all 11 cards rather than inventing a glyph→`IconName` mapping table
 * SetupCard's own author did not sanction.
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: identical passthrough
 * pattern to every sibling screen already landed in this worktree (`Home.tsx`,
 * `OnSideFeed.tsx`, `Roadmap.tsx`, …) — a full `topbar: TopbarProps` bundle
 * prop, and for Sidebar only `onNavigate` + optional `sidebarVersionLabel`;
 * `activeId` is hardcoded here to `'reporting'` (`Sidebar.tsx`'s own `NAV`
 * entry id for this screen, already reserved per the dispatch brief).
 *
 * Wiring note (RESOLVED): `App.tsx`'s `reporting` case now mounts this screen
 * directly (the parity-assembly dispatch landed that one-line swap).
 *
 * BOARD-LOG SUB-FLOW (parity-wiring wave, gate dispatch — addendum §1.8):
 * the `regchange` report's per-row "Log an update →" affordance (gated on
 * `status === 'open'`, see `views/ReportView.tsx`) swaps THIS screen's one
 * shared Drawer's content to `views/BoardLogForm.tsx` — a sequential content
 * swap of the same instance, never a second Drawer, exactly the base engine's
 * own drawer-shaped behavior (`boardUpdate` showDrawer, source 3577;
 * `boardSave` → `closeDrawer();openReport('regchange')`, source 3592). This
 * screen owns everything `BoardLogForm`'s header assigns to its parent: the
 * Drawer `title` ("Log an update · {id}", base `dtitle`), the controlled
 * `date`/`text` field state, the `BOARD_LOG` mutation itself (unshift of
 * `{txt, when: 'Aug 15, 2026', who: first+' '+(role||''), date}` — verbatim
 * boardSave line 3589, `who` stamped from the live persona prop, see
 * `currentUser` below), and the post-save sequencing: reveal the "Saved to
 * the standing view" pill, then after the base's own 900ms delay swap the
 * Drawer content back to the `regchange` report (base line 3592's
 * setTimeout). KNOWN DIVERGENCE, deliberate (RPT-06 fix wave): the base's
 * pending timer runs unconditionally — close the drawer or open a different
 * report inside the 900ms window and the timer still forces the regchange
 * report open, hijacking whatever the presenter did (base line 3592's
 * `closeDrawer();openReport('regchange')`). Not demo-safe, so this screen
 * CANCELS the pending timer on every intervening user action (closeReport /
 * openReport / openBoardLog); the base-parity path — presenter leaves the
 * drawer alone for 900ms — is unchanged. One further knowing divergence,
 * flagged not hidden: our `BoardLogForm` receives the live `BOARD_LOG[id]`
 * array, so the just-saved entry appears in the form's "Update history"
 * during the 900ms pill window, where the base's string-built drawer stayed
 * stale until reopened — React-idiomatic freshness, same data, no copy
 * invented. The drawer's "Print / Save as PDF" ghost footer is omitted in
 * form mode (the base `boardUpdate` drawer has no such control; the print
 * affordance is backed by Drawer.tsx's ported base print stylesheet, RPT-01).
 *
 * Tests: `src/__tests__/reporting_cases/` (vitest is installed; this
 * header's original "no test runner" STOP-item is obsolete and removed).
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { SetupCard } from '../components/SetupCard';
import { Drawer } from '../components/Drawer';
import { Button } from '../components/primitives/Button';
import { ReportView, REPORT_KIND_ORDER, REPORT_META } from '../views/ReportView';
import type { ReportKind } from '../views/ReportView';
import { BoardLogForm } from '../views/BoardLogForm';
import { BOARD_LOG } from '../data/boardLog';
import { CURRENT } from '../data/studio';
import type { StudioUser } from '../data/studio';

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
const headerStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };
const h1Style: CSSProperties = { font: 'inherit', fontSize: '1.625rem', fontWeight: 700, color: 'var(--ink)', margin: 0 };
const ledeStyle: CSSProperties = { font: 'inherit', fontSize: '0.9375rem', color: 'var(--ink2)', margin: 0, maxWidth: 640 };
const cardRowStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' };

export interface ReportingProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as every sibling screen). */
  topbar: TopbarProps;
  /** Sidebar navigation hook, also reused to route `gapboard`'s "Open cases →" link (`onNavigate('cases')` — see file header STOP-item). `activeId` is intrinsic to this screen ('reporting') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /**
   * Active persona — stamps `who` on committed board-log updates (base
   * `boardSave`: `CURRENT.first+' '+(CURRENT.role||'')`, source 3589, where
   * base `CURRENT` is the live persona-switcher global). Optional, defaulting
   * to `CURRENT` (Rachel Fischer, CRO — the persona the app boots with and
   * Restart resets to), the same default-persona pattern `Home.tsx`'s
   * `roleKey` prop established; `App.tsx` passes the live switcher value.
   */
  currentUser?: StudioUser;
}

export function Reporting({ topbar, onNavigate, sidebarVersionLabel, currentUser = CURRENT }: ReportingProps) {
  const [selectedKind, setSelectedKind] = useState<ReportKind | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Board-log sub-flow state (see file header "BOARD-LOG SUB-FLOW"): when
  // `boardLogId` is non-null the SAME shared Drawer instance renders
  // BoardLogForm instead of ReportView — a sequential content swap, never a
  // second Drawer. Field state is parent-owned per BoardLogForm's controlled
  // contract (base `#bu-date`/`#bu-txt` DOM state).
  const [boardLogId, setBoardLogId] = useState<string | null>(null);
  const [boardLogDate, setBoardLogDate] = useState('');
  const [boardLogText, setBoardLogText] = useState('');
  const [boardLogSaved, setBoardLogSaved] = useState(false);
  // Pending base-line-3592 `setTimeout(...,900)`. RPT-06 (fix wave): unlike
  // the base — whose timer runs unconditionally and hijacks whatever the
  // presenter did in the window — this timer is cancelled on unmount AND on
  // every intervening user action (closeReport/openReport/openBoardLog). See
  // the file header's KNOWN DIVERGENCE note.
  const savedTimerRef = useRef<number | null>(null);
  const cancelSavedTimer = () => {
    if (savedTimerRef.current !== null) {
      window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  };
  useEffect(
    () => () => {
      if (savedTimerRef.current !== null) window.clearTimeout(savedTimerRef.current);
    },
    [],
  );

  const openReport = (kind: ReportKind) => {
    // Content is replaced wholesale, exactly like base `showDrawer` — a
    // stale board-log form never survives into a report opened from a card,
    // and a pending post-save swap never overwrites the fresh report (RPT-06).
    cancelSavedTimer();
    setBoardLogId(null);
    setSelectedKind(kind);
    setDrawerOpen(true);
  };
  const closeReport = () => {
    // RPT-06: Escape/scrim/Close inside the 900ms window means the presenter
    // dismissed the flow — the drawer must not force itself back open.
    cancelSavedTimer();
    setDrawerOpen(false);
  };
  const handleOpenCases = () => onNavigate('cases');

  /** Base `boardUpdate(id)` (source 3577): swap the drawer to a fresh form
   * for this row — fields empty on every open, like the base's rebuilt DOM. */
  const openBoardLog = (id: string) => {
    // RPT-06: a fresh form opened inside the window must not be destroyed
    // mid-typing by the previous save's pending swap.
    cancelSavedTimer();
    setBoardLogId(id);
    setBoardLogDate('');
    setBoardLogText('');
    setBoardLogSaved(false);
    setDrawerOpen(true);
  };

  /** Base `boardSave(id)` (source 3588-3593), verbatim sequence: guard empty
   * text (restated parent-side; BoardLogForm's own guard already focuses the
   * textarea and withholds the intent) → unshift the entry → reveal the
   * saved pill → after 900ms, `closeDrawer();openReport('regchange')` — here
   * the equivalent sequential swap back to the regchange report in the same
   * open Drawer. */
  const handleBoardLogSave = () => {
    if (boardLogId === null) return;
    const txt = boardLogText.trim();
    if (!txt) return;
    (BOARD_LOG[boardLogId] = BOARD_LOG[boardLogId] ?? []).unshift({
      txt,
      when: 'Aug 15, 2026',
      who: currentUser.first + ' ' + (currentUser.role || ''),
      date: boardLogDate.trim(),
    });
    setBoardLogSaved(true);
    cancelSavedTimer();
    savedTimerRef.current = window.setTimeout(() => {
      savedTimerRef.current = null;
      setBoardLogId(null);
      setSelectedKind('regchange');
      setDrawerOpen(true);
    }, 900);
  };

  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) — this project's `exactOptionalPropertyTypes` setting treats
  // Sidebar's optional `versionLabel` as exactly `string`, not `string |
  // undefined` — same pattern every sibling screen documents.
  const sidebarProps: SidebarProps = {
    activeId: 'reporting',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  // Base `dtitle` in form mode: "Log an update · {id}" (source 3581).
  const drawerTitle =
    boardLogId !== null ? `Log an update · ${boardLogId}` : selectedKind ? REPORT_META[selectedKind].title : 'Report';

  return (
    <div data-lf-screen="reporting" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="reporting-main" style={MAIN_STYLE} aria-labelledby="reporting-title">
          <div style={headerStyle}>
            <h1 id="reporting-title" style={h1Style}>
              Reporting
            </h1>
            <p style={ledeStyle}>
              Eleven standing reports generated live from the governance record and the Studio dials. One data model
              underneath, so the numbers always agree. Each opens formatted, ready to print or save as PDF.
            </p>
          </div>
          <div style={cardRowStyle}>
            {REPORT_KIND_ORDER.map((kind) => {
              const meta = REPORT_META[kind];
              return (
                <SetupCard
                  key={kind}
                  title={meta.indexTitle}
                  description={`${meta.audience} · ${meta.description}`}
                  variant="interactive"
                  onPress={() => openReport(kind)}
                />
              );
            })}
          </div>
        </main>
      </div>
      <Drawer
        open={drawerOpen}
        title={drawerTitle}
        onClose={closeReport}
        // RPT-03: reports render in the base's wide drawer (`dr.classList
        // .add('wide')`, source 1679; addendum §1.3/§6 "wide variant"). The
        // board-log form does NOT — base `boardUpdate` calls
        // `showDrawer(html, false)` (source 3577-3587), i.e. default width.
        size={boardLogId !== null ? 'default' : 'wide'}
        footer={
          // No print footer in form mode — the base `boardUpdate` drawer has
          // no such control (see file header "BOARD-LOG SUB-FLOW").
          boardLogId !== null ? null : <Button variant="ghost" label="Print / Save as PDF" onPress={() => window.print()} />
        }
      >
        {boardLogId !== null ? (
          <BoardLogForm
            entries={BOARD_LOG[boardLogId] ?? []}
            date={boardLogDate}
            onDateChange={setBoardLogDate}
            text={boardLogText}
            onTextChange={setBoardLogText}
            onSave={handleBoardLogSave}
            saved={boardLogSaved}
          />
        ) : selectedKind ? (
          <ReportView kind={selectedKind} onOpenCases={handleOpenCases} onLogUpdate={openBoardLog} />
        ) : null}
      </Drawer>
    </div>
  );
}
