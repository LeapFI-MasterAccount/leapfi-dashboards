/**
 * Read-only origin-signal resolver (lane-1: data-case-union-origin-
 * resolution, PI2-D44 front-load). Maps a case's document id to its
 * originating `SignalEntry` (data/misc.ts `SIGNAL`) — the data behind
 * PI2-D31's origin field group (AC-r02-1/AC-r02-2, r02_one_case_page.md)
 * and design_system_spec.md §2.10.1 item 5's human-contributed-edit
 * unresolvable-origin empty state (amendment A17).
 *
 * This module renders nothing (Lane 2 owns rendering) and never mutates
 * `SIGNAL`/`data/cases.ts`. It does not import `data/cases.ts` — it takes
 * a plain document id string rather than a `Case`/`DeadlineDrivenCase`
 * object, so it works uniformly across every current and future PI2-D2
 * case type that carries a `doc` id, with no cross-module coupling and no
 * risk of a data/cases.ts <-> data/originSignal.ts import cycle.
 *
 * Linkage mechanism: `SIGNAL[n].touch` is the only existing, already-
 * shipped linkage between a regulatory signal and a document
 * (`SignalTouch = [kind, id, label?]`, kind `'doc'` for a document
 * touch — `data/misc.ts`). No new field is added to `SignalEntry` or to
 * any `Case` shape to build this join (r17b_case_boundary.md AC:
 * "SignalEntry ... and Case ... remain separate types with no field
 * merge into Case").
 *
 * Tie-break rule (implementation detail, not a design ruling): more than
 * one `SIGNAL` entry can touch the same document (e.g. `'gov-charter'` is
 * touched by both `SIGNAL[0]` — RFI 2026-04 — and `SIGNAL[3]` — TX HB149).
 * This resolver returns the FIRST match in `SIGNAL`'s array order,
 * deterministically; no acceptance criterion found in scope specifies a
 * tie-break rule, so "first in array order" is the minimal, mechanical,
 * fully-testable choice.
 */
import { SIGNAL } from './misc';
import type { SignalEntry } from './misc';

export interface ResolvedOriginSignal {
  resolved: true;
  signal: SignalEntry;
  /** Index into `SIGNAL` — kept for callers that need the raw array position (e.g. a future signal-kind deep-link id). */
  signalIndex: number;
}

export interface UnresolvedOriginSignal {
  resolved: false;
}

export type OriginSignalResolution = ResolvedOriginSignal | UnresolvedOriginSignal;

/**
 * Resolve a case's originating `SignalEntry` by document id. Returns an
 * explicit `{ resolved: false }` result — never a blank/undefined
 * `signal` — for a falsy id or a doc id no `SIGNAL` entry touches, so a
 * caller renders the origin field group's empty-state message rather
 * than a blank row set (AC-r02-2).
 */
export function resolveOriginSignal(docId: string | null | undefined): OriginSignalResolution {
  if (!docId) return { resolved: false };
  const signalIndex = SIGNAL.findIndex((entry) => entry.touch.some((tuple) => tuple[0] === 'doc' && tuple[1] === docId));
  if (signalIndex === -1) return { resolved: false };
  return { resolved: true, signal: SIGNAL[signalIndex] as SignalEntry, signalIndex };
}
