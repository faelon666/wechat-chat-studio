import type { Plugin, Connect } from "vite";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

type Entry = { id: string; name: string; image: string };
type Catalog = { entries: Entry[]; removed: string[] };
const prefix = "/__shared-stickers";

export function stickerPlugin(): Plugin {
  const root = path.resolve(process.env.WECHAT_STICKER_DIR || ".local-data/stickers");
  const manifest = path.join(root, "catalog.json");
  async function catalog(): Promise<Catalog> {
    try { return JSON.parse(await readFile(manifest, "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return { entries: [], removed: [] }; throw error; }
  }
  async function locked<T>(action: () => Promise<T>): Promise<T> {
    await mkdir(root, { recursive: true });
    const lock = path.join(root, "write.lock");
    let acquired = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      try { await mkdir(lock); acquired = true; break; }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; await new Promise(resolve => setTimeout(resolve, 50)); }
    }
    if (!acquired) throw new Error("表情包收藏正在保存，请稍后重试。");
    try { return await action(); }
    finally { const { rmdir } = await import("node:fs/promises"); await rmdir(lock); }
  }
  async function persist(value: Catalog) {
    const temporary = `${manifest}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(value));
    await rename(temporary, manifest);
  }
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (!url.pathname.startsWith(prefix)) return next();
    const send = (status: number, body: unknown) => { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(body)); };
    void (async () => {
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return send(403, { error: "不允许跨站访问" });
      const imageMatch = url.pathname.match(/^\/__shared-stickers\/images\/([a-f0-9]{64})$/);
      if (req.method === "GET" && imageMatch) {
        const image = await readFile(path.join(root, `${imageMatch[1]}.image`), "utf8");
        const match = image.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
        if (!match) return send(404, { error: "图片不存在" });
        res.setHeader("Content-Type", match[1]); res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(Buffer.from(match[2], "base64")); return;
      }
      if (url.pathname !== prefix) return send(404, { error: "未找到" });
      if (req.method === "GET") return send(200, (await catalog()).entries);
      if (req.method !== "POST" && req.method !== "DELETE") return send(405, { error: "不支持的操作" });
      if (!req.headers["content-type"]?.startsWith("application/json")) return send(415, { error: "请使用 JSON" });
      let body = "";
      for await (const chunk of req) { body += chunk.toString(); if (Buffer.byteLength(body) > 32 * 1024 * 1024) return send(413, { error: "单次上传过大，请分批上传。" }); }
      const input = JSON.parse(body);
      await locked(async () => {
        const data = await catalog();
        if (req.method === "DELETE") {
          if (typeof input.id !== "string") throw new Error("表情包编号无效");
          data.entries = data.entries.filter(entry => entry.id !== input.id);
          if (!data.removed.includes(input.id)) data.removed.push(input.id);
          // Keep image files so already-sent messages remain visible.
        } else {
          if (!Array.isArray(input.items) || input.items.length > 20) throw new Error("请每批上传不超过 20 个表情包。");
          const additions: { entry: Entry; image: string }[] = [];
          for (const item of input.items) {
            if (typeof item.name !== "string" || typeof item.image !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(item.image)) throw new Error("表情包图片格式无效。");
            const id = createHash("sha256").update(item.image).digest("hex");
            if (data.entries.some(entry => entry.id === id) || additions.some(item => item.entry.id === id) || (input.migration && data.removed.includes(id))) continue;
            additions.push({ entry: { id, name: item.name.slice(0, 200), image: `${prefix}/images/${id}` }, image: item.image });
          }
          if (data.entries.length + additions.length > 1000) throw new Error("最多收藏 1000 个表情包，请先移除几个再上传。");
          for (const item of additions) {
            const target = path.join(root, `${item.entry.id}.image`);
            const temp = `${target}.${randomUUID()}.tmp`;
            await writeFile(temp, item.image); await rename(temp, target);
            data.entries.push(item.entry);
            data.removed = data.removed.filter(id => id !== item.entry.id);
          }
        }
        await persist(data);
      });
      send(200, { ok: true });
    })().catch(error => send(400, { error: error instanceof Error ? error.message : "表情包保存失败，请重试。" }));
  };
  return { name: "shared-sticker-library", configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) { server.middlewares.use(middleware); } };
}
