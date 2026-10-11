const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {JSDOM}=require('jsdom');
test('original cursor follows pointer, grows on controls and clears on exit',()=>{
 const dom=new JSDOM('<button>Open</button><dialog open><button>Close</button></dialog>',{runScripts:'outside-only',url:'https://test.invalid'}),w=dom.window,d=w.document;
 w.matchMedia=()=>({matches:true,addEventListener(){}});w.eval(fs.readFileSync('cursor.js','utf8'));
 const button=d.querySelector('button');button.dispatchEvent(new w.MouseEvent('mousemove',{bubbles:true,clientX:80,clientY:90}));
 const cursor=d.querySelector('#custom-cursor');assert.equal(cursor.style.left,'80px');assert.equal(cursor.style.top,'90px');assert.ok(cursor.classList.contains('cursor-hover'));assert.ok(d.documentElement.classList.contains('cursor-active'));
 d.querySelector('dialog button').dispatchEvent(new w.MouseEvent('mousemove',{bubbles:true}));assert.equal(cursor.parentElement.tagName,'DIALOG');
 w.dispatchEvent(new w.Event('blur'));assert.equal(d.documentElement.classList.contains('cursor-active'),false);dom.window.close();
});
test('restored effects draw particles and honor reduced motion',()=>{
 for(const reduced of [false,true]){
 const dom=new JSDOM('<div><canvas id="particles-canvas"></canvas></div><p id="typewriter">Static text</p><div class="fade-up"></div>',{runScripts:'outside-only'}),w=dom.window;let particles=0;
 w.matchMedia=()=>({matches:reduced});w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},arc(){particles++},fill(){}});w.requestAnimationFrame=()=>{};
 w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(target){this.cb([{target,isIntersecting:true}])}unobserve(){}};
 w.eval(fs.readFileSync('effects.js','utf8'));assert.equal(particles,reduced?0:50);if(reduced)assert.equal(w.document.querySelector('#typewriter').textContent,'Static text');dom.window.close();
 }
});
