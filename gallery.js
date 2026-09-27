(() => {
  'use strict';
  const dialog=document.getElementById('preview-dialog'),stage=document.getElementById('preview-stage');
  const title=document.getElementById('preview-title'),status=document.getElementById('preview-status');
  let trigger,frame,loadTimer;
  function beginLoad(){clearTimeout(loadTimer);status.hidden=false;status.textContent='Preparando sua experiência…';loadTimer=setTimeout(()=>{status.textContent='A prévia demorou para abrir. Use Reiniciar para tentar novamente.';status.hidden=false;},15000);}
  document.getElementById('preview-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{clearTimeout(loadTimer);frame?.remove();frame=null;document.body.style.overflow='';trigger?.focus();});
  document.getElementById('preview-restart').addEventListener('click',()=>{if(frame){beginLoad();frame.src=frame.src;}});
  document.getElementById('preview-guide').addEventListener('click',()=>frame?.contentWindow?.postMessage({channel:'portfolio-preview',type:'guide'},'*'));
  document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',()=>{
    trigger=button;title.textContent=button.dataset.title;stage.dataset.device=button.dataset.device;
    beginLoad();
    frame=document.createElement('iframe');frame.id='preview-frame';frame.title=`Prévia interativa: ${button.dataset.title}`;
    frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');
    frame.src=`previews/index.html?sample=${encodeURIComponent(button.dataset.preview)}`;
    stage.append(frame);dialog.showModal();document.body.style.overflow='hidden';document.getElementById('preview-close').focus();
    document.getElementById('preview-contact').href=`https://wa.me/5521972969475?text=${encodeURIComponent('Olá, Gabriel! Gostei da amostra '+button.dataset.title+' e gostaria de um projeto nesse estilo.')}`;
  }));
  window.addEventListener('message',e=>{
    if(!frame || e.source!==frame.contentWindow || e.data?.channel!=='portfolio-preview') return;
    if(e.data.type==='ready'){clearTimeout(loadTimer);status.hidden=true;}
    if(e.data.type==='close')dialog.close();
  });
  const sizeThumb = el => {const w=el.dataset.device==='mobile'?390:1120;el.querySelector('iframe').style.transform=`scale(${el.clientWidth/w})`;};
  document.querySelectorAll('.sample-screen').forEach(el=>{sizeThumb(el);new ResizeObserver(()=>sizeThumb(el)).observe(el);});
})();
