import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db/mongodb';
import { analyzeProblem } from '@/lib/ai/gemini';
import { ServiceRequestDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to submit a service request.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      serviceCategory,
      problemType,
      description,
      images,
      area,
      address,
      coordinates,
      urgency = 'NORMAL',
    } = body;

    if (!serviceCategory || !description || !area) {
      return NextResponse.json(
        { error: 'Service category, problem description, and location area are required.' },
        { status: 400 }
      );
    }

    // Call Gemini AI triage
    const aiAnalysis = await analyzeProblem({
      category: serviceCategory,
      problemType,
      description,
      urgency,
    });

    const db = await getDatabase();
    const now = new Date();

    const requestDoc: ServiceRequestDoc = {
      customerId: new ObjectId(user.userId),
      customerName: user.name,
      customerPhone: body.phone || '0300-1234567',
      serviceCategory,
      problemType: problemType || 'General Repair',
      description,
      images: Array.isArray(images) ? images : [],
      location: {
        address: address || `${area}, Lahore`,
        area: area || 'Gulberg',
        city: 'Lahore',
        coordinates: coordinates || [74.3436, 31.5204],
      },
      urgency,
      aiAnalysis,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection<ServiceRequestDoc>('serviceRequests').insertOne(requestDoc as any);

    return NextResponse.json({
      success: true,
      serviceRequestId: result.insertedId.toString(),
      request: {
        ...requestDoc,
        _id: result.insertedId.toString(),
      },
      aiAnalysis,
    });
  } catch (error: any) {
    console.error('Service request error:', error);
    return NextResponse.json(
      { error: 'Failed to process service request. Please try again.' },
      { status: 500 }
    );
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
    if (user.role === 'CUSTOMER') {
      query.customerId = new ObjectId(user.userId);
    }

    const requests = await db
      .collection('serviceRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
