// ================================
// Backend API
// ================================

const API = "https://weekly-contest-719v.onrender.com/api";

// ================================
// Elements
// ================================

const historyList = document.getElementById("historyList");

// ================================
// Load History
// ================================

loadHistory();

async function loadHistory() {

    const userId = localStorage.getItem("userId");

    if (!userId) {

        historyList.innerHTML = `

            <div class="history-card">

                <h3 style="text-align:center;">

                    User ID Not Found

                </h3>

            </div>

        `;

        return;

    }

    try {

        const res = await fetch(API + "/redeem/" + userId);

        const data = await res.json();

        if (!data.success) {

            historyList.innerHTML = `

                <div class="history-card">

                    <h3 style="text-align:center;">

                        Failed to Load History

                    </h3>

                </div>

            `;

            return;

        }

        if (data.history.length === 0) {

            historyList.innerHTML = `

                <div class="history-card">

                    <h3 style="text-align:center;">

                        No Redeem History

                    </h3>

                </div>

            `;

            return;

        }

        historyList.innerHTML = "";

        data.history.forEach(item => {

            let statusClass = "";

            if (item.status === "Pending") {

                statusClass = "pending";

            }

            else if (item.status === "Approved") {

                statusClass = "approved";

            }

            else {

                statusClass = "rejected";

            }

            historyList.innerHTML += `

    <div class="history-card">

        <div class="history-top">

            <h3>${item.amount.toLocaleString()} BabyDoge</h3>

            <span class="${statusClass}">

                ${item.status}

            </span>

        </div>

        <p><strong>Wallet</strong></p>

        <small>${item.wallet}</small>

        <br><br>

        <p>
            <strong>Withdrawal :</strong>
            ${item.amount.toLocaleString()} BabyDoge
        </p>

        <p>
            <strong>Fee :</strong>
            ${(item.fee || 10000000).toLocaleString()} BabyDoge
        </p>

        <p>
            <strong>Total Deduct :</strong>
            ${(item.totalDeduct || (item.amount + (item.fee || 10000000))).toLocaleString()} BabyDoge
        </p>

        <div class="history-bottom">

            <span>${new Date(item.date).toLocaleString()}</span>

        </div>

    </div>

`;
        });

    }

    catch (err) {

        console.log(err);

        historyList.innerHTML = `

            <div class="history-card">

                <h3 style="text-align:center;">

                    Server Error

                </h3>

            </div>

        `;

    }

}