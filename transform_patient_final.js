const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Transforming Patient Dashboard to Sidebar Layout (Final)...');

// 1. Add Professional Sidebar CSS (Matching Lab Style exactly)
const sidebarStyles = `
    /* ─── SIDEBAR & MAIN LAYOUT (LAB STYLE) ─────────────────────────────── */
    .sidebar {
        width: 260px;
        background: var(--white);
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
        border-right: 1px solid rgba(67,97,238,0.1);
        padding: 2rem 1.2rem;
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        transition: transform 0.3s ease;
    }

    .logo-container {
        font-size: 1.5rem;
        font-weight: 800;
        text-decoration: none;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 2.5rem;
        padding-left: 0.5rem;
    }

    .logo-container i {
        font-size: 1.6rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .nav-label {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--gray);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        padding: 0 1rem;
        margin-bottom: 0.6rem;
        opacity: 0.8;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.9rem 1.1rem;
        color: var(--gray);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: all 0.25s ease;
        margin-bottom: 0.4rem;
        font-weight: 500;
        font-size: 0.92rem;
    }

    .nav-link i { 
        width: 20px; 
        text-align: center; 
        font-size: 1.1rem; 
        transition: transform 0.2s ease;
    }

    .nav-link:hover { 
        background: rgba(67,97,238,0.06); 
        color: var(--primary); 
        transform: translateX(4px);
    }
    
    .nav-link:hover i { transform: scale(1.1); }

    .nav-link.active {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 6px 15px rgba(67,97,238,0.25);
        font-weight: 600;
    }
    
    .nav-link.active i { color: white; }

    .sidebar-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(67,97,238,0.08);
    }

    .user-badge {
        background: rgba(67,97,238,0.06);
        border-radius: var(--radius-sm);
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(67,97,238,0.05);
    }

    .user-badge p { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.3rem; }
    .user-badge strong { font-size: 0.95rem; color: var(--primary); display:block; overflow: hidden; text-overflow: ellipsis; }

    .logout-sidebar {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.9rem 1.1rem;
        color: var(--accent);
        text-decoration: none;
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 0.9rem;
        transition: var(--transition);
        border: 1.5px solid rgba(247,37,133,0.15);
        justify-content: center;
    }
    .logout-sidebar:hover { background: rgba(247,37,133,0.06); transform: translateY(-2px); }

    .main-content {
        margin-left: 260px;
        padding: 2.5rem 3.5rem;
        min-height: 100vh;
        background: #f8fafc;
        transition: margin-left 0.3s ease;
    }

    /* ──── MOBILE HEADER ──── */
    .mobile-header {
        display: none;
        position: fixed;
        top: 0; left: 0; right: 0;
        background: white;
        padding: 1rem 1.5rem;
        z-index: 999;
        box-shadow: var(--shadow-sm);
        justify-content: space-between;
        align-items: center;
    }

    @media (max-width: 950px) {
        .sidebar { transform: translateX(-100%); width: 280px; }
        .sidebar.active { transform: translateX(0); box-shadow: 0 0 30px rgba(0,0,0,0.15); }
        .main-content { margin-left: 0; padding: 5rem 1.5rem 2rem; }
        .mobile-header { display: flex; }
        .logo-container { margin-bottom: 1.5rem; }
    }
`;

// Replace internal styles
if (content.includes('</style>')) {
    content = content.replace('</style>', sidebarStyles + '\n    </style>');
}

// Sidebar HTML
const sidebarHtml = `
  <!-- Mobile Header -->
  <div class="mobile-header">
    <a href="#" class="logo" style="margin:0"><i class="fas fa-heartbeat"></i> MediVault</a>
    <button class="btn" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
  </div>

  <!-- Sidebar -->
  <div class="sidebar" id="sidebar">
    <a href="#" class="logo-container"><i class="fas fa-heartbeat"></i> MediVault</a>

    <span class="nav-label">Main Dashboard</span>
    <a href="#stats" class="nav-link active"><i class="fas fa-home"></i> Overview</a>
    <a href="#searchSection" class="nav-link"><i class="fas fa-search-location"></i> Find Doctors</a>
    <a href="#appointmentsSection" class="nav-link"><i class="fas fa-calendar-check"></i> Appointments</a>
    <a href="#labTests" class="nav-link"><i class="fas fa-flask"></i> Lab Tracking</a>
    <a href="#reports" class="nav-link"><i class="fas fa-file-invoice"></i> My Records</a>
    <a href="#prescription" class="nav-link"><i class="fas fa-prescription-bottle-alt"></i> Prescriptions</a>

    <div class="sidebar-footer">
      <div class="user-badge">
        <p>Patient Account</p>
        <strong id="sidebarUserName">Loading...</strong>
      </div>
      <a href="#" onclick="logout()" class="logout-sidebar">
        <i class="fas fa-sign-out-alt"></i> Logout Search
      </a>
    </div>
  </div>
`;

// Injections
if (!content.includes('id="sidebar"')) {
    content = content.replace('<body>', '<body>\n  ' + sidebarHtml);
}

// Wrap Content
if (content.includes('<header class="header">')) {
    content = content.replace('<header class="header">', '<header class="header" style="display:none">');
}

if (content.includes('class="main-container"')) {
    content = content.replace('class="main-container"', 'class="main-content"');
}

// IDs fix
if (content.includes('class="stats-grid"')) {
    content = content.replace('class="stats-grid"', 'class="stats-grid" id="stats"');
}

// Logic
const sidebarLogic = `
  <script>
    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('active');
    }

    // Sidebar active tracking
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = 'stats';
        const sections = ['stats', 'searchSection', 'appointmentsSection', 'labTests', 'reports', 'prescription'];
        
        sections.forEach(s => {
            const el = document.getElementById(s);
            if (el && window.pageYOffset >= el.offsetTop - 150) {
                current = s;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    document.getElementById('sidebarUserName').textContent = localStorage.getItem('userName') || 'Patient';
  </script>
`;

if (!content.includes('toggleSidebar')) {
    content = content.replace('</body>', sidebarLogic + '\n</body>');
}

fs.writeFileSync(filePath, content);
console.log('Patient Dashboard Transformed to Sidebar (Lab Style) Successful.');
