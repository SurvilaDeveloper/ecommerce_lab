//frontend/src/lib/categories.ts
import { apiFetchJson } from "@/lib/api";

export type CategoryResponse = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export async function getCategories() {
    return apiFetchJson<CategoryResponse[]>("/api/categories", {
        method: "GET",
    });
}