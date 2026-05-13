'use client';
import { useState, useEffect } from 'react';
import { Zap, AlertOctagon, CheckCircle2, Truck, Package, MapPin, Loader2 } from 'lucide-react';

export default function EmergencyMode() {
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'processing' | 'dispatched'>('idle');
  const [trackingStep, setTrackingStep] = useState(0);

  const handleDispatch = () => {
    setDispatchStatus('processing');
    
    // Simulate API call processing time
    setTimeout(() => {
      setDispatchStatus('dispatched');
      setTrackingStep(1); // 1 = เตรียมพัสดุ
    }, 1500);
  };

  useEffect(() => {
    if (dispatchStatus === 'dispatched' && trackingStep > 0 && trackingStep < 4) {
      const timer = setTimeout(() => {
        setTrackingStep(prev => prev + 1);
      }, 3000); // Progress every 3 seconds for demo purposes
      return () => clearTimeout(timer);
    }
  }, [dispatchStatus, trackingStep]);

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
        {/* ซ้าย: พื้นที่ที่ได้รับผลกระทบ */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-red-900/50 shadow-inner h-fit">
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

        {/* ขวา: การจัดการพัสดุฉุกเฉิน & Tracking */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-blue-900/50 shadow-inner flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">🚚 คำแนะนำการกระจายพัสดุฉุกเฉิน</h3>
            
            {dispatchStatus === 'idle' || dispatchStatus === 'processing' ? (
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-4">
                <p className="text-sm text-slate-300 mb-3">ตรวจสอบพบสต็อกพร้อมใช้งานที่: <span className="text-emerald-400 font-bold">คลังพัสดุชุมพร</span></p>
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <span className="text-sm text-slate-200 font-medium">คำสั่ง: ดึงหม้อแปลง 50 ลูก ไปยังนครศรีธรรมราช</span>
                  <button 
                    onClick={handleDispatch}
                    disabled={dispatchStatus === 'processing'}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs shadow-lg transition-all active:scale-95 ${
                      dispatchStatus === 'processing' 
                        ? 'bg-red-900 text-slate-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'
                    }`}
                  >
                    {dispatchStatus === 'processing' ? (
                      <><Loader2 size={14} className="animate-spin" /> กำลังสร้างใบสั่งจ่าย...</>
                    ) : (
                      <><Zap size={14} /> ดำเนินการเบิกจ่ายด่วน</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Live Tracking UI */}
          {dispatchStatus === 'dispatched' && (
            <div className="mt-4 bg-slate-800/80 p-5 rounded-xl border border-emerald-900/50 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 right-0 p-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-emerald-400 mb-6 flex items-center gap-2">
                <Truck size={16} /> สถานะการจัดส่งฉุกเฉิน (Live Tracking)
              </h4>

              {/* Progress Steps */}
              <div className="relative flex flex-col gap-6 pl-4">
                {/* Connecting Line */}
                <div className="absolute top-2 bottom-2 left-[21px] w-[2px] bg-slate-700 z-0"></div>
                <div 
                  className="absolute top-2 left-[21px] w-[2px] bg-emerald-500 z-0 transition-all duration-700 ease-out"
                  style={{ height: `${(trackingStep - 1) * 33}%` }}
                ></div>

                {/* Step 1: เตรียมพัสดุ */}
                <div className={`relative z-10 flex gap-4 items-center transition-opacity duration-300 ${trackingStep >= 1 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${trackingStep > 1 ? 'bg-emerald-600' : trackingStep === 1 ? 'bg-blue-600 animate-pulse' : 'bg-slate-700'}`}>
                    <Package size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">คลังพัสดุชุมพร (ต้นทาง)</p>
                    <p className="text-[10px] text-slate-400">{trackingStep === 1 ? 'กำลังเบิกจ่ายหม้อแปลง 50 ลูก...' : 'เตรียมพัสดุเสร็จสิ้น'}</p>
                  </div>
                </div>

                {/* Step 2: ขนส่ง */}
                <div className={`relative z-10 flex gap-4 items-center transition-opacity duration-300 ${trackingStep >= 2 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${trackingStep > 2 ? 'bg-emerald-600' : trackingStep === 2 ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`}>
                    <Truck size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">กำลังเดินทาง</p>
                    <p className="text-[10px] text-slate-400">รถบรรทุก 10 ล้อ ทะเบียน 89-1234 (นายสมหมาย)</p>
                    {trackingStep === 2 && (
                      <p className="text-[10px] text-orange-400 mt-0.5">ถึงจุดพักรถ อ.สุราษฎร์ธานี (ความเร็ว 80 km/h)</p>
                    )}
                  </div>
                </div>

                {/* Step 3: ถึงปลายทาง */}
                <div className={`relative z-10 flex gap-4 items-center transition-opacity duration-300 ${trackingStep >= 3 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${trackingStep >= 3 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-700'}`}>
                    <MapPin size={14} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${trackingStep >= 3 ? 'text-emerald-400' : 'text-slate-200'}`}>นครศรีธรรมราช (ปลายทาง)</p>
                    <p className="text-[10px] text-slate-400">{trackingStep >= 3 ? 'ถึงที่หมายเรียบร้อยแล้ว' : 'คาดว่าจะถึงในอีก 2 ชม.'}</p>
                  </div>
                </div>
              </div>

              {trackingStep >= 3 && (
                <div className="mt-6 flex justify-center animate-in zoom-in duration-300 delay-300">
                  <div className="bg-emerald-900/40 text-emerald-400 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold border border-emerald-500/30">
                    <CheckCircle2 size={16} /> ภารกิจจัดส่งฉุกเฉินเสร็จสิ้น
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}