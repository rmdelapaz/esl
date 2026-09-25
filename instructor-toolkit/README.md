# ESL Instructor Toolkit (all levels)

The **level-independent** part of the ESL "course-in-a-box." Every level kit uses these documents:
English Foundations (A1) now, and later Everyday English (A2), Independent English (B1), Confident English (B2),
Advanced English (C1), Mastery English (C2), IELTS Academic Preparation, and Business English. Each level kit
covers its own lessons (teacher's guide, workbook, answer key, slides, classroom materials). This toolkit covers
what comes **before, around and after** a course: placement, self-assessment, records, classroom posters and the
certificate.

The companion online courses (homework and review, with 🔊 Listen buttons) are at **https://rays-esl.netlify.app/**.

Author: **Ray de la Paz** · © 2026 Ray de la Paz

## What's in it

| File | Audience | What it is | When to use it |
|------|----------|------------|----------------|
| `placement-test.html` | Teacher + learner pages | Placement test covering Pre-A1 to C2. **Part A:** 50 graded multiple-choice grammar and vocabulary items in six sections (A1 10 · A2 9 · B1 9 · B2 9 · C1 7 · C2 6), easy to hard. **Part B:** two reading texts (A2 email, B2 article), 5 questions each. **Part C:** tiered writing (form, then short paragraph, then 120–180 words). **Part D:** a scripted 5-minute speaking interview with prompts for each band, a stop rule, and a picture and number card. Also covers **scoring and placement** (section targets, then combining with the speaking band to choose a course) and a **limited-literacy placement procedure**. | Enrollment / before the first class |
| `placement-test-key.html` | Teacher only | All 60 answers with a one-line reason each, a quick-mark strip, cut-scores and the total-score guide, CEFR-aligned **writing** and **speaking** band descriptors (in our own words), and four worked placement examples. | Marking the placement test |
| `can-do-checklists.html` | Learner | "I can…" self-assessment with *Not yet / With help / Yes!* columns. **A1:** one checklist per module (8), matched to the lesson objectives of English Foundations. **A2, B1, B2, C1, C2:** one page each, with 6–8 statements per skill (listening, reading, speaking, writing). Wording gets harder level by level. | End of each module (A1), or start / middle / end of a course (A2–C2) |
| `classroom-language-poster.html` | Classroom wall | Two one-page posters: **Classroom English** (12 survival phrases with icons) and **Learning English at home** (9 study tips, including the online course's 🔊 Listen buttons). Written in A1 English so they work at any level. | Put up in the first class; teach the phrases |
| `progress-tracker.html` | Teacher | Class register: course details, **attendance grid for 24 classes** (16 learners per sheet), **assessment score sheet** (placement, progress tests, final written/speaking/writing, self-assessment, next course, certificate), **can-do tick grid** by module (teacher and self), notes page, and a one-page **learner profile** (goals, first languages, literacy, work and family context; optional fields, privacy note). Register pages print landscape; the profile prints portrait. | Throughout the course |
| `certificate.html` | Learner | Landscape certificate of completion for any course. Type in the name, course, level, hours, date and program (or pick the course from the toolbar menu), or print blank and handwrite. | Last class |
| `kit.css` | — | A copy of the A1 kit's stylesheet (`curriculum/instructor-kit/kit.css`), so the toolkit stands alone. | — |

All pages share the kit design: a toolbar with **Print / Save as PDF** (screen only), masthead, `.sec` section
labels, and the attributed footer. Everything is print-ready on US Letter (also fine on A4). Page-level print CSS
handles one-poster-per-page, landscape registers and the landscape certificate.

## The course ladder (used by the placement test)

| Level | Course | Lessons | Online |
|-------|--------|---------|--------|
| A1 | English Foundations | 22 (8 modules) | `/curriculum/` |
| A2 | Everyday English | 24 (8 modules) | `/curriculum-a2/` |
| B1 | Independent English | 24 (8 modules) | `/curriculum-b1/` |
| B2 | Confident English | 24 (8 modules) | `/curriculum-b2/` |
| C1 | Advanced English | 24 (8 modules) | `/curriculum-c1/` |
| C2 | Mastery English | 24 (8 modules) | `/curriculum-c2/` |
| B1+ | IELTS Academic Preparation | 12 (4 modules) | `/curriculum-ielts/` |
| B1+ | Business English | 12 (4 modules) | `/curriculum-business/` |

**Placement rule, in short:** the written band is the highest Part A section *secured* (with all easier sections secured
too); the speaking band is the highest interview band handled comfortably. The recommended course is the **next level
up** from the band. When the two bands differ by one, place by the lower and re-check after two weeks. When they differ
by two or more, it's usually literacy (speaking higher) or school-grammar knowledge (writing higher); the test gives the
decision for each case. IELTS and Business are recommended alongside a general course once a learner is at about B1 (placement result Confident English B2 or higher), when the
learner's goal matches.

## How a level kit uses the toolkit

Each level kit lives inside its course folder (e.g. `curriculum/instructor-kit/` for A1) and links here rather than
copying these files:

- **Before the course:** administer `placement-test.html`; fill a `progress-tracker.html` learner profile per learner.
- **Class 1:** teach the Classroom English poster; hand out the "at home" poster with the online-course link.
- **During the course:** keep attendance and scores in the register; learners do their level's page of
  `can-do-checklists.html` (A1: at the end of each module; the A1 kit's Progress Test 1 in class 13 is a natural point
  for the Modules 1–4 checklists); copy the ticks into the tracker's can-do grid.
- **End of course:** final assessment (in the level kit), then the level's can-do checklist again, "next course" in
  the register, and `certificate.html`.

From a level kit at `curriculum*/instructor-kit/`, link to the toolkit as `../../instructor-toolkit/<file>.html`.

## Adapting for other levels

- **Class count:** the register assumes 24 classes (12 weeks × 2 × 90 min, as in the A1 kit, = 36 hours).
  For 12-lesson courses, use columns 1–12 or teach each lesson across two classes. For 4-module courses, use can-do
  grid Modules 1–4.
- **Can-do lists for IELTS / Business:** use the B1 or B2 page (or both), plus the course's own lesson objectives.
- **Module-level can-dos for A2–C2:** the one-page lists are skill-based. When a level kit is built, it can add
  module-matched checklists like A1's (following the same table markup) to its own materials.

## Notes

- The can-do statements and band descriptors are **CEFR-aligned but not official CEFR wording**; they are written for
  this series. Cut-scores are practical starting points, not statistically calibrated. Review them once you have
  placement data from real classes.
- Personal questions are always optional, and a "new identity" answer is always allowed (trauma-informed practice,
  as in the level kits). Never record immigration or legal status.
- American English throughout.
