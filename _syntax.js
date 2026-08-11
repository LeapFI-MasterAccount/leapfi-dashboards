const fs=require('fs');
const html=fs.readFileSync('src/leapguard-command-center.html','utf8');
const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m,i=0,bad=0;
while((m=re.exec(html))){
  const attrs=m[1]||'';
  if(/\bsrc\s*=/.test(attrs)) continue; // external
  i++;
  const code=m[2];
  try{ new Function(code); }
  catch(e){
    bad++;
    console.log('SCRIPT #'+i+' SYNTAX ERROR: '+e.message);
    // find approx line
    const idx=html.indexOf(code);
    console.log('  near:', code.slice(0,80).replace(/\n/g,' '));
  }
}
console.log('checked scripts:',i,'| errors:',bad);
// quick targeted check: does new summary reference navGauge 4x?
console.log('navGauge calls in file:', (html.match(/navGauge\(/g)||[]).length);
