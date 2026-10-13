import json, re

with open('src/data/apRiverGaugesData.ts') as f:
    text = f.read()

m = re.search(r'export const AP_OFFICIAL_RIVER_GAUGE_STATIONS: HydrologicalStation\[\] = (\[[\s\S]*?\]);', text)
stations = json.loads(m.group(1))

# Check stations with identical coordinates
seen = {}
for s in stations:
    loc = (round(s['lat'], 4), round(s['lng'], 4))
    seen.setdefault(loc, []).append(s['name'] + f" ({s['riverName']})")

multiples = {k: v for k, v in seen.items() if len(v) > 1}
print(f"Total points with shared coordinates: {len(multiples)}")
for loc, names in multiples.items():
    print(f"{loc}: {names}")
