// Verbatim port of miscellaneous seed data from
// leapfi-dashboards/src/leapfi-platform.html
//   COPILOT_QA: lines 3613-3623
//   SOON: lines 3735-3769
//   SIGNAL: lines 4020-4045
//   HP / HOME_HIDE / HOME_ORDER: lines 4122-4125
//   INTAKE: lines 4358-4362 (var INTAKE=[ opens at 4357, included for a
//     complete, valid array literal)
//   auto-loan opportunity data: lines 4415-4429
//
// Spec ambiguity (resolved): lines 4358-4430 also contain the imperative
// handlers `startIntake`, `finishIntake`, `acceptProposed`, `discardProposed`,
// `resetChips`, `autoLoanAnswer`, and `addAutoLoan`. Those functions read and
// mutate cross-module runtime state and helpers that do not belong to a data
// module (`chatState`, `OPPS`, `DETAIL`, `SCOPE_EVENTS`, `CTRL`, `ctrlLink`,
// `fmt`, `readLevers`, `gateCalc`, `recompute`, `renderHome`, `botSay`,
// `chips`) — they are chat/screen controller behavior, not data, and are out
// of scope for this data-only allowlist (data/cases.ts, data/misc.ts). This
// file instead ports the two genuine plain-data object literals those
// handlers operate on: the auto-loan opportunity record built in
// `addAutoLoan()` (here `AUTO_LOAN_OPPORTUNITY`) and its companion
// `DETAIL['Auto loan origination platform']` entry (here `AUTO_LOAN_DETAIL`),
// both copied verbatim. The narrative copy that `autoLoanAnswer()` composes
// via `vrow(...)`/`ctrlLink(...)`/`fmt(...)` calls is UI-rendering logic, not
// a standalone data object, and is likewise not ported here.

export interface CopilotQAItem {
  q: string;
  chips: string;
  a: string;
  src: string[];
}

export const COPILOT_QA: CopilotQAItem[] = [
  {
    q: 'How do we handle a dormant account?',
    chips: 'Dormant accounts',
    a: 'After <b>24 months</b> of no member-initiated activity, flag the account as dormant, suspend statement mailing if returned undeliverable, and restrict electronic transfers until identity is re-verified. Escheatment follows the member state of record, with notice sent <b>60 days</b> before remittance.',
    src: ['Account Operations Procedure §4.2 · Dormancy', 'TX / OK / NM escheatment schedules · state layer'],
  },
  {
    q: 'What is our wire transfer limit for members?',
    chips: 'Wire limits',
    a: 'Member-initiated wires are limited to <b>$25,000 per business day</b> through digital channels and <b>$250,000</b> in-branch with dual authorization. Amounts above require the Payments Officer approval path with callback verification.',
    src: ['Funds Transfer Policy §3.1 · Limits & authorizations', 'BSA/AML Program Policy §7 · monitoring thresholds'],
  },
  {
    q: 'Can we share member data with a fintech partner?',
    chips: 'Data sharing',
    a: 'Only under an executed data-sharing agreement meeting the <b>Third-Party Risk Management Program §4</b> requirements: GLBA-permissible purpose, member notice consistent with our privacy disclosure, minimum-necessary scope, and security attestation on file. §1033 interface obligations are tracked for our tier.',
    src: ['Third-Party Risk Management Program §4', 'Privacy & Data Handling Policy §2 · GLBA'],
  },
];

export type SoonStat = [string, string, string];
export type SoonCmpRow = [string, number, string];

export interface SoonEntry {
  icon: string;
  name: string;
  tag: string;
  phase: string;
  lead: string;
  steps: string[];
  note: string;
  stats: SoonStat[];
  close: string;
  cmp: {
    today: SoonCmpRow[];
    after: SoonCmpRow[];
  };
}

export const SOON: Record<string, SoonEntry> = {
  connect: {
    icon: '⇄',
    name: 'LeapFI · Connect',
    tag: 'The MCP and API layer of LeapFI · OnSide',
    phase: 'Part of OnSide · in development',
    lead: 'Every institution employs technical resources whose real job is translation: read the policy manual, decide what it requires, then configure each system by hand. Connect ends that. Any system, vendor platform, or agent reads the institution’s current policies from OnSide and configures itself against them, at install and at every policy change. Your Microsoft 365 tenant takes its retention labels, DLP rules, and sharing settings straight from the record. Nobody re-types anything, and the exam file shows configuration provably derived from approved policy.',
    steps: ['Policy approved in OnSide', 'Connect writes it into your systems', 'Configuration evidence on file'],
    note: 'Approved once, applied everywhere, evidenced automatically.',
    stats: [
      ['5', 'SYSTEM CLASSES', 'productivity estate, cloud infrastructure, loan origination, HR and personnel, vendor and servicing platforms'],
      ['2-way', 'MCP + REST', 'systems read policy and report their configuration back'],
      ['Same day', 'APPROVAL TO CONFIG', 'a redline approved in OnSide propagates on approval'],
      ['100%', 'CHANGES LOGGED', 'every push carries the policy version that produced it'],
    ],
    close:
      'As more institutions expose their rules this way, one integration configures every client correctly, and building toward LeapFI becomes cheaper for a vendor than re-implementing policy client by client.',
    cmp: {
      today: [
        ['Policy approved to systems updated', 100, '2-6 weeks'],
        ['Configuration matches policy', 55, 'spot checks'],
        ['Evidence for the examiner', 40, 'by hand'],
      ],
      after: [
        ['Policy approved to systems updated', 6, 'same day'],
        ['Configuration matches policy', 100, 'continuous'],
        ['Evidence for the examiner', 100, 'generated'],
      ],
    },
  },
  allrailz: {
    icon: '≋',
    name: 'LeapFI · AllRailz',
    tag: 'The agentic runtime',
    phase: 'In development · deploys in weeks, zero core replacement',
    lead: 'An agentic-native digital banking platform running on the core you already have: core-agnostic across FIS, Fiserv, and Jack Henry, with 11+ AI agents and 12 payment rails behind one branded experience covering consumer and business banking, cards, invoicing and bill pay, and real-time payments. Every agentic workflow reads live policy from OnSide before it acts, which is what keeps agentic banking supervisable.',
    steps: ['Member or business acts', 'Agent checks live policy first', 'Rail executes on your core'],
    note: 'Agents act only inside the policy the institution approved.',
    stats: [
      ['11+', 'AI AGENTS', 'routing, servicing, fraud triage, compliance checks'],
      ['12', 'PAYMENT RAILS', 'RTP, FedNow, ACH, wires, cards, and more'],
      ['3', 'CORES SUPPORTED', 'FIS, Fiserv, and Jack Henry, no replacement'],
      ['Weeks', 'TO DEPLOY', 'alongside the core, not through it'],
    ],
    cmp: {
      today: [
        ['Front-end release cycle', 100, 'quarters'],
        ['New rail onboarding', 85, '6-12 mo'],
        ['Policy check before an action', 30, 'manual'],
      ],
      after: [
        ['Front-end release cycle', 18, 'weeks'],
        ['New rail onboarding', 20, 'configuration'],
        ['Policy check before an action', 100, 'every time'],
      ],
    },
    close: 'Agentic banking a supervisor can accept, because the rules are read at runtime instead of copied into the build.',
  },
  vantage: {
    icon: '⬡',
    name: 'LeapFI · Vantage',
    tag: 'Agentic third-party oversight',
    phase: 'Future module · targeted for v3',
    lead: 'Third-party oversight is the next manual mountain. Every vendor carries a diligence burden that recurs annually and runs almost entirely by hand: financial condition against your thresholds, SOC 2 reports read line by line, resiliency and continuity assessments, HR and employment policy checks, and compliance review against your own standards. Vantage runs these with agentic workflows and hands people the exception report instead of the raw statements.',
    steps: ['Vendor evidence arrives', 'Agents review it against your standards', 'Exceptions land in the register'],
    note: 'People read exceptions, not statements. The evidence trail writes itself.',
    stats: [
      ['5', 'REVIEW TYPES', 'financial, SOC 2, resiliency, HR, compliance'],
      ['87', 'VENDORS IN SCOPE', 'the full inventory, not just the critical set'],
      ['12', 'CRITICAL VENDORS', 'reviewed against the tier-one standard'],
      ['1', 'EXCEPTION REPORT', 'what breached, what it touches, what to do'],
    ],
    cmp: {
      today: [
        ['Annual review per critical vendor', 100, '12-20 hrs'],
        ['Full inventory covered each year', 35, 'critical set'],
        ['Findings reach the register', 45, 're-keyed'],
      ],
      after: [
        ['Annual review per critical vendor', 12, '~2 hrs'],
        ['Full inventory covered each year', 100, 'all 87'],
        ['Findings reach the register', 100, 'automatic'],
      ],
    },
    close:
      'Every review reads the institution’s current policy rather than a copy, and every finding lands in the evidence trail an examiner already trusts.',
  },
};

export type SignalTouch = [string, string, string?];

export interface SignalEntry {
  sc: string;
  instr: string | null;
  t: string;
  st: string;
  stS: string;
  age: string;
  read: string;
  touch: SignalTouch[];
}

export const SIGNAL: SignalEntry[] = [
  {
    sc: 'FEDERAL',
    instr: 'RFI 2026-04',
    t: 'Interagency RFI 2026-04 · generative & agentic AI in model risk',
    st: 'Comment period open · position due Sep 30',
    stS: 'Comment open · due Sep 30',
    age: 'Proposed Jun 30',
    read: 'Would put generative and agentic systems inside the model definition. Our charter and MRM scope both stop short of that today.',
    touch: [
      ['obl', 'mrm', 'MRM-11'],
      ['obl', 'mrm', 'MRM-01'],
      ['obl', 'mrm', 'MRM-09'],
      ['doc', 'gov-charter'],
      ['doc', 'gen-ai-draft'],
    ],
  },
  {
    sc: 'FEDERAL',
    instr: null,
    t: 'Fed & FDIC joint NPRM · Regulation O · insider credit',
    st: 'Comment window open · position in drafting',
    stS: 'Comment open · drafting',
    age: 'Proposed Jul 31',
    read: 'Extensions of credit to insiders. Reporting and approval thresholds would tighten, and the capital narrative picks it up.',
    touch: [
      ['dom', 'capital'],
      ['dom', 'fairlend'],
      ['doc', 'capital-narr'],
    ],
  },
  {
    sc: 'STATE · NM',
    instr: 'NM AI Act',
    t: 'HB 210 · AI Transparency & Accountability Act',
    st: 'Passed Senate 34–6 · awaiting House',
    stS: 'Passed Senate · awaiting House',
    age: 'Introduced Feb 2026',
    read: 'Vendor disclosure duties for automated decision systems. Our contract rider already has the clause pre-drafted.',
    touch: [
      ['obl', 'tprm', 'TPRM-04'],
      ['obl', 'tprm', 'TPRM-01'],
      ['doc', 'contract-rider'],
      ['dom', 'aigov'],
    ],
  },
  {
    sc: 'STATE · TX',
    instr: 'TRAIGA',
    t: 'HB 149 · AI Governance Rules Clarification Act',
    st: 'Awaiting floor vote',
    stS: 'Awaiting floor vote',
    age: 'Introduced Mar 2026',
    read: 'Clarifies governance expectations for AI in member-facing decisions. Charter language is staged and waiting.',
    touch: [
      ['doc', 'gov-charter'],
      ['doc', 'ai-inventory'],
      ['doc', 'hitl-standard'],
      ['dom', 'aigov'],
    ],
  },
  {
    sc: 'LOCAL · NM',
    instr: null,
    t: 'City of Albuquerque · automated-decision disclosure ordinance',
    st: 'Introduced · first reading Sep 3',
    stS: 'First reading Sep 3',
    age: 'Introduced Aug 4',
    read: 'Disclosure at the point of an automated decision, inside our branch footprint. Narrower than the state bill and it stacks on top.',
    touch: [
      ['doc', 'msg-disclosure'],
      ['doc', 'complaint-proc'],
      ['dom', 'consumer'],
    ],
  },
  {
    sc: 'LOCAL · TX',
    instr: null,
    t: 'Travis County · vendor AI procurement standards',
    st: 'Draft published for comment',
    stS: 'Draft out for comment',
    age: 'Published Jul 22',
    read: 'Procurement standards for vendors using AI. Reads onto our diligence standard and the contract rider.',
    touch: [
      ['obl', 'tprm', 'TPRM-03'],
      ['obl', 'tprm', 'TPRM-06'],
      ['doc', 'dd-standard'],
    ],
  },
];

export const HOME_HIDE: Record<string, boolean> = {};

/** The sequence each person built, keyed by role. Empty means "not customised yet". */
export const HOME_ORDER: Record<string, string[]> = {};

export type HomePanel = [string, string, string];

export const HP: HomePanel[] = [
  ['kpis', 'home-kpis', 'Top metrics'],
  // HF1 (user ruling 2026-08-21, superseding L10's always-visible reading
  // of call-15): the AI-gov flagship callout joins the Customize-gated
  // panel set as the sixth key. This single entry sets the toggle order,
  // the section <h2> text, and the shipped default position (first visible
  // panel — 'kpis' is excluded from the managed set already). Label matches
  // HomePanels.tsx's own DOM_SHORT.aigov display name.
  ['aigov', 'hp-aigov', 'AI Governance'],
  ['posture', 'hp-posture', 'Risk posture'],
  // call-03 rename (planning/call-03-regulatory-radar-rename.md;
  // meeting_notes_2026-08-20.md:86): label only — 'legis'/'hp-legis' stay
  // byte-identical so HOME_ORDER's persisted per-role layouts (which store
  // keys, never labels) are unaffected. Was 'Strategic signal'; this is
  // the most-visible on-screen site of the old name (this panel's own
  // section <h2> and HomeCustomizeBar.tsx's matching toggle label both
  // resolve from this literal) — see HomePanels.tsx's file header
  // "STOP-ITEM / OUT-OF-ALLOWLIST FINDING" for the residue this closes.
  ['legis', 'hp-legis', 'Regulatory Radar'],
  ['invest', 'hp-invest', 'Investment and return'],
  ['queue', 'hp-queue', 'Your queue'],
  ['qa', 'home-qa', 'Quick actions'],
];

export interface IntakeQuestion {
  q: string;
  chips: string[];
}

export const INTAKE: IntakeQuestion[] = [
  {
    q: 'Roughly how much effort does this consume today?',
    chips: ['2 people · ~15 hrs/wk', 'A team · 30+ hrs/wk', 'A whole department'],
  },
  {
    q: 'What volume does it run at?',
    chips: ['Under 500 items / mo', '500–5,000 / mo', '5,000+ / mo'],
  },
  {
    q: 'What is the exposure? This decides which controls and regulations gate it. Internal work that feeds financial reporting carries a different risk profile than a simple workflow.',
    chips: [
      'Internal · simple workflow',
      'Internal · feeds financial reporting (GL / SOX)',
      'Member-facing',
      'Touches lending decisions',
    ],
  },
  {
    q: 'Last one: what data does it touch?',
    chips: ['Public / internal only', 'Member PII', 'Sensitive financial · no PII', 'Sensitive financial + PII'],
  },
];

/**
 * The plain-data opportunity record built by `addAutoLoan()` and pushed onto
 * `OPPS` (via `chatState.proposed` / `acceptProposed()`). Ported verbatim
 * from leapfi-platform.html:4427.
 */
export interface AutoLoanOpportunity {
  n: string;
  c: string;
  cost: number;
  val: number;
  h: string;
  r: string;
  g: string[];
  disc: boolean;
}

export const AUTO_LOAN_OPPORTUNITY: AutoLoanOpportunity = {
  n: 'Auto loan origination platform',
  c: 'Lending',
  cost: 350000,
  val: 520000,
  h: 'strategic',
  r: 'high',
  g: ['Fair Lending', 'Adverse Action', 'Model Risk'],
  disc: true,
};

/**
 * The companion `DETAIL['Auto loan origination platform']` entry set
 * alongside `AUTO_LOAN_OPPORTUNITY` in `addAutoLoan()`. Ported verbatim from
 * leapfi-platform.html:4429.
 */
export interface AutoLoanDetail {
  sum: string;
  work: string[];
  tech: string[];
  deps: string[];
  unlocks: string[];
}

export const AUTO_LOAN_DETAIL: AutoLoanDetail = {
  sum: 'End-to-end assisted auto lending: application intake, decisioning support, and adverse-action drafting, built on the unified data foundation with explainability evidence per decision.',
  work: [
    'Dealer / indirect data feed integration',
    'Explainable decisioning model + validation',
    'Adverse-action reason-code alignment',
    'Fair-lending + disparate-impact testing harness',
    'LOS integration + human decisioning gate',
  ],
  tech: ['Unified data foundation (funded)', 'Loan-origination system integration', 'Real-time decisioning infrastructure'],
  deps: ['Unified data foundation', 'AI adverse-action letter drafting'],
  unlocks: [],
};
