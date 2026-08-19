/**
 * Home — Screen anatomy §5.1 "Home — Step 1 'Day one'" (design_system_spec.md),
 * fed by demo_script_draft.md Step 1 ("Day one") and its G1/G11 gap-register
 * entries.
 *
 * Region map (§5.1): Topbar (shell) → page title → StatCard row (C1, 2
 * cards: the freed-capacity figure and the FTE figure — survey_map.md
 * 4197–4296) → utility corner (optional "Customize tiles" ghost Button,
 * conditional) → primary CTA. Components used per spec: Topbar (C4),
 * Sidebar (C3), StatCard (C1), Button (P2).
 *
 * AMBIGUITY RESOLVED — Topbar/Sidebar data ownership: both composites
 * require persona/profile/notification/date/nav-callback data this screen
 * does not own (see `Topbar.tsx`'s `TopbarProps` and `Sidebar.tsx`'s
 * `SidebarProps`). Following the exact passthrough pattern already landed
 * in this worktree by the sibling `BoardDeck.tsx` dispatch (`topbar:
 * TopbarProps` full bundle), this screen accepts a full `topbar` prop and,
 * for Sidebar, only `onNavigate` (+ optional `sidebarVersionLabel`) — the
 * `activeId` half of `SidebarProps` is intrinsic to which screen is
 * rendering, so it is hardcoded here to `'home'` rather than accepted as a
 * prop the integrator could get wrong.
 *
 * AMBIGUITY RESOLVED — "utility corner ... Customize tiles" (§5.1 region
 * map): the spec's own text gates this on "only if a customization entry
 * point is exposed per survey_map.md 4122–93... if not currently exposed,
 * this spec does not require adding one." No customization data/handler is
 * named anywhere in this dispatch's allowlist or its cited sources, so no
 * placeholder "Customize tiles" Button is added — adding one without a
 * real handler would be exactly the kind of fabricated intermediate state
 * this persona's Core Principle 3 rules out ("no fabricated intermediate
 * state"). STOP-item if a future dispatch surfaces real customization data.
 *
 * G11 label requirement (§5.1, cross-referenced from §5.7): "both the Home
 * StatCard ('cost capacity already freed') and the deck's economics
 * DeckSlide ('value at adoption') carry explicit measure labels... this is
 * a Label (P3) addition on each StatValue (P11), not a new component." The
 * first StatCard's `label` prop below is set to the exact phrase G11 names
 * ("Cost capacity already freed") so this figure can never render next to
 * the deck's differently-measured $4.5M/yr figure and read as a
 * contradiction to a numerate board member.
 *
 * OQ-1 (§5.1, §10): the spec flags a design tension between the "Start the
 * demo" Button and Step 1's own "no clicks" `do` line, and states "this
 * spec proceeds on the latter reading" (Home is the sanctioned single entry
 * point precisely because it's the arc's cold open). This file builds
 * exactly that reading — the primary CTA is present, wired, and does not
 * perform Step 1's own demoed action (there isn't one). No code change
 * follows from OQ-1 remaining open; it is a ratification-track item, not an
 * implementation blocker.
 *
 * AMBIGUITY RESOLVED — "Start the demo" action ownership: §5.1 says the
 * Button "transitions PresenterRail `Hidden` → `Visible[step=1]`" (§4), but
 * PresenterRail (C21) is outside this dispatch's ALLOWLIST (`Home.tsx`/
 * `OnSideFeed.tsx` only). This screen therefore exposes a required
 * `onStartDemo: () => void` prop and fires it verbatim on press — it does
 * not own or fake the rail's state machine itself (Core Principle 1: never
 * render a claim about a system this component cannot see). The
 * integrating dispatch wires this callback to the real rail transition.
 *
 * Layout constants (240px sidebar column, 2rem content padding, 1.5rem
 * title size): design_system_spec.md §1.4 states this document carries no
 * px/spacing values by design (colors only); these are therefore
 * implementer judgment calls, same category as `Drawer.tsx`'s documented
 * 480px width / 200ms transition constants — chosen for a readable,
 * conventional dashboard layout, not sourced from any doctrine file.
 *
 * STOP-item — no executable test run: this worktree's `package.json` (out
 * of this dispatch's ALLOWLIST) has no test runner or component-testing
 * library installed, matching every sibling composite already landed here
 * (see `BoardDeck.tsx`'s identical STOP-item). TDD-with-executed-output is
 * therefore not achievable within this dispatch's file boundary; verified
 * instead via `npx tsc --noEmit` against the whole `src/` tree (strict
 * mode, `exactOptionalPropertyTypes`) to confirm this file type-checks
 * against the real `Topbar`/`Sidebar`/`StatCard`/`Button` prop shapes.
 * Recommending the same test-tooling follow-up dispatch `BoardDeck.tsx`
 * already recommends.
 */
import type { CSSProperties } from 'react';
import { Topbar } from '../components/Topbar';
import type { TopbarProps } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarProps } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/primitives/Button';

const SCREEN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  background: 'var(--bg)',
  boxSizing: 'border-box',
};

const BODY_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flex: '1 1 auto',
  minHeight: 0,
};

const SIDEBAR_REGION_STYLE: CSSProperties = {
  flex: '0 0 240px',
};

const MAIN_STYLE: CSSProperties = {
  flex: '1 1 auto',
  minWidth: 0,
  overflowY: 'auto',
  boxSizing: 'border-box',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.75rem',
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  font: 'inherit',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--ink)',
};

const STAT_ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
};

const CTA_ROW_STYLE: CSSProperties = {
  display: 'flex',
};

export interface HomeProps {
  /** Full Topbar prop bundle — this screen does not own persona/profile/notification/date data (same passthrough pattern as `BoardDeck.tsx`). */
  topbar: TopbarProps;
  /** Sidebar navigation hook. `activeId` is intrinsic to this screen ('home') and is not accepted as a prop. */
  onNavigate: SidebarProps['onNavigate'];
  sidebarVersionLabel?: string;
  /**
   * Primary CTA (§5.1): "Start the demo." Fires the PresenterRail
   * `Hidden` → `Visible[step=1]` transition (§4) — this screen only
   * requests it; PresenterRail (C21) is outside this dispatch's allowlist
   * and owns the actual state machine.
   */
  onStartDemo: () => void;
}

export function Home({ topbar, onNavigate, sidebarVersionLabel, onStartDemo }: HomeProps) {
  // Built conditionally (rather than `versionLabel={sidebarVersionLabel}`
  // directly) because this project's `exactOptionalPropertyTypes` setting
  // treats Sidebar's optional `versionLabel` as exactly `string`, not
  // `string | undefined` — same pattern `StatCard.tsx`/`BoardDeck.tsx`
  // document for their own optional-prop forwarding.
  const sidebarProps: SidebarProps = {
    activeId: 'home',
    onNavigate,
    ...(sidebarVersionLabel !== undefined ? { versionLabel: sidebarVersionLabel } : {}),
  };

  return (
    <div data-lf-screen="home" style={SCREEN_STYLE}>
      <Topbar {...topbar} />
      <div style={BODY_ROW_STYLE}>
        <div style={SIDEBAR_REGION_STYLE}>
          <Sidebar {...sidebarProps} />
        </div>
        <main id="home-main" style={MAIN_STYLE} aria-labelledby="home-page-title">
          <h1 id="home-page-title" style={TITLE_STYLE}>
            Home
          </h1>
          <div style={STAT_ROW_STYLE}>
            {/* survey_map.md 4197–4296: "$540,000/yr freed". G11: label carries
                the exact "cost capacity already freed" measure distinction. */}
            <StatCard label="Cost capacity already freed" value="$540,000" unit="/yr" />
            {/* survey_map.md 4197–4296: "3.5 FTE". */}
            <StatCard label="Capacity freed" value="3.5" unit="FTE" />
          </div>
          <div style={CTA_ROW_STYLE}>
            <Button variant="primary" label="Start the demo" onPress={onStartDemo} />
          </div>
        </main>
      </div>
    </div>
  );
}
