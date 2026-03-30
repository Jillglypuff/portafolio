<template><!-- headless animation controller --></template>

<script setup lang="ts">
import { onMounted } from 'vue';
import anime from 'animejs';

// ─── 1. Custom cursor + sparkle trail ────────────────────────────
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot  = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  document.body.append(dot, ring);

  const SPARKLE_COLORS = ['#F2D7E3', '#EDE8F5', '#C96B8A', '#9B72AA', '#F9EDD5'];
  let lastSparkle = 0;

  document.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    anime({ targets: dot,  left: x, top: y, duration: 60,  easing: 'linear' });
    anime({ targets: ring, left: x, top: y, duration: 260, easing: 'easeOutExpo' });

    // Throttle sparkles
    const now = Date.now();
    if (now - lastSparkle < 55) return;
    lastSparkle = now;

    const spark = Object.assign(document.createElement('div'), { className: 'cursor-sparkle' });
    spark.style.cssText = `left:${x}px;top:${y}px;background:${SPARKLE_COLORS[Math.floor(Math.random()*SPARKLE_COLORS.length)]};width:${Math.random()*5+3}px;height:${Math.random()*5+3}px`;
    document.body.appendChild(spark);
    anime({
      targets: spark,
      translateX: () => anime.random(-30, 30),
      translateY: () => anime.random(-30, 10),
      opacity: [1, 0],
      scale: [1, 0],
      duration: anime.random(500, 900),
      easing: 'easeOutExpo',
      complete: () => spark.remove(),
    });
  });

  // Ring grows on hover
  document.querySelectorAll('a, .btn, .skill-tag, .stat-card, .help-card, .skill-group, .nav-cta').forEach((el) => {
    el.addEventListener('mouseenter', () => anime({ targets: ring, scale: 1.7, opacity: 0.8, duration: 200, easing: 'easeOutQuad' }));
    el.addEventListener('mouseleave', () => anime({ targets: ring, scale: 1,   opacity: 1,   duration: 300, easing: 'easeOutElastic(1, 0.5)' }));
  });
}

// ─── 2. Scroll progress bar ───────────────────────────────────────
function initScrollProgress() {
  const bar = Object.assign(document.createElement('div'), { className: 'scroll-progress' });
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = `${Math.min(pct, 100)}%`;
  }, { passive: true });
}

// ─── 3. Nav scroll class ─────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive: true });
}

// ─── 4. Hero: typewriter eyebrow + char-by-char name ────────────
function animateHero() {
  // Typewriter for eyebrow
  const eyebrow = document.getElementById('hero-eyebrow') as HTMLElement | null;
  if (eyebrow) {
    const text = eyebrow.textContent ?? '';
    eyebrow.textContent = '';
    eyebrow.style.opacity = '1';
    let i = 0;
    const tick = setInterval(() => {
      eyebrow.textContent += text[i];
      i++;
      if (i >= text.length) clearInterval(tick);
    }, 55);
  }

  // Char-by-char hero name lines
  document.querySelectorAll<HTMLElement>('.hero-name-line').forEach((line) => {
    const text = line.textContent ?? '';
    line.innerHTML = text
      .split('')
      .map((ch) => ch === ' ' ? ' ' : `<span class="hero-char">${ch}</span>`)
      .join('');
    line.style.opacity = '1';
    line.style.transform = 'none';
  });

  const tl = anime.timeline({ easing: 'easeOutExpo', delay: 420 });
  tl.add({
    targets: '.hero-name-line:first-child .hero-char',
    opacity: [0, 1], translateY: [30, 0], rotate: [5, 0],
    duration: 500, delay: anime.stagger(40),
  })
  .add({
    targets: '.hero-name-line.accent .hero-char',
    opacity: [0, 1], translateY: [30, 0], rotate: [-5, 0],
    duration: 500, delay: anime.stagger(40),
  }, '-=300')
  .add({ targets: '#hero-tagline', opacity: [0, 1], translateY: [16, 0], duration: 600 }, '-=100')
  .add({ targets: '#hero-badges',  opacity: [0, 1], translateY: [12, 0], duration: 500 }, '-=300')
  .add({ targets: '#hero-actions', opacity: [0, 1], translateY: [12, 0], duration: 500 }, '-=300')
  .add({ targets: '#hero-visual',  opacity: [0, 1], scale: [0.88, 1], duration: 900, easing: 'easeOutElastic(1, 0.6)' }, '-=600');

  // Floating chips loop
  anime({
    targets: '.floating-chip',
    translateY: () => [anime.random(-8, 8), anime.random(-8, 8)],
    translateX: () => [anime.random(-5, 5), anime.random(-5, 5)],
    duration: () => anime.random(2800, 4500),
    delay: () => anime.random(0, 1200),
    direction: 'alternate', loop: true, easing: 'easeInOutSine',
  });

  // Avatar ring pulse
  anime({
    targets: '.avatar-ring',
    boxShadow: ['0 20px 60px rgba(180,100,140,0.16)', '0 20px 80px rgba(180,100,140,0.38)', '0 20px 60px rgba(180,100,140,0.16)'],
    duration: 3000, loop: true, easing: 'easeInOutSine',
  });

  // Blob drift
  anime({ targets: '.blob-1', translateX: [0,30,0], translateY: [0,-20,0], duration: 8000,  loop: true, easing: 'easeInOutQuad' });
  anime({ targets: '.blob-2', translateX: [0,-25,0], translateY: [0,25,0],  duration: 10000, loop: true, easing: 'easeInOutQuad' });
}

// ─── 5. Orbit dots around avatar ─────────────────────────────────
function initOrbitDots() {
  const RADIUS = [100, 118, 90];
  const SPEED  = [4000, 5500, 3200];
  const OFFSET = [0, 120, 240];

  document.querySelectorAll<HTMLElement>('.orbit-dot').forEach((dot, i) => {
    const r = RADIUS[i], duration = SPEED[i], startDeg = OFFSET[i];
    anime({
      targets: dot,
      keyframes: Array.from({ length: 361 }, (_, d) => ({
        translateX: Math.cos(((d + startDeg) * Math.PI) / 180) * r - 6,
        translateY: Math.sin(((d + startDeg) * Math.PI) / 180) * r - 6,
      })),
      duration,
      loop: true,
      easing: 'linear',
    });
  });
}

// ─── 6. Magnetic buttons ─────────────────────────────────────────
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll<HTMLElement>('.btn-primary, .btn-ghost, .btn-white, .btn-outline-white').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      anime({ targets: btn, translateX: dx, translateY: dy, duration: 200, easing: 'easeOutQuad' });
    });
    btn.addEventListener('mouseleave', () => {
      anime({ targets: btn, translateX: 0, translateY: 0, duration: 500, easing: 'easeOutElastic(1, 0.5)' });
    });
    btn.addEventListener('mousedown', () => anime({ targets: btn, scale: 0.96, duration: 100, easing: 'easeOutQuad' }));
    btn.addEventListener('mouseup',   () => anime({ targets: btn, scale: 1,    duration: 300, easing: 'easeOutElastic(1, 0.4)' }));
  });
}

// ─── 7. 3D card tilt ─────────────────────────────────────────────
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const SELECTORS = '.featured-card, .help-card, .skill-group, .stat-card';
  document.querySelectorAll<HTMLElement>(SELECTORS).forEach((card) => {
    card.style.perspective = '800px';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) *  12;
      anime({ targets: card, rotateX: rx, rotateY: ry, scale: 1.025, duration: 200, easing: 'easeOutQuad' });
    });
    card.addEventListener('mouseleave', () => {
      anime({ targets: card, rotateX: 0, rotateY: 0, scale: 1, duration: 500, easing: 'easeOutElastic(1, 0.5)' });
    });
  });
}

// ─── 8. Scroll reveals (standard + blur-title variant) ───────────
function setupReveal() {
  // Mark section titles for blur reveal
  document.querySelectorAll<HTMLElement>('.section-title').forEach((el) => {
    el.classList.add('reveal-blur');
  });

  // Stagger delay for grid children
  document.querySelectorAll('.skills-grid, .help-grid, .about-stats, .timeline').forEach((parent) => {
    parent.querySelectorAll<HTMLElement>('.reveal').forEach((child, i) => {
      child.dataset.delay = String(i * 80);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const delay = parseInt(el.dataset.delay ?? '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-blur').forEach((el) => observer.observe(el));
}

// ─── 9. Skill tags wave entrance ─────────────────────────────────
function initSkillWave() {
  const allTags = document.querySelectorAll<HTMLElement>('.skill-tag');
  allTags.forEach((t) => t.classList.add('wave-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target as HTMLElement;
      const tags = group.querySelectorAll<HTMLElement>('.skill-tag');
      anime({
        targets: Array.from(tags),
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.85, 1],
        duration: 400,
        delay: anime.stagger(60, { from: 'first' }),
        easing: 'easeOutBack',
        begin() { tags.forEach((t) => t.classList.remove('wave-hidden')); },
      });
      observer.unobserve(group);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-group').forEach((g) => observer.observe(g));

  // Hover bounce
  allTags.forEach((tag) => {
    tag.addEventListener('mouseenter', () => {
      anime({ targets: tag, scale: [1, 1.1, 1], duration: 350, easing: 'easeOutElastic(1, 0.5)' });
    });
  });
}

// ─── 10. Timeline line draw ───────────────────────────────────────
function initTimelineDraw() {
  const fill = document.getElementById('timeline-line-fill');
  if (!fill) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({ targets: fill, height: ['0%', '100%'], duration: 1400, easing: 'easeInOutQuad', delay: 200 });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  observer.observe(fill.parentElement!);

  // Timeline dot spring on reveal
  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const dot = (entry.target as HTMLElement).querySelector('.timeline-dot');
      if (dot) anime({ targets: dot, scale: [0, 1.3, 1], duration: 500, easing: 'easeOutElastic(1, 0.5)', delay: 150 });
      dotObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.timeline-item').forEach((el) => dotObserver.observe(el));
}

// ─── 11. Stat counters ────────────────────────────────────────────
function animateStats() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const hasPlus = el.dataset.plus === 'true';
      const target = parseInt(el.dataset.target ?? '0', 10);
      anime({
        targets: el,
        innerHTML: [0, target],
        round: 1,
        duration: 1200,
        easing: 'easeOutExpo',
        update(anim) {
          if (hasPlus) el.textContent = Math.round(anim.animations[0].currentValue as number) + '+';
        },
      });
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach((el) => observer.observe(el));
}

// ─── 12. Featured bullets stagger in ─────────────────────────────
function initFeaturedBullets() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: (entry.target as HTMLElement).querySelectorAll('li'),
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 450,
        delay: anime.stagger(80),
        easing: 'easeOutExpo',
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.featured-bullets').forEach((el) => observer.observe(el));
}

// ─── 13. Tech pill pop-in ─────────────────────────────────────────
function initTechPills() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: (entry.target as HTMLElement).querySelectorAll('.tech-pill'),
        scale: [0, 1.1, 1],
        opacity: [0, 1],
        duration: 400,
        delay: anime.stagger(60),
        easing: 'easeOutBack',
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.featured-stack').forEach((el) => observer.observe(el));
}

// ─── 14. Contact sparkle burst on reveal ─────────────────────────
function initContactSparkles() {
  const COLORS = ['#C96B8A', '#9B72AA', '#C9974A', '#fff', '#F2D7E3'];
  const section = document.getElementById('contact');
  if (!section) return;
  let fired = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || fired) return;
      fired = true;

      for (let i = 0; i < 28; i++) {
        const spark = document.createElement('div');
        spark.style.cssText = `
          position:fixed;left:50%;top:50%;width:${Math.random()*8+4}px;
          height:${Math.random()*8+4}px;border-radius:50%;
          background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
          pointer-events:none;z-index:200;
        `;
        document.body.appendChild(spark);
        anime({
          targets: spark,
          translateX: () => anime.random(-280, 280),
          translateY: () => anime.random(-280, 280),
          opacity: [1, 0],
          scale: [0, 1.5, 0],
          duration: anime.random(700, 1400),
          easing: 'easeOutExpo',
          complete: () => spark.remove(),
        });
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  observer.observe(section);
}

// ─── 15. Nav link hover underline ────────────────────────────────
function initNavHover() {
  document.querySelectorAll<HTMLElement>('.nav-links a:not(.nav-cta)').forEach((link) => {
    link.style.position = 'relative';
    const line = document.createElement('span');
    line.style.cssText = 'position:absolute;bottom:-2px;left:0;width:0%;height:2px;background:var(--rose);border-radius:2px;';
    link.appendChild(line);
    link.addEventListener('mouseenter', () => anime({ targets: line, width: '100%', duration: 250, easing: 'easeOutQuad' }));
    link.addEventListener('mouseleave', () => anime({ targets: line, width: '0%',   duration: 200, easing: 'easeInQuad' }));
  });
}

// ─── Init ─────────────────────────────────────────────────────────
onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Always run: functional, nav, reveals, counters
  initNav();
  setupReveal();
  animateStats();
  initNavHover();

  if (reducedMotion) {
    // Make all entrance elements visible without animation
    document.querySelectorAll<HTMLElement>(
      '.hero-char, .hero-name-line, #hero-eyebrow, #hero-tagline, #hero-badges, #hero-actions, #hero-visual'
    ).forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return; // Skip all decorative animations
  }

  // Decorative — only run when motion is OK
  initCursor();
  initScrollProgress();
  animateHero();
  initOrbitDots();
  initMagneticButtons();
  initCardTilt();
  initSkillWave();
  initTimelineDraw();
  initFeaturedBullets();
  initTechPills();
  initContactSparkles();
});
</script>
