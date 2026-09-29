import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// A release-specific guard for the September 2026 visual restoration.
// Baselines come from a3bf48b, after the content and classification corrections.
// Do not refresh these hashes merely to make a visual-only change pass.
// A later intentional content release should review/update or retire this guard.
const preserved={
 'lib/work.ts':'59222dbcc397ddeb0811b2fba5d4d330a52c0de229018d6543e3efb987e8599c',
 'lib/mcr1-colistin-story.json':'ab1c9fc286edab60f2cad3f5d748dd4c2281cba0af6f788775727f6c2348f21f',
 'lib/pet-hydrolase-story.json':'7a84b4e6d8c4059ac2488116a6e144f2c65d052dcceab2a0473e19348a5b370c',
 'lib/hubisco-journey.ts':'bc9a6dbd085af289eb3a4ffe2470a3c67a0c7c043ceced7f7095905fbfec9c9c',
 'lib/projectData.ts':'fbefca65c60815abf87f833ce0076fc73f371d07a1e6598c03d0fded67fc4eec',
 'lib/culture-content.json':'63cab4d0168ca7650facd29183321c8e612f3e13d2582cc71fd2c9c0b243c4b3',
 'lib/culture-competitors.json':'6d52398515cf522b64a56b0c1eb19e1d64504715b956ebfa6d06656311098828',
 'lib/pet-traces.json':'d922467ba4221aed108ae580d6b0be9ff27aad6ced4e6f91561629b85e4726ab',
 'lib/mcr-plates.json':'2e50e4d40e04e972aa26169d8ef4945f476eca17702fb391ff28ca19b5779707',
 'lib/docking-scores.json':'f38706f0f5fc93f53c48635d77dcc19589d3df1d4616a246ae6d953c2f9cebe8',
 'lib/vina-replay.json':'33a8b8989e03f48574ea17704c34232c8049e159f3e293eace936ac30525ae18',
 'lib/question-taxonomy.json':'3f2ecf182d9425f8e4cbe9a6f480795c98369d54ffc0667d9426955c3e966862',
 'lib/topic-classification.ts':'45286bc721b8d5628845da22fdda0b414a4bbb391acd26b567b123e0539727b2',
 'lib/random-paper.ts':'b0081b8c9dbc9d69e3c52a9ff68a705ca3a8cbb3a8873432bb75a55d39eb8805',
 'lib/question-bank.ts':'6c4a706733f2dfd0e215d482dabc6c03ba8a1a4c121f7a9b1430bcb50d1e22d8',
 'lib/question-pdf.ts':'e3d35098f0c45fbfe0771b68d6116eaf082076849186c3e8fa495ff0d3828858',
 'lib/download-analytics.ts':'897c1de9e7bc3ce43c67a9c803a90c423e55f78ed0e0787082b6fe68d84d7ac5',
 'public/question-bank/aqa.json':'df410320daac37a1c5da27f603e9318695656f47e703cb7515d6973a12f868a0',
 'public/question-bank/edexcel.json':'458d74a0f84fca7418409dba74ff908be11575f95f2d364b11e77e69999fa776',
 'public/question-bank/cie.json':'9163c6fea9b3595eeeeea1cfc41d06fa0624e43fbc70f29b25e31673cfd55037',
 'public/question-bank/esat.json':'b87314df1ca3b5eec39fd8669f63414f8c740b3385dc65e626f53cdebace2c24',
 'backend/validation.ts':'e48f082ee03137e5e9ff1dae17ddf3ce8f69a2f73643172f1d4b86abcd1ad632',
};
for(const [file,expected] of Object.entries(preserved)){
 const content=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 assert.equal(createHash('sha256').update(content).digest('hex'),expected,file+' changed after the content baseline');
}

// Inspect source as well as built HTML: evidence panels can be loaded lazily.
const internalCopy=/Bursary|bursary (?:report|account)|总结记录|简历记录|CV record/;
function checkCopy(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())checkCopy(file);
  else if(/\.tsx$/.test(file))assert(!internalCopy.test(fs.readFileSync(file,'utf8')),file+' exposes internal drafting copy');
 }
}
checkCopy('app');checkCopy('components');
const journeys=fs.readFileSync('components/case-journeys.tsx','utf8');
assert(journeys.includes('This was a qualitative observation'));
assert(journeys.includes('这是定性观察'));
assert(journeys.includes('A lower MIC alone could not establish a membrane mechanism'));
const hubisco=fs.readFileSync('app/projects/hubisco/page.tsx','utf8');
assert(hubisco.includes('alternative-substrate turnover was not established'));
assert(hubisco.includes('尚未确立替代底物催化'));
const yidu=fs.readFileSync('app/intelligence/yidu/page.tsx','utf8');
assert(yidu.includes('Consulting Intern'));assert(yidu.includes('咨询实习生'));assert(yidu.includes('FXI/FXIa'));
console.log(`Visual restoration preserves ${Object.keys(preserved).length} content, evidence, classification and export files from a3bf48b; public copy and scientific qualifications retained.`);
