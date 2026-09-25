# IELTS Academic Preparation — Instructor Kit ("Course-in-a-Box")

A ready-to-teach package that lets an adult-education or community ESL teacher run
**IELTS Academic Preparation** as a live class. The free online course
(rays-esl.netlify.app/curriculum-ielts/) is the learners' homework and review — every lesson has 🔊 Listen buttons.

**Complete — all four modules are built.** For B2+ learners aiming at band 6.0–7.5 (university entry, professional registration). All practice material is original; band descriptors are paraphrased. Not affiliated with or endorsed by the IELTS partners.

| Module | Lessons | Classes | Status |
|--------|---------|---------|--------|
| — Orientation + Diagnostic | — | C1 | ✅ Built |
| 1 · The Test & Foundations | 1.1–1.3 | C2–C4 | ✅ Built |
| 2 · Listening & Reading | 2.1–2.3 | C5–C7 | ✅ Built |
| — Practice Test 1 (Listening + Reading, timed) | — | C8 | ✅ Built |
| 3 · Academic Writing | 3.1–3.3 | C9–C11 | ✅ Built |
| 4 · Speaking & Test Mastery | 4.1–4.3 | C12–C14 | ✅ Built |
| — Practice Test 2 (full: L + R, then W + Speaking) + debrief | — | C15–C16 | ✅ Built |

**Format:** 8 weeks · 2 classes a week · 90 minutes (16 classes, 24 hours). Every lesson class runs strategy →
guided practice → timed practice → self-marking against paraphrased band criteria → targeted feedback. C1 sets each
learner's starting band and target; the two timed practice tests show progress and drive individual study plans.

### Primary documents — the combined books (start here)

| File | Audience | Contents |
|------|----------|----------|
| `student-workbook.{html,pdf}` | Learner | All 4 modules: strategies, guided and timed practice, self-marking, study plans: grammar boxes, vocabulary, exercises, dialogues, speaking tasks, "I can…" checklists, journal |
| `teacher-guide.{html,pdf}` | Teacher | One 90-minute plan per class: board plan, timed stage plan, CCQs, drill scripts, ICQs, literacy support & stretch, L1 watch-outs, homework |
| `answer-key.{html,pdf}` | Teacher | Every workbook exercise and self-check answered, with acceptable alternatives and common errors (confidential) |

The editable per-module docs live in `source/module-N/`. **If you edit one, run `python3 build-combined.py`
to regenerate the three books, then re-render their PDFs.** Don't hand-edit the combined files.

### Everything else in this kit

| Path | Audience | Purpose |
|------|----------|---------|
| `slides/module-N-*.html` | Teacher (project it) | 4 decks, one per module — strategies, question-type walkthroughs, model answers, timed-task instructions |
| `materials/module-N/classroom-materials.html` | Teacher (print, cut) | Picture flashcards, role-play & information-gap cards, read-aloud listening/dictation scripts, a game |
| `assessment/diagnostic.{html,pdf}` | Learner + teacher | C1 diagnostic: short Listening + Reading, a writing sample, a speaking sample |
| `assessment/practice-test-1.{html,pdf}` | Learner + teacher | C8 timed Listening (40 Qs) + Reading (3 passages, 40 Qs) |
| `assessment/practice-test-2.{html,pdf}` | Learner + teacher | C15–C16 full practice test: Listening, Reading, Writing Tasks 1–2, Speaking Parts 1–3 |
| `assessment/answer-keys.{html,pdf}` · `assessment/practice-test-2-key.{html,pdf}` | Teacher | Keys with evidence lines, approximate raw-score→band tables, paraphrased Writing & Speaking criteria, model answers, debrief plans |
| `band-tracker.{html,pdf}` | Learner | Target band, per-skill bands across the diagnostic and both practice tests, error tally, study plan |
| `learner-welcome.{html,pdf}` | Learner | First-day handout (with realistic band expectations & test-anxiety tips): class times, what to bring, how to use the online lessons at home |
| `sell-sheet.{html,pdf}` | Programs / funders | One-pager: what's inside, who it's for, license tiers |
| `assets/vocab/` | — | The course's 154 vocabulary illustrations (used by the books, slides, and flashcards) |
| `README.md` · `LICENSE.md` | — | This overview and the tiered license template |

The 8-week **syllabus** lives one level up in the course folder: `../syllabus.html`,
`../syllabus-print.html`, `../IELTS-Academic-Syllabus-8week.pdf`.

### The shared ESL toolkit (all levels)

Level-independent tools live in `../../instructor-toolkit/` so every level's kit can reuse them:
**placement test** + key (Pre-A1 → C2), **CEFR can-do checklists** (use the B2 and C1 pages to see where a learner stands before starting),
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
5. **Check:** the **answer key**; the C1 diagnostic, C8 Practice Test 1 and C15–C16 Practice Test 2; each learner's **band tracker**.

## Folder layout

```
instructor-kit/
├─ student-workbook / teacher-guide / answer-key   (.html + .pdf)  ← the three books
├─ learner-welcome / sell-sheet                     (.html + .pdf)
├─ assessment/   diagnostic · practice-test-1 · practice-test-2 · answer-keys · practice-test-2-key   (.html + .pdf)
├─ band-tracker   (.html + .pdf)
├─ slides/       module-1-foundations.html … module-4-speaking-mastery.html
├─ materials/    module-1/ … module-4/  classroom-materials.html
├─ source/       module-1/ … module-4/  — editable per-module docs (build the books)
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

© 2026 Ray de la Paz — IELTS Academic Preparation — instructor kit.
