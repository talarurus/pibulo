import type { Expression } from "../blobatar/src/expression";

export interface ActivityHandFrame {
  /** 0 is retracted; 1 is fully present. */
  presence: number;
  /** Offsets from the silhouette-relative resting anchor, in scene units. */
  x?: number;
  y?: number;
  /** An absolute scene-space target. When set, it takes precedence over x/y. */
  at?: { x: number; y: number };
  /** Added to the resting mitten rotation, in degrees. */
  rotate?: number;
  /** Multiplied by the normal mitten scale. */
  scale?: number;
  /** Shows the separate grip thumb. Defaults to 0 for a circular hand. */
  thumb?: number;
}

export interface ActivityBodyFrame {
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface ActivityFrame {
  body?: ActivityBodyFrame;
  leftHand?: ActivityHandFrame;
  rightHand?: ActivityHandFrame;
  /** Morphs from the caller's expression to this one by `amount`. */
  expression?: { value: Expression; amount: number };
  /**
   * How far the cursor-following gaze stands down, 0–1. An activity that aims
   * the creature's attention somewhere the pointer is not — typing at a laptop,
   * holding a prop it must watch — sets this so the eyes are not pulled toward
   * the cursor while the face says they are elsewhere. Requires `gaze.css`;
   * without a gaze driver the channel resolves to the identity and costs a
   * custom property nobody reads.
   */
  suppressGaze?: number;
  /** Activity-specific custom properties consumed by its stable artwork. */
  vars?: Record<string, string>;
}

/**
 * Where a scene's own geometry sits, handed to `_sample` so an activity can
 * reach the creature instead of hardcoding coordinates tuned to one
 * silhouette.
 *
 * `hands` are the resting anchors — the same silhouette-relative points the
 * retracted mittens wait beside, so a wave or a held prop lands where hands
 * naturally live on *this* body rather than where they lived on the round
 * blobatar the numbers were tuned against. `body` is the silhouette's centre
 * and radius in scene units, for effects that belong to the creature rather
 * than to either hand (a heart above the petted head, notes past the earbud).
 *
 * Everything is in the 160×160 scene's coordinate space; add `at` targets to
 * them directly.
 */
export interface SceneContext {
  hands: { left: { x: number; y: number }; right: { x: number; y: number } };
  body: { cx: number; cy: number; rx: number; ry: number };
}

export interface ActivityArtwork {
  behind?: string;
  /** Scene-space artwork that follows the body's rigid activity transform. */
  bodyFront?: string;
  front?: string;
}

/**
 * An opaque, deterministic activity timeline. Consumers import values or
 * factories; underscored machinery is interpreted by the scene renderer.
 */
export interface SceneActivity {
  readonly id: string;
  readonly duration: number;
  /**
   * Static decoration, or a function of the scene context for artwork that has
   * to follow the silhouette (a heart over the petted side, notes past the
   * ears). Functions are evaluated once per render — never per frame — so they
   * should be cheap strings, not layout work.
   */
  readonly _artwork?: ActivityArtwork | ((ctx: SceneContext) => ActivityArtwork);
  /**
   * The frame `hold` mode parks on and reduced-motion playback renders, as a
   * normalized progress. Defaults to 0.5; set it where the midpoint is not the
   * pose that says what the activity is — a wiggle frozen at dead centre reads
   * as a creature standing still, so it states its apex instead.
   */
  readonly _still?: number;
  readonly _sample: (progress: number, ctx?: SceneContext) => ActivityFrame;
}

/**
 * The context `_sample` receives when a caller invokes it directly rather than
 * through a scene — the resting anchors and body of a canonical round
 * blobatar, which is the silhouette every activity was tuned against. A scene
 * always supplies the real one.
 */
export const DEFAULT_SCENE_CONTEXT: SceneContext = {
  hands: { left: { x: 33.3, y: 93.1 }, right: { x: 125.5, y: 93.1 } },
  body: { cx: 79.4, cy: 74.9, rx: 33.1, ry: 33.1 },
};

export interface ActivitySample {
  value: SceneActivity;
  /** Normalized activity time. Values outside 0–1 are clamped. */
  progress: number;
}
