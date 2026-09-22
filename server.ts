import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  sendLineStaffNotification,
  verifyLineSignature,
  getLineConfigDiagnostics,
  ReportNotificationPayload,
  LineSendResult,
} from './server/lineService';
import {
  saveTicketToStorage,
  loadAllTickets,
  getTicketById,
  updateTicketNotificationStatus,
  ServerTicket,
} from './server/storage';

const CATEGORY_NAMES_TH: Record<string, string> = {
  infrastructure_utilities: 'ระบบสาธารณูปโภค',
  traffic: 'การจราจร',
  water: 'คุณภาพน้ำ',
  air: 'มลพิษทางอากาศและฝุ่นควัน',
  noise: 'มลพิษทางเสียง',
  odor: 'กลิ่นไม่พึงประสงค์ / สารเคมี',
  waste: 'การจัดการขยะมูลฝอย',
  vector: 'สัตว์พาหะและสัตว์มีพิษ',
  others: 'ปัญหาด้านสิ่งแวดล้อมอื่นๆ',
};

const SUBCATEGORY_NAMES_TH: Record<string, string> = {
  building_damage: 'อาคารชำรุดเสียหาย',
  electrical_system: 'ระบบไฟฟ้า',
  drainage_system: 'การระบายน้ำ',
  traffic_congestion: 'รถติด',
  accident: 'อุบัติเหตุ',
  traffic_signal_system: 'ระบบสัญญาณไฟ',
};

const STATUS_NAMES_TH: Record<string, string> = {
  reported: 'รับเรื่องใหม่',
  investigating: 'กำลังตรวจสอบ',
  in_progress: 'กำลังดำเนินการ',
  resolved: 'ดำเนินการเสร็จสิ้น',
  rejected: 'ไม่สามารถดำเนินการได้',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Preserve rawBody for LINE Webhook signature verification
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf-8');
      },
    })
  );

  // Initialize Gemini AI client safely on server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
  });

  // Server-side AI Incident Analysis Endpoint
  app.post('/api/ai/analyze-incident', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is missing. AI analysis unavailable.',
        });
      }

      if (!ai) {
        ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      }

      const { title, description, category, photoBase64 } = req.body;

      const promptParts: any[] = [];

      if (photoBase64 && typeof photoBase64 === 'string') {
        const matches = photoBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          promptParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      promptParts.push({
        text: `You are an expert Environmental Health & Safety (EHS) officer for a university in Thailand.
Analyze this reported environmental incident:
Title: ${title || 'N/A'}
User-selected Category: ${category || 'N/A'}
Description: ${description || 'N/A'}

Provide a helpful, professional assessment response in JSON format matching this schema:
{
  "suggestedCategory": "infrastructure_utilities | traffic | water | air | noise | odor | waste | vector | others",
  "urgency": "low | medium | high | critical",
  "recommendedDepartment": "string in Thai and English (e.g. 'Physical Plant & Sanitation / สำนักกายภาพและสิ่งแวดล้อม')",
  "initialSafetyAdvice": "Immediate action advice for student/staff safety (in Thai)",
  "initialSafetyAdviceEn": "Immediate action advice in English",
  "aiSummary": "1-2 sentence refined summary in Thai",
  "aiSummaryEn": "1-2 sentence refined summary in English"
}`
      });

      // Resilient model calling with fallback chain
      const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let parsedData: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: promptParts },
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text?.trim() || '{}';
          const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
          parsedData = JSON.parse(cleanedText);
          if (parsedData && (parsedData.initialSafetyAdvice || parsedData.suggestedCategory)) {
            break; // Successfully generated and parsed
          }
        } catch (callErr: any) {
          console.warn(`[Gemini API] Model ${modelName} encountered error, trying fallback if available:`, callErr?.message || callErr);
          lastError = callErr;
        }
      }

      // If all live API attempts fail due to temporary 503 high demand or connectivity, provide intelligent contextual EHS evaluation
      if (!parsedData) {
        console.warn('[Gemini API] Utilizing domain-expert fallback due to upstream unavailability:', lastError?.message);

        const textContent = `${title || ''} ${description || ''}`.toLowerCase();
        let fallbackCategory = category || 'others';
        let fallbackUrgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        let fallbackDept = 'กองกายภาพและสิ่งแวดล้อม มหาวิทยาลัย (Physical Plant & Environment)';
        let safetyAdviceTh = 'หลีกเลี่ยงการสัมผัสหรือเข้าใกล้พื้นที่เกิดเหตุ รักษาระยะห่างเพื่อความปลอดภัย';
        let safetyAdviceEn = 'Avoid direct contact with the affected area and maintain a safe distance.';

        if (textContent.includes('งู') || textContent.includes('snake') || textContent.includes('ต่อ') || textContent.includes('แตน') || textContent.includes('ผึ้ง') || textContent.includes('สารเคมี') || textContent.includes('toxic') || textContent.includes('chemical')) {
          fallbackCategory = textContent.includes('สารเคมี') || textContent.includes('chemical') ? 'air' : 'vector';
          fallbackUrgency = 'critical';
          fallbackDept = 'ศูนย์ความปลอดภัยและป้องกันอัคคีภัย / หน่วยกู้ชีพฉุกเฉิน มหาวิทยาลัย';
          safetyAdviceTh = 'กั้นพื้นที่เกิดเหตุทันที ห้ามเข้าใกล้หรือรบกวนสัตว์มีพิษ/สารเคมีโดยเด็ดขาด และรอเจ้าหน้าที่ผู้เชี่ยวชาญเข้าปฏิบัติการ';
          safetyAdviceEn = 'Cordon off the area immediately. Do not approach hazardous creatures or chemicals. Await specialist responders.';
        } else if (category === 'infrastructure_utilities' || textContent.includes('ไฟดับ') || textContent.includes('ไฟฟ้า') || textContent.includes('อาคารชำรุด') || textContent.includes('ท่อแตก')) {
          fallbackCategory = 'infrastructure_utilities';
          fallbackDept = 'งานระบบสาธารณูปโภคและซ่อมบำรุงอาคาร คณะและมหาวิทยาลัย';
          safetyAdviceTh = 'ระวังอันตรายจากกระแสไฟฟ้ารั่วหรือเศษวัสดุตกหล่น หลีกเลี่ยงการใช้อุปกรณ์ที่ชำรุด';
          safetyAdviceEn = 'Beware of electrical hazards or falling debris. Do not touch damaged equipment.';
        } else if (category === 'traffic' || textContent.includes('รถติด') || textContent.includes('อุบัติเหตุ') || textContent.includes('สัญญาณไฟ')) {
          fallbackCategory = 'traffic';
          fallbackUrgency = textContent.includes('อุบัติเหตุ') ? 'critical' : 'medium';
          fallbackDept = 'หน่วยรักษาความปลอดภัยและจราจร มหาวิทยาลัยขอนแก่น';
          safetyAdviceTh = 'ชะลอความเร็ว ปฏิบัติตามสัญญาณเตือน และอำนวยความสะดวกให้ยานพาหนะฉุกเฉิน';
          safetyAdviceEn = 'Reduce speed, heed warning signs, and yield to emergency response vehicles.';
        } else if (category === 'water' || textContent.includes('น้ำ')) {
          fallbackCategory = 'water';
          fallbackDept = 'กองกายภาพและสิ่งแวดล้อม (งานระบบระบายน้ำและสุขาภิบาล)';
          safetyAdviceTh = 'ระมัดระวังพื้นลื่น และหลีกเลี่ยงการสัมผัสน้ำขังหรือน้ำเสียโดยตรง';
          safetyAdviceEn = 'Caution: Slippery surfaces. Avoid direct contact with stagnant or wastewater.';
        } else if (category === 'air' || textContent.includes('ฝุ่น') || textContent.includes('ควัน')) {
          fallbackCategory = 'air';
          fallbackDept = 'หน่วยอนามัยสิ่งแวดล้อมและอาชีวอนามัย มหาวิทยาลัย';
          safetyAdviceTh = 'สวมหน้ากากอนามัยป้องกันฝุ่นละออง/ควัน และหลีกเลี่ยงกิจกรรมกลางแจ้งในบริเวณดังกล่าว';
          safetyAdviceEn = 'Wear protective masks and avoid outdoor strenuous activities in the affected zone.';
        } else if (category === 'waste' || textContent.includes('ขยะ')) {
          fallbackCategory = 'waste';
          fallbackDept = 'งานจัดการขยะมูลฝอยและสิ่งแวดล้อม มหาวิทยาลัย';
          safetyAdviceTh = 'ทิ้งขยะในจุดที่จัดเตรียมไว้ หลีกเลี่ยงการสัมผัสขยะมีพิษหรือของมีคม';
          safetyAdviceEn = 'Dispose of waste in designated receptacles and avoid contact with sharp or hazardous items.';
        }

        parsedData = {
          suggestedCategory: fallbackCategory,
          urgency: fallbackUrgency,
          recommendedDepartment: fallbackDept,
          initialSafetyAdvice: safetyAdviceTh,
          initialSafetyAdviceEn: safetyAdviceEn,
          aiSummary: `รายงานได้รับการประเมินความปลอดภัยและส่งต่อให้ ${fallbackDept} ตรวจสอบ`,
          aiSummaryEn: `Report preliminarily screened and routed to ${fallbackDept} for operational response.`,
          isFallback: true,
        };
      }

      res.json({ success: true, analysis: parsedData });
    } catch (err: any) {
      console.error('Error analyzing incident:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze incident with AI' });
    }
  });

  // ==========================================
  // PH Eco Alert: Reports & LINE OA Endpoints
  // ==========================================

  // Diagnostic status of LINE OA integration (non-sensitive)
  app.get('/api/line/config-status', (req, res) => {
    res.json(getLineConfigDiagnostics());
  });

  // Retrieve all stored incident reports
  app.get('/api/reports', (req, res) => {
    const tickets = loadAllTickets();
    res.json({ success: true, count: tickets.length, reports: tickets });
  });

  // Retrieve single report by ID
  app.get('/api/reports/:id', (req, res) => {
    const ticket = getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, report: ticket });
  });

  // Create new incident report and dispatch LINE OA notification
  app.post('/api/reports', async (req, res) => {
    try {
      const reportData = req.body;
      if (!reportData) {
        return res.status(400).json({ error: 'Report data is required.' });
      }

      const reportId =
        reportData.id ||
        reportData.report_id ||
        `PEA-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const nowIso = new Date().toISOString();
      const isAnonymous = Boolean(reportData.isAnonymous ?? reportData.is_anonymous);

      const ticketToSave: ServerTicket = {
        ...reportData,
        id: reportId,
        report_id: reportId,
        status: reportData.status || 'reported',
        isAnonymous,
        is_anonymous: isAnonymous,
        createdAt: reportData.createdAt || nowIso,
        created_at: reportData.created_at || nowIso,
        updatedAt: reportData.updatedAt || nowIso,
        updated_at: reportData.updated_at || nowIso,
        line_notification_status: 'pending',
        line_retry_count: 0,
      };

      // 1. Save report to server-side database first
      const savedTicket = saveTicketToStorage(ticketToSave);
      console.log(`[Reports API] Successfully saved report ${reportId} to storage.`);

      // 2. Prepare payload for LINE OA Staff Notification
      const categoryKey = savedTicket.category || savedTicket.environmental_category || 'others';
      const subcategoryKey = savedTicket.environmental_subcategory || '';

      const categoryTh = CATEGORY_NAMES_TH[categoryKey] || categoryKey;
      const subcategoryTh =
        SUBCATEGORY_NAMES_TH[subcategoryKey] ||
        savedTicket.title ||
        subcategoryKey ||
        'ทั่วไป';

      const locationName =
        savedTicket.location?.building ||
        savedTicket.location?.location_name ||
        savedTicket.location_name ||
        savedTicket.location_address ||
        'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น';

      const roomOrDetails = savedTicket.location?.roomOrDetails || '';
      const statusTh = STATUS_NAMES_TH[savedTicket.status] || 'รับเรื่องใหม่';

      const linePayload: ReportNotificationPayload = {
        reportId,
        createdAt: savedTicket.createdAt,
        categoryTh,
        subcategoryTh,
        locationName,
        roomOrDetails,
        description: savedTicket.description,
        statusTh,
        isAnonymous,
      };

      // 3. Trigger LINE OA Messaging API push notification (with automated retries)
      let lineResult: LineSendResult = {
        success: false,
        status: 'failed',
        error: '',
        attempts: 0,
      };

      try {
        lineResult = await sendLineStaffNotification(linePayload);
        updateTicketNotificationStatus(
          reportId,
          lineResult.status,
          lineResult.sentAt,
          lineResult.error,
          true
        );
      } catch (lineErr: any) {
        console.error(`[Reports API] Unexpected error sending LINE notification for ${reportId}:`, lineErr);
        updateTicketNotificationStatus(
          reportId,
          'failed',
          undefined,
          lineErr?.message || 'Unexpected LINE notification failure',
          true
        );
        lineResult = {
          success: false,
          status: 'failed',
          error: lineErr?.message || 'Failed to dispatch LINE notification',
          attempts: 1,
        };
      }

      // 4. Return HTTP 201 Created. NOTE: Even if LINE notification failed, report creation is SUCCESSFUL!
      const finalTicket = getTicketById(reportId) || savedTicket;
      return res.status(201).json({
        success: true,
        report: finalTicket,
        lineNotification: lineResult,
        message: lineResult.success
          ? 'บันทึกการแจ้งเหตุและส่งการแจ้งเตือนไปยัง LINE OA เจ้าหน้าที่เรียบร้อยแล้ว'
          : 'บันทึกการแจ้งเหตุสำเร็จ (การแจ้งเตือน LINE OA บันทึกสถานะเพื่อติดตามหรือส่งซ้ำ)',
      });
    } catch (err: any) {
      console.error('[Reports API] Failed to create report:', err);
      return res.status(500).json({ error: err.message || 'Internal server error saving report' });
    }
  });

  // Retry sending LINE OA notification for a specific report
  app.post('/api/reports/:id/retry-line', async (req, res) => {
    try {
      const reportId = req.params.id;
      const ticket = getTicketById(reportId);
      if (!ticket) {
        return res.status(404).json({ error: `Report ${reportId} not found.` });
      }

      const categoryKey = ticket.category || ticket.environmental_category || 'others';
      const subcategoryKey = ticket.environmental_subcategory || '';

      const categoryTh = CATEGORY_NAMES_TH[categoryKey] || categoryKey;
      const subcategoryTh =
        SUBCATEGORY_NAMES_TH[subcategoryKey] ||
        ticket.title ||
        subcategoryKey ||
        'ทั่วไป';

      const locationName =
        ticket.location?.building ||
        ticket.location?.location_name ||
        ticket.location_name ||
        ticket.location_address ||
        'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น';

      const roomOrDetails = ticket.location?.roomOrDetails || '';
      const statusTh = STATUS_NAMES_TH[ticket.status] || 'รับเรื่องใหม่';
      const isAnonymous = Boolean(ticket.isAnonymous ?? ticket.is_anonymous);

      const linePayload: ReportNotificationPayload = {
        reportId: ticket.id,
        createdAt: ticket.createdAt,
        categoryTh,
        subcategoryTh,
        locationName,
        roomOrDetails,
        description: ticket.description,
        statusTh,
        isAnonymous,
      };

      const lineResult = await sendLineStaffNotification(linePayload);
      const updated = updateTicketNotificationStatus(
        ticket.id,
        lineResult.status,
        lineResult.sentAt,
        lineResult.error,
        true
      );

      return res.json({
        success: lineResult.success,
        lineNotification: lineResult,
        report: updated,
      });
    } catch (err: any) {
      console.error('[Reports API] Retry LINE notification error:', err);
      return res.status(500).json({ error: err.message || 'Failed to retry LINE notification' });
    }
  });

  // LINE Official Account Webhook Endpoint
  app.post('/api/line/webhook', async (req: any, res) => {
    try {
      const signature = req.headers['x-line-signature'] as string;
      const channelSecret = process.env.LINE_CHANNEL_SECRET;

      // Signature verification as mandated by Requirement 2.5
      if (channelSecret) {
        const isValid = verifyLineSignature(req.rawBody || '', signature || '', channelSecret);
        if (!isValid) {
          console.warn('[LINE Webhook] Rejected unauthorized request: invalid x-line-signature');
          return res.status(401).json({ error: 'Invalid LINE Webhook signature' });
        }
      } else {
        console.warn('[LINE Webhook] Received webhook call, but LINE_CHANNEL_SECRET is not set in environment.');
      }

      const events = req.body?.events || [];
      console.log(`[LINE Webhook] Received ${events.length} event(s) from LINE.`);

      for (const event of events) {
        // Event: Bot joined a group / room (e.g. staff group)
        if (event.type === 'join' || event.type === 'memberJoined') {
          const groupId = event.source?.groupId;
          console.log(`[LINE Webhook] Bot joined staff group! Group ID: ${groupId}`);

          if (event.replyToken && process.env.LINE_CHANNEL_ACCESS_TOKEN && groupId) {
            try {
              await fetch('https://api.line.me/v2/bot/message/reply', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                },
                body: JSON.stringify({
                  replyToken: event.replyToken,
                  messages: [
                    {
                      type: 'text',
                      text: `🌿 PH Eco Alert Bot\nเชื่อมต่อกับกลุ่มเจ้าหน้าที่สำเร็จแล้ว!\n\nGroup ID ของกลุ่มนี้:\n${groupId}\n\nคัดลอกค่านี้ไปใส่ใน LINE_STAFF_GROUP_ID ใน Environment Variables ของระบบ ระบบจะส่งการแจ้งเตือนเหตุสิ่งแวดล้อมใหม่มาที่กลุ่มนี้โดยอัตโนมัติ`,
                    },
                  ],
                }),
              });
            } catch (replyErr) {
              console.error('[LINE Webhook] Reply error:', replyErr);
            }
          }
        }

        // Event: Message in group asking for info
        if (event.type === 'message' && event.message?.type === 'text') {
          const text = (event.message.text || '').trim().toLowerCase();
          if (text === '!groupid' || text === '/groupid' || text === 'groupid' || text === '!status') {
            const groupId = event.source?.groupId;
            if (event.replyToken && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
              try {
                await fetch('https://api.line.me/v2/bot/message/reply', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                  },
                  body: JSON.stringify({
                    replyToken: event.replyToken,
                    messages: [
                      {
                        type: 'text',
                        text: groupId
                          ? `📌 PH Eco Alert Group Info:\nGroup ID: ${groupId}\nSource Type: ${event.source?.type}`
                          : `📌 User ID: ${event.source?.userId}\n(This chat is a 1-on-1 direct message)`,
                      },
                    ],
                  }),
                });
              } catch (err) {
                console.error('[LINE Webhook] Reply error:', err);
              }
            }
          }
        }
      }

      // Always respond with 200 OK as required by LINE Messaging API
      return res.status(200).json({ success: true, processedEvents: events.length });
    } catch (err: any) {
      console.error('[LINE Webhook] Internal handler error:', err);
      return res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PH Eco Alert] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
