'use client';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

// โหลด Map แบบ ปิด SSR (Server-Side Rendering)
const RiskMap = dynamic(() => import('./RiskMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
      <p className="text-slate-400 animate-pulse">กำลังเตรียมแผนที่ 3D...</p>
    </div>
  )
});

export default function NationalOverview() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* สรุปตัวเลข (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex items-center justify-between hover:border-blue-500 transition-colors cursor-default">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold">ภาพรวม Safety Stock</h3>
            <p className="text-3xl font-bold text-emerald-400 mt-2">82% <span className="text-sm font-normal text-slate-400 ml-1">(เหมาะสม)</span></p>
          </div>
          <CheckCircle className="text-emerald-500 w-10 h-10 opacity-80" />
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex items-center justify-between hover:border-red-500 transition-colors cursor-default">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold">พื้นที่เสี่ยงระดับวิกฤต</h3>
            <p className="text-3xl font-bold text-red-500 mt-2">3 <span className="text-lg font-normal text-slate-400 ml-1">พื้นที่</span></p>
          </div>
          <AlertTriangle className="text-red-500 w-10 h-10 opacity-80" />
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex items-center justify-between hover:border-blue-500 transition-colors cursor-default">
          <div>
            <h3 className="text-slate-400 text-sm font-semibold">ความแม่นยำของ AI</h3>
            <p className="text-3xl font-bold text-blue-400 mt-2">94% <span className="text-sm font-normal text-slate-400 ml-1">(สูง)</span></p>
          </div>
          <ShieldAlert className="text-blue-500 w-10 h-10 opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* แผนที่ความเสี่ยง */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl min-h-[500px] flex flex-col relative overflow-hidden">
          <h3 className="text-white font-bold flex items-center gap-2 mb-4 z-10">
            🗺️ แผนที่ความเสี่ยงและสถานะคลังพัสดุ
          </h3>
          <div className="w-full flex-1 rounded-lg border border-slate-700 overflow-hidden relative shadow-inner bg-[#0f172a]">
            <RiskMap />
          </div>
          
          {/* Legend (คำอธิบายสีแผนที่) */}
          <div className="absolute bottom-8 right-8 bg-slate-900/90 border border-slate-700 p-3 rounded-lg z-[400] text-xs shadow-lg backdrop-blur-sm">
            <p className="text-slate-300 font-bold mb-2">ระดับความเสี่ยงพัสดุ</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                <span className="text-slate-300">วิกฤต (ขาดแคลน/เกิน)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                <span className="text-slate-300">เฝ้าระวัง (ต้องการจัดการ)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                <span className="text-slate-300">ปกติ (เหมาะสม)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* การแจ้งเตือน (Alerts) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md flex flex-col">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            🚨 การแจ้งเตือนระดับวิกฤต
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">2 ใหม่</span>
          </h3>
          <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <li className="p-4 bg-red-900/30 border border-red-800/50 rounded-lg hover:bg-red-900/40 transition-colors cursor-pointer relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 group-hover:w-1.5 transition-all"></div>
              <p className="text-red-400 font-bold text-sm flex justify-between">
                กฟจ. นครศรีธรรมราช
                <span className="text-xs text-red-500 font-normal">เพิ่งเกิดขึ้น</span>
              </p>
              <p className="text-sm text-slate-300 mt-2">แจ้งเตือนพายุเข้า: สต็อกหม้อแปลงลดลงต่ำกว่า 20% (ต้องการ 89 ชุดด่วน)</p>
              <button className="mt-3 text-xs bg-red-950 text-red-300 border border-red-800 px-3 py-1 rounded hover:bg-red-900 transition-colors">ดูคำแนะนำ AI</button>
            </li>
            
            <li className="p-4 bg-orange-900/30 border border-orange-800/50 rounded-lg hover:bg-orange-900/40 transition-colors cursor-pointer relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 group-hover:w-1.5 transition-all"></div>
              <p className="text-orange-400 font-bold text-sm flex justify-between">
                กฟจ. ชลบุรี
                <span className="text-xs text-orange-500 font-normal">2 ชม. ที่แล้ว</span>
              </p>
              <p className="text-sm text-slate-300 mt-2">ยอดผู้ใช้ EV พุ่งสูง: ความต้องการมิเตอร์อัจฉริยะ +45% (เริ่มกระทบแผนงาน)</p>
              <button className="mt-3 text-xs bg-orange-950 text-orange-300 border border-orange-800 px-3 py-1 rounded hover:bg-orange-900 transition-colors">ตรวจสอบสต็อก</button>
            </li>

            <li className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg opacity-60">
              <p className="text-slate-400 font-bold text-sm flex justify-between">
                กฟจ. สุราษฎร์ธานี
                <span className="text-xs text-slate-500 font-normal">เมื่อวาน</span>
              </p>
              <p className="text-sm text-slate-400 mt-2">Overstock สายเคเบิล 15% (สามารถโอนย้ายได้)</p>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}