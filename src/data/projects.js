/**
 * Portfolio content data — edit here, not in the components.
 *
 * status values: 'production' | 'development' | 'archived'
 */

export const featured = {
  id: 'kapix-multilingual',
  company: 'Kapix',
  location: 'Santa Ana, Costa Rica',
  role: 'Junior Full-Stack Developer',
  period: 'Apr 2024 – Present',
  status: 'production',

  // One-sentence problem statement
  problem:
    'Client platforms needed to run correctly in three languages simultaneously — English, Spanish, and Portuguese — across every browser and device, with zero content drift between locales.',

  // What you built (not how it works internally)
  solution:
    'Built and maintained Vue.js front-end components and PHP back-end services that power trilingual client web applications, contributing to code reviews and shipping features end-to-end.',

  // Numbers extracted from the CV — update when Jill has more
  metrics: [
    { value: '3',    label: 'Languages in production',   note: 'EN · ES · PT'            },
    { value: '12+',  label: 'Months shipping features',  note: 'Apr 2024 – present'       },
    { value: '100%', label: 'Browser compatibility',     note: 'Responsive across devices' },
    { value: '2',    label: 'Stack layers owned',        note: 'Frontend + backend'        },
  ],

  // User action → Jill's system → outcome
  flow: [
    'Client submits a content update in any language',
    'Vue.js component renders the change across all three locales',
    'PHP back-end validates and persists with the correct locale mapping',
    'End-user sees a consistent, accessible experience in their language',
  ],

  stack: ['Vue.js', 'JavaScript', 'PHP', 'Git', 'GitHub', 'Agile'],

  bullets: [
    'Designed dynamic front-end components using <strong>Vue.js</strong> and <strong>JavaScript</strong>',
    'Built modular back-end services in <strong>PHP</strong> with responsive design principles',
    'Contributed to code reviews and proposed small architectural improvements',
    'Managed trilingual content (EN/ES/PT) optimised for accessibility and UX',
    'Used <strong>Git + GitHub</strong> for source control in distributed team workflows',
  ],
};

export const timeline = [
  {
    period: 'Nov 2024 – Jan 2025',
    role: 'AI Trainer — Coder (Freelance)',
    org: 'Outlier',
    location: '',
    desc: 'Evaluated and refined LLM-generated code in Python, Java, and JavaScript. Assessed prompts for accuracy, clarity, and technical correctness across multiple languages.',
  },
  {
    period: 'Nov 2024 – Jan 2025',
    role: 'Technical Support Specialist',
    org: 'ModSquad',
    location: 'Escazú, Costa Rica',
    desc: 'Provided bilingual (EN/ES) technical support for a global client base. Diagnosed issues and contributed to the internal knowledge base.',
  },
  {
    period: 'Feb 2020 – Mar 2024',
    role: 'AdOps Services Associate L3',
    org: 'Amazon',
    location: 'Heredia, Costa Rica',
    desc: 'Operated and monitored advertising automation tools at scale. Resolved system errors in real time and supported internal stakeholders in aligning ad campaigns to KPIs.',
  },
];

export const helpCards = [
  {
    icon: 'globe',
    title: 'Global-ready apps',
    body: "If your product needs to run in English, Spanish, and Portuguese — I've managed exactly that complexity in production. I know the edge cases.",
  },
  {
    icon: 'link',
    title: 'Full-stack features',
    body: 'Need a feature from database to UI? I can build the Vue or React front end, the PHP or Node back end, and wire them together without silos.',
  },
  {
    icon: 'users',
    title: 'Cross-functional teams',
    body: 'Four years at Amazon taught me how to work with PMs, senior engineers, and stakeholders. I ask the right questions, not just the technical ones.',
  },
  {
    icon: 'sparkles',
    title: 'AI-adjacent work',
    body: "Hands-on experience evaluating LLM-generated code quality. If you're building AI tooling or code review pipelines, that background is ready to use.",
  },
];
