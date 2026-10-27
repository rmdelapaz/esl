/* read-aloud.js — the ESL "Read Aloud" page (/read-aloud.html).

   Paste, type or scan (see reader-ocr.js) any English text, then hear it read
   sentence by sentence with the current word highlighted. Tap a word to hear just
   that word, or a sentence's ▶ to hear just that sentence. "Listen & repeat" mode
   leaves a gap after each sentence so the learner can say it back.

   Voice and speed are saved under the same localStorage keys the course pages'
   🎧 Audio panel uses (eslTTSVoice / eslTTSRate), so the choice carries over.

   speechSynthesis quirks handled here (same as the Spanish reader):
     - Chrome cuts off long utterances, so text is spoken one sentence at a time.
     - `boundary` events are missing on many remote voices, so word highlighting
       falls back to sentence highlighting. */
(function () {
    'use strict';

    var RATE_KEY = 'eslTTSRate', VOICE_KEY = 'eslTTSVoice', TEXT_KEY = 'eslReadAloudText';
    var MAX_CHARS = 220;
    var WORD_RE = /[A-Za-z0-9À-ÿ]+(?:['’][A-Za-z]+)*/g;
    // A period after one of these does not end the sentence.
    var ABBREV = /(?:^|\s|\()(?:Mr|Mrs|Ms|Dr|Prof|St|Ave|Rd|Jr|Sr|vs|etc|Apt|Dept|Inc|Ltd|Co|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|[ap]\.m|e\.g|i\.e|U\.S|[A-Z])\.$/;

    function store(key, val) { try { localStorage.setItem(key, val); } catch (_) {} }
    function load(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }

    /* Split text into speakable sentences, keeping abbreviations like "Dr." and
       "8 a.m." inside their sentence. Very long sentences are cut at a comma or
       space so Chrome doesn't truncate them. */
    function chunk(text) {
        var out = [];
        text.split(/\n+/).forEach(function (para) {
            var buf = '';
            // (no regex lookbehind — older iPhones can't parse it)
            var parts = para.replace(/([.!?…]["”’)]?)\s+/g, '$1\u0000').split('\u0000');
            parts.forEach(function (p) {
                buf = buf ? buf + ' ' + p : p;
                if (ABBREV.test(buf)) return;          // e.g. "Dr." — keep going
                push(buf);
                buf = '';
            });
            if (buf) push(buf);
        });
        function push(s) {
            s = s.trim();
            while (s.length > MAX_CHARS) {
                var cut = s.lastIndexOf(',', MAX_CHARS);
                if (cut < MAX_CHARS * 0.4) cut = s.lastIndexOf(' ', MAX_CHARS);
                if (cut <= 0) cut = MAX_CHARS;
                out.push(s.slice(0, cut + 1).trim());
                s = s.slice(cut + 1).trim();
            }
            if (s) out.push(s);
        }
        return out;
    }

    window.ReadAloud = { chunk: chunk };

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var input = document.getElementById('reader-input');
        if (!input) return;

        var voiceSel = document.getElementById('ra-voice');
        var rate = document.getElementById('ra-rate');
        var rateOut = document.getElementById('ra-rate-value');
        var repeatBox = document.getElementById('ra-repeat');
        var playBtn = document.getElementById('ra-play');
        var stopBtn = document.getElementById('ra-stop');
        var clearBtn = document.getElementById('ra-clear');
        var translateBtn = document.getElementById('ra-translate');
        var display = document.getElementById('reader-display');
        var summary = document.getElementById('ra-summary');
        var noAudio = document.getElementById('ra-noaudio');

        var synth = window.speechSynthesis;
        var hasSpeech = !!(synth && typeof SpeechSynthesisUtterance !== 'undefined');
        var voices = [];
        var queue = [];
        var playing = false;
        var single = false;      // playing just one sentence
        var gapTimer = null;
        var run = 0;             // bumps on every start/stop so stale callbacks do nothing
        var PLAY_LABEL = playBtn.innerHTML;

        /* ---- saved text ---- */
        var saved = load(TEXT_KEY);
        if (saved && saved.trim()) input.value = saved;

        /* ---- speed ---- */
        var r = parseFloat(load(RATE_KEY));
        if (r >= 0.5 && r <= 1.25) rate.value = String(r);
        function showRate() { rateOut.textContent = Number(rate.value).toFixed(2) + '×'; }
        showRate();
        rate.addEventListener('input', function () { showRate(); store(RATE_KEY, rate.value); render(); });

        /* ---- voices ---- */
        function loadVoices() {
            if (!hasSpeech) return;
            var all = synth.getVoices();
            voices = all.filter(function (v) { return /^en/i.test(v.lang); });
            if (!voices.length) voices = all;
            voiceSel.innerHTML = '';
            if (!voices.length) {
                noAudio.hidden = false;
                voiceSel.disabled = true;
                return;
            }
            noAudio.hidden = true;
            voiceSel.disabled = false;
            var want = load(VOICE_KEY), pick = -1;
            voices.forEach(function (v, i) {
                var o = document.createElement('option');
                o.value = String(i);
                o.textContent = v.name.replace(/^(Microsoft|Google)\s+/, '') + ' (' + v.lang + ')';
                voiceSel.appendChild(o);
                if (v.voiceURI === want) pick = i;
            });
            if (pick < 0) voices.some(function (v, i) { if (/en[-_]US/i.test(v.lang)) { pick = i; return true; } });
            voiceSel.value = String(Math.max(0, pick));
        }
        function voice() { return voices[Number(voiceSel.value)] || voices[0] || null; }
        voiceSel.addEventListener('change', function () { var v = voice(); if (v) store(VOICE_KEY, v.voiceURI); });

        function utter(text) {
            var u = new SpeechSynthesisUtterance(text);
            var v = voice();
            if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
            u.rate = Number(rate.value);
            return u;
        }

        /* ---- rendering ---- */
        function render() {
            var text = input.value;
            display.innerHTML = '';
            queue = chunk(text);
            queue.forEach(function (sentence, si) {
                var span = document.createElement('span');
                span.className = 'r-sentence';
                span.dataset.i = String(si);

                if (hasSpeech) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'ra-sent-btn';
                    b.textContent = '▶';
                    b.setAttribute('aria-label', 'Listen to this sentence: ' + sentence);
                    span.appendChild(b);
                }

                var last = 0, m;
                WORD_RE.lastIndex = 0;
                while ((m = WORD_RE.exec(sentence))) {
                    if (m.index > last) span.appendChild(document.createTextNode(sentence.slice(last, m.index)));
                    var w = document.createElement('span');
                    w.className = 'r-word';
                    w.textContent = m[0];
                    w.dataset.start = String(m.index);
                    w.dataset.end = String(m.index + m[0].length);
                    span.appendChild(w);
                    last = m.index + m[0].length;
                }
                if (last < sentence.length) span.appendChild(document.createTextNode(sentence.slice(last)));
                display.appendChild(span);
                display.appendChild(document.createTextNode(' '));
            });

            var words = (text.match(WORD_RE) || []).length;
            if (!words) {
                summary.textContent = 'Type, paste or scan some English above.';
            } else {
                // ~150 words a minute at normal speed
                var mins = words / (150 * Number(rate.value));
                var time = mins < 1 ? 'under a minute' : 'about ' + Math.round(mins) + ' minute' + (Math.round(mins) === 1 ? '' : 's');
                summary.textContent = queue.length + ' sentence' + (queue.length === 1 ? '' : 's') +
                    ' · ' + words + ' word' + (words === 1 ? '' : 's') + ' · ' + time + ' to listen';
            }
            playBtn.disabled = !hasSpeech || !voices.length || !queue.length;
            translateBtn.disabled = !text.trim();
        }

        /* ---- playback ---- */
        function clearMarks() {
            Array.prototype.forEach.call(display.querySelectorAll('.speaking-word, .speaking-sentence, .your-turn'),
                function (e) { e.classList.remove('speaking-word', 'speaking-sentence', 'your-turn'); });
        }

        function speakFrom(i, token) {
            if (!playing || token !== run) return;
            if (i >= queue.length || (single && i !== single.i)) { finish(); return; }
            var sentence = queue[i];
            var u = utter(sentence);
            var sEl = display.querySelector('.r-sentence[data-i="' + i + '"]');
            var started = 0;
            clearMarks();
            if (sEl) {
                sEl.classList.add('speaking-sentence');
                if (sEl.scrollIntoView && !single) sEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }

            u.onstart = function () { started = Date.now(); };
            u.onboundary = function (e) {
                if (e.name && e.name !== 'word') return;
                if (typeof e.charIndex !== 'number' || !sEl) return;
                Array.prototype.forEach.call(sEl.querySelectorAll('.speaking-word'),
                    function (w) { w.classList.remove('speaking-word'); });
                var words = sEl.querySelectorAll('.r-word');
                for (var k = 0; k < words.length; k++) {
                    var st = Number(words[k].dataset.start), en = Number(words[k].dataset.end);
                    if (e.charIndex >= st && e.charIndex < en) { words[k].classList.add('speaking-word'); break; }
                }
            };
            u.onend = function () {
                if (!playing || token !== run) return;
                if (repeatBox.checked && !single) {
                    // Give the learner about as long as the sentence took, plus a beat.
                    var took = started ? Date.now() - started : sentence.length * 70;
                    clearMarks();
                    if (sEl) sEl.classList.add('your-turn');
                    playBtn.innerHTML = '🗣️&nbsp; Your turn — say it!';
                    gapTimer = setTimeout(function () {
                        playBtn.innerHTML = '⏸&nbsp; Reading…';
                        speakFrom(i + 1, token);
                    }, Math.min(12000, Math.max(1500, took * 1.2 + 600)));
                } else {
                    speakFrom(i + 1, token);
                }
            };
            u.onerror = function (e) {
                if (e && /unavailable|failed/.test(e.error || '')) noAudio.hidden = false;
                if (token !== run || (e && (e.error === 'interrupted' || e.error === 'canceled'))) return;
                finish();
            };
            synth.speak(u);
        }

        function stopAll() {
            playing = false;
            run++;
            clearTimeout(gapTimer);
            try { if (synth.speaking || synth.pending) synth.cancel(); } catch (_) {}
        }

        function finish() {
            playing = false;
            single = false;
            clearTimeout(gapTimer);
            clearMarks();
            playBtn.innerHTML = PLAY_LABEL;
            stopBtn.disabled = true;
        }

        function start(fromIndex, onlyThis) {
            if (!hasSpeech || !queue.length) return;
            stopAll();
            playing = true;
            single = onlyThis ? { i: fromIndex } : false;
            playBtn.innerHTML = '⏸&nbsp; Reading…';
            stopBtn.disabled = false;
            // give cancel() a moment to settle before queuing (Chrome/Safari)
            var token = run;
            setTimeout(function () { speakFrom(fromIndex, token); }, 60);
        }

        if (hasSpeech) {
            playBtn.addEventListener('click', function () {
                if (playing) { stopAll(); finish(); return; }
                start(0, false);
            });
            stopBtn.addEventListener('click', function () { stopAll(); finish(); });

            display.addEventListener('click', function (e) {
                var sb = e.target.closest('.ra-sent-btn');
                if (sb) {
                    start(Number(sb.parentNode.dataset.i), true);
                    return;
                }
                var w = e.target.closest('.r-word');
                if (!w || !voices.length) return;
                stopAll(); finish();
                w.classList.add('speaking-word');
                var u = utter(w.textContent);
                u.onend = u.onerror = function () { w.classList.remove('speaking-word'); };
                setTimeout(function () { synth.speak(u); }, 60);
            });

            loadVoices();
            if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', function () { loadVoices(); render(); });
            // Some engines never fire voiceschanged and report no voices at first.
            setTimeout(function () { if (!voices.length) { loadVoices(); render(); } }, 1500);
        } else {
            noAudio.hidden = false;
            voiceSel.disabled = true;
        }

        /* ---- text box ---- */
        var saveTimer = null;
        input.addEventListener('input', function () {
            if (playing) { stopAll(); finish(); }
            render();
            clearTimeout(saveTimer);
            saveTimer = setTimeout(function () { store(TEXT_KEY, input.value); }, 400);
        });

        clearBtn.addEventListener('click', function () {
            stopAll(); finish();
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
        });

        /* Translate: the selected part of the text box if any, else everything. */
        translateBtn.addEventListener('click', function () {
            var text = input.value;
            if (document.activeElement === input || input.selectionEnd > input.selectionStart) {
                var sel = input.value.slice(input.selectionStart, input.selectionEnd);
                if (sel.trim()) text = sel;
            }
            var winSel = String(window.getSelection ? window.getSelection() : '').trim();
            if (winSel && display.contains(window.getSelection().anchorNode)) text = winSel;
            text = text.trim().slice(0, 4500);
            if (!text) return;
            window.open('https://translate.google.com/?sl=en&text=' + encodeURIComponent(text) + '&op=translate',
                '_blank', 'noopener');
        });

        render();
    });
})();
