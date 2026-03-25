const fs = require('fs');
const path = require('path');

const BASE_PATH = 'c:\\Users\\HP\\Desktop\\express_harry\\front';

function cleanStats(statsHtml) {
    return statsHtml.replace('stats-summary-vertical', 'stats-grid');
}

function revertPatient() {
    const f = path.join(BASE_PATH, 'patientdashboard.html');
    if (!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    
    // Remove CSS
    c = c.replace(/\/\* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT \*\/[\s\S]*?\.ui-title i \{[\s\S]*?\}/g, '');
    c = c.replace(/\.stats-summary-vertical \{[\s\S]*?\}/g, '');

    const layoutStart = '<div class="dashboard-layout">';
    const layoutEnd = '<!-- Analytics Modal -->'; // Modal or Footer
    const lstartIndex = c.indexOf(layoutStart);
    if (lstartIndex === -1) return;

    // We need to re-assemble the original flow
    // In Patient Dashboard: SearchSection, StatsGrid, AppointmentsSection, LabTests, Upload, Reports, Prescription.
    // I'll recover them from the current content
    const searchSection = c.match(/<div class="reports-section" id="searchSection"[\s\S]*?<\/div>\s*<\/div>/);
    const statsGrid = c.match(/<div class="stats-summary-vertical">([\s\S]*?)<\/div>/);
    const appSection = c.match(/<div class="reports-section" id="appointmentsSection"[\s\S]*?<\/div>\s*<\/div>/);
    const labSection = c.match(/<div class="reports-section" id="labTests"[\s\S]*?<\/div>\s*<\/div>/);
    const uploadSection = c.match(/<div class="upload-section" id="upload">[\s\S]*?<\/div>/);
    const reportsSection = c.match(/<div class="reports-section" id="reports">[\s\S]*?<\/div>\s*<\/div>/);
    const presSection = c.match(/<div class="prescription-section" id="prescription">[\s\S]*?<\/div>\s*<\/div>/);

    if (statsGrid && appSection && labSection) {
        let originalFlow = '';
        if (searchSection) originalFlow += searchSection[0] + '\n\n      ';
        originalFlow += `<div class="stats-grid">\n${statsGrid[1]}\n      </div>\n\n      `;
        originalFlow += appSection[0] + '\n\n      ' + labSection[0];
        if (uploadSection) originalFlow += '\n\n      ' + uploadSection[0];
        if (reportsSection) originalFlow += '\n\n      ' + reportsSection[0];
        if (presSection) originalFlow += '\n\n      ' + presSection[0];

        const endIndex = c.indexOf('<!-- Report Modal -->');
        if (endIndex !== -1) {
            c = c.substring(0, lstartIndex) + originalFlow + '\n\n    ' + c.substring(endIndex);
        }
    }
    fs.writeFileSync(f, c);
    console.log('Patient Dashboard Reverted');
}

function revertHospital() {
    const f = path.join(BASE_PATH, 'hospitaldashboard.html');
    if (!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');

    c = c.replace(/\/\* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT \*\/[\s\S]*?\.ui-title i \{[\s\S]*?\}/g, '');
    c = c.replace(/\.stats-summary-vertical \{[\s\S]*?\}/g, '');

    const layoutStart = '<div class="dashboard-layout">';
    const lstartIndex = c.indexOf(layoutStart);
    if (lstartIndex === -1) return;

    const statsGrid = c.match(/<div class="stats-summary-vertical">([\s\S]*?)<\/div>/);
    const lookup = c.match(/<div class="upload-section" id="lookupSection">[\s\S]*?<\/div>/);
    const upcoming = c.match(/<div class="search-section" id="upcomingSection">[\s\S]*?<\/div>/);

    if (statsGrid && lookup && upcoming) {
        let originalFlow = `<div class="stats-grid">\n${statsGrid[1]}\n      </div>\n\n      ` + lookup[0] + '\n\n      ' + upcoming[0];
        const endIndex = c.indexOf('<!-- Footer -->'); // Or any other end marker
        const fallbackEnd = c.indexOf('<!-- Navigation Scripts -->');
        const finalEnd = (endIndex !== -1) ? endIndex : (fallbackEnd !== -1 ? fallbackEnd : c.indexOf('</body>'));

        c = c.substring(0, lstartIndex) + originalFlow + '\n\n    ' + c.substring(finalEnd);
    }
    fs.writeFileSync(f, c);
    console.log('Hospital Dashboard Reverted');
}

revertPatient();
revertHospital();
