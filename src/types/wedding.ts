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
    videoEnabled?: boolean;
    videoUrl?: string; // YouTube watch/shorts/embed, Vimeo, or direct MP4 link
    videoJudul?: string;
    videoDeskripsi?: string;
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
    volume?: number; // 0 to 1
    loop?: boolean;
    isCustomUpload?: boolean;
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
    fontJudulSection?: string;
    fontNamaProfil?: string;
    ukuranJudulSection?: 'sm' | 'md' | 'lg' | 'xl';
    ukuranNamaProfil?: 'sm' | 'md' | 'lg' | 'xl';
    tebalNamaProfil?: boolean;
    miringNamaProfil?: boolean;
    warnaNamaProfil?: string;
    ornamen: string;
    styleTampilan?: 'classic-botanical' | 'modern-clean' | 'luxury-gold' | 'romantic-floral' | 'islamic-arch' | 'festive-birthday';
    modeNavigasi?: 'scroll' | 'flipbook';
    teksturKertas?: 'none' | 'vintage-parchment' | 'linen' | 'watercolor-matte';
    efekPartikel?: 'none' | 'petals' | 'sparkles' | 'stars' | 'balloons';
    suaraKertas?: boolean;
  };
  
  // Tata Letak & Frame Styling
  tataLetak?: LayoutConfig;

  // Dekorasi & Ornamen Kustom / Preset
  ornamenConfig?: OrnamenConfig;
}

export interface OrnamenConfig {
  gayaSudut?: 'botanical-leaves' | 'gold-vintage' | 'islamic-arabesque' | 'minimal-modern' | 'none';
  gayaPemisah?: 'gold-filigree' | 'leaf-vine' | 'bismillah-calligraphy' | 'clean-line' | 'none';
  customOrnamenUrl?: string;
  posisiCustom?: 'sudut-atas' | 'pembatas' | 'floating';
  ukuranOrnamen?: number; // 30 to 140px
  opasitasOrnamen?: number; // 20 to 100%
}

export interface LayoutConfig {
  // Pengaturan Sampul (Cover greeting box & CTA button position)
  posisiKotakSampul?: 'bawah' | 'tengah-bawah' | 'tengah' | 'bawah-ekstra';
  geserVertikalKotakSampul?: number; // slider -150px to +150px
  gayaKotakSampul?: 'frosted-glass' | 'clean-white' | 'gold-border' | 'minimal-transparent' | 'dark-glass';
  
  // Pengaturan Frame Foto Mempelai / Profil (Photo collage styling)
  bentukFrameFoto?: 'circle' | 'arch' | 'arch-double' | 'squircle' | 'oval' | 'diamond' | 'hexagon' | 'scallop' | 'polaroid' | 'blob';
  ukuranFotoMempelai?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  ukuranFotoKustom?: number; // 90 to 220px
  gayaBorderFoto?: 'gold-ring' | 'double-ring' | 'dashed-vintage' | 'subtle-shadow' | 'floral-accent' | 'none';
  posisiFokusFoto?: 'center' | 'top' | 'bottom';
  geserVertikalFoto?: number; // -40px to +40px
  
  // Gaya & Tipografi Teks Sampul (Warna, Ukuran, Tebal, Shadow)
  gayaTeksSampul?: CoverTextStyleConfig;
}

export interface CoverTextStyleConfig {
  // 1. Teks Kalimat Pengantar / Subjudul (Tanda Kurung Merah Tengah)
  subJudulWarna?: string;
  subJudulUkuran?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  subJudulBold?: boolean;
  subJudulItalic?: boolean;
  subJudulShadow?: boolean;
  subJudulAlign?: 'left' | 'center' | 'right';

  // 2. Nama Pengantin / Judul Mempelai (Tanda Kurung Merah Atas)
  judulWarna?: string;
  judulUkuran?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  judulBold?: boolean;
  judulShadow?: boolean;

  // 3. Info Tanggal & Lokasi (Tanda Kurung Merah Bawah)
  infoWarna?: string;
  infoUkuran?: 'xs' | 'sm' | 'base';
  infoBold?: boolean;
  infoShadow?: boolean;
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
