(() => {
  if(new URLSearchParams(location.search).has('thumbnail'))return;
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const cursor=document.createElement('div');cursor.id='custom-cursor';cursor.className='custom-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  const hide=()=>document.documentElement.classList.remove('cursor-active');
  document.addEventListener('mousemove',event=>{
    if(!fine.matches){hide();return;}
    const target=event.target instanceof Element?event.target:null;
    if(target?.tagName==='IFRAME'){hide();return;}
    const layer=target?.closest('dialog[open]')||document.body;
    if(cursor.parentElement!==layer)layer.append(cursor);
    cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px';
    cursor.classList.toggle('cursor-hover',Boolean(target?.closest('a, button, .project-card, .service-card')));
    document.documentElement.classList.add('cursor-active');
  });
  document.addEventListener('mouseout',event=>{if(!event.relatedTarget)hide();});
  document.addEventListener('close',hide,true);
  window.addEventListener('blur',hide);fine.addEventListener('change',hide);
})();
