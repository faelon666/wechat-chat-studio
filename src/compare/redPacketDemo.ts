import type { ChatState, Message } from "../store/types";

/** Isolated CompareView samples; never written to the editor's saved chat. */
export function redPacketDemo(chat: ChatState): ChatState {
  const ownId = chat.people[0].id;
  const otherId = (chat.people[1] || chat.people[0]).id;
  const messages: Message[] = [
    { id: "red-packet-demo-left", type: "redpacket", senderId: otherId, note: "恭喜发财，大吉大利", redPacketFooter: "微信红包", redPacketStatus: "normal" },
    { id: "red-packet-demo-right", type: "redpacket", senderId: ownId, note: "恭喜发财，大吉大利", redPacketFooter: "红包", redPacketStatus: "normal" },
    { id: "red-packet-demo-opened", type: "redpacket", senderId: ownId, note: "恭喜发财，大吉大利", redPacketFooter: "微信红包", redPacketStatus: "opened" },
  ];
  return { ...chat, messages };
}
