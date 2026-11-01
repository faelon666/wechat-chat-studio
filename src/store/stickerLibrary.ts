import type { Sticker } from "./emoji";

export const MAX_STICKERS = 1000;
const LEGACY_KEY = "wechat-sticker-library-v1";
const DB_NAME = "wechat-sticker-library-v2";
const STORE = "stickers";

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function write(items: Sticker[]): Promise<void> {
  if (!items.length) return;
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      items.forEach(item => transaction.objectStore(STORE).put(item));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}

async function migrate(): Promise<void> {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;
  const parsed: unknown = JSON.parse(legacy);
  const items = Array.isArray(parsed) ? parsed.filter((item): item is Sticker =>
    item && typeof item.id === "string" && typeof item.name === "string" &&
    typeof item.image === "string" && item.image.startsWith("data:image/")) : [];
  await write(items);
  localStorage.removeItem(LEGACY_KEY);
}

async function localStickers(): Promise<Sticker[]> {
  await migrate();
  const db = await database();
  try {
    return await new Promise<Sticker[]>((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as Sticker[]);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

const API = "/__shared-stickers";
const MIGRATED = "wechat-stickers-shared-migrated-v1";
async function request(method = "GET", body?: unknown) {
  const response = await fetch(API, { method, cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!response.headers.get("content-type")?.includes("application/json")) throw new Error("请刷新项目页面，启用表情包共享服务。");
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || "表情包同步失败，请重试。");
  return value;
}
let migration: Promise<void> | undefined;
function migrateToShared() {
  if (!migration) migration = (async () => {
    if (localStorage.getItem(MIGRATED)) return;
    const items = await localStickers();
    for (let offset = 0; offset < items.length; offset += 20) {
      await request("POST", { items: items.slice(offset, offset + 20), migration: true });
    }
    // Keep the original library as a backup; never merge it again after success.
    localStorage.setItem(MIGRATED, "true");
  })().catch(error => { migration = undefined; throw error; });
  return migration;
}
export async function listStickers(): Promise<Sticker[]> {
  await migrateToShared();
  return request();
}
export async function addStickers(items: Sticker[]): Promise<void> {
  await migrateToShared();
  if (items.length) await request("POST", { items });
}
export async function removeSticker(id: string): Promise<void> {
  await migrateToShared();
  await request("DELETE", { id });
}
