import "../styles/red-packet.css";

export type RedPacketMessageProps = {
  title: string;
  footer: string;
  direction: "left" | "right";
  status?: "normal" | "opened" | "expired";
};

function RedPacketIcon() {
  return <svg className="red-packet-icon" viewBox="0 0 38 45" aria-hidden="true">
    <rect width="38" height="45" rx="2" fill="#d83c1e" />
    <path d="M2 0h34a2 2 0 0 1 2 2v13c-5.5 3-12 4.5-19 4.5S5.5 18 0 15V2a2 2 0 0 1 2-2Z" fill="#f04c2d" />
    <circle cx="19" cy="19" r="6.5" fill="#f6d49a" />
    <path d="m16.5 15.8 2.5 3 2.5-3M16.7 19h4.6m-4.6 2h4.6M19 18.8v4.1" fill="none" stroke="#ed8640" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function RedPacketMessage({ title, footer, direction, status = "normal" }: RedPacketMessageProps) {
  return <div className={`red-packet-card red-packet-${direction} red-packet-${status}`} aria-label={`${title}，${footer}${status === "opened" ? "，已领取" : status === "expired" ? "，已过期" : ""}`}>
    <div className="red-packet-main">
      <svg className="red-packet-tail" viewBox="0 0 6 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 5.4 6a1.5 1.5 0 0 1 0 2L0 14Z" fill="currentColor" /></svg>
      <RedPacketIcon />
      <span className="red-packet-title">{title}</span>
    </div>
    <div className="red-packet-footer"><span>{footer}</span></div>
  </div>;
}
