import json, re

with open('src/data/apRiverGaugesData.ts', 'r') as f:
    content = f.read()

match = re.search(r'export const AP_OFFICIAL_RIVER_GAUGE_STATIONS: HydrologicalStation\[\] = (\[[\s\S]*?\]);', content)
if match:
    stations = json.loads(match.group(1))
    print(f"Loaded {len(stations)} stations")
    
    # Print distinct rivers and their sample locations
    rivers = {}
    for s in stations:
        r = s.get('riverName', 'Unknown')
        rivers.setdefault(r, []).append(s)
        
    print(f"Total distinct rivers/drains in document: {len(rivers)}")
    for r, st_list in sorted(rivers.items()):
        print(f"- {r} ({len(st_list)} stations): {[x['name'] for x in st_list[:3]]}")
