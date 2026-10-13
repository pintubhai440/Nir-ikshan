import re

with open('scripts/build-all-river-gauges.py', 'r') as f:
    text = f.read()

m = re.search(r'raw_rows = """([\s\S]*?)"""', text)
raw = m.group(1).strip()
lines = [l.strip() for l in raw.splitlines() if l.strip()]

print(f"Total raw document rows: {len(lines)}")
for i, line in enumerate(lines):
    parts = line.split('\t')
    print(f"{i+1:03d} | River: {parts[0].strip()} | Point: {parts[1].strip()} | Source: {parts[2].strip()}")
