/**
 * Regression: views/ChatIntakeWizard.tsx `computeScopedOpportunity` vs the
 * BASE `finishIntake()` envelope arithmetic (leapfi-platform.html @ pin
 * 1c230fe, lines 4369–4386; gateCalc line 1194; INTAKE chip texts
 * 4357–4362 — survey_map.md "chat plumbing + INTAKE ... (4328–4491)").
 *
 * D17: every expected cost/val/gates/risk/category below was produced by
 * EXECUTING the base page's own finishIntake arithmetic (4369–4386,
 * verbatim, DOM/chat writes excluded) + gateCalc (1194) in a node vm
 * sandbox against the base CTRL table (1171). Answers are the byte-exact
 * INTAKE chip texts (4357–4362) — the only answers the ported chip-only
 * wizard can produce.
 *
 * Case note: the port lowercases answers[0]/answers[1] before the
 * 'depart'/'30+'/'5,000+'/'500–' probes where the base matches
 * case-sensitively (4371–4372); for the catalog chip texts (the full
 * reachable input space of the chip-only wizard) the outcomes are
 * identical, which is what these tests pin.
 */
import { describe, expect, it, test } from 'vitest'
import { computeScopedOpportunity } from '../../views/ChatIntakeWizard'
import type { PlanOpportunity } from '../../engine/plan'
import { INTAKE } from '../../data/misc'

describe('computeScopedOpportunity vs base finishIntake (base 4369–4386)', () => {
  it('lending + whole department + 5,000+/mo + sensitive financial + PII (branch 4378; cost/val 4383–4384)', () => {
    const o = computeScopedOpportunity('Auto title-loan review', [
      'A whole department', // effT=2 (4371)
      '5,000+ / mo', // volT=2 (4372)
      'Touches lending decisions', // lending branch (4374, 4378)
      'Sensitive financial + PII', // pii=true, sensfin=true (4376–4377)
    ])
    expect(o.c).toBe('Lending')
    expect(o.r).toBe('high')
    // g: lending trio + Privacy appended for PII (4382)
    expect(o.g).toEqual(['Fair Lending', 'Adverse Action', 'Model Risk', 'Privacy'])
    // cost = 40000 + 2*20000 + 60000 + 0 + 15000 + 10000 (4383)
    expect(o.cost).toBe(165000)
    // val = 80000 + 2*60000 + 2*40000 (4384)
    expect(o.val).toBe(280000)
    expect(o.h).toBe('strategic') // volT>1 (4385)
    // gateCalc (1194) against CTRL (1171): min(68,55,70,80)
    expect(o.minGate).toBe(55)
    expect(o.weakGate).toBe('Adverse Action')
  })

  it('member-facing + 2 people + under 500/mo + member PII (branch 4379)', () => {
    const o = computeScopedOpportunity('Member outreach helper', [
      '2 people · ~15 hrs/wk', // effT=0
      'Under 500 items / mo', // volT=0
      'Member-facing', // memberFacing branch (4379)
      'Member PII', // pii=true, sensfin=false
    ])
    expect(o.c).toBe('Member service')
    expect(o.r).toBe('med')
    expect(o.g).toEqual(['UDAAP', 'Model Risk', 'Privacy']) // Privacy appended (4382)
    expect(o.cost).toBe(55000) // 40000 + 15000 pii
    expect(o.val).toBe(80000)
    expect(o.h).toBe('quick')
    expect(o.minGate).toBe(62) // min(62,70,80)
    expect(o.weakGate).toBe('UDAAP')
  })

  it('GL/SOX financial-reporting + team 30+ + 500–5,000/mo + sensitive financial NO PII (branch 4380; "no pii" guard 4376)', () => {
    const o = computeScopedOpportunity('GL reconciliation assist', [
      'A team · 30+ hrs/wk', // effT=1
      '500–5,000 / mo', // volT=1 (en-dash match, 4372)
      'Internal · feeds financial reporting (GL / SOX)', // finrep branch (4375, 4380)
      'Sensitive financial · no PII', // pii=false ("no pii"), sensfin=true
    ])
    expect(o.c).toBe('Operations')
    expect(o.r).toBe('med')
    expect(o.g).toEqual(['Model Risk', 'Privacy']) // finrep pair; no PII append
    expect(o.cost).toBe(85000) // 40000 + 20000 + 15000 finrep + 10000 sensfin
    expect(o.val).toBe(180000) // 80000 + 60000 + 40000
    expect(o.h).toBe('quick')
    expect(o.minGate).toBe(70) // min(70,80)
    expect(o.weakGate).toBe('Model Risk')
  })

  it('internal simple workflow + minimal everything (else branch 4381 floor: $40k/$80k, Privacy only, low)', () => {
    const o = computeScopedOpportunity('Meeting-notes summarizer', [
      '2 people · ~15 hrs/wk',
      'Under 500 items / mo',
      'Internal · simple workflow',
      'Public / internal only',
    ])
    expect(o.c).toBe('Operations')
    expect(o.r).toBe('low')
    expect(o.g).toEqual(['Privacy'])
    expect(o.cost).toBe(40000)
    expect(o.val).toBe(80000)
    expect(o.h).toBe('quick')
    expect(o.minGate).toBe(80) // CTRL['Privacy'] (1171)
    expect(o.weakGate).toBe('Privacy')
  })

  it('answers come byte-exact from the INTAKE chip catalog (base 4357–4362) — the wizard is chip-only', () => {
    // Guard for the four combos above: every answer string used is a real chip.
    const allChips = INTAKE.flatMap((q) => q.chips)
    const used = [
      'A whole department',
      '5,000+ / mo',
      'Touches lending decisions',
      'Sensitive financial + PII',
      '2 people · ~15 hrs/wk',
      'Under 500 items / mo',
      'Member-facing',
      'Member PII',
      'A team · 30+ hrs/wk',
      '500–5,000 / mo',
      'Internal · feeds financial reporting (GL / SOX)',
      'Sensitive financial · no PII',
      'Internal · simple workflow',
      'Public / internal only',
    ]
    used.forEach((chip) => expect(allChips).toContain(chip))
  })

  /**
   * Fix-wave "studio" batch: `computeScopedOpportunity` now returns the
   * base's `disc:true` (4385 — the "from Discovery" provenance flag
   * recompute() renders as a pill at 1287, modeled in the port as
   * `PlanOpportunity.disc` / `PlanTableRow.isFromDiscovery`). The earlier
   * `test.fails` deviation pin is flipped to a normal passing assertion
   * per the base anchor (D17).
   */
  test('scoped play carries disc:true — the "from Discovery" provenance flag (base 4385, rendered 1287)', () => {
    const o: PlanOpportunity = computeScopedOpportunity('Any new idea', [
      '2 people · ~15 hrs/wk',
      'Under 500 items / mo',
      'Internal · simple workflow',
      'Public / internal only',
    ])
    expect(o.disc).toBe(true)
  })
})
