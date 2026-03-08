import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// ── Serve built frontend ─────────────────────────────────────
const DIST = join(__dirname, "../dist");
app.use(express.static(DIST));

// ── Anthropic proxy ──────────────────────────────────────────
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

app.post("/api/generate", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY not set on server." } });
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: { message: "Upstream request failed." } });
  }
});

// ── SPA fallback ─────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(join(DIST, "index.html"));
});

const PORT = process.env.PORT || 3000;
createServer(app).listen(PORT, () => {
  console.log(`Style Grimoire running on http://localhost:${PORT}`);
});
