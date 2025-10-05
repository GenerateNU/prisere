import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  await checkAuthenticated(request);
  return await updateSession(request)
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

async function checkAuthenticated(request: NextRequest){
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser()
  if ((error || !data?.user) && (request.nextUrl.pathname !== '(/login' || '/register')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}