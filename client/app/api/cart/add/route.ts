import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId, productId, quantity } = body;

        // Verify the userId matches the session user
        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${userId}`, {
            productId,
            quantity: quantity || 1
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error adding to cart:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to add to cart' },
            { status: error.response?.status || 500 }
        );
    }
}