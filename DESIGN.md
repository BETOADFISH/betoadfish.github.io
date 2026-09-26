# Portfolio design, September 2026

Audience: research supervisors, collaborators and recruiters reviewing Bill Huang's work; students use the separate Biology tool. The site must show work that can be discussed publicly, without internal editing notes or client and drug-product names from Yidu.

Direction: lead with an actual molecular illustration and the person's name. Let project content carry the identity. Remove the abstract evidence-orbit hero, repeated category numbering, promotional headings and decorative skill lists. Keep the existing project colours, institution marks, wide HuBisCO entry, bilingual routes, theme switch and mobile navigation.

Palette: paper #ffffff; text #26342f; secondary text #5f6c66; research green #285c48; clinical blue #12364a; enzyme purple #6c4668. Existing project and exam-board colours retain their meanings. Dark surfaces continue to use the existing accessible colour tokens.

Typography: Trebuchet MS for Latin display headings, Segoe UI for interface and body text, PingFang SC or Microsoft YaHei for Chinese. Use system fallbacks without a new font CDN. Display size varies with the viewport; Chinese uses normal character spacing. Text columns stay below 72 characters.

Layout alternatives reviewed:

```
Rejected: slogan | abstract network; repeated equal cards; numbered skills
Chosen:   name + short introduction | molecular figure with project link
          wide HuBisCO project
          remaining research / consulting work
          compact Biology tool entry
          background and original CV downloads
```

The first draft resembled a generic editorial grid. The chosen direction gives the molecular figure the only large decorative role, keeps logos secondary, and uses a different compact treatment for the practical tool. Project pages use a restrained masthead with a normal-size institution mark rather than an oversized watermark. Existing scientific figures and interactions remain available.

Copy: use humanizer-zh and humanizer. State experimental observations directly, retain their limits, and move record provenance to relevant figure notes. Do not upgrade a qualitative result to a quantitative claim, change measured versus modelled status, or imply sole data acquisition. Source PDFs and CV downloads remain byte-identical.

Verification: bounded review of shared layouts, bilingual output, links, scientific qualifications, mobile breakpoints and functional regression tests. The current session has no connected browser, so source/build checks do not count as rendered or real-device validation.
