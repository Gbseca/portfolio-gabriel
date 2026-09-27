const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const windows=[];
afterEach(()=>{windows.splice(0).forEach(w=>w.close())});
async function app() {
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://portfolio.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 windows.push(w);
 w.previewTimeouts=[];const timeout=w.setTimeout.bind(w);w.setTimeout=(fn,ms,...args)=>{if(ms===15000)w.previewTimeouts.push(fn);return timeout(fn,ms,...args);};
 w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.IntersectionObserver=class{observe(){} unobserve(){} disconnect(){}};
 w.ResizeObserver=class{observe(){} disconnect(){}};
 w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},arc(){},fill(){}});
 w.requestAnimationFrame=()=>0;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.querySelector('button')?.focus()};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('projects.json','utf8'))});
 for(const file of ['app.js','gallery.js']) if(fs.existsSync(file)) w.eval(fs.readFileSync(file,'utf8'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 await new Promise(r=>setTimeout(r,20));
 return dom;
}
test('project details open a modal dialog and return focus to trigger',async()=>{
 const dom=await app(), d=dom.window.document;
 const card=d.querySelector('.project-card');card.focus();card.click();
 assert.equal(d.querySelector('#modal-overlay').tagName,'DIALOG');
 assert.equal(d.querySelector('#modal-overlay').open,true);
 assert.ok(d.querySelector('#modal-overlay').contains(d.activeElement));
 d.querySelector('#modal-close').click(); assert.equal(d.activeElement,card);dom.window.close();
});
test('navigation reports open and closed state',async()=>{
 const dom=await app(),d=dom.window.document,b=d.querySelector('#navbar-toggle');
 b.click();assert.equal(b.getAttribute('aria-expanded'),'true');
 d.querySelector('#navbar-links a').click();assert.equal(b.getAttribute('aria-expanded'),'false');dom.window.close();
});
test('github repositories never masquerade as live demos',async()=>{
 const dom=await app(),d=dom.window.document;d.querySelector('.project-card').click();
 const links=[...d.querySelectorAll('#modal-links a')];
 assert.equal(links.filter(a=>a.href.includes('github.com')).length,1);
 assert.ok(!links.some(a=>/demo/i.test(a.textContent)&&a.href.includes('github.com')));dom.window.close();
});
test('six samples launch a sandboxed preview and remove it on close',async()=>{
 const dom=await app(),d=dom.window.document;
 const buttons=d.querySelectorAll('[data-preview]');assert.equal(buttons.length,6);
 buttons[0].click();const frame=d.querySelector('#preview-frame');
 assert.equal(frame.getAttribute('sandbox'),'allow-scripts');
 assert.ok(frame.getAttribute('src').includes('architecture-light'));
 d.querySelector('#preview-close').click();assert.equal(d.querySelector('#preview-frame'),null);dom.window.close();
});
test('WhatsApp message encodes punctuation and selected service without sending',async()=>{
 const dom=await app(),d=dom.window.document;
 assert.ok(d.querySelector('#contact-message'),'message composer exists');
 d.querySelector('#contact-message').value='Quero um site & convite #novo';
 d.querySelector('#contact-message').dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 const url=new URL(d.querySelector('#whatsapp-send').href);
 assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/5521972969475');
 assert.ok(url.searchParams.get('text').includes('Quero um site & convite #novo'));dom.window.close();
});
test('restarting a loaded preview resets loading feedback and rearms failure recovery',async()=>{
 const dom=await app(),w=dom.window,d=w.document;d.querySelector('[data-preview]').click();
 const frame=d.querySelector('#preview-frame');w.dispatchEvent(new w.MessageEvent('message',{source:frame.contentWindow,data:{channel:'portfolio-preview',type:'ready'}}));
 assert.equal(d.querySelector('#preview-status').hidden,true);
 d.querySelector('#preview-status').textContent='Previous load failed';d.querySelector('#preview-restart').click();
 assert.equal(w.previewTimeouts.length,2);assert.ok(!d.querySelector('#preview-status').textContent.includes('Previous'));
 w.previewTimeouts[1]();assert.ok(d.querySelector('#preview-status').textContent.includes('Reiniciar'));dom.window.close();
});
