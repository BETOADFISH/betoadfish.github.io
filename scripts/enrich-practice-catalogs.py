"""Textbook chapter navigation and transparent, per-question time estimates."""
from pathlib import Path
import json,re,sys,math
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/pytools'))
import pymupdf as fitz

# Chapter numbers follow the local Edexcel student books, AQA textbook sections,
# and Cambridge International AS & A Level Biology textbook (chapters 1–19).
ED=['Molecules, transport and health','Membranes, proteins, DNA and gene expression','Cell structure, reproduction and development','Plants, biodiversity and conservation','Energy flow, ecosystems and environment','Microbiology, immunity and forensics','Respiration, muscles and internal environment','Coordination, response and gene technology']
AQ=['Biological molecules','Cells','Exchange and transport','Genetic information, variation and relationships','Energy transfers','Responses and homeostasis','Genetics, populations and ecosystems','Control of gene expression']
CI=['Cell structure','Biological molecules','Enzymes','Cell membranes and transport','The mitotic cell cycle','Nucleic acids and protein synthesis','Transport in plants','Transport in mammals','Gas exchange','Infectious diseases','Immunity','Energy and respiration','Photosynthesis','Homeostasis','Control and coordination','Inheritance','Selection and evolution','Classification, biodiversity and conservation','Genetic technology']
# label, identifying terms, Edexcel topic, AQA section, CIE chapter
RULES=[
 ('Carbohydrates · 糖类',r'carbohydrate|glycosidic|starch|cellulose|glycogen|monosaccharide|disaccharide|reducing sugar|fructose|maltose|amylose|amylopectin|糖类|淀粉|纤维素|糖原|糖苷',1,1,2),
 ('Lipids · 脂质',r'lipid|triglyceride|fatty acid|ester bond|脂质|脂肪酸|三酰甘油',1,1,2),
 ('Proteins · 蛋白质',r'peptide|amino acid|protein structure|tertiary structure|肽键|氨基酸|蛋白质结构|三级结构',1,1,2),
 ('Water and inorganic ions · 水与无机离子',r'properties of water|inorganic ions|specific heat|水的性质|无机离子|比热容',1,1,2),
 ('Enzyme activity · 酶活性',r'enzyme|catalys|active site|酶|活性位点',2,1,3),
 ('Microscopy · 显微镜',r'microscop|magnification|resolution|显微镜|放大倍数|分辨率',3,2,1),
 ('Cell organelles · 细胞器',r'organelle|mitochondri|nucle[ui]|centriole|chloroplast|ribosome|Golgi|endoplasmic|lysosome|细胞器|核糖体|内质网|高尔基体',3,2,1),
 ('Prokaryotic and eukaryotic cells · 原核与真核细胞',r'prokaryot|eukaryot|原核|真核',3,2,1),
 ('Membranes · 细胞膜',r'fluid mosaic|phospholipid|cell (?:surface )?membrane|fluid.mosaic|流动镶嵌|磷脂|细胞膜',2,2,4),
 ('Diffusion and osmosis · 扩散与渗透',r'osmosis|water potential|diffusion|渗透|水势|扩散',2,2,4),
 ('Active transport · 主动运输',r'active transport|co.?transport|主动运输|协同运输',2,2,4),
 ('Mitosis and the cell cycle · 有丝分裂与细胞周期',r'mitosis|mitotic|cell cycle|有丝分裂|细胞周期',3,2,5),
 ('Stem cells and differentiation · 干细胞与分化',r'stem cell|differentiat|totipotent|干细胞|细胞分化|全能性',3,8,5),
 ('DNA, RNA and replication · 核酸与复制',r'\bDNA\b|\bRNA\b|nucleotide|核酸|核苷酸|复制',2,1,6),
 ('Protein synthesis · 蛋白质合成',r'transcription|translation|codon|protein synthesis|转录|翻译|密码子|蛋白质合成',2,4,6),
 ('Plant tissues · 植物组织',r'xylem|phloem|vascular|plant tissue|木质部|韧皮部|植物组织',4,3,7),
 ('Transpiration and water transport · 蒸腾与水分运输',r'transpiration|cohesion|potometer|蒸腾|内聚力|蒸腾计',4,3,7),
 ('Translocation · 有机物运输',r'translocation|mass flow|sieve tube|pressure flow|筛管|转运|质量流',4,3,7),
 ('Heart and circulation · 心脏与循环',r'heart|cardiac|artery|arteries|vein|circulation|心脏|心动|动脉|静脉|循环系统',1,3,8),
 ('Blood and haemoglobin · 血液与血红蛋白',r'haemoglobin|hemoglobin|red blood|tissue fluid|血红蛋白|红细胞|组织液',1,3,8),
 ('Cardiovascular disease · 心血管疾病',r'atherosclerosis|cardiovascular|cholesterol|coronary|心血管|动脉粥样|胆固醇|冠心病',1,3,8),
 ('Gas exchange · 气体交换',r'gas exchange|alveol|gill|trachea|ventilation|气体交换|肺泡|鳃|通气',2,3,9),
 ('Digestion and absorption · 消化与吸收',r'digestion|ileum|villi|absorption|消化|绒毛|回肠|吸收',2,3,2),
 ('Pathogens and infection · 病原体与感染',r'pathogen|tuberculosis|cholera|malaria|\bHIV\b|virus|viral|病原|结核|霍乱|疟疾|病毒',6,2,10),
 ('Antibiotics and resistance · 抗生素与耐药性',r'antibiotic|resistan|抗生素|耐药',6,2,10),
 ('Immune responses · 免疫应答',r'antibod|antigen|lymphocyte|phagocyt|immune|immunity|抗体|抗原|淋巴|吞噬|免疫',6,2,11),
 ('Vaccination · 疫苗接种',r'vaccin|immunisation|immunization|疫苗|预防接种',6,2,11),
 ('Glycolysis and anaerobic respiration · 糖酵解与无氧呼吸',r'glycolysis|anaerobic|lactate|fermentation|糖酵解|无氧呼吸|乳酸|发酵',7,5,12),
 ('Krebs cycle and oxidative phosphorylation · 有氧呼吸',r'Krebs|oxidative phosphorylation|electron transport|aerobic respiration|respiratory quotient|克雷布斯|氧化磷酸化|电子传递|有氧呼吸|呼吸商',7,5,12),
 ('ATP and respiration · ATP与呼吸作用',r'\bATP\b|respiration|呼吸作用',7,5,12),
 ('Light-dependent reactions · 光反应',r'light.dependent|photolysis|chlorophyll|photosystem|光依赖|光反应|光解|叶绿素|光系统',5,5,13),
 ('Calvin cycle · 卡尔文循环',r'Calvin|RuBP|rubisco|light.independent|卡尔文|碳固定',5,5,13),
 ('Photosynthesis and limiting factors · 光合作用与限制因素',r'photosynth|chloroplast|光合作用|叶绿体',5,5,13),
 ('Kidneys and osmoregulation · 肾脏与渗透调节',r'kidney|nephron|glomerul|osmoregulat|\bADH\b|尿|肾|渗透调节',7,6,14),
 ('Blood glucose · 血糖调节',r'insulin|glucagon|diabet|blood glucose|blood sugar|adrenaline|胰岛素|胰高血糖素|糖尿病|血糖',7,6,14),
 ('Feedback and temperature control · 反馈与体温调节',r'homeostasis|negative feedback|thermoregulat|恒定|稳态|负反馈|体温',7,6,14),
 ('Neurones and action potentials · 神经元与动作电位',r'neuron|neurone|action potential|depolari|神经元|动作电位|去极化',8,6,15),
 ('Synapses and drugs · 突触与药物',r'synapse|synaptic|neurotransmitter|acetylcholine|突触|神经递质|乙酰胆碱',8,6,15),
 ('Receptors and coordination · 感受器与协调',r'receptor|retina|rod cell|cone cell|reflex|brain|感受器|视网膜|视杆|视锥|反射|大脑',8,6,15),
 ('Muscle contraction · 肌肉收缩',r'muscle contraction|contract.{0,25}muscle|sarcomere|\bactin\b|myosin|肌肉|肌节|肌动|肌球',7,6,15),
 ('Plant responses · 植物响应',r'auxin|tropism|phytochrome|gibberellin|photoperiod|生长素|向性|光敏色素|赤霉素',8,6,15),
 ('Meiosis and reproduction · 减数分裂与生殖',r'meiosis|meiotic|gamete|fertilis|fertiliz|减数分裂|配子|受精',3,4,16),
 ('Inheritance and genetic crosses · 遗传规律',r'allele|genotype|phenotype|inheritance|sex.link|dominant|recessive|等位基因|基因型|表现型|遗传|伴性|显性|隐性',2,7,16),
 ('Mutation and variation · 突变与变异',r'mutation|variation|mutant|突变|变异',2,4,17),
 ('Selection and speciation · 选择与物种形成',r'natural selection|speciation|evolution|reproductive isolation|自然选择|物种形成|进化|生殖隔离',4,7,17),
 ('Population genetics · 种群遗传学',r'Hardy|Weinberg|allele frequency|gene pool|哈代|温伯格|基因频率|基因库',4,7,17),
 ('Classification · 分类',r'classification|taxonom|phylogen|domain|binomial|分类|系统发育|三域|双名',4,4,18),
 ('Biodiversity and conservation · 生物多样性与保护',r'biodiversity|conservation|endangered|Simpson|生物多样性|保护|濒危|辛普森',4,4,18),
 ('Populations and sampling · 种群与采样',r'population|quadrat|transect|capture|sampling|种群|样方|样带|标记重捕|采样',5,7,18),
 ('Ecosystems and succession · 生态系统与演替',r'ecosystem|succession|competition|predator|niche|生态系统|演替|竞争|捕食|生态位',5,7,18),
 ('Energy transfer · 能量传递',r'biomass|trophic|productivity|food chain|energy transfer|生物量|营养级|生产力|食物链|能量传递',5,5,18),
 ('Nutrient cycles and climate · 物质循环与气候',r'carbon cycle|nitrogen cycle|climate|global warming|greenhouse|decompos|碳循环|氮循环|气候|温室|分解',5,5,18),
 ('Gene regulation · 基因表达调控',r'gene expression|methylation|acetylation|transcription factor|epigenetic|基因表达|甲基化|乙酰化|转录因子|表观遗传',8,8,19),
 ('Gene technology · 基因技术',r'genetic engineer|recombinant|plasmid|restriction|ligase|gene therapy|基因工程|重组|质粒|限制酶|连接酶|基因治疗',8,8,19),
 ('PCR, DNA profiling and sequencing · PCR与DNA分析',r'\bPCR\b|polymerase chain|DNA profil|electrophoresis|sequencing|microarray|测序|电泳|DNA指纹|微阵列',6,8,19),
 ('Practical design and data analysis · 实验设计与数据分析',r'standard deviation|statistic|hypothesis|significan|control variable|reliability|validity|实验设计|统计|标准差|显著|可靠性|效度',9,9,20),
]

RULES.append(('Mixed-topic practice · 综合练习',r'(?!)',10,10,21))

def enrich(cat):
 bank=cat['bank'];nodes={};mapping={}
 original=json.loads((ROOT/'work/base-catalogs'/(bank+'.json')).read_text('utf8'))['questions']
 if bank in ['edexcel','aqa']:original+=json.loads((ROOT/'work/al-catalogs'/(bank+'.json')).read_text('utf8'))['questions']
 original={q['id']:q for q in original}
 titles=ED if bank=='edexcel' else AQ if bank=='aqa' else CI
 for i,row in enumerate(RULES):
  label,pattern,ed,aq,ci=row;n=ed if bank=='edexcel' else aq if bank=='aqa' else ci
  key=f'{bank}-topic-{n}';leaf=f'{bank}-point-{i}'
  if key not in nodes:nodes[key]={'id':key,'label':f'{n}. '+(titles[n-1] if n<=len(titles) else 'Practical skills and data analysis' if n in [9,20] else 'Mixed-topic practice'),'children':[]}
  nodes[key]['children'].append({'id':leaf,'label':label});mapping[i]=(key,leaf)
 for q in cat['questions']:
  source=original[q['id']];q['topics']=source['topics'][:];q['chapters']=source['chapters'][:]
  text=' '.join([q['text'],*q.get('topics',[])])
  matched=[i for i,r in enumerate(RULES) if re.search(r[1],text,re.I)]
  review=[]
  if not matched:
   for chapter in source['chapters']:
    n=None
    if bank=='edexcel':
     m=re.match(r'([1-8])[A-C]\b',chapter);n=int(m[1]) if m else None
    elif bank=='aqa':
     m=re.match(r'3\.([1-8])\b',chapter);n=int(m[1]) if m else None
    elif bank=='cie':
     normal=lambda s:re.sub(r'[^a-z]','',s.lower().replace('The ','').replace('the ',''))
     n=next((i+1 for i,title in enumerate(CI) if normal(title)==normal(chapter)),None)
     if chapter=='Coordination':n=15
     if chapter=='Planning analysis and evaluation':n=20
    if n:
     key=f'{bank}-topic-{n}';leaf=f'{bank}-review-{n}'
     if not any(c['id']==leaf for c in nodes[key]['children']):nodes[key]['children'].append({'id':leaf,'label':'Chapter review · 章节综合'})
     review.append(leaf)
  if not matched:matched=[len(RULES)-1]
  q['topic_ids']=list(dict.fromkeys(review)) or [mapping[i][1] for i in matched]
  if not q['chapters'] or bank=='cie':q['chapters']=list(dict.fromkeys(nodes[mapping[i][0]]['label'] for i in matched))
  if review:q['chapters']=source['chapters'][:]
  if '-al-' in q['id'] or bank=='cie':
   q['topics']=[RULES[i][0] for i in matched]
   q['summary']=' · '.join(RULES[i][0].split(' · ')[0] for i in matched[:3])
   if 'Essay' in q['skills']:q['summary']='Essay — choose one title'
  if bank=='edexcel':minutes,total=({1:(90,80),2:(90,80),3:(80,50),4:(105,90),5:(105,90),6:(80,50)})[q['unit']]
  elif bank=='aqa':
   if q['code'].startswith('7402'):
    minutes,total=(120,91) if q['unit']!=3 else ((45,25) if 'Essay' in q['skills'] else (75,53))
   else:minutes,total=90,75
  elif bank=='cie':minutes,total={1:(75,40),2:(75,60),4:(120,100),5:(75,30)}[q['unit']]
  else:minutes,total=1.5,1
  q['expected_seconds']=max(15,int(math.floor(q['marks']*minutes*60/total/15+.5))*15)
 byid={q['id']:q for q in cat['questions']}
 for q in cat['questions']:
  if not q['is_leaf']:q['expected_seconds']=sum(byid[k]['expected_seconds'] for k in set(q['leaves']))
 used={t for q in cat['questions'] for t in q['topic_ids']}
 cat['taxonomy']=[{**n,'children':[c for c in n['children'] if c['id'] in used]} for n in sorted(nodes.values(),key=lambda n:int(n['id'].split('-')[-1])) if any(c['id'] in used for c in n['children'])]
 cat['version']=3
 return cat

if __name__=='__main__':
 for bank in ['edexcel','aqa','cie','esat']:
  p=ROOT/'public/question-bank'/(bank+'.json');cat=enrich(json.loads(p.read_text('utf8')))
  p.write_text(json.dumps(cat,ensure_ascii=False,separators=(',',':')),encoding='utf8')
  print(bank,len(cat['questions']),len(cat['papers']))
