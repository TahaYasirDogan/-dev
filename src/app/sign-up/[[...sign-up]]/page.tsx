// SignUpPage/page.tsx (Basitleştirilmiş Örnek)
"use client";

import SkeletonForm from "@/app/components/SkeletonForm";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, Suspense } from "react";

// SignUpForm'u dinamik olarak import etmeye devam edebilirsiniz
const SignUpFormComponent = dynamic(() => import("./SignUpForm"), { 
  ssr: false,
  loading: () => <SkeletonForm /> // Suspense yerine loading prop'u da kullanılabilir
});
//const SignInModal = dynamic(() => import("../../components/SignInModal"), { 
//  ssr: false,
  // loading: () => <p>Giriş yükleniyor...</p> 
// });

export default function SignUpPage() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <div className="min-h-screen md:pt-0 pt-20 md:flex grid-cols-3 items-center justify-center bg-gray-50 px-4 py-8">
      <div className="md:px-0 px-12">
        <Image src="/signup.png" alt="Platform Kayıt" width={600} height={600} priority={false} quality={75} />
      </div>
      <div className="col-span-2">
        {/* Clerk Elements'in captcha'sı için bir div gerekebilir, Clerk dökümantasyonunu kontrol edin */}
        {/* <div id="clerk-captcha" style={{ display: "none" }}></div> */}
        
        {/* Suspense kullanmak hala iyi bir pratik olabilir, özellikle SignUpFormComponent büyükse */}
        <Suspense fallback={<SkeletonForm />}>
          <SignUpFormComponent setIsOpenModal={setIsSignInModalOpen} />
        </Suspense>
      </div>
      {isSignInModalOpen && <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />}
    </div>
  );
}