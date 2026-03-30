# Jill Hernandez — Portfolio

Personal portfolio website for **Jill Hernandez**, full-stack developer. Built with [Astro](https://astro.build) and [Vue.js](https://vuejs.org), featuring particle animations and Lucide icons.

## Stack

| Technology | Role |
|---|---|
| [Astro 5](https://astro.build) | Main framework / SSG |
| [Vue 3](https://vuejs.org) | Interactive components (islands) |
| [anime.js](https://animejs.com) | Entrance animations |
| [astro-icon](https://github.com/natemoo-re/astro-icon) + Lucide | SVG icons |

## Structure

```
src/
├── components/
│   ├── Nav.astro                # Navigation bar
│   ├── HeroSection.astro        # Hero section with name and CTA
│   ├── AboutSection.astro       # About me
│   ├── ExperienceSection.astro  # Work history + featured case (Kapix)
│   ├── SkillsSection.astro      # Technical skills
│   ├── HelpSection.astro        # "How I can help you"
│   ├── EducationSection.astro   # Education
│   ├── ContactSection.astro     # Contact form
│   ├── Particles.vue            # Background particles (Vue island)
│   └── Animations.vue           # Scroll animations (Vue island)
├── data/
│   └── projects.js              # Portfolio content (edit here)
├── layouts/
│   └── Layout.astro             # Base layout
├── pages/
│   └── index.astro              # Main page
└── styles/
    └── global.css               # Global styles
```

## Commands

```bash
# Install dependencies
npm install

# Development server at localhost:4321
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

## Content

All portfolio content (experience, projects, metrics, skills) is centralized in **`src/data/projects.js`**. Editing that file is enough to update most sections without touching the components.
