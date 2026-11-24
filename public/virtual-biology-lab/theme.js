(()=>{
 const media=matchMedia('(prefers-color-scheme: dark)');let parentTheme=false;
 function localTheme(){try{const t=localStorage.getItem('bill-theme');if(t==='dark'||t==='light')return t}catch{}return media.matches?'dark':'light'}
 function apply(theme){document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}
 apply(localTheme());
 media.addEventListener('change',()=>{if(!parentTheme)apply(localTheme())});
 addEventListener('storage',e=>{if(!parentTheme&&e.key==='bill-theme')apply(localTheme())});
 addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='biology-lab-theme'&&['dark','light'].includes(e.data.theme)){parentTheme=true;apply(e.data.theme)}});
})();
