<!DOCTYPE html>
<html lang="id" class="scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-dark-card">
<head>
  <meta charset="UTF-8">
  <title>Mustika Rivers - Monitoring Sungai Cerdas</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="css/output.css">
  <link rel="icon" type="image/png" sizes="32x32" href="../src/img/icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
  <style>
    .roboto {
      font-family: "Roboto", sans-serif;
      font-optical-sizing: auto;
      font-weight: 400;
      font-style: normal;
      font-variation-settings: "wdth" 100;
    }
  </style>
</head>

<body class="roboto bg-dark-base text-gray-200 antialiased">

<nav class="border-b border-dark-border">
  <div class="max-w-6xl mx-auto py-6 flex justify-between items-center">
    <div class="flex items-center gap-1 ml-[-20px]">
      <img src="../src/img/icon.png" alt="Mustika Rivers Icon" class="w-[40px] h-[40px]">
      <a href=""><h1 class="text-2xl font-bold text-white hover:text-accent-secondary">Mustika Rivers</h1></a>
    </div>
    <span class="text-sm text-gray-400">Monitoring Sungai Cerdas</span>
  </div>
</nav>

<section class="relative overflow-hidden bg-dark-base">
  <div class="absolute -top-32 -left-32 w-[500px] h-[500px] bg-accent-primary/30 rounded-full blur-[120px]"></div>
  <div class="absolute top-1/3 right-0 w-[400px] h-[400px] bg-accent-secondary/20 rounded-full blur-[120px]"></div>
  <div class="absolute inset-0 opacity-[0.06]" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 24px 24px;"></div>
  <div class="relative z-10 max-w-6xl mx-auto px-8 py-[100px]">
    <div class="grid md:grid-cols-2 gap-[150px] items-center">
      <div>
        <h2 class="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white pt-10">
          Monitoring Sungai<br>
          <span class="text-accent-secondary">Berbasis IoT & AI</span>
        </h2>
        <p class="text-lg text-gray-400 max-w-xl mb-10">
          Sistem monitoring sungai secara real-time dengan analisis cerdas
          untuk mendeteksi dan memahami potensi banjir.
        </p>
        <div class="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-dark-card border border-dark-border hover:border-accent-secondary transition">
          <span class="w-2 h-2 bg-accent-secondary rounded-full animate-pulse"></span>
          <span class="text-sm text-gray-400">Status Sungai</span>
          <span id="heroStatus" class="text-2xl font-semibold text-accent-primary">-</span>
        </div>
      </div>
      <div class="relative">
        <div class="absolute inset-0 rounded-3xl blur-2xl"></div>
        <img src="../src/img/river-anime.png" alt="River Illustration" class="relative z-10 w-full h-auto max-w-md mx-auto rounded-3xl border border-dark-border bg-dark-card p-4 transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-xl">
      </div>
    </div>
  </div>
</section>

<section class="bg-dark-section">
  <div class="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-3 gap-8">
    <div class="bg-dark-card border border-dark-border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent-secondary/50">
      <p class="text-sm text-gray-400 mb-2">Status Sungai</p>
      <h3 id="statusText" class="text-3xl font-bold text-white">-</h3>
    </div>
    <div class="bg-dark-card border border-dark-border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent-secondary/50">
      <p class="text-sm text-gray-400 mb-2">Tinggi Air</p>
      <h3 id="tinggiAir" class="text-3xl font-bold text-white">- cm</h3>
    </div>
    <div class="bg-dark-card border border-dark-border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent-secondary/50">
      <p class="text-sm text-gray-400 mb-2">Update Terakhir</p>
      <h3 id="updateTime" class="text-xl font-semibold text-white">-</h3>
    </div>
  </div>
</section>

<section class="bg-dark-base">
  <div class="max-w-6xl mx-auto px-8 py-24">
    <h2 class="text-3xl font-bold mb-8 text-white">Tren Ketinggian Air</h2>
    <div class="relative bg-dark-card border border-dark-border rounded-3xl p-8 h-[380px] hover:border-accent-secondary/50 transition-all">
      <div class="absolute inset-0 bg-accent-primary/10 blur-2xl rounded-3xl"></div>
      <canvas id="chartAir" class="relative z-10"></canvas>
    </div>
  </div>
</section>

<section class="bg-dark-section">
  <div class="max-w-6xl mx-auto px-8 py-24">
    <h2 class="text-3xl font-bold mb-8 text-white">Riwayat Data</h2>
    <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-dark-section bg-dark-card border border-dark-border rounded-3xl">
      <table class="w-full text-sm text-gray-300">
        <thead class="bg-dark-section text-gray-400">
          <tr>
            <th class="p-4 text-center">Waktu</th>
            <th class="p-4 text-center">Tinggi Air</th>
            <th class="p-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody id="tableData" class="divide-y divide-dark-border"></tbody>
      </table>
    </div>
  </div>
</section>

<footer class="border-t border-dark-border bg-dark-base">
  <div class="max-w-6xl mx-auto px-8 py-10 text-center text-sm text-gray-500">
    Mustika Rivers © <?= date('Y') ?> - Made By Litbang With ❤️
  </div>
</footer>

<div id="chatBubble" class="fixed bottom-6 right-6 z-50 hidden">
  <button id="chatToggle" class="w-14 h-14 rounded-full bg-accent-secondary text-dark-base shadow-xl flex items-center justify-center hover:scale-105 transition">
    <span id="chatIcon" class="iconify text-2xl" data-icon="solar:chat-round-dots-bold"></span>
  </button>
</div>

<div id="chatWindow" class="fixed bottom-24 right-6 z-50 hidden w-[360px] h-[480px] bg-dark-card border border-dark-border rounded-3xl shadow-2xl flex flex-col">
  <div class="flex items-center justify-between px-5 py-4 border-b border-dark-border">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 bg-accent-secondary rounded-full animate-pulse"></span>
      <h3 class="text-sm font-semibold text-white">Mustika Rivers Assistant</h3>
    </div>
    <button id="closeChat" class="text-gray-400 hover:text-white transition">✕</button>
  </div>

  <div id="chatBox" class="flex-1 overflow-y-auto p-4 space-y-4 text-sm scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-dark-card">
    <div class="flex items-start gap-2">
      <div class="w-7 h-7 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary text-xs">AI</div>
      <div class="bg-dark-section border border-dark-border rounded-xl px-3 py-2 max-w-[260px] text-gray-200">
        Halo 👋 Saya asisten AI Mustika Rivers.  
        Tanyakan kondisi sungai atau status air saat ini.
      </div>
    </div>
  </div>

  <form id="chatForm" class="border-t border-dark-border p-3 flex gap-2">
    <input id="chatInput" type="text" placeholder="Tulis pertanyaan..." class="flex-1 bg-dark-section border border-dark-border rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-secondary" autocomplete="off">
    <button type="submit" class="px-4 py-2 rounded-xl bg-accent-secondary text-dark-base font-semibold hover:opacity-90">Kirim</button>
  </form>
</div>

<script src="js/dashboard.js"></script>
</body>
</html>
