# Topic classification audit — 28 September 2026

The site uses textbook/specification navigation. These tags are our question
index, not topic labels assigned by the examination boards.

## Sources and boundaries

- AQA: the local AQA Biology textbook and [7402 specification](https://www.aqa.org.uk/subjects/biology/a-level/biology-7402/specification/subject-content). Cells is 3.2; translation is 3.4.2; directional selection including antibiotic resistance is 3.4.4; control of gene expression is 3.8. Why antibiotics do not affect viruses is part of 3.2.4. An organelle's role in protein secretion can be a Cells question.
- Edexcel: local Student Books 1–2 and [IAL specification, Issue 2](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Biology/2018/Specification-and-Sample-Assessment/International-A-Level-Biology-Spec.pdf). Protein structure belongs to 2B; differentiation and epigenetics to Topic 3; hormone/transcription-factor regulation to 7.22.
- CIE: local Cambridge Biology textbook and [9700 syllabus 2025–2027](https://www.cambridgeinternational.org/Images/664560-2025-2027-syllabus.pdf). Gene control is 16.3, not Chapter 19. AS papers use Chapters 1–11; Paper 3 stays excluded.
- ESAT: [official Biology guide, June 2025](https://uat-wp.s3.eu-west-2.amazonaws.com/wp-content/uploads/2025/07/06120052/ESAT_Guide_Biology_June_2025.pdf), B1–B11. Historical extension questions remain separate. CIE's taxonomy is no longer reused.

## What the audit establishes

Every public record was checked for valid topic IDs, matching topic/chapter labels,
parent–child consistency and preservation of question content, regions, assets,
marks, timing and dependencies. Every paper is represented in the evidence cache.
All leaf questions went through a rule-assisted classification pass using existing
subquestion annotations and cropped mark-scheme text. For CIE MCQs, a reliably
parsed answer key limits text evidence to the stem and correct option.

This is not a claim that every question has been manually verified. A chapter-level
application label is retained when existing annotations support a chapter but not
a narrower tag. ESAT mark schemes without extractable text rely on the existing
question annotations. Targeted manual decisions, with rationales, are recorded in
`scripts/topic-overrides.json`; totals and methods are in `topic-classification-audit.json`.

Confirmed regressions include Bt insect resistance being called antibiotics,
HIV receptors being called neural receptors, shared AZT passage text contaminating
other subquestions, and a rejected “kidney-shaped nucleus” answer becoming a renal
physiology tag. Real cross-topic questions remain cross-topic: AQA 2020 P1 09.2
tests transcription and membrane permeability.

## Consistent filtering and maintenance

Browse results match any selected topic and indicate questions spanning chapters.
Random practice requires all assessed biology topics of a question to lie within
the selected scope; practical/data skills do not exclude otherwise suitable
biology questions. Answer dependencies stay indivisible.

Admin editing uses the same standard topic tree as the public site. Published
topic IDs determine both visible labels and filtering. Parent tags are recomputed
from their leaves after edits. Private drafts and publication state are preserved.

Local reproduction (original imports and extracted evidence are required):

1. `python scripts/audit-topic-evidence.py` (creates a baseline only if absent).
2. `python scripts/audit-topic-evidence.py --scoring`.
3. `python scripts/enrich-practice-catalogs.py`.
4. `node scripts/test-topic-classification.mjs` plus the existing release checks.

The local `work/classification` directory holds the original catalogs, evidence,
all-record audit, topic-change CSV, pre-release D1 export, and a classification-only
SQL migration/rollback. These private working files are not served by the website.
Migration statements check row revisions and do not alter owner drafts or published
patches. Future corrections should use a new baseline rather than replacing this
audit's retained baseline.
