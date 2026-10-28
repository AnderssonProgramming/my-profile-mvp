export const profile = {
  first: 'ANDERSSON',
  last: 'SÁNCHEZ',
  fullName: 'Andersson David Sánchez Méndez',
  role: 'Software Engineer · Athlete',
  location: 'Bogotá, Colombia',
  email: 'anderssondavidsanchez@gmail.com',
  github: 'https://github.com/AnderssonProgramming',
  linkedin: 'https://www.linkedin.com/in/anderssonsm',
  portfolio: 'https://anderssonprogramming.github.io',
  cv: 'Andersson_Sanchez_CV_ATS.pdf',
  values: ['Discipline', 'Dedication', 'Teamwork'],
  traits: ['Leadership', 'Passion', 'Communication'],
}

export const disciplines = [
  {
    id: 'gym',
    tag: '01 / STRENGTH',
    title: 'GYM',
    color: '#ff5a1f',
    stat: { value: 1, suffix: '%', label: 'better, every single day' },
    line: 'Progressive overload, applied to everything.',
    body: 'Same mindset as refactoring: show up, add a little weight, keep the form clean. Compounding beats intensity.',
    perks: ['Push · Pull · Legs', 'Form over ego', 'Track every set'],
  },
  {
    id: 'hyrox',
    tag: '02 / ENDURANCE',
    title: 'HYROX',
    color: '#ffd400',
    stat: { value: 8, suffix: 'km', label: 'run + 8 stations' },
    line: 'Fitness racing: where the gym meets the long run.',
    body: 'Eight kilometres split by eight brutal stations. Pacing, recovery and stubbornness — the same skills behind a long sprint to production.',
    perks: ['Long-distance runner', 'Hybrid training', 'Pace the race'],
  },
  {
    id: 'basketball',
    tag: '03 / TEAM',
    title: 'BASKETBALL',
    color: '#3d7bff',
    stat: { value: 5, suffix: 'v5', label: 'team-first, always' },
    line: 'Read the court. Make the extra pass.',
    body: 'Basketball taught me leadership and communication before any job did: call the play, trust the team, own the miss, take the next shot.',
    perks: ['Court vision', 'Leadership', 'Clutch under pressure'],
  },
]

export const hyroxStations = [
  { n: '01', name: 'SkiErg', dist: '1000 m', dev: 'Warm-up: read the codebase' },
  { n: '02', name: 'Sled Push', dist: '50 m', dev: 'Pushing to prod, carefully' },
  { n: '03', name: 'Sled Pull', dist: '50 m', dev: 'Pull requests, reviewed' },
  { n: '04', name: 'Burpee Broad Jumps', dist: '80 m', dev: 'Big leaps, small commits' },
  { n: '05', name: 'Rowing', dist: '1000 m', dev: 'Everyone rowing the same way' },
  { n: '06', name: 'Farmers Carry', dist: '200 m', dev: 'Carrying the legacy code' },
  { n: '07', name: 'Sandbag Lunges', dist: '100 m', dev: 'Heavy tests, steady steps' },
  { n: '08', name: 'Wall Balls', dist: '100 reps', dev: 'Ship it. Then ship it again.' },
]

export const stats = [
  { value: 45, prefix: 'TOP ', suffix: '', label: 'NASA Space Apps 2025 · out of 18,000+ teams worldwide' },
  { value: 4, prefix: '', suffix: '', label: 'Teaching & research roles at Escuela Colombiana de Ingeniería' },
  { value: 85, prefix: '', suffix: '+', label: 'Languages, frameworks and tools in the stack' },
  { value: 1, prefix: '', suffix: '', label: 'Paper & poster presented at WEEF 2026, Cartagena' },
]

export const experience = [
  {
    when: 'Jul 2026 — now',
    title: 'Custom Software Engineering Associate',
    org: 'Accenture Colombia · BBVA Project',
    body: 'QA for BPM business processes with CAP and Bonita across Community and Enterprise environments. I design and execute test cases across the full transactional flow.',
    badge: 'CURRENT',
  },
  {
    when: 'Oct 2026 — now',
    title: 'Research Assistant · Software Engineering',
    org: 'Escuela Colombiana de Ingeniería Julio Garavito',
    body: 'Literature review, experiments and documented findings in software engineering, feeding evidence-based practice into Data Models (MYSD) and OOP (DOPO).',
    badge: 'CURRENT',
  },
  {
    when: 'Sep — Oct 2025',
    title: 'NASA Space Apps Challenge · Global Finalist',
    org: 'Team ECI Centauri',
    body: 'Top 45 of 18,000+ teams. React + Three.js 3D exoplanet UI, FastAPI serving a CNN trained on Kepler & TESS data, Azure CI/CD for the judges.',
    badge: 'MILESTONE',
  },
  {
    when: 'Feb 2025 — Sep 2026',
    title: 'Academic Monitor · Teaching Assistant',
    org: 'Databases · OOP · Software Engineering Fundamentals',
    body: 'Three terms coaching students in relational modelling, SQL, Java, SOLID and clean architecture, and defining the tooling used in course projects.',
    badge: '3 TERMS',
  },
  {
    when: 'Jan 2025 — now',
    title: 'ACOFI University Committee Member',
    org: 'Asociación Colombiana de Facultades de Ingeniería',
    body: "Contributing to engineering-education initiatives in Colombia's engineering faculty association.",
    badge: 'ACTIVE',
  },
]

export const projects = [
  {
    title: 'ECI-Centauri',
    kicker: 'NASA Space Apps · Global Finalist',
    body: 'AI exoplanet detection: 3D planets, interactive light curves, Claude chatbot and a CNN trained on Kepler & TESS.',
    tags: ['React', 'Three.js', 'FastAPI', 'TensorFlow'],
    url: 'https://github.com/JAPV-X2612/ECI-Centauri-Frontend',
    play: 'BUZZER BEATER',
  },
  {
    title: 'Agentic Security Auditor',
    kicker: 'Multi-agent · LangGraph + Claude',
    body: 'Scans with npm audit, Trivy, Semgrep and Gitleaks, triages by CVSS, auto-patches, re-validates and gates the deploy in CI.',
    tags: ['Python', 'LangGraph', 'Claude', 'CI'],
    url: 'https://github.com/AnderssonProgramming/agentic-security-auditor',
    play: 'FULL-COURT PRESS',
  },
  {
    title: 'Macenplast Voice Picking',
    kicker: 'Real warehouse · PWA',
    body: 'Spoken Spanish pick instructions over Bluetooth, barcode confirmation with Poka-Yoke blocking, and offline support.',
    tags: ['FastAPI', 'PostgreSQL', 'React', 'ElevenLabs'],
    url: 'https://github.com/AnderssonProgramming/macenplast-voice-picking',
    play: 'PICK & ROLL',
  },
  {
    title: 'Compass',
    kicker: 'Agentic onboarding assistant',
    body: 'A chat for junior devs that runs on Claude or local Ollama, built under an AI harness where the agent works to a written contract.',
    tags: ['React', 'TypeScript', 'Claude API', 'Ollama'],
    url: 'https://github.com/AnderssonProgramming/agentic-harness',
    play: 'COURT VISION',
  },
  {
    title: 'Secure TwitterLite',
    kicker: 'Monolith → Serverless',
    body: 'An architectural evolution from a Spring Boot monolith to a serverless AWS Lambda ecosystem secured with Auth0.',
    tags: ['Spring Boot', 'AWS Lambda', 'Auth0'],
    url: 'https://github.com/AnderssonProgramming/secure-twitter-like-microservice-auth0',
    play: 'FAST BREAK',
  },
  {
    title: 'Enterprise RAG',
    kicker: 'LangChain · Pinecone',
    body: 'A modular LangChain pipeline with HuggingFace local embeddings and Pinecone vector storage.',
    tags: ['LangChain', 'OpenAI', 'Pinecone'],
    url: 'https://github.com/AnderssonProgramming/rag-langchain-openai-pinecone',
    play: 'ALLEY-OOP',
  },
]

export const stack = [
  'TypeScript', 'React', 'Next.js', 'Three.js', 'Java', 'Spring', 'Python', 'FastAPI', 'Kotlin',
  'NestJS', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Azure', 'TensorFlow', 'Claude',
  'LangGraph', 'D3.js', 'Angular', 'Supabase', 'GitHub Actions', 'Vercel',
]

export const offCourt = ['Motorcycle rider 🏍️', 'Dance lover 🕺', 'Long-distance runner 🏃', 'Gym enthusiast 💪', 'Basketball player 🏀', 'HYROX athlete ⚡']
