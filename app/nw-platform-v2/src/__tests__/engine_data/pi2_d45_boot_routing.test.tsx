/**
 * PI2-D45 — demo boot-state routing (Marisol Vance's arc-fidelity ruling,
 * recorded in `08_Programs/pi2_platform_rebuild/implementation/DECISIONS.md`,
 * plus the mid-dispatch USER OVERRIDE superseding the original one-case
 * ruling: "Rachel is supposed to have 5 cases, all 5 cases with executive
 * or board approval," plus the further narrative-verification addition
 * ordering mrm-change-draft first).
 *
 * `seedCases()` (`data/cases.ts`) replays the shipped
 * `screens/Cases.tsx` `performAction`/`handleAction` accept (and, for
 * mrm-change-draft, the preceding save-language edit) mutation logic onto
 * every board/exec-tier case at boot, so the booted state is
 * indistinguishable from those actions having genuinely happened —
 * REPLAYED here, in this test file, never invented. This file is the
 * dedicated proof for that boot-state ruling: it does not test the
 * generic notify()/accept mechanism (covered elsewhere,
 * `engine_data/demo-store.test.ts` and `reporting_cases/cases_fix_wave.test.tsx`)
 * — only that seedCases() reproduces the correct SEEDED result.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CASES,
  CASE_DETECTED,
  CASE_OWNER,
  CASE_TIER,
  CASE_TRIGGER,
  NOTIFS,
  seedCases,
} from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { Cases } from '../../screens/Cases';
import { HomePanels } from '../../views/HomePanels';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from '../reporting_cases/fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro' — the boot default persona

const BOARD_EXEC_DOCS = ['gov-charter', 'mrm-change-draft', 'gen-ai-draft', 'irp', 'tprm-program'] as const;
const PROC_DOCS = ['aa-procedure', 'msg-disclosure', 'rege-proc'] as const;

function openCaseDetail(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
  const detail = document.querySelector('[data-lf-view="case-detail"]');
  expect(detail).not.toBeNull();
  return detail as HTMLElement;
}

describe('PI2-D45 boot routing — mrm-change-draft (full analyst-edit replay)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it("boots at stage 'cro', edited, base !== lang, lang === doclib's analystEdit, exactly two replayed history entries in shipped wording (plus the untouched original detect entry), and exactly one seeded notification addressed to 'cro'", () => {
    const mrm = CASES.find((c) => c.doc === 'mrm-change-draft');
    expect(mrm).toBeDefined();
    if (!mrm) return;
    const d = DOCLIB['mrm-change-draft']!;

    expect(mrm.stage).toBe('cro');
    expect(mrm.edited).toBe(true);
    expect(mrm.base).toBe(d.redline!.nw);
    expect(mrm.base).not.toBe(mrm.lang);
    expect(mrm.lang).toBe(d.redline!.analystEdit);

    // Exactly three history entries: the two REPLAYED entries (shipped
    // wording, screens/Cases.tsx handleAction 'save-language' then
    // 'accept'), plus the ORIGINAL, untouched OnSide detect entry.
    expect(mrm.history).toHaveLength(3);
    expect(mrm.history[0]).toEqual({
      when: mrm.history[0]?.when,
      who: 'Priya Raman',
      role: 'Risk Analyst',
      what: 'Accepted with edits and routed for approval',
      note: 'Sent to R. Fischer, Chief Risk Officer.',
    });
    expect(mrm.history[1]).toEqual({
      when: mrm.history[1]?.when,
      who: 'Priya Raman',
      role: 'Risk Analyst',
      what: 'Edited the proposed language',
      note: 'OnSide’s draft kept as the base version. Both texts stay in the case.',
    });
    expect(mrm.history[2]).toEqual({
      when: (CASE_DETECTED['mrm-change-draft'] || 'Aug 12, 2026') + ' · 6:12 AM ET',
      who: 'OnSide',
      role: 'System',
      what: 'Change detected and language proposed',
      note: CASE_TRIGGER['mrm-change-draft'] || '',
    });
    // Exactly two of the three entries carry the newly-replayed wording.
    const replayed = mrm.history.filter((h) => h.who !== 'OnSide');
    expect(replayed).toHaveLength(2);

    const mrmNotifs = NOTIFS.filter((n) => n['cid'] === mrm.id);
    expect(mrmNotifs).toHaveLength(1);
    expect(mrmNotifs[0]).toMatchObject({ to: 'cro', kind: 'email', read: false });
    expect(String(mrmNotifs[0]?.['title'])).toBe(`Approval needed · ${mrm.title}`);
  });
});

describe('PI2-D45 boot routing — the other four board/exec-tier cases (accept-as-drafted, no analystEdit exists for them)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it("gov-charter, gen-ai-draft, irp, and tprm-program each boot at 'cro', edited false, lang === base, exactly one replayed history entry (plus the untouched original detect entry), and exactly one seeded notification each", () => {
    const others = CASES.filter((c) => c.doc !== 'mrm-change-draft' && (c.tier === 'board' || c.tier === 'exec'));
    expect(others.map((c) => c.doc).sort()).toEqual(['gen-ai-draft', 'gov-charter', 'irp', 'tprm-program'].sort());

    for (const c of others) {
      const d = DOCLIB[c.doc]!;
      expect(c.stage).toBe('cro');
      expect(c.edited).toBe(false);
      expect(c.lang).toBe(c.base);
      expect(c.base).toBe(d.redline!.nw);

      expect(c.history).toHaveLength(2);
      expect(c.history[0]).toEqual({
        when: c.history[0]?.when,
        who: 'Priya Raman',
        role: 'Risk Analyst',
        what: 'Accepted as drafted and routed for approval',
        note: 'Sent to R. Fischer, Chief Risk Officer.',
      });
      expect(c.history[1]?.who).toBe('OnSide');
      expect(c.history[1]?.what).toBe('Change detected and language proposed');

      const notifs = NOTIFS.filter((n) => n['cid'] === c.id);
      expect(notifs).toHaveLength(1);
      expect(notifs[0]).toMatchObject({ to: 'cro', kind: 'email', read: false });
      expect(String(notifs[0]?.['title'])).toBe(`Approval needed · ${c.title}`);
    }
  });

  it('seeds exactly 5 notifications total, all addressed to cro', () => {
    expect(NOTIFS).toHaveLength(5);
    expect(NOTIFS.every((n) => n['to'] === 'cro')).toBe(true);
    expect(new Set(NOTIFS.map((n) => n['cid']))).toEqual(new Set(CASES.filter((c) => BOARD_EXEC_DOCS.includes(c.doc as (typeof BOARD_EXEC_DOCS)[number])).map((c) => c.id)));
  });
});

describe('PI2-D45 boot routing — the three proc-tier cases stay untouched (field-wise byte-identical to the pre-ruling shape)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('aa-procedure, msg-disclosure, and rege-proc each boot exactly as the unmodified seedCases() loop always produced them — stage analyst, edited false, base===lang===d.redline.nw, single OnSide history entry, zero seeded notifications', () => {
    for (const doc of PROC_DOCS) {
      const c = CASES.find((x) => x.doc === doc);
      expect(c).toBeDefined();
      if (!c) continue;
      const d = DOCLIB[doc]!;

      expect(c.title).toBe(d.t);
      expect(c.dom).toBe(d.dom);
      expect(c.owner).toBe(CASE_OWNER[doc] || d.owner);
      expect(c.detected).toBe(CASE_DETECTED[doc] || 'Aug 12, 2026');
      expect(c.trigger).toBe(CASE_TRIGGER[doc] || d.redline!.note);
      expect(c.stage).toBe('analyst');
      expect(c.edited).toBe(false);
      expect(c.tier).toBe(CASE_TIER[doc] || 'exec');
      expect(c.cond).toBeNull();
      expect(c.condMet).toBe(false);
      expect(c.minutes).toBeNull();
      expect(c.opinion).toBeNull();
      expect(c.base).toBe(d.redline!.nw);
      expect(c.lang).toBe(d.redline!.nw);
      expect(c.history).toHaveLength(1);
      expect(c.history[0]).toEqual({
        when: (CASE_DETECTED[doc] || 'Aug 12, 2026') + ' · 6:12 AM ET',
        who: 'OnSide',
        role: 'System',
        what: 'Change detected and language proposed',
        note: CASE_TRIGGER[doc] || '',
      });
      expect(NOTIFS.filter((n) => n['cid'] === c.id)).toHaveLength(0);
    }
  });
});

describe('PI2-D45 boot routing — Cases badge/bell reflect the boot state', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('the Cases header reads "3 of 8 have been decided yet" and "5 cases are waiting on you" for the default CRO persona', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} />);
    expect(screen.getByText(/3 of 8 have been decided yet\./)).toBeInTheDocument();
    expect(screen.getByText(/5 cases are waiting on you\./)).toBeInTheDocument();
  });
});

describe('PI2-D45 boot routing — canAct reachability for the CRO persona (the arc\'s step-5 requirement)', () => {
  beforeEach(() => {
    seedCases(DOCLIB);
  });

  it('Rachel (cro persona) can act on all 5 routed cases at boot — the stage-appropriate action row renders, never the non-actor wait note', () => {
    const routed = CASES.filter((c) => c.tier === 'board' || c.tier === 'exec');
    expect(routed).toHaveLength(5);

    // Fresh render per case (rather than open/close-looping one render) —
    // sidesteps the Drawer's own async close transition entirely, since
    // each case only needs to be opened once here.
    for (const c of routed) {
      cleanup();
      seedCases(DOCLIB);
      render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
      const detail = openCaseDetail(c.id);
      // canAct === true renders a CRO-stage action row, never the
      // non-actor wait note ("This case is with...").
      expect(within(detail).queryByText(/^This case is with/)).not.toBeInTheDocument();
      const hasCommitteeAction = within(detail).queryByRole('button', { name: 'Conditional approval…' }) !== null;
      const hasDirectAction = within(detail).queryByRole('button', { name: 'Final approval & adopt' }) !== null;
      expect(hasCommitteeAction || hasDirectAction).toBe(true);
    }
  });
});

describe("PI2-D45 boot routing — mrm-change-draft is the CRO's FIRST routed case (narrative-verification addition)", () => {
  beforeEach(() => {
    CASES.length = 0;
    seedCases(DOCLIB);
  });

  it('at genuine boot (no manual case mutation), the CRO "Your queue" Approve action opens mrm-change-draft, not irp', async () => {
    const user = userEvent.setup();
    const onDeepLink = () => {};
    let captured: { screen: string; kind?: string; id?: string } | null = null;
    render(
      <HomePanels
        visibleKeys={['queue']}
        currentRoleKey="cro"
        onNavigate={() => {}}
        onDeepLink={(req) => {
          captured = req;
        }}
      />,
    );

    const mrm = CASES.find((c) => c.doc === 'mrm-change-draft');
    expect(mrm).toBeDefined();
    // CRO row subtitle is the oldest waiting case's own title, no prefix
    // (HomePanels.tsx:396, `subtitle: myCases[0]?.title ?? ''` — distinct
    // from the analyst row's "Oldest: " prefix).
    expect(screen.getByText(mrm?.title ?? '')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(captured).toEqual({ screen: 'cases', kind: 'case', id: mrm?.id });
    void onDeepLink;
  });
});
