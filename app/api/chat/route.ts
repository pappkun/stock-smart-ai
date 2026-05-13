import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json({
        reply: "⚠️ ขออภัยครับ คุณยังไม่ได้ตั้งค่า OPENAI_API_KEY ในไฟล์ .env.local ทำให้ระบบแชทบอทยังไม่สามารถตอบคำถามได้ครับ"
      });
    }

    const systemPrompt = `
คุณคือ "Stock Smart AI Assistant" ผู้ช่วยอัจฉริยะของการไฟฟ้าส่วนภูมิภาค (PEA)
หน้าที่ของคุณคือตอบคำถามเกี่ยวกับการจัดการคลังพัสดุ สถานการณ์ปัจจุบัน และให้คำแนะนำ
อ้างอิงข้อมูลสถานการณ์สมมติดังต่อไปนี้เพื่อตอบคำถาม:
- ภาพรวม: ปัจจุบันภาคเหนือ (โดยเฉพาะเชียงใหม่) มีพายุฤดูร้อน ทำให้ความต้องการพัสดุฉุกเฉินเพิ่มขึ้นสูงมาก
- พัสดุวิกฤต (Critical): "หม้อแปลงไฟฟ้า 50kVA" และ "100kVA" มีของในสต็อกต่ำกว่าจุด Reorder Point มาก (เช่น เชียงใหม่เหลือแค่ 12 หน่วย จากที่ควรมี 50 หน่วย)
- พัสดุเฝ้าระวัง (Warning): สายเคเบิลต่างๆ และมิเตอร์ 1 เฟส
- การคาดการณ์: AI โมเดล (LSTM, XGBoost) ประเมินว่าความต้องการหม้อแปลงและสายเคเบิลในภาคเหนือจะพุ่งสูงขึ้นอีก 30% ในสัปดาห์หน้า
- คำแนะนำที่คุณควรให้: ควรเร่งเบิกจ่ายหม้อแปลงจากคลังส่วนกลาง และจัดเตรียมแผนสำรองสำหรับสายเคเบิลแรงต่ำ

ตอบคำถามด้วยความสุภาพ เป็นมืออาชีพ สั้นกระชับ และเป็นภาษาไทย
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { reply: "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI" },
      { status: 500 }
    );
  }
}
