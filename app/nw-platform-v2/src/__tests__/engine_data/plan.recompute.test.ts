/**
 * Regression: engine/plan.ts recompute outcomes vs the BASE engine
 * (leapfi-platform.html @ pin 1c230fe, survey_map.md "JS data & engines
 * (1150–2370)": computePlan/sortPool 1214–55 · recompute 1256–1303; and
 * editing-safety rule (d)2 — "recompute() coupled to 20+ element ids").
 *
 * D17: every expected value below was produced by EXECUTING THE BASE
 * PAGE'S OWN JS (lines 1157, 1171–1195, 1217–1228, 1234–1255) in a node
 * vm sandbox with the lever arithmetic of readLevers (1229–1233) applied
 * to the slider values — not by running the module under test against
 * itself. Slider defaults per survey_map.md "921–996 ... defaults
 * Ambition 3/Risk 52/Horizon 50/$450k/ROI 2.5x/adoption input 70".
 *
 * Tests observe engine outputs (pure functions); no app file is adapted.
 */
import { describe, expect, it } from 'vitest'
import {
  computePlan,
  deriveRecomputeView,
  fmt,
  readLevers,
  riskLabel,
  riskOrder,
  stanceText,
} from '../../engine/plan'
import type { SliderState } from '../../engine/plan'

/** Base slider defaults — leapfi-platform.html 927–956 (#amb 3, #tol 52,
 * #speed 50, #budget 450000, #roi 2.5, #eff 70). */
const DEFAULTS: SliderState = { amb: 3, tol: 52, speed: 50, budget: 450000, roi: 2.5, eff: 70 }

const names = (plays: ReadonlyArray<{ n: string }>): string[] => plays.map((o) => o.n)

describe('shared helpers (base 1157, 1217–1218)', () => {
  it('fmt matches base line 1157 for k and M magnitudes', () => {
    expect(fmt(45000)).toBe('$45k')
    expect(fmt(878500)).toBe('$879k') // Math.round(878.5) = 879
    expect(fmt(1046500)).toBe('$1.05M')
    expect(fmt(250000)).toBe('$250k')
  })

  it('riskOrder / riskLabel match base lines 1217–1218', () => {
    expect([riskOrder('low'), riskOrder('med'), riskOrder('high')]).toEqual([0, 1, 2])
    expect([riskLabel('low'), riskLabel('med'), riskLabel('high')]).toEqual(['Low', 'Moderate', 'High'])
  })
})

describe('readLevers arithmetic (base 1229–1233)', () => {
  it('derives threshold 65 / allowRisk 3 / eff 0.7 at the base defaults', () => {
    const L = readLevers(DEFAULTS)
    expect(L.threshold).toBe(65) // Math.round(88 - 52*0.45)
    expect(L.allowRisk).toBe(3) // amb 3 -> 3
    expect(L.eff).toBe(0.7) // +$('eff').value/100
    expect(L.roiTgt).toBe(2.5)
  })

  it('maps ambition bands to allowRisk exactly as the base ternary (1232)', () => {
    expect(readLevers({ ...DEFAULTS, amb: 0 }).allowRisk).toBe(1)
    expect(readLevers({ ...DEFAULTS, amb: 1 }).allowRisk).toBe(1)
    expect(readLevers({ ...DEFAULTS, amb: 2 }).allowRisk).toBe(2)
    expect(readLevers({ ...DEFAULTS, amb: 4 }).allowRisk).toBe(3)
  })
})

describe('computePlan at BASE DEFAULT levers (base 1245–1255; sortPool 1234–1244)', () => {
  const plan = computePlan(DEFAULTS)

  it('clears 9 of 15 plays and gates 6 — the "9 of 15 plays clear" stance denominator (base 1226, 1250)', () => {
    expect(plan.ready).toHaveLength(9)
    expect(plan.gated).toHaveLength(6)
  })

  it('orders the ready pool exactly as base sortPool (1234–1244) and splits ready/gated on minGate>=65 (1250)', () => {
    expect(names(plan.ready)).toEqual([
      'Call-center copilot',
      'Loan-document summarization',
      'SAR narrative drafting',
      'Transaction-monitoring tuning assist',
      'Reason-code remediation program',
      'Fraud model refresh',
      'Vendor-risk automation',
      'Deposit pricing optimization',
      'Unified data foundation',
    ])
    expect(names(plan.gated)).toEqual([
      'Member secure-message triage',
      'Underwriting assist',
      'Marketing personalization',
      'Complaint analytics',
      'Member FAQ chatbot',
      'AI adverse-action letter drafting',
    ])
  })

  it('funds 7 plays greedily within the $450k budget, benching the rest (base 1251–1252)', () => {
    expect(names(plan.funded)).toEqual([
      'Call-center copilot',
      'Loan-document summarization',
      'SAR narrative drafting',
      'Transaction-monitoring tuning assist',
      'Reason-code remediation program',
      'Fraud model refresh',
      'Vendor-risk automation',
    ])
    expect(names(plan.bench)).toEqual(['Deposit pricing optimization', 'Unified data foundation'])
    expect(plan.spent).toBe(400000)
    expect(plan.annual).toBe(878500)
  })

  it('derives blended ROI 6.6x and 5-month payback (base 1253)', () => {
    expect(plan.roi.toFixed(1)).toBe('6.6')
    expect(plan.payM).toBe(5)
  })

  it('lists control families below GREEN weakest-first (base 1254)', () => {
    expect(plan.toClose).toEqual(['Adverse Action', 'UDAAP', 'TPRM', 'Fair Lending', 'Model Risk', 'BSA/AML'])
  })
})

describe('computePlan at NON-DEFAULT levers — amb 1 / tol 0 (base 1229–1255)', () => {
  const sliders: SliderState = { ...DEFAULTS, amb: 1, tol: 0 }
  const plan = computePlan(sliders)

  it('threshold 88 / allowRisk 1: only low-risk plays enter, only the foundation clears', () => {
    expect(plan.L.threshold).toBe(88)
    expect(plan.L.allowRisk).toBe(1)
    expect(names(plan.ready)).toEqual(['Unified data foundation'])
    expect(names(plan.gated)).toEqual([
      'Call-center copilot',
      'Member secure-message triage',
      'Loan-document summarization',
      'Complaint analytics',
      'Reason-code remediation program',
      'Vendor-risk automation',
    ])
  })

  it('funds the single ready play: spent 250k, annual 84k, ROI 1.0x, 36-month payback', () => {
    expect(names(plan.funded)).toEqual(['Unified data foundation'])
    expect(plan.bench).toEqual([])
    expect(plan.spent).toBe(250000)
    expect(plan.annual).toBe(84000)
    expect(plan.roi.toFixed(1)).toBe('1.0')
    expect(plan.payM).toBe(36)
  })
})

describe('computePlan at NON-DEFAULT levers — amb 2 / tol 100 (base 1229–1255)', () => {
  const sliders: SliderState = { ...DEFAULTS, amb: 2, tol: 100 }
  const plan = computePlan(sliders)

  it('threshold 43 / allowRisk 2: high-risk plays excluded, all 13 remaining clear', () => {
    expect(plan.L.threshold).toBe(43)
    expect(plan.L.allowRisk).toBe(2)
    expect(plan.ready).toHaveLength(13)
    expect(plan.gated).toEqual([])
    // the two high-risk plays never enter the pool (riskOrder+1<=2, base 1247)
    expect(names(plan.ready)).not.toContain('Underwriting assist')
    expect(names(plan.ready)).not.toContain('AI adverse-action letter drafting')
  })

  it('funds 10 plays to exactly the $450k budget; ROI 7.0x', () => {
    expect(names(plan.funded)).toEqual([
      'Call-center copilot',
      'Member secure-message triage',
      'Loan-document summarization',
      'Marketing personalization',
      'SAR narrative drafting',
      'Complaint analytics',
      'Member FAQ chatbot',
      'Transaction-monitoring tuning assist',
      'Reason-code remediation program',
      'Vendor-risk automation',
    ])
    expect(names(plan.bench)).toEqual(['Fraud model refresh', 'Deposit pricing optimization', 'Unified data foundation'])
    expect(plan.spent).toBe(450000)
    expect(plan.annual).toBe(1046500)
    expect(plan.roi.toFixed(1)).toBe('7.0')
    expect(plan.payM).toBe(5)
  })
})

describe('stanceText (base 1220–1228) — same words as the base html fold, as data', () => {
  it('defaults: "Balanced: a far reach with balanced gating." + 9 of 15 (base 1225–1226)', () => {
    const L = readLevers(DEFAULTS)
    const st = stanceText(L, L.amb - 1 /* CUR=1, base 1173 */, 9, 6)
    expect(st.lead).toBe('Balanced: a far reach with balanced gating.')
    expect(st.body).toBe('9 of 15 plays clear today. 6 wait on controls.')
    expect(st.tension).toBe(false)
  })

  it('amb 1 / tol 0: Conservative branch (base 1223)', () => {
    const L = readLevers({ ...DEFAULTS, amb: 1, tol: 0 })
    const st = stanceText(L, 0, 1, 6)
    expect(st.lead).toBe('Conservative: modest reach and tight gating. Lowest risk, slowest value.')
    expect(st.body).toBe('1 of 15 plays clear today. 6 wait on controls.')
    expect(st.tension).toBe(false)
  })

  it('amb 3 / tol 70: "Aggressive on both fronts" tension branch (base 1221)', () => {
    const L = readLevers({ ...DEFAULTS, tol: 70 })
    const st = stanceText(L, 2, 13, 2)
    expect(st.lead).toBe('Aggressive on both fronts: reaching far past your posture and unlocking on thin control coverage.')
    expect(st.body).toBe('13 of 15 plays clear today. 2 wait on controls.')
    expect(st.tension).toBe(true)
  })
})

describe('deriveRecomputeView — non-DOM recompute() derivations (base 1256–1303)', () => {
  it('defaults: lever labels match the base textContent writes (1258–1263, 1299)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.levers.ambitionLabel).toBe('Managed') // BANDS[3], base 1172/1258
    expect(view.levers.toleranceLabel).toBe('Balanced · gate 65%') // base 1259
    expect(view.levers.speedLabel).toBe('Balanced · 50') // base 1260
    expect(view.levers.budgetLabel).toBe('$450k') // base 1261
    expect(view.levers.roiTargetLabel).toBe('2.5×') // base 1262 (&times; glyph)
    expect(view.levers.adoptionLabel).toBe('70%') // base 1263
    expect(view.levers.toleranceTickIndex).toBe(1) // base 1299
  })

  it('defaults: economics card matches base 1265–1277 (ROI 6.6×, 5 mo, 7 of 15, $400k/$879k, 6 controls)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.economics.roiText).toBe('6.6×')
    expect(view.economics.roiMeetsTarget).toBe(true) // 6.6 >= 2.5, base 1266
    expect(view.economics.paybackText).toBe('5 mo') // base 1272
    expect(view.economics.fundedCount).toBe(7) // base 1273
    expect(view.economics.totalOpportunities).toBe(15)
    expect(view.economics.buildCostText).toBe('$400k') // base 1274
    expect(view.economics.annualValueText).toBe('$879k') // base 1275
    expect(view.economics.controlsToCloseCount).toBe(6) // base 1276
    expect(view.economics.controlsToCloseGoalLabel).toBe('to reach Managed') // base 1277
  })

  it('defaults: stance carries the "9 of 15 plays clear" reading (base 1291: stanceText into #stance)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.stance.body).toBe('9 of 15 plays clear today. 6 wait on controls.')
    expect(view.stance.lead).toBe('Balanced: a far reach with balanced gating.')
  })

  it('defaults: warn stays off; posture note is "advancing" with the 6 open controls (base 1280–1284)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.posture.warnOn).toBe(false) // tol 52 <= 66, base 1284
    expect(view.posture.note).toEqual({
      kind: 'advancing',
      fromBand: 'Developing', // BANDS[CUR=1]
      toBand: 'Managed', // BANDS[3]
      controlsToCloseCount: 6,
      controlsToClose: ['Adverse Action', 'UDAAP', 'TPRM', 'Fair Lending', 'Model Risk', 'BSA/AML'],
      gatedCount: 6,
    })
  })

  it('amb 3 / tol 70: warn light ON — tol>66, gap>=2, gated>0 (base 1284)', () => {
    const view = deriveRecomputeView({ ...DEFAULTS, tol: 70 })
    expect(view.plan.gated).toHaveLength(2)
    expect(view.posture.warnOn).toBe(true)
    expect(view.stance.tension).toBe(true)
  })

  it('defaults: plan table rows carry per-row payback and risk mapping (base 1285–1290)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    const first = view.planRows.find((r) => r.name === 'Call-center copilot')
    expect(first).toBeDefined()
    // base: Math.round(o.cost/(o.val*L.eff)*12) = round(50000/140000*12) = 4
    expect(first?.paybackMonths).toBe(4)
    expect(first?.riskLabel).toBe('Low')
    expect(first?.riskVariant).toBe('status-positive')
    expect(first?.annualValueText).toBe('$140k') // fmt(200000*0.7)
    const foundation = view.planRows.find((r) => r.isFoundational)
    expect(foundation).toBeUndefined() // foundation is benched at defaults, not funded
  })

  it('defaults: gated list is capped at 6 and names each weak gate (base 1293–1295)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.gatedRows).toHaveLength(6)
    const uw = view.gatedRows.find((r) => r.name === 'Underwriting assist')
    expect(uw?.unlocksAfterControl).toBe('Adverse Action')
    expect(uw?.unlocksAfterControlScore).toBe(55) // CTRL['Adverse Action'], base 1171
  })

  it('defaults: bench rows carry the "+$… to add" affordance text (base 1296–1298)', () => {
    const view = deriveRecomputeView(DEFAULTS)
    expect(view.benchRows.map((r) => r.addCostText)).toEqual(['+$80k to add', '+$250k to add'])
  })
})
