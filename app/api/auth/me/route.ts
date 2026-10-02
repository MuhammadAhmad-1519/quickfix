import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getAuthenticatedUser(req);
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(sessionUser.userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let technicianData = null;
    if (user.role === 'TECHNICIAN') {
      technicianData = await db.collection('technicians').findOne({ userId: user._id });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        technician: technicianData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
