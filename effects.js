(() => {
 if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if(!ctx)return;
    let particles = [], raf=0;
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
      raf=requestAnimationFrame(loop);
    }

    resize();
    createParticles();
    loop();

    document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!document.hidden)loop();});
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }


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



 initParticles();initTypewriter();
})();
