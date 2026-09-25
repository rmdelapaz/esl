# Everyday English (A2 Elementary) — Instructor Kit ("Course-in-a-Box")

A ready-to-teach package that lets an adult-education or community ESL teacher run
**Everyday English (A2 Elementary)** as a live class. The free online course
(rays-esl.netlify.app/curriculum-a2/) is the learners' homework and review — every lesson has 🔊 Listen buttons.

**Complete — all eight modules are built.** Learners finished A1 (or placed into A2); the A2 exit points to B1 *Independent English*.

| Module | Lessons | Classes | Status |
|--------|---------|---------|--------|
| 1 · Talking About the Past | 1.1–1.3 | C1–C3 | ✅ Built |
| 2 · Describing & Comparing | 2.1–2.3 | C4–C6 | ✅ Built |
| 3 · Talking About the Future | 3.1–3.3 | C7–C9 | ✅ Built |
| 4 · Experiences & Advice | 4.1–4.3 | C10–C12 | ✅ Built |
| — Progress Test 1 (Modules 1–4) | — | C13 | ✅ Built |
| 5 · Telling Stories | 5.1–5.3 | C14–C16 | ✅ Built |
| 6 · Joining Ideas Together | 6.1–6.3 | C17–C19 | ✅ Built |
| 7 · Getting Things Done | 7.1–7.3 | C20–C22 | ✅ Built |
| 8 · Experiences, Plans & Review | 8.1–8.3 | C23–C25 | ✅ Built |
| — Final assessment + celebration | — | C26 | ✅ Built |

**Format:** 13 weeks · 2 classes a week · 90 minutes (26 classes, 39 hours). Mixed-first-language adults. Every class plan follows the same
shape — warmer → lead-in → Meaning / Form / Pronunciation with concept-checking questions → drill →
controlled practice → freer pair/group speaking → delayed error correction → homework — and every
personal-information task offers a **"new identity"** option.

### Primary documents — the combined books (start here)

| File | Audience | Contents |
|------|----------|----------|
| `student-workbook.{html,pdf}` | Learner | All 8 modules in simple A2 English: picture word lists, grammar boxes, exercises, dialogues, speaking tasks, "I can…" checklists, journal |
| `teacher-guide.{html,pdf}` | Teacher | One 90-minute plan per class: board plan, timed stage plan, CCQs, drill scripts, ICQs, literacy support & stretch, L1 watch-outs, homework |
| `answer-key.{html,pdf}` | Teacher | Every workbook exercise and self-check answered, with acceptable alternatives and common errors (confidential) |

The editable per-module docs live in `source/module-N/`. **If you edit one, run `python3 build-combined.py`
to regenerate the three books, then re-render their PDFs.** Don't hand-edit the combined files.

### Everything else in this kit

| Path | Audience | Purpose |
|------|----------|---------|
| `slides/module-N-*.html` | Teacher (project it) | 8 decks, one per module — picture vocabulary, grammar, dialogues, CCQs, pair-task instructions |
| `materials/module-N/classroom-materials.html` | Teacher (print, cut) | Picture flashcards, role-play & information-gap cards, read-aloud listening/dictation scripts, a game |
| `assessment/progress-test-1.{html,pdf}` | Learner + teacher | C13 test on Modules 1–4 (listening, vocabulary, grammar, reading, writing + pair speaking) |
| `assessment/final-test.{html,pdf}` | Learner + teacher | C26 A2 exit test on all 8 modules + individual speaking interview |
| `assessment/assessment-key.{html,pdf}` | Teacher | Keys, point values, speaking/writing rubrics, who is ready for B1, how to give feedback kindly |
| `learner-welcome.{html,pdf}` | Learner | First-day handout in simple English: class times, what to bring, how to use the online lessons at home |
| `sell-sheet.{html,pdf}` | Programs / funders | One-pager: what's inside, who it's for, license tiers |
| `assets/vocab/` | — | The course's 154 vocabulary illustrations (used by the books, slides, and flashcards) |
| `README.md` · `LICENSE.md` | — | This overview and the tiered license template |

The 13-week **syllabus** lives one level up in the course folder: `../syllabus.html`,
`../syllabus-print.html`, `../Everyday-English-A2-Syllabus-13week.pdf`.

### The shared ESL toolkit (all levels)

Level-independent tools live in `../../instructor-toolkit/` so every level's kit can reuse them:
**placement test** + key (Pre-A1 → C2), **CEFR can-do checklists** (A1 by module; A2–C2 by level — use the A2 page),
**classroom-language posters**, a **progress tracker** / class register, a learner profile, and a
**certificate** template. See `../../instructor-toolkit/README.md`.

---

## How to teach from it

1. **Before the term:** place learners with the toolkit's placement test (use the oral interview for
   learners with limited literacy). Print the learner-welcome handout and the Module 1 materials.
2. **Before each class:** read that class in the **teacher's guide** (stage plan = 90 minutes), print the
   module's **classroom materials** once, and open the module's **slide deck**.
3. **In class:** follow the stage plan. Learners write in the **student workbook**.
4. **Homework:** the matching online lesson (URL in each class plan) — learners can hear every word.
5. **Check:** the **answer key**; C13 progress test; C26 final test and interview; can-do checklists.

## Folder layout

```
instructor-kit/
├─ student-workbook / teacher-guide / answer-key   (.html + .pdf)  ← the three books
├─ learner-welcome / sell-sheet                     (.html + .pdf)
├─ assessment/   progress-test-1 · final-test · assessment-key   (.html + .pdf)
├─ slides/       module-1-the-past.html … module-8-review.html
├─ materials/    module-1/ … module-8/  classroom-materials.html
├─ source/       module-1/ … module-8/  — editable per-module docs (build the books)
├─ assets/vocab/ 154 illustrations
├─ kit.css       shared print-first stylesheet (with the course's ESL components)
├─ build-combined.py
└─ README.md · LICENSE.md
```

Every document has a **Print / Save as PDF** button and a tuned print layout; decks are single files
(arrow keys / space to advance) and need no internet except for web fonts.

**Still to do:** `LICENSE.md` is a plain-language template — have it reviewed before commercial use.
Sell-sheet prices are `[$ ___ ]` placeholders. The placement-test cut-scores are a best estimate — check
them against your own learners' results.

---

## License

See `LICENSE.md`. Short version: licensed to a **single teacher or organization** to teach the course;
not to be resold; the teacher's guide and answer keys are **not** for students. CEFR level names refer to
the Council of Europe framework; this kit is independent and not endorsed by the Council of Europe.

© 2026 Ray de la Paz — Everyday English (A2 Elementary) — instructor kit.
