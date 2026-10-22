/** Measured from the supplied 1290 × 2796 screenshot (3 px per point). */
export const inputBarTokens = {
  height: 60,
  controlsHeight: 53,
  horizontalPadding: 10,
  iconSize: 28,
  iconStroke: 1.5,
  inputHeight: 39,
  inputRadius: 9.5,
  inputGap: 10.5,
  actionGap: 12,
  background: "#f5f5f5",
  dividerColor: "#e5e5e5",
} as const;

export const inputBarCssVars = Object.fromEntries(
  Object.entries(inputBarTokens).map(([name, value]) => [
    `--input-bar-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
    typeof value === "number" ? `${value}px` : value,
  ]),
);
