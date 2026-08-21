/**
 * Regression: dataset-integrity spot-checks of the ported data modules vs
 * the BASE literals (leapfi-platform.html @ pin 1c230fe, survey_map.md
 * "JS data & engines (1150–2370)" + "(c) Data blocks"). Per dispatch:
 * counts + sentinel values per dataset, each cited to its base line.
 *
 * All counts and sentinels below were verified by EXECUTING the base
 * page's own literal declarations (vm sandbox) — notably DOCLIB counts
 * 153 entries (survey_map's "~130" is approximate; 153 as authored) with
 * exactly 8 redline-bearing entries.
 *
 * Play-name strings are foreign keys (survey_map.md rule (d)1) — the
 * OPPS[].n sentinels here byte-pin that coupling surface.
 */
import { describe, expect, it, beforeAll } from 'vitest'
import { BANDS, CTRL, CUR, GREEN, OPPS, USERS } from '../../data/studio'
import { DOMAINS, GAPS, INSTR, OBL } from '../../data/onside'
import { DOCLIB } from '../../data/doclib'
import { CASES, CASE_TIER, seedCases } from '../../data/cases'
import { AUTO_LOAN_OPPORTUNITY, COPILOT_QA, HP, INTAKE, SIGNAL } from '../../data/misc'

describe('data/studio.ts vs base 1150–1215', () => {
  it('OPPS is the 15-play catalog (base 1177–1193)', () => {
    expect(OPPS).toHaveLength(15)
  })

  it('sentinel plays byte-match base: [0] 1178, [5] 1183 (foundational), [12] 1190', () => {
    expect(OPPS.map((o) => o.n).slice(0, 1)).toEqual(['Member secure-message triage'])
    const triage = OPPS.find((o) => o.n === 'Member secure-message triage')
    expect(triage).toMatchObject({ c: 'Member service', cost: 45000, val: 180000, h: 'quick', r: 'low', g: ['UDAAP', 'Model Risk'] })
    const foundation = OPPS.find((o) => o.n === 'Unified data foundation')
    expect(foundation).toMatchObject({ c: 'Foundation', cost: 250000, val: 120000, h: 'strategic', r: 'low', g: ['InfoSec'], found: true })
    const uw = OPPS.find((o) => o.n === 'Underwriting assist')
    expect(uw).toMatchObject({ c: 'Lending', cost: 150000, val: 400000, h: 'strategic', r: 'high', g: ['Fair Lending', 'Adverse Action', 'Model Risk'] })
  })

  it('gate precompute matches base OPPS.forEach(gateCalc) (1194–1195): minGate/weakGate present on every play', () => {
    const triage = OPPS.find((o) => o.n === 'Member secure-message triage')
    expect(triage?.minGate).toBe(62) // min(CTRL.UDAAP 62, CTRL['Model Risk'] 70)
    expect(triage?.weakGate).toBe('UDAAP')
    const uw = OPPS.find((o) => o.n === 'Underwriting assist')
    expect(uw?.minGate).toBe(55)
    expect(uw?.weakGate).toBe('Adverse Action')
    OPPS.forEach((o) => expect(o.minGate).toBe(Math.min(...o.g.map((k) => CTRL[k] ?? 0))))
  })

  it('CTRL carries the base 9 control scores (base 1171); sentinels Adverse Action 55 · InfoSec 90 · UDAAP 62', () => {
    expect(Object.keys(CTRL)).toHaveLength(9)
    expect(CTRL['Adverse Action']).toBe(55)
    expect(CTRL['InfoSec']).toBe(90)
    expect(CTRL['UDAAP']).toBe(62)
  })

  it('BANDS / CUR / GREEN match base 1172–1173', () => {
    expect(BANDS).toEqual(['Aware', 'Developing', 'Established', 'Managed', 'Embedded'])
    expect(CUR).toBe(1)
    expect(GREEN).toBe(80)
  })

  it('USERS is the 6-persona AD mock (base 1160–1167); sentinel Rachel Fischer CRO first', () => {
    expect(USERS).toHaveLength(6)
    expect(USERS.map((u) => u.id)).toEqual(['rachel', 'priya', 'reyes', 'adam', 'jose', 'dan'])
    const rachel = USERS.find((u) => u.id === 'rachel')
    expect(rachel).toMatchObject({ name: 'Rachel Fischer', role: 'Chief Risk Officer', roleKey: 'cro', email: 'rachel.fischer@northwindscu.org' })
  })
})

describe('data/onside.ts vs base 1819–1929 / 2309–2338 / 3183–3242', () => {
  it('DOMAINS is the 8-domain set (base 1821–1887); sentinel bsa row byte-matches literal 1822', () => {
    expect(DOMAINS).toHaveLength(8)
    const bsa = DOMAINS.find((d) => d.key === 'bsa')
    expect(bsa).toMatchObject({
      name: 'BSA / AML Program',
      bodies: 'FinCEN · FFIEC',
      appl: 64,
      tot: 64,
      met: 58,
      target: 5,
      owner: 'T. Whitfield · BSA Officer',
    })
  })

  it('INSTR carries the base 14 fabricated instruments (base 1888–1929)', () => {
    expect(Object.keys(INSTR).sort()).toEqual(
      ['1033', '2026-13', '2026-C1', '31 CFR Ch. X', '88 FR 37920', 'AI Hub', 'CDD Rule', 'CRI', 'FFIEC Manual', 'GLBA', 'NM AI Act', 'Reg B', 'RFI 2026-04', 'TRAIGA'].sort(),
    )
    // sentinel entries: 1889 and the TPRM instrument
    expect(INSTR['2026-13']?.n).toBe('Interagency Guidance 2026-13 · Model Risk Management')
    expect(INSTR['88 FR 37920']?.n).toBe('Interagency Guidance on Third-Party Relationships: Risk Management')
  })

  it('OBL holds 24 obligations across tprm+mrm (base 2309–2338, TPRM/MRM-01..12)', () => {
    expect(Object.keys(OBL).sort()).toEqual(['mrm', 'tprm'])
    const total = Object.values(OBL).reduce((s, rows) => s + rows.length, 0)
    expect(total).toBe(24)
    // sentinel: the MRM-11 gap references an OPPS play name via `uc` (survey_map rule (d)1)
    const mrm11 = OBL['mrm']?.find((o) => o.id === 'MRM-11')
    expect(mrm11?.uc).toBe('Member FAQ chatbot')
  })

  it('GAPS is the 7-gap register (base 3183–3242); sentinel crit IRP gap first', () => {
    expect(GAPS).toHaveLength(7)
    expect(GAPS.map((g) => g.sev)).toEqual(['crit', 'warn', 'warn', 'warn', 'warn', 'warn', 'warn'])
    const irpGap = GAPS.find((g) => g.doc === 'irp')
    expect(irpGap).toMatchObject({ sev: 'crit', dom: 'AI Governance', owner: 'P. Nguyen · ISD' })
  })
})

describe('data/doclib.ts vs base 1930–2303', () => {
  it('DOCLIB holds 153 documents as authored (survey_map "~130"; base object literal executed = 153 keys)', () => {
    expect(Object.keys(DOCLIB)).toHaveLength(153)
  })

  it('exactly the 8 load-bearing redline entries carry redlines (survey_map rule (d)8; base redline:{...} keys)', () => {
    const redlineIds = Object.entries(DOCLIB)
      .filter(([, d]) => d.redline !== undefined)
      .map(([k]) => k)
      .sort()
    expect(redlineIds).toEqual(
      ['aa-procedure', 'gen-ai-draft', 'gov-charter', 'irp', 'mrm-change-draft', 'msg-disclosure', 'rege-proc', 'tprm-program'].sort(),
    )
  })

  it('sentinel titles byte-match base: irp · aa-procedure · gov-charter', () => {
    expect(DOCLIB['irp']?.t).toBe('Incident Response Plan')
    expect(DOCLIB['aa-procedure']?.t).toBe('Adverse-Action Procedure')
    expect(DOCLIB['gov-charter']?.t).toBe('Governance Charter')
  })
})

describe('data/cases.ts vs base 2544–2768 (CASES + state machine seed)', () => {
  beforeAll(() => {
    seedCases(DOCLIB) // base seedCases(), 2587–2604 — seeds from the 8 redline docs
  })

  it('seeds exactly 8 cases with ids sequential to the base doc order (base 2590–2603), PI2-D45 (further USER OVERRIDE) reorders the ARRAY only', () => {
    expect(CASES).toHaveLength(8)
    // id assignment is still exactly the base doc-order sequence — a
    // per-doc, order-independent fact (each doc always gets the same id).
    expect(CASES.map((c) => c.doc).sort()).toEqual(
      [
        'irp',
        'tprm-program',
        'aa-procedure',
        'mrm-change-draft',
        'msg-disclosure',
        'rege-proc',
        'gov-charter',
        'gen-ai-draft',
      ].sort(),
    )
    expect(Object.fromEntries(CASES.map((c) => [c.doc, c.id]))).toEqual({
      irp: 'CASE-2026-001',
      'tprm-program': 'CASE-2026-002',
      'aa-procedure': 'CASE-2026-003',
      'mrm-change-draft': 'CASE-2026-004',
      'msg-disclosure': 'CASE-2026-005',
      'rege-proc': 'CASE-2026-006',
      'gov-charter': 'CASE-2026-007',
      'gen-ai-draft': 'CASE-2026-008',
    })
    // PI2-D45 (further USER OVERRIDE, narrative verification): the CASES
    // array itself is reordered so mrm-change-draft is the CRO's FIRST
    // routed case (`views/HomePanels.tsx`'s "Your queue" Approve consumes
    // raw CASES order — see `data/cases.ts` seedCases()'s own trailing
    // reorder step) — every other case's relative order is unchanged.
    expect(CASES.map((c) => c.doc)).toEqual([
      'mrm-change-draft',
      'irp',
      'tprm-program',
      'aa-procedure',
      'msg-disclosure',
      'rege-proc',
      'gov-charter',
      'gen-ai-draft',
    ])
  })

  it('sentinel CASE-2026-001 matches base joins: owner 2583, detected 2582, tier 2559, lang===base (PI2-D45 USER OVERRIDE: exec tier boots routed to cro)', () => {
    const first = CASES.find((c) => c.id === 'CASE-2026-001')
    expect(first).toMatchObject({
      doc: 'irp',
      title: 'Incident Response Plan', // DOCLIB['irp'].t
      owner: 'P. Nguyen · ISD', // CASE_OWNER['irp'], base 2583
      detected: 'Aug 14, 2026', // CASE_DETECTED['irp'], base 2582
      tier: 'exec', // CASE_TIER['irp'], base 2559
      // PI2-D45 (USER OVERRIDE): every board/exec-tier case boots already
      // routed to the CRO ("accept as drafted" — no analystEdit exists for
      // 'irp' in doclib.ts, so edited stays false and lang stays === base).
      stage: 'cro',
      edited: false,
    })
    expect(first?.lang).toBe(first?.base) // both start as d.redline.nw (base 2599), untouched by the accept-as-drafted replay
    expect(first?.history.map((h) => h.who)).toEqual(['Priya Raman', 'OnSide'])
    expect(first?.history.map((h) => h.what)).toEqual(['Accepted as drafted and routed for approval', 'Change detected and language proposed'])
    expect(first?.history[1]?.when).toBe('Aug 14, 2026 · 6:12 AM ET') // fixed demo-date fabric (rule (d)10), the original OnSide entry untouched
  })

  it('CASE_TIER byte-matches base 2559', () => {
    expect(CASE_TIER).toEqual({
      'gov-charter': 'board',
      'mrm-change-draft': 'board',
      'gen-ai-draft': 'board',
      irp: 'exec',
      'tprm-program': 'exec',
      'aa-procedure': 'proc',
      'msg-disclosure': 'proc',
      'rege-proc': 'proc',
    })
  })
})

describe('data/misc.ts vs base 3613–3647 / 4020–4121 / 4122–4125 / 4357–4362 / 4427', () => {
  it('INTAKE is the 4-question set with byte-exact chips (base 4357–4362) — the intake arithmetic keys off these strings', () => {
    expect(INTAKE.map((q) => q.chips)).toEqual([
      ['2 people · ~15 hrs/wk', 'A team · 30+ hrs/wk', 'A whole department'],
      ['Under 500 items / mo', '500–5,000 / mo', '5,000+ / mo'],
      ['Internal · simple workflow', 'Internal · feeds financial reporting (GL / SOX)', 'Member-facing', 'Touches lending decisions'],
      ['Public / internal only', 'Member PII', 'Sensitive financial · no PII', 'Sensitive financial + PII'],
    ])
    expect(INTAKE.map((q) => q.q)).toEqual([
      'Roughly how much effort does this consume today?',
      'What volume does it run at?',
      'What is the exposure? This decides which controls and regulations gate it. Internal work that feeds financial reporting carries a different risk profile than a simple workflow.',
      'Last one: what data does it touch?',
    ])
  })

  it('HP is the 6-panel home catalog byte-matching base 4125', () => {
    expect(HP).toEqual([
      ['kpis', 'home-kpis', 'Top metrics'],
      ['posture', 'hp-posture', 'Risk posture'],
      ['legis', 'hp-legis', 'Strategic signal'],
      ['invest', 'hp-invest', 'Investment and return'],
      ['queue', 'hp-queue', 'Your queue'],
      ['qa', 'home-qa', 'Quick actions'],
    ])
  })

  it('SIGNAL is the 6-entry strategic-signal feed (base 4020–4121); sentinel RFI 2026-04 first', () => {
    expect(SIGNAL).toHaveLength(6)
    const rfi = SIGNAL.find((s) => s.instr === 'RFI 2026-04')
    expect(rfi).toBeDefined()
    expect(rfi?.sc).toBe('FEDERAL')
    expect(rfi?.st).toBe('Comment period open · position due Sep 30')
  })

  it('COPILOT_QA carries the base 3 canned answers (base 3613–3647); sentinel dormant-account question', () => {
    expect(COPILOT_QA).toHaveLength(3)
    expect(COPILOT_QA.map((c) => c.q).slice(0, 1)).toEqual(['How do we handle a dormant account?'])
  })

  it('AUTO_LOAN_OPPORTUNITY byte-matches the addAutoLoan record (base 4427): $350k/$520k high-risk lending trio, disc:true', () => {
    expect(AUTO_LOAN_OPPORTUNITY).toEqual({
      n: 'Auto loan origination platform',
      c: 'Lending',
      cost: 350000,
      val: 520000,
      h: 'strategic',
      r: 'high',
      g: ['Fair Lending', 'Adverse Action', 'Model Risk'],
      disc: true,
    })
  })
})
