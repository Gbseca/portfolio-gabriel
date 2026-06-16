/**
 * PORTFOLIO INTERACTIVE CONTROLLER - GABRIEL FONSECA
 */

// Global State
let projectsData = [];
let activeFilter = 'all';
let utilitiesExpanded = false;

// DOM Elements
const navTabs = document.getElementById('nav-tabs');
const tabButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.view-panel');
const projectsGrid = document.getElementById('projects-grid');
const filterButtons = document.querySelectorAll('.filter-tag-btn');
const expandContainer = document.getElementById('expand-container');
const btnToggleUtilities = document.getElementById('btn-toggle-utilities');
const btnGoToWorks = document.getElementById('btn-go-to-works');
const btnCallWorks = document.getElementById('btn-call-works');

// Detail Viewer Elements
const detailPlaceholder = document.getElementById('detail-placeholder');
const detailViewer = document.getElementById('project-detail-viewer');
const detailName = document.getElementById('detail-name');
const detailCategoryBadge = document.getElementById('detail-category-badge');
const detailDescription = document.getElementById('detail-description');
const detailRole = document.getElementById('detail-role');
const detailIntegration = document.getElementById('detail-integration');
const detailStackTags = document.getElementById('detail-stack-tags');
const detailLinks = document.getElementById('detail-links');

/* ==========================================================================
   INITIALIZATION & DATA LOADING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadProjectsData();
  setupTabNavigation();
  setupFilterControls();
  setupUtilityToggler();
  
  // Hero CTA redirector
  if (btnCallWorks) {
    btnCallWorks.addEventListener('click', () => {
      switchTab('trabalhos');
    });
  }

  // Back to works redirector
  if (btnGoToWorks) {
    btnGoToWorks.addEventListener('click', () => {
      switchTab('trabalhos');
    });
  }
});

/**
 * Fetch projects configuration JSON
 */
async function loadProjectsData() {
  try {
    const response = await fetch('projects.json');
    if (!response.ok) throw new Error('Falha ao carregar projects.json');
    projectsData = await response.json();
    renderProjects();
  } catch (error) {
    console.error('Erro de carregamento:', error);
    projectsGrid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 30px; text-align: center; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; background: rgba(239, 68, 68, 0.03);">
        <p>Não foi possível carregar os dados dos projetos. Por favor, tente novamente mais tarde.</p>
      </div>
    `;
  }
}

/* ==========================================================================
   TAB NAVIGATION SYSTEM
   ========================================================================== */

function setupTabNavigation() {
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const targetTab = button.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

/**
 * Switches global active tab panel
 * @param {string} tabId - Destination tab ('resumo' | 'trabalhos' | 'detalhes')
 */
function switchTab(tabId) {
  // Update nav buttons active states
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Switch active section panels with transition delay
  sections.forEach(section => {
    if (section.id === `section-${tabId}`) {
      section.style.display = 'flex';
      setTimeout(() => {
        section.classList.add('active');
      }, 50);
    } else {
      section.classList.remove('active');
      section.style.display = 'none';
    }
  });

  // Scroll to top of panel on change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   PORTFOLIO FILTER & RENDER ENGINE
   ========================================================================== */

function setupFilterControls() {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active states on filters
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      activeFilter = button.getAttribute('data-filter');
      
      // Reset expander state when changing filters
      utilitiesExpanded = false;
      updateExpanderUIState();

      renderProjects();
    });
  });
}

function setupUtilityToggler() {
  btnToggleUtilities.addEventListener('click', () => {
    utilitiesExpanded = !utilitiesExpanded;
    updateExpanderUIState();
    
    // Toggle class visibility on cards directly for high performance
    const utilityCards = document.querySelectorAll('.project-card.utility-item');
    utilityCards.forEach(card => {
      if (utilitiesExpanded) {
        card.classList.add('show');
      } else {
        card.classList.remove('show');
      }
    });
  });
}

function updateExpanderUIState() {
  if (utilitiesExpanded) {
    btnToggleUtilities.classList.add('expanded');
    btnToggleUtilities.querySelector('span').textContent = 'Ocultar Projetos Secundários & Utilitários';
    btnToggleUtilities.setAttribute('aria-expanded', 'true');
  } else {
    btnToggleUtilities.classList.remove('expanded');
    btnToggleUtilities.querySelector('span').textContent = 'Mostrar Projetos Secundários & Utilitários';
    btnToggleUtilities.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Main project rendering controller
 */
function renderProjects() {
  projectsGrid.innerHTML = '';
  
  // Filter items
  const filtered = projectsData.filter(project => {
    if (activeFilter === 'all') return true;
    return project.category === activeFilter;
  });

  if (filtered.length === 0) {
    projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px; font-size: 0.9rem;">Nenhum projeto encontrado nesta categoria.</p>';
    expandContainer.classList.add('hidden');
    return;
  }

  // Determine if we show the "Ver mais" button
  // We only show the expand toggle on the "all" filter and if there are utility/secondary projects
  const hasUtilities = projectsData.some(p => p.category === 'utilitario' || p.category === 'secundario');
  if (activeFilter === 'all' && hasUtilities) {
    expandContainer.classList.remove('hidden');
  } else {
    expandContainer.classList.add('hidden');
  }

  filtered.forEach(project => {
    const card = document.createElement('article');
    card.className = `project-card ${project.category}`;
    
    // If we are on 'all' view and it's utility/secondary, hide it behind the toggle
    if (activeFilter === 'all' && (project.category === 'utilitario' || project.category === 'secundario')) {
      card.classList.add('utility-item');
      if (utilitiesExpanded) {
        card.classList.add('show');
      }
    }

    // SVG Icons
    const githubIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-link"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
    const externalLinkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

    // Build techs HTML
    const techsHtml = project.stack
      .slice(0, 3) // Show maximum 3 tags on preview card
      .map(tech => `<span class="tech-tag">${tech}</span>`)
      .join('');

    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-badge-category">${translateCategory(project.category)}</span>
        <div class="project-card-links">
          ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" title="Ver no GitHub">${githubIconSvg}</a>` : ''}
          ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" title="Acessar Site">${externalLinkSvg}</a>` : ''}
        </div>
      </div>
      <h3 class="project-card-title">${project.name}</h3>
      <p class="project-card-desc">${project.description}</p>
      <div class="project-card-footer">
        <div class="project-card-techs">
          ${techsHtml}
          ${project.stack.length > 3 ? `<span class="tech-tag">+${project.stack.length - 3}</span>` : ''}
        </div>
        <div class="project-action-row">
          <button class="btn-inspect-project" data-id="${project.id}">
            <span>Ver Ficha Técnica</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    `;

    // Action listener to switch to Details panel
    const btnInspect = card.querySelector('.btn-inspect-project');
    btnInspect.addEventListener('click', () => {
      viewProjectDetails(project.id);
    });

    projectsGrid.appendChild(card);
  });
}

function translateCategory(cat) {
  switch(cat) {
    case 'principal': return 'Destaque Principal';
    case 'secundario': return 'Comercial / Dashboard';
    case 'utilitario': return 'Utilitário';
    default: return cat;
  }
}

/* ==========================================================================
   ABA: DETALHES DO PROJETO - CONTROLLER
   ========================================================================== */

/**
 * Loads project info and switches to Details tab
 * @param {string} projectId 
 */
function viewProjectDetails(projectId) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  // Set titles
  detailName.textContent = project.name;
  detailCategoryBadge.textContent = translateCategory(project.category);
  
  // Custom styling for category tag in details
  if (project.category === 'principal') {
    detailCategoryBadge.style.color = '#3b82f6';
    detailCategoryBadge.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
    detailCategoryBadge.style.borderColor = 'rgba(59, 130, 246, 0.2)';
  } else if (project.category === 'secundario') {
    detailCategoryBadge.style.color = '#8b5cf6';
    detailCategoryBadge.style.backgroundColor = 'rgba(139, 92, 246, 0.08)';
    detailCategoryBadge.style.borderColor = 'rgba(139, 92, 246, 0.2)';
  } else {
    detailCategoryBadge.style.color = 'var(--text-muted)';
    detailCategoryBadge.style.backgroundColor = 'transparent';
    detailCategoryBadge.style.borderColor = 'var(--border-color)';
  }

  // Populate details text
  detailDescription.innerHTML = project.detailDescription;
  detailRole.innerHTML = project.myRole;
  detailIntegration.innerHTML = project.integration || 'Nenhuma integração especial necessária.';

  // Build tech tags
  detailStackTags.innerHTML = '';
  project.stack.forEach(tech => {
    const span = document.createElement('span');
    span.textContent = tech;
    detailStackTags.appendChild(span);
  });

  // Build links
  detailLinks.innerHTML = '';
  if (project.demoUrl) {
    const aDemo = document.createElement('a');
    aDemo.href = project.demoUrl;
    aDemo.target = '_blank';
    aDemo.rel = 'noopener noreferrer';
    aDemo.className = 'detail-btn-link primary';
    aDemo.innerHTML = `
      <span>Acessar Projeto</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
    `;
    detailLinks.appendChild(aDemo);
  }
  
  if (project.githubUrl) {
    const aGit = document.createElement('a');
    aGit.href = project.githubUrl;
    aGit.target = '_blank';
    aGit.rel = 'noopener noreferrer';
    aGit.className = 'detail-btn-link secondary';
    aGit.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
      <span>Ver no GitHub</span>
    `;
    detailLinks.appendChild(aGit);
  }

  // Show details, hide placeholder
  detailPlaceholder.classList.add('hidden');
  detailViewer.classList.remove('hidden');

  // Switch tab view
  switchTab('detalhes');
}
