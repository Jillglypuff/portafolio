<template>
  <div class="tech-marquee-container">
    <!-- Fade Masks for Smooth Transitions on the edges -->
    <div class="fade-mask left"></div>
    <div class="fade-mask right"></div>

    <!-- Marquee Track 1 (Right to Left) -->
    <div class="marquee-track">
      <div class="marquee-content scroll-left">
        <!-- Group 1 -->
        <div class="marquee-group">
          <template v-for="n in 4" :key="'r1-g1-' + n">
            <div v-for="(tech, idx) in row1" :key="'r1-a-' + n + '-' + idx" class="marquee-item">
              <span class="tech-text" :class="{ outline: tech.outline }">{{ tech.name }}</span>
              <span class="tech-star">✦</span>
            </div>
          </template>
        </div>
        <!-- Group 2 (Duplicate for Seamless Infinite Scroll) -->
        <div class="marquee-group" aria-hidden="true">
          <template v-for="n in 4" :key="'r1-g2-' + n">
            <div v-for="(tech, idx) in row1" :key="'r1-b-' + n + '-' + idx" class="marquee-item">
              <span class="tech-text" :class="{ outline: tech.outline }">{{ tech.name }}</span>
              <span class="tech-star">✦</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Marquee Track 2 (Left to Right) -->
    <div class="marquee-track">
      <div class="marquee-content scroll-right">
        <!-- Group 1 -->
        <div class="marquee-group">
          <template v-for="n in 4" :key="'r2-g1-' + n">
            <div v-for="(tech, idx) in row2" :key="'r2-a-' + n + '-' + idx" class="marquee-item">
              <span class="tech-text" :class="{ outline: tech.outline }">{{ tech.name }}</span>
              <span class="tech-star">✦</span>
            </div>
          </template>
        </div>
        <!-- Group 2 (Duplicate for Seamless Infinite Scroll) -->
        <div class="marquee-group" aria-hidden="true">
          <template v-for="n in 4" :key="'r2-g2-' + n">
            <div v-for="(tech, idx) in row2" :key="'r2-b-' + n + '-' + idx" class="marquee-item">
              <span class="tech-text" :class="{ outline: tech.outline }">{{ tech.name }}</span>
              <span class="tech-star">✦</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Balanced list of tools containing RAG, MCP, APIs
const row1 = [
  { name: 'React', outline: false },
  { name: 'Node.js', outline: true },
  { name: 'Tailwind CSS', outline: false },
  { name: 'PostgreSQL', outline: true },
  { name: 'GitHub', outline: false },
  { name: 'WordPress', outline: true },
  { name: 'HTML5', outline: false },
  { name: 'DBeaver', outline: true },
  { name: 'Laravel', outline: false },
  { name: 'RAG (AI)', outline: true },
  { name: 'REST/GraphQL APIs', outline: false }
];

const row2 = [
  { name: 'Vue.js', outline: false },
  { name: 'PHP', outline: true },
  { name: 'CSS3', outline: false },
  { name: 'Git', outline: true },
  { name: 'Java', outline: false },
  { name: 'Supabase', outline: true },
  { name: 'Expo React Native', outline: false },
  { name: 'OpenAI', outline: true },
  { name: 'CodeIgniter', outline: false },
  { name: 'Fluent UI', outline: true },
  { name: 'MCP (AI Protocol)', outline: false }
];
</script>

<style scoped>
.tech-marquee-container {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  overflow: hidden;
  background: transparent;
  padding: 1rem 0;
}

/* Edge Fade Masks */
.fade-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 18%;
  z-index: 8;
  pointer-events: none;
}
.fade-mask.left {
  left: 0;
  background: linear-gradient(to right, var(--bg, #0a080d) 15%, transparent 100%);
}
.fade-mask.right {
  right: 0;
  background: linear-gradient(to left, var(--bg, #0a080d) 15%, transparent 100%);
}

/* Infinite Marquee Track */
.marquee-track {
  width: 100%;
  overflow: hidden;
  display: flex;
  user-select: none;
}

.marquee-content {
  display: flex;
  width: max-content;
  gap: 0; /* Remove gap to avoid pixel shifts during loop reset */
  will-change: transform;
}

.marquee-group {
  display: flex;
  align-items: center;
  gap: 0; /* Handle spacing inside marquee-item for perfect loops */
  flex-shrink: 0;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 4rem; /* Gap between text and star */
  padding-right: 4rem; /* Padding before the next text item */
}

/* Typography styles */
.tech-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text);
  white-space: nowrap;
  transition: color 0.3s ease;
}

.tech-text.outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(252, 228, 236, 0.5);
}

.tech-star {
  color: var(--rose);
  font-size: 1.5rem;
  opacity: 0.75;
}

/* Scroll Animations (Very slow and premium: 140s) */
.scroll-left {
  animation: marquee-left 140s linear infinite;
}

.scroll-right {
  animation: marquee-right 140s linear infinite;
}

@keyframes marquee-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

/* Responsive Breakpoints */
@media (max-width: 900px) {
  .tech-marquee-container {
    height: 160px;
    gap: 1.5rem;
  }
  .tech-text {
    font-size: 1.75rem;
  }
  .tech-star {
    font-size: 1.15rem;
  }
  .marquee-item {
    gap: 2.5rem;
    padding-right: 2.5rem;
  }
}

@media (max-width: 600px) {
  .tech-marquee-container {
    height: 140px;
    gap: 1rem;
  }
}
</style>
