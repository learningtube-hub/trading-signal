
const supabaseUrl =
"https://nrwhupzgdwlsdnwdfpig.supabase.co";

const supabaseKey =
"sb_publishable_4I-i-becqQZHBXK-skXDfA_gQLOID3a";

const supabaseClient =
window.supabase.createClient(supabaseUrl, supabaseKey);


// =========================
// CREATE SIGNAL
// =========================

async function createSignal() {

  let pair = document.getElementById("pair").value.trim();
  let type = document.getElementById("type").value;

  let entry = parseFloat(document.getElementById("entry").value.trim());
  let strength = document.getElementById("strength").value.trim();

  let target = parseFloat(document.getElementById("target").value.trim());
  let stoploss = parseFloat(document.getElementById("stoploss").value.trim());

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
        entry,
        strength,
        target,
        stoploss
      }
    ]);

  if (error) {
  console.log("SUPABASE FULL ERROR:", error);
  console.log("MESSAGE:", error.message);
  console.log("DETAIL:", error.details);

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

async function loadSignals() {

  const { data, error } = await supabaseClient
  .from("signals")
  .select("*")
  .order("id", { ascending: false });

alert(JSON.stringify(data));
console.log(data);
console.log(error);

if (error) {
  console.error("LOAD ERROR:", error);
  return;
}

  const container = document.getElementById("signals");

if (!container) return;

container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<p>No Signals Available</p>`;
    return;
  }

  data.forEach(signal => {
    container.innerHTML += `
      <div class="card">
        <h3>${signal.pair}</h3>
        <p><strong>${signal.type}</strong></p>
        <p>Entry: ${signal.entry}</p>
        <p>Strength: ${signal.strength}</p>
        <p>TP: ${signal.target}</p>
        <p>SL: ${signal.stoploss}</p>
      </div>
    `;
  });
}


// =========================
// PAGE LOAD
// =========================

document.addEventListener("DOMContentLoaded", loadSignals);


// =========================
// LOGOUT
// =========================

function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "admin.html";
}
