import { _layout, _parts } from "../blobatar/src/blobatar";
import { mixPalettes, type Palette } from "./color";
import { poseVars } from "../blobatar/src/expression";
import { bakePose, lerpPose } from "../blobatar/src/morph";
import type { BlobatarOptions } from "../blobatar/src/render";
import type {
  ActivityFrame,
  ActivityHandFrame,
  ActivitySample,
  SceneContext,
} from "./scene-activity";

/** A stable square frame with room above, beside, and below the 100×100 figure. */
export const SCENE_VIEW_BOX = "0 0 160 160";

/** The original figure keeps its native coordinate system inside the scene. */
export const SCENE_BODY_TRANSFORM = "translate(30 25)";

export interface SampledHands {
  /** A deterministic point between fully retracted (0) and fully present (1). */
  presence: number;
}

export interface SceneOptions extends BlobatarOptions {
  /**
   * Shows the blobatar's floating mittens.
   *
   * A boolean is the normal controlled state and transitions when `scene.css`
   * is loaded. `{ presence }` samples the enter/exit motion directly, which is
   * useful for video renderers, screenshots, and future activity timelines.
   */
  hands?: boolean | SampledHands;
  /** At most one caller-controlled activity sampled at a normalized time. */
  activity?: ActivitySample;
}

export interface HandAnchor {
  x: number;
  y: number;
}

export interface SceneParts {
  viewBox: typeof SCENE_VIEW_BOX;
  bodyTransform: typeof SCENE_BODY_TRANSFORM;
  body: ReturnType<typeof _parts>;
  /**
   * The figure group serialized — backdrop plus inner body — for renderers
   * that own their outer element. `bl-scene-figure` is the DOM hook the
   * imperative scene binder (`blobatarling/scene/dom`) diffs against.
   */
  figure: string;
  /** The raw title text — serializers escape it; the DOM binder writes it as textContent. */
  title: string;
  className: string;
  vars: Record<string, string>;
  hands: string;
  anchors: { left: HandAnchor; right: HandAnchor };
  activityBehind: string;
  activityBodyFront: string;
  activityFront: string;
}

const tx = 30;
const ty = 25;
const r2 = (value: number) => Math.round(value * 100) / 100;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const handPresence = (hands: SceneOptions["hands"]) =>
  typeof hands === "object" ? clamp01(hands.presence) : hands ? 1 : 0;

const n = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) ? value! : fallback;

const activityClass = (id: string) =>
  id.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "custom";

/**
 * The expression a sampled frame wears: the caller's pose lerped toward the
 * activity's by `amount`, with the tint travelling between *palettes* rather
 * than snapping to the target's.
 *
 * The tint had to move onto a mix because the two ends of a morph can disagree
 * about colour entirely — a `mad` base morphing toward `happy` has a hot
 * endpoint on one side and none on the other. Tinting once with the lerped
 * pose would still dress the whole frame in the target's tint; taking each
 * side's finished palette and fading between them is the colour equivalent of
 * the pose channels' own travel, and `transition: fill` agrees with it because
 * `fadeHex` is sRGB just as that transition is.
 */
function expressionAt(
  base: BlobatarOptions["expression"],
  frame: ActivityFrame,
) {
  if (!frame.expression) return base;
  const amount = clamp01(frame.expression.amount);
  if (amount === 0) return base;
  if (amount === 1) return frame.expression.value;
  const target = frame.expression.value;
  const baseTint = base?.tint;
  const targetTint = target.tint;
  return {
    p: lerpPose(base?.p, target.p, amount),
    vars: poseVars,
    bake: bakePose,
    tint:
      baseTint || targetTint
        ? (pal: Palette) =>
            mixPalettes(
              baseTint ? baseTint(pal, base!.p) : pal,
              targetTint ? targetTint(pal, target.p) : pal,
              amount,
            )
        : undefined,
  };
}

function handVars(
  side: "left" | "right",
  anchor: HandAnchor,
  manualPresence: number,
  activity?: ActivityHandFrame,
) {
  const presence = clamp01(activity?.presence ?? manualPresence);
  const direction = side === "left" ? -1 : 1;
  const x = activity?.at ? activity.at.x - anchor.x : n(activity?.x, 0);
  const y = activity?.at ? activity.at.y - anchor.y : n(activity?.y, 0);
  return {
    [`--bl-hand-${side}-opacity`]: String(r2(presence)),
    [`--bl-hand-${side}-scale`]: String(r2((0.72 + presence * 0.28) * n(activity?.scale, 1))),
    [`--bl-hand-${side}-y`]: `${r2((1 - presence) * 7 + y)}px`,
    // Retracted hands wait toward the body, then travel outward into position.
    // The previous sign made them enter from beyond their resting anchors,
    // which read as two objects flying in from offscreen rather than hands
    // emerging when the creature needed them.
    [`--bl-hand-${side}-x`]: `${r2((1 - presence) * -direction * 9 + x)}px`,
    [`--bl-hand-${side}-rotate`]: `${r2(direction * 8 + n(activity?.rotate, 0))}deg`,
    [`--bl-hand-${side}-thumb`]: String(r2(clamp01(n(activity?.thumb, 0)))),
  };
}

/**
 * Anchors the hands to the resolved body rather than to the scene frame.
 * Unusual silhouettes and trait overrides therefore keep the same visual gap.
 *
 * Deliberately read from the *expression-free* layout: the anchor is where the
 * creature is, and the pose's own `bdy` shift is added on top afterwards — so
 * a `sad` scene's resting hands sink with the creature instead of hovering
 * where the body used to be.
 */
function handAnchors(body: { cx: number; cy: number; rx: number; ry: number }) {
  // Low and separated from the silhouette: at eye height the same two marks
  // read as ears, especially on round and cloud shapes.
  const y = ty + body.cy + body.ry * 0.55;
  return {
    left: {
      x: tx + body.cx - body.rx - 13,
      y,
    },
    right: {
      x: tx + body.cx + body.rx + 13,
      y,
    },
  };
}

/**
 * One circular hand at the origin. Its separate inward-facing thumb is hidden
 * unless an activity explicitly spends it on gripping a prop.
 */
const mitten = (side: "left" | "right", at: HandAnchor) => {
  const direction = side === "left" ? 1 : -1;
  return (
    `<g class="bl-hand-anchor bl-hand-${side}" transform="translate(${r2(at.x)} ${r2(at.y)})">` +
    `<g class="bl-hand-motion" style="opacity:var(--bl-hand-${side}-opacity,0);transform:translate(var(--bl-hand-${side}-x,${direction * 9}px),var(--bl-hand-${side}-y,7px)) scale(var(--bl-hand-${side}-scale,.72)) rotate(var(--bl-hand-${side}-rotate,${direction * -8}deg))">` +
    `<circle class="bl-hand-thumb" cx="${direction * 5.1}" cy="1.5" r="3.4" style="opacity:var(--bl-hand-${side}-thumb,0)"/>` +
    `<circle class="bl-hand-palm" cx="0" cy="0" r="7.2"/>` +
    `</g></g>`
  );
};

/** Adapter-facing scene split. Changing `hands` never replaces its SVG subtree. */
export function _sceneParts(name: string, options: SceneOptions = {}): SceneParts {
  const { hands, activity, ...requestedBlobatarOptions } = options;
  const presence = handPresence(hands);
  const progress = clamp01(activity?.progress ?? 0);

  // Anchors first: activities receive them through the scene context so a wave
  // or a held prop lands beside *this* silhouette rather than the round one
  // the constants were tuned against. The context reports the pose-free
  // anchors; the rendered pair shifts by the pose's own `bdy` below.
  const baseBody = _layout(name, {
    ...requestedBlobatarOptions,
    expression: undefined,
  }).body;
  const baseAnchors = handAnchors(baseBody);
  const ctx: SceneContext = {
    hands: baseAnchors,
    body: {
      cx: tx + baseBody.cx,
      cy: ty + baseBody.cy,
      rx: baseBody.rx,
      ry: baseBody.ry,
    },
  };

  const frame = activity?.value._sample(progress, ctx) ?? {};
  const expression = expressionAt(requestedBlobatarOptions.expression, frame);
  const blobatarOptions = { ...requestedBlobatarOptions, expression };

  const sampled = typeof hands === "object" || !!activity;
  const layout = _layout(name, blobatarOptions);
  // Resting hands ride the pose's body offset, so they follow the creature
  // when it lifts or sinks rather than staying put beside where it was.
  const bdy = expression?.p.bdy ?? 0;
  const anchors = {
    left: { x: baseAnchors.left.x, y: baseAnchors.left.y + bdy },
    right: { x: baseAnchors.right.x, y: baseAnchors.right.y + bdy },
  };
  const body = _parts(name, blobatarOptions);
  const bodyFrame = frame.body;
  const bodyScale = n(bodyFrame?.scale, 1);
  const artwork = activity?.value._artwork;
  const resolvedArtwork =
    typeof artwork === "function" ? artwork(ctx) : artwork;
  const gazeOff = clamp01(n(frame.suppressGaze, 0));
  const bg = body.bg ? `<path d="${body.bg.d}" fill="${body.bg.fill}"/>` : "";

  return {
    viewBox: SCENE_VIEW_BOX,
    bodyTransform: SCENE_BODY_TRANSFORM,
    body,
    figure: `${bg}<g${body.cls ? ` class="${body.cls}"` : ""}>${body.inner}</g>`,
    title: requestedBlobatarOptions.title ?? "",
    className: `bl-scene${sampled ? " bl-hands-sampled" : ""}${activity ? ` bl-activity-${activityClass(activity.value.id)}` : ""}`,
    vars: {
      ...handVars("left", anchors.left, presence, frame.leftHand),
      ...handVars("right", anchors.right, presence, frame.rightHand),
      "--bl-hand-fill": layout.palette.head!,
      "--bl-hand-stroke": layout.palette.eye!,
      "--bl-scene-ink": layout.palette.eye!,
      "--bl-silhouette-left-x": `${r2(tx + layout.body.cx - layout.body.rx)}px`,
      "--bl-silhouette-right-x": `${r2(tx + layout.body.cx + layout.body.rx)}px`,
      "--bl-silhouette-side-y": `${r2(ty + layout.body.cy)}px`,
      "--bl-body-x": `${r2(n(bodyFrame?.x, 0))}px`,
      "--bl-body-y": `${r2(n(bodyFrame?.y, 0))}px`,
      "--bl-body-rotate": `${r2(n(bodyFrame?.rotate, 0))}deg`,
      "--bl-body-scale-x": String(r2(bodyScale * n(bodyFrame?.scaleX, 1))),
      "--bl-body-scale-y": String(r2(bodyScale * n(bodyFrame?.scaleY, 1))),
      ...(gazeOff > 0 ? { "--bl-gaze-off": String(r2(gazeOff)) } : {}),
      ...body.vars,
      ...frame.vars,
    },
    hands:
      `<g class="bl-hands" fill="var(--bl-hand-fill)" stroke="var(--bl-hand-stroke)" stroke-opacity=".14" stroke-width="1.2" stroke-linejoin="round">` +
      mitten("left", anchors.left) +
      mitten("right", anchors.right) +
      `</g>`,
    anchors,
    activityBehind: resolvedArtwork?.behind ?? "",
    activityBodyFront: resolvedArtwork?.bodyFront ?? "",
    activityFront: resolvedArtwork?.front ?? "",
  };
}
