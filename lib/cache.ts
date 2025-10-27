import { redis } from "./redis";

const DEFAULT_TTL_SECONDS = Number.parseInt(
	process.env.CACHE_TTL_SECONDS ?? "300",
	10,
);

const ttl = Number.isNaN(DEFAULT_TTL_SECONDS) ? 300 : DEFAULT_TTL_SECONDS;
const namespace =
	process.env.REDIS_KEY_PREFIX?.trim().replace(/:+$/g, "") ?? "archer-health";

export const cacheEnabled = Boolean(redis);

export const buildCacheKey = (
	category: string,
	parts: Array<string | number | boolean | null | undefined>,
) => {
	const sanitizedParts = parts
		.filter((part) => part !== undefined && part !== null && part !== "")
		.map((part) => {
			if (typeof part === "boolean") {
				return part ? "1" : "0";
			}
			return part!.toString().trim().replace(/\s+/g, "-");
		});

	return [namespace, category, ...sanitizedParts]
		.filter((segment) => segment !== "")
		.join(":");
};

export async function getCachedJSON<T>(key: string): Promise<T | null> {
	if (!redis) {
		return null;
	}

	try {
		const cached = await redis.get(key);
		return cached ? (JSON.parse(cached) as T) : null;
	} catch (error) {
		console.error(`Redis get failed for key ${key}:`, error);
		return null;
	}
}

export async function setCachedJSON(
	key: string,
	value: unknown,
	ttlSeconds: number = ttl,
) {
	if (!redis) {
		return;
	}

	try {
		await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
	} catch (error) {
		console.error(`Redis set failed for key ${key}:`, error);
	}
}

export async function invalidateCacheByPattern(pattern: string) {
	if (!redis) {
		return;
	}

	try {
		let cursor = "0";
		const keysToDelete: string[] = [];
		do {
			const [nextCursor, keys] = await redis.scan(
				cursor,
				"MATCH",
				pattern,
				"COUNT",
				"100",
			);
			if (keys.length) {
				keysToDelete.push(...keys);
			}
			cursor = nextCursor;
		} while (cursor !== "0");

		if (keysToDelete.length) {
			await redis.del(...keysToDelete);
		}
	} catch (error) {
		console.error(`Redis cache invalidation failed for pattern ${pattern}:`, error);
	}
}
