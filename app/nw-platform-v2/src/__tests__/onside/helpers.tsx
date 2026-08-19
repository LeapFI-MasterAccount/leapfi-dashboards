/**
 * Shared fixtures for the OnSide regression suite (D17).
 *
 * Not a test file (vitest `include` only picks up `*.test.{ts,tsx}`) —
 * this only builds the Topbar/Sidebar passthrough props every OnSide
 * screen requires (`topbar: TopbarProps`, `onNavigate`), matching the
 * passthrough contract each screen's own file header documents. Values
 * are inert fixtures; no test in this suite pins Topbar behavior (Topbar
 * is base shell chrome, survey_map.md L27–116, covered by the shell
 * smoke suite, not this one).
 */
import type { TopbarProps } from '../../components/Topbar'

export function makeTopbarProps(): TopbarProps {
  return {
    breadcrumb: 'NorthWinds · OnSide',
    onOpenBoardDeck: () => {},
    date: 'Aug 18, 2026',
    profile: { name: 'R. Fischer' },
    profileMenuItems: [],
  }
}
