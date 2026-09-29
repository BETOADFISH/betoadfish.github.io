# Portfolio restoration and two refinement passes

Visual reference: `a7a9585120c03336dbb57b94b70d5f90f5e48218`.
Content baseline: `a3bf48b8442f6b43b92370868e9184a40e9f303a`.
Rollback reference: `backup/pre-style-restore-2026-09-29` (content baseline).

## First pass: restore the preferred visual language

Restored the split homepage and interactive research map, local Inter fonts,
rounded project cards, wide HuBisCO card, existing project palettes and original
project-page treatment. Kept the latest biography, dates, consulting role,
scientific evidence qualifications and published question catalogs. The current
Yidu vector mark and mobile navigation are retained.

Refined group headings, project dates, card spacing, wrapping and tablet/mobile
layouts. An independent CSS review caught an overly narrow tablet map and
incorrect selectors; these were corrected. Mobile tool icons now fit their
columns. The dark Yidu mark and keyboard focus have clearer contrast.

## Second pass: make the existing interactions more reliable

- Research map rotation pauses on hover, keyboard focus and reduced-motion
  preference. Manual selection still displays the description immediately.
- Mobile navigation closes on Escape, outside pointer input and desktop resize.
- Project next/previous controls keep the active tab visible in the mobile rail.
- Editing, reordering or replacing a selection invalidates its previous PDF.
  Late exports cannot overwrite a newer selection or a different question bank.
- Export failures and retry controls appear inside the mobile selection panel.
- Empty results have a direct reset action, including the question-size filter.

## Validation

Passed TypeScript, protected-content hashes (22 files), four-bank catalog and
real QP/MS PDF generation, strict topic scope, marks/time random practice, admin
authorization, GitHub authentication, mobile request/canvas limits and async
export race regression checks. The export regression test is included in CI.
Production output is checked on all 20 English/Chinese routes for public copy,
evidence qualifications and asset references.

No connected browser was available in this session, including an attempted
in-app browser launch. Source review and automated checks are not a substitute
for rendered-layout or physical-phone interaction testing. Deployment and live
route/catalog/download checks are recorded separately in `qa/style-restore-live.json`.

No backend deployment or database mutation is part of this release.
