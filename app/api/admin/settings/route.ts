import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { DEFAULT_COMMISSION_RATE } from '@/lib/pricing/priceEstimates';
import { AdminSettingsDoc } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const db = await getDatabase();
    let settings = await db.collection<AdminSettingsDoc>('adminSettings').findOne({});

    if (!settings) {
      // Initialize default admin settings
      const defaultSettings: AdminSettingsDoc = {
        commissionRate: DEFAULT_COMMISSION_RATE,
        launchCity: 'Lahore',
        emergencyFeeMultiplier: 1.5,
        supportedCategories: ['plumbing', 'electrical', 'ac_repair'],
        contactPhone: '+92 300 0000000',
        contactEmail: 'support@quickfix.local',
        updatedAt: new Date(),
        auditLogs: [],
      };
      await db.collection('adminSettings').insertOne(defaultSettings as any);
      settings = defaultSettings;
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { commissionRate, emergencyFeeMultiplier, supportedCategories } = body;

    const db = await getDatabase();
    const updateFields: any = { updatedAt: new Date() };

    if (typeof commissionRate === 'number' && commissionRate >= 0 && commissionRate <= 0.5) {
      updateFields.commissionRate = commissionRate;
    }
    if (typeof emergencyFeeMultiplier === 'number') {
      updateFields.emergencyFeeMultiplier = emergencyFeeMultiplier;
    }
    if (Array.isArray(supportedCategories)) {
      updateFields.supportedCategories = supportedCategories;
    }

    const now = new Date();
    await db.collection('adminSettings').updateOne(
      {},
      {
        $set: updateFields,
        $push: {
          auditLogs: {
            adminId: user.userId,
            action: 'SETTINGS_UPDATE',
            details: `Updated settings: ${JSON.stringify(updateFields)}`,
            timestamp: now,
          },
        } as any,
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
