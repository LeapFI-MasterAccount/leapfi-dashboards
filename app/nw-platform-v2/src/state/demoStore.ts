/**
 * demoStore — the shared live demo-state layer (module singleton).
 *
 * Built by the backbone fix-wave dispatch (findings SH-1/CS-01/SH-8,
 * SH-2/RAIL-02/CS-04/RPT-02, SH-6/RPT-04/STU-07, STU-01/ONSIDE-02/
 * ONSIDE-11). Every base anchor cited below is
 * leapfi-dashboards/src/leapfi-platform.html at pin 1c230fe (READ-ONLY).
 *
 * WHAT THIS IS: the twin's port of the base page's module-global mutable
 * demo state plus its "one write re-renders every view" behavior. The base
 * mutates globals (NOTIFS, OPPS, SCOPE_EVENTS, OBL/DOMAINS/GAPS, levers)
 * and then calls renderBell()/recompute()/renderHome()/refreshAll(); in
 * React that render fan-out is a subscription: every mutation here bumps a
 * version and notifies subscribers, and `useDemoStore()` (a
 * `useSyncExternalStore` hook) re-renders any component that called it.
 * State itself stays in the existing data-module singletons
 * (data/cases.ts CASES/NOTIFS/CLOCK, data/boardLog.ts BOARD_LOG,
 * data/misc.ts HOME_ORDER/HOME_HIDE, data/studio.ts OPPS/DETAIL,
 * data/onside.ts DOMAINS/OBL/GAPS, data/doclib.ts DOCLIB) — this module
 * adds the missing writers, the reset, and the re-render tie.
 *
 * CONSUMER API (parallel fix batches: cases, studio, onside, home_panels,
 * reporting — this store exists so your screens can drop their
 * screen-local copies of shared state):
 *  - `useDemoStore()` — call in any component that reads the singletons;
 *    it re-renders on every store write. Returns the version number.
 *  - Notifications (SH-1/CS-01): `notify(to,title,cid,kind)` is the base
 *    notify() port (source 2626–2629). The six case-action write sites
 *    (base 2691/2707/2715/2724/2749/2758) are ported one-for-one as
 *    `notifyCaseRouted` / `notifyCaseCommittee` / `notifyCaseRoutedLegal` /
 *    `notifyCaseOpinion` / `notifyCaseAdopted` / `notifyCaseRejected` —
 *    Cases.tsx's performAction mutations should call the matching helper
 *    exactly where the base handler called notify().
 *    `openNotificationForCase(cid, roleKey)` is the base openNotif
 *    read-flip (source 2644–2647) — App's bell-open handler already calls
 *    it.
 *  - Levers (SH-6/RPT-04/STU-07): `DEFAULT_SLIDERS` (canonical; the
 *    HomePanels/ReportView duplicates should converge on it),
 *    `getDemoSliders()`, `setDemoSliders(next)` — InvestmentDesign should
 *    publish every slider change via `setDemoSliders` (App already seeds
 *    it with `initialSliders={getDemoSliders()}` on mount). Selectors:
 *    `computeLivePlan()` / `deriveLiveRecomputeView()` recompute from the
 *    LIVE levers + LIVE opportunity pool on every call — the base
 *    openReport/renderHome behavior ("var P=computePlan()", source 1477,
 *    4197+) — and `adoptionScaledValue(val)` is the base `val*L.eff`
 *    scaling (source 1245–1255, 4325, 4393, 4423).
 *  - Scope events (STU-01): `acceptOpportunity(o)` is the base
 *    acceptProposed data mutation (source 4401–4408): pushes onto the
 *    live OPPS pool, seeds the Discovery DETAIL stub, pushes a
 *    SCOPE_EVENTS entry ({uc, doms, obl: 3+g.length*2}). Read via
 *    `getScopeEvents()` (OnSideOverview's "Scope changes this session").
 *  - Adopt cascade (ONSIDE-02/ONSIDE-11): `applyGapClosure(docId)` /
 *    `undoGapClosure(docId)` port base 3204–3219 VERBATIM — keyed strictly
 *    on `(g.rl||g.doc)===docId` over GAPS. Deliberately NO `doc.obl`
 *    branch: OnSideDocuments' local `cascadeTargetsForDoc` branch (b)
 *    exceeded the base anchor (ONSIDE-11 — adopting gen-ai-draft flips
 *    nothing in base) and must be dropped when that screen rewires onto
 *    this store. Document-level rlState/rlLog/version cosmetics (base
 *    rlAction 2485–2508) stay screen-owned.
 *  - Restart (SH-2/RAIL-02/CS-04/RPT-02): `resetDemo()` — see below.
 *
 * resetDemo() — port of base resetDemo (source 3938–3961) for the state
 * this twin owns, using the base's own DEMO_SEED snapshot mechanism
 * (seedDemo/dclone/reseedObj/reseedArr, source 3928–3937; the snapshot is
 * taken at module-evaluation time, before any interaction can mutate):
 * reseeds DOCLIB/DOMAINS/OBL/OPPS/GAPS in place (identity-preserving, so
 * every module that imported those bindings sees the reset), re-runs
 * seedCases(DOCLIB) (rebuilds CASES, NOTIFS=[], CLOCK.i=0 — source 3946),
 * clears SCOPE_EVENTS (source 3948), clears HOME_HIDE/HOME_ORDER (source
 * 3949), restores levers to DEFAULT_SLIDERS (source 3947), and clears
 * BOARD_LOG (dispatch-mandated for RPT-02: the twin's Reporting appends
 * to BOARD_LOG, so a Restart that leaves rehearsal entries visible in the
 * regchange report would not restore the opening frame). Persona reset
 * and Home navigation are App.handleRestart's half (base 3957–3958).
 */
import { useSyncExternalStore } from 'react';
import { NOTIFS, seedCases, stamp } from '../data/cases';
import type { Case } from '../data/cases';
import { BOARD_LOG } from '../data/boardLog';
import { DOCLIB } from '../data/doclib';
import { HOME_HIDE, HOME_ORDER } from '../data/misc';
import { DOMAINS, GAPS, OBL } from '../data/onside';
import type { GapItem, ObligationRow, OnsideDomain } from '../data/onside';
import { DETAIL, OPPS } from '../data/studio';
import { computePlan, deriveRecomputeView, readLevers } from '../engine/plan';
import type { Levers, PlanOpportunity, PlanResult, RecomputeView, SliderState } from '../engine/plan';

/* ============================================================
 * Subscription core — the React stand-in for the base page's
 * renderBell()/recompute()/renderHome() fan-out after every write.
 * ============================================================ */

type Listener = () => void;

const listeners = new Set<Listener>();
let version = 0;

function emit(): void {
  version++;
  listeners.forEach((listener) => listener());
}

export function subscribeDemoStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDemoStoreVersion(): number {
  return version;
}

/** Subscribe the calling component to every demo-state write. Returns the
 * monotonically-increasing store version (a changed value is what triggers
 * the re-render; the singletons themselves are read directly). */
export function useDemoStore(): number {
  return useSyncExternalStore(subscribeDemoStore, getDemoStoreVersion, getDemoStoreVersion);
}

/* ============================================================
 * DEMO_SEED snapshot — base seedDemo/dclone/reseedObj/reseedArr,
 * source 3928–3937. Taken at module evaluation, i.e. before first
 * paint and before any interaction can have mutated the literals.
 * ============================================================ */

function dclone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function reseedObj<T>(target: Record<string, T>, seed: Record<string, T>): void {
  for (const key of Object.keys(target)) delete target[key];
  for (const key of Object.keys(seed)) target[key] = dclone(seed[key] as T);
}

function reseedArr<T>(target: T[], seed: T[]): void {
  target.length = 0;
  seed.forEach((x) => target.push(dclone(x)));
}

const DEMO_SEED = {
  DOCLIB: dclone(DOCLIB),
  DOMAINS: dclone(DOMAINS),
  OBL: dclone(OBL),
  OPPS: dclone(OPPS),
  GAPS: dclone(GAPS),
};

/* ============================================================
 * Levers — the base page's live #amb/#tol/#speed/#budget/#roi/#eff
 * slider state (read by computePlan()/openReport()/renderHome() on
 * every recompute, source 1229–1233, 1477, 4197+).
 * ============================================================ */

/** Canonical default lever position (base shipped slider values; G7 fix
 * applied — `eff: 70` with the label derived from the value). The private
 * duplicates in InvestmentDesign.tsx (`INITIAL_SLIDERS`), HomePanels.tsx,
 * and ReportView.tsx (`DEFAULT_SLIDERS`) carry these same values and
 * should converge on this export. */
export const DEFAULT_SLIDERS: SliderState = { amb: 3, tol: 52, speed: 50, budget: 450000, roi: 2.5, eff: 70 };

let sliders: SliderState = { ...DEFAULT_SLIDERS };

export function getDemoSliders(): SliderState {
  return sliders;
}

/** Publish a lever change (InvestmentDesign's slider onChange). Every
 * subscribed surface — Home panels, reports, Studio Ask value lines —
 * recomputes from the new position, matching the base's recompute()-on-
 * input behavior (source 1256–1303). */
export function setDemoSliders(next: SliderState): void {
  sliders = { ...next };
  emit();
}

/** Live `L` object — base readLevers() over the live slider state. */
export function getLiveLevers(): Levers {
  return readLevers(sliders);
}

/** Base computePlan() (source 1245–1255) from the LIVE levers and the LIVE
 * opportunity pool (includes Discovery-accepted plays). */
export function computeLivePlan(): PlanResult {
  return computePlan(sliders, OPPS);
}

/** Full recompute view (engine/plan.ts deriveRecomputeView) from the LIVE
 * levers + LIVE pool — what base openReport/renderHome derive on every
 * open (source 1477, 4197+). Call per render, never cache at module scope
 * (RPT-04). */
export function deriveLiveRecomputeView(): RecomputeView {
  return deriveRecomputeView(sliders, OPPS);
}

/** Adoption-scaled annual value — the base `val*L.eff` scaling applied to
 * every register row / envelope / Value line (source 1245–1255, 4325,
 * 4393, 4423). */
export function adoptionScaledValue(val: number): number {
  return val * readLevers(sliders).eff;
}

/* ============================================================
 * Notifications — base notify() (source 2626–2629), the six case-action
 * write sites (2691, 2707, 2715, 2724, 2749, 2758), and openNotif's
 * read-flip (2644–2647). NOTIFS itself lives in data/cases.ts.
 * ============================================================ */

/** Base notify(roleKey,title,cid,kind) — unshifts {to,title,cid,kind:kind||'app',when:stamp(),read:false}. */
export function notify(to: string, title: string, cid: string, kind?: 'app' | 'email'): void {
  NOTIFS.unshift({ to, title, cid, kind: kind ?? 'app', when: stamp(), read: false });
  emit();
}

type CaseRef = Pick<Case, 'id' | 'title'>;

/** caseAccept, source 2691: `notify('cro','Approval needed · '+c.title,c.id,'email')`. */
export function notifyCaseRouted(c: CaseRef): void {
  notify('cro', 'Approval needed · ' + c.title, c.id, 'email');
}

/** caseConditional (committee tier only), source 2707: `notify('analyst','Added to the board report · '+c.title,c.id,'app')`. */
export function notifyCaseCommittee(c: CaseRef): void {
  notify('analyst', 'Added to the board report · ' + c.title, c.id, 'app');
}

/** caseRouteLegal, source 2715: `notify('legal','Counsel review requested · '+c.title,c.id,'email')`. */
export function notifyCaseRoutedLegal(c: CaseRef): void {
  notify('legal', 'Counsel review requested · ' + c.title, c.id, 'email');
}

/** caseOpinion, source 2724: `notify(ok?'cro':'analyst',(ok?'Counsel cleared · ':'Counsel notes · ')+c.title,c.id,'app')`. */
export function notifyCaseOpinion(c: CaseRef, ok: boolean): void {
  notify(ok ? 'cro' : 'analyst', (ok ? 'Counsel cleared · ' : 'Counsel notes · ') + c.title, c.id, 'app');
}

/** caseApprove, source 2749: `notify('analyst','Approved and adopted · '+c.title,c.id,'app')`. */
export function notifyCaseAdopted(c: CaseRef): void {
  notify('analyst', 'Approved and adopted · ' + c.title, c.id, 'app');
}

/** caseReject, source 2758: `notify('analyst','Returned to redraft · '+c.title,c.id,'app')`. */
export function notifyCaseRejected(c: CaseRef): void {
  notify('analyst', 'Returned to redraft · ' + c.title, c.id, 'app');
}

/** Base openNotif (source 2644–2647): opening a notification marks it
 * read. The base flips the clicked row (`x.read=true`); from the shell we
 * know (case, role), so the first unread match flips — identical for the
 * base's one-notification-per-action data. No-op (no emit) when nothing
 * matches. */
export function openNotificationForCase(cid: string, roleKey: string): void {
  const match = NOTIFS.find((n) => n['to'] === roleKey && n['cid'] === cid && n['read'] !== true);
  if (!match) return;
  match['read'] = true;
  emit();
}

/* ============================================================
 * Scope events + Discovery register — base SCOPE_EVENTS (source 1846),
 * acceptProposed (source 4401–4408), DOMMAP/domainsFor (4299–4300).
 * ============================================================ */

/** Base SCOPE_EVENTS entry shape (source 3075, 4407). */
export interface ScopeChangeEvent {
  uc: string;
  doms: string[];
  obl: number;
}

const SCOPE_EVENTS: ScopeChangeEvent[] = [];

export function getScopeEvents(): readonly ScopeChangeEvent[] {
  return SCOPE_EVENTS;
}

/** Base DOMMAP (source 4299) — control family -> display-domain name.
 * (data/studio.ts's CTRLDOM maps to slugs; scope events carry display
 * names — see STU-02.) */
const DOMMAP: Record<string, string> = {
  'Fair Lending': 'Fair Lending',
  'Adverse Action': 'Fair Lending',
  'UDAAP': 'Consumer / UDAAP',
  'BSA/AML': 'BSA / AML',
  'Model Risk': 'Model Risk',
  'Privacy': 'InfoSec / GLBA',
  'InfoSec': 'InfoSec / GLBA',
  'TPRM': 'Third-Party Risk',
  'Govern': 'AI Governance',
};

/** Base domainsFor (source 4300): unique display-domain names for a gate list, first-seen order. */
function domainsFor(gates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const gate of gates) {
    const domain = DOMMAP[gate];
    if (domain !== undefined && !seen.has(domain)) {
      seen.add(domain);
      out.push(domain);
    }
  }
  return out;
}

/** Base acceptProposed's data mutations (source 4403–4407): push the play
 * onto the live OPPS pool, seed the Discovery DETAIL stub (4405), push
 * the scope event ({uc, doms, obl: 3+g.length*2}). The base's follow-up
 * `recompute(); renderHome();` (4408) is the emit(). Wizard chat copy and
 * chips stay screen-owned. */
export function acceptOpportunity(o: PlanOpportunity): void {
  OPPS.push(o);
  if (!DETAIL[o.n]) {
    DETAIL[o.n] = {
      sum: 'Captured in Discovery this session; scoping envelope from the advisor intake. LeapFI refines this during the deep-dive.',
      work: [
        'Confirm the current-state workflow with the owning team',
        'Data access + integration assessment',
        'Pilot build with human-in-the-loop review',
        'Controls evidence + OnSide mapping',
        'Production hardening + adoption plan',
      ],
      tech: ['Source-system access to be confirmed', 'Historical volume data for evaluation'],
      deps: [],
      unlocks: [],
    };
  }
  SCOPE_EVENTS.push({ uc: o.n, doms: domainsFor(o.g), obl: 3 + o.g.length * 2 });
  emit();
}

/* ============================================================
 * Adopt cascade — base applyGapClosure/undoGapClosure, source
 * 3204–3219 ("adopting the language closes the obligation behind it,
 * so every view moves together"). Keyed STRICTLY on
 * `(g.rl||g.doc)===docId` over GAPS — no doc.obl branch (ONSIDE-11).
 * ============================================================ */

/** Runtime bookkeeping fields the base attaches to GAPS rows (source
 * 3209, 3217) — not part of data/onside.ts's seeded GapItem shape, so
 * modeled as an intersection here (same pattern as engine/plan.ts's
 * PlanOpportunity `disc`). */
type LiveGap = GapItem & { applied?: boolean; prevSt?: ObligationRow['st']; prevRev?: ObligationRow['rev'] };

/** Base oblByld (source 2339). */
function oblById(dom: string, id: string): ObligationRow | undefined {
  return (OBL[dom] ?? []).find((o) => o.id === id);
}

/** Base domByKey (source 1847). */
function domByKey(key: string): OnsideDomain | undefined {
  return DOMAINS.find((d) => d.key === key);
}

/** Base applyGapClosure (source 3205–3211), verbatim semantics. */
export function applyGapClosure(docId: string): void {
  (GAPS as LiveGap[]).forEach((g) => {
    if ((g.rl || g.doc) !== docId || !g.obl || g.applied) return;
    const o = oblById(g.obl[0], g.obl[1]);
    const d = domByKey(g.obl[0]);
    if (o && o.st !== 'met') {
      g.prevSt = o.st;
      g.prevRev = o.rev;
      o.st = 'met';
      o.rev = 'ok';
      if (d) d.met++;
      g.applied = true;
    }
  });
  emit();
}

/** Base undoGapClosure (source 3212–3219), verbatim semantics. */
export function undoGapClosure(docId: string): void {
  (GAPS as LiveGap[]).forEach((g) => {
    if ((g.rl || g.doc) !== docId || !g.applied) return;
    if (g.obl) {
      const o = oblById(g.obl[0], g.obl[1]);
      const d = domByKey(g.obl[0]);
      if (o) {
        o.st = g.prevSt ?? 'partial';
        o.rev = g.prevRev ?? 'q';
        if (d) d.met--;
      }
    }
    g.applied = false;
  });
  emit();
}

/* ============================================================
 * resetDemo — base 3938–3961 for twin-owned state. See file header.
 * ============================================================ */

export function resetDemo(): void {
  reseedObj(DOCLIB, DEMO_SEED.DOCLIB);
  reseedArr(DOMAINS, DEMO_SEED.DOMAINS);
  reseedObj(OBL, DEMO_SEED.OBL);
  reseedArr(OPPS, DEMO_SEED.OPPS);
  reseedArr(GAPS, DEMO_SEED.GAPS);
  // Base 3946: seedCases() — rebuilds CASES from the (just-restored)
  // DOCLIB redlines, resets NOTIFS=[] and CLOCK.i=0.
  seedCases(DOCLIB);
  // RPT-02 (dispatch-mandated): rehearsal board-log entries must not
  // survive into the next run's regchange report.
  for (const key of Object.keys(BOARD_LOG)) delete BOARD_LOG[key];
  // Base 3947: restore lever positions.
  sliders = { ...DEFAULT_SLIDERS };
  // Base 3948: SCOPE_EVENTS.length=0.
  SCOPE_EVENTS.length = 0;
  // Base 3949: reseedObj(HOME_HIDE,{}); reseedObj(HOME_ORDER,{}).
  for (const key of Object.keys(HOME_HIDE)) delete HOME_HIDE[key];
  for (const key of Object.keys(HOME_ORDER)) delete HOME_ORDER[key];
  emit();
}
