const fs = require('fs');
const f = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\labdashboard.html';
let content = fs.readFileSync(f, 'utf8');

// 1. Remove the Grid Layout CSS
content = content.replace(/\/\* 🏗️ SYSTEMATIZED UNIVERSAL GRID LAYOUT \*\/[\s\S]*?\.ui-title i \{[\s\S]*?\}/g, '');
content = content.replace(/\.stats-summary-vertical \{[\s\S]*?\}/g, '');
content = content.replace(/\.stats-summary-vertical \.stat-card \{[\s\S]*?\}/g, '');

const cleanLabContent = `
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card pending">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-label">Pending Requests</div>
                <div class="stat-val" id="statPending">—</div>
            </div>
            <div class="stat-card completed">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-label">Completed Today</div>
                <div class="stat-val" id="statCompleted">—</div>
            </div>
            <div class="stat-card total">
                <div class="stat-icon"><i class="fas fa-vial"></i></div>
                <div class="stat-label">Total Active</div>
                <div class="stat-val" id="statTotal">—</div>
            </div>
        </div>

        <!-- ── Pending / Active Requests ── -->
        <div class="section-card" id="pending-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-vial"></i> Doctor-Requested Lab Tests
                </h2>
                <button class="btn btn-refresh" onclick="loadRequests()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="requests-list" id="requestsList">
                <div class="empty-state">
                    <div class="loading-dots"><span></span><span></span><span></span></div>
                    <p style="margin-top:1rem">Loading requests...</p>
                </div>
            </div>
        </div>

        <!-- ── Today's Completed Reports ── -->
        <div class="section-card" id="today-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-file-medical-alt"></i> Today's Completed Reports
                </h2>
                <button class="btn btn-refresh" onclick="loadTodayReports()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="table-wrap">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Patient</th>
                            <th>Test</th>
                            <th>Referred by</th>
                            <th>Completed At</th>
                            <th>Report</th>
                        </tr>
                    </thead>
                    <tbody id="todayReportsList">
                        <tr><td colspan="6" style="text-align:center; color:var(--gray); padding:2rem;">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>`;

const startMark = '<!-- Stats -->';
const endMark = '</div><!-- /main-content -->';

const startIndex = content.indexOf(startMark);
const endIndex = content.indexOf(endMark);

if (startIndex !== -1 && endIndex !== -1) {
    const finalContent = content.substring(0, startIndex) + cleanLabContent + '\n\n    ' + content.substring(endIndex);
    fs.writeFileSync(f, finalContent);
    console.log('Lab Dashboard Pure Revert Successful');
} else {
    // If original markers not found, try searching for the grid layout start
    const layoutStart = '<div class="dashboard-layout">';
    const lstartIndex = content.indexOf(layoutStart);
    if (lstartIndex !== -1) {
         const finalContent = content.substring(0, lstartIndex) + cleanLabContent + '\n\n    ' + content.substring(endIndex);
         fs.writeFileSync(f, finalContent);
         console.log('Lab Dashboard Layout Revert Successful');
    } else {
         console.log('Could not find markers for Lab revert');
    }
}
