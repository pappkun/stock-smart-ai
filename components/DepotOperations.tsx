'use client';
import React, { useState, useMemo } from 'react';
import { Download, Search, Package, CheckCircle2, Clock, MapPin, Building2, ChevronDown } from 'lucide-react';

// ข้อมูลจำลองหน่วยงานจากไฟล์ กฟภ. (ตัวอย่าง)
const peaUnits = [
  { id: 'S1', name: 'กฟจ.นครศรีธรรมราช', region: 'ภาคใต้', type: 'คลังจังหวัด' },
  { id: 'S2', name: 'กฟจ.สุราษฎร์ธานี', region: 'ภาคใต้', type: 'คลังจังหวัด' },
  { id: 'S3', name: 'กฟจ.ภูเก็ต', region: 'ภาคใต้', type: 'คลังจังหวัด' },
  { id: 'N1', name: 'กฟจ.เชียงใหม่', region: 'ภาคเหนือ', type: 'คลังจังหวัด' },
  { id: 'NE1', name: 'กฟจ.ขอนแก่น', region: 'ภาคตะวันออกเฉียงเหนือ', type: 'คลังจังหวัด' },
  { id: 'C1', name: 'กฟจ.ชลบุรี', region: 'ภาคกลาง', type: 'คลังจังหวัด' },
  { id: 'HQ', name: 'กองคลังพัสดุ (ส่วนกลาง)', region: 'กรุงเทพฯ', type: 'คลังหลัก' },
];

// ข้อมูลจำลองพัสดุ (Mock Data)
const initialEquipment = [
  { id: 1, name: 'หม้อแปลงไฟฟ้า (Power Transformer)', current: 61, target: 90, risk: 'เข้าสู่ฤดูพายุ x1.24', recommendation: 'สั่งซื้อเพิ่ม +89 เครื่อง', status: 'critical' },
  { id: 2, name: 'มิเตอร์อัจฉริยะ (Smart Meter)', current: 72, target: 95, risk: 'ผู้ใช้ EV เพิ่มขึ้น +67%', recommendation: 'สั่งซื้อเพิ่ม +180 เครื่อง', status: 'warning' },
  { id: 3, name: 'สายเคเบิล (Low Voltage Cable)', current: 85, target: 80, risk: 'ปกติ', recommendation: 'สต็อกเพียงพอ', status: 'optimal' },
  { id: 4, name: 'เซอร์กิตเบรกเกอร์ (Circuit Breaker)', current: 45, target: 85, risk: 'แผนบำรุงรักษาไตรมาส 3', recommendation: 'สั่งซื้อด่วน +40 ชุด', status: 'critical' },
];

export default function DepotOperations() {
  const [unitSearch, setUnitSearch] = useState('');
  const [equipSearch, setEquipSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(peaUnits[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // กรองรายชื่อหน่วยงานตามที่พิมพ์ค้นหา
  const filteredUnits = peaUnits.filter(unit => 
    unit.name.includes(unitSearch) || unit.region.includes(unitSearch)
  );

  // กรองพัสดุตามที่พิมพ์ค้นหา
  const filteredEquip = initialEquipment.filter(item =>
    item.name.toLowerCase().includes(equipSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. ส่วนเลือกหน่วยงาน (Unit Selector with Search) */}
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
                <p className="text-xs text-slate-400">{selectedUnit.region} • {selectedUnit.type}</p>
              </div>
            </div>
            <ChevronDown className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu สำหรับค้นหาและเลือกหน่วยงาน */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อหน่วยงาน หรือ ภูมิภาค..." 
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
                    className="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition-colors"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsDropdownOpen(false);
                      setUnitSearch('');
                    }}
                  >
                    <span className="text-sm text-white">{unit.name}</span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded">{unit.region}</span>
                  </div>
                ))}
                {filteredUnits.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">ไม่พบหน่วยงานที่ระบุ</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มส่งออกรายงาน */}
        <div className="flex items-end">
          <button className="w-full bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl border border-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
            <Download size={18} />
            <span className="text-sm font-bold">ส่งออกรายงาน PDF</span>
          </button>
        </div>
      </div>

      {/* 2. ส่วนค้นหาอุปกรณ์ (Equipment Search) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={`ค้นหาพัสดุใน ${selectedUnit.name}...`} 
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-inner"
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
          <div className="flex gap-2">
             <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded border border-emerald-800/50">เชื่อมต่อคลัง Real-time</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4">รายการพัสดุ</th>
                <th className="p-4">สต็อกปัจจุบัน</th>
                <th className="p-4">เป้าหมาย (AI)</th>
                <th className="p-4">ความเสี่ยงพื้นที่</th>
                <th className="p-4">คำแนะนำดำเนินการ</th>
                <th className="p-4 text-center">ตัดสินใจ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredEquip.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4 font-semibold text-white">{item.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.status === 'critical' ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${item.current}%` }}
                        ></div>
                      </div>
                      <span className={item.status === 'critical' ? 'text-red-400 font-bold' : 'text-emerald-400'}>{item.current}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-100">{item.target}%</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'critical' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-slate-700 text-slate-400 border border-slate-600'}`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="p-4 text-blue-300 font-medium">{item.recommendation}</td>
                  <td className="p-4 text-center space-x-2">
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded shadow-lg shadow-emerald-900/20 transition-all active:scale-90">
                      <CheckCircle2 size={16} />
                    </button>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded transition-all active:scale-90">
                      <Clock size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}