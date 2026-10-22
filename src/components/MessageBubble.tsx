import SmoothText from "./SmoothText";
import type { CSSProperties } from "react";
import { Check, Video } from "lucide-react";
import { messageBubbleCssVars } from "../design/messageBubbleTokens";
import { voiceMessageCssVars } from "../design/voiceMessageTokens";
import { redPacketCssVars } from "../design/redPacketTokens";
import type { Message, Person } from "../store/types";
import VoiceMessageBubble from "./VoiceMessageBubble";
import RedPacketMessage from "./RedPacketMessage";
import "../styles/message-bubble.css";

type Props = { message: Message; sender: Person; own: boolean };

function WordIcon() {
  return <span className="word-document" aria-hidden="true"><span className="word-page-lines" /><span className="word-logo">W</span></span>;
}

export default function MessageBubble({ message, sender, own }: Props) {
  if (message.type === "time") return <div data-message-id={message.id} className="message-time"><SmoothText text={message.time || "13:14"} /></div>;
  if (message.type === "recall") return <div data-message-id={message.id} className="message-recall">{own ? "你" : sender.name}撤回了一条消息</div>;

  const numericAmount = Number(message.amount || 0);
  const amount = Number.isFinite(numericAmount) ? numericAmount.toFixed(2) : "0.00";
  const isText = message.type === "text";
  const isVoice = message.type === "voice";
  const isRedPacket = message.type === "redpacket";
  const text = message.text || "…";
  const compactText = isText && Array.from(text).length === 1;

  return (
    <div data-message-id={message.id} data-sender-id={sender.id} className={`message-row ${own ? "message-row-own" : ""} ${isText ? "message-row-text" : ""} ${isVoice ? "message-row-voice" : ""} ${isRedPacket ? "message-row-red-packet" : ""}`} style={(isText ? messageBubbleCssVars : isVoice ? voiceMessageCssVars : isRedPacket ? redPacketCssVars : undefined) as CSSProperties | undefined}>
      {isText ? <span className="text-avatar-box"><img className="message-avatar" src={sender.avatar} alt={sender.name} /><span className="text-bubble-debug-label" aria-hidden="true">avatar bounds</span></span> : <img className="message-avatar" src={sender.avatar} alt={sender.name} />}
      <div className={`message-content ${isText ? "message-content-text" : ""}`}>
        {isText && <div className={`message-bubble text-message-bubble ${own ? "message-bubble-own" : ""} ${compactText ? "text-bubble-compact" : ""}`}><span className="text-bubble-copy"><SmoothText text={text} /><span className="text-bubble-debug-label" aria-hidden="true">text bounds</span></span><span className="text-bubble-tail" aria-hidden="true"><span className="text-bubble-debug-label">tail bounds</span></span><span className="text-bubble-debug-label" aria-hidden="true">bubble bounds</span></div>}
        {message.type === "image" && <div className="image-message"><img src={message.image || "/sample-image.svg"} alt="聊天图片" /></div>}
        {isVoice && <VoiceMessageBubble duration={message.seconds ?? 2} direction={own ? "right" : "left"} unread={!own && !message.read} />}
        {message.type === "video" && <div className={`video-message ${own ? "video-message-own" : ""}`}><Video size={22} strokeWidth={1.9} /><span>{message.videoStatus === "finished" ? `通话时长 ${message.duration || "00:10"}` : "视频通话邀请"}</span></div>}
        {isRedPacket && <RedPacketMessage title={message.note || "恭喜发财，大吉大利"} footer={message.redPacketFooter || "红包"} direction={own ? "right" : "left"} status={message.redPacketStatus || "normal"} />}
        {message.type === "transfer" && <div className={`transfer-message ${message.received ? "is-received" : ""}`}><div className="transfer-main"><span className="transfer-icon"><Check size={31} strokeWidth={2.2} /></span><div className="transfer-copy"><strong>¥{amount}</strong><span>{message.received ? "已被接收" : "待接收"}</span></div></div><div className="transfer-footer">{message.note ? `转账 · ${message.note}` : "转账"}</div></div>}
        {message.type === "file" && <div className="file-message"><div className="file-details"><strong>{message.fileName || "未命名文件"}</strong><small>{message.fileSize || "0KB"}</small></div><WordIcon /></div>}
      </div>
    </div>
  );
}

