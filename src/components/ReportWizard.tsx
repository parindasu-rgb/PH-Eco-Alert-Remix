import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Camera,
  Shield,
  Copy,
  Check,
  Building,
  User,
  Phone,
  AlertTriangle,
  FileText,
  Lock,
  EyeOff,
  UserCheck,
  Compass,
} from 'lucide-react';

import {
  Language,
  ReportCategory,
  ReporterType,
  SubProblemOption,
  Ticket,
  UserProfile,
} from '../types';
import { getTranslation } from '../i18n';
import {
  FACULTY_PH_CENTER,
  FACULTY_PH_SPOTS,
  GEOFENCE_ERROR_MESSAGE,
  isInsideFacultyOfPublicHealth,
  PublicHealthSpot,
} from '../utils/geofence';
import { getSubProblemsForCategory, findSubProblemById } from '../subProblems';
import {
  ENVIRONMENTAL_CATEGORIES,
  resolveCategoryAndSubcategory,
} from '../constants/categories';
import { MapPicker } from './MapPicker';
import { PhotoUpload } from './PhotoUpload';

type WizardSubStep = 'details' | 'reporter' | 'location' | 'review';

interface ReportWizardProps {
  lang: Language;
  currentUser?: UserProfile;
  initialCategory?: ReportCategory;
  initialSubProblemId?: string;
  initialSubcategory?: string;
  onSubmitReport: (newTicket: Ticket) => void;
  onNavigateToTrack: (ticketId: string) => void;
  onCancel: () => void;
}

export const ReportWizard: React.FC<ReportWizardProps> = ({
  lang,
  currentUser,
  initialCategory,
  initialSubProblemId,
  initialSubcategory,
  onSubmitReport,
  onNavigateToTrack,
  onCancel,
}) => {
  const t = getTranslation(lang);

  // Sub-step management (No step numbers, using semantic sub-pages)
  const [subStep, setSubStep] = useState<WizardSubStep>('details');
  const [copied, setCopied] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolve initial category & subcategory from props if supplied from Home page
  const initialResolved = resolveCategoryAndSubcategory(
    initialCategory,
    initialSubProblemId || initialSubcategory
  );

  // 1. Incident Details State
  const [category, setCategory] = useState<ReportCategory>(initialResolved.category);
  const [subProblems, setSubProblems] = useState<SubProblemOption[]>(() =>
    getSubProblemsForCategory(initialResolved.category)
  );
  const [selectedSubProblemId, setSelectedSubProblemId] = useState<string>(() => {
    return (
      initialResolved.subProblemId ||
      (getSubProblemsForCategory(initialResolved.category)[0]?.id || '')
    );
  });
  const [customProblemText, setCustomProblemText] = useState<string>('');
  const [incidentTitle, setIncidentTitle] = useState<string>('');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);

  // Sync if initial props change (e.g. user chooses a different category from home)
  useEffect(() => {
    if (initialCategory || initialSubProblemId || initialSubcategory) {
      const res = resolveCategoryAndSubcategory(
        initialCategory,
        initialSubProblemId || initialSubcategory
      );
      setCategory(res.category);
      if (res.subProblemId) {
        setSelectedSubProblemId(res.subProblemId);
      }
    }
  }, [initialCategory, initialSubProblemId, initialSubcategory]);

  // 2. Reporter Information & Privacy State
  const [reporterType, setReporterType] = useState<ReporterType>('student');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>(currentUser?.name || '');
  const [reporterPhone, setReporterPhone] = useState<string>(currentUser?.phone || '');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  // 3. Location State (Restricted to Faculty of Public Health, KKU)
  const facultyName =
    lang === 'th'
      ? 'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น'
      : 'Faculty of Public Health, Khon Kaen University';
  const [selectedSpotId, setSelectedSpotId] = useState<string>(FACULTY_PH_SPOTS[0].id);
  const [buildingName, setBuildingName] = useState<string>(
    lang === 'th' ? FACULTY_PH_SPOTS[0].nameTh : FACULTY_PH_SPOTS[0].nameEn
  );
  const [locationType, setLocationType] = useState<string>(
    FACULTY_PH_SPOTS[0].locationType || 'building'
  );
  const [roomDetails, setRoomDetails] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(FACULTY_PH_SPOTS[0].lat);
  const [longitude, setLongitude] = useState<number>(FACULTY_PH_SPOTS[0].lng);
  const [isLocationInsideBoundary, setIsLocationInsideBoundary] = useState<boolean>(true);

  // Form Validation Errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sync sub-problems when category changes
  useEffect(() => {
    const list = getSubProblemsForCategory(category);
    setSubProblems(list);
    if (!list.some((item) => item.id === selectedSubProblemId)) {
      setSelectedSubProblemId(list.length > 0 ? list[0].id : '');
    }
  }, [category]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'wrench':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-indigo-600" />;
      case 'droplets':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'wind':
        return <Wind className="w-5 h-5 text-sky-500" />;
      case 'volume2':
        return <Volume2 className="w-5 h-5 text-amber-500" />;
      case 'biohazard':
        return <Biohazard className="w-5 h-5 text-purple-500" />;
      case 'trash2':
        return <Trash2 className="w-5 h-5 text-emerald-500" />;
      case 'bug':
        return <Bug className="w-5 h-5 text-rose-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const categoriesConfig = ENVIRONMENTAL_CATEGORIES.map((cat) => ({
    id: cat.id,
    titleTh: cat.name,
    titleEn: cat.nameEn,
    descTh: cat.descTh,
    descEn: cat.descEn,
    icon: getCategoryIcon(cat.iconName),
    color: `${cat.activeBorder} ${cat.activeBg}`,
  }));

  const handleSpotSelect = (spotId: string) => {
    const spot = FACULTY_PH_SPOTS.find((s) => s.id === spotId);
    if (spot) {
      setSelectedSpotId(spot.id);
      setBuildingName(lang === 'th' ? spot.nameTh : spot.nameEn);
      setLatitude(spot.lat);
      setLongitude(spot.lng);
      setIsLocationInsideBoundary(true);
    }
  };

  // Phone number validation helper (Thai mobile format: 9-10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanDigits = phone.replace(/[\s\-]/g, '');
    return /^0\d{8,9}$/.test(cleanDigits);
  };

  // Sub-step Validation
  const validateDetailsSubStep = (): boolean => {
    const errors: Record<string, string> = {};
    const selectedSub = findSubProblemById(selectedSubProblemId);

    if (selectedSub?.requiresCustomInput && !customProblemText.trim()) {
      errors.customProblem =
        lang === 'th' ? 'กรุณาระบุรายละเอียดปัญหาเพิ่มเติม' : 'Please specify the problem detail';
    }

    if (!incidentDescription.trim() && !incidentTitle.trim()) {
      errors.description =
        lang === 'th'
          ? 'กรุณาระบุรายละเอียดของเหตุการณ์พอสังเขป'
          : 'Please provide brief details of the incident';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateReporterSubStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (!privacyConsent) {
      errors.consent =
        lang === 'th'
          ? 'กรุณายินยอมเงื่อนไขนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ'
          : 'Please accept the privacy policy consent to proceed';
    }

    if (!isAnonymous) {
      if (!reporterName.trim()) {
        errors.name =
          lang === 'th' ? 'กรุณาระบุชื่อผู้แจ้งเหตุ' : 'Please provide reporter name';
      }

      if (!reporterPhone.trim()) {
        errors.phone =
          lang === 'th' ? 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ' : 'Please provide contact phone number';
      } else if (!validatePhoneNumber(reporterPhone)) {
        errors.phone =
          lang === 'th'
            ? 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 081-234-5678)'
            : 'Invalid phone number format (e.g. 081-234-5678)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLocationSubStep = (): boolean => {
    const errors: Record<string, string> = {};

    const inside = isInsideFacultyOfPublicHealth(latitude, longitude);
    setIsLocationInsideBoundary(inside);

    if (!inside) {
      errors.location = GEOFENCE_ERROR_MESSAGE[lang];
    }

    setValidationErrors(errors);
    return inside;
  };

  // Navigation between sub-steps
  const handleNextFromDetails = () => {
    if (validateDetailsSubStep()) {
      setSubStep('reporter');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFromReporter = () => {
    if (validateReporterSubStep()) {
      setSubStep('location');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFromLocation = () => {
    if (validateLocationSubStep()) {
      setSubStep('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submission
  const handleSubmitReport = async () => {
    setIsSubmitting(true);

    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19);
    // Generate Report ID with Public Health Eco format: PHE-YYYY-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reportId = `PHE-2026-${randomSuffix}`;

    const selectedSub = findSubProblemById(selectedSubProblemId);
    const computedTitle =
      incidentTitle.trim() ||
      (selectedSub
        ? lang === 'th'
          ? selectedSub.nameTh
          : selectedSub.nameEn
        : customProblemText || 'Environmental Incident');

    let envCategory: string = category;
    let envSubcategory: string = '';

    if (category === 'infrastructure_utilities') {
      envCategory = 'infrastructure_utilities';
      if (selectedSubProblemId === 'infrastructure-building-damage') {
        envSubcategory = 'building_damage';
      } else if (selectedSubProblemId === 'infrastructure-electrical-system') {
        envSubcategory = 'electrical_system';
      } else if (selectedSubProblemId === 'infrastructure-drainage-system') {
        envSubcategory = 'drainage_system';
      } else {
        envSubcategory = selectedSubProblemId;
      }
    } else if (category === 'traffic') {
      envCategory = 'traffic';
      if (selectedSubProblemId === 'traffic-congestion') {
        envSubcategory = 'traffic_congestion';
      } else if (selectedSubProblemId === 'traffic-accident') {
        envSubcategory = 'accident';
      } else if (selectedSubProblemId === 'traffic-signal-system') {
        envSubcategory = 'traffic_signal_system';
      } else {
        envSubcategory = selectedSubProblemId;
      }
    } else {
      envCategory = category;
      envSubcategory = selectedSubProblemId;
    }

    const newTicket: Ticket = {
      id: reportId,
      report_id: reportId,
      category,
      incident_type: category,
      environmental_category: envCategory,
      environmental_subcategory: envSubcategory,
      title: computedTitle,
      description: incidentDescription.trim() || customProblemText || computedTitle,
      location: {
        faculty: facultyName,
        building: buildingName,
        location_id: selectedSpotId,
        location_name: buildingName,
        location_type: locationType,
        roomOrDetails: roomDetails.trim(),
        latitude,
        longitude,
      },
      location_id: selectedSpotId,
      location_address: `${buildingName} ${roomDetails ? `(${roomDetails})` : ''}, ${facultyName}`,
      location_name: buildingName,
      location_type: locationType,
      latitude,
      longitude,
      photoUrl: photoBase64,
      isAnonymous,
      is_anonymous: isAnonymous,
      reporterType,
      reporter_type: reporterType,
      privacyConsent,
      privacy_consent: privacyConsent,
      reporter: {
        name: isAnonymous ? 'ผู้แจ้งไม่ประสงค์ออกนาม (Anonymous)' : reporterName,
        phone: isAnonymous ? '' : reporterPhone,
        role: 'guest',
        reporterType,
        isAnonymous,
        privacyConsent,
      },
      reporter_name: isAnonymous ? 'ผู้แจ้งไม่ประสงค์ออกนาม' : reporterName,
      reporter_phone: isAnonymous ? '' : reporterPhone,
      status: 'reported',
      department: 'คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น',
      createdAt: timestampStr,
      created_at: timestampStr,
      updatedAt: timestampStr,
      updated_at: timestampStr,
      timeline: [
        {
          status: 'reported',
          timestamp: timestampStr,
          remark: isAnonymous
            ? 'บันทึกการแจ้งเหตุแบบไม่ระบุตัวตน (Anonymous)'
            : 'บันทึกการแจ้งเหตุเข้าสู่ระบบ PH Eco Alert',
          updatedBy: 'ระบบรับแจ้งเหตุ คณะสาธารณสุขศาสตร์',
        },
      ],
    };

    let finalTicket: Ticket = {
      ...newTicket,
      line_notification_status: 'pending',
    };

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.report) {
          finalTicket = {
            ...newTicket,
            ...data.report,
            line_notification_status:
              data.lineNotification?.status ||
              data.report?.line_notification_status ||
              'failed',
            line_notification_sent_at:
              data.lineNotification?.sentAt || data.report?.line_notification_sent_at,
            line_notification_error:
              data.lineNotification?.error || data.report?.line_notification_error,
          };
        }
      } else {
        console.warn('Backend returned non-OK status for report creation:', response.status);
      }
    } catch (apiErr) {
      console.warn('Backend API request error, proceeding with local fallback:', apiErr);
    }

    onSubmitReport(finalTicket);
    setSubmittedTicket(finalTicket);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Sub-pages breadcrumb items (semantic names without numbers)
  const subPages = [
    { key: 'details', labelTh: 'รายละเอียดเหตุการณ์', labelEn: 'Incident Details' },
    { key: 'reporter', labelTh: 'ข้อมูลผู้แจ้งเหตุและสิทธิ์ความเป็นส่วนตัว', labelEn: 'Reporter Info & Privacy' },
    { key: 'location', labelTh: 'ตำแหน่งเกิดเหตุ', labelEn: 'Incident Location' },
    { key: 'review', labelTh: 'ตรวจสอบและส่ง', labelEn: 'Review & Submit' },
  ];

  // Success Screen
  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#16A085] to-[#2ECC71] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            {lang === 'th' ? 'ส่งรายงานแจ้งเหตุสำเร็จเรียบร้อย!' : 'Incident Reported Successfully!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {lang === 'th'
              ? 'ข้อมูลของท่านถูกบันทึกเข้าสู่ระบบ PH Eco Alert คณะสาธารณสุขศาสตร์ มข. และเจ้าหน้าที่ได้รับเรื่องแล้ว'
              : 'Your report has been recorded in the PH Eco Alert system and dispatched to Faculty of Public Health staff.'}
          </p>
        </div>

        {/* Report ID Box */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-dashed border-[#16A085] max-w-md mx-auto space-y-2">
          <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider block">
            {lang === 'th' ? 'เลขที่แจ้งเหตุ (Report ID)' : 'Report ID'}
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 tracking-wider">
              {submittedTicket.id}
            </span>
            <button
              onClick={() => handleCopyTicket(submittedTicket.id)}
              className="p-2 bg-white rounded-xl border border-emerald-200 text-[#16A085] hover:bg-emerald-100/50 shadow-xs cursor-pointer transition-all"
              title="Copy Report ID"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            {lang === 'th'
              ? 'คุณสามารถใช้เลขที่แจ้งเหตุนี้ในการค้นหาและติดตามสถานะได้ตลอดเวลาโดยไม่ต้องเข้าสู่ระบบ'
              : 'You can use this Report ID to track progress anytime without logging in.'}
          </p>
        </div>

        {/* LINE OA Dispatch Status */}
        {submittedTicket.line_notification_status === 'sent' && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/90 px-4 py-2.5 rounded-2xl border border-emerald-200 max-w-md mx-auto shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {lang === 'th'
                ? 'ส่งการแจ้งเตือนไปยัง LINE OA เจ้าหน้าที่เรียบร้อยแล้ว'
                : 'Dispatched notification to Staff LINE Official Account'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
          <button
            onClick={() => onNavigateToTrack(submittedTicket.id)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>{lang === 'th' ? 'ติดตามสถานะการแจ้งเหตุ' : 'Track Report Status'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSubmittedTicket(null);
              setSubStep('details');
              setIncidentTitle('');
              setIncidentDescription('');
              setCustomProblemText('');
              setPhotoBase64(undefined);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
          >
            <span>{lang === 'th' ? 'แจ้งเหตุเพิ่มเติม' : 'Report Another Incident'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-4 space-y-6">
      {/* Sub-pages Navigation Header (NO STEP NUMBERS) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <span className="text-[11px] font-extrabold text-[#16A085] uppercase tracking-wider block">
              PH Eco Alert • Faculty of Public Health KKU
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {lang === 'th' ? 'แบบฟอร์มแจ้งเหตุการณ์สิ่งแวดล้อม' : 'Environmental Incident Report'}
            </h1>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
          </button>
        </div>

        {/* Semantic Sub-section Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {subPages.map((page) => {
            const isActive = subStep === page.key;
            return (
              <div
                key={page.key}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-[#16A085] text-white border-[#16A085] shadow-xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200/70'
                }`}
              >
                <span className="line-clamp-1">
                  {lang === 'th' ? page.labelTh : page.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUB-PAGE 1: รายละเอียดเหตุการณ์ (Incident Details) */}
      {subStep === 'details' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'th' ? 'รายละเอียดเหตุการณ์' : 'Incident Details'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'เลือกประเภทของปัญหาด้านสิ่งแวดล้อมและระบุรายละเอียดเพื่อการตรวจสอบ'
                : 'Select the environmental issue category and describe what occurred'}
            </p>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                {lang === 'th' ? 'หมวดหมู่ปัญหาด้านสิ่งแวดล้อม' : 'Environmental Problem Category'}
              </label>
              <span className="text-[11px] text-[#16A085] font-semibold">
                {lang === 'th' ? 'หมวดหมู่หลัก' : 'Primary Category'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoriesConfig.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#16A085] bg-emerald-50/70 ring-2 ring-[#16A085]/30 shadow-sm'
                        : `${cat.color} hover:shadow-xs`
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white shadow-2xs shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {lang === 'th' ? cat.titleTh : cat.titleEn}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {lang === 'th' ? cat.descTh : cat.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-problem selection */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                {lang === 'th' ? 'ประเภทย่อย' : 'Environmental Subcategory'}
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {lang === 'th' ? 'เลือกลักษณะปัญหาที่พบ' : 'Select issue type'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {subProblems.map((prob) => {
                const isSelected = selectedSubProblemId === prob.id;
                return (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => setSelectedSubProblemId(prob.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-[#16A085] text-slate-900 font-bold ring-2 ring-[#16A085]/30 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {lang === 'th' ? prob.nameTh : prob.nameEn}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#16A085] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    {(prob.exampleTh || prob.exampleEn) && (
                      <p className="text-[11px] text-slate-500 mt-1 font-normal leading-relaxed">
                        {lang === 'th' ? prob.exampleTh : prob.exampleEn}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom problem input if required */}
            {subProblems.find((p) => p.id === selectedSubProblemId)?.requiresCustomInput && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customProblemText}
                  onChange={(e) => setCustomProblemText(e.target.value)}
                  placeholder={
                    lang === 'th'
                      ? 'ระบุลักษณะปัญหา เช่น ท่อส่งสารเคมีรั่วซึม, กลิ่นก๊าซชีวภาพ...'
                      : 'Specify problem details...'
                  }
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                />
                {validationErrors.customProblem && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {validationErrors.customProblem}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Incident Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'th' ? 'รายละเอียดเพิ่มเติมของเหตุการณ์' : 'Incident Details & Description'}
            </label>
            <textarea
              rows={3}
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder={
                lang === 'th'
                  ? 'อธิบายสิ่งที่พบ เช่น เวลาที่เกิด ปริมาณ ลักษณะกลิ่น หรือจุดสังเกตเฉพาะ...'
                  : 'Describe what you observed, approximate time, scope, or distinctive signs...'
              }
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
            />
            {validationErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Optional Photo Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'th' ? 'รูปภาพประกอบเหตุการณ์ (ถ้ามี)' : 'Attached Photo (Optional)'}
            </label>
            <PhotoUpload
              photoBase64={photoBase64}
              onPhotoChange={setPhotoBase64}
              lang={lang}
            />
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleNextFromDetails}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{lang === 'th' ? 'ถัดไป' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: ข้อมูลผู้แจ้งเหตุและสิทธิ์ความเป็นส่วนตัว (Reporter Information & Privacy) */}
      {subStep === 'reporter' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'th'
                ? 'ข้อมูลผู้แจ้งเหตุและสิทธิ์ความเป็นส่วนตัว'
                : 'Reporter Information & Privacy'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'ระบบเคารพความเป็นส่วนตัวของท่าน และเปิดให้แจ้งเหตุแบบไม่ระบุตัวตนได้'
                : 'We value your privacy. You may submit anonymously if you prefer.'}
            </p>
          </div>

          {/* Reporter Type Selection (3 Groups) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'th' ? 'ประเภทผู้แจ้งเหตุ' : 'Reporter Type'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'student' as ReporterType,
                  titleTh: 'นักศึกษา',
                  titleEn: 'Student',
                  descTh: 'นักศึกษา มหาวิทยาลัยขอนแก่น',
                  descEn: 'KKU Student',
                },
                {
                  id: 'kku_staff' as ReporterType,
                  titleTh: 'บุคลากร มข.',
                  titleEn: 'KKU Staff',
                  descTh: 'อาจารย์ / เจ้าหน้าที่มหาวิทยาลัย',
                  descEn: 'Faculty & University Staff',
                },
                {
                  id: 'general_public' as ReporterType,
                  titleTh: 'บุคคลทั่วไป',
                  titleEn: 'General Public',
                  descTh: 'ผู้มาติดต่อ / ประชาชนทั่วไป',
                  descEn: 'Campus Visitor / General Public',
                },
              ].map((grp) => {
                const isSelected = reporterType === grp.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setReporterType(grp.id)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-[#16A085] ring-2 ring-[#16A085]/30 shadow-xs text-[#16A085]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold block">
                      {lang === 'th' ? grp.titleTh : grp.titleEn}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {lang === 'th' ? grp.descTh : grp.descEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-[#16A085] rounded-lg border-slate-300 focus:ring-[#16A085] cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#16A085]" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {lang === 'th' ? 'ไม่ระบุตัวตน (Report Anonymously)' : 'Report Anonymously'}
                </span>
              </div>
            </label>

            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
              {lang === 'th'
                ? 'คุณสามารถแจ้งเหตุโดยไม่เปิดเผยตัวตนได้ ข้อมูลการแจ้งเหตุจะถูกใช้เพื่อการตรวจสอบและดำเนินการด้านสิ่งแวดล้อมภายในพื้นที่'
                : 'You can report anonymously. Your report will be used for environmental monitoring and corrective action within the area.'}
            </p>
          </div>

          {/* Reporter Details (if not anonymous) */}
          {!isAnonymous && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200 animate-in fade-in">
              <span className="text-xs font-bold text-slate-700 block">
                {lang === 'th' ? 'ข้อมูลสำหรับติดต่อกลับ' : 'Contact Information'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {lang === 'th' ? 'ชื่อผู้แจ้ง *' : 'Reporter Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    {lang === 'th' ? 'เบอร์โทรศัพท์ *' : 'Phone Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Notice Statement & Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield className="w-4 h-4 text-[#16A085]" />
              <span>
                {lang === 'th'
                  ? 'สิทธิ์ความเป็นส่วนตัวและการคุ้มครองข้อมูล'
                  : 'Privacy & Data Protection Notice'}
              </span>
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
              <li>{lang === 'th' ? 'ข้อมูลผู้แจ้งใช้สำหรับการรับเรื่องและประสานงานแก้ไขปัญหาด้านสิ่งแวดล้อมเท่านั้น' : 'Information is strictly used for environmental response and coordination.'}</li>
              <li>{lang === 'th' ? 'ข้อมูลส่วนบุคคลของผู้แจ้งจะไม่ถูกนำไปแสดงต่อสาธารณะบนหน้าติดตาม' : 'Personal information will never be publicly displayed.'}</li>
              <li>{lang === 'th' ? 'ผู้แจ้งสามารถเลือกแจ้งแบบไม่ระบุตัวตนได้ทุกเมื่อ' : 'Reporters can choose to report anonymously at any time.'}</li>
              <li>{lang === 'th' ? 'ระบบจำกัดการเข้าถึงข้อมูลเฉพาะเจ้าหน้าที่ผู้ได้รับมอบหมายของคณะสาธารณสุขศาสตร์' : 'Access is strictly limited to authorized Faculty of Public Health officers.'}</li>
            </ul>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-[#16A085] rounded border-slate-300 focus:ring-[#16A085] cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-slate-800 leading-snug">
                {lang === 'th'
                  ? 'ฉันรับทราบนโยบายความเป็นส่วนตัวและยินยอมให้ใช้ข้อมูลตามวัตถุประสงค์ของระบบ'
                  : 'I acknowledge the privacy notice and consent to the use of my information for the purposes of this system.'}
              </span>
            </label>
            {validationErrors.consent && (
              <p className="text-[11px] text-rose-600 font-medium">{validationErrors.consent}</p>
            )}
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSubStep('details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'th' ? 'ย้อนกลับ' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleNextFromReporter}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{lang === 'th' ? 'ถัดไป' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-PAGE 3: ตำแหน่งเกิดเหตุ (Incident Location) */}
      {subStep === 'location' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'th' ? 'ตำแหน่งที่เกิดเหตุ' : 'Incident Location'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'จำกัดพื้นที่เฉพาะ คณะสาธารณสุขศาสตร์ มหาวิทยาลัยขอนแก่น พร้อมระบบแนะนำสถานที่อัตโนมัติ'
                : 'Restricted to Faculty of Public Health KKU with auto-suggested nearest spot'}
            </p>
          </div>

          {/* Faculty Label Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-[#16A085]" />
              <div>
                <span className="text-[11px] font-bold text-[#16A085] uppercase tracking-wider block">
                  {lang === 'th' ? 'พื้นที่รับผิดชอบ' : 'Designated Area'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  {facultyName}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
              {lang === 'th' ? 'ขอบเขตเฉพาะ มข.' : 'KKU Designated Zone'}
            </span>
          </div>

          {/* MapPicker with Choice Chips & Geolocation */}
          <div className="space-y-4 pt-1">
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              selectedSpotId={selectedSpotId}
              onChangeLocation={(lat, lng, spot) => {
                setLatitude(lat);
                setLongitude(lng);
                if (spot) {
                  setSelectedSpotId(spot.id);
                  setBuildingName(lang === 'th' ? spot.nameTh : spot.nameEn);
                  setLocationType(spot.locationType || 'building');
                }
                const inside = isInsideFacultyOfPublicHealth(lat, lng);
                setIsLocationInsideBoundary(inside);
              }}
              onSelectSpot={(spot: PublicHealthSpot) => {
                setSelectedSpotId(spot.id);
                setBuildingName(lang === 'th' ? spot.nameTh : spot.nameEn);
                setLocationType(spot.locationType || 'building');
                setLatitude(spot.lat);
                setLongitude(spot.lng);
                setIsLocationInsideBoundary(true);
              }}
              onBoundaryStatusChange={(inside) => setIsLocationInsideBoundary(inside)}
              lang={lang}
            />

            {/* Room / Specific detail notes (Optional) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === 'th'
                  ? 'จุดสังเกต หรือ รายละเอียดชั้น/ห้อง (เพิ่มเติม)'
                  : 'Floor / Room / Specific Landmark (Optional)'}
              </label>
              <input
                type="text"
                value={roomDetails}
                onChange={(e) => setRoomDetails(e.target.value)}
                placeholder={
                  lang === 'th'
                    ? 'เช่น ชั้น 2 ห้องปฏิบัติการ 204, บันไดหนีไฟด้านทิศใต้, โถงทางเข้า...'
                    : 'e.g. Floor 2 Lab 204, South stairway, Entrance lobby...'
                }
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#16A085] focus:outline-none"
              />
            </div>

            {validationErrors.location && (
              <p className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 border border-rose-200 rounded-xl">
                {validationErrors.location}
              </p>
            )}
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSubStep('reporter');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'th' ? 'ย้อนกลับ' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={handleNextFromLocation}
              disabled={!isLocationInsideBoundary}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{lang === 'th' ? 'ถัดไป' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-PAGE 4: ตรวจสอบและส่ง (Review & Submit) */}
      {subStep === 'review' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {lang === 'th' ? 'ตรวจสอบและส่ง' : 'Review & Submit'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? 'กรุณาตรวจสอบข้อมูลการแจ้งเหตุด้านสิ่งแวดล้อมก่อนกดยืนยันการส่ง'
                : 'Please verify incident details before confirming submission'}
            </p>
          </div>

          {/* Incident Summary Card */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider">
                  {lang === 'th' ? '1. รายละเอียดปัญหาด้านสิ่งแวดล้อม' : '1. Environmental Issue Summary'}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  {categoriesConfig.find((c) => c.id === category)?.[lang === 'th' ? 'titleTh' : 'titleEn'] || category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">
                    {lang === 'th' ? 'หมวดหมู่หลัก:' : 'Category:'}
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {categoriesConfig.find((c) => c.id === category)?.[lang === 'th' ? 'titleTh' : 'titleEn'] || category}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">
                    {lang === 'th' ? 'ประเภทย่อย:' : 'Subcategory:'}
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {findSubProblemById(selectedSubProblemId)?.[
                      lang === 'th' ? 'nameTh' : 'nameEn'
                    ] || customProblemText || '-'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {lang === 'th' ? 'หัวข้อปัญหา:' : 'Issue:'}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {incidentTitle ||
                    findSubProblemById(selectedSubProblemId)?.[
                      lang === 'th' ? 'nameTh' : 'nameEn'
                    ] ||
                    customProblemText}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {lang === 'th' ? 'รายละเอียด:' : 'Description:'}
                </span>
                <p className="text-xs text-slate-700 mt-0.5 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {incidentDescription || customProblemText || '-'}
                </p>
              </div>

              {photoBase64 && (
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1">
                    {lang === 'th' ? 'ภาพถ่ายแนบ:' : 'Attached Photo:'}
                  </span>
                  <img
                    src={photoBase64}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Reporter Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider block border-b border-slate-200 pb-2">
                {lang === 'th' ? '2. ข้อมูลผู้แจ้ง' : '2. Reporter Information'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">ประเภทผู้แจ้ง:</span>{' '}
                  <strong className="text-slate-900">
                    {reporterType === 'student'
                      ? 'นักศึกษา (Student)'
                      : reporterType === 'kku_staff'
                      ? 'บุคลากร มข. (KKU Staff)'
                      : 'บุคคลทั่วไป (General Public)'}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500">สถานะตัวตน:</span>{' '}
                  {isAnonymous ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                      <EyeOff className="w-3 h-3" />
                      ไม่ระบุตัวตน (Anonymous)
                    </span>
                  ) : (
                    <strong className="text-slate-900">{reporterName} ({reporterPhone})</strong>
                  )}
                </div>
              </div>
            </div>

            {/* Location Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-[#16A085] uppercase tracking-wider block border-b border-slate-200 pb-2">
                {lang === 'th' ? '3. ตำแหน่งที่เกิดเหตุ' : '3. Location in Public Health'}
              </span>

              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="w-4 h-4 text-[#16A085] shrink-0" />
                  <span>
                    <strong>{facultyName}</strong> - {buildingName}{' '}
                    {roomDetails ? `(${roomDetails})` : ''}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#16A085]" />
                    Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span>
                    ประเภท: <strong>{locationType}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSubStep('location');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'th' ? 'ย้อนกลับ' : 'Back'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitReport}
              className="inline-flex items-center gap-2 px-8 py-3 text-xs sm:text-sm font-extrabold text-white bg-[#16A085] hover:bg-[#138a72] rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>{lang === 'th' ? 'กำลังส่งข้อมูล...' : 'Submitting...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'th' ? 'ยืนยันและส่งแจ้งเหตุ' : 'Confirm & Submit Report'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
