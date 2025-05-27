// app/components/Navbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Logonuz için
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useState } from 'react';


export default function Navbar() {
  const pathname = usePathname();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center"> {/* <a> kaldırıldı */}
                <Image src="/logo.svg" alt="Platform Logo" width={40} height={40} className='pb-2' /> 
                <span className="ml-1 text-3xl font-bold text-orange-600">lass.ai</span>
              </Link>
            </div>

            {/* Navigasyon Linkleri ve Butonlar */}
            <div className="flex items-center space-x-4">
              <SignedIn> {/* Kullanıcı giriş yapmışsa */}
                {/* Herkesin görebileceği genel linkler veya kullanıcıya özel linkler buraya eklenebilir */}
                <Link
                  href="/dashboard" // Genel bir kullanıcı paneli yolu
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "text-orange-600 font-semibold"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  Panelim
                </Link>
                <Link
                  href="/profil" // Profil sayfanızın yolu
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/profil"
                      ? "text-orange-600 font-semibold"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  Profil
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <SignedOut> {/* Kullanıcı giriş yapmamışsa */}
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Giriş Yap
                </button>
                <Link
                  href="/sign-up" // Özel kayıt sayfanızın yolu
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Kayıt Ol
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Giriş Modalınız */}
      <SignedOut>
        {isSignInModalOpen && (
          <SignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
            afterSignInUrl="/dashboard" // Başarılı giriş sonrası genel panele yönlendir
          />
        )}
      </SignedOut>
    </>
  );
}