let currentSelectedRole = "collector";

function openAuthModal(role) {
    currentSelectedRole = role || "collector";
    const titleEl = document.getElementById("authModalTitle");
    if (titleEl) {
        titleEl.innerText = currentSelectedRole === "recycler"
            ? "Recycler Workspace Login"
            : "Collector Workspace Login";
    }
    const roleSelect = document.getElementById("regRole");
    if (roleSelect) {
        roleSelect.value = currentSelectedRole;
        roleSelect.disabled = true;
    }
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "flex";
    }
    switchAuthTab('login');
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function switchAuthTab(tab) {
    const loginTabBtn = document.getElementById("loginTabBtn");
    const registerTabBtn = document.getElementById("registerTabBtn");
    const signInForm = document.getElementById("signInForm");
    const registerForm = document.getElementById("registerForm");

    if (tab === 'login') {
        if (loginTabBtn) loginTabBtn.classList.add("active");
        if (registerTabBtn) registerTabBtn.classList.remove("active");
        if (signInForm) signInForm.style.display = "block";
        if (registerForm) registerForm.style.display = "none";
    } else {
        if (loginTabBtn) loginTabBtn.classList.remove("active");
        if (registerTabBtn) registerTabBtn.classList.add("active");
        if (signInForm) signInForm.style.display = "none";
        if (registerForm) registerForm.style.display = "block";
    }
}

// 1. SIGN IN WITH REGISTERED EMAIL & PASSWORD
function handleEmailSignIn(event) {
    event.preventDefault();
    const email = document.getElementById("signInEmail").value.trim().toLowerCase();
    const password = document.getElementById("signInPassword").value;

    const users = JSON.parse(localStorage.getItem("econex_users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid email or password. Please check your credentials or create a new account.");
        return;
    }

    // STRICT ROLE CHECK: Only allow Collector in Collector login, Recycler in Recycler login
    if (user.role && user.role !== currentSelectedRole) {
        if (user.role === "recycler") {
            alert("❌ Access Denied: This account (" + email + ") is registered as a Recycler.\nPlease log in from the Recycler workspace.");
        } else {
            alert("❌ Access Denied: This account (" + email + ") is registered as a Collector.\nPlease log in from the Collector workspace.");
        }
        return;
    }

    localStorage.setItem("currentRole", currentSelectedRole);
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Welcome back, " + user.name + "!");
    window.location.href = currentSelectedRole === "recycler" ? "recycler.html" : "collector.html";
}

// 2. CREATE ACCOUNT
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const role = currentSelectedRole; // Lock to currently selected workspace

    if (!name || !email || !password) {
        alert("Please complete all registration fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("econex_users") || "[]");
    let existingUser = users.find(u => u.email === email);

    if (existingUser) {
        if (existingUser.role !== role) {
            alert("❌ An account with this email is already registered as a " + existingUser.role.toUpperCase() + ".\nPlease log in using the " + existingUser.role.toUpperCase() + " workspace.");
        } else {
            alert("An account with this email already exists. Please sign in instead.");
            switchAuthTab('login');
            document.getElementById("signInEmail").value = email;
        }
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toLocaleString()
    };

    users.push(newUser);
    localStorage.setItem("econex_users", JSON.stringify(users));
    localStorage.setItem("currentRole", role);
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Account created successfully as " + role.toUpperCase() + "!");
    window.location.href = role === "recycler" ? "recycler.html" : "collector.html";
}

// 3. GOOGLE SIGN IN (ALLOWS ANY GOOGLE EMAIL ID)
async function googleSignIn() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth) {
            const result = await window.Capacitor.Plugins.GoogleAuth.signIn();
            if (result && result.email) {
                handleGoogleSuccess(result);
            }
        } else {
            // Browser / dev mode: prompt for any Google email address
            const demoEmail = prompt("Google Sign-In Simulation:\nEnter any Google email ID to log in:", "user@gmail.com");
            if (demoEmail && demoEmail.trim()) {
                const cleanedEmail = demoEmail.trim().toLowerCase();
                const userName = cleanedEmail.split("@")[0];
                handleGoogleSuccess({
                    name: userName.charAt(0).toUpperCase() + userName.slice(1),
                    email: cleanedEmail
                });
            }
        }
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert("Google Sign-In failed or was cancelled.");
    }
}

function handleGoogleSuccess(googleUser) {
    const email = (googleUser.email || "").trim().toLowerCase();
    let users = JSON.parse(localStorage.getItem("econex_users") || "[]");
    let existingUser = users.find(u => u.email === email);

    if (existingUser) {
        // STRICT ROLE CHECK: Check if existing Google account belongs to a different workspace
        if (existingUser.role && existingUser.role !== currentSelectedRole) {
            if (existingUser.role === "recycler") {
                alert("❌ Access Denied: The Google account (" + email + ") is registered as a Recycler.\nPlease log in from the Recycler workspace.");
            } else {
                alert("❌ Access Denied: The Google account (" + email + ") is registered as a Collector.\nPlease log in from the Collector workspace.");
            }
            return;
        }
        localStorage.setItem("currentRole", existingUser.role);
        localStorage.setItem("currentUser", JSON.stringify(existingUser));
    } else {
        // First-time Google user on this workspace: Register account under selected role
        const newUser = {
            name: googleUser.name || "Google User",
            email: email,
            role: currentSelectedRole,
            isGoogle: true,
            createdAt: new Date().toLocaleString()
        };
        users.push(newUser);
        localStorage.setItem("econex_users", JSON.stringify(users));
        localStorage.setItem("currentRole", currentSelectedRole);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
    }

    alert("✅ Signed in successfully as " + (googleUser.name || email));
    window.location.href = currentSelectedRole === "recycler" ? "recycler.html" : "collector.html";
}

function collectorLogin() {
    openAuthModal('collector');
}

function recyclerLogin() {
    openAuthModal('recycler');
}
