<template>
  <section class="flower-transition-section" ref="container">
    <div class="flower-center-anchor" ref="flower">
      <img :src="flowerSrc" alt="" class="golden-flower" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Importing the flower image directly
import flowerImg from '../assets/flowers/1.png';
const flowerSrc = ref(flowerImg.src || flowerImg);

const container = ref<HTMLElement | null>(null);
const flower = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!flower.value || !container.value) return;

  // ANIMATION: THE "PULL" EFFECT
  // Adjusted Y values to match the new shorter section height
  gsap.fromTo(flower.value, 
    { 
      y: "15vh", 
      rotation: -10,
      opacity: 0.9,
      scale: 0.98
    },
    { 
      y: "-20vh", 
      rotation: 10,
      opacity: 1,
      scale: 1.05,
      ease: "none",
      scrollTrigger: {
        trigger: container.value,
        start: "top bottom", 
        end: "bottom top", 
        scrub: 1.2,
      }
    }
  );
});
</script>

<style scoped>
.flower-transition-section {
  position: relative;
  width: 100%;
  height: 65vh; /* Reduced from 100vh to tighten spacing between sections */
  display: flex;
  justify-content: center;
  align-items: center; 
  z-index: 2;
  pointer-events: none;
  overflow: visible; 
}

.flower-center-anchor {
  position: relative;
  width: 440px; /* Reduced to avoid pixelation on large screens */
  height: 380px; /* Controlled height to "cut" the stem safely */
  max-width: 90vw;
  overflow: hidden; /* This achieves the stem cut robustly */
  transform-origin: top center; 
  will-change: transform;
}

.golden-flower {
  width: 100%;
  height: 120%; /* Slightly taller to ensure we can position the head correctly */
  display: block;
  object-fit: contain;
  object-position: bottom; /* Keep the flower head visible while the top stem is cut by overflow */
  transform: rotate(180deg);
  
  filter: drop-shadow(0 30px 80px rgba(0, 0, 0, 0.12));
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .flower-transition-section {
    height: 50vh;
  }
  .flower-center-anchor {
    width: 360px;
    height: 310px;
  }
}

@media (max-width: 768px) {
  .flower-transition-section {
    height: 35vh; /* Tightest height for mobile screens */
  }
  .flower-center-anchor {
    width: 65vw;
    height: 55vw; /* Maintain proportions on mobile */
  }
}
</style>
