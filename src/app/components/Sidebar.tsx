// app/components/Sidebar.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { FiMessageSquare, FiPlusCircle, FiLoader, FiAlertTriangle, FiChevronRight, FiLogIn } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { GoSidebarExpand } from 'react-icons/go';

// localStorage'dan misafir oturum ID'sini almak için anahtar
const GUEST_SESSION_ID_KEY = 'chatAppGuestSessionId'; 

interface ChatSession {
  id: string;
  topic: string;
  ageGroup: string;
  learningOutcome: string;
  lastActivityAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // onStartNewChat?: () => void; // Bu prop'u ChatPage'den alabilirsiniz
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userId: clerkUserId, isLoaded: isAuthLoaded } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false); // Başlangıçta false, veri çekilirken true
  const [error, setError] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Component mount olduğunda localStorage'dan guestSessionId'yi oku
  useEffect(() => {
    const storedGuestId = localStorage.getItem(GUEST_SESSION_ID_KEY);
    if (storedGuestId) {
      setGuestSessionId(storedGuestId);
    }
  }, []);

  const fetchChatSessions = useCallback(async () => {
    // Hem Clerk auth durumu hem de guestSessionId state'i güncellendiğinde tetiklenebilir,
    // bu yüzden ikisinin de hazır olmasını bekleyebiliriz veya koşulları iyi yönetmeliyiz.
    if (!isAuthLoaded) return; // Clerk yüklenmediyse bekle

    let queryParams = "";
    let canFetch = false;

    if (clerkUserId) {
      // Kullanıcı giriş yapmış, API'nin sunucudan aldığı clerkUserId'yi kullanmasını bekleyeceğiz.
      // API endpoint'i /api/submissions (GET) bu durumu ele almalı.
      // Client'tan ayrıca userId göndermeye gerek yok, getAuth(request) ile alınacak.
      queryParams = ""; // Veya API'niz özel bir parametre bekliyorsa (örn: type=clerk)
      canFetch = true;
      console.log("Fetching sessions for Clerk user:", clerkUserId);
    } else if (guestSessionId) {
      // Kullanıcı giriş yapmamış ama misafir oturum ID'si var
      queryParams = `?guestSessionId=${guestSessionId}`;
      canFetch = true;
      console.log("Fetching sessions for Guest user:", guestSessionId);
    } else {
      // Ne giriş yapmış ne de misafir ID'si var (henüz)
      console.log("No user or guest session ID to fetch sessions.");
      setChatSessions([]);
      setLoading(false);
      return;
    }

    if (!canFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/submissions${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Sohbet geçmişi yüklenirken bir hata oluştu.');
      }
      const data = await response.json();

      const formattedSessions: ChatSession[] = data.map((submission: any) => ({
        id: submission.id,
        topic: submission.topic,
        learningOutcome: submission.learningOutcome,
        lastActivityAt: submission.submittedAt || submission.updatedAt || new Date().toISOString(),
      })).sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

      setChatSessions(formattedSessions);
    } catch (err: any) {
      setError(err.message);
      setChatSessions([]); // Hata durumunda listeyi boşalt
    } finally {
      setLoading(false);
    }
  }, [clerkUserId, isAuthLoaded, guestSessionId]); // guestSessionId'yi bağımlılığa ekle

  useEffect(() => {
    // isAuthLoaded true olduğunda ve clerkUserId veya guestSessionId değiştiğinde fetch et
    if (isAuthLoaded) {
        fetchChatSessions();
    }
  }, [isAuthLoaded, fetchChatSessions]); // fetchChatSessions artık useCallback ile memoize edildi


  if (!isOpen) {
    return null;
  }

  const hasActiveSession = clerkUserId || guestSessionId;

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 bg-gray-800 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        w-72
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-semibold">Sohbetlerim</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-1 rounded-full"
          aria-label="Kenar çubuğunu kapat"
        >
          <GoSidebarExpand size={30}/>

        </button>
      </div>

     

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {!isAuthLoaded && ( // Clerk yüklenirken
            <div className="flex items-center justify-center text-gray-400 py-4">
                <FiLoader className="animate-spin mr-2" /> Kullanıcı durumu kontrol ediliyor...
            </div>
        )}

        {isAuthLoaded && loading && (
          <div className="flex items-center justify-center text-gray-400 py-4">
            <FiLoader className="animate-spin mr-2" /> Sohbetler yükleniyor...
          </div>
        )}
        {isAuthLoaded && error && (
          <div className="text-red-400 bg-red-900/30 p-3 rounded-md flex items-center">
            <FiAlertTriangle className="mr-2 flex-shrink-0" /> <span>{error}</span>
          </div>
        )}
        
        {isAuthLoaded && !loading && !error && !hasActiveSession && (
            <div className="text-gray-400 text-center py-4 px-2">
                <FiLogIn size={24} className="mx-auto mb-2" />
                <p className="text-sm mb-2">Geçmiş sohbetlerinizi görmek ve kaydetmek için lütfen giriş yapın.</p>
                <p className="text-xs">Giriş yapmadan başlattığınız sohbetler bu tarayıcıda geçici olarak saklanabilir.</p>
            </div>
        )}

        {isAuthLoaded && !loading && !error && hasActiveSession && chatSessions.length === 0 && (
          <p className="text-gray-400 text-center py-4">Henüz bir sohbet başlatmadınız.</p>
        )}

        {isAuthLoaded && !loading && !error && hasActiveSession && chatSessions.map((session) => {
          const chatLinkParams = new URLSearchParams({
            
            topic: session.topic,
            outcome: session.learningOutcome,
            // ÖNEMLİ: ChatPage'in bu session ID'yi kullanarak doğru oturumu yüklemesi için
            // ChatPage ve localStorage mantığınızı güncellemeniz gerekebilir.
            // Veya API'den submission ID'yi alıp, ChatPage'e bu ID ile gitmesini sağlayabilirsiniz.
            // Şimdilik sadece parametreleri iletiyoruz.
            // sessionId: session.id, // Eğer ChatPage bunu kullanacaksa
          }).toString();
          const chatLink = `/chat?${chatLinkParams}`;

          return (
            <Link
              href={chatLink}
              key={session.id}
              onClick={onClose}
              className="block p-3 rounded-lg hover:bg-gray-700 transition-colors group"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-100 group-hover:text-white truncate w-4/5">
                  {session.topic}
                </h3>
                <FiChevronRight className="text-gray-500 group-hover:text-gray-300 flex-shrink-0" />
              </div>
              
              <p className="text-xs text-gray-500 group-hover:text-gray-300 mt-0.5">
                {formatDistanceToNow(new Date(session.lastActivityAt), { addSuffix: true, locale: tr })}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}