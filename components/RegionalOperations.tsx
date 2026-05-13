'use client';
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, MapPin, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ForecastingPanel from './ForecastingPanel';
import ProvinceForecastModal from './ProvinceForecastModal';

// ข้อมูลจำลอง 12 เขตของ PEA 
const allUnits = [
  // --- ภาคเหนือ (กฟน.) ---
  { id: 1, name: 'กฟน.1 (เชียงใหม่)', region: 'ภาคเหนือ', criticalSkus: 0, warningSkus: 2, topShortage: '-', status: 'optimal' },
  { id: 2, name: 'กฟน.2 (พิษณุโลก)', region: 'ภาคเหนือ', criticalSkus: 0, warningSkus: 5, topShortage: 'ลูกถ้วยฉนวน', status: 'optimal' },
  { id: 3, name: 'กฟน.3 (ลพบุรี)', region: 'ภาคเหนือ', criticalSkus: 1, warningSkus: 3, topShortage: 'มิเตอร์ 1 เฟส', status: 'warning' },

  // --- ภาคตะวันออกเฉียงเหนือ (กฟฉ.) ---
  { id: 4, name: 'กฟฉ.1 (อุดรธานี)', region: 'ภาคตะวันออกเฉียงเหนือ', criticalSkus: 0, warningSkus: 4, topShortage: '-', status: 'optimal' },
  { id: 5, name: 'กฟฉ.2 (อุบลราชธานี)', region: 'ภาคตะวันออกเฉียงเหนือ', criticalSkus: 2, warningSkus: 8, topShortage: 'สายเคเบิล 115kV (รับมือช่วงน้ำหลาก)', status: 'warning' },
  { id: 6, name: 'กฟฉ.3 (นครราชสีมา)', region: 'ภาคตะวันออกเฉียงเหนือ', criticalSkus: 0, warningSkus: 1, topShortage: '-', status: 'optimal' },

  // --- ภาคกลาง (กฟก.) ---
  { id: 7, name: 'กฟก.1 (อยุธยา)', region: 'ภาคกลาง', criticalSkus: 0, warningSkus: 2, topShortage: '-', status: 'optimal' },
  { id: 8, name: 'กฟก.2 (ชลบุรี)', region: 'ภาคกลาง', criticalSkus: 3, warningSkus: 12, topShortage: 'มิเตอร์ TOU (กลุ่ม EV พุ่งสูง)', status: 'warning' },
  { id: 9, name: 'กฟก.3 (นครปฐม)', region: 'ภาคกลาง', criticalSkus: 0, warningSkus: 3, topShortage: '-', status: 'optimal' },

  // --- ภาคใต้ (กฟต.) ---
  { id: 10, name: 'กฟต.1 (เพชรบุรี)', region: 'ภาคใต้', criticalSkus: 0, warningSkus: 4, topShortage: '-', status: 'optimal' },
  { id: 11, name: 'กฟต.2 (นครศรีธรรมราช)', region: 'ภาคใต้', criticalSkus: 7, warningSkus: 15, topShortage: 'หม้อแปลง 50kVA (วิกฤตพายุ)', status: 'critical' },
  { id: 12, name: 'กฟต.3 (ยะลา)', region: 'ภาคใต้', criticalSkus: 1, warningSkus: 5, topShortage: 'เสาไฟฟ้า 14 ม.', status: 'warning' },
];

export default function RegionalOperations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ทั้งหมด');
  const [selectedUnit, setSelectedUnit] = useState<typeof allUnits[number] | null>(null);

  // ระบบกรองข้อมูลตามชื่อและภาค
  const filteredData = useMemo(() => {
    return allUnits.filter(unit => {
      const matchesSearch = unit.name.includes(searchTerm);
      const matchesRegion = selectedRegion === 'ทั้งหมด' || unit.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ส่วนควบคุม: ค้นหาและเลือกเขต */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเขต (เช่น กฟต.2...)" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="text-slate-400" size={18} />
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer text-white"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="ทั้งหมด">แสดงทุกภูมิภาค (12 เขต)</option>
            <option value="ภาคเหนือ">ภาคเหนือ (กฟน.1-3)</option>
            <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ (กฟฉ.1-3)</option>
            <option value="ภาคกลาง">ภาคกลาง (กฟก.1-3)</option>
            <option value="ภาคใต้">ภาคใต้ (กฟต.1-3)</option>
          </select>
        </div>
      </div>

      {/* กราฟเปรียบเทียบ SKU ที่มีปัญหา */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            📊 จำนวนรายการพัสดุ (SKU) ที่ต้องเฝ้าระวังรายเขต
          </h3>
          <span className="text-xs text-slate-400">พบทั้งหมด {filteredData.length} เขต</span>
        </div>
        
        <div className="h-72 w-full text-xs">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                  itemStyle={{ fontSize: '14px' }}
                />
                <Legend />
                <Bar dataKey="warningSkus" fill="#f59e0b" name="พัสดุเฝ้าระวัง (Warning)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="criticalSkus" fill="#ef4444" name="พัสดุวิกฤต (Critical)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
              ไม่พบข้อมูลที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* ระบบพยากรณ์ความต้องการพัสดุ (AI Forecasting) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
        <ForecastingPanel />
      </div>

      {/* ตารางข้อมูลหน่วยงาน */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md overflow-hidden">
        <h3 className="text-white font-bold mb-4">🔄 การวิเคราะห์สถานะและรายการขาดแคลนหลัก (Top Shortage)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-4 rounded-tl-lg">ชื่อเขตพื้นที่</th>
                <th className="p-4 text-center">SKU วิกฤต</th>
                <th className="p-4">พัสดุขาดแคลนหลัก (AI วิเคราะห์)</th>
                <th className="p-4 text-center">สถานะพื้นที่</th>
                <th className="p-4 text-center rounded-tr-lg">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredData.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-700/40 transition-colors">
                  <td className="p-4 font-semibold text-white">
                    {unit.name}
                    <div className="text-[10px] text-slate-500 font-normal">{unit.region}</div>
                  </td>
                  <td className="p-4 text-center">
                    {unit.criticalSkus > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-900/50 text-red-400 font-bold border border-red-800">
                        {unit.criticalSkus}
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {unit.topShortage !== '-' ? (
                      <span className={unit.status === 'critical' ? 'text-red-400 font-medium' : 'text-yellow-400 font-medium'}>
                        {unit.topShortage}
                      </span>
                    ) : (
                      <span className="text-slate-500">ไม่มีรายการน่ากังวล</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {unit.status === 'critical' && (
                        <span className="flex items-center gap-1 bg-red-900/40 text-red-400 border border-red-800/50 px-2 py-1 rounded text-xs font-bold w-max">
                          <AlertCircle size={14} /> วิกฤต
                        </span>
                      )}
                      {unit.status === 'warning' && (
                        <span className="flex items-center gap-1 bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-2 py-1 rounded text-xs font-bold w-max">
                          <AlertTriangle size={14} /> เฝ้าระวัง
                        </span>
                      )}
                      {unit.status === 'optimal' && (
                        <span className="flex items-center gap-1 bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-1 rounded text-xs font-bold w-max">
                          <CheckCircle2 size={14} /> ปกติ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedUnit(unit)}
                      className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs transition-all font-medium"
                    >
                      ดูคลังย่อย
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-500">ไม่มีข้อมูลเขตพื้นที่</div>
          )}
        </div>
      </div>

      {/* Modal: Province Forecast */}
      {selectedUnit && (
        <ProvinceForecastModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}
    </div>
  );
}
