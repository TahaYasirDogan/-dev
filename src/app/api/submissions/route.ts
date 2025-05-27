// app/api/submissions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/library/prisma'; // Prisma client import yolunuzu kontrol edin
import { auth } from '@clerk/nextjs/server'; // auth helper'ını import edin
import { NextRequest } from 'next/server';

// --- YENİ GÖNDERİ OLUŞTURMA (POST) ---
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth(); // getAuth(request) yerine auth() kullanın
    const body = await request.json();
    const {
      studentName,
      guestSessionId,
      topic,
      ageGroup,
      learningOutcome,
      messages,
      evaluation,
    } = body;

    if (!topic || !messages) {
      return NextResponse.json({ error: 'Eksik alanlar: topic ve messages gereklidir.' }, { status: 400 });
    }

    let student: any;

    if (clerkUserId) {
      student = await prisma.student.upsert({
        where: { clerkId: clerkUserId },
        update: { name: studentName || undefined },
        create: {
          clerkId: clerkUserId,
          name: studentName || "Kayıtlı Kullanıcı",
        },
      });
    } else if (guestSessionId) {
      if (!studentName) {
        return NextResponse.json({ error: 'Misafir kullanıcı için studentName gereklidir.' }, { status: 400 });
      }
      student = await prisma.student.upsert({
        where: { guestSessionId: guestSessionId },
        update: { name: studentName },
        create: {
          guestSessionId: guestSessionId,
          name: studentName,
        },
      });
    } else {
      return NextResponse.json({ error: 'Kullanıcı kimliği (Clerk ID veya Misafir Oturum ID) bulunamadı.' }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: student.id,
        topic,
        ageGroup,
        learningOutcome,
        messages,
        evaluation,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/submissions - Hata:', error);
    // ... (hata yönetimi) ...
    return NextResponse.json({ error: 'Ödev gönderilirken bir sunucu hatası oluştu.', details: error.message }, { status: 500 });
  }
}

// --- TÜM GÖNDERİLERİ LİSTELEME (GET) ---


export async function GET(request: NextRequest) {
  console.log("API GET /api/submissions çağrıldı.");
  try {
    const authResult = await auth(); // auth() çağrısı
    const clerkUserId = authResult.userId; // userId'yi al

    console.log("Auth Result:", authResult); // auth() ne döndürüyor?
    console.log("Clerk User ID from auth():", clerkUserId);

    const requestUrl = new URL(request.url);
    const guestSessionId = requestUrl.searchParams.get('guestSessionId');
    console.log("Guest Session ID from query:", guestSessionId);

    let studentId: string | undefined;

    if (clerkUserId) {
      console.log(`Giriş yapmış kullanıcı için studentId aranıyor: ${clerkUserId}`);
      const student = await prisma.student.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      studentId = student?.id;
      console.log("Bulunan studentId (Clerk User):", studentId);
    } else if (guestSessionId) {
      console.log(`Misafir kullanıcı için studentId aranıyor: ${guestSessionId}`);
      const student = await prisma.student.findUnique({
        where: { guestSessionId: guestSessionId },
        select: { id: true },
      });
      studentId = student?.id;
      console.log("Bulunan studentId (Guest):", studentId);
    }

    if (!studentId) {
      console.log("StudentId bulunamadı, boş dizi dönülüyor.");
      return NextResponse.json([]);
    }

    console.log(`Submission'lar studentId ile aranıyor: ${studentId}`);
    const submissions = await prisma.submission.findMany({
      where: { studentId: studentId },
      include: { student: { select: { name: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    console.log(`${submissions.length} adet submission bulundu.`);
    return NextResponse.json(submissions);

  } catch (error: any) {
    console.error('GET /api/submissions - Hata:', error);
    return NextResponse.json({ error: 'Ödevler getirilirken bir sunucu hatası oluştu.', details: error.message }, { status: 500 });
  }
}