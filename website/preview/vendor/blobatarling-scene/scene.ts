import { serializeVars } from "../blobatar/src/animate";
import {
  _sceneParts,
  SCENE_BODY_TRANSFORM,
  SCENE_VIEW_BOX,
  type SampledHands,
  type SceneOptions,
} from "./scene-core";
import { DEFAULT_SCENE_CONTEXT } from "./scene-activity";
import type { ActivitySample, SceneActivity, SceneContext } from "./scene-activity";

export { SCENE_BODY_TRANSFORM, SCENE_VIEW_BOX };
export type { SampledHands, SceneOptions };
export type { ActivitySample, SceneActivity, SceneContext };
export { DEFAULT_SCENE_CONTEXT };

const escapeText = (text: string) =>
  text.replace(/[&<>]/g, character =>
    character === "&" ? "&amp;" : character === "<" ? "&lt;" : "&gt;",
  );

/**
 * Renders a Blobatar scene as inline SVG.
 *
 * Unlike `blobatar()`, the expanded frame is deliberately stable while hands,
 * props, and effects enter and leave. Import `blobatarling/scene.css` for enter/exit
 * transitions; the sampled static frame remains correct without the stylesheet.
 *
 * The five `bl-scene-*` groups are stable layer hooks — the imperative binder
 * in `blobatarling/scene/dom` locates its layers by them, so they are part of the
 * markup contract and not decoration.
 */
export function blobatarScene(name: string, options: SceneOptions = {}) {
  const parts = _sceneParts(name, options);
  const dim = options.size
    ? ` width="${options.size}" height="${options.size}"`
    : "";
  const title = parts.title ? `<title>${escapeText(parts.title)}</title>` : "";
  const style = serializeVars(parts.vars);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${parts.viewBox}"${dim} class="${parts.className}" style="${style}">` +
    title +
    `<g class="bl-scene-behind">${parts.activityBehind}</g>` +
    `<g class="bl-scene-body" style="transform:translate(var(--bl-body-x,0),var(--bl-body-y,0)) scale(var(--bl-body-scale-x,1),var(--bl-body-scale-y,1)) rotate(var(--bl-body-rotate,0deg))">` +
    `<g class="bl-scene-figure" transform="${parts.bodyTransform}">${parts.figure}</g>` +
    `<g class="bl-scene-body-front">${parts.activityBodyFront}</g>` +
    `</g>` +
    `<g class="bl-scene-hands">${parts.hands}</g>` +
    `<g class="bl-scene-front">${parts.activityFront}</g>` +
    `</svg>`
  );
}
