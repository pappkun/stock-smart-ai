'use client';
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart, ReferenceLine
} from 'recharts';
import { TrendingUp, Brain, Calendar, ChevronDown, Zap, AlertTriangle, Target, BarChart3 } from 'lucide-react';

// --- Forecast Data per SKU ---
const skuOptions = [
  { id: 'transformer_50', label: 'หม้อแปลง 50kVA', unit: 'ชุด' },
  { id: 'meter_1phase', label: 'มิเตอร์ 1 เฟส', unit: 'ตัว' },
  { id: 'cable_115kv', label: 'สายเคเบิล 115kV', unit: 'ม้วน' },
  { id: 'insulator', label: 'ลูกถ้วยฉนวน', unit: 'ลูก' },
  { id: 'pole_14m', label: 'เสาไฟฟ้า 14 ม.', unit: 'ต้น' },
];

const horizonOptions = [
  { id: '3m', label: '3 เดือน', months: 3 },
  { id: '6m', label: '6 เดือน', months: 6 },
  { id: '12m', label: '12 เดือน', months: 12 },
];

function generateForecastData(skuId: string, months: number) {
  const baseMap: Record<string, { base: number; trend: number; seasonal: number; safety: number }> = {
    transformer_50: { base: 120, trend: 3, seasonal: 15, safety: 85 },
    meter_1phase: { base: 800, trend: 12, seasonal: 60, safety: 550 },
    cable_115kv: { base: 45, trend: 1.5, seasonal: 8, safety: 30 },
    insulator: { base: 300, trend: 5, seasonal: 25, safety: 200 },
    pole_14m: { base: 60, trend: 2, seasonal: 10, safety: 40 },
  };
  const cfg = baseMap[skuId] || baseMap.transformer_50;
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const now = new Date();
  const data = [];

  // 6 months of historical
  for (let i = -6; i < 0; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mi = d.getMonth();
    const noise = (Math.sin(i * 1.7) * 0.1 + (Math.random() - 0.5) * 0.08) * cfg.base;
    const seasonal = Math.sin((mi / 12) * Math.PI * 2) * cfg.seasonal;
    const actual = Math.round(cfg.base + seasonal + noise);
    data.push({
      month: `${monthNames[mi]} ${d.getFullYear() + 543}`,
      actual,
      forecast: null,
      upper: null,
      lower: null,
      safetyStock: cfg.safety,
      type: 'historical',
    });
  }

  // Forecast months
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mi = d.getMonth();
    const trendVal = cfg.trend * (i + 1);
    const seasonal = Math.sin((mi / 12) * Math.PI * 2) * cfg.seasonal;
    const forecast = Math.round(cfg.base + trendVal + seasonal);
    const uncertainty = Math.round(cfg.base * 0.08 * (1 + i * 0.15));
    data.push({
      month: `${monthNames[mi]} ${d.getFullYear() + 543}`,
      actual: null,
      forecast,
      upper: forecast + uncertainty,
      lower: Math.max(0, forecast - uncertainty),
      safetyStock: cfg.safety,
      type: 'forecast',
    });
  }
  return data;
}

interface ForecastTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function ForecastTooltip({ active, payload, label }: ForecastTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {payload.map((p, i) => {
        if (p.value == null) return null;
        const names: Record<string, string> = {
          actual: '📊 ยอดใช้จริง',
          forecast: '🔮 พยากรณ์',
          upper: '⬆️ ขอบบน (95%)',
          lower: '⬇️ ขอบล่าง (95%)',
          safetyStock: '🛡️ Safety Stock',
        };
        return (
          <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{names[p.dataKey] || p.dataKey}</span>
            <span className="font-bold">{Math.round(p.value)}</span>
          </p>
        );
      })}
    </div>
  );
}

export default function ForecastingPanel() {
  const [selectedSku, setSelectedSku] = useState('transformer_50');
  const [horizon, setHorizon] = useState('6m');
  const [showConfidence, setShowConfidence] = useState(true);

  const months = horizonOptions.find(h => h.id === horizon)?.months || 6;
  const skuLabel = skuOptions.find(s => s.id === selectedSku)?.label || '';
  const skuUnit = skuOptions.find(s => s.id === selectedSku)?.unit || '';
  const data = useMemo(() => generateForecastData(selectedSku, months), [selectedSku, months]);

  const forecastData = data.filter(d => d.type === 'forecast');
  const peakMonth = forecastData.reduce((max, d) => (d.forecast || 0) > (max.forecast || 0) ? d : max, forecastData[0]);
  const avgForecast = Math.round(forecastData.reduce((s, d) => s + (d.forecast || 0), 0) / forecastData.length);
  const historicalData = data.filter(d => d.type === 'historical');
  const avgHistorical = Math.round(historicalData.reduce((s, d) => s + (d.actual || 0), 0) / historicalData.length);
  const trendPct = ((avgForecast - avgHistorical) / avgHistorical * 100).toFixed(1);
  const trendUp = Number(trendPct) > 0;
  const belowSafety = forecastData.filter(d => (d.forecast || 0) < (d.safetyStock || 0));

  return (
    <div className="space-y-4">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-white font-bold flex items-center gap-2 text-base">
          <div className="p-1.5 bg-purple-600/20 rounded-lg">
            <TrendingUp className="text-purple-400" size={18} />
          </div>
          🔮 AI Forecasting — พยากรณ์ความต้องการพัสดุ
          <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full font-medium ml-1">
            <Brain size={10} className="inline mr-1" />LSTM + XGBoost
          </span>
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* SKU Select */}
          <div className="relative">
            <select
              value={selectedSku}
              onChange={e => setSelectedSku(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {skuOptions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {/* Horizon */}
          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5">
            {horizonOptions.map(h => (
              <button
                key={h.id}
                onClick={() => setHorizon(h.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  horizon === h.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar size={10} className="inline mr-1" />{h.label}
              </button>
            ))}
          </div>
          {/* CI toggle */}
          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
              showConfidence
                ? 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                : 'bg-slate-900 text-slate-500 border-slate-700'
            }`}
          >
            CI 95%
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">ค่าเฉลี่ยพยากรณ์</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{avgForecast}<span className="text-xs text-slate-500 ml-1">{skuUnit}/เดือน</span></p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">แนวโน้ม vs ค่าเฉลี่ย</p>
          <p className={`text-xl font-bold mt-1 ${trendUp ? 'text-red-400' : 'text-emerald-400'}`}>
            {trendUp ? '↑' : '↓'} {trendPct}%
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">เดือนที่ใช้สูงสุด</p>
          <p className="text-sm font-bold text-amber-400 mt-1 flex items-center gap-1">
            <Zap size={14} />{peakMonth?.month}
          </p>
          <p className="text-[10px] text-slate-500">{peakMonth?.forecast} {skuUnit}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">ต่ำกว่า Safety Stock</p>
          <p className={`text-xl font-bold mt-1 ${belowSafety.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {belowSafety.length > 0 ? (
              <span className="flex items-center gap-1"><AlertTriangle size={16} />{belowSafety.length} เดือน</span>
            ) : (
              <span className="flex items-center gap-1"><Target size={16} />ปลอดภัย</span>
            )}
          </p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <BarChart3 size={12} /> กราฟพยากรณ์: <span className="text-white font-medium">{skuLabel}</span>
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded"></span>ยอดจริง</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-400 inline-block rounded border border-dashed border-purple-400"></span>พยากรณ์</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400/50 inline-block rounded"></span>Safety Stock</span>
          </div>
        </div>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip content={<ForecastTooltip />} />
              <ReferenceLine
                y={data[0]?.safetyStock}
                stroke="#ef4444"
                strokeDasharray="6 4"
                strokeOpacity={0.6}
                label={{ value: 'Safety Stock', position: 'right', fill: '#ef4444', fontSize: 10 }}
              />
              {showConfidence && (
                <>
                  <Area type="monotone" dataKey="upper" stroke="none" fill="url(#gradCI)" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
                </>
              )}
              <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3, fill: '#60a5fa' }} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#a855f7" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: '#a855f7', strokeWidth: 2 }} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-800/40 rounded-xl p-4">
        <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-2">
          <Brain size={14} /> AI Insight — สรุปจากโมเดลพยากรณ์
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          จากการวิเคราะห์ด้วย <span className="text-purple-300 font-medium">LSTM + XGBoost Ensemble</span> พบว่า
          ความต้องการ <span className="text-white font-medium">{skuLabel}</span> มีแนวโน้ม
          <span className={`font-bold ${trendUp ? 'text-red-400' : 'text-emerald-400'}`}>
            {trendUp ? ' เพิ่มขึ้น' : ' ลดลง'} {Math.abs(Number(trendPct))}%
          </span> ในช่วง {months} เดือนข้างหน้า
          {belowSafety.length > 0 && (
            <span className="text-amber-400"> ⚠️ มี {belowSafety.length} เดือนที่คาดว่าจะต่ำกว่าระดับ Safety Stock — แนะนำให้เร่งจัดซื้อล่วงหน้า</span>
          )}
          {belowSafety.length === 0 && (
            <span className="text-emerald-400"> ✅ ทุกเดือนอยู่เหนือระดับ Safety Stock — สถานะปกติ</span>
          )}
        </p>
      </div>
    </div>
  );
}
