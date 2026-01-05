import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSession } from "next-auth/react";
import { cartApi } from "@/lib/cart-api";

export type ProductInCart = {
    id: string;
    title: string;
    price: number;
    image: string;
    amount: number;
};

export type State = {
    products: ProductInCart[];
    allQuantity: number;
    total: number;
    isAuthenticated: boolean;
    isLoading: boolean;
    guestCartMerged: boolean;
};

export type Actions = {
    addToCart: (newProduct: ProductInCart) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateCartAmount: (id: string, quantity: number) => Promise<void>;
    calculateTotals: () => void;
    clearCart: () => Promise<void>;
    loadUserCart: () => Promise<void>;
    setAuthenticated: (auth: boolean) => void;
    initializeAuth: () => Promise<void>;
    handleLogin: () => Promise<void>;
};

export const useProductStore = create<State & Actions>()(
    persist(
        (set, get) => ({
            products: [],
            allQuantity: 0,
            total: 0,
            isAuthenticated: false,
            isLoading: false,
            guestCartMerged: false,

            initializeAuth: async () => {
                try {
                    const session = await getSession();
                    const isAuth = !!session?.user;
                    set({ isAuthenticated: isAuth });

                    if (isAuth) {
                        // Load cart from backend
                        await get().loadUserCart();
                    } else {
                        // Load from localStorage (handled by persist)
                        get().calculateTotals();
                    }
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    set({ isAuthenticated: false });
                    get().calculateTotals();
                }
            },

            setAuthenticated: (isAuth) => {
                set({ isAuthenticated: isAuth });
                if (!isAuth) {
                    // Clear cart on logout
                    set({
                        products: [],
                        allQuantity: 0,
                        total: 0,
                        guestCartMerged: false,
                    });

                } else {
                    // On login, optionally merge guest cart
                    get().handleLogin();
                }
            },

            handleLogin: async () => {
                try {
                    const session = await getSession();
                    if (!session?.user) return;

                    const userId = (session.user as any).id;

                    const {
                        products: guestCart,
                        guestCartMerged,
                        loadUserCart,
                    } = get();

                    // 🚨 IMPORTANT: Prevent double merge
                    if (guestCartMerged) {
                        await loadUserCart();
                        return;
                    }

                    if (guestCart.length > 0) {
                        // Load user cart ONCE
                        const userCart = await cartApi.getUserCart(userId);

                        for (const item of guestCart) {
                            const existingItem = userCart.products.find(
                                (p: any) => p.id === item.id
                            );

                            if (existingItem) {
                                // Update quantity
                                const newQuantity = existingItem.amount + item.amount;
                                await cartApi.updateCartItem(userId, item.id, newQuantity);
                            } else {
                                // Add new item
                                await cartApi.addToCart(userId, item.id, item.amount);
                            }
                        }

                        // ✅ Clear guest cart & mark merged
                        set({
                            products: [],
                            allQuantity: 0,
                            total: 0,
                            guestCartMerged: true,
                        });
                    }

                    // Load final merged cart
                    await loadUserCart();

                } catch (error) {
                    console.error('Error handling login:', error);
                }
            },


            loadUserCart: async () => {
                const { isAuthenticated } = get();
                if (!isAuthenticated) return;

                set({ isLoading: true });
                try {
                    const session = await getSession();
                    if (!session?.user) return;
                    const cartData = await cartApi.getUserCart((session.user as any).id);
                    set({
                        products: cartData.products,
                        allQuantity: cartData.allQuantity,
                        total: cartData.total,
                        isLoading: false
                    });
                } catch (error) {
                    console.error('Error loading user cart:', error);
                    set({ isLoading: false });
                    // Fall back to local storage
                    get().calculateTotals();
                }
            },

            addToCart: async (newProduct) => {
                const { isAuthenticated, products } = get();

                if (isAuthenticated) {
                    // Sync with backend
                    try {
                        const session = await getSession();
                        if (session?.user) {
                            await cartApi.addToCart((session.user as any).id, newProduct.id, newProduct.amount);
                            // Reload cart from backend
                            await get().loadUserCart();
                        }
                    } catch (error) {
                        console.error('Error adding to cart:', error);
                        // Fall back to local state
                        set((state) => {
                            const cartItem = state.products.find(
                                (item) => item.id === newProduct.id
                            );
                            if (!cartItem) {
                                return { products: [...state.products, newProduct] };
                            } else {
                                state.products.map((product) => {
                                    if (product.id === cartItem.id) {
                                        product.amount += newProduct.amount;
                                    }
                                });
                            }
                            return { products: [...state.products] };
                        });
                        get().calculateTotals();
                    }
                } else {
                    // Local storage only
                    set((state) => {
                        const cartItem = state.products.find(
                            (item) => item.id === newProduct.id
                        );
                        if (!cartItem) {
                            return { products: [...state.products, newProduct] };
                        } else {
                            state.products.map((product) => {
                                if (product.id === cartItem.id) {
                                    product.amount += newProduct.amount;
                                }
                            });
                        }
                        return { products: [...state.products] };
                    });
                    get().calculateTotals();
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = get();

                if (isAuthenticated) {
                    try {
                        const session = await getSession();
                        if (session?.user) {
                            await cartApi.clearCart((session.user as any).id);
                        }
                    } catch (error) {
                        console.error('Error clearing cart:', error);
                    }
                }

                set((state: any) => ({
                    products: [],
                    allQuantity: 0,
                    total: 0,
                }));
            },

            removeFromCart: async (id) => {
                const { isAuthenticated } = get();

                if (isAuthenticated) {
                    try {
                        const session = await getSession();
                        if (session?.user) {
                            await cartApi.removeFromCart((session.user as any).id, id);
                            // Reload cart
                            await get().loadUserCart();
                            return;
                        }
                    } catch (error) {
                        console.error('Error removing from cart:', error);
                    }
                }

                // Fallback to local
                set((state) => {
                    state.products = state.products.filter(
                        (product: ProductInCart) => product.id !== id
                    );
                    return { products: state.products };
                });
                get().calculateTotals();
            },

            calculateTotals: () => {
                set((state) => {
                    let amount = 0;
                    let total = 0;
                    state.products.forEach((item) => {
                        amount += item.amount;
                        total += item.amount * item.price;
                    });

                    return {
                        products: state.products,
                        allQuantity: amount,
                        total: total,
                    };
                });
            },

            updateCartAmount: async (id, amount) => {
                const { isAuthenticated } = get();

                if (isAuthenticated) {
                    try {
                        const session = await getSession();
                        if (session?.user) {
                            await cartApi.updateCartItem((session.user as any).id, id, amount);
                            // Reload cart
                            await get().loadUserCart();
                            return;
                        }
                    } catch (error) {
                        console.error('Error updating cart:', error);
                    }
                }

                // Fallback to local
                set((state) => {
                    const cartItem = state.products.find((item) => item.id === id);

                    if (!cartItem) {
                        return { products: [...state.products] };
                    } else {
                        state.products.map((product) => {
                            if (product.id === cartItem.id) {
                                product.amount = amount;
                            }
                        });
                    }

                    return { products: [...state.products] };
                });
                get().calculateTotals();
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => ({
                getItem: (name: string) => {
                    return localStorage.getItem(name);
                },
                setItem: (name: string, value: string) => {
                    // Don't save to storage when authenticated
                    const state = JSON.parse(value);
                    if (!state.isAuthenticated) {
                        localStorage.setItem(name, value);
                    }
                },
                removeItem: (name: string) => {
                    localStorage.removeItem(name);
                },
            })),
            // Only persist certain fields
            partialize: (state) => ({
                products: state.products,
                allQuantity: state.allQuantity,
                total: state.total,
                isAuthenticated: state.isAuthenticated,
                guestCartMerged: state.guestCartMerged,
            }),
        }
    )
);
