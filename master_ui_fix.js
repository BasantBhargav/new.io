const fs = require('fs');
const path = require('path');

const DASHBOARDS = [
  'doctordashboard.html',
  'labdashboard.html',
  'patientdashboard.html',
  'hospitaldashboard.html'
];

const BASE_PATH = 'c:\\Users\\HP\\Desktop\\express_harry\\front';

function systematizeDashboard(filename) {
    const filePath = path.join(BASE_PATH, filename);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Systematizing ${filename}...`);

    // 1. Inject or Update Universal Dashboard CSS
    const gridCSS = `
    /* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT */
    .dashboard-layout {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .dashboard-main-body {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .dashboard-sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: sticky;
      top: 90px;
    }

    @media (max-width: 1200px) {
      .dashboard-layout {
        grid-template-columns: 1fr;
      }
      .dashboard-sidebar {
        position: static;
      }
    }

    /* Refined Stat Cards for Grid consistency */
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Uniform Section Style */
    .ui-section {
      background: var(--white);
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(67, 97, 238, 0.08);
      transition: var(--transition);
    }
    .ui-section:hover { box-shadow: var(--shadow-md); }

    .ui-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }
    .ui-title i {
      color: var(--primary);
      background: rgba(67, 97, 238, 0.1);
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px; font-size: 1rem;
    }
    `;

    if (!content.includes('.dashboard-layout')) {
        content = content.replace('</style>', gridCSS + '\n    </style>');
    }

    // 2. Specific Restructuring per dashboard
    if (filename === 'doctordashboard.html') {
        content = restructureDoctor(content);
    } else if (filename === 'labdashboard.html') {
        content = restructureLab(content);
    } else if (filename === 'patientdashboard.html') {
        content = restructurePatient(content);
    } else if (filename === 'hospitaldashboard.html') {
        content = restructureHospital(content);
    }

    fs.writeFileSync(filePath, content);
}

function restructureDoctor(content) {
    // Already did some work, but let's make it more solid
    // Grouping: Left [Appointments, Availability], Right [Stats Summary Mini, Quick Actions, Lab Requests, Search]
    
    // Check if already restructured by previous script
    if (content.includes('dashboard-main-grid')) {
        content = content.replace(/dashboard-main-grid/g, 'dashboard-layout');
        content = content.replace(/dashboard-left-col/g, 'dashboard-main-body');
        content = content.replace(/dashboard-right-col/g, 'dashboard-sidebar');
    }
    return content;
}

function restructureLab(content) {
    // Left: ActiveRequests. Right: TodayReports, Stats?
    if (content.includes('dashboard-layout')) return content;

    const statsGrid = content.match(/<div class="stats-grid">[\s\S]*?<\/div>/);
    const activeReqs = content.match(/<div class="section-card" id="pending-section">[\s\S]*?<\/div>\s*<\/div>/);
    const todayReports = content.match(/<div class="section-card" id="today-section">[\s\S]*?<\/div>\s*<\/div>/);

    if (statsGrid && activeReqs && todayReports) {
        let newBody = `
        <div class="dashboard-layout">
            <div class="dashboard-main-body">
                ${activeReqs[0]}
                ${todayReports[0]}
            </div>
            <div class="dashboard-sidebar">
                <div class="ui-section">
                    <h3 class="ui-title"><i class="fas fa-chart-pie"></i> Statistics</h3>
                    ${statsGrid[0].replace('stats-grid', 'stats-summary-vertical')}
                </div>
            </div>
        </div>`;
        
        // Replace styles to handle vertical stats in sidebar
        content = content.replace('</style>', `
        .stats-summary-vertical { display: flex; flex-direction: column; gap: 1rem; }
        .stats-summary-vertical .stat-card { padding: 1.2rem; border-radius: 12px; }
        </style>`);

        content = content.replace(/<div class="stats-grid">[\s\S]*?<div class="section-card" id="today-section">[\s\S]*?<\/div>\s*<\/div>/, newBody);
    }
    return content;
}

function restructurePatient(content) {
    // Left: Appointments, LabResults. Right: Quick Lookup, Stats.
    if (content.includes('dashboard-layout')) return content;

    const sections = {
        appointments: content.match(/<div class="search-section" id="upcoming-appointments">[\s\S]*?<\/div>\s*<\/div>/),
        labTests: content.match(/<div class="search-section" id="lab-results-section">[\s\S]*?<\/div>\s*<\/div>/),
        stats: content.match(/<div class="stats-grid">[\s\S]*?<\/div>/)
    };

    if (sections.appointments && sections.labTests && sections.stats) {
        let newBody = `
        <div class="dashboard-layout">
            <div class="dashboard-main-body">
                ${sections.appointments[0]}
                ${sections.labTests[0]}
            </div>
            <div class="dashboard-sidebar">
                 <div class="ui-section">
                    <h3 class="ui-title"><i class="fas fa-heartbeat"></i> Health Summary</h3>
                    ${sections.stats[0].replace('stats-grid', 'stats-summary-vertical')}
                </div>
                <div class="ui-section">
                    <h3 class="ui-title"><i class="fas fa-lightbulb"></i> Wellness Tip</h3>
                    <p style="font-size:0.9rem; color:var(--gray)">Drink at least 8 glasses of water today and remember to stay active!</p>
                </div>
            </div>
        </div>`;

        content = content.replace('</style>', `
        .stats-summary-vertical { display: flex; flex-direction: column; gap: 1rem; }
        </style>`);

        // We need to find the correct insertion point
        const target = content.match(/<div class="stats-grid">[\s\S]*?<div class="search-section" id="lab-results-section">[\s\S]*?<\/div>\s*<\/div>/);
        if (target) {
            content = content.replace(target[0], newBody);
        }
    }
    return content;
}

function restructureHospital(content) {
    // Left: Patient Lookup, Appointments. Right: Stats, Quick Buttons.
     if (content.includes('dashboard-layout')) return content;
     
     const sections = {
        stats: content.match(/<div class="stats-grid">[\s\S]*?<\/div>/),
        lookup: content.match(/<div class="upload-section" id="lookupSection">[\s\S]*?<\/div>/),
        upcoming: content.match(/<div class="search-section" id="upcomingSection">[\s\S]*?<\/div>/)
     };

     if (sections.stats && sections.lookup && sections.upcoming) {
         let newBody = `
         <div class="dashboard-layout">
            <div class="dashboard-main-body">
                ${sections.lookup[0]}
                ${sections.upcoming[0]}
            </div>
            <div class="dashboard-sidebar">
                <div class="ui-section">
                    <h3 class="ui-title"><i class="fas fa-hospital-alt"></i> Overview</h3>
                    ${sections.stats[0].replace('stats-grid', 'stats-summary-vertical')}
                </div>
            </div>
         </div>`;

         content = content.replace('</style>', `
         .stats-summary-vertical { display: flex; flex-direction: column; gap: 1rem; }
         </style>`);

         const target = content.match(/<div class="stats-grid">[\s\S]*?<div class="search-section" id="upcomingSection">[\s\S]*?<\/div>/);
         if (target) {
             content = content.replace(target[0], newBody);
         }
     }
     return content;
}

DASHBOARDS.forEach(systematizeDashboard);
console.log('All Dashboards Systematized and Unified.');
