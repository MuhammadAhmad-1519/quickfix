import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { createNotification } from '@/lib/notifications/notificationService';
import { BookingDoc, BookingStatus, TechnicianDoc } from '@/lib/types';
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

    const body = await req.json();
    const { newStatus, reason } = body;

    const db = await getDatabase();
    const booking = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role verification
    let techDoc: TechnicianDoc | null = null;
    if (user.role === 'TECHNICIAN') {
      techDoc = await db.collection<TechnicianDoc>('technicians').findOne({ userId: new ObjectId(user.userId) });
      if (!techDoc || booking.technicianId.toString() !== techDoc._id!.toString()) {
        return NextResponse.json({ error: 'You are not authorized to update this booking.' }, { status: 403 });
      }
    } else if (user.role === 'CUSTOMER') {
      if (booking.customerId.toString() !== user.userId) {
        return NextResponse.json({ error: 'You are not authorized to update this booking.' }, { status: 403 });
      }
    }

    const now = new Date();
    const updateFields: any = { updatedAt: now };

    // Enforce controlled server-side state transitions
    switch (newStatus) {
      case 'ACCEPTED':
        if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Only the assigned technician can accept this booking.' }, { status: 403 });
        }
        if (booking.status !== 'AWAITING_ACCEPTANCE') {
          return NextResponse.json({ error: `Cannot accept booking in ${booking.status} status.` }, { status: 400 });
        }
        updateFields.status = 'ACCEPTED';
        updateFields.acceptedAt = now;
        await createNotification({
          userId: booking.customerId,
          role: 'CUSTOMER',
          title: 'Technician Accepted Your Request!',
          message: `${booking.technicianName} accepted booking #${booking.bookingCode}. They will travel to your location soon.`,
          type: 'BOOKING_UPDATE',
          link: `/customer/bookings/${id}`,
        });
        break;

      case 'EN_ROUTE':
        if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Only the assigned technician can mark en route.' }, { status: 403 });
        }
        if (booking.status !== 'ACCEPTED') {
          return NextResponse.json({ error: `Cannot mark en route from ${booking.status}.` }, { status: 400 });
        }
        updateFields.status = 'EN_ROUTE';
        await createNotification({
          userId: booking.customerId,
          role: 'CUSTOMER',
          title: 'Technician is On The Way!',
          message: `${booking.technicianName} is en route to ${booking.address}.`,
          type: 'BOOKING_UPDATE',
          link: `/customer/bookings/${id}`,
        });
        break;

      case 'ARRIVED':
        if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Only the assigned technician can mark arrived.' }, { status: 403 });
        }
        if (booking.status !== 'EN_ROUTE' && booking.status !== 'ACCEPTED') {
          return NextResponse.json({ error: `Cannot mark arrived from ${booking.status}.` }, { status: 400 });
        }
        updateFields.status = 'ARRIVED';
        updateFields.arrivedAt = now;
        await createNotification({
          userId: booking.customerId,
          role: 'CUSTOMER',
          title: 'Technician Has Arrived!',
          message: `${booking.technicianName} has arrived at your door for inspection.`,
          type: 'BOOKING_UPDATE',
          link: `/customer/bookings/${id}`,
        });
        break;

      case 'INSPECTION':
        if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Only the technician can start inspection.' }, { status: 403 });
        }
        updateFields.status = 'INSPECTION';
        updateFields.inspectionAt = now;
        break;

      case 'IN_PROGRESS':
        if (booking.status !== 'PRICE_APPROVED') {
          return NextResponse.json({ error: 'Repair cannot start before customer approves the final price.' }, { status: 400 });
        }
        updateFields.status = 'IN_PROGRESS';
        updateFields.startedAt = now;
        break;

      case 'COMPLETED':
        if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Only technician can mark work completed.' }, { status: 403 });
        }
        if (booking.status !== 'IN_PROGRESS' && booking.status !== 'PRICE_APPROVED') {
          return NextResponse.json({ error: `Cannot complete booking in ${booking.status} state.` }, { status: 400 });
        }
        updateFields.status = 'COMPLETED';
        updateFields.completedAt = now;
        updateFields.paymentStatus = 'PENDING';
        await createNotification({
          userId: booking.customerId,
          role: 'CUSTOMER',
          title: 'Job Completed!',
          message: `${booking.technicianName} completed the repair. Please inspect the work and confirm payment.`,
          type: 'BOOKING_UPDATE',
          link: `/customer/bookings/${id}`,
        });
        break;

      case 'CANCELLED':
        if (booking.status === 'COMPLETED' || booking.status === 'PAID') {
          return NextResponse.json({ error: 'Cannot cancel an already completed or paid booking.' }, { status: 400 });
        }
        updateFields.status = 'CANCELLED';
        updateFields.cancellationReason = reason || 'Cancelled by user';

        // Notify other party
        if (user.role === 'CUSTOMER') {
          const tech = await db.collection('technicians').findOne({ _id: booking.technicianId });
          if (tech) {
            await createNotification({
              userId: tech.userId,
              role: 'TECHNICIAN',
              title: `Booking #${booking.bookingCode} Cancelled`,
              message: `Customer cancelled the booking request. Reason: ${reason || 'Not specified'}`,
              type: 'BOOKING_UPDATE',
              link: `/technician`,
            });
          }
        } else {
          await createNotification({
            userId: booking.customerId,
            role: 'CUSTOMER',
            title: `Booking #${booking.bookingCode} Cancelled`,
            message: `Technician declined or cancelled. Reason: ${reason || 'Unavailable'}. You can choose another technician.`,
            type: 'BOOKING_UPDATE',
            link: `/customer`,
          });
        }
        break;

      default:
        return NextResponse.json({ error: `Invalid status transition: ${newStatus}` }, { status: 400 });
    }

    await db.collection('bookings').updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
