import React from 'react';
import { Bell, Check, Trash2, X, ExternalLink, Clock } from 'lucide-react';
import { Language, NotificationItem } from '../types';
import { getTranslation } from '../i18n';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  lang,
  notifications,
  onMarkAllRead,
  onSelectTicket,
}) => {
  const t = getTranslation(lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#16A085]" />
            <h3 className="text-sm font-bold text-slate-800">{t.notificationsTitle}</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#16A085] text-white rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#16A085] hover:underline flex items-center gap-1 font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              {t.markAllRead}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectTicket(item.ticketId);
                  onClose();
                }}
                className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors space-y-1 ${
                  !item.read ? 'bg-emerald-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-[#16A085]" />}
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp.split(' ')[1] || item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{item.message}</p>
                <div className="pt-1 flex justify-end">
                  <span className="text-[10px] text-[#16A085] font-semibold flex items-center gap-0.5 hover:underline">
                    View Ticket <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
