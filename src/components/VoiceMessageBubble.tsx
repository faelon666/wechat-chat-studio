import { voiceMessageWidth } from "../design/voiceMessageTokens";
import "../styles/voice-message.css";

export type VoiceMessageBubbleProps = {
  duration: number;
  direction: "left" | "right";
  unread?: boolean;
};

function Waveform({ direction }: { direction: "left" | "right" }) {
  return <svg className={`voice-waveform voice-waveform-${direction}`} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 9.4c.85.6 1.3 1.5 1.3 2.6s-.45 2-1.3 2.6c-.6.4-1.2.05-1.2-.65V10.05c0-.7.6-1.05 1.2-.65Z" fill="currentColor" />
    <path d="M14.2 8.1c-2.1 2.2-2.1 5.6 0 7.8M10.6 4.5c-4.1 4.1-4.1 10.9 0 15" fill="none" stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function VoiceMessageBubble({ duration, direction, unread = false }: VoiceMessageBubbleProps) {
  const seconds = Number.isFinite(duration) ? Math.max(1, Math.floor(duration)) : 1;
  return <div className={`voice-message-bubble voice-message-${direction}`} style={{ width: voiceMessageWidth(seconds) }}>
    <span className="voice-message-content">
      {direction === "left" && <Waveform direction={direction} />}
      <span className="voice-duration">{seconds}&quot;</span>
      {direction === "right" && <Waveform direction={direction} />}
    </span>
    {unread && <i className="voice-message-unread" aria-label="未读" />}
  </div>;
}
