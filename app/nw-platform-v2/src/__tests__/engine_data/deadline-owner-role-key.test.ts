/**
 * PI2-D46 (user ruling, resolving AC-r02-D-GATE, r02_one_case_page.md
 * "deadline-driven case leg") — `data/cases.ts`'s `OWNER_ROLE_KEY` /
 * `ownerRoleKey()`: explicit DATA mapping the case record's own existing
 * `CASE_OWNER`-shaped owner strings to registered `StudioUser.roleKey`
 * values, never a runtime string-parse. Data-layer scope only (mirrors
 * `engine_data/cases.test.ts`'s own scope discipline: no view, no screen,
 * imported here).
 *
 * USER, on AC-r02-D-GATE: "This role is already on the case what are you
 * talking about?" — this file pins the resolution: only
 * `'R. Fischer · CRO'` maps to a registered roleKey today ('cro',
 * `USERS[0]`); the other three shipped `CASE_OWNER` strings
 * ('P. Nguyen · ISD', 'M. Okafor · CCO', 'A. Kaur · MRM') have no
 * corresponding `USERS` entry and must stay unmapped — `ownerRoleKey`
 * returns `null` for them and for any owner string never seen at all.
 */
import { describe, expect, it } from 'vitest';
import { CASE_OWNER, OWNER_ROLE_KEY, ownerRoleKey } from '../../data/cases';
import { USERS } from '../../data/studio';

describe('OWNER_ROLE_KEY / ownerRoleKey (PI2-D46)', () => {
  it('every value in OWNER_ROLE_KEY is a registered StudioUser.roleKey — never an invented one', () => {
    const registeredRoleKeys = new Set(USERS.map((u) => u.roleKey));
    for (const roleKey of Object.values(OWNER_ROLE_KEY)) {
      expect(registeredRoleKeys.has(roleKey)).toBe(true);
    }
  });

  it("'R. Fischer · CRO' resolves to 'cro' (USERS[0])", () => {
    expect(ownerRoleKey('R. Fischer · CRO')).toBe('cro');
    expect(USERS[0]?.roleKey).toBe('cro');
  });

  it.each(['P. Nguyen · ISD', 'M. Okafor · CCO', 'A. Kaur · MRM'])('%s has no registered roleKey — resolves to null, not a guess', (owner) => {
    expect(ownerRoleKey(owner)).toBeNull();
  });

  it('an owner string never seen in CASE_OWNER at all also resolves to null (never throws, never fabricates)', () => {
    expect(ownerRoleKey('Somebody · NEW')).toBeNull();
    expect(ownerRoleKey('')).toBeNull();
  });

  it('every CASE_OWNER value the drafted-redline leg ships is covered (mapped or deliberately absent) — no silent 5th abbreviation appears', () => {
    const shippedOwners = new Set(Object.values(CASE_OWNER));
    expect(shippedOwners).toEqual(new Set(['P. Nguyen · ISD', 'M. Okafor · CCO', 'R. Fischer · CRO', 'A. Kaur · MRM']));
    // Exactly one of the four resolves — pinned so a future CASE_OWNER
    // edit that silently starts resolving a second owner (or stops
    // resolving the one that does) is caught here, not just in the UI.
    const resolvedCount = [...shippedOwners].filter((owner) => ownerRoleKey(owner) !== null).length;
    expect(resolvedCount).toBe(1);
  });
});
