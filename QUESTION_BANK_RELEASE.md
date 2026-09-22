# Question bank releases

Public catalogs contain question groups, textbook topic navigation and estimated answer times. Complete source PDFs and paper archives must not be deployed. CIE Paper 3 is excluded. Questions with unavailable copyright content are excluded rather than published with missing figures.

## Local build

1. `scripts/scan-al.py` reads all paired Unit 4–6 / 7402 PDFs, normalises a private copy and caches page coordinates in `work/al-layout`.
2. `scripts/build-al.py` builds complete AL question groups in `work/al-catalogs`; reconcile every paper against its printed mark total in `qa/expansion/al-question-audit.json`. Unit 5 articles stay with the last question; AQA essays stay as one 25-mark choice.
3. `scripts/prepare-practice-assets.py` reads private baseline catalogs (`work/base-catalogs`) plus AL catalogs and writes question-only PDF assets. Source originals live in `work/private-sources` or `work/al-sources`. Existing small questions share their major-question assets. Content outside approved regions is redacted.
4. `scripts/enrich-practice-catalogs.py` adds textbook navigation and per-question time estimates. Time estimates use source exam durations, rounded to 15 seconds; AQA Paper 3 essays use 45 minutes. ESAT practice uses a 90-second estimate per MCQ. Parent times sum their unique leaves. Topic rules and titles are maintained here.
5. Remove unused generated assets before building. Never remove teaching originals. Run all four test scripts from the Pages workflow, TypeScript and the production build. Render representative PDFs, including reading articles and essay marking criteria; check desktop and mobile interactions.
6. Back up D1 before reseeding. `seed-question-bank.mjs` preserves edits and drafts; it retires untouched CIE Paper 3 records. Review preserved retired records manually if any exist. Deploy the Worker, sync the approved public snapshot, then deploy Pages.

The public site loads same-origin catalogs and PDF fragments, so visitors do not depend on workers.dev. The private admin remains on Cloudflare. A public practice PDF can be saved; removing complete source downloads is not DRM.

The Yidu mark uses the public logo from https://www.yidutech.com/static/cn/pc/images/logo.png (retrieved 2026-09-22), retaining its original contours instead of a low-resolution polygon trace.

The local 2020 Unit 5 question paper lacked its scientific article. Its private normalized copy includes pages 2–8 from the Pearson article P64728A (WBI15, 11 June 2020), retrieved from https://cdn.savemyexams.com/uploads/2022/11/wbi15-01-scientific-article.pdf. The teaching original is unchanged; only the relevant reading material accompanies the final question in public practice exports.
