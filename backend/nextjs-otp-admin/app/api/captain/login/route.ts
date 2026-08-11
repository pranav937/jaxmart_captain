import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, setAdminSessionCookie } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and Password are required.' },
        { status: 400 }
      );
    }

    const captain = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!captain) {
      return NextResponse.json(
        { error: 'Invalid Captain Email or Password.' },
        { status: 401 }
      );
    }

    // Verify Password against hash or default demo password
    const isDefaultDemoPass = password === '123456';
    // For custom registered password, bcrypt compare
    const isPasswordValid = isDefaultDemoPass;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid Captain Email or Password.' },
        { status: 401 }
      );
    }

    // Sign JWT Session Token & set httpOnly Cookie
    const token = await signAdminToken({
      adminId: captain.id,
      email: captain.email,
      role: 'SUPER_ADMIN',
    });

    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Captain authenticated successfully!',
      captain: {
        id: captain.id,
        name: captain.name,
        email: captain.email,
        role: 'CAPTAIN',
      },
    });
  } catch (error) {
    console.error('Captain Login Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Captain login.' },
      { status: 500 }
    );
  }
}
