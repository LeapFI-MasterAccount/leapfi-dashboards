/**
 * Studio · Investment Design planning engine — pure typed port of
 * leapfi-platform.html lines 1214-1303 (`riskOrder`, `riskLabel`,
 * `stanceText`, `readLevers`, `sortPool`, `computePlan`, and every
 * non-DOM derivation inside `recompute()`), scaffold commit 5f37e99.
 *
 * Scope discipline (dispatch comp-studio-engines): this module ports
 * exactly the functions named in the dispatch brief plus the full set of
 * `recompute()`'s derivations that live inside the cited 1214-1303 line
 * range — not the DOM writes themselves (`$('id').textContent = …`) and
 * not `renderGantt`/`renderRegister`/`renderPipe` (line 1302 calls out to
 * code starting at line 1305, outside the cited range — Roadmap/RoadmapGantt
 * (C14) is a different screen's engine, not part of this dispatch).
 *
 * Every function here is side-effect-free: no `document`/`window` access,
 * no mutation of caller-owned arrays (`sortPool` clones before sorting —
 * see the note on that function), and no reads of anything other than its
 * own parameters plus the static catalog constants imported from
 * `data/studio.ts`. Components call these functions and render the
 * returned data; this module renders nothing and knows nothing about JSX,
 * CSS, or tokens.
 *
 * Text fields returned here (e.g. `EconomicsView.roiNote`,
 * `PostureView.note`) are plain strings/structured data, never HTML
 * strings — the source's `recompute()` built raw HTML fragments
 * (`innerHTML = '<span class="hl">…'`) because it was writing directly to
 * the DOM; a typed engine returns the same words as data so a component
 * can render them with real elements (e.g. a styled `<span>` / `<strong>`)
 * instead of a dangerously-injected string. Where the source used an
 * HTML entity for typographic characters (`&times;`, `&middot;`) this
 * module returns the literal Unicode character (`×`, `·`) — same glyph,
 * no HTML involved.
 */
import { BANDS, CTRL, CUR, GREEN, OPPS } from '../data/studio';
import type { StudioOpportunity } from '../data/studio';

/* ============================================================
 * Shared helpers — source line 1157 (`fmt`), 1217-1218
 * (`riskOrder`/`riskLabel`).
 * ============================================================ */

/** Source line 1157: `function fmt(n){return n>=1e6?'$'+(n/1e6).toFixed(2)+'M':'$'+Math.round(n/1000)+'k';}` */
export function fmt(n: number): string {
  return n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : '$' + Math.round(n / 1000) + 'k';
}

/** Source line 1217: `function riskOrder(r){return r==='low'?0:r==='med'?1:2;}` */
export function riskOrder(r: StudioOpportunity['r']): number {
  return r === 'low' ? 0 : r === 'med' ? 1 : 2;
}

/** Source line 1218: `function riskLabel(r){return r==='low'?'Low':r==='med'?'Moderate':'High';}` */
export function riskLabel(r: StudioOpportunity['r']): string {
  return r === 'low' ? 'Low' : r === 'med' ? 'Moderate' : 'High';
}

/**
 * Opportunity shape accepted by the plan engine: the canonical catalog
 * type (`StudioOpportunity`, data/studio.ts) plus the optional `disc`
 * flag the base engine's `addAutoLoan()`/`acceptProposed()` runtime
 * handlers attach to newly-discovered plays pushed onto the pool at
 * runtime (source line 1287: `(o.disc?' <span class="pill-soft" …>from
 * Discovery</span>':'')`). `StudioOpportunity` (data/studio.ts, sibling
 * dispatch's allowlist) does not model this field — it is only ever set
 * at runtime on a play accepted out of the chat/Discovery flow, never in
 * the static 15-play catalog — and `data/misc.ts`'s `AutoLoanOpportunity`
 * (also a sibling file) confirms the concrete shape with `disc: true`.
 * Added here via intersection rather than requested as an edit to either
 * data file, both outside this dispatch's allowlist.
 */
export type PlanOpportunity = StudioOpportunity & { disc?: boolean };

/* ============================================================
 * Levers — source lines 1229-1233 (`readLevers`)
 * ============================================================ */

/**
 * Raw lever/slider state, one field per `<input type="range">` in the
 * source ("Your levers" card, source lines 927-956): `#amb #tol #speed
 * #budget #roi #eff`. This is the DOM-free stand-in for the `$('id').value`
 * reads `readLevers()` used to perform — see the AMBIGUITY note on
 * `SliderControlRow.tsx` for why `eff` (Adoption/efficacy) is included
 * even though design_system_spec.md §5.5's region-map bullet names only
 * 5 sliders.
 */
export interface SliderState {
  /** Ambition band index, 0-4. Source `#amb`: `min=0 max=4 step=1`. */
  amb: number;
  /** Risk appetite / tolerance, 0-100. Source `#tol`: `min=0 max=100 step=1`. */
  tol: number;
  /** Investment horizon, 0-100. Source `#speed`: `min=0 max=100 step=1`. */
  speed: number;
  /** Annual budget, dollars. Source `#budget`: `min=100000 max=1500000 step=5000`. */
  budget: number;
  /** Target 3-year ROI multiple. Source `#roi`: `min=0.8 max=5 step=0.1`. */
  roi: number;
  /** Adoption / efficacy, 0-100 (raw slider units — NOT the 0-1 fraction). Source `#eff`: `min=20 max=80 step=1`. */
  eff: number;
}

/** Derived lever state — source's `L` object, shape per `readLevers()`'s return literal (lines 1231-1232). */
export interface Levers {
  amb: number;
  tol: number;
  speed: number;
  budget: number;
  /** Renamed from the `roi` slider per source: `roiTgt:+$('roi').value`. */
  roiTgt: number;
  /** Converted to a 0-1 fraction per source: `eff:+$('eff').value/100`. */
  eff: number;
  /** Gate percentage a control family's `minGate` must clear. Source: `Math.round(88 - tolV*0.45)`. */
  threshold: number;
  /** Max `riskOrder(o.r)+1` a play may carry to stay in the pool. Source ternary on `amb`. */
  allowRisk: number;
}

/**
 * Source lines 1229-1233:
 * ```
 * function readLevers(){
 *   var tolV=+$('tol').value;
 *   return {amb:+$('amb').value, tol:tolV, speed:+$('speed').value, budget:+$('budget').value, roiTgt:+$('roi').value, eff:+$('eff').value/100,
 *     threshold:Math.round(88 - tolV*0.45), allowRisk:(+$('amb').value)<=1?1:(+$('amb').value)==2?2:3};
 * }
 * ```
 * `+$('id').value` was a DOM read plus a string→number coercion; `sliders`
 * already carries numbers, so only the coercion's arithmetic effect
 * (none — the values are already numeric) needs preserving, not the cast.
 */
export function readLevers(sliders: SliderState): Levers {
  const tolV = sliders.tol;
  return {
    amb: sliders.amb,
    tol: tolV,
    speed: sliders.speed,
    budget: sliders.budget,
    roiTgt: sliders.roi,
    eff: sliders.eff / 100,
    threshold: Math.round(88 - tolV * 0.45),
    allowRisk: sliders.amb <= 1 ? 1 : sliders.amb === 2 ? 2 : 3,
  };
}

/* ============================================================
 * sortPool — source lines 1234-1244
 * ============================================================ */

/**
 * Source lines 1234-1244:
 * ```
 * function sortPool(pool,L){
 *   var w=Math.max(0,Math.min(1,L.speed/100));
 *   function score(o){
 *     var pay=o.cost/(o.val*L.eff);
 *     var quick=-pay+(o.h==='quick'?0.4:0);
 *     var strat=(o.found?2:0)+o.val/500000;
 *     return (1-w)*quick+w*strat;
 *   }
 *   pool.sort(function(a,b){return score(b)-score(a);});
 *   return pool;
 * }
 * ```
 * DEVIATION (documented, arithmetic unaffected): the source sorts `pool`
 * in place (`Array.prototype.sort` mutates) and returns the same
 * reference. A "pure typed function… no DOM access — return computed
 * values" should not mutate a caller-owned array as a hidden side
 * effect, so this port clones before sorting. The comparator and every
 * score term are copied verbatim — for any given input the *order* of
 * the returned array is identical to the source's; only the identity of
 * the array object (new vs. the same reference) differs.
 */
export function sortPool(pool: PlanOpportunity[], L: Levers): PlanOpportunity[] {
  const w = Math.max(0, Math.min(1, L.speed / 100));
  function score(o: PlanOpportunity): number {
    const pay = o.cost / (o.val * L.eff);
    const quick = -pay + (o.h === 'quick' ? 0.4 : 0);
    const strat = (o.found ? 2 : 0) + o.val / 500000;
    return (1 - w) * quick + w * strat;
  }
  const sorted = [...pool];
  sorted.sort((a, b) => score(b) - score(a));
  return sorted;
}

/* ============================================================
 * computePlan — source lines 1245-1255
 * ============================================================ */

export interface PlanResult {
  L: Levers;
  /** Risk-eligible plays that clear the control-maturity gate. */
  ready: PlanOpportunity[];
  /** Risk-eligible plays still waiting on control maturity. */
  gated: PlanOpportunity[];
  /** Ready plays the budget actually covers, in funding order. */
  funded: PlanOpportunity[];
  /** Ready plays the budget did not reach. */
  bench: PlanOpportunity[];
  spent: number;
  annual: number;
  roi: number;
  payM: number;
  /** Control families below the green-band threshold, weakest first. */
  toClose: string[];
}

/**
 * Source lines 1245-1255:
 * ```
 * function computePlan(){
 *   var L=readLevers();
 *   var pool=sortPool(OPPS.filter(function(o){return riskOrder(o.r)+1<=L.allowRisk;}),L);
 *   var ready=[],gated=[];
 *   pool.forEach(function(o){(o.minGate>=L.threshold?ready:gated).push(o);});
 *   var funded=[],bench=[],spent=0,annual=0;
 *   ready.forEach(function(o){if(spent+o.cost<=L.budget){funded.push(o);spent+=o.cost;annual+=o.val*L.eff;}else bench.push(o);});
 *   var roi=spent>0?annual*3/spent:0, payM=annual>0?Math.round(spent/annual*12):0;
 *   var toClose=Object.keys(CTRL).filter(function(k){return CTRL[k]<GREEN;}).sort(function(a,b){return CTRL[a]-CTRL[b];});
 *   return {L,ready,gated,funded,bench,spent,annual,roi,payM,toClose};
 * }
 * ```
 * `opportunities` defaults to the full `OPPS` catalog (data/studio.ts),
 * matching the source's read of the module-global `OPPS` — passed as a
 * parameter instead of a hard-coded global reference so the function has
 * no free variables beyond the imported constants it shares with the
 * rest of the app (same posture as `sortPool` already taking `pool`
 * explicitly in the source).
 */
export function computePlan(sliders: SliderState, opportunities: PlanOpportunity[] = OPPS): PlanResult {
  const L = readLevers(sliders);
  const pool = sortPool(
    opportunities.filter((o) => riskOrder(o.r) + 1 <= L.allowRisk),
    L,
  );
  const ready: PlanOpportunity[] = [];
  const gated: PlanOpportunity[] = [];
  pool.forEach((o) => {
    (o.minGate >= L.threshold ? ready : gated).push(o);
  });

  const funded: PlanOpportunity[] = [];
  const bench: PlanOpportunity[] = [];
  let spent = 0;
  let annual = 0;
  ready.forEach((o) => {
    if (spent + o.cost <= L.budget) {
      funded.push(o);
      spent += o.cost;
      annual += o.val * L.eff;
    } else {
      bench.push(o);
    }
  });

  const roi = spent > 0 ? (annual * 3) / spent : 0;
  const payM = annual > 0 ? Math.round((spent / annual) * 12) : 0;
  const toClose = Object.keys(CTRL)
    .filter((k) => (CTRL[k] ?? 0) < GREEN)
    .sort((a, b) => (CTRL[a] ?? 0) - (CTRL[b] ?? 0));

  return { L, ready, gated, funded, bench, spent, annual, roi, payM, toClose };
}

/* ============================================================
 * stanceText — source lines 1220-1228
 * ============================================================ */

export interface StanceView {
  /** The emphasized opening clause (source's `<span class="hl">…</span>`), plain text — no markup. */
  lead: string;
  /** The trailing sentence(s), plain text. */
  body: string;
  tension: boolean;
}

/**
 * Source lines 1220-1228:
 * ```
 * function stanceText(L,gap,ready,gated){
 *   var reach=gap>=2?'far':gap===1?'moderate':'modest', gate=L.tol<34?'tight':L.tol<67?'balanced':'loose', lead, tension=false;
 *   if(gap>=2&&L.tol>66){lead='Aggressive on both fronts: reaching far past your posture and unlocking on thin control coverage.';tension=true;}
 *   else if(gap>=2&&L.tol<34){lead='Ambitious and careful: you want the full roadmap, and tight gating funds the well-controlled plays first.';tension=true;}
 *   else if(gap<=0&&L.tol<34){lead='Conservative: modest reach and tight gating. Lowest risk, slowest value.';}
 *   else if(gap<=0&&L.tol>66){lead='Opportunistic: a modest target, unlocked quickly on loose gating.';}
 *   else{lead='Balanced: a '+reach+' reach with '+gate+' gating.';}
 *   return {html:'<span class="hl">'+lead+'</span> '+ready+' of '+OPPS.length+' plays clear today. '+gated+' wait on controls.',tension:tension};
 * }
 * ```
 * `total` defaults to `OPPS.length` (the source read the module-global
 * `OPPS` directly inside this function).
 */
export function stanceText(L: Levers, gap: number, ready: number, gated: number, total: number = OPPS.length): StanceView {
  const reach = gap >= 2 ? 'far' : gap === 1 ? 'moderate' : 'modest';
  const gate = L.tol < 34 ? 'tight' : L.tol < 67 ? 'balanced' : 'loose';
  let lead: string;
  let tension = false;
  if (gap >= 2 && L.tol > 66) {
    lead = 'Aggressive on both fronts: reaching far past your posture and unlocking on thin control coverage.';
    tension = true;
  } else if (gap >= 2 && L.tol < 34) {
    lead = 'Ambitious and careful: you want the full roadmap, and tight gating funds the well-controlled plays first.';
    tension = true;
  } else if (gap <= 0 && L.tol < 34) {
    lead = 'Conservative: modest reach and tight gating. Lowest risk, slowest value.';
  } else if (gap <= 0 && L.tol > 66) {
    lead = 'Opportunistic: a modest target, unlocked quickly on loose gating.';
  } else {
    lead = `Balanced: a ${reach} reach with ${gate} gating.`;
  }
  const body = `${ready} of ${total} plays clear today. ${gated} wait on controls.`;
  return { lead, body, tension };
}

/* ============================================================
 * recompute() derivations — source lines 1256-1303, DOM writes
 * (`$('id').textContent = …`) excluded; renderGantt/renderRegister/
 * renderPipe (line 1302, bodies starting at 1305) excluded — out of the
 * cited 1214-1303 range and out of this dispatch's scope (Roadmap/C14).
 * ============================================================ */

export interface LeverDisplay {
  /** Source line 1258: `BANDS[L.amb]`. */
  ambitionLabel: string;
  /** Source line 1259: tier word + ' · gate NN%'. */
  toleranceLabel: string;
  /** Source line 1260: tier word + ' · ' + raw value. */
  speedLabel: string;
  /** Source line 1261: `fmt(L.budget)`. */
  budgetLabel: string;
  /** Source line 1262: `roiTgt.toFixed(1)+'×'` (source used the `&times;` entity for the same glyph). */
  roiTargetLabel: string;
  /** Source line 1263: `Math.round(L.eff*100)+'%'`. */
  adoptionLabel: string;
  /** Source line 1299 `setTicks('amb-t',L.amb)` — which of the 5 `amb-t` ticks is "on". */
  ambitionTickIndex: number;
  /** Source line 1299 `setTicks('tol-t', L.tol<34?0:L.tol<67?1:2)`. */
  toleranceTickIndex: 0 | 1 | 2;
  /** Source line 1299 `setTicks('speed-t', L.speed<34?0:L.speed<67?1:2)`. */
  speedTickIndex: 0 | 1 | 2;
}

export interface EconomicsView {
  /** Source line 1265: `roi.toFixed(1)+'×'`. */
  roiText: string;
  /** Source line 1266: `roi>=L.roiTgt`. Drives source's `tgt-ok`/`tgt-lo` class (line 1267) — carried here as a boolean, not a class name. */
  roiMeetsTarget: boolean;
  /** Source lines 1268-1271, the three-way `roi-note` ternary. */
  roiNote: string;
  /** Source line 1272: `payM?payM+' mo':'·'`. */
  paybackText: string;
  /** Source line 1273: `funded.length`. */
  fundedCount: number;
  /** Source line 1273: `OPPS.length` (denominator of "of N"). */
  totalOpportunities: number;
  /** Source line 1274: `fmt(spent)`. */
  buildCostText: string;
  /** Source line 1275: `fmt(annual)`. */
  annualValueText: string;
  /** Source line 1276: `toClose.length`. */
  controlsToCloseCount: number;
  /** Source line 1277: `'to reach '+BANDS[L.amb]`. */
  controlsToCloseGoalLabel: string;
}

export interface PostureSegment {
  /** 0-4, matches `BANDS` index. */
  index: number;
  band: string;
  /** Source line 1278: `i===CUR`. */
  isCurrent: boolean;
  /** Source line 1278: `i===L.amb`. */
  isTarget: boolean;
  /** Source line 1278: `i>CUR&&i<L.amb` (only evaluated when `i!==L.amb`, matching the source's `else if`). */
  isBetween: boolean;
  /** Exact source text for the segment: `(i+1)+' · '+BANDS[i]+suffix`. */
  label: string;
}

export type PostureNote =
  | { kind: 'at-target'; fundedCount: number; gatedCount: number }
  | {
      kind: 'advancing';
      fromBand: string;
      toBand: string;
      controlsToCloseCount: number;
      controlsToClose: string[];
      gatedCount: number;
    };

export interface PostureView {
  segments: PostureSegment[];
  /** Source lines 1280-1283 (`pnote`). */
  note: PostureNote;
  /** Source line 1284: `(L.tol>66&&gap>=2&&gated.length>0)`. */
  warnOn: boolean;
}

export type PlanRiskVariant = 'status-positive' | 'status-caution' | 'status-alert';

/** One funded-play row, source lines 1285-1290 (`tb` map body). */
export interface PlanTableRow {
  name: string;
  /** Source: `o.found` → renders the "foundational" pill-soft badge. */
  isFoundational: boolean;
  /** Source: `o.disc` → renders the "from Discovery" pill-soft badge. */
  isFromDiscovery: boolean;
  category: string;
  buildCostText: string;
  annualValueText: string;
  /** Source: `Math.round(o.cost/(o.val*L.eff)*12)` — per-row payback, distinct from `PlanResult.payM`'s blended figure. */
  paybackMonths: number;
  riskLabel: string;
  /** Maps `o.r` onto the Tag primitive's (P4) closed variant set: low→positive, med→caution, high→alert. */
  riskVariant: PlanRiskVariant;
}

/** One "sequence-gated" row, source lines 1293-1295 (`gatedlist`, first 6). */
export interface GatedRow {
  name: string;
  annualValueText: string;
  category: string;
  /** Source: `o.weakGate` — the control family this play unlocks after. */
  unlocksAfterControl: string;
  /** Source: `CTRL[o.weakGate]`. */
  unlocksAfterControlScore: number;
}

/** One "cleared governance, outside budget" row, source lines 1296-1298 (`benchlist`, first 6). */
export interface BenchRow {
  name: string;
  annualValueText: string;
  buildCostText: string;
  /** Source: `'+'+fmt(o.cost)+' to add'`. */
  addCostText: string;
}

export interface RecomputeView {
  sliders: SliderState;
  L: Levers;
  plan: PlanResult;
  levers: LeverDisplay;
  economics: EconomicsView;
  posture: PostureView;
  stance: StanceView;
  /** Source lines 1285-1291 (`tb`), full funded list — no source-side truncation. */
  planRows: PlanTableRow[];
  /** Source lines 1293-1295 (`gatedlist`) — first 6 only, matching `gated.slice(0,6)`. */
  gatedRows: GatedRow[];
  /** Source lines 1296-1298 (`benchlist`) — first 6 only, matching `bench.slice(0,6)`. */
  benchRows: BenchRow[];
}

/**
 * Port of every non-DOM derivation inside `recompute()` (source lines
 * 1256-1301; line 1302's `renderGantt(P); renderRegister(); renderPipe();`
 * is out of scope — see module doc). One function, mirroring the
 * source's single `recompute()` entry point, so a verifier can diff this
 * body against source lines 1256-1301 top to bottom.
 */
export function deriveRecomputeView(sliders: SliderState, opportunities: PlanOpportunity[] = OPPS): RecomputeView {
  const L = readLevers(sliders);
  const plan = computePlan(sliders, opportunities);
  const { funded, gated, bench, ready, spent, annual, roi, payM, toClose } = plan;

  const levers: LeverDisplay = {
    ambitionLabel: BANDS[L.amb] ?? '',
    toleranceLabel: `${L.tol < 34 ? 'Conservative' : L.tol < 67 ? 'Balanced' : 'Aggressive'} · gate ${L.threshold}%`,
    speedLabel: `${L.speed < 34 ? 'Quick wins' : L.speed < 67 ? 'Balanced' : 'Strategic'} · ${L.speed}`,
    budgetLabel: fmt(L.budget),
    roiTargetLabel: `${L.roiTgt.toFixed(1)}×`,
    adoptionLabel: `${Math.round(L.eff * 100)}%`,
    ambitionTickIndex: L.amb,
    toleranceTickIndex: L.tol < 34 ? 0 : L.tol < 67 ? 1 : 2,
    speedTickIndex: L.speed < 34 ? 0 : L.speed < 67 ? 1 : 2,
  };

  const meets = roi >= L.roiTgt;
  const lastP = funded[funded.length - 1];
  const marg = lastP ? (lastP.val * L.eff * 3) / lastP.cost : 0;
  const roiNote = meets
    ? `clears your ${L.roiTgt.toFixed(1)}× bar · blended across ${funded.length} plays`
    : lastP && marg < L.roiTgt
      ? `below your ${L.roiTgt.toFixed(1)}× bar · the last play funded returns ${marg.toFixed(1)}× and dilutes the blend · trim budget to the best plays, raise adoption, or lower the bar`
      : `below your ${L.roiTgt.toFixed(1)}× bar · foundational builds in the mix pay off in later years · raise adoption, tilt the horizon toward quick wins, or lower the bar`;

  const economics: EconomicsView = {
    roiText: `${roi.toFixed(1)}×`,
    roiMeetsTarget: meets,
    roiNote,
    paybackText: payM ? `${payM} mo` : '·',
    fundedCount: funded.length,
    totalOpportunities: opportunities.length,
    buildCostText: fmt(spent),
    annualValueText: fmt(annual),
    controlsToCloseCount: toClose.length,
    controlsToCloseGoalLabel: `to reach ${BANDS[L.amb] ?? ''}`,
  };

  const gap = L.amb - CUR;

  const segments: PostureSegment[] = BANDS.map((band, i) => {
    const isCurrent = i === CUR;
    const isTarget = i === L.amb;
    const isBetween = !isTarget && i > CUR && i < L.amb;
    const suffix = isCurrent ? ' • now' : isTarget && !isCurrent ? ' • goal' : '';
    return { index: i, band, isCurrent, isTarget, isBetween, label: `${i + 1} · ${band}${suffix}` };
  });

  const note: PostureNote =
    gap <= 0
      ? { kind: 'at-target', fundedCount: funded.length, gatedCount: gated.length }
      : {
          kind: 'advancing',
          fromBand: BANDS[CUR] ?? '',
          toBand: BANDS[L.amb] ?? '',
          controlsToCloseCount: toClose.length,
          controlsToClose: toClose,
          gatedCount: gated.length,
        };

  const posture: PostureView = {
    segments,
    note,
    warnOn: L.tol > 66 && gap >= 2 && gated.length > 0,
  };

  const stance = stanceText(L, gap, ready.length, gated.length, opportunities.length);

  const planRows: PlanTableRow[] = funded.map((o) => ({
    name: o.n,
    isFoundational: Boolean(o.found),
    isFromDiscovery: Boolean(o.disc),
    category: o.c,
    buildCostText: fmt(o.cost),
    annualValueText: fmt(o.val * L.eff),
    paybackMonths: Math.round((o.cost / (o.val * L.eff)) * 12),
    riskLabel: riskLabel(o.r),
    riskVariant: o.r === 'low' ? 'status-positive' : o.r === 'med' ? 'status-caution' : 'status-alert',
  }));

  const gatedRows: GatedRow[] = gated.slice(0, 6).map((o) => ({
    name: o.n,
    annualValueText: fmt(o.val * L.eff),
    category: o.c,
    unlocksAfterControl: o.weakGate,
    unlocksAfterControlScore: CTRL[o.weakGate] ?? 0,
  }));

  const benchRows: BenchRow[] = bench.slice(0, 6).map((o) => ({
    name: o.n,
    annualValueText: fmt(o.val * L.eff),
    buildCostText: fmt(o.cost),
    addCostText: `+${fmt(o.cost)} to add`,
  }));

  return { sliders, L, plan, levers, economics, posture, stance, planRows, gatedRows, benchRows };
}
