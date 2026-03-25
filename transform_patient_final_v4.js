const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Finalizing Sidebar Layout for Patient Dashboard...');

// 1. Unified Sidebar Styles (Matching Lab style and improved)
const sidebarStyles = `
    /* ─── PROFESSIONAL SIDEBAR LAYOUT ─────────────────────────────── */
    .sidebar {
        width: 260px;
        background: var(--white);
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
        border-right: 1px solid rgba(67,97,238,0.08);
        padding: 2.2rem 1.2rem;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logo-sidebar {
        font-size: 1.5rem;
        font-weight: 800;
        text-decoration: none;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        align-items: center;
        gap: 0.7rem;
        margin-bottom: 2.5rem;
        padding-left: 0.5rem;
    }

    .logo-sidebar i {
        font-size: 1.6rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .nav-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--gray);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 0 1rem;
        margin-bottom: 0.8rem;
        opacity: 0.7;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 1.1rem;
        padding: 0.9rem 1.2rem;
        color: var(--gray);
        text-decoration: none;
        border-radius: var(--radius-sm);
        transition: all 0.2s ease;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .nav-link i { 
        width: 22px; 
        text-align: center; 
        font-size: 1.15rem; 
    }

    .nav-link:hover { 
        background: rgba(67,97,238,0.06); 
        color: var(--primary); 
        transform: translateX(4px);
    }

    .nav-link.active {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 6px 15px rgba(67,97,238,0.3);
        font-weight: 600;
        transform: scale(1.02);
    }
    
    .nav-link.active i { color: white; }

    .sidebar-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(0,0,0,0.05);
    }

    .user-profile-badge {
        background: rgba(67,97,238,0.05);
        border: 1px solid rgba(67,97,238,0.1);
        border-radius: var(--radius-sm);
        padding: 1.1rem;
        margin-bottom: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    .user-avatar-mini {
        width: 40px; height: 40px;
        background: var(--gradient-primary);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700; font-size: 1.1rem;
    }

    .user-text-mini { overflow: hidden; }
    .user-text-mini span { display: block; filter: brightness(0.9); }
    .user-text-mini strong { 
        font-size: 0.95rem; color: var(--primary); 
        display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; 
    }

    .logout-btn-sidebar {
        display: flex; align-items: center; justify-content: center; gap: 0.8rem;
        padding: 0.9rem; color: var(--accent); font-weight: 600; font-size: 0.9rem;
        text-decoration: none; border-radius: var(--radius-sm); border: 2px solid rgba(247,37,133,0.1); transition: var(--transition);
    }
    .logout-btn-sidebar:hover { background: rgba(247,37,133,0.06); border-color: var(--accent); }

    /* ─── MAIN CONTENT ADJUSTMENT ─── */
    .main-content-layout {
        margin-left: 260px;
        min-height: 100vh;
        transition: all 0.3s ease;
    }

    .content-wrapper { padding: 2.5rem 3.5rem; max-width: 1300px; margin: 0 auto; }

    /* ─── MOBILE BAR ─── */
    .mobile-header-bar {
        display: none; position: fixed; top: 0; left: 0; right: 0;
        background: white; padding: 1.2rem; z-index: 1100; box-shadow: var(--shadow-sm);
        justify-content: space-between; align-items: center;
    }

    /* Hide Original Header on Large Screens */
    @media (min-width: 951px) {
        .original-header-nav { display: none !important; }
    }

    @media (max-width: 950px) {
        .sidebar { transform: translateX(-100%); width: 280px; }
        .sidebar.active { transform: translateX(0); box-shadow: 0 0 30px rgba(0,0,0,0.2); }
        .main-content-layout { margin-left: 0; }
        .content-wrapper { padding: 5.5rem 1.5rem 2rem; }
        .mobile-header-bar { display: flex; }
    }
`;

// Injection
if (!content.includes('.sidebar')) {
    content = content.replace('</style>', sidebarStyles + '\n    </style>');
}

// Sidebar HTML
const sidebarHtml = `
  <!-- Mobile Header Bar -->
  <div class="mobile-header-bar">
    <a href="/" class="logo" style="margin:0"><i class="fas fa-heartbeat"></i> MediVault</a>
    <button class="btn" style="padding:0.5rem; background:var(--light-gray)" onclick="togglePatientSidebar()">
      <i class="fas fa-bars"></i>
    </button>
  </div>

  <!-- Main Professional Sidebar -->
  <div class="sidebar" id="patientSidebar">
    <a href="#" class="logo-sidebar"><i class="fas fa-heartbeat"></i> MediVault</a>

    <span class="nav-label">Navigation</span>
    <a href="#stats" class="nav-link active"><i class="fas fa-columns"></i> Dashboard</a>
    <a href="#searchSection" class="nav-link"><i class="fas fa-user-md"></i> Find Care</a>
    <a href="#appointmentsSection" class="nav-link"><i class="fas fa-calendar-alt"></i> Appointments</a>
    <a href="#labTests" class="nav-link"><i class="fas fa-microscope"></i> Lab Tracking</a>
    <a href="#reports" class="nav-link"><i class="fas fa-folder-open"></i> medical Records</a>
    <a href="#prescription" class="nav-link"><i class="fas fa-pills"></i> prescriptions</a>

    <div class="sidebar-footer">
      <div class="user-profile-badge">
         <div class="user-avatar-mini" id="userInitialMini">P</div>
         <div class="user-text-mini">
            <span style="font-size:0.75rem">Logged in as</span>
            <strong id="sidebarUserNameMini">Patient</strong>
         </div>
      </div>
      <a href="#" onclick="logout()" class="logout-btn-sidebar"><i class="fas fa-sign-out-alt"></i> Logout</a>
    </div>
  </div>
`;

// Insert sidebar after <body> opening tag
if (!content.includes('id="patientSidebar"')) {
    content = content.replace('<body>', '<body>\n  ' + sidebarHtml);
}

// Update original header and main container classes
content = content.replace('<header class="header">', '<header class="header original-header-nav" style="display:none">');
content = content.replace('class="main-container"', 'class="main-content-layout"');
content = content.replace('class="dashboard-content"', 'class="content-wrapper"');

// Ensure section IDs exist
if (content.includes('class="stats-grid"')) {
    content = content.replace('class="stats-grid"', 'class="stats-grid" id="stats"');
}

// Functional Logic (Socket logic etc already in file, we just add UI logic)
const sidebarLogic = `
  <script>
    function togglePatientSidebar() {
        document.getElementById('patientSidebar').classList.toggle('active');
    }

    // Sidebar active tracking and smooth scroll
    const patientNavLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let currentSection = 'stats';
        const sectionsId = ['stats', 'searchSection', 'appointmentsSection', 'labTests', 'reports', 'prescription'];
        
        sectionsId.forEach(id => {
            const section = document.getElementById(id);
            if (section && window.pageYOffset >= section.offsetTop - 180) {
                currentSection = id;
            }
        });

        patientNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    });

    // Update Sidebar Profile Info
    document.addEventListener('DOMContentLoaded', () => {
        const name = localStorage.getItem('userName') || 'Patient';
        document.getElementById('sidebarUserNameMini').textContent = name;
        document.getElementById('userInitialMini').textContent = name.charAt(0).toUpperCase();
        
        // Handle close sidebar on link click (mobile)
        if (window.innerWidth <= 950) {
            patientNavLinks.forEach(l => l.addEventListener('click', () => {
                document.getElementById('patientSidebar').classList.remove('active');
            }));
        }
    });
  </script>
`;

if (!content.includes('togglePatientSidebar')) {
    content = content.replace('</body>', sidebarLogic + '\n</body>');
}

fs.writeFileSync(filePath, content);
console.log('Patient Dashboard Converted to Professional Sidebar Sidebar Successful.');
