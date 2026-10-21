/**
 * On-Device Neuromorphic Brain Knowledge Matrix.
 * Embedded facts, semantic keywords, detailed responses, and actionable system directives.
 */

import type { NeuralFact } from "./types";

export const NEURAL_FACTS: NeuralFact[] = [
  // ================= IDENTITY & OVERVIEW =================
  {
    id: "identity-overview",
    category: "identity",
    keywords: [
      "elliot",
      "dickerson",
      "elliot dickerson",
      "about elliot",
      "profile",
      "bio",
      "identity",
      "developer",
      "engineer",
      "summary",
    ],
    summary:
      "Elliot Dickerson is a Senior Web Developer with 14+ years building resilient web platforms and edge systems.",
    detailed:
      "Elliot Dickerson is a Senior Web Developer with over 14 years of professional engineering experience. Based in Cheltenham, UK, he holds a BSc (Hons) in Computing and specializes in high-scale PHP/Laravel backends, modern TypeScript/SolidJS frontends, relational SQL optimization, and WCAG accessibility standards. Currently engineering mission-critical e-assessment platforms at RM Assessments.",
    directive: {
      type: "navigate",
      param: "/about",
      label: "View Full Profile",
    },
    quickFollowUps: [
      "Tell me about Elliot's current role",
      "What are his core technical skills?",
      "Show me featured projects",
    ],
  },
  {
    id: "ai-self-identity",
    category: "identity",
    keywords: [
      "who are you",
      "what are you",
      "ed-ai",
      "edai",
      "assistant",
      "brain",
      "bot",
      "model",
      "neuromorphic",
      "how do you work",
    ],
    summary:
      "ED-AI is an on-device neuromorphic cybernetic co-pilot running locally in your browser.",
    detailed:
      "I am ED-AI — the on-device neuromorphic digital consciousness of Elliot Dickerson. I operate 100% locally in your browser with zero server telemetry, sub-5ms semantic retrieval latency, direct DOM/shader telekinesis, and bidirectional synthesized vocal communication.",
    directive: {
      type: "briefing",
      label: "Tactical Audio Briefing",
    },
    quickFollowUps: [
      "What can you control on this site?",
      "What is Elliot's background?",
      "Switch theme to tactical dark",
    ],
  },
  {
    id: "ai-capabilities",
    category: "identity",
    keywords: [
      "what can you do",
      "what do you do",
      "capabilities",
      "features",
      "help",
      "what can i ask",
      "what are your capabilities",
      "what can you control",
      "abilities",
      "commands",
    ],
    summary:
      "ED-AI capabilities: career briefings, project architecture deep-dives, system telekinesis, and voice briefings.",
    detailed:
      "As ED-AI, I can assist you across several core capabilities:\n• Career Briefings: Elliot's 14+ years experience, RM Assessments e-assessment platform, PHP/Laravel, and SolidJS.\n• Project Deep-Dives: CyberRacer 3D pseudo-racer physics, Cyberdeck 4-stem DSP audio lab, and dev utilities.\n• System Telekinesis: Toggle dark/light theme, toggle eco mode, stream Matrix canvas rain, and navigate pages.\n• Audio Synthesis: Synthesize tactical voice briefings directly through the Web Audio API.\n• Tier 2 WebGPU: Engage on-device generative reasoning running locally in your browser VRAM.",
    directive: {
      type: "briefing",
      label: "Synthesize Audio Briefing",
    },
    quickFollowUps: [
      "Tell me about RM Assessments",
      "What are his core technical skills?",
      "Switch theme to tactical dark",
    ],
  },

  // ================= EXPERIENCE =================
  {
    id: "exp-rm-assessments",
    category: "experience",
    keywords: [
      "rm",
      "assessments",
      "rm assessments",
      "current job",
      "current role",
      "company",
      "ide",
      "exam",
      "student",
      "accessibility",
      "wcag",
      "employment",
    ],
    summary:
      "Senior Web Developer at RM Assessments building high-stakes digital exam systems.",
    detailed:
      "At RM Assessments (March 2025 – Present), Elliot delivers core feature solutions and bug fixes for large-scale online assessment software. He engineered an in-exam student code IDE, raised accessibility compliance to strict WCAG standards, and modernized testing practices and architecture across mission-critical systems.",
    directive: {
      type: "navigate",
      param: "/about#experience",
      label: "View Career History",
    },
    quickFollowUps: [
      "How does he handle WCAG accessibility?",
      "What backend frameworks does he use?",
      "Show the in-browser IDE",
    ],
  },
  {
    id: "exp-years-summary",
    category: "experience",
    keywords: [
      "years of experience",
      "experience",
      "senior",
      "career",
      "career history",
      "background",
      "history",
      "education",
      "degree",
      "university",
      "cheltenham",
    ],
    summary:
      "14+ years of professional full-stack development, BSc (Hons) Computing.",
    detailed:
      "Elliot brings 14+ years of hands-on production engineering. Over his career, he has architected high-throughput relational databases, high-availability microservices, distributed edge APIs, and enterprise CMS platforms. He holds a Bachelor of Science with Honours in Computing.",
    directive: {
      type: "navigate",
      param: "/about",
      label: "Inspect Profile Credentials",
    },
    quickFollowUps: [
      "What databases does he master?",
      "Tell me about his edge architecture",
      "Explore projects",
    ],
  },

  // ================= SKILLS & ARCHITECTURE =================
  {
    id: "skills-backend-sql",
    category: "skills",
    keywords: [
      "backend",
      "php",
      "laravel",
      "symfony",
      "sql",
      "mysql",
      "postgres",
      "postgresql",
      "redis",
      "database",
      "query",
      "api",
    ],
    summary:
      "PHP (Laravel, Symfony), SQL (MySQL, PostgreSQL indexing & schema design), Redis.",
    detailed:
      "Elliot specializes in resilient backend architectures: PHP (Laravel, Symfony, Yii), high-throughput SQL indexing and query optimization on MySQL & PostgreSQL, in-memory caching with Redis, message queuing, and serverless Cloudflare Workers with SQLite D1 databases.",
    directive: {
      type: "navigate",
      param: "/about#skills",
      label: "Review Technical Stack",
    },
    quickFollowUps: [
      "What frontend frameworks does he use?",
      "Tell me about Cloudflare D1 integration",
      "How does he build games in TS?",
    ],
  },
  {
    id: "skills-frontend-reactivity",
    category: "skills",
    keywords: [
      "frontend",
      "javascript",
      "typescript",
      "solidjs",
      "react",
      "astro",
      "vue",
      "svelte",
      "ui",
      "ux",
      "css",
      "html",
    ],
    summary:
      "Strict TypeScript, SolidJS fine-grained reactivity, Astro SSG, React, and Vue.",
    detailed:
      "Frontend engineering focus: strict TypeScript contracts, Astro island architecture for zero-JS baseline speed, SolidJS for microsecond fine-grained reactive updates without virtual DOM overhead, Web Audio API, WebGL2 shaders, and pixel-perfect responsive CSS design systems.",
    directive: {
      type: "navigate",
      param: "/experiments",
      label: "Explore Dev Tools Suite",
    },
    quickFollowUps: [
      "Why choose SolidJS over React?",
      "Show me the Web Audio synthesizers",
      "Benchmark edge latency",
    ],
  },
  {
    id: "skills-devops-cloud",
    category: "skills",
    keywords: [
      "devops",
      "cloud",
      "cloudflare",
      "docker",
      "git",
      "linux",
      "aws",
      "edge",
      "pipeline",
      "ci",
      "cd",
      "automation",
    ],
    summary:
      "Cloudflare Pages & Workers, Docker containerisation, Linux, and automated CI/CD.",
    detailed:
      "Elliot leverages containerized Docker development environments, automated Git workflows, serverless Cloudflare Pages & Functions edge distribution, and automated architecture gating (Fallow, Lighthouse CI, Vitest, Playwright). Every release passes a zero-coverage complexity ratchet.",
    directive: {
      type: "benchmark",
      label: "Run Edge Latency Probe",
    },
    quickFollowUps: [
      "Probe Cloudflare edge latency now",
      "What is the site quality gate?",
      "Tell me about CyberRacer",
    ],
  },

  // ================= PROJECTS =================
  {
    id: "proj-cyberracer",
    category: "projects",
    keywords: [
      "cyberracer",
      "cyber racer",
      "cyberracer physics",
      "racer",
      "racing",
      "trackmania",
      "physics",
      "arcade",
      "tracks",
      "leaderboard",
      "ghost",
    ],
    summary:
      "CYBERRACER 2088 — In-browser deterministic 60 FPS physics racing engine with AI ghost replays.",
    detailed:
      "CyberRacer is a Trackmania-inspired high-velocity racing engine built from scratch in TypeScript with zero third-party game frameworks. Features deterministic Euler numerical integration, lateral tire slip models, binary delta-compressed AI ghost replays, Cloudflare D1 cryptographic nonce leaderboards, and smartphone WebRTC gamepad pairing.",
    directive: {
      type: "racer",
      label: "Launch CyberRacer 2088",
    },
    quickFollowUps: [
      "Launch CyberRacer now",
      "Open the dual-screen telemetry cockpit",
      "How does smartphone gamepad pairing work?",
    ],
  },
  {
    id: "proj-cyberdeck",
    category: "projects",
    keywords: [
      "cyberdeck",
      "cyber deck",
      "cyberdeck audio",
      "audio",
      "music",
      "synthesizer",
      "synth",
      "dsp",
      "stems",
      "visualizer",
      "fft",
      "sound",
      "webaudio",
    ],
    summary:
      "CYBERDECK AUDIO — 4-stem real-time Web Audio DSP graph with 1024-bin WebGL2 FFT visualizer.",
    detailed:
      "Cyberdeck is an in-browser audio workstation. Routes 4 independent stems through biquad resonant filters, stereo panners, and master gain stages. Includes an interactive 8-key pentatonic oscillator jam pad, sample-accurate clock scheduling, and a GPU-accelerated WebGL2 fragment shader audio spectrum visualizer.",
    directive: {
      type: "audio",
      label: "Engage Cyberdeck Audio",
    },
    quickFollowUps: [
      "Start the audio synthesizer",
      "Tell me about Elliot's guitar playing",
      "Show me dev utilities",
    ],
  },
  {
    id: "proj-dev-suite",
    category: "projects",
    keywords: [
      "experiments",
      "tools",
      "utilities",
      "json",
      "regex",
      "colour",
      "base64",
      "benchmarks",
    ],
    summary:
      "Browser-Native Dev Tools — JSON formatter, regex evaluator, colour tool, and edge benchmark.",
    detailed:
      "A suite of browser-native developer utilities executing 100% client-side with zero telemetry. Features JSON syntax tree analysis, live regex matching with capture group inspection, multi-space colour conversions, and edge latency probes.",
    directive: {
      type: "navigate",
      param: "/experiments",
      label: "Open Dev Tools Suite",
    },
    quickFollowUps: [
      "Run Edge benchmark test",
      "Tell me about Cyberdeck synth",
    ],
  },

  // ================= MUSIC & DSP =================
  {
    id: "music-guitar-dsp",
    category: "music",
    keywords: [
      "guitar",
      "multi-instrumentalist",
      "song",
      "youtube",
      "creative",
      "instruments",
      "dsp",
      "audio engineering",
    ],
    summary:
      "Multi-instrumentalist focused on guitar composition and creative audio DSP.",
    detailed:
      "Beyond software engineering, Elliot is an avid multi-instrumentalist focused on the electric and acoustic guitar. He writes and produces original music, explores digital signal processing on the web, and shares performances on his YouTube channel (@toilled).",
    directive: {
      type: "navigate",
      param: "/interests#audio-lab",
      label: "Visit Music & Audio Lab",
    },
    quickFollowUps: [
      "Play a Cyberdeck synth patch",
      "Show me his YouTube channel",
      "What guitar styles does he play?",
    ],
  },

  // ================= SYSTEM DIRECTIVES (TELEKINESIS) =================
  {
    id: "sys-theme-dark",
    category: "system",
    keywords: ["dark", "dark mode", "stealth", "night", "black theme"],
    summary: "Switch interface to tactical dark mode.",
    detailed:
      "Initiating dark mode protocol. Switching document tokens to tactical obsidian palette.",
    directive: {
      type: "theme",
      param: "dark",
      label: "Engage Tactical Dark Mode",
    },
    quickFollowUps: [
      "Switch to light mode",
      "Toggle eco power mode",
      "Run matrix rain",
    ],
  },
  {
    id: "sys-theme-light",
    category: "system",
    keywords: [
      "light",
      "light mode",
      "day mode",
      "bright theme",
      "white theme",
    ],
    summary: "Switch interface to high-visibility light mode.",
    detailed:
      "Initiating high-visibility light mode protocol. Calibrating contrast for daylight conditions.",
    directive: {
      type: "theme",
      param: "light",
      label: "Engage High-Vis Light Mode",
    },
    quickFollowUps: ["Switch to dark mode", "Status briefing", "Launch racer"],
  },
  {
    id: "sys-eco-mode",
    category: "system",
    keywords: [
      "eco",
      "eco mode",
      "battery",
      "power saver",
      "energy",
      "save battery",
    ],
    summary: "Toggle eco power-conservation mode.",
    detailed:
      "Eco mode toggled. Throttles background particle loops, disables intensive canvas blurs, and maximizes battery longevity.",
    directive: {
      type: "eco",
      label: "Toggle Eco Power Mode",
    },
    quickFollowUps: [
      "Check edge latency",
      "Switch theme",
      "What are your skills?",
    ],
  },
  {
    id: "sys-matrix-rain",
    category: "system",
    keywords: [
      "matrix",
      "rain",
      "digital rain",
      "hack",
      "matrix code",
      "green rain",
    ],
    summary: "Trigger secret digital matrix rain simulation.",
    detailed:
      "Matrix protocol engaged. Streaming green phosphorescent digital rain through the terminal matrix.",
    directive: {
      type: "matrix",
      label: "Trigger Matrix Rain Simulation",
    },
    quickFollowUps: [
      "Launch CyberRacer",
      "Status briefing",
      "Tell me about Elliot",
    ],
  },
  {
    id: "sys-cockpit-telemetry",
    category: "system",
    keywords: [
      "cockpit",
      "telemetry",
      "gauges",
      "dashboard",
      "dual screen",
      "g-force",
    ],
    summary: "Open CyberRacer dual-screen telemetry cockpit.",
    detailed:
      "Connecting to telemetry bus. Dual-screen cockpit streams live G-force friction radar, tachometer shift lights, and tire slip traces.",
    directive: {
      type: "telemetry",
      label: "Open Telemetry Cockpit",
    },
    quickFollowUps: [
      "Launch CyberRacer",
      "Pair phone gamepad",
      "Run edge benchmark",
    ],
  },
];

export const SUGGESTED_QUERIES = [
  "Tell me about Elliot's role at RM Assessments",
  "What are his core backend & SQL skills?",
  "Launch CyberRacer arcade engine",
  "Play Cyberdeck audio synthesizer",
  "What is his engineering philosophy?",
  "Trigger tactical dark mode",
];
