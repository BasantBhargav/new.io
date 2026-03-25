const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Transforming Patient Dashboard to Professional Top-Nav (Doctor-like) Style...');

// 1. Professional Top-Nav CSS (Matching the Screenshot style)
const topNavStyles = `
    /* ─── PROFESSIONAL TOP-NAV THEME (DOCTOR DASHBOARD STYLE) ─────────────────────────────── */
    :root {
      --primary: #4361ee;
      --primary-soft: rgba(67, 97, 238, 0.1);
      --secondary: #7209b7;
      --accent: #f72585;
      --success: #4cc9f0;
      --warning: #f39c12;
      --white: #ffffff;
      --bg-gradient: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
      --glass-bg: rgba(255, 255, 255, 0.85);
      --nav-blur: blur(12px);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.05);
      --shadow-strong: 0 10px 30px rgba(67, 97, 238, 0.1);
    }

    body {
        background: var(--bg-gradient);
        min-height: 100vh;
        overflow-x: hidden;
    }

    /* ──── MODERN HEADER ──── */
    .header {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: var(--glass-bg);
        backdrop-filter: var(--nav-blur);
        -webkit-backdrop-filter: var(--nav-blur);
        border-bottom: 1px solid rgba(67, 97, 238, 0.08);
        padding: 0.8rem 2.5rem;
        box-shadow: var(--shadow-soft);
    }

    .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        color: var(--primary);
    }

    .nav-menu {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        background: rgba(67, 97, 238, 0.03);
        padding: 0.4rem 1.2rem;
        border-radius: 50px;
        border: 1px solid rgba(67, 97, 238, 0.05);
    }

    .nav-menu a {
        text-decoration: none;
        color: var(--gray);
        font-weight: 600;
        font-size: 0.92rem;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        transition: var(--transition);
    }

    .nav-menu a:hover {
        color: var(--primary);
        background: rgba(67, 97, 238, 0.05);
    }

    .nav-menu a.active {
        color: var(--primary);
        background: white;
        box-shadow: var(--shadow-soft);
    }

    .user-profile-top {
        display: flex;
        align-items: center;
        gap: 1.2rem;
    }

    .user-details {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.4rem 0.8rem;
        background: white;
        border-radius: 50px;
        box-shadow: var(--shadow-sm);
        border: 1px solid rgba(67, 97, 238, 0.05);
    }

    .user-avatar-circle {
        width: 38px; height: 38px;
        background: var(--gradient-primary);
        color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700;
        font-size: 1rem;
    }

    .user-texts { line-height: 1.2; }
    .user-texts strong { font-size: 0.9rem; color: var(--dark); display:block; }
    .user-texts span { font-size: 0.75rem; color: var(--gray); }

    .btn-logout {
        padding: 0.6rem 1.25rem;
        background: var(--gradient-primary);
        color: white;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.88rem;
        display: flex; align-items: center; gap: 0.6rem;
        box-shadow: 0 4px 12px rgba(67,97,238,0.25);
    }

    /* ──── PAGE HEADER (DOCTOR STYLE) ──── */
    .page-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2.5rem;
    }

    .page-hero-title h1 {
        font-size: 2.4rem;
        font-weight: 800;
        color: var(--dark);
        background: linear-gradient(to right, #1e293b, #4361ee);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .date-card {
        background: white;
        padding: 0.8rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-soft);
        display: flex; align-items: center; gap: 0.8rem;
        color: var(--primary);
        font-weight: 600;
        border: 1px solid rgba(67, 97, 238, 0.05);
    }

    /* ──── MAIN CONTENT ──── */
    .main-container {
        padding: 2.5rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    /* ──── CARDS REFINEMENT (DOCTOR STYLE) ──── */
    .stat-card {
        border-top: 4px solid var(--primary);
        background: white;
        transition: transform 0.3s ease;
    }
    .stat-card:nth-child(2) { border-top-color: var(--secondary); }
    .stat-card:nth-child(3) { border-top-color: var(--accent); }
    .stat-card:nth-child(4) { border-top-color: var(--success); }

    .stat-card .icon {
        width: 54px; height: 54px;
        border-radius: 14px;
        margin-bottom: 1.2rem;
    }

    .reports-section, .upload-section {
        border: none;
        box-shadow: var(--shadow-strong);
        border-radius: 20px;
    }

    /* Sidebar logic override */
    .sidebar { display: none !important; }
    .main-content-layout { margin-left: 0 !important; }
    .content-wrapper { padding: 0 !important; max-width: none !important; }
`;

// Re-injection
if (content.includes('</style>')) {
    content = content.replace('</style>', topNavStyles + '\n    </style>');
}

// Full Header Replacement - Modern Top Nav
const professionalHeader = `
  <header class="header">
    <div class="nav-container">
      <a href="/" class="logo">
        <i class="fas fa-heartbeat"></i>
        <span>MediVault</span>
      </a>

      <nav class="nav-menu">
        <a href="#stats" class="active">Overview</a>
        <a href="#appointmentsSection">Appointments</a>
        <a href="#reports">Records</a>
        <a href="#prescription">Prescriptions</a>
        <a href="#labTests">Lab Results</a>
      </nav>

      <div class="user-profile-top">
        <div class="user-details">
          <div class="user-avatar-circle" id="userInitialTop">P</div>
          <div class="user-texts">
            <strong id="userNameTextTop">Patient</strong>
            <span>Active Account</span>
          </div>
        </div>
        <button class="btn btn-logout" onclick="logout()">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>
`;

content = content.replace(/<body>[\s\S]*?<div class="main-content-layout">/, '<body>\n  ' + professionalHeader + '\n  <div class="main-container">\n    ');

// Page Hero
const pageHero = `
      <!-- Page Hero Section -->
      <div class="page-hero">
        <div class="page-hero-title">
          <h1 id="heroTitle">Welcome Back, Patient</h1>
          <p>Access your medical summary and health recommendations</p>
        </div>
        <div class="date-card" id="dateDisplayTop">
          <i class="fas fa-calendar-day"></i>
          <span id="todayDateVal">—</span>
        </div>
      </div>
`;

content = content.replace(/<div class="page-title">[\s\S]*?<\/div>/, pageHero);

// Logic Update
const topNavScript = `
  <script>
    // Top Nav Logic
    document.addEventListener('DOMContentLoaded', () => {
        const userName = localStorage.getItem('userName') || 'Patient';
        if (document.getElementById('userNameTextTop')) document.getElementById('userNameTextTop').textContent = userName;
        if (document.getElementById('userInitialTop')) document.getElementById('userInitialTop').textContent = userName.charAt(0).toUpperCase();
        if (document.getElementById('heroTitle')) document.getElementById('heroTitle').textContent = \`Welcome Back, \${userName}\`;
        
        // Date update
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('todayDateVal').textContent = new Date().toLocaleDateString('en-US', options);

        // Header scroll behavior
        const header = document.querySelector('.header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.style.padding = "0.5rem 2.5rem";
                header.style.boxShadow = "var(--shadow-strong)";
            } else {
                header.style.padding = "0.8rem 2.5rem";
                header.style.boxShadow = "var(--shadow-soft)";
            }
        });

        // Active link highlighting
        const topNavLinks = document.querySelectorAll('.nav-menu a');
        window.addEventListener('scroll', () => {
            let current = 'stats';
            const sIds = ['stats', 'appointmentsSection', 'reports', 'prescription', 'labTests'];
            sIds.forEach(id => {
                const el = document.getElementById(id);
                if (el && window.pageYOffset >= el.offsetTop - 120) {
                    current = id;
                }
            });

            topNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    });
  </script>
`;

if (!content.includes('heroTitle')) {
    content = content.replace('</body>', topNavScript + '\n</body>');
}

fs.writeFileSync(filePath, content);
console.log('Patient Dashboard Transformed to Professional Top-Nav (Doctor-Style) Successful.');
