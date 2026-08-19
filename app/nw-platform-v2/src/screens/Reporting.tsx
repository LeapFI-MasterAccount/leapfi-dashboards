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
 * See `views/ReportView.tsx`'s file header for the STOP-items this screen
 * inherits by composition: Drawer's missing "wide" variant, the `gapboard`
 * → Cases forward reference (`onNavigate('cases')`, not yet a valid `ScreenId`
 * in `App.tsx` pending Batch 4), dropped decorative charts (OQ-B), and the
 * `regchange` standing-table data-ownership note.
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
 * Wiring note (NOT in this dispatch's ALLOWLIST, per parity_ia_addendum.md §6
 * Batch 5's own "Wiring note" and this dispatch's HARD RULES barring edits to
 * `App.tsx`): `App.tsx`'s existing `reporting` case in `renderActiveScreen()`
 * currently falls through to `OutOfScopeScreen` (its `default` branch) and
 * needs one line swapped to `<Reporting topbar={topbarProps}
 * onNavigate={navigateToScreen} />` — left for the dispatch that owns
 * `App.tsx` integration.
 *
 * STOP-item — no executable test run: identical to every sibling screen
 * already landed in this worktree — no test runner is installed
 * (`package.json`, out of this dispatch's ALLOWLIST, has `dev`/`build`/
 * `preview` scripts only). Verified via `npx tsc --noEmit` against the whole
 * `src/` tree (strict mode, `noUncheckedIndexedAccess`,
 * `exactOptionalPropertyTypes`) instead; recommending the same test-tooling
 * follow-up dispatch every sibling screen already recommends.
 */
import { useState } from 'react';
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
}

export function Reporting({ topbar, onNavigate, sidebarVersionLabel }: ReportingProps) {
  const [selectedKind, setSelectedKind] = useState<ReportKind | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openReport = (kind: ReportKind) => {
    setSelectedKind(kind);
    setDrawerOpen(true);
  };
  const closeReport = () => setDrawerOpen(false);
  const handleOpenCases = () => onNavigate('cases');

  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) — this project's `exactOptionalPropertyTypes` setting treats
  // Sidebar's optional `versionLabel` as exactly `string`, not `string |
  // undefined` — same pattern every sibling screen documents.
  const sidebarProps: SidebarProps = {
    activeId: 'reporting',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  const drawerTitle = selectedKind ? REPORT_META[selectedKind].title : 'Report';

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
        footer={<Button variant="ghost" label="Print / Save as PDF" onPress={() => window.print()} />}
      >
        {selectedKind ? <ReportView kind={selectedKind} onOpenCases={handleOpenCases} /> : null}
      </Drawer>
    </div>
  );
}
