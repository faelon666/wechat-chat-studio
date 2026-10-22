export type MessageType = "text" | "time" | "image" | "voice" | "video" | "redpacket" | "transfer" | "file" | "recall";

export type Person = {
  id: string;
  name: string;
  avatar: string;
};

export type Message = {
  id: string;
  type: MessageType;
  senderId: string;
  text?: string;
  time?: string;
  image?: string;
  seconds?: number;
  read?: boolean;
  videoStatus?: "invite" | "finished";
  duration?: string;
  amount?: string;
  note?: string;
  redPacketFooter?: string;
  redPacketStatus?: "normal" | "opened" | "expired";
  received?: boolean;
  fileName?: string;
  fileSize?: string;
};

export type ChatSettings = {
  title: string;
  statusTime: string;
  unreadCount?: string;
  network?: "5g" | "wifi";
  batteryLevel?: number;
  showHomeIndicator?: boolean;
  darkMode: boolean;
  wallpaper: "gray" | "cream" | "mint";
};

export type ChatState = {
  people: Person[];
  activeSenderId: string;
  messages: Message[];
  settings: ChatSettings;
};
