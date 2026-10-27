/* reader-ocr.js — photo / image → text for the Read Aloud page.

   Ported from the Spanish course's reader (rays-spanish). The OCR language comes
   from data-ocr-lang on #reader-ocr (a Tesseract code: eng, spa, fra…; default eng).

   Lets the learner take a photo (phone camera), upload, drag-and-drop or paste an
   image of text. Tesseract.js reads it entirely in the browser — the image
   is never sent anywhere — and the result goes into #reader-input, which the reader
   then analyses as usual.

   Tesseract (~3 MB + ~2–5 MB language model) is only downloaded the first time it is
   needed; the browser caches it after that. */
(function () {
    'use strict';

    var TESSERACT_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    var MAX_SIDE = 2400;   // shrink huge phone photos (faster, no accuracy loss)
    var MIN_SIDE = 1000;
    var GOOD_CONF = 70;    // below this, try other orientations
    var MIN_CONF = 40;     // below this, the "text" is noise — don't insert it   // enlarge tiny screenshots (Tesseract likes ~30px letters)

    /* Join OCR lines back into readable prose:
       - "pala-\nbra" → "palabra" (hyphenation at a line end)
       - single line breaks → spaces; blank lines stay as paragraph breaks */
    function cleanText(raw) {
        return raw
            .replace(/\r/g, '')
            .replace(/[ \t]+\n/g, '\n')
            .replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])[-‐­]\n(?=[a-záéíóúüñ])/g, '$1')
            .split(/\n{2,}/)
            .map(function (p) { return p.replace(/\s*\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim(); })
            .filter(Boolean)
            .join('\n\n');
    }

    var loading = null;
    function loadTesseract() {
        if (window.Tesseract) return Promise.resolve(window.Tesseract);
        if (loading) return loading;
        loading = new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = TESSERACT_SRC;
            s.onload = function () { resolve(window.Tesseract); };
            s.onerror = function () { loading = null; reject(new Error('Could not download the text-recognition library. Check your connection and try again.')); };
            document.head.appendChild(s);
        });
        return loading;
    }

    /* Decode a File into a canvas at a size Tesseract reads well, applying any
       extra quarter-turn rotation the learner asked for. */
    function fileToCanvas(file, turns) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onload = function () {
                URL.revokeObjectURL(url);
                var w = img.naturalWidth, h = img.naturalHeight;
                var longest = Math.max(w, h);
                var scale = longest > MAX_SIDE ? MAX_SIDE / longest
                          : longest < MIN_SIDE ? Math.min(2, MIN_SIDE / longest) : 1;
                w = Math.round(w * scale); h = Math.round(h * scale);
                var odd = turns % 2 === 1;
                var c = document.createElement('canvas');
                c.width = odd ? h : w;
                c.height = odd ? w : h;
                var ctx = c.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, c.width, c.height);   // transparent PNGs → white page
                ctx.translate(c.width / 2, c.height / 2);
                ctx.rotate(turns * Math.PI / 2);
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
                resolve(c);
            };
            img.onerror = function () {
                URL.revokeObjectURL(url);
                reject(new Error('That file could not be opened as an image. (iPhone HEIC photos: take the photo with the button above instead, or export as JPEG.)'));
            };
            img.src = url;
        });
    }

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var input = document.getElementById('reader-input');
        var panel = document.getElementById('reader-ocr');
        if (!input || !panel) return;

        var cameraIn = document.getElementById('ocr-camera');
        var fileIn = document.getElementById('ocr-file');
        var appendBox = document.getElementById('ocr-append');
        var status = document.getElementById('ocr-status');
        var statusText = document.getElementById('ocr-status-text');
        var bar = document.getElementById('ocr-progress');
        var cancelBtn = document.getElementById('ocr-cancel');
        var thumbs = document.getElementById('ocr-thumbs');
        var drop = document.querySelector('.reader-panel');

        var LANG = panel.getAttribute('data-ocr-lang') || 'eng';
        var worker = null;
        var busy = false;
        var cancelled = false;
        var current = { done: 0, total: 1 };
        var stopRun = null;   // rejects the in-flight run when Cancel is pressed

        function setStatus(msg, kind) {
            status.hidden = false;
            status.className = 'ocr-status' + (kind ? ' ocr-' + kind : '');
            statusText.textContent = msg;
            bar.hidden = kind !== 'busy';
            cancelBtn.hidden = kind !== 'busy';
        }

        function setProgress(p) {
            // overall progress across several images
            bar.value = (current.done + p) / current.total;
        }

        function getWorker() {
            if (worker) return Promise.resolve(worker);
            setStatus('Downloading the text reader (first time only, about 5–8 MB)…', 'busy');
            return loadTesseract().then(function (T) {
                return T.createWorker(LANG, 1, {
                    logger: function (m) {
                        if (m.status === 'recognizing text') setProgress(m.progress || 0);
                        else if (/loading|initializ/.test(m.status) && !busy) setProgress(m.progress || 0);
                    }
                });
            }).then(function (w) { worker = w; return w; });
        }

        function putText(text) {
            var keep = appendBox.checked && input.value.trim();
            input.value = keep ? input.value.replace(/\s+$/, '') + '\n\n' + text : text;
            input.dispatchEvent(new Event('input', { bubbles: true }));   // reader.js re-renders
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function addThumb(file, canvas) {
            var fig = document.createElement('figure');
            fig.className = 'ocr-thumb';
            var im = document.createElement('img');
            im.src = canvas.toDataURL('image/jpeg', 0.6);
            im.alt = 'Scanned image: ' + file.name;
            var rot = document.createElement('button');
            rot.type = 'button';
            rot.className = 'reader-btn ocr-rotate';
            rot.title = 'Text sideways or upside down? Rotate a quarter turn and read it again.';
            rot.textContent = '↻ Rotate & re-read';
            fig.turns = 0;
            rot.addEventListener('click', function () {
                if (busy) return;
                fig.turns = (fig.turns + 1) % 4;
                // a re-read replaces the text rather than piling up a second copy
                var was = appendBox.checked;
                appendBox.checked = false;
                run([file], fig).then(function () { appendBox.checked = was; });
            });
            fig.appendChild(im);
            fig.appendChild(rot);
            thumbs.appendChild(fig);
            return fig;
        }

        function run(files, refig) {
            files = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
            if (!files.length) { setStatus('That isn’t an image file. Try a JPG, PNG or WebP.', 'error'); return Promise.resolve(); }
            if (busy) return Promise.resolve();
            busy = true; cancelled = false;
            panel.classList.add('is-busy');
            current = { done: 0, total: files.length };
            if (!refig) thumbs.innerHTML = '';
            bar.value = 0;

            var texts = [], confs = [];
            var stopped = new Promise(function (_, reject) {
                stopRun = function () { cancelled = true; reject(new Error('cancelled')); };
            });
            var job = getWorker().then(function (w) {
                return files.reduce(function (p, file, i) {
                    return p.then(function () {
                        if (cancelled) return;
                        current.done = i;
                        setStatus(files.length > 1
                            ? 'Reading image ' + (i + 1) + ' of ' + files.length + '…'
                            : 'Reading the text in your image…', 'busy');
                        var fig = refig;
                        var start = refig ? refig.turns : 0;
                        function attempt(turns) {
                            return fileToCanvas(file, turns).then(function (canvas) {
                                return w.recognize(canvas).then(function (res) {
                                    return { turns: turns, canvas: canvas, res: res };
                                });
                            });
                        }
                        return attempt(start).then(function (best) {
                            // Poor read on a fresh image? It may be sideways or upside
                            // down — try the other three orientations and keep the best.
                            if (refig || best.res.data.confidence >= GOOD_CONF) return best;
                            setStatus('Hard to read — checking whether the picture is sideways…', 'busy');
                            return [1, 2, 3].reduce(function (p, t) {
                                return p.then(function (b) {
                                    if (cancelled || b.res.data.confidence >= GOOD_CONF) return b;
                                    return attempt(t).then(function (r) {
                                        return r.res.data.confidence > b.res.data.confidence ? r : b;
                                    });
                                });
                            }, Promise.resolve(best));
                        }).then(function (best) {
                            if (refig) refig.querySelector('img').src = best.canvas.toDataURL('image/jpeg', 0.6);
                            else { fig = addThumb(file, best.canvas); fig.turns = best.turns; }
                            var t = cleanText(best.res.data.text || '');
                            if (t && best.res.data.confidence >= MIN_CONF) { texts.push(t); confs.push(best.res.data.confidence); }
                        });
                    });
                }, Promise.resolve());
            });
            return Promise.race([job, stopped]).then(function () {
                if (cancelled) { setStatus('Stopped. Nothing was changed.', ''); return; }
                if (!texts.length) {
                    setStatus('No readable text found, so your text was left as it was. Try a closer, sharper, well-lit photo with the page flat — or use ↻ Rotate if it’s sideways.', 'error');
                    return;
                }
                putText(texts.join('\n\n'));
                var conf = Math.round(confs.reduce(function (a, b) { return a + b; }, 0) / confs.length);
                var words = texts.join(' ').split(/\s+/).length;
                if (conf < 65) {
                    setStatus('Done — ' + words + ' words, but the image was hard to read (' + conf + '% confidence). Check the text for mistakes before you listen.', 'warn');
                } else {
                    setStatus('Done — ' + words + ' words added (' + conf + '% confidence). Scanners sometimes make small mistakes, so read it through once.', 'ok');
                }
            }).catch(function (err) {
                if (cancelled) { setStatus('Stopped. Nothing was changed.', ''); return; }
                setStatus(err && err.message ? err.message : 'Something went wrong reading that image.', 'error');
                if (worker) { worker.terminate(); worker = null; }
            }).then(function () {
                busy = false; stopRun = null;
                panel.classList.remove('is-busy');
                bar.hidden = true; cancelBtn.hidden = true;
            });
        }

        cameraIn.addEventListener('change', function () { run(cameraIn.files); cameraIn.value = ''; });
        fileIn.addEventListener('change', function () { run(fileIn.files); fileIn.value = ''; });

        cancelBtn.addEventListener('click', function () {
            // terminating is the only way to stop a recognise in progress
            if (worker) { worker.terminate(); worker = null; }
            if (stopRun) stopRun();
        });

        /* Drag an image onto the reader panel. */
        ['dragenter', 'dragover'].forEach(function (ev) {
            drop.addEventListener(ev, function (e) {
                if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') < 0) return;
                e.preventDefault();
                drop.classList.add('ocr-dragging');
            });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            drop.addEventListener(ev, function (e) {
                if (ev === 'dragleave' && drop.contains(e.relatedTarget)) return;
                drop.classList.remove('ocr-dragging');
            });
        });
        drop.addEventListener('drop', function (e) {
            if (!e.dataTransfer || !e.dataTransfer.files.length) return;
            e.preventDefault();
            run(e.dataTransfer.files);
        });

        /* Paste a screenshot (Ctrl/Cmd+V) anywhere on the page. Plain-text pastes
           into the textarea are left alone. */
        document.addEventListener('paste', function (e) {
            var items = (e.clipboardData && e.clipboardData.items) || [];
            var files = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && /^image\//.test(items[i].type)) files.push(items[i].getAsFile());
            }
            if (!files.length) return;
            e.preventDefault();
            run(files);
        });

        window.ReaderOCR = { cleanText: cleanText };
    });

    // expose for testing even before the DOM is ready
    window.ReaderOCR = { cleanText: cleanText };
})();
