/**
 * Lane 1 (docflow/lane-1, PI2-D44 front-load): PI2-D2's widened case-type
 * union at the data layer — design_system_spec.md §2.10.1 (amendment A17,
 * human-contributed-edit action-set closure) and r02_one_case_page.md's
 * "PI2-D2 scope rework" (deadline-driven leg).
 *
 * Scope discipline: this file tests DATA/FIXTURES ONLY (data/cases.ts).
 * No view, no screen, is imported or exercised here — Lane 2 owns
 * rendering (views/CaseDetail.tsx, screens/Cases.tsx).
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { DOCLIB } from '../../data/doclib';
import {
  CASES,
  CASE_TIER,
  seedCases,
  buildHumanContributedEditCase,
  HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE,
  DEADLINE_DRIVEN_CASE_FIXTURE,
} from '../../data/cases';
import type { Case, DeadlineDrivenCase } from '../../data/cases';

describe('seedCases() gate — unchanged by the PI2-D2 widening (r17b AC: "gate preserved")', () => {
  beforeAll(() => {
    seedCases(DOCLIB);
  });

  it('still seeds exactly the 8 drafted-redline cases, in the same doc order — the new case shapes add no entries to CASES', () => {
    expect(CASES).toHaveLength(8);
    expect(CASES.map((c) => c.doc)).toEqual([
      'irp',
      'tprm-program',
      'aa-procedure',
      'mrm-change-draft',
      'msg-disclosure',
      'rege-proc',
      'gov-charter',
      'gen-ai-draft',
    ]);
  });

  it('every seeded case is still drafted-redline-shaped (base/lang present, stage starts at analyst)', () => {
    for (const c of CASES) {
      expect(typeof c.base).toBe('string');
      expect(typeof c.lang).toBe('string');
      expect(c.stage).toBe('analyst');
      expect(c.history[0]?.who).toBe('OnSide');
    }
  });
});

describe('buildHumanContributedEditCase() — §2.10.1 amendment A17', () => {
  const baseSeed = {
    id: 'CASE-TEST-1',
    doc: 'rege-proc',
    title: 'Regulation E Error Resolution Procedure',
    dom: 'consumer',
    owner: 'M. Okafor · CCO',
    detected: 'Aug 15, 2026',
    author: 'Test Author',
    authorRole: 'cro',
    note: 'Rationale supplied by the author at authoring time.',
    lang: 'Provisional credit is extended no later than the 10th business day.',
  };

  it('AC-A17-1 (data half): throws when seeded at stage "analyst" — the entry stage is never analyst for this leg', () => {
    expect(() => buildHumanContributedEditCase({ ...baseSeed, stage: 'analyst' })).toThrow(/analyst/i);
  });

  it('accepts every other reachable stage (cro, legal, committee, final, closed, rejected)', () => {
    for (const stage of ['cro', 'legal', 'committee', 'final', 'closed', 'rejected']) {
      expect(() => buildHumanContributedEditCase({ ...baseSeed, stage })).not.toThrow();
      expect(buildHumanContributedEditCase({ ...baseSeed, stage }).stage).toBe(stage);
    }
  });

  it('AC-A17-3: history[0] names the human author and "Language drafted directly by the {role}", never OnSide/"Change detected..."', () => {
    const c = buildHumanContributedEditCase({ ...baseSeed, stage: 'cro' });
    expect(c.history).toHaveLength(1);
    expect(c.history[0]?.who).toBe('Test Author');
    expect(c.history[0]?.who).not.toBe('OnSide');
    expect(c.history[0]?.role).toBe('cro');
    expect(c.history[0]?.what).toBe('Language drafted directly by the cro');
    expect(c.history[0]?.what).not.toMatch(/change detected/i);
    expect(c.history[0]?.note).toBe(baseSeed.note);
  });

  it('rule 1/3: edited=false and base===lang — there is no OnSide draft to have edited or to revert to', () => {
    const c = buildHumanContributedEditCase({ ...baseSeed, stage: 'cro' });
    expect(c.edited).toBe(false);
    expect(c.base).toBe(c.lang);
    expect(c.base).toBe(baseSeed.lang);
  });

  it('produces a Case with EXACTLY the existing Case field set — no new field is introduced for this leg (A17\'s own reuse rationale)', () => {
    seedCases(DOCLIB);
    const existingCase = CASES[0] as Case;
    const humanCase = buildHumanContributedEditCase({ ...baseSeed, stage: 'cro' });
    expect(Object.keys(humanCase).sort()).toEqual(Object.keys(existingCase).sort());
  });
});

describe('HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE', () => {
  it('is seeded at stage "cro", never "analyst" (AC-A17-1 grep-equivalent check on the exported fixture)', () => {
    expect(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.stage).toBe('cro');
    expect(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.stage).not.toBe('analyst');
  });

  it('names a human author in history[0], not OnSide', () => {
    expect(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.history[0]?.who).not.toBe('OnSide');
  });

  it('carries a doc id ("rege-proc") that AC-r02-2\'s unresolvable-origin empty state can exercise (verified against SIGNAL in origin-signal.test.ts)', () => {
    expect(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.doc).toBe('rege-proc');
  });
});

describe('DeadlineDrivenCase / DEADLINE_DRIVEN_CASE_FIXTURE — PI2-D2 leg (b)', () => {
  it('is a distinct shape from Case — no stage/tier/cond/base/lang fields (per r17b AC: no field merge)', () => {
    const fixture: DeadlineDrivenCase = DEADLINE_DRIVEN_CASE_FIXTURE;
    expect(fixture.kind).toBe('deadline-driven');
    expect('stage' in fixture).toBe(false);
    expect('tier' in fixture).toBe(false);
    expect('base' in fixture).toBe(false);
    expect('lang' in fixture).toBe(false);
  });

  it('carries a status in the track/complete verb pair (PI2-D2: "deadline cases carry track/complete actions")', () => {
    expect(['tracking', 'completed']).toContain(DEADLINE_DRIVEN_CASE_FIXTURE.status);
  });

  it('carries a doc id for origin resolution, same mechanism as a drafted-redline case', () => {
    expect(typeof DEADLINE_DRIVEN_CASE_FIXTURE.doc).toBe('string');
    expect(DEADLINE_DRIVEN_CASE_FIXTURE.doc.length).toBeGreaterThan(0);
  });
});

describe('CASE_TIER is unaffected by the widening (still the 8-key drafted-redline map)', () => {
  it('has exactly the 8 original keys', () => {
    expect(Object.keys(CASE_TIER).sort()).toEqual(
      ['gov-charter', 'mrm-change-draft', 'gen-ai-draft', 'irp', 'tprm-program', 'aa-procedure', 'msg-disclosure', 'rege-proc'].sort(),
    );
  });
});
