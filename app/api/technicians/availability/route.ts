import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { AvailabilityStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Technician access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { availability, emergencyAvailable } = body;

    const db = await getDatabase();
    const updateData: any = { updatedAt: new Date() };

    if (availability) {
      updateData.availability = availability as AvailabilityStatus;
    }
    if (typeof emergencyAvailable === 'boolean') {
      updateData.emergencyAvailable = emergencyAvailable;
    }

    const result = await db.collection('technicians').updateOne(
      { userId: new ObjectId(user.userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Technician profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully.',
      availability,
      emergencyAvailable,
    });
  } catch (error: any) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability.' }, { status: 500 });
  }
}
