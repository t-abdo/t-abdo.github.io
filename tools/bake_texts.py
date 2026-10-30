"""
Writes the copy from src/content/texts.js into index.html, and writes the
Portuguese page, pt/index.html, from the same markup.

The page fills its text from texts.js when it starts (src/scripts/i18n.js), but
anything that reads the HTML without running it — link previews on LinkedIn,
WhatsApp or Slack, search engines — would otherwise find every title, label
and paragraph empty. Baking the same values into the markup also means the
cards are never seen blank before the scripts run.

Run it after editing texts.js:

    python3 tools/bake_texts.py

It is safe to run again and again: each element's text is replaced, not added
to. Only the elements marked with data-i18n, data-i18n-html or data-i18n-attr
are touched, and the rest of the file is left byte for byte as it was.

index.html is the one to edit. pt/index.html is generated from it every run
and overwritten, so a change made there by hand is lost: it is the same page
with the Portuguese text, <html lang="pt-BR">, and a <base> that points its
links back at the site's root, so assets and scripts are shared.
"""

import json
import subprocess
import sys
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
PT_HTML = ROOT / "pt" / "index.html"
TEXTS = ROOT / "src" / "content" / "texts.js"

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "source", "track", "wbr"}


def load_texts():
    """texts.js is a real module, so it is evaluated by a JavaScript engine
    (the one macOS ships, through osascript) rather than parsed by hand."""
    script = f"""
      const src = $.NSString.stringWithContentsOfFileEncodingError(
        {json.dumps(str(TEXTS))}, $.NSUTF8StringEncoding, null).js;
      const TEXTS = eval('(' + src.replace(/^[\\s\\S]*?export const TEXTS =/, '').replace(/;\\s*$/, '') + ')');
      JSON.stringify(TEXTS);
    """
    out = subprocess.run(["osascript", "-l", "JavaScript", "-e", script],
                         capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def lookup(texts, key, lang):
    node = texts
    for part in key.split("."):
        node = node.get(part) if isinstance(node, dict) else None
    if not isinstance(node, dict):
        raise KeyError(key)
    value = node.get(lang, node.get("en"))
    if value is None:
        raise KeyError(key)
    return value


class Finder(HTMLParser):
    """Records where each marked element's start tag and content sit in the
    source, so they can be rewritten in place."""

    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        for m in re.finditer("\n", source):
            self.lines.append(m.end())
        self.stack = []
        self.found = []

    def source_offset(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.source_offset()
        text = self.get_starttag_text()
        attrs = dict(attrs)
        entry = None
        if any(k in attrs for k in ("data-i18n", "data-i18n-html", "data-i18n-attr")):
            entry = {"start": start, "tag_end": start + len(text), "tag_text": text,
                     "attrs": attrs, "end": None}
            self.found.append(entry)
        if tag not in VOID:
            self.stack.append((tag, entry))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        at = self.source_offset()
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for _, entry in self.stack[i:]:
                    if entry is not None and entry["end"] is None:
                        entry["end"] = at
                del self.stack[i:]
                return


def set_attr(tag_text, name, value):
    value = escape(value, quote=True)
    pattern = re.compile(r'(\s' + re.escape(name) + r')="[^"]*"')
    if pattern.search(tag_text):
        return pattern.sub(lambda m: f'{m.group(1)}="{value}"', tag_text, count=1)
    close = "/>" if tag_text.endswith("/>") else ">"
    return tag_text[: -len(close)] + f' {name}="{value}"' + close


def bake_page(source, texts, lang):
    """The page in one language, and how many elements were filled."""
    finder = Finder(source)
    finder.feed(source)
    finder.close()

    edits = []
    missing = []
    for e in finder.found:
        attrs = e["attrs"]
        try:
            tag_text = e["tag_text"]
            for pair in filter(None, (attrs.get("data-i18n-attr") or "").split(";")):
                name, key = pair.split(":", 1)
                tag_text = set_attr(tag_text, name.strip(), lookup(texts, key.strip(), lang))
            if "data-i18n" in attrs:
                content = escape(lookup(texts, attrs["data-i18n"], lang), quote=False)
            elif "data-i18n-html" in attrs:
                content = lookup(texts, attrs["data-i18n-html"], lang)
            else:
                content = None
        except KeyError as err:
            missing.append(str(err))
            continue
        if content is not None and e["end"] is None:
            sys.exit(f"Could not find where the element at offset {e['start']} ends.")
        if content is None:
            edits.append((e["start"], e["tag_end"], tag_text))
        else:
            edits.append((e["start"], e["end"], tag_text + content))

    if missing:
        print("Keys not found in texts.js:", ", ".join(sorted(set(missing))))

    # Text that replaces an element's content also replaces any marked element
    # inside it, just as it does in the browser, so those are dropped.
    edits.sort()
    kept = []
    for edit in edits:
        if kept and edit[0] < kept[-1][1]:
            continue
        kept.append(edit)

    out = []
    at = 0
    for start, end, text in kept:
        out.append(source[at:start])
        out.append(text)
        at = end
    out.append(source[at:])
    return "".join(out), len(kept)


def portuguese(page):
    """The Portuguese page lives one folder down and shares everything else:
    its <base> sends every relative link, the ones scripts build included,
    back to the root."""
    page, n = re.subn(r'<html lang="[^"]*">', '<html lang="pt-BR">', page, count=1)
    if not n:
        sys.exit('index.html has no <html lang="..."> to set.')
    head = "<head>\n"
    if head not in page:
        sys.exit("index.html has no <head> to add the <base> to.")
    note = ("  <!-- Generated by tools/bake_texts.py from index.html: edit that file,"
            " not this one. -->\n  <base href=\"../\">\n")
    return page.replace(head, head + note, 1)


def write(path, page, label):
    if path.exists() and path.read_text(encoding="utf-8") == page:
        print(f"{label} already up to date.")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page, encoding="utf-8")
    print(f"{label} updated.")


def bake():
    texts = load_texts()
    source = HTML.read_text(encoding="utf-8")
    english, n = bake_page(source, texts, "en")
    write(HTML, english, f"index.html ({n} elements)")
    portuguese_page, _ = bake_page(english, texts, "pt")
    write(PT_HTML, portuguese(portuguese_page), "pt/index.html")


if __name__ == "__main__":
    bake()
