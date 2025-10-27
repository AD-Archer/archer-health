import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? process.env.REDIS;

if (!redisUrl) {
	console.warn("Redis URL not configured; caching is disabled.");
}

const globalForRedis = globalThis as unknown as {
	redis?: Redis | null;
	redisErrorHandlerAttached?: boolean;
};

export const redis =
	redisUrl && typeof window === "undefined"
		? globalForRedis.redis ??
			new Redis(redisUrl, {
				maxRetriesPerRequest: 2,
			})
		: null;

if (redis && process.env.NODE_ENV !== "production") {
	globalForRedis.redis = redis;
}

if (redis && !globalForRedis.redisErrorHandlerAttached) {
	redis.on("error", (error) => {
		console.error("Redis connection error:", error);
	});
	globalForRedis.redisErrorHandlerAttached = true;
}
