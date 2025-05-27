
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import ChatPage, { type ChatPageRef } from "@/app/components/ChatPage";
import { useSearchParams } from "next/navigation";
import ChatHeader from "@/app/components/CheatHeader"; // Doğru isim: ChatHeader
import { useAuth } from "@clerk/nextjs";
import Sidebar from "../components/Sidebar";

interface ChatPageLoaderProps {
  onToggleSidebar?: () => void; // Bu prop Sidebar'ı açıp kapatmak için
}

function ChatContent({ onToggleSidebar }: ChatPageLoaderProps) {
  // ... (useEffect ve diğer state'ler aynı kalacak) ...
  const [config, setConfig] = useState<null | { ageGroup: string; topic: string; learningOutcome: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const chatPageRef = useRef<ChatPageRef>(null);
  const { userId: clerkUserId, isLoaded: isAuthLoaded } = useAuth();

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      console.log("ChatContent (useEffect start): isAuthLoaded:", isAuthLoaded, "Clerk User ID:", clerkUserId);
      if (isAuthLoaded) {
        if (clerkUserId) {
          console.log("ChatContent: Profil senkronizasyonu başlıyor. Clerk ID:", clerkUserId);
          try {
            const response = await fetch("/api/user/ensure-profile", {
              method: "POST",
              credentials: "include",
            });
            if (!response.ok) {
              let errorPayload;
              const responseContentType = response.headers.get("content-type");
              if (responseContentType && responseContentType.includes("application/json")) {
                errorPayload = await response.json();
              } else {
                errorPayload = { message: await response.text() };
              }
              console.error("ChatContent: Profil senkronizasyon API isteği BAŞARISIZ. Durum Kodu:", response.status, "Sunucu Yanıtı:", errorPayload);
            } else {
              const data = await response.json();
              console.log("ChatContent: Profil senkronizasyon API isteği BAŞARILI:", data);
            }
          } catch (profileError) {
            console.error("ChatContent: Profil senkronizasyonu sırasında client network/fetch hatası:", profileError);
          }
        } else {
          console.warn("ChatContent: Kullanıcı giriş yapmamış (clerkUserId yok), profil senkronizasyonu atlandı.");
        }
      } else {
        console.log("ChatContent: Clerk henüz yüklenmedi, initializeChat bekliyor.");
      }

      const ageGroupParam = searchParams.get("age");
      const topicParam = searchParams.get("topic");
      const learningOutcomeParam = searchParams.get("outcome");

      if (ageGroupParam && topicParam && learningOutcomeParam) {
        setConfig({
          ageGroup: decodeURIComponent(ageGroupParam),
          topic: decodeURIComponent(topicParam),
          learningOutcome: decodeURIComponent(learningOutcomeParam),
        });
        setError(null);
        console.log("ChatContent: Config başarıyla yüklendi:", { ageGroupParam, topicParam, learningOutcomeParam });
      } else {
        console.error("ChatContent: URL parametreleri eksik veya geçersiz. Age:", ageGroupParam, "Topic:", topicParam, "Outcome:", learningOutcomeParam);
        setError("Eksik veya geçersiz parametreler. Lütfen doğru bir link kullanın.");
        setConfig(null);
      }
      setIsLoading(false);
    };

    if (isAuthLoaded) {
      initializeChat();
    } else {
      console.log("ChatContent (useEffect trigger): Clerk henüz yüklenmedi, initializeChat çağrılmıyor.");
    }
  }, [searchParams, clerkUserId, isAuthLoaded]);


  const handleRestartChatFromHeader = () => {
    chatPageRef.current?.restartChat();
  };

  const handleSendAssignmentFromHeader = () => {
    chatPageRef.current?.sendAssignment();
  };

  if (isLoading || !isAuthLoaded) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader
          onToggleSidebar={onToggleSidebar} // Prop'u iletiyoruz
          topic="Yükleniyor..."
          onRestartChat={() => {}}
          onSendAssignment={() => {}}
        />
        <div className="flex-grow p-6 flex items-center justify-center">Sayfa ve kullanıcı bilgileri yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader
          onToggleSidebar={onToggleSidebar} // Prop'u iletiyoruz
          topic="Hata"
          onRestartChat={() => {}}
          onSendAssignment={() => {}}
        />
        <div className="flex-grow p-6 text-red-600 flex items-center justify-center">{error}</div>
      </div>
    );
  }

  if (!config) {
    return (
        <div className="flex flex-col h-full">
            <ChatHeader
              onToggleSidebar={onToggleSidebar} // Prop'u iletiyoruz
              topic="Yapılandırma bekleniyor..."
            />
            <div className="flex-grow p-6 flex items-center justify-center">Etkinlik yapılandırması yüklenemedi veya parametreler eksik.</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full flex-grow">
      <ChatHeader
        topic={config.topic}
        onRestartChat={handleRestartChatFromHeader}
        onSendAssignment={handleSendAssignmentFromHeader}
        onToggleSidebar={onToggleSidebar} // Prop'u iletiyoruz
      />
      <ChatPage
        ref={chatPageRef}
        ageGroup={config.ageGroup}
        topic={config.topic}
        learningOutcome={config.learningOutcome}
      />
    </div>
  );
}

export default function Chat({ onToggleSidebar }: ChatPageLoaderProps) {
  return (
    <Suspense fallback={<div className="flex-grow p-6 flex items-center justify-center">Sayfa içeriği yükleniyor...</div>}>
      <ChatContent onToggleSidebar={onToggleSidebar} />
    </Suspense>
  );
}