"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

interface ChatPageProps {
  ageGroup: string;
  topic: string;
  learningOutcome: string;
}

export default function ChatPage({
  ageGroup,
  topic,
  learningOutcome,
}: ChatPageProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const [evaluation, setEvaluation] = useState<null | {
    puan: number;
    artilar: string;
    eksiler: string;
  }>(null);

  // İlk mesaj: sistem talimatı
  useEffect(() => {
    console.log("ChatPage props:", { ageGroup, topic, learningOutcome });
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const initialMessages = [
      {
        role: "system",
        content: `Sen bir öğretmensin. Yaş grubu: ${ageGroup}. Konu: ${topic}.
Öğrencinin öğrenme çıktısı: ${learningOutcome}.

Öğrenciyle etkileşime başlarken (ilk mesajın) VE her öğrenci cevabından sonra *her zaman ve yalnızca* aşağıdaki JSON formatında yanıt ver:
- ${ageGroup} yaş grubuna uygun, sade ve ilgi çekici olmalı.
- Konunun neden önemli olduğunu veya günlük hayatta nasıl kullanıldığını kısaca belirtmeli.
- Öğrenciyi motive etmeli ve öğrenme çıktısına hazırlamalı.

Her öğrenci cevabından sonra aşağıdaki *yalnızca JSON* formatında yanıt ver:

{
  "puan": 0-100 arasında tam sayı. Daha önce verilen en yüksek puanın altına düşemezsin.
  "artilar": "Öğrencinin güçlü yönleri. Cevabındaki güzel noktaları takdir et.",
  "eksiler": "Eksik veya hatalı kısımlar varsa kısa açıklamalar, örnekler veya ipuçları ver.",
  "sonrakiMesaj": "Öğrencinin verdiği cevabı daha açık, düzenli, detaylı ve öğretici şekilde yeniden ifade et. Bu alan her zaman dolu olmalı. Öğrenciyi düşündürerek öğrenme çıktısına ulaşmasını sağlayacak yeni bir soru. Gerekirse ipucu veya kısa bir örnekle destekle."
}

**Puanlama Mantığı**  
- Eğer birden fazla öğrenme çıktısı varsa, bunları **virgülle** ayrılmış olarak kabul et ve 
  adet = learningOutcome.split(',').length ile say.  
- Her bir *tam doğru* öğrenme çıktısı için puan = Math.floor(100 / adet).  
- *Kısmi doğruluk* durumunda puanı orantılı olarak hesapla (örneğin yarım doğru ➔ yarı puan).  
- Toplam puan hiçbir zaman 100’ü geçmez ve önceki en yüksek puanın altına inmez.
+ - Puanı hesaplarken **asla 10’un katlarına** otomatik yuvarlama yapma.  
+   Doğruluk oranı sonucu çıkan ondalıklı değeri en yakın tam sayıya (_Math.round()_) çevir,  
- **ÖĞRENCİ CEVABINI DEĞERLENDİRME:**
    1.  **Yardım Talepleri / Anlamama Beyanları / Konu Dışı Cevaplar:**
        Eğer öğrencinin cevabı **öncelikli olarak veya tamamen** şunlardan birini içeriyorsa:
        *   Açık bir yardım talebi (örneğin, "ipucu ver", "yardım eder misin?", "nasıl yapacağım?", "örnek gösterir misin?")
        *   Konuyu anlamadığını belirten bir ifade (örneğin, "bilmiyorum", "anlamadım", "hiçbir fikrim yok", "bu çok karışık", "bu ilişkiyi çözemedim")
        *   Soruyla tamamen alakasız bir cevap
        Bu durumlarda, o etkileşim için **KESİNLİKLE YENİ BİR PUAN ARTIŞI YAPMA**.
        JSON yanıtındaki \`puan\` değeri, bir önceki etkileşimdeki \`puan\` değeriyle **BİREBİR AYNI OLMALIDIR**.
        \`artilar\` alanında: "Yardım istemen veya anlamadığını belirtmen çok güzel, öğrenme böyle bir şey!" gibi teşvik edici bir ifade kullan.
        \`eksiler\` alanı genellikle boş olabilir veya "Sorun değil, bu konuyu netleştirmek için sana bir ipucu vereyim." gibi bir ifade içerebilir.
- **Maksimum Puan:** Toplam \`puan\` hiçbir zaman 100’ü geçemez.

2.  **Öğrenme Çıktısına Yönelik Cevaplar (Yukarıdaki Kapsam Dışındaysa):**
        *   Cevap, öğrenme çıktılarından birini veya birkaçını **tam olarak** karşılıyorsa, ilgili puanı hesapla.
        *   Cevap, öğrenme çıktılarından birini veya birkaçını **kısmen** karşılıyorsa, doğruluk oranına göre orantılı bir puan hesapla.
        *   Bu durumda hesaplanan yeni toplam puan, bir önceki turdaki puandan düşük olamaz. Eğer hesaplanan yeni puan daha düşükse, puanı bir önceki turdaki seviyede tut. **ASLA PUANI BİR ÖNCEKİ TURDAKİNDEN AŞAĞI DÜŞÜRME**
- **Puan Yuvarlama:** Puanı hesaplarken **asla 10’un katlarına** otomatik yuvarlama yapma. Doğruluk oranı sonucu çıkan ondalıklı değeri en yakın tam sayıya (\`Math.round()\`) çevir, fakat **10’un katlarına** (20, 30, 40…) sabitlenmiş gibi davranma.



Kurallar:
"Kullandığın dil, verdiğin örnekler ve sorduğun soruların karmaşıklığı belirtilen yaş grubuna (${ageGroup}) uygun olmalı.",
"Eksik veya hatalı cevaplar varsa açıklayıcı örnekler ve düşündürücü ipuçları ver.",
"Doğru cevaplarda öğrenciyi mutlaka takdir et.",
"Cevap ne kadar iyi olursa olsun 'sonrakiMesaj' alanında daha güzel ve öğretici biçimde toparla.",
"Önceki yanıtlara göre puan düşürme (puan hep aynı kalmalı veya artmalı).",
"JSON dışında hiçbir şey üretme.",
"Eğer öğrenci birkaç etkileşimden sonra (örneğin, 2-3 denemeden sonra) hala belirgin bir şekilde takılıyorsa, puanı artmıyorsa, sürekli benzer hataları yapıyorsa veya konuyu anlamadığı yönünde ifadeler kullanıyorsa, 'sonrakiMesaj'daki yönlendirmelerini ve ipuçlarını kademeli olarak daha açık ve doğrudan hale getir. Amacın öğrenciyi tamamen cevapsız bırakmak değil, doğru yolda düşünmesini sağlayacak daha somut destekler sunmaktır. Örneğin, daha basit bir alt soru sorabilir, doğrudan ilgili bir kavramı hatırlatabilir, cevabın bir kısmını vererek kalanını bulmasını isteyebilir veya çok benzer, çözülmüş bir örnek üzerinden gitmesini isteyebilirsin. Ancak doğrudan tüm cevabı verme, sadece öğrenme çıktısına ulaşmasını kolaylaştır.",
"Öğrencinin öğrenme çıktısına ulaştığına kanaat getirdiğinde, 'sonrakiMesaj' alanında bunu belirterek öğrenciyi tebrik et ve konunun kısa bir özetini sunarak diyaloğu sonlandır"
- 'sonrakiMesaj' içeriği Markdown formatında olsun.
- 'sonrakiMesaj' için her zaman ## ile ana başlık kullan (örneğin, ## ${topic} Nedir?).
- Alt başlıklar için ### kullan.
- Başlıkları kısa, net ve ${ageGroup} yaş grubuna uygun tut.
- Önemli terimleri **kalın** yap.
- Listeler için - veya * ile madde işaretleri kullan.
- Başlıklar için ### veya ## kullan.
- Emojiler ekle (örneğin, 🎉 tebrik için, ❓ soru için).
- Öğrenciyi motive eden ifadelerde olumlu ton ve emojiler kullan (örneğin, "Harika iş! 🎉").
Örnek 'sonrakiMesaj':
### ${topic} Hakkında
**${topic}** günlük hayatta neden önemli? 😊  
- **Fayda 1**: Açıklama.
- **Fayda 2**: Açıklama.
❓ Şimdi düşün: [yeni soru]
- JSON dışında hiçbir şey üretme.`,
      },
    ];

    setMessages(initialMessages);

    const getInitialQuestion = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: initialMessages }),
        });

        if (!res.ok) {
          throw new Error(
            `API isteği başarısız: ${res.status} ${res.statusText}`
          );
        }

        const data = await res.json();
        console.log("API Yanıtı:", data); // Hata ayıklama

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("İlk soru alınamadı: Boş yanıt");
        }

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (parseError) {
          throw new Error(`JSON parse hatası: ${parseError.message}`);
        }

        const { puan, artilar, eksiler, sonrakiMesaj } = parsed;
        if (puan < 0 || puan > 100) {
          throw new Error(`Geçersiz puan: ${puan}`);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: sonrakiMesaj },
        ]);
        setEvaluation({ puan, artilar, eksiler });
        toast.success("Etkinlik başladı! 🚀");
      } catch (err) {
        console.error("API Hatası:", err);
        setError(`Başlangıç sorusu yüklenemedi: ${err.message}`);
        toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };

    getInitialQuestion();
  }, [ageGroup, topic, learningOutcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        throw new Error(
          `API isteği başarısız: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("API Yanıtı (kullanıcı cevabı):", data);

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Yanıt alınamadı: Boş yanıt");
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`JSON parse hatası: ${parseError.message}`);
      }

      const { puan, artilar, eksiler, sonrakiMesaj } = parsed;
      if (puan < 0 || puan > 100) {
        throw new Error(`Geçersiz puan: ${puan}`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: sonrakiMesaj },
      ]);
      setEvaluation({ puan, artilar, eksiler });
      toast.success("Cevabınız gönderildi! 🎉");
    } catch (err) {
      console.error("API Hatası:", err);
      setError(`Yanıt alınamadı: ${err.message}`);
      toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const [puanArtisi, setPuanArtisi] = useState<number | null>(null);
  const previousPuanRef = useRef<number>(0);

  useEffect(() => {
    if (evaluation && evaluation.puan !== previousPuanRef.current) {
      const fark = evaluation.puan - previousPuanRef.current;
      if (fark > 0) {
        setPuanArtisi(fark);
        const audio = new Audio("/ding.mp3");
        audio.play().catch((err) => console.error("Ses çalma hatası:", err));
        setTimeout(() => setPuanArtisi(null), 2000);
      }
      previousPuanRef.current = evaluation.puan;
    }
  }, [evaluation]);

  return (
    <div className="min-h-screen flex justify-center bg-[#FFFCF5]">
      <div className="w-full h-full max-w-4xl rounded-lg">
        {evaluation && (
          <div className="mb-4 flex bg-white items-center fixed top-0 left-0 right-0 max-w-4xl mx-auto rounded-2xl p-4 mt-2 shadow-md">
            <div className="w-full bg-green-200 rounded-full h-4 mx-6 overflow-hidden">
              <div
                className="
                  h-full bg-green-500 rounded-full relative
                  transition-all duration-500
                  before:content-['']
                  before:absolute
                  before:top-[3.5px]
                  before:left-[4px]
                  before:right-[4px]
                  before:h-[3px]
                  before:bg-lime-400
                  before:rounded-full
                "
                style={{ width: `${Math.min(evaluation.puan, 100)}%` }}
              ></div>
            </div>
            <span className=" font-medium text-gray-800">
              {evaluation.puan}%
            </span>
          </div>
        )}
        {puanArtisi && (
          <motion.div
            className="fixed bg-white p-2 rounded-full top-16 left-1/2 transform -translate-x-1/2 z-50 text-green-600 text-xl shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            +{puanArtisi}
          </motion.div>
        )}

        {error && (
          <div className="text-red-500 mb-4 text-center bg-red-100 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="h-full overflow-y-auto mt-14 mb-20 p-4 rounded-lg">
          {messages
            .filter((msg) => msg.role !== "system")
            .map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-stone-200 text-gray-900 max-w-md"
                      : "text-black"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="text-3xl font-bold mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-2xl font-semibold mt-3 mb-1">
                          {children}
                        </h3>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc ml-6">{children}</ul>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          {loading && <div className="text-gray-400 italic">Yükleniyor...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center fixed bottom-5 left-0 right-0 max-w-4xl mx-auto"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-4 pr-14 rounded-3xl focus:outline-none bg-white focus:ring focus:ring-orange-500 shadow-2xl"
            placeholder="Cevabınızı yazın..."
            disabled={loading}
          />
          <button
            type="submit"
            className="absolute right-2 bg-orange-500 rounded-full text-white p-2 hover:bg-orange-600 transition cursor-pointer"
            disabled={loading}
          >
            <FiArrowUp size={25} />
          </button>
        </form>
      </div>
    </div>
  );
}
