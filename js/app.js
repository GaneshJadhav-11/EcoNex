function getGoogleAuthPlugin() {
    const capacitor = window.Capacitor;
    if (!capacitor) return null;
    if (capacitor.Plugins && capacitor.Plugins.GoogleAuth) {
        return capacitor.Plugins.GoogleAuth;
    }
    if (typeof capacitor.registerPlugin === 'function') {
        return capacitor.registerPlugin('GoogleAuth');
    }
    return null;
}

async function loginWithGoogle(role) {
    localStorage.setItem("currentRole", role);
    const destination = role === "collector" ? "collector.html" : "recycler.html";

    const googleAuth = getGoogleAuthPlugin();
    const isNative = window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' ? window.Capacitor.isNativePlatform() : false;

    if (googleAuth && isNative) {
        try {
            const user = await googleAuth.signIn();
            if (user && (user.email || user.idToken)) {
                localStorage.setItem("user", JSON.stringify(user));
                window.location.href = destination;
            } else {
                alert("Google Sign-In failed.");
            }
        } catch (error) {
            console.error("Google Auth error:", error);
            const msg = (typeof error === 'string') ? error : (error && error.message ? error.message : JSON.stringify(error));
            if (msg.includes("cancelled") || msg.includes("canceled")) {
                console.log("Sign in cancelled by user.");
            } else {
                alert("Sign-In Error: " + msg);
            }
        }
    } else {
        // Fallback for web browser or when running outside native app
        window.location.href = destination;
    }
}

function collectorLogin() {
    loginWithGoogle("collector");
}

function recyclerLogin() {
    loginWithGoogle("recycler");
}

async function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("currentRole");

    const googleAuth = getGoogleAuthPlugin();
    if (googleAuth) {
        try {
            await googleAuth.signOut();
        } catch (e) {
            console.error("Sign out error:", e);
        }
    }
    window.location.href = "index.html";
}
