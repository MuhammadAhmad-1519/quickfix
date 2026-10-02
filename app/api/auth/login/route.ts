import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth/session';
import { UserDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const db = await getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.collection<UserDoc>('users').findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact QuickFix support.' }, { status: 403 });
    }

    const token = await signToken({
      userId: user._id!.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    // Determine redirect destination based on role
    let redirectPath = '/customer';
    if (user.role === 'TECHNICIAN') redirectPath = '/technician';
    if (user.role === 'ADMIN') redirectPath = '/admin';

    const response = NextResponse.json({
      success: true,
      redirectPath,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please check your network and try again.' }, { status: 500 });
  }
}
