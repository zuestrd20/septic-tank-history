"""Buildless content/link checks; uses only Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from collections import Counter

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = []; self.anchors = []; self.eras = []; self.steps = []; self.assets = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if a.get('href', '').startswith('#') and a['href'] != '#': self.anchors.append(a['href'][1:])
        if 'data-era' in a: self.eras.append(a['data-era'])
        if 'data-step-button' in a: self.steps.append(a['data-step-button'])
        if tag == 'script': self.assets.append(a['src'].split('?')[0])
        if tag == 'link' and a.get('rel') == 'stylesheet': self.assets.append(a['href'].split('?')[0])

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
p = Page(); p.feed(html)
assert not [x for x, n in Counter(p.ids).items() if n > 1], 'Duplicate IDs'
assert set(p.anchors) <= set(p.ids), 'Broken internal anchors'
assert p.eras == ['early', 'modern', 'modern', 'modern', 'modern', 'today', 'today']
assert p.steps == ['0', '1', '2', '3']
assert all(f's{i}' in p.ids for i in range(1, 10)), 'Missing original bibliography source'
assert all((root / f).is_file() for f in p.assets)
assert '不是乾淨水，更不是飲用水' in html and '<noscript>' in html
assert 'prefers-reduced-motion:reduce' in (root / 'style.css').read_text()
print('PASS: IDs, internal links, 7 history nodes, 9 original sources, 4 steps, assets, safety and no-JS fallback.')
