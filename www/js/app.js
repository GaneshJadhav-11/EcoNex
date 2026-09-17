const Capacitor = window.Capacitor;
const GoogleAuth = Capacitor ? (Capacitor.Plugins.GoogleAuth || Capacitor.registerPlugin('GoogleAuth')) : null;

function authenticateGoogle(expectedRole, callback) {
    if (GoogleAuth) {
        GoogleAuth.signIn()
            .then(result => {
                if (result && result.email) {
                    verifyAndProceed(result.email, result.name || "Google User", expectedRole, callback);
                } else {
                    alert("Google Authentication failed: No email returned.");
                }
            })
            .catch(err => {
                const errMessage = err && err.message ? err.message : "Sign-In failed.";
                alert("Google Sign-In Error: " + errMessage);
            });
    } else {
        alert("Authentication Error: The GoogleAuth native plugin is not loaded. Ensure this app is built and running natively on Android via Capacitor.");
    }
}

function verifyAndProceed(email, name, expectedRole, callback) {
    if (expectedRole === "admin") {
        if (email.toLowerCase() !== "ganeshj2837@gmail.com") {
            alert("Access denied. This Google account is not authorized for Admin Portal.");
            if (GoogleAuth) {
                GoogleAuth.signOut().catch(() => {});
            }
            localStorage.removeItem("currentRole");
            localStorage.removeItem("currentUserEmail");
            return;
        }
    }

    localStorage.setItem("currentRole", expectedRole);
    localStorage.setItem("currentUserEmail", email);
    localStorage.setItem("currentUserName", name);

    if (typeof callback === "function") {
        callback();
    }
}

function collectorLogin() {
    authenticateGoogle("collector", () => {
        window.location.href = "collector.html";
    });
}

function recyclerLogin() {
    authenticateGoogle("recycler", () => {
        window.location.href = "recycler.html";
    });
}

function adminLogin() {
    authenticateGoogle("admin", () => {
        window.location.href = "admin.html";
    });
}
