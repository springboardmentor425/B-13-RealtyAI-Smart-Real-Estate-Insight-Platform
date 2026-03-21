const API_BASE_URL = "http://127.0.0.1:3000/api/auth";

document.addEventListener("DOMContentLoaded", async () => {
    const loadingScreen = document.getElementById("loading-screen");
    
    // Auth Form Listeners
    setupAuthForms();
    
    try {
        // Global Auth Check & Page Load Animation
        gsap.from(".glass-card", {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power3.out"
        });

        const user = await checkAuth();

        // Route Protection
        const path = window.location.pathname;
        const isAuthPage = path.includes("login.html") || path.includes("signup.html") || path.includes("forgot-password.html") || path.includes("reset-password.html");
        const isPredictPage = path.includes("predict.html");

        if (!user && isPredictPage) {
            showToast("Please login to access prediction", "info");
            setTimeout(() => window.location.href = "login.html", 1500);
            return;
        }

        if (user && isAuthPage) {
            window.location.href = "index.html";
            return;
        }

        // Loader logic (only on index)
        if (loadingScreen) {
            startLoader(loadingScreen);
        } else {
            AOS.init({ once: true });
        }
    } catch (e) {
        document.body.style.opacity = "1";
        AOS.init({ once: true });
    }

    initPillars();
    
    if (document.getElementById("uiLocations")) {
        onPageLoad();
    }
});

function startLoader(loadingScreen) {
    const tl = gsap.timeline();
    tl.to(".foundation", { opacity: 1, duration: 0.5, ease: "power2.out" })
      .to(".walls", { opacity: 1, height: "60px", duration: 1, ease: "bounce.out" })
      .to(".roof", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.2")
      .to(".window", { opacity: 1, duration: 0.5, stagger: 0.2 })
      .to(".foundation, .walls, .roof, .window", { opacity: 0, duration: 0.5, delay: 0.5 })
      .to(".glow-icon", { opacity: 1, scale: 1.2, duration: 1, ease: "elastic.out(1, 0.3)" })
      .to(".loading-bar", { width: "100%", duration: 2, ease: "power1.inOut" }, "-=1")
      .to(loadingScreen, { opacity: 0, duration: 1, onComplete: () => {
          loadingScreen.style.display = "none";
          AOS.init({ once: true });
      }});
}

// =============== 2. DATASET PILLARS INTERACTION ===============
function initPillars() {
    const pillars = document.querySelectorAll(".pillar-card");
    pillars.forEach(pillar => {
        pillar.addEventListener("click", () => {
            pillars.forEach(p => p.classList.remove("active"));
            pillar.classList.add("active");
        });
    });
}


// =============== 4. PREDICTION LOGIC (API INTEGRATION) ===============

function getBHKValue() {
    const radios = document.getElementsByName('bhk');
    for(let i in radios) {
        if(radios[i].checked) return parseInt(radios[i].value);
    }
    return -1; // Default
}

function getBathValue() {
    const radios = document.getElementsByName('bath');
    for(let i in radios) {
        if(radios[i].checked) return parseInt(radios[i].value);
    }
    return -1; // Default
}

// Load locations from Flask Server
function onPageLoad() {
    console.log("document loaded");
    var url = "http://127.0.0.1:5000/get_location_names";
    
    // Using fetch API
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(data && data.locations) {
                var locations = data.locations;
                var uiLocations = document.getElementById("uiLocations");
                // Clear existing (except disabled placeholder)
                uiLocations.innerHTML = '<option value="" disabled selected>Choose a Location</option>';
                // Populate dynamically
                for(var i in locations) {
                    var opt = new Option(locations[i]);
                    uiLocations.appendChild(opt);
                }
            }
        })
        .catch(err => {
            console.warn("Could not fetch locations from server, falling back to static list. Is the Flask server running?", err);
            // On catch, the static HTML options will just remain there for demo purposes.
        });
}

// Calculate Price Request User Flask API
function onClickedEstimatePrice() {
    console.log("Estimate price button clicked");
    
    var sqft = document.getElementById("uiSqft").value;
    var bhk = getBHKValue();
    var bathrooms = getBathValue();
    var location = document.getElementById("uiLocations").value;
    var estPriceUI = document.getElementById("uiEstimatedPrice");
    var spinner = document.getElementById("loading-spinner");
    var priceValue = document.getElementById("priceValue");

    // Form Validation Validation
    if(!sqft || !location) {
        showToast("Please enter the Area (sqft) and select a Location.", "info");
        return;
    }

    // Hide result, show spinner
    estPriceUI.style.display = "none";
    spinner.classList.remove("d-none");

    var url = "http://127.0.0.1:5000/predict_home_price";

    var formData = new FormData();
    formData.append("total_sqft", parseFloat(sqft));
    formData.append("bhk", bhk);
    formData.append("bath", bathrooms);
    formData.append("location", location);

    fetch(url, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Artificial delay for smooth animation vibe
        setTimeout(() => {
            spinner.classList.add("d-none");
            priceValue.innerHTML = data.estimated_price.toString();
            
            // GSAP Reveal Array
            estPriceUI.style.display = "block";
            gsap.fromTo(estPriceUI, 
                { opacity: 0, y: 30, scale: 0.9 }, 
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
            );
        }, 1200);
    })
    .catch(err => {
        console.error("Error making prediction request", err);
        spinner.classList.add("d-none");
        alert("Failed to reach prediction server. Make sure your Python Flask server is running at port 5000!");
    });
}

// =============== AUTH CORE FUNCTIONS ===============

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE_URL}/me`, { credentials: "include" });
        
        if (res.status === 401) {
            // Only show toast and redirect if we're not already on an auth page
            const isAuthPage = window.location.pathname.includes("login.html") || 
                             window.location.pathname.includes("signup.html") ||
                             window.location.pathname.includes("forgot-password.html") ||
                             window.location.pathname.includes("reset-password.html");
            
            if (!isAuthPage && !window.location.pathname.includes("index.html")) {
                showToast("Session expired. Please login again", "error");
                setTimeout(() => window.location.href = "login.html", 2000);
            }
            updateNavbar(null);
            return null;
        }

        if (res.ok) {
            const data = await res.json();
            updateNavbar(data.user);
            return data.user;
        }
        updateNavbar(null);
        return null;
    } catch (err) {
        console.error("Auth check failed:", err);
        updateNavbar(null);
        return null;
    }
}

function updateNavbar(user) {
    const navAuth = document.getElementById("nav-auth");
    if (!navAuth) return;

    const path = window.location.pathname;
    const isHome = path.includes("index.html") || path === "/";
    const isPredict = path.includes("predict.html");

    let baseLinks = `
        <li class="nav-item"><a class="nav-link ${isHome ? 'active' : ''}" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="${isHome ? '#dataset' : 'index.html#dataset'}">Dataset</a></li>
        <li class="nav-item"><a class="nav-link ${isPredict ? 'active' : ''}" href="predict.html">Predict</a></li>
        <li class="nav-item"><a class="nav-link" href="${isHome ? '#contact' : 'index.html#contact'}">Contact</a></li>
    `;

    if (user) {
        const initial = user.username.charAt(0).toUpperCase();
        navAuth.innerHTML = baseLinks + `
            <li class="nav-item dropdown ms-lg-3">
                <a class="nav-link user-profile-btn" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="avatar-wrapper">
                        <div class="avatar-img">${initial}</div>
                        <div class="status-dot"></div>
                    </div>
                    <span>${user.username}</span>
                    <i class="fa-solid fa-chevron-down fs-xs ms-1 opacity-50"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-end profile-dropdown-menu border-0 shadow-lg animate slideIn">
                    <li>
                        <div class="profile-card-header">
                            <div class="avatar-img" style="width: 45px; height: 45px; font-size: 1.2rem;">${initial}</div>
                            <div class="header-info">
                                <h6>${user.username}</h6>
                                <p>${user.email}</p>
                            </div>
                        </div>
                    </li>
                    <li><hr class="dropdown-divider border-secondary-light opacity-10 my-0"></li>
                    <li class="profile-menu-items">
                        <a class="profile-item" href="#">
                            <i class="fa-solid fa-user-gear"></i>
                            <span>Account Settings</span>
                        </a>
                    </li>
                    <li>
                        <a class="profile-item-logout" href="#" onclick="logout()">
                            <i class="fa-solid fa-power-off"></i>
                            <span>Logout</span>
                        </a>
                    </li>
                </ul>
            </li>
        `;

        // Add GSAP animation to dropdown when opened
        const dropdownElement = document.getElementById('userDropdown');
        if (dropdownElement) {
            dropdownElement.addEventListener('shown.bs.dropdown', function () {
                gsap.from(".profile-dropdown-menu", {
                    opacity: 0,
                    y: -10,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        }
    } else {
        navAuth.innerHTML = baseLinks + `
            <li class="nav-item ms-lg-3">
                <a href="login.html" class="btn btn-outline-light px-4 me-2">Login</a>
                <a href="signup.html" class="btn btn-accent px-4 border-0">Signup</a>
            </li>
        `;
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, { 
            method: "POST", 
            credentials: "include" 
        });
        showToast("Logged out successfully", "success");
        setTimeout(() => window.location.href = "index.html", 1000);
    } catch (err) {
        showToast("Logout failed", "error");
    }
}

function setupAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            setBtnLoading("loginBtn", true, "Logging in...");

            try {
                const res = await fetch(`${API_BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Login Successful! Redirecting...", "success");
                    setTimeout(() => window.location.href = "index.html", 1500);
                } else {
                    showToast(data.message || "Login failed", "error");
                    setBtnLoading("loginBtn", false, "Login <i class='fa-solid fa-right-to-bracket ms-2'></i>");
                }
            } catch (err) {
                showToast("Server connection failed", "error");
                setBtnLoading("loginBtn", false, "Login <i class='fa-solid fa-right-to-bracket ms-2'></i>");
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            setBtnLoading("signupBtn", true, "Creating Account...");

            try {
                const res = await fetch(`${API_BASE_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password }),
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Registration Successful! Redirecting...", "success");
                    setTimeout(() => window.location.href = `verify.html?email=${encodeURIComponent(email)}`, 1500);
                } else {
                    showToast(data.message || "Registration failed", "error");
                    setBtnLoading("signupBtn", false, "Create Account <i class='fa-solid fa-user-plus ms-2'></i>");
                }
            } catch (err) {
                showToast("Server connection failed", "error");
                setBtnLoading("signupBtn", false, "Create Account <i class='fa-solid fa-user-plus ms-2'></i>");
            }
        });
    }

    const forgotForm = document.getElementById("forgotForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            
            setBtnLoading("forgotBtn", true, "Sending Link...");

            try {
                const res = await fetch(`${API_BASE_URL}/forgot-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (res.ok) {
                    // Premium Success UI transition
                    gsap.to("#forgotCard", { 
                        opacity: 0, 
                        y: -20, 
                        duration: 0.5, 
                        onComplete: () => {
                            document.getElementById("forgotCard").classList.add("d-none");
                            document.getElementById("successCard").classList.remove("d-none");
                            gsap.from("#successCard", { opacity: 0, y: 20, duration: 0.5 });
                        }
                    });
                } else {
                    showToast(data.message || "Failed to send reset link", "error");
                    setBtnLoading("forgotBtn", false, "Send Reset Link <i class='fa-solid fa-paper-plane ms-2'></i>");
                }
            } catch (err) {
                showToast("Server connection failed", "error");
                setBtnLoading("forgotBtn", false, "Send Reset Link <i class='fa-solid fa-paper-plane ms-2'></i>");
            }
        });
    }

    const resetForm = document.getElementById("resetForm");
    if (resetForm) {
        const token = getTokenFromURL();
        if (!token) {
            showToast("Invalid reset link. Redirecting...", "error");
            setTimeout(() => window.location.href = "login.html", 2000);
            return;
        }

        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                showToast("Passwords do not match!", "error");
                return;
            }

            setBtnLoading("resetBtn", true, "Updating Password...");

            try {
                const res = await fetch(`${API_BASE_URL}/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Password Reset Successful! Redirecting to login...", "success");
                    setTimeout(() => window.location.href = "login.html", 2000);
                } else {
                    showToast(data.message || "Reset failed", "error");
                    setBtnLoading("resetBtn", false, "Update Password <i class='fa-solid fa-shield-halved ms-2'></i>");
                }
            } catch (err) {
                showToast("Server connection failed", "error");
                setBtnLoading("resetBtn", false, "Update Password <i class='fa-solid fa-shield-halved ms-2'></i>");
            }
        });
    }

    const verifyForm = document.getElementById("verifyForm");
    const verifyEmailInput = document.getElementById("verifyEmail");
    
    if (verifyForm && verifyEmailInput) {
        // Populate email from URL
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        if (emailParam) verifyEmailInput.value = emailParam;

        verifyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = verifyEmailInput.value;
            const otp = document.getElementById("otp").value;

            setBtnLoading("verifyBtn", true, "Verifying...");

            try {
                const res = await fetch(`${API_BASE_URL}/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Email Verified Successfully! You can now login.", "success");
                    setTimeout(() => window.location.href = "login.html", 1500);
                } else {
                    showToast(data.message || "Verification failed", "error");
                    setBtnLoading("verifyBtn", false, "Verify Email <i class='fa-solid fa-circle-check ms-2'></i>");
                }
            } catch (err) {
                showToast("Server connection failed", "error");
                setBtnLoading("verifyBtn", false, "Verify Email <i class='fa-solid fa-circle-check ms-2'></i>");
            }
        });
    }
}

async function resendOtp() {
    const email = document.getElementById("verifyEmail").value;
    if (!email) {
        showToast("Email not found. Please sign up again.", "error");
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/forgot-password`, { // Re-using forgot-password to send OTP
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (res.ok) {
            showToast("New OTP sent to your email!", "success");
        } else {
            showToast("Failed to resend OTP", "error");
        }
    } catch (err) {
        showToast("Server connection failed", "error");
    }
}

function showToast(message, type = "info") {
    // Remove existing toasts first
    const existing = document.querySelectorAll(".toast-custom");
    existing.forEach(t => {
        t.style.animation = "toastSlideOut 0.3s forwards";
        setTimeout(() => t.remove(), 300);
    });

    const toast = document.createElement("div");
    toast.className = `toast-custom toast-${type}`;
    
    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "toastSlideOut 0.4s forwards";
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// =============== UI HELPERS ===============

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById("strength-bar");
    const strengthText = document.getElementById("strength-text");
    if (!strengthBar || !strengthText) return;

    if (!password) {
        strengthBar.className = "password-strength";
        strengthText.innerText = "";
        return;
    }

    if (password.length < 6) {
        strengthBar.className = "password-strength strength-weak";
        strengthText.innerText = "Too weak 🔴";
        strengthText.style.color = "#ff3b30";
    } else if (password.length < 10) {
        strengthBar.className = "password-strength strength-medium";
        strengthText.innerText = "Getting there 🟠";
        strengthText.style.color = "#ff9500";
    } else {
        strengthBar.className = "password-strength strength-strong";
        strengthText.innerText = "Strong password 🟢";
        strengthText.style.color = "#4cd964";
    }
}

function setBtnLoading(btnId, isLoading, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="loading-spinner me-2"></span> ${text || 'Please wait...'}`;
    } else {
        btn.disabled = false;
        btn.innerHTML = text;
    }
}

function getTokenFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
}
