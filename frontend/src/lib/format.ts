//frontend/src/lib/format.ts
export function formatMoney(value: number, currency: string) {
    try {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value}`;
    }
}