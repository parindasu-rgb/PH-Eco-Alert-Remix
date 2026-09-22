import crypto from 'crypto';

export interface LineSendResult {
  success: boolean;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt?: string;
  attempts: number;
}

export interface ReportNotificationPayload {
  reportId: string;
  createdAt: string;
  categoryTh: string;
  categoryEn?: string;
  subcategoryTh: string;
  subcategoryEn?: string;
  locationName: string;
  roomOrDetails?: string;
  description: string;
  statusTh: string;
  isAnonymous: boolean;
  staffPortalUrl?: string;
}

/**
 * Format Thailand Buddhist/Gregorian Date & Time (DD/MM/YYYY HH:mm)
 */
function formatReportDateTime(isoString?: string): string {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    if (isNaN(d.getTime())) {
      return new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return isoString || 'N/A';
  }
}

/**
 * Build the LINE Message content formatted strictly according to PH Eco Alert specification
 */
export function buildLineNotificationMessage(payload: ReportNotificationPayload): string {
  const dateTimeStr = formatReportDateTime(payload.createdAt);
  const locationDisplay = payload.roomOrDetails
    ? `${payload.locationName} (${payload.roomOrDetails})`
    : payload.locationName || 'ไม่ระบุตำแหน่ง';

  const portalUrl =
    payload.staffPortalUrl ||
    process.env.STAFF_PORTAL_URL ||
    (process.env.PUBLIC_APP_URL ? `${process.env.PUBLIC_APP_URL.replace(/\/$/, '')}/#staff` : '') ||
    (process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/#staff` : '');

  const anonymousNote = payload.isAnonymous ? '\n🔒 การแจ้งเหตุแบบไม่ระบุตัวตน (Anonymous Report)\n' : '';

  const lines = [
    '🚨 PH Eco Alert',
    'มีการแจ้งเหตุสิ่งแวดล้อมใหม่',
    '',
    'เลขที่แจ้งเหตุ:',
    payload.reportId,
    '',
    'หมวดหมู่:',
    payload.categoryTh || 'ทั่วไป',
    '',
    'ประเภทย่อย:',
    payload.subcategoryTh || 'ทั่วไป',
    '',
    'วันที่และเวลา:',
    dateTimeStr,
    '',
    'จุดเกิดเหตุ:',
    locationDisplay,
    '',
    'รายละเอียด:',
    payload.description || 'ไม่มีรายละเอียดเพิ่มเติม',
    '',
    'สถานะ:',
    payload.statusTh || 'รับเรื่องใหม่',
  ];

  if (anonymousNote) {
    lines.push(anonymousNote.trim());
  }

  lines.push('');
  lines.push('กรุณาเข้าสู่ Staff Portal เพื่อดูรายละเอียดและดำเนินการ');
  if (portalUrl) {
    lines.push(portalUrl);
  }

  return lines.join('\n');
}

/**
 * Validates LINE Webhook HMAC-SHA256 signature against raw request body
 */
export function verifyLineSignature(rawBody: string, signature: string, channelSecret: string): boolean {
  if (!signature || !channelSecret || !rawBody) {
    return false;
  }
  try {
    const hash = crypto
      .createHmac('sha256', channelSecret)
      .update(rawBody)
      .digest('base64');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch (err) {
    console.error('[LINE Webhook] Signature verification failed with exception:', err);
    return false;
  }
}

/**
 * Sends push notification via LINE Messaging API with automated exponential retry (max 3 attempts)
 */
export async function sendLineStaffNotification(
  payload: ReportNotificationPayload,
  customTargetId?: string
): Promise<LineSendResult> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const staffTargetId = customTargetId || process.env.LINE_STAFF_GROUP_ID;

  // 1. Check Configuration
  if (!channelAccessToken) {
    const errMsg = 'LINE_CHANNEL_ACCESS_TOKEN is not configured in server environment.';
    console.warn(`[LINE OA Notification] Skipped: ${errMsg}`);
    return {
      success: false,
      status: 'failed',
      error: errMsg,
      attempts: 0,
    };
  }

  if (!staffTargetId) {
    const errMsg = 'LINE_STAFF_GROUP_ID is not configured. Please set the staff Group ID or User ID.';
    console.warn(`[LINE OA Notification] Skipped: ${errMsg}`);
    return {
      success: false,
      status: 'failed',
      error: errMsg,
      attempts: 0,
    };
  }

  const messageText = buildLineNotificationMessage(payload);

  const requestBody = {
    to: staffTargetId,
    messages: [
      {
        type: 'text',
        text: messageText,
      },
    ],
  };

  const maxAttempts = 3;
  let lastError = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[LINE OA Notification] Attempt ${attempt}/${maxAttempts} for report ${payload.reportId} to target ${staffTargetId.slice(0, 8)}...`);

      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const sentAt = new Date().toISOString();
        console.log(`[LINE OA Notification] Successfully sent notification for report ${payload.reportId} (attempt ${attempt})`);
        return {
          success: true,
          status: 'sent',
          sentAt,
          attempts: attempt,
        };
      }

      const responseText = await response.text();
      let errorDetail = responseText;
      try {
        const parsed = JSON.parse(responseText);
        errorDetail = parsed.message || parsed.details?.[0]?.message || responseText;
      } catch {
        // use raw text
      }

      lastError = `LINE API HTTP ${response.status}: ${errorDetail}`;
      console.warn(`[LINE OA Notification] Attempt ${attempt} failed: ${lastError}`);

      // If client-side configuration error (e.g. 401 invalid token, 400 invalid target format), don't spam retry
      if (response.status === 401 || response.status === 403) {
        break;
      }

      // Backoff before retry
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    } catch (networkErr: any) {
      lastError = networkErr?.message || 'Network timeout / connection error';
      console.warn(`[LINE OA Notification] Attempt ${attempt} network error: ${lastError}`);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  return {
    success: false,
    status: 'failed',
    error: lastError || 'Failed to send LINE notification after retries',
    attempts: maxAttempts,
  };
}

/**
 * Returns diagnostic configuration info for Staff Portal without revealing credentials
 */
export function getLineConfigDiagnostics() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const secret = process.env.LINE_CHANNEL_SECRET;
  const groupId = process.env.LINE_STAFF_GROUP_ID;

  return {
    hasChannelAccessToken: Boolean(token && token.trim().length > 10),
    hasChannelSecret: Boolean(secret && secret.trim().length > 10),
    hasStaffGroupId: Boolean(groupId && groupId.trim().length > 5),
    staffGroupIdMasked: groupId ? `${groupId.slice(0, 4)}...${groupId.slice(-4)}` : null,
    isFullyConfigured: Boolean(
      token &&
      token.trim().length > 10 &&
      groupId &&
      groupId.trim().length > 5
    ),
    channelType: 'LINE Messaging API (Official Account)',
  };
}
