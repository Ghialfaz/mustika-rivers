import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const chatMemory = [];
const MAX_MEMORY = 6;

app.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.json({
        reply: "Pesan kosong tidak dapat diproses."
      });
    }

    chatMemory.push({
      role: "user",
      content: message
    });

    if (chatMemory.length > MAX_MEMORY) {
      chatMemory.shift();
    }

    const historyText = chatMemory
      .map(m => `- ${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
Kamu adalah AI monitoring sungai bernama Mustika Rivers AI.
Jawab dalam bahasa Indonesia.
Gunakan bahasa yang jelas, ramah, dan mudah dipahami.

Riwayat percakapan:
${historyText}

Konteks sistem:
${context || "Data sungai belum tersedia."}

Pertanyaan terbaru:
${message}
    `.trim();

    const response = await axios.get(
      "https://api.gimita.id/api/ai/deepseek",
      {
        params: {
          question: prompt,
          thinking: false
        },
        timeout: 60000
      }
    );

    console.log("GIMITA RESPONSE:", response.data);

    const answer =
      response.data?.answer ||
      response.data?.result ||
      response.data?.response ||
      "AI tidak memberikan jawaban.";

    chatMemory.push({
      role: "assistant",
      content: answer
    });

    if (chatMemory.length > MAX_MEMORY) {
      chatMemory.shift();
    }

    res.json({
      reply: answer
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);

    res.status(500).json({
      reply: "Maaf, AI sedang tidak dapat dihubungi saat ini."
    });
  }
});

app.listen(5000, () => {
  console.log("✅ AI Server aktif di http://localhost:5000");
});