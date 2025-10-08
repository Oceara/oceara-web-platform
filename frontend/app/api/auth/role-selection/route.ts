import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ROLES } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role } = await request.json();
    
    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/update-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        email: session.user.email,
        role: role,
        onboardingComplete: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }

    // Return success with redirect URL
    const redirectUrls = {
      [ROLES.LANDOWNER]: '/dashboard/landowner',
      [ROLES.BUYER]: '/dashboard/buyer',
      [ROLES.ADMIN]: '/dashboard/admin',
    };

    return NextResponse.json({
      success: true,
      role: role,
      redirectUrl: redirectUrls[role as keyof typeof redirectUrls],
    });

  } catch (error) {
    console.error('Role selection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
