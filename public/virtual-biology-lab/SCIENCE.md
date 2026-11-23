# Scientific basis and model limits

Version 1.0.0; sources checked 2026-10-05. Student measurements are simulated. The equations below are the **actual implemented model**, not claims about calibrated biological constants. No original textbook figures or other students’ data were copied.

## Shared data and reproducibility

Each series is identified by the experiment, seed and control settings. The independent-variable level and replicate number identify each new continuous sample within that series. Changing the graph, selection, display mode or order of unrelated sample generation cannot change recorded values. Seeds are unsigned integers from 0 to 4,294,967,295.

The model identifier is `teaching-models-1`, the random generator `fnv1a-mulberry32-1`, and analysis `paired-and-quadrat-1`. The generator hashes string keys with FNV-1a and uses a Mulberry32 stream; normal draws use Box–Muller and reject values outside ±3. A stated normal scale is the scale before truncation. This is reproducible teaching randomness, not a cryptographic tool. Changing a model or random algorithm requires a version change.

Positive instrument readings are rounded to the nearest specified division, with half divisions upwards. Raw displayed readings generate the derived rate or percentage, then group means and sample SD are computed before display rounding. n counts new tissue pieces, reaction mixtures or shoots, not repeat views of a record. Error bars show ±1 sample SD, never a confidence interval or significance test.

## Potato osmosis

Reference: [OpenStax Biology 2e, 30.5, Water Potential and Pressure Potential](https://openstax.org/books/biology-2e/pages/30-5-transport-of-water-and-solutes-in-plants). This supports interpretation through total water potential and the role of pressure in plant cells, not the numerical response curve.


For each piece, true initial mass = 2.00 × (1 + 0.02 Zmass) g; c₀ = 0.30 + 0.008 Zc mol dm⁻³. The true percentage change is:

`20 tanh((c₀ − c)/0.40) × [1 − exp(−t/20)]`.

True final mass is initial mass × (1 + change/100). Independent initial/final reading errors of scale 0.003 g are added before rounding to 0.01 or 0.1 g. Time t is 10–60 min, with 40 min default. Temperature is fixed at 20 °C; each piece has a separate 30 cm³ bath. Pieces come from one virtual potato, which limits generalisation.

Measured percentage = 100 × (final − initial) / initial. This normalises starting mass but does not establish complete control of geometry or physiology. The model omits bath concentration drift, leakage, damage and metabolism. c₀ is an effective model zero-change concentration, not intracellular sucrose concentration. Forty minutes reaches about 86.5% of the model’s limiting change, not proof of real equilibrium.

Zero estimates use adjacent measured group means with opposite signs. No crossing means no extrapolated answer. Multiple crossings or multiple zero means mean no unique answer. A single observed zero mean is labelled as such. The numerical zero tolerance is 10⁻¹² percentage points to absorb floating-point cancellation; this is a computing tolerance, not experimental precision. The app reports local estimates to 0.01 mol dm⁻³ and does not calculate a confidence interval or tissue water potential.

## Catalase: substrate and initial rate

References: [OpenStax Biology 2e, 6.5 Enzymes](https://openstax.org/books/biology-2e/pages/6-5-enzymes) for substrate saturation, and [Practical Biology’s catalase–hydrogen peroxide investigation](https://practicalbiology.org/bio-molecules/factors-affecting-enzyme-activity/investigating-an-enzyme-controlled-reaction-catalase-and-hydrogen-peroxide-concentration.html) for the named reaction and measuring oxygen as substrate changes. The latter’s full procedure was available in the search tool’s cached primary-page content; a subsequent direct open returned an error. Its 30-second collection method and concentrations are not copied as our initial-rate calibration.

Catalase converts hydrogen peroxide to water and oxygen. The demo uses an ideal early oxygen assay at 25 °C, pH 7 and total reaction volume 10 cm³. [S] is 0–20 mmol dm⁻³, not percent peroxide. Relative enzyme loading E ranges 0.5–2.0. The illustrative early rate is:

`v = 0.6 E [S] / (4 + [S])` µmol O₂ min⁻¹.

For a fresh preparation, multiply v by (1 + 0.04 Zactivity). Read oxygen at 0, 2, 4, 6, 8 and 10 s using v × t/60 plus independent error of scale 0.0003 µmol, then quantise to 0.001 µmol. The baseline and zero-substrate readings are ideal zero; no spontaneous background decomposition is included. Negative instrumental product estimates are bounded at zero.

The displayed initial rate is `(O₂ at 10 s − O₂ at 0 s) / (10/60 min)`. These points represent an assumed short linear window with negligible substrate depletion, not a whole reaction progress curve. The implemented parameter range keeps expected peroxide consumption small relative to substrate available. This does not prove a real 10-second assay is linear. Catalase inhibition, damage, exothermy, mixing delays, gas escape and detailed mechanisms are omitted. The saturating model is illustrative; it does not assert that real catalase obeys this curve over arbitrary peroxide concentrations.

## Beetroot membrane leakage

Reference: [Pearson Biology B practical sheet, temperature and membrane permeability](https://qualifications.pearson.com/content/dam/pdf/A%20Level/biology-b/2015/teaching-and-learning-materials/AS-and-A-level-Biology-B-Core-Practical-5---beetroot-membrane-(Student,-Teacher,-Technician-Worksheets).pdf), PDF pages 1–2 and 4: matching tissue, rinsing cut pigment, controlled time, a water blank, colorimetry, and pigment passage through tonoplast and cell-surface membrane. The teacher notes permit absorbance instead of transmission. Some supplied sample-table/wording labels are inconsistent with the stated transmission direction; **none of those sample numbers or threshold claims is used to calibrate this model**. This reference belongs to UK Biology B and does not assign the same practical number to IAL or other boards.

The demo uses a 10 mm diameter × 2 mm thick disc in 5 cm³ water at 10–80 °C for t=5–30 min. Geometry, volume, 535 nm absorbance and the 20 °C readout are our fixed scenario, not copied official requirements.

Expected absorbance = `[0.02 + 1.35/(1 + exp(−(T−55)/7))] × [1 − exp(−t/12)]`.

If the cut surfaces are not rinsed, add `0.14 × [1 − exp(−t/2)]` for surface pigment. Apply a specimen multiplier (1 + 0.035 Zpigment), add instrument error with scale 0.003, bound at zero, then quantise to 0.001 absorbance. The water blank is ideal zero. Absorbance is dimensionless.

This smooth curve teaches temperature-associated pigment leakage and the confounding contribution of cut cells. It is not a membrane permeability coefficient, a universal denaturation temperature, or evidence for a sharp mechanistic threshold. Exposure time and washing belong to distinct series and are not silently averaged together.

## Photosynthesis and net oxygen

References: [Monash, Factors affecting photosynthesis](https://www.monash.edu/student-academic-success/biology/photosynthesis/factors-affecting-photosynthesis) for light limitation and saturation; [Furman University, Light dependence of photosynthesis](https://facweb.furman.edu/~lthompson/bgy34/sunshade) for oxygen-based light response, respiration and the compensation point. The Furman protocol concerns leaf gas exchange; it supports the net-flux concept, not calibration of our aquatic chamber. [AQA GCSE practical-assessment description](https://www.aqa.org.uk/subjects/biology/gcse/biology-8461/specification/practical-assessment) supports controlling temperature while varying light, but does not make this demo an AS or core practical.

The virtual instrument is a dissolved-oxygen amount sensor in a 100 cm³ closed chamber with a matched 10 cm aquatic shoot. It is deliberately **not bubble counting**: it can register a decrease in oxygen. Light is directly specified as PPFD, 0–1000 µmol photons m⁻² s⁻¹. No lamp-distance inverse-square law is assumed.

Gross O₂ production = `Pmax × I/(180 + I) × (1 + 0.04 Zshoot)` µmol min⁻¹, with Pmax = 1.2 for ample CO₂ or 0.6 for the limited scenario. Respiration = `0.12 × (1 + 0.03 Zresp)` µmol min⁻¹. True initial chamber oxygen is 25 µmol; final oxygen = 25 + (gross − respiration) × interval. Initial/final errors have scale 0.005 µmol; measurements are quantised to 0.01 µmol. The observed net rate is the paired difference divided by the 2–10 min interval.

Darkness therefore gives negative net oxygen change without negative gross photosynthesis. At the ideal default, net zero is near I=20, but noisy sparse observations do not establish an exact biological compensation point. Fixed temperature 25 °C, replenishment-free yet effectively constant CO₂, constant respiration, no acclimation, no gas exchange, no photoinhibition and no explicit photorespiration are deliberate approximations. The supply choices are qualitative scenarios, not measured CO₂ concentrations.

## Quadrat sampling

Reference: [Field Studies Council, Fieldwork for Ecosystems](https://www.field-studies-council.org/resources/14-16-geography/ecosystems/fieldwork/), the sections on representative coverage and random coordinates. This supports sampling design; it supplies neither our plant counts nor an automatic adequate-sample-size rule. The demo estimates **abundance**, not species richness, frequency or percentage cover.

The meadow covers 100 m², partitioned into 100 distinct 1 m² cells. A field seed determines a total between 160 and 300 point-rooted plants. Uniform-random fields allocate positions across the square. Clustered fields place 75% of plants around a centre at approximately (7,6) m using a Gaussian spread of 1.1 m, with the remainder uniformly placed; positions are bounded inside the plot. This is a toy spatial field, not a plant-population process model. Pattern changes preserve the seed’s total but alter positions.

Random coordinates use a deterministic Fisher–Yates shuffle of all cells, without replacement. The edge strategy shuffles only the 36 perimeter cells and is intentionally non-representative of a centrally clustered field. Manual selection records exactly the cells chosen. Each rooted point belongs to its floor(x), floor(y) cell: include top/left boundaries, exclude right/bottom boundaries. All generated points lie within the whole plot.

After n quadrats: estimated population = `(sum of counts / n) × 100`. The running graph uses this same value as the table and CSV. Sampling all 100 cells is a census and exactly recovers the total. More random samples do not guarantee each next estimate is closer; biased coverage is not cured merely by repetition. True totals appear only after an explicit reveal. The graph does not imply a confidence interval.

## Teaching and evidence boundaries

The scientific relationships above are source-supported. Specific equations, parameters, error distributions, UI prompts and completion times are our teaching design. Real-classroom usability and learning benefits have not been evaluated. Board mapping is deliberately omitted from student module labels; a method source’s examination-board identifier is not inherited by all five modules.

Method reference used by the scientific-critical-thinking skill: Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). [Scientific Agent Skills: A Library of Procedural Knowledge for Research Agents](https://doi.org/10.48550/arXiv.2609.00065). arXiv:2609.00065. The current record (v2, 2026-09-02) was checked. This reference concerns evaluation procedure, not biological validity.
