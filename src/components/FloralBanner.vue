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
  .filter(([path]) => !path.includes('7.png') && !path.includes('14.png'))
  .map(([path, img]: any) => {
    const src = img.default?.src || img.src || img.default || img;
    // Extract filename to set specific weights
    const fileName = path.split('/').pop() || '';
    let baseDepth = 0.5 + Math.random() * 0.3; // Default small

    if (fileName.includes('6.png')) baseDepth = 1.6;
    if (fileName.includes('13.png')) baseDepth = 1.5;
    if (fileName.includes('10.png')) baseDepth = 1.0;
    if (fileName.includes('11.png')) baseDepth = 0.6;

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

  const count = RAW_SOURCES.length;
  for (let i = 0; i < count; i++) {
    const source = RAW_SOURCES[i];
    
    // Logic to prevent 6 and 13 from being on the same side
    let angle = (i / count) * Math.PI * 2;
    if (source.fileName.includes('6.png')) angle = Math.PI * 0.25; // Top Right-ish
    if (source.fileName.includes('13.png')) angle = Math.PI * 1.25; // Bottom Left-ish

    const distanceX = 350 + Math.random() * 200;
    const distanceY = 200 + Math.random() * 150;
    
    const x = 50 + (Math.cos(angle) * distanceX) / (window.innerWidth / 100);
    const y = 50 + (Math.sin(angle) * distanceY) / (window.innerHeight / 100);
    
    activeFlowers.push({
      src: source.src,
      baseX: x,
      baseY: y,
      depth: source.baseDepth,
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
        
        const moveX = (clientX - ww / 2) * 0.1 * flower.depth;
        const moveY = (clientY - wh / 2) * 0.1 * flower.depth;

        const rect = el.getBoundingClientRect();
        const fx = rect.left + rect.width / 2;
        const fy = rect.top + rect.height / 2;
        const dist = Math.hypot(clientX - fx, clientY - fy);
        
        let evadeX = 0;
        let evadeY = 0;
        
        // Larger flowers evade more/differently
        const evadeDist = 200 * flower.depth;
        if (dist < evadeDist) {
          const angle = Math.atan2(fy - clientY, fx - clientX);
          const force = (evadeDist - dist) / evadeDist;
          evadeX = Math.cos(angle) * 100 * force * flower.depth;
          evadeY = Math.sin(angle) * 100 * force * flower.depth;
        }

        gsap.to(el, {
          x: moveX + evadeX,
          y: moveY + evadeY,
          duration: 0.7,
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
