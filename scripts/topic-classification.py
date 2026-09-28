"""Board-specific classification using assessed content, not shared passage words.

Source annotations anchor the previously annotated AS/ESAT subquestions. Newer
whole-question imports use their cropped mark schemes. This is an auditable
rule-assisted classification, not an official exam-board question index.
"""
import json, re
from pathlib import Path

ES = ['Cells','Movement across membranes','Cell division and sex determination',
      'Inheritance','DNA','Gene technologies','Variation','Enzymes',
      'Animal physiology','Ecosystems','Plant physiology']

# Narrow evidence patterns: a molecule/organism mentioned in a passage does not
# establish that its structure, metabolism or evolution is being assessed.
PATTERNS = {
 0:r'carbohydrate|glycosidic|starch|cellulose|glycogen|monosaccharide|disaccharide|reducing sugar|fructose|maltose|amylose|amylopectin|糖类|淀粉|纤维素|糖原|糖苷',
 3:r'properties of water|inorganic ions|specific heat|water.{0,60}(?:solvent|heat|hydrogen bond|polar)|水的性质|无机离子|比热容|溶解度',
 2:r'peptide bond|protein structure|primary structure|secondary structure|tertiary structure|quaternary structure|R.group|amino acid.{0,50}(?:bond|sequence|structure)|肽键|氨基酸|蛋白质结构|三级结构',
 4:r'active site|denatur|enzyme.substrate|competitive inhibitor|non.competitive|activation energy|enzyme activity|rate of.{0,20}reaction|immobilis|induced fit|Michaelis|Vmax|酶活|酶促|酶抑制|固定化酶|活性位点|^酶$',
 6:r'organelle|Golgi|endoplasmic|lysosome|centriole|ultrastructure|ribosom|plasmodesma|microtubule|细胞器|核糖体|内质网|高尔基体|细胞结构',
 11:r'mitosis|mitotic|cell cycle|prophase|anaphase|telophase|metaphase|有丝分裂|细胞周期',
 13:r'nucleotide|phosphodiester|deoxyribose|semi.conservative|DNA.{0,30}replicat|double helix|DNA polymerase|purine|pyrimidine|guanine|thymine|cytosine|telomere|核酸|核苷酸|DNA复制|核酸结构|DNA与RNA',
 14:r'(?<!reverse )transcription|translation|codon|anticodon|tRNA|primary transcript|splicing|protein synthesis|转录|翻译|密码子|蛋白质合成',
 17:r'translocation|mass flow|sieve tube|pressure flow|transport.{0,30}sucrose|source.{0,40}sink|sink.{0,40}source|筛管|转运|质量流',
 18:r'heart|cardiac|artery|arteries|vein|circulation|blood (?:flow|pressure|vessel|clot)|fibrin|thrombin|心脏|心动|动脉|静脉|循环|血压|凝血',
 20:r'atherosclerosis|cardiovascular|coronary|atheroma|thrombosis|心血管|动脉粥样|冠心病|血栓',
 21:r'gas exchange|alveol|gill|trachea|ventilation|bronch|emphysema|气体交换|肺泡|鳃|通气',
 22:r'digest|ileum|villi|消化|绒毛|回肠',
 24:r'antibiotic|penicillin|抗生素',
 29:r'(?:cellular|aerobic|anaerobic) respiration|respiromet|呼吸作用|呼吸速率',
 32:r'photosynth|光合作用',
 34:r'insulin|glucagon|diabet|blood glucose|blood sugar|胰岛素|胰高血糖素|糖尿病|血糖',
 38:r'photoreceptor|pressure receptor|Pacinian|retina|rod cell|cone cell|reflex|brain|感受器|视网膜|视杆|视锥|反射|大脑',
 39:r'sarcomere|\bactin\b|myosin|sliding filament|skeletal muscle|肌节|肌动|肌球|滑行丝',
 41:r'meiosis|meiotic|crossing.over|independent (?:assortment|segregation)|减数分裂|配子形成|受精',
 42:r'genetic cross|monohybrid|dihybrid|Punnett|sex.link|codomina|recessive|dominant allele|inheritance|基因型|表现型|伴性|显性|隐性|遗传病|^遗传$',
 43:r'mutation|mutant|genetic variation|continuous variation|discontinuous variation|突变|变异',
 44:r'natural selection|selection pressure|selective advantage|surviv.{0,60}reproduc|reproduc.{0,60}surviv|directional selection|stabilising selection|自然选择|选择压力|适者生存',
 45:r'Hardy|Weinberg|gene pool|哈代|温伯格|基因库',
 46:r'classification|taxonom|phylogen|three.domain|binomial|分类|系统发育|三域|双名',
 48:r'quadrat|transect|mark.release|capture.recapture|random sampl|population size|种群数量|样方|样带|标记重捕|采样',
 49:r'ecosystem|succession|interspecific competition|intraspecific competition|predator.prey|niche|生态系统|演替|竞争|捕食|生态位',
 50:r'biomass|trophic|primary productivity|gross primary|net primary|food chain|energy transfer|生物量|营养级|初级生产力|食物链|能量传递',
 52:r'gene expression|methylation|acetylation|transcription factor|epigenetic|lac operon|repressor|基因表达|甲基化|乙酰化|转录因子|表观遗传',
 51:r'carbon cycle|nitrogen cycle|nitrif|denitrif|ammonif|climate|global warming|greenhouse|decompos|碳循环|氮循环|气候|温室|分解',
 53:r'genetic engineer|recombinant|restriction (?:enzyme|endonuclease)|ligase|gene therapy|genetically modif|基因工程|重组DNA|限制酶|连接酶|基因治疗',
 55:r'standard deviation|statistic|hypothesis|significan|control variable|reliability|validity|random sampl|实验设计|统计|标准差|显著|可靠性|效度|对照|变量',
}

def rules_for(bank, old):
    rules = [list(r) for r in old]
    for i, pattern in PATTERNS.items(): rules[i][1] = pattern
    rules[2][2] = 2  # Pearson 2B, not carbohydrate/lipid chapter 1A.
    rules[44][0] = 'Natural selection and adaptation · 自然选择与适应'
    rules[44][3] = 4  # AQA 3.4.4, distinct from 3.7.3 speciation.
    rules[52][2] = 3  # Pearson 3.18–3.20 differentiation/epigenetics.
    rules[52][4] = 16 # Cambridge 16.3, not chapter 19 genetic technology.
    rules[43][4] = 6  # Gene mutations: Cambridge 6.2; variation separate below.
    rules[29][0] = 'Cellular respiration · 细胞呼吸'
    rules += [
      ['ATP structure and hydrolysis · ATP结构与水解',r'ATP.{0,70}(?:hydrolys|structure|adenine|ribose|phosphate)|adenosine triphosphate|ATP结构|ATP水解',7,1,12],
      ['Speciation and reproductive isolation · 物种形成与生殖隔离',r'speciation|reproductive isolation|allopatric|sympatric|物种形成|生殖隔离',4,7,17],
      ['Cell specialisation and organisation · 细胞分化与组织',r'specialised cell|cell specialisation|tissue.{0,30}organ|细胞特化|细胞分化|组织器官',3,2,1],
      ['Antibiotics and viruses · 抗生素与病毒',r'(?!)',6,2,10],
      ['Antibiotic resistance and selection · 抗生素耐药性与选择',r'(?!)',6,4,17],
      ['Variation · 变异',r'continuous variation|discontinuous variation|environmental variation|phenotypic variation|连续变异|不连续变异|环境变异',3,4,17],
      ['Hormones and transcription factors · 激素与转录因子',r'(?!)',7,8,16],
      ['Species and courtship · 物种与求偶行为',r'courtship|mate recognition|求偶|物种定义',4,4,18],
      ['Measurements and calculations · 测量与计算',r'percentage|calculate|estimate|ratio|mean|standard form|计算|测量|百分比|比值|平均|误差',9,9,20],
      ['Genetic screening · 遗传筛查',r'genetic screening|genetic disorder|aneuploidy|遗传筛查|基因筛查',2,8,19],
      ['Surface area and exchange · 表面积与物质交换',r'surface area|agar block|表面积|表面积体积比',2,3,4],
      ['Plant fibres and mineral nutrition · 植物纤维与矿质营养',r'tensile|plant fibre|mineral ion|mineral deficien|nitrate deficien|magnesium deficien|纤维强度|矿质|矿物质|拉伸',4,3,7],
      ['Plant products and antimicrobial testing · 植物产物与抑菌实验',r'plant extract|antimicrobial|vitamin C|DCPIP titrat|植物提取|抑菌|维生素C',4,9,20],
      ['Biological bonds and reactions · 生物分子的化学键与反应',r'covalent bond|condensation reaction|hydrolysis reaction|共价键|缩合反应|水解反应',2,1,2],
    ]
    return rules

def has(pattern, text): return bool(re.search(pattern, text, re.I|re.S))

def original_chapters(bank, source):
    result = set()
    for ch in source.get('chapters', []):
        pattern = r'3\.([1-8])\b' if bank=='aqa' else r'([1-8])[A-C]\b' if bank=='edexcel' else r'B(\d+)\b'
        m=re.match(pattern,ch)
        if m: result.add(int(m[1]))
        if bank=='esat' and ch.startswith('历史拓展'): result.add(12)
    return result

def clean_ms(text):
    # Disallowed answers are not assessed evidence. Exclude their continuation
    # until a new bullet/mark point where the extracted layout permits it.
    return '\n'.join(line for line in text.splitlines()
                     if not re.search(r'\b(?:reject|ignore|do not accept|incorrect|not credit)\b',line,re.I)
                     and not re.match(r'^\s*[RI]\s',line))

def apply(cat, originals, evidence, old_rules, titles, root):
    bank=cat['bank']; rules=rules_for(bank,old_rules)
    title=ES if bank=='esat' else titles[bank]
    practical=12 if bank=='esat' else 20 if bank=='cie' else 9
    es_map=[9,9,9,9,8,1,1,1,2,2,2,3,6,5,5,11,11,11,9,9,9,9,8,9,7,9,9,9,9,9,11,11,11,9,9,9,9,9,9,9,12,3,4,5,7,7,10,10,10,10,10,10,5,6,6,13,14,9,7,1,9,7,7,5,7,13,6,2,11,13,8]
    def chapter(i): return es_map[i] if bank=='esat' else rules[i][{'edexcel':2,'aqa':3,'cie':4}[bank]]
    nodes={}; points={}
    def node(n):
        if n not in nodes:
            prefix=f'B{n}' if bank=='esat' and n<=11 else f'3.{n}' if bank=='aqa' and n<=8 else str(n)
            name=title[n-1] if n<=len(title) else 'Historical extension · 历史拓展' if bank=='esat' and n==12 else 'Practical skills and data analysis' if n==practical or (bank=='esat' and n==13) else 'Mixed-topic practice'
            nodes[n]={'id':f'{bank}-topic-{n}','label':f'{prefix}. {name}','children':[]}
        return nodes[n]
    for i,r in enumerate(rules):
        n=chapter(i); pid=f'{bank}-point-{i}'
        label=r[0]
        if i==24 and bank=='aqa': continue # split by the actual assessment below
        if i==56: label='Synoptic questions · 综合应用'
        p={'id':pid,'label':label};node(n)['children'].append(p);points[pid]=(n,p)
    def review(n):
        pid=f'{bank}-review-{n}'
        if pid not in points:
            p={'id':pid,'label':'Chapter application · 章节应用'};node(n)['children'].append(p);points[pid]=(n,p)
        return pid
    overrides=json.loads((root/'scripts/topic-overrides.json').read_text('utf8'))
    baseline={q['id']:q for q in json.loads((root/f'work/classification/{bank}-before.json').read_text('utf8'))['questions']}
    audit=[]
    for q in cat['questions']:
        if not q['is_leaf']: continue
        source=originals[q['id']]; e=evidence[q['id']]
        annotated=bank=='esat' or (bank in ['edexcel','aqa'] and '-al-' not in q['id'])
        anchors=original_chapters(bank,source) if annotated else set()
        tagtext='\n'.join(source.get('topics',[])) if annotated else ''
        ms=clean_ms(e.get('scoring_ms',e['ms'])); text=q['text']
        # MCQ distractors are not separate assessed topics. Keep the stem and
        # keyed option when the PDF has an unambiguous A/B/C/D option layout.
        if bank=='cie' and q['unit']==1:
            choices=list(re.finditer(r'(?m)^\s*([A-D])\s*$',e['qp']))
            key=re.search(r'\b([A-D])\b',ms)
            if len(choices)==4 and [m[1] for m in choices]==list('ABCD') and key:
                k=list('ABCD').index(key[1]); end=choices[k+1].start() if k<3 else len(e['qp'])
                text=e['qp'][:choices[0].start()]+'\n'+e['qp'][choices[k].end():end]
        taghits={i for i,r in enumerate(rules) if has(r[1],tagtext)}
        mshits={i for i,r in enumerate(rules) if has(r[1],ms)}
        # Source subquestion annotations are stronger than its shared passage.
        hits=taghits|mshits
        method='source-tags-and-mark-scheme' if annotated else 'mark-scheme'
        # Quantitative skills alone do not identify the biology being tested.
        if not (hits-{55,65}):
            hits={i for i,r in enumerate(rules) if has(r[1],text)}
            method='question-text-fallback'
            fallback={
              0:r'Benedict|sugar test|glycosidic|carbohydrate',
              1:r'unsaturated fat|saturated fat|vegetable oil|emulsion test',
              2:r'amino acid|peptide|polypeptide|biuret',
              3:r'water.{0,140}(?:temperature|hydrogen bond|cohesion)|hydrogen bond.{0,80}water',
              4:r'catalase|catalys|\benzyme\b|\benzymes\b',
              5:r'micrograph|graticule|micrometer|eyepiece|calibrat|width.{0,50}membrane|\b[µμ]m\b',
              6:r'cell structure|organelle|cell wall|cell.{0,60}secret|chloroplast|mitochondri|vacuole|goblet cell',
              7:r'bacteria|bacterial|prokaryot|eukaryot',
              8:r'membrane|endocytosis|exocytosis|cell signalling',
              9:r'plasmolys|turgid|diffus|contract.{0,30}vacuole',
              11:r'cytokinesis|chromatid|chromosome|cancer|tumour|tumor',
              13:r'nucleic acid|\bDNA\b|\bRNA\b',
              14:r'gene.{0,50}(?:code|production)|protein synthesis',
              15:r'plant (?:root|stem)|transport tissue|leaf.{0,80}mineral',
              16:r'xerophyt|stomata|apoplast|symplast|endodermis|tree.{0,40}diameter|diameter.{0,30}tree',
              17:r'companion cell|sieve|potato tuber|assimilate|source.{0,40}sink',
              18:r'ventric|atrium|atria|aorta|systole|diastole',
              19:r'carbonic anhydrase|carbon dioxide.{0,60}transport|lymph|components of blood|blood.{0,50}tissue',
              21:r'bronch|cigarette|smoking|emphysema|\bCOPD\b|alveoli|respiratory system',
              23:r'\bTB\b|disease.{0,100}transmi|cholera|malaria|tuberculosis',
              38:r'brain|cerebellum|cerebrum|hypothalamus',
              41:r'sperm|pollen|gamete|fertilis',
            }
            if not (hits-{55,65}):
                hits.update(i for i,p in fallback.items() if has(p,text))
            # CIE AS organelle questions can mention energy production, but the
            # biochemical pathways belong to A Level, not these AS MCQs.
            if bank=='cie' and q['unit'] in [1,2]:
                hits={i for i in hits if chapter(i)<=11 or i in [55,65,67,69]}
            if bank=='edexcel' and q['unit']==1:
                hits={i for i in hits if chapter(i)<=2 or i in [5,55,65]}
        if bank=='cie' and q['unit']==5 or bank=='edexcel' and q['unit'] in [3,6]:hits.add(55)
        if annotated and anchors:
            hits={i for i in hits if chapter(i) in anchors or i in [55,65]}
        # AQA antibiotics are two different specification outcomes. Resistance
        # to an insect toxin or an antiviral is never labelled antibiotic.
        if bank=='aqa':
            hits.discard(24)
            actual=tagtext+'\n'+ms
            if has(r'antibiotic|penicillin|抗生素',actual):
                if has(r'virus|viral|病毒',actual) and (not anchors or 2 in anchors):hits.add(60)
                if has(r'resistan|selection|mutation|耐药|抗性|选择',actual) and (not anchors or 4 in anchors):hits.add(61)
        # Neuroreceptors cannot be inferred from HIV/hormone binding.
        if not has(r'photoreceptor|Pacinian|retina|rod cell|cone cell|reflex|brain|视网膜|感受器|大脑|反射',tagtext+'\n'+ms):hits.discard(38)
        if bank=='edexcel' and 52 in hits and has(r'transcription factor|steroid hormone',ms) and q['unit']>=4:
            hits.discard(52);hits.add(63)
        assessed=tagtext+'\n'+ms
        if 6 in hits and 14 in hits:
            if has(r'transcription|translation|codon|anticodon|tRNA|转录|翻译|密码子',assessed):
                if not has(r'Golgi|endoplasmic|lysosome|organelle|细胞器|内质网|高尔基体',assessed):hits.discard(6)
            else:
                # Ribosomes/RER producing secreted protein is an organelle
                # function, not evidence of a transcription/translation task.
                hits.discard(14)
        # A marker gene being expressed is not itself gene regulation.
        if 53 in hits and 52 in hits and not has(r'methylation|acetylation|transcription factor|repressor|lac operon|甲基化|表观遗传',tagtext+'\n'+ms):hits.discard(52)
        if 53 in hits and not has(r'genetic engineer|recombinant|plasmid|vector|gene therapy|genetically modif|transfer.{0,40}gene|基因工程|基因治疗|重组DNA',tagtext+'\n'+ms+'\n'+text):hits.discard(53)
        if 36 in hits and 18 in hits and not has(r'neuron|neurone|axon|myelin|神经元',assessed):hits.discard(36)
        if 68 in hits and not has(r'plant|root|leaf|leaves|stem|植物|矿质',text+'\n'+tagtext):hits.discard(68)
        # Cambridge AS papers assess chapters 1–11; organelle function and
        # source/sink transport are not A Level respiration/photosynthesis.
        if bank=='cie' and q['unit'] in [1,2]:
            if hits.intersection({27,28,29,30,31,32,57}) and has(r'organelle|mitochondri|chloroplast',text) and not hits.intersection({15,16,17}):hits.add(6)
            hits={i for i in hits if chapter(i)<=11 or i in [55,65,67,69]}
        ids=[f'{bank}-point-{i}' for i in sorted(hits) if f'{bank}-point-{i}' in points]
        # Preserve a source chapter when its precise subtopic is not supported.
        for n in sorted(anchors):
            if not any(points[t][0]==n for t in ids):ids.append(review(n))
        if not ids: ids=[f'{bank}-point-56'];method='unresolved'
        if q['id'] in overrides:
            ids=overrides[q['id']]['topic_ids'];method='reviewed-override'
            assert all(t in points for t in ids),q['id']
        old=baseline[q['id']].get('topic_ids',[])[:]
        q['topic_ids']=ids
        audit.append({'id':q['id'],'paper_id':q['paper_id'],'method':method,'before':old,'after':ids,
                      'source_chapters':source['chapters'], 'ms_chars':len(ms)})
    byid={q['id']:q for q in cat['questions']}
    for q in cat['questions']:
        if not q['is_leaf']:
            q['topic_ids']=list(dict.fromkeys(t for leaf in q['leaves'] for t in byid[leaf]['topic_ids']))
        q['topics']=[points[t][1]['label'] for t in q['topic_ids']]
        q['chapters']=list(dict.fromkeys(nodes[points[t][0]]['label'] for t in q['topic_ids']))
        if '-al-' in q['id'] or bank=='cie':
            q['summary']=' · '.join(t.split(' · ')[0] for t in q['topics'][:3])
            if 'Essay' in q['skills']:q['summary']='Essay — choose one title'
    used={t for q in cat['questions'] for t in q['topic_ids']}
    cat['taxonomy']=[{**n,'children':[p for p in n['children'] if p['id'] in used]} for _,n in sorted(nodes.items()) if any(p['id'] in used for p in n['children'])]
    cat['version']=4
    (root/f'work/classification/{bank}-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf8')
    return cat
