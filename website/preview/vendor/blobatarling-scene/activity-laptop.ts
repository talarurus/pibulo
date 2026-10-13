import { clamp, envelope, smooth } from "./activity-kit";
import { happy, mad, smug, thinking, type Expression } from "../blobatar/src/expression";
import {
  DEFAULT_SCENE_CONTEXT,
  type ActivityHandFrame,
  type SceneActivity,
} from "./scene-activity";

export type LaptopState = "working" | "idle" | "done" | "error" | "input";

/** A logo image fitted to the laptop lid. Data URLs keep scenes self-contained. */
export interface LaptopLogo {
  readonly src: string;
  readonly label?: string;
}

export interface LaptopOptions {
  readonly logo?: LaptopLogo;
  readonly typing?: boolean;
}

const attr = (value: string) =>
  value.replace(/[&<>"']/g, character => {
    if (character === "&") return "&amp;";
    if (character === "<") return "&lt;";
    if (character === ">") return "&gt;";
    if (character === '"') return "&quot;";
    return "&#39;";
  });

/**
 * The face each state wears while the lid is open. `working` reads `typing`
 * for the focused-thinking face; the other states are statements rather than
 * modes, so they carry their own expressions — `done` is a satisfied half-lid
 * smug, `error` a hot frustrated V, `input` open and happy because it wants to
 * be noticed.
 */
const stateExpression = (state: LaptopState, isTyping: boolean): Expression =>
  state === "working"
    ? isTyping ? thinking : happy
    : state === "done"
      ? smug
      : state === "error"
        ? mad
        : happy;

/**
 * The status badge `done` and `error` pin to the lid's top corner. Empty for
 * the states that say nothing — the badge is the statement, not a decoration
 * every state gets.
 */
const statusBadge = (state: LaptopState) =>
  state === "done"
    ? `<g class="bl-laptop-status" style="opacity:var(--bl-laptop-status,0)">` +
      `<circle cx="116" cy="76" r="7" fill="#34c759" stroke="#1d5c2e" stroke-width="1.2"/>` +
      `<path d="M112.8 76.2l2.2 2.3 4.4-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</g>`
    : state === "error"
      ? `<g class="bl-laptop-status" style="opacity:var(--bl-laptop-status,0)">` +
        `<circle cx="116" cy="76" r="7" fill="#ff5f57" stroke="#7e2119" stroke-width="1.2"/>` +
        `<path d="M113.2 73.2l5.6 5.6M118.8 73.2l-5.6 5.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>` +
        `</g>`
      : "";

/** Work behind a MacBook lid with screen facing the blob and hands hidden behind the lid while typing. */
export function laptop(
  state: LaptopState = "working",
  options: LaptopOptions = {},
): SceneActivity {
  const logo = options.logo;
  const isTyping = options.typing ?? state === "working";
  const expression = stateExpression(state, isTyping);

  // MacBook rear lid logo: custom caller logo or default Apple-parody Blobatar droplet silhouette
  const logoArtwork = logo
    ? `<image class="bl-laptop-logo" href="${attr(logo.src)}" x="65" y="95" width="30" height="14" preserveAspectRatio="xMidYMid meet" style="opacity:var(--bl-laptop-logo-opacity,0)"/>`
    : `<g class="bl-laptop-logo" style="opacity:var(--bl-laptop-logo-opacity,0)"><path d="M80 97.5c3.3 0 5.6 2.4 5.6 5.4 0 3.7-2.3 6.2-5.6 6.2s-5.6-2.5-5.6-6.2c0-3 2.3-5.4 5.6-5.4Z" fill="#e8edf5"/><circle cx="82" cy="94.4" r="1.8" fill="#e8edf5"/></g>`;

  return {
    id: `laptop-${state}`,
    duration: 2_400,
    _artwork: {
      front:
        `<g class="bl-laptop" style="opacity:var(--bl-laptop-opacity,0);transform:translate(var(--bl-laptop-x,0px),var(--bl-laptop-y,8px)) rotate(var(--bl-laptop-rotate,0deg)) scale(var(--bl-laptop-scale,.94))">` +
        // Soft contact shadow on the desk directly under the laptop:
        `<ellipse cx="80" cy="124.5" rx="36" ry="1.4" fill="#000" fill-opacity=".12"/>` +
        // MacBook display lid (backward-facing unibody lid, hinges up from desk at y=124):
        `<g class="bl-laptop-lid-pivot" style="transform-origin:80px 124px;transform:scaleY(var(--bl-laptop-lid,1))">` +
        // Clean unibody aluminum shell:
        `<path d="M48 88h64c3.2 0 5 1.8 5 5v26c0 3.2-1.8 5-5 5H48c-3.2 0-5-1.8-5-5V93c0-3.2 1.8-5 5-5Z" fill="#43495a" stroke="#1a1d26" stroke-width="1.3" stroke-linejoin="round"/>` +
        logoArtwork +
        `</g>` +
        `</g>` +
        statusBadge(state),
    },
    _sample(rawProgress, ctx = DEFAULT_SCENE_CONTEXT) {
      const progress = clamp(rawProgress);
      const amount = envelope(progress, 0.14, 0.86);
      let leftHand: ActivityHandFrame = { presence: 0 };
      let rightHand: ActivityHandFrame = { presence: 0 };
      let lidOpen = 1;
      let laptopX = 0;
      let laptopY = (1 - amount) * 8;
      let laptopRotate = 0;

      if (progress < 0.12) {
        // Pick up closed laptop from bottom-right and set it on the desk
        const pickup = smooth(progress / 0.12);
        lidOpen = 0.08;
        laptopX = (1 - pickup) * 20;
        laptopY = 8 + (1 - pickup) * 16;
        laptopRotate = (1 - pickup) * 4;
        const handPresence = smooth(progress / 0.08);
        leftHand = {
          presence: handPresence,
          at: { x: 104 + (1 - pickup) * 20, y: 121 + (1 - pickup) * 16 },
          rotate: -14,
          scale: 0.9,
          thumb: 1,
        };
        rightHand = {
          presence: handPresence,
          at: { x: 118 + (1 - pickup) * 20, y: 124 + (1 - pickup) * 16 },
          rotate: -24,
          scale: 0.9,
          thumb: 1,
        };
      } else if (progress < 0.26) {
        // Open the lid towards the blob using one hand grabbing the top edge
        const openPhase = smooth((progress - 0.12) / 0.14);
        lidOpen = 0.08 + openPhase * 0.92;
        const handY = 120 - 36 * openPhase;
        rightHand = {
          presence: smooth((progress - 0.12) / 0.04),
          at: { x: 80, y: handY },
          rotate: 0,
          scale: 0.92,
        };
      } else if (progress > 0.88) {
        // Pick up closed laptop with hands on bottom-right and carry away
        const dropPhase = smooth((progress - 0.88) / 0.12);
        lidOpen = 0.08;
        laptopX = dropPhase * 20;
        laptopY = 8 + dropPhase * 16;
        laptopRotate = dropPhase * 4;
        const handPresence = 1 - smooth((progress - 0.94) / 0.06);
        leftHand = {
          presence: handPresence,
          at: { x: 104 + dropPhase * 20, y: 121 + dropPhase * 16 },
          rotate: -14,
          scale: 0.9,
          thumb: 1,
        };
        rightHand = {
          presence: handPresence,
          at: { x: 118 + dropPhase * 20, y: 124 + dropPhase * 16 },
          rotate: -24,
          scale: 0.9,
          thumb: 1,
        };
      } else if (progress > 0.74) {
        // Close the lid down to the desk using one hand from top edge
        const closePhase = smooth((progress - 0.74) / 0.14);
        lidOpen = 1 - closePhase * 0.92;
        const handY = 84 + 36 * closePhase;
        rightHand = {
          presence: smooth((0.88 - progress) / 0.04),
          at: { x: 80, y: handY },
          rotate: 0,
          scale: 0.92,
        };
      } else if (state === "input") {
        // Needs attention: the far hand waves while the other rests on the
        // laptop's near edge.
        const wavePhase = clamp((progress - 0.26) / 0.48);
        const swing = Math.sin(wavePhase * Math.PI * 6) * 18 * amount;
        leftHand = {
          presence: amount,
          // On the laptop's near edge — the prop is scene-fixed, so this hand
          // stays absolute while the waving one follows the silhouette.
          at: { x: 45, y: 96 },
          rotate: -14,
          scale: 0.9,
          thumb: 1,
        };
        rightHand = {
          presence: amount,
          at: { x: ctx.hands.right.x - 11.5, y: ctx.hands.right.y - 43 + swing * 0.06 },
          rotate: swing,
          scale: 1.02,
          thumb: 0,
        };
      }
      // Active working / typing / idle / done / error:
      // Screen faces the blob. Hands are typing on the keyboard behind the laptop lid (presence: 0).
      // Head movement disabled, pure thinking mode.

      return {
        body: {
          x: 0,
          y: 0,
          rotate: 0,
        },
        expression: { value: expression, amount },
        // The creature is looking at the screen it is typing on, not at the
        // pointer: the gaze layer stands down while the lid is up for work.
        suppressGaze: state === "working" ? amount : 0,
        leftHand,
        rightHand,
        vars: {
          "--bl-laptop-opacity": String(amount),
          "--bl-laptop-x": `${laptopX}px`,
          "--bl-laptop-y": `${laptopY}px`,
          "--bl-laptop-rotate": `${laptopRotate}deg`,
          "--bl-laptop-scale": String(0.94 + amount * 0.06),
          "--bl-laptop-lid": String(lidOpen),
          "--bl-laptop-logo-opacity": String(amount * lidOpen),
          "--bl-laptop-status": String(state === "done" || state === "error" ? amount * lidOpen : 0),
        },
      };
    },
  };
}
