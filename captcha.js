// Configuration Settings
const ADS_PER_MINER = 25; 
const MINING_RATE_PER_SEC = 500;
const MINER_DURATION_MS = 60 * 60 * 1000; // 1 Hour

// Storage Keys
const STORAGE_KEYS = {
    BALANCE: "totalBalance",
    ADS_COUNT: "adsWatchedCount",
    MINERS: "activeMinersList",
    LAST_TICK: "lastTickTimestamp"
};

// Application State Variables
let totalBalance = Number(localStorage.getItem(STORAGE_KEYS.BALANCE)) || 0;
let adsWatched = Number(localStorage.getItem(STORAGE_KEYS.ADS_COUNT)) || 0;
let activeMiners = [];
let lastTickTime = Number(localStorage.getItem(STORAGE_KEYS.LAST_TICK)) || Date.now();

let adStartTime = 0;
let adClicked = false;
let isTrackingAd = false;

// Safe LocalStorage Parser
try {
    const rawMiners = localStorage.getItem(STORAGE_KEYS.MINERS);
    activeMiners = rawMiners ? JSON.parse(rawMiners) : [];
    if (!Array.isArray(activeMiners)) activeMiners = [];
} catch (e) {
    console.error("Failed to parse miners state:", e);
    activeMiners = [];
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    initTelegramApp();
    updateUI();
});

function initTelegramApp() {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }
    } catch (e) {
        console.warn("Telegram WebApp initialization bypassed:", e);
    }
}

// Background Mining Engine Tick (1 Sec)
setInterval(() => {
    const now = Date.now();
    const deltaSeconds = Math.max(0, (now - lastTickTime) / 1000);
    lastTickTime = now;
    localStorage.setItem(STORAGE_KEYS.LAST_TICK, lastTickTime.toString());

    // Filter active miners
    const validMiners = activeMiners.filter(expiryTime => expiryTime > now);
    if (validMiners.length !== activeMiners.length) {
        activeMiners = validMiners;
        localStorage.setItem(STORAGE_KEYS.MINERS, JSON.stringify(activeMiners));
    }

    // Process mining earnings
    if (activeMiners.length > 0 && deltaSeconds > 0) {
        totalBalance += activeMiners.length * MINING_RATE_PER_SEC * deltaSeconds;
        localStorage.setItem(STORAGE_KEYS.BALANCE, totalBalance.toString());
    }

    updateUI();
}, 1000);

// UI Renderer
function updateUI() {
    const minedDisplay = document.getElementById("minedDisplay");
    const activeMinersDisplay = document.getElementById("activeMinersDisplay");
    const adCounterText = document.getElementById("adCounterText");

    if (minedDisplay) {
        minedDisplay.innerText = `${Math.floor(totalBalance).toLocaleString()} BABYDOGE`;
    }
    if (activeMinersDisplay) {
        activeMinersDisplay.innerText = `${activeMiners.length} Active`;
    }
    if (adCounterText) {
        adCounterText.innerText = `Progress: ${adsWatched} / ${ADS_PER_MINER} Ads`;
    }
}

// Modal Handlers
function openInstructionModal() {
    const modal = document.getElementById("instructionModal");
    if (modal) modal.style.display = "flex";
}

function closeInstructionModal() {
    const modal = document.getElementById("instructionModal");
    if (modal) modal.style.display = "none";
}

// Detect window blur for ad interaction verification
window.addEventListener("blur", () => {
    if (isTrackingAd) {
        adClicked = true;
    }
});

// Ad Execution Logic
function startMonetagAd() {
    closeInstructionModal();

    if (typeof show_11766459 !== "function") {
        alert("⚠️ Ad SDK failed to load. Please disable AdBlocker or check your internet connection.");
        return;
    }

    const watchBtn = document.getElementById("watchAdBtn");
    if (watchBtn) {
        watchBtn.disabled = true;
        watchBtn.innerText = "⏳ Watching Ad...";
    }

    adStartTime = Date.now();
    adClicked = false;
    isTrackingAd = true;

    show_11766459()
        .then(() => {
            verifyAdRules();
        })
        .catch((err) => {
            console.error("Monetag Execution Error:", err);
            alert("⚠️ Ad display was interrupted or failed to load properly.");
            resetButtonState();
        });
}

// Strict Verification Layer
function verifyAdRules() {
    isTrackingAd = false;
    const watchDurationSec = (Date.now() - adStartTime) / 1000;

    if (watchDurationSec < 10) {
        alert(`⚠️ Verification Failed!\n\nYou must watch the ad for at least 10 seconds. (Watched: ${Math.floor(watchDurationSec)}s)`);
        resetButtonState();
        return;
    }

    if (!adClicked) {
        alert("⚠️ Verification Failed!\n\nYou must CLICK on the advertisement banner/link to earn ad credit.");
        resetButtonState();
        return;
    }

    processAdCompletion();
    resetButtonState();
}

// Credit & Miner Rewards Handler
function processAdCompletion() {
    adsWatched += 1;

    if (adsWatched >= ADS_PER_MINER) {
        adsWatched = 0;
        const expiryTime = Date.now() + MINER_DURATION_MS;
        activeMiners.push(expiryTime);
        localStorage.setItem(STORAGE_KEYS.MINERS, JSON.stringify(activeMiners));

        alert(`🎉 Success!\n\nYou completed ${ADS_PER_MINER} verified ads! 1 New Miner activated for 1 hour (+500 BABYDOGE/sec).`);
    } else {
        alert(`✅ Ad Verified!\n\nProgress: ${adsWatched} / ${ADS_PER_MINER} Ads completed.`);
    }

    localStorage.setItem(STORAGE_KEYS.ADS_COUNT, adsWatched.toString());
    updateUI();
}

// Reset UI Button State
function resetButtonState() {
    isTrackingAd = false;
    const watchBtn = document.getElementById("watchAdBtn");
    if (watchBtn) {
        watchBtn.disabled = false;
        watchBtn.innerText = "WATCH AD";
    }
}
