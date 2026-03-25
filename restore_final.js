const fs = require('fs');
const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';

const baseCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>MediVault | Patient Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
 
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <script src="/socket.io/socket.io.js"></script>
 
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    :root {
      --primary: #4361ee;
      --primary-dark: #3a56d4;
      --secondary: #7209b7;
      --accent: #f72585;
      --success: #4cc9f0;
      --dark: #212529;
      --gray: #6c757d;
      --light-gray: #f8f9fa;
      --white: #ffffff;
      --gradient-primary: linear-gradient(135deg, #4361ee 0%, #7209b7 100%);
      --gradient-secondary: linear-gradient(135deg, #f72585 0%, #4361ee 100%);
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.15);
      --shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
      --shadow-xl: 0 16px 48px rgba(0,0,0,0.18);
      --radius: 12px;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --primary-soft: rgba(67, 97, 238, 0.1);
    }
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f8f9ff 0%, #e8edff 50%, #f0f8ff 100%);
      color: var(--dark);
      min-height: 100vh;
      overflow-x: hidden;
    }
    /* Animated Background */
    body::before {
      content: '';
      position: fixed;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(67, 97, 238, 0.08) 0%, transparent 50%);
      animation: float 8s ease-in-out infinite;
      z-index: -1;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(180deg); }
    }
    /* Header - Matching Home Page */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(67, 97, 238, 0.1);
      z-index: 1000;
      box-shadow: var(--shadow-sm);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
      text-decoration: none;
      transition: var(--transition);
    }
    .logo:hover {
      transform: scale(1.05);
    }
    .logo i {
      font-size: 1.8rem;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-menu {
      display: flex;
      list-style: none;
      gap: 2rem;
      align-items: center;
    }
    .nav-menu a {
      text-decoration: none;
      color: var(--dark);
      font-weight: 500;
      position: relative;
      transition: var(--transition);
      padding: 0.5rem 0;
    }
    .nav-menu a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--gradient-primary);
      transition: width 0.3s ease;
    }
    .nav-menu a:hover::after,
    .nav-menu a.active::after {
      width: 100%;
    }
    .nav-menu a:hover,
    .nav-menu a.active {
      color: var(--primary);
    }
    /* 🚀 Notification Bell */
    .notification-item {
      position: relative;
      cursor: pointer;
      padding: 0.8rem;
      border-radius: 8px;
    }
    .notification-bell {
      color: var(--primary);
      font-size: 1.3rem;
      position: relative;
    }
    .notification-badge {
      position: absolute;
      top: -10px; right: -10px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      width: 20px; height: 20px;
      font-size: 0.7rem;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(247, 37, 133, 0.3);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gray);
      font-size: 0.9rem;
    }
    .user-info i { font-size: 1.5rem; color: var(--primary); }

    .logout-btn {
      background: var(--gradient-primary);
      border: none;
      color: white;
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Main Content */
    .main-container {
      padding-top: 90px;
    }
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .page-title {
      margin-bottom: 2rem;
    }
    .page-title h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .page-title p {
      color: var(--gray);
      font-size: 1.1rem;
    }

    /* Dashboard Cards Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--white);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(67, 97, 238, 0.1);
      transition: var(--transition);
      position: relative;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius) var(--radius) 0 0;
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
    .stat-card .icon {
      width: 50px; height: 50px;
      background: var(--primary-soft);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      color: var(--primary);
      font-size: 1.2rem;
    }
    .stat-card .value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--dark);
    }

    /* Sections */
    .dashboard-section {
      background: var(--white);
      border-radius: 15px;
      padding: 2.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(67, 97, 238, 0.08);
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 1.8rem;
      display: flex; align-items: center; gap: 0.8rem;
    }
    .section-title i { color: var(--primary); }

    .primary-btn {
        background: var(--gradient-primary);
        color: white; border: none; padding: 0.9rem 1.8rem; border-radius: 10px; font-weight: 700; cursor: pointer;
        display: flex; align-items: center; gap: 0.7rem; transition: var(--transition);
    }
    .primary-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(67,97,238,0.2); }

    /* List Items */
    .item-list { display: flex; flex-direction: column; gap: 1rem; }
    .list-item {
        background: #fcfdfe; border: 1px solid #edf2f7; padding: 1.5rem; border-radius: 15px;
        display: flex; justify-content: space-between; align-items: center; transition: var(--transition);
    }
    .list-item:hover { border-color: var(--primary); transform: translateX(5px); background: white; }
    
    .item-info h4 { font-weight: 700; font-size: 1.1rem; color: var(--dark); }
    .item-info span { font-size: 0.85rem; color: var(--gray); }

    /* Search Form */
    .search-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .search-inputs label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--gray); }
    .search-inputs input, .search-inputs select {
        width: 100%; padding: 0.9rem 1.2rem; border: 2px solid #edf2f7; border-radius: 12px; font-size: 1rem; transition: var(--transition);
    }

    @media (max-width: 800px) {
        .search-inputs { grid-template-columns: 1fr; }
        .nav-menu { display: none; }
    }
  </style>
</head>
<body id="top">
  <!-- Header -->
  <header class="header">
    <div class="nav-container">
      <a href="/" class="logo">
        <i class="fas fa-heartbeat"></i>
        MediVault
      </a>
     
      <nav class="nav-menu">
        <a href="#top" class="active">Dashboard</a>
        <a href="#searchSection">Find Care</a>
        <a href="#appointmentsSection">Appointments</a>
        <a href="#labTests">Lab Tests</a>
        <a href="#reports">Records</a>
       
        <div class="notification-item">
          <div class="notification-bell">
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
          </div>
        </div>
      </nav>

      <div class="user-menu">
        <div class="user-info">
          <i class="fas fa-user-circle"></i>
          <span id="headerUserName">Patient</span>
        </div>
        <button class="logout-btn" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="main-container">
    <div class="dashboard-content">
      <div class="page-title">
        <h1>Patient Dashboard</h1>
        <p>Welcome back, manage your health profile and appointments</p>
      </div>

      <!-- 🏥 SEARCH & BOOKING -->
      <div class="dashboard-section" id="searchSection" style="border: 2px solid var(--primary-soft);">
        <h2 class="section-title"><i class="fas fa-search"></i> Find Doctors & Hospitals</h2>
        <div class="search-inputs">
          <div>
            <label>Search For</label>
            <select id="searchType">
              <option value="doctor">Doctors</option>
              <option value="hospital">Hospitals</option>
              <option value="laboratory">Laboratories</option>
            </select>
          </div>
          <div>
            <label>Expertise / Location</label>
            <input type="text" id="searchParam" placeholder="e.g. Cardio, Mumbai">
          </div>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button class="primary-btn" onclick="performSearch()" style="flex: 1;"><i class="fas fa-search"></i> Search Now</button>
          <button class="primary-btn" onclick="findNearby()" style="flex: 1; background: var(--gradient-secondary);">
              <i class="fas fa-location-arrow"></i> Find Nearby
          </button>
        </div>
        <div id="searchResults" class="item-list" style="margin-top:2rem; display:none;"></div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="icon"><i class="fas fa-id-card"></i></div>
          <div class="title">Patient ID</div>
          <div class="value" id="userId">...</div>
        </div>
        <div class="stat-card">
          <div class="icon"><i class="fas fa-user"></i></div>
          <div class="title">Name</div>
          <div class="value" id="userName">...</div>
        </div>
        <div class="stat-card">
          <div class="icon"><i class="fas fa-phone"></i></div>
          <div class="title">Phone</div>
          <div class="value" id="userPhone">...</div>
        </div>
        <div class="stat-card">
          <div class="icon"><i class="fas fa-file-medical"></i></div>
          <div class="title">Records</div>
          <div class="value" id="reportCount">0</div>
        </div>
      </div>

      <!-- 📅 APPOINTMENTS & QUEUE -->
      <div class="dashboard-section" id="appointmentsSection">
        <h2 class="section-title"><i class="fas fa-calendar-check"></i> Upcoming Appointments</h2>
        
        <!-- Smart Queue Banner -->
        <div id="queueBanner" style="display: none; background: var(--gradient-primary); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
           <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>Live Queue Tracking</h3>
              <div id="qTime" style="font-weight: 800; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 30px;">~ 0 mins</div>
           </div>
           <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                 <div style="font-size:0.75rem;">Your Token</div>
                 <div id="tokenNum" style="font-size: 1.8rem; font-weight: 800;">0</div>
              </div>
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                 <div style="font-size:0.75rem;">Calling</div>
                 <div id="currentNum" style="font-size: 1.8rem; font-weight: 800;">0</div>
              </div>
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                 <div style="font-size:0.75rem;">Wait List</div>
                 <div id="aheadNum" style="font-size: 1.8rem; font-weight: 800;">0</div>
              </div>
           </div>
        </div>

        <div id="appointmentList" class="item-list"></div>
      </div>

      <!-- 🔬 LAB TESTS TRACKING -->
      <div class="dashboard-section" id="labTests" style="border-left: 6px solid var(--accent);">
        <h2 class="section-title"><i class="fas fa-microscope"></i> Lab Tests Tracking</h2>
        <div id="patientLabList" class="item-list">
             <p style="text-align:center; color:gray; padding:2rem;">No active test requests.</p>
        </div>
      </div>

      <!-- Records Section -->
      <div class="dashboard-section" id="reports">
        <h2 class="section-title"><i class="fas fa-file-medical"></i> Medical Documents</h2>
        <div id="reportList" class="item-list"></div>
      </div>

      <!-- Prescriptions Section -->
      <div class="dashboard-section" id="prescription">
        <h2 class="section-title"><i class="fas fa-prescription"></i> My Prescriptions</h2>
        <div id="prescriptionsList" class="item-list"></div>
      </div>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // DASHBOARD CORE LOGIC
    document.addEventListener('DOMContentLoaded', () => {
        const name = localStorage.getItem('userName') || 'Patient';
        document.getElementById('headerUserName').textContent = name;
        document.getElementById('userName').textContent = name;
        document.getElementById('userId').textContent = localStorage.getItem('userId') || '...';
        document.getElementById('userPhone').textContent = localStorage.getItem('userPhone') || '...';

        loadReports();
        loadAppointments();
        loadLabTests();
        loadPrescriptions();
        initSocket();
    });

    async function loadReports() {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            if (data.success) {
                document.getElementById('reportCount').textContent = data.reports.length;
                const list = document.getElementById('reportList');
                if (data.reports.length === 0) {
                    list.innerHTML = '<p style="text-align:center; padding:2rem; color:gray">No records found.</p>';
                    return;
                }
                list.innerHTML = data.reports.map(r => \`
                    <div class="list-item">
                        <div class="item-info">
                            <h4>\${r.type}</h4>
                            <span>\${new Date(r.uploadedAt).toLocaleString()}</span>
                        </div>
                        <a href="/reports/\${r.filename}" target="_blank" class="primary-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View</a>
                    </div>
                \`).join('');
            }
        } catch(e) { console.error(e); }
    }

    async function performSearch() {
        const type = document.getElementById('searchType').value;
        const q = document.getElementById('searchParam').value;
        const results = document.getElementById('searchResults');
        results.style.display = 'block';
        results.innerHTML = '<p style="text-align:center">Finding clinicians...</p>';
        try {
            const res = await fetch(\`/api/search?type=\${type}&q=\${q}\`);
            const data = await res.json();
            if (data.success && data.results.length > 0) {
                results.innerHTML = data.results.map(r => \`
                    <div class="list-item">
                        <div class="item-info">
                            <h4>\${r.name}</h4>
                            <span>\${r.specialization || r.location?.city || ''}</span>
                        </div>
                        <button class="primary-btn" onclick="bookAppointment('\${r._id}', '\${type}')">Book</button>
                    </div>
                \`).join('');
            } else {
                results.innerHTML = '<p style="text-align:center; color:gray">No results found.</p>';
            }
        } catch(e) { results.innerHTML = '<p>Error searching.</p>'; }
    }

    function initSocket() {
        const socket = io();
        const uid = localStorage.getItem('userId');
        socket.on('connect', () => {
            socket.emit('register', uid);
        });

        socket.on('tokenUpdate', (data) => {
            const banner = document.getElementById('queueBanner');
            banner.style.display = 'block';
            document.getElementById('tokenNum').textContent = data.patientToken;
            document.getElementById('currentNum').textContent = data.currentToken;
            const ahead = Math.max(0, data.patientToken - data.currentToken);
            document.getElementById('aheadNum').textContent = ahead;
            document.getElementById('qTime').textContent = \`~ \${ahead * 10} mins\`;
        });
    }

    function logout() { localStorage.clear(); window.location.href='/login'; }
  </script>
</body>
</html>`;

fs.writeFileSync(filePath, baseCode);
console.log('Patient Dashboard Ultimate Restoration Successful.');
