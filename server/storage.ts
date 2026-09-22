import fs from 'fs';
import path from 'path';

export interface ServerTicket {
  id: string;
  report_id?: string;
  category: string;
  incident_type?: string;
  environmental_category?: string;
  environmental_subcategory?: string;
  title: string;
  description: string;
  location: {
    faculty?: string;
    building?: string;
    location_name?: string;
    location_type?: string;
    roomOrDetails?: string;
    latitude: number;
    longitude: number;
  };
  location_address?: string;
  location_name?: string;
  location_type?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  isAnonymous?: boolean;
  is_anonymous?: boolean;
  reporterType?: string;
  reporter_type?: string;
  privacyConsent?: boolean;
  privacy_consent?: boolean;
  reporter?: {
    name?: string;
    phone?: string;
    role?: string;
  };
  reporter_name?: string;
  reporter_phone?: string;
  status: string;
  department?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  timeline?: any[];
  line_notification_status?: 'pending' | 'sent' | 'failed';
  line_notification_sent_at?: string;
  line_notification_error?: string;
  line_retry_count?: number;
  [key: string]: any;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'reports.json');

// In-memory cache for fast lookups
let inMemoryTickets: ServerTicket[] = [];
let isInitialized = false;

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TICKETS_FILE)) {
      fs.writeFileSync(TICKETS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[Storage] Error ensuring data directory/file:', err);
  }
}

export function loadAllTickets(): ServerTicket[] {
  if (isInitialized && inMemoryTickets.length > 0) {
    return inMemoryTickets;
  }

  ensureDataFile();
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const content = fs.readFileSync(TICKETS_FILE, 'utf-8');
      inMemoryTickets = JSON.parse(content || '[]');
      isInitialized = true;
      return inMemoryTickets;
    }
  } catch (err) {
    console.error('[Storage] Failed to read tickets from file:', err);
  }
  isInitialized = true;
  return inMemoryTickets;
}

export function saveTicketToStorage(ticket: ServerTicket): ServerTicket {
  loadAllTickets();

  const existingIdx = inMemoryTickets.findIndex((t) => t.id === ticket.id);
  if (existingIdx >= 0) {
    inMemoryTickets[existingIdx] = { ...inMemoryTickets[existingIdx], ...ticket };
  } else {
    inMemoryTickets.unshift(ticket);
  }

  // Persist to disk
  try {
    ensureDataFile();
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(inMemoryTickets, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Failed to write tickets to file:', err);
  }

  return ticket;
}

export function getTicketById(id: string): ServerTicket | null {
  loadAllTickets();
  return inMemoryTickets.find((t) => t.id === id || t.report_id === id) || null;
}

export function updateTicketNotificationStatus(
  id: string,
  status: 'sent' | 'failed' | 'pending',
  sentAt?: string,
  error?: string,
  retryCountInc: boolean = true
): ServerTicket | null {
  loadAllTickets();
  const ticket = inMemoryTickets.find((t) => t.id === id || t.report_id === id);
  if (!ticket) return null;

  ticket.line_notification_status = status;
  if (sentAt) ticket.line_notification_sent_at = sentAt;
  if (error !== undefined) ticket.line_notification_error = error;
  if (retryCountInc) {
    ticket.line_retry_count = (ticket.line_retry_count || 0) + 1;
  }

  saveTicketToStorage(ticket);
  return ticket;
}
