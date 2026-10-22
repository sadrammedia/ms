import { WeddingProject, WeddingConfig } from '../types/wedding';

export const defaultWeddingConfig: WeddingConfig = {
  slug: 'raka-sinta',
  judulUndangan: 'The Wedding of Raka & Sinta',
  labelSampul: 'THE WEDDING OF',
  fotoSampul: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  subJudulSampul: 'Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami.',
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
    videoUrl: ''
  },
  
  lokasi: {
    namaTempat: 'Gedung Serbaguna Harmoni',
    alamatLengkap: 'Jl. Melati No. 12, Cidadap, Kota Bandung, Jawa Barat 40142',
    googleMapsUrl: 'https://maps.google.com/?q=Bandung+Gedung+Serbaguna',
    embedMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.5634786224!2d107.573116!3d-6.903444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e0f5f0!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1650000000000!5m2!1sen!2sid'
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
    alamatKado: 'Jl. Melati No. 12, Cidadap, Kota Bandung, Jawa Barat (Penerima: Raka & Sinta)'
  },
  
  musik: {
    enabled: true,
    autoplay: false,
    judulLagu: 'A Thousand Years (Instrumental Acoustic)',
    artis: 'The Piano Guys & Cello',
    // High quality royalty-free romantic wedding acoustic piano
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-acoustic-guitar-112191.mp3'
  },
  
  tema: {
    temaId: 'elegant-botanical',
    namaTema: 'Elegant Botanical',
    warnaUtama: '#1F362D', // Deep Emerald Forest
    warnaLatar: '#FAF7F2', // Soft Cream Parchment
    warnaAksen: '#C5A059', // Soft Gold
    fontJudul: 'Great Vibes',
    fontIsi: 'Plus Jakarta Sans',
    ornamen: 'botanical-leaves'
  }
};

export const defaultProjectsList: WeddingProject[] = [
  {
    id: 'MS-7B93E2A',
    mempelai: 'Raka & Sinta',
    tanggal: '23 November 2025',
    status: 'Aktif',
    dibuatPada: new Date('2025-10-15T10:00:00Z'),
    clientEmail: 'raka.sinta@gmail.com',
    config: defaultWeddingConfig
  },
  {
    id: 'MS-A41F90C',
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
      hariTanggalLengkap: 'Jumat, 12 Desember 2025',
      pria: {
        ...defaultWeddingConfig.pria,
        namaLengkap: 'Dimas Setiawan, S.Kom.',
        namaPanggilan: 'Dimas',
        namaAyah: 'Bapak H. Hendra Setiawan',
        namaIbu: 'Ibu Hj. Rina Marlina'
      },
      wanita: {
        ...defaultWeddingConfig.wanita,
        namaLengkap: 'Anisa Rahmawati, S.Farm.',
        namaPanggilan: 'Anisa',
        namaAyah: 'Bapak Ir. Bambang Tri',
        namaIbu: 'Ibu Sri Wahyuni'
      }
    }
  },
  {
    id: 'MS-E882C15',
    mempelai: 'Fahmi & Nadya',
    tanggal: '18 Januari 2026',
    status: 'Draf',
    dibuatPada: new Date('2025-10-21T09:15:00Z'),
    clientEmail: 'fahmi.nadya@gmail.com',
    config: {
      ...defaultWeddingConfig,
      slug: 'fahmi-nadya',
      judulUndangan: 'The Wedding of Fahmi & Nadya',
      tanggalResmi: '18 Januari 2026',
      hariTanggalLengkap: 'Minggu, 18 Januari 2026'
    }
  }
];
