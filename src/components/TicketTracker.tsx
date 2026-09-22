import React, { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building,
  User,
  Shield,
  FileText,
  Upload,
  ArrowRight,
  Filter,
  EyeOff,
  Phone,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { Language, ReportStatus, Ticket, UserRole } from '../types';
import { getTranslation } from '../i18n';

interface TicketTrackerProps {
  tickets: Ticket[];
  initialSearchId?: string;
  lang: Language;
  currentRole: UserRole;
  onUpdateTicket: (updatedTicket: Ticket) => void;
}

export const TicketTracker: React.FC<TicketTrackerProps> = ({
  tickets,
  initialSearchId = '',
  lang,
  currentRole,
  onUpdateTicket,
}) => {
  const t = getTranslation(lang);

  const [searchQuery, setSearchQuery] = useState<string>(initialSearchId);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialSearchId || (tickets.length > 0 ? tickets[0].id : '')
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Staff Update Modal State
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('in_progress');
  const [staffRemark, setStaffRemark] = useState<string>('');
  const [repairPhoto, setRepairPhoto] = useState<string | undefined>(undefined);

  const isStaffOrAdmin = currentRole === 'staff' || currentRole === 'admin';

  const filteredTickets = tickets.filter((tk) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tk.id.toLowerCase().includes(q) ||
      (tk.report_id && tk.report_id.toLowerCase().includes(q)) ||
      tk.title.toLowerCase().includes(q) ||
      tk.category.toLowerCase().includes(q) ||
      (tk.location.faculty && tk.location.faculty.toLowerCase().includes(q)) ||
      (tk.location.building && tk.location.building.toLowerCase().includes(q));

    const matchesStatus = filterStatus === 'all' || tk.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeTicket = tickets.find((tk) => tk.id === selectedTicketId) || filteredTickets[0];

  const handleOpenStaffModal = (tk: Ticket) => {
    setEditingTicket(tk);
    setNewStatus(tk.status);
    setStaffRemark('');
    setRepairPhoto(tk.repairPhotoUrl);
  };

  const handleSaveStaffUpdate = () => {
    if (!editingTicket) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const defaultRemarkMap: Record<ReportStatus, string> = {
      reported: 'รับเรื่องเข้าสู่ระบบเรียบร้อยแล้ว',
      investigating: 'เจ้าหน้าที่กำลังลงพื้นที่ตรวจสอบจุดเกิดเหตุ',
      in_progress: 'กำลังดำเนินการแก้ไขปรับปรุงด้านสิ่งแวดล้อม',
      resolved: 'แก้ไขและตรวจสอบมาตรฐานสิ่งแวดล้อมเสร็จสิ้นเรียบร้อย',
      rejected: 'ไม่สามารถดำเนินการได้เนื่องจากอยู่นอกพื้นที่รับผิดชอบหรือข้อมูลไม่ครบถ้วน',
    };

    const updatedTimeline = [
      ...editingTicket.timeline,
      {
        status: newStatus,
        timestamp: nowStr,
        remark: staffRemark.trim() || defaultRemarkMap[newStatus],
        updatedBy: currentRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่สิ่งแวดล้อม คณะสาธารณสุขศาสตร์',
      },
    ];

    const updatedTicket: Ticket = {
      ...editingTicket,
      status: newStatus,
      updatedAt: nowStr,
      updated_at: nowStr,
      repairPhotoUrl: repairPhoto || editingTicket.repairPhotoUrl,
      timeline: updatedTimeline,
    };

    onUpdateTicket(updatedTicket);
    setEditingTicket(null);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'reported':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'th' ? 'รับเรื่องแล้ว' : 'Reported'}</span>
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-800 bg-purple-100 rounded-full border border-purple-300">
            <Search className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>{lang === 'th' ? 'กำลังตรวจสอบ' : 'Investigating'}</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>{lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress'}</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved'}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-100 rounded-full border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{lang === 'th' ? 'ไม่สามารถดำเนินการได้' : 'Cannot Proceed'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-4">
      {/* Search Header */}
      <div className="p-6 bg-white rounded-3xl shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-[11px] font-bold text-[#16A085] uppercase tracking-wider block">
              PH Eco Alert Tracking System
            </span>
            <h2 className="text-xl font-black text-slate-900">
              {lang === 'th' ? 'ติดตามสถานะการแจ้งเหตุการณ์สิ่งแวดล้อม' : 'Track Environmental Incidents'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'ค้นหาด้วยหมายเลขรายงานได้ทันทีโดยไม่ต้องเข้าสู่ระบบ พร้อมแสดงความโปร่งใสในทุกขั้นตอน'
                : 'Search with report number instantly without logging in. Full tracking transparency.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isStaffOrAdmin ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
                🛡️ Staff Portal Access
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100">
                🌐 Public View
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'th' ? 'ค้นหาหมายเลขรายงาน' : 'Search report number'}
              className="w-full pl-11 pr-4 py-3 text-xs md:text-sm rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
            {[
              { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
              { id: 'reported', labelTh: 'รับเรื่องแล้ว', labelEn: 'Reported' },
              { id: 'investigating', labelTh: 'กำลังตรวจสอบ', labelEn: 'Investigating' },
              { id: 'in_progress', labelTh: 'กำลังดำเนินการ', labelEn: 'In Progress' },
              { id: 'resolved', labelTh: 'เสร็จสิ้น', labelEn: 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-white text-[#16A085] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? st.labelTh : st.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Ticket List + Selected Ticket Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List Column */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {lang === 'th'
              ? `รายการรายงาน (${filteredTickets.length})`
              : `Reports (${filteredTickets.length})`}
          </h3>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {lang === 'th' ? 'ไม่พบรายงานที่ค้นหา' : 'No reports found'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'th'
                  ? 'กรุณาตรวจสอบหมายเลขรายงาน หรือเลือกดูสถานะทั้งหมด'
                  : 'Check the report number or select All'}
              </p>
            </div>
          ) : (
            filteredTickets.map((tk) => (
              <button
                key={tk.id}
                onClick={() => setSelectedTicketId(tk.id)}
                className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                  activeTicket?.id === tk.id
                    ? 'bg-emerald-50/80 border-[#16A085] ring-2 ring-[#16A085]/30 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-extrabold text-[#16A085] tracking-wide">
                    {tk.id}
                  </span>
                  <div>{getStatusBadge(tk.status)}</div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{tk.title}</h4>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span className="truncate max-w-[180px]">
                    📍 {tk.location.building || tk.location.faculty}
                  </span>
                  <span>{tk.createdAt.substring(0, 10)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Detail Column */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="p-6 md:p-8 bg-white rounded-3xl shadow-md border border-slate-200 space-y-6">
              {/* Ticket Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-extrabold text-[#16A085] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      {activeTicket.id}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {activeTicket.category}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900">
                    {activeTicket.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(activeTicket.status)}

                  {isStaffOrAdmin && (
                    <button
                      onClick={() => handleOpenStaffModal(activeTicket)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {lang === 'th' ? 'อัปเดตสถานะ (เจ้าหน้าที่)' : 'Update Status'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {lang === 'th' ? 'รายละเอียดเหตุการณ์' : 'Incident Details'}
                </h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 leading-relaxed">
                  {activeTicket.description}
                </p>
              </div>

              {/* Location Info */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-4 h-4 text-[#16A085] shrink-0" />
                  <span>
                    <strong>{lang === 'th' ? 'คณะ / หน่วยงาน' : 'Faculty / Area'}:</strong>{' '}
                    {activeTicket.location.faculty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#16A085] shrink-0" />
                  <span>
                    <strong>{lang === 'th' ? 'อาคาร / สถานที่' : 'Building / Spot'}:</strong>{' '}
                    {activeTicket.location.building}{' '}
                    {activeTicket.location.roomOrDetails ? `(${activeTicket.location.roomOrDetails})` : ''}
                  </span>
                </div>
                {activeTicket.location.latitude && activeTicket.location.longitude && (
                  <div className="text-[11px] text-slate-500 font-mono pl-6">
                    GPS: {activeTicket.location.latitude.toFixed(6)},{' '}
                    {activeTicket.location.longitude.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Reporter Privacy Safeguard (Requirement 3.2) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{lang === 'th' ? 'ข้อมูลผู้แจ้งเหตุ' : 'Reporter Information'}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {lang === 'th' ? 'คุ้มครองสิทธิ์ความเป็นส่วนตัว' : 'Privacy Protected'}
                  </span>
                </div>

                {/* Privacy logic:
                    - If isAnonymous is true: show Anonymous always.
                    - If viewer is NOT staff/admin: never display personal name/phone.
                    - Only authorized staff sees name/phone when not anonymous. */}
                {activeTicket.isAnonymous || activeTicket.is_anonymous ? (
                  <div className="flex items-center gap-2 text-slate-700 pt-1">
                    <EyeOff className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">
                      {lang === 'th'
                        ? 'ผู้แจ้งไม่ประสงค์ออกนาม (Anonymous)'
                        : 'Reported Anonymously'}
                    </span>
                  </div>
                ) : isStaffOrAdmin ? (
                  <div className="pt-1 space-y-1">
                    <p className="text-slate-800 font-medium">
                      {lang === 'th' ? 'ชื่อผู้แจ้ง:' : 'Name:'}{' '}
                      <strong className="text-slate-900">
                        {activeTicket.reporter_name || activeTicket.reporter.name}
                      </strong>
                    </p>
                    {(activeTicket.reporter_phone || activeTicket.reporter.phone) && (
                      <p className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {lang === 'th' ? 'เบอร์โทรศัพท์:' : 'Phone:'}{' '}
                          <strong className="text-slate-900">
                            {activeTicket.reporter_phone || activeTicket.reporter.phone}
                          </strong>
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-600 pt-1">
                    <span>
                      {lang === 'th'
                        ? 'บันทึกผ่านระบบ PH Eco Alert (ซ่อนข้อมูลส่วนบุคคลตามนโยบายคุ้มครองข้อมูล)'
                        : 'Reported via PH Eco Alert (Personal details protected)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Before & After Action Photos (Requirements 14) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'th' ? 'รูปภาพการดำเนินงานและภาพถ่ายบันทึกเหตุการณ์' : 'Action & Incident Photos'}
                  </h4>
                  {activeTicket.actionPhotos && activeTicket.actionPhotos.length > 0 && (
                    <span className="text-[11px] font-bold text-[#16A085] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {activeTicket.actionPhotos.length} {lang === 'th' ? 'รูปภาพการดำเนินงาน' : 'action photos'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reported Initial Photo */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {lang === 'th' ? 'ภาพจุดเกิดเหตุ (ตอนแจ้ง)' : 'Reported Incident Photo'}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        Original
                      </span>
                    </div>
                    {activeTicket.photoUrl ? (
                      <img
                        src={activeTicket.photoUrl}
                        alt="Incident"
                        className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-44 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                        {lang === 'th' ? 'ไม่มีรูปภาพแนบ' : 'No photo provided'}
                      </div>
                    )}
                  </div>

                  {/* Resolution or Action Photos */}
                  {activeTicket.actionPhotos && activeTicket.actionPhotos.length > 0 ? (
                    activeTicket.actionPhotos.map((p) => (
                      <div
                        key={p.photo_id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              p.photo_type === 'before'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : p.photo_type === 'after'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {p.photo_type === 'before'
                              ? (lang === 'th' ? 'ก่อนดำเนินงาน (Before)' : 'Before Action')
                              : p.photo_type === 'after'
                              ? (lang === 'th' ? 'หลังดำเนินงาน (After)' : 'After Action')
                              : (lang === 'th' ? 'รูปภาพอื่น ๆ' : 'Other')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.uploaded_at ? p.uploaded_at.substring(0, 16) : ''}
                          </span>
                        </div>
                        <img
                          src={p.photo_url}
                          alt="Action"
                          className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-2xs"
                        />
                        {p.description && (
                          <p className="text-xs text-slate-700 font-medium pt-1">
                            {p.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    /* Fallback to repairPhotoUrl if present */
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {lang === 'th' ? 'ภาพหลังการแก้ไข' : 'Resolution Photo'}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          After
                        </span>
                      </div>
                      {activeTicket.repairPhotoUrl ? (
                        <img
                          src={activeTicket.repairPhotoUrl}
                          alt="Resolution"
                          className="w-full h-44 object-cover rounded-xl border border-emerald-300 shadow-2xs"
                        />
                      ) : (
                        <div className="w-full h-44 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 text-center p-3">
                          {activeTicket.status === 'resolved'
                            ? (lang === 'th' ? 'แก้ไขเสร็จสิ้นตามมาตรฐาน' : 'Resolved')
                            : (lang === 'th' ? 'อยู่ระหว่างการดำเนินงานของเจ้าหน้าที่' : 'Awaiting operational action')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Requirement 15: Timeline การดำเนินงาน */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {lang === 'th' ? 'Timeline การดำเนินงาน (Action Timeline)' : 'Action Timeline'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <span className="text-amber-600">รับเรื่องแล้ว</span>
                    <span>→</span>
                    <span className="text-purple-600">กำลังตรวจสอบ</span>
                    <span>→</span>
                    <span className="text-blue-600">กำลังดำเนินการ</span>
                    <span>→</span>
                    <span className="text-emerald-600">เสร็จสิ้น</span>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-emerald-200 space-y-5 ml-2">
                  {activeTicket.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#16A085] ring-4 ring-emerald-100" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 uppercase">
                            {item.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-1.5 space-y-2">
                          <p className="font-medium leading-relaxed">
                            {item.actionDetails || item.remark}
                          </p>
                          {/* Attached photos in this timeline step if any */}
                          {item.actionPhotos && item.actionPhotos.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/80">
                              {item.actionPhotos.map((ap) => (
                                <div key={ap.photo_id} className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                                  <img
                                    src={ap.photo_url}
                                    alt="Step thumbnail"
                                    className="w-10 h-10 object-cover rounded-md"
                                  />
                                  <span className="text-[10px] font-bold text-slate-600 pr-1 capitalize">
                                    {ap.photo_type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Protect staff privacy: display only general title */}
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {lang === 'th' ? 'ดำเนินการโดย:' : 'Processed by:'}{' '}
                          {item.updatedBy && item.updatedBy.includes('@')
                            ? (lang === 'th' ? 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์' : 'Public Health Staff Officer')
                            : item.updatedBy || (lang === 'th' ? 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์' : 'Public Health Staff Officer')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-sm text-slate-500">
                {lang === 'th' ? 'เลือกรายงานเพื่อดูรายละเอียด' : 'Select a report to view details'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Status Update Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'th' ? 'อัปเดตสถานะการแจ้งเหตุ:' : 'Update Report Status:'}{' '}
              <span className="text-[#16A085]">{editingTicket.id}</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'th' ? 'สถานะการดำเนินงาน' : 'Status'}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
              >
                <option value="reported">{lang === 'th' ? 'รับเรื่องแล้ว' : 'Reported'}</option>
                <option value="investigating">{lang === 'th' ? 'กำลังตรวจสอบ' : 'Investigating'}</option>
                <option value="in_progress">{lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress'}</option>
                <option value="resolved">{lang === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved'}</option>
                <option value="rejected">{lang === 'th' ? 'ไม่สามารถดำเนินการได้' : 'Cannot Proceed'}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'th' ? 'บันทึกการดำเนินงาน / คำชี้แจง' : 'Action Remark'}
              </label>
              <textarea
                rows={3}
                value={staffRemark}
                onChange={(e) => setStaffRemark(e.target.value)}
                placeholder={
                  lang === 'th'
                    ? 'เช่น ส่งทีมงานตรวจสอบท่อระบายน้ำแล้ว, จัดการคัดแยกขยะเรียบร้อย...'
                    : 'Detail of action taken...'
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'th' ? 'ภาพหลังการแก้ไข (Image URL หรือ Data URL)' : 'Resolution Photo URL'}
              </label>
              <input
                type="text"
                value={repairPhoto || ''}
                onChange={(e) => setRepairPhoto(e.target.value)}
                placeholder="https://... หรือ Data URL"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingTicket(null)}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveStaffUpdate}
                className="flex-1 py-2.5 text-xs font-bold bg-[#16A085] hover:bg-[#138a72] text-white rounded-xl shadow-md cursor-pointer"
              >
                {lang === 'th' ? 'บันทึกการอัปเดต' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
