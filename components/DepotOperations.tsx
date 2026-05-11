'use client';
import React, { useState } from 'react';
import { 
  Download, Search, Package, CheckCircle2, Clock, MapPin, Building2, ChevronDown,
  BrainCircuit, History, AlertTriangle, CloudLightning, X, ArrowDownRight, ArrowUpRight, BarChart3
} from 'lucide-react';

// ข้อมูลจำลองหน่วยงาน (รวมโครงสร้าง Hierarchy ของ PEA เชียงใหม่ตามโครงสร้างจริง)
const peaUnits = [
  // ระดับเขต (Zone)
  { id: 'N1-HQ', name: 'PEA เขต 1 ภาคเหนือ เชียงใหม่', region: 'ภาคเหนือ', type: 'เขต' },
  
  // ระดับจังหวัด (Provincial Branch)
  { id: 'N1-CM1', name: 'PEA จ.เชียงใหม่ สาขาที่ 1', region: 'ภาคเหนือ', type: 'คลังจังหวัด' },
  { id: 'N1-CM2', name: 'PEA จ.เชียงใหม่ สาขาที่ 2', region: 'ภาคเหนือ', type: 'คลังจังหวัด' },
  
  // ระดับอำเภอ (District Branch)
  { id: 'N1-SS', name: 'PEA อ.สันทราย', region: 'ภาคเหนือ', type: 'สาขา' },
  { id: 'N1-SP', name: 'PEA อ.สันป่าตอง', region: 'ภาคเหนือ', type: 'สาขา' },
  { id: 'N1-MR', name: 'PEA อ.แม่ริม', region: 'ภาคเหนือ', type: 'สาขา' },
  { id: 'N1-SR', name: 'PEA อ.สารภี', region: 'ภาคเหนือ', type: 'สาขา' },
  
  // ระดับสาขาย่อย (Sub-branch)
  { id: 'N1-MA', name: 'PEA สาขาย่อยแม่อาย', region: 'ภาคเหนือ', type: 'สาขาย่อย' },
  { id: 'N1-HOD', name: 'PEA สาขาย่อยฮอด', region: 'ภาคเหนือ', type: 'สาขาย่อย' },
  { id: 'N1-MJ', name: 'PEA สาขาย่อยแม่แจ่ม', region: 'ภาคเหนือ', type: 'สาขาย่อย' },
  { id: 'N1-JT', name: 'PEA สาขาย่อยจอมทอง', region: 'ภาคเหนือ', type: 'สาขาย่อย' },

  // คลังอื่นๆ จาก Mock เดิมเพื่อใช้เทสกับพายุภาคใต้
  { id: 'S1', name: 'PEA จ.นครศรีธรรมราช', region: 'ภาคใต้', type: 'คลังจังหวัด' },
  { id: 'HQ', name: 'กองคลังพัสดุ (ส่วนกลาง)', region: 'กรุงเทพฯ', type: 'คลังหลัก' },
];

// ข้อมูลจำลองพัสดุ พร้อมข้อมูลเชิงลึก (AI Details, History & Thresholds)
const initialEquipment = [
  { 
    id: 1, 
    name: 'หม้อแปลงไฟฟ้า (Power Transformer)', 
    current: 61, 
    currentUnits: 61, 
    minUnits: 20, 
    reorderUnits: 50, 
    maxUnits: 100,
    target: 90, 
    risk: 'เข้าสู่ฤดูพายุ x1.24', 
    recommendation: 'สั่งซื้อเพิ่ม +89 เครื่อง', 
    status: 'critical',
    aiAnalysis: {
      summary: 'สถิติย้อนหลัง 5 ปี ชี้ว่าพื้นที่ภาคใต้มีโอกาสเกิดพายุไต้ฝุ่นและน้ำท่วมฉับพลันสูงถึง 85% ในช่วงเดือน พ.ค. - ก.ค. ส่งผลให้หม้อแปลงชำรุดเฉลี่ย 120 เครื่อง/เหตุการณ์',
      factors: [
        { label: 'โอกาสเกิดพายุ (อ้างอิงกรมอุตุฯ)', value: 85, color: 'bg-red-500' },
        { label: 'อัตราการชำรุดจากน้ำท่วม (ย้อนหลัง 3 ปี)', value: 72, color: 'bg-orange-500' },
        { label: 'ระยะเวลาการรอของ (Lead Time)', value: 45, color: 'bg-blue-500', text: 'นานกว่าปกติ' }
      ]
    },
    history: [
      { id: 'T01', date: '10 พ.ค. 2026', type: 'เบิกจ่าย', amount: 12, reason: 'เปลี่ยนทดแทนเหตุพายุฤดูร้อน', by: 'ช่างสมชาย' },
      { id: 'T02', date: '05 พ.ค. 2026', type: 'รับเข้า', amount: 30, reason: 'สั่งซื้อรอบปกติ Q2', by: 'คลังส่วนกลาง' },
      { id: 'T03', date: '01 พ.ค. 2026', type: 'เบิกจ่าย', amount: 5, reason: 'ขยายเขตชุมชนใหม่', by: 'ช่างวิชัย' },
    ]
  },
  { 
    id: 2, 
    name: 'มิเตอร์อัจฉริยะ (Smart Meter)', 
    current: 72,
    currentUnits: 720, 
    minUnits: 300, 
    reorderUnits: 600, 
    maxUnits: 1000,
    target: 95, 
    risk: 'ผู้ใช้ EV เพิ่มขึ้น +67%', 
    recommendation: 'สั่งซื้อเพิ่ม +180 เครื่อง', 
    status: 'warning',
    aiAnalysis: {
      summary: 'AI ตรวจพบแนวโน้มการขอติดมิเตอร์ TOU สำหรับชาร์จรถยนต์ไฟฟ้า (EV) ในพื้นที่เขตเมืองเพิ่มขึ้นแบบก้าวกระโดด (+67% MoM) สต็อกปัจจุบันอาจหมดภายใน 14 วัน',
      factors: [
        { label: 'ยอดจดทะเบียน EV พื้นที่ (เทียบเดือนก่อน)', value: 90, color: 'bg-red-500' },
        { label: 'อัตราการเบิกมิเตอร์ TOU รายสัปดาห์', value: 78, color: 'bg-orange-500' },
      ]
    },
    history: [
      { id: 'M01', date: '09 พ.ค. 2026', type: 'เบิกจ่าย', amount: 45, reason: 'ผู้ใช้ไฟขอเปลี่ยน TOU (กลุ่ม EV)', by: 'ทีมบริการลูกค้า' },
      { id: 'M02', date: '02 พ.ค. 2026', type: 'เบิกจ่าย', amount: 32, reason: 'โครงการหมู่บ้านจัดสรร', by: 'ผู้รับเหมา A' },
    ]
  },
  { 
    id: 3, 
    name: 'สายเคเบิล (Low Voltage Cable)', 
    current: 85,
    currentUnits: 8500, 
    minUnits: 2000, 
    reorderUnits: 4000, 
    maxUnits: 10000,
    target: 80, 
    risk: 'ปกติ', 
    recommendation: 'สต็อกเพียงพอ', 
    status: 'optimal',
    aiAnalysis: {
      summary: 'ระดับสต็อกอยู่ในเกณฑ์มาตรฐาน Safety Stock ไม่มีปัจจัยความเสี่ยงภายนอกที่ส่งผลกระทบอย่างมีนัยสำคัญในระยะ 30 วันนี้',
      factors: [
        { label: 'อัตราการใช้งานเฉลี่ยรายเดือน', value: 40, color: 'bg-emerald-500' },
      ]
    },
    history: [
      { id: 'C01', date: '08 พ.ค. 2026', type: 'รับเข้า', amount: 5000, reason: 'รับจากคลังภาค', by: 'คลังส่วนกลาง' },
      { id: 'C02', date: '05 พ.ค. 2026', type: 'เบิกจ่าย', amount: 800, reason: 'ซ่อมบำรุงตามแผน', by: 'ช่างเอก' },
    ]
  },
];

export default function DepotOperations() {
  const [unitSearch, setUnitSearch] = useState('');
  const [equipSearch, setEquipSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(peaUnits[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEquipDetail, setSelectedEquipDetail] = useState<any>(null);

  const filteredUnits = peaUnits.filter(unit => 
    unit.name.includes(unitSearch) || unit.region.includes(unitSearch)
  );

  const filteredEquip = initialEquipment.filter(item =>
    item.name.toLowerCase().includes(equipSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* 1. ส่วนเลือกหน่วยงาน */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">เลือกหน่วยงาน / คลังพัสดุ</label>
          <div 
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all shadow-md"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{selectedUnit.name}</h2>
                <p className="text-xs text-slate-400">{selectedUnit.region} • <span className="font-bold text-blue-300">{selectedUnit.type}</span></p>
              </div>
            </div>
            <ChevronDown className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-40 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อหน่วยงาน (เช่น เชียงใหม่, แม่ริม)..." 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={unitSearch}
                    onChange={(e) => setUnitSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredUnits.map((unit) => (
                  <div 
                    key={unit.id}
                    className="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0"
                    onClick={() => { setSelectedUnit(unit); setIsDropdownOpen(false); setUnitSearch(''); }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">{unit.name}</span>
                      <span className="text-[10px] text-slate-400">{unit.region}</span>
                    </div>
                    {/* เปลี่ยนสี Badge ตามระดับของหน่วยงาน */}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                      unit.type === 'คลังหลัก' || unit.type === 'เขต' ? 'bg-purple-900/50 text-purple-400 border border-purple-800' :
                      unit.type === 'คลังจังหวัด' ? 'bg-blue-900/50 text-blue-400 border border-blue-800' :
                      unit.type === 'สาขา' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                      'bg-slate-700 text-slate-300 border border-slate-600' // สาขาย่อย
                    }`}>
                      {unit.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl border border-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
            <Download size={18} />
            <span className="text-sm font-bold">ส่งออกรายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* 2. ส่วนค้นหาอุปกรณ์ */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={`ค้นหาพัสดุใน ${selectedUnit.name}...`} 
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          value={equipSearch}
          onChange={(e) => setEquipSearch(e.target.value)}
        />
      </div>

      {/* 3. ตารางข้อมูลพัสดุ */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2">
            🤖 ข้อมูลสต็อกและคำแนะนำจาก AI
          </h3>
          <span className="text-xs text-slate-400 animate-pulse">💡 คลิกที่แถวเพื่อดูรายละเอียดเชิงลึก</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4">รายการพัสดุ</th>
                <th className="p-4">สต็อกปัจจุบัน</th>
                <th className="p-4">เป้าหมาย (AI)</th>
                <th className="p-4">ความเสี่ยงพื้นที่</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredEquip.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-700/40 transition-colors cursor-pointer group"
                  onClick={() => setSelectedEquipDetail(item)}
                >
                  <td className="p-4 font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{ width: `${item.current}%` }}
                        ></div>
                      </div>
                      <span className={item.status === 'critical' ? 'text-red-400 font-bold' : item.status === 'warning' ? 'text-yellow-400 font-bold' : 'text-emerald-400'}>
                        {item.currentUnits} หน่วย
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-100">{item.target}%</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max ${item.status === 'critical' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                      {item.status === 'critical' && <AlertTriangle size={10} />}
                      {item.risk}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button className="bg-slate-700 hover:bg-blue-600 text-white p-1.5 rounded transition-all">
                      <BarChart3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal ดูรายละเอียด AI & Thresholds */}
      {selectedEquipDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="text-blue-500" />
                  {selectedEquipDetail.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin size={14} /> {selectedUnit.name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedEquipDetail(null)}
                className="p-2 bg-slate-700 hover:bg-red-500 hover:text-white rounded-full transition-colors text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-slate-800 space-y-6">
              
              {/* --- ส่วนแสดง Min / Reorder / Max --- */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-700 shadow-inner">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">สถานะคลังพัสดุปัจจุบัน: <span className={selectedEquipDetail.currentUnits <= selectedEquipDetail.reorderUnits ? 'text-red-400' : 'text-emerald-400'}>{selectedEquipDetail.currentUnits} หน่วย</span></h3>
                    <p className="text-xs text-slate-400 mt-1">ความจุสูงสุด (Max): {selectedEquipDetail.maxUnits} หน่วย</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">จุดสั่งซื้อแนะนำ (Reorder Point)</span>
                    <p className="text-yellow-400 font-bold text-lg">{selectedEquipDetail.reorderUnits} หน่วย</p>
                  </div>
                </div>

                {/* หลอดแสดงสถานะและเส้นแบ่ง Min/Max/Reorder */}
                <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mt-2">
                  {/* สีพื้นหลังของหลอด */}
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      selectedEquipDetail.currentUnits <= selectedEquipDetail.minUnits ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                      selectedEquipDetail.currentUnits <= selectedEquipDetail.reorderUnits ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${(selectedEquipDetail.currentUnits / selectedEquipDetail.maxUnits) * 100}%` }}
                  ></div>
                  
                  {/* เส้น ขีดสีแดง (Min) */}
                  <div 
                    className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                    style={{ left: `${(selectedEquipDetail.minUnits / selectedEquipDetail.maxUnits) * 100}%` }}
                  ></div>
                  {/* เส้น ขีดสีเหลือง (Reorder) */}
                  <div 
                    className="absolute top-0 bottom-0 border-l-2 border-yellow-400 z-10"
                    style={{ left: `${(selectedEquipDetail.reorderUnits / selectedEquipDetail.maxUnits) * 100}%` }}
                  ></div>
                  {/* เส้น ขีดสีเขียว (Max) - อยู่ขวาสุดของหลอด */}
                  <div 
                    className="absolute top-0 bottom-0 border-r-2 border-emerald-500 z-10 right-0"
                  ></div>
                </div>

                {/* ตัวเลขกำกับใต้หลอด */}
                <div className="relative w-full h-6 mt-1 text-[11px] font-bold">
                  <div 
                    className="absolute text-red-500 -translate-x-1/2" 
                    style={{ left: `${(selectedEquipDetail.minUnits / selectedEquipDetail.maxUnits) * 100}%` }}
                  >
                    MIN ({selectedEquipDetail.minUnits})
                  </div>
                  <div 
                    className="absolute text-yellow-500 -translate-x-1/2" 
                    style={{ left: `${(selectedEquipDetail.reorderUnits / selectedEquipDetail.maxUnits) * 100}%` }}
                  >
                    REORDER ({selectedEquipDetail.reorderUnits})
                  </div>
                  <div 
                    className="absolute text-emerald-500 right-0" 
                  >
                    MAX ({selectedEquipDetail.maxUnits})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ซ้าย: AI Reasoning */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-2">
                    <BrainCircuit className="text-blue-400" /> เหตุผลและปัจจัยวิเคราะห์จาก AI
                  </h3>
                  
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-blue-900/50 shadow-inner">
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {selectedEquipDetail.aiAnalysis.summary}
                    </p>
                    
                    <div className="space-y-4">
                      {selectedEquipDetail.aiAnalysis.factors.map((factor: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">{factor.label}</span>
                            <span className="text-white font-bold">{factor.text || `${factor.value}%`}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700">
                            <div className={`h-2 rounded-full ${factor.color}`} style={{ width: `${factor.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedEquipDetail.status === 'critical' && (
                      <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-start gap-3">
                        <CloudLightning className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-red-200">
                          <span className="font-bold text-red-400">คำเตือนภัยพิบัติ:</span> ร่องมรสุมพาดผ่านภาคใต้ตอนบน คาดว่าความต้องการเบิกใช้ฉุกเฉินจะพุ่งสูงใน 48 ชม. ข้างหน้า
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ขวา: History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <History className="text-slate-400" /> ประวัติการรับ-เบิกจ่ายล่าสุด
                  </h3>
                  
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-inner">
                    <div className="divide-y divide-slate-700">
                      {selectedEquipDetail.history.map((tx: any, idx: number) => (
                        <div key={idx} className="p-3 hover:bg-slate-800/80 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.type === 'รับเข้า' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-orange-900/50 text-orange-400'}`}>
                              {tx.type === 'รับเข้า' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{tx.type} {tx.amount} หน่วย</p>
                              <p className="text-xs text-slate-400">เหตุผล: {tx.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-300">{tx.date}</p>
                            <p className="text-[10px] text-slate-500">ผู้ทำรายการ: {tx.by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full p-3 text-xs text-blue-400 hover:bg-slate-800 font-medium transition-colors border-t border-slate-700">
                      ดูประวัติทั้งหมด...
                    </button>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEquipDetail(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                ปิดหน้าต่าง
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                <CheckCircle2 size={16} /> {selectedEquipDetail.recommendation}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}