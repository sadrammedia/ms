// 1. Impor instance database dari file konfigurasi
import { db } from "./firebase-config.js";
// Impor fungsi Firestore yang dibutuhkan
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
    // Ambil elemen DOM Utama
    const tbodyKlien = document.getElementById("tabel-klien");
    const metrikTotal = document.getElementById("metric-total");
    const metrikAktif = document.getElementById("metric-aktif");
    const metrikDraf = document.getElementById("metric-draf");

    // Ambil elemen DOM Modal
    const modalTambah = document.getElementById("modal-tambah");
    const modalCard = document.getElementById("modal-card");
    const btnTambahProyek = document.getElementById("btn-tambah-proyek");
    const btnTutupModal = document.getElementById("btn-tutup-modal");
    const modalBackdrop = document.getElementById("modal-backdrop");
    const formTambahProyek = document.getElementById("form-tambah-proyek");
    const btnSimpanProyek = document.getElementById("btn-simpan-proyek");


    // --- GERBANG KEAMANAN: Cek Status Login Admin ---
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Jika belum login, tendang otomatis kembali ke halaman login.html
            window.location.href = "login.html";
        }
    });

    // --- TAMBAHKAN TOMBOL LOGOUT DINAMIS DI HEADER ADMIN ---
    const headerAdmin = document.querySelector("header") || document.body;
    // Cek apakah tombol logout sudah ada sebelumnya agar tidak ganda
    if (!document.getElementById("btn-logout")) {
        const btnLogout = document.createElement("button");
        btnLogout.id = "btn-logout";
        btnLogout.className = "fixed top-4 right-6 z-50 px-5 py-2.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full font-semibold text-xs tracking-wide transition-all border border-rose-200 shadow-sm backdrop-blur-md flex items-center gap-2";
        btnLogout.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Sistem
        `;
        
        btnLogout.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Gagal keluar:", error);
            }
        });

        document.body.appendChild(btnLogout);
    }

    /**
     * 2. Fungsi Ambil dan Render Data dari Firestore
     * Melakukan fetch data dari koleksi 'proyek_klien' dan merendernya ke tabel
     */
    async function muatDataKlien() {
        try {
            // Bersihkan tabel sebelum merender ulang
            tbodyKlien.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">Memuat data...</td></tr>';
            
            // Query mengambil data diurutkan dari yang terbaru (membutuhkan index Firestore nantinya)
            const q = query(collection(db, "proyek_klien"), orderBy("dibuatPada", "desc"));
            const querySnapshot = await getDocs(q);
            
            tbodyKlien.innerHTML = ""; // Kosongkan indikator loading
            let countAktif = 0;
            let countDraf = 0;
            let totalData = 0;

            querySnapshot.forEach((doc) => {
                totalData++;
                const klien = doc.data();
                const idProyek = doc.id.substring(0, 7).toUpperCase();

                if (klien.status === "Aktif") countAktif++;
                else countDraf++;

                const badgeClass = klien.status === "Aktif" 
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                    : "bg-amber-100 text-amber-700 border-amber-200";

                // Membentuk URL dinamis berdasarkan ID Proyek untuk klien
                const urlUndangan = `${window.location.origin}/index.html?id=MS-${idProyek}`;

                const tr = document.createElement("tr");
                tr.className = "hover:bg-slate-50 transition-colors";
                tr.innerHTML = `
                    <td class="p-4 pl-6 font-semibold text-indigo-600">MS-${idProyek}</td>
                    <td class="p-4 font-medium text-gray-900">${klien.mempelai}</td>
                    <td class="p-4">${klien.tanggal}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${badgeClass}">
                            ${klien.status}
                        </span>
                    </td>
                    <td class="p-4 pr-6 text-right flex justify-end gap-2">
                        <!-- Tombol Buka Tautan -->
                        <a href="${urlUndangan}" target="_blank" class="text-gray-400 hover:text-emerald-500 transition-colors p-1" title="Buka Undangan">
                            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                        <!-- Tombol Buka Editor Dinamis -->
                        <a href="/?view=editor&id=MS-${idProyek}" class="text-gray-400 hover:text-amber-500 transition-colors p-1" title="Buka Editor Dinamis">
                            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </a>
                        <!-- Tombol Edit Cepat -->
                        <button class="btn-edit text-gray-400 hover:text-indigo-600 transition-colors p-1" data-id="${doc.id}" title="Edit Singkat">
                            <svg class="w-5 h-5 inline pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </button>
                        <!-- Tombol Hapus -->
                        <button class="btn-hapus text-gray-400 hover:text-rose-500 transition-colors p-1" data-id="${doc.id}" title="Hapus">
                            <svg class="w-5 h-5 inline pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                `;
                tbodyKlien.appendChild(tr);
            });

            if (totalData === 0) {
                tbodyKlien.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">Belum ada proyek undangan.</td></tr>';
            }

            // Update metrik dashboard
            metrikTotal.textContent = totalData;
            metrikAktif.textContent = countAktif;
            metrikDraf.textContent = countDraf;

        } catch (error) {
            console.error("Error fetching data: ", error);
            tbodyKlien.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-red-500">Gagal memuat data database.</td></tr>';
        }
    }

    // Panggil fungsi saat halaman dimuat
    muatDataKlien();

    /**
     * 3. Logika Interaktif Modal
     */
    const bukaModal = () => {
        modalTambah.classList.remove("hidden");
        setTimeout(() => {
            modalTambah.classList.remove("opacity-0");
            modalCard.classList.remove("scale-95");
            modalCard.classList.add("scale-100");
        }, 10);
    };

    const tutupModal = () => {
        modalTambah.classList.add("opacity-0");
        modalCard.classList.remove("scale-100");
        modalCard.classList.add("scale-95");
        setTimeout(() => {
            modalTambah.classList.add("hidden");
            formTambahProyek.reset();
        }, 300);
    };

    btnTambahProyek.addEventListener("click", bukaModal);
    btnTutupModal.addEventListener("click", tutupModal);
    modalBackdrop.addEventListener("click", tutupModal);

    /**
     * 4. Fungsi Simpan Proyek Baru ke Firestore
     */
    formTambahProyek.addEventListener("submit", async (e) => {
        e.preventDefault();

        const originalText = btnSimpanProyek.innerHTML;
        btnSimpanProyek.innerHTML = `<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> Menyimpan...`;
        btnSimpanProyek.disabled = true;

        const mempelaiBaru = document.getElementById("input-mempelai").value;
        const tanggalBaru = document.getElementById("input-tanggal").value;

        try {
            // Menyisipkan dokumen baru ke koleksi 'proyek_klien'
            await addDoc(collection(db, "proyek_klien"), {
                mempelai: mempelaiBaru,
                tanggal: tanggalBaru,
                status: "Draf",
                dibuatPada: serverTimestamp() // Mencatat waktu server Firestore secara akurat
            });

            // Refresh tabel dari database
            await muatDataKlien();

            // Kembalikan UI
            btnSimpanProyek.innerHTML = originalText;
            btnSimpanProyek.disabled = false;
            tutupModal();

            Swal.fire({
                title: 'Berhasil!',
                text: 'Proyek undangan baru tersimpan di database.',
                icon: 'success',
                confirmButtonColor: '#4f46e5',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error adding document: ", error);
            btnSimpanProyek.innerHTML = originalText;
            btnSimpanProyek.disabled = false;
            
            Swal.fire({
                title: 'Oops...',
                text: 'Gagal menyimpan proyek ke database.',
                icon: 'error',
                confirmButtonColor: '#1f2937'
            });
        }
    });

    /**
     * 5. Logika Tombol Aksi Tabel (Hapus)
     * Menggunakan event delegation pada tbodyKlien
     */
    tbodyKlien.addEventListener("click", async (e) => {
        
        // Deteksi klik pada tombol Hapus
        if (e.target.closest('.btn-hapus')) {
            const btn = e.target.closest('.btn-hapus');
            const idDoc = btn.getAttribute('data-id'); // Mengambil ID dokumen asli dari Firestore

            const result = await Swal.fire({
                title: '<span class="font-serif text-2xl text-gray-900">Hapus Proyek?</span>',
                text: "Data klien ini akan dihapus secara permanen dari database.",
                icon: 'warning',
                iconColor: '#ef4444',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-3xl shadow-2xl border border-gray-100 py-6 px-4',
                    confirmButton: 'mt-4 mx-2 px-6 py-2 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors',
                    cancelButton: 'mt-4 mx-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors',
                    backdrop: 'backdrop-blur-sm'
                }
            });

            if (result.isConfirmed) {
                try {
                    // Eksekusi penghapusan ke cloud Firestore
                    await deleteDoc(doc(db, "proyek_klien", idDoc));
                    
                    // Render ulang tabel secara real-time
                    await muatDataKlien(); 
                    
                    Swal.fire({
                        title: '<span class="font-serif text-xl text-gray-900">Terhapus!</span>',
                        text: 'Proyek berhasil dihapus.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        customClass: { popup: 'rounded-3xl shadow-2xl border border-gray-100 py-6 px-4', backdrop: 'backdrop-blur-sm' }
                    });
                } catch (error) {
                    console.error("Gagal menghapus dokumen:", error);
                    Swal.fire("Oops!", "Terjadi kesalahan saat menghapus data.", "error");
                }
            }
        }

        if (e.target.closest('.btn-edit')) {
            const btn = e.target.closest('.btn-edit');
            const idDoc = btn.getAttribute('data-id');

            // Ambil data teks saat ini langsung dari baris tabel
            const baris = btn.closest('tr');
            const teksMempelai = baris.querySelector('td:nth-child(2)').innerText;
            const teksTanggal = baris.querySelector('td:nth-child(3)').innerText;
            const teksStatus = baris.querySelector('td:nth-child(4)').innerText.trim();

            // Tampilkan form edit premium menggunakan SweetAlert2
            const { value: formValues } = await Swal.fire({
                title: '<span class="font-serif text-2xl text-gray-900">Edit Proyek</span>',
                html: `
                    <div class="flex flex-col gap-4 mt-4 text-left">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1 pl-2">Nama Mempelai</label>
                            <input id="edit-mempelai" class="w-full px-5 py-3 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800" value="${teksMempelai}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1 pl-2">Tanggal Acara</label>
                            <input id="edit-tanggal" class="w-full px-5 py-3 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-gray-800" value="${teksTanggal}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1 pl-2">Status Undangan</label>
                            <select id="edit-status" class="w-full px-5 py-3 rounded-full border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none bg-slate-50 text-gray-800">
                                <option value="Aktif" ${teksStatus === 'Aktif' ? 'selected' : ''}>Aktif</option>
                                <option value="Draf" ${teksStatus === 'Draf' ? 'selected' : ''}>Draf</option>
                            </select>
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Simpan',
                cancelButtonText: 'Batal',
                buttonsStyling: false,
                customClass: {
                    popup: 'rounded-3xl shadow-2xl border border-gray-100 py-6 px-4',
                    confirmButton: 'mt-6 mx-2 px-8 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg',
                    cancelButton: 'mt-6 mx-2 px-8 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors',
                    backdrop: 'backdrop-blur-sm'
                },
                preConfirm: () => {
                    return {
                        mempelai: document.getElementById('edit-mempelai').value,
                        tanggal: document.getElementById('edit-tanggal').value,
                        status: document.getElementById('edit-status').value
                    }
                }
            });

            // Jika tombol Simpan ditekan dan data ada
            if (formValues) {
                // Ubah kursor jadi loading (opsional)
                document.body.style.cursor = 'wait';
                
                try {
                    // Update data ke Firestore
                    await updateDoc(doc(db, "proyek_klien", idDoc), {
                        mempelai: formValues.mempelai,
                        tanggal: formValues.tanggal,
                        status: formValues.status
                    });
                    
                    // Render ulang tabel untuk memperbarui tampilan
                    await muatDataKlien();
                    
                    document.body.style.cursor = 'default';
                    Swal.fire({
                        title: '<span class="font-serif text-xl text-gray-900">Tersimpan!</span>',
                        text: 'Perubahan proyek berhasil disimpan.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        customClass: { popup: 'rounded-3xl shadow-xl border border-gray-100 py-6 px-4', backdrop: 'backdrop-blur-sm' }
                    });
                } catch (error) {
                    console.error("Gagal memperbarui dokumen:", error);
                    document.body.style.cursor = 'default';
                    Swal.fire("Oops!", "Terjadi kesalahan saat menyimpan perubahan.", "error");
                }
            }
        }

    });

});