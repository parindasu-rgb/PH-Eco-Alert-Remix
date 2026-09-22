import React, { useState } from 'react';
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
} from 'lucide-react';
import { Language, ReportStatus, Ticket, UserRole } from '../types';
import { getTranslation } from '../i18n';

interface StaffDashboardProps {
  tickets: Ticket[];
  lang: Language;
  currentRole: UserRole;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string) => void;
  onResetData: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  tickets,
  lang,
  currentRole,
  onUpdateTicket,
  onDeleteTicket,
  onResetData,
}) => {
  const t = getTranslation(lang);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Modal edit fields
  const [modalStatus, setModalStatus] = useState<ReportStatus>('in_progress');
  const [modalDept, setModalDept] = useState<string>('');
  const [modalStaff, setModalStaff] = useState<string>('');
  const [modalRemark, setModalRemark] = useState<string>('');
  const [modalRepairPhoto, setModalRepairPhoto] = useState<string>('');

  const filtered = tickets.filter(
    (tk) => selectedStatus === 'all' || tk.status === selectedStatus
  );

  const exportCSV = () => {
    const headers = [
      'Report ID',
      'Category',
      'Title',
      'Faculty',
      'Building/Location',
      'Status',
      'Reporter Type',
      'Created At',
    ];
    const rows = tickets.map((tk) => [
      tk.id,
      tk.category,
      `"${(tk.title || '').replace(/"/g, '""')}"`,
      `"${(tk.location.faculty || '').replace(/"/g, '""')}"`,
      `"${(tk.location.building || '').replace(/"/g, '""')}"`,
      tk.status,
      tk.isAnonymous ? 'Anonymous' : tk.reporterType || 'Identified',
      tk.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ph_eco_alert_reports_${new Date().toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = (tk: Ticket) => {
    setEditingTicket(tk);
    setModalStatus(tk.status);
    setModalDept(tk.department);
    setModalStaff(tk.assignedStaff || '');
    setModalRemark('');
    setModalRepairPhoto(tk.repairPhotoUrl || '');
  };

  const handleSaveModal = () => {
    if (!editingTicket) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const defaultRemarkMap: Record<ReportStatus, string> = {
      reported: 'รับเรื่องเข้าสู่ระบบ',
      investigating: 'เจ้าหน้าที่กำลังลงพื้นที่ตรวจสอบข้อเท็จจริง',
      in_progress: 'กำลังดำเนินการแก้ไขและปรับปรุง',
      resolved: 'ดำเนินการแก้ไขเรียบร้อยแล้ว',
      rejected: 'ไม่สามารถดำเนินการได้',
    };

    const updatedTimeline = [
      ...editingTicket.timeline,
      {
        status: modalStatus,
        timestamp: nowStr,
        remark: modalRemark.trim() || defaultRemarkMap[modalStatus],
        updatedBy: modalStaff.trim() || 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์',
      },
    ];

    const updated: Ticket = {
      ...editingTicket,
      status: modalStatus,
      department: modalDept || editingTicket.department,
      assignedStaff: modalStaff || editingTicket.assignedStaff,
      repairPhotoUrl: modalRepairPhoto || editingTicket.repairPhotoUrl,
      updatedAt: nowStr,
      updated_at: nowStr,
      timeline: updatedTimeline,
    };

    onUpdateTicket(updated);
    setEditingTicket(null);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'reported':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            {lang === 'th' ? 'รับเรื่องแล้ว' : 'Reported'}
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
            {lang === 'th' ? 'กำลังตรวจสอบ' : 'Investigating'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            {lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            {lang === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            {lang === 'th' ? 'ไม่สามารถดำเนินการได้' : 'Cannot Proceed'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-4">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl shadow-md border border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider block">
            {currentRole === 'admin' ? 'Administrator Workspace' : 'Staff Officer Workspace'}
          </span>
          <h2 className="text-xl font-black text-slate-900">
            {lang === 'th'
              ? 'ระบบจัดการสำหรับเจ้าหน้าที่ (PH Eco Alert Staff Portal)'
              : 'Staff Management Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'th'
              ? 'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น | จัดการสถานะและรายงานเหตุการณ์'
              : 'Faculty of Public Health, KKU | Manage reports and update statuses'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#16A085]" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resetData}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All' },
          { id: 'reported', labelTh: 'รับเรื่องแล้ว', labelEn: 'Reported' },
          { id: 'investigating', labelTh: 'กำลังตรวจสอบ', labelEn: 'Investigating' },
          { id: 'in_progress', labelTh: 'กำลังดำเนินการ', labelEn: 'In Progress' },
          { id: 'resolved', labelTh: 'เสร็จสิ้น', labelEn: 'Resolved' },
          { id: 'rejected', labelTh: 'ปฏิเสธ/ไม่สำเร็จ', labelEn: 'Rejected' },
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

      {/* Responsive Table */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Report ID</th>
                <th className="p-4">Category</th>
                <th className="p-4">Incident Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((tk) => (
                <tr key={tk.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-extrabold text-[#16A085]">{tk.id}</td>
                  <td className="p-4 capitalize font-semibold text-slate-600">{tk.category}</td>
                  <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{tk.title}</td>
                  <td className="p-4 max-w-xs truncate text-slate-500">
                    {tk.location.building || tk.location.faculty}
                  </td>
                  <td className="p-4">
                    {tk.isAnonymous ? (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {lang === 'th' ? 'ไม่เปิดเผยตัวตน' : 'Anonymous'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-700">
                        {tk.reporter_name || tk.reporter.name || 'ผู้แจ้งระบุตัวตน'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(tk.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openModal(tk)}
                        className="p-2 text-[#16A085] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title={lang === 'th' ? 'อัปเดตสถานะ' : 'Update Status'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentRole === 'admin' && onDeleteTicket && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                lang === 'th'
                                  ? 'คุณแน่ใจหรือไม่ที่จะลบรายงานนี้ออกจากระบบ?'
                                  : 'Are you sure you want to delete this report?'
                              )
                            ) {
                              onDeleteTicket(tk.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'th' ? 'จัดการรายงาน:' : 'Manage Report:'}{' '}
              <span className="text-[#16A085]">{editingTicket.id}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'th' ? 'สถานะการดำเนินงาน' : 'Status'}
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                >
                  <option value="reported">{lang === 'th' ? 'รับเรื่องแล้ว' : 'Reported'}</option>
                  <option value="investigating">
                    {lang === 'th' ? 'กำลังตรวจสอบ' : 'Investigating'}
                  </option>
                  <option value="in_progress">
                    {lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress'}
                  </option>
                  <option value="resolved">
                    {lang === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved'}
                  </option>
                  <option value="rejected">
                    {lang === 'th' ? 'ไม่สามารถดำเนินการได้' : 'Cannot Proceed'}
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'th' ? 'หน่วยงานผู้รับผิดชอบ' : 'Responsible Department'}
                </label>
                <input
                  type="text"
                  value={modalDept}
                  onChange={(e) => setModalDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'th' ? 'เจ้าหน้าที่ผู้รับผิดชอบ' : 'Assigned Staff'}
                </label>
                <input
                  type="text"
                  value={modalStaff}
                  onChange={(e) => setModalStaff(e.target.value)}
                  placeholder="เช่น เจ้าหน้าที่สุขาภิบาล คณะสาธารณสุขศาสตร์"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'th' ? 'บันทึกความคืบหน้า / รายละเอียด' : 'Action Remark'}
                </label>
                <textarea
                  rows={3}
                  value={modalRemark}
                  onChange={(e) => setModalRemark(e.target.value)}
                  placeholder={
                    lang === 'th'
                      ? 'บันทึกผลการตรวจสอบ หรือมาตรการแก้ไข...'
                      : 'Note on actions taken...'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'th' ? 'ภาพถ่ายหลังแก้ไข (Image URL)' : 'Resolution Photo URL'}
                </label>
                <input
                  type="text"
                  value={modalRepairPhoto}
                  onChange={(e) => setModalRepairPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingTicket(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2 text-xs font-bold bg-[#16A085] hover:bg-[#138a72] text-white rounded-xl shadow-md cursor-pointer"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
