import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { createNotification } from '@/lib/notifications/notificationService';
import { BookingDoc, TechnicianDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function POST(
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
    const booking = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: `Cannot record payment for booking in ${booking.status} state.` }, { status: 400 });
    }

    const now = new Date();

    // Update booking status to PAID
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
          paymentMethod: 'CASH',
          paidAt: now,
          updatedAt: now,
        },
      }
    );

    // Increment technician completed jobs count
    await db.collection('technicians').updateOne(
      { _id: booking.technicianId },
      {
        $inc: { completedJobs: 1 },
      }
    );

    // Notify customer
    await createNotification({
      userId: booking.customerId,
      role: 'CUSTOMER',
      title: 'Payment Recorded & Job Closed',
      message: `Cash payment of Rs. ${(booking.finalPrice || 0).toLocaleString()} recorded. Please rate your technician to help the Lahore community!`,
      type: 'PAYMENT',
      link: `/customer/bookings/${id}`,
    });

    // Notify technician
    const tech = await db.collection<TechnicianDoc>('technicians').findOne({ _id: booking.technicianId });
    if (tech) {
      await createNotification({
        userId: tech.userId,
        role: 'TECHNICIAN',
        title: 'Payment Confirmed',
        message: `Cash payment of Rs. ${(booking.finalPrice || 0).toLocaleString()} confirmed for booking #${booking.bookingCode}.`,
        type: 'PAYMENT',
        link: `/technician`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully.',
      status: 'PAID',
    });
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
  }
}
