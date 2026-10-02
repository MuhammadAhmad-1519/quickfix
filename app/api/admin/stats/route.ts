import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const db = await getDatabase();

    const [
      totalCustomers,
      totalTechnicians,
      verifiedTechnicians,
      pendingTechnicians,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      openDisputes,
    ] = await Promise.all([
      db.collection('users').countDocuments({ role: 'CUSTOMER' }),
      db.collection('technicians').countDocuments({}),
      db.collection('technicians').countDocuments({ verificationStatus: 'VERIFIED' }),
      db.collection('technicians').countDocuments({ verificationStatus: 'PENDING' }),
      db.collection('bookings').countDocuments({}),
      db.collection('bookings').countDocuments({
        status: { $in: ['REQUESTED', 'AWAITING_ACCEPTANCE', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'INSPECTION', 'PRICE_PENDING', 'PRICE_APPROVED', 'IN_PROGRESS'] },
      }),
      db.collection('bookings').countDocuments({ status: { $in: ['COMPLETED', 'PAID'] } }),
      db.collection('bookings').countDocuments({ status: 'CANCELLED' }),
      db.collection('disputes').countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
    ]);

    // Financial calculations from completed/paid bookings
    const financialAggregation = await db
      .collection('bookings')
      .aggregate([
        { $match: { status: { $in: ['COMPLETED', 'PAID'] } } },
        {
          $group: {
            _id: null,
            totalGMV: { $sum: '$finalPrice' },
            totalCommission: { $sum: '$commissionAmount' },
            totalTechPayout: { $sum: '$technicianAmount' },
          },
        },
      ])
      .toArray();

    const gmv = financialAggregation[0]?.totalGMV || 0;
    const commission = financialAggregation[0]?.totalCommission || 0;
    const techPayout = financialAggregation[0]?.totalTechPayout || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        totalTechnicians,
        verifiedTechnicians,
        pendingTechnicians,
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        openDisputes,
        gmv,
        commission,
        techPayout,
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
