import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Smile, Upload, X } from "lucide-react";
import { emojiList, type Sticker } from "../store/emoji";
import { readImage } from "../hooks/useImageUpload";
import { addStickers, listStickers, MAX_STICKERS, removeSticker } from "../store/stickerLibrary";
import "../styles/emoji-picker.css";

const RECENT_KEY = "wechat-recent-emoji-v1";
function readRecent(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(value) ? value.filter((s): s is string => typeof s === "string" && emojiList.some(([name]) => name === s)).slice(0, 12) : [];
  } catch { return []; }
}

export default function EmojiPicker({ onEmoji, onSticker, openSignal = 0, editing = false }: {
  onEmoji?: (token: string) => void;
  onSticker?: (sticker: Sticker) => void;
  openSignal?: number;
  editing?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"emoji" | "sticker">(onEmoji ? "emoji" : "sticker");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(readRecent);
  const [library, setLibrary] = useState<Sticker[]>([]);
  const [visibleCount, setVisibleCount] = useState(80);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (openSignal) setOpen(true); }, [openSignal]);
  useEffect(() => {
    if (!open) return;
    void refreshLibrary(); setRecent(readRecent());
  }, [open]);

  async function refreshLibrary() {
    try { setLibrary(await listStickers()); }
    catch (error) { setError(error instanceof Error ? error.message : "无法同步表情包收藏，请重试。"); }
  }

  function chooseEmoji(name: string) {
    onEmoji?.(`[${name}]`);
    const next = [name, ...recent.filter(item => item !== name)].slice(0, 12);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* Sending still works without history. */ }
  }
  useEffect(() => {
    const sync = () => { void refreshLibrary(); };
    sync();
    const timer = window.setInterval(() => { if (!document.hidden) sync(); }, 3000);
    window.addEventListener("sticker-library-changed", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => { window.clearInterval(timer); window.removeEventListener("sticker-library-changed", sync); window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
  }, []);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setBusy(true); setError("");
    try {
      const existing = await listStickers();
      if (existing.length + files.length > MAX_STICKERS) throw new Error(`最多收藏 ${MAX_STICKERS} 个表情包，请先移除几个再上传。`);
      const added: Sticker[] = [];
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} 超过 8MB，请选择小一些的图片。`);
        added.push({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ""), image: await readImage(file, 320, true) });
        if (added.length === 20) { await addStickers(added); added.length = 0; }
      }
      await addStickers(added);
      setMode("sticker");
    } catch (err) { setError(err instanceof Error ? err.message : "表情包上传失败"); }
    finally { await refreshLibrary(); window.dispatchEvent(new Event("sticker-library-changed")); setBusy(false); }
  }
  const matches = (name: string) => name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const faces = emojiList.filter(([name, symbol]) => matches(name) || (query.trim() && symbol.includes(query.trim())));
  const filteredStickers = library.filter(sticker => matches(sticker.name));
  return <div className="emoji-picker">
    <button className="emoji-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><Smile size={16} />{onSticker ? "表情 / 表情包" : "插入表情"}</button>
    {open && <section className="emoji-panel" aria-label="表情选择器" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); event.stopPropagation(); } }}>
      <div className="emoji-tabs">
        {onEmoji && <button type="button" aria-pressed={mode === "emoji"} onClick={() => setMode("emoji")}>常用表情</button>}
        {onSticker && <button type="button" aria-pressed={mode === "sticker"} onClick={() => setMode("sticker")}>我的表情包</button>}
        <button className="emoji-close" type="button" aria-label="关闭表情面板" onClick={() => setOpen(false)}><X size={16} /></button>
      </div>
      <input className="emoji-search" aria-label="搜索表情" placeholder={mode === "emoji" ? "搜索：捂脸、玫瑰、抱拳…" : "搜索表情包名称"} value={query} onChange={e => { setQuery(e.target.value); setVisibleCount(80); }} />
      {mode === "emoji" ? <>
        <p className="emoji-hint">{editing ? "点击插入正在编辑的消息，预览自动更新。" : "点击插入文字框，再点击“添加文字”发送。"}使用系统彩色表情。</p>
        {!query && recent.length > 0 && <><p className="emoji-caption">最近使用</p><div className="emoji-grid">{recent.map(name => <button key={name} type="button" title={name} aria-label={`最近使用：${name}`} onClick={() => chooseEmoji(name)}>{emojiList.find(([label]) => label === name)?.[1]}</button>)}</div></>}
        <div className="emoji-grid">{faces.map(([name, symbol]) => <button key={name} type="button" title={name} aria-label={`插入${name}`} onClick={() => chooseEmoji(name)}>{symbol}</button>)}</div>
        {!faces.length && <p className="emoji-hint">没有找到这个表情，试试其他名字。</p>}
      </> : <>
        <p className="emoji-hint">{editing ? "点击图片替换当前表情包。" : "点击图片直接发送。"}支持透明 PNG、WebP；GIF 在截图中保存为静态画面。</p>
        <button className="emoji-toggle" type="button" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={15} />{busy ? "正在导入…" : "上传表情包"}</button>
        <p className="emoji-hint">已收藏 {library.length} / {MAX_STICKERS}</p>
        <input ref={inputRef} className="hidden" type="file" accept="image/png,image/webp,image/jpeg,image/gif" multiple aria-label="上传表情包文件" onChange={upload} />
        <div className="sticker-grid">{filteredStickers.slice(0, visibleCount).map(sticker => <div key={sticker.id} className="sticker-tile">
          <button type="button" className="sticker-send" title={sticker.name} aria-label={`使用表情包：${sticker.name}`} onClick={() => onSticker?.(sticker)}><img src={sticker.image} alt={sticker.name} /><span>{sticker.name}</span></button>
          <button type="button" className="sticker-remove" aria-label={`移除收藏：${sticker.name}`} title="移除收藏（已发送消息会保留）" onClick={() => { void removeSticker(sticker.id).then(() => { void refreshLibrary(); window.dispatchEvent(new Event("sticker-library-changed")); setError(""); }).catch(() => setError("未能移除收藏，请重试。")); }}><X size={12} /></button>
        </div>)}</div>
        {filteredStickers.length > visibleCount && <button className="emoji-toggle" type="button" onClick={() => setVisibleCount(count => count + 80)}>显示更多（剩余 {filteredStickers.length - visibleCount} 个）</button>}
        {!filteredStickers.length && <p className="emoji-hint">{library.length ? "没有找到这个表情包。" : "上传喜欢的表情包，之后可以反复使用。"}</p>}
      </>}
      {error && <p role="alert" className="emoji-error">{error}</p>}
    </section>}
  </div>;
}
