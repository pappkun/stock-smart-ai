'use client';
import { Zap, AlertOctagon } from 'lucide-react';

export default function EmergencyMode() {
  return (
    <div className="space-y-6 border-2 border-red-500 p-6 rounded-xl bg-red-950/20 relative overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
      
      <div className="flex items-center gap-4 mb-6">
        <AlertOctagon className="text-red-500 w-12 h-12 animate-bounce" />
        <div>
          <h2 className="text-2xl font-bold text-red-500 tracking-wider">แจ้งเตือนสถานการณ์ฉุกเฉิน</h2>
          <p className="text-slate-300">คำเตือนพายุไต้ฝุ่น: พื้นที่ภาคใต้ (คาดการณ์เวลาเข้าปะทะ: 48 ชั่วโมง)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 p-5 rounded-xl border border-red-900/50 shadow-inner">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">📍 พื้นที่ที่คาดว่าจะได้รับผลกระทบ</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
              <span className="text-red-400 font-medium">นครศรีธรรมราช</span>
              <span className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded text-xs font-bold animate-pulse">ระดับความรุนแรง: สูง (วิกฤต)</span>
            </li>
            <li className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
              <span className="text-orange-400 font-medium">สุราษฎร์ธานี</span>
              <span className="bg-orange-900/80 text-orange-200 px-2 py-0.5 rounded text-xs font-bold">ระดับความรุนแรง: ปานกลาง</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-blue-900/50 shadow-inner">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">🚚 คำแนะนำการกระจายพัสดุฉุกเฉิน</h3>
          <div className="space-y-3">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-3">ตรวจสอบพบสต็อกพร้อมใช้งานที่: <span className="text-emerald-400 font-bold">คลังพัสดุชุมพร</span></p>
              <div className="flex justify-between items-center flex-wrap gap-3">
                <span className="text-sm text-slate-200 font-medium">คำสั่ง: ดึงหม้อแปลง 50 ลูก ไปยังนครศรีธรรมราช</span>
                <button className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-xs shadow-lg shadow-red-900/50 transition-transform active:scale-95">
                  <Zap size={14} /> ดำเนินการเบิกจ่ายด่วน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}