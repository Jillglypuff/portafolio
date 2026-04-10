<template>
  <div class="floral-container" ref="container">
    <div
      v-for="(flower, index) in activeFlowers"
      :key="index"
      class="flower-item"
      :ref="(el) => { if (el) flowerRefs[index] = el; }"
      :style="flower.initialStyle"
    >
      <img :src="flower.src" alt="flower" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue';
import { gsap } from 'gsap';

// Use import.meta.glob to dynamically load all images from the flowers asset folder
const images = import.meta.glob('../assets/flowers/*.{png,jpg,jpeg,webp,svg}', { eager: true });

// Filter and map with specific scale logic
const RAW_SOURCES = Object.entries(images)
  .filter(([path]) => !path.includes('7.png') && !path.includes('14.png') && !path.includes('16.png') && !path.includes('18.png'))
  .map(([path, img]: any, index: number) => {
    const src = img.default?.src || img.src || img.default || img;
    const fileName = path.split('/').pop() || '';
    let baseDepth = 0.5 + Math.random() * 0.3; 

    if (fileName.includes('6.png')) baseDepth = 1.6;
    if (fileName.includes('13.png')) baseDepth = 1.5;
    if (fileName.includes('10.png')) baseDepth = 1.0;
    if (fileName.includes('11.png')) baseDepth = 0.6;

    // Unique multiplier for "individual" movement
    const movementVariation = 0.8 + (index % 5) * 0.15;

    return { src, fileName, baseDepth, movementVariation };
  });

interface Flower {
  src: string;
  initialStyle: any;
  baseX: number;
  baseY: number;
  depth: number;
  variation: number;
}

const container = ref<HTMLElement | null>(null);
const flowerRefs = ref<any[]>([]);
const activeFlowers = reactive<Flower[]>([]);

onMounted(() => {
  if (RAW_SOURCES.length === 0) return;

  const count = RAW_SOURCES.length;
  const placed: { x: number; y: number; r: number }[] = [];

  for (let i = 0; i < count; i++) {
    const source = RAW_SOURCES[i];
    
    let x = 0, y = 0, angle = 0;
    let attempts = 0;
    const radius = 80 * source.baseDepth; // Pixel-ish radius check

    // Find non-overlapping spot
    while (attempts < 50) {
      angle = (i / count) * Math.PI * 2 + (Math.random() * 0.5);
      if (source.fileName.includes('6.png')) angle = Math.PI * 0.25;
      if (source.fileName.includes('13.png')) angle = Math.PI * 1.25;

      const distRelX = 350 + Math.random() * 250;
      const distRelY = 200 + Math.random() * 180;
      
      const tx = 50 + (Math.cos(angle) * distRelX) / (window.innerWidth / 100);
      const ty = 50 + (Math.sin(angle) * distRelY) / (window.innerHeight / 100);

      // Simple collision check against previously placed
      const isOverlap = placed.some(p => {
        const dx = (tx - p.x) * (window.innerWidth / 100);
        const dy = (ty - p.y) * (window.innerHeight / 100);
        return Math.hypot(dx, dy) < (radius + p.r);
      });

      if (!isOverlap || attempts > 20) {
        x = tx; y = ty;
        break;
      }
      attempts++;
    }

    placed.push({ x, y, r: radius });
    
    activeFlowers.push({
      src: source.src,
      baseX: x,
      baseY: y,
      depth: source.baseDepth,
      variation: source.movementVariation,
      initialStyle: {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${source.baseDepth})`,
        opacity: 0,
        zIndex: Math.floor(source.baseDepth * 10),
      },
    });
  }

  // Animation logic
  setTimeout(() => {
    flowerRefs.value.forEach((el, i) => {
      if (!el) return;
      
      const flower = activeFlowers[i];

      // 1. Entrance
      gsap.to(el, {
        opacity: flower.depth > 1 ? 0.9 : 0.6 + Math.random() * 0.3,
        duration: 1.5,
        delay: i * 0.05,
        ease: 'power2.out'
      });

      // 2. Continuous floating loop
      gsap.to(el, {
        y: `+=${20 * flower.depth}`,
        x: `+=${10 * flower.depth}`,
        rotation: i % 2 === 0 ? '+=10' : '-=10',
        duration: 4 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // 3. Mouse Interaction (Parallax + Evasion)
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const ww = window.innerWidth;
      const wh = window.innerHeight;

      flowerRefs.value.forEach((el, i) => {
        if (!el) return;
        const flower = activeFlowers[i];
        
        // Use depth AND individual variation for "individual" feel
        const moveX = (clientX - ww / 2) * 0.08 * flower.depth * flower.variation;
        const moveY = (clientY - wh / 2) * 0.08 * flower.depth * flower.variation;

        const rect = el.getBoundingClientRect();
        const fx = rect.left + rect.width / 2;
        const fy = rect.top + rect.height / 2;
        const dist = Math.hypot(clientX - fx, clientY - fy);
        
        let evadeX = 0;
        let evadeY = 0;
        
        const evadeDist = 180 * flower.depth;
        if (dist < evadeDist) {
          const angle = Math.atan2(fy - clientY, fx - clientX);
          const force = (evadeDist - dist) / evadeDist;
          evadeX = Math.cos(angle) * 80 * force * flower.depth;
          evadeY = Math.sin(angle) * 80 * force * flower.depth;
        }

        gsap.to(el, {
          x: moveX + evadeX,
          y: moveY + evadeY,
          duration: 0.8,
          ease: 'power2.out'
        });
      });
    };


    window.addEventListener('mousemove', handleMouseMove);
    onUnmounted(() => window.removeEventListener('mousemove', handleMouseMove));
  }, 100);
});
</script>

<style scoped>
.floral-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
  width: 100%;
  height: 100%;
}
.flower-item {
  position: absolute;
  width: 150px;
  height: auto;
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}
.flower-item img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .flower-item {
    width: 80px;
  }
}
</style>
