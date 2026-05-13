import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client. It will automatically use the OPENAI_API_KEY from environment variables.
const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item, unitName, region } = body;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // Mock fallback if API key is not configured yet
      return NextResponse.json({
        summary: `(MOCK API) AI ตรวจพบแนวโน้มการใช้งาน ${item.name} ในพื้นที่ ${unitName} (${region}) ที่มีการเปลี่ยนแปลง ควรเฝ้าระวังระดับสต็อกให้เหมาะสม (โปรดใส่ OPENAI_API_KEY ของจริงใน .env.local เพื่อดูผลวิเคราะห์จริง)`,
        factors: [
          { label: 'ความเสี่ยงจากพื้นที่', value: 75, color: 'bg-orange-500' },
          { label: 'อัตราการเบิกใช้งาน', value: 60, color: 'bg-blue-500' }
        ]
      });
    }

    const historyText = item.history.map((h: any) => `${h.type} ${h.amount} หน่วย (${h.reason})`).join(', ');

    const prompt = `
คุณคือ AI ผู้เชี่ยวชาญด้านการจัดการคลังพัสดุ (Inventory Management AI) ของการไฟฟ้าส่วนภูมิภาค (PEA)
กรุณาวิเคราะห์สถานการณ์สต็อกของพัสดุต่อไปนี้และให้คำแนะนำแบบสั้นกระชับ (ไม่เกิน 2-3 ประโยค):

ข้อมูลพัสดุ:
- ชื่อ: ${item.name}
- สต็อกปัจจุบัน: ${item.currentUnits} หน่วย
- จุดสั่งซื้อ (Reorder Point): ${item.reorderUnits} หน่วย
- ความจุสูงสุด (Max): ${item.maxUnits} หน่วย
- สถานะปัจจุบัน: ${item.status === 'critical' ? 'วิกฤต (Critical)' : item.status === 'warning' ? 'เฝ้าระวัง (Warning)' : 'ปกติ (Optimal)'}
- ความเสี่ยงที่ระบุเบื้องต้น: ${item.risk}
- หน่วยงานคลัง: ${unitName} (${region})
- ประวัติการทำรายการล่าสุด: ${historyText}

ให้ส่งกลับมาเป็นรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "summary": "ข้อความสรุปการวิเคราะห์เชิงลึกแบบมืออาชีพ (ภาษาไทย)",
  "factors": [
    { "label": "ชื่อปัจจัยที่ 1", "value": 80, "color": "bg-red-500", "text": "ข้อความสั้นๆ (ถ้ามี)" },
    { "label": "ชื่อปัจจัยที่ 2", "value": 45, "color": "bg-orange-500" }
  ]
}
หมายเหตุ: value เป็นตัวเลข 0-100, color ให้ใช้สี tailwind เช่น bg-red-500, bg-orange-500, bg-blue-500, bg-emerald-500 ตามระดับความรุนแรง
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // ใช้โมเดลที่เร็วและถูก (หรือเปลี่ยนเป็น gpt-4o ได้)
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const aiContent = response.choices[0].message.content;
    if (aiContent) {
      const parsedData = JSON.parse(aiContent);
      return NextResponse.json(parsedData);
    } else {
      throw new Error("No content returned from OpenAI");
    }
  } catch (error) {
    console.error("Error in AI Analysis API:", error);
    return NextResponse.json(
      { error: "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}
