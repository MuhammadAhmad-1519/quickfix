import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { createNotification } from '@/lib/notifications/notificationService';
import { BookingDoc, DisputeDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, category, description, evidenceUrls } = body;

    if (!bookingId || !category || !description) {
      return NextResponse.json(
        { error: 'Booking ID, dispute category, and description are required.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const booking = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const now = new Date();
    const disputeDoc: DisputeDoc = {
      bookingId: new ObjectId(bookingId),
      bookingCode: booking.bookingCode,
      raisedById: new ObjectId(user.userId),
      raisedByName: user.name,
      raisedByRole: user.role,
      category,
      description: description.trim(),
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<DisputeDoc>('disputes').insertOne(disputeDoc as any);

    // Update booking status to DISPUTED
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: 'DISPUTED',
          updatedAt: now,
        },
      }
    );

    // Notify QuickFix staff / Admin
    const admins = await db.collection('users').find({ role: 'ADMIN' }).toArray();
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'ADMIN',
        title: `Dispute Raised: #${booking.bookingCode}`,
        message: `${user.name} (${user.role}) reported an issue: ${category}`,
        type: 'DISPUTE_UPDATE',
        link: `/admin/disputes`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute submitted. QuickFix resolution team will review within 24 hours.',
      disputeId: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error('Dispute submission error:', error);
    return NextResponse.json({ error: 'Failed to submit dispute.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const query: any = {};

    if (user.role === 'CUSTOMER' || user.role === 'TECHNICIAN') {
      query.raisedById = new ObjectId(user.userId);
    }
    // Admin sees all disputes

    const disputes = await db
      .collection('disputes')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, count: disputes.length, disputes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin resolve dispute endpoint
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { disputeId, status, adminResolutionNotes } = body;

    if (!disputeId || !status) {
      return NextResponse.json({ error: 'Dispute ID and status are required.' }, { status: 400 });
    }

    const db = await getDatabase();
    const now = new Date();

    const dispute = await db.collection<DisputeDoc>('disputes').findOne({ _id: new ObjectId(disputeId) });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found.' }, { status: 404 });
    }

    await db.collection('disputes').updateOne(
      { _id: new ObjectId(disputeId) },
      {
        $set: {
          status,
          adminResolutionNotes: adminResolutionNotes || 'Resolved by QuickFix Administration.',
          resolvedAt: now,
          updatedAt: now,
        },
      }
    );

    // Notify person who raised dispute
    await createNotification({
      userId: dispute.raisedById,
      role: dispute.raisedByRole,
      title: `Dispute Updated: ${status}`,
      message: `Admin resolution: ${adminResolutionNotes || 'Your dispute has been updated.'}`,
      type: 'DISPUTE_UPDATE',
      link: dispute.raisedByRole === 'CUSTOMER' ? `/customer/bookings/${dispute.bookingId}` : `/technician`,
    });

    return NextResponse.json({
      success: true,
      message: `Dispute status updated to ${status}.`,
    });
  } catch (error: any) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json({ error: 'Failed to update dispute.' }, { status: 500 });
  }
}
