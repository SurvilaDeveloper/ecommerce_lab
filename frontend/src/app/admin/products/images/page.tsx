//frontend/src/app/admin/products/images/page.tsx
"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";

type LocalImage = {
    id: string;
    file: File;
    previewUrl: string;
    isPrimary: boolean;
};

const MAX_FILES = 8;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

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

export default function ProductImagesPage() {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [selectedImages, setSelectedImages] = useState<LocalImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);

    const totalSize = useMemo(() => {
        return selectedImages.reduce((acc, image) => acc + image.file.size, 0);
    }, [selectedImages]);

    const primaryImage = useMemo(() => {
        return selectedImages.find((img) => img.isPrimary) ?? null;
    }, [selectedImages]);

    useEffect(() => {
        return () => {
            selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        };
    }, [selectedImages]);

    function addFiles(filesList: FileList | File[]) {
        const incomingFiles = Array.from(filesList);

        if (incomingFiles.length === 0) return;

        const nextErrors: string[] = [];
        const existingKeys = new Set(selectedImages.map((img) => getFileKey(img.file)));
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

            if (selectedImages.length + acceptedFiles.length >= MAX_FILES) {
                nextErrors.push(`Solo podés seleccionar hasta ${MAX_FILES} imágenes.`);
                break;
            }

            existingKeys.add(key);
            acceptedFiles.push(file);
        }

        const newImages: LocalImage[] = acceptedFiles.map((file, index) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            isPrimary: selectedImages.length === 0 && index === 0,
        }));

        setSelectedImages((prev) => [...prev, ...newImages]);
        setErrors(nextErrors);
        setMessage("");
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        addFiles(files);
        event.target.value = "";
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(false);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragActive(false);

        if (!event.dataTransfer.files?.length) return;
        addFiles(event.dataTransfer.files);
    }

    function handleRemoveImage(imageId: string) {
        setSelectedImages((prev) => {
            const imageToRemove = prev.find((img) => img.id === imageId);
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.previewUrl);
            }

            const updated = prev.filter((img) => img.id !== imageId);

            if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
                updated[0] = { ...updated[0], isPrimary: true };
            }

            return [...updated];
        });

        setMessage("");
    }

    function handleSetPrimary(imageId: string) {
        setSelectedImages((prev) =>
            prev.map((img) => ({
                ...img,
                isPrimary: img.id === imageId,
            }))
        );

        setMessage("");
    }

    function handleMoveUp(index: number) {
        if (index === 0) return;

        setSelectedImages((prev) => moveItem(prev, index, index - 1));
        setMessage("");
    }

    function handleMoveDown(index: number) {
        if (index === selectedImages.length - 1) return;

        setSelectedImages((prev) => moveItem(prev, index, index + 1));
        setMessage("");
    }

    function handleClearSelection() {
        selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setSelectedImages([]);
        setErrors([]);
        setMessage("");
    }

    async function handleFakeUpload() {
        if (selectedImages.length === 0) {
            setMessage("Primero seleccioná al menos una imagen.");
            return;
        }

        setIsUploading(true);
        setMessage("");
        setErrors([]);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        const payload = selectedImages.map((image, index) => ({
            name: image.file.name,
            size: image.file.size,
            type: image.file.type,
            isPrimary: image.isPrimary,
            order: index,
        }));

        console.log("SIMULACIÓN DE SUBIDA:");
        console.table(payload);

        setMessage("Subida simulada correctamente. Revisá la consola del navegador.");
        setIsUploading(false);
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
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
                                Esta pantalla ya modela bastante bien el flujo real de carga. Por
                                ahora todo ocurre en memoria y la subida está simulada, pero el
                                objetivo es que después la conectemos directamente con tu backend
                                Java y Cloudinary.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                            <p>
                                Límite: <span className="font-semibold text-slate-100">{MAX_FILES}</span> imágenes
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
                                Podés arrastrar imágenes o usar el selector. La primera imagen
                                queda como principal automáticamente.
                            </p>
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={[
                                "rounded-2xl border-2 border-dashed p-8 transition",
                                isDragActive
                                    ? "border-sky-400 bg-sky-500/10"
                                    : "border-slate-700 bg-slate-950/70",
                            ].join(" ")}
                        >
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                <div className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Drag & Drop
                                </div>

                                <div className="space-y-2">
                                    <p className="text-lg font-semibold text-slate-100">
                                        Arrastrá tus imágenes acá
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        o elegilas manualmente desde tu computadora
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
                                    Formatos aceptados: imágenes. Máximo {MAX_FILES} archivos.
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
                                onClick={handleFakeUpload}
                                disabled={isUploading}
                                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isUploading ? "Simulando subida..." : "Simular subida"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClearSelection}
                                disabled={selectedImages.length === 0 || isUploading}
                                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Limpiar selección
                            </button>
                        </div>
                    </div>

                    <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
                        <h2 className="text-xl font-semibold">Resumen</h2>

                        <div className="mt-5 grid gap-4">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Cantidad</p>
                                <p className="mt-2 text-3xl font-bold">{selectedImages.length}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Tamaño total</p>
                                <p className="mt-2 text-3xl font-bold">{formatBytes(totalSize)}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                                <p className="mt-2 text-3xl font-bold">
                                    {isUploading ? "Subiendo..." : "Borrador"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Principal</p>
                                <p className="mt-2 truncate text-base font-semibold text-slate-100">
                                    {primaryImage ? primaryImage.file.name : "Sin definir"}
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Preview de imágenes</h2>
                        <p className="text-sm text-slate-400">
                            Ahora también podés ajustar el orden con los botones subir y bajar.
                        </p>
                    </div>

                    {selectedImages.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16 text-center">
                            <div className="mx-auto max-w-md space-y-3">
                                <div className="inline-flex rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Sin imágenes
                                </div>
                                <h3 className="text-xl font-semibold text-slate-100">
                                    Todavía no seleccionaste imágenes
                                </h3>
                                <p className="text-sm leading-6 text-slate-400">
                                    Cuando agregues archivos, acá vas a ver el preview, cuál es la
                                    imagen principal y el orden actual de cada una.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {selectedImages.map((image, index) => (
                                <article
                                    key={image.id}
                                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-slate-700"
                                >
                                    <div className="relative aspect-[4/3] bg-slate-950">
                                        <img
                                            src={image.previewUrl}
                                            alt={image.file.name}
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
                                                {image.file.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatBytes(image.file.size)} · {image.file.type || "tipo desconocido"}
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
                                                disabled={index === selectedImages.length - 1}
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
                                                onClick={() => handleRemoveImage(image.id)}
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