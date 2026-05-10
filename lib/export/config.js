const SITE_URL = 'https://renxuanqi.top';
const LOCAL_URL = 'http://localhost:3000';

const SELECTORS = {
  group: '.group',
  hoverText: '.group p',
  hoverTransform: '.group .z-20',
  hoverImg: '.group img',
  hoverGradient: '.group .from-black\\/95',
  roundedFull: '.rounded-full',
  section: 'section',
  firstSection: 'section:first-of-type',
  gridItems: '.grid > div',
  blurElements: '.blur-\\[120px\\], .animate-pulse, .bg-grid-pattern',
  mixBlendScreen: '.mix-blend-screen',
  navLinks: 'nav .hidden.md\\:flex, nav a[href="#contact"]',
  servicesCards: '#services .rounded-lg',
  worksCards: '#works .group',
  awardsCards: '#awards .group',
  researchCards: '#research .group',
  teamMembers: '#team .border',
  introText: 'p.max-w-3xl',
  footer: 'footer',
  allElements: '*',
};

const CSS_SNIPPETS = {
  printReset: `
    * {
      box-shadow: none !important;
      text-shadow: none !important;
      animation: none !important;
      transition: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  `,

  printBody: `
    body {
      background-color: black !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
  `,

  hideNavFooter: `
    nav { display: none !important; }
    footer { display: none !important; }
  `,

  hideBlurEffects: `
    .blur-\\[120px\\], .mix-blend-screen, .animate-pulse, .bg-grid-pattern {
      display: none !important;
    }
  `,

  avoidBreakInside: `
    .grid > div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    h2, h3 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
  `,

  fixMotionOpacity: `
    .mb-8, .rounded-full {
      opacity: 1 !important;
      transform: none !important;
      visibility: visible !important;
    }
  `,

  kill3DPerspective: `
    .h-full {
      transform: none !important;
      perspective: none !important;
    }
  `,

  gradientFix: `
    .from-black\\/95, .bg-gradient-to-br, .bg-gradient-to-t, .bg-gradient-to-b {
      background: none !important;
      background-color: rgba(0,0,0,0.8) !important;
    }
  `,

  sectionPageBreak: `
    section {
      page-break-before: always !important;
      break-before: page !important;
      page-break-inside: auto !important;
      break-inside: auto !important;
      min-height: 100vh !important;
      padding: 60px 40px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }
    section:first-of-type {
      page-break-before: avoid !important;
      break-before: auto !important;
    }
  `,

  worksCompact: `
    #works {
      padding: 20px 40px !important;
      max-height: 100vh !important;
      overflow: hidden !important;
    }
    #works h2 { margin-bottom: 20px !important; }
    #works .grid { gap: 12px !important; }
    #works .group {
      height: 270px !important;
      padding: 24px !important;
      justify-content: center !important;
    }
    #works .group h3 { font-size: 16px !important; margin-bottom: 6px !important; }
    #works .group p { font-size: 12px !important; line-height: 1.4 !important; margin-top: 6px !important; }
    #works .group .text-xs { font-size: 12px !important; margin-bottom: 6px !important; }
  `,
};

const DEFAULT_BROWSER_OPTIONS = {
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

const DEFAULT_GOTO_OPTIONS = {
  waitUntil: 'networkidle0',
  timeout: 60000,
};

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

module.exports = {
  SITE_URL,
  LOCAL_URL,
  SELECTORS,
  CSS_SNIPPETS,
  DEFAULT_BROWSER_OPTIONS,
  DEFAULT_GOTO_OPTIONS,
  DEFAULT_VIEWPORT,
};
