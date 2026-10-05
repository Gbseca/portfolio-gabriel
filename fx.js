/* FX layer: background, cursor, reveals, tilt, magnetic buttons, counters.
   Pure progressive enhancement — every piece is guarded so a failure never
   breaks the portfolio itself. */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const mm = q => (window.matchMedia ? window.matchMedia(q) : { matches: false });
  const reduced = mm('(prefers-reduced-motion: reduce)').matches;
  const finePointer = mm('(hover: hover) and (pointer: fine)').matches;
  const make = (tag, cls, parent) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (parent) parent.append(el); return el; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mouse = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };

  /* ---------- Background: aurora + reactive dot grid ---------- */
  function setupBackground() {
    const bg = make('div', 'fx-bg');
    bg.setAttribute('aria-hidden', 'true');
    const aurora = make('div', 'fx-aurora', bg);
    for (let i = 1; i <= 4; i++) make('div', `fx-blob fx-blob-${i}`, aurora);
    const canvas = make('canvas', 'fx-dots', bg);
    doc.body.prepend(bg);
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;

    const GAP = 34, RADIUS = 170;
    let w = 0, h = 0, dpr = 1, raf = 0, px = 0, py = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(0);
    };
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const scrollShift = (window.scrollY * 0.12) % GAP;
      const cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 2;
      for (let r = -1; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let x = c * GAP + GAP / 2, y = r * GAP + GAP / 2 - scrollShift;
          let size = 1.1, alpha = 0.16;
          if (!reduced) {
            // gentle idle wave so the grid is alive even without a mouse
            const wave = Math.sin(t / 1400 + c * 0.45 + r * 0.38);
            size += wave * 0.35; alpha += wave * 0.05;
          }
          if (mouse.active) {
            const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
            if (d < RADIUS) {
              const f = 1 - d / RADIUS, e = f * f * (3 - 2 * f);
              size += e * 2.6; alpha += e * 0.55;
              const push = e * 9; x += (dx / (d || 1)) * push; y += (dy / (d || 1)) * push;
            }
          }
          ctx.beginPath();
          ctx.fillStyle = `rgba(37,99,235,${Math.min(alpha, 0.8).toFixed(3)})`;
          ctx.arc(x, y, size, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    const loop = t => {
      px = lerp(px, mouse.nx, 0.05); py = lerp(py, mouse.ny, 0.05);
      bg.style.setProperty('--px', px.toFixed(3)); bg.style.setProperty('--py', py.toFixed(3));
      draw(t); raf = requestAnimationFrame(loop);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    if (reduced) return;
    raf = requestAnimationFrame(loop);
    doc.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!doc.hidden) raf = requestAnimationFrame(loop);
    });
  }

  /* ---------- Pointer tracking (shared) ---------- */
  function trackPointer() {
    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
      mouse.nx = e.clientX / window.innerWidth - 0.5; mouse.ny = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    doc.addEventListener('pointerleave', () => { mouse.active = false; });
    window.addEventListener('blur', () => { mouse.active = false; });
  }

  /* ---------- Animated cursor ---------- */
  function setupCursor() {
    if (!finePointer) return;
    const dot = make('div', 'fx-cursor-dot', doc.body);
    const ring = make('div', 'fx-cursor-ring', doc.body);
    const trail = Array.from({ length: 7 }, () => make('div', 'fx-cursor-trail', doc.body));
    [dot, ring, ...trail].forEach(el => el.setAttribute('aria-hidden', 'true'));
    trail.forEach((el, i) => { el.style.scale = String(1 - i * 0.11); });
    root.classList.add('fx-cursor-on');
    const pos = { rx: -100, ry: -100, trail: trail.map(() => ({ x: -100, y: -100 })) };
    let started = false, raf = 0;

    const interactive = 'a,button,[role="button"],summary,label[for],select,.project-card,.sample-open,.btn,.social-icon';
    const place = (el, x, y) => { el.style.transform = `translate3d(${x}px,${y}px,0)`; };
    const tick = () => {
      place(dot, mouse.x, mouse.y);
      pos.rx = lerp(pos.rx, mouse.x, 0.17); pos.ry = lerp(pos.ry, mouse.y, 0.17);
      place(ring, pos.rx, pos.ry);
      let tx = mouse.x, ty = mouse.y;
      trail.forEach((el, i) => {
        const p = pos.trail[i];
        p.x = lerp(p.x, tx, 0.34); p.y = lerp(p.y, ty, 0.34);
        place(el, p.x, p.y); tx = p.x; ty = p.y;
      });
      raf = requestAnimationFrame(tick);
    };
    const begin = () => {
      if (started) return; started = true;
      pos.rx = mouse.x; pos.ry = mouse.y; pos.trail.forEach(p => { p.x = mouse.x; p.y = mouse.y; });
      root.classList.add('fx-cursor-live'); raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      begin();
      const t = e.target instanceof Element ? e.target : null;
      root.classList.toggle('fx-cursor-hover', !!(t && t.closest(interactive)));
      root.classList.toggle('fx-cursor-text', !!(t && t.closest('input,textarea')));
    }, { passive: true });
    doc.addEventListener('pointerdown', e => {
      root.classList.add('fx-cursor-down');
      const r = make('div', 'fx-ripple', doc.body);
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      r.addEventListener('animationend', () => r.remove());
    });
    doc.addEventListener('pointerup', () => root.classList.remove('fx-cursor-down'));
    doc.addEventListener('mouseleave', () => root.classList.remove('fx-cursor-live'));
    doc.addEventListener('mouseenter', () => { if (started) root.classList.add('fx-cursor-live'); });

    // Native <dialog>s render above everything: hand the native cursor back while one is open.
    const sync = () => {
      const open = !!doc.querySelector('dialog[open]');
      root.classList.toggle('fx-cursor-on', !open);
      root.classList.toggle('fx-cursor-live', !open && started);
    };
    const mo = new MutationObserver(sync);
    doc.querySelectorAll('dialog').forEach(d => mo.observe(d, { attributes: true, attributeFilter: ['open'] }));
  }

  /* ---------- Scroll progress + scroll spy ---------- */
  function setupScroll() {
    const bar = make('div', 'fx-progress'); bar.setAttribute('aria-hidden', 'true'); doc.body.prepend(bar);
    let ticking = false;
    const update = () => {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    const links = [...doc.querySelectorAll('#navbar-links a[href^="#"]')];
    const sections = links.map(a => doc.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Hero: word reveal, stats, marquee ---------- */
  function setupHero() {
    const title = doc.querySelector('.hero-title');
    if (title && !reduced) {
      let i = 0;
      [...title.childNodes].forEach(node => {
        if (node.nodeType !== 3) return;
        const frag = doc.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part.trim()) { if (part) frag.append(doc.createTextNode(' ')); return; }
          const outer = make('span', 'fx-word'), inner = make('span', '', outer);
          inner.textContent = part; inner.style.setProperty('--i', String(i++)); frag.append(outer);
        });
        node.replaceWith(frag);
      });
    }

    const content = doc.querySelector('.hero-content');
    if (content && !content.querySelector('.fx-stats')) {
      const stats = make('div', 'fx-stats fx-reveal');
      const items = [
        ['projects', 'projetos publicados'],
        ['samples', 'experiências interativas'],
        ['services', 'soluções sob medida'],
      ];
      items.forEach(([key, label]) => {
        const s = make('div', 'fx-stat', stats);
        const n = make('strong', '', s); n.dataset.stat = key; n.textContent = '0';
        make('span', '', s).textContent = label;
      });
      content.append(stats);
    }

    const hero = doc.getElementById('inicio');
    if (hero && !doc.querySelector('.fx-marquee')) {
      const techs = ['Node.js', 'React', 'Next.js', 'TypeScript', 'Supabase', 'WhatsApp + IA', 'Gemini', 'Vite', 'Tailwind', 'Vercel', 'Netlify', 'Docker'];
      const band = make('div', 'fx-marquee');
      band.setAttribute('aria-hidden', 'true');
      const track = make('div', 'fx-marquee-track', band);
      for (let k = 0; k < 2; k++) {
        const set = make('span', '', track);
        techs.forEach(t => { set.append(doc.createTextNode(t)); make('i', '', set); });
      }
      hero.after(band);
    }
  }

  function countUp(el, target) {
    if (reduced || !target) { el.textContent = String(target); return; }
    const start = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function runStats() {
    const values = {
      projects: doc.querySelectorAll('.project-card').length,
      samples: doc.querySelectorAll('[data-preview]').length,
      services: doc.querySelectorAll('.service-card').length,
    };
    doc.querySelectorAll('[data-stat]').forEach(el => {
      const v = values[el.dataset.stat];
      if (v) countUp(el, v);
    });
  }

  /* ---------- Reveal, tilt, spotlight, magnetic ---------- */
  const revealSelector = '.section-header > *, .gallery-heading, .sample-row-label, .sample-card, .service-card, .project-card, .show-more-wrapper, .whatsapp-composer, .contact-header > *, .contact-link-card, .sample-footnote';
  let io;
  function observeReveals(scope) {
    scope.querySelectorAll(revealSelector).forEach(el => {
      if (el.dataset.fx) return; el.dataset.fx = '1';
      el.classList.add('fx-reveal');
      const siblings = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('fx-reveal') || c === el) : [el];
      el.style.setProperty('--d', Math.min(siblings.indexOf(el), 8) * 90 + 'ms');
      if (io) io.observe(el); else el.classList.add('fx-in');
      if (el.matches('.project-card, .service-card')) enableSpotlight(el);
      if (el.matches('.project-card, .service-card, .sample-card')) enableTilt(el);
    });
    scope.querySelectorAll('.btn, .navbar-cta, .social-icon, .whatsapp-send, .btn-show-more').forEach(enableMagnetic);
  }
  function enableTilt(el) {
    if (!finePointer || reduced) return;
    el.classList.add('fx-tilt');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
  function enableSpotlight(el) {
    el.classList.add('fx-spot');
    const glow = make('span', 'fx-spot-glow'); glow.setAttribute('aria-hidden', 'true'); el.prepend(glow);
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }
  function enableMagnetic(el) {
    if (!finePointer || reduced || el.dataset.fxMag) return; el.dataset.fxMag = '1';
    el.classList.add('fx-magnetic');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25, y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }
  function setupReveals() {
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('fx-in'); io.unobserve(en.target); }
      }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    root.classList.add('fx-ready');
    observeReveals(doc);
    // project cards are rendered asynchronously by app.js
    const grid = doc.getElementById('projects-grid');
    if (grid) new MutationObserver(() => { observeReveals(doc); runStatsSoon(); }).observe(grid, { childList: true });
  }
  let statsTimer;
  const runStatsSoon = () => { clearTimeout(statsTimer); statsTimer = setTimeout(runStats, 250); };

  function init() {
    const steps = [trackPointer, setupBackground, setupCursor, setupScroll, setupHero, setupReveals];
    steps.forEach(fn => { try { fn(); } catch (err) { console.warn('[fx]', fn.name, err); } });
    runStatsSoon();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
