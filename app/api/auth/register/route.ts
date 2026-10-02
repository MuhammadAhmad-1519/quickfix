import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth/session';
import { UserDoc, TechnicianDoc } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role = 'CUSTOMER',
      name,
      email,
      phone,
      password,
      // Technician specific fields:
      services,
      experienceYears,
      cnic,
      serviceArea,
      skills,
      bio,
    } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Name, email, phone, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const db = await getDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.collection<UserDoc>('users').findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    const newUser: UserDoc = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      role: role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    const userResult = await db.collection<UserDoc>('users').insertOne(newUser as any);
    const userId = userResult.insertedId;

    // If Technician, create technician application document
    if (role === 'TECHNICIAN') {
      const technicianDoc: TechnicianDoc = {
        userId: userId,
        name: name.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        services: Array.isArray(services) && services.length > 0 ? services : ['plumbing'],
        skills: Array.isArray(skills) ? skills : ['General home maintenance'],
        experienceYears: Number(experienceYears) || 2,
        cnic: cnic || '35201-0000000-0',
        verificationStatus: 'PENDING', // Prompt requirement: Starts as PENDING for admin review
        rating: 5.0,
        reviewCount: 0,
        completedJobs: 0,
        serviceArea: serviceArea || 'Gulberg, Lahore',
        location: {
          type: 'Point',
          coordinates: [74.3436, 31.5204],
          address: serviceArea ? `${serviceArea}, Lahore` : 'Gulberg, Lahore',
        },
        availability: 'AVAILABLE_NOW',
        emergencyAvailable: true,
        priceEstimateMin: 1500,
        priceEstimateMax: 3500,
        bio: bio || 'Professional verified technician ready to assist.',
        createdAt: now,
        updatedAt: now,
      };

      await db.collection<TechnicianDoc>('technicians').insertOne(technicianDoc as any);
    }

    const token = await signToken({
      userId: userId.toString(),
      role: newUser.role,
      email: newUser.email,
      name: newUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
