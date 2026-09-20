console.log("ADMIN JS LOADED");

const REQUIRED_ADMIN_EMAIL = "amardipwaghmare47@gmail.com";
const REQUIRED_ADMIN_PASS = "Pass@123";

function verifyAdmin(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById("adminEmailInput");
    const passwordInput = document.getElementById("adminPasswordInput");

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (email === REQUIRED_ADMIN_EMAIL.toLowerCase() && password === REQUIRED_ADMIN_PASS) {
        sessionStorage.setItem("adminVerified", "true");
        alert("✅ Admin verified successfully!");
        checkAdminAuth();
    } else {
        alert("❌ Incorrect Admin Email or Password!");
    }
}

function adminLogout() {
    sessionStorage.removeItem("adminVerified");
    window.location.reload();
}

function checkAdminAuth() {
    const isVerified = sessionStorage.getItem("adminVerified") === "true";
    const loginCard = document.getElementById("adminLoginCard");
    const adminContent = document.getElementById("adminContent");
    const logoutBtn = document.getElementById("adminLogoutBtn");

    if (isVerified) {
        if (loginCard) loginCard.style.display = "none";
        if (adminContent) adminContent.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        loadRecycler();
        loadHistory();
    } else {
        if (loginCard) loginCard.style.display = "block";
        if (adminContent) adminContent.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
}

function loadRecycler() {
    const container = document.getElementById("recyclerContainer");
    if (!container) return;

    const savedData = localStorage.getItem("recyclerProfile");

    if (!savedData) {
        container.innerHTML = `
            <div class="card">
                <h2>⚠️ No Recycler Found</h2>
                <p>No recycler registration is available.</p>
            </div>
        `;
        return;
    }

    const recycler = JSON.parse(savedData);

    if (!recycler.verificationStatus) {
        recycler.verificationStatus = "Pending Verification";
        localStorage.setItem("recyclerProfile", JSON.stringify(recycler));
    }

    container.innerHTML = `
        <div class="card">
            <h2>♻️ ${recycler.name}</h2>
            <h3>Status: ${recycler.verificationStatus}</h3>
            <hr>
            <h3>📋 Recycler Details</h3>
            <p><strong>Recycler ID:</strong> ${recycler.id}</p>
            <p><strong>Contact:</strong> ${recycler.contact}</p>
            <p><strong>Location:</strong> ${recycler.location}</p>
            <p><strong>Materials:</strong> ${recycler.acceptedMaterials}</p>
            <p><strong>Pickup:</strong> ${recycler.pickup || "Not specified"}</p>
            <hr>
            <h3>📄 Authorization</h3>
            <p><strong>Authorization Number:</strong> ${recycler.authorizationNumber}</p>
            <p><strong>Document:</strong> ${recycler.documentName || "Not uploaded"}</p>
            ${recycler.documentData ? `<button onclick="viewDocument()">👁️ View Document</button>` : ""}
            <hr>
            <h3>🔐 Admin Action</h3>
            <br>
            ${recycler.verificationStatus === "Pending Verification" ? `
                <button class="primary-btn" onclick="approveRecycler()">✅ Approve Recycler</button>
                <button class="danger-btn" onclick="rejectRecycler()">❌ Reject Recycler</button>
            ` : ""}
            ${recycler.verificationStatus === "Verified" ? `
                <div class="success-box">
                    <h3>✅ Recycler Verified</h3>
                    <p>Verified By: ${recycler.verifiedBy}</p>
                    <p>Verified At: ${recycler.verifiedAt}</p>
                </div>
            ` : ""}
            ${recycler.verificationStatus === "Rejected" ? `
                <div class="danger-box">
                    <h3>❌ Recycler Rejected</h3>
                    <p>Reason: ${recycler.rejectionReason}</p>
                </div>
            ` : ""}
        </div>
    `;
}

function approveRecycler() {
    const savedData = localStorage.getItem("recyclerProfile");
    if (!savedData) {
        alert("Recycler profile not found.");
        return;
    }
    const recycler = JSON.parse(savedData);
    if (!confirm("Do you want to approve this recycler?")) return;

    recycler.verificationStatus = "Verified";
    recycler.verifiedBy = "Admin (" + REQUIRED_ADMIN_EMAIL + ")";
    recycler.verifiedAt = new Date().toLocaleString();

    localStorage.setItem("recyclerProfile", JSON.stringify(recycler));
    addHistory("Approved", "Recycler verified by Admin");
    alert("✅ Recycler Verified Successfully!");

    loadRecycler();
    loadHistory();
}

function rejectRecycler() {
    const savedData = localStorage.getItem("recyclerProfile");
    if (!savedData) return;

    const recycler = JSON.parse(savedData);
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    recycler.verificationStatus = "Rejected";
    recycler.rejectionReason = reason;
    recycler.rejectedBy = "Admin (" + REQUIRED_ADMIN_EMAIL + ")";
    recycler.rejectedAt = new Date().toLocaleString();

    localStorage.setItem("recyclerProfile", JSON.stringify(recycler));
    addHistory("Rejected", reason);
    alert("❌ Recycler Rejected");

    loadRecycler();
    loadHistory();
}

function addHistory(action, remark) {
    const history = JSON.parse(localStorage.getItem("verificationHistory")) || [];
    history.push({
        action: action,
        remark: remark,
        admin: REQUIRED_ADMIN_EMAIL,
        time: new Date().toLocaleString()
    });
    localStorage.setItem("verificationHistory", JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem("verificationHistory")) || [];
    const container = document.getElementById("historyContainer");
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `<p>No verification activity yet.</p>`;
        return;
    }

    container.innerHTML = "";
    history.slice().reverse().forEach(item => {
        container.innerHTML += `
            <div class="lot-card">
                <h3>${item.action === "Approved" ? "✅ Approved" : "❌ Rejected"}</h3>
                <p><strong>Remark:</strong> ${item.remark}</p>
                <p><strong>Admin:</strong> ${item.admin}</p>
                <p><strong>Time:</strong> ${item.time}</p>
            </div>
        `;
    });
}

function viewDocument() {
    const savedData = localStorage.getItem("recyclerProfile");
    if (!savedData) {
        alert("Recycler profile not found.");
        return;
    }
    const recycler = JSON.parse(savedData);
    if (!recycler.documentData) {
        alert("No document uploaded.");
        return;
    }

    const data = recycler.documentData;
    const win = window.open("", "_blank");
    if (!win) {
        alert("Please allow pop-ups in your browser.");
        return;
    }

    if (data.startsWith("data:image/")) {
        win.document.write(`
            <html>
            <head><title>${recycler.documentName || "Authorization Document"}</title></head>
            <body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                <img src="${data}" style="max-width:95%;max-height:95vh;object-fit:contain;">
            </body>
            </html>
        `);
    } else if (data.startsWith("data:application/pdf")) {
        win.document.write(`
            <html>
            <head><title>${recycler.documentName || "Authorization Document"}</title></head>
            <body style="margin:0;">
                <iframe src="${data}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
            </html>
        `);
    } else {
        win.document.write(`<html><body><h2>⚠️ Unsupported document format</h2></body></html>`);
    }
    win.document.close();
}

/* START */
checkAdminAuth();
console.log("ADMIN VERIFICATION SYSTEM READY");
