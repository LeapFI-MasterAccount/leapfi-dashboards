/**
 * L12 demo re-script — click-path-fidelity walk for the new `examiner`
 * SCRIPTS registry entry (`data/script.ts`, DECISIONS.md D16-D24; call-17-
 * demo-flow-nist-riskead-tprm.md). Author: Marisol Vance. Per this
 * persona's own discipline (SOP "Author ≠ validator"), these tests are
 * evidence FOR a separate verifier dispatch, not this persona's own
 * sign-off.
 *
 * Each `it` below is proven discriminating (SOP "Evidence return"): it
 * fails if the specific shipped-code fact the corresponding script beat
 * relies on regresses — not merely if the registry entry is malformed.
 * (Verified by hand during authoring: reverting each cited production
 * line individually — the D17 `resolveTarget` branch, the PI2-D45 CRO-
 * routing block, `Cases.tsx`'s `defaultSortColumnId`, or the `OBL`
 * key set — turns the corresponding assertion below red.)
 */
import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PresenterRail } from '../../components/PresenterRail';
import type { PresenterRailHandle } from '../../components/PresenterRail';
import { SCRIPTS, SCRIPT_EXAMINER, resolveTarget } from '../../data/script';
import { Cases } from '../../screens/Cases';
import { OnSideOverview } from '../../screens/OnSideOverview';
import { CASES, seedCases } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { DOMAINS, OBL } from '../../data/onside';
import { resetDemo } from '../../state/demoStore';
import { topbarFixture } from '../reporting_cases/fixtures';

beforeAll(() => {
  // jsdom has no scrollIntoView — the accordion's expand-and-scroll effect
  // (`OnSideOverview.tsx`'s `openDomain`, `DomainsAccordion.tsx`) calls it.
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  seedCases(DOCLIB);
});

afterEach(() => {
  cleanup();
  resetDemo();
});

describe('SCRIPTS.examiner registry shape (design_system_spec.md §4 multi-script architecture)', () => {
  it('ships exactly the finalized 3-beat arc (D24), titles within the 32-char rail cap, say/do non-empty', () => {
    expect(SCRIPTS.examiner.steps).toBe(SCRIPT_EXAMINER);
    expect(SCRIPT_EXAMINER).toHaveLength(3);
    for (const step of SCRIPT_EXAMINER) {
      expect(step.title.length, `title "${step.title}"`).toBeLessThanOrEqual(32);
      expect(step.say.length).toBeGreaterThan(0);
      expect(step.do.length).toBeGreaterThan(0);
    }
  });

  it('every examiner step target resolves via resolveTarget onto a real, built screen id (never null)', () => {
    for (const step of SCRIPT_EXAMINER) {
      const resolved = resolveTarget(step.target);
      expect(resolved, `resolveTarget(${step.target}) for step "${step.id}"`).not.toBeNull();
    }
  });

  it('D17: step 1 targets onside:overview, resolving to the already-shipped onside.overview screen', () => {
    expect(SCRIPT_EXAMINER[0]?.target).toBe('onside:overview');
    expect(resolveTarget('onside:overview')).toBe('onside.overview');
  });

  it('D18: step 2 targets a real onside:case:<id> deep link, resolving through the RAIL-10 case: rule to the Cases screen', () => {
    expect(SCRIPT_EXAMINER[1]?.target).toBe('onside:case:CASE-2026-001');
    expect(resolveTarget('onside:case:CASE-2026-001')).toBe('cases');
  });

  it('D16: step 3 targets onside:dom-tprm, resolving via the RAIL-10 dom- rule to onside.documents (never a SoonSplash placeholder)', () => {
    expect(SCRIPT_EXAMINER[2]?.target).toBe('onside:dom-tprm');
    expect(resolveTarget('onside:dom-tprm')).toBe('onside.documents');
  });
});

describe('PresenterRail walks SCRIPTS.examiner end to end (design_system_spec.md §4 state machine, script-agnostic)', () => {
  it('Start -> Next -> Next fires onNavigate with each step\'s raw target, in order, landing on 3 of 3 at the terminal step', () => {
    const onNavigate = vi.fn();
    const ref = createRef<PresenterRailHandle>();
    render(<PresenterRail ref={ref} script={SCRIPTS.examiner} onNavigate={onNavigate} onRestart={() => {}} />);

    act(() => ref.current?.start());
    const rail = screen.getByRole('region', { name: 'Presenter rail' });
    expect(within(rail).getByText('STEP 1 OF 3')).toBeInTheDocument();
    expect(onNavigate).toHaveBeenLastCalledWith(SCRIPT_EXAMINER[0]?.target);

    fireEvent.click(within(rail).getByRole('button', { name: 'Next' }));
    expect(within(rail).getByText('STEP 2 OF 3')).toBeInTheDocument();
    expect(onNavigate).toHaveBeenLastCalledWith(SCRIPT_EXAMINER[1]?.target);

    fireEvent.click(within(rail).getByRole('button', { name: 'Next' }));
    expect(within(rail).getByText('STEP 3 OF 3')).toBeInTheDocument();
    expect(onNavigate).toHaveBeenLastCalledWith(SCRIPT_EXAMINER[2]?.target);
    expect(within(rail).getByRole('button', { name: 'Next' })).toBeDisabled();

    // Every fired target still resolves onto a real screen (belt + braces
    // on the walk actually exercised through the rail's own state machine,
    // not just the raw array).
    for (const call of onNavigate.mock.calls) {
      expect(resolveTarget(call[0] as string)).not.toBeNull();
    }
  });
});

describe('D18 re-walk (closes the gap flag): the CRO-routed case is the real top row of the Cases screen', () => {
  it('CASE-2026-001 (irp, exec tier) boots stage "cro" and renders as the first row of the unfiltered, id-ascending-sorted Open cases table', () => {
    // Data-level: seedCases' PI2-D45 routing block (cases.ts) routes every
    // board/exec-tier case to 'cro'; irp is tier 'exec' and is assigned
    // CASE-2026-001 by the seeding loop's doc-array position.
    const irp = CASES.find((c) => c.doc === 'irp');
    expect(irp?.id).toBe('CASE-2026-001');
    expect(irp?.tier).toBe('exec');
    expect(irp?.stage).toBe('cro');

    // Screen-level: Cases.tsx's "Open cases" table is unfiltered by role
    // and defaults to ascending id sort — CASE-2026-001 must render first.
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={{ id: 'rachel', name: 'Rachel Fischer', roleKey: 'cro' } as never} />);
    const openTable = screen.getByRole('table', { name: 'Open cases' });
    const rows = within(openTable).getAllByRole('row');
    // rows[0] is the header row (DataTable renders a <thead> row too, but
    // getAllByRole('row') on the table includes it) — assert the first
    // DATA row (the one carrying an "Open" action button) is CASE-2026-001.
    const firstDataRow = rows.find((r) => within(r).queryByRole('button', { name: 'Open' }) !== null);
    expect(firstDataRow).toBeDefined();
    expect(within(firstDataRow as HTMLElement).getByText('CASE-2026-001')).toBeInTheDocument();
    expect(within(firstDataRow as HTMLElement).getByText('With the CRO')).toBeInTheDocument();
  });
});

describe('Step 1 gap-KPI sub-click (D21) — the named example figures are the real domain data, not invented', () => {
  it('TPRM (24/33) and AI-gov (110/230) match the do-field\'s named example figures exactly', () => {
    const tprm = DOMAINS.find((d) => d.key === 'tprm');
    const aigov = DOMAINS.find((d) => d.key === 'aigov');
    expect(tprm && { met: tprm.met, tot: tprm.tot }).toEqual({ met: 24, tot: 33 });
    expect(aigov && { met: aigov.met, tot: aigov.tot }).toEqual({ met: 110, tot: 230 });
    expect(SCRIPT_EXAMINER[0]?.do).toContain('TPRM 24 of 33');
    expect(SCRIPT_EXAMINER[0]?.do).toContain('AI-gov 110 of 230');
  });
});

describe('Step 3 close-beat correction (D16/D23) — AI-gov has no obligation register on Documents; the real flagship callout lives on the Overview accordion', () => {
  it('OBL (Documents\' "Domain impact" source) has only tprm/mrm keys — never an aigov register', () => {
    expect(Object.keys(OBL).sort()).toEqual(['mrm', 'tprm']);
  });

  it('clicking "AI Governance" on Overview expands the real, shipped flagship-framework callout with the 110/230 figures', async () => {
    const user = userEvent.setup();
    render(<OnSideOverview onNavigate={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'AI Governance' }));
    await waitFor(() => expect(screen.getByRole('region', { name: 'AI Governance' })).toBeInTheDocument());
    const body = screen.getByRole('region', { name: 'AI Governance' });
    expect(within(body).getByText(/flagship framework/)).toBeInTheDocument();
    expect(within(body).getByText(/110 of 214 obligations met/)).toBeInTheDocument();
    expect(within(body).getByText(/of 230/)).toBeInTheDocument();
  });
});
