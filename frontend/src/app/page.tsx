//frontend/src/app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatMoney } from "@/lib/format";
import { getProducts, type ProductResponse } from "@/lib/products";

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    void loadHomeProducts();
  }, []);

  async function loadHomeProducts() {
    setProductsLoading(true);
    setProductsError("");

    try {
      const featuredPage = await getProducts({
        featured: true,
        status: "ACTIVE",
        sortField: "NAME",
        sortDirection: "ASC",
        page: 0,
        size: 6,
      });

      if (featuredPage.content.length > 0) {
        setProducts(featuredPage.content);
        return;
      }

      const fallbackPage = await getProducts({
        status: "ACTIVE",
        sortField: "NAME",
        sortDirection: "ASC",
        page: 0,
        size: 6,
      });

      setProducts(fallbackPage.content);
    } catch (error) {
      if (error instanceof Error && error.message.trim()) {
        setProductsError(error.message);
      } else {
        setProductsError("No se pudieron cargar los productos destacados.");
      }
    } finally {
      setProductsLoading(false);
    }
  }

  const hasFeaturedProducts = products.some((product) => product.featured);

  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="border-b border-slate-900">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Commerce Lab
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
                Una base real para vender productos online
              </h1>

              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Ya tenemos catálogo público, detalle de producto, panel admin,
                autenticación y gestión real de imágenes con Cloudinary.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                Ver catálogo
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link
                    href="/signup"
                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Crear cuenta
                  </Link>

                  <Link
                    href="/login"
                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Iniciar sesión
                  </Link>
                </>
              ) : user?.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin/products"
                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Ir al panel admin
                  </Link>

                  <Link
                    href="/admin/products/new"
                    className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Nuevo producto
                  </Link>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-sm text-slate-300">
                  Tu cuenta está activa. Ya podés explorar el catálogo público.
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Catálogo público"
                value="Activo"
                description="Con cards, filtros y detalle por slug."
              />
              <StatCard
                label="Panel admin"
                value="Listo"
                description="Creación, edición e imágenes por producto."
              />
              <StatCard
                label="Auth"
                value={isLoading ? "..." : isAuthenticated ? "Sesión activa" : "Invitado"}
                description="JWT con cookies HttpOnly y roles."
              />
              <StatCard
                label="Storage"
                value="Cloudinary"
                description="Imágenes persistidas y asociadas a producto."
              />
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-400">
              Productos
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {hasFeaturedProducts ? "Productos destacados" : "Productos recientes"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              {hasFeaturedProducts
                ? "Una selección de productos marcados como destacados desde el panel admin."
                : "Todavía no hay destacados, así que mostramos algunos productos activos del catálogo."}
            </p>
          </div>

          <Link
            href="/products"
            className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        {productsError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {productsError}
          </div>
        )}

        {productsLoading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-12 text-center text-slate-400">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-12 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <h3 className="text-xl font-semibold text-slate-100">
                Todavía no hay productos visibles
              </h3>
              <p className="text-sm leading-6 text-slate-400">
                Activá productos desde el panel admin y marcá algunos como destacados
                para que aparezcan acá.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-slate-700"
              >
                <div className="aspect-[4/3] bg-slate-950">
                  {product.primaryImageUrl ? (
                    <img
                      src={product.primaryImageUrl}
                      alt={product.primaryImageAltText ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400">
                      {product.categoryName}
                    </p>

                    <h3 className="text-xl font-semibold text-white">
                      {product.name}
                    </h3>

                    {product.shortDescription ? (
                      <p className="text-sm leading-6 text-slate-400">
                        {product.shortDescription}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Sin descripción corta.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {product.featured && (
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-amber-300">
                        Destacado
                      </span>
                    )}

                    <span
                      className={`rounded-full px-3 py-1 ${product.stock > 0
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                        }`}
                    >
                      {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white">
                        {formatMoney(product.price, product.currency)}
                      </p>

                      {product.compareAtPrice != null &&
                        product.compareAtPrice > product.price && (
                          <p className="text-sm text-slate-500 line-through">
                            {formatMoney(product.compareAtPrice, product.currency)}
                          </p>
                        )}
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
