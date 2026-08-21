/**
 * Regression: data/boardLog.ts vs the BASE board-reporting literals
 * (leapfi-platform.html @ pin 1c230fe — survey_map.md "boardUpdate/Save
 * ('Aug 15, 2026') (3575–93) · boardStandingHTML (3594–3612)"):
 *  - BOARD_LOG empty-by-default ................. base 3576 `var BOARD_LOG={}`
 *  - standing 7-row table literal ............... base 3595–3602 (rows array
 *    inside boardStandingHTML)
 *  - per-row ids: base r[0] verbatim for the six instrument-linked rows;
 *    the OFAC row's r[0] is null in base (3600), so the port synthesizes
 *    'ofac-aug-8' STRICTLY as a row id (DataTable getRowId) — documented
 *    non-lookup: it must never resolve in INSTR (or seed BOARD_LOG).
 *
 * Byte-match policy: `title`/`layer`/`applies` are asserted byte-identical
 * to the base literals. `doing` is asserted against the port's documented
 * fold of base r[4] (boardLog.ts file header "STANDING_ROWS
 * SUPERSESSION"): the cite `<div>`'s facts (target compliance date · last
 * update) fold into the sentence, the "Log an update →" interaction text
 * is dropped (interaction, not data), and a terminal period is added.
 * Status tags map warn('2 workstreams open'/'Open')->'open',
 * grey('Tracking')->'tracking', good('Closed')->'closed'.
 */
import { describe, expect, it } from 'vitest'
import { BOARD_LOG, BOARD_STANDING_ROWS } from '../../data/boardLog'
import { INSTR } from '../../data/onside'

describe('BOARD_LOG default state (base 3576)', () => {
  it('starts as an empty record — no session updates seeded', () => {
    expect(Object.keys(BOARD_LOG)).toEqual([])
  })
})

describe('standing 7-row board table (base 3595–3602)', () => {
  it('carries exactly the base rows, byte-matched (title/layer/applies verbatim; doing per the documented cite-fold)', () => {
    expect(BOARD_STANDING_ROWS).toEqual([
      {
        id: '2026-13', // base r[0], 3596
        instr: '2026-13',
        title: 'Interagency Guidance 2026-13 · Model Risk Management',
        layer: 'Financial',
        applies: 'Applies: model program in scope for all decisioning models',
        doing:
          'Policy updated Apr 2026 · validation clauses rolling into 9 legacy contracts. Target compliance Q1 2027 · last update Aug 12.',
        status: 'open', // base tag warn '2 workstreams open'
      },
      {
        id: '2026-C1', // base 3597
        instr: '2026-C1',
        title: 'Reg B Circular 2026-C1 · adverse-action specificity',
        layer: 'Financial',
        applies: 'Applies: model-assisted denials in consumer lending',
        doing:
          'Attribution-to-code matrix redlined · quarterly accuracy testing drafted. Target compliance Nov 2026 · last update Aug 9.',
        status: 'open', // base tag warn 'Open'
      },
      {
        id: 'NM AI Act', // base 3598
        instr: 'NM AI Act',
        title: 'New Mexico Artificial Intelligence Act',
        layer: 'Regional',
        applies: 'Applies: NM footprint · automated decision systems',
        doing: 'Vendor disclosure clause pre-drafted · HB 210 extension tracked.',
        status: 'tracking',
      },
      {
        id: '1033', // base 3599
        instr: '1033',
        title: 'CFPB §1033 · Personal Financial Data Rights',
        layer: 'Financial',
        applies: 'Applies at our asset tier · compliance date tracked',
        doing: 'Data-sharing interface assessment scheduled Q4.',
        status: 'tracking',
      },
      {
        id: 'CDD Rule', // base 3600 (row 5)
        instr: 'CDD Rule',
        title: 'CTA / BOI reporting volatility',
        layer: 'Systemic',
        applies: 'Applies: beneficial-ownership program',
        doing: 'Lifecycle status watched · no policy change until scope settles.',
        status: 'tracking',
      },
      {
        id: 'ofac-aug-8', // SYNTHETIC — base r[0] is null (3601); see suite doc
        instr: null,
        title: 'OFAC · sanctions list update (Aug 8)',
        layer: 'Systemic',
        applies: 'Applies: screening program',
        doing: 'Screening configuration re-verified same day via Connect.',
        status: 'closed', // base tag good 'Closed'
      },
      {
        id: 'GLBA', // base 3602
        instr: 'GLBA',
        title: 'FFIEC CAT sunset transition',
        layer: 'Systemic',
        applies: 'Applies: information security program',
        doing: 'Mapping to successor frameworks in progress.',
        status: 'tracking',
      },
    ])
  })

  it('row ids are stable and unique — the BOARD_LOG[id] / getRowId key space (base boardUpdate(id) 3577)', () => {
    const ids = BOARD_STANDING_ROWS.map((r) => r.id)
    expect(ids).toEqual(['2026-13', '2026-C1', 'NM AI Act', '1033', 'CDD Rule', 'ofac-aug-8', 'GLBA'])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("synthetic 'ofac-aug-8' is a non-lookup id: instr is null and it resolves in neither INSTR nor BOARD_LOG (base 3601 r[0]=null)", () => {
    const ofac = BOARD_STANDING_ROWS.find((r) => r.id === 'ofac-aug-8')
    expect(ofac?.instr).toBeNull()
    expect(Object.keys(INSTR)).not.toContain('ofac-aug-8')
    expect(BOARD_LOG['ofac-aug-8']).toBeUndefined()
  })

  it('every non-null instr resolves to a real INSTR instrument — base renders those titles via instrLink(r[0], r[1]) (3604)', () => {
    const linked = BOARD_STANDING_ROWS.filter((r) => r.instr !== null)
    expect(linked.map((r) => r.instr)).toEqual(['2026-13', '2026-C1', 'NM AI Act', '1033', 'CDD Rule', 'GLBA'])
    linked.forEach((r) => {
      expect(INSTR[r.instr as string], `INSTR['${r.instr}']`).toBeDefined()
    })
  })

  it("the log-an-update affordance gates on status==='open' — exactly the two rows base hand-writes it into (3596–3597)", () => {
    const openIds = BOARD_STANDING_ROWS.filter((r) => r.status === 'open').map((r) => r.id)
    expect(openIds).toEqual(['2026-13', '2026-C1'])
  })
})
