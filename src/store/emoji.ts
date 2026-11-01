// Bracket names are kept in editable text; previews render the matching emoji.
export const emojiList = [
  ["微笑", "🙂"], ["呲牙", "😁"], ["偷笑", "🤭"], ["大笑", "😄"],
  ["捂脸", "🤦"], ["破涕为笑", "😂"], ["笑哭", "🤣"], ["害羞", "😊"],
  ["调皮", "😜"], ["得意", "😎"], ["色", "😍"], ["亲亲", "😘"],
  ["流泪", "😢"], ["大哭", "😭"], ["委屈", "🥺"], ["难过", "😞"],
  ["发怒", "😠"], ["惊讶", "😮"], ["疑问", "🤔"], ["嘘", "🤫"],
  ["闭嘴", "🤐"], ["睡", "😴"], ["困", "🥱"], ["生病", "😷"],
  ["汗", "😅"], ["无语", "😑"], ["白眼", "🙄"], ["坏笑", "😏"],
  ["加油", "💪"], ["强", "👍"], ["弱", "👎"], ["OK", "👌"],
  ["胜利", "✌️"], ["抱拳", "🙏"], ["鼓掌", "👏"], ["握手", "🤝"],
  ["比心", "🫶"], ["爱心", "❤️"], ["心碎", "💔"], ["玫瑰", "🌹"],
  ["庆祝", "🎉"], ["礼物", "🎁"], ["蛋糕", "🎂"], ["咖啡", "☕"],
  ["啤酒", "🍺"], ["太阳", "☀️"], ["月亮", "🌙"], ["再见", "👋"],
] as const;
const aliases = new Map<string, string>(emojiList);
export function resolveEmojiText(text: string) {
  return text.replace(/\[([^\[\]]+)\]/g, (token, name: string) => aliases.get(name) ?? token);
}
export type Sticker = { id: string; name: string; image: string };
