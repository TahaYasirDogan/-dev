// app/api/submissions/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/library/prisma'; // Prisma client import yolunuzu kontrol edin
import { auth } from '@clerk/nextjs/server'; // auth helper'ını import edin
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest, // NextRequest tipini kullanın
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = auth(); // getAuth yerine auth()
    const submissionId = params.id;


    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: { name: true, clerkId: true, guestSessionId: true },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Ödev bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json(submission);
  } catch (error: any) {
    console.error(`GET /api/submissions/${params.id} - Hata:`, error);
    return NextResponse.json({ error: 'Ödev detayları getirilirken bir sunucu hatası oluştu.', details: error.message }, { status: 500 });
  }
}