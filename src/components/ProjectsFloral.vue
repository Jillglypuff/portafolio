<template>
  <div class="projects-floral-root" ref="container">
    <div class="flower-wrapper" ref="flowerWrap">
      <img src="../assets/flowers/1.png" alt="" class="flower-main" />
    </div>
    <!-- Soft glass overlay to aid text readability -->
    <div class="glass-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const container = ref<HTMLElement | null>(null);
const flowerWrap = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!container.value || !flowerWrap.value) return;

  // Continuous subtle rotation
  gsap.to(flowerWrap.value, {
    rotation: 360,
    duration: 30,
    repeat: -1,
    ease: 'none'
  });

  // Scroll matching effect (YK Produce style)
  // As the user scrolls through the projects section, the flower scales and shifts
  gsap.fromTo(flowerWrap.value, 
    { 
      scale: 0.8,
      opacity: 0.1
    },
    {
      scale: 1.25,
      opacity: 0.25,
      scrollTrigger: {
        trigger: '#projects',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    }
  );

  // Parallax shift
  gsap.to(flowerWrap.value, {
    y: '15%',
    scrollTrigger: {
      trigger: '#projects',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2,
    }
  });
});
</script>

<style scoped>
.projects-floral-root {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.flower-wrapper {
  position: sticky;
  top: 50%;
  left: 50%;
  width: 900px;
  height: 900px;
  transform-origin: center center;
  margin-left: -450px;
  margin-top: -450px;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, opacity;
}

.flower-main {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 50px rgba(255, 75, 145, 0.15)) blur(1px);
}

.glass-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, var(--bg) 95%);
  backdrop-filter: blur(2px);
  opacity: 0.4;
}

@media (max-width: 900px) {
  .flower-wrapper {
    width: 600px;
    height: 600px;
    margin-left: -300px;
    margin-top: -300px;
  }
}
</style>
