// server.js — stable express + firebase-admin + routes + health + /api/fetch-data

import express from "express";
import cors from "cors";
import multer from "multer";
import admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";

// --------------------------- Init ---------------------------

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Προσαρμογές origins όπως τα έχουμε
app.use(
  cors({
    origin: [
      "https://admin.aibuildhubs.com",
      "https://api.aibuildhubs.com",
      // προαιρετικά για dev στο Cloud Shell
      "https://5173-cs-xxxxxxxx.cs-europe-west1-xxxx.cloudshell.dev",
    ],
    credentials: true,
  })
);

// --------------------------- Firebase Admin ---------------------------

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

// --------------------------- Health Route ---------------------------

app.get("/", (req, res) => {
  res.send("✅ Order Helper Backend is running.");
});

// --------------------------- Upload Suppliers ---------------------------

app.post("/upload-suppliers", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    console.log("📦 Received suppliers CSV:", req.file.originalname);
    res.status(200).send("Suppliers CSV received successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading suppliers.");
  }
});

// --------------------------- Upload Products ---------------------------

app.post("/upload-products", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    console.log("📦 Received products CSV:", req.file.originalname);
    res.status(200).send("Products CSV received successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading products.");
  }
});

// --------------------------- Download Suppliers ---------------------------

app.get("/download-suppliers", async (req, res) => {
  try {
    const csv = "name,email\nAB Vasilopoulos,orders@ab.gr\nSklavenitis,sales@sklavenitis.gr";
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=suppliers.csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading suppliers.");
  }
});

// --------------------------- Download Products ---------------------------

app.get("/download-products", async (req, res) => {
  try {
    const csv = "name,price\nMilk 1L,1.29\nBread,0.99";
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading products.");
  }
});

// --------------------------- Save All ---------------------------

app.post("/save-all", async (req, res) => {
  try {
    const { suppliers, products } = req.body;
    console.log("💾 Saving data:", { suppliersCount: suppliers?.length, productsCount: products?.length });
    res.status(200).send("All data saved successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data.");
  }
});

// --------------------------- /api/fetch-data ---------------------------

app.get("/api/fetch-data", async (req, res) => {
  try {
    console.log("✅ GET /api/fetch-data called");

    // προσωρινά demo δεδομένα — θα αντικατασταθούν από Firestore fetch
    const demoData = {
      suppliers: [
        { name: "AB Vasilopoulos", email: "orders@ab.gr" },
        { name: "Sklavenitis", email: "sales@sklavenitis.gr" },
      ],
      products: [
        { name: "Milk 1L", price: 1.29 },
        { name: "Bread", price: 0.99 },
      ],
    };

    res.status(200).json(demoData);
  } catch (err) {
    console.error("❌ Error in /api/fetch-data:", err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------------- Listener ---------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
