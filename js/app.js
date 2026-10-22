// 1. Impor instance database dan fungsi Firestore
import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, getDocs } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    // Ambil elemen DOM Cover
    const btnBuka = document.getElementById("btn-buka");
    const heroCover = document.getElementById("hero-cover");
    const mainContent = document.getElementById("main-content");
    const elNamaTamu = document.getElementById("nama-tamu");

    // 2. Ekstraksi parameter URL untuk sapaan tamu dinamis
    const urlParams = new URLSearchParams(window.location.search);
    const tamu = urlParams.get('to');
    const idProyek = urlParams.get('id') || "GLOBAL"; // Penangkap ID Proyek
    
    if (tamu) {
        elNamaTamu.textContent = tamu;
    } else {
        elNamaTamu.textContent = "Tamu Undangan";
    }

    /**
     * Memuat nama mempelai dan tanggal dari koleksi proyek_klien.
     * Termasuk penanganan error jika ID proyek tidak valid/kosong.
     */
    async function muatDataProyek() {
        // Ambil elemen DOM yang akan dimanipulasi
        const teksMempelai = document.getElementById("teks-mempelai");
        const teksTanggal = document.getElementById("teks-tanggal");
        const btnBuka = document.getElementById("btn-buka");
        const blokTamu = document.getElementById("nama-tamu") ? document.getElementById("nama-tamu").parentElement : null;

        // Jika ID kosong atau tidak dikirim
        if (!idProyek || idProyek === "GLOBAL") {
            tampilkanErrorNotFound(teksMempelai, teksTanggal, btnBuka, blokTamu);
            return;
        }

        try {
            const qProyek = query(collection(db, "proyek_klien"));
            const querySnapshot = await getDocs(qProyek);
            
            let dataKlien = null;
            
            querySnapshot.forEach((doc) => {
                const idSingkat = "MS-" + doc.id.substring(0, 7).toUpperCase();
                if (idSingkat === idProyek) {
                    dataKlien = doc.data();
                }
            });

            if (dataKlien) {
                // Render data jika ID valid
                if (teksMempelai) teksMempelai.textContent = dataKlien.mempelai;
                if (teksTanggal) teksTanggal.textContent = dataKlien.tanggal;
                document.title = `Undangan: ${dataKlien.mempelai}`;
            } else {
                // Eksekusi jika ID dikirim namun tidak ada di database
                tampilkanErrorNotFound(teksMempelai, teksTanggal, btnBuka, blokTamu);
            }
        } catch (error) {
            console.error("Gagal memuat data klien:", error);
            tampilkanErrorNotFound(teksMempelai, teksTanggal, btnBuka, blokTamu, "Terjadi kesalahan koneksi server.");
        }
    }

    // Fungsi utilitas untuk mengubah antarmuka menjadi halaman 404 (Not Found)
    function tampilkanErrorNotFound(elMempelai, elTanggal, elBtn, elBlokTamu, pesanKhusus = "Tautan tidak valid atau telah dihapus.") {
        if (elMempelai) elMempelai.textContent = "Tidak Ditemukan";
        if (elTanggal) elTanggal.textContent = pesanKhusus;
        
        // Sembunyikan elemen yang tidak diperlukan
        if (elBlokTamu) elBlokTamu.style.display = 'none';
        if (elBtn) elBtn.style.display = 'none';
        
        document.title = "404 - Undangan Tidak Valid";

        // Hentikan loading skeleton di buku tamu
        const wadahUcapan = document.getElementById("daftar-ucapan");
        if (wadahUcapan) wadahUcapan.innerHTML = `<div class="text-center text-red-500 py-6 italic">Akses ditolak. Proyek tidak valid.</div>`;
    }

    muatDataProyek(); // Eksekusi fungsi

    // 3. Logika animasi pembukaan undangan
    btnBuka.addEventListener("click", () => {
        heroCover.classList.add("fade-up-out");
        
        setTimeout(() => {
            heroCover.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
            mainContent.classList.remove("hidden");
        }, 700); 
    });

    // 4. Integrasi Form RSVP dengan Firestore
    const rsvpForm = document.getElementById("rsvp-form");
    const btnSubmit = document.getElementById("btn-submit");

    rsvpForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        // Ubah state tombol menjadi loading
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Mengirim...`;
        btnSubmit.disabled = true;

        // Kumpulkan data input
        const namaInput = document.getElementById("nama-kehadiran").value;
        const statusInput = document.getElementById("status-kehadiran").value;
        const pesanInput = document.getElementById("pesan-kehadiran").value;

        try {
            // Kirim data ke koleksi 'buku_tamu' dengan identitas klien
            await addDoc(collection(db, "buku_tamu"), {
                idProyek: idProyek, // Penanda isolasi data antar klien
                nama: namaInput,
                status: statusInput,
                pesan: pesanInput,
                dikirimPada: serverTimestamp()
            });

            // Kembalikan antarmuka tombol dan reset form
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
            rsvpForm.reset();

            // Tampilkan notifikasi sukses premium
            Swal.fire({
                title: '<span class="font-serif text-3xl text-gray-900">Terima Kasih!</span>',
                text: 'Ucapan dan konfirmasi kehadiran Anda berhasil dikirim.',
                icon: 'success',
                iconColor: '#10b981', // emerald-500 premium
                background: '#ffffff',
                backdrop: `rgba(15, 23, 42, 0.4)`, // Overlay gelap yang elegan
                showConfirmButton: true,
                confirmButtonText: 'Tutup',
                buttonsStyling: false, // Matikan style bawaan agar Tailwind bisa bekerja
                customClass: {
                    popup: 'rounded-3xl shadow-2xl border border-gray-100 py-6 px-4',
                    title: 'mt-2',
                    htmlContainer: 'text-gray-500 text-sm mt-2',
                    confirmButton: 'mt-6 px-10 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg',
                    backdrop: 'backdrop-blur-sm' // Efek glassmorphism pada background
                }
            });

        } catch (error) {
            console.error('Error saat menyimpan RSVP:', error);
            
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;

            Swal.fire({
                title: 'Oops...',
                text: 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.',
                icon: 'error',
                confirmButtonColor: '#1f2937'
            });
        }
    });

    // SISIPKAN MULAI DARI SINI:
    /**
     * 5. Fitur Real-time Daftar Ucapan (Buku Tamu)
     * Menggunakan onSnapshot agar ucapan yang masuk langsung tampil di layar tamu 
     * tanpa perlu refresh halaman.
     */
    const wadahUcapan = document.getElementById("daftar-ucapan");
    
    // Filter ucapan HANYA untuk proyek yang sedang diakses di URL
    const qUcapan = query(collection(db, "buku_tamu"), where("idProyek", "==", idProyek));

    onSnapshot(qUcapan, (snapshot) => {
        wadahUcapan.innerHTML = ""; 
        
        if (snapshot.empty) {
            wadahUcapan.innerHTML = `<div class="text-center text-gray-500 py-6 italic">Belum ada ucapan. Jadilah yang pertama memberikan doa!</div>`;
            return;
        }

        // Ekstrak data ke dalam array agar bisa diurutkan secara manual di klien
        let daftarUcapan = [];
        snapshot.forEach((doc) => {
            daftarUcapan.push(doc.data());
        });

        // Urutkan array berdasarkan waktu (terbaru ke terlama)
        daftarUcapan.sort((a, b) => {
            const waktuA = a.dikirimPada ? a.dikirimPada.toMillis() : 0;
            const waktuB = b.dikirimPada ? b.dikirimPada.toMillis() : 0;
            return waktuB - waktuA;
        });

        // Render kartu ucapan dari data yang sudah diisolasi
        daftarUcapan.forEach((data) => {
            let waktu = "Baru saja";
            if (data.dikirimPada) {
                const date = data.dikirimPada.toDate();
                waktu = date.toLocaleDateString('id-ID', { 
                    day: 'numeric', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                });
            }

            const isHadir = data.status === "Hadir" || data.status === "Ya, Saya akan hadir";
            const badgeWarna = isHadir ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
            const iconKehadiran = isHadir 
                ? `<svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
                : `<svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

            const kartu = document.createElement("div");
            kartu.className = "bg-white/90 p-5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md transform hover:-translate-y-1";
            kartu.innerHTML = `
                <div class="flex flex-wrap justify-between items-start mb-3 gap-2">
                    <div>
                        <h4 class="font-bold text-gray-900 text-base md:text-lg">${data.nama}</h4>
                        <span class="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ${waktu}
                        </span>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center uppercase ${badgeWarna}">
                        ${iconKehadiran} ${data.status.substring(0,11)}
                    </span>
                </div>
                <p class="text-gray-700 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 relative">
                    <span class="absolute -top-2 left-4 text-2xl text-slate-200 font-serif">"</span>
                    <span class="relative z-10">${data.pesan}</span>
                </p>
            `;
            wadahUcapan.appendChild(kartu);
        });
    });

    });