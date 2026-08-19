/**
 * Regression: views/HomeCustomizeBar.tsx `resolveVisibleKeys` healing vs
 * the BASE `homeOrder()` (leapfi-platform.html @ pin 1c230fe, lines
 * 4126–4133; HP catalog 4125; HOME_ORDER 4124 "Empty means 'not
 * customised yet'" — survey_map.md "home customization HP/HOME_HIDE/ORDER
 * (4122–93)").
 *
 * Dispatch-pinned behaviors:
 *  - a NEVER-customized role (no HOME_ORDER entry) heals to all 5
 *    customizable panels, in HP order (base 4131: keys.forEach appends
 *    every key the stored sequence missed);
 *  - a role customized TO EMPTY stays empty — the stored sequence is
 *    authoritative once it exists (port's documented amendment, per its
 *    file header, to base 4129–4131, where a `[]` fails the
 *    `stored&&stored.length` guard and heals back to the full set; the
 *    dispatch brief names "customized-to-empty stays empty" as the
 *    behavior under pin).
 *
 * The 5-key universe is HP (4125) minus 'kpis' — the port scopes the
 * customize bar to the five optional panels.
 *
 * `HOME_ORDER` is shared module state (data/misc.ts); each test uses its
 * own role key and afterEach removes every key it wrote, so no state
 * leaks into sibling suites (tests observe, never adapt, D17).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_VISIBLE_KEYS, resolveVisibleKeys } from '../../views/HomeCustomizeBar'
import { HOME_ORDER, HP } from '../../data/misc'

const TEST_ROLES = [
  'test-fresh-role',
  'test-empty-role',
  'test-subset-role',
  'test-stale-role',
  'test-dup-role',
] as const

afterEach(() => {
  TEST_ROLES.forEach((k) => {
    delete HOME_ORDER[k]
  })
})

describe('resolveVisibleKeys healing vs base homeOrder (base 4126–4133)', () => {
  it('the 5-key universe is HP (base 4125) minus kpis, in HP order', () => {
    expect(HP.map((p) => p[0])).toEqual(['kpis', 'posture', 'legis', 'invest', 'queue', 'qa'])
    expect([...DEFAULT_VISIBLE_KEYS]).toEqual(['posture', 'legis', 'invest', 'queue', 'qa'])
  })

  it('a never-customized role heals to all 5 panels in HP order (base 4128–4131: no stored sequence -> every key appended)', () => {
    expect(HOME_ORDER['test-fresh-role']).toBeUndefined()
    expect(resolveVisibleKeys('test-fresh-role')).toEqual(['posture', 'legis', 'invest', 'queue', 'qa'])
  })

  it('healing returns a fresh array — later mutation cannot corrupt the default set', () => {
    const first = resolveVisibleKeys('test-fresh-role')
    first.push('posture')
    expect(resolveVisibleKeys('test-fresh-role')).toEqual(['posture', 'legis', 'invest', 'queue', 'qa'])
  })

  it('a role customized to EMPTY stays empty — stored sequence is authoritative (dispatch pin; port amendment to base 4129)', () => {
    HOME_ORDER['test-empty-role'] = []
    expect(resolveVisibleKeys('test-empty-role')).toEqual([])
  })

  it('a customized subset keeps exactly the stored keys in stored order (base 4130: stored.forEach preserves pick order)', () => {
    HOME_ORDER['test-subset-role'] = ['queue', 'posture']
    expect(resolveVisibleKeys('test-subset-role')).toEqual(['queue', 'posture'])
  })

  it('a stored key no longer in the catalog is dropped, never orphaned onto the page (base 4130: keys.indexOf(k)>=0 guard)', () => {
    HOME_ORDER['test-stale-role'] = ['posture', 'retired-panel', 'qa']
    expect(resolveVisibleKeys('test-stale-role')).toEqual(['posture', 'qa'])
  })

  it('duplicate stored keys render once (base 4130: out.indexOf(k)<0 guard)', () => {
    HOME_ORDER['test-dup-role'] = ['invest', 'invest', 'legis']
    expect(resolveVisibleKeys('test-dup-role')).toEqual(['invest', 'legis'])
  })

  it("'kpis' is outside the customizable universe and is dropped from a stored sequence (port scope; base HP[0] 4125)", () => {
    HOME_ORDER['test-subset-role'] = ['kpis', 'posture']
    expect(resolveVisibleKeys('test-subset-role')).toEqual(['posture'])
  })
})
