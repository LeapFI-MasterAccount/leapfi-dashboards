/**
 * Studio datasets — ported VERBATIM (values unchanged) from
 * leapfi-dashboards/src/leapfi-platform.html lines 1150-1215 (scaffold
 * commit 5f37e99 / survey_map.md @main@1c230fe).
 *
 * Source is a read-only reference (never modify). This module only adds
 * TypeScript types around the same literal data plus the two small
 * derivations the source computes inline immediately after declaring the
 * data (gateCalc on OPPS, unlocks on DETAIL) — see the STOP/ambiguity note
 * at the bottom of this file's companion evidence return for why those two
 * derivations are included even though they sit just past line 1213.
 *
 * Play-name strings (OPPS[].n / DETAIL keys) are foreign keys per
 * survey_map.md §d-1 ("Play-name string coupling") — they are preserved
 * character-for-character and must never be edited independently here.
 */

/* ============ USERS (Active Directory mock) — source lines 1160-1167 ============ */

export interface StudioUser {
  id: string;
  first: string;
  name: string;
  ini: string;
  role: string;
  roleKey: string;
  email: string;
  phone: string;
}

export const USERS: StudioUser[] = [
  { id: 'rachel', first: 'Rachel', name: 'Rachel Fischer', ini: 'RF', role: 'Chief Risk Officer', roleKey: 'cro', email: 'rachel.fischer@northwindscu.org', phone: '+1 (203) 555-0184' },
  { id: 'priya', first: 'Priya', name: 'Priya Raman', ini: 'PR', role: 'Risk Analyst', roleKey: 'analyst', email: 'priya.raman@northwindscu.org', phone: '+1 (512) 555-0148' },
  { id: 'reyes', first: 'Dana', name: 'Dana Reyes', ini: 'DR', role: 'General Counsel', roleKey: 'legal', email: 'dana.reyes@northwindscu.org', phone: '+1 (214) 555-0173' },
  { id: 'adam', first: 'Adam', name: 'Adam Schlesinger', ini: 'AS', role: 'Chief Executive Officer', roleKey: 'ceo', email: 'adam.schlesinger@northwindscu.org', phone: '+1 (415) 555-0117' },
  { id: 'jose', first: 'Jose', name: 'Jose Ribau', ini: 'JR', role: 'Engagement Manager', roleKey: 'ai', email: 'jose.ribau@northwindscu.org', phone: '+1 (416) 555-0139' },
  { id: 'dan', first: 'Dan', name: 'Dan Scheffler', ini: 'DS', role: 'Product Manager', roleKey: 'pm', email: 'dan.scheffler@northwindscu.org', phone: '+1 (917) 555-0162' },
];

/** source line 1168: `var CURRENT=USERS[0];` */
export const CURRENT: StudioUser = USERS[0] as StudioUser;

/* ============ STUDIO ENGINE (five-point scale) — source lines 1171-1176 ============ */

/** Control-maturity score (0-100) by control name. Source line 1171. */
export const CTRL: Record<string, number> = {
  'Govern': 84,
  'Model Risk': 70,
  'UDAAP': 62,
  'Fair Lending': 68,
  'BSA/AML': 74,
  'Privacy': 80,
  'InfoSec': 90,
  'TPRM': 66,
  'Adverse Action': 55,
};

/** Five-point maturity band labels, index 0-4. Source line 1172. */
export const BANDS: string[] = ['Aware', 'Developing', 'Established', 'Managed', 'Embedded'];

/** Default investment lever position. Source line 1173: `var CUR=1, GREEN=80;` */
export const CUR = 1;
/** Green-band control-maturity threshold. Source line 1173. */
export const GREEN = 80;

/** Control name -> regulatory citation label (fabricated demo citations). Source line 1174. */
export const REGMAP: Record<string, string> = {
  'Fair Lending': 'ECOA / Reg B',
  'Adverse Action': 'Reg B §1002.9 · Circular 2026-C1',
  'UDAAP': 'UDAAP / consumer protection',
  'BSA/AML': '31 CFR Ch. X · FFIEC BSA/AML Manual',
  'Model Risk': 'Interagency 2026-13',
  'Privacy': 'GLBA §501(b)',
  'InfoSec': 'GLBA Safeguards · FFIEC CAT',
  'TPRM': 'Interagency TPRM Guidance (2023)',
  'Govern': 'Board governance expectations',
};

/** Control name -> OnSide domain key. Source line 1175. */
export const CTRLDOM: Record<string, string> = {
  'Fair Lending': 'fairlend',
  'Adverse Action': 'fairlend',
  'UDAAP': 'consumer',
  'BSA/AML': 'bsa',
  'Model Risk': 'mrm',
  'Privacy': 'infosec',
  'InfoSec': 'infosec',
  'TPRM': 'tprm',
  'Govern': 'aigov',
};

/**
 * Control name -> instrument citation short-label. Source line 1176.
 * Note: verbatim from source — only 7 of the 9 CTRL keys have an entry
 * ('Govern' and 'UDAAP' are absent in the source object literal too).
 */
export const CTRLINSTR: Record<string, string> = {
  'Fair Lending': 'Reg B',
  'Adverse Action': '2026-C1',
  'BSA/AML': '31 CFR Ch. X',
  'Model Risk': '2026-13',
  'Privacy': 'GLBA',
  'InfoSec': 'GLBA',
  'TPRM': '88 FR 37920',
};

/* ============ OPPS — 15-play opportunity catalog — source lines 1177-1195 ============ */

export type OppHorizon = 'quick' | 'strategic';
export type OppRisk = 'low' | 'med' | 'high';

export interface StudioOpportunity {
  /** Play name. Foreign key into DETAIL and OBL gap `uc` per survey_map.md §d-1 — never edit independently. */
  n: string;
  c: string;
  cost: number;
  val: number;
  h: OppHorizon;
  r: OppRisk;
  g: string[];
  /** Present only on the 'Unified data foundation' foundation play. Source line 1183. */
  found?: boolean;
  /** Computed by source's `gateCalc()` (line 1194), applied via `OPPS.forEach(gateCalc)` (line 1195): min CTRL score across `g`. */
  minGate: number;
  /** Computed by source's `gateCalc()` (line 1194): the control name in `g` with the lowest CTRL score. */
  weakGate: string;
}

const OPPS_BASE: Array<Omit<StudioOpportunity, 'minGate' | 'weakGate'>> = [
  { n: 'Member secure-message triage', c: 'Member service', cost: 45000, val: 180000, h: 'quick', r: 'low', g: ['UDAAP', 'Model Risk'] },
  { n: 'AI adverse-action letter drafting', c: 'Lending', cost: 60000, val: 150000, h: 'quick', r: 'high', g: ['Adverse Action', 'UDAAP', 'Fair Lending'] },
  { n: 'Transaction-monitoring tuning assist', c: 'BSA / AML', cost: 120000, val: 330000, h: 'strategic', r: 'med', g: ['BSA/AML', 'Model Risk'] },
  { n: 'Loan-document summarization', c: 'Lending ops', cost: 35000, val: 150000, h: 'quick', r: 'low', g: ['Privacy'] },
  { n: 'Member FAQ chatbot', c: 'Member service', cost: 40000, val: 120000, h: 'quick', r: 'med', g: ['UDAAP', 'Model Risk'] },
  { n: 'Unified data foundation', c: 'Foundation', cost: 250000, val: 120000, h: 'strategic', r: 'low', g: ['InfoSec'], found: true },
  { n: 'Fraud model refresh', c: 'Fraud', cost: 90000, val: 260000, h: 'strategic', r: 'med', g: ['Model Risk'] },
  { n: 'Marketing personalization', c: 'Growth', cost: 30000, val: 110000, h: 'quick', r: 'med', g: ['Fair Lending', 'UDAAP'] },
  { n: 'Call-center copilot', c: 'Member service', cost: 50000, val: 200000, h: 'quick', r: 'low', g: ['Privacy'] },
  { n: 'SAR narrative drafting', c: 'BSA / AML', cost: 40000, val: 130000, h: 'quick', r: 'med', g: ['BSA/AML'] },
  { n: 'Vendor-risk automation', c: 'Governance', cost: 35000, val: 90000, h: 'quick', r: 'low', g: ['TPRM'] },
  { n: 'Deposit pricing optimization', c: 'Treasury', cost: 80000, val: 240000, h: 'strategic', r: 'med', g: ['Model Risk'] },
  { n: 'Underwriting assist', c: 'Lending', cost: 150000, val: 400000, h: 'strategic', r: 'high', g: ['Fair Lending', 'Adverse Action', 'Model Risk'] },
  { n: 'Complaint analytics', c: 'Member service', cost: 25000, val: 90000, h: 'quick', r: 'low', g: ['UDAAP'] },
  { n: 'Reason-code remediation program', c: 'Remediation', cost: 30000, val: 95000, h: 'quick', r: 'low', g: ['Govern'] },
];

/** Source line 1194: `function gateCalc(o){o.minGate=Math.min.apply(null,o.g.map(...));o.weakGate=o.g.slice().sort(...)[0];}` */
function gateCalc(o: Omit<StudioOpportunity, 'minGate' | 'weakGate'>): StudioOpportunity {
  const minGate = Math.min(...o.g.map((x) => CTRL[x] ?? 0));
  const weakGate = [...o.g].sort((a, b) => (CTRL[a] ?? 0) - (CTRL[b] ?? 0))[0] as string;
  return { ...o, minGate, weakGate };
}

/** The 15-play opportunity catalog, with `minGate`/`weakGate` computed exactly as source's `OPPS.forEach(gateCalc)` (line 1195). */
export const OPPS: StudioOpportunity[] = OPPS_BASE.map(gateCalc);

/* ============ GOV — control name -> governance gate description — source line 1196 ============ */

export const GOV: Record<string, string> = {
  'Govern': 'Governance charter + board sign-off',
  'Model Risk': 'Model validation & ongoing performance monitoring (2026-13)',
  'UDAAP': 'Fair-treatment review of all member-facing language',
  'Fair Lending': 'Disparate-impact / fair-lending testing on outcomes',
  'BSA/AML': 'BSA officer review + immutable audit-trail retention',
  'Privacy': 'GLBA / data-privacy review + PII-handling sign-off',
  'InfoSec': 'Security architecture review + least-privilege access',
  'TPRM': 'Third-party / vendor risk assessment (2023 guidance)',
  'Adverse Action': 'ECOA adverse-action reason-code accuracy testing',
};

/* ============ DETAIL — per-play detail cards — source lines 1197-1215 ============ */

export interface StudioPlayDetail {
  sum: string;
  work: string[];
  tech: string[];
  /** Play names this play depends on. Foreign keys into DETAIL — see survey_map.md §d-1. */
  deps: string[];
  /** Computed by source lines 1214-1215: play names whose `deps` list this play (reverse of `deps`). */
  unlocks: string[];
}

type DetailBase = Omit<StudioPlayDetail, 'unlocks'>;

const DETAIL_BASE: Record<string, DetailBase> = {
  'Member secure-message triage': { sum: 'Classifies and routes inbound secure messages, drafts suggested replies for agent approval, and auto-resolves the common requests.', work: ['Connect the secure-messaging queue via API with a PII-redaction layer', 'Train an intent classifier on the historical message corpus', 'Generate suggested replies with mandatory human-in-the-loop approval', 'Build routing rules + escalation thresholds', 'Wire the agent console and capture accept/edit feedback'], tech: ['Read access to the secure-messaging platform', 'Historical message corpus for training + evaluation', 'SSO and role-based agent console', 'DLP / PII redaction in the pipeline'], deps: [] },
  'AI adverse-action letter drafting': { sum: 'Drafts ECOA-compliant adverse-action notices from the decisioning record, with reason codes verified before anything reaches a member.', work: ['Map decision-engine outputs to ECOA reason codes', 'Draft generation with locked regulatory templates', 'Reason-code accuracy testing harness', 'Compliance-reviewer approval gate', 'Delivery + retention / audit logging'], tech: ['Structured access to loan-decision records', 'Reason-code taxonomy + approved letter templates', 'Document delivery + records-retention system'], deps: [] },
  'Transaction-monitoring tuning assist': { sum: 'Recommends threshold and scenario tuning for the BSA/AML monitoring system and explains each change for the BSA officer.', work: ['Ingest alert + case-disposition history', 'Model false-positive / productivity analysis', 'Threshold + scenario tuning recommendations with rationale', 'BSA-officer review + change-control workflow', 'Back-testing and model-monitoring loop'], tech: ['Access to the transaction-monitoring alert history', 'Case-disposition / SAR outcome data', 'Model-change control + versioning'], deps: ['Unified data foundation'] },
  'Loan-document summarization': { sum: 'Summarizes loan files and flags missing or inconsistent documents to speed processing.', work: ['Document ingestion + OCR for scanned files', 'Summarization + key-term extraction', 'Missing-doc / inconsistency flags', 'Reviewer UI in the loan-ops workflow'], tech: ['Access to the loan-document repository', 'OCR for scanned documents', 'Loan-origination system integration'], deps: [] },
  'Member FAQ chatbot': { sum: 'Answers common member questions in the digital channels from approved sources, with a clean handoff to a human.', work: ['Curate an approved knowledge base', 'Retrieval-grounded answering (no open generation)', 'Human-handoff + containment rules', 'Digital-channel integration + analytics'], tech: ['Approved knowledge-base content', 'Web / mobile channel integration', 'Escalation path to live agents'], deps: ['Member secure-message triage'] },
  'Unified data foundation': { sum: 'The shared, governed data foundation every downstream model draws on: the single dependency the strategic plays wait on.', work: ['Stand up the warehouse / lakehouse + ingestion', 'Model the core + conformed dimensions (member, account, transaction)', 'Data-quality + lineage controls', 'Access governance + PII tagging', 'Feature layer the models consume'], tech: ['Warehouse / lakehouse platform', 'Source-system connectors (core, LOS, cards, digital)', 'Data catalog + lineage tooling'], deps: [] },
  'Fraud model refresh': { sum: 'Retrains and recalibrates the fraud models on current patterns, with validation and monitoring.', work: ['Assemble a labeled fraud / non-fraud training set', 'Model retraining + calibration', 'Champion / challenger validation', 'Real-time scoring integration', 'Ongoing drift monitoring'], tech: ['Unified, current transaction + fraud-label data', 'Real-time scoring infrastructure', 'Model registry + monitoring'], deps: ['Unified data foundation'] },
  'Marketing personalization': { sum: 'Targets offers by predicted member need, with fair-lending guardrails on every audience.', work: ['Propensity / next-best-offer modeling', 'Fair-lending review of segments + offers', 'Campaign-platform integration', 'Outcome measurement + suppression rules'], tech: ['Unified member + product data', 'Marketing / campaign platform', 'Consent + suppression management'], deps: ['Unified data foundation'] },
  'Call-center copilot': { sum: 'Gives agents real-time answers and after-call summaries from approved sources during member calls.', work: ['Real-time transcription + retrieval', 'Approved-source answer surfacing', 'After-call summary + disposition draft', 'Telephony / CRM integration'], tech: ['Telephony + CRM integration', 'Approved knowledge base', 'Real-time transcription'], deps: [] },
  'SAR narrative drafting': { sum: 'Drafts SAR narratives from case evidence for BSA-analyst review; never auto-filed.', work: ['Assemble case evidence into a structured record', 'Narrative drafting against FinCEN expectations', 'Analyst review + edit gate', 'Filing-system handoff + retention'], tech: ['Access to case-management evidence', 'FinCEN narrative templates', 'Immutable audit trail + retention'], deps: ['Transaction-monitoring tuning assist'] },
  'Vendor-risk automation': { sum: 'Automates intake, questionnaire scoring, and monitoring for third-party risk.', work: ['Digitize the vendor questionnaire + intake', 'Automated document / score analysis', 'Risk-tier assignment + review workflow', 'Continuous monitoring signals'], tech: ['Vendor inventory + document store', 'Risk-rating framework', 'Alerting / monitoring feeds'], deps: [] },
  'Deposit pricing optimization': { sum: 'Recommends deposit rates by segment against elasticity and liquidity targets, with model governance.', work: ['Elasticity + balance-behavior modeling', 'Scenario / optimization engine', 'ALCO + model-risk review', 'Pricing-system integration + monitoring'], tech: ['Unified deposit + rate history', 'ALM / liquidity targets', 'Pricing-system integration'], deps: ['Unified data foundation'] },
  'Underwriting assist': { sum: 'Assists credit decisions with explainable models under strict fair-lending and adverse-action governance.', work: ['Explainable credit-risk modeling', 'Fair-lending + disparate-impact testing', 'Adverse-action reason-code alignment', 'Model validation + human decisioning gate', 'LOS integration + monitoring'], tech: ['Unified credit + bureau data', 'Loan-origination system integration', 'Model validation + monitoring stack'], deps: ['Unified data foundation', 'AI adverse-action letter drafting'] },
  'Reason-code remediation program': { sum: 'Closes the Circular 2026-C1 exposure the regulators are waiting on: model-derived adverse-action reason codes, tested for accuracy. Value is avoided findings and released gating on the lending plays.', work: ['Build the attribution-to-code matrix from model documentation', 'Accuracy testing harness against sampled files', 'Update the Adverse-Action Procedure (redline drafted in OnSide)', 'Quarterly verification cadence + evidence capture'], tech: ['Model attribution outputs', 'Sampled decision files for testing'], deps: [] },
  'Complaint analytics': { sum: 'Classifies and trends member complaints to surface UDAAP and product risks early.', work: ['Aggregate complaints across channels', 'Classification + root-cause tagging', 'UDAAP trend + early-warning dashboard', 'Routing to owners + closure tracking'], tech: ['Complaint data across channels', 'Taxonomy + tagging model', 'Reporting / dashboard layer'], deps: ['Unified data foundation'] },
};

/**
 * Per-play detail cards, keyed by play name (matches `OPPS[].n` verbatim —
 * survey_map.md §d-1). `unlocks` is computed exactly as source lines
 * 1214-1215: for every play, the set of other plays whose `deps` list it.
 */
export const DETAIL: Record<string, StudioPlayDetail> = (() => {
  const result: Record<string, StudioPlayDetail> = {};
  for (const name of Object.keys(DETAIL_BASE)) {
    result[name] = { ...(DETAIL_BASE[name] as DetailBase), unlocks: [] };
  }
  for (const name of Object.keys(result)) {
    for (const dep of (result[name] as StudioPlayDetail).deps) {
      const target = result[dep];
      if (target) target.unlocks.push(name);
    }
  }
  return result;
})();
