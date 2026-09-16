async function performLogin(role, targetUrl) {
    try {
        // Check if Capacitor and the GoogleAuth plugin are available
        const isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

        if (!isNative) {
            console.warn("Native GoogleAuth not available. Proceeding with mock authentication for prototype.");
            localStorage.setItem("currentRole", role);
            window.location.href = targetUrl;
            return;
        }

        const { GoogleAuth } = Capacitor.Plugins;

        // Call the native Google Sign-In plugin
        const user = await GoogleAuth.signIn();

        if (user && user.email) {
            // Store user info and role to maintain current functionality
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("currentRole", role);

            console.log("Authenticated successfully as:", user.email);
            window.location.href = targetUrl;
        } else {
            alert("Authentication failed. Please try again.");
        }
    } catch (error) {
        console.error("Login error:", error);
        // If the user cancelled or there was an error, we don't proceed
        if (error.message !== "Cancelled") {
            alert("Login failed: " + (error.message || "Unknown error"));
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
