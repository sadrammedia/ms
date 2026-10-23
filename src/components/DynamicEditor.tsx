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
  ArrowLeft
} from 'lucide-react';
import { WeddingProject, WeddingConfig, LoveStoryItem, WeddingEvent } from '../types/wedding';
import { updateProject } from '../services/firebase';
import { InvitationView } from './InvitationView';

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
  const [formData, setFormData] = useState<WeddingConfig>({ ...project.config });
  const [projectMempelai, setProjectMempelai] = useState(project.mempelai);
  const [projectTanggal, setProjectTanggal] = useState(project.tanggal);
  const [projectStatus, setProjectStatus] = useState(project.status);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'teks' | 'mempelai' | 'acara' | 'galeri' | 'cerita' | 'toggles' | 'tema' | 'musik'>('mempelai');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Helper to handle image uploads via File Input (converts to base64 data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5MB. Silakan pilih foto yang lebih ringan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSuccess(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  // Save changes
  const handleSave = async (statusOverride?: 'Aktif' | 'Draf') => {
    setIsSaving(true);
    const newStatus = statusOverride || projectStatus;
    const coupleName = `${formData.pria.namaPanggilan} & ${formData.wanita.namaPanggilan}`;

    const updatedProject: WeddingProject = {
      ...project,
      mempelai: coupleName || projectMempelai,
      tanggal: formData.tanggalResmi || projectTanggal,
      status: newStatus,
      config: formData
    };

    try {
      await updateProject(project.id, {
        mempelai: updatedProject.mempelai,
        tanggal: updatedProject.tanggal,
        status: newStatus,
        config: formData
      });

      setProjectStatus(newStatus);
      setProjectMempelai(updatedProject.mempelai);
      onSaveSuccess(updatedProject);
      setSaveToast(`Undangan berhasil disimpan sebagai ${newStatus}!`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const dummyProjectForPreview: WeddingProject = {
    ...project,
    mempelai: `${formData.pria.namaPanggilan || 'Raka'} & ${formData.wanita.namaPanggilan || 'Sinta'}`,
    tanggal: formData.tanggalResmi,
    status: projectStatus,
    config: formData
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Editor Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Editor Undangan:</span>
              <span className="font-serif text-[#1F362D]">{projectMempelai}</span>
            </h1>
            <span className="text-[11px] text-slate-400">ID Proyek: {project.id}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Device preview toggle */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Smartphone"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Simpan Draf
          </button>

          <button
            onClick={() => handleSave('Aktif')}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#1F362D] hover:bg-[#162720] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#DFBF7A]" />
            <span>{isSaving ? 'Menyimpan...' : 'Publikasikan'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split (Left: Control Panel, Right: Live Interactive Preview) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Dynamic Controls Panel */}
        <div className="w-full md:w-[480px] lg:w-[540px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/70 p-2 gap-1 custom-scrollbar shrink-0">
            {[
              { id: 'mempelai', label: 'Mempelai', icon: Heart },
              { id: 'teks', label: 'Sampul & Teks', icon: FileText },
              { id: 'acara', label: 'Acara & Peta', icon: Calendar },
              { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon },
              { id: 'cerita', label: 'Kisah Cinta', icon: Sparkles },
              { id: 'toggles', label: 'Bagian Aktif', icon: Sliders },
              { id: 'tema', label: 'Tema & Desain', icon: Sliders },
              { id: 'musik', label: 'Musik Latar', icon: Music },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#1F362D] font-bold shadow-sm border border-slate-200/60'
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
            
            {/* TAB: MEMPELAI */}
            {activeTab === 'mempelai' && (
              <div className="space-y-6">
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
              </div>
            )}

            {/* TAB: TEKS & SAMPUL */}
            {activeTab === 'teks' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Label Atas Sampul</label>
                  <input
                    type="text"
                    value={formData.labelSampul}
                    onChange={e => setFormData({ ...formData, labelSampul: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Foto Sampul Utama (Hero Backdrop)</label>
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
                  <label className="block text-slate-600 font-medium mb-1">Kalimat Pengantar Sampul</label>
                  <textarea
                    rows={2}
                    value={formData.subJudulSampul}
                    onChange={e => setFormData({ ...formData, subJudulSampul: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Kutipan Romantis Utama</label>
                  <input
                    type="text"
                    value={formData.kutipanAwal}
                    onChange={e => setFormData({ ...formData, kutipanAwal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Kutipan Penutup</label>
                  <input
                    type="text"
                    value={formData.kutipanAkhir}
                    onChange={e => setFormData({ ...formData, kutipanAkhir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}

            {/* TAB: ACARA & PETA */}
            {activeTab === 'acara' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-2">Tanggal Acara Utama & Countdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tanggal Teks (Resmi)</label>
                      <input
                        type="text"
                        value={formData.tanggalResmi}
                        onChange={e => setFormData({ ...formData, tanggalResmi: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Hari & Tanggal Lengkap</label>
                      <input
                        type="text"
                        value={formData.hariTanggalLengkap}
                        onChange={e => setFormData({ ...formData, hariTanggalLengkap: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {formData.acaraList.map((acara, idx) => (
                  <div key={acara.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h5 className="font-bold text-slate-800 text-xs">{acara.judul}</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 text-[10px]">Hari & Tanggal</label>
                        <input
                          type="text"
                          value={acara.hariTanggal}
                          onChange={e => {
                            const copy = [...formData.acaraList];
                            copy[idx].hariTanggal = e.target.value;
                            setFormData({ ...formData, acaraList: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px]">Waktu</label>
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
                      <label className="block text-slate-500 text-[10px]">Nama Tempat / Gedung</label>
                      <input
                        type="text"
                        value={acara.tempat}
                        onChange={e => {
                          const copy = [...formData.acaraList];
                          copy[idx].tempat = e.target.value;
                          setFormData({ ...formData, acaraList: copy });
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
                          const copy = [...formData.acaraList];
                          copy[idx].alamat = e.target.value;
                          setFormData({ ...formData, acaraList: copy });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-2">Tautan Peta & Navigasi</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tautan Google Maps</label>
                      <input
                        type="text"
                        value={formData.lokasi.googleMapsUrl}
                        onChange={e => setFormData({
                          ...formData,
                          lokasi: { ...formData.lokasi, googleMapsUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GALERI FOTO */}
            {activeTab === 'galeri' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif font-bold text-slate-900">Daftar Foto Galeri ({formData.galeri.fotoList.length})</h4>
                  <label className="px-3 py-1.5 rounded-xl bg-[#1F362D] text-white text-[11px] font-medium cursor-pointer flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Unggah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, url => handleAddGalleryPhoto(url))}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {formData.galeri.fotoList.map((foto, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-100">
                      <img src={foto} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveGalleryPhoto(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: KISAH CINTA */}
            {activeTab === 'cerita' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif font-bold text-slate-900">Perjalanan Cinta Pasangan</h4>
                  <button
                    onClick={handleAddStory}
                    className="px-3 py-1.5 rounded-xl bg-[#1F362D] text-white text-[11px] font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kisah</span>
                  </button>
                </div>

                {formData.kisahCinta.ceritaList.map((story, idx) => (
                  <div key={story.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveStory(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
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
                  { key: 'kisah', label: 'Kisah Perjalanan Cinta', checked: formData.kisahCinta.enabled, toggle: () => setFormData({ ...formData, kisahCinta: { ...formData.kisahCinta, enabled: !formData.kisahCinta.enabled } }) },
                  { key: 'galeri', label: 'Galeri Foto & Momen', checked: formData.galeri.enabled, toggle: () => setFormData({ ...formData, galeri: { ...formData.galeri, enabled: !formData.galeri.enabled } }) },
                  { key: 'rsvp', label: 'Formulir Konfirmasi Kehadiran (RSVP)', checked: formData.rsvp.enabled, toggle: () => setFormData({ ...formData, rsvp: { ...formData.rsvp, enabled: !formData.rsvp.enabled } }) },
                  { key: 'bukuTamu', label: 'Buku Tamu & Ucapan Doa', checked: formData.bukuTamu.enabled, toggle: () => setFormData({ ...formData, bukuTamu: { ...formData.bukuTamu, enabled: !formData.bukuTamu.enabled } }) },
                  { key: 'amplop', label: 'Amplop Digital / Rekening Hadiah', checked: formData.amplopDigital.enabled, toggle: () => setFormData({ ...formData, amplopDigital: { ...formData.amplopDigital, enabled: !formData.amplopDigital.enabled } }) },
                  { key: 'musik', label: 'Musik Latar Romantis', checked: formData.musik.enabled, toggle: () => setFormData({ ...formData, musik: { ...formData.musik, enabled: !formData.musik.enabled } }) },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <button
                      type="button"
                      onClick={item.toggle}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
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
                <div>
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Pilihan Palet Warna Tema</h4>
                  <p className="text-slate-500 text-[11px] mb-3">Pilih tema warna yang sesuai dengan konsep atau dresscode pernikahan</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'elegant-botanical', name: 'Emerald Botanical', bg: '#FAF7F2', primary: '#1F362D', accent: '#C5A059' },
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
                  <p className="text-slate-500 text-[11px] mb-3">Tentukan gaya visual kartu dan ornamen dekoratif</p>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'classic-botanical', name: 'Classic Botanical', desc: 'Dedaunan watercolor & divider emas vintage' },
                      { id: 'modern-clean', name: 'Modern Minimalist', desc: 'Bersih, garis geometris halus, tanpa bunga' },
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
                  <h4 className="font-serif font-bold text-slate-900 mb-1">Pilihan Tipografi Nama Mempelai</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { id: 'Great Vibes', name: 'Great Vibes', sample: 'Raka & Sinta', class: 'font-script text-xl' },
                      { id: 'Alex Brush', name: 'Alex Brush', sample: 'Raka & Sinta', class: 'font-alex text-xl' },
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
                        className={`p-3 rounded-xl border text-left transition-all ${
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
                  <label className="block text-slate-600 font-medium mb-1">Audio URL (.mp3)</label>
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

          {/* Quick Footer Action in Panel */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Status saat ini: <strong className={projectStatus === 'Aktif' ? 'text-emerald-700' : 'text-amber-600'}>{projectStatus}</strong>
            </span>
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-[#1F362D] text-white text-xs font-semibold hover:bg-[#162720] transition-colors shadow flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

        {/* Right Side: Live Interactive Phone Preview */}
        <div className="flex-1 bg-slate-200/60 p-4 md:p-8 flex items-center justify-center overflow-y-auto">
          {previewDevice === 'mobile' ? (
            /* Smartphone device frame mirroring mockup */
            <div className="w-[375px] h-[760px] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800/50 flex flex-col relative shrink-0">
              {/* Dynamic Island / Speaker notch */}
              <div className="w-32 h-5 bg-black rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800" />
              </div>

              {/* Inner screen content */}
              <div className="w-full h-full rounded-[38px] overflow-hidden bg-[#FAF7F2] relative custom-scrollbar flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <InvitationView project={dummyProjectForPreview} isEmbedPreview={true} />
                </div>
              </div>
            </div>
          ) : (
            /* Desktop / Expanded Preview */
            <div className="w-full h-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-300 flex flex-col">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-slate-700">ms-undangan.com/index.html?id={project.id}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <InvitationView project={dummyProjectForPreview} isEmbedPreview={true} />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-fade-in border border-emerald-700">
          <Check className="w-4 h-4 text-[#DFBF7A]" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
};
