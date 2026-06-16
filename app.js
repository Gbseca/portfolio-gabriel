/**
 * PORTFOLIO CONTROLLER — GABRIEL FONSECA
 * Scroll-based layout with modal details, no tabs.
 */

// ── State ──
let projectsData = [];
let showAllProjects = false;

// ── DOM References ──
const navbar = document.getElementById('navbar');
const navbarToggle = document.getElementById('navbar-toggle');
const navbarLinks = document.getElementById('navbar-links');
const projectsGrid = document.getElementById('projects-grid');
const btnShowMore = document.getElementById('btn-show-more');
const showMoreWrapper = document.getElementById('show-more-wrapper');

// Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalCard = document.getElementById('modal-card');
const modalClose = document.getElementById('modal-close');
const modalCategory = document.getElementById('modal-category');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalRole = document.getElementById('modal-role');
const modalIntegration = document.getElementById('modal-integration');
const modalTechs = document.getElementById('modal-techs');
const modalLinks = document.getElementById('modal-links');

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  setupNavbar();
  setupModal();
  setupShowMore();
  setupScrollReveal();
});

/* ==========================================================================
   DATA LOADING
   ========================================================================== */

async function loadProjects() {
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('Failed to load');
    projectsData = await res.json();
    renderProjects();
  } catch (err) {
    console.error('Erro:', err);
    projectsGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #ef4444; border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; background: rgba(239,68,68,0.03);">
        <p>Não foi possível carregar os projetos.</p>
      </div>
    `;
  }
}

/* ==========================================================================
   PROJECT RENDERING
   ========================================================================== */

function renderProjects() {
  projectsGrid.innerHTML = '';

  // Separate featured (principal) from the rest
  const featured = projectsData.filter(p => p.category === 'principal');
  const others = projectsData.filter(p => p.category !== 'principal');

  // Always show featured projects
  featured.forEach(project => {
    projectsGrid.appendChild(createProjectCard(project, true));
  });

  // Others are hidden by default
  others.forEach(project => {
    const card = createProjectCard(project, false);
    if (!showAllProjects) {
      card.classList.add('hidden-card');
    }
    projectsGrid.appendChild(card);
  });

  // Show/hide the "show more" button
  if (others.length === 0) {
    showMoreWrapper.classList.add('hidden');
  } else {
    showMoreWrapper.classList.remove('hidden');
    updateShowMoreButton();
  }
}

function createProjectCard(project, isFeatured) {
  const card = document.createElement('article');
  card.className = `project-card${isFeatured ? ' featured' : ''}`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Ver detalhes de ${project.name}`);

  const techsHtml = project.stack
    .slice(0, 3)
    .map(t => `<span class="tech-pill">${t}</span>`)
    .join('');

  const extraCount = project.stack.length > 3 ? `<span class="tech-pill">+${project.stack.length - 3}</span>` : '';

  card.innerHTML = `
    <div class="project-card-body">
      <span class="project-card-category">${categoryLabel(project.category)}</span>
      <h3 class="project-card-name">${project.name}</h3>
      <p class="project-card-desc">${project.description}</p>
      <div class="project-card-footer">
        <div class="project-card-techs">
          ${techsHtml}${extraCount}
        </div>
        <div class="project-card-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
      </div>
    </div>
  `;

  // Click opens modal
  card.addEventListener('click', () => openModal(project));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(project);
    }
  });

  return card;
}

function categoryLabel(cat) {
  switch (cat) {
    case 'principal': return 'Destaque';
    case 'secundario': return 'Comercial';
    case 'utilitario': return 'Ferramenta';
    default: return cat;
  }
}

/* ==========================================================================
   SHOW MORE / LESS
   ========================================================================== */

function setupShowMore() {
  btnShowMore.addEventListener('click', () => {
    showAllProjects = !showAllProjects;
    updateShowMoreButton();

    const hiddenCards = document.querySelectorAll('.project-card.hidden-card');
    hiddenCards.forEach(card => {
      if (showAllProjects) {
        card.classList.add('visible');
      } else {
        card.classList.remove('visible');
      }
    });
  });
}

function updateShowMoreButton() {
  const label = btnShowMore.querySelector('span');
  if (showAllProjects) {
    label.textContent = 'Mostrar menos';
    btnShowMore.classList.add('expanded');
  } else {
    label.textContent = 'Ver todos os projetos';
    btnShowMore.classList.remove('expanded');
  }
}

/* ==========================================================================
   PROJECT DETAIL MODAL
   ========================================================================== */

function setupModal() {
  // Close on X button
  modalClose.addEventListener('click', closeModal);

  // Close on overlay click (outside modal card)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(project) {
  // Populate content
  modalCategory.textContent = categoryLabel(project.category);
  modalTitle.textContent = project.name;
  modalDescription.innerHTML = project.detailDescription;
  modalRole.innerHTML = project.myRole;
  modalIntegration.innerHTML = project.integration || 'Sem integrações especiais.';

  // Techs
  modalTechs.innerHTML = '';
  project.stack.forEach(tech => {
    const span = document.createElement('span');
    span.className = 'modal-tech-item';
    span.textContent = tech;
    modalTechs.appendChild(span);
  });

  // Links
  modalLinks.innerHTML = '';
  if (project.demoUrl) {
    const a = document.createElement('a');
    a.href = project.demoUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'modal-link primary';
    a.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      Ver projeto
    `;
    modalLinks.appendChild(a);
  }
  if (project.githubUrl) {
    const a = document.createElement('a');
    a.href = project.githubUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'modal-link secondary';
    a.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      GitHub
    `;
    modalLinks.appendChild(a);
  }

  // Show modal
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   NAVBAR — SCROLL EFFECT & MOBILE TOGGLE
   ========================================================================== */

function setupNavbar() {
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile toggle
  navbarToggle.addEventListener('click', () => {
    navbarLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navbarLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navbarLinks.classList.remove('open');
    });
  });

  // Active link highlight on scroll
  setupActiveNavHighlight();
}

function setupActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navItems = navbarLinks.querySelectorAll('a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */

function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
