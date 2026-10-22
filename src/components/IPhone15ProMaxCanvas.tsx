import { forwardRef, type CSSProperties, type ReactNode, type Ref } from "react";
import ChatPreview from "./ChatPreview";
import type { PreviewScreen } from "./ChatPreview";
import StatusBar from "./device/StatusBar";
import { deviceCssVars, type DeviceScale } from "../design/deviceTokens";
import { statusBarCssVars } from "../design/statusBarTokens";
import type { ChatState } from "../store/types";

type CanvasProps = { chat: ChatState; long?: boolean; screen?: PreviewScreen; scale?: DeviceScale; onNavigate?: (screen: PreviewScreen) => void };
type FrameProps = { children: ReactNode; long?: boolean; dark?: boolean; scale?: DeviceScale; screenClassName?: string; screenRef?: Ref<HTMLDivElement> };

export function DeviceFrame({ children, long = false, dark = false, scale = 100, screenClassName = "", screenRef }: FrameProps) {
  const style = { ...deviceCssVars, ...statusBarCssVars, "--device-scale": String(scale / 100) } as CSSProperties;
  return <div className={`phone-frame ${long ? "phone-frame-long" : ""}`} style={style}><div ref={screenRef} className={`phone-screen ${dark ? "chat-dark" : ""} ${screenClassName}`} style={style}>{children}</div></div>;
}

function HomeIndicator({ visible = true }: { visible?: boolean }) { return <div className={`home-indicator ${visible ? "" : "home-indicator-hidden"}`} aria-hidden="true" />; }
function AppViewport({ children, long }: { children: ReactNode; long: boolean }) { return <div className={`iphone-app-viewport ${long ? "iphone-app-viewport-long" : ""}`}>{children}</div>; }

const IPhone15ProMaxCanvas = forwardRef<HTMLDivElement, CanvasProps>(function IPhone15ProMaxCanvas({ chat, long = false, screen = "room", scale = 100, onNavigate }, ref) {
  return <DeviceFrame long={long} dark={chat.settings.darkMode} scale={scale} screenRef={ref}>
    <StatusBar chat={chat} />
    <AppViewport long={long}><ChatPreview chat={chat} long={long} screen={screen} onNavigate={onNavigate} /></AppViewport>
    <HomeIndicator visible={chat.settings.showHomeIndicator} />
  </DeviceFrame>;
});

export default IPhone15ProMaxCanvas;
