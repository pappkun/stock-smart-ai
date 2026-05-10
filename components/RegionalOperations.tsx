'use client';
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, MapPin } from 'lucide-react';

// ข้อมูลจำลองหน่วยงาน (สามารถดึงจากไฟล์ CSV ที่คุณมีในอนาคต)
const allUnits = [
  { id: 1, name: 'กฟภ. นครศรีธรรมราช', region: 'ภาคใต้', overstock: 400, shortage: 240 },
  { id: 2, name: 'กฟภ. สุราษฎร์ธานี', region: 'ภาคใต้', overstock: 300, shortage: 456 },
  { id: 3, name: 'กฟภ. สงขลา', region: 'ภาคใต้', overstock: 200, shortage: 139 },
  { id: 4, name: 'กฟภ. ภูเก็ต', region: 'ภาคใต้', overstock: 278, shortage: 390 },
  { id: 5, name: 'กฟภ. เชียงใหม่', region: 'ภาคเหนือ', overstock: 150, shortage: 100 },
  { id: 6, name: 'กฟภ. ขอนแก่น', region: 'ภาคตะวันออกเฉียงเหนือ', overstock: 320, shortage: 180 },
  { id: 7, name: 'กฟภ. ชลบุรี', region: 'ภาคกลาง', overstock: 500, shortage: 50 },
];

export default function RegionalOperations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ทั้งหมด');

  // ระบบกรองข้อมูลตามชื่อและเขต
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
            placeholder="ค้นหาชื่อหน่วยงาน (เช่น นครศรีธรรมราช...)" 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="text-slate-400" size={18} />
          <select 
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="ทั้งหมด">แสดงทุกภูมิภาค</option>
            <option value="ภาคใต้">ภาคใต้</option>
            <option value="ภาคเหนือ">ภาคเหนือ</option>
            <option value="ภาคกลาง">ภาคกลาง</option>
            <option value="ภาคตะวันออกเฉียงเหนือ">ภาคตะวันออกเฉียงเหนือ</option>
          </select>
        </div>
      </div>

      {/* กราฟเปรียบเทียบ (จะเปลี่ยนแปลงตามตัวกรอง) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold">📊 เปรียบเทียบสถานะพัสดุรายหน่วยงาน ({selectedRegion})</h3>
          <span className="text-xs text-slate-400">พบทั้งหมด {filteredData.length} หน่วยงาน</span>
        </div>
        
        <div className="h-72 w-full text-xs">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                <Legend />
                <Bar dataKey="overstock" fill="#10b981" name="สต็อกส่วนเกิน" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shortage" fill="#ef4444" name="สต็อกขาดแคลน" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
              ไม่พบข้อมูลที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* ตารางข้อมูลหน่วยงาน */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
        <h3 className="text-white font-bold mb-4">🔄 รายการหน่วยงานและคำแนะนำเบื้องต้น</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-700 text-slate-200">
              <tr>
                <th className="p-3 rounded-tl-lg">ชื่อหน่วยงาน</th>
                <th className="p-3">ภูมิภาค</th>
                <th className="p-3">สถานะสต็อก</th>
                <th className="p-3">ความเสี่ยงพื้นที่</th>
                <th className="p-3 rounded-tr-lg">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredData.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="p-3 font-medium text-white">{unit.name}</td>
                  <td className="p-3">{unit.region}</td>
                  <td className="p-3">
                    {unit.shortage > unit.overstock ? (
                      <span className="text-red-400">ขาดแคลน ({unit.shortage})</span>
                    ) : (
                      <span className="text-emerald-400">ส่วนเกิน ({unit.overstock})</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      unit.region === 'ภาคใต้' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'
                    }`}>
                      {unit.region === 'ภาคใต้' ? 'เสี่ยงพายุสูง' : 'ปกติ'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs transition-colors">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-slate-500">ไม่มีข้อมูลหน่วยงาน</div>
          )}
        </div>
      </div>
    </div>
  );
}