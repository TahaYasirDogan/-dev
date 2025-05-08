import React, { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";

export default function SetupForm() {
  const [ageGroup, setAgeGroup] = useState("");
  const [topic, setTopic] = useState("");
  const [learningOutcome, setLearningOutcome] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const learningOutcomeRef = useRef<HTMLTextAreaElement | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = debounce(async (topic: string) => {
    if (!topic.trim()) return;

    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingSuggestions(true);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        body: JSON.stringify({ topic }),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal, // İptal kontrolü
      });

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Öneri hatası:", err);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  }, 700); // Kullanıcı yazmayı bıraktıktan 2 saniye sonra çalış

  useEffect(() => {
    fetchSuggestions(topic);
  }, [topic]);

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
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link kopyalandı!");
  };

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto bg-[#FFFCF5]  rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Etkinlik Ayarları</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Yaş Grubu:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            placeholder="Örn: 7-8 yaş"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Konu:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Örn: Toplama işlemi"
          />
        </div>

        <AnimatePresence>
          {!loadingSuggestions && suggestions.length > 0 && (
            <motion.div
              key="suggestions-box"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="font-light border-[0.3px] border-gray-300 text-gray-600 p-3 rounded mt-2"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">Önerilen Öğrenme Çıktıları:</p>
                <button
                  type="button"
                  onClick={() => {
                    setLearningOutcome((prev) => {
                      const combined = suggestions.join("\n");
                      const updated = prev ? `${prev}\n${combined}` : combined;
                      setTimeout(() => {
                        if (learningOutcomeRef.current) {
                          learningOutcomeRef.current.scrollTop =
                            learningOutcomeRef.current.scrollHeight;
                        }
                      }, 0);
                      return updated;
                    });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Tümünü Ekle
                </button>
              </div>

              <ul className="list-disc list-inside space-y-1 text-sm">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setLearningOutcome((prev) => {
                        const updated = prev ? `${prev}\n${s}` : s;
                        setTimeout(() => {
                          if (learningOutcomeRef.current) {
                            learningOutcomeRef.current.scrollTop =
                              learningOutcomeRef.current.scrollHeight;
                          }
                        }, 0);
                        return updated;
                      });
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block mb-1 font-semibold">Öğrenme Çıktısı:</label>
          <textarea
            ref={learningOutcomeRef}
            className="w-full border p-2 rounded"
            rows={3}
            value={learningOutcome}
            onChange={(e) => setLearningOutcome(e.target.value)}
            placeholder="Örn: İki basamaklı sayıları doğru şekilde toplayabilme"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 cursor-pointer transition"
        >
          Link Oluştur
        </button>
      </form>
      {generatedLink && (
        <div className="mt-4">
          <label className="block mb-1 font-semibold">Oluşturulan Link:</label>
          <div className="flex items-center">
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={generatedLink}
              readOnly
            />
            <button
              onClick={copyToClipboard}
              className="ml-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
            >
              Kopyala
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
