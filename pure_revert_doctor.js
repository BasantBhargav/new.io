const fs = require('fs');
const f = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\doctordashboard.html';
let content = fs.readFileSync(f, 'utf8');

// 1. Remove the Grid Layout CSS
content = content.replace(/\/\* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT \*\/[\s\S]*?\.ui-title i \{[\s\S]*?\}/g, '');
content = content.replace(/\/\* 🏗️ SYSTEMATIZED GRID LAYOUT \*\/[\s\S]*?\.action-card-mini span \{[\s\S]*?\}/g, '');

const cleanDashboardContent = `
      <!-- Enhanced Page Header -->
      <div class="page-header">
        <div class="page-title">
          <h1>Welcome Back, Dr. Basant</h1>
          <p>Manage your patients and medical records efficiently with advanced tools</p>
        </div>
        <div class="date-display" id="dateDisplay">
          <i class="far fa-calendar-alt"></i>
          <span>Loading...</span>
        </div>
      </div>

      <!-- Enhanced Dashboard Stats (Removed Appointments) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="title">Total Patients</div>
          <div class="value">132</div>
          <div class="trend">
            <i class="fas fa-arrow-up"></i>
            <span>12% increase from last month</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="icon">
            <i class="fas fa-file-upload"></i>
          </div>
          <div class="title">Reports Uploaded</div>
          <div class="value">29</div>
          <div class="trend">
            <i class="fas fa-arrow-up"></i>
            <span>8 more than last week</span>
          </div>
        </div>

        <div class="stat-card" style="border-top: 4px solid var(--accent);">
          <div class="icon" style="background: var(--gradient-secondary);">
             <i class="fas fa-bullhorn"></i>
          </div>
          <div class="title">Current Token</div>
          <div class="value" id="currentTokenDisplay">0</div>
          <div class="trend" style="margin-bottom: 1rem;">
             <i class="fas fa-circle"></i>
             <span>Live Queue Progress</span>
          </div>
          <button class="btn btn-download" onclick="callNextPatient()" style="width: 100%; justify-content: center; background: var(--gradient-secondary);">
             <i class="fas fa-volume-up"></i> Call Next Patient
          </button>
        </div>
      </div>

      <!-- Quick Actions (Removed Schedule Appointment) -->
      <div class="quick-actions">
        <div class="action-card" onclick="document.getElementById('patientId').focus()">
          <i class="fas fa-search"></i>
          <h3>Find Patient</h3>
          <p>Search for patient records quickly</p>
        </div>
        
        <div class="action-card" onclick="window.location.href='/prescription.html'">
          <i class="fas fa-prescription"></i>
          <h3>New Prescription</h3>
          <p>Create a new prescription</p>
        </div>
        
        <div class="action-card" onclick="showAnalytics()">
          <i class="fas fa-chart-line"></i>
          <h3>View Analytics</h3>
          <p>Check patient statistics and trends</p>
        </div>
      </div>

      <!-- 📅 APPOINTMENT MANAGEMENT SECTION -->
      <div class="search-section" id="appointmentsSection" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 class="section-title" style="margin-bottom: 0;">
            <i class="fas fa-calendar-check"></i>
            Upcoming Appointments
          </h2>
          <button class="btn btn-view" onclick="loadDoctorAppointments()">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        
        <div id="doctorAppointmentsList" class="reports-list">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </div>

      <!-- 🕒 SET AVAILABILITY SECTION -->
      <div class="search-section" id="availabilitySection" style="margin-bottom: 2rem;">
        <h2 class="section-title">
          <i class="fas fa-clock"></i>
          Set Weekly Availability
        </h2>
        
        <div id="slotsContainer" class="form-row" style="flex-wrap: wrap; gap: 1rem;">
          <!-- Existing slots will be loaded here -->
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
          <button class="btn btn-view" id="addSlotBtn" onclick="addNewSlotRow()">
            <i class="fas fa-plus"></i> Add Slot
          </button>
          <button class="btn btn-download" onclick="saveAvailability()">
            <i class="fas fa-save"></i> Save Availability
          </button>
        </div>
      </div>

      <!-- 🧪 NEW: LAB REQUESTS TRACKING SECTION -->
      <div class="search-section" id="labRequestsSection" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 class="section-title" style="margin-bottom: 0;">
            <i class="fas fa-flask"></i>
            Recent Lab Requests
          </h2>
          <button class="btn btn-view" onclick="loadDoctorLabRequests()">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        
        <div id="doctorLabRequestsList" class="reports-list">
          <p style="text-align: center; color: var(--gray);">Click refresh to see latest requests.</p>
        </div>
      </div>

      <!-- Enhanced Search Section -->
      <div class="search-section" style="margin-bottom: 2rem;">
        <h2 class="section-title">
          <i class="fas fa-search"></i>
          Search Patient Records
        </h2>
        <form class="search-form" onsubmit="redirectToPatientReports(event)">
          <div class="search-group">
            <i class="fas fa-user-tag"></i>
            <input type="text" id="patientId" placeholder="Enter Patient User ID (e.g. 1, 2, 3)" required>
          </div>
          <button type="submit" class="search-btn">
            <i class="fas fa-search"></i>
            <span>Search Records</span>
          </button>
        </form>
      </div>`;

// Use a regex that isn't too greedy but captures the whole content block
const startMark = '<div class="dashboard-content">';
const endMark = '<!-- Analytics Modal -->';

const startIndex = content.indexOf(startMark);
const endIndex = content.indexOf(endMark);

if (startIndex !== -1 && endIndex !== -1) {
    const finalContent = content.substring(0, startIndex + startMark.length) + 
                         cleanDashboardContent + 
                         '\n    </div>\n  </div>\n\n  ' + 
                         content.substring(endIndex);
    fs.writeFileSync(f, finalContent);
    console.log('Doctor Dashboard Pure Revert Successful');
} else {
    console.log('Could not find markers for replacement');
}
