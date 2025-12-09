// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyAO4ja4G-y20Qv20pe_kU7-vItW908nec4",
  authDomain: "penyiramanotomatis-3f962.firebaseapp.com",
  databaseURL: "https://penyiramanotomatis-3f962-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "penyiramanotomatis-3f962",
  storageBucket: "penyiramanotomatis-3f962.firebasestorage.app",
  messagingSenderId: "622997809952",
  appId: "1:622997809952:web:2f56a9cf289a3b50f9c545",
  measurementId: "G-979YXF1JP7"
};

// Inisialisasi Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Inisialisasi Realtime Database
const database = getDatabase(app);

// Inisialisasi Analytics (opsional, hanya di client side)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Inisialisasi Auth jika diperlukan
const auth = getAuth(app);

export { app, database, auth, analytics };