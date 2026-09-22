import React, { useState } from 'react';
import {
  Droplets,
  Wind,
  Volume2,
  Biohazard,
  Trash2,
  Bug,
  HelpCircle,
  Wrench,
  Car,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Language, ReportCategory, Ticket } from '../types';
import { getTranslation } from '../i18n';
import { KKU_EMERGENCY_CONTACTS } from '../constants/emergencyContacts';
import { EmergencyContactsModal } from './EmergencyContactsModal';
import { IntroVideoPlayer } from './IntroVideoPlayer';
import {
  ENVIRONMENTAL_CATEGORIES,
  EnvironmentalCategoryConfig,
} from '../constants/categories';

interface HomeViewProps {
  lang: Language;
  tickets: Ticket[];
  onOpenReportWizard: (cat?: ReportCategory, subIdOrCode?: string) => void;
  onNavigateToTrack: (ticketId: string) => void;
  onNavigateToDashboard: () => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  tickets,
  onOpenReportWizard,
  onNavigateToTrack,
  onNavigateToDashboard,
  onDeleteTicket,
}) => {
  const t = getTranslation(lang);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('infrastructure_utilities');
  const [navigatingSubId, setNavigatingSubId] = useState<string | null>(null);

  const getCategoryIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'wrench':
        return <Wrench className={className} />;
      case 'car':
        return <Car className={className} />;
      case 'droplets':
        return <Droplets className={className} />;
      case 'wind':
        return <Wind className={className} />;
      case 'volume2':
        return <Volume2 className={className} />;
      case 'biohazard':
        return <Biohazard className={className} />;
      case 'trash2':
        return <Trash2 className={className} />;
      case 'bug':
        return <Bug className={className} />;
      default:
        return <HelpCircle className={className} />;
    }
  };

  const handleSelectSubcategory = (catId: ReportCategory, subIdOrCode: string) => {
    setNavigatingSubId(subIdOrCode);
    setTimeout(() => {
      onOpenReportWizard(catId, subIdOrCode);
      setNavigatingSubId(null);
    }, 150);
  };

  const activeCategoryConfig =
    ENVIRONMENTAL_CATEGORIES.find((c) => c.id === selectedCategory) ||
    ENVIRONMENTAL_CATEGORIES[0];

  const totalReports = tickets.length;
  const resolvedReports = tickets.filter((tk) => tk.status === 'resolved').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-4">
      {/* Hero Banner with Quick Actions */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#16A085] via-[#138a72] to-[#2ECC71] text-white p-6 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'th'
                ? '🌿 PH Eco Alert | คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น'
                : '🌿 PH Eco Alert | Faculty of Public Health, Khon Kaen University'}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
            {lang === 'th' ? (
              <>
                ร่วมสร้างสิ่งแวดล้อมที่ปลอดภัย
                <br />
                และน่าอยู่ คณะสาธารณสุขศาสตร์ มข.
              </>
            ) : (
              'Empowering a safe & healthy environment at Faculty of Public Health, KKU'
            )}
          </h1>

          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed max-w-lg">
            {lang === 'th'
              ? 'แจ้งเหตุการณ์ด้านสิ่งแวดล้อม น้ำ อากาศ ขยะ เสียง สารเคมี หรือสัตว์มีพิษ ได้ง่ายและรวดเร็ว ไม่จำเป็นต้องเข้าสู่ระบบ พร้อมระบบรักษาความเป็นส่วนตัว'
              : 'Report environmental incidents across water, air, waste, noise, odors, or hazard risks with ease. No login required, anonymous reporting supported.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenReportWizard()}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs md:text-sm font-extrabold text-[#16A085] bg-white hover:bg-emerald-50 rounded-2xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span>{t.quickReport}</span>
            </button>

            <button
              onClick={() => onNavigateToTrack('')}
              className="inline-flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold text-white bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-sm transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{lang === 'th' ? 'ติดตามสถานะการแจ้งเหตุ' : 'Track Incident Reports'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intro Video Player - Centered, max-w-[500px], permanent view-only */}
      <IntroVideoPlayer lang={lang} />

      {/* Categories & Subcategories Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div>
            <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{lang === 'th' ? 'หมวดหมู่การแจ้งเหตุสิ่งแวดล้อม' : 'Incident Categories'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'เลือกประเภทเพื่อแจ้งเหตุทันที หรือแตะประเภทย่อยเพื่อเปิดแบบฟอร์มพร้อมบันทึกประเภทโดยอัตโนมัติ'
                : 'Select a category or tap any subcategory to jump directly to reporting'}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            {lang === 'th' ? '⚡ ทางลัดแจ้งเหตุด่วน' : '⚡ Quick Report Shortcut'}
          </span>
        </div>

        {/* Primary Categories Grid/Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ENVIRONMENTAL_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative ${
                  isSelected
                    ? `${cat.activeBorder} ${cat.activeBg} shadow-sm ring-2 ring-emerald-500/20`
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 transition-transform ${
                    isSelected ? `${cat.badgeBg} ${cat.badgeColor} scale-105` : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getCategoryIcon(cat.iconName, 'w-5 h-5')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-xs md:text-sm font-bold truncate ${
                      isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                    }`}
                  >
                    {lang === 'th' ? cat.name : cat.nameEn}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {cat.subcategories.length}{' '}
                    {lang === 'th' ? 'ประเภทย่อย' : 'subcategories'}
                  </p>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Category & Subcategories Details Container */}
        <div
          className={`p-4 md:p-6 rounded-3xl border ${activeCategoryConfig.activeBorder} ${activeCategoryConfig.activeBg} transition-all duration-200 space-y-4 shadow-sm`}
        >
          {/* Active Category Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl bg-white shadow-xs ${activeCategoryConfig.badgeColor}`}
              >
                {getCategoryIcon(activeCategoryConfig.iconName, 'w-6 h-6')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                    {lang === 'th' ? activeCategoryConfig.name : activeCategoryConfig.nameEn}
                  </h3>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/80 text-slate-600 border border-slate-200">
                    {lang === 'th' ? activeCategoryConfig.nameEn : activeCategoryConfig.name}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {lang === 'th' ? activeCategoryConfig.descTh : activeCategoryConfig.descEn}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenReportWizard(activeCategoryConfig.id)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer self-start md:self-auto shrink-0"
            >
              <span>{lang === 'th' ? 'แจ้งเหตุทั่วไปในหมวดนี้' : 'General Report in this category'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Subcategories Section Header */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {lang === 'th'
                  ? 'แตะประเภทย่อยเพื่อแจ้งเหตุทันที (Fast Action):'
                  : 'Tap a subcategory to report immediately:'}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {lang === 'th'
                  ? 'ระบบจะเลือกหมวดหมู่ให้โดยอัตโนมัติในหน้าแจ้งเหตุ'
                  : 'Pre-filled automatically in report form'}
              </span>
            </div>

            {/* Subcategories Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategoryConfig.subcategories.map((sub) => {
                const isNavigating = navigatingSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    disabled={isNavigating}
                    onClick={() => handleSelectSubcategory(activeCategoryConfig.id, sub.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] bg-white hover:bg-emerald-50/40 hover:border-emerald-400 group shadow-xs hover:shadow-md relative transform active:scale-[0.98] ${
                      isNavigating ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {lang === 'th' ? sub.name : sub.nameEn}
                        </h4>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                          {lang === 'th' ? sub.nameEn : sub.name}
                        </span>
                      </div>

                      {sub.exampleTh && (
                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {lang === 'th' ? sub.exampleTh : sub.exampleEn || sub.exampleTh}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
                        {isNavigating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                            <span>{lang === 'th' ? 'กำลังเปิดหน้าแจ้งเหตุ...' : 'Opening report form...'}</span>
                          </>
                        ) : (
                          <>
                            <span>{lang === 'th' ? 'แจ้งเหตุประเภทนี้' : 'Report this issue'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Emergency Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Resolved Box */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalReports}</span>
            <h3 className="text-2xl font-extrabold text-[#16A085] mt-1">{totalReports} รายการ</h3>
            <span className="text-xs text-emerald-600 font-semibold mt-1 block">
              ✓ {resolvedReports} {t.statusResolved}
            </span>
          </div>
          <div className="p-3 bg-emerald-100 text-[#16A085] rounded-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        {/* Avg Resolution Speed */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.avgResolutionTime}</span>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">&lt; 24 {t.hours}</h3>
            <span className="text-xs text-blue-600 font-semibold mt-1 block">
              {lang === 'th' ? 'การตอบสนองรวดเร็ว' : 'High efficiency response'}
            </span>
          </div>
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Clock className="w-8 h-8" />
          </div>
        </div>

        {/* Emergency Hotline Summary Box */}
        <div className="p-5 bg-gradient-to-br from-rose-50 to-red-50/70 border border-rose-200 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                🚨 {t.emergencyTitle}
              </span>
              <h3 className="text-xl font-extrabold text-rose-700 mt-0.5">043-202-111</h3>
              <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                {lang === 'th' ? 'รปภ. มข. แจ้งเหตุด่วน 24 ชม.' : 'KKU Security Control 24/7'}
              </p>
            </div>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="p-3 bg-rose-600 text-white rounded-2xl shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
              title="View all 5 emergency numbers"
            >
              <PhoneCall className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium text-[11px]">
              {lang === 'th' ? 'มีเบอร์ฉุกเฉิน มข. 5 หน่วยงาน' : '5 Official Emergency Units'}
            </span>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="font-bold text-rose-700 hover:text-rose-900 underline text-[11px] cursor-pointer"
            >
              {lang === 'th' ? 'ดูเบอร์ทั้งหมด' : 'View All Hotlines'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Official KKU Emergency Hotline Quick Cards */}
      <div className="p-6 bg-white rounded-3xl shadow-md border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">🚨</span>
              <span>{lang === 'th' ? 'เบอร์โทรฉุกเฉิน มหาวิทยาลัยขอนแก่น (KKU Emergency Numbers)' : 'Official KKU Emergency Contacts'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th' ? 'แตะปุ่มโทรออกเพื่อติดต่อหน่วยงานช่วยเหลือได้ทันที 24 ชม.' : 'Tap any number to call emergency teams immediately.'}
            </p>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            {lang === 'th' ? 'ดูรายละเอียดทั้งหมด' : 'Full Directory'} &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {KKU_EMERGENCY_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">
                    {lang === 'th' ? contact.titleTh : contact.titleEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {lang === 'th' ? contact.descTh : contact.descEn}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                {contact.phoneNumbers.map((phone, pIdx) => (
                  <a
                    key={pIdx}
                    href={`tel:${phone.tel}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-extrabold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3 h-3 text-rose-600" />
                    <span>{phone.display}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Modal Component */}
      <EmergencyContactsModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        lang={lang}
      />

      {/* Latest Reports Activity Stream */}
      <div className="p-6 bg-white rounded-3xl shadow-md border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {lang === 'th' ? 'รายการแจ้งเหตุล่าสุด คณะสาธารณสุขศาสตร์' : 'Recent Incident Reports'}
          </h2>
          <button
            onClick={() => onNavigateToTrack('')}
            className="text-xs font-bold text-[#16A085] hover:underline cursor-pointer"
          >
            {lang === 'th' ? 'ดูทั้งหมด' : 'View All'} →
          </button>
        </div>

        <div className="space-y-3">
          {tickets.slice(0, 4).map((tk) => (
            <div
              key={tk.id}
              onClick={() => onNavigateToTrack(tk.id)}
              className="p-4 rounded-2xl border border-slate-200 hover:border-[#16A085] bg-slate-50/50 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#16A085]">{tk.id}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    {tk.category}
                  </span>
                  <span className="text-[11px] text-slate-400">• {tk.createdAt.substring(0, 10)}</span>
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 line-clamp-1">
                  {tk.title}
                </h3>
                <p className="text-xs text-slate-500">📍 {tk.location.faculty}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    tk.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tk.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : tk.status === 'investigating'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tk.status === 'resolved' && (lang === 'th' ? 'ดำเนินการเสร็จสิ้น' : 'Resolved')}
                  {tk.status === 'in_progress' && (lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress')}
                  {tk.status === 'investigating' && (lang === 'th' ? 'กำลังตรวจสอบ' : 'Investigating')}
                  {tk.status === 'reported' && (lang === 'th' ? 'รับเรื่องแล้ว' : 'Reported')}
                  {tk.status === 'rejected' && (lang === 'th' ? 'ไม่สามารถดำเนินการได้' : 'Cannot Proceed')}
                </span>

                {onDeleteTicket && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(lang === 'th' ? `คุณต้องการลบ Ticket ${tk.id} ใช่หรือไม่?` : `Are you sure you want to delete Ticket ${tk.id}?`)) {
                        onDeleteTicket(tk.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title={lang === 'th' ? 'ลบรายงานนี้' : 'Delete this report'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
