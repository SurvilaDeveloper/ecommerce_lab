//frontend/src/app/products/[slug]/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { addCartItem } from "@/lib/cart";
import { addGuestCartItem } from "@/lib/guest-cart";
import { formatMoney } from "@/lib/format";
import {
    getProductBySlug,
    getPublicProductImages,
    type ProductImageResponse,
    type ProductResponse,
} from "@/lib/products";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";

export default function PublicProductDetailPage() {
    const params = useParams();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { refreshCart } = useCart();

    const slug = String(params.slug ?? "");

    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [images, setImages] = useState<ProductImageResponse[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (!slug.trim()) {
            setIsLoading(false);
            setErrorMessage("Slug inválido.");
            return;
        }

        loadProduct();
    }, [slug]);

    async function loadProduct() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const productData = await getProductBySlug(slug);
            setProduct(productData);

            const imageData = await getPublicProductImages(productData.id);
            const sortedImages = [...imageData].sort((a, b) => {
                if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                return a.id - b.id;
            });

            setImages(sortedImages);

            const primaryIndex = sortedImages.findIndex((img) => img.isPrimary);
            setSelectedImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("No se pudo cargar el producto.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddToCart() {
        if (!product) return;
        if (authLoading) return;

        setIsAddingToCart(true);
        setCartMessage("");

        try {
            if (isAuthenticated) {
                await addCartItem(product.id, 1);
            } else {
                addGuestCartItem({
                    productId: product.id,
                    productName: product.name,
                    productSlug: product.slug,
                    productSku: product.sku,
                    productPrimaryImageUrl: product.primaryImageUrl ?? null,
                    quantity: 1,
                    unitPrice: product.price,
                    availableStock: product.stock,
                    productActive: product.active,
                });
            }

            await refreshCart();
            setCartMessage("Producto agregado al carrito.");
        } catch (error) {
            if (error instanceof Error && error.message.trim()) {
                setCartMessage(error.message);
            } else {
                setCartMessage("No se pudo agregar el producto al carrito.");
            }
        } finally {
            setIsAddingToCart(false);
        }
    }

    const selectedImage = useMemo(() => {
        if (images.length === 0) return null;
        return images[selectedImageIndex] ?? images[0];
    }, [images, selectedImageIndex]);

    if (isLoading) {
        return (
            <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
                <div className="mx-auto w-full max-w-7xl px-6 py-12">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
                        Cargando producto...
                    </div>
                </div>
            </main>
        );
    }

    if (errorMessage || !product) {
        return (
            <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
                <div className="mx-auto w-full max-w-5xl px-6 py-12">
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-red-200">
                        <h1 className="text-xl font-semibold">No se pudo cargar el producto</h1>
                        <p className="mt-2 text-sm">{errorMessage || "Producto no encontrado."}</p>

                        <div className="mt-6">
                            <Link
                                href="/"
                                className="inline-flex rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-7xl px-6 py-12">
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-sky-400 transition hover:text-sky-300"
                    >
                        ← Volver al catálogo
                    </Link>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-5">
                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
                            <div className="aspect-[4/3] bg-slate-950">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage.imageUrl}
                                        alt={selectedImage.altText ?? product.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                        Sin imagen
                                    </div>
                                )}
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`overflow-hidden rounded-2xl border transition ${selectedImageIndex === index
                                                ? "border-sky-400"
                                                : "border-slate-800 hover:border-slate-700"
                                            }`}
                                    >
                                        <div className="aspect-square bg-slate-900">
                                            <img
                                                src={image.imageUrl}
                                                alt={image.altText ?? `${product.name} ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                                {product.categoryName}
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                                {product.name}
                            </h1>

                            {product.shortDescription && (
                                <p className="max-w-2xl text-base leading-7 text-slate-300">
                                    {product.shortDescription}
                                </p>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                            <div className="flex flex-wrap items-end gap-3">
                                <p className="text-3xl font-bold text-white">
                                    {formatMoney(product.price, product.currency)}
                                </p>

                                {product.compareAtPrice != null && product.compareAtPrice > product.price && (
                                    <p className="text-lg text-slate-500 line-through">
                                        {formatMoney(product.compareAtPrice, product.currency)}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                <span className="rounded-full bg-slate-950 px-3 py-1 text-slate-300">
                                    SKU: {product.sku}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1 ${product.stock > 0
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : "bg-red-500/15 text-red-300"
                                        }`}
                                >
                                    {product.stock > 0 ? `Stock disponible: ${product.stock}` : "Sin stock"}
                                </span>

                                {product.featured && (
                                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">
                                        Destacado
                                    </span>
                                )}
                            </div>

                            {cartMessage && (
                                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                    {cartMessage}
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0 || isAddingToCart}
                                    className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {product.stock <= 0
                                        ? "No disponible"
                                        : isAddingToCart
                                            ? "Agregando..."
                                            : "Agregar al carrito"}
                                </button>

                                <Link
                                    href="/cart"
                                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                >
                                    Ver carrito
                                </Link>
                            </div>
                        </div>

                        {product.description && (
                            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                                <h2 className="text-xl font-semibold text-white">Descripción</h2>
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}