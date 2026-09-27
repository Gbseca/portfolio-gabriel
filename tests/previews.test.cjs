const {test,afterEach}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM}=require('jsdom');
const windows=[];afterEach(()=>windows.splice(0).forEach(w=>w.close()));
function preview(sample){const dom=new JSDOM(fs.readFileSync('previews/index.html','utf8'),{url:'https://portfolio.test/previews/index.html?sample='+sample,runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;windows.push(w);w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};if(fs.existsSync('previews/preview.js'))w.eval(fs.readFileSync('previews/preview.js','utf8'));return dom;}
test('housewarming completes simulated RSVP and resets without persistence',()=>{
 const dom=preview('housewarming'),d=dom.window.document;
 assert.ok(d.querySelector('[data-action="start"]'),'invitation can be opened');d.querySelector('[data-action="start"]').click();
 const name=d.querySelector('#guest-name');name.value='   ';d.querySelector('#guest-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true,bubbles:true}));assert.ok(d.querySelector('#guest-name'),'whitespace cannot advance');
 name.value='<b>Visitante</b>';d.querySelector('#guest-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true,bubbles:true}));
 d.querySelector('[data-company="1"]').click();d.querySelector('[data-gift="Presença"]').click();d.querySelector('[data-action="review"]').click();d.querySelector('[data-action="confirm"]').click();
 assert.ok(d.querySelector('#confirmation'));assert.ok(d.querySelector('#confirmation').textContent.includes('<b>Visitante</b>'));assert.equal(d.querySelector('#confirmation b'),null);assert.equal(dom.window.localStorage.length,0);
 d.querySelector('[data-action="reset"]').click();assert.ok(d.querySelector('[data-action="start"]'));
});
test('architecture category and gallery change content; guide can dismiss and resume',()=>{
 const {window:w}=preview('architecture-light'),d=w.document;
 assert.ok(d.querySelector('[data-filter="interiores"]'));d.querySelector('[data-filter="interiores"]').click();
 assert.equal(d.querySelectorAll('.arch-project:not([hidden])').length,1);
 d.querySelector('.arch-project:not([hidden])').click();assert.equal(d.querySelector('#detail-dialog').open,true);
 const img=d.querySelector('#detail-image'),first=img.src;d.querySelector('#gallery-next').click();assert.notEqual(img.src,first);
 d.querySelector('#tour-dismiss').click();assert.equal(d.querySelector('#tour').hidden,true);d.querySelector('#tour-restore').click();assert.equal(d.querySelector('#tour').hidden,false);
});
test('law preview expands service and simulates contact without network',()=>{
 const {window:w}=preview('law-desktop'),d=w.document;
 assert.ok(d.querySelector('[data-area="civil"]'));d.querySelector('[data-area="civil"]').click();assert.equal(d.querySelector('[data-area="civil"]').getAttribute('aria-expanded'),'true');
 d.querySelector('#law-form').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));assert.equal(d.querySelector('#law-success').hidden,false);assert.ok(/simula/i.test(d.querySelector('#law-success').textContent));
});
test('housewarming gift selections render local product images',()=>{
 const {window:w}=preview('housewarming'),d=w.document;
 d.querySelector('[data-action="start"]').click();d.querySelector('#guest-form').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));d.querySelector('[data-company="0"]').click();
 assert.equal(d.querySelectorAll('.gift-options img').length,3);
 for(const img of d.querySelectorAll('.gift-options img'))assert.ok(fs.existsSync(new URL(img.src).pathname.slice(1)));
});
test('safari cover does not trap keyboard away from parent close or guide',async()=>{
 const {window:w}=preview('safari'),d=w.document;
 w.eval(fs.readFileSync('previews/envelope.js','utf8'));d.dispatchEvent(new w.Event('DOMContentLoaded'));
 const cover=d.querySelector('#cover-screen');assert.ok(cover);
 const event=new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});cover.dispatchEvent(event);
 assert.equal(event.defaultPrevented,false);
 assert.equal(d.querySelector('#experience').inert,true);
 d.querySelector('.cover-skip').click();assert.equal(Boolean(d.querySelector('#experience').inert),false);
});
test('invitation buttons work without a native form submission and Enter advances locally',()=>{
 const {window:w}=preview('housewarming'),d=w.document;d.querySelector('[data-action="start"]').click();
 let submissions=0;d.querySelector('#guest-form').addEventListener('submit',()=>submissions++);
 const button=[...d.querySelectorAll('#guest-form button')].find(b=>b.textContent.includes('Continuar'));
 assert.equal(button.type,'button');button.click();assert.ok(d.querySelector('.company-options'));assert.equal(submissions,0);
 d.querySelector('[data-action="back"]').click();d.querySelector('#guest-name').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));assert.ok(d.querySelector('.company-options'));
});
