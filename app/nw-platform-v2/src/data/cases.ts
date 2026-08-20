// Verbatim port of case/approval/notification seed data from
// leapfi-dashboards/src/leapfi-platform.html
//   APPROVAL / CASE_TIER / CASE_STAGES / CASE_STAGES_B: lines 2544-2571
//   CASES / NOTIFS / CASE_TRIGGER / CASE_DETECTED / CASE_OWNER / CLOCK / stamp / seedCases: lines 2568-2603
//
// Spec ambiguity (resolved): the source range 2562-2566 also defines
// `toggleTierCommittee`/`setCommitteeName`, which mutate APPROVAL via DOM
// event handlers, call `toast(...)`, and reach into `renderApprovalSettings()`
// (a screen-render function from another module). Those are UI/controller
// behavior, not data, and are out of scope for a data-only file per this
// task's allowlist (data/cases.ts, data/misc.ts) — they are intentionally
// NOT ported here. `tierOf` is kept because it's a pure lookup over
// APPROVAL.tiers with no cross-module dependency.

// `DOCLIB` is owned by another agent's file. It now exists at `./doclib`
// (build-fix update: corrected from the originally inferred `./docs` path
// now that the sibling file is present).
import type { DOCLIB } from './doclib';

export interface ApprovalTier {
  k: string;
  n: string;
  d: string;
  committee: boolean;
  ex: string;
}

export interface Approval {
  tiers: ApprovalTier[];
  conditions: string[];
  committee: string;
}

export const APPROVAL: Approval = {
  tiers: [
    {
      k: 'board',
      n: 'Board-level policy',
      d: 'Policies and charters the board approves. The CRO gives conditional approval, a committee votes, and final approval follows the vote.',
      committee: true,
      ex: 'Governance Charter · Model Risk Management Policy',
    },
    {
      k: 'exec',
      n: 'Executive policy',
      d: 'Policies an executive officer approves. The CRO can adopt directly, or attach a condition if the change warrants one.',
      committee: false,
      ex: 'Incident Response Plan · Third-Party Risk Management Program',
    },
    {
      k: 'proc',
      n: 'Procedure & standard',
      d: 'Operating procedures and standards below policy level. Analyst prepares, CRO approves.',
      committee: false,
      ex: 'Regulation E error resolution · adverse-action procedure',
    },
  ],
  conditions: [
    'Board Risk Committee approval',
    'Legal counsel opinion on file',
    'External counsel review',
    'Model validation complete',
    'Vendor notification complete',
  ],
  committee: 'Board Risk Committee',
};

export const CASE_TIER: Record<string, string> = {
  'gov-charter': 'board',
  'mrm-change-draft': 'board',
  'gen-ai-draft': 'board',
  irp: 'exec',
  'tprm-program': 'exec',
  'aa-procedure': 'proc',
  'msg-disclosure': 'proc',
  'rege-proc': 'proc',
};

export function tierOf(k: string): ApprovalTier {
  return APPROVAL.tiers.filter((t) => t.k === k)[0] || (APPROVAL.tiers[1] as ApprovalTier);
}

export type CaseStage = [string, string];

export const CASE_STAGES: CaseStage[] = [
  ['detected', 'Detected'],
  ['analyst', 'Risk analyst'],
  ['cro', 'CRO'],
  ['closed', 'Adopted'],
];

export const CASE_STAGES_B: CaseStage[] = [
  ['detected', 'Detected'],
  ['analyst', 'Risk analyst'],
  ['cro', 'CRO conditional'],
  ['committee', 'Committee'],
  ['closed', 'Final approval'],
];

export interface CaseHistoryEntry {
  when: string;
  who: string;
  role: string;
  what: string;
  note: string;
}

export interface Case {
  id: string;
  doc: string;
  title: string;
  dom: string;
  owner: string;
  detected: string;
  trigger: string;
  stage: string;
  edited: boolean;
  tier: string;
  cond: string | null;
  condMet: boolean;
  minutes: string | null;
  opinion: string | null;
  base: string;
  lang: string;
  history: CaseHistoryEntry[];
}

export let CASES: Case[] = [];

/**
 * Shared "still needs a first look" predicate — the SAME test
 * `screens/Cases.tsx`'s own "N of M have been decided yet" header
 * (`CASES.filter(isUntouched).length`) and Sidebar's OnSide · Cases count
 * badge (App.tsx) both read, so the two numbers can never independently
 * drift (sprint-1.1 S1.1-04, PI2-D43). Relocated here (rather than kept
 * private to `Cases.tsx`) per that task's explicit "file placement is the
 * implementer's call, the predicate itself is not."
 */
export function isUntouched(c: Case): boolean {
  return c.stage === 'analyst' && !c.edited && c.history.length <= 1;
}

export interface Notif {
  [key: string]: unknown;
}

/** Session notification queue. Writers live in `src/state/demoStore.ts`
 * (the base `notify()` port, source 2626–2629, plus the six case-action
 * write helpers, source 2691–2758); `seedCases()`/`resetDemo()` reset it
 * to `[]`. Concrete entry shape: `{to,title,cid,kind,when,read}` (see
 * `views/NotificationBellPanel.tsx`'s `BellNotification`). */
export let NOTIFS: Notif[] = [];

export const CASE_TRIGGER: Record<string, string> = {
  irp: 'NCUA Letter 26-CU-07 and Part 748 appendix A · member-facing automation has no escalation path',
  'tprm-program': 'Interagency Guidance 88 FR 37920 §III.F · no documented exit plan for critical relationships',
  'aa-procedure': 'CFPB Circular 2026-C1 · adverse-action notices must give the specific principal reason',
  'msg-disclosure': 'UDAAP supervisory expectation · automated member communications carry no disclosure standard',
  'gov-charter': 'Interagency RFI 2026-04 · agentic systems fall outside the charter as written',
  'mrm-change-draft': 'Interagency Guidance 2026-13 §V · model changes reach production without a formal gate',
  'gen-ai-draft': 'Interagency RFI 2026-04 · generative models are out of scope in the policy as written',
  'rege-proc': 'Regulation E §1005.11 · the error clock depends on staff transcription for automated intake',
};

export const CASE_DETECTED: Record<string, string> = {
  irp: 'Aug 14, 2026',
  'tprm-program': 'Aug 11, 2026',
  'aa-procedure': 'Aug 6, 2026',
  'msg-disclosure': 'Aug 9, 2026',
  'gov-charter': 'Jul 31, 2026',
  'mrm-change-draft': 'Aug 4, 2026',
  'gen-ai-draft': 'Jun 30, 2026',
  'rege-proc': 'Aug 12, 2026',
};

export const CASE_OWNER: Record<string, string> = {
  irp: 'P. Nguyen · ISD',
  'tprm-program': 'P. Nguyen · ISD',
  'aa-procedure': 'M. Okafor · CCO',
  'msg-disclosure': 'M. Okafor · CCO',
  'gov-charter': 'R. Fischer · CRO',
  'mrm-change-draft': 'A. Kaur · MRM',
  'gen-ai-draft': 'A. Kaur · MRM',
  'rege-proc': 'M. Okafor · CCO',
};

export function stamp(): string {
  return 'Aug 15, 2026 · ' + CLOCK.next() + ' ET';
}

export type ClockTick = [string, string, string];

export const CLOCK: { t: ClockTick[]; i: number; next: () => string } = {
  t: [
    ['9', '14', 'AM'],
    ['9', '41', 'AM'],
    ['10', '06', 'AM'],
    ['10', '32', 'AM'],
    ['11', '15', 'AM'],
    ['11', '48', 'AM'],
    ['1', '22', 'PM'],
    ['2', '05', 'PM'],
    ['2', '47', 'PM'],
    ['3', '30', 'PM'],
    ['4', '12', 'PM'],
    ['4', '55', 'PM'],
  ],
  i: 0,
  next(): string {
    const x = this.t[Math.min(this.i, this.t.length - 1)] as ClockTick;
    this.i++;
    return x[0] + ':' + x[1] + ' ' + x[2];
  },
};

/**
 * Seeds CASES/NOTIFS from DOCLIB (owned by another module, see the import
 * note above). Ported verbatim from `seedCases()`.
 */
export function seedCases(DOCLIB_: typeof DOCLIB): void {
  CASES = [];
  NOTIFS = [];
  CLOCK.i = 0;
  let seq = 0;
  (['irp', 'tprm-program', 'aa-procedure', 'mrm-change-draft', 'msg-disclosure', 'rege-proc', 'gov-charter', 'gen-ai-draft'] as const).forEach(
    (id) => {
      const d = (DOCLIB_ as Record<string, any>)[id];
      if (!d || !d.redline) return;
      seq++;
      CASES.push({
        id: 'CASE-2026-' + ('00' + seq).slice(-3),
        doc: id,
        title: d.t,
        dom: d.dom,
        owner: CASE_OWNER[id] || d.owner,
        detected: CASE_DETECTED[id] || 'Aug 12, 2026',
        trigger: CASE_TRIGGER[id] || d.redline.note,
        stage: 'analyst',
        edited: false,
        tier: CASE_TIER[id] || 'exec',
        cond: null,
        condMet: false,
        minutes: null,
        opinion: null,
        base: d.redline.nw,
        lang: d.redline.nw,
        history: [
          {
            when: (CASE_DETECTED[id] || 'Aug 12, 2026') + ' · 6:12 AM ET',
            who: 'OnSide',
            role: 'System',
            what: 'Change detected and language proposed',
            note: CASE_TRIGGER[id] || '',
          },
        ],
      });
    }
  );
}
