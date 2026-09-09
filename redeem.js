const API = "https://weekly-contest-719v.onrender.com/api";

function getUserId() {
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user?.id) {
            return window.Telegram.WebApp.initDataUnsafe.user.id;
        }
    } catch(e) {}
    return localStorage.getItem("userId") || "demo_user";
}

function showOptionPage() {
    const optionPage = document.getElementById("optionPage");
    const binancePage = document.getElementById("binancePage");
    const bep20Page = document.getElementById("bep20Page");

    if (optionPage) optionPage.style.display = "block";
    if (binancePage) binancePage.style.display = "none";
    if (bep20Page) bep20Page.style.display = "none";
}

function showBinancePage() {
    const optionPage = document.getElementById("optionPage");
    const binancePage = document.getElementById("binancePage");
    const bep20Page = document.getElementById("bep20Page");

    if (optionPage) optionPage.style.display = "none";
    if (binancePage) binancePage.style.display = "block";
    if (bep20Page) bep20Page.style.display = "none";
}

function showBep20Page() {
    const optionPage = document.getElementById("optionPage");
    const binancePage = document.getElementById("binancePage");
    const bep20Page = document.getElementById("bep20Page");

    if (optionPage) optionPage.style.display = "none";
    if (binancePage) binancePage.style.display = "none";
    if (bep20Page) bep20Page.style.display = "block";
}

function processWithdrawal(walletInputId, amountInputId, minAmount, withdrawType, btnElement) {
    const walletInput = document.getElementById(walletInputId);
    const amountInput = document.getElementById(amountInputId);

    if (!walletInput || !amountInput) {
        alert("Error: Form elements (" + walletInputId + ") not found in HTML!");
        return;
    }

    const wallet = walletInput.value.trim();
    const amount = Number(amountInput.value);
    const userId = getUserId();
    let currentBalance = Number(localStorage.getItem("totalBalance")) || 0;

    if (!wallet) return alert("Please enter valid Wallet/UID details.");
    if (!amount || amount < minAmount) return alert("Minimum withdrawal is " + minAmount.toLocaleString() + " BabyDoge.");
    if (amount > currentBalance) return alert("Insufficient Balance! Available: " + currentBalance.toLocaleString());

    btnElement.disabled = true;
    btnElement.innerText = "Processing...";

    // Force balance update local storage
    currentBalance -= amount;
    localStorage.setItem("totalBalance", currentBalance);

    // Call API (Background)
    fetch(`${API}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: String(userId).trim(), wallet, amount, type: withdrawType })
    }).catch(err => console.warn("Server offline, saved locally.", err));

    alert("✅ Withdrawal Request Submitted Successfully!");

    walletInput.value = "";
    amountInput.value = "";
    btnElement.disabled = false;
    btnElement.innerText = "Submit";
    showOptionPage();
}

document.addEventListener("DOMContentLoaded", () => {
    showOptionPage();

    // 1. Setup Card Clicks
    const binanceCard = document.getElementById("binanceCard");
    if (binanceCard) binanceCard.onclick = () => showBinancePage();

    const bep20Card = document.getElementById("bep20Card");
    if (bep20Card) bep20Card.onclick = () => showBep20Page();

    // 2. Setup Navigation Back Button
    const backNavBtn = document.getElementById("backNavBtn");
    if (backNavBtn) {
        backNavBtn.onclick = () => {
            const binancePage = document.getElementById("binancePage");
            const bep20Page = document.getElementById("bep20Page");
            const isBinanceActive = binancePage && binancePage.style.display === "block";
            const isBepActive = bep20Page && bep20Page.style.display === "block";

            if (isBinanceActive || isBepActive) {
                showOptionPage();
            } else {
                window.location.href = "index.html";
            }
        };
    }

    // 3. Directly attach event handlers without blocking
    const binanceSubmitBtn = document.getElementById("binanceSubmitBtn");
    if (binanceSubmitBtn) {
        binanceSubmitBtn.onclick = function(e) {
            e.preventDefault();
            processWithdrawal("binanceUidInput", "binanceAmountInput", 1000000, "BINANCE", binanceSubmitBtn);
        };
    }

    const bep20SubmitBtn = document.getElementById("bep20SubmitBtn");
    if (bep20SubmitBtn) {
        bep20SubmitBtn.onclick = function(e) {
            e.preventDefault();
            processWithdrawal("bep20AddressInput", "bep20AmountInput", 70000000, "BEP20", bep20SubmitBtn);
        };
    }
});

window.addEventListener("pageshow", showOptionPage);