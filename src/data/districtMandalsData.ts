/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Official 26 Districts of Andhra Pradesh Mandal Catalog
 * Used for dynamic jurisdictional mapping, field inspector assignments,
 * and micro-watershed command across all 26 districts of Andhra Pradesh.
 */

export const AP_26_DISTRICTS_MANDALS: Record<string, string[]> = {
  'Srikakulam': [
    'Srikakulam', 'Amadalavalasa', 'Narasannapeta', 'Tekkali', 'Palasa', 'Sompeta', 
    'Ichchapuram', 'Kotabommali', 'Ponduru', 'Gara', 'Polaki', 'Jalumuru', 
    'Sarubujjili', 'Laveru', 'Ranastalam', 'Mandasa', 'Vajrapukothuru', 'Santhabommali'
  ],
  'Parvathipuram Manyam': [
    'Parvathipuram', 'Palakonda', 'Salur', 'Seethampeta', 'Gummalaxmipuram', 
    'Garugubilli', 'Komarada', 'Kurupam', 'Jiyyammavalasa', 'Balijipeta', 
    'Makkuva', 'Pachipenta', 'Veeraghattam', 'Bhamini', 'Jiyyammavalasa'
  ],
  'Vizianagaram': [
    'Vizianagaram', 'Bobbili', 'Cheepurupalli', 'Gajapathinagaram', 'Nellimarla', 
    'Srungavarapukota', 'Kothavalasa', 'Denkada', 'Gantyada', 'Bhogapuram', 
    'Pusapatirega', 'Dattirajeru', 'Garividi', 'Merakamudidam', 'Vepada', 'L.Kota'
  ],
  'Visakhapatnam': [
    'Visakhapatnam Urban', 'Maharanipeta', 'Gajuwaka', 'Anandapuram', 'Bheemunipatnam', 
    'Pendurthi', 'Padmanabham', 'Gopalapatnam', 'Mulagada', 'Seethammadhara', 'Pedagantyada'
  ],
  'Alluri Sitharama Raju': [
    'Paderu', 'Araku Valley', 'Ananthagiri', 'Chintapalli', 'Rampachodavaram', 
    'Maredumilli', 'Addateegala', 'Devipatnam', 'Dumbriguda', 'Hukumpeta', 
    'G.Madugula', 'Koyyuru', 'Y.Ramavaram', 'Rajavommangi'
  ],
  'Anakapalli': [
    'Anakapalli', 'Chodavaram', 'Kasimkota', 'Parawada', 'Atchutapuram', 
    'Elamanchili', 'Nakkapalli', 'Payakaraopeta', 'Madugula', 'Devarapalle', 
    'K.Kotapadu', 'Munagapaka', 'Rambilli', 'S.Rayavaram'
  ],
  'Kakinada': [
    'Kakinada Urban', 'Kakinada Rural', 'Samalkota', 'Pithapuram', 'Peddapuram', 
    'Tuni', 'Prathipadu', 'Thondangi', 'Gollaprolu', 'Karapa', 'Shankhavaram', 'U.Kothapalli'
  ],
  'East Godavari': [
    'Rajahmundry Urban', 'Rajahmundry Rural', 'Kadiam', 'Korukonda', 'Gokavaram', 
    'Rajanagaram', 'Nidadavole', 'Kovvur', 'Chagallu', 'Devarapalle', 'Gopalapuram', 'Tallapudi'
  ],
  'Dr. B.R. Ambedkar Konaseema': [
    'Amalapuram', 'Ravulapalem', 'Kothapeta', 'Razole', 'Ramachandrapuram', 
    'Mandapeta', 'Mummidivaram', 'Allavaram', 'P.Gannavaram', 'Ainavilli', 
    'Malikipuram', 'Sakhinetipalli', 'Katrenikona'
  ],
  'West Godavari': [
    'Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Palakollu', 'Narasapuram', 
    'Akividu', 'Mogalthur', 'Undi', 'Penugonda', 'Attili', 'Achanta', 'Veeravasaram', 'Kalla'
  ],
  'Eluru': [
    'Eluru', 'Jangareddygudem', 'Chintalapudi', 'Nuzvid', 'Kaikaluru', 
    'Denduluru', 'Pedavegi', 'Pedapadu', 'Polavaram', 'Buttayagudem', 'Jeelugumilli', 'Mandavalli'
  ],
  'Krishna': [
    'Machilipatnam', 'Gudivada', 'Pamarru', 'Avanigadda', 'Movva', 'Challapalli', 
    'Nagayalanka', 'Pedana', 'Bantumilli', 'Kruthivennu', 'Ghantasala', 'Mopidevi', 'Guduru'
  ],
  'NTR': [
    'Vijayawada Urban', 'Vijayawada Rural', 'Mylavaram', 'Nandigama', 'Jaggayyapeta', 
    'Tiruvuru', 'Ibrahimpatnam', 'Vissannapeta', 'G.Konduru', 'Kanchikacherla', 'Penuganchiprolu'
  ],
  'Guntur': [
    'Guntur East', 'Guntur West', 'Tenali', 'Mangalagiri', 'Tadepalli', 'Tadikonda', 
    'Ponnur', 'Chebrolu', 'Pedakakani', 'Prathipadu', 'Vatticherukuru', 'Medikonduru', 'Duggirala'
  ],
  'Bapatla': [
    'Bapatla', 'Chirala', 'Repalle', 'Vemuru', 'Parchur', 'Addanki', 'Karamchedu', 
    'Chinaganjam', 'Vetapalem', 'Bhattiprolu', 'Nizampatnam', 'Nagaram', 'Tsundur', 'Amruthalur'
  ],
  'Palnadu': [
    'Narasaraopet', 'Sattenapalle', 'Vinukonda', 'Macherla', 'Gurazala', 'Chilakaluripet', 
    'Piduguralla', 'Dachepalle', 'Bellamkonda', 'Rajupalem', 'Krosuru', 'Nekarikallu', 'Rompicherla'
  ],
  'Prakasam': [
    'Ongole', 'Kandukur', 'Markapur', 'Giddalur', 'Kanigiri', 'Podili', 'Singarayakonda', 
    'Kothapatnam', 'Tangutur', 'Maddipadu', 'Chimakurthy', 'Bestavaripeta', 'Yerragondapalem'
  ],
  'Sri Potti Sriramulu Nellore': [
    'Nellore Urban', 'Nellore Rural', 'Kavali', 'Kovur', 'Atmakur', 'Udayagiri', 
    'Allur', 'Indukurpet', 'Buchireddypalem', 'Dagadarthi', 'Sangam', 'Podalakur', 'Rapur'
  ],
  'Kurnool': [
    'Kurnool Urban', 'Kurnool Rural', 'Yemmiganur', 'Adoni', 'Kodumur', 'Alur', 
    'Pattikonda', 'Mantralayam', 'C.Belagal', 'Gudur', 'Kallur', 'Veldurthi', 'Aspari', 'Holagunda'
  ],
  'Nandyal': [
    'Nandyal', 'Allagadda', 'Banaganapalle', 'Dhone', 'Nandikotkur', 'Atmakur', 
    'Srisailam', 'Bethamcherla', 'Koilkuntla', 'Panyam', 'Gospadu', 'Sanjamala', 'Kolimigundla'
  ],
  'Ananthapuramu': [
    'Anantapur Urban', 'Anantapur Rural', 'Guntakal', 'Tadipatri', 'Uravakonda', 
    'Kalyandurg', 'Rayadurg', 'Singanamala', 'Pamidi', 'Peddapappur', 'Garladinne', 'Kudair'
  ],
  'Sri Sathya Sai': [
    'Puttaparthi', 'Dharmavaram', 'Kadiri', 'Hindupur', 'Penukonda', 'Madakasira', 
    'Bukkapatnam', 'Kothacheruvu', 'Gorantla', 'Somandepalli', 'Chilamathur', 'Amarapuram'
  ],
  'YSR Kadapa': [
    'Kadapa', 'Proddatur', 'Pulivendula', 'Jammalamadugu', 'Badvel', 'Kamalapuram', 
    'Mydukur', 'Vempalli', 'Chennur', 'Vallur', 'Khajipet', 'Pendlimarri', 'Chakrayapet'
  ],
  'Annamayya': [
    'Rayachoti', 'Madanapalle', 'Rajampet', 'Railway Kodur', 'Pileru', 'Thamballapalle', 
    'Kalikiri', 'Valmikipuram', 'Gurramkonda', 'B.Kothakota', 'Nimmanapalle', 'Ramapuram'
  ],
  'Tirupati': [
    'Tirupati Urban', 'Tirupati Rural', 'Srikalahasti', 'Chandragiri', 'Venkatagiri', 
    'Gudur', 'Sullurpeta', 'Naidupeta', 'Renigunta', 'Yerpedu', 'Pakala', 'Puttur', 'Satyavedu'
  ],
  'Chittoor': [
    'Chittoor', 'Punganur', 'Palamaner', 'Kuppam', 'Bangarupalem', 'Gudipala', 
    'GD Nellore', 'Vedurukuppam', 'Karvetinagar', 'Ramakuppam', 'Santhipuram', 'Nagari'
  ],
};

/**
 * Returns mandal list for given district, with fallback.
 */
export function getMandalsForDistrict(districtName: string): string[] {
  if (!districtName) return AP_26_DISTRICTS_MANDALS['Vizianagaram'];
  
  // Direct match
  if (AP_26_DISTRICTS_MANDALS[districtName]) {
    return AP_26_DISTRICTS_MANDALS[districtName];
  }

  // Case-insensitive / partial match
  const key = Object.keys(AP_26_DISTRICTS_MANDALS).find(
    (k) => k.toLowerCase() === districtName.toLowerCase() ||
           districtName.toLowerCase().includes(k.toLowerCase()) ||
           k.toLowerCase().includes(districtName.toLowerCase())
  );

  return key ? AP_26_DISTRICTS_MANDALS[key] : ['Central', 'North', 'South', 'East', 'West'];
}
