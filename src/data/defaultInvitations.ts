import { WeddingProject, WeddingConfig } from '../types/wedding';

// =========================================================================
// 1. TEMPLATE UNDANGAN PERNIKAHAN (THE WEDDING OF RAKA & SINTA)
// =========================================================================
export const defaultWeddingConfig: WeddingConfig = {
  kategori: 'pernikahan',
  kerangkaDesain: 'wedding-botanical',
  slug: 'raka-sinta',
  judulUndangan: 'The Wedding of Raka & Sinta',
  labelSampul: 'THE WEDDING OF',
  fotoSampul: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  subJudulSampul: 'Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami.',
  teksTombol: 'Buka Undangan',
  salamPembuka: 'Assalamu’alaikum Warahmatullahi Wabarakatuh\nDengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:',
  kutipanAwal: 'Dua hati, satu tujuan, membangun rumah tangga yang penuh cinta.',
  kutipanAkhir: '“Bersama dalam cinta, menuju hidup yang lebih baik.”',
  
  // Mempelai Profil
  pria: {
    namaLengkap: 'Raka Pratama, S.T.',
    namaPanggilan: 'Raka',
    namaAyah: 'Bapak Ahmad Setiawan',
    namaIbu: 'Ibu Nurhayati',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    instagram: '@rakapratama',
    bio: 'Putra pertama yang bertekad membangun keluarga sakinah mawaddah warahmah.'
  },
  wanita: {
    namaLengkap: 'Sinta Dewi, S.Pd.',
    namaPanggilan: 'Sinta',
    namaAyah: 'Bapak Budi Santoso',
    namaIbu: 'Ibu Siti Aminah',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    instagram: '@sintadewi',
    bio: 'Putri bungsu yang siap melangkah mendampingi dalam suka dan duka.'
  },
  
  tanggalResmi: '23 November 2025',
  hariTanggalLengkap: 'Sabtu, 23 November 2025',
  tanggalCountdownIso: '2025-11-23T08:00:00',
  
  // Agenda Acara
  acaraList: [
    {
      id: 'akad',
      judul: 'Akad Nikah',
      hariTanggal: 'Sabtu, 23 November 2025',
      waktu: 'Pukul 08.00 WIB',
      zonaWaktu: 'WIB',
      tempat: 'Gedung Serbaguna Harmoni',
      alamat: 'Jl. Melati No. 12, Bandung',
      linkMaps: 'https://maps.google.com/?q=Gedung+Serbaguna+Harmoni+Bandung',
      deskripsi: 'Prosesi ijab kabul sakral bersama keluarga inti dan kerabat dekat.'
    },
    {
      id: 'resepsi',
      judul: 'Resepsi Pernikahan',
      hariTanggal: 'Sabtu, 23 November 2025',
      waktu: 'Pukul 11.00 – 15.00 WIB',
      zonaWaktu: 'WIB',
      tempat: 'Gedung Serbaguna Harmoni',
      alamat: 'Jl. Melati No. 12, Bandung',
      linkMaps: 'https://maps.google.com/?q=Gedung+Serbaguna+Harmoni+Bandung',
      deskripsi: 'Ramah tamah dan perjamuan perayaan pernikahan bersama seluruh tamu undangan.'
    }
  ],
  
  infoTambahan: [
    {
      id: 'parkir',
      icon: 'car',
      judul: 'Area Parkir',
      deskripsi: 'Parkir luas tersedia gratis di area gedung untuk roda empat dan roda dua.'
    },
    {
      id: 'makanan',
      icon: 'utensils',
      judul: 'Perjamuan',
      deskripsi: 'Makanan dan hidangan prasmanan lezat akan disediakan dengan standar higienis.'
    },
    {
      id: 'waktu',
      icon: 'clock',
      judul: 'Ketepatan Waktu',
      deskripsi: 'Diharapkan hadir tepat waktu demi kelancaran dan kekhidmatan seluruh rangkaian acara.'
    }
  ],
  
  kisahCinta: {
    enabled: true,
    ceritaList: [
      {
        id: 'story-1',
        tahun: '2021',
        judul: 'Awal Perkenalan',
        cerita: 'Pertemuan pertama yang sederhana di sebuah acara seminar kampus di Bandung, berawal dari sapaan hangat yang menumbuhkan rasa saling mengagumi.'
      },
      {
        id: 'story-2',
        tahun: '2023',
        judul: 'Komitmen & Kedekatan',
        cerita: 'Melalui berbagai fase, canda tawa, dan tantangan hidup, kami menyadari bahwa langkah kami selalu lebih bermakna ketika dijalani bersama.'
      },
      {
        id: 'story-3',
        tahun: '2025',
        judul: 'Momen Lamaran',
        cerita: 'Dengan restu kedua orang tua dan niat tulus beribadah, kami resmi melangsungkan prosesi khitbah untuk melangkah ke jenjang pernikahan suci.'
      }
    ]
  },
  
  galeri: {
    enabled: true,
    deskripsi: 'Beberapa momen indah perjalanan kami bersama.',
    fotoList: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80'
    ],
    videoEnabled: true,
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    videoJudul: 'Teaser Prewedding Sinematik',
    videoDeskripsi: 'Sekilas kilas balik perjalanan cinta kami menuju ikatan suci pernikahan.'
  },
  
  lokasi: {
    namaTempat: 'Gedung Serbaguna Harmoni',
    alamatLengkap: 'Jl. Melati No. 12, Bandung',
    googleMapsUrl: 'https://maps.google.com/?q=Gedung+Serbaguna+Harmoni+Bandung',
    embedMapsUrl: ''
  },
  
  rsvp: {
    enabled: true,
    deadline: '15 November 2025',
    pesanCatatan: 'Mohon konfirmasi kehadiran Anda sebelum 15 November 2025 untuk memudahkan pengaturan tempat duduk dan hidangan.'
  },
  
  bukuTamu: {
    enabled: true,
    subJudul: 'Kehadiran dan doa Anda adalah kebahagiaan bagi kami.'
  },
  
  amplopDigital: {
    enabled: true,
    deskripsi: 'Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat menyalurkannya melalui:',
    rekeningList: [
      {
        id: 'rek-1',
        bank: 'BCA',
        noRek: '1234567890',
        atasNama: 'Raka Pratama'
      },
      {
        id: 'rek-2',
        bank: 'Bank Mandiri',
        noRek: '0987654321123',
        atasNama: 'Sinta Dewi'
      }
    ],
    alamatKado: 'Jl. Melati No. 12, Bandung (Penerima: Raka & Sinta)'
  },
  
  musik: {
    enabled: true,
    autoplay: false,
    judulLagu: 'Beautiful Acoustic Wedding Promise',
    artis: 'Acoustic Morning Melody',
    audioUrl: '/audio/acoustic-wedding.mp3'
  },
  
  tema: {
    temaId: 'elegant-botanical',
    namaTema: 'Emerald Botanical',
    warnaUtama: '#1F362D',
    warnaLatar: '#FAF7F2',
    warnaAksen: '#C5A059',
    fontJudul: 'Great Vibes',
    fontIsi: 'Plus Jakarta Sans',
    ornamen: 'botanical-leaves',
    styleTampilan: 'classic-botanical',
    modeNavigasi: 'scroll',
    teksturKertas: 'vintage-parchment',
    efekPartikel: 'petals',
    suaraKertas: true
  },
  tataLetak: {
    posisiKotakSampul: 'bawah',
    geserVertikalKotakSampul: 0,
    gayaKotakSampul: 'frosted-glass',
    bentukFrameFoto: 'circle',
    ukuranFotoMempelai: 'md',
    ukuranFotoKustom: 130,
    gayaBorderFoto: 'gold-ring',
    posisiFokusFoto: 'top',
    geserVertikalFoto: 0
  }
};

// =========================================================================
// 2. TEMPLATE UNDANGAN KHITAN (TASYAKURAN KHITAN RAFI ALFARIZKI)
// =========================================================================
export const defaultKhitanConfig: WeddingConfig = {
  kategori: 'khitan',
  kerangkaDesain: 'khitan-islamic-blue',
  slug: 'rafi-alfarizki',
  judulUndangan: 'Tasyakuran Khitan Ananda Rafi Alfarizki',
  labelSampul: 'TASYAKURAN KHITAN',
  fotoSampul: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
  subJudulSampul: 'Dengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara tasyakuran khitan putra kami.',
  teksTombol: 'Konfirmasi Kehadiran',
  salamPembuka: 'Assalamu’alaikum Warahmatullahi Wabarakatuh\nDengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, seraya memanjatkan puji dan syukur atas karunia-Nya, kami bermaksud menyelenggarakan Tasyakuran Walimatul Khitan putra tercinta kami:',
  kutipanAwal: 'Momen penuh syukur untuk langkah awal yang mulia menuju kedewasaan dan ketaatan ibadah.',
  kutipanAkhir: '“Semoga menjadi anak yang sholeh, berbakti kepada kedua orang tua, serta bermanfaat bagi agama, nusa, dan bangsa.”',
  
  // Profil Khitan
  anak: {
    namaLengkap: 'Rafi Alfarizki Pratama',
    namaPanggilan: 'Rafi',
    namaAyah: 'Bapak H. Ahmad Fauzi',
    namaIbu: 'Ibu Hj. Siti Nurjanah',
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    usia: '10 Tahun',
    doaKhitan: 'Ya Allah, berkahilah ananda Rafi Alfarizki, jadikanlah ia hamba-Mu yang sholeh, rajin beribadah, cerdas, berbakti kepada orang tua, dan menjadi penyejuk hati keluarga.'
  },
  
  pria: {
    namaLengkap: 'Bapak H. Ahmad Fauzi',
    namaPanggilan: 'Fauzi',
    namaAyah: '-',
    namaIbu: '-',
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
  },
  wanita: {
    namaLengkap: 'Ibu Hj. Siti Nurjanah',
    namaPanggilan: 'Nurjanah',
    namaAyah: '-',
    namaIbu: '-',
    foto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
  },
  
  tanggalResmi: '15 Desember 2025',
  hariTanggalLengkap: 'Minggu, 15 Desember 2025',
  tanggalCountdownIso: '2025-12-15T09:00:00',
  
  acaraList: [
    {
      id: 'acara-khitan',
      judul: 'Tasyakuran & Doa Bersama',
      hariTanggal: 'Minggu, 15 Desember 2025',
      waktu: '10.00 WIB s.d. selesai',
      zonaWaktu: 'WIB',
      tempat: 'Kediaman Mempelai / Rumah Kami',
      alamat: 'Jl. Kenanga No. 8, Tasikmalaya',
      linkMaps: 'https://maps.google.com/?q=Tasikmalaya',
      deskripsi: 'Pembacaan ayat suci Al-Qur’an, tausiyah singkat, serta doa bersama untuk kelancaran khitan ananda.'
    },
    {
      id: 'ramah-tamah',
      judul: 'Ramah Tamah & Santap Siang',
      hariTanggal: 'Minggu, 15 Desember 2025',
      waktu: 'Pukul 11.30 WIB – Selesai',
      zonaWaktu: 'WIB',
      tempat: 'Kediaman Mempelai / Rumah Kami',
      alamat: 'Jl. Kenanga No. 8, Tasikmalaya',
      linkMaps: 'https://maps.google.com/?q=Tasikmalaya',
      deskripsi: 'Jamuan makan siang prasmanan dan silaturahmi hangat bersama keluarga dan tetangga.'
    }
  ],
  
  infoTambahan: [
    {
      id: 'protokol',
      icon: 'heart',
      judul: 'Doa Restu',
      deskripsi: 'Kehadiran dan untaian doa tulus Bapak/Ibu merupakan kebahagiaan terbesar bagi ananda kami.'
    },
    {
      id: 'parkir-khitan',
      icon: 'car',
      judul: 'Tempat Parkir',
      deskripsi: 'Tersedia kantong parkir tertib di sepanjang jalan lingkungan rumah kami.'
    }
  ],
  
  kisahCinta: {
    enabled: false,
    ceritaList: []
  },
  
  galeri: {
    enabled: true,
    deskripsi: 'Koleksi potret ceria Ananda Rafi Alfarizki.',
    fotoList: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80'
    ],
    videoEnabled: false,
    videoUrl: '',
    videoJudul: 'Video Momen Kebahagiaan Ananda'
  },
  
  lokasi: {
    namaTempat: 'Rumah Kami',
    alamatLengkap: 'Jl. Kenanga No. 8, Tasikmalaya',
    googleMapsUrl: 'https://maps.google.com/?q=Jl+Kenanga+No+8+Tasikmalaya',
    embedMapsUrl: ''
  },
  
  rsvp: {
    enabled: true,
    deadline: '10 Desember 2025',
    pesanCatatan: 'Mohon berkenan mengonfirmasi kehadiran Anda guna kelancaran persiapan jamuan tasyakuran.'
  },
  
  bukuTamu: {
    enabled: true,
    subJudul: 'Untaian doa restu untuk ananda Rafi Alfarizki.'
  },
  
  amplopDigital: {
    enabled: true,
    deskripsi: 'Bagi keluarga atau kerabat yang hendak memberikan tanda kasih kado khitanan untuk ananda, dapat melalui:',
    rekeningList: [
      {
        id: 'rek-khitan-1',
        bank: 'BCA',
        noRek: '5220891234',
        atasNama: 'Ahmad Fauzi (Ayah)'
      },
      {
        id: 'rek-khitan-2',
        bank: 'Bank Syariah Indonesia (BSI)',
        noRek: '7112348901',
        atasNama: 'Siti Nurjanah (Ibu)'
      }
    ],
    alamatKado: 'Jl. Kenanga No. 8, Tasikmalaya (U.p. Ananda Rafi Alfarizki)'
  },
  
  musik: {
    enabled: true,
    autoplay: false,
    judulLagu: 'Kedamaian Hati (Syahdu Flute & Gambus)',
    artis: 'ForestMusic (This Ramadan Instrumental)',
    audioUrl: '/audio/syahdu-khitan.mp3'
  },
  
  tema: {
    temaId: 'royal-navy-khitan',
    namaTema: 'Royal Islamic Blue & Gold',
    warnaUtama: '#0E3B68', // Deep Islamic Royal Blue
    warnaLatar: '#F0F6FC', // Sky Blue Parchment
    warnaAksen: '#D4AF37', // Brilliant Gold
    fontJudul: 'Playfair Display',
    fontIsi: 'Plus Jakarta Sans',
    ornamen: 'islamic-arch',
    styleTampilan: 'islamic-arch',
    modeNavigasi: 'flipbook',
    teksturKertas: 'linen',
    efekPartikel: 'stars',
    suaraKertas: true
  }
};

// =========================================================================
// 3. TEMPLATE UNDANGAN ULANG TAHUN (BIRTHDAY PARTY DINDA PERMATA)
// =========================================================================
export const defaultBirthdayConfig: WeddingConfig = {
  kategori: 'ulang-tahun',
  kerangkaDesain: 'birthday-festive',
  slug: 'dinda-permata',
  judulUndangan: 'Birthday Party - Dinda Permata is turning 10!',
  labelSampul: "YOU'RE INVITED!",
  fotoSampul: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
  subJudulSampul: 'Join us to celebrate Dinda Permata is turning 10! Rayakan kebahagiaan bersama orang-orang terdekat.',
  teksTombol: 'RSVP Sekarang',
  salamPembuka: 'Hai Teman-teman & Keluarga Tercinta!\nKalian diundang untuk merayakan hari ulang tahunku yang ke-10 dengan penuh tawa, kue manis, dan berbagai permainan seru!',
  kutipanAwal: 'Satu dekade penuh keceriaan, kasih sayang, dan tawa manis bersama keluarga & sahabat.',
  kutipanAkhir: '“Terima kasih telah menjadi bagian dari hari istimewa ini ♥”',
  
  // Profil Ulang Tahun
  ulangTahun: {
    namaLengkap: 'Dinda Permata Azzahra',
    namaPanggilan: 'Dinda',
    usiaKe: '10',
    foto: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=600&q=80',
    temaPesta: 'Sweet Confetti & Colorful Joy',
    namaOrtu: 'Bapak Rian & Ibu Maya'
  },
  
  pria: {
    namaLengkap: 'Dinda Permata',
    namaPanggilan: 'Dinda',
    namaAyah: 'Bapak Rian Hidayat',
    namaIbu: 'Ibu Maya Lestari',
    foto: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=600&q=80'
  },
  wanita: {
    namaLengkap: 'Dinda Permata',
    namaPanggilan: 'Dinda',
    namaAyah: 'Bapak Rian Hidayat',
    namaIbu: 'Ibu Maya Lestari',
    foto: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=600&q=80'
  },
  
  tanggalResmi: '21 Desember 2025',
  hariTanggalLengkap: 'Sabtu, 21 Desember 2025',
  tanggalCountdownIso: '2025-12-21T16:00:00',
  
  acaraList: [
    {
      id: 'party-event',
      judul: 'Pesta Ulang Tahun & Games',
      hariTanggal: 'Sabtu, 21 Desember 2025',
      waktu: '16.00 WIB - Selesai',
      zonaWaktu: 'WIB',
      tempat: 'Rumah Kami / Backyard Garden',
      alamat: 'Jl. Anggrek No. 5, Tasikmalaya',
      linkMaps: 'https://maps.google.com/?q=Tasikmalaya',
      deskripsi: 'Keseruan games berhadiah, pertunjukan sulap mini, tiup lilin bersama, dan pembagian bingkisan seru!'
    }
  ],
  
  infoTambahan: [
    {
      id: 'dresscode',
      icon: 'shirt',
      judul: 'Dresscode Ceria',
      deskripsi: 'Pakailah pakaian bernuansa pastel atau warna ceria favoritmu!'
    },
    {
      id: 'snack',
      icon: 'utensils',
      judul: 'Snack & Es Krim',
      deskripsi: 'Berbagai camilan lezat, cupcake, dan es krim warna-warni menunggumu!'
    }
  ],
  
  kisahCinta: {
    enabled: false,
    ceritaList: []
  },
  
  galeri: {
    enabled: true,
    deskripsi: 'Momen-momen lucu dan ceria tumbuh kembang Dinda hingga usia 10 tahun.',
    fotoList: [
      'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80'
    ]
  },
  
  lokasi: {
    namaTempat: 'Rumah Kami',
    alamatLengkap: 'Jl. Anggrek No. 5, Tasikmalaya',
    googleMapsUrl: 'https://maps.google.com/?q=Jl+Anggrek+No+5+Tasikmalaya',
    embedMapsUrl: ''
  },
  
  rsvp: {
    enabled: true,
    deadline: '18 Desember 2025',
    pesanCatatan: 'Tolong konfirmasi kehadiranmu ya teman-teman agar kami bisa menyiapkan goody bag spesial untukmu!'
  },
  
  bukuTamu: {
    enabled: true,
    subJudul: 'Tuliskan ucapan selamat ulang tahun dan harapan manismu untuk Dinda!'
  },
  
  amplopDigital: {
    enabled: true,
    deskripsi: 'Kado dan senyuman teman-teman adalah hadiah terbaik. Namun jika ingin mengirimkan tanda kasih / wishlist kado:',
    rekeningList: [
      {
        id: 'rek-ultah-1',
        bank: 'BCA (Mama Dinda)',
        noRek: '7890123456',
        atasNama: 'Maya Lestari'
      }
    ],
    alamatKado: 'Jl. Anggrek No. 5, Tasikmalaya (U.p. Dinda Permata - Hadiah Ultah)'
  },
  
  musik: {
    enabled: true,
    autoplay: false,
    judulLagu: 'Happy Celebration & Joyful Acoustic',
    artis: 'Sunlit Children Celebration',
    audioUrl: '/audio/happy-birthday.mp3'
  },
  
  tema: {
    temaId: 'festive-coral',
    namaTema: 'Sweet Coral & Gold Party',
    warnaUtama: '#E11D48', // Vibrant Rose Pink
    warnaLatar: '#FFF9F9', // Light Warm Pastel
    warnaAksen: '#F59E0B', // Warm Confetti Gold
    fontJudul: 'Great Vibes',
    fontIsi: 'Plus Jakarta Sans',
    ornamen: 'party-balloons',
    styleTampilan: 'festive-birthday',
    modeNavigasi: 'flipbook',
    teksturKertas: 'watercolor-matte',
    efekPartikel: 'balloons',
    suaraKertas: true
  }
};

// =========================================================================
// PRESET PROJECTS (MULTI-CATEGORY)
// =========================================================================
export const defaultProjectsList: WeddingProject[] = [
  {
    id: 'MS-7B93E2A',
    kategori: 'pernikahan',
    mempelai: 'Raka & Sinta',
    tanggal: '23 November 2025',
    status: 'Aktif',
    dibuatPada: new Date('2025-10-15T10:00:00Z'),
    clientEmail: 'raka.sinta@gmail.com',
    config: defaultWeddingConfig
  },
  {
    id: 'MS-KHITAN01',
    kategori: 'khitan',
    mempelai: 'Rafi Alfarizki',
    tanggal: '15 Desember 2025',
    status: 'Aktif',
    dibuatPada: new Date('2025-10-19T08:00:00Z'),
    clientEmail: 'ahmad.fauzi@gmail.com',
    config: defaultKhitanConfig
  },
  {
    id: 'MS-ULTAH01',
    kategori: 'ulang-tahun',
    mempelai: 'Dinda Permata',
    tanggal: '21 Desember 2025',
    status: 'Aktif',
    dibuatPada: new Date('2025-10-20T11:00:00Z'),
    clientEmail: 'rian.maya@gmail.com',
    config: defaultBirthdayConfig
  },
  {
    id: 'MS-A41F90C',
    kategori: 'pernikahan',
    mempelai: 'Dimas & Anisa',
    tanggal: '12 Desember 2025',
    status: 'Aktif',
    dibuatPada: new Date('2025-10-18T14:30:00Z'),
    clientEmail: 'dimas.anisa@gmail.com',
    config: {
      ...defaultWeddingConfig,
      slug: 'dimas-anisa',
      judulUndangan: 'The Wedding of Dimas & Anisa',
      tanggalResmi: '12 Desember 2025',
      hariTanggalLengkap: 'Jumat, 12 Desember 2025'
    }
  }
];
