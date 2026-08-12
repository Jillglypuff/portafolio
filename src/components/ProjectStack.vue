<template>
  <div 
    class="stack-container" 
    :class="[aspectRatio]"
    @mouseenter="isHovered = true" 
    @mouseleave="isHovered = false"
  >
    <!-- Header Meta (Badge, Title, Description, Chips & Actions) -->
    <div class="stack-header-meta">
      <div class="meta-badge-row">
        <span class="category-badge" v-if="categoryLabel">{{ categoryLabel }}</span>
        <span class="active-indicator" v-if="images.length > 1">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>
      </div>

      <h3 class="stack-title">{{ title }}</h3>
      
      <p class="stack-oneliner" v-if="oneLiner">{{ oneLiner }}</p>

      <!-- Tech Stack Badges -->
      <div class="tech-chips" v-if="technologies && technologies.length">
        <span v-for="(tech, tIdx) in technologies" :key="tIdx" class="tech-chip">
          {{ tech }}
        </span>
      </div>

      <!-- Action Buttons Row (Detalles Técnicos & Ampliar) -->
      <div class="stack-action-row">
        <button 
          v-if="hasCaseStudy"
          class="action-btn details-btn" 
          @click.stop.prevent="openCaseStudy"
          title="Ver detalles técnicos"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>{{ i18n?.caseStudy || 'Detalles Técnicos' }}</span>
        </button>

        <button 
          class="action-btn expand-btn" 
          @click.stop.prevent="openLightbox"
          title="Ampliar vista de imagen"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Visual Card Stack (Positioned below text meta, never overlapping) -->
    <div class="cards-visual-wrapper" @click="next">
      <!-- Navigation Controls on Hover -->
      <div class="stack-controls" v-if="isHovered && images.length > 1">
        <button class="control-btn prev" @click.stop="prev" aria-label="Previous">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button class="control-btn next" @click.stop="next" aria-label="Next">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="cards-visual">
        <div 
          v-for="(img, idx) in images" 
          :key="idx"
          class="project-card"
          :style="getCardStyle(idx)"
        >
          <img :src="img" alt="Vista previa del proyecto" loading="lazy" />
          <div class="card-glass"></div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal para Vista de Imagen Completa -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isLightboxOpen" class="lightbox-overlay lightbox-front" @click="isLightboxOpen = false">
          <div class="lightbox-content" @click.stop>
            <button class="close-lightbox" @click="isLightboxOpen = false" aria-label="Cerrar">&times;</button>
            <img :src="images[currentIndex]" alt="Vista completa del proyecto" class="full-img" />
            
            <div class="lightbox-nav" v-if="images.length > 1">
              <button class="nav-btn" @click="prev">&lsaquo;</button>
              <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
              <button class="nav-btn" @click="next">&rsaquo;</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de Caso de Estudio Técnico -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCaseStudyOpen" class="lightbox-overlay case-study-layer" @click="isCaseStudyOpen = false">
          <div class="case-study-content" @click.stop>
            <button class="close-modal" @click="isCaseStudyOpen = false" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div class="cs-header">
              <span class="category-badge" v-if="categoryLabel">{{ categoryLabel }}</span>
              <h2 class="cs-title">{{ title }}</h2>
              <p class="cs-subtitle" v-if="oneLiner">{{ oneLiner }}</p>
            </div>

            <div class="cs-body">
              <div class="cs-image-preview" @click="isLightboxOpen = true">
                <img :src="images[currentIndex]" alt="Preview del proyecto" />
                <span class="preview-hint">Haga clic para ampliar</span>
              </div>

              <div class="cs-details-grid">
                <div class="cs-block" v-if="problem">
                  <h4>{{ i18n?.problem || 'Desafío / Objetivo' }}</h4>
                  <p>{{ problem }}</p>
                </div>

                <div class="cs-block" v-if="solution">
                  <h4>{{ i18n?.solution || 'Solución Técnica' }}</h4>
                  <p>{{ solution }}</p>
                </div>

                <div class="cs-block full-width" v-if="highlights && highlights.length">
                  <h4>{{ i18n?.highlights || 'Aspectos Destacados' }}</h4>
                  <ul>
                    <li v-for="(hl, hlIdx) in highlights" :key="hlIdx">{{ hl }}</li>
                  </ul>
                </div>

                <div class="cs-block full-width" v-if="technologies && technologies.length">
                  <h4>{{ i18n?.stack || 'Tecnologías' }}</h4>
                  <div class="tech-chips">
                    <span v-for="(tech, tIdx) in technologies" :key="tIdx" class="tech-chip">
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(defineProps<{
  title: string;
  images: string[];
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  categoryLabel?: string;
  oneLiner?: string;
  technologies?: string[];
  problem?: string;
  solution?: string;
  highlights?: string[];
  demoUrl?: string;
  githubUrl?: string;
  i18n?: {
    caseStudy?: string;
    problem?: string;
    solution?: string;
    highlights?: string;
    stack?: string;
  };
}>(), {
  aspectRatio: 'landscape',
  technologies: () => [],
  highlights: () => []
});

const isHovered = ref(false);
const currentIndex = ref(0);
const isLightboxOpen = ref(false);
const isCaseStudyOpen = ref(false);

const hasCaseStudy = computed(() => {
  return Boolean(props.problem || props.solution || (props.highlights && props.highlights.length > 0));
});

const openCaseStudy = () => {
  isCaseStudyOpen.value = true;
};

const openLightbox = () => {
  isLightboxOpen.value = true;
};

const next = () => {
  if (props.images.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % props.images.length;
  }
};

const prev = () => {
  if (props.images.length > 1) {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
  }
};

const getCardStyle = (idx: number) => {
  const total = props.images.length;
  const relIdx = (idx - currentIndex.value + total) % total;
  
  if (!isHovered.value) {
    const offset = relIdx * 4;
    return {
      transform: `translate(${offset}px, ${offset}px) rotate(${relIdx * 0.8}deg)`,
      zIndex: total - relIdx,
      opacity: relIdx === 0 ? 1 : 0.4 - (relIdx * 0.1),
      visibility: relIdx > 3 ? 'hidden' : 'visible'
    };
  } else {
    const centerOffset = (total - 1) / 2;
    const fanIdx = idx - centerOffset;
    
    const isPortrait = props.aspectRatio === 'portrait';
    const isSquare = props.aspectRatio === 'square';
    
    const spread = isPortrait ? 18 : isSquare ? 22 : 26;
    const xOffset = fanIdx * spread;
    const rotate = fanIdx * (isPortrait ? 3 : isSquare ? 4 : 5);
    
    return {
      transform: `translateX(${xOffset}px) translateY(-10px) rotate(${rotate}deg) scale(${idx === currentIndex.value ? 1.03 : 1})`,
      zIndex: idx === currentIndex.value ? 50 : 10 + idx,
      opacity: 1,
      boxShadow: idx === currentIndex.value ? '0 16px 32px rgba(0,0,0,0.5)' : '0 8px 16px rgba(0,0,0,0.3)',
      border: idx === currentIndex.value ? '1.5px solid var(--rose)' : '1px solid rgba(255,255,255,0.12)'
    };
  }
};
</script>

<style scoped>
.stack-container {
  position: relative;
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 8px;
  cursor: pointer;
  overflow: visible;
}

.stack-container:hover {
  z-index: 100;
}

/* Header Meta */
.stack-header-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-badge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.category-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--rose-light);
  background: rgba(255, 75, 145, 0.12);
  border: 1px solid rgba(255, 75, 145, 0.25);
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.active-indicator {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.stack-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 2px 0;
  line-height: 1.25;
}

.stack-oneliner {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 4px;
}

/* Tech chips */
.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tech-chip {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Action Buttons Row */
.stack-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.action-btn {
  background: rgba(10, 8, 13, 0.85);
  border: 1px solid rgba(255, 75, 145, 0.35);
  color: var(--text);
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: var(--transition);
}

.action-btn:hover {
  background: var(--rose);
  color: #ffffff;
  border-color: var(--rose);
}

.expand-btn {
  padding: 0;
  width: 28px;
  justify-content: center;
}

/* Card Visual Container - Below text meta */
.cards-visual-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.portrait .cards-visual-wrapper {
  height: 410px;
}

.square .cards-visual-wrapper {
  height: 270px;
}

.cards-visual {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.project-card {
  position: absolute;
  width: 320px;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background: #0d0a14;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Cards - Matched to modern phone screen aspect ratio edge-to-edge */
.portrait .project-card {
  width: 195px;
  height: 390px;
  border-radius: 22px;
  border: 1px solid rgba(255, 75, 145, 0.3);
}

/* IG Post Square Cards (1:1 aspect ratio) */
.square .project-card {
  width: 250px;
  height: 250px;
  border-radius: 14px;
}

/* Web screenshots fill 100% of card without top/bottom black bars */
.project-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* Mobile app screenshots fill edge-to-edge inside smartphone frame */
.portrait .project-card img {
  object-fit: cover;
  object-position: top center;
  border-radius: 20px;
}

/* Square IG Post graphics fill 100% of 1:1 card edge-to-edge */
.square .project-card img {
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
}

.card-glass {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%);
  pointer-events: none;
}

/* Controls */
.stack-controls {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 25;
}

.control-btn {
  background: rgba(10, 8, 13, 0.85);
  border: 1px solid rgba(255, 75, 145, 0.35);
  color: var(--text);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: var(--transition);
}

.control-btn:hover {
  background: var(--rose);
  color: #ffffff;
  transform: scale(1.1);
}

/* Lightbox Modal Layering */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 13, 0.92);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.case-study-layer {
  z-index: 9990;
}

.lightbox-front {
  z-index: 10050;
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
  box-shadow: 0 30px 60px rgba(0,0,0,0.7);
  border: 1px solid var(--border);
  background: #0d0a14;
}

.close-lightbox {
  position: absolute;
  top: -40px;
  right: -10px;
  background: none;
  border: none;
  color: var(--text);
  font-size: 36px;
  cursor: pointer;
}

.lightbox-nav {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text);
}

.nav-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 20px;
  padding: 4px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.nav-btn:hover {
  background: var(--rose);
  color: #ffffff;
}

/* Case Study Content Modal */
.case-study-content {
  position: relative;
  background: var(--bg-tint);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  box-shadow: var(--shadow-lg);
  color: var(--text);
}

.close-modal {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.close-modal:hover {
  background: var(--rose);
  color: #ffffff;
}

.cs-header {
  margin-bottom: 20px;
}

.cs-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  margin: 8px 0 4px 0;
}

.cs-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.cs-image-preview {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: #0d0a14;
  margin-bottom: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cs-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(10, 8, 13, 0.8);
  color: var(--text-muted);
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.cs-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 650px) {
  .cs-details-grid {
    grid-template-columns: 1fr;
  }
}

.cs-block.full-width {
  grid-column: 1 / -1;
}

.cs-block h4 {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--rose-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.cs-block p {
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.5;
}

.cs-block ul {
  padding-left: 16px;
}

.cs-block li {
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.45;
  margin-bottom: 4px;
  list-style-type: disc;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .stack-container {
    max-width: 100%;
  }
  .cards-visual-wrapper {
    height: 200px;
  }
  .portrait .cards-visual-wrapper {
    height: 340px;
  }
  .square .cards-visual-wrapper {
    height: 220px;
  }
  .project-card {
    width: 240px;
    height: 160px;
  }
  .portrait .project-card {
    width: 170px;
    height: 340px;
  }
  .square .project-card {
    width: 200px;
    height: 200px;
  }
}
</style>
