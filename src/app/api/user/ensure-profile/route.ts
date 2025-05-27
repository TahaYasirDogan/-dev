import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/library/prisma';
import { getAuth } from '@clerk/nextjs/server'; // getAuth'u kullanıyoruz
// import { auth } from '@clerk/nextjs/server'; // auth'u yorum satırına aldık veya sildik

export async function POST(request: NextRequest) { // request parametresi burada
  console.log('[API /ensure-profile] POST isteği alındı.');
  console.log('[API /ensure-profile] İstek Başlıkları (Headers):', JSON.stringify(Object.fromEntries(request.headers.entries())));

  const cookieStore = request.cookies;
  const allCookies: { [key: string]: string } = {};
  cookieStore.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value;
  });
  console.log('[API /ensure-profile] İstek Çerezleri (Cookies):', JSON.stringify(allCookies));

  // getAuth'u request objesi ile çağır:
  const authResult = getAuth(request);
  const userId = authResult.userId;
  const sessionClaims = authResult.sessionClaims;
  // const { userId, user: clerkUserDetails, debug, sessionClaims } = auth(); // Eski auth() çağrısı

  // getAuth doğrudan user detaylarını vermez, bu yüzden clerkUserDetails'i şimdilik null yapalım
  // veya daha sonra clerkClient ile çekebiliriz. Profil senkronizasyonu için sadece userId yeterli.
  const clerkUserDetails = null; // VEYA: await clerkClient.users.getUser(userId) eğer detaylar gerekliyse

  console.log('[API /ensure-profile] getAuth() result - User ID:', userId);
  console.log('[API /ensure-profile] getAuth() result - Session Claims:', JSON.stringify(sessionClaims));

  if (!userId) {
    console.error('[API /ensure-profile] HATA: Kullanıcı doğrulanmadı. getAuth() userId döndürmedi.');
    return NextResponse.json(
      { error: 'Sunucu: Kullanıcı doğrulanmadı. Lütfen giriş yapın.', details: 'Clerk userId bulunamadı (getAuth).' },
      { status: 401 }
    );
  }

  // studentName oluşturma mantığı clerkUserDetails'e bağlı olduğu için,
  // eğer clerkUserDetails null ise bu kısmı userId'ye göre basitleştirmemiz gerekebilir.
  const studentName =
    // clerkUserDetails?.firstName || // Şimdilik bu kısımlar yorumda kalabilir
    // clerkUserDetails?.lastName ||
    // clerkUserDetails?.username ||
    // clerkUserDetails?.primaryEmailAddress?.emailAddress ||
    `Kullanıcı-${userId.slice(-6)}`; // Sadece userId ile bir isim oluşturalım

  console.log(`[API /ensure-profile] Öğrenci adı: "${studentName}". Prisma upsert işlemi başlıyor (clerkId: ${userId}).`);

  try {
    const student = await prisma.student.upsert({
      where: { clerkId: userId },
      update: {
        name: studentName,
      },
      create: {
        clerkId: userId,
        name: studentName,
      },
    });

    console.log('[API /ensure-profile] BAŞARILI: Student oluşturuldu/güncellendi:', student);
    return NextResponse.json({
      message: 'Profil başarıyla senkronize edildi.',
      student: {
        id: student.id,
        name: student.name,
        clerkId: student.clerkId,
      },
    });
  } catch (error: any) {
    console.error('[API /ensure-profile] HATA: Prisma upsert veya başka bir sunucu hatası:', error);
    // ... (hata yönetimi aynı kalabilir)
    let errorMessage = 'Profil oluşturulurken/güncellenirken sunucuda bir hata oluştu.';
    if (error.code) {
      errorMessage += ` Prisma Hata Kodu: ${error.code}`;
    }
    if (error.message) {
        errorMessage += ` Detay: ${error.message}`;
    }
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
      },
      { status: 500 }
    );
  }
}