/**
 * The imperative half of scene playback — `blobatarling/scene/dom`.
 *
 * `createActivityPlayback` emits a sampled frame sixty times a second, and the
 * adapters' answer to that — set the `activity` prop, re-render, diff — pays a
 * framework reconciliation and a `_sceneParts` call for something that is, in
 * the overwhelmingly common case, thirteen changed custom properties on a tree
 * that did not move. This module is the other answer: it owns the `<svg>`
 * directly, writes changed CSS variables through `setProperty`, and touches
 * markup only when a layer's serialized string actually differs — which is to
 * say at activity boundaries and (for the unanimated renderer, whose pose is
 * baked into markup) during expression morphs.
 *
 * It composes with rather than replaces `BlobatarScene`: bind it to the same
 * `<svg>` an adapter rendered and it finds the five `bl-scene-*` layer hooks
 * the markup already carries, or hand it an empty `<svg>` and it builds the
 * skeleton itself on the first `apply`.
 *
 * Only `bl-scene-*` internals are written. `class`, `style` and the layer
 * elements themselves are touched only when the parts say so, and user
 * attributes are left alone — same uncontested-properties bargain `gaze.ts`
 * makes, so a framework that re-renders the element does not race this.
 */

import { _sceneParts, SCENE_VIEW_BOX, type SceneOptions, type SceneParts } from "./scene-core";

export interface SceneBinding {
  /** Render or update the scene. Returns the parts that were applied. */
  apply(name: string, options?: SceneOptions): SceneParts;
  /** Release element references. The `<svg>` and its contents are left in place. */
  dispose(): void;
}

const LAYERS = {
  behind: "bl-scene-behind",
  figure: "bl-scene-figure",
  bodyFront: "bl-scene-body-front",
  hands: "bl-scene-hands",
  front: "bl-scene-front",
} as const;

/**
 * The skeleton `blobatarScene` emits, minus the attributes that live on the
 * element itself. Built once rather than per apply — after this the binder
 * never reparents anything.
 */
const skeleton = (parts: SceneParts) =>
  `<g class="${LAYERS.behind}">${parts.activityBehind}</g>` +
  `<g class="bl-scene-body" style="transform:translate(var(--bl-body-x,0),var(--bl-body-y,0)) scale(var(--bl-body-scale-x,1),var(--bl-body-scale-y,1)) rotate(var(--bl-body-rotate,0deg))">` +
  `<g class="${LAYERS.figure}" transform="${parts.bodyTransform}">${parts.figure}</g>` +
  `<g class="${LAYERS.bodyFront}">${parts.activityBodyFront}</g>` +
  `</g>` +
  `<g class="${LAYERS.hands}">${parts.hands}</g>` +
  `<g class="${LAYERS.front}">${parts.activityFront}</g>`;

/**
 * Binds an `<svg>` element to imperative scene updates.
 *
 * ```ts
 * const bind = bindScene(document.querySelector("svg")!);
 * const playback = createActivityPlayback({
 *   onUpdate: sample =>
 *     bind.apply(name, { animate: "always", activity: sample ?? undefined }),
 * });
 * playback.play(wave());
 * ```
 */
export function bindScene(svg: SVGSVGElement): SceneBinding {
  let els: {
    behind: Element | null;
    figure: Element | null;
    bodyFront: Element | null;
    hands: Element | null;
    front: Element | null;
    title: Element | null;
  } | null = null;
  let prev: SceneParts | null = null;
  let prevVars: Record<string, string> = {};
  // `undefined` until the first apply, so a scene that never wants dimensions
  // doesn't get a spurious removeAttribute pass and one that drops `size`
  // later does get the removal.
  let prevDim: string | null | undefined;

  const locate = () => {
    const byClass = (cls: string) => svg.querySelector(`.${cls}`);
    els = {
      behind: byClass(LAYERS.behind),
      figure: byClass(LAYERS.figure),
      bodyFront: byClass(LAYERS.bodyFront),
      hands: byClass(LAYERS.hands),
      front: byClass(LAYERS.front),
      // The scene's own title is a direct child; a descendant query could adopt
      // one inside injected artwork and then own it.
      title: svg.querySelector(":scope > title"),
    };
    // An adapter-rendered scene carries the hooks; anything else — an empty
    // element, an older skeleton — gets the structure built wholesale once.
    if (!els.behind || !els.figure || !els.bodyFront || !els.hands || !els.front) {
      els = null;
      return false;
    }
    return true;
  };

  // Scene-owned classes come and go with the activity; anything else on the
  // attribute — a consumer's own `class`, an adapter's — is not ours to touch.
  // `bl-` is the library's prefix, so "ours" is definable rather than guessed.
  const applyClass = (className: string) => {
    const kept = (svg.getAttribute("class") ?? "")
      .split(" ")
      .filter(c => c && !c.startsWith("bl-"));
    for (const c of className.split(" ")) if (c && !kept.includes(c)) kept.push(c);
    const next = kept.join(" ");
    if (svg.getAttribute("class") !== next) svg.setAttribute("class", next);
  };

  const apply = (name: string, options: SceneOptions = {}): SceneParts => {
    const parts = _sceneParts(name, options);

    if (!els && !locate()) {
      svg.setAttribute("viewBox", SCENE_VIEW_BOX);
      svg.innerHTML = skeleton(parts);
      locate();
      prev = null;
      prevVars = {};
    }

    if (svg.getAttribute("viewBox") !== parts.viewBox)
      svg.setAttribute("viewBox", parts.viewBox);
    const dim = options.size ? String(options.size) : null;
    if (prevDim !== dim) {
      if (dim) {
        svg.setAttribute("width", dim);
        svg.setAttribute("height", dim);
      } else {
        svg.removeAttribute("width");
        svg.removeAttribute("height");
      }
      prevDim = dim;
    }
    applyClass(parts.className);

    // Custom properties: write the changed, remove the gone. This is the only
    // work a sampled frame normally needs.
    for (const key in parts.vars) {
      if (prevVars[key] !== parts.vars[key])
        svg.style.setProperty(key, parts.vars[key]!);
    }
    for (const key in prevVars) {
      if (!(key in parts.vars)) svg.style.removeProperty(key);
    }
    prevVars = parts.vars;

    // Markup layers, only where the serialized string moved.
    if (!prev || prev.title !== parts.title) {
      if (els!.title && !parts.title) {
        els!.title.remove();
        els!.title = null;
      } else if (parts.title) {
        if (!els!.title) {
          els!.title = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "title",
          );
          svg.insertBefore(els!.title, svg.firstChild);
        }
        if (els!.title.textContent !== parts.title)
          els!.title.textContent = parts.title;
      }
    }
    if (!prev || prev.activityBehind !== parts.activityBehind)
      els!.behind!.innerHTML = parts.activityBehind;
    if (!prev || prev.figure !== parts.figure)
      els!.figure!.innerHTML = parts.figure;
    if (!prev || prev.activityBodyFront !== parts.activityBodyFront)
      els!.bodyFront!.innerHTML = parts.activityBodyFront;
    if (!prev || prev.hands !== parts.hands)
      els!.hands!.innerHTML = parts.hands;
    if (!prev || prev.activityFront !== parts.activityFront)
      els!.front!.innerHTML = parts.activityFront;

    prev = parts;
    return parts;
  };

  return {
    apply,
    dispose() {
      els = null;
      prev = null;
      prevVars = {};
    },
  };
}
