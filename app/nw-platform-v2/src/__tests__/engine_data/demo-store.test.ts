/**
 * Regression — state/demoStore.ts, the shared live demo-state layer
 * (backbone fix-wave dispatch: SH-1/CS-01, SH-2/RAIL-02/CS-04/RPT-02,
 * SH-6/RPT-04/STU-07, STU-01/ONSIDE-02/ONSIDE-11).
 *
 * Base anchors (leapfi-dashboards/src/leapfi-platform.html @ pin 1c230fe):
 *  - notify(roleKey,title,cid,kind) ................ source 2626–2629
 *  - the six case-action notify() write sites ...... 2691, 2707, 2715,
 *                                                    2724, 2749, 2758
 *  - openNotif read-flip ........................... 2644–2647
 *  - acceptProposed data mutations ................. 4401–4408
 *    (OPPS.push; DETAIL stub 4405; SCOPE_EVENTS.push {uc,doms,obl} 4407)
 *  - DOMMAP/domainsFor ............................. 4299–4300
 *  - applyGapClosure/undoGapClosure ................ 3204–3219 (keyed
 *    STRICTLY on (g.rl||g.doc)===docId over GAPS — ONSIDE-11: no
 *    doc.obl branch; adopting gen-ai-draft flips nothing in base)
 *  - resetDemo / DEMO_SEED snapshot ................ 3928–3961
 *
 * The store writes into the shared module singletons, so every test
 * restores the opening state via resetDemo() itself (which is also under
 * test) — beforeEach establishes the seeded opening frame.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SLIDERS,
  acceptOpportunity,
  adoptionScaledValue,
  applyGapClosure,
  computeLivePlan,
  deriveLiveRecomputeView,
  getDemoSliders,
  getScopeEvents,
  notify,
  notifyCaseAdopted,
  notifyCaseCommittee,
  notifyCaseOpinion,
  notifyCaseRejected,
  notifyCaseRouted,
  notifyCaseRoutedLegal,
  openNotificationForCase,
  resetDemo,
  setDemoSliders,
  subscribeDemoStore,
  undoGapClosure,
} from '../../state/demoStore';
import { CASES, CLOCK, NOTIFS } from '../../data/cases';
import { BOARD_LOG } from '../../data/boardLog';
import { DOCLIB } from '../../data/doclib';
import { HOME_ORDER } from '../../data/misc';
import { AUTO_LOAN_OPPORTUNITY } from '../../data/misc';
import { DOMAINS, GAPS, OBL } from '../../data/onside';
import { CTRL, DETAIL, OPPS } from '../../data/studio';
import type { PlanOpportunity } from '../../engine/plan';

/** The base runs gateCalc(proposed) BEFORE acceptProposed (addAutoLoan,
 * source 4428; gateCalc source 1194) — mirrored here exactly, since
 * data/studio.ts's own gateCalc is unexported. */
const GATED_AUTO_LOAN: PlanOpportunity = {
  ...AUTO_LOAN_OPPORTUNITY,
  // data/misc.ts types `h`/`r` as plain strings; re-pin the verbatim
  // source literals (4427) to the catalog's closed unions.
  h: 'strategic',
  r: 'high',
  minGate: Math.min(...AUTO_LOAN_OPPORTUNITY.g.map((k) => CTRL[k] ?? 0)),
  weakGate: [...AUTO_LOAN_OPPORTUNITY.g].sort((a, b) => (CTRL[a] ?? 0) - (CTRL[b] ?? 0))[0]!,
};

beforeEach(() => {
  resetDemo();
});

const CASE_REF = { id: 'CASE-2026-001', title: 'Incident Response Plan' };

describe('notify pipeline (base notify 2626–2629; write sites 2691–2758)', () => {
  it('notify() unshifts the base entry shape, stamps the demo clock, defaults kind to app, and notifies subscribers', () => {
    let calls = 0;
    const unsubscribe = subscribeDemoStore(() => {
      calls++;
    });

    notify('cro', 'Approval needed · X', 'CASE-2026-001', 'email');
    expect(NOTIFS[0]).toEqual({
      to: 'cro',
      title: 'Approval needed · X',
      cid: 'CASE-2026-001',
      kind: 'email',
      when: 'Aug 15, 2026 · 9:14 AM ET', // first CLOCK tick after reset (stamp(), source 2589)
      read: false,
    });

    notify('analyst', 'Second', 'CASE-2026-002');
    expect(NOTIFS[0]?.['kind']).toBe('app'); // base kind||'app'
    expect(NOTIFS[0]?.['cid']).toBe('CASE-2026-002'); // unshift — newest first
    expect(NOTIFS.length).toBe(2);
    expect(calls).toBe(2);
    unsubscribe();
  });

  it('carries all six base case-action write sites verbatim (2691, 2707, 2715, 2724, 2749, 2758)', () => {
    notifyCaseRouted(CASE_REF); // caseAccept 2691
    expect(NOTIFS[0]).toMatchObject({ to: 'cro', title: 'Approval needed · Incident Response Plan', kind: 'email' });

    notifyCaseCommittee(CASE_REF); // caseConditional 2707
    expect(NOTIFS[0]).toMatchObject({ to: 'analyst', title: 'Added to the board report · Incident Response Plan', kind: 'app' });

    notifyCaseRoutedLegal(CASE_REF); // caseRouteLegal 2715
    expect(NOTIFS[0]).toMatchObject({ to: 'legal', title: 'Counsel review requested · Incident Response Plan', kind: 'email' });

    notifyCaseOpinion(CASE_REF, true); // caseOpinion 2724 (ok)
    expect(NOTIFS[0]).toMatchObject({ to: 'cro', title: 'Counsel cleared · Incident Response Plan', kind: 'app' });

    notifyCaseOpinion(CASE_REF, false); // caseOpinion 2724 (notes)
    expect(NOTIFS[0]).toMatchObject({ to: 'analyst', title: 'Counsel notes · Incident Response Plan', kind: 'app' });

    notifyCaseAdopted(CASE_REF); // caseApprove 2749
    expect(NOTIFS[0]).toMatchObject({ to: 'analyst', title: 'Approved and adopted · Incident Response Plan', kind: 'app' });

    notifyCaseRejected(CASE_REF); // caseReject 2758
    expect(NOTIFS[0]).toMatchObject({ to: 'analyst', title: 'Returned to redraft · Incident Response Plan', kind: 'app' });
  });

  it('openNotificationForCase flips read=true on the first unread match for that role only (base openNotif 2644–2647)', () => {
    notifyCaseRouted(CASE_REF); // to: cro
    notifyCaseAdopted(CASE_REF); // to: analyst, same case

    openNotificationForCase('CASE-2026-001', 'cro');
    const croEntry = NOTIFS.find((n) => n['to'] === 'cro');
    const analystEntry = NOTIFS.find((n) => n['to'] === 'analyst');
    expect(croEntry?.['read']).toBe(true);
    expect(analystEntry?.['read']).toBe(false); // other role's entry untouched

    // No unread match left for cro+case — a further open is a no-op, not a throw.
    openNotificationForCase('CASE-2026-001', 'cro');
    expect(NOTIFS.filter((n) => n['read'] === true).length).toBe(1);
  });
});

describe('live levers (SH-6/RPT-04/STU-07 backbone; base computePlan 1245–1255, openReport 1477)', () => {
  it('selectors recompute from the LIVE slider state on every call, never a frozen module constant', () => {
    const before = computeLivePlan();
    expect(getDemoSliders()).toEqual(DEFAULT_SLIDERS);

    setDemoSliders({ ...DEFAULT_SLIDERS, budget: 1500000, amb: 4 });
    const after = computeLivePlan();
    expect(after.L.budget).toBe(1500000);
    expect(after.spent).toBeGreaterThan(before.spent); // bigger budget funds more
    expect(deriveLiveRecomputeView().levers.budgetLabel).toBe('$1.50M');
  });

  it('adoptionScaledValue is the base val*L.eff scaling (4325/4393/4423: $520k → $364k at 70%)', () => {
    expect(adoptionScaledValue(520000)).toBe(520000 * 0.7);
    setDemoSliders({ ...DEFAULT_SLIDERS, eff: 50 });
    expect(adoptionScaledValue(520000)).toBe(260000);
  });
});

describe('scope events + Discovery register (STU-01 backbone; base acceptProposed 4401–4408)', () => {
  it('acceptOpportunity pushes onto the live OPPS pool, seeds the DETAIL stub, and records the base scope event', () => {
    const poolBefore = OPPS.length; // 15-play catalog
    acceptOpportunity(GATED_AUTO_LOAN);

    expect(OPPS.length).toBe(poolBefore + 1);
    // The live selectors see the new play without any re-plumbing (same
    // array identity) — the "library is at N" / "of N plays" surfaces.
    expect(deriveLiveRecomputeView().economics.totalOpportunities).toBe(poolBefore + 1);

    // SCOPE_EVENTS entry — base 4406–4407: doms=domainsFor(g) display names
    // (Adverse Action folds into Fair Lending per DOMMAP 4299), obl=3+g.length*2.
    const events = getScopeEvents();
    expect(events.length).toBe(1);
    expect(events[0]).toEqual({
      uc: 'Auto loan origination platform',
      doms: ['Fair Lending', 'Model Risk'],
      obl: 3 + GATED_AUTO_LOAN.g.length * 2,
    });

    // DETAIL stub — base 4405 guard (only when missing).
    expect(DETAIL['Auto loan origination platform']?.sum).toContain('Captured in Discovery this session');
  });
});

describe('adopt cascade (ONSIDE-02/ONSIDE-11; base applyGapClosure/undoGapClosure 3204–3219)', () => {
  it('adopting mrm-change-draft closes MRM-09 behind it and moves the domain met-count — "every view moves together"', () => {
    const mrm09 = () => OBL['mrm']?.find((o) => o.id === 'MRM-09');
    const mrmDomain = () => DOMAINS.find((d) => d.key === 'mrm');
    expect(mrm09()?.st).toBe('gap');
    const metBefore = mrmDomain()?.met ?? NaN; // seed: 30

    applyGapClosure('mrm-change-draft');
    expect(mrm09()?.st).toBe('met');
    expect(mrm09()?.rev).toBe('ok');
    expect(mrmDomain()?.met).toBe(metBefore + 1);

    // Idempotent — the base `g.applied` guard (3207).
    applyGapClosure('mrm-change-draft');
    expect(mrmDomain()?.met).toBe(metBefore + 1);

    undoGapClosure('mrm-change-draft');
    expect(mrm09()?.st).toBe('gap');
    expect(mrm09()?.rev).toBe('q');
    expect(mrmDomain()?.met).toBe(metBefore);
  });

  it('resolves the TPRM-08 gap through its rl key (base (g.rl||g.doc), 3207)', () => {
    const tprm08 = () => OBL['tprm']?.find((o) => o.id === 'TPRM-08');
    expect(tprm08()?.st).not.toBe('met');
    applyGapClosure('tprm-program'); // GAPS row: doc:'exit-draft', rl:'tprm-program'
    expect(tprm08()?.st).toBe('met');
  });

  it('ONSIDE-11: adopting gen-ai-draft flips NOTHING — base keys strictly on GAPS rows, and none references that doc', () => {
    const oblSnapshot = JSON.stringify(OBL);
    const domainsSnapshot = JSON.stringify(DOMAINS);
    applyGapClosure('gen-ai-draft');
    expect(JSON.stringify(OBL)).toBe(oblSnapshot);
    expect(JSON.stringify(DOMAINS)).toBe(domainsSnapshot);
    // MRM-11 in particular stays open — the twin's former doc.obl cascade
    // branch (b) exceeded the base anchor by flipping it.
    expect(OBL['mrm']?.find((o) => o.id === 'MRM-11')?.st).not.toBe('met');
  });
});

describe('resetDemo (SH-2/RAIL-02/CS-04/RPT-02; base resetDemo 3938–3961)', () => {
  it('returns every twin-owned singleton to the opening frame after a full rehearsal pass', () => {
    // --- rehearsal: mutate everything a warm-up run can touch ---
    const c = CASES[0]!;
    c.stage = 'cro';
    c.history.unshift({ when: 'Aug 15, 2026 · 9:14 AM ET', who: 'P. Raman', role: 'Risk Analyst', what: 'Accepted', note: '' });
    notifyCaseRouted(c); // NOTIFS + CLOCK tick
    BOARD_LOG['2026-13'] = [{ txt: 'Rehearsal entry', when: 'Aug 15, 2026', who: 'Rachel Chief Risk Officer', date: '' }];
    HOME_ORDER['cro'] = ['ai'];
    setDemoSliders({ ...DEFAULT_SLIDERS, amb: 4, eff: 40 });
    acceptOpportunity(GATED_AUTO_LOAN);
    applyGapClosure('mrm-change-draft');
    const doc = DOCLIB['mrm-change-draft']!;
    const seededRedline = doc.redline!.nw;
    doc.redline!.nw = 'REHEARSAL-ADOPTED LANGUAGE';

    // --- restart ---
    resetDemo();

    // CASES: 8 open, none decided, single seeded history line (CS-04's "eight open and none decided").
    expect(CASES.length).toBe(8);
    expect(CASES.every((x) => x.stage === 'analyst')).toBe(true);
    expect(CASES.every((x) => x.history.length === 1)).toBe(true);
    expect(NOTIFS).toEqual([]);
    expect(CLOCK.i).toBe(0); // timestamps restart at 9:14 AM
    expect(BOARD_LOG).toEqual({});
    expect(HOME_ORDER).toEqual({});
    expect(getDemoSliders()).toEqual(DEFAULT_SLIDERS);
    expect(OPPS.length).toBe(15);
    expect(getScopeEvents().length).toBe(0);
    // Adopt cascade unwound via the OBL/DOMAINS/GAPS reseed.
    expect(OBL['mrm']?.find((o) => o.id === 'MRM-09')?.st).toBe('gap');
    expect(DOMAINS.find((d) => d.key === 'mrm')?.met).toBe(30);
    expect((GAPS as Array<{ applied?: boolean }>).some((g) => g.applied)).toBe(false);
    // DOCLIB redline restored, and the reseeded case reads the restored language.
    expect(DOCLIB['mrm-change-draft']?.redline?.nw).toBe(seededRedline);
    expect(CASES.find((x) => x.doc === 'mrm-change-draft')?.base).toBe(seededRedline);
  });
});
