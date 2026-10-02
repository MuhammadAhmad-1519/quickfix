import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/session';
import { chatWithAssistant } from '@/lib/ai/gemini';
import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const aiReply = await chatWithAssistant(history, message);

    // Save to conversation history if user is logged in
    const user = await getAuthenticatedUser(req);
    if (user) {
      try {
        const db = await getDatabase();
        const now = new Date();
        await db.collection('aiConversations').updateOne(
          { userId: new ObjectId(user.userId) },
          {
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: message, timestamp: now.toISOString() },
                  { role: 'assistant', content: aiReply, timestamp: new Date().toISOString() },
                ],
              },
            } as any,
            $setOnInsert: { createdAt: now },
            $set: { updatedAt: now },
          },
          { upsert: true }
        );
      } catch (saveErr) {
        console.warn('Failed to save AI conversation history:', saveErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    return NextResponse.json({
      success: true,
      reply:
        "I'm currently unable to connect to our full knowledge model, but QuickFix verified plumbers, electricians, and AC technicians in Lahore are ready for you. Tap 'What needs fixing?' to book directly!",
    });
  }
}
