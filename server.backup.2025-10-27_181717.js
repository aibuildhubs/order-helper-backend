import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// --- CORS Middleware ---
app.use(
  cors({
    origin: [
      "https://5173-cs-2de57762-2491-4dc1-a25a-7f8b43fdb89c.cs-europe-west1-haha.cloudshell.dev",
      "http://localhost:5173",
      "https://mail-order-helper-9ac71.web.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// --- Firebase Admin init ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// --- Dummy upload endpoint ---
app.post("/upload", (req, res) => {
  console.log("✅ /upload endpoint hit");
  res.json({
    ok: true,
    message: "Upload received successfully (dummy backend response).",
  });
});

// --- Root endpoint (for quick health check) ---
app.get("/", (req, res) => {
  res.send("🚀 Order Helper backend is running successfully!");
});

// --- Start server ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
