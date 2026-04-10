<template>
  <div 
    class="stack-container" 
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <div class="stack-meta">
      <h3 class="stack-title">{{ title }}</h3>
      <p class="stack-count">{{ images.length }} items</p>
    </div>

    <div class="cards-visual">
      <div 
        v-for="(img, idx) in images" 
        :key="idx"
        class="project-card"
        :style="getCardStyle(idx)"
      >
        <img :src="img" alt="Project screenshot" />
        <div class="card-glass"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  title: string;
  images: string[];
}>();

const isHovered = ref(false);

const getCardStyle = (idx: number) => {
  const revIdx = props.images.length - 1 - idx;
  
  if (!isHovered.value) {
    // Stacked state
    return {
      transform: `translate(${revIdx * 4}px, ${revIdx * 4}px) rotate(${revIdx * 1}deg)`,
      zIndex: idx,
      opacity: revIdx === 0 ? 1 : 0.4,
    };
  } else {
    // Fanned out state
    const offset = (idx - (props.images.length - 1) / 2) * 20;
    const rotate = (idx - (props.images.length - 1) / 2) * 5;
    return {
      transform: `translateX(${offset}px) translateY(-20px) rotate(${rotate}deg)`,
      zIndex: idx,
      opacity: 1,
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    };
  }
};
</script>

<style scoped>
.stack-container {
  position: relative;
  width: 100%;
  height: 380px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 75, 145, 0.1);
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  cursor: pointer;
}

.stack-container:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 75, 145, 0.3);
  transform: translateY(-8px);
}

.stack-meta {
  margin-bottom: auto;
  position: relative;
  z-index: 10;
}

.stack-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.stack-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--rose);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.cards-visual {
  position: relative;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-card {
  position: absolute;
  width: 240px;
  height: 160px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background: var(--bg-tint);
}

.project-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  pointer-events: none;
}

@media (max-width: 600px) {
  .project-card {
    width: 200px;
    height: 140px;
  }
}
</style>
