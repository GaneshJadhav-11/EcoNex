async function performLogin(role, targetUrl) {
    try {
        console.log("performLogin called for role:", role);

        // Check if Capacitor is available
        if (typeof Capacitor === 'undefined') {
            console.error("Capacitor is undefined! Make sure capacitor.js is loaded.");
            alert("Error: Capacitor is not loaded. Role: " + role);
            localStorage.setItem("currentRole", role);
            window.location.href = targetUrl;
            return;
        }

        const isNative = Capacitor.isNativePlatform();
        console.log("isNativePlatform:", isNative);

        if (!isNative) {
            console.warn("Native GoogleAuth not available. Proceeding with mock authentication.");
            localStorage.setItem("currentRole", role);
            window.location.href = targetUrl;
            return;
        }

        const { GoogleAuth } = Capacitor.Plugins;
        if (!GoogleAuth) {
            console.error("GoogleAuth plugin not found in Capacitor.Plugins");
            alert("Error: GoogleAuth plugin not found. Please check native registration.");
            // Fallback for demo if plugin missing
            localStorage.setItem("currentRole", role);
            window.location.href = targetUrl;
            return;
        }

        console.log("Calling GoogleAuth.signIn()...");
        const user = await GoogleAuth.signIn();
        console.log("GoogleAuth.signIn() response:", user);

        if (user && user.email) {
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("currentRole", role);
            console.log("Authenticated successfully as:", user.email);
            window.location.href = targetUrl;
        } else {
            console.error("User object invalid after sign-in:", user);
            alert("Authentication failed: Invalid user data received.");
        }
    } catch (error) {
        console.error("Login error details:", error);
        if (error.message === "Cancelled") {
            console.log("User cancelled Google Sign-In");
        } else {
            alert("Login failed: " + (error.message || JSON.stringify(error)));
        }
    }
}

function collectorLogin() {
    performLogin("collector", "collector.html");
}

function recyclerLogin() {
    performLogin("recycler", "recycler.html");
}

function adminLogin() {
    performLogin("admin", "admin.html");
}
