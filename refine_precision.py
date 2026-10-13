with open('scripts/build-perfect-265-gauges.py', 'r') as f:
    text = f.read()

precision_rules = """
    # --- ULTRA-PRECISE SPECIFIC LOCALITY OVERRIDES ---
    if 'buggavanka' in p:
        return (14.3975, 78.8375, 'Y.S.R Kadapa', 'Pennar Basin', 'Buggavanka Reservoir Dam Spillway at Kadapa')
    if 'gudluru' in p and ('manneru' in r or 'upputeru' in r):
        return (15.0250, 79.9150, 'Sri Potti Sriramulu Nellore', 'East Flowing Rivers between Mahanadi and Pennar', 'Manneru Stream Bridge at Gudluru')
    if 'pambaleru' in p or ('guduru' in p and 'pambaleru' in r):
        return (14.1480, 79.8450, 'Tirupati', 'East Flowing Rivers between Pennar and Kanyakumari', 'Pambaleru River Bridge at Guduru')
    if 'kamalapuram' in p:
        return (14.5950, 78.6750, 'Y.S.R Kadapa', 'Pennar Basin', 'Papagni-Pennar Sangam Riverbed at Kamalapuram')
    if 'nandimandalam' in p:
        return (14.4820, 78.5820, 'Y.S.R Kadapa', 'Pennar Basin', 'Papagni Riverbed Channel at Nandimandalam')
    if 't.sadum' in p or 'sadum' in p:
        return (13.6850, 78.5450, 'Annamayya', 'Pennar Basin', 'Papagni Riverbed Water Point at T.Sadum')
    if 'pincha' in p and 'project' in p:
        return (14.1250, 79.0850, 'Annamayya', 'Pennar Basin', 'Pincha Project Dam Spillway on Pincha River')
    if 'bodumalluvaripalle' in p:
        return (14.1850, 79.1450, 'Annamayya', 'Pennar Basin', 'Pincha Riverbed Channel at Bodumalluvaripalle')
    if 'chitvel' in p:
        return (14.1820, 79.3450, 'Annamayya', 'Pennar Basin', 'Gunjaneru Stream Bed at Chitvel')
    if 'gundluru' in p:
        return (14.2850, 79.2250, 'Annamayya', 'Pennar Basin', 'Cheyyeru Riverbed Channel at Gundluru')
    if 'pendekallu' in p:
        return (15.3450, 77.7250, 'Kurnool', 'Krishna Basin', 'Pendekallu Balancing Reservoir Dam Spillway')
    if 'rajupalem' in p:
        return (17.1850, 82.1520, 'Kakinada', 'East Flowing Rivers between Mahanadi and Pennar', 'Maderu Stream Channel at Rajupalem')
    if 'dokkapalem' in p:
        return (17.1720, 82.1650, 'Kakinada', 'East Flowing Rivers between Mahanadi and Pennar', 'Maderu Stream Channel at Dokkapalem')
"""

target = "def get_pinpoint_geo(river, point):\n    p = point.lower().strip()\n    r = river.lower().strip()"
updated = text.replace(target, target + "\n" + precision_rules)

with open('scripts/build-perfect-265-gauges.py', 'w') as f:
    f.write(updated)
print("Injected precision rules successfully!")
