import React, { useState, useEffect } from 'react';
import {
  Language,
  NotificationItem,
  ReportCategory,
  Ticket,
  UserProfile,
  UserRole,
} from './types';
import { INITIAL_NOTIFICATIONS, INITIAL_TICKETS, INITIAL_USER } from './seedData';
import { getTranslation } from './i18n';

import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ReportWizard } from './components/ReportWizard';
import { TicketTracker } from './components/TicketTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { StaffPortal } from './components/StaffPortal';
import { GoogleSyncPanel } from './components/GoogleSyncPanel';
import { NotificationModal } from './components/NotificationModal';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [lang, setLang] = useState<Language>('th');
  const [currentRole, setCurrentRole] = useState<UserRole>('guest');

  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('ph_eco_alert_tickets') || localStorage.getItem('usafe_envi_tickets');
    if (saved) {
      try {
        const parsed: Ticket[] = JSON.parse(saved);
        return parsed.filter((tk) => tk.id !== 'ENV-2026-000001');
      } catch (e) {
        console.warn('Failed to parse saved tickets:', e);
      }
    }
    return INITIAL_TICKETS;
  });

  const [activeTab, setActiveTab] = useState<
    'home' | 'report' | 'track' | 'dashboard' | 'staff'
  >('home');

  const [trackerSearchId, setTrackerSearchId] = useState<string>('');
  const [selectedReportCategory, setSelectedReportCategory] = useState<ReportCategory | undefined>(undefined);
  const [selectedReportSubProblemId, setSelectedReportSubProblemId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ph_eco_alert_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Initial fetch from server storage to merge server-persisted reports & LINE statuses
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reports) && data.reports.length > 0) {
          setTickets((prev) => {
            const map = new Map<string, Ticket>();
            prev.forEach((tk) => map.set(tk.id, tk));
            data.reports.forEach((tk: Ticket) => {
              const existing = map.get(tk.id);
              map.set(tk.id, { ...(existing || {}), ...tk });
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Could not sync initial tickets from server:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);

    // Add new notification
    const newNotif: NotificationItem = {
      id: `NTF-${Date.now().toString().slice(-4)}`,
      ticketId: newTicket.id,
      title: lang === 'th' ? `สร้าง Ticket ID: ${newTicket.id}` : `New Ticket ${newTicket.id}`,
      message: newTicket.title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      read: false,
      type: 'new_ticket',
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(
      lang === 'th'
        ? `สร้าง Ticket ID: ${newTicket.id} และบันทึกลง Google Sheets สำเร็จ`
        : `Ticket ${newTicket.id} created and synced to Google Sheets!`
    );
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((tk) => (tk.id === updatedTicket.id ? updatedTicket : tk))
    );

    // Add notification
    const notif: NotificationItem = {
      id: `NTF-${Date.now().toString().slice(-4)}`,
      ticketId: updatedTicket.id,
      title: lang === 'th' ? `อัปเดตสถานะ Ticket: ${updatedTicket.id}` : `Updated Ticket ${updatedTicket.id}`,
      message: `สถานะปัจจุบัน: ${updatedTicket.status.toUpperCase()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      read: false,
      type: 'status_changed',
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(
      lang === 'th'
        ? `อัปเดต Ticket ${updatedTicket.id} เป็นสถานะ ${updatedTicket.status}`
        : `Updated Ticket ${updatedTicket.id} to ${updatedTicket.status}`
    );
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    showToast(lang === 'th' ? `ลบ Ticket ${ticketId} ออกจากระบบแล้ว` : `Deleted ticket ${ticketId}`);
  };

  const handleResetData = () => {
    setTickets(INITIAL_TICKETS);
    localStorage.removeItem('ph_eco_alert_tickets');
    localStorage.removeItem('usafe_envi_tickets');
    showToast(lang === 'th' ? 'รีเซ็ตข้อมูลระบบเป็นค่าเริ่มต้นเรียบร้อย' : 'System data reset to initial seed state');
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser((prev) => ({ ...prev, role }));
    showToast(
      lang === 'th'
        ? `สลับบทบาทผู้ใช้เป็น: ${role.toUpperCase()}`
        : `Switched user role to: ${role.toUpperCase()}`
    );
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    showToast(
      lang === 'th'
        ? `ยินดีต้อนรับ ${user.name}`
        : `Welcome back, ${user.name}`
    );
  };

  const handleOpenReportWithCategory = (cat?: ReportCategory, subIdOrCode?: string) => {
    setSelectedReportCategory(cat);
    setSelectedReportSubProblemId(subIdOrCode);
    setActiveTab('report');
  };

  const handleNavigateToTrack = (ticketId: string) => {
    setTrackerSearchId(ticketId);
    setActiveTab('track');
  };

  const t = getTranslation(lang);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-['Noto_Sans_Thai','Plus_Jakarta_Sans',sans-serif] selection:bg-[#16A085] selection:text-white">
      {/* PWA Install Banner */}
      <PWAInstallBanner lang={lang} />

      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onDismiss={() => setShowSplash(false)} lang={lang} />
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'report') {
            setSelectedReportCategory(undefined);
            setSelectedReportSubProblemId(undefined);
          }
          setActiveTab(tab);
        }}
        lang={lang}
        onLanguageChange={setLang}
        userRole={currentRole}
        userProfile={currentUser}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenReportModal={() => {
          setSelectedReportCategory(undefined);
          setSelectedReportSubProblemId(undefined);
          setActiveTab('report');
        }}
        onStaffLogout={() => {
          setCurrentRole('guest');
          setCurrentUser(prev => ({ ...prev, role: 'guest' }));
          showToast(lang === 'th' ? 'ออกจากระบบเจ้าหน้าที่เรียบร้อยแล้ว' : 'Logged out of Staff Portal');
        }}
      />

      {/* Emergency Contacts Modal */}
      <EmergencyContactsModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        lang={lang}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        lang={lang}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onSelectTicket={handleNavigateToTrack}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Content */}
      <main className="flex-1 px-4 md:px-6 pb-24 md:pb-12 pt-4 max-w-7xl mx-auto w-full">
        {activeTab === 'home' && (
          <HomeView
            lang={lang}
            tickets={tickets}
            onOpenReportWizard={handleOpenReportWithCategory}
            onNavigateToTrack={handleNavigateToTrack}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onDeleteTicket={handleDeleteTicket}
          />
        )}

        {activeTab === 'report' && (
          <ReportWizard
            lang={lang}
            currentUser={currentUser}
            initialCategory={selectedReportCategory}
            initialSubProblemId={selectedReportSubProblemId}
            onSubmitReport={handleAddTicket}
            onNavigateToTrack={handleNavigateToTrack}
            onCancel={() => {
              setSelectedReportCategory(undefined);
              setSelectedReportSubProblemId(undefined);
              setActiveTab('home');
            }}
          />
        )}

        {activeTab === 'track' && (
          <TicketTracker
            tickets={tickets}
            initialSearchId={trackerSearchId}
            lang={lang}
            currentRole={currentRole}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <AnalyticsDashboard tickets={tickets} lang={lang} />

            {/* Google Sheets & Apps Script Sync Status */}
            <GoogleSyncPanel lang={lang} tickets={tickets} />

            {(currentRole === 'staff' || currentRole === 'admin') ? (
              <StaffDashboard
                tickets={tickets}
                lang={lang}
                currentRole={currentRole}
                onUpdateTicket={handleUpdateTicket}
                onDeleteTicket={handleDeleteTicket}
                onResetData={handleResetData}
              />
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {lang === 'th'
                      ? 'เจ้าหน้าที่คณะสาธารณสุขศาสตร์ (Staff Workspace)'
                      : 'Faculty Staff & Admin Access'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'th'
                      ? 'เข้าสู่ระบบ Staff Portal เพื่อปรับปรุงสถานะการแก้ไข บันทึกข้อความการดำเนินงาน แนบรูปภาพ หรือจัดการรายงาน'
                      : 'Access the Staff Portal to manage reports, update action status, attach photos, and audit logs.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('staff')}
                  className="px-5 py-2.5 bg-[#16A085] hover:bg-[#138a72] text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  {lang === 'th' ? 'ไปยังหน้าสำหรับเจ้าหน้าที่' : 'Go to Staff Portal'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
          <StaffPortal
            lang={lang}
            tickets={tickets}
            currentRole={currentRole}
            onStaffLogin={(role, staffName) => {
              setCurrentRole(role);
              setCurrentUser((prev) => ({ ...prev, role, name: staffName || prev.name }));
              showToast(
                lang === 'th'
                  ? `ยืนยันสิทธิ์เจ้าหน้าที่สำเร็จ: ${
                      role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่สิ่งแวดล้อม'
                    }`
                  : `Staff Authorized: ${role.toUpperCase()}`
              );
            }}
            onStaffLogout={() => {
              setCurrentRole('guest');
              setCurrentUser((prev) => ({ ...prev, role: 'guest' }));
              showToast(lang === 'th' ? 'ออกจากระบบเจ้าหน้าที่แล้ว' : 'Logged out of Staff Portal');
            }}
            onAuthorize={(role) => {
              setCurrentRole(role);
              setCurrentUser((prev) => ({ ...prev, role }));
              showToast(
                lang === 'th'
                  ? `ยืนยันสิทธิ์เจ้าหน้าที่สำเร็จ: ${
                      role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่สิ่งแวดล้อม'
                    }`
                  : `Staff Authorized: ${role.toUpperCase()}`
              );
            }}
            onDeauthorize={() => {
              setCurrentRole('guest');
              setCurrentUser((prev) => ({ ...prev, role: 'guest' }));
              showToast(lang === 'th' ? 'ออกจากระบบเจ้าหน้าที่แล้ว' : 'Logged out of Staff Portal');
            }}
            onUpdateTicket={handleUpdateTicket}
            onDeleteTicket={handleDeleteTicket}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © 2026 <strong>{t.appName}</strong> - {t.appFullName}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Progressive Web App (PWA)</span>
            <span>•</span>
            <span>Google Apps Script + Sheets DB</span>
            <span>•</span>
            <span className="text-[#16A085] font-semibold">Google AI Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

