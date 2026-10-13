with open('generate_accurate_265.py', 'r') as f:
    text = f.read()

old_obj = """    station_obj = {
        'id': clean_id,
        'name': f"{point_raw.replace('_', ' ').replace('-sw', '')} ({river_raw})",
        'code': point_raw,
        'category': 'river_level',
        'state': 'Andhra Pradesh',
        'district': district,
        'basin': basin,
        'riverName': river_raw,
        'agency': source_raw,
        'lat': round(lat, 4),
        'lng': round(lng, 4),
        'status': status,
        'statusLabel': status_label,
        'currentRiverLevelM': cur_level,
        'waterLevelDepthMBGL': depth_val,
        'lastUpdated': f"{date_raw} IST ({source_raw})",
        'trend': trend_raw,
        'dischargeCusecs': 1250 if cur_level and cur_level > 15 else 420,
        'gridStatus': 'ACTIVE_OFFICIAL_TELEMETRY',
        'governmentDossier': {
            'telemetryStation': point_raw,
            'riverSystem': river_raw,
            'reportingAgency': source_raw,
            'officialLocationDesc': description,
            'readingTimestamp': f"{date_raw} IST",
            'waterLevelStage': f"{cur_level} m" if cur_level else 'N/A',
            'waterLevelDepth': f"{depth_val} m" if depth_val else 'N/A',
            'flowTrend': trend_raw,
            'verificationStatus': '100% Geo-Referenced & Waterway Correlated'
        }
    }"""

new_obj = """    station_obj = {
        'id': clean_id,
        'name': f"{point_raw.replace('_', ' ').replace('-sw', '')} ({river_raw})",
        'code': point_raw,
        'category': 'river_level',
        'state': 'Andhra Pradesh',
        'district': district,
        'basin': basin,
        'riverName': river_raw,
        'agency': source_raw,
        'lat': round(lat, 4),
        'lng': round(lng, 4),
        'status': status,
        'statusLabel': status_label,
        'lastUpdated': f"{date_raw} IST ({source_raw})",
        'trend': trend_raw,
        'dischargeCusecs': 1250 if cur_level and cur_level > 15 else 420,
        'gridStatus': 'ACTIVE_OFFICIAL_TELEMETRY',
        'governmentDossier': {
            'telemetryStation': point_raw,
            'riverSystem': river_raw,
            'reportingAgency': source_raw,
            'officialLocationDesc': description,
            'readingTimestamp': f"{date_raw} IST",
            'waterLevelStage': f"{cur_level} m" if cur_level else 'N/A',
            'waterLevelDepth': f"{depth_val} m" if depth_val else 'N/A',
            'flowTrend': trend_raw,
            'verificationStatus': '100% Geo-Referenced & Waterway Correlated'
        }
    }
    if cur_level is not None:
        station_obj['currentRiverLevelM'] = cur_level
    if depth_val is not None:
        station_obj['waterLevelDepthMBGL'] = depth_val"""

text = text.replace(old_obj, new_obj)

with open('generate_accurate_265.py', 'w') as f:
    f.write(text)

print("Updated generator object logic!")
