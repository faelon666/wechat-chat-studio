"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import MessageBubble from "./MessageBubble";
import WechatNavBar from "./WechatNavBar";
import ChatInputBar from "./ChatInputBar";
import type { ChatState, Message } from "../store/types";

export type PreviewScreen = "chats" | "room" | "contacts" | "discover" | "profile";
type Props = { chat: ChatState; long?: boolean; screen?: PreviewScreen; onNavigate?: (screen: PreviewScreen) => void };
const asset = "/assets/icons/";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`ios-icon ${className}`} style={{ maskImage: `url(${asset}${name}.svg)`, WebkitMaskImage: `url(${asset}${name}.svg)` }} aria-hidden="true" />;
}

function TabBar({ active, onNavigate }: { active: PreviewScreen; onNavigate?: (screen: PreviewScreen) => void }) {
  const tabs = [{ id: "chats", name: "微信", icon: "tabbar_chat" }, { id: "contacts", name: "通讯录", icon: "tabbar_contacts" }, { id: "discover", name: "发现", icon: "tabbar_discover" }, { id: "profile", name: "我", icon: "tabbar_profile" }] as const;
  return <div className="ios-tab-bottom"><nav className="ios-tabbar" aria-label="微信主导航">{tabs.map((item) => <button key={item.id} type="button" className={`ios-tab ${active === item.id ? "is-active" : ""}`} onClick={() => onNavigate?.(item.id)} aria-current={active === item.id ? "page" : undefined}><Icon name={item.icon} /><span>{item.name}</span></button>)}</nav></div>;
}

function PageHeader({ title, action }: { title: string; action?: "plus" | "camera" }) {
  return <div className="ios-page-nav"><strong>{title}</strong>{action && <span className="ios-page-action">{action === "camera" ? <Icon name="camera" /> : <Plus size={25} strokeWidth={1.9} />}</span>}</div>;
}

function messageSummary(message?: Message) {
  if (!message) return "点击进入聊天";
  switch (message.type) {
    case "text": return message.text || "消息";
    case "image": return "[图片]";
    case "voice": return "[语音]";
    case "video": return message.videoStatus === "finished" ? `通话时长 ${message.duration || "00:10"}` : "[视频通话]";
    case "redpacket": return "[红包] 恭喜发财，大吉大利";
    case "transfer": return "[微信转账]";
    case "file": return `[文件] ${message.fileName || "未命名文件"}`;
    case "recall": return "撤回了一条消息";
    default: return "";
  }
}

function SearchBar() { return <div className="ios-search-area"><div className="ios-search-field"><Search size={17} strokeWidth={1.8} /><span>搜索</span></div></div>; }

function ChatList({ chat, onNavigate }: { chat: ChatState; onNavigate?: (screen: PreviewScreen) => void }) {
  const friend = chat.people[1] || chat.people[0];
  const latestTime = [...chat.messages].reverse().find((message) => message.type === "time")?.time || chat.settings.statusTime || "12:02";
  const cells = [
    { id: "current", name: chat.settings.title || friend.name, preview: messageSummary(chat.messages[chat.messages.length - 1]), time: latestTime, avatar: friend.avatar, badge: "2" },
    { id: "file", name: "文件传输助手", preview: "文件已发送", time: "昨天", tile: "file", symbol: "↗" },
    { id: "pay", name: "微信支付", preview: "微信支付凭证", time: "星期五", tile: "pay", symbol: "¥" },
    { id: "team", name: "微信团队", preview: "欢迎使用微信", time: "星期三", tile: "team", symbol: "✦" },
    { id: "group", name: "朋友群", preview: "[图片]", time: "星期一", tile: "group", symbol: "群" },
    { id: "notice", name: "订阅号消息", preview: "今天有新的内容", time: "星期一", tile: "team", symbol: "✉" },
    { id: "friend", name: "小安", preview: "周末见", time: "上周", avatar: "/assets/images/default_avatar.png" },
    { id: "work", name: "工作群", preview: "收到，明天上午同步", time: "上周", tile: "group", symbol: "群" },
    { id: "service", name: "服务通知", preview: "你有一条新通知", time: "上周", tile: "pay", symbol: "铃" },
    { id: "reading", name: "读书会", preview: "好的", time: "9/12", tile: "friends", symbol: "书" },
  ];
  return <><PageHeader title="微信" action="plus" /><div className="ios-app-scroll"><SearchBar /><div className="ios-chat-list">{cells.map((item) => <button key={item.id} type="button" className="ios-chat-cell" onClick={() => onNavigate?.("room")}><span className={`ios-list-avatar ${item.tile ? `tile-${item.tile}` : ""}`}>{item.avatar ? <img src={item.avatar} alt="" /> : item.symbol}</span><span className="ios-cell-main"><span className="ios-cell-top"><strong>{item.name}</strong><small>{item.time}</small></span><span className="ios-cell-bottom"><span>{item.preview}</span>{item.badge && <em>{item.badge}</em>}</span></span></button>)}</div></div><TabBar active="chats" onNavigate={onNavigate} /></>;
}

function ContactRow({ name, avatar, tile, symbol, onClick }: { name: string; avatar?: string; tile?: string; symbol?: string; onClick?: () => void }) {
  return <button type="button" className="ios-contact-cell" onClick={onClick}><span className={`ios-contact-avatar ${tile ? `tile-${tile}` : ""}`}>{avatar ? <img src={avatar} alt="" /> : symbol}</span><span>{name}</span></button>;
}

function Contacts({ chat, onNavigate }: { chat: ChatState; onNavigate?: (screen: PreviewScreen) => void }) {
  return <><PageHeader title="通讯录" action="plus" /><div className="ios-app-scroll ios-contacts-scroll"><SearchBar /><div className="ios-section-label">新的朋友</div><div className="ios-white-group"><ContactRow name="新的朋友" tile="friends" symbol="＋" /><ContactRow name="公众号" tile="team" symbol="✦" /></div><div className="ios-section-label">我的朋友</div><div className="ios-white-group">{chat.people.map((person) => <ContactRow key={person.id} name={person.name} avatar={person.avatar} onClick={() => onNavigate?.("room")} />)}</div><div className="ios-section-label">群聊</div><div className="ios-white-group"><ContactRow name="朋友群" tile="group" symbol="群" /><ContactRow name="家人群" tile="friends" symbol="家" /></div></div><TabBar active="contacts" onNavigate={onNavigate} /></>;
}

function MenuRow({ icon, name }: { icon: string; name: string }) {
  const glyph = icon === "pay" ? "¥" : icon === "album" ? "▣" : icon === "scan" ? "▦" : icon === "settings" ? "⚙" : icon === "star" ? "☆" : icon === "video" ? "▶" : "◉";
  return <div className="ios-menu-row"><span className={`ios-menu-symbol tile-${icon}`}>{glyph}</span><span className="ios-menu-name">{name}</span><ChevronRight size={18} strokeWidth={1.7} /></div>;
}

function Discover({ onNavigate }: { onNavigate?: (screen: PreviewScreen) => void }) {
  return <><PageHeader title="发现" /><div className="ios-app-scroll ios-grouped-scroll"><div className="ios-menu-group"><MenuRow icon="album" name="朋友圈" /></div><div className="ios-menu-group"><MenuRow icon="video" name="视频号" /><MenuRow icon="scan" name="扫一扫" /></div><div className="ios-menu-group"><MenuRow icon="star" name="看一看" /><MenuRow icon="search" name="搜一搜" /></div><div className="ios-menu-group"><MenuRow icon="app" name="小程序" /></div></div><TabBar active="discover" onNavigate={onNavigate} /></>;
}

function Profile({ chat, onNavigate }: { chat: ChatState; onNavigate?: (screen: PreviewScreen) => void }) {
  const self = chat.people[0];
  return <><PageHeader title="我" /><div className="ios-app-scroll ios-grouped-scroll"><div className="ios-profile-card"><img src={self.avatar || "/assets/images/default_avatar.png"} alt="" /><div><strong>{self.name}</strong><span>微信号：wxid_demo_0927</span><span className="ios-profile-state">+ 状态</span></div><span className="ios-qr">▦</span><ChevronRight size={18} strokeWidth={1.7} /></div><div className="ios-menu-group"><MenuRow icon="pay" name="服务" /></div><div className="ios-menu-group"><MenuRow icon="star" name="收藏" /><MenuRow icon="album" name="朋友圈" /><MenuRow icon="video" name="视频号" /><MenuRow icon="app" name="卡包" /><MenuRow icon="emoji" name="表情" /></div><div className="ios-menu-group"><MenuRow icon="settings" name="设置" /></div></div><TabBar active="profile" onNavigate={onNavigate} /></>;
}

function ChatRoom({ chat, long, onNavigate }: { chat: ChatState; long: boolean; onNavigate?: (screen: PreviewScreen) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!long && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chat.messages, long]);
  const ownId = chat.people[0]?.id;
  return <><WechatNavBar title={chat.settings.title || "聊天"} unreadCount={chat.settings.unreadCount} onBack={() => onNavigate?.("chats")} /><div ref={scrollRef} id={long ? undefined : "preview-chat-scroll"} className="chat-scroll"><div className="chat-messages">{chat.messages.length === 0 ? <div className="chat-empty">暂无聊天消息</div> : chat.messages.map((message) => { const sender = chat.people.find((person) => person.id === message.senderId) || chat.people[0]; return <MessageBubble key={message.id} message={message} sender={sender} own={message.senderId === ownId} />; })}</div></div><ChatInputBar /></>;
}

export default function IosApp({ chat, long = false, screen = "room", onNavigate }: Props) {
  const active = long ? "room" : screen;
  return <div className={`chat-preview ios-app-preview ${chat.settings.darkMode ? "chat-dark" : ""} ${active === "room" ? `wallpaper-${chat.settings.wallpaper}` : ""} ${long ? "chat-preview-long" : ""}`}>{active === "room" ? <ChatRoom chat={chat} long={long} onNavigate={onNavigate} /> : active === "chats" ? <ChatList chat={chat} onNavigate={onNavigate} /> : active === "contacts" ? <Contacts chat={chat} onNavigate={onNavigate} /> : active === "discover" ? <Discover onNavigate={onNavigate} /> : <Profile chat={chat} onNavigate={onNavigate} />}</div>;
}
