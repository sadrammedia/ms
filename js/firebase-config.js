// Mengimpor fungsi inisialisasi dari SDK modular Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
// Mengimpor layanan Firestore Database
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Konfigurasi aplikasi web Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyBDo1rGh8myxaIkJG-ZNez1OJGrto-wD8g",
    authDomain: "ms-undangan-digital.firebaseapp.com",
    projectId: "ms-undangan-digital",
    storageBucket: "ms-undangan-digital.firebasestorage.app",
    messagingSenderId: "1098540280128",
    appId: "1:1098540280128:web:c977728e753ba17a1532a5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor instance database agar bisa dipanggil oleh admin.js dan app.js
export const db = getFirestore(app);