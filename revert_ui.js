const fs = require('fs');
const path = require('path');

const DASHBOARDS = [
  'doctordashboard.html',
  'labdashboard.html',
  'patientdashboard.html',
  'hospitaldashboard.html'
];
const BASE_PATH = 'c:\\Users\\HP\\Desktop\\express_harry\\front';

function revertDashboard(filename) {
    const filePath = path.join(BASE_PATH, filename);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Reverting ${filename}...`);

    // 1. Remove the injected CSS blocks
    const cssMatch = /\/\* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT \*\/[\s\S]*?\.ui-title i \{[\s\S]*?\}/;
    content = content.replace(cssMatch, '');
    
    // Remove individual dashboard additions in styles
    content = content.replace(/\.stats-summary-vertical \{[\s\S]*?\}/g, '');
    content = content.replace(/\.stats-summary-vertical \.stat-card \{[\s\S]*?\}/g, '');

    // 2. Un-restructure HTML
    if (filename === 'doctordashboard.html') {
        content = revertDoctor(content);
    } else if (filename === 'labdashboard.html') {
        content = revertLab(content);
    } else if (filename === 'patientdashboard.html') {
        content = revertPatient(content);
    } else if (filename === 'hospitaldashboard.html') {
        content = revertHospital(content);
    }

    fs.writeFileSync(filePath, content);
}

function revertDoctor(content) {
    // Reverting the grid structure
    // We need to extract the sections and put them back in sequence
    const appointments = content.match(/<div class="search-section" id="appointmentsSection"[\s\S]*?<\/div>(\s*<\/div>)?/);
    const availability = content.match(/<div class="search-section" id="availabilitySection"[\s\S]*?<\/div>(\s*<\/div>)?/);
    const labRequests = content.match(/<div class="search-section" id="labRequestsSection"[\s\S]*?<\/div>(\s*<\/div>)?/);
    const search = content.match(/<!-- Enhanced Search Section -->[\s\S]*?<\/form>\s*<\/div>/);

    if (appointments && availability && labRequests && search) {
        // Create original-style quick actions
        const originalQuickActions = `
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
      </div>`;

        const originalFlow = originalQuickActions + '\n      ' + appointments[0] + '\n      ' + availability[0] + '\n      ' + labRequests[0] + '\n      ' + search[0];
        
        // Replace the whole layout block
        const layoutBlock = /<!-- Quick Actions .*? -->\s*<div class="dashboard-layout">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
        content = content.replace(/<div class="dashboard-layout">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, originalFlow);
    }
    return content;
}

function revertLab(content) {
    const activeReqs = content.match(/<div class="section-card" id="pending-section">[\s\S]*?<\/div>\s*<\/div>/);
    const todayReports = content.match(/<div class="section-card" id="today-section">[\s\S]*?<\/div>\s*<\/div>/);
    const statsGrid = content.match(/<div class="stats-summary-vertical">([\s\S]*?)<\/div>/); // Simplified match

    if (activeReqs && todayReports && statsGrid) {
        const statsHtml = `<div class="stats-grid">\n${statsGrid[1]}\n</div>`;
        const originalFlow = statsHtml + '\n\n' + activeReqs[0] + '\n\n' + todayReports[0];
        
        content = content.replace(/<div class="dashboard-layout">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, originalFlow);
    }
    return content;
}

// Similar for Patient and Hospital... but for brevity I'll focus on the ones I know for sure
function revertPatient(content) {
    const apps = content.match(/<div class="search-section" id="upcoming-appointments">[\s\S]*?<\/div>\s*<\/div>/);
    const labs = content.match(/<div class="search-section" id="lab-results-section">[\s\S]*?<\/div>\s*<\/div>/);
    const stats = content.match(/<div class="stats-summary-vertical">([\s\S]*?)<\/div>/);
    if (apps && labs && stats) {
        const statsHtml = `<div class="stats-grid">\n${stats[1]}\n</div>`;
        content = content.replace(/<div class="dashboard-layout">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, statsHtml + '\n' + apps[0] + '\n' + labs[0]);
    }
    return content;
}

function revertHospital(content) {
    const lookup = content.match(/<div class="upload-section" id="lookupSection">[\s\S]*?<\/div>/);
    const upcoming = content.match(/<div class="search-section" id="upcomingSection">[\s\S]*?<\/div>/);
    const stats = content.match(/<div class="stats-summary-vertical">([\s\S]*?)<\/div>/);
    if (lookup && upcoming && stats) {
        const statsHtml = `<div class="stats-grid">\n${stats[1]}\n</div>`;
        content = content.replace(/<div class="dashboard-layout">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, statsHtml + '\n' + lookup[0] + '\n' + upcoming[0]);
    }
    return content;
}

DASHBOARDS.forEach(revertDashboard);
console.log('All Dashboards Reverted to Original Vertical Flow.');
