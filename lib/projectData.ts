// Scientific content is separate from presentation. Unknown identity fields stay null.
export const profile = {
  name: 'Bill Huang',
  degree: 'BA Natural Sciences (2023–2026); planned MSci Biochemistry (2026–2027)',
  institution: 'University of Cambridge, Department of Biochemistry',
  email: 'zh392@cam.ac.uk',
  linkedin: 'https://www.linkedin.com/in/bill-huang-bb0160302/',
  github: null,
  cv: '/downloads/Bill-Huang-CV.pdf',
};
export const project = {
  slug: 'hubisco',
  title: 'HuBisCO',
  subtitle: 'Probing alternative substrate compatibility in RuBisCO',
  metadata: {
    year: '2026',
    duration: 'Eight weeks',
    group: 'Prywes Lab',
    type: 'Research project & dissertation',
  },
  researchQuestion:
    'Can the RuBP-binding site accommodate alternative sugar-phosphate chemistry—and which local interactions might limit it?',
  summary:
    'An eight-week biochemistry project exploring alternative sugar-phosphate chemistry in a Rhodospirillum rubrum Form II RuBisCO system. HuBP was the intended target but was not experimentally accessible; exploratory assays used Hu6P and Ru5P. Structure-guided mutant selection, recombinant protein work, coupled assays and ³¹P NMR connected a molecular hypothesis to its experimental limits.',
  outcome:
    'Alternative-substrate turnover was not established. PHI-mediated precursor conversion was observed, while weak mutant assay signals remained inconclusive.',
  residues: [
    {
      id: 'I164',
      selection: '164:A',
      title: 'I164 · Sterics & polarity',
      kind: 'Mutation target',
      description:
        'Isoleucine sits near the C1-phosphate region. I164T changes side-chain size and polarity to test local substrate accommodation.',
    },
    {
      id: 'S368',
      selection: '368:A',
      title: 'S368 · Local interactions',
      kind: 'Mutation target',
      description:
        'The serine hydroxyl is a candidate contributor to phosphate interactions. S368A removes it; S368C changes the side-chain chemistry.',
    },
    {
      id: 'K191',
      selection: '191:A or ([FMT] and :A)',
      title: 'Lys191 · Catalytic context',
      kind: 'Reference feature',
      description:
        'In 9RUB, carbamylated Lys191 is represented as LYS191 plus a covalently linked FMT group. The residue orients the catalytic hypothesis; it was not a selected mutation target.',
    },
    {
      id: 'Mg²⁺',
      selection: '[MG] and :A',
      title: 'Mg²⁺ · Metal coordination',
      kind: 'Reference feature',
      description:
        'The deposited 9RUB structure contains magnesium in the active site. It supplies catalytic context, not evidence for alternative-substrate turnover.',
    },
    {
      id: 'Loops',
      selection: '54-63:A or 324-335:A',
      title: 'Active-site loops · Closure',
      kind: 'Conformational context',
      description:
        'Loop regions 54–63 and 324–335 help define the active-site environment. Substantial portions are not modeled in 5RUB; missing coordinates are not a measured open conformation.',
    },
  ],
  mutants: [
    {
      name: 'I164T',
      change: 'Hydrophobic → polar',
      rationale:
        'Tests local steric bulk and polarity near the C1-phosphate region.',
    },
    {
      name: 'S368A',
      change: 'Hydroxyl → methyl',
      rationale:
        'Removes the side-chain hydroxyl to probe its interaction contribution.',
    },
    {
      name: 'S368C',
      change: 'Hydroxyl → thiol',
      rationale:
        'Alters side-chain chemistry while retaining a polarizable functional group.',
    },
  ],
  workflow: [
    {
      title: 'Inspect the structure',
      objective: 'Identify plausible constraints.',
      method: 'Compare 5RUB and 9RUB active-site environments.',
      output: 'A residue-level hypothesis.',
      uncertainty: 'A static structure does not show catalytic dynamics.',
    },
    {
      title: 'Select the mutations',
      objective: 'Perturb candidate local interactions.',
      method: 'Select I164T, S368A and S368C.',
      output: 'Three testable residue substitutions.',
      uncertainty: 'A plausible design does not predict an activity gain.',
    },
    {
      title: 'Express recombinant protein',
      objective: 'Produce material for testing.',
      method: 'Recombinant expression of selected variants.',
      output: 'Protein-containing expression material.',
      uncertainty: 'Expression does not demonstrate folding or activity.',
    },
    {
      title: 'Purify the protein',
      objective: 'Recover protein for comparison.',
      method: 'Affinity-based purification and sample handling.',
      output: 'Three recovered variant preparations.',
      uncertainty: 'Total concentration is not active-enzyme concentration.',
    },
    {
      title: 'Benchmark native activity',
      objective: 'Establish an operational reference.',
      method: 'WT RuBP-dependent coupled assay.',
      output: 'A measurable native-substrate readout.',
      uncertainty: 'An assay benchmark cannot establish alternative turnover.',
    },
    {
      title: 'Test the coupled system',
      objective: 'Look for substrate-dependent activity.',
      method: 'Coupled biochemical assay comparisons.',
      output: 'Inconclusive weak mutant signals.',
      uncertainty: 'Background and supporting enzymes complicate attribution.',
    },
    {
      title: 'Follow precursor conversion',
      objective: 'Evaluate PHI-mediated conversion.',
      method: '³¹P NMR at reported 24 h and 144 h time points.',
      output: 'An increasing Hu6P:F6P ratio.',
      uncertainty: 'Sparse sampling limits kinetic interpretation.',
    },
    {
      title: 'Integrate the evidence',
      objective: 'Determine what to test next.',
      method: 'Compare structural, assay and NMR evidence.',
      output: 'A prioritized set of follow-up experiments.',
      uncertainty:
        'The limiting step and mutant-specific effects remain unresolved.',
    },
  ],
  concentrations: [
    { name: 'I164T', value: 6.46, volume: 493, mass: '3.183' },
    { name: 'S368C', value: 3.66, volume: 68, mass: '0.2486' },
    { name: 'S368A', value: 1.451, volume: 480, mass: null },
  ],
  nmr: [
    { hours: 24, ratio: 0.035 },
    { hours: 144, ratio: 0.196 },
  ],
  evidence: [
    {
      title: 'Observed',
      tone: 'observed',
      items: [
        'Selected variants were produced and purified.',
        'WT RuBP-dependent activity was measurable.',
        'The PHI-system Hu6P:F6P ratio increased between reported time points.',
      ],
    },
    {
      title: 'Suggested',
      tone: 'suggested',
      items: [
        'Slow PHI-mediated precursor conversion is consistent with the NMR observations.',
        'Local steric and hydrogen-bonding interactions remain plausible engineering targets.',
      ],
    },
    {
      title: 'Unresolved',
      tone: 'unresolved',
      items: [
        'Efficient HuBP turnover by RuBisCO.',
        'An activity improvement in I164T, S368A or S368C.',
        'The rate-limiting step in the coupled system.',
      ],
    },
  ],
  limitations: [
    {
      title: 'Slow supporting-enzyme conversion',
      body: 'PHI-mediated interconversion may constrain substrate availability and mask a RuBisCO-dependent effect.',
    },
    {
      title: 'Active-enzyme uncertainty',
      body: 'Bulk protein concentration does not identify the catalytically active fraction.',
    },
    {
      title: 'Coupled-assay attribution',
      body: 'Weak signals must be separated from background and supporting-enzyme reactions. Mutant signals lacked repetition and were inconclusive.',
    },
    {
      title: 'Sparse kinetic sampling',
      body: 'Two reported time points cannot define a kinetic mechanism or establish a rate constant.',
    },
  ],
  nextExperiments: [
    {
      title: 'Matched WT-versus-mutant comparisons',
      body: 'Normalize enzyme inputs and include matched controls to test whether substitutions change activity.',
    },
    {
      title: 'A denser ³¹P NMR time course',
      body: 'Resolve lag, conversion and plateau behavior rather than interpolating between two points.',
    },
    {
      title: 'Orthogonal product confirmation',
      body: 'Confirm product identity and abundance using an independent analytical method where available.',
    },
    {
      title: 'Supporting-enzyme optimization',
      body: 'Test whether PHI or another pathway component limits overall conversion.',
    },
    {
      title: 'Active-enzyme normalization',
      body: 'Distinguish total protein from active enzyme before comparing variants.',
    },
  ],
  contribution: [
    {
      title: 'Scientific reasoning',
      items: [
        'Examined active-site geometry and candidate interactions.',
        'Connected residue selection to steric and hydrogen-bonding hypotheses.',
        'Integrated structural, enzymatic and NMR evidence.',
      ],
    },
    {
      title: 'Experimental work',
      items: [
        'Supported mutant production and recombinant protein handling.',
        'Conducted or analysed coupled biochemical assays.',
        'Evaluated protein concentration and assay-readout limitations.',
      ],
    },
    {
      title: 'Data & communication',
      items: [
        'Organised quantitative results for comparison.',
        'Distinguished observations from mechanistic interpretation.',
        'Developed a decision-focused account of limitations and next experiments.',
      ],
    },
  ],
  skills: [
    'Enzymology',
    'Protein engineering',
    'Structure-guided mutagenesis',
    'Recombinant protein expression',
    'Protein purification',
    'Coupled enzyme assays',
    '³¹P NMR interpretation',
    'Experimental design',
    'Quantitative data analysis',
    'Mechanistic reasoning',
    'Scientific uncertainty assessment',
    'Scientific communication',
  ],
  sourceNotes: [
    {
      title: 'Project dissertation',
      detail:
        'Owner-supplied Dissertation.docx: abstract; structural discussion; PHI NMR results and methods; mutant assay results. Source document retained privately.',
    },
    {
      title: 'Portfolio brief',
      detail:
        'Purified protein concentrations, pooled volumes, reported masses and Vmax are supplied by the owner’s website brief. These values were not independently corroborated in the dissertation text.',
    },
    {
      title: 'Experimental structures',
      detail:
        '9RUB and 5RUB are deposited wild-type reference structures, downloaded from RCSB PDB. Ligands shown in 9RUB include native RuBP, not HuBP.',
    },
  ],
};
