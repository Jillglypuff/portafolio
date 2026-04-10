<template>
  <div class="particles" aria-hidden="true">
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle petal"
      :style="p.style"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2Q15,8 12,14Q9,8 12,2Z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import anime from 'animejs';

const COLORS = ['#ff4b91', '#ff9ebb', '#fce4ec', '#f8bbd0', '#f48fb1'];

interface Particle {
  id: number;
  style: string;
}

const particles = reactive<Particle[]>([]);

onMounted(() => {
  for (let i = 0; i < 30; i++) {
    const size = Math.random() * 15 + 8;
    particles.push({
      id: i,
      style: [
        `width:${size}px`,
        `height:${size * 1.5}px`,
        `left:${Math.random() * 100}vw`,
        `top:${Math.random() * 100}vh`,
        `color:${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
        `opacity:${Math.random() * 0.4 + 0.2}`,
      ].join(';'),
    });
  }

  // Run after Vue renders the DOM elements
  setTimeout(() => {
    anime({
      targets: '.particle',
      opacity: [0, 0.6, 0],
      translateY: () => anime.random(200, 600),
      translateX: () => anime.random(-100, 100),
      rotate: () => anime.random(0, 360),
      duration: () => anime.random(6000, 12000),
      delay: () => anime.random(0, 5000),
      loop: true,
      easing: 'linear',
    });
  }, 50);
});
</script>

<style scoped>
.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  opacity: 0;
  transform-origin: center;
}
.petal svg {
  width: 100%;
  height: 100%;
}
</style>
