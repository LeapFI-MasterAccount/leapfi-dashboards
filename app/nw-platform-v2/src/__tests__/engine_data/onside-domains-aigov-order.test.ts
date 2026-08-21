/**
 * L10 AI governance flagship elevation (call-15; DECISIONS.md D3):
 * "AI-gov... gets prominence elevation only (Home StatCard callout reusing
 * C1/A8's `qualifier`; `DOMAINS` reordering, data-only; demo-arc close-beat
 * placement, Marisol's lane) — no dedicated nav tile."
 *
 * This pins the "DOMAINS reordering, data-only" half of D3: `aigov` is
 * promoted to the front of the `DOMAINS` array (maximal in-array
 * prominence — the array's own consumers that iterate in array order
 * without re-sorting, e.g. `OnSideOverview.tsx`'s `DOMAINS.map(...)`
 * posture-card grid, render it first). The set, length, and every other
 * domain's own fields are untouched — this is a REORDER, not a data edit.
 */
import { describe, expect, it } from 'vitest'
import { DOMAINS } from '../../data/onside'

const EXPECTED_KEYS_BEFORE_REORDER = ['bsa', 'mrm', 'tprm', 'consumer', 'fairlend', 'infosec', 'aigov', 'capital']

describe('data/onside.ts DOMAINS — aigov flagship reorder (D3)', () => {
  it('still carries the same 8-domain set, just reordered — aigov moved to the front, every other domain keeps its relative order', () => {
    expect(DOMAINS).toHaveLength(8)
    expect(DOMAINS.map((d) => d.key)).toEqual(['aigov', ...EXPECTED_KEYS_BEFORE_REORDER.filter((k) => k !== 'aigov')])
  })

  it('aigov is the first entry — the maximal-prominence position for every array-order consumer (e.g. OnSideOverview\'s posture-card grid)', () => {
    expect(DOMAINS[0]?.key).toBe('aigov')
    expect(DOMAINS[0]?.name).toBe('AI Governance')
  })

  it('reordering is data-only: every domain\'s own field values are byte-identical to the pre-reorder set (spot-checked: aigov + bsa, the domain that moved and one that did not)', () => {
    const aigov = DOMAINS.find((d) => d.key === 'aigov')
    expect(aigov).toMatchObject({
      name: 'AI Governance',
      bodies: 'NCUA · Interagency',
      inst: 'CRI FS AI RMF (flagship framework · 230 controls) · NIST AI RMF catalog',
      appl: 214,
      tot: 230,
      met: 110,
      target: 3,
      owner: 'R. Fischer · CRO',
      docs: 102,
      ev: 31,
    })
    const bsa = DOMAINS.find((d) => d.key === 'bsa')
    expect(bsa).toMatchObject({ name: 'BSA / AML Program', appl: 64, tot: 64, met: 58, target: 5 })
  })
})
