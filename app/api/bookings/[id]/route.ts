import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const db = await getDatabase();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // IDOR Protection: verify user belongs to this booking
    if (user.role === 'CUSTOMER' && booking.customerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Access denied to this booking.' }, { status: 403 });
    }

    if (user.role === 'TECHNICIAN') {
      const tech = await db.collection('technicians').findOne({ userId: new ObjectId(user.userId) });
      if (!tech || booking.technicianId.toString() !== tech._id.toString()) {
        return NextResponse.json({ error: 'Access denied to this booking.' }, { status: 403 });
      }
    }

    // Fetch technician public details
    const technician = await db.collection('technicians').findOne(
      { _id: booking.technicianId },
      {
        projection: {
          name: 1,
          phone: 1,
          profilePhoto: 1,
          rating: 1,
          reviewCount: 1,
          completedJobs: 1,
          experienceYears: 1,
          serviceArea: 1,
          availability: 1,
          bio: 1,
        },
      }
    );

    // Fetch review if exists
    const review = await db.collection('reviews').findOne({ bookingId: booking._id });

    // Fetch dispute if exists
    const dispute = await db.collection('disputes').findOne({ bookingId: booking._id });

    return NextResponse.json({
      success: true,
      booking,
      technician,
      review,
      dispute,
    });
  } catch (error: any) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ error: 'Failed to retrieve booking details.' }, { status: 500 });
  }
}
