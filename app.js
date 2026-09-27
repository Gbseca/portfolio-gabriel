/* Native dialogs provide focus containment and make the background inert. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const menu = $('navbar-links'), toggle = $('navbar-toggle');
  const setMenu = open => {menu.classList.toggle('open', open);toggle.setAttribute('aria-expanded', String(open));toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');};
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {if(e.key === 'Escape' && menu.classList.contains('open')) {setMenu(false);toggle.focus();}});
  document.addEventListener('click', e => {if(!e.target.closest('#navbar')) setMenu(false);});
  const updateNav = () => $('navbar').classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', updateNav, {passive:true}); updateNav();
  const dialog = $('modal-overlay');
  let projectTrigger;
  $('modal-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {if(e.target === dialog) dialog.close();});
  dialog.addEventListener('close', () => {document.body.style.overflow='';projectTrigger?.focus();});
  function showProject(project, trigger) {
    projectTrigger=trigger;
    $('modal-title').textContent=project.name;
    $('modal-category').textContent=project.category === 'principal' ? 'Em destaque' : 'Projeto & desenvolvimento';
    $('modal-description').textContent=project.detailDescription || project.description;
    $('modal-role').textContent=project.myRole;
    $('modal-integration').textContent=project.integration;
    $('modal-techs').replaceChildren(...project.stack.map(t => {const el=document.createElement('span');el.className='modal-tech-item';el.textContent=t;return el;}));
    $('modal-links').replaceChildren();
    const links=[];
    if(project.demoUrl && new URL(project.demoUrl).hostname !== 'github.com') links.push(['Abrir site',project.demoUrl]);
    if(project.githubUrl && new URL(project.githubUrl).pathname.split('/').filter(Boolean).length >= 2) links.push(['Ver código',project.githubUrl]);
    for(const [label,url] of links) {const a=document.createElement('a');a.textContent=label;a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.className='modal-link';$('modal-links').append(a);}
    dialog.showModal();document.body.style.overflow='hidden';$('modal-close').focus();
  }
  let expanded=false;
  $('btn-show-more').addEventListener('click', () => {
    expanded=!expanded;
    document.querySelectorAll('.project-card[data-extra]').forEach(c=>c.hidden=!expanded);
    $('btn-show-more').textContent=expanded?'Mostrar menos':'Ver todos os projetos';
    $('btn-show-more').setAttribute('aria-expanded',String(expanded));
  });
  async function loadProjects() {
    const grid=$('projects-grid');
    try {
      const res=await fetch('projects.json?v=20260927');if(!res.ok) throw new Error('projects');
      const projects=await res.json();grid.replaceChildren();
      for(const project of projects) {
        const card=document.createElement('button');card.type='button';card.className='project-card';card.setAttribute('aria-label',`Ver detalhes de ${project.name}`);
        const featured=project.category==='principal';
        if(!featured){card.dataset.extra='';card.hidden=!expanded;} else card.classList.add('featured');
        const label=document.createElement('span');label.className='project-card-category';label.textContent=featured?'Em destaque':'Projeto & desenvolvimento';
        const title=document.createElement('h3');title.className='project-card-name';title.textContent=project.name;
        const desc=document.createElement('p');desc.className='project-card-desc';desc.textContent=project.description;
        const footer=document.createElement('div');footer.className='project-card-footer';
        const tags=document.createElement('div');tags.className='project-card-techs';
        for(const tech of project.stack.slice(0,3)){const tag=document.createElement('span');tag.className='tech-pill';tag.textContent=tech;tags.append(tag);}
        const arrow=document.createElement('span');arrow.textContent='↗';arrow.className='project-card-arrow';arrow.setAttribute('aria-hidden','true');
        footer.append(tags,arrow);card.append(label,title,desc,footer);card.addEventListener('click',()=>showProject(project,card));grid.append(card);
      }
      $('show-more-wrapper').hidden=!projects.some(p=>p.category!=='principal');
    } catch {
      grid.replaceChildren();const p=document.createElement('p');p.textContent='Não foi possível carregar os projetos.';
      const retry=document.createElement('button');retry.className='btn btn-outline';retry.textContent='Tentar novamente';retry.addEventListener('click',loadProjects);grid.append(p,retry);$('show-more-wrapper').hidden=true;
    }
  }
  const message=$('contact-message'),service=$('contact-service'),send=$('whatsapp-send');
  function updateWhatsApp(){const text=`Olá, Gabriel! Tenho interesse em ${service.value}. ${message.value.trim() || 'Podemos conversar sobre meu projeto?'}`;send.href=`https://wa.me/5521972969475?text=${encodeURIComponent(text)}`;}
  message.addEventListener('input',updateWhatsApp);service.addEventListener('change',updateWhatsApp);updateWhatsApp();
  $('year').textContent=new Date().getFullYear();loadProjects();
})();
