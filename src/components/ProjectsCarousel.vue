<template>
  <div class="projects-carousel-container" ref="carouselRoot">
    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- INTERACTIVE CAROUSEL SHOWCASE (HERO MOCKUP VIEWER)             -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <div 
      v-if="currentProject" 
      class="carousel-stage-wrapper"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- Floating Navigation Arrow: PREV -->
      <button 
        class="nav-arrow nav-prev" 
        @click="prevProject"
        :aria-label="i18nLabels?.prev || 'Mockup anterior'"
        title="Mockup anterior (o flecha ←)"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Floating Navigation Arrow: NEXT -->
      <button 
        class="nav-arrow nav-next" 
        @click="nextProject"
        :aria-label="i18nLabels?.next || 'Siguiente mockup'"
        title="Siguiente mockup (o flecha →)"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Main Showcase Slide with Keyframe Transition -->
      <Transition name="slide-fade" mode="out-in">
        <div :key="currentProject.id" class="carousel-slide">
          
          <!-- Mockup Display Screen Viewport -->
          <div class="mockup-viewport" :class="[currentProject.aspectRatio]">
            
            <!-- Standard Mockup Showcase (Web, Figma, Social Media) -->
            <div 
              v-if="activeImageSrc && !currentProject.isComingSoon" 
              class="mockup-stage-card"
              :class="[currentProject.aspectRatio]"
              @click="openCaseStudy(currentProject)"
              role="button"
              tabindex="0"
              :title="currentProject.title"
            >
              <img 
                :src="activeImageSrc" 
                :alt="currentProject.title"
                class="stage-mockup-img" 
                loading="eager"
              />
            </div>

            <!-- Portrait Smartphone Mockup Frame (Mobile Redes / Stories - In Preparation) -->
            <div 
              v-else 
              class="phone-frame clickable-phone"
              @click="openCaseStudy(currentProject)"
              role="button"
              tabindex="0"
              :title="i18nLabels?.caseStudy || 'Ver Detalles Técnicos'"
            >
              <div class="phone-speaker-notch">
                <span class="phone-camera"></span>
                <span class="phone-speaker"></span>
              </div>
              <div class="phone-screen">
                <div class="mobile-placeholder">
                  <div class="placeholder-icon">
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                      <path d="M12 18h.01"></path>
                    </svg>
                  </div>
                  <h4>{{ currentProject.title }}</h4>
                  <p class="placeholder-desc">{{ currentProject.comingSoonText || 'Estructura vertical (9:16) lista para las piezas móviles de redes sociales.' }}</p>
                  <span class="badge-prep">{{ i18nLabels?.comingSoon || 'En Preparación' }}</span>
                </div>
              </div>
            </div>

            <!-- Sub-gallery Switcher (If this project has multiple images/screens) -->
            <div 
              class="subgallery-bar" 
              v-if="currentProject.images && currentProject.images.length > 1"
            >
              <button 
                class="sub-arrow" 
                @click.stop="prevSubImage"
                title="Vista anterior"
                aria-label="Vista anterior"
              >
                ‹
              </button>

              <div class="sub-pills">
                <button
                  v-for="(img, sIdx) in currentProject.images"
                  :key="sIdx"
                  class="sub-pill"
                  :class="{ active: currentSubIndex === sIdx }"
                  @click.stop="setSubImage(sIdx)"
                  :title="`${i18nLabels?.screens || 'Pantalla'} ${sIdx + 1}`"
                >
                  <span class="sub-dot"></span>
                  <span class="sub-num">{{ sIdx + 1 }}</span>
                </button>
              </div>

              <button 
                class="sub-arrow" 
                @click.stop="nextSubImage"
                title="Siguiente vista"
                aria-label="Siguiente vista"
              >
                ›
              </button>
            </div>
          </div>

          <!-- Project Details Meta Card -->
          <div class="project-info-card">
            <div class="info-top-row">
              <span class="category-badge">{{ currentProject.categoryLabel }}</span>
              <span class="aspect-badge">
                <span v-if="currentProject.aspectRatio === 'landscape'">Web / Desktop</span>
                <span v-else-if="currentProject.aspectRatio === 'square'">Social</span>
                <span v-else>Mobile</span>
              </span>
            </div>

            <h3 class="project-title">{{ currentProject.title }}</h3>
            <p class="project-oneliner">{{ currentProject.oneLiner }}</p>

            <!-- Technologies Chips -->
            <div class="tech-tags" v-if="currentProject.technologies && currentProject.technologies.length">
              <span 
                v-for="(tech, tIdx) in currentProject.technologies" 
                :key="tIdx"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Action Buttons (Only Live Demo if available) -->
            <div class="project-action-buttons" v-if="currentProject.demoUrl">
              <a 
                :href="formatExternalUrl(currentProject.demoUrl)" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-primary"
                @click.stop
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Demo en vivo</span>
              </a>
            </div>
          </div>

        </div>
      </Transition>

      <!-- Minimal Dots Pagination (Clean & Center) -->
      <div class="stage-dots-bar" v-if="filteredProjects.length > 1">
        <button
          v-for="(proj, idx) in filteredProjects"
          :key="proj.id"
          class="stage-dot"
          :class="{ active: currentIndex === idx }"
          @click="goToProject(idx)"
          :aria-label="`Ir al proyecto ${idx + 1}: ${proj.title}`"
          :title="proj.title"
        >
        </button>
      </div>
    </div>



    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- FULLSCREEN LIGHTBOX MODAL                                      -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isLightboxOpen" class="lightbox-overlay" @click="closeLightbox">
          <div class="lightbox-modal" @click.stop>
            <button class="lightbox-close" @click="closeLightbox" aria-label="Cerrar modal">&times;</button>
            <img :src="lightboxSrc" :alt="currentProject?.title || 'Mockup full'" class="lightbox-image" />
            
            <div class="lightbox-toolbar" v-if="currentProject && currentProject.images && currentProject.images.length > 1">
              <button class="lb-arrow" @click="prevSubImage">&lsaquo;</button>
              <span class="lb-count">{{ currentSubIndex + 1 }} / {{ currentProject.images.length }}</span>
              <button class="lb-arrow" @click="nextSubImage">&rsaquo;</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- TECHNICAL CASE STUDY MODAL                                     -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCaseStudyOpen && activeCaseStudyProject" class="lightbox-overlay cs-overlay" @click="isCaseStudyOpen = false">
          <div class="cs-modal" @click.stop>
            <button class="cs-close-btn" @click="isCaseStudyOpen = false" aria-label="Cerrar modal">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div class="cs-top">
              <div class="cs-meta-badges">
                <span class="category-badge">{{ activeCaseStudyProject.categoryLabel }}</span>
                <span class="cs-tech-pill">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>{{ i18nLabels?.caseStudy || 'Detalles Técnicos' }}</span>
                </span>
              </div>
              <h2 class="cs-title">{{ activeCaseStudyProject.title }}</h2>
              <p class="cs-subtitle">{{ activeCaseStudyProject.oneLiner }}</p>
            </div>

            <div class="cs-content-grid">
              <!-- Left Column: Media & Multi-Screen Switcher -->
              <div class="cs-media-col">
                <div 
                  class="cs-preview-box" 
                  v-if="activeCaseStudyProject.images && activeCaseStudyProject.images.length"
                  @click="openLightbox(activeCaseStudyProject.images[activeCaseStudyImgIndex] || activeCaseStudyProject.images[0])"
                  role="button"
                  tabindex="0"
                  :title="i18nLabels?.viewFull || 'Clic para ampliar mockup'"
                >
                  <img 
                    :src="activeCaseStudyProject.images[activeCaseStudyImgIndex] || activeCaseStudyProject.images[0]" 
                    :alt="activeCaseStudyProject.title" 
                  />
                  <div class="cs-hint">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>{{ i18nLabels?.viewFull || 'Clic para ampliar mockup' }}</span>
                  </div>
                </div>

                <!-- Subgallery Switcher inside Modal -->
                <div 
                  class="cs-subgallery-bar" 
                  v-if="activeCaseStudyProject.images && activeCaseStudyProject.images.length > 1"
                >
                  <button 
                    v-for="(img, csIdx) in activeCaseStudyProject.images" 
                    :key="csIdx"
                    class="cs-sub-dot-btn"
                    :class="{ active: activeCaseStudyImgIndex === csIdx }"
                    @click.stop="activeCaseStudyImgIndex = csIdx"
                    type="button"
                  >
                    <span>{{ (i18nLabels?.screens || 'Pantalla') }} {{ csIdx + 1 }}</span>
                  </button>
                </div>
              </div>

              <!-- Right Column: Technical Details -->
              <div class="cs-details-col">
                <div class="cs-section" v-if="activeCaseStudyProject.caseStudy?.problem">
                  <h4>{{ i18nLabels?.problem || 'Desafío y Objetivo' }}</h4>
                  <p>{{ activeCaseStudyProject.caseStudy.problem }}</p>
                </div>

                <div class="cs-section" v-if="activeCaseStudyProject.caseStudy?.solution">
                  <h4>{{ i18nLabels?.solution || 'Solución Técnica' }}</h4>
                  <p>{{ activeCaseStudyProject.caseStudy.solution }}</p>
                </div>

                <div class="cs-section" v-if="activeCaseStudyProject.caseStudy?.highlights?.length">
                  <h4>{{ i18nLabels?.highlights || 'Aspectos Destacados' }}</h4>
                  <ul>
                    <li v-for="(hl, hIdx) in activeCaseStudyProject.caseStudy.highlights" :key="hIdx">{{ hl }}</li>
                  </ul>
                </div>

                <div class="cs-section" v-if="activeCaseStudyProject.technologies?.length">
                  <h4>{{ i18nLabels?.stack || 'Tecnologías del Proyecto' }}</h4>
                  <div class="tech-tags">
                    <span v-for="(tech, tIdx) in activeCaseStudyProject.technologies" :key="tIdx" class="tech-tag">{{ tech }}</span>
                  </div>
                </div>

                <!-- Case Study Action Link Buttons -->
                <div class="cs-action-row" v-if="activeCaseStudyProject.demoUrl || activeCaseStudyProject.githubUrl">
                  <a 
                    v-if="activeCaseStudyProject.demoUrl" 
                    :href="formatExternalUrl(activeCaseStudyProject.demoUrl)" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="btn-primary"
                    @click.stop
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>Ver Demo en Vivo</span>
                  </a>

                  <a 
                    v-if="activeCaseStudyProject.githubUrl" 
                    :href="formatExternalUrl(activeCaseStudyProject.githubUrl)" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="btn-secondary"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
export interface ProjectItem {
  id: string;
  title: string;
  category: 'web' | 'figma' | 'social';
  categoryLabel: string;
  oneLiner: string;
  images: string[];
  aspectRatio: 'landscape' | 'portrait' | 'square';
  technologies: string[];
  caseStudy?: {
    problem?: string;
    solution?: string;
    highlights?: string[];
  };
  demoUrl?: string;
  githubUrl?: string;
  isComingSoon?: boolean;
  comingSoonText?: string;
}

export function formatExternalUrl(url?: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = withDefaults(defineProps<{
  projects: ProjectItem[];
  filterLabels?: {
    all?: string;
    web?: string;
    figma?: string;
    social?: string;
  };
  i18nLabels?: {
    caseStudy?: string;
    problem?: string;
    solution?: string;
    highlights?: string;
    stack?: string;
    carousel?: string;
    grid?: string;
    prev?: string;
    next?: string;
    viewFull?: string;
    screens?: string;
    comingSoon?: string;
  };
}>(), {
  projects: () => [],
  filterLabels: () => ({}),
  i18nLabels: () => ({})
});

const currentIndex = ref(0);
const currentSubIndex = ref(0);

// Modals
const isLightboxOpen = ref(false);
const lightboxSrc = ref('');
const isCaseStudyOpen = ref(false);
const activeCaseStudyProject = ref<ProjectItem | null>(null);
const activeCaseStudyImgIndex = ref(0);

// Touch gesture tracking for mobile swipe
const touchStartX = ref(0);
const touchEndX = ref(0);

// All projects in carousel
const filteredProjects = computed(() => props.projects || []);

// Currently focused project in carousel
const currentProject = computed<ProjectItem | undefined>(() => {
  const list = filteredProjects.value;
  if (!list || !list.length) return undefined;
  return list[currentIndex.value] || list[0];
});

// Currently focused image src within active project
const activeImageSrc = computed<string>(() => {
  if (!currentProject.value || !currentProject.value.images || !currentProject.value.images.length) {
    return '';
  }
  return currentProject.value.images[currentSubIndex.value] || currentProject.value.images[0];
});

// Helpers
const formattedIndex = (num: number) => {
  return num < 10 ? `0${num}` : `${num}`;
};

const hasCaseStudy = (p?: ProjectItem) => {
  if (!p) return false;
  return Boolean(p.caseStudy?.problem || p.caseStudy?.solution || (p.caseStudy?.highlights && p.caseStudy.highlights.length > 0));
};

const nextProject = () => {
  if (filteredProjects.value.length <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % filteredProjects.value.length;
  currentSubIndex.value = 0;
};

const prevProject = () => {
  if (filteredProjects.value.length <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + filteredProjects.value.length) % filteredProjects.value.length;
  currentSubIndex.value = 0;
};

const goToProject = (idx: number) => {
  currentIndex.value = idx;
  currentSubIndex.value = 0;
};

// Sub-gallery methods (multi-image mockups)
const nextSubImage = () => {
  if (!currentProject.value?.images || currentProject.value.images.length <= 1) return;
  currentSubIndex.value = (currentSubIndex.value + 1) % currentProject.value.images.length;
  if (isLightboxOpen.value) {
    lightboxSrc.value = activeImageSrc.value;
  }
};

const prevSubImage = () => {
  if (!currentProject.value?.images || currentProject.value.images.length <= 1) return;
  currentSubIndex.value = (currentSubIndex.value - 1 + currentProject.value.images.length) % currentProject.value.images.length;
  if (isLightboxOpen.value) {
    lightboxSrc.value = activeImageSrc.value;
  }
};

const setSubImage = (sIdx: number) => {
  currentSubIndex.value = sIdx;
  if (isLightboxOpen.value) {
    lightboxSrc.value = activeImageSrc.value;
  }
};

// Lightbox
const openLightbox = (imgSrc: string) => {
  if (!imgSrc) return;
  lightboxSrc.value = imgSrc;
  isLightboxOpen.value = true;
};

const closeLightbox = () => {
  isLightboxOpen.value = false;
};

// Case study modal
const openCaseStudy = (proj: ProjectItem) => {
  activeCaseStudyProject.value = proj;
  activeCaseStudyImgIndex.value = currentSubIndex.value;
  isCaseStudyOpen.value = true;
};

// Touch swipe handlers
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX;
  const diff = touchEndX.value - touchStartX.value;
  if (Math.abs(diff) > 45) {
    if (diff < 0) {
      nextProject();
    } else {
      prevProject();
    }
  }
};

// Keyboard listener for Left/Right arrows
const handleKeyDown = (e: KeyboardEvent) => {
  if (isLightboxOpen.value) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextSubImage();
    if (e.key === 'ArrowLeft') prevSubImage();
    return;
  }
  if (isCaseStudyOpen.value) {
    if (e.key === 'Escape') isCaseStudyOpen.value = false;
    return;
  }
  if (e.key === 'ArrowRight') nextProject();
  if (e.key === 'ArrowLeft') prevProject();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.projects-carousel-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}



/* ─── CAROUSEL STAGE WRAPPER (NO BORDERS) ───────────────────────── */
.carousel-stage-wrapper {
  position: relative;
  width: 100%;
  background: linear-gradient(145deg, rgba(22, 14, 31, 0.85) 0%, rgba(10, 8, 13, 0.95) 100%);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  padding: 36px 40px;
  backdrop-filter: blur(16px);
  margin-bottom: 28px;
}

/* Floating Navigation Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 8, 13, 0.85);
  border: 1.5px solid rgba(255, 75, 145, 0.4);
  color: var(--text);
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  transition: var(--transition);
}

.nav-prev { left: -20px; }
.nav-next { right: -20px; }

.nav-arrow:hover {
  background: var(--rose);
  color: #ffffff;
  border-color: var(--rose);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 10px 28px rgba(255, 75, 145, 0.45);
}

/* ─── CAROUSEL SLIDE LAYOUT ──────────────────────────────────────── */
.carousel-slide {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  align-items: center;
  gap: 40px;
  width: 100%;
}

/* ─── MOCKUP VIEWPORT & FRAMES ───────────────────────────────────── */
.mockup-viewport {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Mockup Stage: Clean, borderless presentation where realistic device mockups float with natural shadows */
.mockup-stage-card {
  position: relative;
  width: 100%;
  max-width: 680px;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  transition: var(--transition);
}

.mockup-stage-card.square {
  max-width: 440px;
  height: 420px;
}

.mockup-stage-card.portrait {
  max-width: 300px;
  height: 460px;
}

.stage-mockup-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  filter: drop-shadow(0 20px 35px rgba(0, 0, 0, 0.75));
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.35s ease;
}

.mockup-stage-card:hover .stage-mockup-img {
  transform: translateY(-8px) scale(1.025);
  filter: drop-shadow(0 28px 45px rgba(255, 75, 145, 0.3));
}

.screen-hover-hint {
  position: absolute;
  bottom: 12px;
  background: rgba(14, 10, 20, 0.9);
  border: 1px solid rgba(255, 75, 145, 0.4);
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.mockup-stage-card:hover .screen-hover-hint {
  opacity: 1;
  transform: translateY(0);
}

/* Phone Frame (Mobile Social Media & Stories) */
.phone-frame {
  width: 100%;
  max-width: 250px;
  border-radius: 34px;
  padding: 10px;
  background: #14101e;
  border: 2px solid rgba(255, 75, 145, 0.35);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.05);
}

.phone-speaker-notch {
  width: 80px;
  height: 16px;
  background: #09060c;
  border-radius: 12px;
  margin: 0 auto 8px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.phone-camera {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.phone-speaker {
  width: 32px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.phone-screen {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 24px;
  overflow: hidden;
  background: #09060c;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile Placeholder */
.mobile-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
}

.placeholder-icon {
  color: var(--rose);
  margin-bottom: 12px;
  filter: drop-shadow(0 0 12px rgba(255, 75, 145, 0.4));
}

.mobile-placeholder h4 {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 8px;
}

.placeholder-desc {
  font-size: 0.76rem;
  line-height: 1.45;
  margin-bottom: 14px;
}

.badge-prep {
  font-size: 0.68rem;
  padding: 3px 10px;
  border-radius: 12px;
  background: rgba(255, 75, 145, 0.15);
  border: 1px solid rgba(255, 75, 145, 0.35);
  color: var(--rose-light);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ─── SUB-GALLERY SWITCHER BAR ────────────────────────────────────── */
.subgallery-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 4px 12px;
  background: rgba(22, 14, 31, 0.85);
  border: 1px solid var(--border);
  border-radius: 20px;
  backdrop-filter: blur(8px);
}

.sub-arrow {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 6px;
  cursor: pointer;
  transition: var(--transition);
}

.sub-arrow:hover {
  color: var(--rose-light);
}

.sub-pills {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--transition);
}

.sub-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.sub-pill:hover {
  color: var(--text);
  border-color: rgba(255, 75, 145, 0.3);
}

.sub-pill.active {
  background: var(--rose);
  border-color: var(--rose);
  color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 75, 145, 0.5);
}

/* ─── PROJECT INFO CARD ──────────────────────────────────────────── */
.project-info-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.info-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 10px;
  border-radius: 8px;
  color: var(--rose-light);
  background: rgba(255, 75, 145, 0.12);
  border: 1px solid rgba(255, 75, 145, 0.28);
}

.aspect-badge {
  font-size: 0.72rem;
  color: var(--text-muted);
  opacity: 0.85;
}

.project-title {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  margin-bottom: 14px;
}

.project-oneliner {
  font-size: 0.98rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 20px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 24px;
}

.tech-tag {
  font-size: 0.74rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
}

.tech-tag:hover {
  border-color: rgba(255, 75, 145, 0.3);
  background: rgba(255, 75, 145, 0.08);
  color: var(--rose-light);
}

.project-action-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--rose);
  color: #ffffff;
  border: 1px solid var(--rose);
  box-shadow: 0 4px 16px rgba(255, 75, 145, 0.35);
}

.btn-primary:hover {
  background: var(--rose-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 75, 145, 0.5);
}

.btn-secondary {
  background: rgba(22, 14, 31, 0.85);
  color: var(--text);
  border: 1px solid var(--border);
  backdrop-filter: blur(8px);
}

.btn-secondary:hover {
  border-color: var(--rose);
  color: var(--rose-light);
  transform: translateY(-2px);
  background: rgba(255, 75, 145, 0.1);
}

/* ─── STAGE DOTS (MINIMAL PAGINATION) ────────────────────────────── */
.stage-dots-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stage-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 0;
  transition: all 0.25s ease;
}

.stage-dot:hover {
  background: rgba(255, 75, 145, 0.5);
  border-color: var(--rose);
  transform: scale(1.2);
}

.stage-dot.active {
  width: 28px;
  border-radius: 12px;
  background: var(--rose);
  border-color: var(--rose);
  box-shadow: 0 0 12px rgba(255, 75, 145, 0.6);
}

/* ─── GRID MODE (WHEN TOGGLED) ───────────────────────────────────── */
.projects-grid-mode {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  width: 100%;
}

.grid-card {
  background: rgba(22, 14, 31, 0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.grid-card:hover {
  border-color: var(--rose);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 75, 145, 0.2);
}

.grid-card-screen {
  position: relative;
  width: 100%;
  height: 200px;
  background: #09060c;
  overflow: hidden;
}

.grid-card-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.4s ease;
}

.grid-card:hover .grid-card-screen img {
  transform: scale(1.04);
}

.grid-card-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.grid-card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(10, 8, 13, 0.8);
  border: 1px solid rgba(255, 75, 145, 0.35);
  color: var(--rose-light);
  backdrop-filter: blur(4px);
}

.grid-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.grid-card-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.grid-card-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.45;
  margin-bottom: 12px;
  flex-grow: 1;
}

.grid-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
}

.tech-tags.mini .tech-tag {
  font-size: 0.68rem;
  padding: 2px 6px;
}

.grid-open-btn {
  background: none;
  border: none;
  color: var(--rose-light);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.grid-open-btn:hover {
  color: #ffffff;
}

/* ─── FULLSCREEN LIGHTBOX MODAL ──────────────────────────────────── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(10, 8, 13, 0.94);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lightbox-modal {
  position: relative;
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
  background: #09060c;
}

.lightbox-close {
  position: absolute;
  top: -44px;
  right: -8px;
  background: none;
  border: none;
  color: var(--text);
  font-size: 40px;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition);
}

.lightbox-close:hover {
  color: var(--rose);
}

.lightbox-toolbar {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: rgba(22, 14, 31, 0.85);
  border: 1px solid var(--border);
  padding: 4px 18px;
  border-radius: 20px;
  color: var(--text);
}

.lb-arrow {
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  transition: var(--transition);
}

.lb-arrow:hover {
  color: var(--rose);
}

.lb-count {
  font-size: 0.85rem;
  font-weight: 600;
}

/* ─── CASE STUDY MODAL ───────────────────────────────────────────── */
.cs-overlay {
  z-index: 9990;
}

.cs-modal {
  position: relative;
  background: #140d1c;
  border: 1px solid rgba(255, 75, 145, 0.35);
  border-radius: var(--radius-lg);
  max-width: 960px;
  width: 95%;
  max-height: 88vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.85), 0 0 50px rgba(255, 75, 145, 0.25);
  color: var(--text);
}

.cs-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  color: var(--text);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  z-index: 10;
}

.cs-close-btn:hover {
  background: var(--rose);
  color: #ffffff;
  border-color: var(--rose);
  transform: rotate(90deg);
}

.cs-top {
  margin-bottom: 24px;
  padding-right: 48px;
}

.cs-meta-badges {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.cs-tech-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--rose-light);
  background: rgba(255, 75, 145, 0.12);
  border: 1px solid rgba(255, 75, 145, 0.25);
  padding: 3px 10px;
  border-radius: 20px;
}

.cs-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
  color: #ffffff;
  margin: 6px 0 6px 0;
  line-height: 1.25;
}

.cs-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.cs-content-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 28px;
  align-items: start;
}

.cs-media-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cs-preview-box {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(255, 75, 145, 0.25);
  background: radial-gradient(circle at center, rgba(32, 20, 48, 0.5) 0%, rgba(9, 6, 12, 0.95) 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.cs-preview-box:hover {
  border-color: rgba(255, 75, 145, 0.5);
  box-shadow: 0 10px 30px rgba(255, 75, 145, 0.2);
}

.cs-preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
  transition: transform 0.3s ease;
}

.cs-preview-box:hover img {
  transform: scale(1.02);
}

.cs-hint {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(10, 8, 13, 0.85);
  color: #ffffff;
  font-size: 0.75rem;
  padding: 5px 10px;
  border-radius: 6px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 5px;
}

.cs-subgallery-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cs-sub-dot-btn {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.cs-sub-dot-btn:hover {
  background: rgba(255, 75, 145, 0.15);
  color: var(--text);
  border-color: rgba(255, 75, 145, 0.4);
}

.cs-sub-dot-btn.active {
  background: var(--rose);
  border-color: var(--rose);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(255, 75, 145, 0.4);
}

.cs-details-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cs-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: var(--radius-sm);
}

.cs-section h4 {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--rose-light);
}

.cs-section p {
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.55;
  margin: 0;
}

.cs-section ul {
  padding-left: 18px;
  margin: 0;
}

.cs-section li {
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.5;
  margin-bottom: 4px;
  list-style-type: disc;
}

.cs-section li:last-child {
  margin-bottom: 0;
}

.cs-action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.clickable-phone {
  cursor: pointer;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.clickable-phone:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(255, 75, 145, 0.6);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 75, 145, 0.25);
}

/* ─── TRANSITIONS ────────────────────────────────────────────────── */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────────────── */
@media (max-width: 1080px) {
  .carousel-slide {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .mockup-stage-card {
    max-width: 100%;
    height: 340px;
  }
  .nav-prev { left: -12px; }
  .nav-next { right: -12px; }
}

@media (max-width: 768px) {
  .carousel-stage-wrapper {
    padding: 24px 16px;
  }

  .nav-arrow {
    width: 38px;
    height: 38px;
  }
  .nav-prev { left: -8px; }
  .nav-next { right: -8px; }
  .mockup-stage-card {
    height: 250px;
  }
  .phone-screen {
    height: 340px;
  }
  .project-title {
    font-size: 1.6rem;
  }
  .cs-content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .cs-preview-box {
    height: 240px;
  }
  .cs-modal {
    padding: 24px 18px;
  }
}
</style>
