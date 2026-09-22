import React, { useState } from 'react';
import { Database, Cloud, FileSpreadsheet, CheckCircle2, Copy, RefreshCw, Send, ExternalLink, Code } from 'lucide-react';
import { Language, Ticket } from '../types';
import { getTranslation } from '../i18n';

interface GoogleSyncPanelProps {
  lang: Language;
  tickets: Ticket[];
  onTriggerSync?: () => void;
}

export const GoogleSyncPanel: React.FC<GoogleSyncPanelProps> = ({ lang, tickets, onTriggerSync }) => {
  const t = getTranslation(lang);
  const [copied, setCopied] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [activeSheetTab, setActiveSheetTab] = useState<'01_USERS' | '02_REPORTS' | '03_STATUS_LOG' | '07_DASHBOARD'>('02_REPORTS');

  const webAppUrl = 'https://script.google.com/macros/s/AKfycbx-PHEcoAlert-GasBackend2026/exec';
  const spreadsheetId = '1BxiMVs0XRA5nFMdUbYbO6JgPH_Eco_Alert_DB_2026';
  const driveFolderId = '1PH_Eco_Alert_Google_Drive_Folder_ID';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setApiResponse(JSON.stringify({
        status: true,
        message: "Google Apps Script doPost execution success",
        timestamp: new Date().toISOString(),
        rowsUpdated: tickets.length,
        spreadsheet: "PH_Eco_Alert_DB",
        driveFolder: "PH Eco Alert / Images / 2026 / 08"
      }, null, 2));
      if (onTriggerSync) onTriggerSync();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-[#16A085] rounded-xl border border-emerald-100/60">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {t.googleSyncTitle}
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-[#16A085] rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A085] animate-ping" />
                Active
              </span>
            </h2>
            <p className="text-sm text-slate-500">{t.googleSyncSub}</p>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#16A085] text-white font-medium text-sm rounded-xl hover:bg-[#138a72] transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing with Apps Script...' : 'Sync Now'}
        </button>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Endpoint */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t.webAppUrlLabel}</span>
            <button
              onClick={() => handleCopy(webAppUrl, 'url')}
              className="text-[#16A085] hover:underline flex items-center gap-1"
            >
              {copied === 'url' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 truncate bg-white p-2 rounded border border-slate-200">
            {webAppUrl}
          </p>
        </div>

        {/* Spreadsheet ID */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t.spreadsheetIdLabel}</span>
            <button
              onClick={() => handleCopy(spreadsheetId, 'sheet')}
              className="text-[#16A085] hover:underline flex items-center gap-1"
            >
              {copied === 'sheet' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 truncate bg-white p-2 rounded border border-slate-200">
            {spreadsheetId}
          </p>
        </div>

        {/* Drive Folder */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{t.driveFolderLabel}</span>
            <button
              onClick={() => handleCopy(driveFolderId, 'drive')}
              className="text-[#16A085] hover:underline flex items-center gap-1"
            >
              {copied === 'drive' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 truncate bg-white p-2 rounded border border-slate-200">
            {driveFolderId}
          </p>
        </div>
      </div>

      {/* Sheets Preview Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#16A085]" />
            Live Google Sheets View (`PH_Eco_Alert_DB`)
          </h3>
          <span className="text-xs text-slate-500">Total Sync Rows: <strong className="text-slate-800">{tickets.length}</strong></span>
        </div>

        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {(['02_REPORTS', '01_USERS', '03_STATUS_LOG', '07_DASHBOARD'] as const).map((sheetName) => (
            <button
              key={sheetName}
              onClick={() => setActiveSheetTab(sheetName)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeSheetTab === sheetName
                  ? 'bg-[#16A085] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sheet: {sheetName}
            </button>
          ))}
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
              {activeSheetTab === '02_REPORTS' && (
                <tr>
                  <th className="px-3 py-2">TicketID</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Faculty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">AssignedOfficer</th>
                  <th className="px-3 py-2">CreatedAt</th>
                </tr>
              )}
              {activeSheetTab === '01_USERS' && (
                <tr>
                  <th className="px-3 py-2">UserID</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">StudentID</th>
                  <th className="px-3 py-2">FullNameTH</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              )}
              {activeSheetTab === '03_STATUS_LOG' && (
                <tr>
                  <th className="px-3 py-2">LogID</th>
                  <th className="px-3 py-2">TicketID</th>
                  <th className="px-3 py-2">OfficerID</th>
                  <th className="px-3 py-2">Remark</th>
                  <th className="px-3 py-2">UpdatedAt</th>
                </tr>
              )}
              {activeSheetTab === '07_DASHBOARD' && (
                <tr>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">TotalReports</th>
                  <th className="px-3 py-2">Pending</th>
                  <th className="px-3 py-2">Resolved</th>
                  <th className="px-3 py-2">AvgResolveHour</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {activeSheetTab === '02_REPORTS' &&
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-[#16A085]">{t.id}</td>
                    <td className="px-3 py-2">{t.category}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{t.title}</td>
                    <td className="px-3 py-2">{t.location.faculty}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{t.assignedStaff || '-'}</td>
                    <td className="px-3 py-2 text-slate-400">{t.createdAt}</td>
                  </tr>
                ))}
              {activeSheetTab === '01_USERS' && (
                <>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-[#16A085]">USR000001</td>
                    <td className="px-3 py-2">Student</td>
                    <td className="px-3 py-2">663040123-4</td>
                    <td className="px-3 py-2">กิตติศักดิ์ ชัยชนะ</td>
                    <td className="px-3 py-2">kittisak.c@kkumail.com</td>
                    <td className="px-3 py-2 text-emerald-600 font-semibold">Active</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-[#16A085]">USR000002</td>
                    <td className="px-3 py-2">Staff</td>
                    <td className="px-3 py-2">STF-9901</td>
                    <td className="px-3 py-2">สมชาย มีสุข</td>
                    <td className="px-3 py-2">somchai.m@kku.ac.th</td>
                    <td className="px-3 py-2 text-emerald-600 font-semibold">Active</td>
                  </tr>
                </>
              )}
              {activeSheetTab === '03_STATUS_LOG' &&
                tickets.flatMap(t => t.timeline).map((tm, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">LOG-2026-00{idx+1}</td>
                    <td className="px-3 py-2 text-[#16A085]">ENV-2026-00000{idx+1}</td>
                    <td className="px-3 py-2">{tm.updatedBy}</td>
                    <td className="px-3 py-2 truncate max-w-xs">{tm.remark}</td>
                    <td className="px-3 py-2 text-slate-400">{tm.timestamp}</td>
                  </tr>
                ))}
              {activeSheetTab === '07_DASHBOARD' && (
                <>
                  <tr>
                    <td className="px-3 py-2">Water Quality</td>
                    <td className="px-3 py-2">12</td>
                    <td className="px-3 py-2">2</td>
                    <td className="px-3 py-2">10</td>
                    <td className="px-3 py-2">4.2 hrs</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Waste & Sanitation</td>
                    <td className="px-3 py-2">18</td>
                    <td className="px-3 py-2">4</td>
                    <td className="px-3 py-2">14</td>
                    <td className="px-3 py-2">2.5 hrs</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response preview */}
      {apiResponse && (
        <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> API Response (JSON)</span>
            <button onClick={() => setApiResponse(null)} className="text-slate-500 hover:text-white">Close</button>
          </div>
          <pre className="overflow-x-auto p-1">{apiResponse}</pre>
        </div>
      )}
    </div>
  );
};
