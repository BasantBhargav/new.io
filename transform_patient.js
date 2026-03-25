const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Transforming Patient Dashboard to Sidebar Layout...');

// 1. Add Sidebar Styles
const sidebarStyles = `
    /* ─── SIDEBAR (UNIFIED WITH LAB) ─────────────────────────────── */
    .sidebar {
        width: 260px;
        background: var(--white);
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
        border-right: 1px solid rgba(67,97,238,0.1);
        padding: 2rem 1.2rem;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        z-index: 1000;
    }

    .logo-container {
        font-size: 1.5rem;
        font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 2.5rem;
        text-decoration: none;
    }

    .logo-container i {
        font-size: 1.6rem;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .nav-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--gray);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 0 0.8rem;
        margin-bottom: 0.5rem;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.85rem 1rem;
        color: var(--gray);
        text-decoration: none;
        border-radius: var(--radius);
        transition: var(--transition);
        margin-bottom: 0.3rem;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .nav-link i { width: 20px; text-align: center; font-size: 1rem; }

    .nav-link:hover { background: rgba(67,97,238,0.08); color: var(--primary); }
    .nav-link.active {
        background: var(--gradient-primary);
        color: white;
        box-shadow: 0 4px 12px rgba(67,97,238,0.3);
    }

    .sidebar-footer {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(67,97,238,0.1);
    }

    .user-badge {
        background: rgba(67,97,238,0.08);
        border-radius: var(--radius);
        padding: 0.8rem 1rem;
        margin-bottom: 1rem;
    }

    .user-badge p { font-size: 0.75rem; color: var(--gray); margin:0; }
    .user-badge strong { font-size: 0.95rem; color: var(--primary); display:block; }

    .logout-sidebar {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.85rem 1rem;
        color: var(--accent);
        text-decoration: none;
        border-radius: var(--radius);
        font-weight: 600;
        font-size: 0.9rem;
        transition: var(--transition);
        border: 1.5px solid rgba(247,37,133,0.2);
    }
    .logout-sidebar:hover { background: rgba(247,37,133,0.08); }

    /* ─── MAIN CONTENT ADJUSTMENT ────────────────── */
    .main-content {
        margin-left: 260px;
        padding: 2rem 2.5rem;
        min-height: 100vh;
        transition: var(--transition);
    }

    /* Hide Original Header on Desktop */
    @media (min-width: 901px) {
        .original-header { display: none; }
    }

    @media (max-width: 900px) {
        .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
        .sidebar.active { transform: translateX(0); }
        .main-content { margin-left: 0; padding: 1.5rem; }
    }
`;

if (!content.includes('.sidebar')) {
    content = content.replace('</style>', sidebarStyles + '\n    </style>');
}

// 2. Add Sidebar HTML
const sidebarHtml = `
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <a href="#" class="logo-container"><i class="fas fa-heartbeat"></i> MediVault</a>

        <span class="nav-label">Main Menu</span>
        <a href="#stats" class="nav-link active"><i class="fas fa-th-large"></i> Overview</a>
        <a href="#searchSection" class="nav-link"><i class="fas fa-search"></i> Find Care</a>
        <a href="#appointmentsSection" class="nav-link"><i class="fas fa-calendar-check"></i> Appointments</a>
        <a href="#labTests" class="nav-link"><i class="fas fa-flask"></i> Lab Tests</a>
        <a href="#reports" class="nav-link"><i class="fas fa-file-invoice"></i> Reports</a>
        <a href="#prescription" class="nav-link"><i class="fas fa-prescription"></i> Prescriptions</a>

        <div class="sidebar-footer">
            <div class="user-badge">
                <p>Welcome back,</p>
                <strong id="sidebarUserName">Patient</strong>
            </div>
            <a href="#" onclick="logout()" class="logout-sidebar"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </div>
`;

// Insert sidebar after <body> opening tag
if (!content.includes('id="sidebar"')) {
    content = content.replace('<body>', '<body>\n' + sidebarHtml);
}

// 3. Mark Original Header
content = content.replace('<header class="header">', '<header class="header original-header">');

// 4. Update stats section ID 
content = content.replace('<div class="stats-grid">', '<div class="stats-grid" id="stats">');

// 5. Wrap main-container contents in main-content
// Already has a main-container, let's just make it behave like main-content
content = content.replace('class="main-container"', 'class="main-content"');

// 6. Update Sidebar User Name script
const sidebarScript = `
    // Update Sidebar Name
    if (document.getElementById('sidebarUserName')) {
        document.getElementById('sidebarUserName').textContent = localStorage.getItem('userName') || 'Patient';
    }
    
    // Sidebar active link tracking
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = ['stats', 'searchSection', 'appointmentsSection', 'labTests', 'reports', 'prescription'];
        sections.forEach(s => {
            const section = document.getElementById(s);
            if (section) {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 120) {
                    current = s;
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
`;

if (!content.includes('sidebarUserName')) {
    content = content.replace('</script>', sidebarScript + '\n  </script>');
}

fs.writeFileSync(filePath, content);
console.log('Patient Dashboard Transformed Successfully.');
