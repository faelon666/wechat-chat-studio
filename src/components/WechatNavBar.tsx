import SmoothText from "./SmoothText";
import type { CSSProperties } from "react";
import { wechatNavCssVars, wechatNavTokens } from "../design/wechatNavTokens";
import "../styles/wechat-nav.css";

type Props = { title: string; unreadCount?: string; onBack?: () => void };

export default function WechatNavBar({ title, unreadCount, onBack }: Props) {
  const dotRadius = wechatNavTokens.moreIconDotSize / 2;
  const dotStep = wechatNavTokens.moreIconDotSize + wechatNavTokens.moreIconGap;
  return <nav className="wechat-nav" style={wechatNavCssVars as CSSProperties} aria-label="微信聊天顶部导航">
    <div className="wechat-nav-leading"><button type="button" className="wechat-nav-back" onClick={onBack} aria-label="返回微信"><svg viewBox="0 0 18 24" fill="none" aria-hidden="true"><path d="M13 4.5 5.5 12l7.5 7.5" stroke="currentColor" strokeWidth={wechatNavTokens.backIconStroke} strokeLinecap="round" strokeLinejoin="round" /></svg><span className="wechat-nav-debug-label">back box</span></button>{unreadCount && <span className="wechat-nav-badge">{unreadCount}<span className="wechat-nav-debug-label">badge box</span></span>}</div>
    <strong className="wechat-nav-title"><SmoothText text={title} /><span className="wechat-nav-debug-label">title box</span></strong>
    <span className="wechat-nav-more" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor">{[-1, 0, 1].map((index) => <circle key={index} cx={12 + index * dotStep} cy="12" r={dotRadius} />)}</svg><span className="wechat-nav-debug-label">more box</span></span>
    <span className="wechat-nav-debug-height" aria-hidden="true">nav bar {wechatNavTokens.navHeight}pt</span>
  </nav>;
}

