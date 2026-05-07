// ================= 24 SERVICES ARRAY (default) =================
const defaultServices = [
    { name: "General Checkup", description: "Routine health examination and vital signs monitoring" },
    { name: "Basic Medication", description: "Over-the-counter medications for common ailments" },
    { name: "First Aid", description: "Emergency treatment for minor injuries" },
    { name: "Fever Management", description: "Temperature monitoring and fever reduction" },
    { name: "Cold & Flu Care", description: "Treatment for common cold and influenza symptoms" },
    { name: "Nutritional Advice", description: "Guidance on healthy eating and diet plans" },
    { name: "Exercise Guidance", description: "Recommendations for physical activity and exercises" },
    { name: "Dental First Aid", description: "Emergency dental care and pain management" },
    { name: "Eye Care", description: "Basic eye examinations and referrals" },
    { name: "Blood Pressure", description: "BP monitoring and hypertension management" },
    { name: "Heart Health", description: "Cardiovascular health assessments" },
    { name: "Mental Health", description: "Basic mental health support and referrals" },
    { name: "Weight Management", description: "Healthy weight loss and nutrition plans" },
    { name: "Vaccinations", description: "Basic immunizations and travel vaccines" },
    { name: "Blood Sugar Testing", description: "Glucose monitoring and diabetes screening" },
    { name: "Urine Testing", description: "Basic urinalysis for infection detection" },
    { name: "X-Ray Referrals", description: "Referrals for imaging services" },
    { name: "Specialist Referrals", description: "Referrals to specialized doctors" },
    { name: "Health Screening", description: "General health screening packages" },
    { name: "Child Health", description: "Pediatric basic care and checkups" },
    { name: "Elderly Care", description: "Geriatric health support" },
    { name: "Stress Management", description: "Techniques for stress reduction" },
    { name: "Smoking Cessation", description: "Support for quitting smoking" },
    { name: "Alcohol Counseling", description: "Guidance for responsible drinking" }
];

// Load services from localStorage or use default
let services = JSON.parse(localStorage.getItem("clinic_services"));
if (!services) {
    services = [...defaultServices];
    localStorage.setItem("clinic_services", JSON.stringify(services));
}

// ================= PRE‑CREATE ADMIN USER (if not exists) =================
function ensureAdminUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const adminExists = users.some(u => u.email === "admin@bothouniversityclinic.ac.bw");
    if (!adminExists) {
        const adminUser = {
            id: 1,
            username: "Admin",
            email: "admin@bothouniversityclinic.ac.bw",
            password: "admin@1213",
            role: "ADMIN"
        };
        users.push(adminUser);
        localStorage.setItem("users", JSON.stringify(users));
    }
}
ensureAdminUser();

// ================= REGISTER (role determined by email domain, admin domain blocked) =================
window.register = function () {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const msg = document.getElementById("regMsg");

    if (!username || !email || !password || !confirmPassword) {
        msg.innerText = "All fields are required";
        msg.style.color = "red";
        return;
    }
    if (password !== confirmPassword) {
        msg.innerText = "Passwords do not match";
        msg.style.color = "red";
        return;
    }

    // Admin email cannot be used for registration (only one admin)
    if (email.toLowerCase() === "admin@bothouniversityclinic.ac.bw") {
        msg.innerText = "This email is reserved for the system administrator.";
        msg.style.color = "red";
        return;
    }

    const allowedDomains = ["@bothouniversity.ac.bw", "@bothouniversity.com"];
    const validEmail = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
    if (!validEmail) {
        msg.innerText = "Use official Botho email only (students: @bothouniversity.com, lecturers: @bothouniversity.ac.bw)";
        msg.style.color = "red";
        return;
    }

    let role = "STUDENT";
    const emailLower = email.toLowerCase();
    if (emailLower.endsWith("@bothouniversity.ac.bw")) role = "LECTURER";
    else if (emailLower.endsWith("@bothouniversity.com")) role = "STUDENT";

    let users = JSON.parse(localStorage.getItem("users")) || [];
    // Prevent duplicate emails
    if (users.some(u => u.email === email)) {
        msg.innerText = "Email already registered.";
        msg.style.color = "red";
        return;
    }
    const newId = users.length + 1;
    const user = { id: newId, username, email, password, role };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(user));

    msg.innerText = "Registration successful!";
    msg.style.color = "green";
    setTimeout(() => { window.location.href = "login.html"; }, 1200);
};

// ================= LOGIN =================
window.login = function () {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        msg.innerText = "Invalid email or password";
        msg.style.color = "red";
        return;
    }
    localStorage.setItem("user", JSON.stringify(user));
    msg.innerText = "Login successful!";
    msg.style.color = "green";
    setTimeout(() => { window.location.href = "user.dashboard.html"; }, 1000);
};

// ================= DASHBOARD ONLOAD =================
window.onload = function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const usernameSpan = document.getElementById("username");
    if (user && usernameSpan) usernameSpan.innerText = user.username;

    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const role = user ? user.role : "STUDENT";
    let buttonsHtml = `<h2 class="logo">Botho University Clinic</h2>`;

    if (role === "ADMIN") {
        buttonsHtml += `
            <button onclick="showSection('adminServices')">📋 Manage Services</button>
            <button onclick="showSection('adminQuestions')">❓ All Support Q's</button>
            <button onclick="showSection('adminSettings')">⚙️ Clinic Settings</button>
            <button onclick="showSection('adminStatus')">🏥 Clinic Status</button>
            <button onclick="showSection('adminUsers')">👥 Manage Users</button>
            <button class="logout" onclick="logout()">🚪 Logout</button>
        `;
    } else {
        buttonsHtml += `
            <button onclick="showSection('portal')">🏠 Portal</button>
            <button onclick="showSection('services')">🏥 Services</button>
            <button onclick="showSection('location')">📍 Location</button>
            <button onclick="showSection('about')">ℹ️ About Clinic</button>
            <button onclick="showSection('support')">💬 Clinic Support</button>
            <button onclick="showSection('ai')">🤖 AI Assistance</button>
            <button onclick="showSection('announcements')">📢 Announcements</button>
            <button class="logout" onclick="logout()">🚪 Logout</button>
        `;
    }
    sidebar.innerHTML = buttonsHtml;

    if (document.getElementById("content")) {
        showSection(role === "ADMIN" ? "adminServices" : "portal");
    }
};

// ================= Q&A STORAGE =================
function loadQuestions() {
    const stored = localStorage.getItem("clinic_questions");
    return stored ? JSON.parse(stored) : [];
}
function saveQuestions(questions) {
    localStorage.setItem("clinic_questions", JSON.stringify(questions));
}

// Admin: render all questions with answer boxes
function renderAdminQuestionsList() {
    const container = document.getElementById("adminQuestionsList");
    if (!container) return;
    const questions = loadQuestions();
    if (questions.length === 0) {
        container.innerHTML = '<p>No questions asked yet.</p>';
        return;
    }
    let html = '';
    questions.forEach((q, idx) => {
        html += `
            <div class="qa-item" style="margin-bottom:20px; border-bottom:1px solid #ccc; padding-bottom:10px;">
                <div><strong>❓ Question:</strong> ${escapeHtml(q.text)}</div>
                <div><strong>💬 Answer:</strong> 
                    <textarea id="answer_${idx}" rows="2" style="width:100%;">${escapeHtml(q.answer || '')}</textarea>
                </div>
                <button onclick="saveAnswer(${idx})" style="margin-top:5px; background:#002b5c; color:white; border:none; padding:5px 10px; border-radius:4px;">Save Answer</button>
            </div>
        `;
    });
    container.innerHTML = html;
}
window.saveAnswer = function(idx) {
    const answerText = document.getElementById(`answer_${idx}`).value;
    const questions = loadQuestions();
    if (questions[idx]) {
        questions[idx].answer = answerText;
        saveQuestions(questions);
        alert("Answer saved!");
    }
};

// Student ask question
window.askQuestion = function() {
    const input = document.getElementById("questionInput");
    const questionText = input.value.trim();
    if (!questionText) { alert("Please enter a question."); return; }
    const questions = loadQuestions();
    questions.push({ text: questionText, answer: null });
    saveQuestions(questions);
    input.value = "";
    renderQuestionsList();
};

function renderQuestionsList() {
    const container = document.getElementById("questionsList");
    if (!container) return;
    const questions = loadQuestions();
    if (questions.length === 0) {
        container.innerHTML = '<p class="no-questions">No questions asked yet. Ask your first question above!</p>';
        return;
    }
    let html = '';
    questions.forEach((q, idx) => {
        html += `
            <div class="qa-item">
                <div><strong>❓ Question:</strong> ${escapeHtml(q.text)}</div>
                <div><strong>💬 Answer:</strong> ${q.answer ? escapeHtml(q.answer) : '<em>Pending answer… </em>'}</div>
                <hr>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ================= AI ASSISTANT =================
window.askAI = function() {
    const aiInput = document.getElementById("aiQuestion");
    const question = aiInput.value.trim();
    const aiResponseDiv = document.getElementById("aiResponse");
    if (!question) { alert("Please type your health question."); return; }
    aiResponseDiv.innerHTML = `<div class="info-card" style="margin-top:15px;"><strong>🤖 AI Assistant says:</strong><br>Thank you for your question: "${escapeHtml(question)}"<br><br>Our AI is currently learning. Please visit the clinic for professional medical advice.<br><em>If symptoms persist, see a doctor.</em></div>`;
    aiInput.value = "";
};

function escapeHtml(str) {
    if (!str) return str;
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
}

// ================= ADMIN: Manage Services (with delete button) =================
function renderAdminServices() {
    const container = document.getElementById("adminServicesList");
    if (!container) return;
    let html = '';
    services.forEach((svc, idx) => {
        html += `
            <div class="service-edit-item" style="margin-bottom:20px; border:1px solid #ddd; padding:10px; border-radius:8px;">
                <input type="text" id="svc_name_${idx}" value="${escapeHtml(svc.name)}" style="width:100%; margin-bottom:8px; padding:5px;">
                <textarea id="svc_desc_${idx}" rows="2" style="width:100%; padding:5px;">${escapeHtml(svc.description)}</textarea>
                <div style="margin-top:8px;">
                    <button onclick="saveService(${idx})" style="background:#002b5c; color:white; border:none; padding:5px 10px; border-radius:4px;">Save</button>
                    <button onclick="deleteService(${idx})" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; margin-left:8px;">Delete</button>
                </div>
            </div>
        `;
    });
    html += `<button onclick="addNewService()" style="margin-top:10px; background:#28a745; color:white; border:none; padding:8px 16px; border-radius:6px;">+ Add New Service</button>`;
    container.innerHTML = html;
}
window.saveService = function(idx) {
    const newName = document.getElementById(`svc_name_${idx}`).value;
    const newDesc = document.getElementById(`svc_desc_${idx}`).value;
    if (newName && newDesc) {
        services[idx] = { name: newName, description: newDesc };
        localStorage.setItem("clinic_services", JSON.stringify(services));
        alert("Service updated!");
        renderAdminServices();
    } else {
        alert("Both name and description required.");
    }
};
window.deleteService = function(idx) {
    if (confirm("Delete this service permanently?")) {
        services.splice(idx, 1);
        localStorage.setItem("clinic_services", JSON.stringify(services));
        renderAdminServices();
    }
};
window.addNewService = function() {
    services.push({ name: "New Service", description: "Description here" });
    localStorage.setItem("clinic_services", JSON.stringify(services));
    renderAdminServices();
};

// ================= ADMIN: Manage Users =================
function renderAdminUsers() {
    const container = document.getElementById("adminUsersList");
    if (!container) return;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (users.length === 0) {
        container.innerHTML = "<p>No users found.</p>";
        return;
    }
    let html = '<table style="width:100%; border-collapse:collapse;">';
    users.forEach((u, idx) => {
        // prevent deleting the main admin account
        const isAdmin = (u.email === "admin@bothouniversityclinic.ac.bw");
        html += `<tr style="border-bottom:1px solid #ccc;">
            <td style="padding:8px;">${u.id}</td>
            <td style="padding:8px;">${escapeHtml(u.username)}</td>
            <td style="padding:8px;">${escapeHtml(u.email)}</td>
            <td style="padding:8px;">${u.role}</td>
            <td style="padding:8px;">${!isAdmin ? `<button onclick="deleteUser(${u.id})" style="background:#dc3545; color:white; border:none; padding:4px 8px; border-radius:4px;">Delete</button>` : '—'}</td>
        </tr>`;
    });
    html += '</table>';
    container.innerHTML = html;
}
window.deleteUser = function(userId) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.email === "admin@bothouniversityclinic.ac.bw") {
        alert("Cannot delete the main admin account.");
        return;
    }
    const newUsers = users.filter(u => u.id !== userId);
    localStorage.setItem("users", JSON.stringify(newUsers));
    if (currentUser && currentUser.id === userId) {
        logout();
    } else {
        renderAdminUsers();
    }
};

// ================= ADMIN: Clinic Status Override =================
let clinicStatusOverride = JSON.parse(localStorage.getItem("clinic_status_override")) || { enabled: false, status: "Open", nurse: "Available" };
function renderAdminStatus() {
    const container = document.getElementById("adminStatusPanel");
    if (!container) return;
    const status = clinicStatusOverride.enabled ? clinicStatusOverride.status : "Auto (based on time)";
    const nurse = clinicStatusOverride.enabled ? clinicStatusOverride.nurse : "Auto";
    container.innerHTML = `
        <div class="info-card">
            <h4>Manual Override</h4>
            <label><input type="checkbox" id="overrideCheck" ${clinicStatusOverride.enabled ? 'checked' : ''}> Enable manual clinic status</label><br><br>
            <div id="statusControls" style="${clinicStatusOverride.enabled ? '' : 'display:none'}">
                <select id="manualStatus">
                    <option value="Open" ${clinicStatusOverride.status === "Open" ? 'selected' : ''}>Open</option>
                    <option value="Closed" ${clinicStatusOverride.status === "Closed" ? 'selected' : ''}>Closed</option>
                </select>
                <select id="manualNurse">
                    <option value="Available" ${clinicStatusOverride.nurse === "Available" ? 'selected' : ''}>Available</option>
                    <option value="On Break (Lunch)" ${clinicStatusOverride.nurse === "On Break (Lunch)" ? 'selected' : ''}>On Break (Lunch)</option>
                    <option value="Unavailable" ${clinicStatusOverride.nurse === "Unavailable" ? 'selected' : ''}>Unavailable</option>
                </select>
                <button onclick="saveClinicStatus()" style="margin-left:10px; background:#002b5c; color:white; border:none; padding:5px 10px;">Save</button>
            </div>
        </div>
        <div class="info-card">
            <h4>Current Displayed Status</h4>
            <p><strong>Clinic:</strong> ${status}<br><strong>Nurse:</strong> ${nurse}</p>
        </div>
    `;
    const overrideCheck = document.getElementById("overrideCheck");
    if (overrideCheck) {
        overrideCheck.addEventListener("change", function(e) {
            const controls = document.getElementById("statusControls");
            controls.style.display = e.target.checked ? "block" : "none";
            if (!e.target.checked) {
                clinicStatusOverride.enabled = false;
                localStorage.setItem("clinic_status_override", JSON.stringify(clinicStatusOverride));
                renderAdminStatus();
            }
        });
    }
}
window.saveClinicStatus = function() {
    clinicStatusOverride.enabled = true;
    clinicStatusOverride.status = document.getElementById("manualStatus").value;
    clinicStatusOverride.nurse = document.getElementById("manualNurse").value;
    localStorage.setItem("clinic_status_override", JSON.stringify(clinicStatusOverride));
    alert("Clinic status override saved!");
    renderAdminStatus();
};

// ================= ADMIN: Clinic Settings (edit announcement) =================
let announcementText = localStorage.getItem("clinic_announcement") || "IMPORTANT NOTICE: PLEASE BRING ALONG YOUR BOOKLET OR ELSE HAVE R20.00 FOR THE BOOKLET";
function renderAdminSettings() {
    const container = document.getElementById("adminSettingsPanel");
    if (!container) return;
    container.innerHTML = `
        <div class="info-card">
            <h4>Edit Announcement</h4>
            <textarea id="announcementText" rows="3" style="width:100%;">${escapeHtml(announcementText)}</textarea>
            <button onclick="saveAnnouncement()" style="margin-top:10px; background:#002b5c; color:white; border:none; padding:8px 16px;">Save Announcement</button>
        </div>
    `;
}
window.saveAnnouncement = function() {
    const newText = document.getElementById("announcementText").value;
    announcementText = newText;
    localStorage.setItem("clinic_announcement", announcementText);
    alert("Announcement updated!");
};

// ================= SHOW SECTION =================
window.showSection = function (section) {
    const content = document.getElementById("content");
    if (!content) return;

    // Student/Lecturer sections
    if (section === "portal") {
        const user = JSON.parse(localStorage.getItem("user"));
        let clinicStatus = "", nurseStatus = "";
        if (clinicStatusOverride.enabled) {
            clinicStatus = clinicStatusOverride.status;
            nurseStatus = clinicStatusOverride.nurse;
        } else {
            const workingHours = { start: 8, end: 17 };
            const now = new Date();
            const dayOfWeek = now.getDay();
            const currentHour = now.getHours();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            if (isWeekend) {
                clinicStatus = "Closed";
                nurseStatus = "Unavailable";
            } else {
                const isWithinHours = (currentHour >= workingHours.start && currentHour < workingHours.end);
                if (isWithinHours) {
                    clinicStatus = "Open";
                    nurseStatus = (currentHour >= 12 && currentHour < 13) ? "On Break (Lunch)" : "Available";
                } else {
                    clinicStatus = "Closed";
                    nurseStatus = "Unavailable";
                }
            }
        }
        content.innerHTML = `
            <div class="portal-dashboard">
                <h3>Welcome to Botho University Clinic, ${user ? user.username : "Student"}!</h3>
                <div class="info-card">
                    <p><strong>User ID:</strong> ${user ? user.id : "N/A"}<br>
                    <strong>Email:</strong> ${user ? user.email : "N/A"}<br>
                    <strong>Role:</strong> ${user ? user.role : "STUDENT"}</p>
                </div>
                <div class="info-card">
                    <h4>🏥 CLINIC STATUS</h4>
                    <p>Status: ${clinicStatus}<br>Nurse: ${nurseStatus}</p>
                </div>
                <div class="info-card">
                    <h4>📢 Announcements</h4>
                    <p>${escapeHtml(announcementText).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    }
    else if (section === "services") {
        let html = `<div class="services-container"><h1>OUR SERVICES</h1><div class="free-note">✅ All services are FREE for Botho University students and staff</div>`;
        services.forEach(s => { html += `<div class="service-item-simple"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p></div>`; });
        html += `</div>`;
        content.innerHTML = html;
    }
    else if (section === "location") {
        content.innerHTML = `<div class="location-info"><h3>LOCATION</h3><div class="info-card"><h4>📍 OUR ADDRESS</h4><p>Ha Pena-Pena Green City, Maseru, Lesotho<br>(Botho University Campus Lesotho)</p><p><strong>Maseru, Lesotho</strong></p></div><div class="info-card"><h4>🕒 HOURS OF OPERATION</h4><p>Monday–Friday: 8:00 AM – 5:00 PM</p><p>Saturday: Closed</p><p>Sunday: Closed</p><p>Public Holidays: Closed</p></div><div class="info-card"><h4>📞 CONTACT US</h4><p>Phone: +266 2224 7500</p><p>Alternative: +266 6231 3521</p></div></div>`;
    }
    else if (section === "about") {
        content.innerHTML = `<div class="about-clinic"><h3>ABOUT THE CLINIC</h3><div class="info-card"><h4>🏥 BOTHO UNIVERSITY CLINIC</h4><p>Providing <strong>FREE</strong> primary healthcare services exclusively to students and staff.</p><p><strong>Located in Maseru, Lesotho</strong></p></div><div class="info-card"><h4>🎯 OUR MISSION</h4><p>To promote health and wellness within the Botho University campus members through accessible, quality healthcare.</p></div><div class="info-card"><h4>💎 OUR VALUES</h4><ul><li>Compassion</li><li>Excellence</li><li>Accessibility</li><li>Confidentiality</li><li>Student-Centered Care</li></ul></div></div>`;
    }
    else if (section === "support") {
        content.innerHTML = `<div class="support-qa"><h3>CLINIC SUPPORT</h3><div class="info-card"><h4>❓ Ask a question</h4><textarea id="questionInput" rows="3" placeholder="Type your question here..." style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;"></textarea><button onclick="askQuestion()" style="margin-top:10px; background:#002b5c; color:white; border:none; padding:8px 16px;">Submit Question</button></div><div class="info-card"><h4>📋 Your Questions & Answers</h4><div id="questionsList"></div></div></div>`;
        renderQuestionsList();
    }
    else if (section === "ai") {
        content.innerHTML = `<div class="ai-assistant"><h3>AI CLINIC ASSISTANT</h3><div class="info-card"><p><strong>If the problem persists, please visit the clinic.</strong></p><textarea id="aiQuestion" rows="4" placeholder="Type your health question here..." style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;"></textarea><button onclick="askAI()" style="margin-top:10px; background:#002b5c; color:white; border:none; padding:8px 16px;">Submit Question</button><div id="aiResponse"></div></div></div>`;
    }
    else if (section === "announcements") {
        content.innerHTML = `<h3>📢 Announcements</h3><div class="info-card"><p>${escapeHtml(announcementText).replace(/\n/g, '<br>')}</p></div>`;
    }
    // ADMIN SECTIONS
    else if (section === "adminServices") {
        content.innerHTML = `<h3>Manage Services</h3><div id="adminServicesList"></div>`;
        renderAdminServices();
    }
    else if (section === "adminQuestions") {
        content.innerHTML = `<h3>All Support Questions</h3><div id="adminQuestionsList"></div>`;
        renderAdminQuestionsList();
    }
    else if (section === "adminSettings") {
        content.innerHTML = `<h3>Clinic Settings</h3><div id="adminSettingsPanel"></div>`;
        renderAdminSettings();
    }
    else if (section === "adminStatus") {
        content.innerHTML = `<h3>Clinic Status Override</h3><div id="adminStatusPanel"></div>`;
        renderAdminStatus();
    }
    else if (section === "adminUsers") {
        content.innerHTML = `<h3>Manage Users</h3><div id="adminUsersList"></div>`;
        renderAdminUsers();
    }
};

// ================= LOGOUT =================
window.logout = function () {
    localStorage.removeItem("user");
    window.location.href = "login.html";
};
