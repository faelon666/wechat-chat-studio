"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowUp, Clock3, FileText, Gift, ImagePlus, MessageCircle, Plus, RotateCcw, Trash2, Upload, Video, Volume2, Wallet, X } from "lucide-react";
import { readImage } from "../hooks/useImageUpload";
import type { ChatStore } from "../hooks/useChatStore";
import type { Message, MessageType } from "../store/types";

type Tab = "dialogue" | "appearance" | "help";
const typeLabel: Record<MessageType, string> = { text: "文字", time: "时间", image: "图片", voice: "语音", video: "视频", redpacket: "红包", transfer: "转账", file: "文件", recall: "撤回" };
const actionButtons: { type: MessageType; label: string; icon: typeof Plus }[] = [
  { type: "text", label: "添加文字", icon: MessageCircle }, { type: "time", label: "添加时间", icon: Clock3 },
  { type: "image", label: "添加图片", icon: ImagePlus }, { type: "voice", label: "添加语音", icon: Volume2 },
  { type: "video", label: "添加视频", icon: Video }, { type: "redpacket", label: "添加红包", icon: Gift },
  { type: "transfer", label: "添加转账", icon: Wallet }, { type: "file", label: "添加文件", icon: FileText },
  { type: "recall", label: "消息撤回", icon: RotateCcw },
];

function messageSummary(message: Message) {
  if (message.type === "text") return message.text || "空白文字";
  if (message.type === "time") return message.time || "时间";
  if (message.type === "image") return "图片消息";
  if (message.type === "voice") return `${message.seconds || 2} 秒语音`;
  if (message.type === "video") return message.videoStatus === "finished" ? `已通话 ${message.duration || "00:10"}` : "视频邀请";
  if (message.type === "redpacket") return message.note || "恭喜发财，大吉大利";
  if (message.type === "transfer") return `¥${message.amount || "0"} ${message.note || "转账"}`;
  if (message.type === "file") return message.fileName || "文件";
  return "撤回了一条消息";
}

export type PreviewEditRequest = { kind: "message" | "person" | "appearance" | "composer"; id?: string; nonce: number };

export default function EditorPanel({ store, editRequest }: { store: ChatStore; editRequest?: PreviewEditRequest | null }) {
  const panelRef = useRef<HTMLElement>(null);
  const { chat } = store;
  const [tab, setTab] = useState<Tab>("dialogue");
  const [text, setText] = useState("没问题!");
  const [amount, setAmount] = useState("12000");
  const [redNote, setRedNote] = useState("恭喜发财，大吉大利");
  const [transferNote, setTransferNote] = useState("");
  const [fileName, setFileName] = useState("数据恢复核心文档.docx");
  const [fileSize, setFileSize] = useState("12.1KB");
  const [voiceSeconds, setVoiceSeconds] = useState("2");
  const [voiceRead, setVoiceRead] = useState(true);
  const [videoStatus, setVideoStatus] = useState<"invite" | "finished">("finished");
  const [callDuration, setCallDuration] = useState("00:10");
  const [chatDate, setChatDate] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const selected = chat.messages.find((message) => message.id === selectedId);
  useEffect(() => {
    if (!editRequest) return;
    setTab(editRequest.kind === "appearance" ? "appearance" : "dialogue");
    if (editRequest.kind === "message") setSelectedId(editRequest.id ?? null);
    const timer = window.setTimeout(() => {
      const panel = panelRef.current;
      let target: HTMLElement | null = null;
      if (editRequest.kind === "message") target = panel?.querySelector(".selected-editor") ?? null;
      if (editRequest.kind === "person") target = [...(panel?.querySelectorAll<HTMLElement>("[data-person-id]") ?? [])].find(el => el.dataset.personId === editRequest.id) ?? null;
      if (editRequest.kind === "appearance") target = panel?.querySelector(`[data-setting="${editRequest.id}"]`) ?? null;
      if (editRequest.kind === "composer") target = panel?.querySelector("#chat-text") ?? null;
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      const field = editRequest.kind === "person" ? target?.querySelector<HTMLElement>(".person-name") : target?.matches("input,textarea,select") ? target : target?.querySelector<HTMLElement>("textarea,input,select,button");
      field?.focus({ preventScroll: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [editRequest]);


  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>, id: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    try { store.updatePerson(id, { avatar: await readImage(file, 256) }); setNotice(""); }
    catch (error) { setNotice(error instanceof Error ? error.message : "头像上传失败"); }
    event.target.value = "";
  }

  async function uploadMessageImage(event: ChangeEvent<HTMLInputElement>, replaceId?: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const image = await readImage(file, 1200);
      if (replaceId) store.updateMessage(replaceId, { image });
      else store.addMessage({ type: "image", image });
      setNotice("");
    } catch (error) { setNotice(error instanceof Error ? error.message : "图片上传失败"); }
    event.target.value = "";
  }

  function add(type: MessageType) {
    if (type === "image") { imageInputRef.current?.click(); return; }
    const time = chatDate ? new Date(chatDate) : new Date();
    const displayTime = `${time.getMonth() + 1}月${time.getDate()}日 ${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
    const payload: Record<MessageType, Omit<Message, "id" | "senderId">> = {
      text: { type, text: text.trim() || "…" }, time: { type, time: displayTime }, image: { type },
      voice: { type, seconds: Math.max(1, Number(voiceSeconds) || 2), read: voiceRead },
      video: { type, videoStatus, duration: callDuration || "00:10" },
      redpacket: { type, amount, note: redNote }, transfer: { type, amount, note: transferNote, received: true },
      file: { type, fileName: fileName.trim() || "未命名文件", fileSize: fileSize.trim() || "0KB" },
      recall: { type },
    };
    store.addMessage(payload[type]);
    setSelectedId(null);
    setNotice(`已添加${typeLabel[type]}消息`);
  }

  function editField(key: keyof Message, value: string | number | boolean) {
    if (selected) store.updateMessage(selected.id, { [key]: value });
  }

  return <section ref={panelRef} className="editor-panel">
    <div className="editor-topline"><div><span className="brand-mark"><MessageCircle size={19} fill="white" strokeWidth={1.5} /></span><strong>微信聊天模拟器</strong></div><span className="autosave-label">{store.saveError ? "本地空间不足，无法保存" : "自动保存在此设备"}</span></div>
    <nav className="editor-tabs" aria-label="编辑区域">
      {[{ id: "dialogue", label: "对话设置" }, { id: "appearance", label: "外观设置" }, { id: "help", label: "使用说明" }].map((item) => <button key={item.id} type="button" className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id as Tab)}>{item.label}</button>)}
    </nav>
    <div className="editor-body">
      {tab === "dialogue" && <>
        <div className="section-heading"><div><h2>聊天人物</h2><p>选择发送者，点击头像可上传图片</p></div><span className="section-count">{chat.people.length} 位人物</span></div>
        <div className="people-grid">
          {chat.people.map((person, index) => <div key={person.id} data-person-id={person.id} className={`person-card ${chat.activeSenderId === person.id ? "person-active" : ""}`}>
            <button className="person-select" type="button" onClick={() => store.setActiveSenderId(person.id)} aria-label={`选择${person.name}为发送者`}><span className="person-avatar-wrap"><img src={person.avatar} alt="" />{chat.activeSenderId === person.id && <span className="person-check">✓</span>}</span></button>
            <input className="person-name" value={person.name} onChange={(event) => store.updatePerson(person.id, { name: event.target.value })} aria-label={`人物${index + 1}昵称`} />
            <label className="avatar-upload" title="上传头像"><Upload size={12} /><input type="file" accept="image/*" onChange={(event) => uploadAvatar(event, person.id)} /></label>
            {chat.people.length > 1 && <button className="person-delete" type="button" onClick={() => store.deletePerson(person.id)} aria-label={`删除${person.name}`}><X size={13} /></button>}
            {index === 0 && <span className="self-badge">自己</span>}
          </div>)}
          <button className="add-person" type="button" onClick={store.addPerson}><Plus size={23} /><span>添加人物</span></button>
        </div>

        <div className="composer-heading"><div><h2>编辑消息</h2><p>当前发送者：<strong>{chat.people.find((person) => person.id === chat.activeSenderId)?.name}</strong></p></div></div>
        <label className="field-label" htmlFor="chat-text">输入聊天内容</label>
        <textarea id="chat-text" className="chat-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder="在这里输入聊天内容…" rows={3} />
        <div className="field-grid">
          <label>金额 <span>¥</span><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="12000" /></label>
          <label>红包备注<input value={redNote} onChange={(event) => setRedNote(event.target.value)} placeholder="恭喜发财，大吉大利" /></label>
          <label>转账备注<input value={transferNote} onChange={(event) => setTransferNote(event.target.value)} placeholder="选填" /></label>
          <label>聊天时间<input type="datetime-local" value={chatDate} onChange={(event) => setChatDate(event.target.value)} /></label>
          <label>语音长度 <span>秒</span><input type="number" min="1" max="600" value={voiceSeconds} onChange={(event) => setVoiceSeconds(event.target.value)} /></label>
          <label>语音状态<select value={voiceRead ? "read" : "unread"} onChange={(event) => setVoiceRead(event.target.value === "read")}><option value="read">已读</option><option value="unread">未读</option></select></label>
          <label>视频通话<select value={videoStatus} onChange={(event) => setVideoStatus(event.target.value as "invite" | "finished")}><option value="invite">视频邀请</option><option value="finished">已通话</option></select></label>
          <label>通话时间<input value={callDuration} onChange={(event) => setCallDuration(event.target.value)} placeholder="00:10" /></label>
          <label>文件名<input value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="文档.docx" /></label>
          <label>文件大小<input value={fileSize} onChange={(event) => setFileSize(event.target.value)} placeholder="12.1KB" /></label>
        </div>

        <div className="action-grid">{actionButtons.map(({ type, label, icon: Icon }) => <button key={type} type="button" className={type === "text" ? "action-primary" : ""} onClick={() => add(type)}><Icon size={15} /><span>{label}</span></button>)}</div>
        <input ref={imageInputRef} className="hidden" type="file" accept="image/*" onChange={(event) => uploadMessageImage(event)} />
        {notice && <div className="inline-notice" role="status">{notice}</div>}

        <div className="message-list-heading"><div><h2>消息顺序</h2><p>拖动消息调整位置，也可点击编辑</p></div><span className="section-count">{chat.messages.length} 条消息</span></div>
        <div className="message-list">{chat.messages.map((message, index) => <div key={message.id} className={`message-item ${selectedId === message.id ? "message-item-selected" : ""} ${dragId === message.id ? "message-item-dragging" : ""}`} draggable onDragStart={(event) => { setDragId(message.id); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (dragId) store.moveMessage(dragId, message.id); setDragId(null); }} onDragEnd={() => setDragId(null)}>
          <button className="message-item-main" type="button" onClick={() => setSelectedId(selectedId === message.id ? null : message.id)}><span className="drag-handle" aria-hidden>⠿</span><span className="message-index">{String(index + 1).padStart(2, "0")}</span><span className="message-type">{typeLabel[message.type]}</span><span className="message-summary">{messageSummary(message)}</span><span className="message-sender">{chat.people.find((person) => person.id === message.senderId)?.name || "人物"}</span></button>
          <div className="message-actions"><button type="button" onClick={() => store.shiftMessage(message.id, -1)} disabled={index === 0} aria-label="上移消息"><ArrowUp size={14} /></button><button type="button" onClick={() => store.shiftMessage(message.id, 1)} disabled={index === chat.messages.length - 1} aria-label="下移消息"><ArrowDown size={14} /></button><button type="button" onClick={() => { store.deleteMessage(message.id); setSelectedId(null); }} aria-label="删除消息"><Trash2 size={14} /></button></div>
        </div>)}</div>
        {selected && <div className="selected-editor"><div className="selected-editor-title"><strong>编辑{typeLabel[selected.type]}消息</strong><button type="button" onClick={() => setSelectedId(null)} aria-label="关闭编辑"><X size={16} /></button></div>
          <label>发送者<select value={selected.senderId} onChange={(event) => editField("senderId", event.target.value)}>{chat.people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
          {selected.type === "text" && <label>聊天内容<textarea value={selected.text || ""} onChange={(event) => editField("text", event.target.value)} rows={2} /></label>}
          {selected.type === "time" && <label>显示时间<input value={selected.time || ""} onChange={(event) => editField("time", event.target.value)} /></label>}
          {selected.type === "image" && <label className="replace-image">更换图片<input type="file" accept="image/*" onChange={(event) => uploadMessageImage(event, selected.id)} /></label>}
          {selected.type === "voice" && <><label>语音秒数<input type="number" min="1" value={selected.seconds || 2} onChange={(event) => editField("seconds", Number(event.target.value))} /></label><label className="check-label"><input type="checkbox" checked={selected.read ?? true} onChange={(event) => editField("read", event.target.checked)} /> 已读</label></>}
          {selected.type === "video" && <><label>通话状态<select value={selected.videoStatus || "invite"} onChange={(event) => editField("videoStatus", event.target.value)}><option value="invite">视频邀请</option><option value="finished">已通话</option></select></label><label>通话时长<input value={selected.duration || ""} onChange={(event) => editField("duration", event.target.value)} /></label></>}
          {(selected.type === "redpacket" || selected.type === "transfer") && <><label>金额<input value={selected.amount || ""} onChange={(event) => editField("amount", event.target.value)} /></label><label>备注<input value={selected.note || ""} onChange={(event) => editField("note", event.target.value)} /></label>{selected.type === "transfer" && <label className="check-label"><input type="checkbox" checked={selected.received ?? false} onChange={(event) => editField("received", event.target.checked)} /> 已收款</label>}</>}
          {selected.type === "file" && <><label>文件名<input value={selected.fileName || ""} onChange={(event) => editField("fileName", event.target.value)} /></label><label>文件大小<input value={selected.fileSize || ""} onChange={(event) => editField("fileSize", event.target.value)} /></label></>}
        </div>}
        <div className="bottom-actions"><button type="button" onClick={() => { if (window.confirm("确定清空所有聊天消息吗？")) store.clearMessages(); }}>清空聊天内容</button><button type="button" onClick={() => { if (window.confirm("恢复默认示例并覆盖当前内容吗？")) store.resetChat(); }}>恢复示例</button></div>
      </>}

      {tab === "appearance" && <div className="appearance-panel">
        <div className="section-heading"><div><h2>外观设置</h2><p>调整右侧手机预览的显示方式</p></div></div>
        <label data-setting="title">聊天标题<input value={chat.settings.title} onChange={(event) => store.updateSettings({ title: event.target.value })} placeholder="小安" /></label>
        <label data-setting="statusTime">状态栏时间<input value={chat.settings.statusTime} onChange={(event) => store.updateSettings({ statusTime: event.target.value })} placeholder="12:02" maxLength={5} /></label>
        <label data-setting="unreadCount">返回角标<input value={chat.settings.unreadCount ?? "246"} onChange={(event) => store.updateSettings({ unreadCount: event.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="246" inputMode="numeric" /></label>
        <label data-setting="network">网络标识<select value={chat.settings.network ?? "5g"} onChange={(event) => store.updateSettings({ network: event.target.value as "5g" | "wifi" })}><option value="5g">5G</option><option value="wifi">Wi-Fi</option></select></label>
        <label data-setting="batteryLevel">电池电量<input type="number" min="0" max="100" value={chat.settings.batteryLevel ?? 31} onChange={(event) => store.updateSettings({ batteryLevel: Math.max(0, Math.min(100, Number(event.target.value) || 0)) })} /></label>
        <div data-setting="wallpaper" className="appearance-field"><span>聊天背景</span><div className="wallpaper-options">{([{ id: "gray", name: "经典灰", className: "wallpaper-swatch-gray" }, { id: "cream", name: "暖米色", className: "wallpaper-swatch-cream" }, { id: "mint", name: "薄荷绿", className: "wallpaper-swatch-mint" }] as const).map((wallpaper) => <button key={wallpaper.id} className={chat.settings.wallpaper === wallpaper.id ? "is-selected" : ""} type="button" onClick={() => store.updateSettings({ wallpaper: wallpaper.id })}><span className={wallpaper.className} />{wallpaper.name}</button>)}</div></div>
        <label className="theme-toggle"><span><strong>暗色模式</strong><small>应用到编辑器与手机聊天界面</small></span><input type="checkbox" checked={chat.settings.darkMode} onChange={(event) => store.updateSettings({ darkMode: event.target.checked })} /><i /></label>
      </div>}
      {tab === "help" && <div className="help-panel"><div className="section-heading"><div><h2>使用说明</h2><p>快速生成属于自己的聊天截图</p></div></div><ol><li><strong>选择发送者</strong><span>点击人物头像切换；第一个人物默认为自己，消息显示在右侧。</span></li><li><strong>填写消息内容</strong><span>设置文字、金额、时间或文件信息，再点击对应的“添加”按钮。</span></li><li><strong>调整对话</strong><span>在消息顺序列表中拖动排序；点击任意消息可修改内容和发送者。</span></li><li><strong>导出图片</strong><span>普通图片保存当前手机画面，长截图包含完整聊天记录。</span></li></ol><div className="help-note">聊天内容自动保存在当前浏览器。图片与头像会压缩后保存，清除浏览器数据可能删除记录。</div></div>}
    </div>
  </section>;
}

