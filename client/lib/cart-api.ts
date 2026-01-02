import apiClient from '@/lib/api';
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
        const response = await apiClient.get(`/api/cart?userId=${userId}`);
        return response.data;
    },

    /**
     * Add item to user's cart
     */
    async addToCart(userId: string, productId: string, quantity: number = 1): Promise<any> {
        const response = await apiClient.post('/api/cart/add', {
            userId,
            productId,
            quantity
        });
        return response.data;
    },

    /**
     * Update cart item quantity
     */
    async updateCartItem(userId: string, productId: string, quantity: number): Promise<any> {
        const response = await apiClient.put('/api/cart/update', {
            userId,
            productId,
            quantity
        });
        return response.data;
    },

    /**
     * Remove item from cart
     */
    async removeFromCart(userId: string, productId: string): Promise<any> {
        const response = await apiClient.delete('/api/cart/remove', {
            data: { userId, productId }
        });
        return response.data;
    },

    /**
     * Clear user's cart
     */
    async clearCart(userId: string): Promise<any> {
        const response = await apiClient.delete('/api/cart/clear', {
            data: { userId }
        });
        return response.data;
    },
};