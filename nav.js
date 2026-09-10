(function () {
  /* ── Theme toggle ── */
  const saved = localStorage.getItem('esl-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  /* ── Dark-mode contrast rescue ──────────────────────────────────────────
     Many lessons paint callout boxes with hard-coded LIGHT backgrounds (in
     per-file <style> rules or inline style="") but never set a text colour.
     In light mode that inherits dark text and reads fine; in dark mode the
     inherited text/strong/link colours flip light, giving light-on-light —
     effectively invisible. Rather than patch hundreds of ad-hoc classes, we
     detect every element that actually sits on a light surface and force a
     dark, readable text colour there — only while the dark theme is active.
     Headings, code, blockquotes and coloured chips carry their own dark
     backgrounds (or their own explicit colour), so they are left untouched:
     an element whose nearest surface is dark is skipped, which also protects
     coloured buttons nested inside a light box. */
  const DM_TEXT = '#1f2937';   /* slate-800  */
  const DM_LINK = '#1d4ed8';   /* blue-700   */
  const DM_SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NAV: 1, BUTTON: 1, INPUT: 1,
    TEXTAREA: 1, SELECT: 1, CODE: 1, PRE: 1, SVG: 1, IMG: 1, CANVAS: 1,
    H1: 1, H2: 1, H3: 1, H4: 1 };

  function dmLum(r, g, b) {
    const a = [r, g, b].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  /* 'light' | 'dark' | 'none' for an element's OWN painted background. */
  function dmSurface(el) {
    let cs;
    try { cs = getComputedStyle(el); } catch (e) { return 'none'; }
    const bc = cs.backgroundColor || '';
    let m = bc.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(',').map(parseFloat);
      const alpha = p.length > 3 ? p[3] : 1;
      if (alpha > 0.5) return dmLum(p[0], p[1], p[2]) > 0.6 ? 'light' : 'dark';
    }
    const bi = cs.backgroundImage || '';
    if (/gradient/.test(bi)) {
      const stops = [];
      const re = /rgba?\(([^)]+)\)/g; let g;
      while ((g = re.exec(bi))) {
        const p = g[1].split(',').map(parseFloat);
        if ((p.length > 3 ? p[3] : 1) > 0.3) stops.push(dmLum(p[0], p[1], p[2]));
      }
      if (stops.length) {
        const avg = stops.reduce(function (s, v) { return s + v; }, 0) / stops.length;
        return avg > 0.6 ? 'light' : 'dark';
      }
    }
    return 'none';
  }

  /* Kind of the nearest ancestor-or-self that actually paints a background;
     the page itself is dark, so default to 'dark'. */
  function dmNearestSurface(el) {
    let e = el;
    while (e && e !== document.body && e.nodeType === 1) {
      let k = e.__dmSurf;
      if (k === undefined) { k = dmSurface(e); e.__dmSurf = k; }
      if (k !== 'none') return k;
      e = e.parentElement;
    }
    return 'dark';
  }

  function dmApply() {
    const scopes = [document.querySelector('header'), document.querySelector('main')]
      .filter(Boolean);
    if (!scopes.length) scopes.push(document.body);
    scopes.forEach(function (scope) {
      const all = scope.querySelectorAll('*');
      for (let i = 0; i < all.length; i++) {
        const el = all[i];
        if (DM_SKIP_TAGS[el.tagName]) continue;
        if (el.closest('.site-nav, .site-footer, .page-nav')) continue;
        if (el.hasAttribute('data-dm-fix')) continue;
        if (dmNearestSurface(el) !== 'light') continue;
        el.setAttribute('data-dm-fix', '1');
        el.setAttribute('data-dm-prev', el.style.getPropertyValue('color'));
        el.style.setProperty('color', el.tagName === 'A' ? DM_LINK : DM_TEXT, 'important');
      }
    });
  }

  function dmRemove() {
    const fixed = document.querySelectorAll('[data-dm-fix]');
    for (let i = 0; i < fixed.length; i++) {
      const el = fixed[i];
      const prev = el.getAttribute('data-dm-prev') || '';
      el.style.removeProperty('color');
      if (prev) el.style.setProperty('color', prev);
      el.removeAttribute('data-dm-fix');
      el.removeAttribute('data-dm-prev');
      delete el.__dmSurf;
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('esl-theme', 'light');
      dmRemove();
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('esl-theme', 'dark');
      dmApply();
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

  /* If we loaded straight into dark mode, rescue contrast now. */
  if (document.documentElement.getAttribute('data-theme') === 'dark') dmApply();

  /* Prev/Next nav and site footer live as static HTML in each lesson
     (managed by add_footer_nav.py). Do not inject them here. */
})();
