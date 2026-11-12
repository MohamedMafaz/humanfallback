import fs from "node:fs";
import path from "node:path";
import type { DB, PublicUser, User } from "@/types";
import { seedDB } from "./seed";

const DATA_DIR = process.env.HF_DATA_DIR ?? path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const DATA_ROOT = DATA_DIR;

declare global {
  // eslint-disable-next-line no-var
  var __hf_db: DB | undefined;
}

function flush(): void {
  const current = globalThis.__hf_db;
  if (!current) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(current, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

/** Loads the JSON document store, seeding demo content on first launch. */
export function db(): DB {
  if (globalThis.__hf_db) return globalThis.__hf_db;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  try {
    globalThis.__hf_db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
  } catch {
    globalThis.__hf_db = seedDB();
    flush();
  }
  return globalThis.__hf_db!;
}

export function save(): void {
  flush();
}

export function mutate<T>(fn: (data: DB) => T): T {
  const data = db();
  const result = fn(data);
  flush();
  return result;
}

/** Wipes runtime data and re-seeds. Used by POST /api/admin/reset. */
export function resetDB(): DB {
  globalThis.__hf_db = seedDB();
  flush();
  return globalThis.__hf_db;
}

export function publicUser(user: User): PublicUser {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
}
