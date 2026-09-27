/** Mickey Safari cover. All animation and state belong to this opening only. */
(function () {
  'use strict';

  const easeOut = 'cubic-bezier(.22,1,.36,1)';
  let cover, state = 'closed';
  let animationRun = 0;
  const animations = new Set();
  const savedElements = [];
  let originalOverflow, originalRootOverflow;

  const find = selector => cover.querySelector(selector);
  const mouseMark = '<span class="cover-mouse-mark" aria-hidden="true"><i></i></span>';

  function buildCover() {
    const el = document.createElement('section');
    el.id = 'cover-screen';
    el.dataset.state = 'closed';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Abertura do convite safari');
    el.tabIndex = -1;
    el.innerHTML = `
      <div class="cover-atmosphere" aria-hidden="true">
        <div class="cover-landscape"></div>
        <div class="cover-shade"></div>
        <div class="cover-sunbeam"></div>
        <div class="cover-dust"></div>
      </div>
      <div class="cover-toolbar">
        <span class="cover-edition">UM CONVITE ESPECIAL</span>
        <button class="cover-skip" type="button">Pular abertura <span aria-hidden="true">↗</span></button>
      </div>
      <div class="cover-composition">
        <header class="cover-header">
          <p class="cover-eyebrow"><span></span> MEU PRIMEIRO SAFARI <span></span></p>
          <h1>Uma grande <em>aventura.</em></h1>
          <p class="cover-intro">Uma pequena vida. Uma grande aventura.</p>
        </header>
        <div class="cover-stage">
          <div class="cover-halo" aria-hidden="true"></div>
          <div class="cover-stage-shadow" aria-hidden="true"></div>
          <div class="cover-scene">
            <div class="cover-envelope" id="coverEnvelope">
              <div class="env-back" aria-hidden="true"></div>
              <div class="env-flap" aria-hidden="true">
                <div class="env-flap-face env-flap-outside"><span class="env-flap-surface"></span><span class="env-flap-foil"></span></div>
                <div class="env-flap-face env-flap-inside"><span class="env-flap-surface"></span></div>
              </div>
              <div class="env-light" aria-hidden="true"></div>
              <div class="env-letter-lift">
                <article class="env-letter" id="envelopeLetter" aria-label="Sua carta" inert aria-hidden="true">
                  <div class="env-letter-frame">
                    <p class="letter-kicker">O MELHOR DA AVENTURA É TER VOCÊ AQUI</p>
                    <div class="letter-age" aria-label="Convite de aniversário"><span>Um dia especial</span></div>
                    <h2>Celebre<br><em>essa aventura</em></h2>
                    <div class="letter-rule" aria-hidden="true">✦</div>
                    <p class="letter-date">DATA PERSONALIZÁVEL <span>•</span> </p>
                    <p class="letter-place">Local personalizado para seu evento</p>
                    <button class="letter-cta" id="enterSiteBtn" type="button" disabled>Entrar na aventura <span aria-hidden="true">→</span></button>
                  </div>
                </article>
              </div>
              <div class="env-pocket" aria-hidden="true">
                <div class="env-fold env-fold-left"></div>
                <div class="env-fold env-fold-right"></div>
                <div class="env-fold env-fold-front"></div>
                <div class="env-address"><span>ENTREGUE COM CARINHO</span><b>para você</b></div>
              </div>
              <div class="env-ribbon env-ribbon-left" aria-hidden="true"></div>
              <div class="env-ribbon env-ribbon-right" aria-hidden="true"></div>
              <button class="env-seal" id="envelopeSeal" type="button" aria-label="Abrir o envelope" aria-expanded="false" aria-controls="envelopeLetter">
                <span class="env-seal-rim"><span class="env-seal-face">${mouseMark}<span class="env-seal-caption">ABRIR CONVITE</span></span></span>
              </button>
              <div class="env-burst" aria-hidden="true"></div>
            </div>
            <div class="cover-character cover-character-goofy" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/envelope/goofy.webp" alt="" width="641" height="1024" fetchpriority="high" draggable="false"></div></div>
            <div class="cover-character cover-character-daisy" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/envelope/daisy.webp" alt="" width="388" height="704" fetchpriority="high" draggable="false"></div></div>
            <div class="cover-character cover-character-minnie" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/raw/minnie-01.webp" alt="" width="510" height="669" fetchpriority="high" draggable="false"></div></div>
            <div class="cover-character cover-character-donald" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/raw/donald-09.webp" alt="" width="408" height="556" fetchpriority="high" draggable="false"></div></div>
            <div class="cover-character cover-character-mickey" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/mickey-safari.webp" alt="" width="413" height="470" fetchpriority="high" draggable="false"></div></div>
            <div class="cover-character cover-character-pluto" aria-hidden="true"><div class="cover-character-float"><img src="../assets/previews/safari/raw/pluto-09.webp" alt="" width="480" height="479" fetchpriority="high" draggable="false"></div></div>
          </div>
        </div>
        <footer class="cover-footer">
          <div class="cover-instruction"><span class="cover-tap" aria-hidden="true"></span><p>Toque no lacre para abrir</p><small>Tem uma aventura esperando por você.</small></div>
          <button class="cover-replay" type="button" hidden><span aria-hidden="true">↺</span> Ver a abertura de novo</button>
        </footer>
      </div>
      <div class="cover-bottom"><span>MICKEY SAFARI <i>✦</i> CONVITE DE ANIVERSÁRIO</span></div>
      <p class="cover-live" role="status" aria-live="polite"></p>
    `;
    return el;
  }

  function createParticles() {
    const dust = find('.cover-dust');
    const burst = find('.env-burst');
    // Deterministic positions keep the composition stable between visits.
    for (let i = 0; i < 24; i++) {
      const dot = document.createElement('i');
      dot.className = 'cover-speck';
      dot.style.setProperty('--x', `${(i * 37 + 11) % 100}%`);
      dot.style.setProperty('--y', `${(i * 29 + 7) % 100}%`);
      dot.style.setProperty('--delay', `${-i * .67}s`);
      dot.style.setProperty('--duration', `${6 + i % 5}s`);
      dot.style.setProperty('--size', `${i % 6 === 0 ? 5 : 2}px`);
      dust.appendChild(dot);
    }
    for (let i = 0; i < 22; i++) {
      const spark = document.createElement('i');
      spark.className = i % 4 === 0 ? 'env-spark env-spark-star' : 'env-spark';
      burst.appendChild(spark);
    }
  }

  function setState(value) {
    state = value;
    cover.dataset.state = value;
  }

  // One shared browser timeline, with explicit offsets for overlapping movements.
  // End-state CSS takes over before cancellation, so replay leaves no inline debris.
  function tween(selector, frames, duration, delay = 0, startTime = document.timeline.currentTime, easing = easeOut) {
    const el = typeof selector === 'string' ? find(selector) : selector;
    const animation = el.animate(frames, { duration, delay, easing, fill: 'both' });
    animation.startTime = startTime;
    animations.add(animation);
    return animation.finished.catch(() => {});
  }

  function cancelAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }

  function playMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio?.paused && audio.getAttribute('src')) audio.play().catch(() => {});
  }

  function finishOpening() {
    if (state === 'leaving' || state === 'disposed') return;
    setState('open');
    cancelAnimations();
    find('.env-letter').inert = false;
    find('.env-letter').removeAttribute('aria-hidden');
    find('.letter-cta').disabled = false;
    find('.cover-header').setAttribute('aria-hidden', 'true');
    find('.cover-replay').hidden = false;
    find('.cover-live').textContent = 'Envelope aberto. Seu convite está pronto.';
    find('.letter-cta').focus({ preventScroll: true });
  }

  async function openEnvelope() {
    if (state !== 'closed') return;
    const run = ++animationRun;
    setState('opening');
    find('.env-seal').disabled = true;
    cover.focus({ preventScroll: true });
    find('.env-seal').setAttribute('aria-expanded', 'true');
    find('.cover-live').textContent = 'Abrindo seu convite…';
    playMusic();
    if (!Element.prototype.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishOpening();
      return;
    }
    const start = document.timeline.currentTime;
    const sequence = [];
    const add = (selector, frames, duration, delay = 0, easing = easeOut) => sequence.push(tween(selector, frames, duration, delay, start, easing));
    add('.env-seal', [
      { transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1 },
      { transform: 'translate(-50%,-60%) rotate(-9deg) scale(1.1)', opacity: 1, offset: .32 },
      { transform: 'translate(-26%,-135%) rotate(24deg) scale(.8)', opacity: 0 }
    ], 650);
    add('.env-ribbon-left', [{ transform: 'rotate(9deg)', opacity: 1 }, { transform: 'translate(-100%,22%) rotate(22deg)', opacity: 0 }], 750, 190);
    add('.env-ribbon-right', [{ transform: 'rotate(-9deg)', opacity: 1 }, { transform: 'translate(100%,22%) rotate(-22deg)', opacity: 0 }], 750, 190);
    add('.env-flap', [
      { transform: 'rotateX(0deg)', zIndex: 6 },
      { transform: 'rotateX(-88deg)', zIndex: 6, offset: .48 },
      { transform: 'rotateX(-94deg)', zIndex: 1, offset: .52 },
      { transform: 'rotateX(-178deg)', zIndex: 1 }
    ], 1300, 380);
    add('.env-light', [{ opacity: 0, transform: 'scale(.5)' }, { opacity: .9, transform: 'scale(1.08)', offset: .45 }, { opacity: 0, transform: 'scale(1.3)' }], 1750, 600);
    add('.env-letter-lift', [{ zIndex: 3 }, { zIndex: 3, offset: .49 }, { zIndex: 7, offset: .5 }, { zIndex: 7 }], 1800, 800, 'linear');
    add('.env-letter', [
      { transform: 'translateY(8%) rotate(0deg) scale(.93)', opacity: 0 },
      { transform: 'translateY(-15%) rotate(-2deg) scale(.96)', opacity: 1, offset: .22 },
      { transform: 'translateY(-62%) rotate(1.2deg) scale(1)', opacity: 1, offset: .78 },
      { transform: 'translateY(-56%) rotate(0deg) scale(1)', opacity: 1 }
    ], 1850, 820);
    add('.env-letter-frame', [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], 750, 1850);
    add('.cover-header', [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-22px)' }], 650, 450);
    add('.cover-instruction', [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(12px)' }], 400);
    cover.querySelectorAll('.cover-character').forEach((character, i) => {
      const departure = getComputedStyle(character).getPropertyValue('--character-departure').trim();
      add(character, [{ transform: 'translate(0,0) scale(1)' }, { transform: departure }], 1600, 620 + i * 65);
    });
    find('.env-burst').querySelectorAll('i').forEach((spark, i) => {
      const angle = ((i * 137.508) % 360) * Math.PI / 180;
      const distance = 95 + (i % 7) * 19;
      add(spark, [
        { transform: 'translate(0,0) scale(0)', opacity: 0 },
        { opacity: .95, offset: .13 },
        { transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance - 70}px) rotate(${i * 41}deg) scale(1)`, opacity: 0 }
      ], 1400 + i % 4 * 130, 520 + i % 5 * 65);
    });
    await Promise.all(sequence);
    if (run === animationRun && state === 'opening') finishOpening();
  }

  function replay() {
    if (state !== 'open') return;
    ++animationRun;
    cancelAnimations();
    find('.env-letter').inert = true;
    find('.env-letter').setAttribute('aria-hidden', 'true');
    find('.letter-cta').disabled = true;
    find('.cover-replay').hidden = true;
    find('.env-seal').disabled = false;
    find('.env-seal').setAttribute('aria-expanded', 'false');
    find('.cover-live').textContent = '';
    find('.cover-header').removeAttribute('aria-hidden');
    setState('closed');
    if(!new URLSearchParams(location.search).has('thumbnail')) find('.env-seal').focus({ preventScroll: true });
  }

  function revealSite() {
    savedElements.forEach(({ el, visibility, inert }) => {
      el.style.visibility = visibility;
      el.inert = inert;
      el.removeAttribute('data-cover-hidden');
    });
    document.body.style.overflow = originalOverflow;
    document.documentElement.style.overflow = originalRootOverflow;
    document.dispatchEvent(new CustomEvent('envelope-opened'));

  }

  async function enterSite() {
    if (state === 'leaving' || state === 'disposed') return;
    ++animationRun;
    // Finish the current pose before fading, including when skipping mid-opening.
    if (state === 'opening') setState('open');
    cancelAnimations();
    setState('leaving');
    cover.inert = true;
    playMusic();
    revealSite();
    try {
      if (Element.prototype.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await tween(cover, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.045)' }], 800);
      }
    } finally {
      cancelAnimations();
      setState('disposed');
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cover.remove();
    }
  }

  function onVisibilityChange() {
    cover.dataset.paused = document.hidden ? 'true' : 'false';
    for (const animation of animations) {
      if (animation.playState !== 'finished') document.hidden ? animation.pause() : animation.play();
    }
  }

  function init() {
    if (document.getElementById('cover-screen')) return;
    cover = buildCover();
    createParticles();
    originalOverflow = document.body.style.overflow;
    originalRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.querySelectorAll('#experience').forEach(el => {
      savedElements.push({ el, visibility: el.style.visibility, inert: el.inert });
      el.style.visibility = 'hidden';
      el.inert = true;
      el.setAttribute('data-cover-hidden', '');
    });
    document.body.prepend(cover);
    find('.env-seal').addEventListener('click', openEnvelope);
    find('.cover-envelope').addEventListener('click', event => {
      if (!event.target.closest('.env-letter')) openEnvelope();
    });
    find('.letter-cta').addEventListener('click', enterSite);
    find('.cover-skip').addEventListener('click', enterSite);
    find('.cover-replay').addEventListener('click', replay);
    document.addEventListener('visibilitychange', onVisibilityChange);
    if(!new URLSearchParams(location.search).has('thumbnail')) find('.env-seal').focus({ preventScroll: true });

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
