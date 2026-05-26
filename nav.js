(function () {
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

  /* Prev/Next nav and site footer live as static HTML in each lesson
     (managed by add_footer_nav.py). Do not inject them here. */
})();
