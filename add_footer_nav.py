#!/usr/bin/env python3
"""
add_footer_nav.py
-----------------
Apply the footer-nav fix to the ESL Hub course in one pass:

  1. LESSON HTMLs - insert/refresh a static <nav class="page-nav"> +
     <footer class="site-footer"> block on every lesson page, just before
     </main>. Idempotent via BEGIN/END sentinels. The lesson-specific
     custom <footer> inside <main> (per-lesson wrap-up content) is
     preserved.

     NOTE: ESL uses THREE independent prev/next chains (teachers,
     students, ai) - prev/next on each page wraps within its own section.
     The script's SECTIONS table is the source of truth.

  2. styles/main.css - append/refresh a sentinel-wrapped block adding
     base .site-footer + .footer-links styling (ESL had none), the
     .page-nav > span:empty placeholder rule (first/last in a section),
     and a small @media print rule that hides .site-footer. Uses ESL's
     --text / --link / --border tokens. Idempotent.

     NOTE: class is .page-nav (NOT .lesson-nav) to keep ESL's existing
     CSS rules in effect. The home button uses .page-nav-home, which
     already has its own outlined styling, so no "ghost" variant is
     added.

  3. nav.js - replace with a slim version that only handles theme
     persistence and top .site-nav injection (brand bar + theme button +
     mobile menu toggle). Prev/Next nav and site footer are no longer
     injected here (now static, see #1). Preserves the 'esl-theme'
     localStorage key, the light/dark icon spans inside .theme-btn, and
     the mobile .nav-toggle behavior. Wholesale replace; no-op if
     already at target.

Edge cases on #1:
  - First in section: prev side becomes <span></span>.
  - Last  in section: next link is omitted (replaced by <span></span>
                       to keep the home button centered).

Usage:
    python3 add_footer_nav.py                # dry run (default)
    python3 add_footer_nav.py --apply        # write changes (.bak backups)
    python3 add_footer_nav.py --apply --no-backup
    python3 add_footer_nav.py --dir .        # explicit project dir
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Section -> lesson order (from index.html .card-grid sections).
# Each section is an independent prev/next chain; prev/next wraps within
# the section only.
# ---------------------------------------------------------------------------
SECTIONS: list[tuple[str, list[tuple[str, str]]]] = [
    ("teachers", [
        ("esl_foundations.html",            "ESL Foundations"),
        ("esl_lesson_planning.html",        "Lesson Planning"),
        ("esl_grammar_communication.html",  "Grammar & Communication"),
        ("esl_speaking_listening.html",     "Speaking & Listening"),
        ("esl_reading_writing.html",        "Reading & Writing"),
        ("esl_cultural_competence.html",    "Cultural Competence"),
        ("esl_ai_augmented_learning.html",  "AI-Augmented Learning"),
        ("esl_resources_tools.html",        "Resources & Tools"),
    ]),
    ("students", [
        ("esl_pronunciation_basics.html",   "Pronunciation Basics"),
        ("esl_rhythm_stress_patterns.html", "Stress Patterns"),
        ("esl_grammar_fundamentals.html",   "Grammar Fundamentals"),
        ("esl_everyday_conversations.html", "Everyday Conversations"),
        ("esl_writing_skills.html",         "Writing Skills"),
        ("esl_reading_comprehension.html",  "Reading Comprehension"),
    ]),
    ("ai", [
        ("esl_ai_menu.html",                       "AI Course Menu"),
        ("esl_ai_foundations.html",                "AI Foundations"),
        ("esl_ai_conversation_mastery.html",       "Conversation Mastery"),
        ("esl_ai_pronunciation_listening.html",    "Pronunciation & Listening"),
        ("esl_ai_writing_mastery.html",            "Writing Mastery"),
        ("esl_ai_advanced_study_strategies.html",  "Advanced Study Strategies"),
    ]),
]

# ===========================================================================
# 1. LESSON HTML - footer-nav block
# ===========================================================================

BEGIN_HTML = "<!-- BEGIN footer-nav (managed by add_footer_nav.py) -->"
END_HTML   = "<!-- END footer-nav -->"

# Primary anchor: insert just before </main>. ESL's nav.js currently
# appends prev/next to <main>, so this matches the existing DOM position.
INSERT_BEFORE_MAIN_RE = re.compile(r'\s*</main>', re.IGNORECASE)
FALLBACK_BODY_RE      = re.compile(r'\s*</body>', re.IGNORECASE)

EXISTING_HTML_BLOCK_RE = re.compile(
    re.escape(BEGIN_HTML) + r".*?" + re.escape(END_HTML),
    flags=re.DOTALL,
)


def build_footer(prev_file, prev_title, next_file, next_title):
    if prev_file:
        prev_html = (
            f'    <a href="/{prev_file}" class="page-nav-link prev">'
            f'<span class="arrow">&larr;</span> <span>{prev_title}</span></a>'
        )
    else:
        prev_html = '    <span></span>'

    if next_file:
        next_html = (
            f'    <a href="/{next_file}" class="page-nav-link next">'
            f'<span>{next_title}</span> <span class="arrow">&rarr;</span></a>'
        )
    else:
        next_html = '    <span></span>'

    return (
        f"{BEGIN_HTML}\n"
        f'<nav class="page-nav" aria-label="Lesson Navigation">\n'
        f"{prev_html}\n"
        f'    <a href="/" class="page-nav-home">All Lessons</a>\n'
        f"{next_html}\n"
        f"</nav>\n"
        f"\n"
        f'<footer class="site-footer">\n'
        f"    <p>&copy; 2026 All rights reserved.</p>\n"
        f'    <div class="footer-links">\n'
        f'        <a href="https://rays-home.netlify.app/">Ray\'s House of Fun</a>\n'
        f'        <a href="https://rays-home.netlify.app/contact">Contact</a>\n'
        f'        <a href="#" onclick="window.print(); return false;">Print Page</a>\n'
        f"    </div>\n"
        f"</footer>\n"
        f"{END_HTML}"
    )


def inject_html(html, footer):
    """Insert/refresh the footer block on a lesson HTML.

    Returns (new_html, status) where status is one of:
      'refreshed' | 'added' | 'unchanged' | 'skipped:no-anchor'
    """
    # 1. Refresh existing sentinel-wrapped block in place.
    m = EXISTING_HTML_BLOCK_RE.search(html)
    if m:
        new = html[:m.start()] + footer + html[m.end():]
        return new, ("refreshed" if new != html else "unchanged")

    # 2. Insert just before </main>.
    m = INSERT_BEFORE_MAIN_RE.search(html)
    if m:
        new = html[:m.start()].rstrip() + "\n\n" + footer + "\n" + html[m.start():].lstrip("\n")
        return new, "added"

    # 3. Fallback: insert just before </body>.
    m = FALLBACK_BODY_RE.search(html)
    if m:
        new = html[:m.start()].rstrip() + "\n\n" + footer + "\n" + html[m.start():].lstrip("\n")
        return new, "added"

    return html, "skipped:no-anchor"


# ===========================================================================
# 2. styles/main.css - footer-nav rules (sentinel-wrapped block)
# ESL has NO .site-footer styling and no @media print rules. The block
# defines base .site-footer + .footer-links, the .page-nav > span:empty
# placeholder rule, and a small print rule hiding .site-footer.
# ===========================================================================

BEGIN_CSS = "/* BEGIN footer-nav-styles (managed by add_footer_nav.py) */"
END_CSS   = "/* END footer-nav-styles */"

CSS_BLOCK = BEGIN_CSS + """
/* Static lesson footer (inserted by add_footer_nav.py into each lesson HTML) */
.site-footer {
    text-align: center;
    padding: 1.5rem 1rem;
    font-size: .85rem;
    color: var(--text);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}
.site-footer a { color: var(--link); text-decoration: none; }
.site-footer a:hover { text-decoration: underline; }
.site-footer p { margin: .35rem 0; }

.footer-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: .5rem;
}

/* First/last in a section uses <span></span> as a placeholder; keep it inert */
.page-nav > span:empty { flex: 0 0 auto; }

@media print {
    .site-footer { display: none !important; }
}
""" + END_CSS

EXISTING_CSS_BLOCK_RE = re.compile(
    re.escape(BEGIN_CSS) + r".*?" + re.escape(END_CSS),
    flags=re.DOTALL,
)


def inject_css(css):
    """Insert/refresh the sentinel-wrapped CSS block."""
    m = EXISTING_CSS_BLOCK_RE.search(css)
    if m:
        new = css[:m.start()] + CSS_BLOCK + css[m.end():]
        return new, ("refreshed" if new != css else "unchanged")
    new = css.rstrip() + "\n\n" + CSS_BLOCK + "\n"
    return new, "added"


# ===========================================================================
# 3. nav.js - slim replacement (wholesale; idempotent via content-equality)
# Preserves: 'esl-theme' key, .site-nav markup, theme button with
# .theme-icon-light/.theme-icon-dark spans, mobile .nav-toggle behavior.
# Drops: sections data and the prev/next page-nav injection block.
# ===========================================================================

NAV_JS = """(function () {
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
"""


def inject_nav_js(current):
    if current == NAV_JS:
        return current, "unchanged"
    return NAV_JS, "replaced"


# ===========================================================================
# main
# ===========================================================================

def main() -> int:
    p = argparse.ArgumentParser(
        description="Apply the footer-nav fix to the ESL course (HTML + CSS + JS).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--apply", action="store_true",
                   help="Write changes (default: dry run only).")
    p.add_argument("--no-backup", action="store_true",
                   help="When applying, skip writing .bak files.")
    p.add_argument("--dir", default=".",
                   help="Project directory (default: current working dir).")
    args = p.parse_args()

    root = Path(args.dir).resolve()
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    mode = "APPLY (writing changes)" if args.apply else "DRY RUN (no writes)"
    print(f"Project root : {root}")
    print(f"Mode         : {mode}")
    if args.apply and not args.no_backup:
        print("Backups      : yes (.bak alongside each modified file)")
    print()

    def maybe_write(path: Path, original: str, new: str) -> None:
        if not args.apply or new == original:
            return
        if not args.no_backup:
            bak = path.with_suffix(path.suffix + ".bak")
            bak.write_text(original, encoding="utf-8")
        path.write_text(new, encoding="utf-8")

    total_pending = 0
    all_missing: list[str] = []
    total_lessons = sum(len(lessons) for _, lessons in SECTIONS)
    pending_html = 0

    # ---- 1. Lesson HTMLs (per section) ----
    print("== 1. Lesson HTML files ==")
    for section_name, lessons in SECTIONS:
        print(f"  [{section_name}]")
        total = len(lessons)
        for i, (fname, _title) in enumerate(lessons):
            path = root / fname
            if not path.is_file():
                all_missing.append(fname)
                print(f"    [missing  ] {fname}")
                continue

            prev = lessons[i - 1] if i > 0 else (None, None)
            nxt  = lessons[i + 1] if i < total - 1 else (None, None)
            footer = build_footer(prev[0], prev[1], nxt[0], nxt[1])

            original = path.read_text(encoding="utf-8")
            new_html, status = inject_html(original, footer)

            if status == "unchanged":
                print(f"    [ok       ] {fname}")
                continue
            print(f"    [{status:9}] {fname}")
            if new_html != original:
                pending_html += 1
                maybe_write(path, original, new_html)

    if all_missing:
        print(f"  Missing files: {len(all_missing)}  (check SECTIONS table)")
    print(f"  HTML changes : {pending_html} / {total_lessons}")
    total_pending += pending_html
    print()

    # ---- 2. styles/main.css ----
    print("== 2. styles/main.css ==")
    css_path = root / "styles" / "main.css"
    if not css_path.is_file():
        print(f"  [missing  ] {css_path}")
    else:
        original = css_path.read_text(encoding="utf-8")
        new_css, status = inject_css(original)
        if status == "unchanged":
            print(f"  [ok       ] {css_path.name}")
        else:
            print(f"  [{status:9}] {css_path.name}")
            if new_css != original:
                total_pending += 1
                maybe_write(css_path, original, new_css)
    print()

    # ---- 3. nav.js ----
    print("== 3. nav.js ==")
    js_path = root / "nav.js"
    if not js_path.is_file():
        print(f"  [missing  ] {js_path}")
    else:
        original = js_path.read_text(encoding="utf-8")
        new_js, status = inject_nav_js(original)
        if status == "unchanged":
            print(f"  [ok       ] {js_path.name}")
        else:
            print(f"  [{status:9}] {js_path.name}")
            if new_js != original:
                total_pending += 1
                maybe_write(js_path, original, new_js)
    print()

    print(f"Total files needing changes: {total_pending}")
    if not args.apply and total_pending:
        print("Re-run with --apply to write changes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
