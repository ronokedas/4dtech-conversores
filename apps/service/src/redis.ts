import { Redis } from "ioredis";
import { Queue } from "bullmq";
import { config } from "./config.js";

const parsedRedis = new URL(config.redisUrl);
export const bullConnection = {
  host: parsedRedis.hostname,
  port: Number(parsedRedis.port || 6379),
  username: parsedRedis.username || undefined,
  password: parsedRedis.password || undefined,
  db: Number(parsedRedis.pathname.slice(1) || 0),
};

export const connection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const queue = new Queue("conversions", { connection: bullConnection });
export const jobKey = (token: string) => `conversion:${token}`;

export async function setRecord(token: string, record: Record<string, unknown>) {
  await connection.hset(jobKey(token), record);
  await connection.expire(jobKey(token), config.ttlSeconds);
}
