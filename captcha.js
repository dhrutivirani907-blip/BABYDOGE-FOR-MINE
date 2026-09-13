// Configuration Settings
const ADS_PER_MINER = 25; 
const MINING_RATE_PER_SEC = 500;
const MINER_DURATION_MS = 60 * 60 * 1000; // 1 Hour
const ADSTERRA_DIRECT_LINK = "https://www.profitableratecpmnetwork.com/mag701y1?key=e6dcf81d34580abdf64766ac0be7e76d";

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

// Ad Tracker State
let adStartTime = 0;
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

// Global Window Functions for HTML Buttons
window.openInstructionModal = function() {
    const modal = document.getElementById("instructionModal");
    if (modal) {
        modal.style.display = "flex";
    } else {
        console.error("Modal element #instructionModal not found!");
    }
};

window.closeInstructionModal = function() {
    const modal = document.getElementById("instructionModal");
    if (modal) {
        modal.style.display = "none";
    }
};

window.startAdsterraAd = function() {
    window.closeInstructionModal();

    const watchBtn = document.getElementById("watchAdBtn");

    if (watchBtn) {
        watchBtn.disabled = true;
        watchBtn.innerText = "⏳ Watching Ad...";
    }

    adStartTime = Date.now();
    isTrackingAd = true;

    // Open External Link safely via Telegram WebApp or standard window open
    openExternalLink(ADSTERRA_DIRECT_LINK);
};

function openExternalLink(url) {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openLink) {
        window.Telegram.WebApp.openLink(url);
    } else {
        window.open(url, '_blank');
    }
}

// Event Listeners to detect when user returns to app
window.addEventListener('focus', () => {
    if (isTrackingAd) {
        verifyAdRules();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isTrackingAd) {
        verifyAdRules();
    }
});

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

// 8-Second Timer Verification Logic
function verifyAdRules() {
    if (!isTrackingAd) return;

    const watchDurationSec = (Date.now() - adStartTime) / 1000;
    isTrackingAd = false;

    if (watchDurationSec < 8) {
        alert(`⚠️ Verification Failed!\n\nAapko kam se kam 8 second ad dekhna zaroori hai. (Watched: ${Math.floor(watchDurationSec)}s)`);
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
