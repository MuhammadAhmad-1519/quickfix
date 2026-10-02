import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { getPriceEstimate, DEFAULT_COMMISSION_RATE } from '@/lib/pricing/priceEstimates';
import { createNotification } from '@/lib/notifications/notificationService';
import { BookingDoc, BookingStatus, TechnicianDoc, AdminSettingsDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can book a technician.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      technicianId,
      serviceRequestId,
      serviceCategory,
      problemType,
      description,
      address,
      urgency = 'NORMAL',
    } = body;

    if (!technicianId || !serviceCategory) {
      return NextResponse.json({ error: 'Technician and service category are required.' }, { status: 400 });
    }

    const db = await getDatabase();

    // Verify technician exists and is VERIFIED
    const tech = await db.collection<TechnicianDoc>('technicians').findOne({
      _id: new ObjectId(technicianId),
      verificationStatus: 'VERIFIED',
    });

    if (!tech) {
      return NextResponse.json({ error: 'Selected technician is not available or unverified.' }, { status: 404 });
    }

    // Fetch dynamic commission rate from admin settings
    const adminSettings = await db.collection<AdminSettingsDoc>('adminSettings').findOne({});
    const commissionRate = adminSettings?.commissionRate || DEFAULT_COMMISSION_RATE;

    const priceEstimate = getPriceEstimate(serviceCategory, problemType);
    const bookingCode = 'QF-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();

    const newBooking: BookingDoc = {
      bookingCode,
      customerId: new ObjectId(user.userId),
      customerName: user.name,
      customerPhone: body.customerPhone || '0300-1234567',
      technicianId: tech._id!,
      technicianName: tech.name,
      technicianPhone: tech.phone,
      serviceRequestId: serviceRequestId ? new ObjectId(serviceRequestId) : new ObjectId(),
      serviceCategory,
      problemType: problemType || 'Service Request',
      description: description || 'Home service request',
      urgency,
      address: address || 'Lahore, Pakistan',
      status: 'AWAITING_ACCEPTANCE',
      estimatedPriceMin: priceEstimate.min,
      estimatedPriceMax: priceEstimate.max,
      commissionRate,
      paymentMethod: 'CASH',
      paymentStatus: 'PENDING',
      scheduledAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<BookingDoc>('bookings').insertOne(newBooking as any);
    const bookingId = result.insertedId;

    // Send in-app notification to technician
    await createNotification({
      userId: tech.userId,
      role: 'TECHNICIAN',
      title: `New Job Request (${bookingCode})`,
      message: `${user.name} selected you for ${serviceCategory} (${problemType || 'repair'}) in ${address || 'Lahore'}.`,
      type: 'BOOKING_UPDATE',
      link: `/technician/jobs/${bookingId.toString()}`,
    });

    // Send in-app notification to customer
    await createNotification({
      userId: user.userId,
      role: 'CUSTOMER',
      title: `Booking Request Sent to ${tech.name}`,
      message: `Your request #${bookingCode} has been sent to ${tech.name}. Awaiting technician acceptance.`,
      type: 'BOOKING_UPDATE',
      link: `/customer/bookings/${bookingId.toString()}`,
    });

    return NextResponse.json({
      success: true,
      bookingId: bookingId.toString(),
      bookingCode,
      booking: { ...newBooking, _id: bookingId.toString() },
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = await getDatabase();
    const query: any = {};

    if (user.role === 'CUSTOMER') {
      query.customerId = new ObjectId(user.userId);
    } else if (user.role === 'TECHNICIAN') {
      // Find technician record for this user
      const tech = await db.collection('technicians').findOne({ userId: new ObjectId(user.userId) });
      if (tech) {
        query.technicianId = tech._id;
      } else {
        return NextResponse.json({ bookings: [] });
      }
    }
    // If ADMIN: sees all bookings

    if (status) {
      query.status = status;
    }

    const bookings = await db
      .collection('bookings')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, count: bookings.length, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
