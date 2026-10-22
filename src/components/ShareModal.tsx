import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, ExternalLink, Share2 } from 'lucide-react';
import { WeddingProject } from '../types/wedding';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WeddingProject;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, project }) => {
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const slug = project.config.slug || project.id;
  const invitationUrl = `${origin}/${slug}${guestName ? `?to=${encodeURIComponent(guestName.trim())}` : ''}`;

  const messageText = `Kepada Yth.
Bapak/Ibu/Saudara/i ${guestName.trim() || 'Tamu Undangan'}

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami:

*${project.config.pria.namaLengkap}*
&
*${project.config.wanita.namaLengkap}*

📅 ${project.config.hariTanggalLengkap}
📍 ${project.config.lokasi.namaTempat}

Silakan buka tautan undangan berikut untuk informasi lengkap & konfirmasi kehadiran:
${invitationUrl}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Terima kasih,
*${project.mempelai}*`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative border border-slate-100 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif text-slate-900 font-semibold">Bagikan Undangan</h3>
            <p className="text-xs text-slate-500">Kirim undangan digital personal melalui WhatsApp atau tautan langsung</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Tamu Penerima (Opsional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Cth: Budi Santoso & Rekan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">Nama ini akan tercantum di sampul undangan penerima.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tautan Undangan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={invitationUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pratinjau Pesan WhatsApp
            </label>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 text-xs text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
              {messageText}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Kirim via WhatsApp
            </button>
            <a
              href={invitationUrl}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Tautan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
