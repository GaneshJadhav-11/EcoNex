console.log("ADMIN JS LOADED");


function loadRecycler() {

    const container =
        document.getElementById("recyclerContainer");


    const savedData =
        localStorage.getItem("recyclerProfile");


    console.log("Recycler Data:", savedData);


    if (!savedData) {

        container.innerHTML = `

            <div class="card">

                <h2>⚠️ No Recycler Found</h2>

                <p>
                    No recycler registration
                    is available.
                </p>

            </div>

        `;

        return;
    }


    const recycler =
        JSON.parse(savedData);


    /* Old profile fix */

    if (!recycler.verificationStatus) {

        recycler.verificationStatus =
            "Pending Verification";


        localStorage.setItem(
            "recyclerProfile",
            JSON.stringify(recycler)
        );
    }


    container.innerHTML = `

        <div class="card">

            <h2>
                ♻️ ${recycler.name}
            </h2>


            <h3>
                Status:
                ${recycler.verificationStatus}
            </h3>


            <hr>


            <h3>
                📋 Recycler Details
            </h3>


            <p>
                <strong>Recycler ID:</strong>
                ${recycler.id}
            </p>


            <p>
                <strong>Contact:</strong>
                ${recycler.contact}
            </p>


            <p>
                <strong>Location:</strong>
                ${recycler.location}
            </p>


            <p>
                <strong>Materials:</strong>
                ${recycler.acceptedMaterials}
            </p>


            <p>
                <strong>Pickup:</strong>
                ${recycler.pickup || "Not specified"}
            </p>


            <hr>


            <h3>
                📄 Authorization
            </h3>


            <p>
                <strong>
                    Authorization Number:
                </strong>

                ${recycler.authorizationNumber}
            </p>


            <p>
                <strong>
                    Document:
                </strong>

                ${recycler.documentName || "Not uploaded"}
            </p>


            ${
                recycler.documentData

                ?

                `

                <button
                    onclick="viewDocument()">

                    👁️ View Document

                </button>

                `

                :

                ""

            }


            <hr>


            <h3>
                🔐 Admin Action
            </h3>


            <br>


            ${
                recycler.verificationStatus ===
                "Pending Verification"

                ?

                `

                <button
                    class="primary-btn"
                    onclick="approveRecycler()">

                    ✅ Approve Recycler

                </button>


                <button
                    class="danger-btn"
                    onclick="rejectRecycler()">

                    ❌ Reject Recycler

                </button>

                `

                :

                ""

            }


            ${
                recycler.verificationStatus ===
                "Verified"

                ?

                `

                <div class="success-box">

                    <h3>
                        ✅ Recycler Verified
                    </h3>

                    <p>
                        Verified By:
                        ${recycler.verifiedBy}
                    </p>

                    <p>
                        Verified At:
                        ${recycler.verifiedAt}
                    </p>

                </div>

                `

                :

                ""

            }


            ${
                recycler.verificationStatus ===
                "Rejected"

                ?

                `

                <div class="danger-box">

                    <h3>
                        ❌ Recycler Rejected
                    </h3>

                    <p>
                        Reason:
                        ${recycler.rejectionReason}
                    </p>

                </div>

                `

                :

                ""

            }

        </div>

    `;
}


/* =====================================
   APPROVE
===================================== */

function approveRecycler() {

    const savedData =
        localStorage.getItem(
            "recyclerProfile"
        );


    if (!savedData) {

        alert(
            "Recycler profile not found."
        );

        return;
    }


    const recycler =
        JSON.parse(savedData);


    const confirmApproval =
        confirm(
            "Do you want to approve this recycler?"
        );


    if (!confirmApproval) {

        return;
    }


    recycler.verificationStatus =
        "Verified";


    recycler.verifiedBy =
        "Admin";


    recycler.verifiedAt =
        new Date().toLocaleString();


    localStorage.setItem(
        "recyclerProfile",
        JSON.stringify(recycler)
    );


    addHistory(
        "Approved",
        "Recycler verified by Admin"
    );


    alert(
        "✅ Recycler Verified Successfully!"
    );


    loadRecycler();

    loadHistory();
}


/* =====================================
   REJECT
===================================== */

function rejectRecycler() {

    const savedData =
        localStorage.getItem(
            "recyclerProfile"
        );


    if (!savedData) return;


    const recycler =
        JSON.parse(savedData);


    const reason =
        prompt(
            "Enter rejection reason:"
        );


    if (!reason) return;


    recycler.verificationStatus =
        "Rejected";


    recycler.rejectionReason =
        reason;


    recycler.rejectedBy =
        "Admin";


    recycler.rejectedAt =
        new Date().toLocaleString();


    localStorage.setItem(
        "recyclerProfile",
        JSON.stringify(recycler)
    );


    addHistory(
        "Rejected",
        reason
    );


    alert(
        "❌ Recycler Rejected"
    );


    loadRecycler();

    loadHistory();
}


/* =====================================
   HISTORY
===================================== */

function addHistory(
    action,
    remark
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "verificationHistory"
            )
        ) || [];


    history.push({

        action: action,

        remark: remark,

        admin: "Admin",

        time:
            new Date().toLocaleString()

    });


    localStorage.setItem(
        "verificationHistory",
        JSON.stringify(history)
    );
}


/* =====================================
   LOAD HISTORY
===================================== */

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "verificationHistory"
            )
        ) || [];


    const container =
        document.getElementById(
            "historyContainer"
        );


    if (history.length === 0) {

        container.innerHTML = `

            <p>
                No verification activity yet.
            </p>

        `;

        return;
    }


    container.innerHTML = "";


    history
        .slice()
        .reverse()
        .forEach(item => {

            container.innerHTML += `

                <div class="lot-card">

                    <h3>

                        ${
                            item.action ===
                            "Approved"

                            ?

                            "✅ Approved"

                            :

                            "❌ Rejected"

                        }

                    </h3>


                    <p>
                        <strong>Remark:</strong>
                        ${item.remark}
                    </p>


                    <p>
                        <strong>Admin:</strong>
                        ${item.admin}
                    </p>


                    <p>
                        <strong>Time:</strong>
                        ${item.time}
                    </p>

                </div>

            `;

        });
}


/* =====================================
   VIEW DOCUMENT
===================================== */

function viewDocument() {

    const savedData =
        localStorage.getItem(
            "recyclerProfile"
        );


    if (!savedData) {

        alert(
            "Recycler profile not found."
        );

        return;
    }


    const recycler =
        JSON.parse(savedData);


    if (!recycler.documentData) {

        alert(
            "No document uploaded."
        );

        return;
    }


    const data =
        recycler.documentData;


    const win =
        window.open(
            "",
            "_blank"
        );


    if (!win) {

        alert(
            "Please allow pop-ups in your browser."
        );

        return;
    }


    /* IMAGE DOCUMENT */

    if (
        data.startsWith("data:image/")
    ) {

        win.document.write(`

            <html>

            <head>

                <title>
                    ${recycler.documentName || "Authorization Document"}
                </title>

            </head>

            <body
                style="
                    margin:0;
                    background:#111;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    min-height:100vh;
                "
            >

                <img
                    src="${data}"
                    style="
                        max-width:95%;
                        max-height:95vh;
                        object-fit:contain;
                    "
                >

            </body>

            </html>

        `);

    }


    /* PDF DOCUMENT */

    else if (
        data.startsWith("data:application/pdf")
    ) {

        win.document.write(`

            <html>

            <head>

                <title>
                    ${recycler.documentName || "Authorization Document"}
                </title>

            </head>

            <body
                style="margin:0;"
            >

                <iframe
                    src="${data}"
                    style="
                        width:100%;
                        height:100vh;
                        border:none;
                    "
                ></iframe>

            </body>

            </html>

        `);

    }


    /* OTHER FORMAT */

    else {

        win.document.write(`

            <html>

            <body>

                <h2>
                    ⚠️ Unsupported document format
                </h2>

            </body>

            </html>

        `);

    }


    win.document.close();
}


/* =====================================
   DASHBOARD STATS
===================================== */
function loadDashboardStats() {
    const elTotalLots = document.getElementById("statTotalLots");
    const elTotalOffers = document.getElementById("statTotalOffers");
    const elAvgOffer = document.getElementById("statAvgOffer");

    if (!elTotalLots || !elTotalOffers || !elAvgOffer) return;

    let lots = [];
    let offers = [];

    try {
        lots = JSON.parse(localStorage.getItem("lots")) || [];
    } catch (e) {
        console.error("Failed to parse lots:", e);
    }

    try {
        offers = JSON.parse(localStorage.getItem("offers")) || [];
    } catch (e) {
        console.error("Failed to parse offers:", e);
    }

    // 1. Total Lots
    elTotalLots.textContent = lots.length;

    // 2. Total Offers
    elTotalOffers.textContent = offers.length;

    // 3. Average Offer Value
    if (offers.length === 0) {
        elAvgOffer.textContent = "--";
    } else {
        let sum = 0;
        let validCount = 0;
        offers.forEach(offer => {
            const price = Number(offer.price);
            if (!isNaN(price) && price >= 0) {
                sum += price;
                validCount++;
            }
        });

        if (validCount > 0) {
            elAvgOffer.textContent = (sum / validCount).toFixed(2);
        } else {
            elAvgOffer.textContent = "--";
        }
    }
}


/* =====================================
   RENDER CHARTS
===================================== */
function renderCharts() {
    const wrapper = document.getElementById("materialChartWrapper");
    const canvas = document.getElementById("materialChart");
    if (!wrapper || !canvas) return;

    let lots = [];
    try {
        lots = JSON.parse(localStorage.getItem("lots")) || [];
    } catch (e) {
        console.error("Failed to parse lots:", e);
    }

    if (lots.length === 0) {
        wrapper.innerHTML = '<p style="color: var(--muted); font-size: 14px; text-align: center; margin-top: 50px;">No data available for material chart.</p>';
        return;
    }

    const weightByMaterial = {};
    let hasValidData = false;

    lots.forEach(lot => {
        const mat = lot.material || "Unknown";
        const weight = Number(lot.weight);
        if (!isNaN(weight) && weight > 0) {
            weightByMaterial[mat] = (weightByMaterial[mat] || 0) + weight;
            hasValidData = true;
        }
    });

    if (!hasValidData) {
        wrapper.innerHTML = '<p style="color: var(--muted); font-size: 14px; text-align: center; margin-top: 50px;">No valid weight data available.</p>';
        return;
    }

    const labels = Object.keys(weightByMaterial);
    const data = Object.values(weightByMaterial);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Weight (kg)',
                data: data,
                backgroundColor: '#087f5b',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}


/* =====================================
   RENDER STATUS CHART
===================================== */
function renderStatusChart() {
    const wrapper = document.getElementById("statusChartWrapper");
    const canvas = document.getElementById("statusChart");
    if (!wrapper || !canvas) return;

    let lots = [];
    try {
        lots = JSON.parse(localStorage.getItem("lots")) || [];
    } catch (e) {
        console.error("Failed to parse lots:", e);
    }

    const statusCounts = {
        "Waiting for Recycler Offers": 0,
        "Offer Received": 0,
        "Offer Selected": 0,
        "Handover Completed": 0
    };

    let hasValidData = false;

    lots.forEach(lot => {
        const status = lot.status;
        if (status && statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
            hasValidData = true;
        }
    });

    if (!hasValidData) {
        wrapper.innerHTML = '<p style="color: var(--muted); font-size: 14px; text-align: center; margin-top: 50px;">No data available for status chart.</p>';
        return;
    }

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#f4b942', // Waiting
                    '#0ea5a8', // Offer Received
                    '#6d46ff', // Offer Selected
                    '#087f5b'  // Completed
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}


/* =====================================
   LOAD ACTIVITY LEDGER
===================================== */
function loadActivityLedger() {
    const container = document.getElementById("activityContainer");
    if (!container) return;

    let offers = [];
    let lots = [];

    try {
        offers = JSON.parse(localStorage.getItem("offers")) || [];
        lots = JSON.parse(localStorage.getItem("lots")) || [];
    } catch (e) {
        console.error("Failed to parse data for ledger:", e);
        container.innerHTML = '<p style="color: var(--muted); font-size: 14px;">Error loading marketplace activity.</p>';
        return;
    }

    if (offers.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); font-size: 14px;">No marketplace activity available.</p>';
        return;
    }

    // Sort newest first
    offers.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
        }
        return 0; // fallback if dates are malformed
    });

    let tableHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Offer ID</th>
                    <th>Lot ID</th>
                    <th>Material</th>
                    <th>Weight</th>
                    <th>Recycler</th>
                    <th>Value</th>
                    <th>Pickup</th>
                </tr>
            </thead>
            <tbody>
    `;

    offers.forEach(offer => {
        const matchingLot = lots.find(lot => lot.id === offer.lotId);
        const material = matchingLot && matchingLot.material ? matchingLot.material : "Unknown Lot";
        const weight = matchingLot && matchingLot.weight ? matchingLot.weight + " kg" : "---";
        const dateObj = new Date(offer.createdAt);
        const dateStr = !isNaN(dateObj) ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : String(offer.createdAt || "Unknown");

        tableHTML += `
            <tr>
                <td><small>${dateStr}</small></td>
                <td><strong>${offer.id || "---"}</strong></td>
                <td><small>${offer.lotId || "---"}</small></td>
                <td><span class="badge" style="background: #eaf8f3; color: #056044;">${material}</span></td>
                <td>${weight}</td>
                <td>${offer.recycler || "---"}</td>
                <td><strong>$${Number(offer.price || 0).toFixed(2)}</strong></td>
                <td>${offer.pickup || "Not specified"}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}


/* =====================================
   START
===================================== */

loadDashboardStats();

renderCharts();

renderStatusChart();

loadActivityLedger();

loadRecycler();

loadHistory();

console.log(
    "ADMIN VERIFICATION SYSTEM READY"
);