// ==========================
// Backend URL
// ==========================

const API = "https://weekly-contest-719v.onrender.com/api";

// ==========================
// Total Balance
// ==========================

let totalBalance = Number(localStorage.getItem("totalBalance")) || 0;

function updateBalanceUI() {

    const el = document.getElementById("totalBalance");

    if (!el) return;

    totalBalance = Number(localStorage.getItem("totalBalance")) || 0;

    el.innerText = totalBalance.toLocaleString() + " BABYDOGE";

}

function addBalance(amount) {

    totalBalance += amount;

    localStorage.setItem("totalBalance", totalBalance);

    updateBalanceUI();

}

async function getDeviceId() {

    try {

        if (window.Capacitor && window.Capacitor.Plugins) {

            const Device = window.Capacitor.Plugins.Device;

            if (Device) {

                const result = await Device.getId();

                console.log("CAPACITOR DEVICE ID:", result.identifier);

                return result.identifier;

            }

        }

        const webId = "WEB-" + navigator.userAgent;

        console.log("WEB DEVICE ID:", webId);

        return webId;

    }

    catch (error) {

        console.log("DEVICE ID ERROR:", error);

        return "FALLBACK-" + Date.now();

    }

}

// ==========================
// Register User
// ==========================

async function registerUser() {

    let userId = localStorage.getItem("userId");

    try {

        const deviceId = await getDeviceId();

        console.log("DEVICE ID:", deviceId);

        const response = await fetch(API + "/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                deviceId: deviceId
            })

        });

        const data = await response.json();

        console.log("REGISTER RESPONSE:", JSON.stringify(data));

        if (!data.success) {

            console.log("Registration failed:", data.message);

            return;

        }

        // Always sync the server User ID
        localStorage.setItem(
            "userId",
            data.user.userId
        );

        console.log(
            "USER ID SAVED:",
            data.user.userId
        );

    }

    catch (err) {

        console.log(
            "REGISTER ERROR:",
            err
        );

    }

}

// ==========================
// Home Page Navigation
// ==========================

function goCaptcha() {

    window.location.href = "captcha.html";

}



function goRedeem() {

    window.location.href = "redeem.html";

}

// ==========================
// Card Click Animation
// ==========================

document.querySelectorAll(".card").forEach(card => {

    card.addEventListener("click", () => {

        card.style.transform = "scale(0.96)";

        setTimeout(() => {

            card.style.transform = "";

        }, 120);

    });

});

// ==========================
// Fade In
// ==========================

window.addEventListener("load", () => {

    document.body.style.opacity = "0";

    setTimeout(() => {

        document.body.style.transition = "opacity .5s ease";

        document.body.style.opacity = "1";

    }, 100);

    registerUser();

    updateBalanceUI();

});

// ==========================
// Refresh Balance When Page Opens Again
// ==========================

window.addEventListener("pageshow", () => {

    updateBalanceUI();

});