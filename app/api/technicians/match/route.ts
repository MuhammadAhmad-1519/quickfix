import { NextRequest, NextResponse } from 'next/server';
import { matchTechnicians } from '@/lib/matching/matchEngine';
import { ServiceCategory, UrgencyLevel } from '@/lib/types';
import { LAHORE_AREAS } from '@/lib/pricing/priceEstimates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      category = 'plumbing',
      urgency = 'NORMAL',
      coordinates,
      areaName,
    } = body;

    let targetCoords = coordinates;
    if (!targetCoords && areaName) {
      const matchedArea = LAHORE_AREAS.find((a) => a.name.toLowerCase().includes(areaName.toLowerCase()));
      if (matchedArea) {
        targetCoords = matchedArea.coordinates;
      }
    }

    const technicians = await matchTechnicians({
      category: category as ServiceCategory,
      coordinates: targetCoords,
      urgency: urgency as UrgencyLevel,
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      count: technicians.length,
      technicians,
      disclaimer: 'Customer must select their preferred technician. QuickFix never auto-assigns.',
    });
  } catch (error: any) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { error: 'Unable to find technicians at this moment. Please try again.' },
      { status: 500 }
    );
  }
}
