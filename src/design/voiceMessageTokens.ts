/** Voice-message dimensions in iPhone logical points. */
export const voiceMessageTokens = {
  minWidth: 92,
  maxWidth: 220,
  height: 38,
  radius: 4.5,
  padding: 9,
  waveformSize: 23,
  durationFontSize: 16,
  greenColor: "#96e672",
  whiteColor: "#fff",
  avatarGap: 11.5,
  tailWidth: 5,
  tailHeight: 10,
  contentGap: 8,
  waveformInset: 5,
} as const;

export function voiceMessageWidth(duration: number): number {
  const seconds = Number.isFinite(duration) ? Math.max(1, Math.floor(duration)) : 1;
  let width: number;
  if (seconds <= 5) width = 88 + 4 * seconds;
  else if (seconds <= 8) width = 108 + 9.5 * (seconds - 5);
  else if (seconds <= 30) {
    const elapsed = seconds - 8;
    width = 136.5 + 4.7 * elapsed - 0.04 * elapsed * elapsed;
  }
  else width = voiceMessageTokens.maxWidth;
  return Math.min(voiceMessageTokens.maxWidth, Math.max(voiceMessageTokens.minWidth, Math.round(width)));
}

export const voiceMessageCssVars = {
  "--voice-min-width": `${voiceMessageTokens.minWidth}px`,
  "--voice-max-width": `${voiceMessageTokens.maxWidth}px`,
  "--voice-height": `${voiceMessageTokens.height}px`,
  "--voice-radius": `${voiceMessageTokens.radius}px`,
  "--voice-padding": `${voiceMessageTokens.padding}px`,
  "--voice-waveform-size": `${voiceMessageTokens.waveformSize}px`,
  "--voice-duration-font-size": `${voiceMessageTokens.durationFontSize}px`,
  "--voice-green": voiceMessageTokens.greenColor,
  "--voice-white": voiceMessageTokens.whiteColor,
  "--voice-avatar-gap": `${voiceMessageTokens.avatarGap}px`,
  "--voice-tail-width": `${voiceMessageTokens.tailWidth}px`,
  "--voice-tail-height": `${voiceMessageTokens.tailHeight}px`,
  "--voice-content-gap": `${voiceMessageTokens.contentGap}px`,
  "--voice-waveform-inset": `${voiceMessageTokens.waveformInset}px`,
} as const;
