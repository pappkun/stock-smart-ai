'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
// ⚠️ บรรทัดนี้สำคัญมาก! ห้ามลบเด็ดขาด เพราะคือตัวจัดการความสวยงามของแผนที่
import 'leaflet/dist/leaflet.css'; 

const engToThaiMap: Record<string, string> = {
  'Amnat Charoen': 'อำนาจเจริญ', 'Ang Thong': 'อ่างทอง', 'Bangkok': 'กรุงเทพมหานคร',
  'Bueng Kan': 'บึงกาฬ', 'Buri Ram': 'บุรีรัมย์', 'Chachoengsao': 'ฉะเชิงเทรา',
  'Chai Nat': 'ชัยนาท', 'Chaiyaphum': 'ชัยภูมิ', 'Chanthaburi': 'จันทบุรี',
  'Chiang Mai': 'เชียงใหม่', 'Chiang Rai': 'เชียงราย', 'Chon Buri': 'ชลบุรี',
  'Chumphon': 'ชุมพร', 'Kalasin': 'กาฬสินธุ์', 'Kamphaeng Phet': 'กำแพงเพชร',
  'Kanchanaburi': 'กาญจนบุรี', 'Khon Kaen': 'ขอนแก่น', 'Krabi': 'กระบี่',
  'Lampang': 'ลำปาง', 'Lamphun': 'ลำพูน', 'Loei': 'เลย', 'Lop Buri': 'ลพบุรี',
  'Mae Hong Son': 'แม่ฮ่องสอน', 'Maha Sarakham': 'มหาสารคาม', 'Mukdahan': 'มุกดาหาร',
  'Nakhon Nayok': 'นครนายก', 'Nakhon Pathom': 'นครปฐม', 'Nakhon Phanom': 'นครพนม',
  'Nakhon Ratchasima': 'นครราชสีมา', 'Nakhon Sawan': 'นครสวรรค์', 'Nakhon Si Thammarat': 'นครศรีธรรมราช',
  'Nan': 'น่าน', 'Narathiwat': 'นราธิวาส', 'Nong Bua Lam Phu': 'หนองบัวลำภู',
  'Nong Khai': 'หนองคาย', 'Nonthaburi': 'นนทบุรี', 'Pathum Thani': 'ปทุมธานี',
  'Pattani': 'ปัตตานี', 'Phangnga': 'พังงา', 'Phatthalung': 'พัทลุง', 'Phayao': 'พะเยา',
  'Phetchabun': 'เพชรบูรณ์', 'Phetchaburi': 'เพชรบุรี', 'Phichit': 'พิจิตร',
  'Phitsanulok': 'พิษณุโลก', 'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา', 'Phrae': 'แพร่',
  'Phuket': 'ภูเก็ต', 'Prachin Buri': 'ปราจีนบุรี', 'Prachuap Khiri Khan': 'ประจวบคีรีขันธ์',
  'Ranong': 'ระนอง', 'Ratchaburi': 'ราชบุรี', 'Rayong': 'ระยอง', 'Roi Et': 'ร้อยเอ็ด',
  'Sa Kaeo': 'สระแก้ว', 'Sakon Nakhon': 'สกลนคร', 'Samut Prakan': 'สมุทรปราการ',
  'Samut Sakhon': 'สมุทรสาคร', 'Samut Songkhram': 'สมุทรสงคราม', 'Saraburi': 'สระบุรี',
  'Satun': 'สตูล', 'Si Sa Ket': 'ศรีสะเกษ', 'Sing Buri': 'สิงห์บุรี', 'Songkhla': 'สงขลา',
  'Sukhothai': 'สุโขทัย', 'Suphan Buri': 'สุพรรณบุรี', 'Surat Thani': 'สุราษฎร์ธานี',
  'Surin': 'สุรินทร์', 'Tak': 'ตาก', 'Trang': 'ตรัง', 'Trat': 'ตราด',
  'Ubon Ratchathani': 'อุบลราชธานี', 'Udon Thani': 'อุดรธานี', 'Uthai Thani': 'อุทัยธานี',
  'Uttaradit': 'อุตรดิตถ์', 'Yala': 'ยะลา', 'Yasothon': 'ยโสธร'
};

const peaRegionMap: Record<string, string> = {
  'เชียงใหม่': 'กฟน.1', 'ลำพูน': 'กฟน.1', 'ลำปาง': 'กฟน.1', 'เชียงราย': 'กฟน.1', 'พะเยา': 'กฟน.1', 'แม่ฮ่องสอน': 'กฟน.1',
  'พิษณุโลก': 'กฟน.2', 'พิจิตร': 'กฟน.2', 'กำแพงเพชร': 'กฟน.2', 'ตาก': 'กฟน.2', 'สุโขทัย': 'กฟน.2', 'แพร่': 'กฟน.2', 'น่าน': 'กฟน.2', 'อุตรดิตถ์': 'กฟน.2',
  'ลพบุรี': 'กฟน.3', 'สิงห์บุรี': 'กฟน.3', 'ชัยนาท': 'กฟน.3', 'นครสวรรค์': 'กฟน.3', 'อุทัยธานี': 'กฟน.3', 'เพชรบูรณ์': 'กฟน.3',
  'อุดรธานี': 'กฟฉ.1', 'ขอนแก่น': 'กฟฉ.1', 'หนองบัวลำภู': 'กฟฉ.1', 'เลย': 'กฟฉ.1', 'หนองคาย': 'กฟฉ.1', 'บึงกาฬ': 'กฟฉ.1', 'สกลนคร': 'กฟฉ.1', 'นครพนม': 'กฟฉ.1',
  'อุบลราชธานี': 'กฟฉ.2', 'ศรีสะเกษ': 'กฟฉ.2', 'ยโสธร': 'กฟฉ.2', 'อำนาจเจริญ': 'กฟฉ.2', 'ร้อยเอ็ด': 'กฟฉ.2', 'กาฬสินธุ์': 'กฟฉ.2', 'มหาสารคาม': 'กฟฉ.2', 'มุกดาหาร': 'กฟฉ.2',
  'นครราชสีมา': 'กฟฉ.3', 'บุรีรัมย์': 'กฟฉ.3', 'สุรินทร์': 'กฟฉ.3', 'ชัยภูมิ': 'กฟฉ.3',
  'พระนครศรีอยุธยา': 'กฟก.1', 'อ่างทอง': 'กฟก.1', 'สระบุรี': 'กฟก.1', 'ปทุมธานี': 'กฟก.1', 'ปราจีนบุรี': 'กฟก.1', 'นครนายก': 'กฟก.1', 'สระแก้ว': 'กฟก.1',
  'ชลบุรี': 'กฟก.2', 'ระยอง': 'กฟก.2', 'จันทบุรี': 'กฟก.2', 'ตราด': 'กฟก.2', 'ฉะเชิงเทรา': 'กฟก.2',
  'นครปฐม': 'กฟก.3', 'สมุทรสาคร': 'กฟก.3', 'สมุทรสงคราม': 'กฟก.3', 'สุพรรณบุรี': 'กฟก.3', 'กาญจนบุรี': 'กฟก.3', 'ราชบุรี': 'กฟก.3',
  'เพชรบุรี': 'กฟต.1', 'ประจวบคีรีขันธ์': 'กฟต.1', 'ชุมพร': 'กฟต.1', 'ระนอง': 'กฟต.1',
  'นครศรีธรรมราช': 'กฟต.2', 'สุราษฎร์ธานี': 'กฟต.2', 'กระบี่': 'กฟต.2', 'พังงา': 'กฟต.2', 'ภูเก็ต': 'กฟต.2', 'ตรัง': 'กฟต.2',
  'ยะลา': 'กฟต.3', 'ปัตตานี': 'กฟต.3', 'นราธิวาส': 'กฟต.3', 'สงขลา': 'กฟต.3', 'สตูล': 'กฟต.3', 'พัทลุง': 'กฟต.3'
};

const riskData: Record<string, string> = {
  'นครศรีธรรมราช': 'critical',
  'ชลบุรี': 'warning',
  'สุราษฎร์ธานี': 'warning',
};

// ฟังก์ชันดึงชื่อและแปลภาษา
const getThaiProvinceName = (feature: any) => {
  if (!feature.properties) return '';
  // เช็คทุกชื่อที่เป็นไปได้ใน GeoJSON หลายๆ แบบ
  const rawName = feature.properties.shapeName || feature.properties.name_th || feature.properties.pro_th || feature.properties.name || '';
  return engToThaiMap[rawName] || rawName;
};

// ฟังก์ชันกำหนดสี
const getStyle = (feature: any) => {
  const provinceName = getThaiProvinceName(feature);
  const peaRegion = peaRegionMap[provinceName];
  const riskLevel = riskData[provinceName] || 'optimal';

  // พื้นที่ กฟน. (กทม, นนทบุรี, สมุทรปราการ)
  if (!peaRegion) {
    return {
      fillColor: '#1e293b', 
      weight: 1,
      color: '#334155', 
      fillOpacity: 0.5
    };
  }

  let fillColor = '#10b981'; // เขียว
  if (riskLevel === 'critical') fillColor = '#ef4444'; // แดง
  if (riskLevel === 'warning') fillColor = '#f59e0b'; // ส้ม

  return {
    fillColor: fillColor,
    weight: 1.5,
    opacity: 1,
    color: '#0f172a',
    fillOpacity: 0.9
  };
};

export default function RiskMap() {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/thailand.json')
      .then(res => res.json())
      .then(data => {
        // ลอง log ข้อมูลมาดู 1 จังหวัดว่ามันเก็บชื่อในตัวแปรอะไร
        console.log("ตรวจสอบข้อมูล GeoJSON:", data.features[0].properties);
        setGeoData(data);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  if (!geoData) return <div className="flex justify-center items-center h-full text-slate-400">กำลังโหลดแผนที่...</div>;

  return (
    <MapContainer 
      center={[13.5, 100.5]} 
      zoom={5.5} 
      scrollWheelZoom={false}
      zoomControl={false} // เอาปุ่ม + - ออกให้ดูสะอาดตา
      // บังคับความสูงและสีพื้นหลังตรงนี้!
      className="w-full h-full min-h-[500px]" 
      style={{ backgroundColor: '#0f172a' }} 
    >
      <GeoJSON 
        key="thailand-map-layer" // ใส่ key เพื่อให้มันยอมอัปเดตสี
        data={geoData} 
        style={(feature) => getStyle(feature)}
        onEachFeature={(feature, layer) => {
          const provinceName = getThaiProvinceName(feature);
          const riskLevel = riskData[provinceName] || 'optimal';
          const peaRegion = peaRegionMap[provinceName];

          if (!peaRegion) {
            layer.bindTooltip(`<div class="text-xs text-slate-400">${provinceName || 'Unknown'} (MEA)</div>`, { sticky: true });
            return;
          }

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({ weight: 2, color: '#ffffff', fillOpacity: 1 });
              target.bringToFront();
            },
            mouseout: (e) => {
              const target = e.target;
              target.setStyle(getStyle(feature));
            },
          });

          layer.bindTooltip(
            `<div class="text-center font-sans p-1">
              <span class="text-xs text-blue-500 font-bold tracking-widest">${peaRegion}</span><br/>
              <b class="text-sm text-slate-800">${provinceName}</b><br/>
              <span class="text-[10px] uppercase font-bold ${
                riskLevel === 'critical' ? 'text-red-600' : riskLevel === 'warning' ? 'text-orange-600' : 'text-emerald-600'
              }">สถานะ: ${riskLevel}</span>
            </div>`,
            { sticky: true }
          );
        }}
      />
    </MapContainer>
  );
}