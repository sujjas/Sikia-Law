"use client";

import { WebHaptics, type HapticInput } from "web-haptics";

let instance: WebHaptics | null = null;

function getHaptics(): WebHaptics | null {
  if (typeof window === "undefined") return null;
  if (!instance) {
    try {
      instance = new WebHaptics();
    } catch {
      return null;
    }
  }
  return instance;
}

/**
 * Fire-and-forget haptic feedback. Defaults to "selection" for taps.
 * Silently no-ops on unsupported browsers.
 *
 * Presets: success | warning | error | light | medium | heavy | soft
 *        | rigid | selection | nudge | buzz
 */
export function haptic(input: HapticInput = "selection"): void {
  try {
    getHaptics()?.trigger(input);
  } catch {
    // ignore — never let haptics block a UI interaction
  }
}
