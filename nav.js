(function () {
  /* ── Page sections for prev / next ── */
  const sections = {
    teachers: [
      { href: '/esl_foundations.html', title: 'ESL Foundations' },
      { href: '/esl_lesson_planning.html', title: 'Lesson Planning' },
      { href: '/esl_grammar_communication.html', title: 'Grammar & Communication' },
      { href: '/esl_speaking_listening.html', title: 'Speaking & Listening' },
      { href: '/esl_reading_writing.html', title: 'Reading & Writing' },
      { href: '/esl_cultural_competence.html', title: 'Cultural Competence' },
      { href: '/esl_ai_augmented_learning.html', title: 'AI-Augmented Learning' },
      { href: '/esl_resources_tools.html', title: 'Resources & Tools' }
    ],
    students: [
      { href: '/esl_pronunciation_basics.html', title: 'Pronunciation Basics' },
      { href: '/esl_rhythm_stress_patterns.html', title: 'Stress Patterns' },
      { href: '/esl_grammar_fundamentals.html', title: 'Grammar Fundamentals' },
      { href: '/esl_everyday_conversations.html', title: 'Everyday Conversations' },
      { href: '/esl_writing_skills.html', title: 'Writing Skills' },
      { href: '/esl_reading_comprehension.html', title: 'Reading Comprehension' }
    ],
    ai: [
      { href: '/esl_ai_menu.html', title: 'AI Course Menu' },
      { href: '/esl_ai_foundations.html', title: 'AI Foundations' },
      { href: '/esl_ai_conversation_mastery.html', title: 'Conversation Mastery' },
      { href: '/esl_ai_pronunciation_listening.html', title: 'Pronunciation & Listening' },
      { href: '/esl_ai_writing_mastery.html', title: 'Writing Mastery' },
      { href: '/esl_ai_advanced_study_strategies.html', title: 'Advanced Study Strategies' }
    ]
  };

  const path = window.location.pathname;

  /* ── Theme toggle ── */
  const saved = localStorage.getItem('esl-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('esl-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('esl-theme', 'dark');
    }
  }

  /* ── Top nav bar ── */
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/" class="nav-brand">ESL Hub</a>
      <button class="nav-toggle" aria-label="Menu">&#9776;</button>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="https://rays-home.netlify.app/">Ray's House of Fun</a>
        <a href="https://rays-home.netlify.app/contact">Contact</a>
        <button class="theme-btn" aria-label="Toggle theme">
          <span class="theme-icon-light">&#9790;</span>
          <span class="theme-icon-dark">&#9728;</span>
        </button>
      </div>
    </div>`;
  document.body.prepend(nav);

  nav.querySelector('.theme-btn').addEventListener('click', toggleTheme);
  nav.querySelector('.nav-toggle').addEventListener('click', function () {
    nav.querySelector('.nav-links').classList.toggle('open');
  });

  /* ── Prev / Next footer (skip index) ── */
  if (path === '/' || path === '/index.html') return;

  let currentSection = null;
  let currentIndex = -1;
  for (const [key, pages] of Object.entries(sections)) {
    const idx = pages.findIndex(p => p.href === path);
    if (idx !== -1) { currentSection = pages; currentIndex = idx; break; }
  }
  if (!currentSection) return;

  const prev = currentIndex > 0 ? currentSection[currentIndex - 1] : null;
  const next = currentIndex < currentSection.length - 1 ? currentSection[currentIndex + 1] : null;

  const footerNav = document.createElement('nav');
  footerNav.className = 'page-nav';
  footerNav.innerHTML = `
    ${prev ? `<a href="${prev.href}" class="page-nav-link prev"><span class="arrow">&larr;</span> <span>${prev.title}</span></a>` : '<span></span>'}
    <a href="/" class="page-nav-home">All Lessons</a>
    ${next ? `<a href="${next.href}" class="page-nav-link next"><span>${next.title}</span> <span class="arrow">&rarr;</span></a>` : '<span></span>'}`;

  const main = document.querySelector('main') || document.body;
  main.appendChild(footerNav);
})();
