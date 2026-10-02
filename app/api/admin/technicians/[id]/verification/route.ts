import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { createNotification } from '@/lib/notifications/notificationService';
import { VerificationStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid technician ID' }, { status: 400 });
    }

    const body = await req.json();
    const { action, notes } = body; // action: 'APPROVE', 'REJECT', 'SUSPEND', 'UNDER_REVIEW'

    let newStatus: VerificationStatus = 'VERIFIED';
    if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'SUSPEND') newStatus = 'SUSPENDED';
    else if (action === 'UNDER_REVIEW') newStatus = 'UNDER_REVIEW';

    const db = await getDatabase();
    const tech = await db.collection('technicians').findOne({ _id: new ObjectId(id) });

    if (!tech) {
      return NextResponse.json({ error: 'Technician not found.' }, { status: 404 });
    }

    const now = new Date();

    // Update verification status and admin notes
    await db.collection('technicians').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          verificationStatus: newStatus,
          'verificationDocuments.adminNotes': notes || `Updated to ${newStatus} by admin`,
          updatedAt: now,
        },
      }
    );

    // Audit log
    await db.collection('adminSettings').updateOne(
      {},
      {
        $push: {
          auditLogs: {
            adminId: admin.userId,
            action: `TECHNICIAN_${action}`,
            targetId: id,
            details: `Technician ${tech.name} status changed to ${newStatus}. Notes: ${notes || 'None'}`,
            timestamp: now,
          },
        } as any,
      },
      { upsert: true }
    );

    // Notify technician
    await createNotification({
      userId: tech.userId,
      role: 'TECHNICIAN',
      title: `Application Status: ${newStatus}`,
      message:
        newStatus === 'VERIFIED'
          ? 'Congratulations! Your profile has been verified. You can now receive job requests from Lahore customers!'
          : `Your QuickFix profile status is now ${newStatus}. Notes: ${notes || 'Contact support for details.'}`,
      type: 'VERIFICATION_UPDATE',
      link: '/technician',
    });

    return NextResponse.json({
      success: true,
      message: `Technician status updated to ${newStatus}`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Technician verification error:', error);
    return NextResponse.json({ error: 'Failed to update technician verification.' }, { status: 500 });
  }
}
