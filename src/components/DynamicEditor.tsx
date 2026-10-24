import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  Smartphone, 
  Monitor, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Calendar, 
  Heart, 
  Music, 
  Sliders, 
  FileText, 
  MapPin, 
  Share2,
  ArrowLeft,
  Cake,
  Star,
  BookOpen,
  Loader2
} from 'lucide-react';
import { WeddingProject, WeddingConfig, LoveStoryItem, WeddingEvent, InvitationCategory } from '../types/wedding';
import { updateProject } from '../services/firebase';
import { InvitationView } from './InvitationView';
import { compressImage, measureDataSize } from '../utils/imageCompressor';

interface DynamicEditorProps {
  project: WeddingProject;
  onSaveSuccess: (updated: WeddingProject) => void;
  onBack: () => void;
}

export const DynamicEditor: React.FC<DynamicEditorProps> = ({
  project,
  onSaveSuccess,
  onBack
}) => {
  // Local editable copy of the wedding config
  const [formData, setFormData] = useState<WeddingConfig>({ 
    ...project.config,
    kategori: project.config.kategori || project.kategori || 'pernikahan'
  });
  const [projectMempelai, setProjectMempelai] = useState(project.mempelai);
  const [projectTanggal, setProjectTanggal] = useState(formData.tanggalResmi || project.tanggal || '23 November 2025');
  const [projectStatus, setProjectStatus] = useState(project.status);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'teks' | 'mempelai' | 'acara' | 'galeri' | 'cerita' | 'toggles' | 'tema' | 'musik'>('mempelai');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [compressionStatus, setCompressionStatus] = useState<string | null>(null);

  const isKhitan = formData.kategori === 'khitan';
  const isBirthday = formData.kategori === 'ulang-tahun';
  const isWedding = !isKhitan && !isBirthday;

  // Helper to handle image uploads via File Input with automatic Canvas compression
  // Prevents Firestore document > 1MB limits by resizing & optimizing photos to ~30KB - 75KB
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64Url: string) => void,
    compressOpts?: { maxWidth?: number; maxHeight?: number; maxSizeBytes?: number }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      setCompressionStatus('Mengoptimalkan foto...');

      const compressed = await compressImage(file, {
        maxWidth: compressOpts?.maxWidth || 1200,
        maxHeight: compressOpts?.maxHeight || 1200,
        quality: 0.72,
        maxSizeBytes: compressOpts?.maxSizeBytes || 75 * 1024
      });

      const kb = Math.round(measureDataSize(compressed) / 1024);
      setCompressionStatus(`Foto dioptimalkan (${kb} KB) ✓`);
      setTimeout(() => setCompressionStatus(null), 3000);

      onSuccess(compressed);
    } catch (err) {
      console.error('Gagal mengompres gambar:', err);
      alert('Gagal memproses gambar. Silakan coba lagi dengan foto yang berbeda.');
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

  // Add gallery photo
  const handleAddGalleryPhoto = (url: string) => {
    if (!url.trim()) return;
    setFormData(prev => ({
      ...prev,
      galeri: {
        ...prev.galeri,
        fotoList: [...prev.galeri.fotoList, url.trim()]
      }
    }));
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galeri: {
        ...prev.galeri,
        fotoList: prev.galeri.fotoList.filter((_, idx) => idx !== index)
      }
    }));
  };

  // Love Story handlers
  const handleAddStory = () => {
    const newStory: LoveStoryItem = {
      id: 'story-' + Date.now(),
      tahun: new Date().getFullYear().toString(),
      judul: 'Momen Baru',
      cerita: 'Tuliskan kisah indah di balik momen ini...'
    };
    setFormData(prev => ({
      ...prev,
      kisahCinta: {
        ...prev.kisahCinta,
        ceritaList: [...prev.kisahCinta.ceritaList, newStory]
      }
    }));
  };

  const handleRemoveStory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      kisahCinta: {
        ...prev.kisahCinta,
        ceritaList: prev.kisahCinta.ceritaList.filter((_, idx) => idx !== index)
      }
    }));
  };

  // Save changes & publish
  const handleSave = async (statusOverride?: 'Aktif' | 'Draf') => {
    setIsSaving(true);
    const newStatus = statusOverride || projectStatus;

    let computedName = projectMempelai;
    if (isKhitan) {
      computedName = formData.anak?.namaPanggilan || formData.anak?.namaLengkap || projectMempelai;
    } else if (isBirthday) {
      computedName = formData.ulangTahun?.namaPanggilan || formData.ulangTahun?.namaLengkap || projectMempelai;
    } else {
      const couple = `${formData.pria.namaPanggilan} & ${formData.wanita.namaPanggilan}`.trim();
      computedName = couple || projectMempelai;
    }

    const currentTanggal = formData.tanggalResmi || projectTanggal;
    const currentHariTanggal = formData.hariTanggalLengkap || currentTanggal;

    // Synchronize dates to all agenda events so published cards never remain on old dates
    const syncedAcaraList = formData.acaraList.map(item => ({
      ...item,
      hariTanggal: item.hariTanggal || currentHariTanggal
    }));

    // Synchronize location:
    // If user edited an event venue or filled in specific values,
    // ensure effective main venue & address are synced to formData.lokasi
    let effectiveNamaTempat = formData.lokasi?.namaTempat || '';
    let effectiveAlamatLengkap = formData.lokasi?.alamatLengkap || '';

    // Check if user changed an event in acaraList and lokasi is still the default Bandung template
    const lastEvent = formData.acaraList[formData.acaraList.length - 1];
    const firstEvent = formData.acaraList[0];
    const candidateEvent = (lastEvent?.tempat && lastEvent.tempat !== 'Gedung Serbaguna Harmoni')
      ? lastEvent
      : (firstEvent?.tempat && firstEvent.tempat !== 'Gedung Serbaguna Harmoni' ? firstEvent : null);

    if (
      (!effectiveNamaTempat || effectiveNamaTempat === 'Gedung Serbaguna Harmoni') &&
      candidateEvent?.tempat
    ) {
      effectiveNamaTempat = candidateEvent.tempat;
      effectiveAlamatLengkap = candidateEvent.alamat || effectiveAlamatLengkap;
    }

    const mapQuery = [effectiveNamaTempat, effectiveAlamatLengkap].filter(Boolean).join(' ').trim();
    let effectiveEmbed = formData.lokasi?.embedMapsUrl || '';

    const isBandungEmbed = effectiveEmbed && (
      effectiveEmbed.includes('Bandung%2C%20Bandung') ||
      effectiveEmbed.includes('0x2e68e6398252477f')
    );

    if (!effectiveEmbed || (isBandungEmbed && mapQuery && !mapQuery.toLowerCase().includes('bandung'))) {
      if (mapQuery) {
        effectiveEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }

    const finalLokasi = {
      ...formData.lokasi,
      namaTempat: effectiveNamaTempat || formData.lokasi?.namaTempat || 'Lokasi Acara',
      alamatLengkap: effectiveAlamatLengkap || formData.lokasi?.alamatLengkap || '',
      embedMapsUrl: effectiveEmbed,
      googleMapsUrl: formData.lokasi?.googleMapsUrl || (candidateEvent?.linkMaps || (mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}` : ''))
    };

    const finalConfig: WeddingConfig = {
      ...formData,
      tanggalResmi: currentTanggal,
      hariTanggalLengkap: currentHariTanggal,
      acaraList: syncedAcaraList,
      lokasi: finalLokasi
    };

    const updatedProject: WeddingProject = {
      ...project,
      kategori: finalConfig.kategori,
      mempelai: computedName,
      tanggal: currentTanggal,
      status: newStatus,
      config: finalConfig
    };

    try {
      await updateProject(project.id, {
        kategori: finalConfig.kategori,
        mempelai: updatedProject.mempelai,
        tanggal: updatedProject.tanggal,
        status: newStatus,
        config: finalConfig
      });

      setFormData(finalConfig);
      setProjectStatus(newStatus);
      setProjectMempelai(updatedProject.mempelai);
      setProjectTanggal(currentTanggal);
      onSaveSuccess(updatedProject);
      setSaveToast(`Perubahan berhasil disimpan & dipublikasikan!`);
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      console.error('Save error in DynamicEditor:', err);
      alert(`Gagal menyimpan perubahan: ${err.message || 'Koneksi bermasalah'}. Data tersimpan di memori lokal.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute live location for the preview pane
  const previewNamaTempat = formData.lokasi?.namaTempat || formData.acaraList?.[formData.acaraList.length - 1]?.tempat || formData.acaraList?.[0]?.tempat || 'Lokasi Acara';
  const previewAlamat = formData.lokasi?.alamatLengkap || formData.acaraList?.[formData.acaraList.length - 1]?.alamat || formData.acaraList?.[0]?.alamat || '';
  const previewMapQuery = [previewNamaTempat, previewAlamat].filter(Boolean).join(' ').trim();
  const isPreviewBandungEmbed = formData.lokasi?.embedMapsUrl && (
    formData.lokasi.embedMapsUrl.includes('Bandung%2C%20Bandung') ||
    formData.lokasi.embedMapsUrl.includes('0x2e68e6398252477f')
  );
  const previewEmbedUrl = (!formData.lokasi?.embedMapsUrl || (isPreviewBandungEmbed && previewMapQuery && !previewMapQuery.toLowerCase().includes('bandung')))
    ? (previewMapQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(previewMapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : formData.lokasi?.embedMapsUrl)
    : formData.lokasi?.embedMapsUrl;

  const dummyProjectForPreview: WeddingProject = {
    ...project,
    kategori: formData.kategori,
    mempelai: isKhitan 
      ? (formData.anak?.namaPanggilan || formData.anak?.namaLengkap || projectMempelai)
      : isBirthday 
      ? (formData.ulangTahun?.namaPanggilan || formData.ulangTahun?.namaLengkap || projectMempelai)
      : `${formData.pria.namaPanggilan || 'Raka'} & ${formData.wanita.namaPanggilan || 'Sinta'}`,
    tanggal: formData.tanggalResmi,
    status: projectStatus,
    config: {
      ...formData,
      lokasi: {
        ...formData.lokasi,
        namaTempat: previewNamaTempat,
        alamatLengkap: previewAlamat,
        embedMapsUrl: previewEmbedUrl
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Editor Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Editor Undangan:</span>
              <span className="font-serif text-[#1F362D]">{projectMempelai}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 uppercase">
                {formData.kategori === 'khitan' ? '🕌 Khitan' : formData.kategori === 'ulang-tahun' ? '🎂 Ulang Tahun' : '💍 Pernikahan'}
              </span>
            </h1>
            <span className="text-[11px] text-slate-400">ID Proyek: {project.id}</span>
          </div>
        </div>

        {/* Status Toast notifications */}
        <div className="flex items-center gap-2">
          {compressionStatus && (
            <div className="bg-amber-600 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 font-medium animate-fade-in">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{compressionStatus}</span>
            </div>
          )}
          {saveToast && (
            <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{saveToast}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Device toggle for preview */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Smartphone (Mobile)"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Layar Penuh"
            >
              <Monitor className="w-4 h-4" />
              <span>Desktop</span>
            </button>
          </div>

          <button
            onClick={() => handleSave('Draf')}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Simpan Draf
          </button>

          <button
            onClick={() => handleSave('Aktif')}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#DFBF7A]" />
            <span>{isSaving ? 'Menyimpan...' : 'Publikasikan'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Controls Panel */}
        <div className="w-full md:w-[480px] lg:w-[540px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xs">
          
          {/* Category Selector Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Kategori Format Undangan</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pernikahan', label: '💍 Pernikahan', sample: 'Wedding' },
                { id: 'khitan', label: '🕌 Khitan', sample: 'Tasyakuran' },
                { id: 'ulang-tahun', label: '🎂 Ulang Tahun', sample: 'Birthday' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    const newCat = cat.id as InvitationCategory;
                    setFormData(prev => ({
                      ...prev,
                      kategori: newCat,
                      labelSampul: newCat === 'khitan' ? 'TASYAKURAN KHITAN' : newCat === 'ulang-tahun' ? "YOU'RE INVITED!" : 'THE WEDDING OF',
                      teksTombol: newCat === 'khitan' ? 'Konfirmasi Kehadiran' : newCat === 'ulang-tahun' ? 'RSVP Sekarang' : 'Buka Undangan',
                      tema: {
                        ...prev.tema,
                        styleTampilan: newCat === 'khitan' ? 'islamic-arch' : newCat === 'ulang-tahun' ? 'festive-birthday' : 'classic-botanical',
                        warnaUtama: newCat === 'khitan' ? '#0E3B68' : newCat === 'ulang-tahun' ? '#E11D48' : prev.tema.warnaUtama,
                        warnaAksen: newCat === 'khitan' ? '#D4AF37' : newCat === 'ulang-tahun' ? '#F59E0B' : prev.tema.warnaAksen,
                        warnaLatar: newCat === 'khitan' ? '#F0F6FC' : newCat === 'ulang-tahun' ? '#FFF9F9' : prev.tema.warnaLatar
                      }
                    }));
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center cursor-pointer ${
                    (formData.kategori || 'pernikahan') === cat.id
                      ? 'bg-[#1F362D] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">{cat.label}</span>
                  <span className="text-[9px] opacity-75">{cat.sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/70 p-2 gap-1 custom-scrollbar shrink-0">
            {[
              { id: 'mempelai', label: isKhitan ? 'Profil Ananda' : isBirthday ? 'Profil Ultah' : 'Mempelai', icon: isBirthday ? Cake : isKhitan ? Star : Heart },
              { id: 'teks', label: 'Sampul & Teks', icon: FileText },
              { id: 'acara', label: 'Acara & Peta', icon: Calendar },
              { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon },
              ...(isWedding ? [{ id: 'cerita', label: 'Kisah Cinta', icon: Sparkles }] : []),
              { id: 'toggles', label: 'Bagian Aktif', icon: Sliders },
              { id: 'tema', label: 'Tema & Desain', icon: Sliders },
              { id: 'musik', label: 'Musik Latar', icon: Music },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-[#1F362D] font-bold shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
            
            {/* TAB: PROFIL (MEMPELAI / KHITAN / ULANG TAHUN) */}
            {activeTab === 'mempelai' && (
              <div className="space-y-6">
                {isKhitan ? (
                  /* KHITAN PROFILE INPUTS */
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900 mb-1">Profil Ananda Yang Dikhitan</h3>
                    <p className="text-slate-500 text-[11px] mb-3">Informasi lengkap ananda dan doa restu</p>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Nama Lengkap Ananda</label>
                        <input
                          type="text"
                          value={formData.anak?.namaLengkap || ''}
                          onChange={e => setFormData({
                            ...formData,
                            anak: { ...formData.anak, namaLengkap: e.target.value } as any
                          })}
                          placeholder="Cth: Rafi Alfarizki Pratama"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Panggilan</label>
                          <input
                            type="text"
                            value={formData.anak?.namaPanggilan || ''}
                            onChange={e => setFormData({
                              ...formData,
                              anak: { ...formData.anak, namaPanggilan: e.target.value } as any
                            })}
                            placeholder="Cth: Rafi"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Usia Saat Ini</label>
                          <input
                            type="text"
                            value={formData.anak?.usia || ''}
                            onChange={e => setFormData({
                              ...formData,
                              anak: { ...formData.anak, usia: e.target.value } as any
                            })}
                            placeholder="Cth: 10 Tahun"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Ayah</label>
                          <input
                            type="text"
                            value={formData.anak?.namaAyah || ''}
                            onChange={e => setFormData({
                              ...formData,
                              anak: { ...formData.anak, namaAyah: e.target.value } as any
                            })}
                            placeholder="Bapak H. Ahmad Fauzi"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Ibu</label>
                          <input
                            type="text"
                            value={formData.anak?.namaIbu || ''}
                            onChange={e => setFormData({
                              ...formData,
                              anak: { ...formData.anak, namaIbu: e.target.value } as any
                            })}
                            placeholder="Ibu Hj. Siti Nurjanah"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Foto Ananda (URL atau Unggah)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.anak?.foto || ''}
                            onChange={e => setFormData({
                              ...formData,
                              anak: { ...formData.anak, foto: e.target.value } as any
                            })}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                            placeholder="https://..."
                          />
                          <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shrink-0 font-medium flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, url => {
                                setFormData({
                                  ...formData,
                                  anak: { ...formData.anak, foto: url } as any
                                });
                              })}
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Doa Walimatul Khitan</label>
                        <textarea
                          rows={2}
                          value={formData.anak?.doaKhitan || ''}
                          onChange={e => setFormData({
                            ...formData,
                            anak: { ...formData.anak, doaKhitan: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          placeholder="Ya Allah, jadikanlah ananda anak yang sholeh..."
                        />
                      </div>
                    </div>
                  </div>
                ) : isBirthday ? (
                  /* BIRTHDAY PROFILE INPUTS */
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900 mb-1">Profil Bintang Ulang Tahun</h3>
                    <p className="text-slate-500 text-[11px] mb-3">Informasi lengkap anak yang berulang tahun</p>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          value={formData.ulangTahun?.namaLengkap || ''}
                          onChange={e => setFormData({
                            ...formData,
                            ulangTahun: { ...formData.ulangTahun, namaLengkap: e.target.value } as any
                          })}
                          placeholder="Cth: Dinda Permata Azzahra"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Panggilan</label>
                          <input
                            type="text"
                            value={formData.ulangTahun?.namaPanggilan || ''}
                            onChange={e => setFormData({
                              ...formData,
                              ulangTahun: { ...formData.ulangTahun, namaPanggilan: e.target.value } as any
                            })}
                            placeholder="Cth: Dinda"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Merayakan Ulang Tahun Ke-</label>
                          <input
                            type="text"
                            value={formData.ulangTahun?.usiaKe || ''}
                            onChange={e => setFormData({
                              ...formData,
                              ulangTahun: { ...formData.ulangTahun, usiaKe: e.target.value } as any
                            })}
                            placeholder="Cth: 10"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Nama Orang Tua</label>
                        <input
                          type="text"
                          value={formData.ulangTahun?.namaOrtu || ''}
                          onChange={e => setFormData({
                            ...formData,
                            ulangTahun: { ...formData.ulangTahun, namaOrtu: e.target.value } as any
                          })}
                          placeholder="Bapak Rian & Ibu Maya"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Tema Pesta</label>
                        <input
                          type="text"
                          value={formData.ulangTahun?.temaPesta || ''}
                          onChange={e => setFormData({
                            ...formData,
                            ulangTahun: { ...formData.ulangTahun, temaPesta: e.target.value } as any
                          })}
                          placeholder="Sweet Confetti & Colorful Joy"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">Foto Bintang Pesta (URL atau Unggah)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.ulangTahun?.foto || ''}
                            onChange={e => setFormData({
                              ...formData,
                              ulangTahun: { ...formData.ulangTahun, foto: e.target.value } as any
                            })}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                            placeholder="https://..."
                          />
                          <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shrink-0 font-medium flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, url => {
                                setFormData({
                                  ...formData,
                                  ulangTahun: { ...formData.ulangTahun, foto: url } as any
                                });
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* WEDDING PROFILE INPUTS (Groom & Bride) */
                  <>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-900 mb-1">Profil Mempelai Pria</h3>
                      <p className="text-slate-500 text-[11px] mb-3">Informasi lengkap calon mempelai pria</p>
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={formData.pria.namaLengkap}
                            onChange={e => setFormData({
                              ...formData,
                              pria: { ...formData.pria, namaLengkap: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Panggilan</label>
                            <input
                              type="text"
                              value={formData.pria.namaPanggilan}
                              onChange={e => setFormData({
                                ...formData,
                                pria: { ...formData.pria, namaPanggilan: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Instagram</label>
                            <input
                              type="text"
                              value={formData.pria.instagram || ''}
                              onChange={e => setFormData({
                                ...formData,
                                pria: { ...formData.pria, instagram: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Ayah</label>
                            <input
                              type="text"
                              value={formData.pria.namaAyah}
                              onChange={e => setFormData({
                                ...formData,
                                pria: { ...formData.pria, namaAyah: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Ibu</label>
                            <input
                              type="text"
                              value={formData.pria.namaIbu}
                              onChange={e => setFormData({
                                ...formData,
                                pria: { ...formData.pria, namaIbu: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Foto Mempelai Pria (URL atau Unggah)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formData.pria.foto}
                              onChange={e => setFormData({
                                ...formData,
                                pria: { ...formData.pria, foto: e.target.value }
                              })}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                              placeholder="https://..."
                            />
                            <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shrink-0 font-medium flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Unggah</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileUpload(e, url => {
                                  setFormData({
                                    ...formData,
                                    pria: { ...formData.pria, foto: url }
                                  });
                                })}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-900 mb-1">Profil Mempelai Wanita</h3>
                      <p className="text-slate-500 text-[11px] mb-3">Informasi lengkap calon mempelai wanita</p>
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={formData.wanita.namaLengkap}
                            onChange={e => setFormData({
                              ...formData,
                              wanita: { ...formData.wanita, namaLengkap: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Panggilan</label>
                            <input
                              type="text"
                              value={formData.wanita.namaPanggilan}
                              onChange={e => setFormData({
                                ...formData,
                                wanita: { ...formData.wanita, namaPanggilan: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Instagram</label>
                            <input
                              type="text"
                              value={formData.wanita.instagram || ''}
                              onChange={e => setFormData({
                                ...formData,
                                wanita: { ...formData.wanita, instagram: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Ayah</label>
                            <input
                              type="text"
                              value={formData.wanita.namaAyah}
                              onChange={e => setFormData({
                                ...formData,
                                wanita: { ...formData.wanita, namaAyah: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-medium mb-1">Nama Ibu</label>
                            <input
                              type="text"
                              value={formData.wanita.namaIbu}
                              onChange={e => setFormData({
                                ...formData,
                                wanita: { ...formData.wanita, namaIbu: e.target.value }
                              })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-600 font-medium mb-1">Foto Mempelai Wanita (URL atau Unggah)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formData.wanita.foto}
                              onChange={e => setFormData({
                                ...formData,
                                wanita: { ...formData.wanita, foto: e.target.value }
                              })}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                              placeholder="https://..."
                            />
                            <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shrink-0 font-medium flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Unggah</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleFileUpload(e, url => {
                                  setFormData({
                                    ...formData,
                                    wanita: { ...formData.wanita, foto: url }
                                  });
                                })}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: SAMPUL & TEKS */}
            {activeTab === 'teks' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Label Sampul</label>
                  <input
                    type="text"
                    value={formData.labelSampul}
                    onChange={e => setFormData({ ...formData, labelSampul: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    placeholder="THE WEDDING OF / TASYAKURAN KHITAN"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Teks Tombol CTA Sampul</label>
                  <input
                    type="text"
                    value={formData.teksTombol || ''}
                    onChange={e => setFormData({ ...formData, teksTombol: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    placeholder="Buka Undangan / Konfirmasi Kehadiran / RSVP Sekarang"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Foto Sampul Utama (URL atau Unggah)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.fotoSampul}
                      onChange={e => setFormData({ ...formData, fotoSampul: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                    />
                    <label className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer shrink-0 font-medium flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, url => setFormData({ ...formData, fotoSampul: url }))}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Subjudul / Pesan Pembuka Sampul</label>
                  <textarea
                    rows={2}
                    value={formData.subJudulSampul}
                    onChange={e => setFormData({ ...formData, subJudulSampul: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Kutipan / Kalimat Indah Awal</label>
                  <textarea
                    rows={2}
                    value={formData.kutipanAwal}
                    onChange={e => setFormData({ ...formData, kutipanAwal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Kutipan / Doa Penutup</label>
                  <textarea
                    rows={2}
                    value={formData.kutipanAkhir}
                    onChange={e => setFormData({ ...formData, kutipanAkhir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}

            {/* TAB: ACARA & PETA */}
            {activeTab === 'acara' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tanggal Teks Ringkas</label>
                    <input
                      type="text"
                      value={formData.tanggalResmi}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          tanggalResmi: val,
                          hariTanggalLengkap: prev.hariTanggalLengkap || val,
                          acaraList: prev.acaraList.map(a => ({
                            ...a,
                            hariTanggal: a.hariTanggal || val
                          }))
                        }));
                        setProjectTanggal(val);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      placeholder="23 November 2025"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-600 font-medium">Hari & Tanggal Lengkap</label>
                      <button
                        type="button"
                        onClick={() => {
                          const syncDate = formData.hariTanggalLengkap || formData.tanggalResmi;
                          setFormData(prev => ({
                            ...prev,
                            acaraList: prev.acaraList.map(a => ({
                              ...a,
                              hariTanggal: syncDate
                            }))
                          }));
                          setSaveToast('Tanggal disinkronkan ke seluruh agenda acara!');
                          setTimeout(() => setSaveToast(null), 2500);
                        }}
                        className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                        title="Klik untuk menyamakan tanggal ke semua kartu acara"
                      >
                        Sinkronkan ke Semua Acara
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.hariTanggalLengkap}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          hariTanggalLengkap: val,
                          acaraList: prev.acaraList.map(a => ({
                            ...a,
                            hariTanggal: val
                          }))
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      placeholder="Sabtu, 23 November 2025"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Waktu Countdown Target (ISO format)</label>
                  <input
                    type="datetime-local"
                    value={formData.tanggalCountdownIso.substring(0, 16)}
                    onChange={e => setFormData({ ...formData, tanggalCountdownIso: e.target.value + ':00' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <h4 className="font-serif font-bold text-slate-900 pt-2">Daftar Acara</h4>
                {formData.acaraList.map((acara, idx) => (
                  <div key={acara.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 text-[10px]">Judul Acara</label>
                        <input
                          type="text"
                          value={acara.judul}
                          onChange={e => {
                            const copy = [...formData.acaraList];
                            copy[idx].judul = e.target.value;
                            setFormData({ ...formData, acaraList: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">Waktu Pelaksanaan</label>
                        <input
                          type="text"
                          value={acara.waktu}
                          onChange={e => {
                            const copy = [...formData.acaraList];
                            copy[idx].waktu = e.target.value;
                            setFormData({ ...formData, acaraList: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px]">Hari & Tanggal Acara Ini</label>
                      <input
                        type="text"
                        value={acara.hariTanggal || formData.hariTanggalLengkap || formData.tanggalResmi}
                        onChange={e => {
                          const copy = [...formData.acaraList];
                          copy[idx].hariTanggal = e.target.value;
                          setFormData({ ...formData, acaraList: copy });
                        }}
                        placeholder="Sabtu, 23 November 2025"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-500 text-[10px]">Nama Tempat / Gedung / Rumah</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newLoc = {
                              ...formData.lokasi,
                              namaTempat: acara.tempat || formData.lokasi.namaTempat,
                              alamatLengkap: acara.alamat || formData.lokasi.alamatLengkap,
                              googleMapsUrl: acara.linkMaps || formData.lokasi.googleMapsUrl
                            };
                            const q = [acara.tempat, acara.alamat].filter(Boolean).join(' ').trim();
                            if (q) {
                              newLoc.embedMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                            }
                            setFormData(prev => ({ ...prev, lokasi: newLoc }));
                            setSaveToast(`Lokasi peta disamakan dengan ${acara.judul}!`);
                            setTimeout(() => setSaveToast(null), 3000);
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                          title="Klik untuk menjadikan tempat ini sebagai lokasi peta utama"
                        >
                          📍 Jadikan Peta Utama
                        </button>
                      </div>
                      <input
                        type="text"
                        value={acara.tempat}
                        onChange={e => {
                          const val = e.target.value;
                          const copy = [...formData.acaraList];
                          const oldVal = copy[idx].tempat;
                          copy[idx].tempat = val;

                          // If main lokasi was matching oldVal or default template, auto-sync it!
                          const shouldAutoSync = !formData.lokasi.namaTempat || 
                            formData.lokasi.namaTempat === 'Gedung Serbaguna Harmoni' || 
                            formData.lokasi.namaTempat === oldVal;

                          const updatedLoc = shouldAutoSync ? {
                            ...formData.lokasi,
                            namaTempat: val,
                            alamatLengkap: copy[idx].alamat || formData.lokasi.alamatLengkap
                          } : formData.lokasi;

                          setFormData({ 
                            ...formData, 
                            acaraList: copy,
                            lokasi: updatedLoc
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px]">Alamat Lengkap</label>
                      <input
                        type="text"
                        value={acara.alamat}
                        onChange={e => {
                          const val = e.target.value;
                          const copy = [...formData.acaraList];
                          const oldVal = copy[idx].alamat;
                          copy[idx].alamat = val;

                          const shouldAutoSync = !formData.lokasi.alamatLengkap || 
                            formData.lokasi.alamatLengkap.includes('Melati No. 12') || 
                            formData.lokasi.alamatLengkap === oldVal;

                          const updatedLoc = shouldAutoSync ? {
                            ...formData.lokasi,
                            alamatLengkap: val
                          } : formData.lokasi;

                          setFormData({ 
                            ...formData, 
                            acaraList: copy,
                            lokasi: updatedLoc
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}

                {/* LOKASI UTAMA & PETA NAVIGASI */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>Lokasi Utama & Peta Navigasi (Google Maps)</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Tampil di Peta</span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Informasi gedung dan alamat ini yang akan tampil di kartu <strong>Peta & Navigasi</strong> serta cuplikan lokasi sampul.
                  </p>

                  {/* Quick Copy Buttons */}
                  {formData.acaraList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-medium">Samakan cepat dari:</span>
                      {formData.acaraList.map((ac, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => {
                            const q = [ac.tempat, ac.alamat].filter(Boolean).join(' ').trim();
                            const newEmbed = q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : formData.lokasi.embedMapsUrl;
                            setFormData(prev => ({
                              ...prev,
                              lokasi: {
                                ...prev.lokasi,
                                namaTempat: ac.tempat || prev.lokasi.namaTempat,
                                alamatLengkap: ac.alamat || prev.lokasi.alamatLengkap,
                                googleMapsUrl: ac.linkMaps || prev.lokasi.googleMapsUrl,
                                embedMapsUrl: newEmbed
                              }
                            }));
                            setSaveToast(`Lokasi disamakan dengan ${ac.judul}!`);
                            setTimeout(() => setSaveToast(null), 3000);
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-800 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
                        >
                          📍 {ac.judul || `Acara ${aIdx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Nama Tempat Utama */}
                  <div>
                    <label className="block text-slate-600 font-medium text-xs mb-1">Nama Tempat / Gedung untuk Peta</label>
                    <input
                      type="text"
                      value={formData.lokasi.namaTempat}
                      onChange={e => {
                        const val = e.target.value;
                        const q = [val, formData.lokasi.alamatLengkap].filter(Boolean).join(' ').trim();
                        setFormData(prev => ({
                          ...prev,
                          lokasi: {
                            ...prev.lokasi,
                            namaTempat: val,
                            embedMapsUrl: q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : prev.lokasi.embedMapsUrl
                          }
                        }));
                      }}
                      placeholder="Cth: Hotel Horison Tasikmalaya"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>

                  {/* Alamat Lengkap */}
                  <div>
                    <label className="block text-slate-600 font-medium text-xs mb-1">Alamat Lengkap untuk Navigasi</label>
                    <textarea
                      rows={2}
                      value={formData.lokasi.alamatLengkap}
                      onChange={e => {
                        const val = e.target.value;
                        const q = [formData.lokasi.namaTempat, val].filter(Boolean).join(' ').trim();
                        setFormData(prev => ({
                          ...prev,
                          lokasi: {
                            ...prev.lokasi,
                            alamatLengkap: val,
                            embedMapsUrl: q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : prev.lokasi.embedMapsUrl
                          }
                        }));
                      }}
                      placeholder="Cth: Jl. Yudanegara No.63, Yudanagara, Kec. Cihideung, Kota Tasikmalaya, Jawa Barat"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                  </div>

                  {/* Tautan Google Maps */}
                  <div>
                    <label className="block text-slate-600 font-medium text-xs mb-1">Tautan Google Maps (Tombol "Buka di Google Maps")</label>
                    <input
                      type="text"
                      value={formData.lokasi.googleMapsUrl}
                      onChange={e => {
                        let val = e.target.value.trim();
                        // If user pastes an iframe tag instead of a link, extract the src!
                        if (val.includes('<iframe') && val.includes('src=')) {
                          const match = val.match(/src=["']([^"']+)["']/);
                          if (match && match[1]) {
                            val = match[1];
                          }
                        }
                        setFormData(prev => ({
                          ...prev,
                          lokasi: {
                            ...prev.lokasi,
                            googleMapsUrl: val
                          }
                        }));
                      }}
                      placeholder="Cth: https://maps.app.goo.gl/... atau https://maps.google.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tautan yang akan dibuka saat tamu menekan tombol <em>"Buka di Google Maps"</em>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GALERI FOTO */}
            {activeTab === 'galeri' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900">Daftar Foto Galeri ({formData.galeri.fotoList.length})</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">⚡ Kompresi otomatis aktif (ringan & cepat dibuka)</p>
                  </div>
                  <label className={`px-3 py-1.5 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                    isCompressingPhoto ? 'opacity-60 pointer-events-none' : ''
                  }`}>
                    {isCompressingPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isCompressingPhoto ? 'Mengompres...' : 'Unggah Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isCompressingPhoto}
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => handleAddGalleryPhoto(url), {
                        maxWidth: 900,
                        maxHeight: 900,
                        maxSizeBytes: 50 * 1024
                      })}
                    />
                  </label>
                </div>

                {formData.galeri.fotoList.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                    <p className="text-xs">Belum ada foto galeri.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Klik tombol "Unggah Foto" di atas untuk menambahkan momen bahagia.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {formData.galeri.fotoList.map((foto, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-100">
                      <img src={foto} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: KISAH CINTA (Wedding only) */}
            {activeTab === 'cerita' && isWedding && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif font-bold text-slate-900">Perjalanan Cinta Pasangan</h4>
                  <button
                    onClick={handleAddStory}
                    className="px-3 py-1.5 rounded-xl bg-[#1F362D] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kisah</span>
                  </button>
                </div>

                {formData.kisahCinta.ceritaList.map((story, idx) => (
                  <div key={story.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveStory(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-500 text-[10px]">Tahun</label>
                        <input
                          type="text"
                          value={story.tahun}
                          onChange={e => {
                            const copy = [...formData.kisahCinta.ceritaList];
                            copy[idx].tahun = e.target.value;
                            setFormData({
                              ...formData,
                              kisahCinta: { ...formData.kisahCinta, ceritaList: copy }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-slate-500 text-[10px]">Judul Kisah</label>
                        <input
                          type="text"
                          value={story.judul}
                          onChange={e => {
                            const copy = [...formData.kisahCinta.ceritaList];
                            copy[idx].judul = e.target.value;
                            setFormData({
                              ...formData,
                              kisahCinta: { ...formData.kisahCinta, ceritaList: copy }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px]">Isi Cerita</label>
                      <textarea
                        rows={2}
                        value={story.cerita}
                        onChange={e => {
                          const copy = [...formData.kisahCinta.ceritaList];
                          copy[idx].cerita = e.target.value;
                          setFormData({
                            ...formData,
                            kisahCinta: { ...formData.kisahCinta, ceritaList: copy }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: BAGIAN AKTIF (TOGGLES) */}
            {activeTab === 'toggles' && (
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-slate-900 mb-1">Aktifkan / Sembunyikan Bagian</h4>
                <p className="text-slate-500 text-[11px] mb-4">Pilih bagian yang ingin ditampilkan di halaman undangan publik</p>

                {[
                  ...(isWedding ? [{ key: 'kisah', label: 'Kisah Perjalanan Cinta', checked: formData.kisahCinta.enabled, toggle: () => setFormData({ ...formData, kisahCinta: { ...formData.kisahCinta, enabled: !formData.kisahCinta.enabled } }) }] : []),
                  { key: 'galeri', label: 'Galeri Foto & Momen', checked: formData.galeri.enabled, toggle: () => setFormData({ ...formData, galeri: { ...formData.galeri, enabled: !formData.galeri.enabled } }) },
                  { key: 'rsvp', label: 'Formulir Konfirmasi Kehadiran (RSVP)', checked: formData.rsvp.enabled, toggle: () => setFormData({ ...formData, rsvp: { ...formData.rsvp, enabled: !formData.rsvp.enabled } }) },
                  { key: 'bukuTamu', label: 'Buku Tamu & Ucapan Doa', checked: formData.bukuTamu.enabled, toggle: () => setFormData({ ...formData, bukuTamu: { ...formData.bukuTamu, enabled: !formData.bukuTamu.enabled } }) },
                  { key: 'amplop', label: 'Amplop Digital / Rekening Kado', checked: formData.amplopDigital.enabled, toggle: () => setFormData({ ...formData, amplopDigital: { ...formData.amplopDigital, enabled: !formData.amplopDigital.enabled } }) },
                  { key: 'musik', label: 'Musik Latar', checked: formData.musik.enabled, toggle: () => setFormData({ ...formData, musik: { ...formData.musik, enabled: !formData.musik.enabled } }) },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        item.checked ? 'bg-[#1F362D]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        item.checked ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: TEMA & DESAIN */}
            {activeTab === 'tema' && (
              <div className="space-y-6">

                {/* 1. Mode Navigasi Halaman Undangan (Scroll vs Flipbook Realistis) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-stone-50 border border-amber-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        <span>Mode Navigasi Halaman Undangan</span>
                      </h4>
                      <p className="text-slate-500 text-[10px]">Tentukan sensasi membaca bagi tamu undangan Anda</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        tema: { ...formData.tema, modeNavigasi: 'scroll' }
                      })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        (formData.tema.modeNavigasi || 'scroll') === 'scroll'
                          ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block mb-0.5">📜 Scroll Vertikal</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Format modern satu halaman utuh yang digulir ke bawah
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        tema: { ...formData.tema, modeNavigasi: 'flipbook' }
                      })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.tema.modeNavigasi === 'flipbook'
                          ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block mb-0.5">📖 Buka Buku 3D (Flipbook)</span>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Sensasi membalik kertas fisik dengan suara desau kertas & gestur swipe
                      </span>
                    </button>
                  </div>

                  {/* Efek Suara Kertas (Hanya untuk mode buku) */}
                  {formData.tema.modeNavigasi === 'flipbook' && (
                    <div className="mt-3 pt-3 border-t border-amber-200/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">Efek Suara Desau Kertas (Web Audio)</span>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tema: { ...formData.tema, suaraKertas: !(formData.tema.suaraKertas ?? true) }
                        })}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                          (formData.tema.suaraKertas ?? true) ? 'bg-amber-700' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          (formData.tema.suaraKertas ?? true) ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Tekstur Kertas Fisik (Paper Texture Simulator) */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Pilihan Tekstur Kertas Fisik</h4>
                  <p className="text-slate-500 text-[11px] mb-2.5">Simulasi serat kertas fisik untuk estetika eksklusif</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'vintage-parchment', name: 'Vintage Parchment', desc: 'Serat kertas daluang kuno bertekstur' },
                      { id: 'linen', name: 'Luxury Linen Emboss', desc: 'Tekstur anyaman kain halus premium' },
                      { id: 'watercolor-matte', name: 'Cold-Press Watercolor', desc: 'Kertas lukis tebal matte berpori' },
                      { id: 'none', name: 'Modern Smooth', desc: 'Kertas mulus modern minimalis' },
                    ].map(tex => (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tema: { ...formData.tema, teksturKertas: tex.id as any }
                        })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          (formData.tema.teksturKertas || 'vintage-parchment') === tex.id
                            ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <span className="font-serif font-bold text-xs text-slate-900 block mb-0.5">{tex.name}</span>
                        <span className="text-[10px] text-slate-500 leading-tight block">{tex.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Efek Partikel Latar (Atmosphere / Ambience) */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Efek Partikel Melayang (Ambience)</h4>
                  <p className="text-slate-500 text-[11px] mb-2.5">Animasi atmosfer melayang lembut di atas undangan</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Tidak Ada', icon: '—' },
                      { id: 'petals', label: 'Kelopak Mawar', icon: '🌸' },
                      { id: 'sparkles', label: 'Kilau Emas', icon: '✨' },
                      { id: 'stars', label: 'Bintang Berpendar', icon: '🌙' },
                      { id: 'balloons', label: 'Balon Pesta', icon: '🎈' },
                    ].map(pt => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tema: { ...formData.tema, efekPartikel: pt.id as any }
                        })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          (formData.tema.efekPartikel || 'none') === pt.id
                            ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs font-bold text-[#1F362D]'
                            : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                        }`}
                      >
                        <span className="text-sm block mb-0.5">{pt.icon}</span>
                        <span className="text-[10px]">{pt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Palet Warna Tema */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Pilihan Palet Warna Tema</h4>
                  <p className="text-slate-500 text-[11px] mb-3">Pilih tema warna sesuai konsep atau dresscode acara</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'elegant-botanical', name: 'Emerald Botanical (Pernikahan)', bg: '#FAF7F2', primary: '#1F362D', accent: '#C5A059' },
                      { id: 'royal-navy-khitan', name: 'Royal Islamic Blue & Gold (Khitan)', bg: '#F0F6FC', primary: '#0E3B68', accent: '#D4AF37' },
                      { id: 'festive-coral', name: 'Sweet Coral & Gold (Ulang Tahun)', bg: '#FFF9F9', primary: '#E11D48', accent: '#F59E0B' },
                      { id: 'romantic-rose', name: 'Dusty Rose & Terracotta', bg: '#FDF8F7', primary: '#7D3C4D', accent: '#C47B62' },
                      { id: 'royal-navy', name: 'Royal Navy & Champagne', bg: '#F8F9FA', primary: '#14213D', accent: '#CCA43B' },
                      { id: 'midnight-luxury', name: 'Midnight Charcoal & Gold', bg: '#FAFAFA', primary: '#18181B', accent: '#D4AF37' },
                      { id: 'sage-nature', name: 'Sage Olive & Linen', bg: '#F6F4EE', primary: '#3B4D3A', accent: '#B89742' },
                      { id: 'maroon-glamour', name: 'Crimson Maroon & Brass', bg: '#FCF8F5', primary: '#5C1D24', accent: '#D4A373' },
                      { id: 'lavender-dream', name: 'Lavender & Rose Gold', bg: '#FAF7FC', primary: '#54426B', accent: '#D4A5B8' },
                      { id: 'minimalist-gold', name: 'Minimalist Ivory & Champagne', bg: '#FBFBFA', primary: '#2D3142', accent: '#BFA054' },
                    ].map(thm => (
                      <div
                        key={thm.id}
                        onClick={() => setFormData({
                          ...formData,
                          tema: {
                            ...formData.tema,
                            temaId: thm.id,
                            namaTema: thm.name,
                            warnaUtama: thm.primary,
                            warnaLatar: thm.bg,
                            warnaAksen: thm.accent
                          }
                        })}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          formData.tema.temaId === thm.id 
                            ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs' 
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: thm.primary }} />
                          <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: thm.accent }} />
                          <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: thm.bg }} />
                        </div>
                        <h5 className="font-serif font-bold text-xs text-slate-900 leading-tight">{thm.name}</h5>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaya Tampilan & Ornamen */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Gaya Tampilan / Style Ornamen</h4>
                  <p className="text-slate-500 text-[11px] mb-3">Pilih format kerangka visual dan ornamen dekoratif</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'classic-botanical', name: 'Classic Botanical', desc: 'Dedaunan watercolor & divider emas' },
                      { id: 'islamic-arch', name: 'Islamic Dome & Lantern', desc: 'Kubah masjid, lentera, motif Islami (Khitan)' },
                      { id: 'festive-birthday', name: 'Festive Birthday Balloons', desc: 'Balon ceria, kue, mahkota pesta (Ultah)' },
                      { id: 'modern-clean', name: 'Modern Minimalist', desc: 'Bersih, garis geometris halus, tanpa ornamen' },
                      { id: 'luxury-gold', name: 'Luxury Royal', desc: 'Aksen emas mengkilap & bingkai formal' },
                      { id: 'romantic-floral', name: 'Romantic Soft', desc: 'Nuansa lembut romantis pastel' },
                    ].map(st => (
                      <div
                        key={st.id}
                        onClick={() => setFormData({
                          ...formData,
                          tema: {
                            ...formData.tema,
                            styleTampilan: st.id as any
                          }
                        })}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          (formData.tema.styleTampilan || 'classic-botanical') === st.id
                            ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <h5 className="font-serif font-bold text-xs text-slate-900 mb-0.5">{st.name}</h5>
                        <p className="text-[10px] text-slate-500 leading-tight">{st.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Color Adjustment */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Kustomisasi Warna Bebas</h4>
                  <p className="text-slate-500 text-[11px] mb-3">Sesuaikan kode warna jika memiliki dresscode khusus</p>

                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Warna Utama</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={formData.tema.warnaUtama}
                          onChange={e => setFormData({
                            ...formData,
                            tema: { ...formData.tema, warnaUtama: e.target.value }
                          })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <span className="font-mono text-[10px] text-slate-600 uppercase">{formData.tema.warnaUtama}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Warna Aksen</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={formData.tema.warnaAksen}
                          onChange={e => setFormData({
                            ...formData,
                            tema: { ...formData.tema, warnaAksen: e.target.value }
                          })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <span className="font-mono text-[10px] text-slate-600 uppercase">{formData.tema.warnaAksen}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Warna Latar</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={formData.tema.warnaLatar}
                          onChange={e => setFormData({
                            ...formData,
                            tema: { ...formData.tema, warnaLatar: e.target.value }
                          })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <span className="font-mono text-[10px] text-slate-600 uppercase">{formData.tema.warnaLatar}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Font Kaligrafi Judul */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Pilihan Tipografi Judul</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'Great Vibes', name: 'Great Vibes (Script)', sample: 'Raka & Sinta', class: 'font-script text-xl' },
                      { id: 'Alex Brush', name: 'Alex Brush (Brush)', sample: 'Raka & Sinta', class: 'font-alex text-xl' },
                      { id: 'Playfair Display', name: 'Playfair Serif', sample: 'Raka & Sinta', class: 'font-serif text-sm font-bold' },
                      { id: 'Cinzel', name: 'Cinzel Roman', sample: 'RAKA & SINTA', class: 'font-cinzel text-xs font-bold' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tema: { ...formData.tema, fontJudul: f.id }
                        })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.tema.fontJudul === f.id
                            ? 'border-[#1F362D] ring-2 ring-[#1F362D]/20 bg-white'
                            : 'border-slate-200 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block mb-1">{f.name}</span>
                        <span className={`${f.class} text-slate-800`}>{f.sample}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MUSIK */}
            {activeTab === 'musik' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Judul Lagu</label>
                  <input
                    type="text"
                    value={formData.musik.judulLagu}
                    onChange={e => setFormData({
                      ...formData,
                      musik: { ...formData.musik, judulLagu: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Artis</label>
                  <input
                    type="text"
                    value={formData.musik.artis}
                    onChange={e => setFormData({
                      ...formData,
                      musik: { ...formData.musik, artis: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tautan Audio (MP3 URL)</label>
                  <input
                    type="text"
                    value={formData.musik.audioUrl}
                    onChange={e => setFormData({
                      ...formData,
                      musik: { ...formData.musik, audioUrl: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[11px]"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Live Interactive Preview */}
        <div className="flex-1 bg-slate-200/70 p-4 md:p-8 flex items-center justify-center overflow-y-auto">
          <div 
            className={`transition-all duration-300 w-full ${
              previewDevice === 'mobile' 
                ? 'max-w-[420px] rounded-[44px] shadow-2xl border-[10px] border-slate-800 overflow-hidden bg-white max-h-[860px]' 
                : 'max-w-4xl shadow-xl rounded-2xl overflow-hidden bg-white max-h-[90vh]'
            } flex flex-col`}
          >
            {/* Mockup notch for mobile view */}
            {previewDevice === 'mobile' && (
              <div className="h-5 bg-slate-800 w-full flex items-center justify-center shrink-0">
                <div className="w-24 h-3.5 bg-black rounded-b-xl" />
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <InvitationView 
                project={dummyProjectForPreview} 
                guestNameParam="Bpk. Contoh Tamu"
                isEmbedPreview={false}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
