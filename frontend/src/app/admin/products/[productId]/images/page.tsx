//frontend/src/app/admin/products/[productId]/images/page.tsx
"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import {
    deleteProductImage,
    getProductImages,
    type ProductImage,
    updateProductImage,
    uploadProductImage,
} from "@/lib/product-images";

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type PendingImage = {
    id: string;
    file: File;
    previewUrl: string;
};

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileKey(file: File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

function moveItem<T>(array: T[], fromIndex: number, toIndex: number) {
    const copy = [...array];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    return copy;
}

function ProductImagesPageContent() {
    const params = useParams();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const productId = Number(params.productId);

    const [images, setImages] = useState<ProductImage[]>([]);
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const totalPendingSize = useMemo(() => {
        return pendingImages.reduce((acc, image) => acc + image.file.size, 0);
    }, [pendingImages]);

    const primaryImage = useMemo(() => {
        return images.find((img) => img.isPrimary) ?? null;
    }, [images]);

    useEffect(() => {
        if (Number.isInteger(productId) && productId > 0) {
            loadImages();
        } else {
            setIsLoading(false);
            setMessage("El productId de la URL no es válido.");
        }
    }, [productId]);

    useEffect(() => {
        return () => {
            pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        };
    }, [pendingImages]);

    async function loadImages() {
        setIsLoading(true);
        setMessage("");

        try {
            const data = await getProductImages(productId);
            setImages(sortImages(data));
        } catch (error) {
            setMessage(getErrorMessage(error, "No se pudieron cargar las imágenes."));
        } finally {
            setIsLoading(false);
        }
    }

    function sortImages(data: ProductImage[]) {
        return [...data].sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.id - b.id;
        });
    }

    function addFiles(filesList: FileList | File[]) {
        const incomingFiles = Array.from(filesList);

        if (incomingFiles.length === 0) return;

        const nextErrors: string[] = [];
        const existingKeys = new Set(pendingImages.map((img) => getFileKey(img.file)));
        const acceptedFiles: File[] = [];

        for (const file of incomingFiles) {
            const key = getFileKey(file);

            if (!file.type.startsWith("image/")) {
                nextErrors.push(`"${file.name}" no es una imagen válida.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE_BYTES) {
                nextErrors.push(`"${file.name}" supera el máximo de ${MAX_FILE_SIZE_MB} MB.`);
                continue;
            }

            if (existingKeys.has(key)) {
                nextErrors.push(`"${file.name}" ya fue seleccionada.`);
                continue;
            }

            if (pendingImages.length + acceptedFiles.length >= MAX_FILES) {
                nextErrors.push(`Solo podés seleccionar hasta ${MAX_FILES} imágenes por tanda.`);
                break;
            }

            existingKeys.add(key);
            acceptedFiles.push(file);
        }

        const newImages: PendingImage[] = acceptedFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setPendingImages((prev) => [...prev, ...newImages]);
        setErrors(nextErrors);
        setMessage("");
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        addFiles(files);
        event.target.value = "";
    }

    function handleRemovePendingImage(imageId: string) {
        setPendingImages((prev) => {
            const target = prev.find((img) => img.id === imageId);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((img) => img.id !== imageId);
        });
    }

    function handleClearPendingSelection() {
        pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setPendingImages([]);
        setErrors([]);
        setMessage("");
    }

    async function handleUploadPendingImages() {
        if (pendingImages.length === 0) {
            setMessage("Primero seleccioná al menos una imagen.");
            return;
        }

        setIsUploading(true);
        setErrors([]);
        setMessage("");

        try {
            const hasPrimary = images.some((img) => img.isPrimary);

            for (let index = 0; index < pendingImages.length; index += 1) {
                const pending = pendingImages[index];

                await uploadProductImage(productId, pending.file, {
                    isPrimary: !hasPrimary && index === 0,
                });
            }

            handleClearPendingSelection();
            await loadImages();
            setMessage("Las imágenes se subieron correctamente.");
        } catch (error) {
            setMessage(getErrorMessage(error, "No se pudieron subir las imágenes."));
        } finally {
            setIsUploading(false);
        }
    }

    async function handleDeleteImage(imageId: number) {
        try {
            setMessage("");
            await deleteProductImage(productId, imageId);
            await loadImages();
            setMessage("La imagen se eliminó correctamente.");
        } catch (error) {
            setMessage(getErrorMessage(error, "No se pudo eliminar la imagen."));
        }
    }

    async function handleSetPrimary(imageId: number) {
        try {
            setMessage("");
            await updateProductImage(productId, imageId, {
                isPrimary: true,
            });
            await loadImages();
            setMessage("La imagen principal se actualizó correctamente.");
        } catch (error) {
            setMessage(getErrorMessage(error, "No se pudo actualizar la imagen principal."));
        }
    }

    function handleMoveUp(index: number) {
        if (index === 0) return;
        setImages((prev) => moveItem(prev, index, index - 1));
    }

    function handleMoveDown(index: number) {
        if (index === images.length - 1) return;
        setImages((prev) => moveItem(prev, index, index + 1));
    }

    async function handleSaveOrder() {
        if (images.length === 0) return;

        setIsSavingOrder(true);
        setMessage("");

        try {
            for (let index = 0; index < images.length; index += 1) {
                const image = images[index];
                await updateProductImage(productId, image.id, {
                    sortOrder: index,
                });
            }

            await loadImages();
            setMessage("El orden de las imágenes se guardó correctamente.");
        } catch (error) {
            setMessage(getErrorMessage(error, "No se pudo guardar el orden de las imágenes."));
        } finally {
            setIsSavingOrder(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
                <header className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
                        Admin · Productos · Imágenes
                    </p>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Gestión de imágenes del producto
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-slate-400">
                                Esta pantalla ya trabaja sobre el producto real indicado en la URL.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                            <p>
                                Producto actual: <span className="font-semibold text-slate-100">#{productId}</span>
                            </p>
                            <p>
                                Máximo por archivo:{" "}
                                <span className="font-semibold text-slate-100">{MAX_FILE_SIZE_MB} MB</span>
                            </p>
                        </div>
                    </div>
                </header>

                <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                        <div className="mb-5 space-y-1">
                            <h2 className="text-xl font-semibold">Seleccionar imágenes</h2>
                            <p className="text-sm text-slate-400">
                                Estas imágenes todavía no se subieron. Primero las seleccionás y
                                después las enviás al backend.
                            </p>
                        </div>

                        <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/70 p-8 transition">
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Selección local
                                </div>

                                <div className="space-y-2">
                                    <p className="text-lg font-semibold text-slate-100">
                                        Elegí imágenes para subir
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Después las subimos a Cloudinary desde el backend Java
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                                >
                                    Elegir archivos
                                </button>

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <p className="text-xs text-slate-500">
                                    Máximo {MAX_FILES} archivos por tanda
                                </p>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                <p className="mb-2 text-sm font-semibold text-red-300">
                                    Revisá estos archivos:
                                </p>
                                <ul className="space-y-1 text-sm text-red-200">
                                    {errors.map((error, index) => (
                                        <li key={`${error}-${index}`}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {message && (
                            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {message}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleUploadPendingImages}
                                disabled={pendingImages.length === 0 || isUploading}
                                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isUploading ? "Subiendo..." : "Subir imágenes"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClearPendingSelection}
                                disabled={pendingImages.length === 0 || isUploading}
                                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Limpiar selección
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                disabled={images.length === 0 || isSavingOrder}
                                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingOrder ? "Guardando orden..." : "Guardar orden"}
                            </button>
                        </div>
                    </div>

                    <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                        <h2 className="text-xl font-semibold">Resumen</h2>

                        <div className="mt-5 grid gap-4">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Imágenes subidas
                                </p>
                                <p className="mt-2 text-3xl font-bold">{images.length}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Pendientes
                                </p>
                                <p className="mt-2 text-3xl font-bold">{pendingImages.length}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Tamaño pendiente
                                </p>
                                <p className="mt-2 text-3xl font-bold">{formatBytes(totalPendingSize)}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Principal actual
                                </p>
                                <p className="mt-2 truncate text-base font-semibold text-slate-100">
                                    {primaryImage ? `Imagen #${primaryImage.id}` : "Sin definir"}
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Pendientes de subida</h2>
                        <p className="text-sm text-slate-400">
                            Estas imágenes todavía no existen en la base de datos.
                        </p>
                    </div>

                    {pendingImages.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
                            No hay imágenes pendientes.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {pendingImages.map((image) => (
                                <article
                                    key={image.id}
                                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20"
                                >
                                    <div className="aspect-[4/3] bg-slate-950">
                                        <img
                                            src={image.previewUrl}
                                            alt={image.file.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-100">
                                                {image.file.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatBytes(image.file.size)} · {image.file.type || "tipo desconocido"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemovePendingImage(image.id)}
                                            className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                                        >
                                            Quitar de la selección
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Imágenes guardadas</h2>
                        <p className="text-sm text-slate-400">
                            Estas imágenes ya están subidas y asociadas al producto.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
                            Cargando imágenes...
                        </div>
                    ) : images.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
                            Este producto todavía no tiene imágenes guardadas.
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {images.map((image, index) => (
                                <article
                                    key={image.id}
                                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-slate-700"
                                >
                                    <div className="relative aspect-[4/3] bg-slate-950">
                                        <img
                                            src={image.imageUrl}
                                            alt={image.altText ?? `Imagen ${image.id}`}
                                            className="h-full w-full object-cover"
                                        />

                                        <div className="absolute left-3 top-3 flex gap-2">
                                            {image.isPrimary && (
                                                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">
                                                    Principal
                                                </span>
                                            )}

                                            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-100">
                                                public_id: {image.publicId}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {image.width ?? "?"} × {image.height ?? "?"}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Subir
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === images.length - 1}
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Bajar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimary(image.id)}
                                                disabled={image.isPrimary}
                                                className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Marcar principal
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage(image.id)}
                                                className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
}

export default function ProductImagesPage() {
    return (
        <RequireRole role="ADMIN">
            <ProductImagesPageContent />
        </RequireRole>
    );
}