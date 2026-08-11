import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // 1. Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields (Name, Email, Password, Confirm Password) are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password and Confirm Password do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 2. Check if Captain email already registered
    const existingUser = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 3. Bcrypt Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create Captain User Record in Database
    const newCaptain = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
      },
    });

    console.log(`\n==========================================`);
    console.log(`👨‍✈️ [NEW CAPTAIN REGISTERED]: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Hashed Password: ${passwordHash.substring(0, 20)}...`);
    console.log(`==========================================\n`);

    return NextResponse.json({
      success: true,
      message: 'Captain registered successfully! Account is pending Admin activation.',
      captain: {
        id: newCaptain.id,
        name: newCaptain.name,
        email: newCaptain.email,
        role: 'CAPTAIN',
        status: 'INACTIVE',
      },
    });
  } catch (error) {
    console.error('Captain Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Captain registration.' },
      { status: 500 }
    );
  }
}
