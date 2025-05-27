"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"; // useCallback ve useMemo eklendi
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import { FiClipboard, FiPlusCircle, FiLoader, FiHelpCircle, FiLink } from "react-icons/fi";

export default function SetupForm() {
  const [ageGroup, setAgeGroup] = useState("");
  const [topic, setTopic] = useState("");
  const [learningOutcome, setLearningOutcome] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const learningOutcomeRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce edilmiş API çağrı fonksiyonunu useMemo ile oluşturun
  const debouncedFetchSuggestions = useMemo(() => {
    return debounce(async (currentTopic: string, signal: AbortSignal) => {
      if (!currentTopic.trim()) {
        setSuggestions([]);
        setLoadingSuggestions(false); // Konu boşsa yükleniyor durumunu kapat
        return;
      }
      setLoadingSuggestions(true);
      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          body: JSON.stringify({ topic: currentTopic }),
          headers: { "Content-Type": "application/json" },
          signal: signal, // AbortController sinyalini kullan
        });

        if (!res.ok) {
          // AbortError değilse ve sunucudan hata geldiyse
          if (signal.aborted) return; // Zaten iptal edilmişse bir şey yapma
          throw new Error(`Öneriler alınamadı: ${res.statusText}`);
        }
        const data = await res.json();
        if (signal.aborted) return; // Veri geldikten sonra iptal edilmiş olabilir
        setSuggestions(data.suggestions || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Öneri hatası:", err);
          setSuggestions([]); // Hata durumunda önerileri temizle
        }
      } finally {
        // Sinyal iptal edilmediyse loading'i false yap
        if (!signal.aborted) {
            setLoadingSuggestions(false);
        }
      }
    }, 700); // Kullanıcı yazmayı bıraktıktan 700ms sonra
  }, []); // Boş bağımlılık dizisi, fonksiyon sadece bir kere oluşturulur


  useEffect(() => {
    // Önceki AbortController'ı iptal et ve yenisini oluştur
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (topic.trim()) {
      debouncedFetchSuggestions(topic, controller.signal);
    } else {
      // Konu boşsa veya sadece boşluk içeriyorsa, önerileri temizle ve bekleyen çağrıyı iptal et
      setSuggestions([]);
      setLoadingSuggestions(false);
      debouncedFetchSuggestions.cancel(); // Debounce'un bekleyen çağrısını iptal et
    }

    // Cleanup fonksiyonu: Component unmount olduğunda veya topic değişmeden önce çalışır
    return () => {
      console.log("Cleaning up effect for topic:", topic);
      controller.abort(); // Mevcut isteği iptal et
      debouncedFetchSuggestions.cancel(); // Debounce'un bekleyen çağrısını iptal et
    };
  }, [topic, debouncedFetchSuggestions]); // Bağımlılık olarak topic ve memoize edilmiş fonksiyon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ageGroup && topic && learningOutcome) {
      const params = new URLSearchParams({
        age: ageGroup,
        topic: topic,
        outcome: learningOutcome,
      }).toString();
      const link = `${window.location.origin}/chat?${params}`;
      setGeneratedLink(link);
    } else {
      alert("Lütfen tüm alanları doldurun.");
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    alert("Link panoya kopyalandı!");
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-150 ease-in-out shadow-sm placeholder-gray-400";
  const labelClasses = "block mb-2 font-semibold text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-10 lg:p-12 rounded-xl shadow-2xl space-y-8">
        <div className="text-center">
          <FiLink className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-4">
            Yeni Etkinlik Oluştur
          </h1>
          <p className="mt-2 text-gray-600">
            Aşağıdaki bilgileri doldurarak interaktif öğrenme etkinliğiniz için bir link oluşturun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="ageGroup" className={labelClasses}>
              Yaş Grubu
            </label>
            <input
              id="ageGroup"
              type="text"
              className={inputClasses}
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              placeholder="Örn: 7-8 yaş, Lise 1. Sınıf"
              required
            />
          </div>

          <div>
            <label htmlFor="topic" className={labelClasses}>
              Konu
            </label>
            <input
              id="topic"
              type="text"
              className={inputClasses}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Kesirlerle Toplama, İkinci Dünya Savaşı Nedenleri"
              required
            />
          </div>

          <AnimatePresence>
            {(loadingSuggestions || (suggestions && suggestions.length > 0 && topic.trim())) && ( // Sadece konu doluysa ve öneri varsa/yükleniyorsa göster
              <motion.div
                key="suggestions-box"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-orange-50 border border-orange-200 text-gray-700 p-4 rounded-lg mt-2 shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-orange-700 flex items-center">
                    <FiHelpCircle className="mr-2" /> Önerilen Öğrenme Çıktıları:
                  </p>
                  {loadingSuggestions ? (
                    <FiLoader className="animate-spin text-orange-600 h-5 w-5" />
                  ) : (
                    suggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setLearningOutcome((prev) => {
                          const uniqueSuggestions = suggestions.filter(s => !(prev || "").includes(s));
                          const combined = uniqueSuggestions.join("\n");
                          return prev ? `${prev}\n${combined}`.trim() : combined;
                        });
                      }}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                      <FiPlusCircle className="mr-1" /> Tüm (Yeni) Önerileri Ekle
                    </button>
                    )
                  )}
                </div>

                {!loadingSuggestions && suggestions.length > 0 && (
                  <ul className="space-y-1 text-sm list-none">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="p-2 rounded-md hover:bg-orange-100 cursor-pointer flex items-start group"
                        onClick={() => {
                          setLearningOutcome((prev) => {
                            if ((prev || "").includes(s)) return prev;
                            return prev ? `${prev}\n${s}`.trim() : s;
                          });
                        }}
                      >
                        <span className="text-orange-500 mr-2 mt-1 group-hover:text-orange-700">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {!loadingSuggestions && suggestions.length === 0 && topic.trim() && (
                    <p className="text-sm text-gray-500 text-center py-2">Bu konu için henüz öneri bulunamadı.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="learningOutcome" className={labelClasses}>
              Öğrenme Çıktısı/Çıktıları
            </label>
            <textarea
              id="learningOutcome"
              ref={learningOutcomeRef}
              className={`${inputClasses} min-h-[100px]`}
              rows={4}
              value={learningOutcome}
              onChange={(e) => setLearningOutcome(e.target.value)}
              placeholder="Her bir çıktıyı yeni bir satıra yazabilirsiniz. Örn:
- Basit kesirleri tanır.
- Kesirleri sayı doğrusunda gösterir."
              required
            />
            <p className="mt-1 text-xs text-gray-500">Birden fazla öğrenme çıktısı varsa her birini yeni bir satıra yazın.</p>
          </div>

          <button
            type="submit"
            disabled={loadingSuggestions}
            className="w-full flex items-center justify-center bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-150 ease-in-out font-semibold text-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FiLink className="mr-2" />
            Etkinlik Linki Oluştur
          </button>
        </form>

        <AnimatePresence>
        {generatedLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow"
          >
            <label htmlFor="generatedLink" className="block mb-2 font-semibold text-green-700">
              Oluşturulan Etkinlik Linki:
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="generatedLink"
                type="text"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={generatedLink}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                title="Panoya Kopyala"
                className="flex-shrink-0 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-150 ease-in-out shadow-md"
              >
                <FiClipboard size={20} />
              </button>
            </div>
            <p className="mt-3 text-sm text-green-600">
              Bu linki öğrencilerinizle veya katılımcılarınızla paylaşabilirsiniz.
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}