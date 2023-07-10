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
