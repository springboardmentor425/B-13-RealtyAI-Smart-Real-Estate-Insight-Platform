// =============== 1. LOADING SCREEN ANIMATION (GSAP) ===============
document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loading-screen");
    
    // Only run loader on index page
    if (loadingScreen) {
        const tl = gsap.timeline();

        // Foundation
        tl.to(".foundation", { opacity: 1, duration: 0.5, ease: "power2.out" })
          // Walls
          .to(".walls", { opacity: 1, height: "60px", duration: 1, ease: "bounce.out" })
          // Roof
          .to(".roof", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.2")
          // Windows
          .to(".window", { opacity: 1, duration: 0.5, stagger: 0.2 })
          // Morph to Logo
          .to(".foundation, .walls, .roof, .window", { opacity: 0, duration: 0.5, delay: 0.5 })
          .to(".glow-icon", { opacity: 1, scale: 1.2, duration: 1, ease: "elastic.out(1, 0.3)" })
          // Loading Bar
          .to(".loading-bar", { width: "100%", duration: 2, ease: "power1.inOut" }, "-=1")
          // Fade Out Screen
          .to(loadingScreen, { opacity: 0, duration: 1, onComplete: () => {
              loadingScreen.style.display = "none";
              // Init AOS after loader finishes
              AOS.init({ once: true });
          }});
    } else {
        // Init AOS immediately on other pages
        AOS.init({ once: true });
    }

    // Initialize dataset interactions
    initPillars();
    
    // Populate locations dropdown if on predict page
    if (document.getElementById("uiLocations")) {
        onPageLoad();
    }
});

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
        alert("Please enter the Area (sqft) and select a Location.");
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
