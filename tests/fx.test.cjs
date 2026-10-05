const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const windows=[];
afterEach(()=>{windows.splice(0).forEach(w=>w.close())});
function load({fine=false,reduced=false}={}) {
  const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://portfolio.test/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;windows.push(w);
  w.matchMedia=q=>({matches:/reduce/.test(q)?reduced:fine});
  w.IntersectionObserver=class{observe(){} unobserve(){} disconnect(){}};
  w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},arc(){},fill(){},setTransform(){}});
  w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
  w.eval(fs.readFileSync('fx.js','utf8'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return w;
}
test('fx layer builds background, progress bar, stats and marquee without cursor on touch devices',()=>{
  const d=load().document;
  assert.ok(d.querySelector('.fx-bg canvas'));
  assert.equal(d.querySelectorAll('.fx-blob').length,4);
  assert.ok(d.querySelector('.fx-progress'));
  assert.equal(d.querySelectorAll('.fx-stat').length,3);
  assert.ok(d.querySelector('.fx-marquee'));
  assert.equal(d.querySelector('.fx-cursor-ring'),null);
  assert.ok(d.documentElement.classList.contains('fx-ready'));
});
test('hero title keeps its text when split into animated words',()=>{
  const d=load().document,t=d.querySelector('.hero-title');
  assert.ok(t.querySelectorAll('.fx-word').length>=3);
  assert.match(t.textContent.replace(/\s+/g,' ').trim(),/Transformo ideias em\s*sistemas que vendem\./);
});
test('animated cursor only exists for fine pointers and never replaces dialogs cursor',()=>{
  const w=load({fine:true}),d=w.document;
  assert.ok(d.querySelector('.fx-cursor-dot')&&d.querySelector('.fx-cursor-ring'));
  assert.ok(d.documentElement.classList.contains('fx-cursor-on'));
  d.querySelector('#modal-overlay').setAttribute('open','');
});
test('reduced motion keeps content visible and skips the word animation',()=>{
  const d=load({reduced:true}).document;
  assert.equal(d.querySelectorAll('.fx-word').length,0);
});
test('private repositories no longer expose a code link',()=>{
  const p=JSON.parse(fs.readFileSync('projects.json','utf8'));
  for(const id of ['barbearia-do','valeria-britto','moove-protection-landing','sales-pipeline-board']) assert.equal(p.find(x=>x.id===id).githubUrl,'');
});
