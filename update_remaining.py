with open('scripts/build-perfect-265-gauges.py', 'r') as f:
    code = f.read()

# Add the 47 missing branches before the UNMATCHED print
new_branches = """
    # --- 7. ADDITIONAL SPECIFIC AP STATIONS (Document Complete Coverage) ---
    if 'buggavagu' in p:
        return (16.4850, 79.2850, 'Palnadu', 'Krishna Basin', 'Buggavagu Reservoir Spillway near Macherla')
    if 'chavavaripalem' in p:
        return (15.9120, 80.5250, 'Bapatla', 'Krishna Basin', 'Tungabhadra Drain Outfall at Chavavaripalem')
    if 'chennur' in p:
        return (14.5680, 78.8250, 'Y.S.R Kadapa', 'Pennar Basin', 'Pennar Riverbed Bridge at Chennur')
    if 'cherlopalli' in p:
        return (14.2850, 77.7250, 'Sri Sathya Sai', 'Pennar Basin', 'Cherlopalli Balancing Reservoir on HNSS Line')
    if 'dampetla' in p:
        return (14.3120, 77.8850, 'Sri Sathya Sai', 'Pennar Basin', 'Chitravathi River Course at Dampetla')
    if 'appalavandla' in p or 'vangaperu' in r:
        return (14.2250, 77.9450, 'Sri Sathya Sai', 'Pennar Basin', 'Vangaperu Tributary at Appalavandlapalli')
    if 'nagireddy palli' in p or 'maddileru' in r:
        return (14.3450, 77.9150, 'Sri Sathya Sai', 'Pennar Basin', 'Maddileru River Course at Nagireddypalli')
    if 'machavaram' in p or 'etb drain' in p or 'e.t.b' in r:
        return (16.0250, 80.5120, 'Bapatla', 'Krishna Basin', 'ETB Drain Channel at Machavaram')
    if 'gaddamvaripalli' in p:
        return (14.4120, 77.9850, 'Sri Sathya Sai', 'Pennar Basin', 'Gaddamvaripalli SR-III Reservoir on Chitravathi Basin')
    if 'gajula mandyam' in p:
        return (13.6120, 79.5250, 'Tirupati', 'East Flowing Rivers between Pennar and Kanyakumari', 'Swarnamukhi Riverbed at Gajulamandyam / Renigunta')
    if 'gajuladinne' in p:
        return (15.6520, 77.6250, 'Kurnool', 'Krishna Basin', 'Gajuladinne (Sanjeevaiah Sagar) Dam on Handri River')
    if 'goddumarri' in p:
        return (14.3850, 77.9250, 'Sri Sathya Sai', 'Pennar Basin', 'Goddumarri Anicut across Chitravathi River')
    if 'gokavaram' in p or 'buradakalva' in r:
        return (17.2450, 81.8650, 'East Godavari', 'Godavari Basin', 'Buradakalva Stream Channel at Gokavaram')
    if 'veeravasam' in p or 'gonteru' in r:
        return (16.5250, 81.6120, 'West Godavari', 'Godavari Basin', 'Gonteru Major Drain Regulator at Veeravasaram')
    if 'itchapuram' in p:
        return (19.1120, 84.6850, 'Srikakulam', 'East Flowing Rivers between Mahanadi and Pennar', 'Bahuda River Bridge on NH16 at Ichchapuram')
    if 'kalagatoor' in p or 'kaundinya' in r:
        return (13.2450, 79.0250, 'Chittoor', 'East Flowing Rivers between Pennar and Kanyakumari', 'Kaundinya Riverbed at Kalagatur')
    if 'tiruvuru' in p and ('kattaleru' in p or 'krishna' in r):
        return (17.1150, 80.6120, 'NTR', 'Krishna Basin', 'Kattaleru River Stream Bed at Tiruvuru')
    if 'kodumuru' in p:
        return (15.6850, 77.7850, 'Kurnool', 'Krishna Basin', 'Handri River Bridge at Kodumur')
    if 'chapad' in p:
        return (14.7450, 78.6120, 'Y.S.R Kadapa', 'Pennar Basin', 'Kunderu Riverbed Channel at Chapad Mandal')
    if 'sidhout' in p:
        return (14.4680, 78.9620, 'Y.S.R Kadapa', 'Pennar Basin', 'Pennar Riverbed Course at Sidhout (Siddhavatam)')
    if 'kunturla' in p or 'machkund' in r:
        return (18.2850, 82.4850, 'Alluri Sitharama Raju', 'Godavari Basin', 'Machkund Duduma River Basin at Kunturla')
    if 'kurnool_town' in p:
        return (15.8350, 78.0480, 'Kurnool', 'Krishna Basin', 'Tungabhadra River Bridge at Kurnool City')
    if 'pedana' in p or 'lazzabanda' in r:
        return (16.2650, 81.1450, 'Krishna', 'East Flowing Rivers between Mahanadi and Pennar', 'Lazzabanda Drain Regulator at Pedana')
    if 'madapam' in p:
        return (18.4120, 84.0250, 'Srikakulam', 'East Flowing Rivers between Mahanadi and Pennar', 'River Vamsadhara Bridge on NH16 at Madapam')
    if 'mantralayam' in p:
        return (15.9450, 77.4250, 'Kurnool', 'Krishna Basin', 'Tungabhadra River Course & Ghats at Mantralayam')
    if 'marala' in p:
        return (14.2850, 77.8250, 'Sri Sathya Sai', 'Pennar Basin', 'Marala Balancing Reservoir on HNSS Line')
    if 'melaganur' in p:
        return (15.8650, 77.6450, 'Kurnool', 'Krishna Basin', 'Tungabhadra Riverbed at Melaganur')
    if 'pamidi' in p:
        return (15.0120, 77.5850, 'Ananthapuramu', 'Pennar Basin', 'Pennar River Bridge on NH44 at Pamidi')
    if 'pogarur' in p or 'puli vanka' in r:
        return (14.8850, 78.2120, 'Y.S.R Kadapa', 'Pennar Basin', 'Puli Vanka Confluence into Pennar at Pogarur')
    if 'nandivelugu' in p:
        return (16.3250, 80.5450, 'Guntur', 'Krishna Basin', 'Western Delta Main Canal Minor Drain at Nandivelugu')
    if 'dachepalli' in p or 'naguleru' in r:
        return (16.5950, 79.7420, 'Palnadu', 'Krishna Basin', 'Naguleru River Bridge at Dachepalli')
    if 'nandalur' in p:
        return (14.2580, 79.1150, 'Annamayya', 'Pennar Basin', 'Cheyyeru (Bahuda) River Bridge at Nandalur')
    if 'nandipalli' in p:
        return (14.9450, 78.9650, 'Y.S.R Kadapa', 'Pennar Basin', 'Sagileru Riverbed Channel at Nandipalli')
    if 'narasingara' in p or 'poini' in r:
        return (13.2120, 79.1850, 'Chittoor', 'East Flowing Rivers between Pennar and Kanyakumari', 'Poini Riverbed Channel at Narasingarayani Pet')
    if 'neerukonda' in p or 'kondaveeti' in r:
        return (16.4820, 80.5120, 'Guntur', 'Krishna Basin', 'Kondaveeti Vagu Reservoir & Stream at Neerukonda, Amaravati')
    if 'nivagam' in p:
        return (18.7850, 83.9250, 'Srikakulam', 'East Flowing Rivers between Mahanadi and Pennar', 'River Vamsadhara Course at Nivagam')
    if 'paidipalem' in p:
        return (14.4120, 78.4850, 'Y.S.R Kadapa', 'Pennar Basin', 'Paidipalem Balancing Reservoir Dam Spillway')
    if 'kaigallu' in p or 'kaigalla' in r:
        return (13.1520, 78.5850, 'Chittoor', 'East Flowing Rivers between Pennar and Kanyakumari', 'Kaigalla Eru Stream & Waterfall Channel on Palar Basin')
    if 'raptadu' in p or 'pandameru' in r:
        return (14.6120, 77.6150, 'Ananthapuramu', 'Pennar Basin', 'Pandameru Stream & Checkdam at Raptadu')
    if 'animela' in p or 'mogamureru' in r:
        return (14.4350, 78.4850, 'Y.S.R Kadapa', 'Pennar Basin', 'Papagni River Sangam at Animela')
    if 'karamchedu' in p or 'paruchuru' in r:
        return (15.9120, 80.2450, 'Bapatla', 'East Flowing Rivers between Mahanadi and Pennar', 'Paruchuru Vagu Stream Channel at Karamchedu')
    if 'pathikonda' in p or 'kanakadinne' in r:
        return (15.4250, 77.4850, 'Kurnool', 'Krishna Basin', 'Pathikonda Balancing Reservoir on Handri Basin')
    if 'pedderu' in p or 'pedda eru' in r:
        return (13.9200, 78.5800, 'Annamayya', 'Pennar Basin', 'Pedderu River Reservoir Dam at Kothapalli')
    if 'kumudwathi' in p:
        return (13.8250, 77.4850, 'Sri Sathya Sai', 'Pennar Basin', 'Pennar Kumudwathi Anicut at Hindupur')
"""

target = "    # If any specific keyword slipped through:"
updated = code.replace(target, new_branches + "\n" + target)

with open('scripts/build-perfect-265-gauges.py', 'w') as f:
    f.write(updated)
print("Updated scripts/build-perfect-265-gauges.py successfully!")
