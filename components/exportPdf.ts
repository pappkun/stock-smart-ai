// ---------- mock shortage data ----------
interface ShortageRow {
  no: number;
  sku: string;
  name: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  shortage: number;
  status: string;
  urgency: string;
  estimatedCost: string;
}

function getMockShortageData(unitName: string): ShortageRow[] {
  const seed = unitName.length * 7;
  return [
    { no: 1, sku: 'TF-50KVA-001', name: 'Transformer 50kVA 3Phase', unit: 'Set', currentStock: 12, safetyStock: 50, shortage: 38, status: 'CRITICAL', urgency: 'URGENT', estimatedCost: '7,600,000' },
    { no: 2, sku: 'TF-100KVA-002', name: 'Transformer 100kVA 3Phase', unit: 'Set', currentStock: 5, safetyStock: 25, shortage: 20, status: 'CRITICAL', urgency: 'URGENT', estimatedCost: '7,000,000' },
    { no: 3, sku: 'MT-TOU-003', name: 'Smart Meter TOU (EV)', unit: 'Pcs', currentStock: 180 + seed, safetyStock: 600, shortage: Math.max(0, 420 - seed), status: 'CRITICAL', urgency: 'HIGH', estimatedCost: '2,520,000' },
    { no: 4, sku: 'MT-1PH-004', name: 'Meter 1Phase 5(15)A', unit: 'Pcs', currentStock: 340, safetyStock: 500, shortage: 160, status: 'WARNING', urgency: 'MEDIUM', estimatedCost: '240,000' },
    { no: 5, sku: 'CB-115KV-005', name: 'Cable 115kV XLPE', unit: 'Roll', currentStock: 8, safetyStock: 20, shortage: 12, status: 'WARNING', urgency: 'MEDIUM', estimatedCost: '3,600,000' },
    { no: 6, sku: 'CB-LV-006', name: 'LV Cable 50 sq.mm', unit: 'Roll', currentStock: 85, safetyStock: 120, shortage: 35, status: 'WARNING', urgency: 'MEDIUM', estimatedCost: '525,000' },
    { no: 7, sku: 'INS-PIN-007', name: 'Insulator Pin Type', unit: 'Pcs', currentStock: 200, safetyStock: 350, shortage: 150, status: 'WARNING', urgency: 'MEDIUM', estimatedCost: '225,000' },
    { no: 8, sku: 'POLE-14M-008', name: 'Concrete Pole 14m', unit: 'Pcs', currentStock: 15, safetyStock: 40, shortage: 25, status: 'WARNING', urgency: 'MEDIUM', estimatedCost: '625,000' },
    { no: 9, sku: 'CRS-ARM-009', name: 'Cross Arm for 14m Pole', unit: 'Set', currentStock: 45, safetyStock: 80, shortage: 35, status: 'WARNING', urgency: 'LOW', estimatedCost: '105,000' },
    { no: 10, sku: 'FUSE-CUT-010', name: 'Fuse Cutout 33kV', unit: 'Pcs', currentStock: 60, safetyStock: 100, shortage: 40, status: 'WARNING', urgency: 'LOW', estimatedCost: '120,000' },
    { no: 11, sku: 'LA-33KV-011', name: 'Lightning Arrester 33kV', unit: 'Pcs', currentStock: 30, safetyStock: 50, shortage: 20, status: 'NORMAL', urgency: 'LOW', estimatedCost: '100,000' },
    { no: 12, sku: 'GW-CLAMP-012', name: 'Ground Wire Clamp', unit: 'Set', currentStock: 120, safetyStock: 150, shortage: 30, status: 'NORMAL', urgency: 'LOW', estimatedCost: '45,000' },
  ];
}

function fmtNum(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Map Thai unit/region names to English
function toEngUnit(name: string): string {
  const map: Record<string, string> = {
    'PEA เขต 1 ภาคเหนือ เชียงใหม่': 'PEA Zone 1 North (Chiang Mai)',
    'PEA จ.เชียงใหม่ สาขาที่ 1': 'PEA Chiang Mai Branch 1',
    'PEA จ.เชียงใหม่ สาขาที่ 2': 'PEA Chiang Mai Branch 2',
    'PEA อ.สันทราย': 'PEA Sansai District',
    'PEA อ.สันป่าตอง': 'PEA San Pa Tong District',
    'PEA อ.แม่ริม': 'PEA Mae Rim District',
    'PEA อ.สารภี': 'PEA Saraphi District',
    'PEA สาขาย่อยแม่อาย': 'PEA Mae Ai Sub-branch',
    'PEA สาขาย่อยฮอด': 'PEA Hot Sub-branch',
    'PEA สาขาย่อยแม่แจ่ม': 'PEA Mae Chaem Sub-branch',
    'PEA สาขาย่อยจอมทอง': 'PEA Chom Thong Sub-branch',
    'PEA จ.นครศรีธรรมราช': 'PEA Nakhon Si Thammarat',
    'กองคลังพัสดุ (ส่วนกลาง)': 'Central Warehouse (HQ)',
  };
  return map[name] || name.replace(/[^\x00-\x7F]/g, '');
}

function toEngRegion(r: string): string {
  const map: Record<string, string> = {
    'ภาคเหนือ': 'Northern', 'ภาคใต้': 'Southern', 'ภาคกลาง': 'Central',
    'ภาคตะวันออกเฉียงเหนือ': 'Northeastern', 'กรุงเทพฯ': 'Bangkok',
  };
  return map[r] || r.replace(/[^\x00-\x7F]/g, '');
}

// ---------- main export ----------
export async function exportShortageReport(unitName: string, region: string) {
  // Dynamic import to avoid SSR issues
  const jspdfModule = await import('jspdf');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || autoTableModule;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new (jsPDF as any)({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeUnit = toEngUnit(unitName);
  const safeRegion = toEngRegion(region);

  // --- Header band ---
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Stock Smart AI - Material Shortage Report', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Unit: ${safeUnit}  |  Region: ${safeRegion}  |  Date: ${dateStr}`, 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PEA Hackathon PoC - AI-Powered Inventory Management', pageW - 14, 8, { align: 'right' });
  doc.text('Powered by LSTM + XGBoost Ensemble', pageW - 14, 13, { align: 'right' });

  // Blue accent line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(0, 28, pageW, 28);

  // --- Summary boxes ---
  const data = getMockShortageData(unitName);
  const totalShortage = data.reduce((s, r) => s + r.shortage, 0);
  const criticalCount = data.filter(r => r.status === 'CRITICAL').length;
  const warningCount = data.filter(r => r.status === 'WARNING').length;
  const totalCostNum = data.reduce((s, r) => s + parseInt(r.estimatedCost.replace(/,/g, '')), 0);

  const sy = 33, bw = 62, bh = 18, g = 6, sx = 14;

  // Box 1
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(sx, sy, bw, bh, 2, 2, 'F');
  doc.setDrawColor(239, 68, 68); doc.setLineWidth(0.3);
  doc.roundedRect(sx, sy, bw, bh, 2, 2, 'S');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
  doc.text('TOTAL SHORTAGE ITEMS', sx + 3, sy + 5);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(239, 68, 68);
  doc.text(`${data.length} items (${totalShortage} units)`, sx + 3, sy + 13);

  // Box 2
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(sx + bw + g, sy, bw, bh, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11); doc.roundedRect(sx + bw + g, sy, bw, bh, 2, 2, 'S');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
  doc.text('CRITICAL / WARNING ITEMS', sx + bw + g + 3, sy + 5);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(239, 68, 68);
  doc.text(`${criticalCount} / ${warningCount}`, sx + bw + g + 3, sy + 13);

  // Box 3
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(sx + (bw + g) * 2, sy, bw + 20, bh, 2, 2, 'F');
  doc.setDrawColor(59, 130, 246); doc.roundedRect(sx + (bw + g) * 2, sy, bw + 20, bh, 2, 2, 'S');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
  doc.text('ESTIMATED BUDGET', sx + (bw + g) * 2 + 3, sy + 5);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(96, 165, 250);
  doc.text(`${fmtNum(totalCostNum)} THB`, sx + (bw + g) * 2 + 3, sy + 13);

  // --- Table ---
  const tableBody = data.map(row => [
    String(row.no), row.sku, row.name, row.unit,
    fmtNum(row.currentStock), fmtNum(row.safetyStock), fmtNum(row.shortage),
    row.status, row.urgency, row.estimatedCost,
  ]);

  autoTable(doc, {
    startY: sy + bh + 5,
    head: [['No.', 'SKU', 'Material / Equipment', 'Unit', 'Current', 'Safety', 'Short', 'Status', 'Urgency', 'Budget (THB)']],
    body: tableBody,
    styles: {
      font: 'helvetica', fontSize: 9, cellPadding: 2.5,
      textColor: [226, 232, 240], lineColor: [51, 65, 85], lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [15, 23, 42], textColor: [148, 163, 184],
      fontStyle: 'bold', fontSize: 8, halign: 'center', cellPadding: 3,
    },
    bodyStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [22, 33, 50] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, 1: { cellWidth: 26, fontSize: 8 },
      2: { cellWidth: 55 }, 3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 18 }, 5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 16 }, 7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 20 }, 9: { halign: 'right', cellWidth: 26 },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        const ci = hookData.column.index;
        const val = String(hookData.cell.raw);
        // Status column
        if (ci === 7) {
          if (val === 'CRITICAL') hookData.cell.styles.textColor = [239, 68, 68];
          else if (val === 'WARNING') hookData.cell.styles.textColor = [245, 158, 11];
          else hookData.cell.styles.textColor = [16, 185, 129];
        }
        // Shortage column
        if (ci === 6) {
          const n = parseInt(val.replace(/,/g, ''));
          if (n >= 100) hookData.cell.styles.textColor = [239, 68, 68];
          else if (n >= 30) hookData.cell.styles.textColor = [245, 158, 11];
        }
        // Urgency column
        if (ci === 8) {
          if (val === 'URGENT') hookData.cell.styles.textColor = [239, 68, 68];
          else if (val === 'HIGH') hookData.cell.styles.textColor = [245, 158, 11];
        }
      }
    },
  });

  // --- Footer ---
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageH - 12, pageW, 12, 'F');
  doc.setDrawColor(59, 130, 246); doc.setLineWidth(0.4);
  doc.line(0, pageH - 12, pageW, pageH - 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
  doc.text('Stock Smart AI | PEA Hackathon PoC | Auto-generated (Prototype) | Mock data for demo', 14, pageH - 5);
  doc.text(`Page 1/1 | ${new Date().toISOString()}`, pageW - 14, pageH - 5, { align: 'right' });

  // Save
  doc.save(`shortage_report_${dateStr}.pdf`);
}
