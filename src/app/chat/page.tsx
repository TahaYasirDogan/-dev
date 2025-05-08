"use client";

import { useEffect, useState } from "react";
import ChatPage from "@/app/components/ChatPage";
import { useSearchParams } from "next/navigation";

export default function Chat() {
  const [config, setConfig] = useState<null | { ageGroup: string; topic: string; learningOutcome: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ageGroup = searchParams.get("age");
    const topic = searchParams.get("topic");
    const learningOutcome = searchParams.get("outcome");

    console.log("URL Parametreleri:", { ageGroup, topic, learningOutcome }); // Hata ayıklama

    if (ageGroup && topic && learningOutcome) {
      setConfig({
        ageGroup: decodeURIComponent(ageGroup),
        topic: decodeURIComponent(topic),
        learningOutcome: decodeURIComponent(learningOutcome),
      });
    } else {
      setError("Eksik veya geçersiz parametreler. Lütfen doğru bir link kullanın.");
      console.error("Eksik parametreler:", { ageGroup, topic, learningOutcome });
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Hata</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <ChatPage
      ageGroup={config.ageGroup}
      topic={config.topic}
      learningOutcome={config.learningOutcome}
    />
  );
}