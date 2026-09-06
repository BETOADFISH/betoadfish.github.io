# Bill Huang | Molecular Science & Biotech Intelligence

Portfolio: https://betoadfish.github.io/

## Publishing and maintenance

The `Publish portfolio` GitHub Actions workflow builds and publishes every push to `main`. GitHub Pages uses the GitHub Actions source. Revert a commit to restore an earlier version. No server, database, tracker, API key or paid hosting service is required.

| Edit | Location |
| --- | --- |
| Homepage | `app/page.tsx` |
| Navigation and contact | `components/site-shell.tsx` |
| Shared metadata and initial appearance | `app/layout.tsx` |
| Chinese copy and language routing | `lib/zh.json`, `lib/locale.ts`, `app/zh` |
| Institution artwork | `public/brands`, `components/institution-mark.tsx` |
| Project cards and categories | `lib/work.ts` |
| Project narratives | `app/projects/<project>/page.tsx` |
| Biotechnology case | `app/intelligence/3d-cell-culture/page.tsx` and `lib/culture-content.json` |
| Colours and responsive layout | `app/globals.css` |
| PET traces / checkerboards | `lib/pet-traces.json` / `lib/mcr-plates.json` |
| Downloadable data | `public/data` |
| Downloadable CV and brief | `public/downloads` |
| Selected source figures | `public/evidence/hubisco` |

Keep displayed JSON and downloadable CSV data in agreement. When adding a project, add its route, catalog entry, colour variables, source notes and sitemap URL. Retain the distinction between measured findings, personal project accounts and proposed next experiments.

## Local work

Use Node 22.13+ and pnpm 11. Run `pnpm install`, `pnpm dev`, `pnpm exec tsc --noEmit`, and `pnpm build`. The static output is `dist/client`; `pnpm start` previews it at http://127.0.0.1:5175/.

Keep `output: 'export'` in the Next config. Do not enable `trailingSlash` with this pinned Vinext release. Recharts can report a zero-size warning during static rendering; check that charts render after hydration in the browser.

## Site structure

- `/`: introduction, four selected cases, approach, about and contact
- `/projects`: research directory
- `/projects/hubisco`: RuBisCO structure and biochemical evidence
- `/projects/pet-hydrolase`: protein-production account and CCH11 traces
- `/projects/mcr1-colistin`: colistin-adjuvant work and 14 checkerboards
- `/intelligence`: biotechnology assessment directory
- `/intelligence/3d-cell-culture`: qualitative platform review

## Visual identities and source scope

| Project | Accent | Evidence feature |
| --- | --- | --- |
| HuBisCO | `#CBF6C1` | NGL reference structures, labelled gels, assay figure and NMR |
| PET hydrolases | `#C8E4FA` | 100 time points, 12 wells, DIES/BHET selection |
| Colistin adjuvants | `#DFD0F4` | 14 records, 896 OD600 values, individual-well selection |
| 3D cell culture | `#F6D7A7` | Seven material families and six diligence dimensions |

The HuBisCO structures are locally bundled experimental 9RUB and 5RUB wild-type references. 9RUB binds RuBP, not HuBP. Its carbamylated Lys191 is represented by LYS plus linked FMT records. Alternative-substrate turnover was not established; NMR follows supporting-enzyme precursor chemistry. The brief uses the dissertation's conservative conclusions. Supplementary concentration values retain their original attribution.

PET plots retain the CCH11 worksheet values and well labels. They do not establish independent protein preparations, calibrated catalytic constants or polymer-degradation rates. Checkerboard concentration units follow the source figures; strain labels are reproduced without inferring MCR-1 expression or assigning unverified FIC indices. The 3D culture framework is a qualitative reconstruction, not a laboratory benchmark or product ranking.

Only curated public derivatives are included. Original training files, dissertations and workbooks remain outside the repository. Current consulting-company and drug identities are excluded. The owner-authorized CV is retained unchanged; it is not treated as the latest source for every project claim. Replace `HuBisCO-project-brief.pdf` or `Bill-Huang-CV.pdf` to update a download without changing its URL.

Sources: [9RUB](https://www.rcsb.org/structure/9RUB), [5RUB](https://www.rcsb.org/structure/5RUB), owner-supplied research and training records. NGL is MIT licensed; Inter uses the SIL Open Font License. Fonts and protein structures are self-hosted.

## Languages and appearance

Each of the seven content routes has a Chinese version under `/zh` (14 routes in total). The top-right language control opens the same page in the other language and preserves its query and section anchor. Language and light/dark choices are saved locally; appearance follows the system setting until explicitly selected. Shared chrome, narratives, figure descriptions and interactive controls are translated through `lib/zh.json`. Original source figures, scientific identifiers and downloadable files retain their original content. When editing English copy, update its corresponding dictionary entry and verify both languages after the build.

All four projects use the same gradient-panel treatment around authentic institution artwork. The marks identify the project setting and do not imply institutional endorsement. Official artwork sources, retrieved 6 September 2026:

- Cambridge: https://www.cam.ac.uk/sites/default/files/university-cambridge-full-colour-preferred-logo-transparency-2362x491.png
- Portsmouth: https://www.port.ac.uk/themes/custom/portsmouth/images/logo-mobile.png
- Melbourne: https://biosig.unimelb.edu.au/mcsm_membrane/static/imgs/university_melbourne.jpg (older horizontal artwork served by the university's BioSig site)
- Shanghai Dynamax Group: https://www.dynamaxgroup.com/uploadfiles/2011611335539.jpg (original header image displayed through a logo-sized viewport)

The former private-equity employer is named consistently with the public CV. Assessed-business details and current consulting-company/drug identities remain excluded.
