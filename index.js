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

  let badgeColor =
    signal.type === "BUY"
      ? "bg-neonGreen/10 text-neonGreen"
      : "bg-neonRed/10 text-neonRed";

  box.innerHTML = `

    <div class="glass-panel glow-box-open rounded-2xl p-5 relative">

      <div class="flex justify-between items-start mb-3">

        <span class="font-cyber font-bold text-lg text-slate-900 dark:text-white">

          ${signal.pair}

          <span class="text-[10px] ${badgeColor}
          px-2 py-0.5 rounded ml-2 font-bold uppercase">

            ${signal.type}

          </span>

        </span>

        <span class="text-[11px] font-mono text-slate-400
        bg-black/20 px-2 py-0.5 rounded border border-slate-800">

          <i class="fa-regular fa-clock mr-1 text-neonBlue"></i>

          LIVE

        </span>

      </div>

      <div class="space-y-2 bg-black/30 p-3 rounded-xl
      text-xs font-mono text-slate-200">

        <div class="flex justify-between border-b border-white/5 pb-1">
          <span>ENTRY:</span>
          <span class="font-bold">${signal.entry}</span>
        </div>

        <div class="flex justify-between border-b border-white/5 pb-1">
          <span>STOP LOSS:</span>
          <span class="font-bold text-neonRed">
            ${signal.stoploss}
          </span>
        </div>

        <div class="flex justify-between">
          <span>TAKE PROFIT:</span>
          <span class="font-bold text-neonGreen">
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
    .channel('signals-live')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'signals'
    }, payload => {

      console.log("LIVE UPDATE:", payload);

      if (payload.eventType === "INSERT") {
        renderLatestSignal(payload.new);
        updateLiveCard(payload.new);
      } else {
        loadSignals();
      }

    })
    .subscribe();
}

// =========================
// INIT
// =========================

document.addEventListener("DOMContentLoaded", async () => {

  loadSignals();

  // latest LIVE signal
  const { data } = await supabaseClient
    .from("signals")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {

    // LIVE CARD
    updateLiveCard(data[0]);

    // PREVIOUS SIGNALS HISTORY
    const { data: historySignals } = await supabaseClient
      .from("signals")
      .select("*")
      .order("id", { ascending: false })
      .range(1, 10);

    if (historySignals) {

      historySignals.forEach(signal => {
        renderLatestSignal(signal);
      });

    }

  }

  realtimeSignals();
  startLiveTicker();

});

// =========================
// LOGOUT
// =========================

// =========================
// BINANCE LIVE MARKET
// =========================

function startLiveTicker() {

  const ticker =
    document.getElementById("liveTicker");

  if (!ticker) return;

  const ws = new WebSocket(
    "wss://stream.binance.com:9443/ws/!ticker@arr"
  );

  const topCoins = [

    "BTCUSDT",
    "ETHUSDT",
    "BNBUSDT",
    "SOLUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "TRXUSDT",
    "AVAXUSDT",
    "DOTUSDT",

    "LINKUSDT",
    "MATICUSDT",
    "LTCUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "XLMUSDT",
    "FILUSDT",
    "APTUSDT",
    "ARBUSDT"

  ];

  // CONNECTION SUCCESS
  ws.onopen = () => {

    console.log("BINANCE LIVE TICKER CONNECTED");

  };

  // LIVE DATA
  ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

    const markets =
      data.filter(item =>
        topCoins.includes(item.s)
      );

    ticker.innerHTML = markets.map(item => {

      const price =
        parseFloat(item.c).toFixed(2);

      const change =
        parseFloat(item.P).toFixed(2);

      const color =
        change >= 0
          ? "text-green-400"
          : "text-red-400";

      return `

        <div class="ticker-item flex items-center gap-2 px-4">

          <span class="text-neonBlue font-bold">
            ${item.s.replace("USDT","")}
          </span>

          <span class="${color}">
            $${price}
          </span>

          <span class="${color}">
            (${change}%)
          </span>

        </div>

      `;

    }).join("");

  };

  // ERROR
  ws.onerror = (error) => {

    console.log("BINANCE TICKER ERROR:", error);

  };

}

function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin.html";
}
