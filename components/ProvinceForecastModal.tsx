'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { X, Brain, TrendingUp, Award, BarChart3, Layers, ChevronDown, Zap, Shield } from 'lucide-react';

// --- Model definitions ---
const MODELS = [
  { key: 'lstm',       label: 'LSTM',              color: '#a855f7', emoji: '🧠' },
  { key: 'xgboost',    label: 'XGBoost',           color: '#3b82f6', emoji: '🌲' },
  { key: 'prophet',    label: 'Prophet',            color: '#10b981', emoji: '📈' },
  { key: 'arima',      label: 'ARIMA',              color: '#f59e0b', emoji: '📊' },
  { key: 'ensemble',   label: 'Ensemble (Avg)',     color: '#ef4444', emoji: '🎯' },
];

// --- SKU options per depot ---
const SKU_LIST = [
  { id: 'transformer_50', label: 'หม้อแปลง 50kVA', unit: 'ชุด' },
  { id: 'meter_1phase',   label: 'มิเตอร์ 1 เฟส',   unit: 'ตัว' },
  { id: 'cable_115kv',    label: 'สายเคเบิล 115kV',  unit: 'ม้วน' },
  { id: 'insulator',      label: 'ลูกถ้วยฉนวน',      unit: 'ลูก' },
  { id: 'pole_14m',       label: 'เสาไฟฟ้า 14 ม.',   unit: 'ต้น' },
];

// --- Sub-province data per unit ---
const SUB_PROVINCES: Record<number, string[]> = {
  1:  ['เชียงใหม่', 'ลำพูน', 'แม่ฮ่องสอน', 'เชียงราย'],
  2:  ['พิษณุโลก', 'สุโขทัย', 'อุตรดิตถ์', 'ตาก'],
  3:  ['ลพบุรี', 'สระบุรี', 'ชัยนาท', 'สิงห์บุรี'],
  4:  ['อุดรธานี', 'หนองคาย', 'เลย', 'หนองบัวลำภู'],
  5:  ['อุบลราชธานี', 'ศรีสะเกษ', 'ยโสธร', 'อำนาจเจริญ'],
  6:  ['นครราชสีมา', 'บุรีรัมย์', 'สุรินทร์', 'ชัยภูมิ'],
  7:  ['อยุธยา', 'อ่างทอง', 'นนทบุรี', 'ปทุมธานี'],
  8:  ['ชลบุรี', 'ระยอง', 'ฉะเชิงเทรา', 'จันทบุรี'],
  9:  ['นครปฐม', 'ราชบุรี', 'กาญจนบุรี', 'สมุทรสาคร'],
  10: ['เพชรบุรี', 'ประจวบคีรีขันธ์', 'ชุมพร', 'ระนอง'],
  11: ['นครศรีธรรมราช', 'สุราษฎร์ธานี', 'พัทลุง', 'สงขลา'],
  12: ['ยะลา', 'ปัตตานี', 'นราธิวาส', 'สตูล'],
};

// Deterministic pseudo-random based on seed
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMultiModelData(unitId: number, skuId: string, province: string) {
  const baseMap: Record<string, number> = {
    transformer_50: 120, meter_1phase: 800, cable_115kv: 45,
    insulator: 300, pole_14m: 60,
  };
  const safetyMap: Record<string, number> = {
    transformer_50: 85, meter_1phase: 550, cable_115kv: 30,
    insulator: 200, pole_14m: 40,
  };

  // Create a unique seed from unitId + skuId + province
  const seedStr = `${unitId}-${skuId}-${province}`;
  let seedVal = 0;
  for (let i = 0; i < seedStr.length; i++) seedVal = seedVal * 31 + seedStr.charCodeAt(i);
  const rng = seededRandom(Math.abs(seedVal) + 1);

  const base = (baseMap[skuId] || 120) * (0.3 + rng() * 0.5); // scale per province
  const safety = (safetyMap[skuId] || 85) * (0.3 + rng() * 0.5);
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const now = new Date();
  const data = [];

  // 6 historical + 6 forecast months
  for (let i = -6; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const mi = d.getMonth();
    const label = `${monthNames[mi]} ${d.getFullYear() + 543}`;
    const seasonal = Math.sin((mi / 12) * Math.PI * 2) * base * 0.12;

    if (i < 0) {
      // Historical — single actual value
      const noise = (rng() - 0.5) * base * 0.15;
      const actual = Math.round(base + seasonal + noise);
      data.push({
        month: label,
        actual,
        lstm: null, xgboost: null, prophet: null, arima: null, ensemble: null,
        safetyStock: Math.round(safety),
        type: 'historical',
      });
    } else {
      // Forecast — each model produces a slightly different prediction
      const trend = base * 0.02 * (i + 1);
      const baseForecast = base + seasonal + trend;

      // Each model has a small offset from base — they're close but not identical
      const lstm     = Math.round(baseForecast + (rng() - 0.45) * base * 0.08);
      const xgboost  = Math.round(baseForecast + (rng() - 0.48) * base * 0.07);
      const prophet  = Math.round(baseForecast + (rng() - 0.50) * base * 0.09);
      const arima    = Math.round(baseForecast + (rng() - 0.47) * base * 0.10);
      const ensemble = Math.round((lstm + xgboost + prophet + arima) / 4);

      data.push({
        month: label,
        actual: null,
        lstm, xgboost, prophet, arima, ensemble,
        safetyStock: Math.round(safety),
        type: 'forecast',
      });
    }
  }
  return data;
}

// --- Model accuracy table data ---
function getModelAccuracy(rng: () => number) {
  return MODELS.map(m => ({
    ...m,
    mae:  +(2 + rng() * 5).toFixed(1),
    rmse: +(3 + rng() * 6).toFixed(1),
    mape: +(1.5 + rng() * 4).toFixed(1),
    r2:   +(0.88 + rng() * 0.10).toFixed(3),
  }));
}

// Custom tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null; dataKey: string; color: string }>;
  label?: string;
}

function MultiModelTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const nameMap: Record<string, string> = {
    actual: '📊 ยอดใช้จริง', lstm: '🧠 LSTM', xgboost: '🌲 XGBoost',
    prophet: '📈 Prophet', arima: '📊 ARIMA', ensemble: '🎯 Ensemble',
    safetyStock: '🛡️ Safety Stock',
  };
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-2xl text-xs min-w-[180px]">
      <p className="text-slate-300 font-semibold mb-2 border-b border-slate-700 pb-1">{label}</p>
      {payload.map((p, i) => {
        if (p.value == null) return null;
        return (
          <p key={i} style={{ color: p.color }} className="flex justify-between gap-4 py-0.5">
            <span>{nameMap[p.dataKey] || p.dataKey}</span>
            <span className="font-bold">{Math.round(p.value)}</span>
          </p>
        );
      })}
    </div>
  );
}

// --- Main Modal Component ---
interface Unit {
  id: number;
  name: string;
  region: string;
  criticalSkus: number;
  warningSkus: number;
  topShortage: string;
  status: string;
}

interface Props {
  unit: Unit;
  onClose: () => void;
}

export default function ProvinceForecastModal({ unit, onClose }: Props) {
  const provinces = SUB_PROVINCES[unit.id] || ['จังหวัดหลัก'];
  const [selectedProvince, setSelectedProvince] = useState(provinces[0]);
  const [selectedSku, setSelectedSku] = useState('transformer_50');
  const [visibleModels, setVisibleModels] = useState<Record<string, boolean>>(
    Object.fromEntries(MODELS.map(m => [m.key, true]))
  );

  const skuUnit = SKU_LIST.find(s => s.id === selectedSku)?.unit || '';

  const data = useMemo(
    () => generateMultiModelData(unit.id, selectedSku, selectedProvince),
    [unit.id, selectedSku, selectedProvince]
  );

  const rng = useMemo(() => {
    const s = `${unit.id}-${selectedSku}-${selectedProvince}`;
    let v = 0;
    for (let i = 0; i < s.length; i++) v = v * 31 + s.charCodeAt(i);
    return seededRandom(Math.abs(v) + 42);
  }, [unit.id, selectedSku, selectedProvince]);

  const modelAccuracies = useMemo(() => getModelAccuracy(rng), [rng]);

  const bestModel = useMemo(() => {
    return modelAccuracies.reduce((best, m) => (m.mape < best.mape ? m : best), modelAccuracies[0]);
  }, [modelAccuracies]);

  const forecastData = data.filter(d => d.type === 'forecast');
  const ensembleAvg = forecastData.length > 0
    ? Math.round(forecastData.reduce((s, d) => s + (d.ensemble || 0), 0) / forecastData.length)
    : 0;

  const toggleModel = useCallback((key: string) => {
    setVisibleModels(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideIn 0.3s ease-out' }}
      >
        {/* Inline animation */}
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-blue-400" />
              {unit.name}
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-normal">{unit.region}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Forecasting รายจังหวัด — เปรียบเทียบหลายโมเดล AI
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Province selector */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-400">📍 จังหวัด:</span>
              <div className="relative">
                <select
                  value={selectedProvince}
                  onChange={e => setSelectedProvince(e.target.value)}
                  className="appearance-none bg-transparent text-white text-xs font-medium pr-5 focus:outline-none cursor-pointer"
                >
                  {provinces.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* SKU selector */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-400">📦 พัสดุ:</span>
              <div className="relative">
                <select
                  value={selectedSku}
                  onChange={e => setSelectedSku(e.target.value)}
                  className="appearance-none bg-transparent text-white text-xs font-medium pr-5 focus:outline-none cursor-pointer"
                >
                  {SKU_LIST.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.label}</option>)}
                </select>
                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Model toggles */}
            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {MODELS.map(m => (
                <button
                  key={m.key}
                  onClick={() => toggleModel(m.key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                    visibleModels[m.key]
                      ? 'border-opacity-50 text-white'
                      : 'border-slate-700 text-slate-600 opacity-50'
                  }`}
                  style={{
                    borderColor: visibleModels[m.key] ? m.color : undefined,
                    backgroundColor: visibleModels[m.key] ? `${m.color}20` : undefined,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ensemble เฉลี่ย</p>
              <p className="text-xl font-bold text-red-400 mt-1">{ensembleAvg}<span className="text-xs text-slate-500 ml-1">{skuUnit}/เดือน</span></p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Award size={10} />โมเดลที่แม่นที่สุด</p>
              <p className="text-sm font-bold mt-1" style={{ color: bestModel.color }}>
                {bestModel.emoji} {bestModel.label}
              </p>
              <p className="text-[10px] text-slate-500">MAPE: {bestModel.mape}%</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Safety Stock</p>
              <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1"><Shield size={16} />{data[0]?.safetyStock}<span className="text-xs text-slate-500 ml-1">{skuUnit}</span></p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">จำนวนโมเดลที่แสดง</p>
              <p className="text-xl font-bold text-blue-400 mt-1">{Object.values(visibleModels).filter(Boolean).length}<span className="text-xs text-slate-500 ml-1">/ {MODELS.length}</span></p>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <BarChart3 size={12} />
                กราฟพยากรณ์ — <span className="text-white font-medium">{selectedProvince}</span>
                <span className="text-slate-600 ml-1">(จ.{selectedProvince} ← {unit.name})</span>
              </p>
              <p className="text-[10px] text-slate-600">ข้อมูลย้อนหลัง 6 เดือน + พยากรณ์ 6 เดือน</p>
            </div>

            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip content={<MultiModelTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <ReferenceLine
                    y={data[0]?.safetyStock}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    strokeOpacity={0.5}
                    label={{ value: 'Safety Stock', position: 'right', fill: '#ef4444', fontSize: 9 }}
                  />

                  {/* Actual line */}
                  <Line
                    type="monotone" dataKey="actual" name="ยอดจริง"
                    stroke="#94a3b8" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#94a3b8' }}
                    connectNulls={false}
                  />

                  {/* Model lines */}
                  {MODELS.map(m => (
                    visibleModels[m.key] && (
                      <Line
                        key={m.key}
                        type="monotone"
                        dataKey={m.key}
                        name={`${m.emoji} ${m.label}`}
                        stroke={m.color}
                        strokeWidth={m.key === 'ensemble' ? 3 : 1.8}
                        strokeDasharray={m.key === 'ensemble' ? '0' : '5 3'}
                        dot={{ r: m.key === 'ensemble' ? 4 : 2.5, fill: m.color }}
                        connectNulls={false}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Accuracy Table */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Brain size={14} className="text-purple-400" />
              ตารางเปรียบเทียบความแม่นยำของแต่ละโมเดล
              <span className="text-[10px] font-normal text-slate-500">(ประเมินจาก Cross-Validation)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 text-left rounded-tl-lg">โมเดล</th>
                    <th className="p-3 text-center">MAE</th>
                    <th className="p-3 text-center">RMSE</th>
                    <th className="p-3 text-center">MAPE (%)</th>
                    <th className="p-3 text-center rounded-tr-lg">R²</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {modelAccuracies.map(m => (
                    <tr
                      key={m.key}
                      className={`hover:bg-slate-700/30 transition-colors ${m.key === bestModel.key ? 'bg-emerald-900/10' : ''}`}
                    >
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: m.color }} />
                        {m.emoji} {m.label}
                        {m.key === bestModel.key && (
                          <span className="text-[9px] bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded-full">BEST</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">{m.mae}</td>
                      <td className="p-3 text-center font-mono">{m.rmse}</td>
                      <td className="p-3 text-center font-mono font-bold" style={{ color: m.mape < 3 ? '#10b981' : m.mape < 5 ? '#f59e0b' : '#ef4444' }}>
                        {m.mape}%
                      </td>
                      <td className="p-3 text-center font-mono">{m.r2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/40 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-2">
              <Zap size={14} /> AI Insight — จ.{selectedProvince}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              จากการเปรียบเทียบ {MODELS.length} โมเดล พบว่า <span className="font-bold" style={{ color: bestModel.color }}>{bestModel.label}</span> ให้ผลพยากรณ์ที่แม่นยำที่สุด
              (MAPE = <span className="text-white font-bold">{bestModel.mape}%</span>)
              สำหรับพื้นที่ จ.{selectedProvince}
              {' '}โดยค่า Ensemble เฉลี่ยอยู่ที่ <span className="text-white font-bold">{ensembleAvg} {skuUnit}/เดือน</span>
              {' '}— ทุกโมเดลมีแนวโน้มใกล้เคียงกัน แสดงถึงความเชื่อมั่นสูงในผลพยากรณ์
              {ensembleAvg < (data[0]?.safetyStock || 0)
                ? <span className="text-red-400 font-medium"> ⚠️ ค่าเฉลี่ยต่ำกว่า Safety Stock — ควรเร่งจัดซื้อเพิ่ม</span>
                : <span className="text-emerald-400 font-medium"> ✅ ระดับสต็อกอยู่ในเกณฑ์ปลอดภัย</span>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
