#!/usr/bin/env python3
"""Rebalance which letter holds the correct answer in the online lesson quizzes.

Each `.quiz-options` block keeps its buttons (and every attribute on them); only the
ORDER changes so the correct option lands on a balanced, deterministic position per
course, then the visible "A) / B) / C)" labels are rewritten in the new order.
The quiz JS checks `data-correct`, never position, so behavior is unchanged.

Usage: python3 tools_rebalance_quiz.py curriculum curriculum-a2 ...   (add --dry to preview)
"""
import glob
import hashlib
import re
import sys
from collections import Counter

BLOCK = re.compile(r'(<div class="quiz-options">)(.*?)(\n?[ \t]*</div>)', re.S)
BUTTON = re.compile(r'([ \t]*\n?[ \t]*)(<button[^>]*class="quiz-option"[^>]*>)(.*?)(</button>)', re.S)
LABEL = re.compile(r'^(\s*)([A-E])\)')


def rebalance(course, dry=False):
    files = sorted(glob.glob(f"{course}/lesson_*.html"))
    before, after = Counter(), Counter()
    q = 0
    for f in files:
        s = open(f, encoding="utf-8").read()

        def fix_block(m):
            nonlocal q
            inner = m.group(2)
            buttons = BUTTON.findall(inner)
            if len(buttons) < 2 or BUTTON.sub("", inner).strip():
                return m.group(0)                       # unexpected markup: leave alone
            correct = [i for i, b in enumerate(buttons) if 'data-correct="true"' in b[1]]
            if len(correct) != 1:
                return m.group(0)
            n = len(buttons)
            before["ABCDE"[correct[0]]] += 1
            # deterministic, balanced target
            # each run of n questions uses every position once, in a seeded shuffled order
            perm = sorted(range(n), key=lambda k: hashlib.md5(f"{course}:{q // n}:{k}".encode()).hexdigest())
            target = perm[q % n]
            q += 1
            others = [b for i, b in enumerate(buttons) if i != correct[0]]
            order = others[:target] + [buttons[correct[0]]] + others[target:]
            after["ABCDE"[target]] += 1
            out = []
            for i, (ws, open_tag, text, close) in enumerate(order):
                text = LABEL.sub(lambda lm: f"{lm.group(1)}{'ABCDE'[i]})", text, count=1)
                out.append(f"{buttons[i][0]}{open_tag}{text}{close}")   # keep original spacing slots
            tail = BUTTON.sub("", inner)
            return m.group(1) + "".join(out) + tail + m.group(3)

        new = BLOCK.sub(fix_block, s)
        if new != s and not dry:
            open(f, "w", encoding="utf-8").write(new)
    print(f"{course:22s} {q:3d} questions  before {dict(sorted(before.items()))}  after {dict(sorted(after.items()))}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--dry"]
    for c in args:
        rebalance(c, dry="--dry" in sys.argv)
