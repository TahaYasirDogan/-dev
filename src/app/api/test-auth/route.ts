// app/api/test-auth/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, sessionId, getToken } = auth();
    console.log("Test Auth API - User ID:", userId);
    console.log("Test Auth API - Session ID:", sessionId);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // const token = await getToken(); // Token'ı da almayı deneyebilirsiniz
    return NextResponse.json({ userId, sessionId /*, token */ });
  } catch (e) {
    console.error("Test Auth API - Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}