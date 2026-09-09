// ============================================
// Global Background Mining Engine (Offline Catch-Up Enabled)
// ============================================

const MINING_RATE_PER_SEC = 500; // 1 Miner = +500 BABYDOGE/sec

function calculateOfflineMining() {
    let activeMiners = JSON.parse(localStorage.getItem("activeMinersList")) || [];
    if (activeMiners.length === 0) return;

    const now = Date.now();
    const lastTime = Number(localStorage.getItem("lastActiveTime")) || now;
    
    // Agar app band tha toh beete huye seconds count karein
    const elapsedSeconds = Math.floor((now - lastTime) / 1000);

    if (elapsedSeconds > 0) {
        let totalMinedCoins = 0;

        // Har active miner ke liye check karein ki wo app band rehne ke dauran kitne sec active tha
        activeMiners.forEach(expiryTime => {
            if (expiryTime > lastTime) {
                // Effective active seconds calculate karein
                const activeSecondsInGap = Math.min(now, expiryTime) - lastTime;
                if (activeSecondsInGap > 0) {
                    totalMinedCoins += Math.floor(activeSecondsInGap / 1000) * MINING_RATE_PER_SEC;
                }
            }
        });

        if (totalMinedCoins > 0) {
            let totalBalance = Number(localStorage.getItem("totalBalance")) || 0;
            totalBalance += totalMinedCoins;
            localStorage.setItem("totalBalance", totalBalance);
        }
    }

    // Filter out expired miners
    const validMiners = activeMiners.filter(expiryTime => expiryTime > now);
    localStorage.setItem("activeMinersList", JSON.stringify(validMiners));
    localStorage.setItem("lastActiveTime", now);
}

function runGlobalMiningEngine() {
    // 1. App open hote hi offline time ke coins instantly calculate karein
    calculateOfflineMining();
    updateAllPageDisplays();

    // 2. Continuous 1-Second Mining Interval
    setInterval(() => {
        let activeMiners = JSON.parse(localStorage.getItem("activeMinersList")) || [];
        const now = Date.now();

        // Expired miners remove karein
        const validMiners = activeMiners.filter(expiryTime => expiryTime > now);
        if (validMiners.length !== activeMiners.length) {
            localStorage.setItem("activeMinersList", JSON.stringify(validMiners));
        }

        // Active miners ke coins har second add karein
        if (validMiners.length > 0) {
            let totalBalance = Number(localStorage.getItem("totalBalance")) || 0;
            totalBalance += validMiners.length * MINING_RATE_PER_SEC;
            localStorage.setItem("totalBalance", totalBalance);
        }

        // System ka Current Time save karein (Offline Tracking ke liye)
        localStorage.setItem("lastActiveTime", now);

        // Dynamic UI Update
        updateAllPageDisplays();
    }, 1000);
}

function updateAllPageDisplays() {
    const balance = Number(localStorage.getItem("totalBalance")) || 0;
    const activeMiners = JSON.parse(localStorage.getItem("activeMinersList")) || [];

    // Dashboard Element
    const userBalanceElem = document.getElementById("userBalance");
    if (userBalanceElem) {
        userBalanceElem.innerText = Math.floor(balance).toLocaleString() + " BABYDOGE";
    }

    // Mining Page Elements
    const minedDisplayElem = document.getElementById("minedDisplay");
    if (minedDisplayElem) {
        minedDisplayElem.innerText = Math.floor(balance).toLocaleString() + " BABYDOGE";
    }
    const activeMinersDisplay = document.getElementById("activeMinersDisplay");
    if (activeMinersDisplay) {
        activeMinersDisplay.innerText = activeMiners.length + " Active";
    }

    // Redeem Page Element
    const redeemBalanceElem = document.getElementById("redeemBalance");
    if (redeemBalanceElem) {
        redeemBalanceElem.innerText = Math.floor(balance).toLocaleString() + " BABYDOGE";
    }
}

// Automatically start engine when page loads
runGlobalMiningEngine();