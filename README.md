# U-Safe Envi - Environmental Health Incident Management System
**University Environmental Health & Safety Incident Reporting System**

U-Safe Envi is a production-ready, Progressive Web Application (PWA) designed for university campuses to streamline environmental health incident reporting, tracking, staff management, analytics, and Google Apps Script / Google Sheets database synchronization.

---

## 🌟 Key Features

- **Bilingual Interface**: Seamless switching between **Thai (TH)** and **English (EN)** across all screens.
- **Incident Reporting (5-Step Flow)**:
  - Categories: Water, Air, Noise, Odor, Waste, Disease Vectors, Others.
  - Auto-generated Ticket ID format: `ENV-2026-000001`.
  - Smart GPS Location detection with interactive map pin selection & reverse geocoding.
  - Media Management: Compressed photo upload (<5MB, JPG/PNG/WEBP) & video clip URLs.
  - Anonymous Reporting Mode: Hides reporter identity while retaining location and media data.
- **Ticket Tracking & Lifecycle**:
  - Search by Ticket ID, Student ID, or Phone.
  - Real-time Timeline: `Reported` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
  - Officer remarks and Before/After repair photos.
- **Staff & Admin Management**:
  - Officer assignment and department routing.
  - Status management with image verification.
  - System Audit Logs with user actions, IP addresses, and timestamps.
  - Admin-only ticket deletion and record export (CSV/PDF).
- **Analytics Dashboard (Chart.js)**:
  - Total Reports, Pending, In Progress, Resolved KPIs.
  - Category Distribution (Pie Chart).
  - Faculty Incident Ranking (Bar Chart).
  - Monthly Incident Trends (Line Chart).
  - Average Resolution Time Metrics.
- **PWA & Offline Capability**:
  - Web App Manifest (`manifest.json`) and Service Worker (`service-worker.js`) with static asset caching.
  - Interactive PWA Installation Banner.
- **Google Apps Script & Google Sheets Sync**:
  - Live preview and simulation of REST API (`doGet` / `doPost`) payload synchronization to Google Sheets (`U-Safe_Envi_DB`) and Google Drive storage.

---

## 🗄️ Google Sheets Database Schema (`U-Safe_Envi_DB`)

The system integrates with a Google Spreadsheet structured into 10 normalized sheets:

1. **`01_USERS`**: `UserID`, `Role`, `StudentID`, `FullNameTH`, `FullNameEN`, `Email`, `Phone`, `Faculty`, `Status`, `CreatedAt`.
2. **`02_REPORTS`**: `TicketID`, `ReporterID`, `ReporterType`, `Anonymous`, `Category`, `Title`, `Description`, `Priority`, `Latitude`, `Longitude`, `LocationName`, `Faculty`, `PhotoURL`, `VideoURL`, `Status`, `AssignedOfficer`, `CreatedAt`, `ResolvedAt`.
3. **`03_STATUS_LOG`**: `LogID`, `TicketID`, `OldStatus`, `NewStatus`, `OfficerID`, `Remark`, `BeforeImage`, `AfterImage`, `UpdatedAt`.
4. **`04_OFFICERS`**: `OfficerID`, `FullName`, `DepartmentID`, `Position`, `Email`, `Phone`, `Status`.
5. **`05_DEPARTMENTS`**: `DepartmentID`, `DepartmentTH`, `DepartmentEN`, `ResponsibleCategory`, `ContactPhone`, `Email`.
6. **`06_BUILDINGS`**: `BuildingID`, `BuildingTH`, `BuildingEN`, `Faculty`, `Latitude`, `Longitude`.
7. **`07_DASHBOARD`**: `Month`, `Year`, `Category`, `Faculty`, `TotalReports`, `Pending`, `Resolved`, `AverageResolveHour`.
8. **`08_SETTINGS`**: `SettingKey`, `SettingValue`, `Description`.
9. **`09_SYSTEM_LOG`**: `LogID`, `UserID`, `Action`, `Description`, `IPAddress`, `Timestamp`.
10. **`10_NOTIFICATION`**: `NotificationID`, `UserID`, `TicketID`, `Title`, `Message`, `ReadStatus`, `CreatedAt`.

---

## ⚙️ Google Apps Script (GAS) Backend Blueprint

Deploy the following code as a **Google Apps Script Web App** (`Execute as: Me`, `Who has access: Anyone`):

### `Code.gs`
```javascript
function doGet(e) {
  var action = e.parameter.action || 'getDashboard';
  var response = {};
  
  if (action === 'searchTicket') {
    response = searchTicket(e.parameter.query);
  } else if (action === 'getDashboard') {
    response = getDashboardData();
  } else {
    response = { status: true, message: "U-Safe Envi GAS Endpoint Ready" };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result = {};

    if (action === 'createReport') {
      result = createReport(data);
    } else if (action === 'updateStatus') {
      result = updateStatus(data);
    } else {
      result = { status: false, message: 'Unknown action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🧪 Testing Suite & Verification

### 1. Functional Tests (UAT)
- [x] **Guest Incident Reporting**: Able to fill form, pick GPS, upload photo, and receive `ENV-2026-XXXXXX` Ticket ID without requiring login.
- [x] **Ticket Tracking**: Able to search by ticket ID (`ENV-2026-000001`) and view real-time timeline steps.
- [x] **Staff & Admin Management**: Able to switch roles, assign officers, update ticket status to `resolved` with repair image, and record audit logs.
- [x] **Bilingual Support**: Instant toggle between Thai and English across all modals and navigation.

### 2. Performance & PWA
- [x] Service Worker registered and static assets cached for offline access.
- [x] Manifest installed with valid icons and theme colors.
- [x] Touch target sizes >= 48px for mobile responsiveness.
- [x] Image compression implemented before submission.

---

## 🚀 Setup & Local Execution

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
