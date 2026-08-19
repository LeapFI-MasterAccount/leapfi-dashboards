/**
 * Shared fixtures for the reporting_cases regression batch (D17).
 *
 * Not a test file (does not match vitest's `*.test.{ts,tsx}` include) — it
 * only builds the prop bundles the screens under test require. Tests observe
 * the app; nothing here adapts the app to the tests.
 */
import type { TopbarProps } from '../../components/Topbar';
import { CURRENT } from '../../data/studio';

/** Minimal valid TopbarProps bundle — the screens under test take the full
 * bundle as a passthrough prop (Reporting.tsx / Cases.tsx `topbar` prop);
 * none of the pinned behaviors in this batch live in the Topbar itself. */
export function topbarFixture(): TopbarProps {
  return {
    breadcrumb: 'Northwinds Credit Union',
    onOpenBoardDeck: () => {},
    date: 'Aug 15, 2026',
    profile: { name: CURRENT.name, initials: CURRENT.ini },
    profileMenuItems: [],
  };
}
