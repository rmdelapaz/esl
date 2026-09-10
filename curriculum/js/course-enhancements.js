/**
 * Course Enhancement JavaScript
 * Interactive features, progress tracking, theme toggle, Mermaid dark mode
 */

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();        // must run first — sets data-theme
    // initProgressIndicator();
    initSmoothScrolling();
    initCodeCopyButtons();
    initInteractiveTOC();
    initSearchFunctionality();
    initKeyboardShortcuts();
    // initLessonProgress();
    initQuizInteractivity();
    initSpeech();             // 🔊 text-to-speech "Listen" buttons (Web Speech API)
    initJournal();            // 📓 autosaved in-page learning journal
    initMobileMenu();
    initAccessibilityFeatures();
    initPrintStyles();
    initAnalytics();
});

/* ===========================
   Theme Toggle (Light / Dark)
   =========================== */

function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');

    // Determine initial theme
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');

    applyTheme(theme);

    if (toggle) {
        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // Update all toggle buttons (in case there are multiple)
    document.querySelectorAll('#theme-toggle').forEach(btn => {
        btn.textContent = theme === 'light' ? '🌙' : '☀️';
        btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });

    // Re-initialize Mermaid if available
    reinitMermaid(theme);
}

function reinitMermaid(theme) {
    const mermaid = window.__mermaid;
    if (!mermaid) return;

    const isDark = theme === 'dark';
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark
            ? { primaryColor: '#334155', primaryTextColor: '#e2e8f0', primaryBorderColor: '#6366f1', lineColor: '#94a3b8', secondaryColor: '#1e293b', tertiaryColor: '#0f172a' }
            : { primaryColor: '#eff6ff', primaryTextColor: '#1e293b', primaryBorderColor: '#3b82f6', lineColor: '#64748b', secondaryColor: '#f8fafc', tertiaryColor: '#f1f5f9' }
    });

    // Re-render all diagrams
    document.querySelectorAll('.mermaid').forEach(el => {
        // Preserve the original source. A raw <br> in the authored markup is parsed into a
        // <br> DOM element, which el.textContent silently drops — collapsing multi-line
        // labels onto one line. Convert those elements back to the literal string "<br/>"
        // (which Mermaid renders as a line break) before capturing, so raw <br> just works.
        if (!el.dataset.src) {
            const tmp = el.cloneNode(true);
            tmp.querySelectorAll('br').forEach(br => br.replaceWith('<br/>'));
            el.dataset.src = tmp.textContent.trim();
        }
        el.removeAttribute('data-processed');
        el.innerHTML = el.dataset.src;
    });

    try { mermaid.run(); } catch (_) { /* diagram may not exist on this page */ }
}

/*
function initProgressIndicator() {
    const bar = document.querySelector('.progress-indicator .progress-bar');
    if (!bar) return;

    const update = () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (docH <= 0) return;
        bar.style.width = Math.min((window.scrollY / docH) * 100, 100) + '%';
    };

    window.addEventListener('scroll', throttle(update, 50));
    update();
}
*/

/* ===========================
   Smooth Scrolling
   =========================== */

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 80;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
            history.pushState(null, null, this.getAttribute('href'));
        });
    });
}

/* ===========================
   Code Copy Buttons enhancement
   =========================== */

function initCodeCopyButtons() {
    document.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const orig = this.textContent;
            this.textContent = 'Copied!';
            this.classList.add('copied');
            setTimeout(() => { this.textContent = orig; this.classList.remove('copied'); }, 2000);
        });
    });
}

/* ===========================
   Interactive Table of Contents
   =========================== */

function initInteractiveTOC() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.toc-link[href="#${id}"]`);
            if (link) {
                tocLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    // Observe sections that TOC links point to
    tocLinks.forEach(link => {
        const id = link.getAttribute('href')?.slice(1);
        const section = id && document.getElementById(id);
        if (section) observer.observe(section);
    });
}

/* ===========================
   Search
   =========================== */

function initSearchFunctionality() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    const index = [];
    document.querySelectorAll('h1, h2, h3, p, li').forEach((el, i) => {
        index.push({ id: i, text: el.textContent.toLowerCase(), element: el, type: el.tagName.toLowerCase() });
    });

    input.addEventListener('input', debounce(e => {
        const q = e.target.value.toLowerCase().trim();
        if (q.length < 2) { results.style.display = 'none'; return; }

        const hits = index.filter(item => item.text.includes(q)).slice(0, 10);
        if (!hits.length) {
            results.innerHTML = '<div style="padding:0.75rem 1rem;color:var(--text-light);">No results found</div>';
            results.style.display = 'block';
            return;
        }

        results.innerHTML = hits.map(h => {
            const idx = h.text.indexOf(q);
            const start = Math.max(0, idx - 30);
            const end = Math.min(h.text.length, idx + q.length + 30);
            let excerpt = (start > 0 ? '…' : '') + h.text.substring(start, end) + (end < h.text.length ? '…' : '');
            excerpt = excerpt.replace(new RegExp(q, 'gi'), '<mark>$&</mark>');
            return `<div class="search-result-item" data-idx="${h.id}"><small style="color:var(--text-light);">${h.type}</small> ${excerpt}</div>`;
        }).join('');
        results.style.display = 'block';

        results.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const el = index[item.dataset.idx].element;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight');
                setTimeout(() => el.classList.remove('highlight'), 2000);
                input.value = '';
                results.style.display = 'none';
            });
        });
    }, 200));

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !results.contains(e.target)) results.style.display = 'none';
    });
}

/* ===========================
   Keyboard Shortcuts
   =========================== */

function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case '/': {
                const s = document.getElementById('search-input');
                if (s) { e.preventDefault(); s.focus(); }
                break;
            }
            case 'Escape': {
                const r = document.getElementById('search-results');
                if (r) r.style.display = 'none';
                document.getElementById('search-input')?.blur();
                document.querySelector('.shortcuts-modal')?.remove();
                break;
            }
            case 'ArrowLeft': {
                const prev = document.querySelector('.prev-lesson');
                if (prev) window.location.href = prev.href;
                break;
            }
            case 'ArrowRight': {
                const next = document.querySelector('.next-lesson');
                if (next) window.location.href = next.href;
                break;
            }
            case 'h': window.location.href = 'index.html'; break;
            case '?': showShortcutsModal(); break;
        }
    });
}

function showShortcutsModal() {
    if (document.querySelector('.shortcuts-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-content">
            <h3>Keyboard Shortcuts</h3>
            <button class="close-modal">&times;</button>
            <dl>
                <dt>/</dt><dd>Focus search</dd>
                <dt>ESC</dt><dd>Close search/modal</dd>
                <dt>←</dt><dd>Previous lesson</dd>
                <dt>→</dt><dd>Next lesson</dd>
                <dt>H</dt><dd>Go to home</dd>
                <dt>?</dt><dd>Show this help</dd>
            </dl>
        </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ===========================
   Lesson Progress
   =========================== */

/*
function initLessonProgress() {
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const progress = JSON.parse(localStorage.getItem('lessonProgress') || '{}');

    progress[page] = { visited: true, lastVisited: new Date().toISOString(), scrollPosition: 0 };
    localStorage.setItem('lessonProgress', JSON.stringify(progress));

    // Save scroll on leave
    window.addEventListener('beforeunload', () => {
        progress[page].scrollPosition = window.scrollY;
        localStorage.setItem('lessonProgress', JSON.stringify(progress));
    });

    // Restore scroll
    const saved = progress[page]?.scrollPosition;
    if (saved > 0) setTimeout(() => window.scrollTo(0, saved), 100);
}
*/

/* ===========================
   Quiz
   =========================== */

function initQuizInteractivity() {
    document.querySelectorAll('.quiz-question').forEach(q => {
        const options = q.querySelectorAll('.quiz-option');
        const feedback = q.querySelector('.quiz-feedback');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected', 'correct', 'incorrect'));
                opt.classList.add('selected');
                const ok = opt.dataset.correct === 'true';
                opt.classList.add(ok ? 'correct' : 'incorrect');
                if (feedback) {
                    feedback.textContent = ok ? ('Correct! ' + (opt.dataset.explanation || '')) : ('Try again. ' + (opt.dataset.hint || ''));
                    feedback.className = 'quiz-feedback ' + (ok ? 'correct' : 'incorrect');
                }
            });
        });
    });
}

/* ===========================
   Mobile Menu
   =========================== */

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-toggle');
    const nav = document.querySelector('.nav-links');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        const open = nav.classList.toggle('active');
        btn.setAttribute('aria-expanded', open);
        btn.textContent = open ? '✕' : '☰';
    });

    document.addEventListener('click', e => {
        if (!btn.contains(e.target) && !nav.contains(e.target)) {
            nav.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
            btn.textContent = '☰';
        }
    });
}

/* ===========================
   Accessibility
   =========================== */

function initAccessibilityFeatures() {
    const skip = document.querySelector('.skip-to-main');
    if (skip) {
        skip.addEventListener('click', e => {
            e.preventDefault();
            const main = document.getElementById('main-content');
            if (main) { main.tabIndex = -1; main.focus(); }
        });
    }

    // Keyboard vs mouse focus ring
    document.addEventListener('keydown', e => { if (e.key === 'Tab') document.body.classList.add('keyboard-nav'); });
    document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-nav'));
}

/* ===========================
   Print
   =========================== */

function initPrintStyles() {
    document.getElementById('print-button')?.addEventListener('click', e => { e.preventDefault(); window.print(); });
    window.addEventListener('beforeprint', () => {
        document.querySelectorAll('details').forEach(d => d.setAttribute('open', 'true'));
    });
}

/* ===========================
   Analytics (local only)
   =========================== */

function initAnalytics() {
    let a = JSON.parse(localStorage.getItem('courseAnalytics') || '[]');
    a.push({ page: location.pathname, ts: new Date().toISOString() });
    if (a.length > 100) a = a.slice(-100);
    localStorage.setItem('courseAnalytics', JSON.stringify(a));
}

/* ===========================
   Text-to-Speech ("Listen" buttons)
   ---------------------------
   Progressive enhancement via the Web Speech API — no audio files, no
   backend, works offline. If the browser has no speechSynthesis, nothing
   is added and the page is unchanged.

   Speakable content is discovered automatically so it works on every
   lesson without editing lesson bodies:
     • [data-say="text"]  — explicit convention for authored content
     • .phrase            — phrase-bank chips
     • .wordlist > li     — vocabulary items
     • table cells with .pron — the alphabet / pronunciation tables
     • .dialogue .line    — per-line + a "Play conversation" control
   =========================== */

function initSpeech() {
    const synth = window.speechSynthesis;
    if (!synth) return;                 // graceful: unsupported → no buttons

    const LANG = 'en-US';
    const RATE_KEY = 'eslTTSRate', VOICE_KEY = 'eslTTSVoice';
    let voice = null;
    let rate = 0.9;                     // a touch slow for beginners (default)
    try { const r = parseFloat(localStorage.getItem(RATE_KEY)); if (r >= 0.5 && r <= 1.25) rate = r; } catch (_) {}
    let refreshVoiceUI = function () {};

    function englishVoices() {
        return synth.getVoices().filter(v => /^en/i.test(v.lang));
    }

    function pickVoice() {
        const voices = synth.getVoices();
        let saved = null;
        try { saved = localStorage.getItem(VOICE_KEY); } catch (_) {}
        voice = (saved && voices.find(v => v.voiceURI === saved))
             || voices.find(v => /en[-_]US/i.test(v.lang))
             || voices.find(v => /^en/i.test(v.lang))
             || null;
    }
    pickVoice();
    // Voices often load asynchronously; re-pick and refresh the picker when they arrive.
    if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', () => { pickVoice(); refreshVoiceUI(); });

    // Some browsers (notably Linux Chromium with no speech engine) expose
    // speechSynthesis but have no voices, so speak() fails silently. Tell the
    // learner once instead of leaving them clicking a dead button.
    let audioNotified = false;
    function notifyNoAudio() {
        if (audioNotified) return;
        audioNotified = true;
        const bar = document.createElement('div');
        bar.className = 'audio-unavailable';
        bar.innerHTML = '🔇 <strong>Audio isn\'t available in this browser.</strong> ' +
            'The Listen buttons use your device\'s built-in voices, and none were found here. ' +
            'They work on most phones and on Windows, macOS &amp; Chromebooks. ' +
            '<button type="button" class="audio-dismiss" aria-label="Dismiss">&times;</button>';
        document.body.appendChild(bar);
        bar.querySelector('.audio-dismiss').addEventListener('click', () => bar.remove());
    }

    function utter(text) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG;
        u.rate = rate;
        if (voice) u.voice = voice;
        u.onerror = e => { if (e && /unavailable|failed/.test(e.error || '')) notifyNoAudio(); };
        return u;
    }

    function speak(text, btn) {
        if (!text) return;
        // Only cancel if something is actually playing — an unconditional
        // cancel() right before speak() drops the utterance on some browsers.
        try { if (synth.speaking || synth.pending) synth.cancel(); } catch (_) {}
        const u = utter(text);
        let started = false;
        u.onstart = () => { started = true; if (btn) btn.classList.add('speaking'); };
        u.onend = () => { if (btn) btn.classList.remove('speaking'); };
        const prevErr = u.onerror;
        u.onerror = e => { if (btn) btn.classList.remove('speaking'); prevErr(e); };
        synth.speak(u);
        // Nothing started and no voices exist → almost certainly unavailable.
        setTimeout(() => {
            if (!started && !synth.speaking && !synth.getVoices().length) notifyNoAudio();
        }, 1200);
    }

    function speakSequence(texts) {
        try { if (synth.speaking || synth.pending) synth.cancel(); } catch (_) {}
        texts.filter(Boolean).forEach(t => synth.speak(utter(t))); // queued back-to-back
    }

    // Text of an element with IPA / speaker labels / existing buttons stripped.
    function cleanText(el) {
        const clone = el.cloneNode(true);
        clone.querySelectorAll('.pron, .speaker, .say-btn, .speak-toolbar').forEach(n => n.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }

    function makeBtn(text, label, extraClass) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'say-btn' + (extraClass ? ' ' + extraClass : '');
        b.textContent = '🔊';
        b.setAttribute('aria-label', label || ('Listen: ' + text));
        b.title = 'Listen';
        b.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            speak(text, b);
        });
        return b;
    }

    function attach(el, text) {
        if (!text) return;
        el.appendChild(document.createTextNode(' '));
        el.appendChild(makeBtn(text));
    }

    // 1) Explicit convention for authored content.
    document.querySelectorAll('[data-say]').forEach(el => attach(el, el.getAttribute('data-say')));

    // 2) Phrase-bank chips.
    document.querySelectorAll('.phrase').forEach(el => attach(el, cleanText(el)));

    // 3) Vocabulary word lists.
    document.querySelectorAll('.wordlist > li').forEach(el => attach(el, cleanText(el)));

    // 4) Pronunciation / alphabet tables: any cell carrying IPA.
    //    Skip cells with an explicit data-say (handled above) — that lets a
    //    cell display a human spelling ("ay") but speak the real letter ("A"),
    //    since TTS mis-reads ad-hoc spellings (e.g. "ef" -> "E F", "ay" -> "eye").
    document.querySelectorAll('td').forEach(td => {
        if (td.querySelector('.pron') && !td.hasAttribute('data-say')) attach(td, cleanText(td));
    });

    // 5) Dialogues: per line + a "Play conversation" control.
    document.querySelectorAll('.dialogue').forEach(box => {
        const lines = Array.from(box.querySelectorAll('.line'));
        if (!lines.length) return;
        lines.forEach(line => attach(line, cleanText(line)));

        const bar = document.createElement('div');
        bar.className = 'speak-toolbar';
        const play = makeBtn('', 'Play the whole conversation', 'say-all');
        play.textContent = '▶ Play conversation';
        play.addEventListener('click', e => {
            e.preventDefault();
            speakSequence(lines.map(cleanText));
        });
        bar.appendChild(play);
        box.insertBefore(bar, box.firstChild);
    });

    buildSettingsUI();

    /* Collapsible "🎧 Audio" control: voice picker + speed slider,
       both remembered per device and applied to every Listen button. */
    function buildSettingsUI() {
        const panel = document.createElement('div');
        panel.className = 'tts-settings';
        panel.innerHTML =
            '<button type="button" class="tts-toggle" aria-expanded="false" aria-controls="tts-panel" title="Listening settings">🎧 Audio <span class="tts-caret" aria-hidden="true">▸</span></button>' +
            '<div class="tts-panel" id="tts-panel" hidden>' +
                '<div class="tts-row"><label for="tts-voice">Voice</label>' +
                    '<select id="tts-voice"></select></div>' +
                '<div class="tts-row"><label for="tts-rate">Speed <span class="tts-rate-val"></span></label>' +
                    '<input type="range" id="tts-rate" min="0.5" max="1.25" step="0.05"></div>' +
                '<button type="button" class="tts-test say-btn say-all">▶ Test voice</button>' +
            '</div>';
        document.body.appendChild(panel);

        const toggle = panel.querySelector('.tts-toggle');
        const body = panel.querySelector('.tts-panel');
        const sel = panel.querySelector('#tts-voice');
        const range = panel.querySelector('#tts-rate');
        const rateVal = panel.querySelector('.tts-rate-val');

        toggle.addEventListener('click', () => {
            const willOpen = body.hidden;
            body.hidden = !willOpen;
            toggle.setAttribute('aria-expanded', String(willOpen));
            const caret = toggle.querySelector('.tts-caret');
            if (caret) caret.textContent = willOpen ? '▾' : '▸';
        });

        function populate() {
            const eng = englishVoices();
            const list = eng.length ? eng : synth.getVoices();
            sel.innerHTML = '';
            if (!list.length) {
                const o = document.createElement('option');
                o.textContent = 'No voices found on this device';
                o.disabled = o.selected = true;
                sel.appendChild(o);
                sel.disabled = true;
                return;
            }
            sel.disabled = false;
            list.forEach(v => {
                const o = document.createElement('option');
                o.value = v.voiceURI;
                o.textContent = v.name + ' — ' + v.lang;
                if (voice && v.voiceURI === voice.voiceURI) o.selected = true;
                sel.appendChild(o);
            });
        }
        populate();
        refreshVoiceUI = populate;   // called when voices load asynchronously

        sel.addEventListener('change', () => {
            const chosen = synth.getVoices().find(v => v.voiceURI === sel.value);
            if (chosen) { voice = chosen; try { localStorage.setItem(VOICE_KEY, chosen.voiceURI); } catch (_) {} }
        });

        range.value = rate;
        rateVal.textContent = rate.toFixed(2) + '×';
        range.addEventListener('input', () => {
            rate = parseFloat(range.value);
            rateVal.textContent = rate.toFixed(2) + '×';
            try { localStorage.setItem(RATE_KEY, String(rate)); } catch (_) {}
        });

        panel.querySelector('.tts-test').addEventListener('click',
            () => speak('The quick brown fox jumps over the lazy dog.'));
    }
}

/* ===========================
   Learning Journal (in-page, autosaved)
   ---------------------------
   Turns the static "start a journal" prompt into a real, autosaving text
   area kept in localStorage per lesson, plus a one-click Markdown export
   of every entry across the course. Per-device only; never leaves the
   browser.
   =========================== */

function initJournal() {
    const section = document.getElementById('journal');
    if (!section) return;
    const host = section.querySelector('.card') || section;

    const page = (location.pathname.split('/').pop() || 'index').replace('.html', '');
    const key = 'eslJournal:' + page;

    const fmt = ts => { try { return new Date(ts).toLocaleString(); } catch (_) { return ''; } };

    const wrap = document.createElement('div');
    wrap.className = 'journal-editor';
    wrap.innerHTML = `
        <label class="journal-label" for="journal-text">✍️ Your journal entry <span class="journal-note">(saved on this device)</span></label>
        <textarea id="journal-text" class="journal-textarea" rows="7"
            placeholder="Write your thoughts here… Key concepts · what clicked · questions to revisit · ideas to try · how you feel about your progress."></textarea>
        <div class="journal-meta">
            <span class="journal-status" aria-live="polite"></span>
            <button type="button" class="journal-export">⬇ Export all my entries</button>
        </div>`;
    host.appendChild(wrap);

    const ta = wrap.querySelector('.journal-textarea');
    const status = wrap.querySelector('.journal-status');

    // Restore
    try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && saved.text) {
            ta.value = saved.text;
            status.textContent = 'Last saved ' + fmt(saved.ts);
        }
    } catch (_) { /* storage blocked / corrupt — start blank */ }

    const save = debounce(() => {
        try {
            localStorage.setItem(key, JSON.stringify({ text: ta.value, ts: Date.now() }));
            status.textContent = 'Saved ✓ ' + fmt(Date.now());
        } catch (_) {
            status.textContent = '⚠️ Could not save (browser storage is blocked).';
        }
    }, 500);

    ta.addEventListener('input', () => { status.textContent = 'Saving…'; save(); });

    wrap.querySelector('.journal-export').addEventListener('click', exportJournal);
}

function exportJournal() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || k.indexOf('eslJournal:') !== 0) continue;
        try {
            const v = JSON.parse(localStorage.getItem(k));
            if (v && v.text && v.text.trim()) entries.push({ page: k.slice('eslJournal:'.length), text: v.text, ts: v.ts });
        } catch (_) { /* skip unreadable entry */ }
    }
    entries.sort((a, b) => a.page.localeCompare(b.page));

    const md = entries.length
        ? '# My English Learning Journal\n\n' + entries.map(e =>
            `## ${e.page}\n_saved ${new Date(e.ts).toLocaleString()}_\n\n${e.text}\n`).join('\n---\n\n')
        : 'No journal entries saved yet.';

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-english-journal.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ===========================
   Utilities
   =========================== */

function debounce(fn, ms) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

function throttle(fn, ms) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
}

// Expose for other scripts
window.courseEnhancements = { debounce, throttle, applyTheme, reinitMermaid };
