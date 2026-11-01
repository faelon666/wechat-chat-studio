import { useEffect, useState } from "react";

type Directory = {
  name: string;
  queryPermission(options: { mode: "readwrite" }): Promise<string>;
  requestPermission(options: { mode: "readwrite" }): Promise<string>;
  getFileHandle(name: string, options?: { create: boolean }): Promise<{
    createWritable(): Promise<{ write(blob: Blob): Promise<void>; close(): Promise<void> }>;
  }>;
};
type PickerWindow = Window & { showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<Directory> };

async function remember(value?: Directory | null): Promise<Directory | null> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("wechat-export-settings", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("settings");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("settings", value === undefined ? "readonly" : "readwrite");
      const store = tx.objectStore("settings");
      const request = value === undefined ? store.get("directory") : value === null ? store.delete("directory") : store.put(value, "directory");
      tx.oncomplete = () => resolve(value === undefined ? request.result || null : value);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

export function useExportDirectory() {
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [ready, setReady] = useState(false);
  const supported = typeof (window as PickerWindow).showDirectoryPicker === "function";
  useEffect(() => { void remember().then(setDirectory).catch(() => {}).finally(() => setReady(true)); }, []);
  async function choose() {
    const selected = await (window as PickerWindow).showDirectoryPicker!({ mode: "readwrite" });
    await remember(selected);
    setDirectory(selected);
  }
  async function reset() { await remember(null); setDirectory(null); }
  async function authorize() {
    if (!directory) return;
    if (await directory.queryPermission({ mode: "readwrite" }) !== "granted" &&
      await directory.requestPermission({ mode: "readwrite" }) !== "granted") {
      throw new Error("请允许保存到所选文件夹，或切换为浏览器默认下载。");
    }
  }
  async function save(dataUrl: string, filename: string) {
    if (!directory) return null;
    // Keep earlier exports when the same remark is used again.
    let candidate = filename;
    for (let index = 1; ; index++) {
      try { await directory.getFileHandle(candidate); }
      catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") break;
        throw error;
      }
      candidate = filename.replace(/\.png$/i, ` (${index}).png`);
    }
    const file = await directory.getFileHandle(candidate, { create: true });
    const writable = await file.createWritable();
    await writable.write(await (await fetch(dataUrl)).blob());
    await writable.close();
    return `${directory.name} / ${candidate}`;
  }
  return { directory, supported, ready, choose, reset, authorize, save };
}
