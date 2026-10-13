import type { ActivitySample, SceneActivity } from "./scene-activity";

export type PlaybackMode = "once" | "hold";
export type PlaybackState = "idle" | "playing" | "paused" | "holding" | "disposed";
export type CancellationReason = "stopped" | "replaced" | "disposed";

export interface PlaybackRequest {
  readonly mode?: PlaybackMode;
  readonly requestId?: string;
  readonly reducedMotion?: boolean;
}

export interface PlaybackSnapshot {
  readonly state: PlaybackState;
  readonly requestId?: string;
  readonly sample: ActivitySample | null;
}

export interface PlaybackScheduler {
  readonly now: () => number;
  readonly requestFrame: (callback: (now: number) => void) => number;
  readonly cancelFrame: (handle: number) => void;
}

export interface ActivityPlaybackOptions {
  readonly onUpdate: (sample: ActivitySample | null) => void;
  readonly onComplete?: (requestId: string) => void;
  readonly onCancel?: (requestId: string, reason: CancellationReason) => void;
  readonly scheduler?: PlaybackScheduler;
}

export interface ActivityPlayback {
  play(activity: SceneActivity, request?: PlaybackRequest): string;
  replay(): string | undefined;
  pause(): void;
  resume(): void;
  stop(): void;
  dispose(): void;
  snapshot(): PlaybackSnapshot;
}

const browserScheduler: PlaybackScheduler = {
  now: () => performance.now(),
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: handle => cancelAnimationFrame(handle),
};

/**
 * The frame a held or reduced-motion run parks on. An activity may declare its
 * own through `_still` — the midpoint is not always the pose that says what
 * the activity is, and a wiggle frozen at dead centre reads as a creature
 * standing still — so the authored frame wins when one exists.
 */
const stillFrame = (activity: SceneActivity) => activity._still ?? 0.5;

/** Browser-clock orchestration around deterministic normalized activity frames. */
export function createActivityPlayback(options: ActivityPlaybackOptions): ActivityPlayback {
  const scheduler = options.scheduler ?? browserScheduler;
  let sequence = 0;
  let state: PlaybackState = "idle";
  let current: {
    activity: SceneActivity;
    mode: PlaybackMode;
    requestId: string;
    reducedMotion: boolean;
    elapsed: number;
    startedAt: number;
  } | null = null;
  let last: { activity: SceneActivity; request: PlaybackRequest } | null = null;
  let frame: number | null = null;

  const cancelFrame = () => {
    if (frame === null) return;
    scheduler.cancelFrame(frame);
    frame = null;
  };

  const publish = (progress: number) => {
    if (!current) return;
    options.onUpdate({ value: current.activity, progress });
  };

  const clear = () => {
    current = null;
    options.onUpdate(null);
  };

  const cancelCurrent = (reason: CancellationReason) => {
    if (!current) return;
    const requestId = current.requestId;
    cancelFrame();
    publish(1);
    clear();
    state = reason === "disposed" ? "disposed" : "idle";
    options.onCancel?.(requestId, reason);
  };

  const complete = () => {
    if (!current) return;
    const requestId = current.requestId;
    cancelFrame();
    publish(1);
    clear();
    state = "idle";
    options.onComplete?.(requestId);
  };

  const tick = (now: number) => {
    frame = null;
    const running = current;
    if (!running || state !== "playing") return;
    running.elapsed = Math.max(0, now - running.startedAt);
    const duration = Math.max(1, running.activity.duration);
    if (running.mode === "hold") {
      const target = stillFrame(running.activity);
      const progress = Math.min(target, running.elapsed / duration);
      publish(progress);
      if (progress >= target) {
        state = "holding";
        return;
      }
    } else {
      const progress = Math.min(1, running.elapsed / duration);
      publish(progress);
      if (progress >= 1) {
        complete();
        return;
      }
    }
    frame = scheduler.requestFrame(tick);
  };

  const play = (activity: SceneActivity, request: PlaybackRequest = {}) => {
    if (state === "disposed") throw new Error("Activity playback has been disposed");
    if (current) cancelCurrent("replaced");
    const requestId = request.requestId ?? `activity-${++sequence}`;
    const mode = request.mode ?? "once";
    last = { activity, request: { ...request, requestId } };
    current = {
      activity,
      mode,
      requestId,
      reducedMotion: request.reducedMotion ?? false,
      elapsed: 0,
      startedAt: scheduler.now(),
    };
    state = "playing";
    publish(0);

    if (current.reducedMotion) {
      publish(stillFrame(current.activity));
      if (mode === "hold") state = "holding";
      else complete();
      return requestId;
    }

    frame = scheduler.requestFrame(tick);
    return requestId;
  };

  return {
    play,
    replay() {
      if (!last) return undefined;
      return play(last.activity, { ...last.request, requestId: undefined });
    },
    pause() {
      if (!current || state !== "playing") return;
      current.elapsed = Math.max(0, scheduler.now() - current.startedAt);
      cancelFrame();
      state = "paused";
    },
    resume() {
      if (!current || state !== "paused") return;
      current.startedAt = scheduler.now() - current.elapsed;
      state = "playing";
      frame = scheduler.requestFrame(tick);
    },
    stop() {
      cancelCurrent("stopped");
    },
    dispose() {
      if (state === "disposed") return;
      if (current) cancelCurrent("disposed");
      else state = "disposed";
      last = null;
    },
    snapshot() {
      return {
        state,
        requestId: current?.requestId,
        sample: current ? { value: current.activity, progress: current.mode === "hold" && state === "holding" ? stillFrame(current.activity) : Math.min(1, current.elapsed / Math.max(1, current.activity.duration)) } : null,
      };
    },
  };
}
