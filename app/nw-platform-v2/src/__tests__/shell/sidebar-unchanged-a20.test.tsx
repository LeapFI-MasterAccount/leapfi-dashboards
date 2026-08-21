/**
 * AC-A20-12 (design_system_spec.md §2.9.13, amendment A20, PI2-D47) —
 * "Sidebar unchanged: `Sidebar.tsx`'s `NAV` table and rendered top-level
 * item count are byte-identical to pre-A20... no `Register`/`register`
 * entry added anywhere in it, top-level or nested." Verification: grep.
 *
 * The relocated opportunity register (§2.9.11) is reachable only via the
 * existing `studio:design` Sidebar entry, in-screen — zero nav-budget
 * impact, confirmed here the same mechanical way the ruling's own
 * "Verification: grep" instructs: no case-insensitive "register" literal
 * anywhere in `Sidebar.tsx`'s source.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIDEBAR_SOURCE = fs.readFileSync(path.resolve(__dirname, '../../components/Sidebar.tsx'), 'utf8');

describe('AC-A20-12 — Sidebar unchanged', () => {
  it('grep: no case-insensitive "register" literal anywhere in Sidebar.tsx', () => {
    expect(SIDEBAR_SOURCE).not.toMatch(/register/i);
  });
});
