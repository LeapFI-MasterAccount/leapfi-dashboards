/**
 * OnSide datasets — ported VERBATIM (values unchanged) from
 * leapfi-dashboards/src/leapfi-platform.html (scaffold commit 5f37e99):
 *   - DOMAINS, DOM_CATS, BUILT_DOMS, INSTR .......... source lines 1819-1916
 *   - OBL, DOM_OPEN, SAMPLE_DOCS ..................... source lines 2308-2370
 *   - GAPS, GAP_DOM ................................... source lines 3183-3192
 *   - SRC_ITEMS, SRC_ROWS, SRC_LAYERS, DIGEST, FREQ ... source lines 3243-3348
 *   - NEW_RULES + tracked + inforce rows .............. source lines 3461-3494
 *   - ROLES, M ......................................... source lines 3499-3549
 *
 * Source is a read-only reference (never modify). This module only adds
 * TypeScript types around the same literal data — no business logic
 * (domByKey, whyText, adoptTarget, oblToClose, srcFilter, osRegwatch/
 * osInforce's HTML-row renderers, etc.) is ported; those are render/derive
 * functions, not datasets, and belong to whichever component consumes this
 * data.
 *
 * OBL gap `uc` values are play-name foreign keys (survey_map.md "Play-name
 * string coupling" note, near line 83: "OBL gap `uc` ... Rename ⇒ touch
 * all.") — preserved character-for-character; never edit independently here.
 *
 * Spec ambiguities resolved while porting (STOP-worthy, noted for the
 * record rather than blocking):
 *   1. INSTR closing `};` sits at source line 1917, one line past the
 *      assigned 1819-1916 range. Included anyway — the object is
 *      unterminated (and DOMAINS/DOM_CATS/BUILT_DOMS unusable downstream)
 *      without it. No data beyond the closing brace was ported.
 *   2. survey_map.md line 65 says "INSTR 13 fabricated instruments"; the
 *      literal at lines 1888-1917 actually contains 14 keyed entries. The
 *      executing source (not the survey doc's count) is the ground truth
 *      per this dispatch's "verbatim" instruction, so all 14 are ported.
 *   3. NEW_RULES is a named source var, but the "tracked" (osRegwatch's
 *      local `rows`) and "inforce" (osInforce's local `rows`) arrays are
 *      unnamed in source — both are local consts inside HTML-rendering
 *      functions. Only the raw literal tuples were ported (the
 *      .filter/.map HTML-string rendering was not, per the "datasets only"
 *      scope); they're named TRACKED_RULES and INFORCE_RULES here since a
 *      dataset export needs a name.
 *   4. Two sources have an entity/plain-ampersand mismatch between their
 *      SRC_ITEMS key and their SRC_ROWS `n` field in the original source
 *      (e.g. SRC_ITEMS key 'SEC & FINRA' vs SRC_ROWS n:'SEC &amp; FINRA'),
 *      reconciled at lookup time in source by srcRow()/srcItems() doing
 *      `.replace(/&amp;/g,'&')`. Both forms are preserved verbatim as
 *      authored rather than normalized, since normalizing would no longer
 *      be a verbatim port.
 */

/* ============ domains, document mix, built corpora — source lines 1819-1845 ============ */

export interface OnsideDomain {
  key: string;
  name: string;
  bodies: string;
  inst: string;
  appl: number;
  tot: number;
  met: number;
  target: number;
  owner: string;
  docs: number;
  ev: number;
  /** Only set (true) on mrm and tprm — the two "built corpora" domains. */
  deep?: boolean;
  why: string;
}

export const DOMAINS: OnsideDomain[] = [
  {
    key: 'bsa', name: 'BSA / AML Program', bodies: 'FinCEN · FFIEC',
    inst: '31 CFR Ch. X · FFIEC BSA/AML Examination Manual',
    appl: 64, tot: 64, met: 58, target: 5, owner: 'T. Whitfield · BSA Officer', docs: 68, ev: 41,
    why: 'Appetite: <b>zero-gap</b>. The board set minimal risk tolerance for BSA/AML, so the target is every applicable obligation, all 64. This is the one program judged against the full set by choice.',
  },
  {
    key: 'mrm', name: 'Model Risk Management', bodies: 'OCC · FRB · FDIC',
    inst: 'Interagency Guidance 2026-13 (successor to SR 11-7 / OCC 2011-12)',
    appl: 41, tot: 41, met: 30, target: 4, owner: 'A. Kaur · Model Risk Manager', docs: 57, ev: 33, deep: true,
    why: 'Target raised from 3 to <b>4</b> when <b>Underwriting assist</b> and <b>Deposit pricing optimization</b> entered the portfolio: decisioning models demand Managed-level validation and monitoring.',
  },
  {
    key: 'tprm', name: 'Third-Party Risk Management', bodies: 'OCC · FRB · FDIC · NCUA',
    inst: 'Interagency Guidance on Third-Party Relationships (June 2023, 88 FR 37920)',
    appl: 33, tot: 33, met: 24, target: 4, owner: 'P. Nguyen · ISD', docs: 74, ev: 39, deep: true,
    why: 'Target <b>4</b>: the portfolio leans on vendor-delivered models and platforms, so critical-vendor oversight, fourth-party visibility, and exit planning must reach Managed.',
  },
  {
    key: 'consumer', name: 'Consumer Protection / UDAAP', bodies: 'CFPB · NCUA',
    inst: 'UDAAP · Reg E · Reg DD · complaint-management expectations',
    appl: 37, tot: 37, met: 26, target: 4, owner: 'M. Okafor · CCO', docs: 61, ev: 27,
    why: 'Target <b>4</b>: member-facing automation (secure-message triage, FAQ chatbot, call-center copilot) puts automated communications squarely in examiner view.',
  },
  {
    key: 'fairlend', name: 'Fair Lending · ECOA / Reg B', bodies: 'CFPB · NCUA',
    inst: 'ECOA / Reg B · Circular 2026-C1 (adverse-action specificity)',
    appl: 29, tot: 29, met: 21, target: 4, owner: 'M. Okafor · CCO', docs: 43, ev: 24,
    why: 'Target <b>4</b>: <b>Underwriting assist</b> and <b>adverse-action drafting</b> trigger disparate-impact testing and model-derived reason-code obligations.',
  },
  {
    key: 'infosec', name: 'Information Security · GLBA', bodies: 'FFIEC · NCUA',
    inst: 'GLBA Safeguards · FFIEC CAT (sunset transition tracked)',
    appl: 52, tot: 61, met: 47, target: 4, owner: 'P. Nguyen · ISD', docs: 88, ev: 52,
    why: 'Target <b>4</b> on the <b>52 of 61</b> obligations that apply: nine are excluded with documented rationale because NorthWinds does not perform the complex activities they govern.',
  },
  {
    key: 'aigov', name: 'AI Governance', bodies: 'NCUA · Interagency',
    inst: 'CRI FS AI RMF (flagship framework · 230 controls) · NIST AI RMF catalog',
    appl: 214, tot: 230, met: 110, target: 3, owner: 'R. Fischer · CRO', docs: 102, ev: 31,
    why: 'Target <b>3</b> for the current use-case set; 214 of 230 controls apply to the declared portfolio. The target steps to 4 when agentic workflows enter production.',
  },
  {
    key: 'capital', name: 'Capital Adequacy · CBLR', bodies: 'NCUA · FDIC',
    inst: 'Community Bank Leverage Ratio framework',
    appl: 18, tot: 18, met: 17, target: 4, owner: 'CFO office', docs: 24, ev: 16,
    why: 'Target <b>4</b>: mature, well-controlled program reported for completeness of total regulatory scope. Currently running above target.',
  },
];

/**
 * Per-domain document split: [policies & procedures, evidence, committee &
 * board, training]. Keyed by OnsideDomain.key. Source line 1843.
 */
export const DOM_CATS: Record<string, [number, number, number, number]> = {
  bsa: [18, 36, 7, 7],
  mrm: [14, 33, 9, 1],
  tprm: [10, 58, 4, 2],
  consumer: [20, 30, 6, 5],
  fairlend: [12, 24, 4, 3],
  infosec: [24, 48, 8, 8],
  aigov: [30, 52, 12, 8],
  capital: [8, 12, 3, 1],
};

/** Domains whose document corpus is built (vs. claimed). Source line 1844. */
export const BUILT_DOMS: Record<string, number> = { mrm: 1, tprm: 1 };

/* ============ instrument library (regulations & guidance) — source lines 1888-1917 ============ */

export interface OnsideInstrument {
  n: string;
  issuer: string;
  kind: string;
  eff: string;
  src: string;
  doms: string[];
  sum: string;
}

export const INSTR: Record<string, OnsideInstrument> = {
  '2026-13': {
    n: 'Interagency Guidance 2026-13 · Model Risk Management',
    issuer: 'OCC · Federal Reserve · FDIC',
    kind: 'Supervisory guidance (binding expectation)',
    eff: 'Effective Apr 17, 2026',
    src: 'Federal Register API · eCFR crosswalk',
    doms: ['mrm'],
    sum: 'Replaces SR 11-7 / OCC 2011-12 with a risk-based approach to model risk. Extends inventory, validation, and monitoring expectations to all decisioning models. Generative and agentic models remain subject to the open RFI 2026-04.',
  },
  '88 FR 37920': {
    n: 'Interagency Guidance on Third-Party Relationships: Risk Management',
    issuer: 'OCC · Federal Reserve · FDIC (NCUA aligned)',
    kind: 'Final interagency guidance',
    eff: 'June 9, 2023 · 88 FR 37920',
    src: 'Federal Register API',
    doms: ['tprm'],
    sum: 'The single measuring stick for third-party risk: planning, due diligence, contract negotiation, ongoing monitoring, and termination across the third-party lifecycle, scaled to the risk and criticality of each relationship.',
  },
  '31 CFR Ch. X': {
    n: '31 CFR Chapter X · Financial Crimes Enforcement Network',
    issuer: 'FinCEN',
    kind: 'Binding regulation',
    eff: 'In force · monitored via eCFR Versioner API',
    src: 'eCFR Versioner API · live connector',
    doms: ['bsa'],
    sum: 'The core of BSA regulation: program requirements, customer due diligence, beneficial ownership, SAR and CTR filing, and recordkeeping.',
  },
  'FFIEC Manual': {
    n: 'FFIEC BSA/AML Examination Manual',
    issuer: 'FFIEC (interagency)',
    kind: 'Supervisory expectation · precedence-ranked below binding rules',
    eff: 'Current edition tracked',
    src: 'ffiec.gov · Phase 3 connector',
    doms: ['bsa'],
    sum: 'What examiners actually test against: program pillars, transaction monitoring, and model-supported BSA processes including validation expectations.',
  },
  '2026-C1': {
    n: 'CFPB Circular 2026-C1 · Adverse-Action Specificity for AI-Assisted Denials',
    issuer: 'CFPB',
    kind: 'Circular · effective on issuance',
    eff: 'Jun 15, 2026',
    src: 'Federal Register API',
    doms: ['fairlend'],
    sum: 'Model complexity does not relieve creditors of the ECOA duty to state specific principal reasons in adverse-action notices. Drives the model-derived reason-code obligation.',
  },
  'Reg B': {
    n: 'Regulation B · Equal Credit Opportunity (12 CFR 1002)',
    issuer: 'CFPB',
    kind: 'Binding regulation',
    eff: 'In force',
    src: 'eCFR · Phase 2 connector',
    doms: ['fairlend'],
    sum: 'Adverse-action notice content and timing, ECOA nondiscrimination duties, and the §1002.9 specific-reasons requirement.',
  },
  GLBA: {
    n: 'GLBA §501(b) · Safeguards and FFIEC Information Security expectations',
    issuer: 'FFIEC agencies · NCUA',
    kind: 'Binding regulation + supervisory handbooks',
    eff: 'In force · CAT sunset transition tracked',
    src: 'eCFR + ffiec.gov',
    doms: ['infosec'],
    sum: 'The information security program requirement: administrative, technical, and physical safeguards, vendor security expectations, and incident response.',
  },
  'RFI 2026-04': {
    n: 'Interagency RFI 2026-04 · Generative & Agentic AI in Model Risk',
    issuer: 'OCC · FRB · FDIC · NCUA',
    kind: 'Request for information · rulemaking lifecycle',
    eff: 'Comments due Sep 30, 2026',
    src: 'Federal Register API · change event raised Jul 2',
    doms: ['mrm', 'aigov'],
    sum: 'Determines the future governance home for generative and agentic models. OnSide has pre-staged policy language so the charter update ships the day scope finalizes.',
  },
  'CDD Rule': {
    n: 'Customer Due Diligence Rule & Beneficial Ownership',
    issuer: 'FinCEN',
    kind: 'Binding regulation (31 CFR 1010.230)',
    eff: 'In force · CTA/BOI volatility tracked',
    src: 'eCFR Versioner API',
    doms: ['bsa'],
    sum: 'Identify and verify beneficial owners, understand customer relationships, and maintain ongoing monitoring. Scope is tracked as lifecycle status through the CTA/BOI litigation cycle.',
  },
  '1033': {
    n: 'CFPB §1033 · Personal Financial Data Rights',
    issuer: 'CFPB',
    kind: 'Final rule · staged compliance dates',
    eff: 'Compliance dates by asset tier',
    src: 'Federal Register API',
    doms: ['consumer', 'infosec'],
    sum: 'Consumer data-access and portability duties. NorthWinds’ compliance date is tracked by tier and touches data-sharing, security, and vendor interfaces.',
  },
  CRI: {
    n: 'CRI FS AI RMF · Cyber Risk Institute Financial Services Profile',
    issuer: 'CRI (NIST AI RMF profile)',
    kind: 'Voluntary framework · flagship for AI Governance',
    eff: '230 controls · GOVERN / MAP / MEASURE / MANAGE',
    src: 'AI-GOV catalog · shared data model',
    doms: ['aigov'],
    sum: 'The framework every auditor brings to AI governance. Feeds the AI-GOV catalog on the shared data model and judges the AI domain alone.',
  },
  'NM AI Act': {
    n: 'New Mexico Artificial Intelligence Act',
    issuer: 'State of New Mexico',
    kind: 'State statute',
    eff: 'Enacted Jun 2026',
    src: 'State connector · Phase 4',
    doms: ['aigov', 'tprm'],
    sum: 'Disclosure duties for automated decision systems in credit and financial services; HB 210 would extend these to third-party vendors.',
  },
  TRAIGA: {
    n: 'Texas Responsible AI Governance Act (TRAIGA)',
    issuer: 'State of Texas',
    kind: 'State statute · AG enforcement',
    eff: 'Enacted 2026',
    src: 'State connector · Phase 4',
    doms: ['aigov'],
    sum: 'Prohibits manipulative and discriminatory AI uses statewide; HB 149 would clarify application to regulated financial institutions.',
  },
  'AI Hub': {
    n: 'NCUA AI Resource Hub',
    issuer: 'NCUA',
    kind: 'Supervisory expectations',
    eff: 'Updated Jan 2026',
    src: 'Agency feed · Phase 3',
    doms: ['aigov'],
    sum: 'Consolidated supervisory expectations for credit unions deploying AI in underwriting, fraud detection, and member service.',
  },
};

/* ============ obligation registers (deep domains) — source lines 2309-2338 ============ */

export interface ObligationRow {
  id: string;
  s: string;
  cite: string;
  st: 'met' | 'partial' | 'gap';
  docs: string[];
  rev: 'ok' | 'q';
  /** Gap description. Present when st is 'partial' or 'gap'. */
  gp?: string;
  /** Remediation plan. Present when st is 'partial' or 'gap'. */
  fx?: string;
  /** Play-name foreign key (see file header) — only on some gap/partial rows. */
  uc?: string;
}

export const OBL: Record<string, ObligationRow[]> = {
  tprm: [
    { id: 'TPRM-01', s: 'Maintain a complete, risk-based inventory of all third-party relationships.', cite: '88 FR 37920 §III.A', st: 'met', docs: ['vendor-inventory'], rev: 'ok' },
    { id: 'TPRM-02', s: 'Identify and designate relationships that support critical activities.', cite: '88 FR 37920 §II', st: 'met', docs: ['tprm-critical'], rev: 'ok' },
    { id: 'TPRM-03', s: 'Conduct due diligence commensurate with risk before entering a relationship.', cite: '88 FR 37920 §III.C', st: 'met', docs: ['dd-standard'], rev: 'ok' },
    { id: 'TPRM-04', gp: 'Required: every contract carries audit rights, performance measures, incident notification, and termination provisions. Current: 9 legacy contracts predate the model-risk clauses.', fx: 'Roll Contract Rider v3.0 into the 9 legacy contracts at renewal, scheduled through Q1-2027.', s: 'Ensure contracts address audit rights, performance measures, incident notification, and termination.', cite: '88 FR 37920 §III.D', st: 'partial', docs: ['contract-rider'], rev: 'ok', uc: 'Vendor-risk automation' },
    { id: 'TPRM-05', s: 'Perform ongoing monitoring commensurate with the risk of the relationship.', cite: '88 FR 37920 §III.E', st: 'met', docs: ['vendor-reviews', 'soc2-core'], rev: 'ok' },
    { id: 'TPRM-06', gp: 'Required: visibility into subcontractor dependencies of critical vendors. Current: no subcontractor disclosures collected.', fx: 'Collect subcontractor lists through the rider disclosure clause and fold them into the quarterly vendor reviews.', s: 'Maintain visibility into subcontractor (fourth-party) dependencies of critical vendors.', cite: '88 FR 37920 §III.C.2', st: 'gap', docs: [], rev: 'q', uc: 'Underwriting assist' },
    { id: 'TPRM-07', gp: 'Required: concentration risk assessed across critical third-party dependencies. Current: never assessed.', fx: 'Run the first concentration assessment and make it a standing item in the board TPRM report.', s: 'Assess concentration risk across critical third-party dependencies.', cite: '88 FR 37920 §III.B', st: 'gap', docs: [], rev: 'q' },
    { id: 'TPRM-08', gp: 'Required: documented termination and exit plans for critical relationships, including data portability. Current: exit handled ad hoc at contract end.', fx: 'Adopt the Exit Plan Standard (draft 0.7) and the proposed §6 of the TPRM Program below.', s: 'Maintain termination and exit plans for critical relationships, including data portability.', cite: '88 FR 37920 §III.F', st: 'gap', docs: ['exit-draft', 'tprm-program'], rev: 'q' },
    { id: 'TPRM-09', s: 'Provide board oversight with periodic reporting on third-party risk.', cite: '88 FR 37920 §IV', st: 'met', docs: ['board-tprm'], rev: 'ok' },
    { id: 'TPRM-10', gp: 'Required: periodic independent review of the TPRM program. Current: last review 2025, the 2026 review is not yet scheduled.', fx: 'Schedule the 2026 independent review with internal audit this quarter.', s: 'Subject the TPRM program to periodic independent review.', cite: '88 FR 37920 §IV.B', st: 'partial', docs: ['tprm-program'], rev: 'ok' },
    { id: 'TPRM-11', gp: 'Required: incident-notification service levels in critical-vendor contracts. Current: absent.', fx: 'Add the notification-SLA clause through the rider, critical vendors first.', s: 'Establish incident-notification service levels for critical vendors.', cite: '88 FR 37920 §III.D.6', st: 'gap', docs: [], rev: 'q' },
    { id: 'TPRM-12', s: 'Document and retain records of the third-party risk lifecycle.', cite: '88 FR 37920 §III.G', st: 'met', docs: ['tprm-records'], rev: 'ok' },
  ],
  mrm: [
    { id: 'MRM-01', s: 'Define model scope, including AI/ML and vendor models, in policy.', cite: '2026-13 §II', st: 'met', docs: ['mrm-policy'], rev: 'ok' },
    { id: 'MRM-02', gp: 'Required: every model in the enterprise catalogued with owner and tier. Current: 4 end-user computing models found in the Q2 sweep are not in the inventory.', fx: 'Catalogue the 4 models with owners and tiers, due Sep 2026.', s: 'Maintain a complete enterprise model inventory with ownership and tiering.', cite: '2026-13 §III.A', st: 'partial', docs: ['inv-log'], rev: 'ok' },
    { id: 'MRM-03', s: 'Tier models by materiality and apply risk-commensurate requirements.', cite: '2026-13 §III.B', st: 'met', docs: ['tiering', 'mrm-policy'], rev: 'ok' },
    { id: 'MRM-04', s: 'Subject models to validation independent of development.', cite: '2026-13 §IV', st: 'met', docs: ['mrm-validation-fraud'], rev: 'ok' },
    { id: 'MRM-05', gp: 'Required: conceptual-soundness documentation for each model in scope. Current: 2 legacy models lack current documentation.', fx: 'Refresh the 2 legacy models against Documentation Standard v2.3.', s: 'Document conceptual soundness for each model in scope.', cite: '2026-13 §IV.A', st: 'partial', docs: ['doc-standard'], rev: 'ok' },
    { id: 'MRM-06', s: 'Perform outcomes analysis and back-testing on a defined cadence.', cite: '2026-13 §IV.C', st: 'met', docs: ['outcomes', 'mrm-validation-fraud'], rev: 'ok' },
    { id: 'MRM-07', gp: 'Required: drift thresholds and alerting on every production model. Current: 2 models run without configured alerting.', fx: 'Configure thresholds and alerting for both models, tied to the Fraud model refresh build.', s: 'Monitor production models with defined drift thresholds and alerting.', cite: '2026-13 §V', st: 'partial', docs: ['mrm-minutes'], rev: 'ok', uc: 'Fraud model refresh' },
    { id: 'MRM-08', gp: 'Required: independent validation evidence for every vendor model. Current: nothing on file for 3 vendor models.', fx: 'Request validation packets from the 3 vendors, using the audit-rights clause in the contract rider.', s: 'Obtain and review independent validation evidence for vendor models.', cite: '2026-13 §VI', st: 'gap', docs: ['mrm-minutes'], rev: 'q', uc: 'Underwriting assist' },
    { id: 'MRM-09', gp: 'Required: a formal approval gate before model changes deploy. Current: changes deploy on developer sign-off alone.', fx: 'Adopt the Model Change Approval Workflow (draft 0.8, in the HITL queue).', s: 'Gate model changes through a formal approval workflow before deployment.', cite: '2026-13 §V.B', st: 'gap', docs: ['mrm-change-draft'], rev: 'q', uc: 'Deposit pricing optimization' },
    { id: 'MRM-10', s: 'Report aggregate model risk to the board on a periodic basis.', cite: '2026-13 §VII', st: 'met', docs: ['board-mrm', 'mrm-minutes'], rev: 'ok' },
    { id: 'MRM-11', gp: 'Required: interim governance for generative and agentic models. Current: they sit outside policy scope entirely.', fx: 'Adopt the pre-staged scope language below the moment RFI 2026-04 finalizes.', s: 'Establish interim governance for generative and agentic models pending final scope.', cite: 'RFI 2026-04 (comment period open)', st: 'gap', docs: ['gen-ai-draft'], rev: 'q', uc: 'Member FAQ chatbot' },
    { id: 'MRM-12', s: 'Maintain model documentation sufficient for independent parties to understand operation.', cite: '2026-13 §IV.B', st: 'met', docs: ['doc-standard', 'mrm-policy'], rev: 'ok' },
  ],
};

/* ============ per-domain open items — source lines 2340-2358 ============ */

export interface DomOpenItem {
  t: string;
  cite?: string;
  doc?: string;
}

export const DOM_OPEN: Record<string, DomOpenItem[]> = {
  bsa: [
    { t: 'AI-assisted transaction-monitoring model validation not yet documented', cite: 'FFIEC Manual', doc: 'bsa-policy' },
    { t: 'Below-the-line testing cadence after material tuning changes', doc: 'bsa-policy' },
    { t: 'Beneficial-ownership refresh workflow still manual', cite: 'CDD Rule', doc: 'bsa-policy' },
  ],
  consumer: [
    { t: 'Automated-messaging disclosure only partially documented', doc: 'msg-disclosure' },
    { t: 'Chatbot response monitoring for unfair or deceptive content', doc: 'complaint-proc' },
    { t: 'Complaint tagging for automated interactions', doc: 'complaint-proc' },
    { t: 'Reg E error-resolution procedure for automated transfers', doc: 'complaint-proc' },
  ],
  fairlend: [
    { t: 'Model-derived specific-reason codes for adverse action', cite: '2026-C1', doc: 'aa-procedure' },
    { t: 'Disparate-impact testing cadence for decisioning models', doc: 'fl-review' },
    { t: 'Less-discriminatory-alternative analysis not documented', doc: 'fl-review' },
  ],
  infosec: [
    { t: 'Third-party data-handling attestations for 2 vendors', doc: 'soc2-core' },
    { t: 'DLP coverage for staff generative tooling', doc: 'glba-program' },
    { t: 'Incident-response tabletop covering automated systems', doc: 'irp' },
  ],
  aigov: [
    { t: 'Incident Response Plan: escalation path for member-facing automation (high priority)', doc: 'irp' },
    { t: 'Governance charter: generative and agentic scope pending RFI 2026-04', cite: 'RFI 2026-04', doc: 'gov-charter' },
    { t: '104 of 214 applicable CRI controls below required maturity across GOVERN, MAP, MEASURE, MANAGE' },
  ],
  capital: [
    { t: 'Qualitative operational-risk note for the capital narrative', doc: 'capital-narr' },
  ],
};

/** Source line 2370. */
export const SAMPLE_DOCS: string[] = ['mrm-policy', 'mrm-validation-fraud', 'mrm-minutes', 'tprm-program', 'tprm-critical', 'soc2-core', 'bsa-policy', 'bsa-training', 'sar-qa', 'ofac-test', 'fl-review', 'aa-procedure', 'hmda-lar', 'complaint-proc', 'rege-proc', 'irp', 'glba-program', 'bcp-dr', 'pentest', 'gov-charter', 'ai-inventory', 'fairness-bia', 'hitl-standard', 'ai-committee', 'ai-training', 'capital-narr', 'cblr-worksheet'];

/* ============ open-gaps board — source lines 3183-3192 ============ */

export interface GapItem {
  sev: 'crit' | 'warn';
  t: string;
  dom: string;
  doc: string | null;
  /** Only present on the TPRM-08 gap (redline id it links to). */
  rl?: string;
  obl: [string, string] | null;
  owner: string;
  act: string;
  rev: 'ok' | 'q';
}

export const GAPS: GapItem[] = [
  { sev: 'crit', t: 'Incident Response Plan · escalation path for member-facing automation', dom: 'AI Governance', doc: 'irp', obl: null, owner: 'P. Nguyen · ISD', act: 'Redline drafted · route for approval', rev: 'q' },
  { sev: 'warn', t: 'TPRM-08 · termination &amp; exit plans for critical vendors', dom: 'Third-Party Risk', doc: 'exit-draft', rl: 'tprm-program', obl: ['tprm', 'TPRM-08'], owner: 'P. Nguyen · ISD', act: 'Draft exit-plan standard in review', rev: 'q' },
  { sev: 'warn', t: 'MRM-08 · vendor model validation evidence', dom: 'Model Risk', doc: null, obl: ['mrm', 'MRM-08'], owner: 'A. Kaur · MRM', act: 'Request packets from 3 vendors', rev: 'q' },
  { sev: 'warn', t: 'MRM-09 · model change approval gate', dom: 'Model Risk', doc: 'mrm-change-draft', obl: ['mrm', 'MRM-09'], owner: 'A. Kaur · MRM', act: 'Workflow draft in HITL queue', rev: 'q' },
  { sev: 'warn', t: 'Model-derived adverse-action reason codes', dom: 'Fair Lending', doc: 'aa-procedure', obl: null, owner: 'M. Okafor · CCO', act: 'Redline drafted · attribution-to-code matrix', rev: 'ok' },
  { sev: 'warn', t: 'Automated-messaging disclosure documentation', dom: 'Consumer / UDAAP', doc: 'msg-disclosure', obl: null, owner: 'M. Okafor · CCO', act: 'Disclosure language drafted', rev: 'ok' },
  { sev: 'warn', t: 'AI-assisted transaction-monitoring validation', dom: 'BSA / AML', doc: 'bsa-policy', obl: null, owner: 'T. Whitfield · BSA', act: 'Independent validation scheduled', rev: 'ok' },
];

/** Source line 3192. */
export const GAP_DOM: Record<string, string> = {
  'AI Governance': 'aigov',
  'Third-Party Risk': 'tprm',
  'Model Risk': 'mrm',
  'Fair Lending': 'fairlend',
  'Consumer / UDAAP': 'consumer',
  'BSA / AML': 'bsa',
};

/* ============ regulatory source feed — source lines 3243-3299 ============ */

/** [daysAgo, date, title, note, action, description?] — `action` is a
 * verbatim source-code string (e.g. "goOnside('dom-mrm')"), not executable
 * here. `description` (call-11, `01-architecture.md` row 11) is an
 * additive, optional field — same class as A20's `ChatEntry.response?`
 * precedent — carrying a plain-language, compliance-audience summary of
 * what the alert means and why it is relevant, replacing the "opaque
 * technical name" Dan Scheffler's own feedback names
 * (`call-11-llm-alert-descriptions.md`). Authored/scripted content for the
 * seeded signals below, not runtime LLM generation (no generation
 * machinery exists in this SPA) — the open question of an actual LLM
 * pipeline (model, prompt, caching, regeneration) is explicitly out of
 * this dispatch's scope, named in that file's own "Open questions". */
export type SrcItem = [number, string, string, string, string, string?];

export interface SrcItemsEntry {
  d: string;
  items: SrcItem[];
}

export const SRC_ITEMS: Record<string, SrcItemsEntry> = {
  'OCC · 12 CFR Ch. I': {
    d: 'National-bank rules, versioned through the eCFR API with same-day change detection.',
    items: [
      [3, 'Aug 12, 2026', 'Bulletin 2026-24 · risk management of AI-assisted underwriting', 'Mapped to Model Risk and Fair Lending registers', "goOnside('dom-mrm')", 'The OCC wants documented risk controls wherever AI models influence underwriting decisions — this bulletin is why the Model Risk and Fair Lending teams are both reviewing every AI-touched lending model this quarter.'],
      [17, 'Jul 29, 2026', '12 CFR 30 Appendix B · safety and soundness standards refresh', 'No change to obligations in scope', "onsideShow('feed-inforce')", "A routine refresh of the OCC's safety-and-soundness expectations; reviewed and confirmed it adds no new obligation to the bank's existing scope."],
      [58, 'Jun 18, 2026', 'Semiannual risk perspective · third-party concentration', 'Fed the TPRM critical-vendor review', "goOnside('dom-tprm')", "The OCC's twice-yearly risk report flagged industry-wide concentration risk among critical technology vendors — feeding directly into the third-party risk program's own critical-vendor review."],
    ],
  },
  'FDIC · 12 CFR Ch. III': {
    d: 'State non-member bank rules, versioned through the eCFR API.',
    items: [
      [3, 'Aug 12, 2026', 'Joint NPRM with the Federal Reserve · Regulation O', 'Comment window open · position in drafting', "onsideShow('feed-lifecycle')", 'A joint FDIC/Federal Reserve proposal would tighten rules on extensions of credit to bank insiders; the comment window is open and a position is being drafted before it becomes final.'],
      [26, 'Jul 20, 2026', 'FIL-31-2026 · model risk expectations for smaller institutions', 'Cross-checked against the 2026-13 register', "goOnside('dom-mrm')", "FDIC guidance tailoring model-risk expectations to smaller institutions; checked against the bank's own model-risk obligations (Interagency Guidance 2026-13) and confirmed already aligned."],
      [71, 'Jun 5, 2026', 'Part 364 appendix · information security standards', 'GLBA program verified current', "goOnside('dom-infosec')", "FDIC information-security standards required under GLBA; the bank's information-security program was verified current against this appendix, no gap found."],
    ],
  },
  'NCUA · 12 CFR Ch. VII': {
    d: 'Credit-union rules from your chartering regulator, versioned through the eCFR API.',
    items: [
      [1, 'Aug 14, 2026', 'Letter to Credit Unions 26-CU-07 · AI use in member service', 'Mapped to Consumer / UDAAP and AI Governance', "goOnside('dom-consumer')", "NCUA guidance on credit unions' use of AI in serving members, mapped into both the Consumer/UDAAP and AI Governance registers since it touches both."],
      [12, 'Aug 3, 2026', 'Part 748 appendix A · response programme expectations', 'Feeds the incident-response escalation gap', "goOnside('dom-infosec')", "NCUA's expectations for a member-notification response program after a security incident — feeding directly into closing the incident-response escalation gap already tracked."],
      [40, 'Jul 6, 2026', 'AI Resource Hub update · supervisory expectations', 'Tracked against the CRI crosswalk', "goOnside('dom-aigov')", "An update to the NCUA's AI supervisory-expectations resource hub, tracked against the bank's own AI regulatory crosswalk."],
    ],
  },
  OFAC: {
    d: 'Sanctions programmes and list updates from Treasury.',
    items: [
      [8, 'Aug 7, 2026', 'SDN list update · 41 additions, 6 removals', 'Screening configuration re-verified same day', "goOnside('dom-bsa')", "Treasury's Specially Designated Nationals sanctions list changed — 41 names added, 6 removed — and the bank's screening configuration was re-verified the same day to catch it."],
      [22, 'Jul 24, 2026', 'General License 12B · wind-down authorisation', 'No member exposure identified', "goOnside('dom-bsa')", 'A new OFAC general license authorizing a wind-down of certain restricted activity; reviewed for member exposure and none was found.'],
      [63, 'Jun 13, 2026', 'Sectoral determination · technology services', 'Vendor inventory screened, no matches', "goOnside('dom-tprm')", 'OFAC designated a new sanctioned sector in technology services; the vendor inventory was screened against it and no matches were found.'],
    ],
  },
  'SEC & FINRA': {
    d: 'Markets rules in scope for the CUSO broker-dealer relationship.',
    items: [
      [19, 'Jul 27, 2026', 'FINRA Regulatory Notice 26-14 · supervision of AI tools', 'Reviewed for CUSO applicability', "goOnside('dom-aigov')", 'FINRA guidance on supervising AI tools used in securities activity; reviewed for whether it applies through the credit union service organization (CUSO) relationship.'],
      [55, 'Jun 21, 2026', 'SEC marketing rule FAQ update', 'No change to obligations in scope', "onsideShow('feed-inforce')", "The SEC updated its FAQ on the marketing rule; reviewed and confirmed it introduces no change to the bank's obligations already in scope."],
    ],
  },
  'FFIEC · incl. NIST frameworks': {
    d: 'Examination handbooks and supervisory expectation, ranked below binding rules.',
    items: [
      [5, 'Aug 10, 2026', 'CAT sunset transition · successor mapping guidance', 'InfoSec mapping in progress', "goOnside('dom-infosec')", "Guidance on the sunset of the Cybersecurity Assessment Tool (CAT) and its successor framework; the information-security team is mapping controls to the replacement now."],
      [30, 'Jul 16, 2026', 'BSA/AML Examination Manual · model validation section', 'Fed the transaction-monitoring validation item', "goOnside('dom-bsa')", 'An update to the model-validation section of the BSA/AML Examination Manual, feeding directly into the transaction-monitoring model’s own validation work.'],
      [88, 'May 19, 2026', 'NIST AI RMF crosswalk refresh', 'Mapped into the AI Governance catalog', "goOnside('dom-aigov')", "A refreshed crosswalk between the NIST AI Risk Management Framework and the bank's own controls, now mapped into the AI Governance catalog."],
    ],
  },
  FHFA: {
    d: 'Housing-finance scope, monitored for mortgage-related obligations.',
    items: [
      [34, 'Jul 12, 2026', 'Advisory bulletin · third-party model oversight', 'Reviewed, no direct applicability at this tier', "goOnside('dom-tprm')", "FHFA advisory on overseeing third-party models used in mortgage finance; reviewed and found not directly applicable at this institution's asset tier."],
      [96, 'May 11, 2026', 'Fair lending examination guidance update', 'Cross-read into the Fair Lending register', "goOnside('dom-fairlend')", "Updated fair-lending examination guidance from the housing-finance regulator, cross-read into the bank's own Fair Lending obligations register."],
    ],
  },
  'Bills working through government': {
    d: 'Federal bills tracked from introduction through enactment, so a position can be formed while it still matters.',
    items: [
      [4, 'Aug 11, 2026', 'S. 4127 · Financial AI Accountability Act · reported out of committee', 'Watchlist · would touch AI Governance and Model Risk', "onsideShow('feed-lifecycle')", 'A federal bill that would create new AI-accountability requirements for financial institutions has cleared committee; watchlisted since it would touch both AI Governance and Model Risk if enacted.'],
      [15, 'Jul 31, 2026', 'H.R. 8802 · data-broker restrictions · floor vote scheduled', 'Watchlist · privacy and vendor implications', "goOnside('dom-infosec')", 'A House bill restricting data-broker practices has a floor vote scheduled; watchlisted for privacy and third-party vendor implications.'],
      [47, 'Jun 29, 2026', 'S. 3910 · consumer credit transparency · hearing held', 'No action while in committee', "onsideShow('feed-lifecycle')", 'A Senate bill on consumer credit transparency had its hearing; no action is needed while it remains in committee.'],
    ],
  },
  'State governments & laws': {
    d: 'Statutes and rulemaking across the TX, OK, and NM footprint, plus 50-state tracking for expansion.',
    items: [
      [5, 'Aug 9, 2026', 'NM HB 210 · passed Senate 34-6', 'Vendor disclosure clause pre-drafted', "openInstr('NM AI Act')", "New Mexico's AI-oversight bill passed its Senate by a wide margin; a vendor-disclosure contract clause has already been pre-drafted in anticipation of it taking effect."],
      [20, 'Jul 25, 2026', 'TX HB 149 · TRAIGA clarification awaiting floor vote', 'Governance charter language staged', "openInstr('TRAIGA')", "Texas's TRAIGA AI-governance law is awaiting a clarifying floor vote; updated governance-charter language is staged and ready to adopt once it passes."],
      [37, 'Jul 9, 2026', 'OK SB 1822 · AI consumer protection · in committee', 'Monitoring · Consumer and Fair Lending exposure', "onsideShow('feed-lifecycle')", 'An Oklahoma AI consumer-protection bill remains in committee; monitored for exposure in both the Consumer/UDAAP and Fair Lending domains.'],
    ],
  },
  'Municipal governments': {
    d: 'Local ordinances inside the branch footprint, where obligations stack on top of state and federal rules.',
    items: [
      [11, 'Aug 4, 2026', 'City of Albuquerque · automated-decision disclosure ordinance · first reading', 'Consumer disclosure impact assessed', "goOnside('dom-consumer')", 'A first-reading Albuquerque ordinance would require disclosure whenever an automated system drives a decision affecting a member; its impact on existing consumer disclosures has already been assessed.'],
      [24, 'Jul 22, 2026', 'Travis County · vendor AI procurement standards published for comment', 'TPRM contract rider reviewed against draft', "goOnside('dom-tprm')", "Travis County published draft AI-procurement standards for vendors; the third-party risk program's contract rider was reviewed against the draft."],
      [69, 'Jun 7, 2026', 'City of Tulsa · privacy notice ordinance · effective', 'Privacy notice confirmed compliant', "goOnside('dom-infosec')", "Tulsa's privacy-notice ordinance is now in effect; the bank's own member privacy notice was confirmed compliant."],
    ],
  },
  'White House Executive Orders': {
    d: 'Presidential actions touching financial services, captured from the Federal Register the day they publish.',
    items: [
      [6, 'Aug 8, 2026', 'Executive order · sanctions program modernization', 'Screening configuration re-verified same day', "onsideShow('feed-inforce')", 'An executive order modernizing federal sanctions programs; screening configuration was re-verified the same day it published.'],
      [23, 'Jul 22, 2026', 'Executive order · digital-asset custody review directive', 'Tracking · no obligation change yet', "onsideShow('feed-lifecycle')", 'An executive order directing a review of digital-asset custody rules; tracked for now since no obligation has changed yet.'],
      [98, 'May 8, 2026', 'Executive order · AI use in federal financial oversight', 'Mapped to AI Governance watchlist', "goOnside('dom-aigov')", "An executive order on how federal regulators will use AI in financial oversight; added to the AI Governance watchlist since it may reshape future exam expectations."],
    ],
  },
  'Federal Reserve · 12 CFR Ch. II': {
    d: 'Binding lettered regulations, versioned through the eCFR API with same-day change detection.',
    items: [
      [14, 'Jul 31, 2026', 'Joint NPRM with FDIC · Regulation O · extensions of credit to insiders', '<span class="tag info">New</span> Comment period open', "onsideShow('feed-lifecycle')", 'A joint Federal Reserve/FDIC proposal would tighten rules on extensions of credit to bank insiders; the comment period just opened.'],
      [45, 'Jun 30, 2026', 'RFI 2026-04 · generative &amp; agentic AI in model risk', 'Comments due Sep 30', "openInstr('RFI 2026-04')", 'The Federal Reserve is requesting input on how generative and agentic AI should be treated under model-risk rules; comments are due September 30.'],
      [119, 'Apr 17, 2026', 'Interagency Guidance 2026-13 in force', 'Mapped to the Model Risk register', "goOnside('dom-mrm')", "The banking agencies' joint model-risk-management guidance (Interagency Guidance 2026-13) is now formally in force and mapped into the Model Risk obligations register."],
    ],
  },
  'FinCEN · 31 CFR Ch. X': {
    d: 'BSA program rules, CDD, and SAR/CTR requirements, versioned through the eCFR API.',
    items: [
      [9, 'Aug 5, 2026', 'CTA / BOI scope update · litigation cycle', 'Lifecycle status tracked, never hard-coded', "onsideShow('feed-lifecycle')", 'Ongoing litigation keeps changing who must file beneficial-ownership information under the Corporate Transparency Act; the applicable scope is tracked live rather than assumed fixed.'],
      [60, 'Jun 2026', 'SAR e-filing schema revision', 'Filing procedures verified current', "goOnside('dom-bsa')", 'FinCEN revised the electronic-filing schema for Suspicious Activity Reports; internal filing procedures were verified current against the new schema.'],
    ],
  },
  'CFPB · 12 CFR Ch. X': {
    d: 'Consumer regulations B through Z plus §1071 and §1033 rulemakings.',
    items: [
      [8, 'Aug 6, 2026', '§1033 staged compliance dates · tier confirmation', 'Applies at our asset tier', "openInstr('1033')", "The CFPB's open-banking data-sharing rule (§1033) phases in compliance by asset size; confirmed this institution's tier is subject to it."],
      [60, 'Jun 15, 2026', 'Circular 2026-C1 in force · adverse-action specificity', '2 items open in Fair Lending', "goOnside('dom-fairlend')", 'A new CFPB circular tightening the specificity required in adverse-action notices is now in force, leaving 2 open items in the Fair Lending register.'],
    ],
  },
  'State banking regulators': {
    d: 'NYDFS Part 500/504, CA DFPI, and CSBS/NMLS state actions for the TX · OK · NM footprint.',
    items: [
      [5, 'Aug 9, 2026', 'NM HB 210 · passed Senate 34–6', 'Vendor disclosure clause pre-drafted', "openInstr('NM AI Act')", "New Mexico's AI-oversight bill passed its Senate; tracked here from the state-banking-regulator angle alongside the vendor-disclosure clause already pre-drafted for it."],
      [20, 'Jul 25, 2026', 'TX HB 149 · awaiting floor vote', 'TRAIGA clarification tracked', "onsideShow('feed-lifecycle')", "Texas's TRAIGA clarification bill awaits its floor vote; tracked here from the state-banking-regulator perspective alongside the legislative one."],
    ],
  },
};

export interface SrcRow {
  n: string;
  i: string | null;
  l: string;
  c: string;
  m: string;
  ph: string;
  phl: string;
}

/** Source lines 3315-3331. Row order is independent of SRC_ITEMS's key order (both are as-authored). */
export const SRC_ROWS: SrcRow[] = [
  { n: 'OCC · 12 CFR Ch. I', i: null, l: 'Financial', c: 'Binding rules', m: 'eCFR Versioner API', ph: 'live', phl: 'Live' },
  { n: 'FDIC · 12 CFR Ch. III', i: null, l: 'Financial', c: 'Binding rules', m: 'eCFR Versioner API', ph: 'live', phl: 'Live' },
  { n: 'Federal Reserve · 12 CFR Ch. II', i: null, l: 'Financial', c: 'Binding rules (lettered Regs)', m: 'eCFR Versioner API', ph: 'live', phl: 'Live' },
  { n: 'NCUA · 12 CFR Ch. VII', i: null, l: 'Financial', c: 'Binding rules', m: 'eCFR Versioner API', ph: 'live', phl: 'Live' },
  { n: 'CFPB · 12 CFR Ch. X', i: 'Reg B', l: 'Financial', c: 'Regs B/C/E/F/V/X/Z/DD/P · §1071 · §1033', m: 'eCFR + Federal Register', ph: 'p2', phl: 'Phase 2' },
  { n: 'State banking regulators', i: null, l: 'Financial', c: 'NYDFS Part 500/504 · CA DFPI · CSBS/NMLS', m: 'State sources', ph: 'p4', phl: 'Phase 4' },
  { n: 'OFAC', i: null, l: 'Systemic', c: 'Sanctions programs &amp; list updates', m: 'Treasury feeds', ph: 'p3', phl: 'Phase 3' },
  { n: 'SEC &amp; FINRA', i: null, l: 'Systemic', c: 'CUSO broker-dealer scope', m: 'Agency feeds', ph: 'p3', phl: 'Phase 3' },
  { n: 'FFIEC · incl. NIST frameworks', i: 'FFIEC Manual', l: 'Systemic', c: 'Exam handbooks · supervisory expectation, ranked below binding rules', m: 'ffiec.gov', ph: 'p3', phl: 'Phase 3' },
  { n: 'FinCEN · 31 CFR Ch. X', i: '31 CFR Ch. X', l: 'Systemic', c: 'BSA program · CDD · SAR/CTR', m: 'eCFR Versioner API', ph: 'live', phl: 'Live' },
  { n: 'FHFA', i: null, l: 'Systemic', c: 'Housing finance scope', m: 'Agency feeds', ph: 'p3', phl: 'Phase 3' },
  { n: 'White House Executive Orders', i: null, l: 'Regional', c: 'Presidential actions touching financial services', m: 'Federal Register API', ph: 'live', phl: 'Live' },
  { n: 'Bills working through government', i: null, l: 'Regional', c: 'Congress · proposed → enacted', m: 'Congress.gov · GovInfo', ph: 'p5', phl: 'Phase 5' },
  { n: 'State governments &amp; laws', i: null, l: 'Regional', c: 'TX · OK · NM statutes and 50-state tracking', m: 'LegiScan · Open States · authoritative-site fallback', ph: 'p5', phl: 'Phase 5' },
  { n: 'Municipal governments', i: null, l: 'Regional', c: 'Local ordinances in footprint', m: 'Municipal sources', ph: 'p5', phl: 'Phase 5' },
];

/** [layerKey, label, description]. Source lines 3332-3336. */
export type SrcLayer = [string, string, string];

export const SRC_LAYERS: SrcLayer[] = [
  ['Financial', 'Financial · banking regulators', 'The prudential and consumer core: your chartering regulator and the agencies that examine you.'],
  ['Systemic', 'Systemic · governing agencies', 'The agencies whose programs cut across every institution: sanctions, financial crimes, exam standards, markets.'],
  ['Regional', 'Regional · national, state &amp; local', 'Where obligations are born: executive action, bills in flight, state law, and the ordinances of your footprint.'],
];

/* ============ digest & alerts — source line 3346, 3348 ============ */

export interface DigestSettings {
  freq: string;
  email: boolean;
  app: boolean;
  bindingOnly: boolean;
}

export const DIGEST: DigestSettings = { freq: 'Daily', email: true, app: true, bindingOnly: false };

/** [label, daysThreshold, description]. Source line 3348. */
export type FreqOption = [string, number, string];

export const FREQ: FreqOption[] = [
  ['Real-time', 0, 'the moment a sweep finds a change'],
  ['Daily', 1, 'every weekday, 7:00 AM ET'],
  ['Weekly', 7, 'Monday, 7:00 AM ET'],
  ['Monthly', 30, 'first business day'],
  ['Quarterly', 90, 'first business day of the quarter'],
];

/* ============ regwatch: newly proposed, pending & tracked — source lines 3461-3477 ============ */

/** [source, proposalTitle, status, domainsTouched, rationale]. Raw literal, source lines 3461-3464 (pre-filter/map). */
export type NewRuleRow = [string, string, string, string, string];

export const NEW_RULES: NewRuleRow[] = [
  ['FED · FDIC', 'Joint NPRM · Regulation O · extensions of credit to insiders', 'Proposed Jul 31, 2026 · comment period open', 'AI Governance · Capital', 'Insider-credit and board policies would need conforming updates. The comment window is the strategy moment.'],
  ['NCUA', 'NPRM · third-party due-diligence expectations for AI-assisted services', 'Proposed Aug 5, 2026 · comments due Oct 4', 'Third-Party Risk', 'Would raise evidence expectations on TPRM-04 and TPRM-08 for critical AI vendors.'],
  ['CFPB', '§1071 small-business lending data · re-proposal signals', 'Pre-rule · SBREFA panel announced', 'Fair Lending', 'Data-collection build enters scope the day a proposal posts.'],
];

/**
 * "Pending & tracked" rows — the unnamed local `rows` in source's
 * osRegwatch() (source lines 3468-3477), ported as raw literal data only
 * (its .filter/.map HTML-row rendering was not ported; see file header
 * note 3). [source, instrumentKey|null, title, status, domainsTouched].
 */
export type TrackedRuleRow = [string, string | null, string, string, string];

export const TRACKED_RULES: TrackedRuleRow[] = [
  ['FED', 'RFI 2026-04', 'Interagency RFI 2026-04 · Generative &amp; Agentic AI in Model Risk', 'Comment period open · due Sep 30, 2026', 'Model Risk · AI Governance'],
  ['CFPB', '1033', '§1033 Personal Financial Data Rights · staged compliance dates', 'Compliance dates tracked by tier', 'Consumer / UDAAP · InfoSec'],
  ['FinCEN', 'CDD Rule', 'CTA / BOI reporting · scope volatility', 'Lifecycle status tracked, never hard-coded', 'BSA / AML'],
  ['FFIEC', 'GLBA', 'Cybersecurity Assessment Tool sunset transition', 'Mapping to successor frameworks', 'InfoSec'],
  ['NM', 'NM AI Act', 'HB 210 · AI Transparency &amp; Accountability Act', 'Passed Senate 34&ndash;6 · awaiting House', 'Third-Party Risk · AI Governance'],
  ['TX', 'TRAIGA', 'HB 149 · AI Governance Rules Clarification Act', 'Awaiting floor vote', 'AI Governance'],
  ['OK', null, 'SB 1822 · AI Consumer Protection Act', 'In committee', 'Consumer / UDAAP · Fair Lending'],
  ['CFPB', '2026-C1', 'Reg B Guidance 2026-C1 · adverse-action specificity', '<span style="color:var(--sem2);font-weight:700">Effective now</span>', 'Fair Lending'],
];

/* ============ in-force instruments — source lines 3484-3493 ============ */

/**
 * The unnamed local `rows` in source's osInforce() (source lines 3485-3493),
 * ported as raw literal data only (its .map HTML-row rendering was not
 * ported; see file header note 3).
 * [source, instrumentKey, title, effectiveDate, domain].
 */
export type InforceRuleRow = [string, string, string, string, string];

export const INFORCE_RULES: InforceRuleRow[] = [
  ['FED', '2026-13', 'Interagency Guidance 2026-13 · Model Risk Management', 'Apr 17, 2026', 'Model Risk'],
  ['FED', '88 FR 37920', 'Interagency Guidance on Third-Party Relationships', 'Jun 2023', 'Third-Party Risk'],
  ['FinCEN', 'CDD Rule', 'CDD Rule &amp; Beneficial Ownership', 'In force', 'BSA / AML'],
  ['CFPB', '2026-C1', 'Reg B Circular 2026-C1 · adverse-action specificity', 'Jun 15, 2026', 'Fair Lending'],
  ['FFIEC', 'GLBA', 'GLBA Safeguards · information security program', 'In force', 'InfoSec'],
  ['NM', 'NM AI Act', 'New Mexico Artificial Intelligence Act', 'Jun 2026', 'AI Governance'],
  ['TX', 'TRAIGA', 'Responsible AI Governance Act (TRAIGA)', '2026', 'AI Governance'],
  ['NCUA', 'AI Hub', 'AI Resource Hub · supervisory expectations', 'Jan 2026', 'AI Governance'],
];

/* ============ RACI (roles & responsibility matrix) — source lines 3499-3549 ============ */

/** [code, label, name]. Source lines 3499-3508. */
export type OnsideRole = [string, string, string];

export const ROLES: OnsideRole[] = [
  ['CRO', 'Chief Risk Officer', 'R. Fischer'],
  ['CCO', 'Chief Compliance Officer', 'M. Okafor'],
  ['BSA', 'BSA / AML Officer', 'T. Whitfield'],
  ['MRM', 'Model Risk Manager', 'A. Kaur'],
  ['ISD', 'Information Security Director', 'P. Nguyen'],
  ['BRO', 'Business Resiliency Officer', 'S. Delgado'],
  ['GC', 'General Counsel', 'D. Reyes'],
  ['BOARD', 'Board Risk Committee', 'Board'],
];

/** [docId, accountable, responsible, consulted[], informed[]]. Per-document RACI row. */
export type DocRaci = [string, string, string, string[], string[]];

/** [domainKey, domainLabel, DocRaci[]]. Source lines 3510-3549. */
export type DomainRaci = [string, string, DocRaci[]];

export const M: DomainRaci[] = [
  ['aigov', 'AI Governance', [
    ['gov-charter', 'BOARD', 'CRO', ['GC', 'CCO'], ['ISD']],
  ]],
  ['mrm', 'Model Risk Management', [
    ['mrm-policy', 'CRO', 'MRM', ['GC'], ['BOARD', 'CCO']],
    ['mrm-validation-fraud', 'CRO', 'MRM', ['ISD'], ['CCO']],
    ['tiering', 'CRO', 'MRM', [], ['CCO']],
    ['inv-log', 'CRO', 'MRM', [], ['ISD']],
    ['outcomes', 'CRO', 'MRM', ['CCO'], ['BOARD']],
    ['doc-standard', 'CRO', 'MRM', [], ['CCO']],
    ['mrm-minutes', 'CRO', 'MRM', [], ['BOARD']],
    ['board-mrm', 'BOARD', 'MRM', ['CRO'], ['CCO']],
    ['gen-ai-draft', 'CRO', 'MRM', ['GC', 'ISD'], ['BOARD']],
    ['mrm-change-draft', 'CRO', 'MRM', ['ISD'], ['CCO']],
  ]],
  ['tprm', 'Third-Party Risk', [
    ['tprm-program', 'CRO', 'ISD', ['GC'], ['BOARD']],
    ['vendor-inventory', 'CRO', 'ISD', [], ['CCO']],
    ['tprm-critical', 'CRO', 'ISD', ['BRO'], ['BOARD']],
    ['dd-standard', 'CRO', 'ISD', ['BSA'], ['CCO']],
    ['contract-rider', 'CRO', 'ISD', ['GC', 'MRM'], ['CCO']],
    ['vendor-reviews', 'CRO', 'ISD', [], ['BRO']],
    ['tprm-records', 'CRO', 'ISD', [], ['CCO']],
    ['exit-draft', 'CRO', 'ISD', ['BRO', 'GC'], ['BOARD']],
    ['soc2-core', 'CRO', 'ISD', ['BRO'], ['MRM']],
    ['board-tprm', 'BOARD', 'ISD', ['CRO'], ['GC']],
  ]],
  ['bsa', 'BSA / AML', [
    ['bsa-policy', 'BOARD', 'BSA', ['CCO', 'GC'], ['CRO']],
    ['bsa-training', 'CRO', 'BSA', [], ['CCO']],
  ]],
  ['fairlend', 'Fair Lending', [
    ['fl-review', 'CRO', 'CCO', ['GC'], ['BOARD']],
    ['aa-procedure', 'CRO', 'CCO', ['MRM', 'GC'], ['BOARD']],
  ]],
  ['consumer', 'Consumer / UDAAP', [
    ['complaint-proc', 'CRO', 'CCO', [], ['GC', 'BOARD']],
    ['msg-disclosure', 'CRO', 'CCO', ['GC'], ['ISD']],
  ]],
  ['infosec', 'InfoSec / GLBA', [
    ['irp', 'CRO', 'ISD', ['BRO', 'GC'], ['BOARD']],
    ['glba-program', 'CRO', 'ISD', ['BSA'], ['BOARD']],
  ]],
  ['capital', 'Capital Adequacy', [
    ['capital-narr', 'BOARD', 'CRO', ['GC'], ['CCO']],
  ]],
];
