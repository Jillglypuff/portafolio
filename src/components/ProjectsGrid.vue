<template>
  <div class="projects-wrapper">
    <!-- Filter Bar (Without "Todos" tab) -->
    <div class="projects-filter-bar">
      <button
        class="filter-btn"
        :class="{ active: activeFilter === 'web' }"
        @click="activeFilter = 'web'"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        <span>{{ filterLabels.web || 'Sistemas Web' }}</span>
      </button>

      <button
        class="filter-btn"
        :class="{ active: activeFilter === 'mobile' }"
        @click="activeFilter = 'mobile'"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        <span>{{ filterLabels.mobile || 'Apps Móviles' }}</span>
      </button>

      <button
        class="filter-btn"
        :class="{ active: activeFilter === 'design' }"
        @click="activeFilter = 'design'"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r=".5"></circle>
          <circle cx="17.5" cy="10.5" r=".5"></circle>
          <circle cx="8.5" cy="7.5" r=".5"></circle>
          <circle cx="6.5" cy="12.5" r=".5"></circle>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.75 1.7-1.7 0-.42-.16-.8-.44-1.1-.28-.31-.44-.72-.44-1.2 0-.95.77-1.72 1.72-1.72h2.26c2.9 0 5.24-2.35 5.24-5.26 0-5.5-4.5-9.02-10-9.02z"></path>
        </svg>
        <span>{{ filterLabels.design || 'Diseño UI/UX & Branding' }}</span>
      </button>
    </div>

    <!-- Centered Projects Layout (Max 4 Columns, Centered when 3 or fewer) -->
    <TransitionGroup name="grid-fade" tag="div" class="projects-grid">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id" 
        class="grid-item"
      >
        <ProjectStack 
          :title="project.title" 
          :images="project.images"
          :aspectRatio="project.aspectRatio"
          :categoryLabel="project.categoryLabel"
          :oneLiner="project.oneLiner"
          :technologies="project.technologies"
          :problem="project.caseStudy?.problem"
          :solution="project.caseStudy?.solution"
          :highlights="project.caseStudy?.highlights"
          :demoUrl="project.demoUrl"
          :githubUrl="project.githubUrl"
          :i18n="i18nLabels"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ProjectStack from './ProjectStack.vue';

export interface ProjectItem {
  id: string;
  title: string;
  category: 'web' | 'mobile' | 'design';
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
}

const props = withDefaults(defineProps<{
  projects: ProjectItem[];
  filterLabels?: {
    all?: string;
    web?: string;
    mobile?: string;
    design?: string;
  };
  i18nLabels?: {
    caseStudy?: string;
    problem?: string;
    solution?: string;
    highlights?: string;
    stack?: string;
  };
}>(), {
  filterLabels: () => ({}),
  i18nLabels: () => ({})
});

const activeFilter = ref<'web' | 'mobile' | 'design'>('web');

const filteredProjects = computed(() => {
  return props.projects.filter(p => p.category === activeFilter.value);
});
</script>

<style scoped>
.projects-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
}

.projects-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 44px;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-tint);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.filter-btn:hover {
  color: var(--text);
  border-color: var(--rose-light);
  background: rgba(255, 75, 145, 0.08);
}

.filter-btn.active {
  color: #ffffff;
  background: var(--rose);
  border-color: var(--rose);
  box-shadow: var(--shadow-sm);
}

/* 4 Column Max Centered Layout */
.projects-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px 24px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.grid-item {
  flex: 0 1 calc(25% - 24px);
  min-width: 300px;
  max-width: 360px;
  display: flex;
  justify-content: center;
}

@media (max-width: 1400px) {
  .grid-item {
    flex: 0 1 calc(33.333% - 24px);
  }
}

@media (max-width: 980px) {
  .grid-item {
    flex: 0 1 calc(50% - 24px);
  }
}

@media (max-width: 640px) {
  .grid-item {
    flex: 0 1 100%;
    max-width: 100%;
  }
}

/* Transition Group Animations */
.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: all 0.35s ease;
}

.grid-fade-enter-from,
.grid-fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
</style>
