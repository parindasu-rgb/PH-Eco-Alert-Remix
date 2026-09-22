import React, { useState, useEffect } from 'react';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Building,
  Edit,
  Trash2,
  Filter,
  Search,
  XCircle,
  Shield,
  Phone,
  Camera,
  Upload,
  Image as ImageIcon,
  Plus,
  Eye,
  ArrowRight,
  Lock,
  FileText,
  AlertCircle,
  Calendar,
  UserCheck,
  LogOut,
  X,
  Sparkles,
  MapPin,
  Tag,
  Check,
  Bell,
  Send,
} from 'lucide-react';
import {
  ActionPhoto,
  ActionPhotoType,
  ActionUpdate,
  Language,
  ReportCategory,
  ReportStatus,
  Ticket,
  TimelineEntry,
  UserRole,
} from '../types';
import { getTranslation } from '../i18n';

interface StaffPortalProps {
  tickets: Ticket[];
  lang: Language;
  currentRole: UserRole;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onResetData: () => void;
  onStaffLogin?: (role: UserRole, staffName: string) => void;
  onStaffLogout?: () => void;
  onAuthorize?: (role: UserRole) => void;
  onDeauthorize?: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  tickets,
  lang,
  currentRole,
  onUpdateTicket,
  onDeleteTicket,
  onResetData,
  onStaffLogin,
  onStaffLogout,
  onAuthorize,
  onDeauthorize,
}) => {
  const t = getTranslation(lang);
  const isStaffAuthenticated = currentRole === 'staff' || currentRole === 'admin';

  // Staff Login Form State (when not yet authenticated)
  const [loginEmail, setLoginEmail] = useState<string>('staff.ph@kku.ac.th');
  const [loginPass, setLoginPass] = useState<string>('••••••••');
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Detail Modal State (Requirement 6: ปุ่ม "ดูรายละเอียด")
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

  // Edit Modal State (Requirement 7: ปุ่ม "แก้ไขข้อมูล")
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<ReportCategory>('waste');
  const [editBuilding, setEditBuilding] = useState<string>('');
  const [editRoomDetails, setEditRoomDetails] = useState<string>('');
  const [editStatus, setEditStatus] = useState<ReportStatus>('in_progress');
  const [editDept, setEditDept] = useState<string>('');
  const [editStaff, setEditStaff] = useState<string>('');
  const [editActionDetails, setEditActionDetails] = useState<string>('');

  // Action Photos Upload State (Requirements 10, 11, 12, 13)
  const [currentActionPhotos, setCurrentActionPhotos] = useState<ActionPhoto[]>([]);
  const [newPhotoType, setNewPhotoType] = useState<ActionPhotoType>('before');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoDesc, setNewPhotoDesc] = useState<string>('');
  const [isAddingPhoto, setIsAddingPhoto] = useState<boolean>(false);

  // LINE Official Account Integration Diagnostics & Retry State
  const [lineConfig, setLineConfig] = useState<{
    hasChannelAccessToken: boolean;
    hasChannelSecret: boolean;
    hasStaffGroupId: boolean;
    staffGroupIdMasked: string | null;
    isFullyConfigured: boolean;
    channelType?: string;
  } | null>(null);
  const [isRetryingLine, setIsRetryingLine] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/line/config-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLineConfig(data);
      })
      .catch((err) => console.warn('Could not load LINE OA configuration status:', err));
  }, []);

  const handleRetryLine = async (ticketId: string) => {
    setIsRetryingLine(ticketId);
    try {
      const res = await fetch(`/api/reports/${ticketId}/retry-line`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.report) {
        onUpdateTicket(data.report);
        if (viewingTicket && viewingTicket.id === ticketId) {
          setViewingTicket(data.report);
        }
      }
    } catch (err) {
      console.error('Failed to retry LINE notification:', err);
    } finally {
      setIsRetryingLine(null);
    }
  };

  // Verification Form Handlers
  const handleVerifyStaff = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError(lang === 'th' ? 'กรุณาระบุอีเมลหรือรหัสเจ้าหน้าที่' : 'Please enter staff email or ID');
      return;
    }
    const role: UserRole = loginEmail.includes('admin') ? 'admin' : 'staff';
    const staffName = role === 'admin'
      ? 'ผู้ดูแลระบบความปลอดภัย (Admin)'
      : 'เจ้าหน้าที่สุขาภิบาลสิ่งแวดล้อม คณะสาธารณสุขศาสตร์';
    if (onStaffLogin) {
      onStaffLogin(role, staffName);
    } else if (onAuthorize) {
      onAuthorize(role);
    }
    setLoginError('');
  };

  const handleQuickPresetLogin = (role: 'staff' | 'admin') => {
    const staffName = role === 'admin'
      ? 'ผู้ดูแลระบบส่วนกลาง (Admin)'
      : 'เจ้าหน้าที่สุขาภิบาลสิ่งแวดล้อม คณะสาธารณสุขศาสตร์';
    if (onStaffLogin) {
      onStaffLogin(role, staffName);
    } else if (onAuthorize) {
      onAuthorize(role);
    }
    setLoginError('');
  };

  // Metric Computations (Requirement 5)
  const totalReportsCount = tickets.length;
  const pendingCount = tickets.filter((tk) => tk.status === 'reported').length;
  const inProgressCount = tickets.filter(
    (tk) => tk.status === 'in_progress' || tk.status === 'investigating'
  ).length;
  const resolvedCount = tickets.filter((tk) => tk.status === 'resolved').length;
  const rejectedCount = tickets.filter((tk) => tk.status === 'rejected').length;

  // Filtered reports list (Requirement 6)
  const filteredTickets = tickets.filter((tk) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      tk.id.toLowerCase().includes(q) ||
      (tk.report_id && tk.report_id.toLowerCase().includes(q)) ||
      tk.title.toLowerCase().includes(q) ||
      tk.description.toLowerCase().includes(q) ||
      (tk.location.building && tk.location.building.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'all' || tk.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || tk.category === selectedCategory;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  // Open Edit Report Modal (Requirement 7)
  const handleOpenEditModal = (tk: Ticket) => {
    setEditingTicket(tk);
    setEditTitle(tk.title);
    setEditCategory(tk.category);
    setEditBuilding(tk.location.building || '');
    setEditRoomDetails(tk.location.roomOrDetails || '');
    setEditStatus(tk.status);
    setEditDept(tk.department || 'หน่วยกายภาพและสิ่งแวดล้อม คณะสาธารณสุขศาสตร์');
    setEditStaff(
      tk.assignedStaff ||
        (currentRole === 'admin'
          ? 'ผู้ดูแลระบบ (Admin)'
          : 'เจ้าหน้าที่สุขาภิบาลสิ่งแวดล้อม คณะสาธารณสุขศาสตร์')
    );
    setEditActionDetails('');
    setCurrentActionPhotos(tk.actionPhotos || []);
    setIsAddingPhoto(false);
    setNewPhotoUrl('');
    setNewPhotoDesc('');
    setNewPhotoType('before');
  };

  // Image Upload Handler (Supports local file & camera capture - Requirement 12)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(lang === 'th' ? 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น' : 'Only JPG, PNG, and WEBP supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewPhotoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Append new action photo to current list (Requirements 10, 11, 12, 13)
  const handleAddActionPhoto = () => {
    if (!newPhotoUrl) {
      alert(lang === 'th' ? 'กรุณาเลือกหรือถ่ายรูปภาพก่อนเพิ่ม' : 'Please upload or capture a photo first');
      return;
    }
    if (!editingTicket) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newPhoto: ActionPhoto = {
      photo_id: `PHO-${Date.now().toString().slice(-5)}`,
      report_id: editingTicket.id,
      photo_url: newPhotoUrl,
      photo_type: newPhotoType,
      description: newPhotoDesc.trim() || (newPhotoType === 'before' ? 'สภาพพื้นที่ก่อนดำเนินการแก้ไข' : 'หลังดำเนินการเรียบร้อยแล้ว'),
      uploaded_at: nowStr,
      uploaded_by: editStaff || 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์',
    };

    setCurrentActionPhotos((prev) => [newPhoto, ...prev]);
    setNewPhotoUrl('');
    setNewPhotoDesc('');
    setIsAddingPhoto(false);
  };

  // Remove action photo before saving (Requirement 12)
  const handleRemoveActionPhoto = (photoId: string) => {
    setCurrentActionPhotos((prev) => prev.filter((p) => p.photo_id !== photoId));
  };

  // Save Changes Handler (Requirements 7, 8, 9, 10, 11, 15, 16, 17)
  const handleSaveChanges = () => {
    if (!editingTicket) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const previousStatus = editingTicket.status;
    const isStatusChanged = previousStatus !== editStatus;

    // Default action detail if left empty
    const defaultActionMap: Record<ReportStatus, string> = {
      reported: 'รับเรื่องและลงบันทึกในระบบเรียบร้อย',
      investigating: 'ลงพื้นที่ตรวจสอบจุดเกิดเหตุและประเมินความเสียหายด้านสิ่งแวดล้อม',
      in_progress: 'ทีมปฏิบัติการกำลังดำเนินการซ่อมแซมและปรับปรุงแก้ไขสภาพแวดล้อม',
      resolved: 'ดำเนินการแก้ไขและตรวจสอบมาตรฐานสุขาภิบาลสิ่งแวดล้อมเสร็จสิ้น',
      rejected: 'ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลไม่เพียงพอหรืออยู่นอกเขตรับผิดชอบ',
    };

    const finalActionDetails =
      editActionDetails.trim() ||
      (isStatusChanged
        ? defaultActionMap[editStatus]
        : 'อัปเดตข้อมูลรายละเอียดการแจ้งเหตุและรูปภาพการดำเนินงาน');

    // Create Action Update Entry (Requirement 17)
    const newActionUpdate: ActionUpdate = {
      update_id: `UPD-${Date.now().toString().slice(-6)}`,
      report_id: editingTicket.id,
      action_type: isStatusChanged ? 'อัปเดตสถานะการดำเนินงาน' : 'แก้ไขข้อมูลรายงาน',
      status: editStatus,
      previous_status: previousStatus,
      action_details: finalActionDetails,
      updated_at: nowStr,
      updated_by: editStaff || 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์',
      photos: currentActionPhotos,
    };

    // Append to Timeline (Requirement 15)
    const newTimelineEntry: TimelineEntry = {
      status: editStatus,
      timestamp: nowStr,
      remark: finalActionDetails,
      updatedBy: editStaff || 'เจ้าหน้าที่สิ่งแวดล้อม คณะสาธารณสุขศาสตร์',
      actionDetails: finalActionDetails,
      actionPhotos: currentActionPhotos,
    };

    // If there is an 'after' photo, set repairPhotoUrl as well
    const afterPhoto = currentActionPhotos.find((p) => p.photo_type === 'after');

    const updatedTicket: Ticket = {
      ...editingTicket,
      title: editTitle.trim() || editingTicket.title,
      category: editCategory,
      location: {
        ...editingTicket.location,
        building: editBuilding.trim() || editingTicket.location.building,
        roomOrDetails: editRoomDetails.trim() || editingTicket.location.roomOrDetails,
      },
      status: editStatus,
      department: editDept.trim() || editingTicket.department,
      assignedStaff: editStaff.trim() || editingTicket.assignedStaff,
      updatedAt: nowStr,
      updated_at: nowStr,
      repairPhotoUrl: afterPhoto?.photo_url || editingTicket.repairPhotoUrl,
      actionPhotos: currentActionPhotos,
      actionUpdates: [newActionUpdate, ...(editingTicket.actionUpdates || [])],
      timeline: [...editingTicket.timeline, newTimelineEntry],
    };

    onUpdateTicket(updatedTicket);

    // If viewing this ticket in view modal, refresh it
    if (viewingTicket?.id === updatedTicket.id) {
      setViewingTicket(updatedTicket);
    }

    setEditingTicket(null);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [
      'Report ID',
      'Category',
      'Title',
      'Building/Location',
      'Status',
      'Created At',
      'Updated At',
      'Assigned Department',
      'Assigned Staff',
      'Action Photos Count',
    ];
    const rows = tickets.map((tk) => [
      tk.id,
      tk.category,
      `"${(tk.title || '').replace(/"/g, '""')}"`,
      `"${(tk.location.building || tk.location.faculty || '').replace(/"/g, '""')}"`,
      tk.status,
      tk.createdAt,
      tk.updatedAt,
      `"${(tk.department || '').replace(/"/g, '""')}"`,
      `"${(tk.assignedStaff || '').replace(/"/g, '""')}"`,
      (tk.actionPhotos || []).length,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ph_eco_alert_staff_report_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // ==========================================
  // VIEW A: Staff Verification Gate (Requirement 4)
  // ==========================================
  if (!isStaffAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-8 p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#16A085] to-[#2ECC71] mx-auto flex items-center justify-center text-white shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider">
              Faculty of Public Health, KKU
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              {lang === 'th' ? 'สำหรับเจ้าหน้าที่ (Staff Portal)' : 'Staff Portal Access'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {lang === 'th'
                ? 'พื้นที่สำหรับเจ้าหน้าที่และผู้ดูแลระบบในการจัดการข้อมูลการแจ้งเหตุและอัปเดตการดำเนินงาน'
                : 'Restricted area for Faculty staff to manage incident reports and operational actions.'}
            </p>
          </div>
        </div>

        {/* Public Notice Banner (Requirement 4) */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1 mb-6">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'th'
                ? 'ประกาศสำหรับผู้ใช้งานทั่วไป (นักศึกษา / บุคลากร / ประชาชน)'
                : 'Notice for General Users'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            {lang === 'th'
              ? 'ท่านสามารถแจ้งเหตุและติดตามสถานะได้ทันทีโดยไม่ต้องเข้าสู่ระบบ หน้านี้สงวนไว้สำหรับเจ้าหน้าที่ผู้รับผิดชอบงานสิ่งแวดล้อมเท่านั้น'
              : 'You do not need to log in to report incidents or track status. This portal is for authorized faculty staff only.'}
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifyStaff} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === 'th' ? 'อีเมลเจ้าหน้าที่ / รหัสบุคลากร' : 'Staff Email / Personnel ID'}
            </label>
            <input
              type="text"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="staff.ph@kku.ac.th"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === 'th' ? 'รหัสผ่าน / Security PIN' : 'Password / Security PIN'}
            </label>
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
            />
          </div>

          {loginError && (
            <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#16A085] hover:bg-[#138a72] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{lang === 'th' ? 'ยืนยันสิทธิ์เข้าสู่ระบบเจ้าหน้าที่' : 'Verify & Enter Staff Portal'}</span>
          </button>
        </form>

        {/* Quick Test Presets */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-2.5">
            {lang === 'th' ? 'เลือกบัญชีเจ้าหน้าที่สำหรับทดสอบระบบ (Quick Presets)' : 'Demo Staff Quick Access'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickPresetLogin('staff')}
              className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'th' ? 'เจ้าหน้าที่สิ่งแวดล้อม' : 'Environmental Staff'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickPresetLogin('admin')}
              className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-slate-700" />
              <span>{lang === 'th' ? 'ผู้ดูแลระบบ (Admin)' : 'Administrator'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW B: Authenticated Staff Portal
  // ==========================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto my-4 font-['Noto_Sans_Thai','Plus_Jakarta_Sans',sans-serif]">
      {/* Top Staff Identity & Action Header */}
      <div className="p-6 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentRole === 'admin' ? 'Administrator' : 'Staff Officer'}</span>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-semibold">
              {lang === 'th' ? 'คณะสาธารณสุขศาสตร์ มข.' : 'Faculty of Public Health KKU'}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">
            {lang === 'th' ? 'สำหรับเจ้าหน้าที่ (Staff Portal)' : 'Staff Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'th'
              ? 'ระบบจัดการข้อมูลการแจ้งเหตุ บันทึกผลการดำเนินงาน และแนบรูปภาพความคืบหน้า'
              : 'Operational incident management, resolution recording, and action photo tracking.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-[#16A085]" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resetData}</span>
          </button>

          <button
            onClick={() => {
              if (onStaffLogout) {
                onStaffLogout();
              } else if (onDeauthorize) {
                onDeauthorize();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            title="Exit Staff Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* LINE OA Integration Status Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 text-sm font-bold">
                {lang === 'th' ? 'ระบบแจ้งเตือน LINE Official Account เจ้าหน้าที่' : 'LINE OA Staff Notification'}
              </strong>
              {lineConfig?.isFullyConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {lang === 'th' ? 'เชื่อมต่อพร้อมใช้งาน' : 'Connected'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  {lang === 'th' ? 'รอการตั้งค่า LINE Credentials' : 'Configuration Pending'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {lineConfig?.isFullyConfigured
                ? `${lang === 'th' ? 'ส่งการแจ้งเตือนอัตโนมัติเข้ากลุ่มเจ้าหน้าที่:' : 'Forwarding new reports automatically to group:'} ${lineConfig.staffGroupIdMasked || 'Group'}`
                : lang === 'th'
                ? 'ระบบจะส่งข้อความแจ้งเตือนทันทีเมื่อมีผู้ส่งแบบแจ้งเหตุใหม่ (สามารถกำหนด LINE_CHANNEL_ACCESS_TOKEN และ LINE_STAFF_GROUP_ID ใน Environment Variables)'
                : 'Configurable via LINE_CHANNEL_ACCESS_TOKEN and LINE_STAFF_GROUP_ID environment variables.'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start md:self-auto">
          <span>Webhook: <strong>/api/line/webhook</strong></span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* Requirement 5: Dashboard สำหรับเจ้าหน้าที่ (Summary Cards) */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. การแจ้งเหตุทั้งหมด */}
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            selectedStatus === 'all'
              ? 'bg-emerald-50/70 border-[#16A085] ring-2 ring-[#16A085]/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'th' ? 'การแจ้งเหตุทั้งหมด' : 'Total Reports'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-[#16A085]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-slate-900">
              {totalReportsCount}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-semibold">
              {lang === 'th' ? 'รายการ' : 'reports'}
            </span>
          </div>
        </div>

        {/* 2. งานที่รอดำเนินการ */}
        <div
          onClick={() => setSelectedStatus('reported')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            selectedStatus === 'reported'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {lang === 'th' ? 'งานที่รอดำเนินการ' : 'Pending'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-amber-800">
              {pendingCount}
            </span>
            <span className="text-xs text-amber-700 ml-1.5 font-semibold">
              {lang === 'th' ? 'รับเรื่องแล้ว' : 'reported'}
            </span>
          </div>
        </div>

        {/* 3. งานที่กำลังดำเนินการ */}
        <div
          onClick={() => setSelectedStatus('in_progress')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            selectedStatus === 'in_progress'
              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              {lang === 'th' ? 'งานที่กำลังดำเนินการ' : 'In Progress'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Search className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-blue-800">
              {inProgressCount}
            </span>
            <span className="text-xs text-blue-700 ml-1.5 font-semibold">
              {lang === 'th' ? 'ตรวจสอบ/แก้ไข' : 'active'}
            </span>
          </div>
        </div>

        {/* 4. งานที่ดำเนินการเสร็จสิ้น */}
        <div
          onClick={() => setSelectedStatus('resolved')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            selectedStatus === 'resolved'
              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {lang === 'th' ? 'งานที่ดำเนินการเสร็จสิ้น' : 'Resolved'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-black text-emerald-800">
              {resolvedCount}
            </span>
            <span className="text-xs text-emerald-700 ml-1.5 font-semibold">
              {lang === 'th' ? 'เสร็จสมบูรณ์' : 'completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
            { id: 'reported', labelTh: 'รับเรื่องแล้ว', labelEn: 'Reported' },
            { id: 'investigating', labelTh: 'กำลังตรวจสอบ', labelEn: 'Investigating' },
            { id: 'in_progress', labelTh: 'กำลังดำเนินการ', labelEn: 'In Progress' },
            { id: 'resolved', labelTh: 'เสร็จสิ้น', labelEn: 'Resolved' },
            { id: 'rejected', labelTh: 'ไม่สำเร็จ', labelEn: 'Rejected' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-white text-[#16A085] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'th' ? st.labelTh : st.labelEn}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'th' ? 'ค้นหาเลขที่, หัวข้อ, สถานที่...' : 'Search ID, title, location...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
          />
        </div>
      </div>

      {/* ==================================================== */}
      {/* Requirement 6: รายการแจ้งเหตุ (Incident Reports List) */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{lang === 'th' ? 'รายการแจ้งเหตุทั้งหมด' : 'All Incident Reports'}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-extrabold">
              {filteredTickets.length}
            </span>
          </h2>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">
              {lang === 'th' ? 'ไม่พบรายการแจ้งเหตุที่ตรงกับเงื่อนไข' : 'No matching reports found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">{lang === 'th' ? 'เลขที่แจ้งเหตุ' : 'Report ID'}</th>
                  <th className="p-4">{lang === 'th' ? 'วันที่แจ้ง' : 'Date'}</th>
                  <th className="p-4">{lang === 'th' ? 'ประเภทเหตุ' : 'Category'}</th>
                  <th className="p-4">{lang === 'th' ? 'รายละเอียด' : 'Incident Details'}</th>
                  <th className="p-4">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="p-4">{lang === 'th' ? 'การแจ้งเตือน LINE' : 'LINE OA'}</th>
                  <th className="p-4">{lang === 'th' ? 'วันที่อัปเดตล่าสุด' : 'Last Updated'}</th>
                  <th className="p-4 text-right">{lang === 'th' ? 'การจัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTickets.map((tk) => {
                  const actionPhotosCount = (tk.actionPhotos || []).length;
                  return (
                    <tr key={tk.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* เลขที่แจ้งเหตุ */}
                      <td className="p-4 font-mono font-extrabold text-[#16A085] whitespace-nowrap">
                        {tk.id}
                      </td>

                      {/* วันที่แจ้ง */}
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {tk.createdAt.substring(0, 16)}
                      </td>

                      {/* ประเภทเหตุ */}
                      <td className="p-4 capitalize font-semibold text-slate-800 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {tk.category}
                        </span>
                      </td>

                      {/* รายละเอียด */}
                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{tk.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          📍 {tk.location.building || tk.location.faculty}
                        </div>
                        {actionPhotosCount > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-700 font-semibold">
                            <ImageIcon className="w-3 h-3" />
                            <span>
                              {actionPhotosCount} {lang === 'th' ? 'รูปภาพการดำเนินงาน' : 'action photos'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* สถานะ */}
                      <td className="p-4 whitespace-nowrap">{getStatusBadge(tk.status)}</td>

                      {/* การแจ้งเตือน LINE OA */}
                      <td className="p-4 whitespace-nowrap">
                        {tk.line_notification_status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{lang === 'th' ? 'ส่งแล้ว' : 'Sent'}</span>
                          </span>
                        ) : tk.line_notification_status === 'failed' ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200"
                              title={tk.line_notification_error || 'ส่ง LINE ไม่สำเร็จ'}
                            >
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>{lang === 'th' ? 'ไม่สำเร็จ' : 'Failed'}</span>
                            </span>
                            <button
                              type="button"
                              disabled={isRetryingLine === tk.id}
                              onClick={() => handleRetryLine(tk.id)}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                              title={lang === 'th' ? 'ส่งการแจ้งเตือน LINE ซ้ำ' : 'Retry LINE Notification'}
                            >
                              {isRetryingLine === tk.id ? (
                                <RotateCcw className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <span>{lang === 'th' ? 'ส่งซ้ำ' : 'Retry'}</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3" />
                            <span>{lang === 'th' ? 'รอดำเนินการ' : 'Pending'}</span>
                          </span>
                        )}
                      </td>

                      {/* วันที่อัปเดตล่าสุด */}
                      <td className="p-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {tk.updatedAt ? tk.updatedAt.substring(0, 16) : tk.createdAt.substring(0, 16)}
                      </td>

                      {/* ปุ่มจัดการ (ดูรายละเอียด / แก้ไขข้อมูล) */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* ปุ่ม ดูรายละเอียด (Requirement 6) */}
                          <button
                            onClick={() => setViewingTicket(tk)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            title={lang === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">{lang === 'th' ? 'ดูรายละเอียด' : 'View'}</span>
                          </button>

                          {/* ปุ่ม แก้ไขข้อมูล (Requirement 7) */}
                          <button
                            onClick={() => handleOpenEditModal(tk)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl transition-all shadow-xs cursor-pointer"
                            title={lang === 'th' ? 'แก้ไขข้อมูล' : 'Edit Report'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{lang === 'th' ? 'แก้ไขข้อมูล' : 'Edit'}</span>
                          </button>

                          {/* Admin Only Delete */}
                          {currentRole === 'admin' && onDeleteTicket && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    lang === 'th'
                                      ? `คุณแน่ใจหรือไม่ที่จะลบ Ticket ${tk.id} ออกจากระบบ?`
                                      : `Are you sure you want to delete ${tk.id}?`
                                  )
                                ) {
                                  onDeleteTicket(tk.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: ดูรายละเอียด (View Details Modal) */}
      {/* ==================================================== */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-black text-[#16A085] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {viewingTicket.id}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {viewingTicket.category}
                  </span>
                  {getStatusBadge(viewingTicket.status)}
                </div>
                <h3 className="text-lg font-black text-slate-900">{viewingTicket.title}</h3>
              </div>
              <button
                onClick={() => setViewingTicket(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Location */}
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider block">
                  {lang === 'th' ? 'รายละเอียดเหตุการณ์' : 'Description'}
                </span>
                <p className="text-slate-800 leading-relaxed">{viewingTicket.description}</p>
                <div className="pt-2 border-t border-slate-200/80 text-slate-600 flex flex-wrap items-center gap-4">
                  <span>📍 {viewingTicket.location.building} ({viewingTicket.location.roomOrDetails || viewingTicket.location.faculty})</span>
                  <span>🗓️ {viewingTicket.createdAt}</span>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === 'th' ? 'ข้อมูลผู้แจ้งเหตุ' : 'Reporter'}
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {viewingTicket.isAnonymous
                      ? (lang === 'th' ? 'ผู้แจ้งไม่ประสงค์ออกนาม (Anonymous)' : 'Anonymous')
                      : (viewingTicket.reporter_name || viewingTicket.reporter.name || 'ระบุตัวตน')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {viewingTicket.reporter.phone || viewingTicket.reporter.email || ''}
                </span>
              </div>

              {/* LINE OA Staff Notification Details & Retry Panel */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'th' ? 'การแจ้งเตือน LINE Official Account เจ้าหน้าที่' : 'LINE OA Staff Notification'}</span>
                  </span>
                  {viewingTicket.line_notification_status === 'sent' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{lang === 'th' ? 'ส่งการแจ้งเตือนเรียบร้อย' : 'Delivered'}</span>
                    </span>
                  ) : viewingTicket.line_notification_status === 'failed' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>{lang === 'th' ? 'ส่งไม่สำเร็จ' : 'Failed'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lang === 'th' ? 'รอดำเนินการ' : 'Pending'}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">{lang === 'th' ? 'เวลาที่ส่งแจ้งเตือน:' : 'Sent At:'}</span>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {viewingTicket.line_notification_sent_at || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{lang === 'th' ? 'พยายามส่งแล้ว:' : 'Attempts:'}</span>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {viewingTicket.line_retry_count || 1} {lang === 'th' ? 'ครั้ง' : 'times'}
                    </span>
                  </div>
                </div>

                {viewingTicket.line_notification_error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                    <span className="font-bold block">{lang === 'th' ? 'ข้อความแจ้งเตือนข้อผิดพลาด:' : 'Error details:'}</span>
                    <p className="font-mono break-all">{viewingTicket.line_notification_error}</p>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {lang === 'th'
                      ? 'ส่งเข้ากลุ่ม LINE OA เจ้าหน้าที่สุขาภิบาลสิ่งแวดล้อม'
                      : 'Delivered to PH Eco Alert Staff LINE Group'}
                  </span>
                  <button
                    type="button"
                    disabled={isRetryingLine === viewingTicket.id}
                    onClick={() => handleRetryLine(viewingTicket.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRetryingLine === viewingTicket.id ? 'animate-spin' : ''}`} />
                    <span>{lang === 'th' ? 'ส่งการแจ้งเตือน LINE ซ้ำ' : 'Retry LINE Notification'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Photos Section (Requirements 10, 11, 14) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'th' ? 'รูปภาพการดำเนินงาน (Action Photos)' : 'Action Photos'}
                </h4>
                <span className="text-xs font-semibold text-[#16A085]">
                  {(viewingTicket.actionPhotos || []).length} {lang === 'th' ? 'รูป' : 'photos'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Initial Photo */}
                {viewingTicket.photoUrl && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">
                        {lang === 'th' ? 'ภาพจุดเกิดเหตุ (ตอนแจ้ง)' : 'Reported Incident Photo'}
                      </span>
                    </div>
                    <img
                      src={viewingTicket.photoUrl}
                      alt="Incident"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}

                {/* Staff Action Photos */}
                {(viewingTicket.actionPhotos || []).map((photo) => (
                  <div
                    key={photo.photo_id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          photo.photo_type === 'before'
                            ? 'bg-amber-100 text-amber-800'
                            : photo.photo_type === 'after'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {photo.photo_type === 'before'
                          ? (lang === 'th' ? 'ก่อนดำเนินงาน (Before)' : 'Before')
                          : photo.photo_type === 'after'
                          ? (lang === 'th' ? 'หลังดำเนินงาน (After)' : 'After')
                          : (lang === 'th' ? 'รูปภาพอื่น ๆ' : 'Other')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {photo.uploaded_at.substring(0, 16)}
                      </span>
                    </div>
                    <img
                      src={photo.photo_url}
                      alt="Action"
                      className="w-full h-40 object-cover rounded-xl border border-slate-200"
                    />
                    {photo.description && (
                      <p className="text-xs text-slate-700 font-medium pt-1">
                        {photo.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Timeline (Requirement 15) */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'th' ? 'Timeline การดำเนินงาน' : 'Action Timeline'}
              </h4>
              <div className="relative pl-6 border-l-2 border-emerald-200 space-y-4 ml-2">
                {viewingTicket.timeline.map((entry, idx) => (
                  <div key={idx} className="relative group text-xs">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#16A085] ring-4 ring-emerald-100" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase">{entry.status}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                        {entry.remark || entry.actionDetails}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {lang === 'th' ? 'บันทึกโดย:' : 'By:'} {entry.updatedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setViewingTicket(null)}
                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              </button>
              <button
                onClick={() => {
                  const tk = viewingTicket;
                  setViewingTicket(null);
                  handleOpenEditModal(tk);
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-[#16A085] hover:bg-[#138a72] text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>{lang === 'th' ? 'แก้ไขข้อมูลและดำเนินงาน' : 'Edit & Take Action'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: แก้ไขข้อมูลการแจ้งเหตุ (Edit Report Modal) */}
      {/* Requirements 7, 8, 9, 10, 11, 12, 13, 16, 17 */}
      {/* ==================================================== */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider">
                  {lang === 'th' ? 'แก้ไขข้อมูลการแจ้งเหตุ (Edit Report)' : 'Edit Incident Report'}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingTicket.id}: <span className="font-semibold text-slate-700">{editingTicket.title}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingTicket(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Part 1: Basic Info Editing (Requirement 7) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'th' ? 'หัวข้อเหตุการณ์' : 'Report Title'}
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'th' ? 'ประเภทเหตุการณ์' : 'Category'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ReportCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                  >
                    <option value="water">{t.catWater}</option>
                    <option value="air">{t.catAir}</option>
                    <option value="noise">{t.catNoise}</option>
                    <option value="odor">{t.catOdor}</option>
                    <option value="waste">{t.catWaste}</option>
                    <option value="vector">{t.catVector}</option>
                    <option value="others">{t.catOthers}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'th' ? 'อาคาร / สถานที่' : 'Building / Spot'}
                  </label>
                  <input
                    type="text"
                    value={editBuilding}
                    onChange={(e) => setEditBuilding(e.target.value)}
                    placeholder="อาคาร 1 คณะสาธารณสุขศาสตร์"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'th' ? 'หน่วยงานผู้รับผิดชอบ' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'th' ? 'เจ้าหน้าที่ผู้รับผิดชอบ' : 'Assigned Staff'}
                  </label>
                  <input
                    type="text"
                    value={editStaff}
                    onChange={(e) => setEditStaff(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                  />
                </div>
              </div>

              {/* Part 2: Status Update (Requirement 8) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  {lang === 'th' ? 'สถานะการดำเนินงาน (Status Update)' : 'Status Update'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'reported', labelTh: 'รับเรื่องแล้ว', labelEn: 'Reported', color: 'text-amber-800 bg-amber-50 border-amber-300' },
                    { id: 'investigating', labelTh: 'กำลังตรวจสอบ', labelEn: 'Investigating', color: 'text-purple-800 bg-purple-50 border-purple-300' },
                    { id: 'in_progress', labelTh: 'กำลังดำเนินการ', labelEn: 'In Progress', color: 'text-blue-800 bg-blue-50 border-blue-300' },
                    { id: 'resolved', labelTh: 'เสร็จสิ้น', labelEn: 'Resolved', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' },
                    { id: 'rejected', labelTh: 'ไม่สำเร็จ', labelEn: 'Rejected', color: 'text-rose-800 bg-rose-50 border-rose-300' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setEditStatus(st.id as ReportStatus)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                        editStatus === st.id
                          ? `${st.color} ring-2 ring-[#16A085] shadow-xs`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'th' ? st.labelTh : st.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 3: Action Details (Requirement 9) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">
                    {lang === 'th' ? 'รายละเอียดการดำเนินงาน (Action Details)' : 'Action Details'}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'th' ? 'เลือกข้อความแนะนำด่วน หรือ พิมพ์เอง' : 'Quick chips or type'}
                  </span>
                </div>

                {/* Quick Chips for Action Details */}
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {[
                    'ตรวจสอบพื้นที่จุดเกิดเหตุ',
                    'ดำเนินการแก้ไขปรับปรุงแล้ว',
                    'ทำความสะอาดพื้นที่เรียบร้อย',
                    'ประสานหน่วยงานที่เกี่ยวข้อง',
                    'ดำเนินการเสร็จสิ้นตามมาตรฐาน',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setEditActionDetails((prev) =>
                          prev ? `${prev} / ${chip}` : chip
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={editActionDetails}
                  onChange={(e) => setEditActionDetails(e.target.value)}
                  placeholder={
                    lang === 'th'
                      ? 'บันทึกสิ่งที่ดำเนินการกับเหตุการณ์ เช่น ตรวจสอบพื้นที่, เปลี่ยนอุปกรณ์, ทำความสะอาดพื้นที่...'
                      : 'Record actions taken, e.g. field inspection, equipment replaced, sanitation sanitized...'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Part 4: Action Photos (Requirements 10, 11, 12, 13) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">
                      {lang === 'th' ? 'รูปภาพการดำเนินงาน (Action Photos)' : 'Action Photos'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'th'
                        ? 'แนบรูปภาพก่อนและหลังดำเนินงาน เพื่อเปรียบเทียบผลการปฏิบัติงาน'
                        : 'Attach Before & After photos to compare resolution.'}
                    </p>
                  </div>
                  {!isAddingPhoto && (
                    <button
                      type="button"
                      onClick={() => setIsAddingPhoto(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#16A085] hover:bg-[#138a72] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'เพิ่มรูปภาพ (Add Photo)' : 'Add Photo'}</span>
                    </button>
                  )}
                </div>

                {/* Adding Photo Sub-form */}
                {isAddingPhoto && (
                  <div className="p-4 bg-white rounded-2xl border border-emerald-300 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#16A085]">
                        {lang === 'th' ? 'แนบรูปภาพใหม่' : 'Attach New Photo'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Photo Type Selection: Before / After (Requirement 11) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {lang === 'th' ? 'ประเภทของรูปภาพ' : 'Photo Type'}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewPhotoType('before')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newPhotoType === 'before'
                              ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {lang === 'th' ? 'ก่อนดำเนินงาน (Before)' : 'Before'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhotoType('after')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newPhotoType === 'after'
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {lang === 'th' ? 'หลังดำเนินงาน (After)' : 'After'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPhotoType('other')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newPhotoType === 'other'
                              ? 'bg-blue-100 border-blue-400 text-blue-800 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {lang === 'th' ? 'อื่น ๆ (Other)' : 'Other'}
                        </button>
                      </div>
                    </div>

                    {/* Upload Controls (Requirement 12) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {lang === 'th' ? 'เลือกรูปภาพ หรือ ถ่ายรูปจากกล้อง' : 'Select Photo or Capture'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {/* Device File Pick */}
                        <label className="flex-1 min-w-[140px] flex items-center justify-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                          <Upload className="w-4 h-4 text-[#16A085]" />
                          <span>{lang === 'th' ? 'เลือกจากเครื่อง' : 'Browse Files'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        {/* Mobile Camera Capture */}
                        <label className="flex-1 min-w-[140px] flex items-center justify-center gap-2 p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl cursor-pointer text-xs font-bold text-emerald-800 transition-colors">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'th' ? 'ถ่ายรูปจากกล้อง' : 'Camera'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Photo Preview Before Saving (Requirement 12) */}
                    {newPhotoUrl && (
                      <div className="relative p-2 bg-slate-100 rounded-2xl border border-slate-200">
                        <img
                          src={newPhotoUrl}
                          alt="Preview"
                          className="w-full h-44 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setNewPhotoUrl('')}
                          className="absolute top-4 right-4 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Delete preview photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Photo Description (Requirement 13) */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {lang === 'th' ? 'คำอธิบายรูปภาพ (Description)' : 'Photo Description'}
                      </label>
                      <input
                        type="text"
                        value={newPhotoDesc}
                        onChange={(e) => setNewPhotoDesc(e.target.value)}
                        placeholder={
                          newPhotoType === 'before'
                            ? 'เช่น สภาพพื้นที่ก่อนดำเนินการแก้ไข พบขยะล้นถัง...'
                            : 'เช่น หลังดำเนินการทำความสะอาดพื้นที่เรียบร้อยแล้ว'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                      >
                        {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAddActionPhoto}
                        disabled={!newPhotoUrl}
                        className="px-4 py-1.5 text-xs font-bold bg-[#16A085] hover:bg-[#138a72] disabled:opacity-50 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'th' ? 'บันทึกรูปนี้' : 'Add Photo'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Photos Already Queued/Attached */}
                {currentActionPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentActionPhotos.map((photo) => (
                      <div
                        key={photo.photo_id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-start gap-2 relative shadow-2xs"
                      >
                        <img
                          src={photo.photo_url}
                          alt="Thumbnail"
                          className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0 pr-6">
                          <span
                            className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mb-1 ${
                              photo.photo_type === 'before'
                                ? 'bg-amber-100 text-amber-800'
                                : photo.photo_type === 'after'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {photo.photo_type === 'before'
                              ? 'Before'
                              : photo.photo_type === 'after'
                              ? 'After'
                              : 'Other'}
                          </span>
                          <p className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-tight">
                            {photo.description || '-'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionPhoto(photo.photo_id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 text-xs">
                    {lang === 'th' ? 'ยังไม่มีรูปภาพการดำเนินงานแนบในรายการนี้' : 'No action photos attached yet'}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions (Requirement 7: บันทึกการแก้ไข / Save Changes) */}
            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex-1 py-2.5 text-xs font-bold bg-[#16A085] hover:bg-[#138a72] text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'th' ? 'บันทึกการแก้ไข (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
