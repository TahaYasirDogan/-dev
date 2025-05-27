import React, { useEffect } from 'react';

interface FinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  onRestart: () => void;
  onContinue: () => void;
}

export default function FinishModal({
  isOpen,
  onClose,
  onSend,
  onRestart,
  onContinue,
}: FinishModalProps) {
  // Escape tuşu ile modalı kapatma
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    // Modal Ana Kapsayıcı
    // Ekranı kaplar, içeriği ortalar ve diğer öğelerin üzerinde olmasını sağlar (z-50)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay (Arka Plan Karartması) */}
      {/* Tıklandığında modalı kapatır */}
      <div
        className="fixed inset-0 bg-black/60" // Tailwind v3+ bg-opacity kısayolu
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Paneli */}
      {/* İçeriğin bulunduğu kısım. Overlay'e tıklamayı engellemek için e.stopPropagation() kullanılır. */}
      <div
        className="relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md z-10 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Panel içine tıklamanın modalı kapatmasını engeller
      >
        {/* Başlık */}
        <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
          🎉 Ödev Tamamlandı 🎉
        </h2>

        {/* Mesaj */}
        <p className="my-4 text-gray-600 text-center">
          Ne yapmak istersin?
        </p>

        {/* Butonlar */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onSend}
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out"
          >
            Ödevi Gönder
          </button>
          <button
            onClick={onRestart}
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-150 ease-in-out"
          >
            Tekrar Başlat
          </button>
          <button
            onClick={onContinue}
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
          >
            Konuşmaya Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}