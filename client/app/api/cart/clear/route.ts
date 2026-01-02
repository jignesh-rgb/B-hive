import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Verify the userId matches the session user
        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
        }

        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error clearing cart:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to clear cart' },
            { status: error.response?.status || 500 }
        );
    }
}