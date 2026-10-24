/**
 * Preset Royalty-Free Wedding and Event Background Music Library
 * High-quality, safe, and universally accessible audio streams.
 */

export interface AudioPreset {
  id: string;
  judul: string;
  artis: string;
  kategori: 'pernikahan' | 'khitan' | 'ulang-tahun' | 'umum';
  durasi: string;
  url: string;
  deskripsi: string;
}

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'canon-d-piano',
    judul: 'Canon in D (Romantic Piano)',
    artis: 'Johann Pachelbel (Acoustic Arr.)',
    kategori: 'pernikahan',
    durasi: '3:20',
    url: '/audio/canon-in-d.mp3',
    deskripsi: 'Alunan piano lembut klasik paling populer untuk prosesi akad dan resepsi pernikahan'
  },
  {
    id: 'acoustic-wedding-vibe',
    judul: 'Beautiful Acoustic Wedding Promise',
    artis: 'Acoustic Morning Melody',
    kategori: 'pernikahan',
    durasi: '2:45',
    url: '/audio/acoustic-wedding.mp3',
    deskripsi: 'Petikan gitar akustik hangat dan menenangkan dengan nuansa romantis syahdu'
  },
  {
    id: 'sweet-memories-cello',
    judul: 'A Thousand Moments (Piano & Strings)',
    artis: 'Melodic Symphony',
    kategori: 'pernikahan',
    durasi: '3:10',
    url: '/audio/thousand-moments.mp3',
    deskripsi: 'Sentuhan instrumen gesek biola dan piano yang megah, elegan, dan emosional'
  },
  {
    id: 'islamic-peaceful-khitan',
    judul: 'Kedamaian Hati (Syahdu Flute & Gambus)',
    artis: 'ForestMusic (This Ramadan Instrumental)',
    kategori: 'khitan',
    durasi: '2:55',
    url: '/audio/syahdu-khitan.mp3',
    deskripsi: 'Irama seruling dan petikan gambus khas Timur Tengah yang tenang dan berkah'
  },
  {
    id: 'birthday-joy-happy',
    judul: 'Happy Celebration & Joyful Acoustic',
    artis: 'Sunlit Children Celebration',
    kategori: 'ulang-tahun',
    durasi: '2:15',
    url: '/audio/happy-birthday.mp3',
    deskripsi: 'Melodi riang, ceria, dan penuh kebahagiaan untuk pesta ulang tahun anak atau remaja'
  },
  {
    id: 'lofi-cozy-wedding',
    judul: 'Sunset Romance (Lofi Chill Beat)',
    artis: 'Muza Production (Cafe Bagdad)',
    kategori: 'umum',
    durasi: '2:30',
    url: '/audio/lofi-wedding.mp3',
    deskripsi: 'Beat santai modern aesthetic yang kekinian dan tidak membosankan'
  }
];

/**
 * Reads a local audio file and returns a base64 data URL with size validation.
 * @param file The audio File object from <input type="file">
 * @param maxSizeBytes Maximum file size in bytes (defaults to 6MB)
 */
export async function readLocalAudioFile(
  file: File,
  maxSizeBytes: number = 6 * 1024 * 1024
): Promise<{ success: boolean; dataUrl?: string; error?: string; sizeFormatted: string }> {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const sizeFormatted = `${sizeMb} MB`;

  if (file.size > maxSizeBytes) {
    return {
      success: false,
      sizeFormatted,
      error: `Ukuran file audio terlalu besar (${sizeFormatted}). Disarankan maksimal 6 MB agar undangan tidak berat saat dibuka para tamu.`
    };
  }

  // Allowed audio MIME types
  const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'];
  const isValidType = validTypes.includes(file.type) || /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);

  if (!isValidType) {
    return {
      success: false,
      sizeFormatted,
      error: 'Format audio harus berupa MP3, M4A, WAV, atau AAC.'
    };
  }

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        success: true,
        dataUrl: reader.result as string,
        sizeFormatted
      });
    };
    reader.onerror = () => {
      resolve({
        success: false,
        sizeFormatted,
        error: 'Gagal membaca file audio. Silakan coba file lain.'
      });
    };
    reader.readAsDataURL(file);
  });
}
