const fs = require('fs');
const path = require('path');

function restructureDoctorDashboard() {
    const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\doctordashboard.html';
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add Dashboard Grid Styles
    const newStyles = `
    /* 🏗️ SYSTEMATIZED GRID LAYOUT */
    .dashboard-main-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }

    .dashboard-left-col {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .dashboard-right-col {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: sticky;
      top: 90px;
    }

    @media (max-width: 1100px) {
      .dashboard-main-grid {
        grid-template-columns: 1fr;
      }
      .dashboard-right-col {
        position: static;
      }
    }

    /* Refined Section Title */
    .section-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--dark);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .section-title i {
      color: var(--primary);
      background: rgba(67, 97, 238, 0.1);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 1.1rem;
    }

    /* Improved Search Section as a Sidebar Widget */
    .sidebar-widget {
      background: var(--white);
      padding: 1.8rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(67, 97, 238, 0.08);
      transition: var(--transition);
    }

    .sidebar-widget:hover {
      box-shadow: var(--shadow-md);
    }
    
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .action-card-mini {
      background: var(--light-gray);
      padding: 1rem;
      border-radius: var(--radius-sm);
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
      border: 1px solid transparent;
    }

    .action-card-mini:hover {
      background: var(--white);
      border-color: var(--primary);
      transform: translateY(-3px);
      box-shadow: var(--shadow-sm);
    }

    .action-card-mini i {
      font-size: 1.4rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .action-card-mini span {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
    }
    `;

    if (!content.includes('.dashboard-main-grid')) {
        content = content.replace('</style>', newStyles + '\n    </style>');
    }

    // 2. Restructure HTML Body
    // Wrap stats section separately
    // Create the grid container
    
    // We need to carefully wrap the sections
    const gridStart = '<div class="dashboard-main-grid">\n        <div class="dashboard-left-col">';
    const gridMid = '</div>\n        <div class="dashboard-right-col">';
    const gridEnd = '</div>\n      </div>';

    // Find the sections
    const sections = {
        appointments: content.match(/<div class="search-section" id="appointmentsSection"[\s\S]*?<\/div>\s*<\/div>/),
        availability: content.match(/<div class="search-section" id="availabilitySection"[\s\S]*?<\/div>/),
        quickActions: content.match(/<div class="quick-actions">[\s\S]*?<\/div>/),
        labRequests: content.match(/<div class="search-section" id="labRequestsSection"[\s\S]*?<\/div>\s*<\/div>/),
        search: content.match(/<!-- Enhanced Search Section -->[\s\S]*?<\/form>\s*<\/div>/)
    };

    if (sections.appointments && sections.availability && sections.quickActions && sections.labRequests && sections.search) {
        // Build new layout
        const leftCol = `\n          ${sections.appointments[0]}\n          ${sections.availability[0]}`;
        const rightCol = `\n          <div class="sidebar-widget">\n            <h3 class="section-title" style="font-size:1.1rem; margin-bottom:1rem"><i class="fas fa-bolt" style="width:30px;height:30px;font-size:0.9rem"></i> Quick Actions</h3>\n            <div class="quick-actions-grid">\n              <div class="action-card-mini" onclick="document.getElementById('patientId').focus()">\n                <i class="fas fa-search"></i>\n                <span>Find Patient</span>\n              </div>\n              <div class="action-card-mini" onclick="window.location.href='/prescription.html'">\n                <i class="fas fa-prescription"></i>\n                <span>New RX</span>\n              </div>\n              <div class="action-card-mini" onclick="showAnalytics()">\n                <i class="fas fa-chart-line"></i>\n                <span>Analytics</span>\n              </div>\n            </div>\n          </div>\n          ${sections.labRequests[0]}\n          <div class="sidebar-widget">\n            ${sections.search[0]}\n          </div>`;

        const newMainContent = gridStart + leftCol + gridMid + rightCol + gridEnd;

        // Replace the old block (from quick-actions to the end of search section)
        const blockToReplaceRegex = /<div class="quick-actions">[\s\S]*?<!-- Enhanced Search Section -->[\s\S]*?<\/form>\s*<\/div>/;
        content = content.replace(blockToReplaceRegex, newMainContent);
        
        fs.writeFileSync(filePath, content);
        console.log('Doctor Dashboard Systematized');
    } else {
        console.log('Could not find all sections for restructuring');
    }
}

restructureDoctorDashboard();
