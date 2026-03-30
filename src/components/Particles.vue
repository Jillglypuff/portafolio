<template>
  <div class="particles" aria-hidden="true">
    <div
      v-for="p in particles"
      :key="p.id"
      class="particle"
      :style="p.style"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import anime from 'animejs';

const COLORS = ['#F2D7E3', '#EDE8F5', '#F9EDD5', '#fce4ec', '#e8eaf6'];

interface Particle {
  id: number;
  style: string;
}

const particles = reactive<Particle[]>([]);

onMounted(() => {
  for (let i = 0; i < 24; i++) {
    const size = Math.random() * 12 + 4;
    particles.push({
      id: i,
      style: [
        `width:${size}px`,
        `height:${size}px`,
        `left:${Math.random() * 100}vw`,
        `top:${Math.random() * 100}vh`,
        `background:${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
      ].join(';'),
    });
  }

  // Run after Vue renders the DOM elements
  setTimeout(() => {
    anime({
      targets: '.particle',
      opacity: [0, 0.7, 0],
      translateY: () => anime.random(-120, 120),
      translateX: () => anime.random(-60, 60),
      scale: [0.5, 1.2, 0.5],
      duration: () => anime.random(4000, 9000),
      delay: () => anime.random(0, 4000),
      loop: true,
      easing: 'easeInOutSine',
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
  border-radius: 50%;
  opacity: 0;
}
</style>
