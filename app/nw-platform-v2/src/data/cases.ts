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

/**
 * PI2-D46 (user ruling, resolving AC-r02-D-GATE, r02_one_case_page.md
 * "deadline-driven case leg"): "Mark complete" gates on the role the case
 * ALREADY carries — CASE_OWNER's existing owner strings, mapped to real,
 * registered `StudioUser.roleKey` values (data/studio.ts USERS). Declared
 * explicit DATA beside `CASE_OWNER` (the data it interprets), per the
 * ruling's own instruction — never a runtime string-parse scattered
 * across components. Only `'R. Fischer · CRO'` resolves today (to
 * `'cro'`, `USERS[0]`); `'P. Nguyen · ISD'`, `'M. Okafor · CCO'`, and
 * `'A. Kaur · MRM'` name roles with no corresponding `USERS` entry and
 * are deliberately ABSENT from this map — exactly the gap
 * AC-r02-D-GATE's own referral documented (r02_one_case_page.md
 * "deadline-driven case leg" §AC-r02-D-GATE). `ownerRoleKey()` returns
 * `null` for any unmapped owner string; the deadline-leg's action-gating
 * logic (`views/CaseDetail.tsx`'s `DeadlineCaseDetail`) renders the
 * honest, absent-controls wait note for every viewer in that case — never
 * a disabled or lying "Mark complete" control (PI2-D24).
 */
export const OWNER_ROLE_KEY: Record<string, string> = {
  'R. Fischer · CRO': 'cro',
};

/** Resolves a case-owner string (`CASE_OWNER`'s / `DeadlineDrivenCase.owner`'s
 * shape) to a registered `roleKey`, or `null` when unmapped (PI2-D46). */
export function ownerRoleKey(owner: string): string | null {
  return OWNER_ROLE_KEY[owner] ?? null;
}

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

// ---------------------------------------------------------------------------
// PI2-D2 case-type union widening (PI2-D44 front-load; lane-1: data-case-
// -union-origin-resolution). `seedCases()` below is UNCHANGED (its
// drafted-redline-only gate, `if (!d || !d.redline) return;`, stays
// verbatim per r17b_case_boundary.md's "gate preserved" AC) — the two legs
// below are additive exports, never routed through `seedCases()`/`CASES`.
// Data only: no rendering, no import of views/CaseDetail.tsx or
// screens/Cases.tsx.

/**
 * Human-contributed-edit leg (PI2-D2 leg (c); design_system_spec.md
 * §2.10.1, amendment A17). This leg is deliberately the SAME `Case` shape
 * as the drafted-redline leg above — A17's own reuse-rationale states "no
 * new primitive, composite, screen, or field" is introduced for it,
 * because `CaseDetail.tsx`'s `renderActions()` is already a pure function
 * of `caseItem.stage` with no branch on where the language originated.
 * What distinguishes this leg is purely the SEED: it enters at `'cro'`,
 * never `'analyst'` (§2.10.1 rule 1 — there is no OnSide draft to accept,
 * edit-in-place, or revert to), and its first history entry names the
 * human author instead of `'OnSide'` (§2.10.1 rule 4). `edited` is always
 * `false` for this leg (not applicable — nothing was edited FROM an
 * OnSide draft) and `base === lang` (no prior OnSide text to diff
 * against, per rule 3's "absent, not disabled" discipline extended to the
 * data layer).
 */
export interface HumanContributedEditSeed {
  id: string;
  doc: string;
  title: string;
  dom: string;
  owner: string;
  detected: string;
  /** Any stage from `'cro'` onward (`CASE_STAGES`/`CASE_STAGES_B`); never `'analyst'` — enforced below. */
  stage: string;
  /** The human author's display name — becomes `history[0].who`. */
  author: string;
  /** The human author's role at authoring time — becomes `history[0].role`, and names the role in `history[0].what`. */
  authorRole: string;
  /** The rationale the author supplied at authoring time — becomes `history[0].note`. */
  note: string;
  /** The author's own submitted language — becomes both `base` and `lang` (no OnSide draft exists to diff against). */
  lang: string;
  tier?: string;
  cond?: string | null;
  condMet?: boolean;
  minutes?: string | null;
  opinion?: string | null;
}

/**
 * Builds a human-contributed-edit `Case` fixture per §2.10.1 (amendment
 * A17). Throws if `seed.stage === 'analyst'` — that stage exists only to
 * let a human accept/edit/revert an OnSide draft, which this leg never
 * has (rule 1); the throw makes the "never `'analyst'`" invariant a
 * data-layer guarantee, not only a documentation claim (AC-A17-1's
 * grep-verified requirement, enforced here at runtime too).
 */
export function buildHumanContributedEditCase(seed: HumanContributedEditSeed): Case {
  if (seed.stage === 'analyst') {
    throw new Error(
      "buildHumanContributedEditCase: stage must never be 'analyst' — a human-contributed-edit case has no OnSide draft to accept/edit/revert (design_system_spec.md §2.10.1 amendment A17, rule 1)."
    );
  }
  return {
    id: seed.id,
    doc: seed.doc,
    title: seed.title,
    dom: seed.dom,
    owner: seed.owner,
    detected: seed.detected,
    // No OnSide-detected trigger exists for this leg (§2.10.1 rule 5 —
    // "no originating regulatory signal to resolve"); this leg's origin
    // renders via `resolveOriginSignal(caseItem.doc)`
    // (data/originSignal.ts), which returns its unresolved result for a
    // doc id no SIGNAL entry touches. `trigger` is carried only for
    // back-compat with `Case`'s existing shape and kept equal to the same
    // rationale text as `history[0].note`, never left fabricated.
    trigger: seed.note,
    stage: seed.stage,
    edited: false,
    tier: seed.tier ?? CASE_TIER[seed.doc] ?? 'exec',
    cond: seed.cond ?? null,
    condMet: seed.condMet ?? false,
    minutes: seed.minutes ?? null,
    opinion: seed.opinion ?? null,
    base: seed.lang,
    lang: seed.lang,
    history: [
      {
        when: stamp(),
        who: seed.author,
        role: seed.authorRole,
        what: `Language drafted directly by the ${seed.authorRole}`,
        note: seed.note,
      },
    ],
  };
}

/**
 * A ready-made human-contributed-edit fixture (Lane 2's tests,
 * AC-A17-1..4): seeded at `'cro'`, doc `'rege-proc'` (Regulation E Error
 * Resolution Procedure) — deliberately a document id no `SIGNAL` entry's
 * `touch` list carries (`data/originSignal.ts`), exercising
 * AC-r02-2's/§2.10.1 item 5's unresolvable-origin empty state. Author
 * role `'cro'` at stage `'cro'` deliberately exercises the sanctioned
 * self-review simplification §2.10.1 rule 6 (OQ-9) flags, not an
 * oversight.
 */
export const HUMAN_CONTRIBUTED_EDIT_CASE_FIXTURE: Case = buildHumanContributedEditCase({
  id: 'CASE-2026-101',
  doc: 'rege-proc',
  title: 'Regulation E Error Resolution Procedure',
  dom: 'consumer',
  owner: 'M. Okafor · CCO',
  detected: 'Aug 15, 2026',
  stage: 'cro',
  author: 'M. Okafor',
  authorRole: 'cro',
  note: 'Provisional-credit timing tightened to the 10-business-day standard directly, ahead of the scheduled OnSide sweep.',
  lang: 'Provisional credit is extended no later than the 10th business day following notice of a claimed error, consistent with Regulation E §1005.11(c)(2).',
  tier: CASE_TIER['rege-proc'] ?? 'proc',
});

/**
 * Deadline-driven case (PI2-D2 leg (b): comment positions, expiries).
 * Carries `track`/`complete` actions, never adopt/reject — there is no
 * drafted redline language to approve (`r02_one_case_page.md`
 * §"PI2-D2 scope rework"). This leg's rendering/action-set anatomy is
 * explicitly OUT OF SCOPE for the A17-A19 spec pass
 * (design_system_spec.md §2.10 preamble: "its anatomy is not asked for by
 * this pass and is not built anywhere yet, so there is nothing to cite
 * beyond the two verb names"). The fields below (`deadline`, `status`)
 * are this lane's minimal data-layer implementation for a seedable
 * fixture — no acceptance criterion found in scope specifies them beyond
 * the two verb names; flagged in the dispatch return as a
 * minimal-necessary implementation choice, not a design ruling.
 * Deliberately NOT `Case`-shaped (no `stage`/`tier`/`cond`/`base`/`lang`
 * — none of the drafted-redline stage machine applies to this leg) —
 * r17b_case_boundary.md's "Signal ... Case ... remain separate types
 * with no field merge" discipline applied to the case-type boundary
 * itself: a new, distinct type, never a `Case` extension.
 */
export interface DeadlineDrivenCase {
  kind: 'deadline-driven';
  id: string;
  /** Document id this deadline pertains to, resolvable via
   * `resolveOriginSignal` (data/originSignal.ts) exactly like a
   * drafted-redline case's `doc` — every case type has an origin
   * (`r02_one_case_page.md`: "not only the ones an examiner asks
   * about"). */
  doc: string;
  title: string;
  dom: string;
  owner: string;
  detected: string;
  deadline: string;
  status: 'tracking' | 'completed';
  history: CaseHistoryEntry[];
}

/**
 * A ready-made deadline-driven fixture (Lane 2's tests): tracks RFI
 * 2026-04's comment-position deadline (`SIGNAL[0]`, `data/misc.ts` —
 * "position due Sep 30"), against the same `'gov-charter'` document a
 * drafted-redline case (CASE-2026-007) already tracks for its OWN,
 * separate redline leg — one external filing legitimately produces more
 * than one case type. Resolvable via
 * `resolveOriginSignal('gov-charter')`.
 */
export const DEADLINE_DRIVEN_CASE_FIXTURE: DeadlineDrivenCase = {
  kind: 'deadline-driven',
  id: 'CASE-2026-102',
  doc: 'gov-charter',
  title: 'RFI 2026-04 comment position',
  dom: 'aigov',
  owner: 'R. Fischer · CRO',
  detected: 'Jul 31, 2026',
  deadline: 'Comment position due Sep 30',
  status: 'tracking',
  history: [
    {
      when: 'Jul 31, 2026 · 6:12 AM ET',
      who: 'OnSide',
      role: 'System',
      what: 'Comment deadline detected and tracked',
      note: 'Interagency RFI 2026-04 · generative and agentic AI in model risk',
    },
  ],
};

/**
 * Makes `DEADLINE_DRIVEN_CASE_FIXTURE` reachable in the UI
 * (r02_one_case_page.md "deadline-driven case leg" section's own scope
 * note on this dispatch: "extend the seed with at least one deadline case
 * reachable in the UI if none is, per the fixture's own intent"). Builds a
 * FRESH deep copy on every call — never the shared fixture object
 * reference — so a UI action ("Mark complete", `screens/Cases.tsx`) can
 * never mutate the read-only fixture other tests import directly; same
 * discipline `seedCases()` already applies for `CASES`/`DOCLIB`-derived
 * cases. Never routed through `seedCases()`/`CASES` (this leg's own file
 * header, above: "additive exports, never routed through
 * seedCases()/CASES").
 */
export let DEADLINE_CASES: DeadlineDrivenCase[] = [];

export function seedDeadlineCases(): void {
  DEADLINE_CASES = [
    {
      ...DEADLINE_DRIVEN_CASE_FIXTURE,
      history: DEADLINE_DRIVEN_CASE_FIXTURE.history.map((entry) => ({ ...entry })),
    },
  ];
}

/**
 * Widened case-type union (PI2-D2) — additive only. `Case` (drafted-
 * redline leg, unchanged — including the human-contributed-edit leg,
 * which reuses its exact shape) and `DeadlineDrivenCase` stay fully
 * distinct types, never merged. No existing export's shape changes.
 */
export type CaseUnion = Case | DeadlineDrivenCase;

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

  // PI2-D45 (Marisol Vance's arc-fidelity ruling; USER OVERRIDE delivered
  // mid-dispatch, superseding the original one-case ruling: "Rachel is
  // supposed to have 5 cases, all 5 cases with executive or board
  // approval."). Runs strictly AFTER the loop above — seedCases()'s own
  // drafted-redline gate (`if (!d || !d.redline) return;`) stays
  // byte-identical per r17b_case_boundary.md's "gate preserved" AC;
  // nothing here edits that gate or the loop it lives in.
  //
  // Membership is derived from CASE_TIER, never a hard-coded id list, per
  // the ruling's own instruction ("that is exactly the CASE_TIER 'board' +
  // 'exec' set ... so the rule reads as what it is"): every board- and
  // exec-tier case boots already routed to the CRO, replaying the shipped
  // `screens/Cases.tsx` `handleAction`/`performAction` semantics so the
  // booted state is indistinguishable from the action genuinely having
  // happened. The three proc-tier cases (aa-procedure, msg-disclosure,
  // rege-proc) are untouched by this block and stay exactly as the loop
  // above left them.
  //
  //  - mrm-change-draft additionally replays a prior 'save-language' edit
  //    first (analyst-edited text lives at doclib.ts's own
  //    `redline.analystEdit` — Marisol's authored content, present ONLY on
  //    this entry): base stays the OnSide draft (`d.redline.nw`, already
  //    set by the loop above), `lang` becomes the edit, `edited` flips
  //    true, and the accept's history wording is therefore the
  //    edited-branch wording ('Accepted with edits and routed for
  //    approval') — exactly `screens/Cases.tsx`'s `handleAction`,
  //    `kind === 'save-language'` then `kind === 'accept'`.
  //  - The other four board/exec cases (gov-charter, gen-ai-draft, irp,
  //    tprm-program) carry no `redline.analystEdit` in doclib.ts, so only
  //    the accept replays: `edited` stays `false` and `lang` stays
  //    `=== base` exactly as the shipped 'accept' branch leaves a case
  //    whose `edited` was never flipped
  //    (`screens/Cases.tsx` `handleAction`, kind === 'accept':
  //    `logEntry(c, c.edited ? '...with edits...' : 'Accepted as drafted
  //    and routed for approval', ...)`) — the shipped mechanism's own
  //    no-prior-edit path, not a fabricated fifth case type.
  //
  // The acting analyst is Priya Raman, Risk Analyst (`data/studio.ts`
  // USERS[1]) — the only role that can reach either action at the
  // `analyst` stage (`waitingOnRoleKey('analyst') === 'analyst'`,
  // `screens/Cases.tsx`).
  const ROUTED_ANALYST = { name: 'Priya Raman', role: 'Risk Analyst' };
  CASES.filter((c) => c.tier === 'board' || c.tier === 'exec').forEach((c) => {
    const d = (DOCLIB_ as Record<string, any>)[c.doc];
    if (c.doc === 'mrm-change-draft' && d?.redline?.analystEdit) {
      // Replays 'save-language' (screens/Cases.tsx handleAction,
      // kind === 'save-language').
      c.lang = d.redline.analystEdit;
      c.edited = true;
      c.history.unshift({
        when: stamp(),
        who: ROUTED_ANALYST.name,
        role: ROUTED_ANALYST.role,
        what: 'Edited the proposed language',
        note: 'OnSide’s draft kept as the base version. Both texts stay in the case.',
      });
    }
    // Replays 'accept' (screens/Cases.tsx handleAction, kind === 'accept').
    c.stage = 'cro';
    c.history.unshift({
      when: stamp(),
      who: ROUTED_ANALYST.name,
      role: ROUTED_ANALYST.role,
      what: c.edited ? 'Accepted with edits and routed for approval' : 'Accepted as drafted and routed for approval',
      note: 'Sent to R. Fischer, Chief Risk Officer.',
    });
    // Replays notifyCaseRouted(notifRef(c)) → notify('cro', 'Approval
    // needed · '+title, id, 'email') (state/demoStore.ts's base notify()
    // pipeline, source 2626-2629/2691). Written directly against NOTIFS
    // here — data/cases.ts owns NOTIFS, and importing state/demoStore.ts
    // back into this file would be circular (demoStore.ts already imports
    // NOTIFS/seedCases/stamp from here) — same wording, verbatim.
    NOTIFS.unshift({
      to: 'cro',
      title: 'Approval needed · ' + c.title,
      cid: c.id,
      kind: 'email',
      when: stamp(),
      read: false,
    });
  });

  // PI2-D45 (further USER OVERRIDE addition, narrative verification): the
  // arc requires MRM-09 (mrm-change-draft) to be the CRO's FIRST case —
  // `views/HomePanels.tsx`'s "Your queue" Approve action opens
  // `myCases[0]`, and `myCases = CASES.filter((c) =>
  // waitingOnRoleKey(c.stage) === roleKey)` (HomePanels.tsx:343) consumes
  // CASES' own array order with no sort of its own. `screens/Cases.tsx`'s
  // own list is unaffected — it always renders via
  // `defaultSortColumnId="id"` (Cases.tsx:688), sorting by case id
  // regardless of underlying array order. Data/order only: move
  // mrm-change-draft's element ahead of the other routed cases that
  // currently precede it in doc order (irp, tprm-program) — every other
  // case's relative order (including the three still-`analyst` proc-tier
  // cases) is untouched.
  const mrmIndex = CASES.findIndex((c) => c.doc === 'mrm-change-draft');
  if (mrmIndex > 0) {
    const [mrmCase] = CASES.splice(mrmIndex, 1);
    CASES.unshift(mrmCase as Case);
  }
}
