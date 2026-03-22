//frontend/src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
    ChevronDown,
    LayoutDashboard,
    MoreHorizontal,
    Package,
    PlusCircle,
    ReceiptText,
    Shapes,
    ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";

type NavLinkItem = {
    href: string;
    label: string;
};

type AdminLinkItem = NavLinkItem & {
    icon: ComponentType<{ className?: string }>;
    match?: "exact" | "section";
};

const publicLinks: NavLinkItem[] = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
];

const customerLinks: NavLinkItem[] = [
    { href: "/orders", label: "Mis órdenes" },
];

const adminLinks: AdminLinkItem[] = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        match: "exact",
    },
    {
        href: "/admin/products",
        label: "Productos",
        icon: Package,
        match: "exact",
    },
    {
        href: "/admin/products/new",
        label: "Nuevo producto",
        icon: PlusCircle,
        match: "exact",
    },
    {
        href: "/admin/orders",
        label: "Órdenes",
        icon: ReceiptText,
        match: "section",
    },
    {
        href: "/admin/categories",
        label: "Categorías",
        icon: Shapes,
        match: "section",
    },
];

function isActivePath(pathname: string, href: string) {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

function isAdminItemActive(pathname: string, link: AdminLinkItem) {
    if (link.match === "section") {
        return pathname === link.href || pathname.startsWith(`${link.href}/`);
    }

    return pathname === link.href;
}

function getLinkClasses(active: boolean) {
    return active
        ? "rounded-xl bg-slate-800/90 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/20"
        : "rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800/70 hover:text-white";
}

function NavLink({
    href,
    label,
    pathname,
    onClick,
}: NavLinkItem & {
    pathname: string;
    onClick?: () => void;
}) {
    const active = isActivePath(pathname, href);

    return (
        <Link href={href} onClick={onClick} className={getLinkClasses(active)}>
            {label}
        </Link>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const { cartCount, clearCartState, toggleCartPreview } = useCart();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const adminMenuRef = useRef<HTMLDivElement | null>(null);

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        setMobileMenuOpen(false);
        setAdminMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                adminMenuRef.current &&
                !adminMenuRef.current.contains(event.target as Node)
            ) {
                setAdminMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAdminMenuOpen(false);
                setMobileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function handleLogout() {
        await logout();
        clearCartState();
        setMobileMenuOpen(false);
        setAdminMenuOpen(false);
        router.push("/");
        router.refresh();
    }

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="flex min-h-[73px] items-center justify-between gap-4">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <Link
                            href="/"
                            className="rounded-xl px-1 text-lg font-bold tracking-tight text-slate-100 transition hover:text-white"
                        >
                            Commerce Lab
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            {publicLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    {...link}
                                    pathname={pathname}
                                />
                            ))}

                            {isAuthenticated &&
                                customerLinks.map((link) => (
                                    <NavLink
                                        key={link.href}
                                        {...link}
                                        pathname={pathname}
                                    />
                                ))}

                            {isAdmin ? (
                                <div className="relative" ref={adminMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAdminMenuOpen((prev) => !prev)
                                        }
                                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${adminMenuOpen
                                            ? "border-sky-500/40 bg-sky-500/10 text-white"
                                            : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                                            }`}
                                        aria-haspopup="menu"
                                        aria-expanded={adminMenuOpen}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Administrar</span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition duration-200 ${adminMenuOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {adminMenuOpen ? (
                                        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl shadow-black/40">
                                            <div className="mb-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                                                Administración
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                {adminLinks.map((link) => {
                                                    const active =
                                                        isAdminItemActive(
                                                            pathname,
                                                            link
                                                        );
                                                    const Icon = link.icon;

                                                    return (
                                                        <Link
                                                            key={link.href}
                                                            href={link.href}
                                                            className={
                                                                active
                                                                    ? "flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white"
                                                                    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                                            }
                                                        >
                                                            <Icon className="h-4 w-4 shrink-0" />
                                                            <span>{link.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}
                        </nav>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <button
                            type="button"
                            onClick={toggleCartPreview}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Carrito</span>
                            <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                {cartCount}
                            </span>
                        </button>

                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-slate-400">
                                    {user?.firstName ? `Hola, ${user.firstName}` : user?.email}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                                >
                                    Salir
                                </button>
                            </>
                        ) : isLoading ? (
                            <span className="text-sm text-slate-400">
                                Cargando...
                            </span>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-300 transition hover:text-white"
                                >
                                    Ingresar
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                                >
                                    Crear cuenta
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            type="button"
                            onClick={toggleCartPreview}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                                {cartCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 text-slate-200 transition hover:bg-slate-800 hover:text-white"
                            aria-label="Abrir menú"
                            aria-expanded={mobileMenuOpen}
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {mobileMenuOpen ? (
                    <div className="border-t border-slate-800 py-4 md:hidden">
                        <div className="flex flex-col gap-2">
                            {publicLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={getLinkClasses(
                                        isActivePath(pathname, link.href)
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {isAuthenticated &&
                                customerLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={getLinkClasses(
                                            isActivePath(pathname, link.href)
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                            {isAdmin ? (
                                <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
                                    <div className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                                        Administración
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {adminLinks.map((link) => {
                                            const active =
                                                isAdminItemActive(
                                                    pathname,
                                                    link
                                                );
                                            const Icon = link.icon;

                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={
                                                        active
                                                            ? "flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-3 text-sm font-semibold text-white"
                                                            : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                                    }
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span>{link.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-2 border-t border-slate-800 pt-3">
                                {isAuthenticated ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="px-4 py-2 text-sm text-slate-400">
                                            {user?.firstName
                                                ? `Hola, ${user.firstName}`
                                                : user?.email}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                ) : isLoading ? (
                                    <div className="px-4 py-2 text-sm text-slate-400">
                                        Cargando...
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href="/login"
                                            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                                        >
                                            Ingresar
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                                        >
                                            Crear cuenta
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
}