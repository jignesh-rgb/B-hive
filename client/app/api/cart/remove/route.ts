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
        const { userId, productId } = body;

        if (!userId || !productId) {
            return NextResponse.json({ error: 'User ID and Product ID required' }, { status: 400 });
        }

        // Verify the userId matches the session user
        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
        }

        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${userId}/${productId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error removing from cart:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to remove from cart' },
            { status: error.response?.status || 500 }
        );
    }
}