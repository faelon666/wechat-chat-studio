import { toSvg } from "html-to-image";

const exportLayoutCss = `
.message-row, .message-content, .message-bubble, .chat-messages,
.message-time, .message-recall {
  height: auto !important;
}
.special-copy, .special-main strong {
  width: auto !important;
}
.message-content {
  width: max-content !important;
  max-width: 301px !important;
}
.message-bubble {
  width: max-content !important;
  max-width: 301px !important;
}
.message-content-text {
  max-width: var(--text-bubble-max-width) !important;
}
.text-message-bubble {
  max-width: 100% !important;
}
.text-bubble-copy {
  width: auto !important;
  height: auto !important;
}
`;

async function loadCaptureFonts(node: HTMLElement) {
  const text = node.textContent || "微信";
  await Promise.all(
    [400, 500, 600, 700].map((weight) =>
      document.fonts.load(`${weight} 17px "PingFang UI SC"`, text),
    ),
  );
  await document.fonts.ready;
  node.getBoundingClientRect();
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** Reflow text inside the SVG clone before rasterizing it to PNG. */
export async function renderCapturePng(node: HTMLElement, pixelRatio: number) {
  await loadCaptureFonts(node);
  // The DOM clone loses scrollTop; carry the visible conversation offset into it.
  const scroll = node.querySelector<HTMLElement>(".chat-scroll");
  const scrollOffset = node.closest(".phone-frame-long") ? 0 : scroll?.scrollTop ?? 0;
  const svgUrl = await toSvg(node, {
    cacheBust: true,
    filter: (element) => !(element instanceof HTMLElement && element.classList.contains("export-hidden")),
  });
  const svgText = decodeURIComponent(svgUrl.slice(svgUrl.indexOf(",") + 1));
  const svg = new DOMParser().parseFromString(svgText, "image/svg+xml");
  if (svg.querySelector("parsererror")) throw new Error("Invalid capture SVG");

  const foreignObject = svg.querySelector("foreignObject");
  const content = foreignObject?.firstElementChild;
  if (!content) throw new Error("Capture content is missing");
  const style = svg.createElementNS("http://www.w3.org/1999/xhtml", "style");
  style.textContent = `${exportLayoutCss}\n.chat-scroll > .chat-messages { transform: translateY(-${scrollOffset}px) !important; }`;
  content.prepend(style);

  const width = Number(svg.documentElement.getAttribute("width"));
  const height = Number(svg.documentElement.getAttribute("height"));
  if (!width || !height) throw new Error("Invalid capture dimensions");
  const encoded = encodeURIComponent(new XMLSerializer().serializeToString(svg.documentElement));
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  await image.decode();

  const ratio = Math.min(pixelRatio, 16384 / width, 16384 / height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
