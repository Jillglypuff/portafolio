<template><!-- headless animation controller --></template>

<script setup lang="ts">
import { onMounted } from 'vue';
import anime from 'animejs';

// ─── Nav scroll class ─────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ─── Hero entrance ────────────────────────────────────────────────
function animateHero() {
  const tl = anime.timeline({ easing: 'easeOutExpo' });
  tl.add({ targets: '#hero-eyebrow', opacity: [0, 1], translateY: [16, 0], duration: 700 })
    .add({ targets: '.hero-name-line', opacity: [0, 1], translateY: [28, 0], duration: 800, delay: anime.stagger(120) }, '-=300')
    .add({ targets: '#hero-tagline', opacity: [0, 1], translateY: [16, 0], duration: 700 }, '-=400')
    .add({ targets: '#hero-badges', opacity: [0, 1], translateY: [12, 0], duration: 600 }, '-=300')
    .add({ targets: '#hero-actions', opacity: [0, 1], translateY: [12, 0], duration: 600 }, '-=300')
    .add({ targets: '#hero-visual', opacity: [0, 1], scale: [0.88, 1], duration: 900, easing: 'easeOutElastic(1, 0.6)' }, '-=800');

  anime({
    targets: '.floating-chip',
    translateY: () => [anime.random(-8, 8), anime.random(-8, 8)],
    translateX: () => [anime.random(-5, 5), anime.random(-5, 5)],
    duration: () => anime.random(2800, 4500),
    delay: () => anime.random(0, 1200),
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
  });

  anime({
    targets: '.avatar-ring',
    boxShadow: [
      '0 20px 60px rgba(180,100,140,0.16)',
      '0 20px 80px rgba(180,100,140,0.35)',
      '0 20px 60px rgba(180,100,140,0.16)',
    ],
    duration: 3000,
    loop: true,
    easing: 'easeInOutSine',
  });

  anime({ targets: '.blob-1', translateX: [0, 30, 0], translateY: [0, -20, 0], duration: 8000, loop: true, easing: 'easeInOutQuad' });
  anime({ targets: '.blob-2', translateX: [0, -25, 0], translateY: [0, 25, 0], duration: 10000, loop: true, easing: 'easeInOutQuad' });
}

// ─── Scroll reveals ───────────────────────────────────────────────
function setupReveal() {
  // Stagger delay for grid children
  document.querySelectorAll('.skills-grid, .help-grid, .about-stats, .timeline').forEach((parent) => {
    parent.querySelectorAll<HTMLElement>('.reveal').forEach((child, i) => {
      child.dataset.delay = String(i * 80);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        setTimeout(() => el.classList.add('visible'), parseInt(el.dataset.delay ?? '0', 10));
        observer.unobserve(el);
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

// ─── Stat counters ────────────────────────────────────────────────
function animateStats() {
  const observer = new IntersectionObserver(
    (entries) => {
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
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll('.stat-number').forEach((el) => observer.observe(el));
}

// ─── Timeline dot spring ──────────────────────────────────────────
function animateTimeline() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const dot = (entry.target as HTMLElement).querySelector('.timeline-dot');
        if (dot) anime({ targets: dot, scale: [0, 1.3, 1], duration: 500, easing: 'easeOutElastic(1, 0.5)', delay: 150 });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );
  document.querySelectorAll('.timeline-item').forEach((el) => observer.observe(el));
}

// ─── Skill tag hover bounce ───────────────────────────────────────
function setupSkillHovers() {
  document.querySelectorAll('.skill-tag').forEach((tag) => {
    tag.addEventListener('mouseenter', () => {
      anime({ targets: tag, scale: [1, 1.08, 1], duration: 320, easing: 'easeOutElastic(1, 0.5)' });
    });
  });
}

// ─── Button press ─────────────────────────────────────────────────
function setupButtons() {
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousedown', () => anime({ targets: btn, scale: 0.96, duration: 100, easing: 'easeOutQuad' }));
    btn.addEventListener('mouseup',   () => anime({ targets: btn, scale: 1,    duration: 200, easing: 'easeOutElastic(1, 0.4)' }));
    btn.addEventListener('mouseleave',() => anime({ targets: btn, scale: 1,    duration: 200, easing: 'easeOutQuad' }));
  });
}

onMounted(() => {
  initNav();
  animateHero();
  setupReveal();
  animateStats();
  animateTimeline();
  setupSkillHovers();
  setupButtons();
});
</script>
