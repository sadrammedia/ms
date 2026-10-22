import { db } from "./firebase-config.js";
// Catatan: Pastikan Anda nanti mengaktifkan Authentication di Firebase Console
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const auth = getAuth();

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const btnLogin = document.getElementById("btn-login");

    const originalText = btnLogin.innerHTML;
    btnLogin.innerHTML = "Memverifikasi...";
    btnLogin.disabled = true;

    try {
        // Autentikasi dengan Firebase
        await signInWithEmailAndPassword(auth, email, password);
        
        // Jika berhasil, arahkan ke halaman admin
        window.location.href = "admin.html";
        
    } catch (error) {
        console.error("Gagal login:", error.code);
        btnLogin.innerHTML = originalText;
        btnLogin.disabled = false;

        let pesanError = "Email atau kata sandi salah.";
        if (error.code === 'auth/user-not-found') pesanError = "Akun tidak terdaftar.";
        if (error.code === 'auth/wrong-password') pesanError = "Kata sandi salah.";

        Swal.fire({
            title: '<span class="font-serif text-xl text-gray-900">Akses Ditolak</span>',
            text: pesanError,
            icon: 'error',
            confirmButtonText: 'Coba Lagi',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-3xl shadow-2xl border border-gray-100 py-6 px-4',
                confirmButton: 'mt-4 px-8 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors',
                backdrop: 'backdrop-blur-sm'
            }
        });
    }
});