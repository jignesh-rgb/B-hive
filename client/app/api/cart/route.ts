import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify the userId matches the session user
    if (userId !== session.user.id) {
        return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching cart:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to fetch cart' },
            { status: error.response?.status || 500 }
        );
    }
}