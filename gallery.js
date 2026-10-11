(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const dialog=$('preview-dialog'),stage=$('preview-stage'),title=$('preview-title'),status=$('preview-status');
  const original=$('preview-original'),guide=$('live-guide');
  const sites={
    vora:{url:'https://vorastore-phi.vercel.app/',tips:[
      ['Uma loja com identidade','Explore a coleção em verde esmeralda. Abra o site em outra aba para conhecer também a música opcional e as animações do mascote Vori.'],
      ['Encontre uma peça','Use “Roupas” para abrir o catálogo. Experimente categorias e busca para conhecer a navegação.'],
      ['Do produto à sacola','Abra uma peça, consulte o guia de medidas e escolha um tamanho. A sacola permite ajustar a quantidade; o site informa que as compras são demonstrativas, sem cobrança.']
    ]},
    moove:{url:'https://mooveprotecao.vercel.app/',tips:[
      ['Uma página voltada ao atendimento','Explore a apresentação e o formulário de cotação. Ele reúne contato e dados do veículo. Para testar o layout, navegue sem enviar seus dados.'],
      ['Informações ao alcance','Use o menu “Coberturas” e “Transparência” para conhecer como o conteúdo organiza os benefícios e as condições.'],
      ['Respostas que se abrem','Toque nas perguntas frequentes para expandir cada resposta. Os botões de WhatsApp são canais reais da Moove; abra o site em outra aba para entrar em contato.']
    ]}
  };
  let trigger,frame,loadTimer,liveKey=null,tip=0;
  function beginLoad(){clearTimeout(loadTimer);status.hidden=false;status.textContent='Preparando sua experiência…';loadTimer=setTimeout(()=>{status.textContent='A prévia demorou para abrir. Use Reiniciar ou abra o site em outra aba.';status.hidden=false;},15000);}
  function ready(){clearTimeout(loadTimer);status.hidden=true;}
  function renderGuide(focus=false){
    if(!liveKey)return;
    const tips=sites[liveKey].tips;
    guide.hidden=false;$('live-guide-count').textContent=`DICA ${tip+1} / ${tips.length}`;
    $('live-guide-title').textContent=tips[tip][0];$('live-guide-text').textContent=tips[tip][1];
    $('live-guide-back').disabled=tip===0;$('live-guide-next').textContent=tip===tips.length-1?'Explorar livremente ✓':'Próxima dica →';
    if(focus)$('live-guide-title').focus({preventScroll:true});
  }
  function dismissGuide(){guide.hidden=true;$('preview-guide').focus();}
  $('preview-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{clearTimeout(loadTimer);frame?.remove();frame=null;liveKey=null;guide.hidden=true;document.body.style.overflow='';trigger?.focus();});
  $('preview-restart').addEventListener('click',()=>{if(frame){beginLoad();frame.src=liveKey?sites[liveKey].url:frame.src;if(liveKey){tip=0;renderGuide();}}});
  $('preview-guide').addEventListener('click',()=>{if(liveKey)renderGuide(true);else frame?.contentWindow?.postMessage({channel:'portfolio-preview',type:'guide'},'*');});
  $('live-guide-dismiss').addEventListener('click',dismissGuide);
  $('live-guide-back').addEventListener('click',()=>{tip=Math.max(0,tip-1);renderGuide(true);});
  $('live-guide-next').addEventListener('click',()=>{if(tip===sites[liveKey].tips.length-1)dismissGuide();else{tip++;renderGuide(true);}});
  document.querySelectorAll('[data-preview],[data-live-preview]').forEach(button=>button.addEventListener('click',()=>{
    trigger=button;title.textContent=button.dataset.title;stage.dataset.device=button.dataset.device;
    liveKey=Object.hasOwn(sites,button.dataset.livePreview||'')?button.dataset.livePreview:null;
    tip=0;stage.dataset.live=String(Boolean(liveKey));guide.hidden=true;original.hidden=!liveKey;
    if(liveKey){original.href=sites[liveKey].url;renderGuide();}else original.removeAttribute('href');
    beginLoad();frame=document.createElement('iframe');frame.id='preview-frame';frame.title=`Prévia interativa: ${button.dataset.title}`;
    // External origins need their own origin for API/catalog requests; no form or popup permissions.
    frame.setAttribute('sandbox',liveKey?'allow-scripts allow-same-origin':'allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');
    if(liveKey){frame.addEventListener('load',ready);frame.src=sites[liveKey].url;}else frame.src=`previews/index.html?sample=${encodeURIComponent(button.dataset.preview)}`;
    stage.append(frame);dialog.showModal();document.body.style.overflow='hidden';$('preview-close').focus();
    $('preview-contact').href=`https://wa.me/5521972969475?text=${encodeURIComponent('Olá, Gabriel! Gostei do projeto '+button.dataset.title+' e gostaria de um projeto nesse estilo.')}`;
  }));
  window.addEventListener('message',e=>{
    if(liveKey||!frame||e.source!==frame.contentWindow||e.data?.channel!=='portfolio-preview')return;
    if(e.data.type==='ready')ready();if(e.data.type==='close')dialog.close();
  });
  const sizeThumb=el=>{const w=el.dataset.device==='mobile'?390:1120;el.querySelector('iframe').style.transform=`scale(${el.clientWidth/w})`;};
  document.querySelectorAll('.sample-screen').forEach(el=>{sizeThumb(el);new ResizeObserver(()=>sizeThumb(el)).observe(el);});
})();
