"use client";

import { useRef, useState } from "react";
import { Download, Images, Moon, Sun } from "lucide-react";
import { renderCapturePng } from "./export/renderCapture";
import EditorPanel, { type PreviewEditRequest } from "./components/EditorPanel";
import PhoneFrame from "./components/PhoneFrame";
import PreviewScrollBar from "./components/PreviewScrollBar";
import DeviceScaleControl from "./components/device/DeviceScaleControl";
import type { PreviewScreen } from "./components/ChatPreview";
import { deviceTokens, type DeviceScale } from "./design/deviceTokens";
import { useChatStore } from "./hooks/useChatStore";
import { useExportDirectory } from "./hooks/useExportDirectory";

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportFilename(remark: string, long: boolean) {
  const name = remark.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").replace(/[. ]+$/g, "").slice(0, 100) || "微信聊天";
  const safeName = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name) ? `_${name}` : name;
  return `${safeName}${long ? "-长截图" : ""}.png`;
}

export default function ChatStudio() {
  const store = useChatStore();
  const destination = useExportDirectory();
  const [editRequest, setEditRequest] = useState<PreviewEditRequest | null>(null);
  const [clickToEdit, setClickToEdit] = useState(true);
  function editPreview(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest(".preview-emoji-button")) {
      event.preventDefault(); event.stopPropagation();
      setEditRequest({ kind: "emoji", nonce: Date.now() });
      return;
    }
    if (!clickToEdit) return;
    const row = target.closest<HTMLElement>("[data-message-id]");
    let request: Omit<PreviewEditRequest, "nonce"> | null = null;
    if (target.closest(".message-avatar") && row?.dataset.senderId) request = { kind: "person", id: row.dataset.senderId };
    else if (row?.dataset.messageId) request = { kind: "message", id: row.dataset.messageId };
    else if (target.closest(".status-battery")) request = { kind: "appearance", id: "batteryLevel" };
    else if (target.closest(".status-icons")) request = { kind: "appearance", id: "network" };
    else if (target.closest(".phone-status")) request = { kind: "appearance", id: "statusTime" };
    else if (target.closest(".wechat-nav-badge")) request = { kind: "appearance", id: "unreadCount" };
    else if (target.closest(".wechat-nav-title, .wechat-nav-more")) request = { kind: "appearance", id: "title" };
    else if (target.closest(".input-bar-emoji")) request = { kind: "emoji" };
    else if (target.closest(".wechat-input-bar")) request = { kind: "composer" };
    else if (target.closest(".chat-scroll")) request = { kind: "appearance", id: "wallpaper" };
    if (request) { event.preventDefault(); event.stopPropagation(); setEditRequest({ ...request, nonce: Date.now() }); }
  }
  const phoneRef = useRef<HTMLDivElement>(null);
  const longRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<"normal" | "long" | null>(null);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");
  const [previewScreen, setPreviewScreen] = useState<PreviewScreen>("chats");
  const [deviceScale, setDeviceScale] = useState<DeviceScale>(100);
  const screens: { id: PreviewScreen; label: string }[] = [{ id: "chats", label: "聊天列表" }, { id: "room", label: "会话" }, { id: "contacts", label: "通讯录" }, { id: "discover", label: "发现" }, { id: "profile", label: "我" }];

  async function exportImage(long: boolean) {
    const node = long ? longRef.current : phoneRef.current;
    if (!node) return;
    setExporting(long ? "long" : "normal");
    setExportError("");
    setExportSuccess("");
    try {
      await destination.authorize();
      const dataUrl = await renderCapturePng(node, long ? 2 : 3);
      const outputImage = new Image();
      outputImage.src = dataUrl;
      await outputImage.decode();
      const filename = exportFilename(store.chat.settings.title, long);
      const savedPath = await destination.save(dataUrl, filename);
      if (!savedPath) downloadDataUrl(dataUrl, filename);
      setExportSuccess(savedPath ? `已保存到 ${savedPath}` : `已生成 ${outputImage.naturalWidth} × ${outputImage.naturalHeight} PNG`);
    } catch (error) {
      setExportError(error instanceof Error ? `导出失败：${error.message}` : "图片保存失败，请检查保存位置后重试。");
    } finally {
      setExporting(null);
    }
  }

  return <main className={`studio-shell ${store.chat.settings.darkMode ? "studio-dark" : ""}`}>
    <EditorPanel store={store} editRequest={editRequest} destination={destination} />
    <aside className="preview-panel"><div className="preview-inner">
      <div className="preview-heading"><div><span className="preview-eyebrow">实时预览</span><h2>手机预览</h2></div><div className="preview-heading-actions"><a href="/compare" className="open-compare">打开 CompareView</a><button type="button" className="quick-theme" onClick={() => store.updateSettings({ darkMode: !store.chat.settings.darkMode })} aria-label={store.chat.settings.darkMode ? "切换浅色模式" : "切换暗色模式"}>{store.chat.settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}</button></div></div>
      <div className="preview-screen-switcher" role="group" aria-label="切换预览页面">{screens.map((item) => <button key={item.id} type="button" className={previewScreen === item.id ? "is-active" : ""} onClick={() => setPreviewScreen(item.id)}>{item.label}</button>)}</div>
      <DeviceScaleControl value={deviceScale} onChange={setDeviceScale} />
      <label className="preview-click-edit"><input type="checkbox" checked={clickToEdit} onChange={event => setClickToEdit(event.target.checked)} /> 点击预览组件编辑</label>
      <div className={`preview-phone-wrap ${clickToEdit ? "preview-edit-enabled" : ""}`} onClickCapture={editPreview}><div className="device-scale-shell" style={{ width: deviceTokens.frameWidth * deviceScale / 100, height: deviceTokens.frameHeight * deviceScale / 100 }}><PhoneFrame ref={phoneRef} chat={store.chat} screen={previewScreen} scale={deviceScale} onNavigate={setPreviewScreen} /></div><PreviewScrollBar phoneRef={phoneRef} enabled={previewScreen === "room"} scale={deviceScale} /></div>
      <div className="export-actions"><button type="button" className="export-main" disabled={!!exporting || !destination.ready} onClick={() => exportImage(false)}><Download size={16} />{exporting === "normal" ? "生成中…" : "生成图片"}</button><button type="button" className="export-secondary" disabled={!!exporting || !destination.ready} onClick={() => exportImage(true)}><Images size={16} />{exporting === "long" ? "生成中…" : "生成长截图"}</button></div>
      {exportError && <p className="export-error" role="alert">{exportError}</p>}
      {exportSuccess && <p className="export-success" role="status">{exportSuccess}</p>}
      <p className="preview-hint">普通图片导出当前页面，长截图导出完整会话</p>
    </div></aside>
    <div className="long-capture-stage" aria-hidden="true"><PhoneFrame ref={longRef} chat={store.chat} long /></div>
  </main>;
}
