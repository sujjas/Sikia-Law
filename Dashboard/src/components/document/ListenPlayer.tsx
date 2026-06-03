"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, RotateCcw, RotateCw, X } from "lucide-react";

const SPEEDS = [1, 1.25, 1.5, 2];
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, "0")}`;

type Props = {
  noteTitle: string;
  /** Simulated read-aloud length, in seconds. */
  durationSec: number;
  onClose: () => void;
};

/** Simulated "read aloud" / text-to-speech player. No real audio — a floating
 *  transport bar with a progress timeline that advances on its own, so the
 *  voice-explanation feature can be demoed. Wire to a real TTS stream later. */
export function ListenPlayer({ noteTitle, durationSec, onClose }: Props) {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const done = elapsed >= durationSec;
  const playingNow = playing && !done;

  // Advance the timeline while playing. Stops cleanly when it reaches the end
  // (done is a dep, so the interval is torn down rather than set-state in body).
  useEffect(() => {
    if (!playing || done) return;
    const id = setInterval(() => {
      setElapsed((e) => Math.min(durationSec, e + 0.25 * speed));
    }, 250);
    return () => clearInterval(id);
  }, [playing, speed, durationSec, done]);

  // Esc closes the player.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const seek = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      setElapsed(ratio * durationSec);
    },
    [durationSec]
  );

  const onPlayPause = () => {
    if (done) {
      setElapsed(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const pct = durationSec ? (elapsed / durationSec) * 100 : 0;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="listen-bar" role="dialog" aria-label={`Read aloud: ${noteTitle}`}>
      <div className="listen-bar__lead">
        <span className="listen-eq" data-playing={playingNow || undefined} aria-hidden>
          <i /><i /><i /><i />
        </span>
        <span className="listen-meta">
          <span className="listen-label">{done ? "Finished" : playingNow ? "Reading aloud" : "Paused"}</span>
          <span className="listen-title" title={noteTitle}>{noteTitle}</span>
        </span>
      </div>

      <div className="listen-main">
        <div className="listen-ctrls">
          <button className="listen-btn" onClick={() => setElapsed((e) => Math.max(0, e - 15))} aria-label="Back 15 seconds">
            <RotateCcw size={16} />
          </button>
          <button className="listen-play" onClick={onPlayPause} aria-label={playingNow ? "Pause" : "Play"}>
            {playingNow ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
          </button>
          <button className="listen-btn" onClick={() => setElapsed((e) => Math.min(durationSec, e + 15))} aria-label="Forward 15 seconds">
            <RotateCw size={16} />
          </button>
        </div>
        <div className="listen-scrubwrap">
          <span className="listen-time">{fmt(elapsed)}</span>
          <div
            className="listen-scrub"
            ref={trackRef}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              seek(e.clientX);
            }}
            onPointerMove={(e) => { if (e.buttons) seek(e.clientX); }}
          >
            <div className="listen-scrub__fill" style={{ width: `${pct}%` }} />
            <div className="listen-scrub__thumb" style={{ left: `${pct}%` }} />
          </div>
          <span className="listen-time">{fmt(durationSec)}</span>
        </div>
      </div>

      <div className="listen-bar__tail">
        <button
          className="listen-speed"
          onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
          aria-label="Playback speed"
        >
          {speed}×
        </button>
        <button className="listen-close" onClick={onClose} aria-label="Close player">
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
}
