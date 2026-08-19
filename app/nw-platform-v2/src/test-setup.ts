/**
 * Shared Vitest setup (loaded via vitest.config.ts `setupFiles`).
 *
 * - Registers @testing-library/jest-dom's matchers on Vitest's `expect`
 *   (the `/vitest` entry also augments the `vitest` module types, so test
 *   files that `import { expect } from 'vitest'` type-check under the app's
 *   strict tsconfig without any tsconfig edits).
 * - Stubs `Element.prototype.scrollIntoView`, which jsdom does not
 *   implement: the ported v1 behavior calls it (base `acc.scrollIntoView`,
 *   survey_map.md source 3021–3054, ported in views/DomainsAccordion.tsx
 *   and screens/OnSideDocuments.tsx). The stub is a no-op — tests may spy
 *   on it to pin the scroll behavior, per D17 (observe, never adapt the
 *   app).
 *
 * @testing-library/react's automatic post-test `cleanup()` is active
 * because `globals: true` exposes `afterEach` (RTL registers it itself).
 */
import '@testing-library/jest-dom/vitest'

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
