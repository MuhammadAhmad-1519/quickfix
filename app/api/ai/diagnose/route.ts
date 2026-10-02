import { NextRequest, NextResponse } from 'next/server';
import { analyzeProblem } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, problemType, description, urgency } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required for triage.' }, { status: 400 });
    }

    const analysis = await analyzeProblem({
      category,
      problemType,
      description,
      urgency,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('AI Diagnose API error:', error);
    return NextResponse.json(
      {
        success: false,
        analysis: {
          suggestedCategory: 'plumbing',
          possibleIssue: 'Preliminary symptom assessment based on user input.',
          suggestedNextStep: 'Keep the affected area isolated and request verified inspection.',
          professionalRecommended: true,
          urgencySuggestion: 'NORMAL',
          disclaimer: 'QuickFix AI provides initial triage only. This is not a professional on-site diagnosis.',
        },
      },
      { status: 200 } // Graceful 200 fallback so UI never breaks
    );
  }
}
