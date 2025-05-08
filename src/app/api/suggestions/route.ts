import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, ageGroup } = await req.json();

  try {
    const prompt = `
Sen bir öğretmensin. ${ageGroup} yaş grubundaki öğrenciler için "${topic}" konusuna uygun, sadece yapay zeka ile konuşarak tamamlanabilecek 6 kısa, sade ve ölçülebilir öğrenme çıktısı oluştur.

Öğrenme çıktıları bu yaş grubunun bilişsel seviyesine uygun olmalı ve şu tür yüksek düzey düşünme becerilerini hedeflemelidir: karşılaştırma, analiz, yorumlama, tahmin yapma, neden-sonuç ilişkisi kurma, eleştirel düşünme, alternatif üretme ve yaratıcı düşünme.

Öğrenciden yalnızca ezber bilgi değil, düşünerek üretim yapması beklenmelidir. Fiziksel etkinlik (çizim yapma, kesme, yazma gibi) içermemelidir.

Giriş cümlesi, açıklama veya selamlaşma yazma. Sadece 6 madde halinde öğrenme çıktısı yaz. Aşağıdaki örnek çıktılara benzer üret:

- Verilen iki durumu karşılaştırarak farklarını söyleyebilir.
- Bir olayın olası nedenlerini tahmin edebilir.
- Bir kavrama kendi örneğini vererek açıklayabilir.
- Farklı bakış açılarını ayırt ederek değerlendirme yapabilir.
- Konuya uygun özgün bir fikir veya çözüm önerebilir.
- Verilen bilgileri kullanarak yeni bir yorum geliştirebilir.
`;
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen pedagojik içerik tasarlayan bir uzmansın.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "API hatası" }, { status: response.status });
    }

    const data = await response.json();
    const suggestions = data.choices?.[0]?.message?.content
      ?.split("\n")
      .filter((line: string) => line.trim() !== "")
      .map((line: string) => line.replace(/^\d+[\).\s]*/, "").trim());

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
