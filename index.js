// =========================
// SUPABASE INIT
// =========================

const supabaseUrl = "https://nrwhupzgdwlsdnwdfpig.supabase.co";

const supabaseKey = "sb_publishable_4I-i-becqQZHBXK-skXDfA_gQLOID3a";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);


// =========================
// CREATE SIGNAL
// =========================

async function createSignal() {

  let pair = document.getElementById("pair").value.trim();
  let type = document.getElementById("type").value;
  let entry = document.getElementById("entry").value.trim();
  let strength = document.getElementById("strength").value.trim();
  let target = document.getElementById("target").value.trim();
  let stoploss = document.getElementById("stoploss").value.trim();

  if (!pair || !entry || !strength || !target || !stoploss) {
    alert("Please fill all fields");
    return;
  }

  const { error } = await supabaseClient
    .from("signals")
    .insert([
      {
        pair,
        type,
        entry: Number(entry),
        strength,
        target: Number(target),
        stoploss: Number(stoploss)
      }
    ]);

  if (error) {
    console.log("SUPABASE ERROR:", error);
    alert("Failed: " + error.message);
    return;
  }

  alert("Signal Added Successfully");

  document.getElementById("pair").value = "";
  document.getElementById("entry").value = "";
  document.getElementById("strength").value = "";
  document.getElementById("target").value = "";
  document.getElementById("stoploss").value = "";

  loadSignals();
}


// =========================
// LOAD SIGNALS (FULL LIST)
// =========================

async function loadSignals() {

  const { data, error } = await supabaseClient
    .from("signals")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("LOAD ERROR:", error);
    return;
  }

  const container = document.getElementById("signals");
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="color:#888;text-align:center;">No Signals Available</p>`;
    return;
  }

  container.innerHTML = data.map(signal => {

    let typeColor =
      signal.type === "BUY" ? "#22c55e" :
      signal.type === "SELL" ? "#ef4444" :
      "#facc15";

    return `
      <div class="card" style="border-left:5px solid ${typeColor}; margin:10px; padding:10px;">
        <h3>${signal.pair}</h3>
        <p style="color:${typeColor}"><strong>${signal.type}</strong></p>
        <p>Entry: ${signal.entry}</p>
        <p>Strength: ${signal.strength}</p>
        <p>TP: ${signal.target}</p>
        <p>SL: ${signal.stoploss}</p>
      </div>
    `;
  }).join("");
}


// =========================
// HISTORY TABLE LIVE UPDATE
// =========================

function renderLatestSignal(signal) {

  const container = document.getElementById("historyTableBody");
  if (!container) return;

  let typeColor =
    signal.type === "BUY" ? "text-green-500" :
    signal.type === "SELL" ? "text-red-500" :
    "text-yellow-500";

  const row = `
    <tr class="hover:bg-black/10">
      <td class="py-3 font-bold">${signal.pair}</td>
      <td class="py-3 ${typeColor} font-bold">${signal.type}</td>
      <td class="py-3">${signal.entry}</td>
      <td class="py-3">${signal.target}</td>
      <td class="py-3 text-green-500 font-bold">
        <i class="fa-solid fa-satellite-dish mr-1"></i> LIVE
      </td>
    </tr>
  `;

  container.insertAdjacentHTML("afterbegin", row);
}

// =========================
// OPTIONAL: LIVE CARD UPDATE
// =========================

function updateLiveCard(signal) {

  const box =
  document.getElementById("liveFeedCard");

  if (!box) return;

  const badgeColor =
  signal.type === "BUY"
  ? "background:#00ff99;color:black;"
  : "background:#ff4d6d;color:white;";

  box.innerHTML = `

  <div class="glass-panel glow-box-open rounded-2xl p-5 relative">

    <div class="flex justify-between items-start mb-3">

      <span class="font-cyber font-bold text-lg text-white">

        ${signal.pair}

        <span
        style="${badgeColor}"
        class="text-[10px] px-2 py-0.5 rounded ml-2 font-bold uppercase">

          ${signal.type}

        </span>

      </span>

      <span
      class="text-[11px] font-mono text-slate-400
      bg-black/20 px-2 py-0.5 rounded border border-slate-800">

        <i class="fa-regular fa-clock mr-1"></i>

        LIVE

      </span>

    </div>

    <div
    class="space-y-2 bg-black/30 p-3 rounded-xl
    text-xs font-mono text-slate-200">

      <div class="flex justify-between border-b border-white/5 pb-1">

        <span>ENTRY:</span>

        <span class="font-bold">
          ${signal.entry}
        </span>

      </div>

      <div class="flex justify-between border-b border-white/5 pb-1">

        <span>STOP LOSS:</span>

        <span
        style="color:#ff4d6d"
        class="font-bold">

          ${signal.stoploss}

        </span>

      </div>

      <div class="flex justify-between">

        <span>TAKE PROFIT:</span>

        <span
        style="color:#00ff99"
        class="font-bold">

          ${signal.target}

        </span>

      </div>

    </div>

  </div>

  `;
}


// =========================
// REALTIME LISTENER
// =========================

function realtimeSignals() {

  supabaseClient
  .channel("signals-live")

  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "signals"
    },

    (payload) => {

      console.log(
      "LIVE UPDATE:",
      payload
      );

      if (
        payload.eventType === "INSERT"
      ) {

        renderLatestSignal(
        payload.new
        );

        updateLiveCard(
        payload.new
        );

      }

      else if (
        payload.eventType === "UPDATE"
      ) {

        loadSignals();

      }

      else if (
        payload.eventType === "DELETE"
      ) {

        loadSignals();

      }

    }

  )

  .subscribe((status) => {

    console.log(
    "SUPABASE STATUS:",
    status
    );

  });

}


// =========================
// INIT
// =========================

document.addEventListener(
"DOMContentLoaded",

async () => {

  console.log(
  "DOM LOADED"
  );

  // LOAD SIGNAL LIST
  await loadSignals();

  // GET LATEST SIGNAL
  const { data, error } =
  await supabaseClient
  .from("signals")
  .select("*")
  .order("id", {
    ascending: false
  })
  .limit(1);

  if (error) {

    console.log(
    "LATEST SIGNAL ERROR:",
    error
    );

  }

  // LIVE CARD
  if (
    data &&
    data.length > 0
  ) {

    updateLiveCard(
    data[0]
    );

    // HISTORY
    const {
      data: historySignals
    } =
    await supabaseClient
    .from("signals")
    .select("*")
    .order("id", {
      ascending: false
    })
    .range(1, 10);

    if (
      historySignals &&
      historySignals.length > 0
    ) {

      historySignals.forEach(
      signal => {

        renderLatestSignal(
        signal
        );

      });

    }

  }

  // REALTIME
  realtimeSignals();

});

// =========================
// HANDLE AUTH SUBMIT
// =========================
function handleAuthSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("userEmailInput").value.trim();

    if (!email) {
        alert("Enter email first");
        return;
    }

    currentLoggedUserEmail = email;

    // close auth modal properly
    document.getElementById("authModal").classList.add("hidden");
    document.getElementById("authModal").classList.remove("flex");

    // open payment modal properly
    const payModal = document.getElementById("paymentModal");
    payModal.classList.remove("hidden");
    payModal.classList.add("flex");
}

// =========================
// SUBMIT PAYMENT TXID
// =========================

async function submitTxid(e) {

    e.preventDefault();

    try {

        const txidHash =
        document.getElementById("txidInput").value.trim();

        const email =
        document.getElementById("userEmailInput").value.trim();

        let method = "BINANCE PAY";

        // USDT NETWORK CHECK
        if (
            document.getElementById("contentUsdt") &&
            !document.getElementById("contentUsdt").classList.contains("hidden")
        ) {

            method =
            document.getElementById("networkSelect").value;
        }

        // EMPTY CHECK
        if (!email || !txidHash) {

            alert("Please complete payment form");

            return;
        }

        // SAVE TO SUPABASE
        const { error } =
        await supabaseClient
        .from("vip_payments")
        .insert([
            {
                email: email,
                method: method,
                txid: txidHash,
                status: "pending"
            }
        ]);

        // ERROR CHECK
        if (error) {

            console.log(
            "PAYMENT ERROR:",
            error
            );

            alert(
            "Payment submit failed: " + error.message
            );

            return;
        }

        // SUCCESS
        alert(
        "Payment submitted successfully"
        );

        // CLEAR INPUT
        document.getElementById("txidInput").value = "";

        // CLOSE MODAL
        closePaymentModal();

    }

    catch(err) {

        console.log(
        "VIP PAYMENT SYSTEM ERROR:",
        err
        );

        alert(
        "Unexpected error occurred"
        );
    }
}

// =========================
// SUBMIT REFERRAL UID
// =========================

async function submitReferralUid(e) {
    e.preventDefault();

    const uidDetails = document.getElementById("userUidInput").value.trim();
    const email = currentLoggedUserEmail;

    if (!uidDetails || !email) {
        alert("Please enter UID");
        return;
    }

    try {
        const { error } = await supabaseClient
        .from("vip_payments")
        .insert([{
            email: email,
            method: "REFERRAL UID",
            txid: uidDetails,
            status: "pending"
        }]);

        if (error) {
            alert("Submit failed: " + error.message);
            return;
        }

        // ✅ STEP 1: POPUP CONFIRMATION
        const ok = confirm("✅ Submitted successfully!\nPress OK to continue.");

        if (ok) {

            // ❌ hide form immediately
            document.querySelector("#paymentModal form").style.display = "none";

            // 🔄 show loading state first (smooth feel)
            const waitingBox = document.getElementById("waitingApproval");
            waitingBox.innerHTML = "⏳ Loading...";
            waitingBox.classList.remove("hidden");

            // 🎬 small delay for smooth UX
            setTimeout(() => {

                waitingBox.innerHTML = `
                    ⏳ Waiting For Approval...
                `;

                waitingBox.classList.add("animate-pulse");

            }, 800);

            // clear input
            document.getElementById("userUidInput").value = "";
        }

    } catch (err) {
        console.log(err);
        alert("Unexpected error");
    }
}
// =========================
// LOGOUT
// =========================

function logout() {

  localStorage.removeItem("adminLoggedIn");

  window.location.href = "admin.html";

}
