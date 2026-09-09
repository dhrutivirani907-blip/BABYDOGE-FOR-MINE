// ============================================
// OnClickA SDK & Multi-Miner Mining System
// ============================================

const SPOT_ID = '6151066';
const ADS_PER_MINER = 15; 
const MINING_RATE_PER_SEC = 500; // 1 Miner = +500 BABYDOGE/sec
const MINER_DURATION_MS = 60 * 60 * 1000; // 1 Hour

// --------------------------------------------
// Local Storage State Management
// --------------------------------------------
let totalBalance = Number(localStorage.getItem("totalBalance")) || 0;
let adsWatched = Number(localStorage.getItem("adsWatchedCount")) || 0;
let activeMiners = JSON.parse(localStorage.getItem("activeMinersList")) || [];

// Expose click handler globally early in the execution context
window.handleAdClick = handleAdClick;

// --------------------------------------------
// OnClickA SDK Safe Initialization
// --------------------------------------------
function initOnClickA() {
    if (window.initCdTma) {
        window.initCdTma({ id: SPOT_ID })
            .then(show => {
                window.show = show;
                console.log("OnClickA Ad SDK Successfully Initialized!");
            })
            .catch(e => {
                console.error('OnClickA Ad Init Error:', e);
            });
    } else {
        setTimeout(initOnClickA, 500);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    } catch (e) {
        console.error("Telegram WebApp Error:", e);
    }

    initOnClickA();
    updateUI();

    // Bind event directly via JS to ensure mobile WebView compatibility
    const watchBtn = document.getElementById("watchAdBtn");
    if (watchBtn) {
        watchBtn.addEventListener("click", handleAdClick);
    }
});

// --------------------------------------------
// Real-Time Mining Engine (Executes Every 1 Second)
// --------------------------------------------
setInterval(() => {
    const now = Date.now();
    
    // Remove Expired Miners (> 1 Hour old)
    const validMiners = activeMiners.filter(expiryTime => expiryTime > now);
    
    if (validMiners.length !== activeMiners.length) {
        activeMiners = validMiners;
        localStorage.setItem("activeMinersList", JSON.stringify(activeMiners));
    }

    // Add Mining Reward
    if (activeMiners.length > 0) {
        const minedAmount = activeMiners.length * MINING_RATE_PER_SEC;
        totalBalance += minedAmount;
        localStorage.setItem("totalBalance", totalBalance);
    }

    updateUI();
}, 1000);

// --------------------------------------------
// UI Renderer
// --------------------------------------------
function updateUI() {
    const minedDisplay = document.getElementById("minedDisplay");
    const activeMinersDisplay = document.getElementById("activeMinersDisplay");
    const adCounterText = document.getElementById("adCounterText");

    if (minedDisplay) {
        minedDisplay.innerText = Math.floor(totalBalance).toLocaleString() + " BABYDOGE";
    }
    if (activeMinersDisplay) {
        activeMinersDisplay.innerText = activeMiners.length + " Active";
    }
    if (adCounterText) {
        adCounterText.innerText = `Progress: ${adsWatched} / ${ADS_PER_MINER} Ads`;
    }
}

// --------------------------------------------
// OnClickA Ad Click Handler
// --------------------------------------------
function handleAdClick(e) {
    if (e && e.preventDefault) e.preventDefault();

    const btn = document.getElementById("watchAdBtn");
    if (btn && btn.disabled) return;

    if (btn) {
        btn.disabled = true;
        btn.innerText = "⏳ Requesting Ad...";
    }

    // Attempt 1: Using initialized window.show
    if (typeof window.show === 'function') {
        window.show()
            .then(() => {
                processAdCompletion();
            })
            .catch((err) => {
                console.error("Ad Show Error:", err);
                const msg = typeof err === 'object' ? JSON.stringify(err) : err;
                alert("⚠️ Ad Error: " + (msg || "No fill ya user ne close kar diya."));
            })
            .finally(() => {
                resetButtonState();
            });
    } 
    // Attempt 2: Fallback initialization on demand
    else if (window.initCdTma) {
        window.initCdTma({ id: SPOT_ID })
            .then(show => {
                window.show = show;
                return window.show();
            })
            .then(() => {
                processAdCompletion();
            })
            .catch((err) => {
                console.error("Ad Fallback Error:", err);
                const msg = typeof err === 'object' ? JSON.stringify(err) : err;
                alert("⚠️ SDK Init Error: " + (msg || "Ad Server connect nahi ho paya."));
            })
            .finally(() => {
                resetButtonState();
            });
    } 
    // Attempt 3: SDK script missing
    else {
        alert("⚠️ OnClickA tma.js SDK script HTML me load nahi hui hai.");
        resetButtonState();
    }
}

// --------------------------------------------
// Ad Verification & Miner Allocation Logic
// --------------------------------------------
async function processAdCompletion() {
    adsWatched += 1;

    if (adsWatched >= ADS_PER_MINER) {
        adsWatched = 0; // Reset counter for next cycle
        
        const expiryTime = Date.now() + MINER_DURATION_MS;
        activeMiners.push(expiryTime);
        localStorage.setItem("activeMinersList", JSON.stringify(activeMiners));

        alert(`🎉 Congratulations!\n\nAapne ${ADS_PER_MINER} Ads poore kar liye hain! 1 Naya Miner 1 ghante ke liye activate ho gaya hai (+500 BABYDOGE/sec).`);
    } else {
        alert(`✅ Ad Verified!\n\nProgress: ${adsWatched} / ${ADS_PER_MINER} Ads completed.`);
    }

    localStorage.setItem("adsWatchedCount", adsWatched);
    updateUI();
}

function resetButtonState() {
    const btn = document.getElementById("watchAdBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerText = "WATCH AD";
    }
}
