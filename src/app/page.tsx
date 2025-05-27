// app/page.tsx
"use client";
import Image from 'next/image'; 

import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs'; // Sadece SignedIn ve SignedOut yeterli

export default function HomePage() {
  return (
    <div className="bg-[#FFFCF5] min-h-[calc(100vh-4rem)] flex flex-col items-center  text-center p-8">
      <Image src="/sohbet.svg" alt="sohbet Logo" width={600} height={600}  className='py-6'/> 
      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        İnteraktif Öğrenmeye Hoş Geldiniz!
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl">
        Yapay Zeka ile Sohbet Ederek Öğrenin, Kendi Etkileşimli Derslerinizi Saniyeler İçinde Oluşturun, paylaşın ve takip edin!
        
      </p>

      <SignedIn> {/* Kullanıcı giriş yapmışsa butonları göster */}
        <div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row">
          <Link
            href="/SetupForm" // Etkinlik oluşturma sayfasının yolu
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
          >
            Hızlı Etkinlik Oluştur
          </Link>
          <Link
            href="/create-classroom" // Sınıf oluşturma/yönetme sayfasının yolu
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
          >
            Sanal Sınıf Yönetimi
          </Link>
        </div>
        <div className="mt-8">
            <Link 
                href="/dashboard"
                className="text-green-600 hover:text-green-800 font-semibold text-lg"
            >
                Panelime Git →
            </Link>
        </div>
      </SignedIn>

      <SignedOut> {/* Kullanıcı giriş yapmamışsa mesaj göster */}
        <div className="mt-12">
          <p className="text-lg text-gray-700 mb-4">
            Platformun tüm özelliklerinden faydalanmak için lütfen giriş yapın veya kaydolun.
          </p>
          {/* Navbar'da zaten giriş/kayıt butonları olduğu için burada tekrar eklemeye gerek yok,
              ancak isterseniz bir çağrı butonu daha ekleyebilirsiniz. */}
          <Link
            href="/sign-up"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-md shadow-lg transition duration-150 ease-in-out"
          >
            Hemen Ücretsiz Kaydol!
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}