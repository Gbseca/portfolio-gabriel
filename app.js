/* ============================================================
   Gabriel Fonseca — Portfolio · Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. CUSTOM CURSOR
  ---------------------------------------------------------- */
  function initCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    const interactiveSelectors = 'a, button, .project-card, .service-card';

    document.addEventListener('mouseenter', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursor.classList.add('cursor-hover');
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        cursor.classList.remove('cursor-hover');
      }
    }, true);
  }

  /* ----------------------------------------------------------
     2. PARTICLES CANVAS
  ---------------------------------------------------------- */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resize() {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.6,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    }

    function update() {
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, ' + p.opacity + ')';
        ctx.fill();
      }
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    resize();
    createParticles();
    loop();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  /* ----------------------------------------------------------
     3. TYPEWRITER EFFECT
  ---------------------------------------------------------- */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    const phrases = [
      'Automações inteligentes para WhatsApp com IA.',
      'Sistemas de agendamento que funcionam sozinhos.',
      'Sites profissionais que atraem clientes.',
      'Soluções sob medida para o seu negócio.',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    el.classList.add('typewriter-cursor');

    function tick() {
      const current = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex++;
        el.textContent = current.substring(0, charIndex);

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 60);
      } else {
        charIndex--;
        el.textContent = current.substring(0, charIndex);

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, 500);
          return;
        }
        setTimeout(tick, 30);
      }
    }

    tick();
  }

  /* ----------------------------------------------------------
     4. NAVBAR SCROLL EFFECT
  ---------------------------------------------------------- */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     5. MOBILE MENU TOGGLE
  ---------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.getElementById('navbar-toggle');
    const links = document.getElementById('navbar-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
      });
    });
  }

  /* ----------------------------------------------------------
     6. ACTIVE NAV HIGHLIGHT
  ---------------------------------------------------------- */
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('#navbar-links a').forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ----------------------------------------------------------
     7. SCROLL REVEAL (fade-up)
  ---------------------------------------------------------- */
  let fadeUpObserver;

  function initScrollReveal() {
    fadeUpObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeUpObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach((el) => {
      fadeUpObserver.observe(el);
    });
  }

  function observeNewFadeUps() {
    if (!fadeUpObserver) return;
    document.querySelectorAll('.fade-up:not(.visible)').forEach((el) => {
      fadeUpObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     8. PROJECT LOADING & RENDERING
  ---------------------------------------------------------- */
  const CATEGORY_LABELS = {
    principal: 'Destaque',
    secundario: 'Comercial',
    utilitario: 'Ferramenta',
  };

  let allProjects = [];
  let showAllProjects = false;

  function buildProjectCard(project, isFeatured, forceShow) {
    const hiddenClass = !isFeatured && !forceShow ? 'hidden-card' : '';
    const featuredClass = isFeatured ? 'featured' : '';
    const categoryLabel = CATEGORY_LABELS[project.category] || project.category;

    const techs = project.techs || [];
    const visibleTechs = techs.slice(0, 3);
    const remaining = techs.length - 3;

    let techsHTML = visibleTechs
      .map((t) => '<span class="tech-pill">' + t + '</span>')
      .join('');
    if (remaining > 0) {
      techsHTML += '<span class="tech-pill">+' + remaining + '</span>';
    }

    const card = document.createElement('article');
    card.className = ['project-card', 'fade-up', featuredClass, hiddenClass]
      .filter(Boolean)
      .join(' ');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML =
      '<span class="project-card-category">' + categoryLabel + '</span>' +
      '<h3 class="project-card-name">' + project.name + '</h3>' +
      '<p class="project-card-desc">' + project.description + '</p>' +
      '<div class="project-card-footer">' +
        '<div class="project-card-techs">' + techsHTML + '</div>' +
        '<div class="project-card-arrow">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="5" y1="12" x2="19" y2="12"></line>' +
            '<polyline points="12 5 19 12 12 19"></polyline>' +
          '</svg>' +
        '</div>' +
      '</div>';

    card.addEventListener('click', () => openModal(project));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openModal(project);
    });

    return card;
  }

  function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const featured = projects.filter((p) => p.category === 'principal');
    const others = projects.filter((p) => p.category !== 'principal');

    featured.forEach((p) => {
      grid.appendChild(buildProjectCard(p, true, true));
    });

    others.forEach((p) => {
      grid.appendChild(buildProjectCard(p, false, showAllProjects));
    });

    observeNewFadeUps();
  }

  async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Erro ao carregar projetos.');
      allProjects = await response.json();
      renderProjects(allProjects);
    } catch (err) {
      grid.innerHTML =
        '<p class="projects-error">Não foi possível carregar os projetos. Tente novamente mais tarde.</p>';
    }
  }

  /* ----------------------------------------------------------
     9. SHOW MORE / LESS
  ---------------------------------------------------------- */
  function initShowMore() {
    const btn = document.getElementById('btn-show-more');
    if (!btn) return;

    btn.addEventListener('click', () => {
      showAllProjects = !showAllProjects;

      const hiddenCards = document.querySelectorAll('.project-card.hidden-card');

      if (showAllProjects) {
        hiddenCards.forEach((card) => card.classList.add('visible'));
        btn.classList.add('expanded');
        btn.textContent = 'Ver menos';
      } else {
        hiddenCards.forEach((card) => card.classList.remove('visible'));
        btn.classList.remove('expanded');
        btn.textContent = 'Ver mais projetos';
      }
    });
  }

  /* ----------------------------------------------------------
     10. MODAL
  ---------------------------------------------------------- */
  function openModal(project) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    const categoryLabel = CATEGORY_LABELS[project.category] || project.category;

    const elCategory = document.getElementById('modal-category');
    const elTitle = document.getElementById('modal-title');
    const elDesc = document.getElementById('modal-description');
    const elRole = document.getElementById('modal-role');
    const elIntegration = document.getElementById('modal-integration');
    const elTechs = document.getElementById('modal-techs');
    const elLinks = document.getElementById('modal-links');

    if (elCategory) elCategory.textContent = categoryLabel;
    if (elTitle) elTitle.textContent = project.name || '';
    if (elDesc) elDesc.textContent = project.description || '';
    if (elRole) elRole.textContent = project.role || '';
    if (elIntegration) elIntegration.textContent = project.integration || '';

    if (elTechs) {
      elTechs.innerHTML = '';
      (project.techs || []).forEach((tech) => {
        const span = document.createElement('span');
        span.className = 'modal-tech-item';
        span.textContent = tech;
        elTechs.appendChild(span);
      });
    }

    if (elLinks) {
      elLinks.innerHTML = '';

      if (project.demoUrl) {
        const a = document.createElement('a');
        a.href = project.demoUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'modal-link modal-link-demo';
        a.textContent = 'Ver Demo';
        elLinks.appendChild(a);
      }

      if (project.githubUrl) {
        const a = document.createElement('a');
        a.href = project.githubUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'modal-link modal-link-github';
        a.textContent = 'GitHub';
        elLinks.appendChild(a);
      }
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ----------------------------------------------------------
     11. SMOOTH SCROLL
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     12. INIT
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initParticles();
    initTypewriter();
    initNavbarScroll();
    initMobileMenu();
    initActiveNav();
    initScrollReveal();
    initShowMore();
    initModal();
    initSmoothScroll();
    loadProjects();
  });
})();
