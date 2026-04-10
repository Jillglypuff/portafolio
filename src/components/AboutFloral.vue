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

// Use import.meta.glob to dynamically load specific flowers 8, 10, and 14
const images = import.meta.glob('../assets/flowers/*.{png,jpg,jpeg,webp,svg}', { eager: true });

const TARGETS = ['8.png', '10.png', '14.png'];

const RAW_SOURCES = Object.entries(images)
  .filter(([path]) => 
    TARGETS.some(t => path.includes(t)) && 
    !path.includes('18.png') && 
    !path.includes('16.png') &&
    !path.includes('7.png')
  )
  .map(([path, img]: any) => {
    const src = img.default?.src || img.src || img.default || img;
    const fileName = path.split('/').pop() || '';
    
    let baseDepth = 0.8 + Math.random() * 0.4;
    // Specific depth adjustments for premium feel
    if (fileName.includes('10.png')) baseDepth = 1.3;
    if (fileName.includes('8.png')) baseDepth = 1.1;
    if (fileName.includes('14.png')) baseDepth = 0.7;

    return { src, fileName, baseDepth };
  });

interface Flower {
  src: string;
  initialStyle: any;
  baseX: number;
  baseY: number;
  depth: number;
}

const container = ref<HTMLElement | null>(null);
const flowerRefs = ref<any[]>([]);
const activeFlowers = reactive<Flower[]>([]);

onMounted(() => {
  if (RAW_SOURCES.length === 0) return;

  // Reduced from 6 to match RAW_SOURCES.length (usually 3) so each appears exactly once
  const instanceCount = RAW_SOURCES.length;
  for (let i = 0; i < instanceCount; i++) {
    const source = RAW_SOURCES[i];
    
    // Spread them around the section grid
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    
    activeFlowers.push({
      src: source.src,
      baseX: x,
      baseY: y,
      depth: source.baseDepth,
      initialStyle: {
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${source.baseDepth * (0.8 + Math.random() * 0.4)})`,
        opacity: 0,
        zIndex: Math.floor(source.baseDepth * 10),
      },
    });
  }

  // Animation logic (copied and adapted from FloralBanner)
  setTimeout(() => {
    flowerRefs.value.forEach((el, i) => {
      if (!el) return;
      const flower = activeFlowers[i];

      // 1. Entrance
      gsap.to(el, {
        opacity: flower.depth > 1 ? 0.35 : 0.25, // Subtle opacities for About section
        duration: 2,
        delay: i * 0.2,
        ease: 'power2.out'
      });

      // 2. Continuous floating loop
      gsap.to(el, {
        y: `+=${25 * flower.depth}`,
        x: `+=${15 * flower.depth}`,
        rotation: i % 2 === 0 ? '+=15' : '-=15',
        duration: 5 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // 3. Mouse Interaction (Parallax + Evasion)
    const handleMouseMove = (e: MouseEvent) => {
      if (!container.value) return;
      const rectContainer = container.value.getBoundingClientRect();
      // Mouse position relative to section container
      const mX = e.clientX - rectContainer.left;
      const mY = e.clientY - rectContainer.top;
      
      const ww = rectContainer.width;
      const wh = rectContainer.height;

      flowerRefs.value.forEach((el, i) => {
        if (!el) return;
        const flower = activeFlowers[i];
        
        const moveX = (mX - ww / 2) * 0.05 * flower.depth;
        const moveY = (mY - wh / 2) * 0.05 * flower.depth;

        const rect = el.getBoundingClientRect();
        const fx = rect.left + rect.width / 2 - rectContainer.left;
        const fy = rect.top + rect.height / 2 - rectContainer.top;
        const dist = Math.hypot(mX - fx, mY - fy);
        
        let evadeX = 0;
        let evadeY = 0;
        
        const evadeDist = 250 * flower.depth;
        if (dist < evadeDist) {
          const angle = Math.atan2(fy - mY, fx - mX);
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
  }, 150);
});
</script>

<style scoped>
.floral-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.flower-item {
  position: absolute;
  width: 130px;
  height: auto;
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(0 15px 30px rgba(255, 75, 145, 0.15));
}
.flower-item img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

@media (max-width: 768px) {
  .flower-item {
    width: 70px;
  }
}
</style>
