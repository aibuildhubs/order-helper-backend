// server.js = stable express + firebase-admin + routes + health + /api/fetch-data
import express from "express";
import cors from "cors";
import multer from "multer";
import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";

// ------------------------------ Init ------------------------------
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ------------------------------ CORS (full fix) ------------------------------
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://admin.aibuildhubs.com",
  "https://api.aibuildhubs.com",
  "https://order-helper-backend-165287424273.europe-west1.run.app",
  "https://4173-cs-2de57762-2491-4dc1-a25a-7f8b43fdb89c.cs-europe-west1-haha.cloudshell.dev",
  "http://127.0.0.1:5173",
  "https://5173-cs-2de57762-2491-4dc1-a25a-7f8b43fdb89c.cs-europe-west1-haha.cloudshell.dev",
  "https://*.cloudshell.dev",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (allowedOrigins.has(origin) ||
      [...allowedOrigins].some((o) => o.includes("*") && origin.endsWith(o.replace("*.", ""))))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// ------------------------------ Firebase Admin ------------------------------
let firebaseReady = false;
try {
  const svcPath = "./firebase-service-account.json";
  if (existsSync(svcPath)) {
    const creds = JSON.parse(readFileSync(svcPath, "utf8"));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(creds),
      });
    }
    firebaseReady = true;
    console.log("✅ Firebase Admin initialized.");
  } else {
    console.warn("⚠️ firebase-service-account.json not found");
  }
} catch (err) {
  console.error("❌ Firebase Admin init failed:", err);
}

// ------------------------------ Health Route ------------------------------
app.get("/", (req, res) => {
  res.status(200).send("✅ Order Helper backend running (v22)");
});

// ------------------------------ Token Verification ------------------------------
async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer (.*)$/);
    if (!match) return res.status(401).json({ error: "Missing token" });
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ------------------------------ Mock Fetch Data ------------------------------
app.get("/api/fetch-data", verifyToken, async (req, res) => {
  try {
    console.log("📥 Fetching data for user:", req.user.email);
    const suppliers = [
      { name: "AB Vasilopoulos", email: "orders@ab.gr" },
      { name: "Sklavenitis", email: "sales@sklavenitis.gr" },
    ];
    const products = [
      { name: "Milk 1L", price: 1.29 },
      { name: "Bread", price: 0.99 },
    ];
    res.json({ suppliers, products });
  } catch (err) {
    console.error("fetch-data error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ------------------------------ Upload / Download / Save (stubs or handlers) ------------------------------

// Αν έχεις ήδη τις συναρτήσεις π.χ. handleUploadSuppliers, τις αφήνουμε ως έχουν.
// Αν όχι, βάλε προσωρινά mock handlers για να μη σπάει το deploy:

function handleUploadSuppliers(req, res) {
  console.log("📤 Upload suppliers file received");
  res.json({ status: "ok", type: "suppliers" });
}
function handleUploadProducts(req, res) {
  console.log("📤 Upload products file received");
  res.json({ status: "ok", type: "products" });
}
function handleDownloadSuppliers(req, res) {
  console.log("📥 Download suppliers requested");
  res.setHeader("Content-Type", "text/csv");
  res.send("name,email\nAB Vasilopoulos,orders@ab.gr\nSklavenitis,sales@sklavenitis.gr");
}
function handleDownloadProducts(req, res) {
  console.log("📥 Download products requested");
  res.setHeader("Content-Type", "text/csv");
  res.send("name,price\nMilk 1L,1.29\nBread,0.99");
}
function handleSaveAll(req, res) {
  console.log("💾 Save all data:", req.body);
  res.json({ status: "saved" });
}

// ------------------------------ Main Routes ------------------------------
app.post("/upload-suppliers", verifyToken, upload.single("file"), handleUploadSuppliers);
app.post("/upload-products", verifyToken, upload.single("file"), handleUploadProducts);
app.post("/save-all", verifyToken, handleSaveAll);
app.get("/download-suppliers", verifyToken, handleDownloadSuppliers);
app.get("/download-products", verifyToken, handleDownloadProducts);

// ------------------------------ Mirror Routes under /api/* ------------------------------
app.post("/api/upload-suppliers", verifyToken, upload.single("file"), handleUploadSuppliers);
app.post("/api/upload-products", verifyToken, upload.single("file"), handleUploadProducts);
app.post("/api/save-all", verifyToken, handleSaveAll);
app.get("/api/download-suppliers", verifyToken, handleDownloadSuppliers);
app.get("/api/download-products", verifyToken, handleDownloadProducts);

// ------------------------------ Health check ------------------------------
app.get("/health", (req, res) => {
  res.json({ ok: true, version: "v26" });
});

// ------------------------------ Start Server ------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
