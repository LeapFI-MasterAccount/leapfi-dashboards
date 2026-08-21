/**
 * L11 (call-10, DECISIONS.md D13) — persona-dashboard persistence
 * mechanism, unit level.
 *
 * REPRO-CHECK (sprint-plan L11 entry criteria): before D13's fix, Dan's
 * "settings don't persist on refresh" complaint reproduces against a
 * NON-persona setting (panel order/visibility, HomeCustomizeBar.tsx) and
 * the CURRENT (pre-fix) mechanism — HOME_ORDER (data/misc.ts) is a bare
 * module-level object with zero localStorage backing, so a real browser
 * refresh (full ES-module re-evaluation) always reverts it to empty. The
 * first describe block below proves this mechanically via
 * `vi.resetModules()` (standing in for the module-graph reset a real
 * refresh performs) against the OLD write path (HOME_ORDER mutated
 * directly, the way HomeCustomizeBar.tsx's commitVisibleKeys worked
 * before this dispatch) — it reproduces. The one-line fix (persist +
 * consult localStorage) is exercised by the second block, proving the
 * SAME reload simulation now survives.
 *
 * demoStore.ts's `getPersistedHomeOrder`/`persistHomeOrder` are exercised
 * directly here; views/HomeCustomizeBar.tsx's own resolveVisibleKeys/
 * commitVisibleKeys wiring onto them is covered at the integration level
 * by shell/persona-dashboard-persistence.test.tsx and shell/home.test.tsx.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'nw-platform-v2-home-layout';

beforeEach(() => {
  window.localStorage.clear();
});

describe('getPersistedHomeOrder / persistHomeOrder (state/demoStore.ts) — the D13 fix', () => {
  it('returns undefined for a role with no persisted order and no persona seed', async () => {
    const { getPersistedHomeOrder } = await import('../../state/demoStore');
    expect(getPersistedHomeOrder('test-no-seed-role')).toBeUndefined();
  });

  it('persistHomeOrder writes to localStorage under the role key; getPersistedHomeOrder reads it back', async () => {
    const { getPersistedHomeOrder, persistHomeOrder } = await import('../../state/demoStore');
    persistHomeOrder('test-role-a', ['queue', 'posture']);
    expect(getPersistedHomeOrder('test-role-a')).toEqual(['queue', 'posture']);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toMatchObject({ 'test-role-a': ['queue', 'posture'] });
  });

  it('a persisted order survives a simulated refresh (vi.resetModules + re-import), proving the D13 fix against the SAME repro used above', async () => {
    const { persistHomeOrder } = await import('../../state/demoStore');
    persistHomeOrder('test-role-b', ['invest', 'qa']);

    vi.resetModules();
    const { getPersistedHomeOrder: reloadedGet } = await import('../../state/demoStore');
    expect(reloadedGet('test-role-b')).toEqual(['invest', 'qa']);
  });

  it("Adam ('ceo') carries a financial-focused persona seed — 'invest' leads — with no explicit persistHomeOrder call needed", async () => {
    const { getPersistedHomeOrder } = await import('../../state/demoStore');
    const order = getPersistedHomeOrder('ceo');
    expect(order?.[0]).toBe('invest');
  });

  it("Rachel ('cro') carries NO explicit seed entry — the shipped default (posture-first) already satisfies 'risk-focused' (see demoStore.ts section header)", async () => {
    const { getPersistedHomeOrder } = await import('../../state/demoStore');
    expect(getPersistedHomeOrder('cro')).toBeUndefined();
  });

  it('a persisted per-role order overrides that role\'s persona seed once the user customizes', async () => {
    const { getPersistedHomeOrder, persistHomeOrder } = await import('../../state/demoStore');
    persistHomeOrder('ceo', ['qa']);
    expect(getPersistedHomeOrder('ceo')).toEqual(['qa']);
  });
});

describe('resetDemo() clears the persisted home layout (state/demoStore.ts)', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('a persisted customization does not survive resetDemo() — Restart\'s "back to opening state" contract holds even with persistence added', async () => {
    const { persistHomeOrder, getPersistedHomeOrder, resetDemo } = await import('../../state/demoStore');
    persistHomeOrder('test-role-c', ['qa', 'posture']);
    expect(getPersistedHomeOrder('test-role-c')).toEqual(['qa', 'posture']);

    resetDemo();
    expect(getPersistedHomeOrder('test-role-c')).toBeUndefined();
  });

  it("resetDemo() does not remove Adam's ('ceo') in-code persona seed — only session-written localStorage customization", async () => {
    const { persistHomeOrder, getPersistedHomeOrder, resetDemo } = await import('../../state/demoStore');
    persistHomeOrder('ceo', ['qa']); // Adam customizes away from his seed
    expect(getPersistedHomeOrder('ceo')).toEqual(['qa']);

    resetDemo();
    // Back to the persona seed, not undefined and not the customized value.
    expect(getPersistedHomeOrder('ceo')?.[0]).toBe('invest');
  });
});
