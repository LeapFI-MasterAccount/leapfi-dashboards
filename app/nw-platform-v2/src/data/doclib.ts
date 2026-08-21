/**
 * Document library data — ported VERBATIM from the read-only base demo
 * source: leapfi-dashboards/src/leapfi-platform.html `var DOCLIB={...}`
 * (lines 1930-2303, scaffold commit 5f37e99). Source is a fictional
 * NorthWinds Credit Union governance demo; all citations and legal
 * language are fabricated for the demo per survey_map.md §9.
 *
 * Do not summarize or rephrase entry text (title, line, secs, redline
 * old/nw) when editing this file — survey_map.md §d-8 marks the 8
 * redline entries' before/after language as load-bearing for the
 * Studio/OnSide Adopt→cascade demo flow (design_system_spec.md §5.3).
 *
 * HTML entities (`&amp;`, `&rsquo;`) are preserved verbatim from the
 * source exactly as authored there; the source renders these fields via
 * innerHTML, so the consuming component must decode them the same way
 * (e.g. render `t`/`line`/`secs`/`redline` text as HTML, not as raw
 * text) to reproduce the original output. See STOP-item in dispatch
 * evidence return.
 */

/** Governance domain the document belongs to (DOCLIB `dom`). */
export type DocDomain =
  | 'mrm'
  | 'tprm'
  | 'bsa'
  | 'fairlend'
  | 'consumer'
  | 'infosec'
  | 'aigov'
  | 'capital';

/** Document category (DOCLIB `type`). */
export type DocType =
  | 'Policy'
  | 'Standard'
  | 'Procedure'
  | 'Evidence'
  | 'Committee record'
  | 'Board record'
  | 'Draft'
  | 'Template'
  | 'Training';

/** Row/status posture (DOCLIB `status`). */
export type DocStatus = 'good' | 'warn' | 'crit';

/** One `[heading, body]` pair inside a document's `secs` section list. */
export type DocSection = [heading: string, body: string];

/**
 * A pending redline on a document: the proposed note plus the exact
 * before (`old`) / after (`nw`) legal language. Present only on the 8
 * load-bearing redline entries (survey_map.md §d-8).
 */
export interface DocRedline {
  note: string;
  old: string;
  nw: string;
  /**
   * Present only on `mrm-change-draft` (demo-narrator dispatch, boot-
   * state gap flagged against Story A step 3: "Rachel sees the OnSide
   * draft, what Priya changed" — a claim only provable if a second,
   * genuinely different text exists to diff against `nw`). Not read by
   * any runtime component: `case.lang` is what actually diverges from
   * `case.base` on-screen, and it diverges live, via the shipped
   * `save-language` action (`screens/Cases.tsx`'s `performAction` for
   * `kind === 'save-language'`) when the analyst-role presenter types
   * into `CaseDetail.tsx`'s free-text edit control at the `analyst`
   * stage — `case.base` stays `nw` (OnSide's original draft) and
   * `case.lang` becomes whatever text is typed there. This field is the
   * canonical, rehearsed text a presenter playing P. Raman (Risk
   * Analyst) types/pastes at that beat, so Story A's script quotes an
   * authored string instead of an ad-libbed one, and the diff Rachel
   * (R. Fischer, CRO) later reviews at the `cro` stage is reproducible
   * run to run. A credible small analyst refinement of `nw`, not a
   * rewrite — see the two edits documented at the `mrm-change-draft`
   * entry below.
   */
  analystEdit?: string;
}

/** A single document-library entry, keyed by id in {@link DOCLIB}. */
export interface DocEntry {
  /** Document title. */
  t: string;
  /** Version/date label. */
  v: string;
  dom: DocDomain;
  type: DocType;
  owner: string;
  status: DocStatus;
  /** One-line status/summary shown in the row. */
  line: string;
  /** Obligation ids this document evidences (may be empty). */
  obl: string[];
  secs: DocSection[];
  /** Present only on documents with a pending redline. */
  redline?: DocRedline;
  /**
   * Present only on `contract-rider` in the source data (source line
   * 2252, `staged:1`); marks a template pre-staged for rollout ahead of
   * full adoption. No other entry sets this field.
   */
  staged?: number;
}

/**
 * The document library: ~130 entries (153 as authored) spanning MRM,
 * TPRM, BSA, fair lending, consumer/UDAAP, infosec, AI governance, and
 * capital domains, including the 8 load-bearing redline entries.
 * Ported verbatim from survey_map.md-anchored source lines 1930-2303.
 */
export const DOCLIB: Record<string, DocEntry> = {
'mrm-val-tm':{t:'Model Validation Report · BSA Transaction Monitoring',v:'Mar 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · monitoring scenarios and thresholds',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the bsa transaction monitoring model (Tier 1, vendor). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Mar 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-uw':{t:'Model Validation Report · Consumer Underwriting Support',v:'Feb 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · discrimination, calibration, and fair-lending read-across',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the consumer underwriting support model (Tier 1, in-house). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Feb 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-cecl':{t:'Model Validation Report · CECL Allowance',v:'Jan 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · vendor model, Q4 close cycle',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the cecl allowance model (Tier 1, vendor). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Jan 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-alm':{t:'Model Validation Report · Asset-Liability / Interest-Rate Risk',v:'Nov 2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · rate-shock scenarios',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the asset-liability / interest-rate risk model (Tier 1, vendor). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Nov 2025 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-indirect':{t:'Model Validation Report · Indirect Auto Pricing',v:'Apr 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · pricing tiers and override analysis',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the indirect auto pricing model (Tier 2, in-house). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Apr 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-attrition':{t:'Model Validation Report · Deposit Attrition',v:'May 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'Validation complete · two observations open',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the deposit attrition model (Tier 2, in-house). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','Two observations: feature drift in the balance-trend inputs, and documentation of the retraining trigger. Both carry owners and are tracked to close in Q3.'],['Sign-off','Presented to the MRM Committee May 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-val-collections':{t:'Model Validation Report · Collections Prioritisation',v:'Jun 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · treatment assignment',obl:['MRM-04','MRM-06'],
 secs:[['Scope','Independent validation of the collections prioritisation model (Tier 2, in-house). Conceptual soundness, data quality, outcomes analysis, and implementation testing, performed independent of development per 2026-13 §IV.'],['Findings','No material findings. Discrimination and calibration sit within tolerance and the champion/challenger benchmark is documented.'],['Sign-off','Presented to the MRM Committee Jun 2026 and accepted. Next validation due on the tier cadence.']]},
'mrm-cs-fraud':{t:'Conceptual Soundness Documentation · Transaction Fraud Detection',v:'v2.0',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Theory, assumptions, limitations, and data lineage',obl:['MRM-05'],
 secs:[['Contents','The design rationale for the transaction fraud detection model: the question it answers, the theory behind the specification, the assumptions it rests on, the data lineage feeding it, and the limitations a user must understand before relying on an output.'],['Use','Written so an independent party can follow the model without the developer in the room, which is the standard 2026-13 §III sets.']]},
'mrm-cs-uw':{t:'Conceptual Soundness Documentation · Consumer Underwriting Support',v:'v2.0',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Theory, assumptions, limitations, and data lineage',obl:['MRM-05'],
 secs:[['Contents','The design rationale for the consumer underwriting support model: the question it answers, the theory behind the specification, the assumptions it rests on, the data lineage feeding it, and the limitations a user must understand before relying on an output.'],['Use','Written so an independent party can follow the model without the developer in the room, which is the standard 2026-13 §III sets.']]},
'mrm-cs-indirect':{t:'Conceptual Soundness Documentation · Indirect Auto Pricing',v:'v2.0',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Theory, assumptions, limitations, and data lineage',obl:['MRM-05'],
 secs:[['Contents','The design rationale for the indirect auto pricing model: the question it answers, the theory behind the specification, the assumptions it rests on, the data lineage feeding it, and the limitations a user must understand before relying on an output.'],['Use','Written so an independent party can follow the model without the developer in the room, which is the standard 2026-13 §III sets.']]},
'mrm-cs-attrition':{t:'Conceptual Soundness Documentation · Deposit Attrition',v:'v2.0',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Theory, assumptions, limitations, and data lineage',obl:['MRM-05'],
 secs:[['Contents','The design rationale for the deposit attrition model: the question it answers, the theory behind the specification, the assumptions it rests on, the data lineage feeding it, and the limitations a user must understand before relying on an output.'],['Use','Written so an independent party can follow the model without the developer in the room, which is the standard 2026-13 §III sets.']]},
'mrm-cs-collections':{t:'Conceptual Soundness Documentation · Collections Prioritisation',v:'v2.0',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Theory, assumptions, limitations, and data lineage',obl:['MRM-05'],
 secs:[['Contents','The design rationale for the collections prioritisation model: the question it answers, the theory behind the specification, the assumptions it rests on, the data lineage feeding it, and the limitations a user must understand before relying on an output.'],['Use','Written so an independent party can follow the model without the developer in the room, which is the standard 2026-13 §III sets.']]},
'mrm-out-q1-2026':{t:'Quarterly Outcomes Analysis Packet',v:'Q1-2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Back-testing across the tiered production set',obl:['MRM-06'],
 secs:[['Contents','Back-testing and outcomes analysis for every Tier 1 and Tier 2 production model: performance against expectation, override rates and their reasons, population stability, and drift indicators.'],['Result','All tiered models performed within tolerance for the quarter. Override analysis is reported to the MRM Committee with the packet.']]},
'mrm-out-q4-2025':{t:'Quarterly Outcomes Analysis Packet',v:'Q4-2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Back-testing across the tiered production set',obl:['MRM-06'],
 secs:[['Contents','Back-testing and outcomes analysis for every Tier 1 and Tier 2 production model: performance against expectation, override rates and their reasons, population stability, and drift indicators.'],['Result','All tiered models performed within tolerance for the quarter. Override analysis is reported to the MRM Committee with the packet.']]},
'mrm-out-q3-2025':{t:'Quarterly Outcomes Analysis Packet',v:'Q3-2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Back-testing across the tiered production set',obl:['MRM-06'],
 secs:[['Contents','Back-testing and outcomes analysis for every Tier 1 and Tier 2 production model: performance against expectation, override rates and their reasons, population stability, and drift indicators.'],['Result','All tiered models performed within tolerance for the quarter. Override analysis is reported to the MRM Committee with the packet.']]},
'mrm-out-q2-2025':{t:'Quarterly Outcomes Analysis Packet',v:'Q2-2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Back-testing across the tiered production set',obl:['MRM-06'],
 secs:[['Contents','Back-testing and outcomes analysis for every Tier 1 and Tier 2 production model: performance against expectation, override rates and their reasons, population stability, and drift indicators.'],['Result','All tiered models performed within tolerance for the quarter. Override analysis is reported to the MRM Committee with the packet.']]},
'mrm-mon-q2-2026':{t:'Production Monitoring &amp; Drift Report',v:'Q2-2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'2 production models still run without configured alerting',obl:['MRM-07'],
 secs:[['Contents','Drift, stability, and performance indicators for production models, with configured thresholds and the alerts raised in the quarter.'],['Open item','Two Tier 2 models run without configured alerting. Thresholds are proposed and awaiting the model owners&rsquo; sign-off, tracked as MRM-07.']]},
'mrm-mon-q1-2026':{t:'Production Monitoring &amp; Drift Report',v:'Q1-2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'2 production models still run without configured alerting',obl:['MRM-07'],
 secs:[['Contents','Drift, stability, and performance indicators for production models, with configured thresholds and the alerts raised in the quarter.'],['Open item','Two Tier 2 models run without configured alerting. Thresholds are proposed and awaiting the model owners&rsquo; sign-off, tracked as MRM-07.']]},
'mrm-mon-q4-2025':{t:'Production Monitoring &amp; Drift Report',v:'Q4-2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'2 production models still run without configured alerting',obl:['MRM-07'],
 secs:[['Contents','Drift, stability, and performance indicators for production models, with configured thresholds and the alerts raised in the quarter.'],['Open item','Two Tier 2 models run without configured alerting. Thresholds are proposed and awaiting the model owners&rsquo; sign-off, tracked as MRM-07.']]},
'mrm-vend-fraud':{t:'Vendor Model Documentation Packet · Transaction Fraud Detection',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Vendor validation evidence received and reviewed',obl:['MRM-08'],
 secs:[['Contents','The vendor&rsquo;s own validation report, methodology description, performance testing, and the limitations it discloses, reviewed against the standard we would apply to an in-house model.'],['Review','Reviewed and accepted. Where the vendor withholds detail, the gap is recorded and compensating monitoring is documented rather than assumed.']]},
'mrm-vend-cecl':{t:'Vendor Model Documentation Packet · CECL Allowance',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Vendor validation evidence received and reviewed',obl:['MRM-08'],
 secs:[['Contents','The vendor&rsquo;s own validation report, methodology description, performance testing, and the limitations it discloses, reviewed against the standard we would apply to an in-house model.'],['Review','Reviewed and accepted. Where the vendor withholds detail, the gap is recorded and compensating monitoring is documented rather than assumed.']]},
'mrm-vend-alm':{t:'Vendor Model Documentation Packet · Asset-Liability / Interest-Rate Risk',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Vendor validation evidence received and reviewed',obl:['MRM-08'],
 secs:[['Contents','The vendor&rsquo;s own validation report, methodology description, performance testing, and the limitations it discloses, reviewed against the standard we would apply to an in-house model.'],['Review','Reviewed and accepted. Where the vendor withholds detail, the gap is recorded and compensating monitoring is documented rather than assumed.']]},
'mrm-chg-2026':{t:'Model Change Log',v:'2026 YTD',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'Changes recorded · no formal approval gate yet',obl:['MRM-09'],
 secs:[['Contents','Every change to a production model in 2026: what changed, who made it, when it deployed, and the testing behind it.'],['Open item','Changes still deploy on developer sign-off. The formal approval gate is drafted and in the review queue as MRM-09.']]},
'mrm-chg-2025':{t:'Model Change Log',v:'2025',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Closed year · retained per the recordkeeping standard',obl:['MRM-09'],
 secs:[['Contents','The 2025 change record for production models, retained with the validation and monitoring evidence for the same period.']]},
'mrm-bench-fraud':{t:'Champion / Challenger Benchmark · Fraud',v:'Jun 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Challenger run alongside production for two quarters',obl:['MRM-06'],
 secs:[['Method','A challenger specification run in parallel with the production fraud model, scored on the same population, with the decision to retain or promote documented.'],['Result','Production retained. The challenger improved recall at an unacceptable false-positive cost to the member experience, and that trade-off is recorded.']]},
'mrm-bench-uw':{t:'Champion / Challenger Benchmark · Underwriting Support',v:'Mar 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Benchmark against the prior scorecard',obl:['MRM-04'],
 secs:[['Method','The underwriting support model scored against the prior scorecard on a held-out population, with fair-lending metrics reported alongside performance.']]},
'mrm-dq':{t:'Model Input Data Quality Assessment',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Completeness, accuracy, and timeliness of model inputs',obl:['MRM-01'],
 secs:[['Contents','Assessment of the data feeding tiered models: completeness, accuracy, timeliness, and lineage from the system of origin, with the controls each feed depends on.']]},
'mrm-euc':{t:'End-User Computing Sweep · Q2 2026',v:'Q2-2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'4 spreadsheet models found outside the inventory',obl:['MRM-02'],
 secs:[['Method','A sweep of business-unit spreadsheets and desktop tools for anything meeting the model definition in policy §2.'],['Result','Four end-user computing models identified that are not in the inventory. Owners have been notified and cataloguing is due September 2026, tracked as MRM-02.']]},
'mrm-retire':{t:'Model Retirement Record',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Two models retired with documentation retained',obl:['MRM-12'],
 secs:[['Contents','Retirement records for two models withdrawn from production: the decision, the replacement, the final performance record, and where the documentation is retained.']]},
'mrm-std-val':{t:'Model Validation Standard',v:'v3.0',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Depth and independence by tier',obl:['MRM-04'],
 secs:[['Requirement','Sets what validation must cover, who may perform it, and how depth scales with tier. Tier 1 requires full independent validation before deployment and on an annual cycle.']]},
'mrm-std-dev':{t:'Model Development Standard',v:'v2.1',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'How a model is built and documented',obl:['MRM-05'],
 secs:[['Requirement','Requirements for specification, data sourcing, testing, and documentation during development, so validation is not the first time anyone writes it down.']]},
'mrm-proc-change':{t:'Model Change Management Procedure',v:'v1.4',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Classification, testing, and rollback',obl:['MRM-09'],
 secs:[['Requirement','Classifies changes by materiality, sets the testing each class requires, and defines the rollback position. The approval gate this procedure anticipates is still in draft.']]},
'mrm-std-euc':{t:'End-User Computing Standard',v:'v1.2',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'When a spreadsheet becomes a model',obl:['MRM-02'],
 secs:[['Requirement','The test for whether a spreadsheet or desktop tool meets the model definition, and what happens when it does: inventory entry, owner, tier, and the controls that follow.']]},
'mrm-std-vendor':{t:'Vendor Model Risk Standard',v:'v2.0',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'What we require of a vendor model',obl:['MRM-08'],
 secs:[['Requirement','Diligence, documentation, and validation evidence required before a vendor model reaches production, and the compensating controls where a vendor withholds detail.']]},
'mrm-std-mon':{t:'Model Monitoring Standard',v:'v1.3',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Thresholds, cadence, and escalation',obl:['MRM-07'],
 secs:[['Requirement','Monitoring requirements by tier: which indicators, at what cadence, against which thresholds, and who is alerted when a threshold breaks.']]},
'mrm-std-dq':{t:'Model Data Quality Standard',v:'v1.1',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Requirements for model inputs',obl:['MRM-01'],
 secs:[['Requirement','Data quality requirements for model inputs, the lineage that must be documented, and the checks that run before a model consumes a feed.']]},
'mrm-proc-tier':{t:'Model Tiering Procedure',v:'v2.0',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'How a model is scored into a tier',obl:['MRM-03'],
 secs:[['Requirement','The scoring procedure behind the tiering matrix: materiality, complexity, and member impact, and who approves a tier assignment or a change to one.']]},
'mrm-proc-issue':{t:'Validation Issue Escalation Procedure',v:'v1.1',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Findings, owners, and due dates',obl:['MRM-10'],
 secs:[['Requirement','How validation findings are rated, assigned, tracked, and escalated when they age past their due date.']]},
'mrm-std-retire':{t:'Model Retirement Standard',v:'v1.0',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Withdrawal and record retention',obl:['MRM-12'],
 secs:[['Requirement','What must happen when a model leaves production: the decision record, the replacement, and how long the documentation is retained.']]},
'mrm-min-jul':{t:'MRM Committee Minutes',v:'Jul 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Validation results presented in the month, monitoring exceptions, the issue tracker, and vendor evidence outstanding.'],['Decisions','Recorded with the members present and the votes taken. Items carried forward appear on the following month&rsquo;s agenda.']]},
'mrm-min-may':{t:'MRM Committee Minutes',v:'May 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Validation results presented in the month, monitoring exceptions, the issue tracker, and vendor evidence outstanding.'],['Decisions','Recorded with the members present and the votes taken. Items carried forward appear on the following month&rsquo;s agenda.']]},
'mrm-min-apr':{t:'MRM Committee Minutes',v:'Apr 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Validation results presented in the month, monitoring exceptions, the issue tracker, and vendor evidence outstanding.'],['Decisions','Recorded with the members present and the votes taken. Items carried forward appear on the following month&rsquo;s agenda.']]},
'mrm-min-mar':{t:'MRM Committee Minutes',v:'Mar 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Validation results presented in the month, monitoring exceptions, the issue tracker, and vendor evidence outstanding.'],['Decisions','Recorded with the members present and the votes taken. Items carried forward appear on the following month&rsquo;s agenda.']]},
'mrm-min-feb':{t:'MRM Committee Minutes',v:'Feb 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Validation results presented in the month, monitoring exceptions, the issue tracker, and vendor evidence outstanding.'],['Decisions','Recorded with the members present and the votes taken. Items carried forward appear on the following month&rsquo;s agenda.']]},
'mrm-board-h2':{t:'Board Model Risk Summary',v:'H2-2025',dom:'mrm',type:'Board record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Semiannual aggregate reporting',obl:['MRM-10'],
 secs:[['Contents','Aggregate model risk posture for the half: validation coverage, open findings by age, tier migration, and the models entering or leaving production.']]},
'mrm-board-deep':{t:'Board Risk Committee · Model Risk Deep Dive',v:'Jun 2026',dom:'mrm',type:'Board record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Annual deep dive on the tiered set',obl:['MRM-10'],
 secs:[['Contents','The annual session on model risk: the inventory, what each Tier 1 model decides, where the institution relies on vendor models, and the interagency guidance the programme answers to.']]},
'mrm-train':{t:'Model Owner Training Attestation',v:'2026 cycle',dom:'mrm',type:'Training',owner:'A. Kaur · Model Risk Manager',status:'good',line:'All model owners current',obl:['MRM-12'],
 secs:[['Contents','Role-based training for model owners and validators covering the policy, the tiering test, monitoring duties, and what a model owner must escalate. Signed attestations on file for every owner in the inventory.']]},
'tprm-dd-core':{t:'Due Diligence Packet · Core Processing Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-digital':{t:'Due Diligence Packet · Digital Banking Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-cards':{t:'Due Diligence Packet · Card Processing &amp; Settlement',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-payments':{t:'Due Diligence Packet · ACH &amp; Wire Origination',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-los':{t:'Due Diligence Packet · Loan Origination System',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-collect':{t:'Due Diligence Packet · Collections Servicing',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-cloud':{t:'Due Diligence Packet · Cloud Infrastructure',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-mssp':{t:'Due Diligence Packet · Managed Security Services',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-fraud':{t:'Due Diligence Packet · Fraud Analytics',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-bsa':{t:'Due Diligence Packet · BSA Monitoring Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-dms':{t:'Due Diligence Packet · Document Management Estate',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-dd-hris':{t:'Due Diligence Packet · Payroll &amp; HRIS',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence · critical relationship',obl:['TPRM-03'],
 secs:[['Contents','Financial condition, security posture, resilience, insurance, regulatory history, and compliance capacity assessed before contract and refreshed on the critical cadence.'],['Scope note','Subcontractor dependencies are not covered. No fourth-party disclosures have been collected from any vendor, which is open as TPRM-06.']]},
'tprm-soc2-digital':{t:'Vendor SOC 2 Review Packet · Digital Banking Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-cards':{t:'Vendor SOC 2 Review Packet · Card Processing &amp; Settlement',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-payments':{t:'Vendor SOC 2 Review Packet · ACH &amp; Wire Origination',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-los':{t:'Vendor SOC 2 Review Packet · Loan Origination System',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-collect':{t:'Vendor SOC 2 Review Packet · Collections Servicing',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-cloud':{t:'Vendor SOC 2 Review Packet · Cloud Infrastructure',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-mssp':{t:'Vendor SOC 2 Review Packet · Managed Security Services',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-fraud':{t:'Vendor SOC 2 Review Packet · Fraud Analytics',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-bsa':{t:'Vendor SOC 2 Review Packet · BSA Monitoring Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-dms':{t:'Vendor SOC 2 Review Packet · Document Management Estate',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-soc2-hris':{t:'Vendor SOC 2 Review Packet · Payroll &amp; HRIS',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 reviewed against the vendor record',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report read for scope, period covered, exceptions, and the complementary user-entity controls it assumes we operate.'],['Result','Exceptions triaged against our own control set. CUECs confirmed in place, or the gap recorded where they are not.']]},
'tprm-qr-q1-2026':{t:'Quarterly Vendor Review Packet',v:'Q1-2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Ongoing monitoring · critical and moderate tiers',obl:['TPRM-05'],
 secs:[['Contents','Performance against service levels, security attestations, incident history, and a financial-condition refresh for every critical and moderate relationship in the quarter.']]},
'tprm-qr-q4-2025':{t:'Quarterly Vendor Review Packet',v:'Q4-2025',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Ongoing monitoring · critical and moderate tiers',obl:['TPRM-05'],
 secs:[['Contents','Performance against service levels, security attestations, incident history, and a financial-condition refresh for every critical and moderate relationship in the quarter.']]},
'tprm-qr-q3-2025':{t:'Quarterly Vendor Review Packet',v:'Q3-2025',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Ongoing monitoring · critical and moderate tiers',obl:['TPRM-05'],
 secs:[['Contents','Performance against service levels, security attestations, incident history, and a financial-condition refresh for every critical and moderate relationship in the quarter.']]},
'tprm-fin-core':{t:'Financial Condition Review · Core Processing Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Assessed against the institution&rsquo;s thresholds',obl:['TPRM-05'],
 secs:[['Method','Audited statements, liquidity and leverage against our thresholds, going-concern language, and ownership changes in the period.'],['Result','Within threshold. Any breach would raise an exception to the relationship owner rather than sit in a report nobody reads.']]},
'tprm-fin-digital':{t:'Financial Condition Review · Digital Banking Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Assessed against the institution&rsquo;s thresholds',obl:['TPRM-05'],
 secs:[['Method','Audited statements, liquidity and leverage against our thresholds, going-concern language, and ownership changes in the period.'],['Result','Within threshold. Any breach would raise an exception to the relationship owner rather than sit in a report nobody reads.']]},
'tprm-fin-payments':{t:'Financial Condition Review · ACH &amp; Wire Origination',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Assessed against the institution&rsquo;s thresholds',obl:['TPRM-05'],
 secs:[['Method','Audited statements, liquidity and leverage against our thresholds, going-concern language, and ownership changes in the period.'],['Result','Within threshold. Any breach would raise an exception to the relationship owner rather than sit in a report nobody reads.']]},
'tprm-fin-cloud':{t:'Financial Condition Review · Cloud Infrastructure',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Assessed against the institution&rsquo;s thresholds',obl:['TPRM-05'],
 secs:[['Method','Audited statements, liquidity and leverage against our thresholds, going-concern language, and ownership changes in the period.'],['Result','Within threshold. Any breach would raise an exception to the relationship owner rather than sit in a report nobody reads.']]},
'tprm-bcp-core':{t:'Business Resiliency Assessment · Core Processing Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Continuity and recovery against the criticality tier',obl:['TPRM-05'],
 secs:[['Method','Recovery objectives, tested failover, dependency mapping, and the vendor&rsquo;s own continuity testing evidence, assessed against the tier we assigned the relationship.'],['Result','Recovery objectives align to our tier requirement. Test evidence is on file for the period.']]},
'tprm-bcp-digital':{t:'Business Resiliency Assessment · Digital Banking Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Continuity and recovery against the criticality tier',obl:['TPRM-05'],
 secs:[['Method','Recovery objectives, tested failover, dependency mapping, and the vendor&rsquo;s own continuity testing evidence, assessed against the tier we assigned the relationship.'],['Result','Recovery objectives align to our tier requirement. Test evidence is on file for the period.']]},
'tprm-bcp-payments':{t:'Business Resiliency Assessment · ACH &amp; Wire Origination',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Continuity and recovery against the criticality tier',obl:['TPRM-05'],
 secs:[['Method','Recovery objectives, tested failover, dependency mapping, and the vendor&rsquo;s own continuity testing evidence, assessed against the tier we assigned the relationship.'],['Result','Recovery objectives align to our tier requirement. Test evidence is on file for the period.']]},
'tprm-bcp-cloud':{t:'Business Resiliency Assessment · Cloud Infrastructure',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Continuity and recovery against the criticality tier',obl:['TPRM-05'],
 secs:[['Method','Recovery objectives, tested failover, dependency mapping, and the vendor&rsquo;s own continuity testing evidence, assessed against the tier we assigned the relationship.'],['Result','Recovery objectives align to our tier requirement. Test evidence is on file for the period.']]},
'tprm-bcp-mssp':{t:'Business Resiliency Assessment · Managed Security Services',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Continuity and recovery against the criticality tier',obl:['TPRM-05'],
 secs:[['Method','Recovery objectives, tested failover, dependency mapping, and the vendor&rsquo;s own continuity testing evidence, assessed against the tier we assigned the relationship.'],['Result','Recovery objectives align to our tier requirement. Test evidence is on file for the period.']]},
'tprm-con-core':{t:'Executed Contract Record · Core Processing Platform',v:'Current term',dom:'tprm',type:'Evidence',owner:'D. Reyes · General Counsel',status:'warn',line:'Risk clauses present · model-risk clauses pending renewal',obl:['TPRM-04'],
 secs:[['Contents','The executed agreement and its riders: audit rights, performance measures, incident-notification duties, subcontractor disclosure, termination and data-return provisions.'],['Open items','Incident-notification service levels are not specified, open as TPRM-11. Where the relationship carries a model, the 2026-13 clauses roll in at renewal, open as TPRM-04.']]},
'tprm-con-digital':{t:'Executed Contract Record · Digital Banking Platform',v:'Current term',dom:'tprm',type:'Evidence',owner:'D. Reyes · General Counsel',status:'warn',line:'Risk clauses present · model-risk clauses pending renewal',obl:['TPRM-04'],
 secs:[['Contents','The executed agreement and its riders: audit rights, performance measures, incident-notification duties, subcontractor disclosure, termination and data-return provisions.'],['Open items','Incident-notification service levels are not specified, open as TPRM-11. Where the relationship carries a model, the 2026-13 clauses roll in at renewal, open as TPRM-04.']]},
'tprm-con-payments':{t:'Executed Contract Record · ACH &amp; Wire Origination',v:'Current term',dom:'tprm',type:'Evidence',owner:'D. Reyes · General Counsel',status:'warn',line:'Risk clauses present · model-risk clauses pending renewal',obl:['TPRM-04'],
 secs:[['Contents','The executed agreement and its riders: audit rights, performance measures, incident-notification duties, subcontractor disclosure, termination and data-return provisions.'],['Open items','Incident-notification service levels are not specified, open as TPRM-11. Where the relationship carries a model, the 2026-13 clauses roll in at renewal, open as TPRM-04.']]},
'tprm-con-los':{t:'Executed Contract Record · Loan Origination System',v:'Current term',dom:'tprm',type:'Evidence',owner:'D. Reyes · General Counsel',status:'warn',line:'Risk clauses present · model-risk clauses pending renewal',obl:['TPRM-04'],
 secs:[['Contents','The executed agreement and its riders: audit rights, performance measures, incident-notification duties, subcontractor disclosure, termination and data-return provisions.'],['Open items','Incident-notification service levels are not specified, open as TPRM-11. Where the relationship carries a model, the 2026-13 clauses roll in at renewal, open as TPRM-04.']]},
'tprm-qn-collect':{t:'Vendor Risk Questionnaire · Collections Servicing',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Returned, reviewed, and filed',obl:['TPRM-03'],
 secs:[['Contents','The vendor&rsquo;s returned questionnaire on security, privacy, resilience, personnel screening, and use of AI in the service, with the evidence attached to each answer.']]},
'tprm-qn-fraud':{t:'Vendor Risk Questionnaire · Fraud Analytics',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Returned, reviewed, and filed',obl:['TPRM-03'],
 secs:[['Contents','The vendor&rsquo;s returned questionnaire on security, privacy, resilience, personnel screening, and use of AI in the service, with the evidence attached to each answer.']]},
'tprm-qn-bsa':{t:'Vendor Risk Questionnaire · BSA Monitoring Platform',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Returned, reviewed, and filed',obl:['TPRM-03'],
 secs:[['Contents','The vendor&rsquo;s returned questionnaire on security, privacy, resilience, personnel screening, and use of AI in the service, with the evidence attached to each answer.']]},
'tprm-qn-dms':{t:'Vendor Risk Questionnaire · Document Management Estate',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Returned, reviewed, and filed',obl:['TPRM-03'],
 secs:[['Contents','The vendor&rsquo;s returned questionnaire on security, privacy, resilience, personnel screening, and use of AI in the service, with the evidence attached to each answer.']]},
'tprm-att-q2-2026':{t:'Relationship Owner Monitoring Attestation',v:'Q2-2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Signed by each critical relationship owner',obl:['TPRM-05'],
 secs:[['Contents','Each critical relationship owner attests that monitoring was performed for the quarter, states what changed, and confirms whether any threshold was breached.']]},
'tprm-att-q1-2026':{t:'Relationship Owner Monitoring Attestation',v:'Q1-2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Signed by each critical relationship owner',obl:['TPRM-05'],
 secs:[['Contents','Each critical relationship owner attests that monitoring was performed for the quarter, states what changed, and confirms whether any threshold was breached.']]},
'tprm-att-q4-2025':{t:'Relationship Owner Monitoring Attestation',v:'Q4-2025',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Signed by each critical relationship owner',obl:['TPRM-05'],
 secs:[['Contents','Each critical relationship owner attests that monitoring was performed for the quarter, states what changed, and confirms whether any threshold was breached.']]},
'tprm-att-q3-2025':{t:'Relationship Owner Monitoring Attestation',v:'Q3-2025',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Signed by each critical relationship owner',obl:['TPRM-05'],
 secs:[['Contents','Each critical relationship owner attests that monitoring was performed for the quarter, states what changed, and confirms whether any threshold was breached.']]},
'tprm-off-legacy-print':{t:'Termination &amp; Offboarding Record · Statement Print Vendor',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'warn',line:'Data return confirmed · no documented exit plan preceded it',obl:['TPRM-08'],
 secs:[['Contents','The termination record for a non-critical relationship: notice, data return and destruction certification, and access revocation.'],['Open item','No exit plan existed before termination. Exit planning for critical relationships remains open as TPRM-08.']]},
'tprm-off-legacy-scan':{t:'Termination &amp; Offboarding Record · Records Scanning Vendor',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'warn',line:'Data return confirmed · no documented exit plan preceded it',obl:['TPRM-08'],
 secs:[['Contents','The termination record for a non-critical relationship: notice, data return and destruction certification, and access revocation.'],['Open item','No exit plan existed before termination. Exit planning for critical relationships remains open as TPRM-08.']]},
'tprm-inv-hist':{t:'Vendor Inventory · Change History',v:'2026 YTD',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Additions, tier changes, and terminations',obl:['TPRM-01'],
 secs:[['Contents','Every change to the vendor inventory in the year: relationships added, tiers reassigned, and relationships terminated, with who approved each.']]},
'tprm-tier-method':{t:'Criticality Tiering Assessment',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'87 relationships scored · 12 critical',obl:['TPRM-02'],
 secs:[['Method','Every relationship scored on member impact, data sensitivity, substitutability, and regulatory exposure, producing the critical designation set.'],['Result','Twelve relationships support critical activities. The remaining 75 sit at moderate or low with monitoring scaled accordingly.']]},
'tprm-ai-use':{t:'Vendor AI Use Register',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'warn',line:'9 vendors report AI in the service · 2 attestations outstanding',obl:['TPRM-03'],
 secs:[['Contents','Which vendors use AI in delivering the service, what it does, whether it touches member data, and what the contract says about it.'],['Open item','Two vendors have not returned a data-handling attestation. Both are moderate tier and are being chased.']]},
'tprm-issues':{t:'Third-Party Issue Tracker',v:'Live register',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'warn',line:'6 open items across 4 relationships',obl:['TPRM-12'],
 secs:[['Contents','Issues raised from reviews, incidents, and attestations, with owner, severity, due date, and the evidence that closes each one.']]},
'tprm-std-class':{t:'Vendor Classification Standard',v:'v2.0',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'How a relationship is tiered',obl:['TPRM-02'],
 secs:[['Requirement','The criteria that put a relationship in a tier, who approves the designation, and what monitoring each tier attracts.']]},
'tprm-proc-onb':{t:'Vendor Onboarding Procedure',v:'v2.2',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'From request to executed contract',obl:['TPRM-03'],
 secs:[['Requirement','The path a new relationship follows: business case, diligence scaled to tier, contract review, security review, and the approvals required before signature.']]},
'tprm-std-mon':{t:'Ongoing Monitoring Standard',v:'v1.4',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'Cadence and content by tier',obl:['TPRM-05'],
 secs:[['Requirement','What monitoring each tier requires, at what cadence, and what triggers a review outside the cycle: an incident, an ownership change, or a SOC 2 exception.']]},
'tprm-tmpl-qn':{t:'Vendor Risk Questionnaire Template',v:'v3.1',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'The standard question set',obl:['TPRM-03'],
 secs:[['Requirement','The questionnaire issued to vendors, scaled by tier, covering security, privacy, resilience, personnel, subcontracting, and AI use.']]},
'tprm-proc-off':{t:'Offboarding Procedure',v:'v1.2',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'Termination and data return',obl:['TPRM-12'],
 secs:[['Requirement','What happens when a relationship ends: notice, data return and destruction, access revocation, and the evidence retained.']]},
'tprm-proc-esc':{t:'Third-Party Issue Escalation Procedure',v:'v1.1',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'Severity, owners, and escalation',obl:['TPRM-09'],
 secs:[['Requirement','How third-party issues are rated and escalated, and when a finding reaches the Board Risk Committee rather than staying with the relationship owner.']]},
'tprm-board-q1-2026':{t:'Board Risk Committee Minutes · TPRM Standing Item',v:'Mar 2026',dom:'tprm',type:'Board record',owner:'Board Risk Committee',status:'good',line:'Quarterly third-party risk report',obl:['TPRM-09'],
 secs:[['Contents','The quarterly third-party report: critical-vendor posture, concentration notes, open issues, and pending contract actions.']]},
'tprm-board-q4-2025':{t:'Board Risk Committee Minutes · TPRM Standing Item',v:'Dec 2025',dom:'tprm',type:'Board record',owner:'Board Risk Committee',status:'good',line:'Quarterly third-party risk report',obl:['TPRM-09'],
 secs:[['Contents','The quarterly third-party report: critical-vendor posture, concentration notes, open issues, and pending contract actions.']]},
'tprm-review-2025':{t:'Independent Review of the TPRM Program',v:'2025',dom:'tprm',type:'Board record',owner:'P. Nguyen · ISD',status:'warn',line:'Last independent review · 2026 review not yet scheduled',obl:['TPRM-10'],
 secs:[['Contents','Independent review of the programme against the 2023 Interagency Guidance: governance, diligence depth, contract coverage, monitoring, and records.'],['Open item','The 2026 review has not been scheduled, which is open as TPRM-10.']]},
'tprm-train-owner':{t:'Relationship Owner Training Attestation',v:'2026 cycle',dom:'tprm',type:'Training',owner:'P. Nguyen · ISD',status:'good',line:'All critical relationship owners current',obl:['TPRM-12'],
 secs:[['Contents','Training for relationship owners covering diligence duties, monitoring obligations, incident escalation, and what must be evidenced.']]},
'tprm-train-proc':{t:'Procurement &amp; Contracting Training',v:'2026 cycle',dom:'tprm',type:'Training',owner:'D. Reyes · General Counsel',status:'good',line:'Procurement and business-line staff',obl:['TPRM-04'],
 secs:[['Contents','Training for anyone who can start a vendor relationship: what triggers the process, which clauses are non-negotiable, and why a signature outside the process is a finding.']]},

'fairness-bia':{t:'Fairness &amp; Bias Impact Assessment',v:'2026 cycle',dom:'aigov',type:'Evidence',owner:'R. Fischer · CRO',status:'warn',line:'8 of 11 member-facing systems assessed · 3 scheduled for Q3',obl:[],
 secs:[['Method','Each system that informs a member-facing decision is assessed for fairness exposure: the outcome it influences, the attributes it uses, proxy risk in those attributes, measured disparity across protected classes, and what the institution does when a threshold is breached.'],
 ['Results','No disparity above threshold in the assessed set. Two systems carry watch items on proxy features, both under quarterly re-test. The underwriting-support model carries the tightest thresholds because its outcome is closest to a credit decision.'],
 ['Open item','Three systems entered the inventory this quarter and have not been assessed yet. Owners are assigned and the assessments are scheduled before the systems reach production.'],
 ['Use','The assessment is what the board and the exam file see. It feeds the Fair Lending register and the adverse-action reason-code work directly.']]},
'hitl-standard':{t:'Human-in-the-Loop Decision Authority Standard',v:'v1.4',dom:'aigov',type:'Standard',owner:'R. Fischer · CRO',status:'good',line:'Checkpoints enforced by system tier · reviewed with the charter',obl:[],
 secs:[['Requirement','Where fairness or consumer-impact risk requires human decision authority, a named person decides. The system may recommend, rank, or draft. It may not be the final authority on the outcome.'],
 ['Where it applies','Every Tier 1 system: credit decisioning support, adverse-action reasoning, collections treatment, fraud dispositions that close a member account, and any automated member communication about fees, disputes, or account actions.'],
 ['Evidence','Each checkpoint logs who decided, when, on what information, and whether they departed from the recommendation. Override rates are reviewed quarterly, because an approval rate near 100% means the checkpoint is not doing work.']]},
'ai-inventory':{t:'AI System Inventory & Use-Case Register',v:'Live register',dom:'aigov',type:'Evidence',owner:'R. Fischer · CRO',status:'good',line:'23 systems catalogued · tier and owner assigned to each',obl:[],
 secs:[['Contents','Every AI and automated decision system in operation, with business owner, purpose, member impact, data touched, vendor or in-house build, governance tier, and the date of the last review.'],
 ['Tiering','Tier 1 covers systems that inform member-facing decisions. Tier 2 covers systems that inform staff judgement. Tier 3 covers internal productivity use with no member impact. Depth of governance follows the tier.'],
 ['Reconciliation','The register reconciles monthly against the model inventory held by Model Risk, so a system cannot be governed as an AI use case and be missing from the model record.']]},
'ai-committee':{t:'AI Governance Committee Minutes',v:'Jul 2026',dom:'aigov',type:'Committee record',owner:'R. Fischer · CRO',status:'good',line:'Monthly session · quorum met · CEO and CCO present',obl:[],
 secs:[['Agenda','Three new use cases presented for tier assignment. Review of the member-messaging disclosure draft. Status of the CRI control crosswalk. Watchlist update on S. 4127 and the interagency RFI.'],
 ['Decisions','Approved two use cases at Tier 2 and held one at Tier 1 pending a fair-lending impact review. Directed that the disclosure standard return with UDAAP sign-off before adoption.'],
 ['Escalation','Nothing rose to the Board this cycle. The standing quarterly AI risk summary remains on the Board Risk Committee calendar.']]},
'ai-training':{t:'AI Acceptable Use Training Attestation',v:'2026 cycle',dom:'aigov',type:'Training',owner:'R. Fischer · CRO',status:'good',line:'96% completion · role-based modules · board module delivered',obl:[],
 secs:[['Contents','Completion records and signed attestations for the AI acceptable use curriculum, tracked by role. Lending and member service staff take the extended module covering disclosure and escalation duties.'],
 ['Coverage','Board members completed the governance briefing in May. Contractors with system access are enrolled through the vendor onboarding path.'],
 ['Open item','Eleven staff remain outstanding at cycle close. Managers were notified and completion is tracked to a September deadline.']]},
'bcp-dr':{t:'Business Continuity & Disaster Recovery Plan',v:'v6.1',dom:'infosec',type:'Policy',owner:'P. Nguyen · ISD',status:'good',line:'Annual tabletop exercise complete · Mar 2026',obl:[],
 secs:[['1. Scope','Recovery objectives and procedures for core processing, digital banking, payments, and member contact channels, with dependencies mapped to the critical vendor set.'],
 ['2. Objectives','Recovery time and recovery point objectives are set per business process and tested against them, not asserted. Results feed the annual plan revision.'],
 ['3. Exercise results','The March tabletop covered core processor degradation and a ransomware containment scenario. Two process gaps were identified in member communication sequencing and both were closed in this version.']]},
'pentest':{t:'Annual Penetration Test & Remediation Tracker',v:'2026',dom:'infosec',type:'Evidence',owner:'P. Nguyen · ISD',status:'warn',line:'2 medium findings open · remediation due Sep 2026',obl:[],
 secs:[['Scope','External perimeter, digital banking application, internal network segmentation, and a social engineering component, performed by an independent firm in April.'],
 ['Results','No critical or high findings. Four medium findings, two of which are closed and verified. The two open items concern session handling in a secondary portal and a legacy service account scope.'],
 ['Tracking','Each finding carries an owner, a due date, and re-test evidence on closure. Aggregate status reports to the Board Risk Committee quarterly.']]},
'sar-qa':{t:'SAR Quality Assurance Review',v:'Q2-2026',dom:'bsa',type:'Evidence',owner:'T. Whitfield · BSA Officer',status:'good',line:'Sampled review complete · timeliness within requirement',obl:[],
 secs:[['Method','A sample of filed suspicious activity reports is reviewed each quarter for narrative sufficiency, supporting documentation, decision rationale, and filing timeliness.'],
 ['Results','All sampled filings met the 30-day requirement. Narrative quality was rated adequate or better throughout, with coaching notes issued on two files for supporting detail.'],
 ['Linkage','Alert disposition quality feeds the transaction monitoring tuning record, which is where the model validation obligation picks it up.']]},
'ofac-test':{t:'OFAC Screening Independent Test',v:'2026',dom:'bsa',type:'Evidence',owner:'T. Whitfield · BSA Officer',status:'warn',line:'Threshold tuning recommended · action plan agreed',obl:[],
 secs:[['Scope','Independent test of the sanctions screening configuration covering list currency, name matching logic, batch and real-time coverage, and alert disposition quality.'],
 ['Findings','List updates applied same day throughout the period. The test recommends tuning the fuzzy match threshold, which currently produces a false positive rate above peer benchmark and slows disposition.'],
 ['Action','Tuning is scheduled with the vendor for Q3, with a before and after effectiveness comparison retained as evidence. No missed matches were identified.']]},
'rege-proc':{t:'Regulation E Error Resolution Procedure',v:'v3.2',dom:'consumer',type:'Procedure',owner:'M. Okafor · CCO',status:'warn',line:'Provisional credit timing under revision · see redline',obl:[],
 secs:[['1. Requirement','Investigation and resolution of member-reported electronic transfer errors within the timeframes set by Regulation E, including provisional credit where the investigation extends.'],
 ['2. Intake','Errors are accepted through any channel the member uses, including automated channels, and are logged to the complaint record on receipt.'],
 ['3. Open item','Where an automated channel takes the first report, the clock start currently depends on staff transcription. That dependency is being removed.']],
 redline:{note:'Proposed revision to §2 · error clock start for automated intake channels · drafted by OnSide',
  old:'The investigation period begins when a representative logs the reported error to the complaint record.',
  nw:'The investigation period begins on the member&rsquo;s first report through any channel, including automated chat and messaging, timestamped at receipt by the channel itself. Automated intake creates the complaint record directly, and staff review confirms rather than starts the clock.'}},
'hmda-lar':{t:'HMDA LAR Data Integrity Review',v:'2026 submission',dom:'fairlend',type:'Evidence',owner:'M. Okafor · CCO',status:'good',line:'Pre-submission scrub complete · error rate within tolerance',obl:[],
 secs:[['Method','A sampled field-by-field review of the loan application register against source documents, run before submission and again after any resubmission.'],
 ['Results','The sampled error rate sits within the resubmission threshold. Corrections were concentrated in rate spread and action taken date, both traced to a single intake workflow that has been amended.'],
 ['Use','The register feeds the quarterly fair lending comparative review, so data integrity here is a precondition for the analysis there.']]},
'cblr-worksheet':{t:'CBLR Calculation Worksheet & Sign-off',v:'Q2-2026',dom:'capital',type:'Evidence',owner:'CFO office',status:'good',line:'Independently reviewed · reconciles to the call report',obl:[],
 secs:[['Contents','The quarter-end leverage ratio calculation with supporting balances, the qualifying criteria check, and the preparer and reviewer sign-off.'],
 ['Control','A second reviewer independent of the preparer reconciles the worksheet to the filed call report before sign-off. Variances above tolerance are documented with explanation.'],
 ['Position','The ratio sits well above the qualifying threshold, with prompt corrective action headroom reported in the capital narrative each quarter.']]},

'mrm-policy':{t:'Model Risk Management Policy',v:'v3.1',dom:'mrm',type:'Policy',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Approved by Board Risk Committee · Jul 14, 2026 · annual review Jul 2027',obl:['MRM-01','MRM-03','MRM-12'],
 secs:[['1. Purpose','Establishes the framework for identifying, measuring, monitoring, and controlling model risk across the Credit Union, aligned to Interagency Guidance 2026-13.'],
 ['2. Scope','Applies to all models as defined in §II of 2026-13, including AI/ML and vendor-supplied models used in decisioning, valuation, fraud, and monitoring.'],
 ['3. Governance','The Model Risk Manager maintains the inventory and tiering. The MRM Committee approves validations, and aggregate model risk goes to the Board semiannually.']]},
'mrm-validation-fraud':{t:'Model Validation Report · Fraud Model',v:'Jun 2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Independent validation · champion/challenger complete',obl:['MRM-04','MRM-06'],
 secs:[['Summary','Independent validation of the transaction fraud model: conceptual soundness confirmed, discrimination and calibration within tolerance, champion/challenger benchmark documented.'],
 ['Findings','Two low-severity observations on feature documentation; remediation owners assigned, due Q3-2026.'],
 ['Sign-off','Validated independent of development per 2026-13 §IV; results presented to MRM Committee Jun 18, 2026.']]},
'mrm-minutes':{t:'MRM Committee Minutes',v:'Jun 2026',dom:'mrm',type:'Committee record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Standing monthly session · quorum met',obl:['MRM-10'],
 secs:[['Agenda','Fraud model validation results; drift-threshold configuration for two production models; vendor validation evidence requests; RFI 2026-04 comment draft.'],
 ['Decisions','Approved the fraud model validation; directed follow-up on three outstanding vendor validation packets (MRM-08); endorsed pre-staged generative-model language for the charter.']]},
'tiering':{t:'Model Tiering Matrix',v:'2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Reviewed with 2026-13 adoption',obl:['MRM-03'],
 secs:[['Method','Models tiered by materiality and complexity; requirements for validation depth, monitoring cadence, and documentation scale with tier per 2026-13 §III.B.']]},
'inv-log':{t:'Model Inventory & Change Log',v:'Live register',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'4 shadow / spreadsheet models pending cataloguing',obl:['MRM-02'],
 secs:[['Contents','Enterprise model inventory: owner, purpose, data touched, tier, validation status, and change history for every model in scope.'],
 ['Open item','Four end-user computing models identified in the Q2 sweep are not yet catalogued; owners notified, due Sep 2026.']]},
'outcomes':{t:'Quarterly Outcomes Analysis Packet',v:'Q2-2026',dom:'mrm',type:'Evidence',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Back-testing on defined cadence',obl:['MRM-06'],
 secs:[['Summary','Back-testing and outcomes analysis for tiered production models: performance vs expectation, override analysis, and drift indicators per 2026-13 §IV.C.']]},
'doc-standard':{t:'Model Documentation Standard',v:'v2.3',dom:'mrm',type:'Standard',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Applies to all tiers',obl:['MRM-12'],
 secs:[['Requirement','Documentation must let an independent party understand model operation, limitations, and assumptions without developer assistance.']]},
'board-mrm':{t:'Board Model Risk Summary',v:'H1-2026',dom:'mrm',type:'Board record',owner:'A. Kaur · Model Risk Manager',status:'good',line:'Semiannual aggregate reporting',obl:['MRM-10'],
 secs:[['Contents','Aggregate model risk posture, validation coverage, open findings, and tier migration reported to the Board Risk Committee per 2026-13 §VII.']]},
'gen-ai-draft':{t:'Generative Model Governance · Pre-staged Language',v:'Draft 0.9',dom:'mrm',type:'Draft',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'In HITL review queue · awaiting RFI 2026-04 scope',obl:['MRM-11'],
 secs:[['Status','Interim governance language for generative and agentic models, pre-staged so the charter update ships the day the interagency scope finalizes.']],
 redline:{note:'Proposed insertion into the Model Risk Management Policy §2 (Scope) · pending RFI 2026-04 outcome',
  old:'Scope excludes exploratory analytics tools not used in decisioning.',
  nw:'Scope includes generative and agentic AI systems whose outputs inform member-facing decisions or regulatory processes, subject to interim governance in Appendix D until interagency scope is finalized.'}},
'mrm-change-draft':{t:'Model Change Approval Workflow',v:'Draft 0.8',dom:'mrm',type:'Draft',owner:'A. Kaur · Model Risk Manager',status:'warn',line:'In HITL review queue · language drafted',obl:['MRM-09'],
 secs:[['Status','Formal approval gate for model changes before deployment: change classification, required approvals by tier, and rollback provisions.']],
 redline:{note:'Proposed insertion into the Model Risk Management Policy §3 (Governance) · closes MRM-09 · drafted by OnSide',
  old:'Model owners deploy changes to production models under existing change-management procedures.',
  nw:'No change to a tiered production model reaches production without classification by materiality, approval at the level its tier requires, a documented rollback position, and a record of the approval in the model inventory. Immaterial changes are logged and reviewed in aggregate at the next MRM Committee.',
  analystEdit:'No change to a tiered production model reaches production without classification by materiality, approval at the level its tier requires under the Model Tiering Matrix, a documented, tested rollback position, and a record of the approval in the model inventory. Immaterial changes are logged and reviewed in aggregate at the next scheduled MRM Committee meeting.'}},
'tprm-program':{t:'Third-Party Risk Management Program',v:'v2.0',dom:'tprm',type:'Policy',owner:'P. Nguyen · ISD',status:'warn',line:'Exit-planning section in draft · see redline',obl:['TPRM-01','TPRM-03','TPRM-05','TPRM-12'],
 secs:[['1. Purpose','Establishes lifecycle risk management for third-party relationships per the 2023 Interagency Guidance: planning, due diligence, contracting, monitoring, and termination.'],
 ['2. Risk-based approach','Oversight intensity scales with the risk and criticality of each relationship; critical activities receive board-level visibility.'],
 ['3. Ongoing monitoring','Quarterly reviews for critical vendors; annual for moderate; triggered reviews on incident, ownership change, or SOC 2 exception.']],
 redline:{note:'Proposed new §6 · Termination & exit planning (TPRM-08) · drafted by OnSide, in HITL review',
  old:'(no existing section: exit planning handled ad hoc at contract end)',
  nw:'§6 Termination & Exit Planning. For each critical relationship the Credit Union maintains a documented exit plan covering data return and destruction, portability format, transition assistance obligations, and estimated transition timeline, reviewed annually with the relationship risk review.'}},
'vendor-inventory':{t:'Vendor Inventory Register',v:'v4.2',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Complete · risk-tiered · reviewed quarterly',obl:['TPRM-01'],
 secs:[['Contents','All third-party relationships with tier, data touched, criticality designation, contract dates, and monitoring cadence.']]},
'tprm-critical':{t:'Critical Vendor Designation Memo',v:'2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Board-acknowledged designation set',obl:['TPRM-02'],
 secs:[['Contents','Identifies relationships supporting critical activities (core processing, payments, lending decisioning) per 88 FR 37920 §II, with rationale.']]},
'dd-standard':{t:'Due Diligence Standard + Completed Packets',v:'12 packets',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Pre-contract diligence commensurate with risk',obl:['TPRM-03'],
 secs:[['Standard','Financial condition, security posture, subcontractor use, resilience, and compliance capacity reviewed before contract, scaled by tier.']]},
'contract-rider':{t:'Contract Rider Template · Risk Clauses',staged:1,v:'v3.0',dom:'tprm',type:'Template',owner:'D. Reyes · General Counsel',status:'warn',line:'Model-risk clauses rolling into 9 legacy contracts',obl:['TPRM-04'],
 secs:[['Contents','Audit rights, performance measures, incident-notification duties, subcontractor disclosure, termination and data-return provisions.'],
 ['Open item','Nine legacy contracts predate the 2026-13 model-validation clauses; renewals scheduled through Q1-2027.']]},
'vendor-reviews':{t:'Quarterly Vendor Review Packets',v:'Q2-2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Ongoing monitoring commensurate with risk',obl:['TPRM-05'],
 secs:[['Contents','Performance vs SLA, security attestations, incident history, and financial-condition refresh for each critical and moderate vendor.']]},
'tprm-records':{t:'TPRM Recordkeeping Standard',v:'v2.0',dom:'tprm',type:'Standard',owner:'P. Nguyen · ISD',status:'good',line:'Lifecycle documentation requirements',obl:['TPRM-12'],
 secs:[['Requirement','Documentation retained across the relationship lifecycle: diligence, contracts, monitoring, issues, and termination evidence.']]},
'exit-draft':{t:'Exit Plan Standard',v:'Draft 0.7',dom:'tprm',type:'Draft',owner:'P. Nguyen · ISD',status:'warn',line:'In HITL review · closes TPRM-08',obl:['TPRM-08'],
 secs:[['Status','Termination and exit planning standard for critical relationships: data portability, destruction certification, and transition timelines.']]},
'soc2-core':{t:'Vendor SOC 2 Review Packet · Core Processor',v:'May 2026',dom:'tprm',type:'Evidence',owner:'P. Nguyen · ISD',status:'good',line:'Type 2 · no relevant exceptions',obl:['TPRM-05'],
 secs:[['Summary','SOC 2 Type 2 report reviewed against the vendor record: control exceptions triaged, complementary user-entity controls confirmed in place.']]},
'board-tprm':{t:'Board Risk Committee Minutes · TPRM Standing Item',v:'Jun 2026',dom:'tprm',type:'Board record',owner:'Board Risk Committee',status:'good',line:'Periodic board oversight',obl:['TPRM-09'],
 secs:[['Contents','Quarterly third-party risk report: critical-vendor posture, concentration notes, open issues, and pending contract actions.']]},
'bsa-policy':{t:'BSA/AML Program Policy',v:'v5.2',dom:'bsa',type:'Policy',owner:'T. Whitfield · BSA Officer',status:'good',line:'Annual board approval · Apr 2026',obl:[],
 secs:[['1. Program pillars','Internal controls, independent testing, designated BSA Officer, training, and customer due diligence per 31 CFR Ch. X.'],
 ['2. Monitoring','Transaction monitoring scenarios, thresholds, and case disposition governed with model-risk controls; SAR/CTR filing procedures per FinCEN.']]},
'bsa-training':{t:'BSA Training Completion Attestation',v:'2026 cycle',dom:'bsa',type:'Training',owner:'T. Whitfield · BSA Officer',status:'good',line:'98% completion · stragglers escalated',obl:[],
 secs:[['Contents','Role-based BSA/AML training records with completion attestations for all staff, board module included.']]},
'fl-review':{t:'Quarterly Fair Lending Review',v:'Q2-2026',dom:'fairlend',type:'Evidence',owner:'M. Okafor · CCO',status:'good',line:'Comparative-file and pricing review complete',obl:[],
 secs:[['Summary','Quarterly comparative-file review, pricing-disparity analysis, and override monitoring; no disparate treatment identified this cycle.'],
 ['Next','Disparate-impact testing cadence for decisioning models being formalized (open obligation).']]},
'aa-procedure':{t:'Adverse-Action Procedure',v:'v2.1',dom:'fairlend',type:'Procedure',owner:'M. Okafor · CCO',status:'warn',line:'Reason-code section under revision · see redline',obl:[],
 secs:[['1. Requirement','Adverse-action notices state specific principal reasons within required timing per Reg B §1002.9.'],
 ['2. Open item','Model-assisted denials require reason codes derived from model attributions per Circular 2026-C1; mapping in progress.']],
 redline:{note:'Proposed revision to §4 · Reason codes for model-assisted denials (Circular 2026-C1) · drafted by OnSide',
  old:'For system-generated denials, staff select the closest applicable reason code from the standard list.',
  nw:'For model-assisted denials, principal reasons are derived from the model’s documented feature attributions and mapped to ECOA reason codes through the tested attribution-to-code matrix; accuracy is verified quarterly against a sampled file review.'}},
'complaint-proc':{t:'Complaint Management Procedure',v:'v2.4',dom:'consumer',type:'Procedure',owner:'M. Okafor · CCO',status:'good',line:'Cross-channel intake · UDAAP trend review',obl:[],
 secs:[['Contents','Complaint intake across channels, root-cause tagging, escalation, and UDAAP trend reporting to the compliance committee.']]},
'irp':{t:'Incident Response Plan',v:'v1.2',dom:'infosec',type:'Policy',owner:'P. Nguyen · ISD',status:'crit',line:'High priority · escalation path gap · see redline',obl:[],
 secs:[['1. Purpose','Defines detection, escalation, containment, and reporting procedures for operational and security incidents, including automated-system incidents.'],
 ['2. Categories','Covers system failure, data-integrity events, unauthorized access, and discriminatory-output events in decisioning systems.'],
 ['3. Escalation','Model-failure and data-integrity incidents escalate to the Model Risk Manager and ISD within four hours of detection.']],
 redline:{note:'Proposed §3.4 · Member-facing automation escalation (closes the high-priority gap) · drafted by OnSide, awaiting P. Nguyen',
  old:'(no defined path for member-facing automated communication incidents)',
  nw:'§3.4 Member-Facing Automation. Incidents involving automated member communications (chat, messaging, voice) escalate to the CCO and ISD within two hours, with member-impact assessment, containment (automation paused to human-only), and UDAAP review before service restoration.'}},
'glba-program':{t:'GLBA Safeguards Program',v:'v4.0',dom:'infosec',type:'Policy',owner:'P. Nguyen · ISD',status:'good',line:'Annual review complete · CAT transition tracked',obl:[],
 secs:[['Contents','Administrative, technical, and physical safeguards; access control; encryption; vendor security expectations; incident response linkage.']]},
'gov-charter':{t:'Governance Charter',v:'v2.0',dom:'aigov',type:'Policy',owner:'R. Fischer · CRO',status:'warn',line:'Agentic scope pending RFI 2026-04 · see redline',obl:[],
 secs:[['1. Authority','Board-level charter establishing governance authority, roles, and escalation for automated and AI systems.'],
 ['2. Scope','Covers all AI systems in the inventory; generative and agentic scope pre-staged pending interagency finalization.']],
 redline:{note:'Pre-staged amendment · agentic-systems scope (ships when RFI 2026-04 finalizes)',
  old:'This charter governs artificial intelligence systems used in member service, underwriting support, and fraud detection.',
  nw:'This charter governs all artificial intelligence systems, including generative and agentic systems capable of autonomous action, used anywhere in Credit Union operations, with authority boundaries and human-approval gates defined per system tier.'}},
'msg-disclosure':{t:'Member Messaging Disclosure Standard',v:'Draft 0.6',dom:'consumer',type:'Draft',owner:'M. Okafor · CCO',status:'warn',line:'In HITL review · closes the automated-messaging disclosure gap',obl:[],
 secs:[['Status','Disclosure standard for automated member communications across chat, messaging, and voice channels, drafted by OnSide from UDAAP expectations.']],
 redline:{note:'Proposed disclosure language for automated member communications · drafted by OnSide, awaiting M. Okafor',
  old:'(no standard disclosure exists for automated member communications)',
  nw:'Members interacting with an automated channel are informed at the start of the interaction that they are communicating with an automated system, offered a path to a human at any point, and automated responses about fees, disputes, or account actions include the governing disclosure reference.'}},
'capital-narr':{t:'Capital Narrative · CBLR',v:'Q2-2026',dom:'capital',type:'Board record',owner:'CFO office',status:'good',line:'Well above threshold · qualitative note pending',obl:[],
 secs:[['Contents','CBLR calculation, net-worth classification, and prompt-corrective-action headroom; qualitative operational-risk note being added.']]}
};
