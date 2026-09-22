export type ReportCategory =
  | 'infrastructure_utilities'
  | 'traffic'
  | 'water'
  | 'air'
  | 'noise'
  | 'odor'
  | 'waste'
  | 'vector'
  | 'others';

export type EnvironmentalCategory =
  | 'infrastructure_utilities'
  | 'traffic'
  | 'water'
  | 'air'
  | 'noise'
  | 'odor'
  | 'waste'
  | 'vector'
  | 'others'
  | string;

export type EnvironmentalSubcategory =
  | 'building_damage'
  | 'electrical_system'
  | 'drainage_system'
  | 'traffic_congestion'
  | 'accident'
  | 'traffic_signal_system'
  | string;

// 5 Standard Statuses:
// 1. รับเรื่องแล้ว ('reported')
// 2. กำลังตรวจสอบ ('investigating')
// 3. กำลังดำเนินการ ('in_progress')
// 4. ดำเนินการเสร็จสิ้น ('resolved')
// 5. ไม่สามารถดำเนินการได้ ('rejected')
export type ReportStatus =
  | 'reported'
  | 'investigating'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ReportUrgency = 'low' | 'medium' | 'high' | 'critical';

export type PriorityLevel = 'red' | 'yellow' | 'green';

// 3 Reporter Types:
// 1. นักศึกษา ('student')
// 2. บุคลากรมหาวิทยาลัยขอนแก่น ('kku_staff')
// 3. บุคคลทั่วไป ('general_public')
export type ReporterType = 'student' | 'kku_staff' | 'general_public';

export interface SubProblemOption {
  id: string;
  nameTh: string;
  nameEn: string;
  category: ReportCategory;
  priorityLevel: PriorityLevel;
  urgency: ReportUrgency;
  requiresCustomInput?: boolean;
  exampleTh?: string;
  exampleEn?: string;
}

export type UserRole = 'guest' | 'student' | 'staff' | 'admin';

export type Language = 'th' | 'en';

export interface LocationData {
  faculty: string;
  building: string;
  location_id?: string;
  location_name?: string;
  location_type?: string;
  roomOrDetails?: string;
  latitude: number;
  longitude: number;
}

export interface ReporterInfo {
  name?: string;
  email?: string;
  phone?: string;
  studentId?: string;
  role: UserRole;
  reporterType?: ReporterType;
  reporter_type?: ReporterType;
  isAnonymous?: boolean;
  is_anonymous?: boolean;
  privacyConsent?: boolean;
  privacy_consent?: boolean;
}

export type ActionPhotoType = 'before' | 'after' | 'other';

export interface ActionPhoto {
  photo_id: string;
  report_id: string;
  photo_url: string;
  photo_type: ActionPhotoType;
  description?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface ActionUpdate {
  update_id: string;
  report_id: string;
  action_type?: string;
  status: ReportStatus;
  previous_status?: ReportStatus;
  action_details: string;
  updated_at: string;
  updated_by: string;
  photos?: ActionPhoto[];
}

export interface TimelineEntry {
  status: ReportStatus;
  timestamp: string;
  remark: string;
  updatedBy: string;
  actionDetails?: string;
  actionPhotos?: ActionPhoto[];
}

export interface AIAnalysisResult {
  suggestedCategory?: ReportCategory;
  urgency?: ReportUrgency;
  recommendedDepartment?: string;
  initialSafetyAdvice?: string;
  initialSafetyAdviceEn?: string;
  aiSummary?: string;
  aiSummaryEn?: string;
}

export interface Ticket {
  id: string; // e.g. PHE-2026-001 (Requirement 9: report_id)
  report_id?: string;
  category: ReportCategory;
  incident_type?: ReportCategory;
  environmental_category?: string;
  environmental_subcategory?: string;
  title: string;
  description: string;
  location: LocationData;
  location_id?: string;
  location_address?: string;
  location_name?: string;
  location_type?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  repairPhotoUrl?: string;
  videoUrl?: string;
  isAnonymous: boolean;
  is_anonymous?: boolean;
  reporterType?: ReporterType;
  reporter_type?: ReporterType;
  privacyConsent?: boolean;
  privacy_consent?: boolean;
  reporter: ReporterInfo;
  reporter_name?: string;
  reporter_phone?: string;
  status: ReportStatus;
  urgency?: ReportUrgency;
  department: string;
  assignedStaff?: string;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  timeline: TimelineEntry[];
  aiAnalysis?: AIAnalysisResult;
  actionPhotos?: ActionPhoto[];
  actionUpdates?: ActionUpdate[];
  line_notification_status?: 'pending' | 'sent' | 'failed';
  line_notification_sent_at?: string;
  line_notification_error?: string;
  line_retry_count?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  studentId?: string;
  faculty: string;
  avatarUrl?: string;
  phone?: string;
}

export interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status_changed' | 'new_ticket' | 'assigned';
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}

export interface DepartmentInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  responsibleCategory: ReportCategory;
  phone: string;
  email: string;
}

export interface BuildingInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  faculty: string;
  latitude: number;
  longitude: number;
}

