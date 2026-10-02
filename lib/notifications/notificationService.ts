import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';
import { NotificationDoc, UserRole } from '../types';

export async function createNotification(params: {
  userId: string | ObjectId;
  role: UserRole;
  title: string;
  message: string;
  type: NotificationDoc['type'];
  link?: string;
}) {
  try {
    const db = await getDatabase();
    const doc: NotificationDoc = {
      userId: typeof params.userId === 'string' ? new ObjectId(params.userId) : params.userId,
      role: params.role,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      read: false,
      createdAt: new Date(),
    };
    await db.collection('notifications').insertOne(doc as any);
  } catch (err: any) {
    console.error('Failed to create notification:', err.message);
  }
}
