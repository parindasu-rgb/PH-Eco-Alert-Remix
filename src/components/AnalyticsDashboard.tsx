import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  Filter,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Language, Ticket, ReportCategory } from '../types';
import { getTranslation } from '../i18n';
import { FACULTY_PH_SPOTS, getTicketLocationId, findSpotById } from '../utils/geofence';

interface AnalyticsDashboardProps {
  tickets: Ticket[];
  lang: Language;
}

const CATEGORY_NAMES_TH: Record<string, string> = {
  waste: 'ขยะและสิ่งปฏิกูล',
  water: 'น้ำเสียและสุขาภิบาล',
  air: 'มลพิษทางอากาศและฝุ่น',
  noise: 'มลพิษทางเสียง',
  odor: 'กลิ่นเหม็นและสารเคมี',
  vector: 'สัตว์และแมลงพาหะนำโรค',
  food_sanitation: 'สุขาภิบาลอาหาร',
  infrastructure_utilities: 'กายภาพและสาธารณูปโภค',
};

const CATEGORY_NAMES_EN: Record<string, string> = {
  waste: 'Solid Waste',
  water: 'Wastewater',
  air: 'Air & Dust',
  noise: 'Noise Pollution',
  odor: 'Odor & Chemicals',
  vector: 'Disease Vectors',
  food_sanitation: 'Food Sanitation',
  infrastructure_utilities: 'Infrastructure',
};

const PIE_COLORS = [
  '#0284C7', // sky-600
  '#0D9488', // teal-600
  '#16A085', // primary teal
  '#F59E0B', // amber-500
  '#8B5CF6', // purple-500
  '#EC4899', // pink-500
  '#64748B', // slate-500
  '#10B981', // emerald-500
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tickets, lang }) => {
  const t = getTranslation(lang);

  // Selected location ID: 'all' for all 7 PH spots, or specific spot ID
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');

  // Filter tickets strictly to Faculty of Public Health 7 locations
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      const spotId = getTicketLocationId(tk);
      // Strictly ignore tickets outside the 7 locations of Faculty of Public Health
      if (!spotId) return false;

      if (selectedLocationId === 'all') {
        return true;
      }
      return spotId === selectedLocationId;
    });
  }, [tickets, selectedLocationId]);

  // Selected spot metadata
  const selectedSpot = useMemo(() => {
    if (selectedLocationId === 'all') return null;
    return findSpotById(selectedLocationId);
  }, [selectedLocationId]);

  // Key KPI metrics
  const totalCount = filteredTickets.length;
  const pendingCount = filteredTickets.filter(
    (tk) => tk.status === 'reported' || (tk.status as string) === 'pending'
  ).length;
  const inProgressCount = filteredTickets.filter(
    (tk) => tk.status === 'in_progress' || tk.status === 'investigating'
  ).length;
  const resolvedCount = filteredTickets.filter((tk) => tk.status === 'resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  // Monthly trend computed dynamically from filtered tickets
  const monthlyData = useMemo(() => {
    const months = ['พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
    const monthsEn = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];

    // Distribute filteredTickets across months by their createdAt
    const countsByMonth: Record<number, { total: number; resolved: number }> = {
      4: { total: 0, resolved: 0 },
      5: { total: 0, resolved: 0 },
      6: { total: 0, resolved: 0 },
      7: { total: 0, resolved: 0 },
      8: { total: 0, resolved: 0 },
    };

    filteredTickets.forEach((tk) => {
      const date = new Date(tk.createdAt || Date.now());
      const m = isNaN(date.getMonth()) ? 7 : date.getMonth();
      if (countsByMonth[m]) {
        countsByMonth[m].total += 1;
        if (tk.status === 'resolved') {
          countsByMonth[m].resolved += 1;
        }
      } else {
        countsByMonth[7].total += 1;
        if (tk.status === 'resolved') countsByMonth[7].resolved += 1;
      }
    });

    return [4, 5, 6, 7, 8].map((monthIndex, idx) => {
      // Base historical weight scaled by current location volume
      const base = countsByMonth[monthIndex];
      const monthLabel = lang === 'th' ? months[idx] : monthsEn[idx];
      return {
        month: monthLabel,
        reports: base.total,
        resolved: base.resolved,
      };
    });
  }, [filteredTickets, lang]);

  // Category distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach((tk) => {
      const cat = tk.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map((cat) => {
      const name =
        lang === 'th'
          ? CATEGORY_NAMES_TH[cat] || cat
          : CATEGORY_NAMES_EN[cat] || cat;
      return {
        name,
        rawCategory: cat,
        value: counts[cat],
      };
    });
  }, [filteredTickets, lang]);

  // Location distribution comparison: Always strictly compares the 7 Faculty spots
  const spotsComparisonData = useMemo(() => {
    return FACULTY_PH_SPOTS.map((spot) => {
      const spotTickets = tickets.filter((tk) => getTicketLocationId(tk) === spot.id);
      const total = spotTickets.length;
      const resolved = spotTickets.filter((tk) => tk.status === 'resolved').length;
      const inProgress = spotTickets.filter(
        (tk) => tk.status === 'in_progress' || tk.status === 'investigating'
      ).length;
      const pending = spotTickets.filter(
        (tk) => tk.status === 'reported' || (tk.status as string) === 'pending'
      ).length;

      return {
        id: spot.id,
        name: lang === 'th' ? spot.nameTh : spot.nameEn,
        shortName:
          lang === 'th'
            ? spot.nameTh.replace('คณะสาธารณสุขศาสตร์', '').trim()
            : spot.nameEn.replace('Faculty of Public Health', '').trim(),
        total,
        resolved,
        inProgress,
        pending,
      };
    });
  }, [tickets, lang]);

  // Status breakdown for selected single location
  const statusBreakdownData = useMemo(() => {
    return [
      {
        status: lang === 'th' ? 'รอดำเนินการ' : 'Pending',
        count: pendingCount,
        fill: '#F59E0B',
      },
      {
        status: lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress',
        count: inProgressCount,
        fill: '#3B82F6',
      },
      {
        status: lang === 'th' ? 'เสร็จสิ้น' : 'Resolved',
        count: resolvedCount,
        fill: '#10B981',
      },
    ];
  }, [pendingCount, inProgressCount, resolvedCount, lang]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto my-4 px-2 sm:px-4">
      {/* Header & Location Filter Card */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Header titles */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#16A085]/10 text-[#16A085] border border-[#16A085]/20">
                <Building className="w-3.5 h-3.5" />
                คณะสาธารณสุขศาสตร์ มข.
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time Sync
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.dashboardTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.dashboardSub}
            </p>
          </div>

          {/* Location Filter Dropdown */}
          <div className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700 px-1">
                <MapPin className="w-4 h-4 text-[#16A085] shrink-0" />
                <label
                  htmlFor="location-filter-select"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap"
                >
                  {lang === 'th' ? 'สถานที่:' : 'Location:'}
                </label>
              </div>

              <select
                id="location-filter-select"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full sm:w-[320px] md:w-[380px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white rounded-xl border border-slate-300 shadow-sm focus:border-[#16A085] focus:ring-2 focus:ring-[#16A085]/20 focus:outline-none cursor-pointer transition-all duration-150"
              >
                {/* Option 1: All 7 areas aggregate */}
                <option value="all">
                  {lang === 'th'
                    ? 'ทุกพื้นที่'
                    : 'All Areas (Faculty of Public Health)'}
                </option>

                {/* Exactly 7 locations within Faculty of Public Health */}
                {FACULTY_PH_SPOTS.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {lang === 'th' ? spot.nameTh : spot.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-500">
              {lang === 'th' ? 'ขอบเขตข้อมูลที่แสดง:' : 'Active Scope:'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#16A085] font-bold rounded-lg border border-teal-200">
              <MapPin className="w-3 h-3" />
              {selectedSpot
                ? lang === 'th'
                  ? selectedSpot.nameTh
                  : selectedSpot.nameEn
                : lang === 'th'
                ? 'ทุกพื้นที่ (รวม 7 จุดเกิดเหตุภายในคณะสาธารณสุขศาสตร์)'
                : 'All Areas (Combined 7 Public Health Spots)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>
              {lang === 'th' ? 'พบรายงานทั้งหมด:' : 'Filtered Reports:'}{' '}
              <strong className="text-slate-900 font-bold">{totalCount}</strong>{' '}
              {lang === 'th' ? 'รายการ' : 'tickets'}
            </span>
            {selectedLocationId !== 'all' && (
              <button
                onClick={() => setSelectedLocationId('all')}
                className="text-[#16A085] hover:underline flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {lang === 'th' ? 'ดูทุกพื้นที่' : 'Reset to All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Real-time based on selected location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.totalReports}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {totalCount}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3 text-[#16A085]" />
              {selectedLocationId === 'all'
                ? lang === 'th'
                  ? 'รวม 7 จุดภายในคณะ'
                  : 'All 7 PH Locations'
                : lang === 'th'
                ? 'เฉพาะจุดที่เลือก'
                : 'Selected Location'}
            </span>
          </div>
          <div className="p-3 bg-[#16A085]/10 text-[#16A085] rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Pending / Reported */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.pendingReports}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {pendingCount}
            </h3>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              {lang === 'th' ? 'รอมอบหมาย / ตรวจสอบ' : 'Awaiting action'}
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.inProgressKpi}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {inProgressCount}
            </h3>
            <span className="text-[11px] text-blue-600 font-medium mt-1 block">
              {lang === 'th' ? 'เจ้าหน้าที่กำลังลงพื้นที่' : 'Staff on-site'}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Resolved & Rate */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.resolvedReports}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {resolvedCount}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {resolutionRate}% {lang === 'th' ? 'แก้ไขสำเร็จ' : 'resolution rate'}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend & Resolution Chart */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t.chartMonthly}
            </h3>
            <span className="text-xs text-slate-400">
              {selectedSpot
                ? lang === 'th'
                  ? selectedSpot.nameTh
                  : selectedSpot.nameEn
                : lang === 'th'
                ? 'ภาพรวมคณะ'
                : 'Overview'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Bar
                  dataKey="reports"
                  fill="#0284C7"
                  radius={[6, 6, 0, 0]}
                  name={lang === 'th' ? 'การแจ้งเหตุ' : 'Reports'}
                />
                <Bar
                  dataKey="resolved"
                  fill="#16A085"
                  radius={[6, 6, 0, 0]}
                  name={lang === 'th' ? 'แก้ไขเสร็จสิ้น' : 'Resolved'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t.chartCategory}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {totalCount} {lang === 'th' ? 'รายการ' : 'total'}
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.rawCategory}-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      borderColor: '#E2E8F0',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">
                  {lang === 'th'
                    ? 'ไม่มีข้อมูลการแจ้งเหตุในพื้นที่นี้'
                    : 'No incident reports in this area'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3rd Chart Section: Location Breakdown or Single Location Breakdown */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {selectedLocationId === 'all'
                ? lang === 'th'
                  ? 'สถิติการแจ้งเหตุเปรียบเทียบทั้ง 7 จุด (คณะสาธารณสุขศาสตร์)'
                  : 'Incidents Comparison across 7 PH Spots'
                : lang === 'th'
                ? `สถานะการดำเนินงาน: ${selectedSpot?.nameTh || ''}`
                : `Resolution Breakdown: ${selectedSpot?.nameEn || ''}`}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedLocationId === 'all'
                ? lang === 'th'
                  ? 'แสดงจำนวนเหตุและสัดส่วนการแก้ไขเสร็จสิ้นของทุกสถานที่ในคณะ'
                  : 'Showing total and resolved incident counts for each spot'
                : lang === 'th'
                ? 'แสดงการกระจายของสถานะงานในจุดเกิดเหตุที่เลือก'
                : 'Detailed status distribution for selected location'}
            </p>
          </div>
          {selectedLocationId === 'all' && (
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold w-fit">
              7 จุดครอบคลุม
            </span>
          )}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedLocationId === 'all' ? (
              <BarChart
                data={spotsComparisonData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="shortName"
                  type="category"
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar
                  dataKey="total"
                  fill="#0284C7"
                  radius={[0, 4, 4, 0]}
                  name={lang === 'th' ? 'การแจ้งเหตุทั้งหมด' : 'Total Reports'}
                />
                <Bar
                  dataKey="resolved"
                  fill="#16A085"
                  radius={[0, 4, 4, 0]}
                  name={lang === 'th' ? 'แก้ไขเสร็จสิ้น' : 'Resolved'}
                />
              </BarChart>
            ) : (
              <BarChart
                data={statusBreakdownData}
                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              >
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: '#E2E8F0',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name={lang === 'th' ? 'จำนวนเหตุ' : 'Count'}>
                  {statusBreakdownData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table & Recent Incidents Log for Selected Location */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#16A085]" />
              {t.incidentTableTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'th'
                ? `แสดงรายการแจ้งเหตุทั้งหมดที่ตรงกับตัวกรอง (${totalCount} รายการ)`
                : `Displaying all reports matching the active location filter (${totalCount} items)`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">{lang === 'th' ? 'พื้นที่:' : 'Area:'}</span>
            <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {selectedSpot
                ? lang === 'th'
                  ? selectedSpot.nameTh
                  : selectedSpot.nameEn
                : lang === 'th'
                ? 'ทุกพื้นที่ (7 จุดเกิดเหตุ)'
                : 'All Areas'}
            </span>
          </div>
        </div>

        {/* Table / Cards responsive view */}
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-3.5">
                    {lang === 'th' ? 'รหัสแจ้งเหตุ' : 'Ticket ID'}
                  </th>
                  <th className="py-3 px-3.5">
                    {lang === 'th' ? 'หมวดหมู่' : 'Category'}
                  </th>
                  <th className="py-3 px-3.5">
                    {lang === 'th' ? 'จุดเกิดเหตุ / อาคาร' : 'Location / Spot'}
                  </th>
                  <th className="py-3 px-3.5">
                    {lang === 'th' ? 'หัวข้อปัญหา' : 'Issue Title'}
                  </th>
                  <th className="py-3 px-3.5 text-center">
                    {lang === 'th' ? 'สถานะ' : 'Status'}
                  </th>
                  <th className="py-3 px-3.5 text-right">
                    {lang === 'th' ? 'วันที่แจ้ง' : 'Reported At'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((tk) => {
                  const spotId = getTicketLocationId(tk);
                  const spot = findSpotById(spotId || undefined);
                  const spotName =
                    (lang === 'th' ? spot?.nameTh : spot?.nameEn) ||
                    tk.location?.location_name ||
                    tk.location?.building ||
                    'คณะสาธารณสุขศาสตร์';

                  const categoryLabel =
                    lang === 'th'
                      ? CATEGORY_NAMES_TH[tk.category] || tk.category
                      : CATEGORY_NAMES_EN[tk.category] || tk.category;

                  const isResolved = tk.status === 'resolved';
                  const isInProgress =
                    tk.status === 'in_progress' || tk.status === 'investigating';

                  return (
                    <tr
                      key={tk.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {tk.id}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {categoryLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#16A085] shrink-0" />
                          {spotName}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 max-w-[280px] truncate text-slate-600 font-normal">
                        <span title={tk.title}>{tk.title}</span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {lang === 'th' ? 'เสร็จสิ้น' : 'Resolved'}
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            {lang === 'th' ? 'รอดำเนินการ' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {tk.createdAt
                          ? tk.createdAt.split(' ')[0]
                          : '2026-08-01'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'th'
                ? 'ยังไม่มีประวัติการแจ้งเหตุในพื้นที่นี้'
                : 'No incident reports found for this location'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'th'
                ? 'เมื่อมีการแจ้งเหตุใหม่ในจุดนี้ สถิติจะปรากฏทันทีแบบ Real-time'
                : 'New reports filed in this area will be updated here in real-time'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
