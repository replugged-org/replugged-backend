import { FastifyRequest } from "fastify";
import { existsSync, mkdirSync } from "fs";
import { stat } from "fs/promises";
import path from "path";

export const STORAGE_FOLDER = (folder: string): string => {
  let path: string;

  switch (process.platform) {
    case "linux":
      path = `/var/lib/replugged-backend/${folder}`;
      break;
    case "win32":
      path = `C:\\RepluggedData\\${folder}`;
      break;
    case "darwin":
      path = `${process.env.HOME}/Library/Application Support/replugged-backend/${folder}`;
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  if (!existsSync(path)) {
    mkdirSync(path, {
      recursive: true,
    });
  }

  return path;
};

export const createDirForFile = (file: string): void => {
  const dir = path.dirname(file);
  if (existsSync(dir)) return;
  mkdirSync(dir, {
    recursive: true,
  });
};

export const toArray = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined) return [];
  return [value];
};

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function getRequestIp(request: FastifyRequest): string {
  // https://github.com/metcoder95/fastify-ip#how-it-works
  const headers = [
    "x-client-ip", // Most common
    "x-forwarded-for", // Mostly used by proxies
    "cf-connecting-ip", // Cloudflare
    "Cf-Pseudo-IPv4", // Cloudflare
    "fastly-client-ip",
    "true-client-ip", // Akamai and Cloudflare
    "x-real-ip", // Nginx
    "x-cluser-client-ip", // Rackspace LB
    "forwarded-for",
    "x-forwarded",
    "forwarded",
    "x-appengine-user-ip", // GCP App Engine
  ].map((header) => {
    const value = request.headers[header];
    if (!value) return null;
    if (Array.isArray(value)) return value[0];
    return value;
  });

  const firstAvailableHeader = headers.find(Boolean);
  return firstAvailableHeader || request.ip;
}
