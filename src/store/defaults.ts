import type { ChatState } from "./types";

export const defaultChat: ChatState = {
  people: [
    { id: "person-a", name: "小明", avatar: "/avatar-a.svg" },
    { id: "person-b", name: "小安", avatar: "/avatar-b.svg" },
  ],
  activeSenderId: "person-b",
  settings: {
    title: "小安",
    statusTime: "12:02",
    unreadCount: "246",
    network: "5g",
    batteryLevel: 31,
    darkMode: false,
    wallpaper: "gray",
  },
  messages: [
    { id: "sample-1", type: "text", senderId: "person-b", text: "你好！" },
    { id: "sample-2", type: "text", senderId: "person-a", text: "你好，周末有空吗？" },
    { id: "sample-3", type: "text", senderId: "person-b", text: "有空的话一起看看这份资料。" },
    { id: "sample-4", type: "text", senderId: "person-a", text: "没问题!" },
    { id: "sample-5", type: "file", senderId: "person-a", fileName: "项目资料.docx", fileSize: "12.1KB" },
    { id: "sample-6", type: "time", senderId: "person-b", time: "13:14" },
    { id: "sample-7", type: "redpacket", senderId: "person-b", amount: "12000", note: "恭喜发财，大吉大利" },
    { id: "sample-8", type: "transfer", senderId: "person-b", amount: "12000", note: "", received: true },
  ],
};
