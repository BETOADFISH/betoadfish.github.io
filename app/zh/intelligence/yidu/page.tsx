import Page from '@/app/intelligence/yidu/page';
import { LocaleProvider } from '@/components/site-context';
export const metadata={title:'医渡科技：医药研究与分析 | Bill Huang',description:'从医生访谈到患者画像、决策路径、证据问题与随访需求。',alternates:{canonical:'https://betoadfish.github.io/zh/intelligence/yidu',languages:{en:'https://betoadfish.github.io/intelligence/yidu','zh-CN':'https://betoadfish.github.io/zh/intelligence/yidu'}}};
export default function ChineseYidu(){return <LocaleProvider locale="zh"><div lang="zh-CN"><Page/></div></LocaleProvider>;}