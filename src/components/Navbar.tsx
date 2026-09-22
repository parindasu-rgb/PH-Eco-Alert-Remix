import React from 'react';
import {
  Home,
  PlusCircle,
  Search,
  BarChart2,
  Shield,
  Leaf,
  Globe,
  Plus,
  Bell,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { Language, UserRole, UserProfile } from '../types';
import { getTranslation } from '../i18n';

interface NavbarProps {
  activeTab: 'home' | 'report' | 'track' | 'dashboard' | 'staff';
  onSelectTab: (tab: 'home' | 'report' | 'track' | 'dashboard' | 'staff') => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  userProfile?: UserProfile;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenReportModal: () => void;
  onOpenEmergencyModal?: () => void;
  onStaffLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onLanguageChange,
  userRole,
  userProfile,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenReportModal,
  onOpenEmergencyModal,
  onStaffLogout,
}) => {
  const t = getTranslation(lang);
  const isStaffActive = userRole === 'staff' || userRole === 'admin';

  const navItems = [
    { id: 'home', label: t.navHome, icon: <Home className="w-5 h-5" /> },
    { id: 'report', label: t.navReport, icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'track', label: t.navTrack, icon: <Search className="w-5 h-5" /> },
    { id: 'dashboard', label: t.navDashboard, icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'staff', label: t.navStaff, icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#16A085] to-[#2ECC71] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-slate-900 tracking-tight block leading-tight">
                PH Eco <span className="text-[#16A085]">Alert</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                {lang === 'th' ? 'คณะสาธารณสุขศาสตร์ มข.' : 'Faculty of Public Health KKU'}
              </span>
            </div>
          </button>

          {/* Desktop Menu Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white text-[#16A085] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2">
            {/* Emergency SOS Hotline Button */}
            {onOpenEmergencyModal && (
              <button
                onClick={onOpenEmergencyModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 rounded-xl shadow-xs transition-all cursor-pointer animate-pulse hover:animate-none"
                title={lang === 'th' ? 'เบอร์โทรฉุกเฉิน มข.' : 'KKU Emergency Hotlines'}
              >
                <span className="text-[10px]">🚨</span>
                <span className="hidden sm:inline">{lang === 'th' ? 'ฉุกเฉิน' : 'SOS'}</span>
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-[#16A085] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onLanguageChange(lang === 'th' ? 'en' : 'th')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#16A085]" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* Staff Status Indicator / Portal Link (Requirement 2 & 4: No general user login) */}
            {isStaffActive ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectTab('staff')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer"
                  title="Staff Portal Active"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold hidden sm:inline">
                    {userRole === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </button>
                {onStaffLogout && (
                  <button
                    onClick={onStaffLogout}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={lang === 'th' ? 'ออกจากระบบเจ้าหน้าที่' : 'Logout Staff'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onSelectTab('staff')}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title={lang === 'th' ? 'สำหรับเจ้าหน้าที่ (Staff Portal)' : 'Staff Portal'}
              >
                <Shield className="w-3.5 h-3.5 text-[#16A085]" />
                <span className="text-[11px]">{t.navStaff}</span>
              </button>
            )}

            {/* Quick Report Header CTA */}
            <button
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.quickReport}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 shadow-2xl flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer ${
                isActive ? 'text-[#16A085] font-bold scale-105' : 'text-slate-500 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-100 text-[#16A085]' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Floating Report FAB (Mobile Only) */}
      <button
        onClick={onOpenReportModal}
        className="md:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#16A085] to-[#2ECC71] text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform border-2 border-white"
        aria-label="Report Incident"
      >
        <Plus className="w-7 h-7" />
      </button>
    </>
  );
};

