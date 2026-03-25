const fs = require('fs');
const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Restoring Appointment Booking & Queue Features to Patient Dashboard...');

// 1. Add Socket.io script to head
if (!content.includes('/socket.io/socket.io.js')) {
    content = content.replace('<!-- Font Awesome -->', '<script src="/socket.io/socket.io.js"></script>\n  <!-- Font Awesome -->');
}

// 2. Add primary-soft variable
if (!content.includes('--primary-soft')) {
    content = content.replace('--radius: 12px;', '--radius: 12px;\n      --primary-soft: rgba(67, 97, 238, 0.1);');
}

// 3. Inject Search & Booking Section (Find Care)
const searchSection = `
      <!-- 🏥 SEARCH & BOOKING SECTION -->
      <div class="upload-section" id="searchSection" style="border: 2px solid var(--primary-soft); margin-bottom: 2rem;">
        <h2 class="section-title"><i class="fas fa-search"></i> Find Doctors & Laboratories</h2>
        <div class="upload-form">
          <div class="form-row">
            <div class="form-group">
              <label>Search For</label>
              <select id="searchType" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 12px;">
                <option value="doctor">Doctors</option>
                <option value="hospital">Hospitals</option>
                <option value="laboratory">Laboratories</option>
              </select>
            </div>
            <div class="form-group">
              <label>Specialization / City</label>
              <input type="text" id="searchParam" placeholder="e.g. Cardio, Dentist, Mumbai" style="width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 12px;">
            </div>
          </div>
          <div style="display: flex; gap: 1rem;">
            <button class="upload-btn" onclick="performSearch()" style="flex: 1; padding: 1rem; border-radius: 12px;"><i class="fas fa-search"></i> Search Now</button>
            <button class="upload-btn" onclick="findNearby()" style="flex: 1; padding: 1rem; border-radius: 12px; background: var(--gradient-secondary);">
                <i class="fas fa-location-arrow"></i> Find Nearby
            </button>
          </div>
        </div>
        <div id="searchResults" class="reports-list" style="margin-top:2rem; display:none;"></div>
      </div>
`;

if (!content.includes('searchSection')) {
    content = content.replace('<div class="stats-grid">', searchSection + '\n      <div class="stats-grid">');
}

// 4. Inject Queue Tracking Banner
const queueBanner = `
      <!-- 📅 UPCOMING APPOINTMENTS & QUEUE -->
      <div class="reports-section" id="appointmentsSection">
        <h2 class="section-title"><i class="fas fa-calendar-check"></i> Upcoming Appointments</h2>
        
        <!-- Live Queue Tracking Banner -->
        <div id="queueBanner" style="display: none; background: var(--gradient-primary); color: white; padding: 2rem; border-radius: 15px; margin-bottom: 2rem; box-shadow: var(--shadow-lg);">
           <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                 <h3>Live Queue Tracking</h3>
                 <p id="queueDoc" style="opacity:0.9">Consultation in progress...</p>
              </div>
              <div id="qTime" style="font-weight: 800; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 30px;">~ 0 mins wait</div>
           </div>
           <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1.2rem; border-radius: 12px;">
                 <div style="font-size:0.75rem; text-transform:uppercase;">Your Token</div>
                 <div id="tokenNum" style="font-size: 2.2rem; font-weight: 900;">0</div>
              </div>
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1.2rem; border-radius: 12px;">
                 <div style="font-size:0.75rem; text-transform:uppercase;">Current</div>
                 <div id="currentNum" style="font-size: 2.2rem; font-weight: 900;">0</div>
              </div>
              <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 1.2rem; border-radius: 12px;">
                 <div style="font-size:0.75rem; text-transform:uppercase;">Ahead</div>
                 <div id="aheadNum" style="font-size: 2.2rem; font-weight: 900;">0</div>
              </div>
           </div>
        </div>

        <div id="appointmentList" class="reports-list"></div>
      </div>
`;

if (!content.includes('appointmentsSection')) {
    content = content.replace('<div class="upload-section" id="upload">', queueBanner + '\n      <div class="upload-section" id="upload">');
}

// 5. Inject Lab Tests Tracking Section
const labSection = `
      <!-- 🔬 LAB TESTS TRACKING -->
      <div class="reports-section" id="labTests" style="border-left: 6px solid var(--accent);">
        <h2 class="section-title"><i class="fas fa-microscope"></i> Lab Tests Tracking</h2>
        <div id="patientLabList" class="reports-list">
             <p style="text-align:center; color:gray; padding:2rem;">Checking for active lab requests...</p>
        </div>
      </div>
`;

if (!content.includes('labTests')) {
    content = content.replace('<div class="reports-section" id="reports">', labSection + '\n      <div class="reports-section" id="reports">');
}

// 6. JavaScript Functions
const additionalJS = `
    // --- ADVANCED MEDICAL FEATURES ---
    async function performSearch() {
        const type = document.getElementById('searchType').value;
        const q = document.getElementById('searchParam').value;
        const results = document.getElementById('searchResults');
        results.style.display = 'block';
        results.innerHTML = '<p style="text-align:center">Finding clinicians...</p>';
        try {
            const res = await fetch(\`/api/search?type=\${type}&q=\${q}\`);
            const data = await res.json();
            if (data.success && data.results.length > 0) {
                results.innerHTML = data.results.map(r => \`
                    <div class="report-item">
                        <div class="report-details">
                            <div class="report-type">\${r.name}</div>
                            <div class="report-date">\${r.specialization || r.location?.city || 'Healthcare Provider'}</div>
                        </div>
                        <button class="upload-btn" onclick="bookAppointment('\${r._id}', '\${type}', '\${r.name}')">Book Appointment</button>
                    </div>\`).join('');
            } else {
                results.innerHTML = '<p style="text-align:center; color:gray">No active results found.</p>';
            }
        } catch(e) { console.error(e); }
    }

    async function bookAppointment(id, type, name) {
        if(!confirm(\`Do you want to request an appointment with \${name}?\`)) return;
        try {
            const res = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: id, type })
            });
            const data = await res.json();
            if(data.success) {
                alert('✅ Appointment Requested Successfully!');
                loadAppointments();
            } else { alert('❌ Error: ' + data.message); }
        } catch(e) { alert('Booking failed.'); }
    }

    async function loadAppointments() {
        try {
            const res = await fetch('/api/patient-appointments');
            const data = await res.json();
            if(data.success) {
                const list = document.getElementById('appointmentList');
                if(data.appointments.length === 0) {
                    list.innerHTML = '<p style="text-align:center; color:gray">No active appointments.</p>';
                } else {
                   list.innerHTML = data.appointments.map(a => \`
                    <div class="report-item">
                        <div class="report-details">
                            <div class="report-type">Dr. \${a.doctorId?.name || 'Practitioner'}</div>
                            <div class="report-date">Status: <span style="color:var(--primary)">\${a.status.toUpperCase()}</span> | Token: #\${a.tokenNumber || '...'}</div>
                        </div>
                    </div>\`).join('');
                }
            }
        } catch(e) { console.error(e); }
    }

    async function loadLabTests() {
        try {
            const res = await fetch('/api/patient-labs');
            const data = await res.json();
            if(data.success) {
                const list = document.getElementById('patientLabList');
                if(data.labs.length === 0) list.innerHTML = '<p style="text-align:center; color:gray">No pending lab requests.</p>';
                else list.innerHTML = data.labs.map(l => \`
                    <div class="report-item">
                        <div class="report-details">
                            <div class="report-type">\${l.testName}</div>
                            <div class="report-date">Lab: \${l.labId?.name || 'MediVault Lab'} | Status: \${l.status}</div>
                        </div>
                    </div>\`).join('');
            }
        } catch(e) { console.error(e); }
    }

    function initSocket() {
        if (typeof io === 'undefined') return;
        const socket = io();
        const patientId = document.getElementById('userId').textContent;
        socket.on('connect', () => {
            if (patientId && patientId !== 'Loading...') socket.emit('register', patientId);
        });
        socket.on('tokenUpdate', (data) => {
            document.getElementById('queueBanner').style.display = 'block';
            document.getElementById('tokenNum').textContent = data.patientToken;
            document.getElementById('currentNum').textContent = data.currentToken;
            const ahead = Math.max(0, data.patientToken - data.currentToken);
            document.getElementById('aheadNum').textContent = ahead;
            document.getElementById('qTime').textContent = \`~ \${ahead * 10} mins wait\`;
        });
    }

    // Call initSocket periodically if ID was loading
    setInterval(() => {
        if(document.getElementById('userId').textContent !== 'Loading...' && !window.socketInitialized) {
            initSocket();
            window.socketInitialized = true;
        }
    }, 2000);
`;

content = content.replace('console.log(\'✅ Patient Dashboard initialized', additionalJS + '\n      loadAppointments();\n      loadLabTests();\n      console.log(\'✅ Patient Dashboard initialized');

fs.writeFileSync(filePath, content);
console.log('Restoration of Appointment & Queue Features Successful.');
