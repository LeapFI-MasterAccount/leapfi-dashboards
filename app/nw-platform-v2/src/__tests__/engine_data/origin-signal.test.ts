/**
 * Lane 1 (docflow/lane-1, PI2-D44 front-load): read-only origin-signal
 * resolver — the data behind PI2-D31's origin field group (AC-r02-1,
 * AC-r02-2) and §2.10.1 item 5's human-contributed-edit unresolvable-origin
 * empty state (design_system_spec.md, amendment A17).
 *
 * Scope discipline: data-only. No render, no DrawerContent, no view.
 */
import { describe, expect, it } from 'vitest';
import { resolveOriginSignal } from '../../data/originSignal';
import { SIGNAL } from '../../data/misc';
import { HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE, DEADLINE_DRIVEN_CASE_FIXTURE } from '../../data/cases';

function touchesDoc(entryIndex: number, docId: string): boolean {
  return (SIGNAL[entryIndex]?.touch ?? []).some((tuple) => tuple[0] === 'doc' && tuple[1] === docId);
}

describe('resolveOriginSignal — resolvable cases (AC-r02-2 populated branch)', () => {
  it('resolves "gov-charter" to SIGNAL[0] (RFI 2026-04) via deterministic first-match tie-break', () => {
    // Sanity: confirm this is a REAL tie (not a vacuous single-match test) —
    // both SIGNAL[0] and SIGNAL[3] touch 'gov-charter' as a 'doc' kind.
    expect(touchesDoc(0, 'gov-charter')).toBe(true);
    expect(touchesDoc(3, 'gov-charter')).toBe(true);

    const result = resolveOriginSignal('gov-charter');
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.signalIndex).toBe(0);
      expect(result.signal.instr).toBe('RFI 2026-04');
    }
  });

  it('resolves "gen-ai-draft" to SIGNAL[0]', () => {
    const result = resolveOriginSignal('gen-ai-draft');
    expect(result.resolved).toBe(true);
    if (result.resolved) expect(result.signalIndex).toBe(0);
  });

  it('resolves "msg-disclosure" to the Albuquerque local-ordinance signal', () => {
    const result = resolveOriginSignal('msg-disclosure');
    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.signal.t).toMatch(/Albuquerque/);
    }
  });

  it('resolves "capital-narr" to the Reg O NPRM signal (SIGNAL[1]) — DEADLINE_DRIVEN_CASE_FIXTURE\'s sibling doc', () => {
    const result = resolveOriginSignal('capital-narr');
    expect(result.resolved).toBe(true);
    if (result.resolved) expect(result.signalIndex).toBe(1);
  });
});

describe('resolveOriginSignal — unresolvable origin (AC-r02-2 empty-state branch)', () => {
  it('returns an explicit unresolved result for a doc id no SIGNAL entry touches ("rege-proc")', () => {
    // Sanity: confirm this doc id is genuinely absent from every SIGNAL
    // touch list, so the assertion below is discriminating.
    expect(SIGNAL.some((entry) => entry.touch.some((t) => t[0] === 'doc' && t[1] === 'rege-proc'))).toBe(false);

    const result = resolveOriginSignal('rege-proc');
    expect(result.resolved).toBe(false);
    expect('signal' in result).toBe(false);
  });

  it('returns unresolved for null, undefined, and empty-string doc ids', () => {
    expect(resolveOriginSignal(null).resolved).toBe(false);
    expect(resolveOriginSignal(undefined).resolved).toBe(false);
    expect(resolveOriginSignal('').resolved).toBe(false);
  });

  it('returns unresolved for a doc id that matches no document at all ("not-a-real-doc-id")', () => {
    expect(resolveOriginSignal('not-a-real-doc-id').resolved).toBe(false);
  });
});

describe('resolveOriginSignal — read-only (never mutates SIGNAL)', () => {
  it('leaves SIGNAL byte-identical after resolving both a hit and a miss', () => {
    const before = JSON.parse(JSON.stringify(SIGNAL));
    resolveOriginSignal('gov-charter');
    resolveOriginSignal('rege-proc');
    expect(SIGNAL).toEqual(before);
  });
});

describe('End-to-end against the lane-1 fixtures (data/cases.ts)', () => {
  it('§2.10.1 item 5: the human-contributed-edit fixture\'s doc resolves to UNRESOLVED', () => {
    const result = resolveOriginSignal(HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE.doc);
    expect(result.resolved).toBe(false);
  });

  it('the deadline-driven fixture\'s doc resolves to a real SIGNAL entry (RFI 2026-04)', () => {
    const result = resolveOriginSignal(DEADLINE_DRIVEN_CASE_FIXTURE.doc);
    expect(result.resolved).toBe(true);
    if (result.resolved) expect(result.signal.instr).toBe('RFI 2026-04');
  });
});
