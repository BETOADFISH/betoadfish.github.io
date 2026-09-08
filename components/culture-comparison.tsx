'use client';
import { useState } from 'react';
import { ArrowRight, Box, Layers, FlaskConical } from 'lucide-react';
import { Copy, SiteLink, useSite } from './site-context';
import products from '@/lib/culture-competitors.json';
import { t } from '@/lib/bilingual';
const explanations=[
 [t('A gel extracted from animal tissue, used as an environment around cells.','从动物组织提取的基质，成胶后为细胞提供周围环境。'),t('One 5 mL bottle of matrix.','一瓶 5 mL 基质。')],
 [t('A formulated gel with cell-adhesion sites and enzyme-cleavable links.','按配方组成的凝胶，含细胞黏附位点和可被酶切开的交联结构。'),t('The 2024 review used a 5 mL working-gel reference basis; kit sizes vary.','2024 年比较按 5 mL 工作凝胶作参考；实际套装规格另行核对。')],
 [t('A modified hyaluronic-acid gel; the complete recipe depends on the cells.','由修饰透明质酸组成的凝胶，具体配方需适配目标细胞。'),t('5 mL reference basis in the 2024 comparison.','2024 年比较采用 5 mL 参考口径。')],
 [t('A porous solid support that sits inside a culture well.','放入培养孔内的多孔固体支架，细胞在孔隙中生长。'),t('Solid culture scaffolds. The original 2024 table did not record the quoted pack size.','固体培养支架；2024 年原表未记录该报价对应的包装数量。')],
 [t('Modified gelatin that can be set using light.','经过修饰、可通过光照固化的明胶。'),t('Package and grade are selected for the application.','按应用选择包装规格和材料等级。')],
 [t('Peptides that assemble into a gel around the cells.','可自行组装成凝胶的多肽，为细胞提供三维环境。'),t('354250: one 5 mL package.','354250：一份 5 mL 包装。')],
 [t('A gel based on fine cellulose fibres from wood.','由木材来源的细微纤维素纤维形成的凝胶。'),t('5 mL reference basis in the 2024 review.','2024 年原表采用 5 mL 参考口径。')],
];
export function CultureComparison(){
 const [active,setActive]=useState(0);const {locale}=useSite();const product=products[active];
 return <section className="editorial-section culture-comparison"><p className="eyebrow"><Copy>{t('02 / Competing products','02 / 竞品比较')}</Copy></p><h2><Copy>{t('Different materials. Different things to buy.','材料不同，买到的东西也不同。')}</Copy></h2><p><Copy>{t('Select a product to see what it offers and what I would test in diligence. All seven prices are the reference figures recorded in my 2024 competitor review.','选择一种产品，看它提供什么，以及尽调时应该追问什么。七项价格均采用我在 2024 年竞品表中记录的参考数字。')}</Copy></p>
 <div className="culture-product-tabs" role="group" aria-label={locale==='zh'?'选择竞品':'Choose a competitor'}>{products.map((p,i)=><button key={p.name} aria-pressed={active===i} onClick={()=>setActive(i)}>{p.name.replace(' / UPM Biomedicals','')}</button>)}</div>
 <article className="culture-product-card" key={product.name} aria-live="polite"><div className="culture-product-heading"><Layers size={36} strokeWidth={1.2}/><div><span className="eyebrow">0{active+1} / 07</span><h3>{product.name}</h3></div><SiteLink href={product.url} target="_blank" rel="noreferrer"><Copy>{active===6?t('Historical product link ↗','历史产品链接 ↗'):t('Product reference ↗','产品资料 ↗')}</Copy></SiteLink></div><div className="culture-product-facts"><div><FlaskConical size={21}/><h4><Copy>{t('What is it?','是什么？')}</Copy></h4><p><Copy>{explanations[active][0]}</Copy></p></div><div><Box size={21}/><h4><Copy>{t('What do you buy?','买到多少？')}</Copy></h4><p><Copy>{explanations[active][1]}</Copy></p></div><div><span className="price-symbol">↗</span><h4><Copy>{t('What does it cost?','价格怎么算？')}</Copy></h4><p><Copy>{product.price}</Copy></p></div></div><div className="culture-implication"><ArrowRight size={20}/><div><strong><Copy>{t('Why it matters to the investment case','为什么影响投资判断')}</Copy></strong><p><Copy>{product.implication}</Copy></p></div></div></article>
 <p className="small muted"><Copy>{t('Source: my 2024 competitor table, whose reference basis was USD / 5 mL for basic products. The scaffold entry has no separately recorded pack size. These historical screening figures are not current quotations or evidence of equivalent performance.','来源：2024 年竞品表，基础款参考口径为美元 / 5 mL；固体支架条目未单列包装数量。这些数字用于回顾当时的初筛，不代表当前报价，也不能据此认定性能等价。')}</Copy></p></section>;
}

export function CultureDecision(){
 const rows=[
 [t('Batch consistency','批次一致性'),t('Fewer failed repeats','减少失败重做'),t('Repeat orders and support cost','复购与技术支持成本')],
 [t('Cell recovery','细胞回收'),t('Less handling and loss','减少操作与样品损失'),t('Cost of adopting the workflow','客户采用成本')],
 [t('Validated cell models','已验证的细胞模型'),t('A defined application','明确可用的应用'),t('A specific first customer group','可以切入的客户群')],
 ];
 return <section className="editorial-section"><p className="eyebrow"><Copy>{t('03 / From science to a decision','03 / 从技术到决策')}</Copy></p><h2><Copy>{t('Follow the advantage into the laboratory workflow.','沿着实验流程，判断技术优势的价值。')}</Copy></h2><div className="culture-decision"><div className="decision-head">{[t('Technical evidence','技术证据'),t('Change in the laboratory','实验室里的改变'),t('Commercial question','商业上要验证什么')].map((x,i)=><span key={i}><Copy>{x}</Copy></span>)}</div>{rows.map((row,i)=><div className="decision-row" key={i}>{row.map((x,j)=><div key={j}><span><Copy>{x}</Copy></span>{j<2&&<ArrowRight size={20}/>}</div>)}</div>)}</div><div className="result-banner"><p className="eyebrow"><Copy>{t('The useful cost comparison','有意义的成本比较')}</Copy></p><h3><Copy>{t('Cost per valid well = total workflow cost ÷ valid wells','每个有效孔的成本 = 工作流总成本 ÷ 有效孔数')}</Copy></h3><p><Copy>{t('Count material, consumables, staff time and repeats. A higher-priced gel can still make an experiment cheaper if it saves enough time or failed wells; customer trials need to establish that benefit.','把材料、耗材、人工时间和重做实验都算进去。凝胶单价较高，如果能节省足够的时间或减少失败孔，整次实验仍可能更便宜；这一点需要通过客户试用验证。')}</Copy></p></div></section>;
}
