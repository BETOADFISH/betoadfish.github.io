# Bill — Molecular Science & Biotech Intelligence

Scientific portfolio, ready for GitHub Pages at https://betoadfish.github.io/.

## First publication

Create the public repository `BETOADFISH/betoadfish.github.io`. Upload this source to its `main` branch. In Settings → Pages → Build and deployment, select **GitHub Actions**. The included Publish portfolio workflow builds and deploys the website. Run the workflow manually after selecting Pages if the initial run happened before Pages was enabled.

## Future updates

Edit `lib/projectData.ts` for project content and values, `app/page.tsx` for homepage copy, `app/layout.tsx` for identity/contact details, and `app/globals.css` for styling. Commit to `main`; the workflow rebuilds and publishes automatically. Revert a commit to restore an earlier version. Files can also be edited in the GitHub web editor.

## Local work

Requires Node 22.13+ and pnpm 11. Run `pnpm install`, `pnpm dev`, and `pnpm build`. The static output is `dist/client`; `pnpm start` previews it locally at http://127.0.0.1:5175/.

Both site routes are static: `/` and `/projects/hubisco`. Keep `output: 'export'` in the Next config and do not enable trailingSlash with this pinned Vinext release. No server backend, tracker, login, database, API key or paid service is needed by the site.

## Content and evidence

Primary protein/accent colour: `#CBF6C1`. Structure explorer: NGL with locally bundled experimental 9RUB/5RUB files, explicit rotation/zoom/residue controls and a static fallback. Fonts are self-hosted.

Original dissertations and spreadsheets are excluded. Public source and public website contain only the curated case study, supplied protein imagery, reference structures and selected reported values. Unverified contact/degree/CV fields remain pending.

Alternative-substrate turnover was not established in the dissertation; HuBP was unavailable and exploratory assays used Hu6P/Ru5P. NMR reports PHI precursor chemistry. The calculated two-point slope is not a mechanistic kinetic constant. Concentration and Vmax values are owner-brief-supplied. 9RUB is wild type, binds RuBP rather than HuBP, and represents carbamylated Lys191 through LYS plus covalently linked FMT records.

Sources: [9RUB](https://www.rcsb.org/structure/9RUB), [5RUB](https://www.rcsb.org/structure/5RUB), project-supplied material. NGL is MIT licensed; Inter uses the SIL Open Font License.
