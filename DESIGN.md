# Portfolio restoration and two review passes — 29 September 2026

The user prefers the style immediately before the 27 September redesign. The
reference is a7a9585; current content and functionality are anchored to a3bf48b.
This is a restoration with two focused refinements.

## Design plan and review against the request

Palette: white #ffffff, ink #17251c, mint #cbf6c1, dark forest #101a15,
muted green #5d6961, border #dce5dd. Existing institution and exam-board colours
keep their meanings. No new accent colour system.

Type: restore locally bundled Inter for Latin headings and body. Chinese continues
to use system fallbacks. Keep the old hierarchy with fluid heading sizes and
comfortable body line lengths.

Layout, left aligned:

    name + current introduction | interactive research map
    current project categories
      wide HuBisCO card
      original colour-coded project cards
    current biography and CV downloads

The memorable element is the research map, supported by institution marks and
coloured project panels. Remove the rejected photo hero and flattened editorial
rows. Preserve new copy, evidence limits, Yidu role, logos and question-bank data.

## Round 1: restore the visual identity and resolve layout friction

Restore the map, original cards, Inter, palette, mastheads and background marks.
Keep HuBisCO wide. Adjust tablet card columns, reading widths, mobile references,
touch targets and crowded project facts without changing project content.

## Round 2: examine actual use, then repair interaction defects

Review keyboard navigation, mobile menu dismissal, project-step visibility and
question-paper export state. Prevent stale PDF links after changing selection,
show export failures inside the mobile selection panel and provide a direct
reset when filters return no results. Keep current classification and random
selection rules and reduced-motion support.

## Release evidence

Content preservation, bilingual static-route checks, classification and
question-bank regression tests, PDF export tests and production build must pass.
Verify deployed catalogs against the content baseline and the published frontend
against the final commit. Record browser availability honestly; static checks
alone are not rendered visual validation.
