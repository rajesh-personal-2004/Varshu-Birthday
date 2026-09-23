/* ===================================================
   BIRTHDAY WEBSITE — script.js
   Animations: Particles, Countdown, Envelope, Gallery, Confetti
   =================================================== */

'use strict';

// ─────────────────────────────────────────────
// 1. PARTICLE SYSTEM (canvas hearts, stars, petals)
// ─────────────────────────────────────────────
(function initParticles() {
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  const SYMBOLS = ['💖', '✨', '🌸', '💕', '⭐', '💗', '🌺', '💓', '✦', '·'];
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    return {
      sym,
      x:    randomBetween(0, W),
      y:    randomBetween(H * 0.2, H * 1.2),
      size: randomBetween(10, 24),
      speedY: randomBetween(0.2, 0.7),
      speedX: randomBetween(-0.3, 0.3),
      opacity: randomBetween(0.05, 0.25),
      drift: randomBetween(0.005, 0.02),
      phase: randomBetween(0, Math.PI * 2),
    };
  }

  // Spawn initial set
  for (let i = 0; i < 60; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    particles.forEach((p, i) => {
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(t * p.drift + p.phase) * 0.4;
      if (p.y < -40) {
        particles[i] = createParticle();
        particles[i].y = H + 20;
      }
      ctx.globalAlpha = p.opacity;
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.sym, p.x, p.y);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();


// ─────────────────────────────────────────────
// 2. SCROLL REVEAL (Intersection Observer)
// ─────────────────────────────────────────────
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
})();


// ─────────────────────────────────────────────
// 3. ENVELOPE / LETTER INTERACTION
// ─────────────────────────────────────────────
(function initEnvelope() {
  const envelope = document.getElementById('envelope');
  const btn      = document.getElementById('openLetterBtn');
  if (!envelope || !btn) return;

  function openLetter() {
    envelope.classList.add('is-open');
    btn.classList.add('hidden');

    // Heartbeat on the envelope
    envelope.style.boxShadow = '0 0 60px rgba(255,107,157,0.4), 0 8px 40px rgba(0,0,0,0.5)';
  }

  btn.addEventListener('click', openLetter);
  envelope.addEventListener('click', () => {
    if (!envelope.classList.contains('is-open')) openLetter();
  });
})();


// ─────────────────────────────────────────────
// 4. COUNTDOWN TIMER  (target: Oct 1, 2026)
// ─────────────────────────────────────────────
(function initCountdown() {
  const targetDate = new Date('2026-10-01T00:00:00');

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minsEl    = document.getElementById('minutes');
  const secsEl    = document.getElementById('seconds');
  const gridEl    = document.getElementById('countdownGrid');
  const arrivedEl = document.getElementById('birthdayArrived');
  const titleEl   = document.getElementById('countdownTitle');
  const subEl     = document.getElementById('countdownSubtitle');

  if (!daysEl) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function flipUpdate(el, newVal) {
    if (el.textContent !== newVal) {
      el.classList.remove('flip');
      void el.offsetWidth; // reflow
      el.classList.add('flip');
      el.textContent = newVal;
    }
  }

  function tick() {
    const now  = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      // Birthday has arrived!
      gridEl.style.display    = 'none';
      arrivedEl.style.display = 'block';
      titleEl.textContent     = '🎉 It\'s Your Birthday! 🎉';
      subEl.textContent       = 'Today is the most beautiful day — because it\'s yours! 💖';
      launchConfetti();
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const s  = totalSecs % 60;
    const m  = Math.floor(totalSecs / 60) % 60;
    const h  = Math.floor(totalSecs / 3600) % 24;
    const d  = Math.floor(totalSecs / 86400);

    flipUpdate(daysEl,  pad(d));
    flipUpdate(hoursEl, pad(h));
    flipUpdate(minsEl,  pad(m));
    flipUpdate(secsEl,  pad(s));
  }

  tick();
  setInterval(tick, 1000);
})();


// ─────────────────────────────────────────────
// 5. PHOTO LIGHTBOX
// ─────────────────────────────────────────────
(function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxCap  = document.getElementById('lightboxCaption');
  const closeBtn     = document.getElementById('lightboxClose');

  if (!lightbox) return;

  // Attach click to each photo card
  document.querySelectorAll('.photo-card').forEach(card => {
    card.addEventListener('click', () => {
      const img     = card.querySelector('.photo-img');
      const caption = card.querySelector('.photo-caption');
      const ph      = card.querySelector('.photo-placeholder');

      // Only open if image loaded (not placeholder)
      if (!ph.classList.contains('no-img') && img && img.src) {
        lightboxImg.src         = img.src;
        lightboxImg.alt         = img.alt;
        lightboxCap.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();


// ─────────────────────────────────────────────
// 6. CONFETTI (birthday mode)
// ─────────────────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.style.display = 'block';

  const ctx   = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#ff6b9d','#ffd700','#c9748a','#ffd6e0','#ff85b3','#ffe066','#ff4d8a'];
  const pieces = Array.from({ length: 120 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * -canvas.height,
    w:     6 + Math.random() * 8,
    h:     10 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speedY: 2 + Math.random() * 4,
    speedX: -1.5 + Math.random() * 3,
    rot:   Math.random() * Math.PI * 2,
    rotSpeed: 0.05 + Math.random() * 0.1,
  }));

  let frame;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.y   += p.speedY;
      p.x   += p.speedX;
      p.rot += p.rotSpeed;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    frame = requestAnimationFrame(drawConfetti);
  }
  drawConfetti();

  // Stop confetti after 8 seconds
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.style.display = 'none';
  }, 8000);
}


// ─────────────────────────────────────────────
// 7. SMOOTH NAV (optional — no nav bar, but
//    good for any future deep links)
// ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
