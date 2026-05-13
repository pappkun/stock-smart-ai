'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Feature, GeoJsonObject, Geometry } from 'geojson';

type RiskLevel = 'critical' | 'warning' | 'optimal';

type ProvinceProfile = {
  englishName: string;
  thaiName: string;
  peaRegion: string | null;
  riskLevel: RiskLevel;
  riskLabel: string;
  summary: string;
  action: string;
  focus: string;
};

type ProvinceProperties = {
  name?: string;
  shapeName?: string;
  name_th?: string;
  pro_th?: string;
};

type ThailandFeature = Feature<Geometry, ProvinceProperties>;

type ThailandGeoJson = GeoJsonObject & {
  features: ThailandFeature[];
};

const engToThaiMap: Record<string, string> = {
  'Amnat Charoen': 'อำนาจเจริญ',
  'Ang Thong': 'อ่างทอง',
  Bangkok: 'กรุงเทพมหานคร',
  'Bueng Kan': 'บึงกาฬ',
  'Buri Ram': 'บุรีรัมย์',
  'Chachoengsao': 'ฉะเชิงเทรา',
  'Chai Nat': 'ชัยนาท',
  'Chaiyaphum': 'ชัยภูมิ',
  Chanthaburi: 'จันทบุรี',
  'Chiang Mai': 'เชียงใหม่',
  'Chiang Rai': 'เชียงราย',
  'Chon Buri': 'ชลบุรี',
  Chumphon: 'ชุมพร',
  Kalasin: 'กาฬสินธุ์',
  'Kamphaeng Phet': 'กำแพงเพชร',
  Kanchanaburi: 'กาญจนบุรี',
  'Khon Kaen': 'ขอนแก่น',
  Krabi: 'กระบี่',
  Lampang: 'ลำปาง',
  Lamphun: 'ลำพูน',
  Loei: 'เลย',
  'Lop Buri': 'ลพบุรี',
  'Mae Hong Son': 'แม่ฮ่องสอน',
  'Maha Sarakham': 'มหาสารคาม',
  Mukdahan: 'มุกดาหาร',
  'Nakhon Nayok': 'นครนายก',
  'Nakhon Pathom': 'นครปฐม',
  'Nakhon Phanom': 'นครพนม',
  'Nakhon Ratchasima': 'นครราชสีมา',
  'Nakhon Sawan': 'นครสวรรค์',
  'Nakhon Si Thammarat': 'นครศรีธรรมราช',
  Nan: 'น่าน',
  Narathiwat: 'นราธิวาส',
  'Nong Bua Lam Phu': 'หนองบัวลำภู',
  'Nong Khai': 'หนองคาย',
  Nonthaburi: 'นนทบุรี',
  'Pathum Thani': 'ปทุมธานี',
  Pattani: 'ปัตตานี',
  Phangnga: 'พังงา',
  Phatthalung: 'พัทลุง',
  Phayao: 'พะเยา',
  Phetchabun: 'เพชรบูรณ์',
  Phetchaburi: 'เพชรบุรี',
  Phichit: 'พิจิตร',
  Phitsanulok: 'พิษณุโลก',
  'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา',
  Phrae: 'แพร่',
  Phuket: 'ภูเก็ต',
  'Prachin Buri': 'ปราจีนบุรี',
  'Prachuap Khiri Khan': 'ประจวบคีรีขันธ์',
  Ranong: 'ระนอง',
  Ratchaburi: 'ราชบุรี',
  Rayong: 'ระยอง',
  'Roi Et': 'ร้อยเอ็ด',
  'Sa Kaeo': 'สระแก้ว',
  'Sakon Nakhon': 'สกลนคร',
  'Samut Prakan': 'สมุทรปราการ',
  'Samut Sakhon': 'สมุทรสาคร',
  'Samut Songkhram': 'สมุทรสงคราม',
  Saraburi: 'สระบุรี',
  Satun: 'สตูล',
  'Si Sa Ket': 'ศรีสะเกษ',
  'Sing Buri': 'สิงห์บุรี',
  Songkhla: 'สงขลา',
  Sukhothai: 'สุโขทัย',
  'Suphan Buri': 'สุพรรณบุรี',
  'Surat Thani': 'สุราษฎร์ธานี',
  Surin: 'สุรินทร์',
  Tak: 'ตาก',
  Trang: 'ตรัง',
  Trat: 'ตราด',
  'Ubon Ratchathani': 'อุบลราชธานี',
  'Udon Thani': 'อุดรธานี',
  'Uthai Thani': 'อุทัยธานี',
  Uttaradit: 'อุตรดิตถ์',
  Yala: 'ยะลา',
  Yasothon: 'ยโสธร',
};

const peaRegionMap: Record<string, string> = {
  'เชียงใหม่': 'กฟน.1',
  'ลำพูน': 'กฟน.1',
  'ลำปาง': 'กฟน.1',
  'เชียงราย': 'กฟน.1',
  'พะเยา': 'กฟน.1',
  'แม่ฮ่องสอน': 'กฟน.1',
  'พิษณุโลก': 'กฟน.2',
  'พิจิตร': 'กฟน.2',
  'กำแพงเพชร': 'กฟน.2',
  'ตาก': 'กฟน.2',
  'สุโขทัย': 'กฟน.2',
  'แพร่': 'กฟน.2',
  'น่าน': 'กฟน.2',
  'อุตรดิตถ์': 'กฟน.2',
  'ลพบุรี': 'กฟน.3',
  'สิงห์บุรี': 'กฟน.3',
  'ชัยนาท': 'กฟน.3',
  'นครสวรรค์': 'กฟน.3',
  'อุทัยธานี': 'กฟน.3',
  'เพชรบูรณ์': 'กฟน.3',
  'อุดรธานี': 'กฟอ.1',
  'ขอนแก่น': 'กฟอ.1',
  'หนองบัวลำภู': 'กฟอ.1',
  'เลย': 'กฟอ.1',
  'หนองคาย': 'กฟอ.1',
  'บึงกาฬ': 'กฟอ.1',
  'สกลนคร': 'กฟอ.1',
  'นครพนม': 'กฟอ.1',
  'อุบลราชธานี': 'กฟอ.2',
  'ศรีสะเกษ': 'กฟอ.2',
  'ยโสธร': 'กฟอ.2',
  'อำนาจเจริญ': 'กฟอ.2',
  'ร้อยเอ็ด': 'กฟอ.2',
  'กาฬสินธุ์': 'กฟอ.2',
  'มหาสารคาม': 'กฟอ.2',
  'มุกดาหาร': 'กฟอ.2',
  'นครราชสีมา': 'กฟอ.3',
  'บุรีรัมย์': 'กฟอ.3',
  'สุรินทร์': 'กฟอ.3',
  'ชัยภูมิ': 'กฟอ.3',
  'พระนครศรีอยุธยา': 'กฟก.1',
  'อ่างทอง': 'กฟก.1',
  'สระบุรี': 'กฟก.1',
  'ปทุมธานี': 'กฟก.1',
  'ปราจีนบุรี': 'กฟก.1',
  'สระแก้ว': 'กฟก.1',
  'นครนายก': 'กฟก.1',
  'สุราษฎร์ธานี': 'กฟก.2',
  'ชุมพร': 'กฟก.2',
  'พังงา': 'กฟก.2',
  'ระนอง': 'กฟก.2',
  'กระบี่': 'กฟก.2',
  'ภูเก็ต': 'กฟก.2',
  'ตรัง': 'กฟก.2',
  'ตราด': 'กฟก.2',
  'ยะลา': 'กฟก.3',
  'ปัตตานี': 'กฟก.3',
  'นราธิวาส': 'กฟก.3',
  'สงขลา': 'กฟก.3',
  'สตูล': 'กฟก.3',
  'พัทลุง': 'กฟก.3',
  'นครศรีธรรมราช': 'กฟก.3',
  'นครปฐม': 'กฟส.1',
  'ราชบุรี': 'กฟส.1',
  'กาญจนบุรี': 'กฟส.1',
  'สุพรรณบุรี': 'กฟส.1',
  'สมุทรสาคร': 'กฟส.1',
  'สมุทรสงคราม': 'กฟส.1',
  'สมุทรปราการ': 'กฟส.1',
  'นนทบุรี': 'กฟส.1',
  'ชลบุรี': 'กฟต.1',
  'ระยอง': 'กฟต.1',
  'ฉะเชิงเทรา': 'กฟต.1',
  'ประจวบคีรีขันธ์': 'กฟต.1',
};

const riskData: Record<string, RiskLevel> = {
  'นครศรีธรรมราช': 'critical',
  'ชลบุรี': 'warning',
  'สุราษฎร์ธานี': 'warning',
};

const getThaiProvinceName = (feature?: ThailandFeature) => {
  if (!feature?.properties) return '';
  const rawName =
    feature.properties.name ||
    feature.properties.shapeName ||
    feature.properties.name_th ||
    feature.properties.pro_th ||
    '';
  return engToThaiMap[rawName] || rawName;
};

const buildProvinceProfile = (feature?: ThailandFeature): ProvinceProfile => {
  const englishName =
    feature?.properties?.name ||
    feature?.properties?.shapeName ||
    feature?.properties?.name_th ||
    feature?.properties?.pro_th ||
    '';
  const thaiName = getThaiProvinceName(feature);
  const peaRegion = peaRegionMap[thaiName] ?? null;
  const riskLevel = riskData[thaiName] || 'optimal';

  const riskLabel =
    riskLevel === 'critical' ? 'วิกฤต' : riskLevel === 'warning' ? 'เฝ้าระวัง' : 'ปกติ';

  const summaryByRisk: Record<RiskLevel, string> = {
    critical:
      'ตรวจพบสัญญาณตึงตัวของสต็อกและมีแนวโน้มเร่งใช้ในช่วงสั้น ควรเร่งตรวจสอบของคงคลังและแผนเติมสินค้า',
    warning:
      'มีแนวโน้มใช้เพิ่มขึ้นต่อเนื่อง ควรติดตาม lead time และเตรียม stock buffer ไว้ล่วงหน้า',
    optimal:
      'สถานะโดยรวมอยู่ในเกณฑ์สมดุล เหมาะสำหรับการเฝ้าดูแนวโน้มและคงระดับสต็อกตามแผนเดิม',
  };

  const actionByRisk: Record<RiskLevel, string> = {
    critical: 'เร่งตรวจสอบสต็อก, เปิดแผนเติมสินค้า และแจ้งผู้รับผิดชอบทันที',
    warning: 'เพิ่มความถี่ในการติดตาม, ทบทวน forecast และเตรียม stock reserve',
    optimal: 'ติดตามตามรอบปกติ และใช้เป็น baseline เปรียบเทียบกับจังหวัดใกล้เคียง',
  };

  const focus = peaRegion ? `${peaRegion} · ${thaiName}` : `${thaiName} · พื้นที่นอกขอบเขต PEA`;

  return {
    englishName,
    thaiName,
    peaRegion,
    riskLevel,
    riskLabel,
    summary: summaryByRisk[riskLevel],
    action: actionByRisk[riskLevel],
    focus,
  };
};

const getStyle = (feature: ThailandFeature | undefined, selectedThaiName: string | null = null) => {
  const provinceName = getThaiProvinceName(feature);
  const peaRegion = peaRegionMap[provinceName];
  const riskLevel = riskData[provinceName] || 'optimal';
  const isSelected = selectedThaiName === provinceName;

  if (!peaRegion) {
    return {
      fillColor: isSelected ? '#334155' : '#1e293b',
      weight: isSelected ? 2.5 : 1,
      color: isSelected ? '#e2e8f0' : '#334155',
      fillOpacity: isSelected ? 0.75 : 0.45,
    };
  }

  let fillColor = '#10b981';
  if (riskLevel === 'critical') fillColor = '#ef4444';
  if (riskLevel === 'warning') fillColor = '#f59e0b';

  return {
    fillColor: isSelected ? '#2563eb' : fillColor,
    weight: isSelected ? 3 : 1.5,
    opacity: 1,
    color: isSelected ? '#ffffff' : '#0f172a',
    fillOpacity: isSelected ? 1 : 0.9,
  };
};

export default function RiskMap() {
  const [geoData, setGeoData] = useState<ThailandGeoJson | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceProfile | null>(null);

  useEffect(() => {
    fetch('/thailand.json')
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
        if (data?.features?.length > 0) {
          const firstFeature =
            data.features.find((feature: ThailandFeature) => getThaiProvinceName(feature) === 'กรุงเทพมหานคร') ||
            data.features[0];
          if (firstFeature) {
            setSelectedProvince(buildProvinceProfile(firstFeature));
          }
        }
      })
      .catch((err) => console.error('Failed to load Thailand geojson:', err));
  }, []);

  const selectedThaiName = selectedProvince?.thaiName ?? null;

  const selectedSummary = useMemo(() => {
    if (!selectedProvince) {
      return {
        title: 'คลิกพื้นที่บนแผนที่',
        body: 'เลือกจังหวัดเพื่อดูชื่อพื้นที่, โซน PEA, สถานะความเสี่ยง และคำแนะนำจาก AI',
      };
    }

    return {
      title: selectedProvince.thaiName,
      body: selectedProvince.summary,
    };
  }, [selectedProvince]);

  if (!geoData) {
    return (
      <div className="flex items-center justify-center min-h-[560px] rounded-2xl border border-slate-700 bg-slate-900/60 text-slate-400">
        กำลังโหลดแผนที่...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_360px] gap-4 h-full">
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-xl">
        <div className="absolute left-4 top-4 z-[401] rounded-full border border-cyan-500/30 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-cyan-300 backdrop-blur">
          THAILAND INTERACTIVE MAP
        </div>

        <MapContainer
          center={[13.5, 100.5]}
          zoom={5.5}
          scrollWheelZoom={false}
          zoomControl={false}
          className="min-h-[560px] w-full"
          style={{ backgroundColor: '#0f172a' }}
        >
          <GeoJSON
            key="thailand-map-layer"
            data={geoData}
            style={(feature) => getStyle(feature, selectedThaiName)}
            onEachFeature={(feature, layer) => {
              const profile = buildProvinceProfile(feature);
              const peaRegion = profile.peaRegion;

              layer.on({
                click: () => setSelectedProvince(profile),
                mouseover: (e) => {
                  const target = e.target;
                  target.setStyle({ weight: 2.5, color: '#ffffff', fillOpacity: 1 });
                  target.bringToFront();
                },
                mouseout: (e) => {
                  const target = e.target;
                  target.setStyle(getStyle(feature, selectedThaiName));
                },
              });

              layer.bindTooltip(
                `
                  <div class="text-center font-sans p-1">
                    <div class="text-[10px] uppercase tracking-[0.3em] text-cyan-500 font-bold">${peaRegion ?? 'Other'}</div>
                    <div class="text-sm font-semibold text-slate-800">${profile.thaiName}</div>
                    <div class="text-[10px] font-bold ${
                      profile.riskLevel === 'critical'
                        ? 'text-red-600'
                        : profile.riskLevel === 'warning'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }">สถานะ: ${profile.riskLabel}</div>
                  </div>
                `,
                { sticky: true }
              );
            }}
          />
        </MapContainer>

        <div className="absolute bottom-4 left-4 right-4 z-[401] grid gap-2 md:grid-cols-3">
          {[
            { label: 'วิกฤต', color: 'bg-red-500', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.45)]' },
            { label: 'เฝ้าระวัง', color: 'bg-amber-500', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.45)]' },
            { label: 'ปกติ', color: 'bg-emerald-500', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.45)]' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/75 px-3 py-2 text-xs text-slate-200 backdrop-blur"
            >
              <span className={`h-3 w-3 rounded-full ${item.color} ${item.glow}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-700 bg-slate-900/90 p-5 shadow-xl backdrop-blur">
        <div className="mb-5 flex items-center gap-2 text-cyan-300">
          <Sparkles size={18} />
          <h3 className="text-sm font-bold uppercase tracking-[0.24em]">รายละเอียดพื้นที่</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">จังหวัดที่เลือก</p>
            <h4 className="mt-2 text-2xl font-extrabold text-white">{selectedSummary.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{selectedSummary.body}</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">โซน/พื้นที่</p>
              <p className="mt-2 text-sm font-semibold text-white">{selectedProvince?.focus ?? 'ยังไม่ได้เลือกพื้นที่'}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">ระดับความเสี่ยง</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                {selectedProvince ? (
                  <>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        selectedProvince.riskLevel === 'critical'
                          ? 'bg-red-500'
                          : selectedProvince.riskLevel === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                    />
                    {selectedProvince.riskLabel}
                  </>
                ) : (
                  'ยังไม่ระบุ'
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">คำแนะนำ AI</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {selectedProvince?.action ?? 'คลิกจังหวัดบนแผนที่เพื่อดูคำแนะนำเฉพาะพื้นที่'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!geoData?.features?.length) return;
              const target =
                geoData.features.find((feature: ThailandFeature) => getThaiProvinceName(feature) === 'ชลบุรี') ||
                geoData.features[0];
              setSelectedProvince(buildProvinceProfile(target));
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
          >
            ดูตัวอย่างพื้นที่เสี่ยง
            <ArrowRight size={16} />
          </button>
        </div>
      </aside>
    </div>
  );
}
