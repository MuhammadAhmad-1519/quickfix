import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { calculateCommission } from '@/lib/pricing/priceEstimates';
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

    const body = await req.json();
    const { action, finalPrice, rejectionReason } = body;

    const db = await getDatabase();
    const booking = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const now = new Date();

    // ACTION 1: Technician submits inspection price
    if (action === 'SUBMIT_PRICE') {
      if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only the assigned technician can submit the final price.' }, { status: 403 });
      }

      const priceNum = Number(finalPrice);
      if (!priceNum || priceNum <= 0) {
        return NextResponse.json({ error: 'A valid final price greater than 0 is required.' }, { status: 400 });
      }

      // Server-side commission calculation
      const { commissionAmount, technicianAmount, commissionRate } = calculateCommission(
        priceNum,
        booking.commissionRate
      );

      await db.collection('bookings').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            finalPrice: priceNum,
            commissionRate,
            commissionAmount,
            technicianAmount,
            status: 'PRICE_PENDING',
            priceSubmittedAt: now,
            updatedAt: now,
          },
        }
      );

      // Notify customer that price quote is ready for their approval
      await createNotification({
        userId: booking.customerId,
        role: 'CUSTOMER',
        title: `Price Quote Submitted: Rs. ${priceNum.toLocaleString()}`,
        message: `${booking.technicianName} completed inspection and quoted Rs. ${priceNum.toLocaleString()}. Please review and approve to begin repair.`,
        type: 'PRICE_QUOTE',
        link: `/customer/bookings/${id}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Final price submitted. Awaiting customer approval.',
        finalPrice: priceNum,
        commissionAmount,
        technicianAmount,
      });
    }

    // ACTION 2: Customer approves price
    if (action === 'APPROVE_PRICE') {
      if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only the customer can approve the final price.' }, { status: 403 });
      }

      if (booking.status !== 'PRICE_PENDING') {
        return NextResponse.json({ error: 'No price quote is currently pending approval.' }, { status: 400 });
      }

      await db.collection('bookings').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'PRICE_APPROVED',
            priceApprovedAt: now,
            updatedAt: now,
          },
        }
      );

      // Notify technician
      const tech = await db.collection<TechnicianDoc>('technicians').findOne({ _id: booking.technicianId });
      if (tech) {
        await createNotification({
          userId: tech.userId,
          role: 'TECHNICIAN',
          title: 'Customer Approved Price!',
          message: `${booking.customerName} approved your quote of Rs. ${(booking.finalPrice || 0).toLocaleString()}. You may now begin the repair.`,
          type: 'PRICE_QUOTE',
          link: `/technician/jobs/${id}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Price approved. Repair work can now begin.',
        status: 'PRICE_APPROVED',
      });
    }

    // ACTION 3: Customer rejects price
    if (action === 'REJECT_PRICE') {
      if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only the customer can reject the price quote.' }, { status: 403 });
      }

      await db.collection('bookings').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'PRICE_REJECTED',
            rejectionReason: rejectionReason || 'Price was higher than expected',
            updatedAt: now,
          },
        }
      );

      // Notify technician
      const tech = await db.collection<TechnicianDoc>('technicians').findOne({ _id: booking.technicianId });
      if (tech) {
        await createNotification({
          userId: tech.userId,
          role: 'TECHNICIAN',
          title: 'Customer Declined Price Quote',
          message: `Customer declined the quote. Reason: ${rejectionReason || 'Price disagreement'}.`,
          type: 'PRICE_QUOTE',
          link: `/technician/jobs/${id}`,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Price quote rejected.',
        status: 'PRICE_REJECTED',
      });
    }

    return NextResponse.json({ error: 'Invalid price action specified.' }, { status: 400 });
  } catch (error: any) {
    console.error('Price submission/approval error:', error);
    return NextResponse.json({ error: 'Failed to process price action.' }, { status: 500 });
  }
}
