export interface PersonProfile {
  namaLengkap: string;
  namaPanggilan: string;
  namaAyah: string;
  namaIbu: string;
  foto: string;
  instagram?: string;
  bio?: string;
}

export interface WeddingEvent {
  id: string;
  judul: string;
  hariTanggal: string;
  waktu: string;
  zonaWaktu?: string;
  tempat: string;
  alamat: string;
  linkMaps: string;
  deskripsi?: string;
}

export interface LoveStoryItem {
  id: string;
  tahun: string;
  judul: string;
  cerita: string;
  foto?: string;
}

export interface AdditionalInfo {
  id: string;
  icon: 'car' | 'utensils' | 'clock' | 'shirt' | 'heart' | 'info';
  judul: string;
  deskripsi: string;
}

export interface BankAccount {
  id: string;
  bank: string;
  noRek: string;
  atasNama: string;
  qrisUrl?: string;
}

export type InvitationCategory = 'pernikahan' | 'khitan' | 'ulang-tahun';

export interface ChildProfile {
  namaLengkap: string;
  namaPanggilan: string;
  namaAyah: string;
  namaIbu: string;
  foto: string;
  usia?: string;
  doaKhitan?: string;
}

export interface BirthdayProfile {
  namaLengkap: string;
  namaPanggilan: string;
  usiaKe: number | string;
  foto: string;
  temaPesta?: string;
  namaOrtu?: string;
}

export interface WeddingConfig {
  slug: string;
  judulUndangan: string;
  salamPembuka: string;
  kutipanAwal: string;
  kutipanAkhir: string;
  kategori?: InvitationCategory; // 'pernikahan' | 'khitan' | 'ulang-tahun'
  kerangkaDesain?: string; // e.g. 'wedding-botanical', 'khitan-islamic-blue', 'birthday-festive'
  
  // Mempelai (Untuk Pernikahan)
  pria: PersonProfile;
  wanita: PersonProfile;
  
  // Profil Khitan
  anak?: ChildProfile;
  
  // Profil Ulang Tahun
  ulangTahun?: BirthdayProfile;
  
  // Sampul
  labelSampul: string;
  fotoSampul: string;
  subJudulSampul: string;
  teksTombol?: string;
  
  // Tanggal & Countdown
  tanggalResmi: string; // e.g. "2025-11-23" or "23 November 2025"
  hariTanggalLengkap: string; // e.g. "Sabtu, 23 November 2025"
  tanggalCountdownIso: string; // e.g. "2025-11-23T08:00:00"
  
  // Acara
  acaraList: WeddingEvent[];
  infoTambahan: AdditionalInfo[];
  
  // Kisah Cinta
  kisahCinta: {
    enabled: boolean;
    ceritaList: LoveStoryItem[];
  };
  
  // Galeri
  galeri: {
    enabled: boolean;
    deskripsi: string;
    fotoList: string[];
    videoUrl?: string;
  };
  
  // Lokasi & Navigasi
  lokasi: {
    namaTempat: string;
    alamatLengkap: string;
    googleMapsUrl: string;
    embedMapsUrl?: string;
  };
  
  // RSVP & Buku Tamu
  rsvp: {
    enabled: boolean;
    deadline: string;
    pesanCatatan: string;
  };
  
  bukuTamu: {
    enabled: boolean;
    subJudul: string;
  };
  
  // Hadiah / Amplop Digital
  amplopDigital: {
    enabled: boolean;
    deskripsi: string;
    rekeningList: BankAccount[];
    alamatKado?: string;
  };
  
  // Musik
  musik: {
    enabled: boolean;
    autoplay: boolean;
    judulLagu: string;
    artis: string;
    audioUrl: string;
  };
  
  // Tema & Gaya
  tema: {
    temaId: string;
    namaTema: string;
    warnaUtama: string; // Primary accent color (buttons, main titles)
    warnaLatar: string; // Background tone (canvas)
    warnaAksen: string; // Secondary gold/accent tone
    warnaKartu?: string; // Card background
    fontJudul: string;
    fontIsi: string;
    ornamen: string;
    styleTampilan?: 'classic-botanical' | 'modern-clean' | 'luxury-gold' | 'romantic-floral' | 'islamic-arch' | 'festive-birthday';
    modeNavigasi?: 'scroll' | 'flipbook';
    teksturKertas?: 'none' | 'vintage-parchment' | 'linen' | 'watercolor-matte';
    efekPartikel?: 'none' | 'petals' | 'sparkles' | 'stars' | 'balloons';
    suaraKertas?: boolean;
  };
}

export interface WeddingProject {
  id: string; // Document ID in Firestore, e.g. "MS-RAKASIN"
  kategori?: InvitationCategory; // 'pernikahan' | 'khitan' | 'ulang-tahun'
  mempelai: string; // "Raka & Sinta" or "Rafi Alfarizki" or "Dinda Permata"
  tanggal: string; // "23 Nov 2025"
  status: 'Aktif' | 'Draf';
  dibuatPada: any;
  clientEmail?: string;
  config: WeddingConfig;
}

export interface GuestbookEntry {
  id?: string;
  idProyek: string;
  nama: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Mungkin';
  jumlahTamu?: number;
  pesan: string;
  dikirimPada: any;
}
