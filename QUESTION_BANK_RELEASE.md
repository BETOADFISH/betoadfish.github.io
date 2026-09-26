# Question bank releases

Public catalogs contain question groups, textbook topic navigation and estimated answer times. Complete source PDFs and paper archives must not be deployed. CIE Paper 3 is excluded. Questions with unavailable copyright content are excluded rather than published with missing figures.

## Local build

1. `scripts/scan-al.py` reads all paired Unit 4–6 / 7402 PDFs, normalises a private copy and caches page coordinates in `work/al-layout`.
2. `scripts/build-al.py` builds complete AL question groups in `work/al-catalogs`; reconcile every paper against its printed mark total in `qa/expansion/al-question-audit.json`. Unit 5 articles stay with the last question; AQA essays stay as one 25-mark choice.
3. `scripts/prepare-practice-assets.py` reads private baseline catalogs (`work/base-catalogs`) plus AL catalogs and writes question-only PDF assets. Source originals live in `work/private-sources` or `work/al-sources`. Existing small questions share their major-question assets. Content outside approved regions is redacted.
4. `scripts/enrich-practice-catalogs.py` adds textbook navigation and per-question time estimates. Time estimates use source exam durations, rounded to 15 seconds; AQA Paper 3 essays use 45 minutes. ESAT practice uses a 90-second estimate per MCQ. Parent times sum their unique leaves. Topic rules and titles are maintained here.
5. Remove unused generated assets before building. Never remove teaching originals. Run all test scripts from the Pages workflow, TypeScript and the production build. Render representative PDFs, including reading articles and essay marking criteria; check desktop and mobile interactions.
6. Back up D1 before reseeding. `seed-question-bank.mjs` preserves edits and drafts; it retires untouched CIE Paper 3 records. Review preserved retired records manually if any exist. Deploy the Worker, sync the approved public snapshot, then deploy Pages.

The public site loads same-origin catalogs and PDF fragments, so visitors do not depend on workers.dev. The private admin remains on Cloudflare. A public practice PDF can be saved; removing complete source downloads is not DRM.

The Yidu mark uses the public logo from https://www.yidutech.com/static/cn/pc/images/logo.png (retrieved 2026-09-22), retaining its original contours instead of a low-resolution polygon trace.

The local 2020 Unit 5 question paper lacked its scientific article. Its private normalized copy includes pages 2–8 from the Pearson article P64728A (WBI15, 11 June 2020), retrieved from https://cdn.savemyexams.com/uploads/2022/11/wbi15-01-scientific-article.pdf. The teaching original is unchanged; only the relevant reading material accompanies the final question in public practice exports.


## Anonymous download counters (2026-09-26)

Apply `backend/migrations/0002-download-events.sql` before deploying the Worker. The owner-only dashboard at `/admin` shows 7/30/90-day totals and daily rows by bank and QP/MS. The frontend sends one random event ID per export attempt after success or error; repeats of the same event ID are ignored. Local previews and re-saving an already-generated PDF are not counted. No visitor identifier, cookies, IP, search text or question IDs are stored by this feature. Old events expire after 90 days. These are best-effort browser reports: network restrictions, blockers or closed pages may omit events. Generated PDF bytes are not hosting bandwidth and a triggered download does not prove the file was saved. Statistics begin at deployment, with no invented historical data.

The Yidu logo now uses original vector paths from the cover of its 2025 annual report: https://www.yidutech.com/uploads/20250725/821156eabd9ecb6aeeb6bdb42c4c8b4b.pdf . It is displayed in the project's single-colour treatment, with visible bounds preserved. The former low-resolution website PNG is unused.

## Portfolio design revision (2026-09-27)

The previous published version is preserved by Git tag `backup/pre-design-2026-09-27` at `a7a9585120c03336dbb57b94b70d5f90f5e48218`. The local `Website Backups/2026-09-27-pre-design` folder contains the source archive, the actual GitHub Pages artifact and a checked manifest. Both ZIP archives passed integrity checks; the original six download files were unchanged. The published artifact's old homepage, mobile navigation and approved question snapshot were verified before deployment.

The revision follows the installed Anthropic frontend-design skill, with humanizer and humanizer-zh for copy. It replaces the abstract homepage diagram with the existing molecular illustration, removes decorative numbering and simplifies shared project layouts. Scientific qualifiers, project colours, question-bank behaviour and private administration are preserved. `scripts/check-portfolio-release.mjs` checks 20 built routes for public copy, scientific qualifications and local asset links. No connected browser was available for rendered or touch-interaction validation.

## Mobile layout and PDF preview (2026-09-26)

The header uses a disclosure menu below 720 px. The question selection panel uses a native modal below 851 px, with a close button, background scroll lock and bottom safe-area spacing. Mobile inputs use 16 px text and controls have larger touch targets. Small research diagrams use a grid; touch devices open 3D structures on demand.

PDF previews render one page at a time, capped at about 2.5 million canvas pixels, using PDF.js's legacy browser build. Previous/next controls replace the full-document canvas list. Export results offer both Save PDF and Open PDF for mobile browsers with different download behaviour. Public network requests and anonymous event IDs no longer require AbortSignal.timeout or crypto.randomUUID. Automated mobile checks cover cancellation, event IDs and canvas memory bounds; they do not replace a real-device interaction check.
