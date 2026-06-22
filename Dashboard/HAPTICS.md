# Web Haptics — Implementation Guide

Drop-in mobile haptic feedback for a Next.js / React app. Works on iOS Safari
(the hard case) and Android Chrome. Silently no-ops on desktop and unsupported
browsers, so you never need to feature-detect at call sites.

## What we use

[`web-haptics`](https://www.npmjs.com/package/web-haptics) by
[Lochie Axon](https://haptics.lochie.me).

```bash
npm install web-haptics
```

Why this library: it's the only public one that actually fires haptics on
**iOS Safari**, which has deliberately never exposed `navigator.vibrate()`.

## How it works (so you can defend the dependency)

1. **iOS Safari trick.** Safari 17.4+ fires a real CoreHaptics tap whenever a
   user toggles an `<input type="checkbox" switch>` (the native iOS switch
   appearance). The library appends a hidden one on first use and
   programmatically clicks its `<label>`. WebKit treats this as a real toggle
   and the OS plays the intrinsic system haptic.
2. **Audio fallback.** It also primes a `Web Audio` context and plays a very
   short, very-low-frequency click. On older iOS, Android, or anywhere the
   switch trick doesn't fire, the speaker pulse produces a faint tactile cue.
3. **Presets** vary the timing and gain pattern of the click(s) — same
   underlying mechanism, different rhythms, so `selection` and `success` feel
   distinct.
4. **Gesture requirement.** The first call must be inside a real user gesture
   (touch / click event), because both the audio-context unlock and the iOS
   switch haptic require it. Once unlocked, the same instance keeps working.

### Caveats

- No arbitrary waveforms. You can't synthesize custom patterns the way native
  CoreHaptics allows — only the system tap.
- iOS **silent mode** and **Reduce Motion** can suppress it.
- The hidden `<input switch>` lives in the DOM; the library hides it with CSS.
  Don't strip ARIA hidden attributes from it.

## The pattern: one shared helper, fire-and-forget call sites

Don't instantiate `WebHaptics` per component — you'd get duplicate hidden
inputs and audio contexts. Create **one module-level singleton** and expose
a tiny `haptic(...)` function.

### `src/lib/haptics.ts`

```ts
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
    // never let haptics block a UI interaction
  }
}
```

That's the entire implementation. Every call site is one line.

### Call site

```tsx
import { haptic } from "@/lib/haptics";

<button onClick={() => { haptic("selection"); doThing(); }}>...</button>
```

## Preset semantics — when to use which

| Preset | Feel | Use for |
|---|---|---|
| `selection` | Quick tick | Tab switches, chip toggles, list-item selection |
| `light` | Soft tap | Closing modals/drawers, dismissals, undo |
| `medium` | Firmer tap | Opening a primary surface (drawer, modal, route nav) |
| `heavy` | Pronounced thud | Pickups, drops, drag-end events |
| `rigid` | Sharp click | Locking a toggle, "snap to grid" |
| `soft` | Plush | Pull-to-refresh release, subtle confirms |
| `success` | Two-beat rise | Saved, confirmed, completed action |
| `warning` | Two-beat with a hard hit | Validation flagged, recoverable issue |
| `error` | Three sharp hits | Failed action, destructive blocked |
| `nudge` | Big-then-small | "Hey look here" — first-run pointers |
| `buzz` | Long sustained | Avoid for taps; only for incoming calls / alarms |

### Heuristic

- **Lighter for closing** than for opening. Opens feel weighty, closes feel
  light. The asymmetry reads as "object resolved into place."
- **`selection` for state toggles** (tab/year/filter). Don't escalate to
  `medium` for these — it's tap fatigue.
- **`medium` for navigation-like opens** (drawer, modal, route push).
- **`success` / `warning` / `error`** only when a confirmable outcome exists.
  Don't fire `success` on every tap — it dilutes the signal.

## Where we wired it in this codebase

Example map for a notes/library/dashboard app:

| Trigger | Preset |
|---|---|
| Hamburger toggle (drawer open) | `medium` |
| Hamburger toggle (drawer close) | `light` |
| Sidebar nav link tap | `selection` |
| Year / Semester picker click | `selection` |
| Notes year tab click | `selection` |
| Tap a folder card to open its drawer | `medium` |
| Close any drawer (X / Esc / backdrop) | `light` |
| Library category tab click | `selection` |
| Library / Bookmarks "Filter" toggle | `light` |
| Toggle an individual filter value | `selection` |
| Clear all filters | `light` |
| Tap a year folder in the welcome modal | `medium` |
| Close welcome modal | `light` |

## Implementation rules (for the agent)

1. **One singleton.** Create `src/lib/haptics.ts` once. Do not instantiate
   `WebHaptics` anywhere else.
2. **Always behind a user gesture.** Call `haptic()` inside `onClick`,
   `onTouchEnd`, or similar — never from an effect, observer, or timeout that
   isn't triggered by an interaction. Otherwise iOS silently drops it.
3. **Don't await it.** `haptic()` returns void. Fire and continue.
4. **Pair with the action, not after.** Call `haptic()` *before* state
   changes / navigation, so the tactile cue lands on the press, not after a
   render.
   ```tsx
   onClick={() => {
     haptic("selection");
     setActive(id);     // state change after
   }}
   ```
5. **No haptics on hover / focus / scroll.** Those aren't gestures iOS
   recognises and they'd be annoying anyway.
6. **No haptics for typing.** Software keyboards already produce their own.
7. **Don't gate behind feature detection at call sites.** The helper handles
   that. Adding `if (isMobile)` everywhere just adds noise.

## TypeScript types

```ts
// Re-exported from web-haptics
import type { HapticInput, HapticPattern, HapticPreset } from "web-haptics";

// HapticInput accepts either a preset name (string) or a custom pattern
// object — but stick to presets unless you have a specific need.
```

## Testing

- **iOS Safari, real device.** Simulator does not produce haptics.
- iOS Settings → Sounds & Haptics → System Haptics must be on.
- iOS **silent mode** still allows haptics (it only mutes audio); but
  **Low Power Mode** suppresses them.
- On desktop, calls succeed but produce nothing. That's fine.

## Reference

- Library: <https://www.npmjs.com/package/web-haptics>
- Source: <https://github.com/lochie/web-haptics>
- Live demos for each preset: <https://haptics.lochie.me>
