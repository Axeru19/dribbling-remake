// /c:/Dev/dribbling-remake/utils/normalizeIds.ts

export type NormalizeOptions = {
    safe?: boolean;   // se true, lancia se bigint > Number.MAX_SAFE_INTEGER (default false)
    mutate?: boolean; // se true modifica l'oggetto originale (default false)
};

/**
 * Converte ricorsivamente tutti i bigint in number.
 */
export function normalizeIds<T>(input: T, options: NormalizeOptions = {}): T {
    const { safe = false, mutate = false } = options;

    const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
    const minSafe = BigInt(Number.MIN_SAFE_INTEGER);

    function convert(value: any): any {
        if (typeof value === 'bigint') {
            if (safe && (value > maxSafe || value < minSafe)) {
                throw new Error(`Unsafe bigint -> number conversion for value ${value}`);
            }
            return Number(value);
        }

        if (value === null || value === undefined) return value;

        if (Array.isArray(value)) {
            if (mutate) {
                for (let i = 0; i < value.length; i++) value[i] = convert(value[i]);
                return value;
            } else {
                return value.map(convert);
            }
        }

        if (value instanceof Date) return new Date(value.getTime());

        if (value instanceof Map) {
            const out = new Map();
            for (const [k, v] of value) {
                const nk = typeof k === 'bigint' ? (safe && (k > maxSafe || k < minSafe) ? (() => { throw new Error(`Unsafe bigint -> number conversion for Map key ${k}`); })() : Number(k)) : convert(k);
                out.set(nk, convert(v));
            }
            return out;
        }

        if (value instanceof Set) {
            const out = new Set();
            for (const v of value) out.add(convert(v));
            return out;
        }

        if (typeof value === 'object') {
            // plain object
            if (mutate) {
                for (const key of Object.keys(value)) {
                    (value as any)[key] = convert((value as any)[key]);
                }
                return value;
            } else {
                const out: any = Array.isArray(value) ? [] : {};
                for (const key of Object.keys(value)) {
                    out[key] = convert((value as any)[key]);
                }
                return out;
            }
        }

        return value;
    }

    return convert(input) as T;
}