/**
 * Cases fix-wave regressions (findings CS-01 consumer side, CS-02, CS-03,
 * CS-05, CS-06, CS-07, CS-08, CS-09, CS-10, CS-13).
 *
 * Every pinned expectation is anchored to leapfi-platform.html @ 1c230fe:
 *  - notify() write sites inside the case handlers: 2691 (accept), 2707
 *    (committee conditional), 2715 (route-legal), 2724 (opinion), 2749
 *    (approve), 2758 (reject) — CS-01.
 *  - IDX stage index map, source 2821 — CS-02.
 *  - committee-stage copy + "Open the board report", 2858-2860 — CS-03.
 *  - per-stage non-actor wait notes, 2835/2849/2855/2861/2868 — CS-05.
 *  - closed-state diff captions "prior text, archived on adoption" /
 *    "adopted and in force", 2872-2875 — CS-10.
 *  - "View the email you were sent" + openEmail drawer, 2846/2650-2664 —
 *    CS-01 email beat (restored under CS-08's targets-exist rule).
 *
 * Commit latency: Cases.tsx `ACTION_COMMIT_DELAY_MS` = 550ms — every
 * mutation lands only after the simulated commit, hence the fake-timer
 * advances below.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Cases } from '../../screens/Cases';
import { APPROVAL, CASES, NOTIFS, seedCases } from '../../data/cases';
import type { Case } from '../../data/cases';
import { DOCLIB } from '../../data/doclib';
import { USERS } from '../../data/studio';
import type { StudioUser } from '../../data/studio';
import { topbarFixture } from './fixtures';

const CRO = USERS[0] as StudioUser; // Rachel Fischer, roleKey 'cro'
const ANALYST = USERS[1] as StudioUser; // Priya Raman, roleKey 'analyst'

/** Cases.tsx ACTION_COMMIT_DELAY_MS (550) plus margin. */
const COMMIT_MS = 600;

function commit(ms: number = COMMIT_MS): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function caseById(id: string): Case {
  const c = CASES.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c as Case;
}

function openCaseDetail(caseId: string): HTMLElement {
  const idCell = screen.getByText(caseId);
  const row = idCell.closest('tr');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Open' }));
  const detail = document.querySelector('[data-lf-view="case-detail"]');
  expect(detail).not.toBeNull();
  return detail as HTMLElement;
}

function stageStripTags(detail: HTMLElement): { text: string; variant: string }[] {
  const strip = detail.querySelector('[aria-label="Case stage progress"]');
  expect(strip).not.toBeNull();
  return Array.from((strip as HTMLElement).querySelectorAll('[data-lf-primitive="tag"]')).map((el) => ({
    text: el.textContent ?? '',
    variant: el.getAttribute('data-variant') ?? '',
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  seedCases(DOCLIB); // base boot reseed (source 3924); also resets NOTIFS
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CS-01 — case actions write the base notify() pipeline (2691/2715)', () => {
  it("analyst Accept unshifts the CRO's email notification (base 2691)", () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openCaseDetail('CASE-2026-001');

    fireEvent.click(screen.getByRole('button', { name: 'Accept & route for approval' }));
    expect(NOTIFS).toHaveLength(0); // pessimistic: nothing before the commit resolves
    commit();

    expect(caseById('CASE-2026-001').stage).toBe('cro');
    expect(NOTIFS).toHaveLength(1);
    expect(NOTIFS[0]).toMatchObject({ to: 'cro', cid: 'CASE-2026-001', kind: 'email', read: false });
    expect(String(NOTIFS[0]?.['title'])).toMatch(/^Approval needed · /);
  });

  it("CRO Route-to-counsel unshifts counsel's email notification (base 2715)", () => {
    caseById('CASE-2026-001').stage = 'cro';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    openCaseDetail('CASE-2026-001');

    fireEvent.click(screen.getByRole('button', { name: 'Route to legal counsel' }));
    commit();

    expect(caseById('CASE-2026-001').stage).toBe('legal');
    expect(NOTIFS[0]).toMatchObject({ to: 'legal', cid: 'CASE-2026-001', kind: 'email' });
    expect(String(NOTIFS[0]?.['title'])).toMatch(/^Counsel review requested · /);
  });
});

describe('CS-02 — stage strip uses the base IDX map (source 2821)', () => {
  it("a case at 'legal' marks Detected/analyst done and CRO current (IDX legal:2), never all-grey", () => {
    caseById('CASE-2026-001').stage = 'legal'; // exec tier -> 4-step CASE_STAGES
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');

    const tags = stageStripTags(detail);
    expect(tags.map((t) => t.variant)).toEqual(['status-positive', 'status-positive', 'status-caution', 'count']);
  });

  it("a rejected case shows Detected done + analyst current + 'Returned' (IDX rejected:1)", () => {
    caseById('CASE-2026-001').stage = 'rejected';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');

    const tags = stageStripTags(detail);
    expect(tags[0]).toMatchObject({ variant: 'status-positive' });
    expect(tags[1]).toMatchObject({ variant: 'status-caution' });
    expect(tags[tags.length - 1]?.text).toContain('Returned');
    expect(tags[tags.length - 1]?.variant).toBe('status-alert');
  });

  it("a committee-tier case at 'final' marks the Final approval step current (IDX final:4)", () => {
    const c = caseById('CASE-2026-007'); // gov-charter, board tier -> CASE_STAGES_B
    c.stage = 'final';
    c.cond = APPROVAL.conditions[0] as string;
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-007');

    const tags = stageStripTags(detail);
    expect(tags).toHaveLength(5);
    expect(tags[4]).toMatchObject({ variant: 'status-caution' });
    expect(tags.slice(0, 4).every((t) => t.variant === 'status-positive')).toBe(true);
  });
});

describe('CS-03 / CS-05 — stage notes carry base copy, not dispatch prose', () => {
  it('committee stage renders the base copy (2858-2860) with no file-header parenthetical, plus the board-report link', () => {
    const c = caseById('CASE-2026-007');
    c.stage = 'committee';
    c.cond = APPROVAL.conditions[0] as string;
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openCaseDetail('CASE-2026-007');

    expect(detail.textContent).not.toContain('file header entry-points note');
    expect(detail.textContent).toContain('This change is in the Gap Closure Board Approval Report for the next meeting.');
    expect(within(detail).getByRole('button', { name: 'Open the board report' })).toBeInTheDocument();
  });

  it("only the cro stage's non-actor note claims 'notified in the app and by email' (base 2849 vs 2835/2861)", () => {
    caseById('CASE-2026-002').stage = 'cro';
    const committeeCase = caseById('CASE-2026-007');
    committeeCase.stage = 'committee';
    committeeCase.cond = APPROVAL.conditions[0] as string;

    const view = render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // cro stage, viewed by the analyst: the base's notified note (2849).
    let detail = openCaseDetail('CASE-2026-002');
    expect(detail.textContent).toContain('This case is with R. Fischer, Chief Risk Officer, notified in the app and by email.');

    view.unmount();
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // committee stage, viewed by the analyst: waiting note, no email claim (2861).
    detail = openCaseDetail('CASE-2026-007');
    expect(detail.textContent).toContain(`Waiting on ${APPROVAL.committee}. It sits in the Gap Closure Board Approval Report.`);
    expect(detail.textContent).not.toContain('notified in the app and by email');
  });
});

describe('CS-06 / CS-07 — language editor', () => {
  it('while editing, "Save the language" is the only primary and the Accept primary is not rendered (CS-06)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');

    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));

    expect(within(detail).queryByRole('button', { name: 'Accept & route for approval' })).not.toBeInTheDocument();
    const primaries = Array.from(detail.querySelectorAll('[data-lf-primitive="button"][data-variant="primary"]'));
    expect(primaries).toHaveLength(1);
    expect(primaries[0]?.textContent).toContain('Save the language');
  });

  it('re-opening the editor after a revert shows the reverted draft, not the abandoned custom text (CS-07)', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');
    const original = caseById('CASE-2026-001').base;

    // Edit and save custom wording.
    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Proposed language' }), { target: { value: 'Narrower wording, drafted by the analyst.' } });
    fireEvent.click(within(detail).getByRole('button', { name: 'Save the language' }));
    commit();
    expect(caseById('CASE-2026-001').lang).toBe('Narrower wording, drafted by the analyst.');

    // Revert to the OnSide draft.
    fireEvent.click(within(detail).getByRole('button', { name: 'Revert to the OnSide draft' }));
    commit();
    expect(caseById('CASE-2026-001').lang).toBe(original);

    // Re-open the editor: the buffer must resync to the reverted language.
    fireEvent.click(within(detail).getByRole('button', { name: 'Edit the language' }));
    expect((screen.getByRole('textbox', { name: 'Proposed language' }) as HTMLTextAreaElement).value).toBe(original);
  });
});

describe('CS-08 — restored affordances (base doclinks with live twin targets)', () => {
  it('renders the Document meta link and "matrix →", routed through onNavigate (base 2891-2892)', () => {
    const onNavigate = vi.fn();
    render(<Cases topbar={topbarFixture()} onNavigate={onNavigate} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');

    fireEvent.click(within(detail).getByRole('button', { name: 'matrix →' }));
    expect(onNavigate).toHaveBeenCalledWith('settings.toggles');

    // The Document meta link is the case title + arrow (base meta doclink).
    const docButton = within(detail)
      .getAllByRole('button')
      .find((el) => /→$/.test(el.textContent ?? '') && el.textContent !== 'matrix →');
    expect(docButton).toBeDefined();
    fireEvent.click(docButton as HTMLElement);
    expect(onNavigate).toHaveBeenCalledWith('onside.documents');
  });

  it('renders the in-context switch-user link when persona rows exist, wired to the matching row (base 2835)', () => {
    const priyaPress = vi.fn();
    const topbar = topbarFixture();
    topbar.profileMenuItems = [
      { id: 'rachel', label: 'Rachel Fischer', onPress: vi.fn() },
      { id: 'priya', label: 'Priya Raman', onPress: priyaPress },
    ];
    render(<Cases topbar={topbar} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openCaseDetail('CASE-2026-001');

    fireEvent.click(within(detail).getByRole('button', { name: 'Sign in as Priya to action it →' }));
    expect(priyaPress).toHaveBeenCalledTimes(1);
  });

  it('the closed state offers "Open the document →" (base 2870)', () => {
    caseById('CASE-2026-001').stage = 'closed';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');
    expect(within(detail).getByRole('button', { name: 'Open the document →' })).toBeInTheDocument();
  });

  it("PI2-D5 — 'Open the document →' fires a 'document'-kind deep link carrying the case's doc id (ONS-CASE-18: the pre-existing plain nav dropped it)", () => {
    const target = caseById('CASE-2026-001');
    target.stage = 'closed';
    const onNavigate = vi.fn();
    const onDeepLink = vi.fn();
    render(<Cases topbar={topbarFixture()} onNavigate={onNavigate} currentUser={ANALYST} onDeepLink={onDeepLink} />);
    const detail = openCaseDetail('CASE-2026-001');
    fireEvent.click(within(detail).getByRole('button', { name: 'Open the document →' }));

    expect(onDeepLink).toHaveBeenCalledWith({ screen: 'onside.documents', kind: 'document', id: target.doc });
    expect(onNavigate).not.toHaveBeenCalledWith('onside.documents');
  });

  it("PI2-D5 — 'Open the document →' still falls back to plain onNavigate when the shell has not wired onDeepLink (never a dead click)", () => {
    caseById('CASE-2026-001').stage = 'closed';
    const onNavigate = vi.fn();
    render(<Cases topbar={topbarFixture()} onNavigate={onNavigate} currentUser={ANALYST} />);
    const detail = openCaseDetail('CASE-2026-001');
    fireEvent.click(within(detail).getByRole('button', { name: 'Open the document →' }));

    expect(onNavigate).toHaveBeenCalledWith('onside.documents');
  });

  it('the CRO action row offers "View the email you were sent," opening the base openEmail preview (2846, 2650-2664)', () => {
    caseById('CASE-2026-001').stage = 'cro';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openCaseDetail('CASE-2026-001');

    fireEvent.click(within(detail).getByRole('button', { name: 'View the email you were sent' }));
    // PI2-D14 host migration STOP note (see CaseDetail.tsx's file header):
    // `detail` now itself sits inside the host case-side-car Drawer, so
    // this button's own pre-existing local `<Drawer>` (unchanged code,
    // `emailOpen`) nests a SECOND `[role="dialog"]` inside the first —
    // `screen.getByRole('dialog')` would now throw on 2 matches. Scoped to
    // the email dialog specifically (the one carrying the sender header,
    // never present on the host case dialog) rather than masking the
    // now-two-dialogs fact with a looser query; the underlying nested-
    // Drawer interaction itself is unresolved (see this lane's STOP
    // report) and is NOT what this assertion set is verifying.
    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(2);
    const emailDialog = dialogs.find((node) => node.textContent?.includes('onside@leapfi.ai'));
    expect(emailDialog).toBeDefined();
    const dialog = emailDialog as HTMLElement;
    expect(dialog.textContent).toContain('onside@leapfi.ai');
    expect(dialog.textContent).toContain('Rachel Fischer <rachel.fischer@northwindscu.org>');
    expect(dialog.textContent).toContain('[CASE-2026-001] Approval needed · ');
    expect(dialog.textContent).toContain('Sent because you are the approver for this policy tier.');
  });
});

describe('CS-09 — a replacement toast gets its own full auto-dismiss window', () => {
  it('the second confirmation toast survives past the first mount’s 5s timer', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    // First action: accept case 001 (toast armed at ~t=600).
    openCaseDetail('CASE-2026-001');
    fireEvent.click(screen.getByRole('button', { name: 'Accept & route for approval' }));
    commit(); // t=600
    expect(screen.getByText('Routed to the CRO. Notified in the app and by email.')).toBeInTheDocument();

    // Back to the list, second action ~4.2s later: reject case 002.
    fireEvent.click(screen.getByRole('button', { name: '← All cases' }));
    commit(4200); // t=4800
    openCaseDetail('CASE-2026-002');
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    commit(); // t=5400 — replacement toast set 200ms BEFORE the first mount's timer (t=5600) would fire

    const message = 'Returned to OnSide to redraft. The in-force document is untouched.';
    expect(screen.getByText(message)).toBeInTheDocument();

    // t=6000: past the first mount's 5.6s dismissal (+180ms exit). A keyed
    // remount re-arms the timer (dismisses at ~10.4s), so it must survive.
    commit(600);
    expect(screen.getByText(message)).toBeInTheDocument();

    // And it still auto-dismisses on its own schedule.
    commit(5000);
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });
});

describe('A-overlap-04 — the confirmation toast is no longer wrapped in a fixed top-right mount (base #toast is bottom-center, source 110)', () => {
  it('renders the self-positioning Toast with no screen-level fixed top-right wrapper around it', () => {
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);

    openCaseDetail('CASE-2026-001');
    fireEvent.click(screen.getByRole('button', { name: 'Accept & route for approval' }));
    commit();
    expect(screen.getByText('Routed to the CRO. Notified in the app and by email.')).toBeInTheDocument();

    // `Toast` (components/Toast.tsx) now renders its own fixed bottom-center
    // anchor, tagged `data-lf-toast-anchor` — assert it exists and that no
    // ancestor still carries the removed screen-level wrapper's inline
    // `top: 1.25rem; right: 1.25rem` (the old `TOAST_WRAP_STYLE`).
    const anchor = document.querySelector('[data-lf-toast-anchor]');
    expect(anchor).not.toBeNull();
    let node: HTMLElement | null = anchor as HTMLElement;
    while (node) {
      expect(node.style.top === '1.25rem' && node.style.right === '1.25rem').toBe(false);
      node = node.parentElement;
    }
  });
});

describe('CS-10 — adopted diff carries the base closed-state captions (2872-2875)', () => {
  it("a closed case's language card shows the Adopted marker and 'adopted and in force'", () => {
    caseById('CASE-2026-001').stage = 'closed';
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={ANALYST} />);
    openCaseDetail('CASE-2026-001');

    const languageCard = screen.getByRole('heading', { name: 'Proposed language' }).closest('section') as HTMLElement;
    expect(languageCard).not.toBeNull();
    const adoptedTag = Array.from(languageCard.querySelectorAll('[data-lf-primitive="tag"]')).find((el) => el.textContent === 'Adopted');
    expect(adoptedTag).toBeDefined();
    expect(adoptedTag?.getAttribute('data-variant')).toBe('status-positive');
    expect(languageCard.textContent).toContain('prior text, archived on adoption');
    expect(languageCard.textContent).toContain('adopted and in force');
    expect(languageCard.textContent).not.toContain('HITL review');
  });
});

describe('CS-13 — conditional approval shows in-flight state', () => {
  it('the pressed condition option stays mounted and loading for the commit window, then the stage flips', () => {
    caseById('CASE-2026-007').stage = 'cro'; // board tier: committee path
    render(<Cases topbar={topbarFixture()} onNavigate={() => {}} currentUser={CRO} />);
    const detail = openCaseDetail('CASE-2026-007');

    fireEvent.click(within(detail).getByRole('button', { name: 'Conditional approval…' }));
    const conditionButton = within(detail).getByRole('button', { name: APPROVAL.conditions[0] as string });
    fireEvent.click(conditionButton);

    // Mid-commit: the picker has NOT unmounted (its Cancel is still there),
    // and exactly one Button shows loading (aria-busy) — the pressed
    // option. (Query by attribute: a loading Button visually hides its
    // label, so its accessible name is the spinner state, not the text.)
    expect(within(detail).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    const busyButtons = within(detail)
      .getAllByRole('button')
      .filter((el) => el.getAttribute('aria-busy') === 'true');
    expect(busyButtons).toHaveLength(1);

    commit();
    expect(caseById('CASE-2026-007').stage).toBe('committee');
    // Commit resolved: the picker is gone and the committee stage renders.
    expect(within(detail).queryByRole('button', { name: APPROVAL.conditions[0] as string })).not.toBeInTheDocument();
    expect(within(detail).getByRole('button', { name: 'Attach committee minutes' })).toBeInTheDocument();
  });
});

describe("PI2-D5 — 'case'-kind deep link (App.tsx KIND VOCABULARY: id = the Case id; r10 acceptance — dispatch a 'case'-kind DeepLinkRequest and assert it lands on the correct case record)", () => {
  it('opens the exact matching case detail directly, and consumes the nonce', () => {
    const onDeepLinkConsumed = vi.fn();
    render(
      <Cases
        topbar={topbarFixture()}
        onNavigate={() => {}}
        currentUser={ANALYST}
        deepLink={{ screen: 'cases', kind: 'case', id: 'CASE-2026-002', nonce: 1 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    );

    const detail = document.querySelector('[data-lf-view="case-detail"]');
    expect(detail).not.toBeNull();
    expect((detail as HTMLElement).textContent).toContain('CASE-2026-002');
    // PI2-D14 host migration: the case content now opens in the shared
    // Drawer (C7) over the list, not as a full-page swap replacing it —
    // the list stays mounted underneath (same master-list-plus-overlay
    // shape every other Drawer-hosted detail screen already uses). The
    // deep link's own distinguishing behavior is that the Drawer opens
    // pre-populated with the exact matching case, not that the list
    // disappears.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Open cases' })).toBeInTheDocument();
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(1);
  });

  it('a deepLink of a different kind is ignored — the list still renders, never a mistaken case open', () => {
    const onDeepLinkConsumed = vi.fn();
    render(
      <Cases
        topbar={topbarFixture()}
        onNavigate={() => {}}
        currentUser={ANALYST}
        deepLink={{ screen: 'cases', kind: 'domain', id: 'mrm', nonce: 1 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    );

    expect(screen.getByRole('table', { name: 'Open cases' })).toBeInTheDocument();
    expect(document.querySelector('[data-lf-view="case-detail"]')).toBeNull();
    expect(onDeepLinkConsumed).not.toHaveBeenCalled();
  });

  it('an unresolvable case id still consumes the nonce and opens nothing (never a fabricated case)', () => {
    const onDeepLinkConsumed = vi.fn();
    render(
      <Cases
        topbar={topbarFixture()}
        onNavigate={() => {}}
        currentUser={ANALYST}
        deepLink={{ screen: 'cases', kind: 'case', id: 'NO-SUCH-CASE', nonce: 3 }}
        onDeepLinkConsumed={onDeepLinkConsumed}
      />,
    );

    expect(screen.getByRole('table', { name: 'Open cases' })).toBeInTheDocument();
    expect(onDeepLinkConsumed).toHaveBeenCalledWith(3);
  });
});
