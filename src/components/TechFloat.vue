<template>
  <div class="tech-hero" ref="container">
    <!-- Center Flower #19 -->
    <div class="center-flower" ref="centerFlower">
      <img :src="flowerSrc" alt="Featured Flower" />
      <div class="center-glow"></div>
    </div>

    <!-- Floating Logos -->
    <div
      v-for="(logo, index) in activeLogos"
      :key="index"
      class="logo-item"
      :ref="(el) => { if (el) logoRefs[index] = el; }"
      :style="logo.initialStyle"
    >
      <div class="logo-bubble">
        <img :src="logo.src" :alt="logo.name" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import flower19 from '../assets/flowers/19.png';

const flowerSrc = flower19.src || flower19;

// Load logos
const logoImages = import.meta.glob('../assets/logos/*.{png,jpg,jpeg,webp,svg}', { eager: true });

const RAW_LOGOS = Object.entries(logoImages).map(([path, img]: any) => {
  const src = img.default?.src || img.src || img.default || img;
  const name = path.split('/').pop()?.split('-')[0] || 'tech';
  return { src, name };
});

const container = ref<HTMLElement | null>(null);
const centerFlower = ref<HTMLElement | null>(null);
const logoRefs = ref<any[]>([]);
const activeLogos = reactive<any[]>([]);
const hasStarted = ref(false);

onMounted(() => {
  if (RAW_LOGOS.length === 0) return;

  // 1. Initial State: Logos hidden behind flower
  const count = RAW_LOGOS.length;
  RAW_LOGOS.forEach((source, i) => {
    // Fixed distribution to avoid collisions
    const orbitTier = i % 3; 
    const distance = 240 + orbitTier * 50; // Reduced from 320 for a tighter cluster
    const angle = (i / count) * Math.PI * 2;
    const depth = 0.7 + (i % 3) * 0.15;
    
    activeLogos.push({
      ...source,
      depth,
      angle,
      distance,
      evadeX: 0,
      evadeY: 0,
      parallaxX: 0,
      parallaxY: 0,
      currentDistance: 0, 
      initialStyle: {
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(0)`,
        opacity: 0,
      }
    });
  });

  // 2. Interaction State
  const interactionState = {
    rotationSpeed: 0,
    currentRotation: 0
  };

  // 3. Main Animation Sequence
  const startAnimation = () => {
    if (hasStarted.value) return;
    hasStarted.value = true;

    const mainTl = gsap.timeline();

    // Stage A: Center Flower High-Speed Rotation (Slower than before)
    mainTl.to(interactionState, {
      rotationSpeed: 7, // Reduced from 15 for a more graceful feel
      duration: 3,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (centerFlower.value) {
          interactionState.currentRotation += interactionState.rotationSpeed;
          gsap.set(centerFlower.value, { rotation: interactionState.currentRotation });
        }
      }
    });

    // Stage B: Deceleration to slow crawl
    mainTl.to(interactionState, {
      rotationSpeed: 0.4,
      duration: 3,
      ease: 'power1.out',
      onUpdate: () => {
        if (centerFlower.value) {
          interactionState.currentRotation += interactionState.rotationSpeed;
          gsap.set(centerFlower.value, { rotation: interactionState.currentRotation });
        }
      }
    });

    // Stage C: Persistent Slow Rotation
    mainTl.to(interactionState, {
      rotationSpeed: 0.15, 
      duration: 0.5,
      onComplete: () => {
        gsap.to(interactionState, {
          duration: 1,
          repeat: -1,
          onUpdate: () => {
            if (centerFlower.value) {
              interactionState.currentRotation += interactionState.rotationSpeed;
              gsap.set(centerFlower.value, { rotation: interactionState.currentRotation });
            }
          }
        });
      }
    });

    // Logo Burst (Sequential Radial Emergence)
    logoRefs.value.forEach((el, i) => {
      if (!el) return;
      const logo = activeLogos[i];
      
      // Pronounced stagger for one-by-one emergence
      const startDelay = 0.8 + i * 0.45;

      gsap.to(logo, {
        currentDistance: logo.distance,
        duration: 2.5,
        delay: startDelay,
        ease: 'power3.out',
        onStart: () => {
           gsap.to(el, { opacity: 1, scale: logo.depth, duration: 1.2 });
        }
      });

      // Start orbital rotation after settling
      const driftDirection = i % 2 === 0 ? 1 : -1;
      gsap.to(logo, {
        angle: `+=${Math.PI * 2 * driftDirection}`,
        duration: 50 + Math.random() * 20,
        repeat: -1,
        ease: 'none',
        delay: startDelay + 1, 
        onUpdate: () => {
          const baseX = Math.cos(logo.angle) * logo.currentDistance;
          const baseY = Math.sin(logo.angle) * logo.currentDistance;
          gsap.set(el, {
            x: baseX + logo.evadeX + logo.parallaxX,
            y: baseY + logo.evadeY + logo.parallaxY,
            rotation: driftDirection * (i % 5)
          });
        }
      });
    });
  };

  // 4. Scroll Trigger Setup
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      startAnimation();
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  if (container.value) observer.observe(container.value);

  // 5. Mouse Interaction
  const handleMouseMove = (e: MouseEvent) => {
    if (!container.value) return;
    const rect = container.value.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;
    const ww = rect.width;
    const wh = rect.height;

    logoRefs.value.forEach((el, i) => {
      if (!el) return;
      const logo = activeLogos[i];
      
      const curBaseX = Math.cos(logo.angle) * logo.currentDistance;
      const curBaseY = Math.sin(logo.angle) * logo.currentDistance;
      const absX = ww / 2 + curBaseX;
      const absY = wh / 2 + curBaseY;

      const dist = Math.hypot(mX - absX, mY - absY);
      const evadeDist = 200 * logo.depth;
      let targetEvadeX = 0;
      let targetEvadeY = 0;

      if (dist < evadeDist) {
        const angle = Math.atan2(absY - mY, absX - mX);
        const force = (evadeDist - dist) / evadeDist;
        targetEvadeX = Math.cos(angle) * 100 * force;
        targetEvadeY = Math.sin(angle) * 100 * force;
      }

      gsap.to(logo, {
        evadeX: targetEvadeX,
        evadeY: targetEvadeY,
        parallaxX: (mX - ww / 2) * 0.04 * logo.depth,
        parallaxY: (mY - wh / 2) * 0.04 * logo.depth,
        duration: 0.8
      });
    });
  };

  window.addEventListener('mousemove', handleMouseMove);
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    observer.disconnect();
  });
});
</script>

<style scoped>
.tech-hero {
  position: relative;
  width: 100%;
  height: 850px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  perspective: 1000px;
}

.center-flower {
  position: relative;
  z-index: 20; /* High z-index to stay in front */
  width: 380px; /* Increased from 250px */
  height: 380px;
  filter: drop-shadow(0 0 40px rgba(255, 75, 145, 0.45));
  will-change: transform;
}
.center-flower img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.center-glow {
  position: absolute;
  inset: 10%;
  background: var(--rose);
  filter: blur(60px);
  opacity: 0.25;
  z-index: -1;
  border-radius: 50%;
}

.logo-item {
  position: absolute;
  z-index: 10; /* Lower than flower */
  pointer-events: none;
  will-change: transform, opacity;
}

.logo-bubble {
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 75, 145, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-shadow: 0 10px 450px rgba(0, 0, 0, 0.3);
}

.logo-bubble img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 900px) {
  .tech-hero { height: 700px; }
  .center-flower { width: 220px; height: 220px; }
  .logo-bubble { width: 65px; height: 65px; padding: 12px; }
}
</style>

