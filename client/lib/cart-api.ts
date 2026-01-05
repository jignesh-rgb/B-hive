import apiClient from '@/lib/api';
import { getSession } from 'next-auth/react';
import { ProductInCart } from '@/app/_zustand/store';

export const cartApi = {
    /**
     * Get user's cart from backend
     */
    async getUserCart(userId: string): Promise<{
        products: ProductInCart[];
        allQuantity: number;
        total: number;
    }> {
        const session = await getSession();
        const token = (session as any)?.apiToken;

        const response = await apiClient.get(`/api/cart/${userId}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    /**
     * Add item to user's cart
     */
    async addToCart(userId: string, productId: string, quantity: number = 1): Promise<any> {
        console.log('Adding to cart:', { userId, productId, quantity });
        const session = await getSession();
        const token = (session as any)?.apiToken;

        const response = await apiClient.post(`/api/cart/${userId}`, {
            productId,
            quantity
        }, {
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    /**
     * Update cart item quantity
     */
    async updateCartItem(userId: string, productId: string, quantity: number): Promise<any> {
        const session = await getSession();
        const token = (session as any)?.apiToken;

        const response = await apiClient.put(`/api/cart/${userId}/${productId}`, {
            quantity
        }, {
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    /**
     * Remove item from cart
     */
    async removeFromCart(userId: string, productId: string): Promise<any> {
        const session = await getSession();
        const token = (session as any)?.apiToken;

        const response = await apiClient.delete(`/api/cart/${userId}/${productId}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    /**
     * Clear user's cart
     */
    async clearCart(userId: string): Promise<any> {
        const session = await getSession();
        const token = (session as any)?.apiToken;

        const response = await apiClient.delete(`/api/cart/${userId}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },
};