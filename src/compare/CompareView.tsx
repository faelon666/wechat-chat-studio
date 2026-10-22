import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import PhoneFrame from "../components/PhoneFrame";
import { DeviceFrame } from "../components/IPhone15ProMaxCanvas";
import DeviceScaleControl from "../components/device/DeviceScaleControl";
import type { PreviewScreen } from "../components/ChatPreview";
import { deviceCssVars, deviceTokens, type DeviceScale } from "../design/deviceTokens";
import { wechatNavTokens } from "../design/wechatNavTokens";
import { defaultChat } from "../store/defaults";
import type { ChatState } from "../store/types";
import { renderCapturePng } from "../export/renderCapture";
import { referenceMatchingDemo } from "./referenceMatchingDemo";
import { redPacketDemo } from "./redPacketDemo";

const STORAGE_KEY = "wechat-chat-simulator-v1";
const SCREENS: { value: PreviewScreen; label: string }[] = [
  { value: "room", label: "会话" },
  { value: "chats", label: "聊天列表" },
  { value: "contacts", label: "通讯录" },
  { value: "discover", label: "发现" },
  { value: "profile", label: "我" },
];
const X_TICKS = [...Array.from({ length: Math.floor(deviceTokens.screenWidth / 50) + 1 }, (_, index) => index * 50), deviceTokens.screenWidth];
const Y_TICKS = [...Array.from({ length: Math.floor(deviceTokens.screenHeight / 50) + 1 }, (_, index) => index * 50), deviceTokens.screenHeight];

type Reference = { url: string; name: string; width: number; height: number };

function loadChatSnapshot(): ChatState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultChat;
    const parsed = JSON.parse(raw) as ChatState;
    if (!Array.isArray(parsed.people) || !Array.isArray(parsed.messages) || !parsed.settings || parsed.people.length === 0) return defaultChat;
    return { ...parsed, settings: { ...defaultChat.settings, ...parsed.settings } };
  } catch {
    return defaultChat;
  }
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" className={`compare-toggle ${active ? "is-active" : ""}`} aria-pressed={active} onClick={onClick}>{label}</button>;
}

function Rulers() {
  return <div className="compare-rulers" aria-hidden="true">
    <div className="compare-ruler-x">{X_TICKS.map((tick) => <span key={tick} className={tick % 100 === 0 ? "is-major" : ""} style={{ left: tick }}>{tick % 100 === 0 || tick === deviceTokens.screenWidth ? <b>{tick}</b> : null}</span>)}</div>
    <div className="compare-ruler-y">{Y_TICKS.map((tick) => <span key={tick} className={tick % 100 === 0 ? "is-major" : ""} style={{ top: tick }}>{tick % 100 === 0 || tick === deviceTokens.screenHeight ? <b>{tick}</b> : null}</span>)}</div>
  </div>;
}

function Guides({ safe, boundaries, screen }: { safe: boolean; boundaries: boolean; screen: PreviewScreen }) {
  const navHeight = screen === "room" ? wechatNavTokens.navHeight : 44;
  const contentTop = deviceTokens.safeAreaTop + navHeight;
  const bottomBarTop = deviceTokens.screenHeight - deviceTokens.safeAreaBottom - 60;
  const regions = [
    { label: `状态栏 ${deviceTokens.safeAreaTop}pt`, top: 0, height: deviceTokens.safeAreaTop },
    { label: `导航栏 ${navHeight}pt`, top: deviceTokens.safeAreaTop, height: navHeight },
    { label: `内容区域 ${bottomBarTop - contentTop}pt`, top: contentTop, height: bottomBarTop - contentTop },
    { label: screen === "room" ? "输入栏 60pt" : "Tab 栏 60pt", top: bottomBarTop, height: 60 },
    { label: `底部安全区 ${deviceTokens.safeAreaBottom}pt`, top: deviceTokens.screenHeight - deviceTokens.safeAreaBottom, height: deviceTokens.safeAreaBottom },
  ];
  return <div className="compare-screen-guides" aria-hidden="true">
    {safe && <><div className="compare-safe-top"><span>顶部安全区 59pt</span></div><div className="compare-safe-bottom"><span>底部安全区 34pt</span></div></>}
    {boundaries && regions.map((region) => <div key={region.top} className="compare-boundary" style={{ top: region.top, height: region.height }}><span>{region.label}</span></div>)}
  </div>;
}

export default function CompareView() {
  const [chat, setChat] = useState<ChatState>(loadChatSnapshot);
  const [matchingDemo, setMatchingDemo] = useState(true);
  const [redPacketDemoActive, setRedPacketDemoActive] = useState(false);
  const [screen, setScreen] = useState<PreviewScreen>("room");
  const [deviceScale, setDeviceScale] = useState<DeviceScale>(100);
  const [reference, setReference] = useState<Reference | null>(null);
  const [referenceError, setReferenceError] = useState("");
  const [overlay, setOverlay] = useState(false);
  const [opacity, setOpacity] = useState(50);
  const [showSafe, setShowSafe] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const deviceStageRef = useRef<HTMLDivElement>(null);
  const compareColumnsRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState<"device" | "compare" | null>(null);
  const [captureError, setCaptureError] = useState("");
  const [captureStatus, setCaptureStatus] = useState("");

  async function saveDebugScreenshot(kind: "device" | "compare") {
    const node = kind === "device" ? deviceStageRef.current : compareColumnsRef.current;
    if (!node) return;
    setCapturing(kind);
    setCaptureError("");
    setCaptureStatus("");
    try {
      const png = await renderCapturePng(node, 2);
      setCaptureStatus(kind === "device" ? "设备截图已生成。" : "对比截图已生成。");
      const link = document.createElement("a");
      link.href = png;
      link.download = kind === "device" ? "iPhone15ProMaxCanvas-100.png" : "iPhone15ProMax-Compare.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setCaptureError(`截图保存失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setCapturing(null);
    }
  }

  useEffect(() => {
    const refresh = () => setChat(loadChatSnapshot());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    if (!matchingDemo || screen !== "room") return;
    const frame = requestAnimationFrame(() => {
      const scroll = deviceStageRef.current?.querySelector<HTMLElement>(".chat-scroll");
      if (scroll) scroll.scrollTop = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [chat, matchingDemo, screen]);

  function loadReference(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setReferenceError("请选择图片文件。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const image = new Image();
      image.onload = () => {
        setReference({ url, name: file.name, width: image.naturalWidth, height: image.naturalHeight });
        setReferenceError("");
      };
      image.onerror = () => setReferenceError("无法读取这张图片，请换一张截图。");
      image.src = url;
    };
    reader.onerror = () => setReferenceError("无法读取这张图片，请换一张截图。");
    reader.readAsDataURL(file);
  }

  const ratioMismatch = reference && Math.abs(reference.width / reference.height - deviceTokens.screenWidth / deviceTokens.screenHeight) > 0.01;
  const previewChat = useMemo(() => redPacketDemoActive ? redPacketDemo(chat) : matchingDemo ? referenceMatchingDemo(chat) : chat, [chat, matchingDemo, redPacketDemoActive]);
  const scaledFrame = { width: deviceTokens.frameWidth * deviceScale / 100, height: deviceTokens.frameHeight * deviceScale / 100, "--compare-scale": String(deviceScale / 100) } as CSSProperties;

  return <main className="compare-page" style={deviceCssVars as CSSProperties}>
    <header className="compare-header"><div><a href="/" className="compare-back">← 返回编辑器</a><h1>微信界面视觉对比</h1><p>在同一 430 × 932 pt 画布上检查模拟器与真实截图的差异。</p></div><strong className="compare-size">430 × 932 pt</strong></header>

    <section className="compare-toolbar" aria-label="视觉对比工具">
      <div className="compare-toolbar-group"><label htmlFor="compare-screen">预览页面</label><select id="compare-screen" value={screen} onChange={(event) => setScreen(event.target.value as PreviewScreen)}>{SCREENS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
      <Toggle label="参考布局样例" active={matchingDemo} onClick={() => { setMatchingDemo((value) => !value); setRedPacketDemoActive(false); setScreen("room"); }} />
      <Toggle label="红包样例" active={redPacketDemoActive} onClick={() => { setRedPacketDemoActive((value) => !value); setMatchingDemo(false); setScreen("room"); }} />
      <div className="compare-toolbar-group compare-upload"><label htmlFor="compare-image">参考截图</label><input id="compare-image" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { loadReference(event.target.files?.[0]); event.target.value = ""; }} /></div>
      <Toggle label="Overlay 模式" active={overlay} onClick={() => setOverlay((value) => !value)} />
      <label className="compare-opacity">透明度 <input type="range" min="0" max="100" value={opacity} disabled={!overlay || !reference} onChange={(event) => setOpacity(Number(event.target.value))} /><output>{opacity}%</output></label>
      <Toggle label="显示安全区域" active={showSafe} onClick={() => setShowSafe((value) => !value)} />
      <Toggle label="显示组件边界" active={showBoundaries} onClick={() => setShowBoundaries((value) => !value)} />
      <Toggle label="显示尺寸标尺" active={showRulers} onClick={() => setShowRulers((value) => !value)} />
      <DeviceScaleControl value={deviceScale} onChange={setDeviceScale} />
      <button type="button" className="compare-toggle" disabled={!!capturing} onClick={() => saveDebugScreenshot("device")}>{capturing === "device" ? "截图中…" : "保存设备截图"}</button>
      <button type="button" className="compare-toggle" disabled={!!capturing} onClick={() => saveDebugScreenshot("compare")}>{capturing === "compare" ? "截图中…" : "保存对比截图"}</button>
    </section>

    <dl className="compare-device-metrics" aria-label="设备调试信息">
      <div><dt>screen</dt><dd>{deviceTokens.screenWidth} × {deviceTokens.screenHeight}</dd></div>
      <div><dt>safeTop</dt><dd>{deviceTokens.safeAreaTop}</dd></div>
      <div><dt>safeBottom</dt><dd>{deviceTokens.safeAreaBottom}</dd></div>
    </dl>

    <div className="compare-notices">{referenceError && <p role="alert">{referenceError}</p>}{captureError && <p role="alert">{captureError}</p>}{captureStatus && <p role="status">{captureStatus}</p>}{ratioMismatch && <p>参考图比例与 430 × 932 不同；当前按画布拉伸显示，建议上传原始 iPhone 15 Pro Max 截图。</p>}</div>

    <div className="compare-columns" ref={compareColumnsRef}>
      <section className="compare-panel"><div className="compare-panel-heading"><div><h2>当前模拟器</h2><span>{redPacketDemoActive ? "红包样例：左侧、右侧、已领取 · 仅在对比页生效" : matchingDemo ? "参考布局样例 · 仅在对比页生效" : "读取编辑器已保存的聊天配置"}</span></div><span>430 × 932 pt</span></div><div className="compare-stage-scroll"><div className="compare-scale-shell" style={scaledFrame}><div ref={deviceStageRef} className={`compare-sim-stage ${showBoundaries ? "compare-show-bounds" : ""}`}><PhoneFrame chat={previewChat} screen={screen} onNavigate={setScreen} />{reference && overlay && <div className="compare-image-overlay" style={{ opacity: opacity / 100 }}><img src={reference.url} alt="覆盖在模拟器上的参考截图" /></div>}<Guides safe={showSafe} boundaries={showBoundaries} screen={screen} />{showRulers && <Rulers />}</div></div></div></section>

      <section className="compare-panel"><div className="compare-panel-heading"><div><h2>参考截图</h2><span>{reference ? `${reference.name} · ${reference.width} × ${reference.height} px` : "上传真实 iPhone 微信截图"}</span></div><span>430 × 932 pt</span></div><div className="compare-stage-scroll"><div className="compare-scale-shell" style={scaledFrame}><div className="compare-reference-stage" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); loadReference(event.dataTransfer.files[0]); }}><DeviceFrame screenClassName="compare-reference-screen">{reference ? <img src={reference.url} alt="真实微信参考截图" /> : <label htmlFor="compare-image" className="compare-empty-reference"><span>拖入截图，或点击上方“参考截图”上传</span><small>建议尺寸：430 × 932 或 1290 × 2796</small></label>}</DeviceFrame></div></div></div></section>
    </div>
  </main>;
}
