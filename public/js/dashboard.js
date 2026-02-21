document.addEventListener("DOMContentLoaded", () => {

const API_BASE = "/flood_iot/app/api";

/* ===============================
   VARIABEL STATUS BAHAYA
================================ */
let lastStatus = null;
let dangerShown = false;

/* ===============================
   ELEMEN POPUP BAHAYA
================================ */
const dangerOverlay = document.getElementById("dangerOverlay");
const dangerMessage = document.getElementById("dangerMessage");
const closeDanger   = document.getElementById("closeDanger");

/* ===============================
   FUNGSI POPUP BAHAYA
================================ */
function showDangerPopup(air) {
  if (!dangerOverlay) return;

  dangerMessage.innerText =
    `Ketinggian air telah mencapai ${air} cm dan berada pada level berbahaya.
     Segera lakukan tindakan pencegahan dan evakuasi jika diperlukan.`;

  dangerOverlay.classList.remove("hidden");
}

closeDanger?.addEventListener("click", () => {
  dangerOverlay.classList.add("hidden");
});

/* ===============================
   LOAD DATA TERBARU
================================ */
async function loadLatest() {
  const res = await fetch(`${API_BASE}/latest.php`);
  const data = await res.json();
  if (!data) return;

  const currentStatus = data.status;

  document.getElementById("heroStatus").innerText = currentStatus;
  document.getElementById("statusText").innerText = currentStatus;
  document.getElementById("tinggiAir").innerText = data.tinggi_air + " cm";
  document.getElementById("updateTime").innerText = data.updated;

  /* 🔴 TRIGGER POPUP SAAT TRANSISI KE BAHAYA */
  if (
    currentStatus === "BAHAYA" &&
    lastStatus !== "BAHAYA" &&
    !dangerShown
  ) {
    showDangerPopup(data.tinggi_air);
    dangerShown = true;
  }

  /* reset jika status turun */
  if (currentStatus !== "BAHAYA") {
    dangerShown = false;
  }

  lastStatus = currentStatus;
}

/* ===============================
   LOAD RIWAYAT DATA
================================ */
async function loadHistory() {
  const res = await fetch(`${API_BASE}/history.php`);
  const data = await res.json();

  const table = document.getElementById("tableData");
  table.innerHTML = "";

  data.forEach(row => {
    table.innerHTML += `
      <tr>
        <td class="p-3 text-center">${row.time}</td>
        <td class="p-3 text-center">${row.air} cm</td>
        <td class="p-3 text-center">${row.status}</td>
      </tr>
    `;
  });
}

/* ===============================
   LOAD CHART
================================ */
let chart;

async function loadChart() {
  const res = await fetch(`${API_BASE}/chart.php`);
  const data = await res.json();

  const ctx = document.getElementById("chartAir").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Tinggi Air (cm)",
        data: data.values,
        tension: 0.4,
        fill: true,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "#1f2933" }
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "#1f2933" }
        }
      },
      plugins: {
        legend: { labels: { color: "#e5e7eb" } },
        tooltip: {
          backgroundColor: "#020617",
          borderColor: "#334155",
          borderWidth: 1
        }
      }
    }
  });
}

/* ===============================
   LOAD AWAL + INTERVAL
================================ */
loadLatest();
loadHistory();
loadChart();

setInterval(() => {
  loadLatest();
  loadHistory();
  loadChart();
}, 5000);

/* ===============================
   CHAT AI
================================ */
const chatBubble = document.getElementById("chatBubble");
const chatWindow = document.getElementById("chatWindow");
const chatToggle = document.getElementById("chatToggle");
const chatIcon   = document.getElementById("chatIcon");
const closeChat  = document.getElementById("closeChat");

const chatForm  = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatBox   = document.getElementById("chatBox");

let isChatOpen = false;

function openChat() {
  chatWindow.classList.remove("hidden");
  chatIcon.setAttribute("data-icon", "solar:close-circle-bold");
  isChatOpen = true;
}

function closeChatWindow() {
  chatWindow.classList.add("hidden");
  chatIcon.setAttribute("data-icon", "solar:chat-round-dots-bold");
  isChatOpen = false;
}

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    chatBubble.classList.remove("hidden");
  } else {
    chatBubble.classList.add("hidden");
    closeChatWindow();
  }
});

chatToggle.addEventListener("click", () => {
  isChatOpen ? closeChatWindow() : openChat();
});

closeChat.addEventListener("click", closeChatWindow);

chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;

  appendUserMessage(msg);
  chatInput.value = "";

  const typing = appendTyping();
  const reply = await askAiBackend(msg);

  typing.remove();
  appendAiMessage(reply);
});

function appendUserMessage(text) {
  const div = document.createElement("div");
  div.className = "flex justify-end";
  div.innerHTML = `<div class="bg-accent-secondary text-dark-base rounded-xl px-3 py-2 max-w-[260px]">${text}</div>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendAiMessage(text) {
  const div = document.createElement("div");
  div.className = "flex items-start gap-2";
  div.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary text-xs">AI</div>
    <div class="bg-dark-section border border-dark-border rounded-xl px-3 py-2 max-w-[260px]">${text}</div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTyping() {
  const div = document.createElement("div");
  div.className = "italic text-gray-400 text-sm";
  div.innerText = "AI sedang mengetik...";
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

async function askAiBackend(message) {
  try {
    const status = document.getElementById("statusText").innerText;
    const tinggi = document.getElementById("tinggiAir").innerText;

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: `Status sungai: ${status}, Tinggi air: ${tinggi}`
      })
    });

    const data = await res.json();
    return data.reply;
  } catch {
    return "AI tidak dapat dihubungi.";
  }
}

});
