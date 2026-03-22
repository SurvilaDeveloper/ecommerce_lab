//frontend/src/components/cart/CartProvider.tsx
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { getCart, type CartResponse } from "@/lib/cart";
import { getGuestCart } from "@/lib/guest-cart";
import { useAuth } from "@/components/auth/AuthProvider";

type CartContextValue = {
    cart: CartResponse | null;
    cartCount: number;
    isLoading: boolean;
    isOpen: boolean;
    refreshCart: () => Promise<void>;
    clearCartState: () => void;
    openCartPreview: () => void;
    closeCartPreview: () => void;
    toggleCartPreview: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const clearCartState = useCallback(() => {
        setCart(null);
        setIsOpen(false);
    }, []);

    const refreshCart = useCallback(async () => {
        if (authLoading) {
            return;
        }

        setIsLoading(true);

        try {
            if (isAuthenticated) {
                const data = await getCart();
                setCart(data);
            } else {
                const data = getGuestCart();
                setCart(data);
            }
        } catch {
            setCart(null);
        } finally {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated]);

    const openCartPreview = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeCartPreview = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleCartPreview = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    useEffect(() => {
        if (authLoading) return;
        refreshCart();
    }, [authLoading, isAuthenticated, refreshCart]);

    const value = useMemo<CartContextValue>(
        () => ({
            cart,
            cartCount: cart?.totalItems ?? 0,
            isLoading,
            isOpen,
            refreshCart,
            clearCartState,
            openCartPreview,
            closeCartPreview,
            toggleCartPreview,
        }),
        [
            cart,
            isLoading,
            isOpen,
            refreshCart,
            clearCartState,
            openCartPreview,
            closeCartPreview,
            toggleCartPreview,
        ]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
}