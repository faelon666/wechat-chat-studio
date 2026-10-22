/** iPhone 15 Pro Max logical points. Keep device geometry in one place. */
import { statusBarTokens } from "./statusBarTokens";
const baseTokens = {
  screenWidth: 430,
  screenHeight: 932,
  safeAreaTop: statusBarTokens.height,
  safeAreaBottom: 34,
  cornerRadius: 54,
  frameBorder: 0,
  dynamicIslandWidth: statusBarTokens.islandWidth,
  dynamicIslandHeight: statusBarTokens.islandHeight,
  dynamicIslandTop: statusBarTokens.islandTop,
  homeIndicatorWidth: 134,
  homeIndicatorHeight: 5,
  homeIndicatorBottom: 8,
} as const;

export const deviceTokens = {
  ...baseTokens,
  frameWidth: baseTokens.screenWidth + baseTokens.frameBorder * 2,
  frameHeight: baseTokens.screenHeight + baseTokens.frameBorder * 2,
  frameCornerRadius: baseTokens.cornerRadius + baseTokens.frameBorder,
  appViewportHeight: baseTokens.screenHeight - baseTokens.safeAreaTop - baseTokens.safeAreaBottom,
} as const;

export const deviceScales = [50, 75, 100] as const;
export type DeviceScale = (typeof deviceScales)[number];

export const deviceCssVars = {
  "--device-screen-width": `${deviceTokens.screenWidth}px`,
  "--device-screen-height": `${deviceTokens.screenHeight}px`,
  "--device-safe-top": `${deviceTokens.safeAreaTop}px`,
  "--device-safe-bottom": `${deviceTokens.safeAreaBottom}px`,
  "--device-corner-radius": `${deviceTokens.cornerRadius}px`,
  "--device-frame-border": `${deviceTokens.frameBorder}px`,
  "--device-frame-width": `${deviceTokens.frameWidth}px`,
  "--device-frame-height": `${deviceTokens.frameHeight}px`,
  "--device-frame-radius": `${deviceTokens.frameCornerRadius}px`,
  "--device-app-height": `${deviceTokens.appViewportHeight}px`,
  "--device-island-width": `${deviceTokens.dynamicIslandWidth}px`,
  "--device-island-height": `${deviceTokens.dynamicIslandHeight}px`,
  "--device-island-top": `${deviceTokens.dynamicIslandTop}px`,
  "--device-home-width": `${deviceTokens.homeIndicatorWidth}px`,
  "--device-home-height": `${deviceTokens.homeIndicatorHeight}px`,
  "--device-home-bottom": `${deviceTokens.homeIndicatorBottom}px`,
} as const;
