import React from 'react';
import {
  X,
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Droplets,
  Flame,
  HelpCircle,
  Clock,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { KKU_EMERGENCY_CONTACTS, EmergencyContact } from '../constants/emergencyContacts';
import { Language } from '../types';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: EmergencyContact['iconType']) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'environment':
        return <Droplets className="w-5 h-5 text-emerald-600" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'complain':
        return <HelpCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold leading-tight">
                {lang === 'th'
                  ? 'เบอร์โทรฉุกเฉิน มหาวิทยาลัยขอนแก่น'
                  : 'KKU Official Emergency Contacts'}
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                {lang === 'th'
                  ? 'โทรตรงหน่วยงานช่วยเหลือฉุกเฉินและบริการ มข.'
                  : 'Direct Hotline & Campus Emergency Assistance'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contacts List */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 divide-y divide-slate-100">
          {KKU_EMERGENCY_CONTACTS.map((item, index) => (
            <div
              key={item.id}
              className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
                index === 0
                  ? 'bg-rose-50/70 border border-rose-200'
                  : index === 1
                  ? 'bg-red-50/70 border border-red-200'
                  : 'bg-slate-50/70 border border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg shadow-xs">{getIcon(item.iconType)}</div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {lang === 'th' ? item.titleTh : item.titleEn}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 pl-8">
                  {lang === 'th' ? item.descTh : item.descEn}
                </p>

                <div className="flex items-center gap-1.5 pl-8 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {lang === 'th' ? `เวลาทำการ: ${item.availableHours}` : `Hours: ${item.availableHours}`}
                  </span>
                </div>
              </div>

              {/* Phone Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 sm:items-end">
                {item.phoneNumbers.map((phone, pIdx) => (
                  <a
                    key={pIdx}
                    href={`tel:${phone.tel}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{phone.display}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            {lang === 'th'
              ? '💡 สำหรับเหตุฉุกเฉินเร่งด่วน โทร 043-202-111 ทันที'
              : '💡 For urgent security emergencies, call 043-202-111 immediately.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
