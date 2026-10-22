import type { ChatState, Message } from "../store/types";

/** Generic layout sample. Isolated from the editor's saved conversation. */
export function referenceMatchingDemo(chat: ChatState): ChatState {
  const ownId = "reference-self";
  const otherId = "reference-contact";
  const messages: Message[] = [
    { id: "compare-demo-01", type: "text", senderId: ownId, text: "你好小明😊" },
    { id: "compare-demo-02", type: "text", senderId: otherId, text: "你好，有什么事吗?" },
    { id: "compare-demo-03", type: "text", senderId: ownId, text: "有空的话一起看看这份资料。" },
    { id: "compare-demo-04", type: "text", senderId: ownId, text: "没问题!" },
    { id: "compare-demo-05", type: "time", senderId: ownId, time: "13:14" },
    { id: "compare-demo-06", type: "redpacket", senderId: ownId, note: "恭喜发财，大吉大利", redPacketFooter: "红包", redPacketStatus: "normal" },
    { id: "compare-demo-07", type: "transfer", senderId: ownId, amount: "38", received: true },
    { id: "compare-demo-08", type: "voice", senderId: otherId, seconds: 25, read: true },
  ];
  return {
    ...chat,
    people: [
      { id: ownId, name: "我", avatar: "/avatar-a.svg" },
      { id: otherId, name: "小安", avatar: "/avatar-b.svg" },
    ],
    activeSenderId: ownId,
    messages,
    settings: { ...chat.settings, title: "小安", statusTime: "16:35", unreadCount: "260", network: "5g", batteryLevel: 38, showHomeIndicator: false, darkMode: false, wallpaper: "gray" },
  };
}
