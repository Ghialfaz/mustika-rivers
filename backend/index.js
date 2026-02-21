import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// 💬 MEMORY CHAT
// ============================================
const chatMemory = [];
const MAX_MEMORY = 6;

// ============================================
// 🌦️ WEATHER CACHE - Update setiap 10 menit
// ============================================
let weatherCache = null;
let lastWeatherFetch = 0;
const WEATHER_TTL = 10 * 60 * 1000; // 10 menit

// Koordinat Tigaraksa, Kab. Tangerang
const TIGARAKSA_LAT = -6.2701;
const TIGARAKSA_LON = 106.6217;

// WMO Weather Code ke deskripsi bahasa Indonesia
function getWeatherDescription(code) {
  const descriptions = {
    0: "Langit cerah ☀️",
    1: "Sebagian besar cerah 🌤️",
    2: "Berawan sebagian ⛅",
    3: "Mendung 🌥️",
    45: "Berkabut 🌫️",
    48: "Berkabut dengan embun beku 🌫️",
    51: "Gerimis ringan 🌦️",
    53: "Gerimis sedang 🌦️",
    55: "Gerimis lebat 🌧️",
    61: "Hujan ringan 🌧️",
    63: "Hujan sedang 🌧️",
    65: "Hujan lebat 🌧️",
    71: "Salju ringan ❄️",
    73: "Salju sedang ❄️",
    75: "Salju lebat ❄️",
    80: "Hujan lokal ringan 🌦️",
    81: "Hujan lokal sedang 🌧️",
    82: "Hujan lokal lebat ⛈️",
    95: "Hujan badai ⛈️",
    96: "Hujan badai disertai hujan es ⛈️",
    99: "Hujan badai lebat disertai hujan es ⛈️",
  };
  return descriptions[code] || `Kode cuaca ${code}`;
}

// Hitung level risiko banjir berdasarkan curah hujan
function getFloodRisk(totalRain24h) {
  if (totalRain24h >= 50) return { level: "TINGGI", emoji: "🔴", saran: "Waspada banjir! Pantau terus kondisi sungai dan siap untuk evakuasi." };
  if (totalRain24h >= 20) return { level: "SEDANG", emoji: "🟡", saran: "Perlu pemantauan ketat. Hindari aktivitas di dekat sungai." };
  return { level: "RENDAH", emoji: "🟢", saran: "Kondisi normal. Tetap pantau perkembangan cuaca." };
}

// ============================================
// 🌦️ FETCH CUACA DARI OPEN-METEO
// ============================================
async function fetchWeather() {
  const now = Date.now();

  // Gunakan cache jika masih fresh
  if (weatherCache && now - lastWeatherFetch < WEATHER_TTL) {
    return weatherCache;
  }

  try {
    const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: TIGARAKSA_LAT,
        longitude: TIGARAKSA_LON,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "rain",
          "windspeed_10m",
          "cloudcover",
          "weathercode",
        ].join(","),
        hourly: ["rain", "precipitation_probability", "weathercode"].join(","),
        forecast_days: 2,
        timezone: "Asia/Jakarta",
      },
      timeout: 15000,
    });

    const current = res.data.current;
    const hourlyTimes = res.data.hourly.time;
    const hourlyRain = res.data.hourly.rain;
    const hourlyProb = res.data.hourly.precipitation_probability;
    const hourlyCode = res.data.hourly.weathercode;

    // Ambil hanya 24 jam ke depan
    const next24Hours = hourlyTimes.slice(0, 24);
    const totalRain24h = hourlyRain.slice(0, 24).reduce((sum, r) => sum + r, 0);

    // Format forecast per 3 jam (ambil index 0,3,6,9,12,15,18,21)
    const forecastItems = [0, 3, 6, 9, 12, 15, 18, 21].map((i) => {
      const time = new Date(next24Hours[i]).toLocaleString("id-ID", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });
      return `  ${time} → ${getWeatherDescription(hourlyCode[i])}, Hujan: ${hourlyRain[i].toFixed(1)}mm, Prob: ${hourlyProb[i]}%`;
    });

    const floodRisk = getFloodRisk(totalRain24h);

    weatherCache = {
      updatedAt: new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "full",
        timeStyle: "short",
      }),
      current: {
        weatherDescription: getWeatherDescription(current.weathercode),
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        rain: current.rain,
        windSpeed: current.windspeed_10m,
        cloudiness: current.cloudcover,
      },
      forecast24h: forecastItems,
      totalRain24h: totalRain24h.toFixed(1),
      floodRisk,
    };

    lastWeatherFetch = now;
    console.log(`🌦️ Data cuaca diperbarui: ${weatherCache.updatedAt}`);
    return weatherCache;
  } catch (err) {
    console.error("❌ Gagal mengambil data cuaca:", err.message);
    return null;
  }
}

// Format cuaca menjadi teks konteks untuk AI
function buildWeatherContext(weather) {
  if (!weather) {
    return "⚠️ Data cuaca saat ini tidak tersedia.";
  }

  return `
=== 🌦️ DATA CUACA REALTIME - TIGARAKSA, KAB. TANGERANG ===
Diperbarui: ${weather.updatedAt}

📍 KONDISI SAAT INI:
- Cuaca       : ${weather.current.weatherDescription}
- Suhu        : ${weather.current.temp}°C
- Kelembaban  : ${weather.current.humidity}%
- Curah Hujan : ${weather.current.rain} mm (jam ini)
- Angin       : ${weather.current.windSpeed} km/h
- Tutupan Awan: ${weather.current.cloudiness}%

📊 PRAKIRAAN 24 JAM KE DEPAN (per 3 jam):
${weather.forecast24h.join("\n")}

💧 ESTIMASI TOTAL HUJAN 24 JAM: ${weather.totalRain24h} mm
🚨 TINGKAT RISIKO KENAIKAN VOLUME AIR: ${weather.floodRisk.level} ${weather.floodRisk.emoji}
💡 Saran: ${weather.floodRisk.saran}

📌 ACUAN THRESHOLD BMKG:
- < 20mm/24jam  → Risiko Rendah 🟢
- 20-50mm/24jam → Risiko Sedang 🟡 (perlu pemantauan)
- > 50mm/24jam  → Risiko Tinggi 🔴 (potensi banjir)
  `.trim();
}

// ============================================
// 💬 ENDPOINT CHAT
// ============================================
app.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.json({ reply: "Pesan kosong tidak dapat diproses." });
    }

    // Ambil data cuaca terbaru
    const weather = await fetchWeather();
    const weatherContext = buildWeatherContext(weather);

    // Simpan pesan user ke memory
    chatMemory.push({ role: "user", content: message });
    if (chatMemory.length > MAX_MEMORY) chatMemory.shift();

    const historyText = chatMemory
      .map((m) => `- ${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
Kamu adalah AI monitoring sungai bernama Mustika Rivers AI untuk wilayah Tigaraksa, Kabupaten Tangerang.
Jawab dalam bahasa Indonesia.
Gunakan bahasa yang jelas, ramah, dan mudah dipahami oleh warga umum.
Selalu gunakan emoji yang sesuai dengan kondisi.

Tugasmu:
1. Analisis kondisi cuaca terkini dan kaitkan dengan potensi kenaikan volume air sungai
2. Berikan peringatan dini jika ada indikasi risiko banjir berdasarkan data cuaca
3. Jelaskan tren curah hujan yang akan datang secara mudah dipahami
4. Sarankan tindakan konkret yang perlu diambil sesuai tingkat risiko
5. Jika tidak ada pertanyaan spesifik, berikan ringkasan kondisi terkini secara proaktif

${weatherContext}

Konteks tambahan dari sistem sensor sungai:
${context || "Data sensor sungai belum tersedia."}

Riwayat percakapan:
${historyText}

Pertanyaan/pesan terbaru dari pengguna:
${message}
    `.trim();

    // Request ke Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      },
      { timeout: 40000 }
    );

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI tidak memberikan jawaban.";

    // Simpan jawaban AI ke memory
    chatMemory.push({ role: "assistant", content: answer });
    if (chatMemory.length > MAX_MEMORY) chatMemory.shift();

    res.json({
      reply: answer,
      weather: weather
        ? {
            updatedAt: weather.updatedAt,
            condition: weather.current.weatherDescription,
            temp: weather.current.temp,
            rain: weather.current.rain,
            totalRain24h: weather.totalRain24h,
            floodRisk: weather.floodRisk,
          }
        : null,
    });
  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({
      reply: "Maaf, AI sedang tidak dapat dihubungi saat ini. Silakan coba beberapa saat lagi.",
    });
  }
});

// ============================================
// 🌦️ ENDPOINT CUACA (untuk widget frontend)
// ============================================
app.get("/weather", async (req, res) => {
  const weather = await fetchWeather();
  if (!weather) {
    return res.status(503).json({ error: "Data cuaca tidak tersedia saat ini." });
  }
  res.json(weather);
});

// ============================================
// ❤️ HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    weatherCached: !!weatherCache,
    weatherAge: weatherCache
      ? `${Math.round((Date.now() - lastWeatherFetch) / 1000 / 60)} menit`
      : "belum ada",
    memoryCount: chatMemory.length,
  });
});

// ============================================
// 🚀 START SERVER
// ============================================
app.listen(5000, async () => {
  console.log("✅ Mustika Rivers AI Server aktif di http://localhost:5000");
  console.log("📡 Mengambil data cuaca awal dari Open-Meteo...");
  await fetchWeather();
  console.log("🌦️ Data cuaca siap!");
});