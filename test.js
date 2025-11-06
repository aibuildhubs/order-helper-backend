/**
 * Firestore Admin Test Script
 * ----------------------------
 * Συνδέεται με Firestore μέσω του firestore-admin service account
 * και γράφει ένα test document για επιβεβαίωση επιτυχούς πρόσβασης.
 */

import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("/home/aibuildershubs/mail-order-helper-b2021daeb50c.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "mail-order-helper-enterprise",
});

const db = admin.firestore();

(async () => {
  try {
    const docRef = await db.collection("test").add({
      createdAt: new Date().toISOString(),
      message: "🔥 Firestore write successful via firestore-admin account!",
    });
    console.log("✅ Document written successfully with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Firestore write failed:", error);
  }
})();
