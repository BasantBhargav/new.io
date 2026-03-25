const fs = require('fs');
const f = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\doctordashboard.html';
let content = fs.readFileSync(f, 'utf8');

const searchSection = `      <!-- Enhanced Search Section -->
      <div class="search-section" style="margin-bottom: 2rem;">
        <h2 class="section-title">
          <i class="fas fa-search"></i>
          Search Patient Records
        </h2>
        <form class="search-form" onsubmit="redirectToPatientReports(event)">
          <div class="search-group">
            <i class="fas fa-user-tag"></i>
            <input type="text" id="patientId" placeholder="Enter Patient User ID (e.g. 1, 2, 3)" required>
          </div>
          <button type="submit" class="search-btn">
            <i class="fas fa-search"></i>
            <span>Search Records</span>
          </button>
        </form>
      </div>`;

if (!content.includes('id="patientId"')) {
    content = content.replace('<!-- Enhanced Search Section -->', searchSection);
    fs.writeFileSync(f, content);
    console.log('Search section restored');
} else {
    console.log('Search section already exists');
}
