#!/usr/bin/env python3
"""
Assemble the three combined instructor-kit books from the per-module source docs.

Reads:  source/module-N/{facilitator-guide,participant-workbook,answer-key}.html
Writes: ./participant-workbook.html, ./facilitator-guide.html, ./answer-key.html
        (the canonical hand-out documents, each with a cover + TOC + one chapter
         per module, continuous pagination)

After editing a module's source doc, re-run this to regenerate the books, then
render PDFs (each book has a Print / Save as PDF button, or use headless Chrome).

Usage:  python3 build-combined.py   (run from the instructor-kit/ folder)
"""
import os

MODULES = [
    (1, "First Words & Meeting People", [("1.1", "The English Alphabet & First Sounds"), ("1.2", "Greetings & Introductions"), ("1.3", "Numbers, Age & Personal Information")]),
    (2, "People, Places & Things", [("2.1", "The Verb \"To Be\" — Countries & Nationalities"), ("2.2", "This & That, a/an & Everyday Objects"), ("2.3", "My Family & Possessives")]),
    (3, "Everyday Life", [("3.1", "Present Simple — Daily Routines"), ("3.2", "Telling the Time, Days & He/She (-s)"), ("3.3", "There is / There are — My Home")]),
    (4, "Getting Around & Doing Things", [("4.1", "Can / Can't — Abilities & Food"), ("4.2", "Present Continuous — Happening Right Now"), ("4.3", "Review Project — Shopping & Directions")]),
    (5, "Describing the World Around Me", [("5.1", "Plurals, Colors & Adjectives"), ("5.2", "Where Things Are — Prepositions of Place"), ("5.3", "Have Got — People & Belongings")]),
    (6, "Habits, Free Time & Plans", [("6.1", "How Often? — Adverbs of Frequency"), ("6.2", "Likes & Dislikes — like/love/hate + -ing"), ("6.3", "Times & Dates — Making Plans")]),
    (7, "Out in the World", [("7.1", "Food & Drink — some & any"), ("7.2", "At a Café — I'd like…"), ("7.3", "Clothes, Shopping & Weather")]),
    (8, "Bringing It All Together", [("8.1", "Review Project — At the Doctor & My Week")]),
]
TITLE = "English Foundations (A1 Beginner)"

DOCS = {
    "participant-workbook": dict(
        base="student-workbook.html", role="Student Workbook",
        eyebrow="English Foundations · A1 Student Workbook",
        sub="Your English notebook for the whole course. Learn the words, practice the grammar, speak with a partner, and check what you can do.",
        chips=['<span class="chip"><b>8</b> modules · 22 lessons</span>', '<span class="chip">Words · grammar · speaking · I can…</span>', '<span class="chip">Name: ____________________</span>'],
        toolbar=("Student workbook —", "write in it · bring it to every class")),
    "facilitator-guide": dict(
        base="teacher-guide.html", role="Teacher's Guide",
        eyebrow="English Foundations · A1 Teacher's Guide",
        sub="The full teaching manual for a 12-week adult-education A1 class (24 classes × 90 minutes): lesson stages and timing, board plans, drilling and concept-check questions, pair-work, error correction, differentiation for mixed literacy, and L1 watch-outs.",
        chips=['<span class="chip"><b>8</b> modules · 22 lessons</span>', '<span class="chip">24 classes · 90 min · 12 weeks</span>', '<span class="chip">Teacher copy · not for students</span>'],
        toolbar=("Teacher copy —", "contains answers &amp; timing · not for students")),
    "answer-key": dict(
        base="answer-key.html", role="Answer Key",
        eyebrow="English Foundations · A1 Answer Key",
        sub="Every workbook exercise and self-check answered, with notes on acceptable alternatives and common learner errors. Confidential teacher material.",
        chips=['<span class="chip"><b>8</b> modules</span>', '<span class="chip">Exercise &amp; quiz answers</span>', '<span class="chip">Confidential — do not distribute</span>'],
        toolbar=("Teacher copy —", "answers · not for students")),
}

STYLE = """<style>
  .cover { border-bottom:3px solid var(--accent); padding-bottom:22px; margin-bottom:12px; }
  .cover .kit-eyebrow { color:var(--accent); }
  .cover h1 { font-size:clamp(2rem,5vw,2.7rem); font-weight:800; letter-spacing:-.02em; margin:10px 0 6px; }
  .cover .sub { font-size:1.05rem; color:var(--ink-2); max-width:64ch; }
  .toc { margin:26px 0 8px; }
  .toc h2 { font-size:.95rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:var(--ink-2); margin-bottom:10px; }
  .toc ol { list-style:none; margin:0; padding:0; }
  .toc .mod { font-family:"Archivo",sans-serif; font-weight:700; font-size:1.02rem; margin:12px 0 3px; color:var(--ink); }
  .toc .mod .mnum { font-family:"JetBrains Mono",monospace; font-size:.7rem; color:var(--accent); font-weight:600; margin-right:8px; }
  .toc .les { display:flex; gap:10px; padding:2px 0 2px 18px; font-size:.9rem; color:var(--ink-2); }
  .toc .les .lc { font-family:"JetBrains Mono",monospace; font-size:.72rem; color:var(--accent); }
  .modwrap { break-before:page; }
  .modwrap > .mast h1 { font-size:1.55rem; }
  @media print { .modwrap { break-before:page; } }
</style>"""


def esc(s):
    return s.replace("&", "&amp;")


def extract_body(path):
    """Inner content of .sheet minus the trailing .foot block."""
    html = open(path, encoding="utf-8").read()
    i = html.index('<div class="sheet">') + len('<div class="sheet">')
    j = html.rindex('<div class="foot">')
    # source docs sit two folders down; the combined books live at the kit root
    return html[i:j].strip().replace('../../assets/', 'assets/').replace('../../materials/', 'materials/')


def build(key):
    d = DOCS[key]
    toc_rows = []
    for num, title, lessons in MODULES:
        toc_rows.append(f'<li class="mod"><span class="mnum">MOD {num}</span>{esc(title)}</li>')
        for lc, lt in lessons:
            toc_rows.append(f'<li class="les"><span class="lc">{lc}</span><span>{esc(lt)}</span></li>')
    toc = "\n        ".join(toc_rows)

    mods = []
    for num, _, _ in MODULES:
        body = extract_body(os.path.join("source", f"module-{num}", key + ".html"))
        mods.append(f'<section class="modwrap">\n{body}\n</section>')
    mods = "\n\n".join(mods)

    out = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{d['role']} — English Foundations (A1)</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@500;600&display=swap">
<link rel="stylesheet" href="kit.css">
{STYLE}
</head>
<body>

<div class="toolbar">
  <span class="lbl">{d['toolbar'][0]}</span>
  <button type="button" onclick="window.print()">🖨 Print / Save as PDF</button>
  <span class="hint">{d['toolbar'][1]}</span>
</div>

<div class="sheet">

  <header class="cover">
    <div class="kit-eyebrow">{d['eyebrow']}</div>
    <h1>{esc(TITLE)}</h1>
    <p class="sub">{d['sub']}</p>
    <div class="meta-row">{''.join(d['chips'])}</div>
  </header>

  <nav class="toc">
    <h2>Contents</h2>
    <ol>
        {toc}
    </ol>
  </nav>

{mods}

  <div class="foot">
    <div class="who"><span class="bio">© 2026 Ray de la Paz · {esc(TITLE)} · {d['role']}</span></div>
    <div class="ver">Complete {d['role']} · all 8 modules · v1.0</div>
  </div>

</div>
</body>
</html>
"""
    open(d["base"], "w", encoding="utf-8").write(out)
    print(f"wrote {d['base']}  ({len(out)//1024} KB)")


if __name__ == "__main__":
    if not os.path.isdir("source"):
        raise SystemExit("Run this from the instructor-kit/ folder (source/ not found).")
    for k in DOCS:
        build(k)
    print("Done. Now render PDFs (open each and Print, or use headless Chrome).")
