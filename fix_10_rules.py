with open('generate_accurate_265.py', 'r') as f:
    code = f.read()

# Add specific top-level overrides at the very start of get_station_geo:
top_overrides = """def get_station_geo(idx, river, point):
    r = river.strip().lower()
    p = point.strip().lower()

    # --- TOP-LEVEL SPECIFIC POINT OVERRIDES ---
    if 'vangaperu' in r or 'appalavandla' in p:
        return (14.4850, 77.8850, 'Sri Sathya Sai', 'Pennar Basin', 'Vangaperu Stream Confluence at Appalavandlapalle')
    if 'maddileru' in r or 'nagireddy' in p:
        return (14.3550, 77.8250, 'Sri Sathya Sai', 'Pennar Basin', 'Maddileru Stream at Nagireddypalli')
    if 'kalyani' in r or 'kalyani' in p:
        if '2' in p:
            return (13.6620, 79.2820, 'Tirupati', 'Pennar Basin', 'Kalyani Dam Spillway-2 on Swarnamukhi Tributary')
        return (13.6600, 79.2800, 'Tirupati', 'Pennar Basin', 'Kalyani Dam Spillway-1 on Swarnamukhi Tributary')
    if 'sidhout' in p:
        return (14.4450, 78.9650, 'Y.S.R. Kadapa', 'Pennar Basin', 'Kunderu-Pennar Confluence Downstream at Sidhout')
    if 'mogamureru' in r or 'animela' in p:
        return (14.4450, 78.4850, 'Y.S.R. Kadapa', 'Pennar Basin', 'Mogamureru / Papagni Confluence at Animela Sangam')
    if 'pedda eru' in r or ('pedderu' in p and ('2' in p or p.endswith('-sw'))):
        if '2' in p:
            return (13.9220, 78.5820, 'Annamayya', 'Pennar Basin', 'Pedderu Reservoir Dam Spillway-2')
        if 'sri tenneti' not in p and 'jampana' not in p:
            return (13.9200, 78.5800, 'Annamayya', 'Pennar Basin', 'Pedderu Reservoir Dam Spillway-1 at Kothakota')
    if 'prakasam_barrage' in p or ('prakasam' in p and 'aprg' in p):
        return (16.5085, 80.6055, 'NTR District', 'Krishna Basin', 'Prakasam Barrage Official Telemetry Site')
    if 'satyasaiganga' in r or 'kommipadu' in p:
        return (15.2150, 79.8450, 'Prakasam', 'Pennar Basin', 'Upputeru Canal Regulator at Kommipadu (TGP)')
    if 'maderu' in r or 'dokkapalem' in p or 'rajupalem' in p:
        return (17.3650, 82.2150, 'Kakinada', 'Godavari Basin', 'Maderu Stream / Yeleru Course at Dokkapalem')
"""

code = code.replace("def get_station_geo(idx, river, point):\n    r = river.strip().lower()\n    p = point.strip().lower()", top_overrides)

with open('generate_accurate_265.py', 'w') as f:
    f.write(code)

print("Injected top overrides!")
