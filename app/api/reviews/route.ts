import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { createNotification } from '@/lib/notifications/notificationService';
import { BookingDoc, ReviewDoc, TechnicianDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can submit reviews.' }, { status: 403 });
    }

    const body = await req.json();
    const { bookingId, rating, comment } = body;

    if (!bookingId || !rating) {
      return NextResponse.json({ error: 'Booking ID and rating are required.' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    const db = await getDatabase();
    const booking = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.customerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'You can only review your own bookings.' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'PAID') {
      return NextResponse.json({ error: 'You can only review a completed job.' }, { status: 400 });
    }

    // Check if review already exists
    const existing = await db.collection<ReviewDoc>('reviews').findOne({ bookingId: new ObjectId(bookingId) });
    if (existing) {
      return NextResponse.json({ error: 'A review has already been submitted for this booking.' }, { status: 409 });
    }

    const now = new Date();
    const reviewDoc: ReviewDoc = {
      bookingId: new ObjectId(bookingId),
      customerId: new ObjectId(user.userId),
      customerName: user.name,
      technicianId: booking.technicianId,
      rating: numRating,
      comment: comment?.trim() || '',
      createdAt: now,
    };

    await db.collection<ReviewDoc>('reviews').insertOne(reviewDoc as any);

    // Recalculate technician rating
    const allTechReviews = await db
      .collection<ReviewDoc>('reviews')
      .find({ technicianId: booking.technicianId })
      .toArray();

    const totalStars = allTechReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
    const avgRating = Math.round((totalStars / allTechReviews.length) * 10) / 10;

    await db.collection<TechnicianDoc>('technicians').updateOne(
      { _id: booking.technicianId },
      {
        $set: {
          rating: avgRating,
          reviewCount: allTechReviews.length,
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
        title: `New ${numRating}★ Review Received`,
        message: `${user.name} rated you ${numRating} stars: "${comment ? comment.substring(0, 60) + '...' : 'Great job!'}"`,
        type: 'BOOKING_UPDATE',
        link: `/technician`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been published.',
      rating: numRating,
    });
  } catch (error: any) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const technicianId = searchParams.get('technicianId');

    const db = await getDatabase();
    const query: any = {};
    if (technicianId) {
      query.technicianId = new ObjectId(technicianId);
    }

    const reviews = await db
      .collection('reviews')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
