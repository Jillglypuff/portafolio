<template>
  <div class="water-pond-root" :class="{ 'is-day': isDay, 'is-night': !isDay }">
    <!-- 1. Full-Screen 3D Water Wave Canvas (Beneath underwater content, z-index: 1) -->
    <div class="water-fixed-viewport" aria-hidden="true">
      <canvas ref="bgCanvasRef" class="water-bg-canvas"></canvas>
    </div>

    <!-- 2. Translucent Water Surface Wave Overlay (Rolls ABOVE underwater texts & cards, z-index: 15) -->
    <canvas ref="surfaceCanvasRef" class="water-surface-canvas" aria-hidden="true"></canvas>

    <!-- 3. Floating Flowers ON TOP of the Water Surface (Rides the slow 3D waves, z-index: 25) -->
    <div class="river-stream-surface" aria-hidden="true" :style="{ height: `${streamHeight}px` }">
      <div
        v-for="(fl, idx) in flowers"
        :key="idx"
        class="floating-flower"
        :style="{
          left: `${fl.x}%`,
          top: `${fl.y}px`,
          width: `${fl.size}px`,
          transform: `perspective(600px) translate3d(${fl.currentOffsetX}px, ${fl.currentOffsetY + fl.scrollDrift}px, 0) rotateX(${fl.tiltX}deg) rotateY(${fl.tiltY}deg) rotateZ(${fl.rot + fl.currentRot}deg) scale(${fl.scale * fl.waveScale})`,
          '--shadow-offset-x': `${fl.shadowX}px`,
          '--shadow-offset-y': `${fl.shadowY}px`,
          '--shadow-blur': `${fl.shadowBlur}px`
        }"
      >
        <img :src="fl.src" :alt="`flor flotante ${idx}`" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';

// ─── Flower Assets Import ──────────────────────────────────────────
const flowerModules = import.meta.glob('../assets/flowers/*.{png,jpg,jpeg,webp}', { eager: true });
const excludedFlowers = [
  '1.png', '3.png', '6.png', '7.png', '8.png', '11.png', '12.png',
  '13.png', '14.png', '16.png', '18.png', '26.png', '31.png', '32.png', '33.png'
];

const flowerImages: string[] = Object.entries(flowerModules)
  .filter(([path]) => !excludedFlowers.some(ex => path.endsWith(ex)))
  .map(([_, mod]: any) => {
    return mod.default?.src || mod.src || mod.default || mod;
  });

// ─── Theme State (Costa Rica UTC-6) ────────────────────────────────
const isDay = ref(true);

function getCostaRicaHour(): number {
  try {
    const hour24Str = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Costa_Rica',
      hour: 'numeric',
      hour12: false
    }).format(new Date());
    return parseInt(hour24Str, 10);
  } catch (e) {
    const d = new Date();
    return (d.getUTCHours() - 6 + 24) % 24;
  }
}

function syncTheme() {
  const saved = localStorage.getItem('jill_theme_mode');
  if (saved === 'day') {
    isDay.value = true;
  } else if (saved === 'night') {
    isDay.value = false;
  } else {
    const hour = getCostaRicaHour();
    isDay.value = (hour >= 6 && hour < 18);
  }
}

// ─── Floating Flowers Setup (Larger flowers along side banks, 0% text overlap) ─
interface FlowerState {
  src: string;
  x: number;
  y: number;
  size: number;
  scale: number;
  waveScale: number;
  rot: number;
  bobPhase: number;
  bobSpeed: number;
  flowFactor: number;
  currentOffsetX: number;
  currentOffsetY: number;
  currentRot: number;
  tiltX: number;
  tiltY: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  targetOffsetX: number;
  targetOffsetY: number;
  scrollDrift: number;
  targetScrollDrift: number;
}

const streamHeight = ref(5600);
const flowers = reactive<FlowerState[]>([]);

let lastContactOffset = 0;

function updateStreamHeight() {
  if (typeof document === 'undefined') return;
  const doc = document.documentElement;
  const body = document.body;
  const measured = Math.max(
    body ? body.scrollHeight : 0,
    body ? body.offsetHeight : 0,
    doc ? doc.scrollHeight : 0,
    doc ? doc.offsetHeight : 0,
    window.innerHeight * 4
  );

  const contactEl = document.getElementById('contact');
  const currentContactOffset = contactEl ? contactEl.offsetTop : 0;

  if (
    measured > 0 &&
    (Math.abs(measured - streamHeight.value) > 40 ||
      Math.abs(currentContactOffset - lastContactOffset) > 20 ||
      flowers.length === 0)
  ) {
    streamHeight.value = measured;
    lastContactOffset = currentContactOffset;
    generateRiverFlowers(measured);
  }
}

function generateRiverFlowers(totalHeight: number) {
  if (flowerImages.length === 0) return;

  const items: FlowerState[] = [];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 850;

  let imgIdx = 0;
  const nextFlowerImg = () => {
    // Step by a coprime stride so adjacent flowers never repeat the same image
    const len = flowerImages.length;
    const stride = len > 7 ? 7 : 1;
    const src = flowerImages[(imgIdx * stride) % len];
    imgIdx++;
    return src;
  };

  const pushFlower = (xPct: number, yPx: number, customSize?: number) => {
    const baseSize = customSize ?? (isMobile ? (75 + Math.random() * 40) : (140 + Math.random() * 80));
    items.push({
      src: nextFlowerImg(),
      x: xPct,
      y: yPx,
      size: baseSize,
      scale: 0.95 + Math.random() * 0.16,
      waveScale: 1,
      rot: Math.random() * 360,
      bobPhase: Math.random() * Math.PI * 2,
      bobSpeed: 0.00025 + Math.random() * 0.00035,
      flowFactor: 0.8 + Math.random() * 0.5,
      currentOffsetX: 0,
      currentOffsetY: 0,
      currentRot: 0,
      tiltX: 0,
      tiltY: 0,
      shadowX: 5,
      shadowY: 18,
      shadowBlur: 24,
      targetOffsetX: 0,
      targetOffsetY: 0,
      scrollDrift: 0,
      targetScrollDrift: 0
    });
  };

  // ── 1. HERO, ABOUT, PROJECTS & ADVISORY FLOWERS (Exact open-water zones marked in blue) ──
  const aboutEl = typeof document !== 'undefined' ? document.getElementById('about') : null;
  const aboutLabelEl = aboutEl?.querySelector('.section-label') as HTMLElement | null;
  const projectsEl = typeof document !== 'undefined' ? document.getElementById('projects') : null;
  const projectsLabelEl = projectsEl?.querySelector('.section-label') as HTMLElement | null;
  const advisoryEl = typeof document !== 'undefined' ? document.getElementById('advisory') : null;
  const advisoryLabelEl = advisoryEl?.querySelector('.section-label') as HTMLElement | null;
  const skillsEl = typeof document !== 'undefined' ? document.getElementById('skills') : null;
  const skillsLabelEl = skillsEl?.querySelector('.section-label') as HTMLElement | null;
  const blogEl = typeof document !== 'undefined' ? document.getElementById('blog') : null;
  const blogLabelEl = blogEl?.querySelector('.section-label') as HTMLElement | null;
  const contactEl = typeof document !== 'undefined' ? document.getElementById('contact') : null;
  const contactLabelEl = contactEl?.querySelector('.section-label') as HTMLElement | null;
  const scrollYNow = typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || 0) : 0;

  // Exact Y coordinate of the "SOBRE MÍ" bar
  const aboutLabelY = aboutLabelEl
    ? aboutLabelEl.getBoundingClientRect().top + scrollYNow
    : (aboutEl ? aboutEl.offsetTop + 100 : vh * 1.08);

  // Exact Y coordinate of the "PROYECTOS" bar & Projects Card
  const projectsLabelY = projectsLabelEl
    ? projectsLabelEl.getBoundingClientRect().top + scrollYNow
    : (projectsEl ? projectsEl.offsetTop + 90 : aboutLabelY + 680);
  const projectsCardEl = projectsEl?.querySelector('.carousel-stage-wrapper') as HTMLElement | null;
  const projectsCardTop = projectsCardEl
    ? projectsCardEl.getBoundingClientRect().top + scrollYNow
    : projectsLabelY + 185;

  // Exact Y coordinate of the "ASESORÍAS" bar
  const advisoryLabelY = advisoryLabelEl
    ? advisoryLabelEl.getBoundingClientRect().top + scrollYNow
    : (advisoryEl ? advisoryEl.offsetTop + 100 : projectsLabelY + 860);

  // Exact Y coordinate of the "TECNOLOGÍAS" bar
  const skillsLabelY = skillsLabelEl
    ? skillsLabelEl.getBoundingClientRect().top + scrollYNow
    : (skillsEl ? skillsEl.offsetTop + 100 : advisoryLabelY + 560);

  // Exact Y coordinate of the "BLOG" bar
  const blogLabelY = blogLabelEl
    ? blogLabelEl.getBoundingClientRect().top + scrollYNow
    : (blogEl ? blogEl.offsetTop + 100 : skillsLabelY + 520);

  // Exact Y coordinate of the "CONTACTO" bar & Contact Card
  const contactLabelY = contactLabelEl
    ? contactLabelEl.getBoundingClientRect().top + scrollYNow
    : (contactEl ? contactEl.offsetTop + 120 : blogLabelY + 920);
  const contactCardEl = contactEl?.querySelector('.contact-card') as HTMLElement | null;
  const contactCardTop = contactCardEl
    ? contactCardEl.getBoundingClientRect().top + scrollYNow
    : contactLabelY + 155;

  if (!isMobile) {
    const curatedSpots = [
      // ── A. HERO SECTION (Marked in blue) ──
      // Top arc above eyebrow (avoiding nav and eyebrow text)
      { x: 11.5, y: vh * 0.065, size: 155 },
      { x: 25.5, y: vh * 0.075, size: 150 },
      { x: 33.5, y: vh * 0.055, size: 155 },
      { x: 40.5, y: vh * 0.085, size: 145 },
      { x: 48.0, y: vh * 0.060, size: 155 },
      { x: 59.5, y: vh * 0.065, size: 150 },
      { x: 75.5, y: vh * 0.065, size: 150 },

      // Inner left & right upper ring (flanking eyebrow & title)
      { x: 14.5, y: vh * 0.24, size: 165 },
      { x: 73.0, y: vh * 0.37, size: 155 },
      { x: 83.0, y: vh * 0.22, size: 160 },

      // Outer left & right mid-banks
      { x: 2.5,  y: vh * 0.26, size: 175 },
      { x: 91.5, y: vh * 0.28, size: 170 },

      // Inner left & right lower ring (flanking tagline)
      { x: 16.5, y: vh * 0.50, size: 155 },
      { x: 78.5, y: vh * 0.54, size: 160 },

      // Bottom of Hero (below CTA buttons & lower-left gap marked in blue)
      { x: 19.5, y: vh * 0.84, size: 150 },
      { x: 48.0, y: vh * 0.83, size: 160 },

      // ── B. BETWEEN HERO & ABOUT (Marked in blue) ──
      // Flanking & just below CTA buttons ("Ver mi trabajo" / "Di Hola")
      { x: 23.5, y: aboutLabelY - 310, size: 155 },
      { x: 69.5, y: aboutLabelY - 330, size: 140 },
      { x: 82.0, y: aboutLabelY - 300, size: 150 },

      // Band directly above the "SOBRE MÍ" bar (left, center, center-right, right)
      { x: 26.5, y: aboutLabelY - 150, size: 160 },
      { x: 46.5, y: aboutLabelY - 145, size: 165 },
      { x: 62.0, y: aboutLabelY - 140, size: 150 },
      { x: 76.5, y: aboutLabelY - 180, size: 160 },

      // Below "SOBRE MÍ" bar, in the open space to the right of "Desarrolladora Full-stack." and above the stat cards
      { x: 54.5, y: aboutLabelY + 45,  size: 150 },
      { x: 75.5, y: aboutLabelY + 35,  size: 165 },

      // ── B2. INSIDE ABOUT SECTION (Marked in blue around text & stat cards) ──
      // Left side of "constante." & paragraphs
      { x: 9.5,  y: aboutLabelY + 225, size: 135 },
      { x: 5.0,  y: aboutLabelY + 375, size: 145 },
      { x: 2.5,  y: aboutLabelY + 515, size: 130 },
      { x: 10.0, y: aboutLabelY + 520, size: 95 },

      // Center gap between "En producción constante." and the stat cards
      { x: 43.5, y: aboutLabelY + 195, size: 130 },

      // Around & below the 4 stat cards on the right
      { x: 79.5, y: aboutLabelY + 285, size: 135 },
      { x: 87.5, y: aboutLabelY + 385, size: 150 },
      { x: 57.5, y: aboutLabelY + 545, size: 95 },
      { x: 69.0, y: aboutLabelY + 525, size: 110 },

      // Outer left & right banks along the Hero -> About transition
      { x: 3.5,  y: aboutLabelY - 220, size: 180 },
      { x: 3.0,  y: aboutLabelY + 95,  size: 165 },
      { x: 91.0, y: aboutLabelY - 60,  size: 175 },
      { x: 91.5, y: aboutLabelY + 205, size: 170 },

      // ── C. BETWEEN ABOUT & PROYECTOS (Marked in blue) ──
      // Open space below the right-hand stat cards in About
      { x: 67.5, y: projectsLabelY - 320, size: 170 },
      { x: 86.0, y: projectsLabelY - 360, size: 145 },

      // Band directly above the "PROYECTOS" bar (left, center-left, center-right, right)
      { x: 17.5, y: projectsLabelY - 150, size: 160 },
      { x: 38.0, y: projectsLabelY - 135, size: 155 },
      { x: 53.5, y: projectsLabelY - 175, size: 165 },
      { x: 78.5, y: projectsLabelY - 155, size: 145 },

      // Below "PROYECTOS" bar, flanking "Mi trabajo en práctica. / Construido para usuarios reales."
      { x: 19.5, y: projectsLabelY + 50,  size: 150 },
      { x: 77.5, y: projectsLabelY + 45,  size: 165 },

      // Outer left & right banks near Proyectos header (well spaced so they never stack)
      { x: 2.5,  y: projectsLabelY - 220, size: 175 },
      { x: 3.5,  y: projectsLabelY + 90,  size: 170 },
      { x: 91.0, y: projectsLabelY - 180, size: 170 },
      { x: 91.5, y: projectsLabelY + 80,  size: 170 },

      // ── C2. AROUND THE PROJECTS CAROUSEL CARD (Marked in blue) ──
      // Upper-left (above laptop mockup) & top-center border of the card
      { x: 13.5, y: projectsCardTop + 40,  size: 150 },
      { x: 51.5, y: projectsCardTop - 25,  size: 150 },

      // Lower-left below "<" arrow & bottom-left corner of the card
      { x: 4.5,  y: projectsCardTop + 365, size: 165 },
      { x: 15.0, y: projectsCardTop + 445, size: 155 },

      // Right side (between tags/button and ">" arrow) & bottom-right corner below ">" arrow
      { x: 82.5, y: projectsCardTop + 295, size: 145 },
      { x: 90.0, y: projectsCardTop + 415, size: 165 },

      // ── D. BETWEEN PROYECTOS & ASESORÍAS (Marked in blue) ──
      // Lower left & right of pagination dots on the Projects card bottom edge
      { x: 28.5, y: advisoryLabelY - 265, size: 175 },
      { x: 74.5, y: advisoryLabelY - 295, size: 170 },

      // Open water band between Projects card and "ASESORÍAS" bar
      { x: 5.0,  y: advisoryLabelY - 150, size: 155 },
      { x: 17.5, y: advisoryLabelY - 190, size: 155 },
      { x: 42.0, y: advisoryLabelY - 140, size: 160 },
      { x: 56.5, y: advisoryLabelY - 180, size: 165 },
      { x: 81.0, y: advisoryLabelY - 120, size: 165 },

      // Right side of "ASESORÍAS" bar & flanking "Disponible para asesorías"
      { x: 68.0, y: advisoryLabelY - 45,  size: 145 },
      { x: 18.0, y: advisoryLabelY + 10,  size: 155 },
      { x: 70.0, y: advisoryLabelY + 75,  size: 150 },
      { x: 83.0, y: advisoryLabelY + 105, size: 145 },

      // Around the Advisory card (upper-left corner, middle-right)
      { x: 27.5, y: advisoryLabelY + 135, size: 145 },
      { x: 9.5,  y: advisoryLabelY + 260, size: 185 },
      { x: 91.0, y: advisoryLabelY + 210, size: 175 },

      // ── E. BETWEEN ASESORÍAS & TECNOLOGÍAS (Marked in blue) ──
      // Along & beside the bottom of the Advisory card
      { x: 20.5, y: skillsLabelY - 310, size: 155 },
      { x: 33.5, y: skillsLabelY - 245, size: 160 },
      { x: 53.0, y: skillsLabelY - 260, size: 155 },
      { x: 74.5, y: skillsLabelY - 260, size: 180 },

      // Open band directly above & alongside the "TECNOLOGÍAS" bar
      { x: 21.0, y: skillsLabelY - 135, size: 150 },
      { x: 42.5, y: skillsLabelY - 60,  size: 155 },
      { x: 60.5, y: skillsLabelY - 125, size: 150 },
      { x: 73.5, y: skillsLabelY - 20,  size: 145 },

      // Flanking "Tecnologías / Powered by code" and open water to its right (above the marquee)
      { x: 1.5,  y: skillsLabelY + 45,  size: 155 },
      { x: 10.5, y: skillsLabelY + 115, size: 170 },
      { x: 47.0, y: skillsLabelY + 85,  size: 155 },
      { x: 61.0, y: skillsLabelY + 45,  size: 170 },
      { x: 82.0, y: skillsLabelY + 75,  size: 165 },

      // ── F. BETWEEN TECNOLOGÍAS & BLOG (Marked in blue) ──
      // Above "BLOG" bar (below second row of tech marquee)
      { x: 19.5, y: blogLabelY - 65,  size: 150 },
      { x: 33.5, y: blogLabelY - 70,  size: 150 },

      // Open water to the right of "Diario de Desarrollo / Notas de mi viaje"
      { x: 47.5, y: blogLabelY + 15,  size: 170 },
      { x: 68.0, y: blogLabelY + 55,  size: 160 },
      { x: 80.0, y: blogLabelY + 20,  size: 165 },

      // Along the top corners & left edge of the 3 Blog cards (smaller so they never cover card text)
      { x: 0.4,  y: blogLabelY + 235, size: 82 },
      { x: 0.4,  y: blogLabelY + 390, size: 80 },
      { x: 48.5, y: blogLabelY + 175, size: 88 },
      { x: 76.5, y: blogLabelY + 195, size: 92 },

      // Outer banks around Blog header & cards
      { x: 0.5,  y: blogLabelY + 90,  size: 95 },
      { x: 91.5, y: blogLabelY - 50,  size: 165 },
      { x: 92.0, y: blogLabelY + 185, size: 145 },
      { x: 92.0, y: blogLabelY + 460, size: 150 },

      // ── G. BETWEEN BLOG & CONTACTO (Marked in blue) ──
      // Open space below the shorter middle Blog card ("PRÓXIMOS ARTÍCULOS")
      { x: 41.5, y: contactLabelY - 380, size: 145 },

      // Open water band below the left & right Blog cards and above "CONTACTO"
      { x: 18.5, y: contactLabelY - 185, size: 145 },
      { x: 45.5, y: contactLabelY - 165, size: 155 },
      { x: 62.5, y: contactLabelY - 235, size: 140 },
      { x: 77.0, y: contactLabelY - 185, size: 150 },

      // Around the "CONTACTO" bar & flanking "Construyamos algo / que valga la pena."
      { x: 17.5, y: contactLabelY + 10,  size: 145 },
      { x: 26.5, y: contactLabelY - 45,  size: 155 },
      { x: 67.5, y: contactLabelY - 35,  size: 165 },
      { x: 26.0, y: contactLabelY + 105, size: 145 },
      { x: 78.0, y: contactLabelY + 75,  size: 160 },

      // ── H. AROUND CONTACT CARD & FOOTER (Marked in blue) ──
      // Upper-left & top-left corner of Contact card
      { x: 11.5, y: contactCardTop + 15,  size: 145 },
      { x: 24.5, y: contactCardTop + 10,  size: 160 },

      // Middle-left & outer-left of Contact card
      { x: 30.5, y: contactCardTop + 135, size: 135 },
      { x: 4.5,  y: contactCardTop + 230, size: 165 },

      // Bottom-left corner of Contact card & lower-left beside Footer
      { x: 27.5, y: contactCardTop + 305, size: 155 },
      { x: 17.0, y: contactCardTop + 440, size: 165 },

      // Center below Contact card (above Footer text)
      { x: 51.5, y: contactCardTop + 365, size: 155 },

      // Right side of Contact card & bottom-right beside Footer
      { x: 68.0, y: contactCardTop + 65,  size: 175 },
      { x: 72.5, y: contactCardTop + 280, size: 170 },
      { x: 69.0, y: contactCardTop + 435, size: 155 },
      { x: 84.5, y: contactCardTop + 430, size: 160 },

      // Outer right bank along Contact card
      { x: 90.5, y: contactCardTop + 170, size: 175 }
    ];

    curatedSpots.forEach((spot) => {
      const jitterX = (Math.random() - 0.5) * 1.0;
      const jitterY = (Math.random() - 0.5) * 12;
      pushFlower(
        spot.x + jitterX,
        Math.min(totalHeight - 195, Math.max(48, spot.y + jitterY)),
        spot.size + (Math.random() - 0.5) * 14
      );
    });
  } else {
    const mobileSpots = [
      { x: 4,  y: vh * 0.09, size: 85 },
      { x: 78, y: vh * 0.10, size: 85 },
      { x: 2,  y: vh * 0.42, size: 90 },
      { x: 82, y: vh * 0.45, size: 90 },
      { x: 12, y: aboutLabelY - 130, size: 90 },
      { x: 68, y: aboutLabelY - 120, size: 95 },
      { x: 10, y: projectsLabelY - 120, size: 90 },
      { x: 70, y: projectsLabelY - 110, size: 90 },
      { x: 12, y: advisoryLabelY - 120, size: 90 },
      { x: 68, y: advisoryLabelY - 110, size: 90 },
      { x: 12, y: skillsLabelY - 110, size: 90 },
      { x: 68, y: skillsLabelY + 40,  size: 90 },
      { x: 14, y: blogLabelY - 60,    size: 90 },
      { x: 68, y: blogLabelY + 30,    size: 90 },
      { x: 12, y: contactLabelY - 110, size: 90 },
      { x: 68, y: contactLabelY - 90,  size: 90 }
    ];
    mobileSpots.forEach((spot) => {
      pushFlower(spot.x, spot.y, spot.size);
    });
  }

  // ── 2. EXTRA FLOWERS (Only if page is taller than Contact section, e.g. long blog pages) ──
  const restStart = contactLabelY + 520;
  const restHeight = totalHeight - restStart - 180;
  const restCount = restHeight > 200 ? Math.min(26, Math.round(restHeight / 160)) : 0;

  for (let i = 0; i < restCount; i++) {
    const progress = i / restCount;
    const y = restStart + progress * restHeight + (Math.random() - 0.5) * 50;
    const isLeftBank = (i % 2 === 0);
    const tier = i % 3;

    let x = 0;
    if (isMobile) {
      x = isLeftBank ? (0.5 + Math.random() * 4.5) : (84.0 + Math.random() * 6.0);
    } else {
      // Staggered horizontal depth so flowers don't form a straight vertical line
      if (isLeftBank) {
        x = tier === 0 ? (1.0 + Math.random() * 3.5) : tier === 1 ? (5.5 + Math.random() * 4.5) : (2.5 + Math.random() * 5.0);
      } else {
        x = tier === 0 ? (89.5 + Math.random() * 4.0) : tier === 1 ? (84.0 + Math.random() * 4.5) : (87.0 + Math.random() * 4.5);
      }
    }

    pushFlower(x, y);
  }

  flowers.splice(0, flowers.length, ...items);
}

// ═══════════════════════════════════════════════════════════════════
// 3D GERSTNER MULTI-WAVE SIMULATION ENGINE (WebGL + CPU Sync)
// Pure white background + Multiple slow organic waves + Subtle smooth cursor swell
// ═══════════════════════════════════════════════════════════════════
const bgCanvasRef = ref<HTMLCanvasElement | null>(null);
const surfaceCanvasRef = ref<HTMLCanvasElement | null>(null);

let animationId = 0;
let lastFrameTime = 0;
let simTime = 0;

// Multi-wave density as before, but slow and smooth (NO Manhattan abs() cross artifacts!)
const MESH_WIDTH = 10.0;
const MESH_HEIGHT = 10.0;
const WAVE1_AMP = 0.72;
const WAVE1_LEN = 7.5;
const WAVE2_AMP = 0.26;
const WAVE2_LEN = 2.2;
const WAVE3_AMP = 0.12;
const WAVE3_LEN = 3.5;

let interactionX = 0;
let interactionZ = 0;
let smoothR = 0;
let smoothC = 0;
let wavePower = 0.22;
let targetWavePower = 0.22;
const AMBIENT_WAVE_POWER = 0.22;
const MAX_WAVE_POWER = 0.52;

// Global wave speed boost + silky-smooth cursor wake (tou.tokyo wave acceleration + subtle organic water wake)
let cursorSpeedBoost = 0;
let targetSpeedBoost = 0;
let cursorWorldX = 0;
let cursorWorldZ = 0;
let smoothCursorX = 0;
let smoothCursorZ = 0;
let cursorWake = 0;
let targetCursorWake = 0;

// Single Gerstner wave component
function evalGerstnerWave(
  ox: number,
  oz: number,
  amplitude: number,
  waveLength: number,
  dirX: number,
  dirY: number,
  t: number
) {
  const c = (2.0 * Math.PI) / waveLength;
  const l = Math.sqrt(9.8 / c);
  const v = c * (dirX * ox + dirY * oz - l * t);
  const cosV = Math.cos(v);
  const sinV = Math.sin(v);
  return {
    x: dirX * (amplitude * cosV),
    y: amplitude * sinV,
    z: dirY * (amplitude * cosV),
    dydx: amplitude * cosV * c * dirX,
    dydz: amplitude * cosV * c * dirY
  };
}

// Evaluate total 3D wave displacement + slope at plane coordinates (m, h)
function sampleTouWaveAt(m: number, h: number, t: number) {
  const dcx = m - smoothCursorX;
  const dcz = h - smoothCursorZ;
  const distSq = dcx * dcx + dcz * dcz;
  const wakeEnv = Math.exp(-distSq * 0.22) * cursorWake;
  const yEnv = wavePower + wakeEnv * 0.20;

  const w1 = evalGerstnerWave(m, h, WAVE1_AMP, WAVE1_LEN, 1.0 + 0.35 * smoothR, -1.0, t);
  const w2 = evalGerstnerWave(m, h, WAVE2_AMP, WAVE2_LEN, 0.25 + 0.35 * smoothR, -1.0, t);
  const w3 = evalGerstnerWave(m, h, WAVE3_AMP, WAVE3_LEN, -0.45 + 0.28 * smoothC, -0.85, t * 0.85);

  const smoothDist = Math.sqrt(distSq + 0.6);
  const wakeWave = Math.sin(smoothDist * 1.5 - t * 4.0) * 0.14 * wakeEnv;

  const dx = (w1.x + w2.x + w3.x) * yEnv;
  const dy = (w1.y + w2.y + w3.y) * yEnv + wakeWave;
  const dz = (w1.z + w2.z + w3.z) * yEnv;
  const slopeX = (w1.dydx + w2.dydx + w3.dydx) * yEnv;
  const slopeZ = (w1.dydz + w2.dydz + w3.dydz) * yEnv;

  return { dx, dy, dz, slopeX, slopeZ };
}

// ─── WebGL Shader Program ───────────────────────────────────────────
const VERTEX_SHADER_SRC = `
  attribute vec2 aPosition;
  varying vec2 vUV;
  void main() {
    vUV = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Fragment shader: tou.tokyo wave acceleration/steering + subtle C-infinity smooth water wake
const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 vUV;

  uniform float uTime;
  uniform float uWavePower;
  uniform vec2 uInteraction; // (smoothR, smoothC)
  uniform vec2 uCursorPos;   // smoothed cursor position in world plane (mh)
  uniform float uCursorWake; // 0..1 subtle wake intensity when cursor moves
  uniform vec2 uResolution;
  uniform float uIsDay;
  uniform float uIsSurfacePass;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  vec3 getWave(vec2 pos, float amplitude, float waveLength, vec2 dir, float time) {
    float c = 6.28318530718 / waveLength;
    float l = sqrt(9.8 / c);
    float v = c * (dot(dir, pos) - l * time);
    return vec3(
      dir.x * (amplitude * cos(v)),
      amplitude * sin(v),
      dir.y * (amplitude * cos(v))
    );
  }

  vec3 evalSurfacePoint(vec2 mh) {
    float r = uInteraction.x;
    float c = uInteraction.y;

    // Wide, ultra-soft wake envelope around the cursor (sqrt(distSq + 0.6) has zero center cusp/circle)
    vec2 dCursor = mh - uCursorPos;
    float distSq = dot(dCursor, dCursor);
    float wakeEnv = exp(-distSq * 0.20) * uCursorWake;
    float y = uWavePower + wakeEnv * 0.22;

    // Multiple organic wave bands that accelerate and gently steer with cursor movement (like tou.tokyo)
    vec3 k1 = getWave(mh, 0.72, 7.5, vec2(1.0 + 0.35 * r, -1.0), uTime);
    vec3 k2 = getWave(mh, 0.26, 2.2, vec2(0.25 + 0.35 * r, -1.0), uTime);
    vec3 k3 = getWave(mh, 0.12, 3.5, vec2(-0.45 + 0.28 * c, -0.85), uTime * 0.85);

    vec3 disp = (k1 + k2 + k3) * y;

    // Subtle, silky water undulation where the cursor glides
    float smoothDist = sqrt(distSq + 0.6);
    float wakeWave = sin(smoothDist * 1.5 - uTime * 4.0) * 0.14 * wakeEnv;
    disp.y += wakeWave;

    return vec3(mh.x + disp.x, disp.y, mh.y + disp.z);
  }

  void main() {
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec2 centered = vUV - 0.5;
    vec2 mh = vec2(centered.x * 10.0 * max(1.0, aspect * 0.75), (0.5 - vUV.y) * 10.0);

    float eps = 0.08;
    vec3 pCenter = evalSurfacePoint(mh);
    vec3 pRight  = evalSurfacePoint(mh + vec2(eps, 0.0));
    vec3 pUp     = evalSurfacePoint(mh + vec2(0.0, eps));

    vec3 dX = pRight - pCenter;
    vec3 dZ = pUp - pCenter;
    vec3 vNormalW = normalize(cross(dZ, dX));

    vec3 vLightPosition1 = vec3(6.0, 28.0, 12.0);
    vec3 lightVectorW1 = normalize(vLightPosition1 - pCenter);
    float ndl1 = max(0.0, dot(vNormalW, lightVectorW1));

    vec3 cameraPos = vec3(0.0, 42.0, 10.0);
    vec3 viewDir = normalize(cameraPos - pCenter);
    vec3 halfVec = normalize(viewDir + lightVectorW1);
    float spec = pow(max(0.0, dot(vNormalW, halfVec)), 42.0);

    float slope = clamp((vNormalW.x * 0.65 + vNormalW.z * 0.75) * 2.1, -1.0, 1.0);
    float crest = smoothstep(-0.35, 0.55, slope);
    float trough = smoothstep(0.2, -0.55, slope);

    float grain = (random(vUV) - 0.5) * 0.008;

    if (uIsSurfacePass > 0.5) {
      // ── PASS 2: Translucent Water Surface Wave Overlay (Very subtle & bright over underwater content) ──
      if (uIsDay > 0.5) {
        vec3 crestColor = vec3(1.0, 1.0, 1.0);
        vec3 troughColor = vec3(0.945, 0.950, 0.958);
        vec3 surfColor = mix(troughColor, crestColor, crest);
        float alpha = clamp(abs(slope) * 0.08 + spec * 0.12 + trough * 0.04, 0.01, 0.09);
        gl_FragColor = vec4(surfColor + grain * 0.2, alpha);
      } else {
        vec3 crestColor = vec3(0.15, 0.13, 0.21);
        vec3 troughColor = vec3(0.03, 0.025, 0.045);
        vec3 surfColor = mix(troughColor, crestColor, crest * 0.65);
        float alpha = clamp(abs(slope) * 0.06 + trough * 0.04, 0.01, 0.07);
        gl_FragColor = vec4(surfColor + grain * 0.15, alpha);
      }
    } else {
      // ── PASS 1: Main Full-Screen 3D Water Wave Background (Luminous white & delicate soft shadows) ──
      if (uIsDay > 0.5) {
        vec3 pureWhite = vec3(1.0, 1.0, 1.0);
        vec3 softWaveShadow = vec3(0.958, 0.962, 0.968);
        float lightFactor = clamp(0.962 + 0.045 * ndl1 + slope * 0.055, 0.0, 1.0);
        vec3 colorFinal = mix(softWaveShadow, pureWhite, crest * 0.75 + 0.25) * lightFactor;
        colorFinal = mix(colorFinal, pureWhite, smoothstep(0.10, 0.60, slope) * 0.72 + spec * 0.35);
        colorFinal += grain;
        gl_FragColor = vec4(clamp(colorFinal, 0.0, 1.0), 1.0);
      } else {
        vec3 deepNight = vec3(0.032, 0.026, 0.046);
        vec3 crestNight = vec3(0.072, 0.060, 0.102);
        float lightFactor = clamp(0.90 + 0.12 * ndl1 + slope * 0.10, 0.0, 1.0);
        vec3 colorFinal = mix(deepNight, crestNight, crest * 0.70) * lightFactor + spec * vec3(0.04, 0.035, 0.06) + grain * 0.25;
        gl_FragColor = vec4(clamp(colorFinal, 0.0, 1.0), 1.0);
      }
    }
  }
`;

interface GLContextState {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  isSurfacePass: boolean;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

let bgGL: GLContextState | null = null;
let surfaceGL: GLContextState | null = null;

function createGLPipeline(canvas: HTMLCanvasElement, isSurfacePass: boolean): GLContextState | null {
  const gl = (canvas.getContext('webgl', { alpha: isSurfacePass, antialias: true, premultipliedAlpha: false }) ||
              canvas.getContext('experimental-webgl', { alpha: isSurfacePass })) as WebGLRenderingContext | null;
  if (!gl) return null;

  const compileShader = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('WaterPond shader compile warning:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }

  gl.useProgram(program);

  const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uniformNames = [
    'uTime', 'uWavePower', 'uInteraction',
    'uCursorPos', 'uCursorWake',
    'uResolution', 'uIsDay', 'uIsSurfacePass'
  ];
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  uniformNames.forEach(name => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  return { gl, program, isSurfacePass, uniforms };
}

function drawGLPass(state: GLContextState, width: number, height: number) {
  const { gl, program, isSurfacePass, uniforms } = state;
  gl.viewport(0, 0, width, height);
  gl.useProgram(program);

  gl.uniform1f(uniforms.uTime, simTime);
  gl.uniform1f(uniforms.uWavePower, wavePower);
  gl.uniform2f(uniforms.uInteraction, smoothR, smoothC);
  gl.uniform2f(uniforms.uCursorPos, smoothCursorX, smoothCursorZ);
  gl.uniform1f(uniforms.uCursorWake, cursorWake);
  gl.uniform2f(uniforms.uResolution, width, height);
  gl.uniform1f(uniforms.uIsDay, isDay.value ? 1.0 : 0.0);
  gl.uniform1f(uniforms.uIsSurfacePass, isSurfacePass ? 1.0 : 0.0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// ─── Cursor & Scroll Interaction (tou.tokyo wave boost + subtle water wake) ─
let lastPointerX = 0;
let lastPointerY = 0;
let lastScrollY = 0;

function updateCursorWorldPos(clientX: number, clientY: number) {
  const ww = Math.max(1, window.innerWidth);
  const wh = Math.max(1, window.innerHeight);
  const aspect = ww / wh;
  cursorWorldX = ((clientX / ww) - 0.5) * 10.0 * Math.max(1.0, aspect * 0.75);
  cursorWorldZ = (0.5 - (clientY / wh)) * 10.0;
}

function handlePointerMove(e: MouseEvent | TouchEvent) {
  let clientX = 0;
  let clientY = 0;

  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }

  interactionX = clientX;
  interactionZ = clientY;
  updateCursorWorldPos(clientX, clientY);

  const dx = clientX - lastPointerX;
  const dy = clientY - lastPointerY;
  const dist = Math.hypot(dx, dy);
  lastPointerX = clientX;
  lastPointerY = clientY;

  if (dist > 1) {
    // 1. Accelerate global wave flow & wave power like tou.tokyo
    targetSpeedBoost = Math.min(0.55, targetSpeedBoost + dist * 0.0035);
    targetWavePower = Math.min(MAX_WAVE_POWER, targetWavePower + dist * 0.0018);
    // 2. Subtle, silky water wake where the cursor moves
    targetCursorWake = Math.min(1.0, targetCursorWake + dist * 0.012);
    // 3. Very gentle water breeze on nearby floating flowers
    if (dist > 4) {
      deflectNearbyFlowers(clientX, clientY, Math.min(0.45, dist * 0.012));
    }
  }
}

function handlePointerDown(e: MouseEvent | TouchEvent) {
  let clientX = 0;
  let clientY = 0;
  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }

  interactionX = clientX;
  interactionZ = clientY;
  updateCursorWorldPos(clientX, clientY);
  targetSpeedBoost = Math.min(0.55, targetSpeedBoost + 0.22);
  targetWavePower = Math.min(MAX_WAVE_POWER, targetWavePower + 0.12);
  targetCursorWake = 1.0;
  deflectNearbyFlowers(clientX, clientY, 0.55);
}

function deflectNearbyFlowers(x: number, y: number, intensity: number) {
  const ww = window.innerWidth;
  const currentScrollY = window.scrollY || window.pageYOffset || 0;

  flowers.forEach((fl) => {
    const flowerScreenY = fl.y + fl.currentOffsetY + fl.scrollDrift - currentScrollY;
    if (flowerScreenY < -180 || flowerScreenY > window.innerHeight + 180) return;

    const flowerScreenX = (fl.x / 100) * ww;
    const dx = flowerScreenX - x;
    const dy = flowerScreenY - y;
    const dist = Math.hypot(dx, dy);

    if (dist < 200 && dist > 1) {
      const force = ((200 - dist) / 200) * intensity;
      const angle = Math.atan2(dy, dx);
      fl.targetOffsetX += Math.cos(angle) * (force * 3.5);
      fl.targetOffsetY += Math.sin(angle) * (force * 3.5);
      fl.currentRot += (Math.random() - 0.5) * 1.8 * force;
    }
  });
}

function handleScroll() {
  const currentScrollY = window.scrollY || window.pageYOffset || 0;
  const deltaY = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  if (Math.abs(deltaY) < 0.5) return;

  targetSpeedBoost = Math.min(0.45, targetSpeedBoost + Math.abs(deltaY) * 0.002);
  targetWavePower = Math.min(MAX_WAVE_POWER, targetWavePower + Math.min(0.04, Math.abs(deltaY) * 0.001));

  flowers.forEach((fl) => {
    fl.targetScrollDrift -= deltaY * 0.12 * fl.flowFactor;
    fl.targetOffsetX += Math.sin(fl.bobPhase) * deltaY * 0.02;

    if (fl.targetScrollDrift > 45) fl.targetScrollDrift = 45;
    if (fl.targetScrollDrift < -45) fl.targetScrollDrift = -45;
  });
}

// ─── Main Animation Loop (Multiple waves + subtle cursor wake) ──────
function renderWaterLoop(now: number) {
  const dt = lastFrameTime ? Math.min(0.05, (now - lastFrameTime) * 0.001) : 0.016;
  lastFrameTime = now;

  // Smoothly interpolate global wave speed boost from cursor movement and decay back to calm rest
  cursorSpeedBoost += (targetSpeedBoost - cursorSpeedBoost) * 0.08;
  targetSpeedBoost *= 0.94;
  if (cursorSpeedBoost < 0.0005) cursorSpeedBoost = 0;

  // Base calm wave speed (0.14) + cursor acceleration
  simTime += dt * (0.14 + cursorSpeedBoost);

  const ww = Math.max(1, window.innerWidth);
  const wh = Math.max(1, window.innerHeight);

  const targetR = -((interactionX - ww * 0.5) / (ww * 0.5));
  const targetC = -((interactionZ - wh * 0.5) / (wh * 0.5));
  smoothR += (targetR - smoothR) * 0.04;
  smoothC += (targetC - smoothC) * 0.04;

  // Smoothly track cursor in world plane & decay subtle wake when cursor stops
  smoothCursorX += (cursorWorldX - smoothCursorX) * 0.08;
  smoothCursorZ += (cursorWorldZ - smoothCursorZ) * 0.08;
  cursorWake += (targetCursorWake - cursorWake) * 0.07;
  targetCursorWake *= 0.93;

  // Smoothly interpolate wave power and settle back to ambient calm
  wavePower += (targetWavePower - wavePower) * 0.06;
  targetWavePower = Math.max(AMBIENT_WAVE_POWER, targetWavePower * 0.985);

  // 1. Render Pass 1 (Deep Water 3D Wave Canvas behind content)
  if (bgGL && bgCanvasRef.value) {
    drawGLPass(bgGL, bgCanvasRef.value.width, bgCanvasRef.value.height);
  }

  // 2. Render Pass 2 (Translucent Water Surface Overlay above underwater text & cards)
  if (surfaceGL && surfaceCanvasRef.value) {
    drawGLPass(surfaceGL, surfaceCanvasRef.value.width, surfaceCanvasRef.value.height);
  }

  // 3. Couple Floating Flowers to the slow 3D Gerstner Wave surface
  const currentScrollY = window.scrollY || window.pageYOffset || 0;
  flowers.forEach((fl) => {
    fl.bobPhase += fl.bobSpeed;
    const screenY = fl.y - currentScrollY;

    let waveDX = 0;
    let waveDY = 0;
    let waveTiltX = 0;
    let waveTiltY = 0;
    let waveLift = 0;

    if (screenY > -300 && screenY < wh + 300) {
      const m = ((fl.x / 100) - 0.5) * MESH_WIDTH;
      const h = (0.5 - (screenY / wh)) * MESH_HEIGHT;
      const wSample = sampleTouWaveAt(m, h, simTime);

      waveDX = wSample.dx * 16;
      waveDY = wSample.dz * 14 - wSample.dy * 12;
      waveLift = wSample.dy;
      waveTiltX = Math.max(-14, Math.min(14, wSample.slopeZ * 20));
      waveTiltY = Math.max(-14, Math.min(14, -wSample.slopeX * 20));
    }

    const naturalBobY = Math.sin(fl.bobPhase) * 3.5 + waveDY;
    const naturalBobX = Math.cos(fl.bobPhase * 0.75) * 2.5 + waveDX;
    const naturalTilt = Math.sin(fl.bobPhase * 0.5) * 2.5 + waveTiltY * 0.3;

    fl.currentOffsetX += (fl.targetOffsetX + naturalBobX - fl.currentOffsetX) * 0.04;
    fl.currentOffsetY += (fl.targetOffsetY + naturalBobY - fl.currentOffsetY) * 0.04;
    fl.currentRot += (naturalTilt - fl.currentRot) * 0.035;
    fl.tiltX += (waveTiltX - fl.tiltX) * 0.05;
    fl.tiltY += (waveTiltY - fl.tiltY) * 0.05;

    const targetWaveScale = 1 + Math.max(-0.03, Math.min(0.05, waveLift * 0.06));
    fl.waveScale += (targetWaveScale - fl.waveScale) * 0.05;
    fl.shadowX = 5 + fl.tiltY * 0.4;
    fl.shadowY = 16 + Math.max(0, waveLift * 12);
    fl.shadowBlur = 22 + Math.max(0, waveLift * 10);

    fl.scrollDrift += (fl.targetScrollDrift - fl.scrollDrift) * 0.045;
    fl.targetScrollDrift *= 0.95;
    fl.targetOffsetX *= 0.95;
    fl.targetOffsetY *= 0.95;
  });

  animationId = requestAnimationFrame(renderWaterLoop);
}

// ─── Window & Resize Listeners ──────────────────────────────────────
function handleResize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);

  if (bgCanvasRef.value) {
    bgCanvasRef.value.width = w;
    bgCanvasRef.value.height = h;
  }
  if (surfaceCanvasRef.value) {
    surfaceCanvasRef.value.width = w;
    surfaceCanvasRef.value.height = h;
  }
  updateStreamHeight();
}

let crInterval = 0;
let resizeObserver: ResizeObserver | null = null;

function onThemeChanged(e: any) {
  if (e.detail && typeof e.detail.isDay === 'boolean') {
    isDay.value = e.detail.isDay;
  } else {
    syncTheme();
  }
}

onMounted(() => {
  syncTheme();
  interactionX = window.innerWidth * 0.5;
  interactionZ = window.innerHeight * 0.5;

  updateStreamHeight();
  handleResize();

  if (bgCanvasRef.value) {
    bgGL = createGLPipeline(bgCanvasRef.value, false);
  }
  if (surfaceCanvasRef.value) {
    surfaceGL = createGLPipeline(surfaceCanvasRef.value, true);
  }

  lastScrollY = window.scrollY || window.pageYOffset || 0;

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('mousemove', handlePointerMove, { passive: true });
  window.addEventListener('touchmove', handlePointerMove, { passive: true });
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('jill-theme-changed', onThemeChanged);

  if (typeof ResizeObserver !== 'undefined' && document.body) {
    resizeObserver = new ResizeObserver(() => {
      updateStreamHeight();
    });
    resizeObserver.observe(document.body);
  }

  setTimeout(() => updateStreamHeight(), 350);
  setTimeout(() => updateStreamHeight(), 1200);

  animationId = requestAnimationFrame(renderWaterLoop);

  crInterval = window.setInterval(() => {
    syncTheme();
  }, 60000);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('mousemove', handlePointerMove);
  window.removeEventListener('touchmove', handlePointerMove);
  window.removeEventListener('pointerdown', handlePointerDown);
  window.removeEventListener('jill-theme-changed', onThemeChanged);
  if (resizeObserver) resizeObserver.disconnect();
  cancelAnimationFrame(animationId);
  clearInterval(crInterval);
});
</script>

<style scoped>
.water-pond-root {
  pointer-events: none;
}

/* ── 1. Full-Screen 3D Wave Canvas (Behind Underwater Content, z-index: 1) ── */
.water-fixed-viewport {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  background: #ffffff;
}

.is-night .water-fixed-viewport {
  background: #0a080d;
}

.water-bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* ── 2. Translucent Water Surface Wave Overlay (Rolls ABOVE underwater text & cards, z-index: 15) ── */
.water-surface-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 15;
  mix-blend-mode: soft-light;
  opacity: 0.40;
}

.is-day .water-surface-canvas {
  mix-blend-mode: multiply;
  opacity: 0.35;
}

/* ── 3. Floating Flowers Surface Layer (Floats ON TOP of the water surface, z-index: 25) ── */
.river-stream-surface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 25;
  overflow: hidden;
}

/* Clean larger flowers floating directly on the water (no circles or bubbles) */
.floating-flower {
  position: absolute;
  pointer-events: none;
  user-select: none;
  will-change: transform;
  transform-style: preserve-3d;
  opacity: 1 !important;
  filter: drop-shadow(
    var(--shadow-offset-x, 5px)
    var(--shadow-offset-y, 16px)
    var(--shadow-blur, 22px)
    rgba(0, 0, 0, 0.22)
  );
}

.is-day .floating-flower {
  filter: drop-shadow(
    var(--shadow-offset-x, 5px)
    var(--shadow-offset-y, 14px)
    var(--shadow-blur, 18px)
    rgba(15, 23, 42, 0.15)
  );
}

.floating-flower img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  opacity: 1 !important;
}
</style>
