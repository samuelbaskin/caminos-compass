const express = require("express");
const { educationalChatReply } = require("../services/gemini");

const router = express.Router();

const MAX_MESSAGE = 8000;
const MAX_HISTORY = 10;

function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-MAX_HISTORY)
    .map((h) => {
      if (!h || typeof h !== "object") return null;
      const role = h.role === "user" || h.role === "assistant" ? h.role : null;
      const content = typeof h.content === "string" ? h.content.trim().slice(0, MAX_MESSAGE) : "";
      if (!role || !content) return null;
      return { role, content };
    })
    .filter(Boolean);
}

// POST /api/chat/educational
router.post("/educational", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }
    if (message.length > MAX_MESSAGE) {
      return res.status(400).json({ message: "Message is too long." });
    }

    const history = sanitizeHistory(req.body?.history);
    const reply = await educationalChatReply({ message, history });
    res.json({ reply });
  } catch (err) {
    console.error("Educational chat error:", err);
    res.status(500).json({ message: err.message || "Chat failed." });
  }
});

module.exports = router;
