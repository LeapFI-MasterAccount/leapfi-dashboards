/**
 * Studio · Investment Design regression tests (D17): every test pins
 * PORTED V1 BEHAVIOR, citing its base-page line anchor
 * (leapfi-platform.html @ 1c230fe) or survey_map.md section. Tests
 * observe the app — they never adapt it.
 *
 * Base anchors pinned here:
 *  - lever defaults: survey_map.md §a line 59 (Ambition 3 / Risk 52 /
 *    Horizon 50 / $450k / ROI 2.5× / adoption 70 — the G7 value/label
 *    mismatch resolved to the shipped VALUE 70)
 *  - readLevers threshold/allowRisk: base 1229-1233
 *  - computePlan ready/gated/funded split: base 1245-1255
 *  - stanceText lead + "N of M plays clear today. K wait on controls.":
 *    base 1220-1228
 *  - recompute() liveness (every derived figure re-derives from the same
 *    lever state on change): base 1256-1301
 *
 * Expected figures below are hand-derived from the verbatim-ported
 * catalog (OPPS/CTRL, base 1171-1195) through the base formulas:
 *  - defaults (amb 3, tol 52): threshold = round(88 − 52·0.45) = 65,
 *    allowRisk 3 → pool = all 15; ready (minGate ≥ 65) = 9, gated = 6.
 *  - ambition → 1: allowRisk 1 → low-risk pool of 7; ready = 5, gated = 2.
 *  - budget greedy fill (base 1249-1251) at defaults funds 7 plays;
 *    at the $100k floor it funds 2.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { InvestmentDesign } from '../../screens/InvestmentDesign';
import type { InvestmentDesignProps } from '../../screens/InvestmentDesign';
import { getDemoSliders, resetDemo } from '../../state/demoStore';

function renderScreen(overrides?: Partial<InvestmentDesignProps>) {
  return render(<InvestmentDesign {...overrides} />);
}

beforeEach(() => {
  // This screen publishes lever changes to the shared demo store (fix-wave
  // SH-6/RPT-04/STU-07) — restore DEFAULT_SLIDERS between tests.
  resetDemo();
});

describe('stance banner at the shipped lever defaults (survey_map.md §a L59; stanceText base 1220-1228)', () => {
  it('reads "Balanced: a far reach with balanced gating." with 9 of 15 clear / 6 gated (base 1226-1227 else-branch; computePlan 1245-1255)', () => {
    renderScreen();
    // gap = amb(3) − CUR(1) = 2 → reach 'far'; tol 52 → gate 'balanced';
    // none of the special-case leads apply (tol neither >66 nor <34).
    expect(screen.getByText('Balanced: a far reach with balanced gating.')).toBeInTheDocument();
    expect(screen.getByText('9 of 15 plays clear today. 6 wait on controls.')).toBeInTheDocument();
  });
});

describe('lever changes recompute the stance banner live (recompute base 1256-1301; readLevers 1229-1233)', () => {
  it('moving Ambition 3 → 1 changes the plays-clear count (allowRisk 3 → 1, base 1232; low-risk pool only)', () => {
    renderScreen();
    expect(screen.getByText('9 of 15 plays clear today. 6 wait on controls.')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Ambition' }), { target: { value: '1' } });

    // Low-risk-only pool of 7: 5 clear the 65% gate, 2 wait on controls;
    // gap = 0, tol 52 → 'modest reach with balanced gating' (base 1226).
    expect(screen.getByText('Balanced: a modest reach with balanced gating.')).toBeInTheDocument();
    expect(screen.getByText('5 of 15 plays clear today. 2 wait on controls.')).toBeInTheDocument();
    expect(screen.queryByText('9 of 15 plays clear today. 6 wait on controls.')).not.toBeInTheDocument();
  });

  it('moving Risk appetite past 66 with far reach flips the lead to the aggressive-tension stance (base 1222)', () => {
    renderScreen();
    fireEvent.change(screen.getByRole('slider', { name: 'Risk appetite' }), { target: { value: '80' } });

    // gap 2 & tol > 66 → the tension lead (base 1222), and the loosened
    // gate (round(88 − 80·0.45) = 52) clears more plays: every play with
    // minGate ≥ 52 (all 15) clears.
    expect(
      screen.getByText('Aggressive on both fronts: reaching far past your posture and unlocking on thin control coverage.'),
    ).toBeInTheDocument();
    expect(screen.getByText('15 of 15 plays clear today. 0 wait on controls.')).toBeInTheDocument();
  });

  it('moving Annual budget to the $100k floor recomputes the funded count 7 → 2 (greedy budget fill, base 1249-1251)', () => {
    renderScreen();
    // Default $450k funds 7 of the 9 ready plays (greedy in sortPool
    // order, base 1234-1244); the stance banner itself is budget-blind
    // (stanceText reads ready/gated only, base 1227) — the recompute
    // surfaces in the "Plays funded" tile (base 1273).
    expect(screen.getByLabelText('7, Plays funded')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Annual budget' }), { target: { value: '100000' } });

    expect(screen.getByLabelText('2, Plays funded')).toBeInTheDocument();
    expect(screen.queryByLabelText('7, Plays funded')).not.toBeInTheDocument();
    // Stance banner unchanged by budget alone — pins that ready/gated is
    // control-and-risk gated, never budget gated (base 1245-1248).
    expect(screen.getByText('9 of 15 plays clear today. 6 wait on controls.')).toBeInTheDocument();
  });

  it('publishes every lever change to the shared demo store (setDemoSliders — backbone contract SH-6/RPT-04/STU-07)', () => {
    renderScreen();
    expect(getDemoSliders().budget).toBe(450000);

    fireEvent.change(screen.getByRole('slider', { name: 'Annual budget' }), { target: { value: '100000' } });

    // Home panels / reports / Studio Ask value lines all read this store —
    // the base recompute() fan-out (source 1256-1303).
    expect(getDemoSliders().budget).toBe(100000);
  });
});

describe('play drawer — full base openPlay content (base 1391-1432; fix-wave STU-13)', () => {
  it('opens a funded play with summary, economics, verdict, scope of work, tech deps, governance detail, financial block, and connections', () => {
    renderScreen();
    const fundedTable = screen.getByRole('table', { name: 'Your funded portfolio' });
    const row = within(fundedTable).getByRole('row', { name: /Loan-document summarization/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Open' }));

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveTextContent('Loan-document summarization');
    // Summary (DETAIL.sum, base 1396).
    expect(drawer).toHaveTextContent('Summarizes loan files and flags missing or inconsistent documents to speed processing.');
    // Economics: 35000 build; annual 150000×0.70 = $105k; 3-yr return
    // 105000×3/35000 = 9.0× (base 1398); payback round(35/105×12) = 4 mo.
    expect(drawer).toHaveTextContent('$35k one-time');
    expect(drawer).toHaveTextContent('$105k');
    expect(drawer).toHaveTextContent('9.0× on build cost');
    // Ready/sequence-gated verdict (base seqNote 1405-1407): minGate 80 ≥
    // threshold 65 at defaults.
    expect(drawer).toHaveTextContent('✓ Ready now at your current risk tolerance; cleared to enter the funded portfolio.');
    // Scope of work + technical dependencies (base d.work/d.tech, 1408-1423).
    expect(drawer).toHaveTextContent('Document ingestion + OCR for scanned files · Summarization + key-term extraction · Missing-doc / inconsistency flags · Reviewer UI in the loan-ops workflow');
    expect(drawer).toHaveTextContent('Access to the loan-document repository · OCR for scanned documents · Loan-origination system integration');
    // Per-gate governance detail with GOV description + REGMAP citation
    // and the live score (base gov rows, 1402).
    expect(drawer).toHaveTextContent('Governance · Privacy');
    expect(drawer).toHaveTextContent('80% ✓ — GLBA / data-privacy review + PII-handling sign-off · GLBA §501(b)');
    // Financial block (base 1424): run-cost estimate round(35000×0.15) = $5k/yr.
    expect(drawer).toHaveTextContent('Run cost ≈ $5k/yr');
    expect(drawer).toHaveTextContent('Not licence-only.');
    // Controls to close: Privacy is green (80 ≥ GREEN 80).
    expect(drawer).toHaveTextContent('All gating controls are green.');
    // Depends-on / Unlocks connections (base 1426-1428): DETAIL.deps/unlocks
    // are both empty for this play.
    expect(drawer).toHaveTextContent('No prerequisites; can start immediately.');
    expect(drawer).toHaveTextContent('Standalone; nothing downstream depends on it.');
  });
});

describe('gated/bench rows open the same drawer (fix B-dead-interactions-05; base .gated-row[data-play] cursor:pointer + hover, 309-310; delegated click, 4493-4497)', () => {
  it('a Sequence-gated row\'s "Open" button opens the real play drawer, not just the funded table', () => {
    renderScreen();
    // "Underwriting assist" (g: Fair Lending/Adverse Action/Model Risk,
    // minGate 55 < threshold 65) sits in the gated side list, not the
    // funded PlanTable, at the shipped defaults.
    const gatedSection = screen.getByRole('table', { name: 'Plays waiting on control maturity' });
    const row = within(gatedSection).getByRole('row', { name: /Underwriting assist/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Open' }));

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveTextContent('Underwriting assist');
    // Resolved via `planTableRowForPlay` (not the funded planRows mapping):
    // same full drawer content — sequence-gated verdict included.
    expect(drawer).toHaveTextContent(/Sequence-gated: blocked until Adverse Action reaches 80%/);
  });

  it('a Cleared-governance-outside-budget (bench) row\'s "Open" button opens the same drawer', () => {
    renderScreen();
    // "Deposit pricing optimization" (g: Model Risk, minGate 70 ≥ 65) is
    // ready but outside the $450k budget — it sits on the bench list.
    const benchSection = screen.getByRole('table', { name: 'Plays cleared for governance, waiting on budget' });
    const row = within(benchSection).getByRole('row', { name: /Deposit pricing optimization/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Open' }));

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveTextContent('Deposit pricing optimization');
    expect(drawer).toHaveTextContent('✓ Ready now at your current risk tolerance; cleared to enter the funded portfolio.');
  });
});

describe('play drawer deep-link actions (fix B-dead-interactions-07 — play-drawer call site): gov rows, gap queue, and deps/unlocks become real nav-payload actions', () => {
  it('governance rows offer "Open <gate> in OnSide" actions targeting the CTRLDOM routing slug (base goOnside/openInstr, 1401-1402)', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    const gatedSection = screen.getByRole('table', { name: 'Plays waiting on control maturity' });
    fireEvent.click(within(within(gatedSection).getByRole('row', { name: /Underwriting assist/ })).getByRole('button', { name: 'Open' }));

    const drawer = screen.getByRole('dialog');
    fireEvent.click(within(drawer).getByRole('button', { name: 'Open Model Risk in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'mrm' });

    fireEvent.click(within(drawer).getByRole('button', { name: 'Open Fair Lending in OnSide' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.overview', kind: 'domain', id: 'fairlend' });
  });

  it('a sequence-gated play offers "See the gap queue" (base seqNote 1406-1407); a ready play does not', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    const gatedSection = screen.getByRole('table', { name: 'Plays waiting on control maturity' });
    fireEvent.click(within(within(gatedSection).getByRole('row', { name: /Underwriting assist/ })).getByRole('button', { name: 'Open' }));
    const gatedDrawer = screen.getByRole('dialog');
    fireEvent.click(within(gatedDrawer).getByRole('button', { name: 'See the gap queue' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.feed', kind: 'section', id: 'gaps' });

    const fundedTable = screen.getByRole('table', { name: 'Your funded portfolio' });
    const row = within(fundedTable).getByRole('row', { name: /Loan-document summarization/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Open' }));
    const readyDrawer = screen.getByRole('dialog');
    expect(within(readyDrawer).queryByRole('button', { name: 'See the gap queue' })).not.toBeInTheDocument();
  });

  it('Depends-on / Unlocks names become "Open <name>" actions that re-target the drawer to that play (base depChips → openPlay, 1390/1424-1428)', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    const gatedSection = screen.getByRole('table', { name: 'Plays waiting on control maturity' });
    fireEvent.click(within(within(gatedSection).getByRole('row', { name: /Underwriting assist/ })).getByRole('button', { name: 'Open' }));
    const drawer = screen.getByRole('dialog');

    // "Underwriting assist" depends on both "Unified data foundation" and
    // "AI adverse-action letter drafting" (data/studio.ts DETAIL_BASE).
    fireEvent.click(within(drawer).getByRole('button', { name: 'Open Unified data foundation' }));
    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'studio.investment-design', kind: 'play', id: 'Unified data foundation' });
    fireEvent.click(within(drawer).getByRole('button', { name: 'Open AI adverse-action letter drafting' }));
    expect(onDeepLink).toHaveBeenCalledWith({
      screen: 'studio.investment-design',
      kind: 'play',
      id: 'AI adverse-action letter drafting',
    });
  });
});

describe('play deep-link consumption (fix B-dead-interactions-03/04 — the CONSUME half of App.tsx\'s nav-payload contract)', () => {
  it('a deep link with kind "play" opens the real drawer for that play and consumes the nonce', () => {
    const onDeepLinkConsumed = vi.fn();
    renderScreen({
      deepLink: { screen: 'studio.investment-design', kind: 'play', id: 'Underwriting assist', nonce: 1 },
      onDeepLinkConsumed,
    });

    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveTextContent('Underwriting assist');
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1);
  });

  it('a deep link resolves a gated/bench play too, not only a funded one (planTableRowForPlay)', () => {
    renderScreen({
      deepLink: { screen: 'studio.investment-design', kind: 'play', id: 'Deposit pricing optimization', nonce: 1 },
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('Deposit pricing optimization');
  });
});

describe('AC-A20-9 (InvestmentDesign half) — the relocated opportunity register (amendment A20, PI2-D47, design_system_spec.md §2.9.11)', () => {
  it('renders exactly one ADDITIONAL <DataTable> (beyond PlanTable\'s own), containing the FULL, unfiltered, reversed live OPPS pool — independent of the lever-driven funded/gated/bench views above', () => {
    const { container } = renderScreen();
    // PlanTable's own table + the relocated register table = 2 real <table>s
    // in this default view (PlanTable is a real <table>, gated/bench are
    // this screen's own non-DataTable mini-tables per the file's own
    // "AMBIGUITY RESOLVED — gated/bench side lists" note).
    expect(container.querySelectorAll('table[data-lf-composite]')).toHaveLength(2);
    const registerTable = screen.getByRole('table', { name: 'Opportunity register' });
    // Every catalog play plus (once one is added elsewhere) every
    // Ask-scoped addition — the FULL, unfiltered pool, independent of the
    // lever-driven funded/gated/bench views (which can legitimately omit
    // plays this table never does).
    for (const name of ['Underwriting assist', 'Unified data foundation', 'Complaint analytics', 'Reason-code remediation program']) {
      expect(within(registerTable).getByText(name)).toBeInTheDocument();
    }
    // Default sort is `value` descending (same as the pre-A20 register) —
    // the highest annual-value play (Underwriting assist, $400k catalog
    // value) renders first.
    const firstRow = within(registerTable).getAllByRole('row')[1]; // [0] is the header row
    expect(firstRow).toHaveTextContent('Underwriting assist');
  });

  it('a row\'s "Detail →" action opens the SAME local play-detail Drawer this screen\'s own PlanTable/GatedTable/BenchTable "Open" actions already open — no round-trip through onDeepLink needed (§2.9.11 "reached FROM its own now-hosting screen")', () => {
    const onDeepLink = vi.fn();
    renderScreen({ onDeepLink });
    const registerTable = screen.getByRole('table', { name: 'Opportunity register' });
    const row = within(registerTable).getByRole('row', { name: /Loan-document summarization/ });
    fireEvent.click(within(row).getByRole('button', { name: 'Detail →' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Loan-document summarization');
    expect(onDeepLink).not.toHaveBeenCalled();
  });
});
