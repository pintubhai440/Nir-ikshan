import re, json

with open('scripts/build-all-river-gauges.py') as f:
    text = f.read()

m = re.search(r'raw_rows = """([\s\S]*?)"""', text)
raw = m.group(1).strip()
rows = [r.strip().split('\t') for r in raw.split('\n') if r.strip()]

print(f"Loaded {len(rows)} rows from document.")
