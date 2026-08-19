/**
 * Board update log — data module (parity_ia_addendum.md §1.8 "Board log",
 * line 178; §2 item 2, lines 196-199 — batch-8's undelivered half, owned by
 * this dispatch, W4).
 *
 * Ported from leapfi-dashboards/src/leapfi-platform.html (read-only
 * reference, pin 1c230fe):
 *   - BOARD_LOG (`var BOARD_LOG={}`) .................. source line 3576
 *   - entry shape ({txt, when, who, date}) ............ boardSave, line 3589
 *   - standing 7-row table literal .................... boardStandingHTML,
 *                                                       lines 3595-3602
 *
 * Same "TypeScript types around the same literal data — no business logic"
 * discipline as every sibling data module (see `data/onside.ts`'s own file
 * header): `boardUpdate`/`boardSave` (source 3577-3593) are drawer-render
 * and commit-controller behavior — the who/when construction
 * (`CURRENT.first+' '+(CURRENT.role||'')`, the hardcoded `'Aug 15, 2026'`
 * timestamp, the unshift, the `closeDrawer();openReport('regchange')`
 * sequence) belongs to whichever screen commits the update (the gate
 * dispatch's wiring in `Reporting.tsx`/`ReportView.tsx`), NOT here.
 *
 * STANDING_ROWS SUPERSESSION (per dispatch + ReportView.tsx's own file-header
 * STOP-item "once `data/boardLog.ts` lands, `STANDING_ROWS` here should be
 * superseded by it"): `BOARD_STANDING_ROWS` below carries the exact same
 * seven rows as `views/ReportView.tsx`'s module-private `STANDING_ROWS`
 * (lines 671-721 at HEAD eb0ebe9) — `title`/`layer`/`applies`/`doing`/
 * `status` values are byte-identical to that file's already-landed fold of
 * the base literal (which merged each row's target-compliance cite line into
 * `doing` and dropped the "Log an update →" interaction text, an
 * interaction, not data) — so the gate dispatch's swap-in is render-identical
 * on the `regchange` script screen. This module adds only the two keys
 * ReportView's rows lack:
 *   - `id`: stable per-row id (DataTable `getRowId`; the `boardUpdate(id)`
 *     drawer-target key `BOARD_LOG` is indexed by). For six rows this is the
 *     base literal's own `r[0]` verbatim. The OFAC row's `r[0]` is `null` in
 *     source (line 3600 — no instrument link, no log-an-update affordance),
 *     so its `id` is the synthetic `'ofac-aug-8'` — synthesized ONLY so
 *     `getRowId` stays total; it is not a base-engine key and must never be
 *     used as a `BOARD_LOG`/`INSTR` lookup.
 *   - `instr`: the `data/onside.ts` `INSTR` key when the base engine renders
 *     the title as `instrLink(r[0], r[1])`, else null (OFAC row only). All
 *     six non-null values verified present in INSTR ('2026-13', '2026-C1',
 *     'NM AI Act', '1033', 'CDD Rule', 'GLBA').
 *
 * Base gates the "Log an update →" affordance per-row by hand-written cite
 * markup (rows 1-2 only, both `status:'open'`) — consumers should gate the
 * log-an-update affordance on `status === 'open'`, which reproduces the base
 * gating exactly for this dataset.
 *
 * BOARD_LOG is `export let` to mirror `data/cases.ts`'s own
 * `export let CASES/NOTIFS` mutable pattern (addendum §2 item 2 names that
 * precedent explicitly): session-appended updates, empty by default —
 * exactly the base engine's `var BOARD_LOG={}`.
 */

/** One logged board update — shape verbatim from `boardSave` (source line
 * 3589: `{txt:..., when:'Aug 15, 2026', who:CURRENT.first+' '+(CURRENT.role||''), date:$('bu-date').value.trim()}`).
 * `date` is the free-text expected-compliance-date field, `''` when left
 * blank (source `.trim()` of an empty input), rendered conditionally
 * (`u.date?' · target '+u.date:''`, source line 3578). */
export interface BoardLogEntry {
  txt: string;
  when: string;
  who: string;
  date: string;
}

/** Session-appended update log, keyed by standing-row id (`BOARD_LOG[id]`,
 * newest first — `boardSave` unshifts). Empty by default, exactly like the
 * base engine's `var BOARD_LOG={}` (source line 3576). Mutated only by the
 * screen that owns the commit (gate dispatch), never by `BoardLogForm` —
 * and cleared in place by `src/state/demoStore.ts`'s `resetDemo()` on
 * presenter Restart, so rehearsal entries never leak into the next run. */
export let BOARD_LOG: Record<string, BoardLogEntry[]> = {};

export type BoardStandingStatus = 'open' | 'tracking' | 'closed';

export interface BoardStandingRow {
  /** Stable per-row id — base literal `r[0]` where non-null; see file header
   * for the one synthetic id ('ofac-aug-8'). */
  id: string;
  /** `data/onside.ts` INSTR key when the base renders the title as an
   * instrument link (`instrLink(r[0], r[1])`), else null (OFAC row). */
  instr: string | null;
  title: string;
  layer: string;
  applies: string;
  doing: string;
  status: BoardStandingStatus;
}

/** The standing 7-row board table — `boardStandingHTML`'s literal, source
 * lines 3595-3602; field values byte-identical to ReportView.tsx's landed
 * `STANDING_ROWS` fold (see file header "STANDING_ROWS SUPERSESSION"). */
export const BOARD_STANDING_ROWS: BoardStandingRow[] = [
  {
    id: '2026-13',
    instr: '2026-13',
    title: 'Interagency Guidance 2026-13 · Model Risk Management',
    layer: 'Financial',
    applies: 'Applies: model program in scope for all decisioning models',
    doing: 'Policy updated Apr 2026 · validation clauses rolling into 9 legacy contracts. Target compliance Q1 2027 · last update Aug 12.',
    status: 'open',
  },
  {
    id: '2026-C1',
    instr: '2026-C1',
    title: 'Reg B Circular 2026-C1 · adverse-action specificity',
    layer: 'Financial',
    applies: 'Applies: model-assisted denials in consumer lending',
    doing: 'Attribution-to-code matrix redlined · quarterly accuracy testing drafted. Target compliance Nov 2026 · last update Aug 9.',
    status: 'open',
  },
  {
    id: 'NM AI Act',
    instr: 'NM AI Act',
    title: 'New Mexico Artificial Intelligence Act',
    layer: 'Regional',
    applies: 'Applies: NM footprint · automated decision systems',
    doing: 'Vendor disclosure clause pre-drafted · HB 210 extension tracked.',
    status: 'tracking',
  },
  {
    id: '1033',
    instr: '1033',
    title: 'CFPB §1033 · Personal Financial Data Rights',
    layer: 'Financial',
    applies: 'Applies at our asset tier · compliance date tracked',
    doing: 'Data-sharing interface assessment scheduled Q4.',
    status: 'tracking',
  },
  {
    id: 'CDD Rule',
    instr: 'CDD Rule',
    title: 'CTA / BOI reporting volatility',
    layer: 'Systemic',
    applies: 'Applies: beneficial-ownership program',
    doing: 'Lifecycle status watched · no policy change until scope settles.',
    status: 'tracking',
  },
  {
    id: 'ofac-aug-8',
    instr: null,
    title: 'OFAC · sanctions list update (Aug 8)',
    layer: 'Systemic',
    applies: 'Applies: screening program',
    doing: 'Screening configuration re-verified same day via Connect.',
    status: 'closed',
  },
  {
    id: 'GLBA',
    instr: 'GLBA',
    title: 'FFIEC CAT sunset transition',
    layer: 'Systemic',
    applies: 'Applies: information security program',
    doing: 'Mapping to successor frameworks in progress.',
    status: 'tracking',
  },
];
