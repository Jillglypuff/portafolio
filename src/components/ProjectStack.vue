<template>
  <div 
    class="stack-container" 
    :class="[aspectRatio]"
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <div class="stack-meta">
      <h3 class="stack-title">{{ title }}</h3>
      <div class="stack-info">
        <p class="stack-count">{{ images.length }} items</p>
        <span class="active-indicator" v-if="images.length > 1">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="stack-controls" v-if="isHovered && images.length > 1">
      <button class="control-btn prev" @click.stop="prev" aria-label="Previous">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button class="control-btn next" @click.stop="next" aria-label="Next">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Expand Button -->
    <button 
      class="expand-btn" 
      v-if="isHovered" 
      @click.stop="isLightboxOpen = true"
      title="View full screen"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
      </svg>
    </button>

    <div class="cards-visual" @click="next">
      <div 
        v-for="(img, idx) in images" 
        :key="idx"
        class="project-card"
        :style="getCardStyle(idx)"
      >
        <img :src="img" alt="Project screenshot" loading="lazy" />
        <div class="card-glass"></div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isLightboxOpen" class="lightbox-overlay" @click="isLightboxOpen = false">
          <div class="lightbox-content" @click.stop>
            <button class="close-lightbox" @click="isLightboxOpen = false">&times;</button>
            <img :src="images[currentIndex]" alt="Design full view" class="full-img" />
            
            <div class="lightbox-nav" v-if="images.length > 1">
              <button class="nav-btn" @click="prev">&lsaquo;</button>
              <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
              <button class="nav-btn" @click="next">&rsaquo;</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  title: string;
  images: string[];
  aspectRatio?: 'landscape' | 'portrait';
}>(), {
  aspectRatio: 'landscape'
});

const isHovered = ref(false);
const currentIndex = ref(0);
const isLightboxOpen = ref(false);

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

const getCardStyle = (idx: number) => {
  const total = props.images.length;
  // Calculate relative index from current
  const relIdx = (idx - currentIndex.value + total) % total;
  
  if (!isHovered.value) {
    // Stacked state
    const offset = relIdx * 4;
    return {
      transform: `translate(${offset}px, ${offset}px) rotate(${relIdx * 1}deg)`,
      zIndex: total - relIdx,
      opacity: relIdx === 0 ? 1 : 0.4 - (relIdx * 0.1),
      visibility: relIdx > 3 ? 'hidden' : 'visible'
    };
  } else {
    // Fanned out state
    const centerOffset = (total - 1) / 2;
    const fanIdx = idx - centerOffset;
    
    // Adjust fanning based on aspect ratio
    const spread = props.aspectRatio === 'portrait' ? 25 : 40;
    const xOffset = fanIdx * spread;
    const rotate = fanIdx * (props.aspectRatio === 'portrait' ? 4 : 8);
    
    return {
      transform: `translateX(${xOffset}px) translateY(-20px) rotate(${rotate}deg) scale(${idx === currentIndex.value ? 1.05 : 1})`,
      zIndex: idx === currentIndex.value ? 50 : 10 + idx,
      opacity: 1,
      boxShadow: idx === currentIndex.value ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 20px rgba(0,0,0,0.2)',
      border: idx === currentIndex.value ? '2px solid var(--rose)' : '1px solid rgba(255,255,255,0.1)'
    };
  }
};
</script>

<style scoped>
.stack-container {
  --card-w: 400px;
  --card-h: 250px;
  --container-h: 500px;

  position: relative;
  width: 100%;
  height: var(--container-h);
  /* Invisible container for floating effect */
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  cursor: pointer;
  /* Allow cards and shadows to overflow without being clipped */
  overflow: visible;
}

.stack-container.portrait {
  --card-w: 240px;
  --card-h: 420px;
  --container-h: 720px;
}

.stack-container:hover {
  /* Subtle highlight on hover instead of heavy border */
  z-index: 100;
}

.stack-meta {
  margin-bottom: auto;
  position: relative;
  z-index: 10;
  padding-bottom: 20px;
}

.stack-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.stack-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stack-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--rose);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.active-indicator {
  font-size: 0.75rem;
  color: var(--rose);
  background: rgba(255, 75, 145, 0.1);
  padding: 2px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 75, 145, 0.2);
}

.cards-visual {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.portrait .cards-visual {
  height: 460px;
}

.project-card {
  position: absolute;
  width: var(--card-w);
  height: var(--card-h);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  background: var(--bg-tint);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
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

/* Controls */
.stack-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 20;
}

.control-btn {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: var(--rose);
  transform: scale(1.1);
}

.expand-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
}

.expand-btn:hover {
  background: var(--rose);
  transform: rotate(90deg);
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

.close-lightbox {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  padding: 10px;
}

.lightbox-nav {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.nav-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  font-size: 24px;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: 0.3s;
}

.nav-btn:hover {
  background: var(--rose);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .project-card {
    width: 200px;
    height: 140px;
  }
  .portrait .project-card {
    width: 140px;
    height: 200px;
  }
  .lightbox-overlay {
    padding: 20px;
  }
  .close-lightbox {
    right: 0;
    top: -50px;
  }
}
</style>
