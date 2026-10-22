import type { ChatState } from "../../store/types";
import "../../styles/status-bar.css";

export default function StatusBar({ chat }: { chat: ChatState }) {
  const charge = Math.max(0, Math.min(100, Number.isFinite(chat.settings.batteryLevel) ? chat.settings.batteryLevel! : 31));

  return <div className="phone-status">
    <span className="status-time">{chat.settings.statusTime || "12:02"}<span className="status-debug-label">time box</span></span>
    <div className="phone-island" aria-hidden="true" />
    <div className="status-icons" aria-hidden="true">
      <span className="status-signal-box"><svg className="status-signal" viewBox="0 0 22 15" fill="currentColor">
        {[6, 4.5, 2.5, 0].map((top, index) => <g key={index}><rect x={index * 6} y={top} width="4" height={9 - top} rx="1.25" /><rect x={index * 6} y="11" width="4" height="4" rx="1.1" /></g>)}
      </svg><span className="status-debug-label">signal box</span></span>
      {chat.settings.network === "wifi"
        ? <svg className="status-wifi" viewBox="0 0 18 14" fill="none"><path d="M1 4.2C5.3.6 12.7.6 17 4.2M3.8 7.3c2.8-2.3 7.6-2.3 10.4 0M6.8 10.3c1.2-1 3.2-1 4.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="12.6" r="1.15" fill="currentColor" /></svg>
        : <span className="status-network">5G</span>}
      <span className="status-battery" title={`电池电量 ${charge}%`}><span className="status-battery-fill" style={{ width: `${charge}%` }} /><b>{charge}</b><span className="status-debug-label">battery box</span></span>
    </div>
  </div>;
}
