import type { CSSProperties } from "react";
import { inputBarCssVars, inputBarTokens } from "../design/inputBarTokens";
import "../styles/input-bar.css";

function InputIcon({ kind }: { kind: "voice" | "emoji" | "plus" }) {
  return <svg className={`input-bar-icon input-bar-${kind}`} viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth={inputBarTokens.iconStroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="15" cy="15" r="13.5" />
    {kind === "voice" ? <><path d="m10.5 12.4-2.4 2.7 2.4 2.6c1.4-1.4 1.4-3.9 0-5.3Z" fill="currentColor" stroke="none" /><path d="M13.8 10.2c2.6 2.7 2.6 6.9 0 9.6M17.4 6.8c4.6 4.6 4.6 11.8 0 16.4" strokeLinecap="butt" /></> : kind === "emoji" ? <><circle cx="10.3" cy="10.4" r="2" fill="currentColor" stroke="none" /><circle cx="19.7" cy="10.4" r="2" fill="currentColor" stroke="none" /><path d="M7.5 15.7h15c-.6 5.1-4 7-7.5 7s-6.9-1.9-7.5-7Z" /></> : <path d="M15 8v14M8 15h14" strokeLinecap="butt" />}
  </svg>;
}

export default function ChatInputBar() {
  return <div className="chat-bottom wechat-input-bar" style={inputBarCssVars as CSSProperties} aria-label="微信输入栏预览"><div className="chat-input-row">
    <InputIcon kind="voice" /><div className="fake-input" aria-label="空白消息输入框" /><InputIcon kind="emoji" /><InputIcon kind="plus" />
  </div></div>;
}
