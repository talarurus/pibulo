/**
 * The small math every activity definition shares.
 *
 * Collected into one module so the eight `activity-*.ts` files do not each
 * carry their own copy — they had drifted already, with `envelope` gaining
 * different parameter orders and defaults per file. Function declarations
 * only, so each still tree-shakes out of a bundle that never names it.
 *
 * All progress values are normalized: 0 is the activity's first frame, 1 its
 * last, and `hold` playback and reduced-motion park at the activity's `_still`
 * or `0.5` rather than anywhere on this curve.
 */

/** Into [0, 1] — every channel an activity emits is authored in that range. */
export const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Two decimals for serialized custom properties: enough resolution that no
 * eye can tell a 0.01-unit step on a 160-unit scene, few enough digits that a
 * var string stays diffable and short.
 */
export const r2 = (value: number) => Math.round(value * 100) / 100;

/** Hermite smoothstep over [0, 1] — the soft edge every envelope uses. */
export const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

/**
 * Ease in, hold, ease out over normalized progress. `enter` is the fraction of
 * the timeline spent arriving and `exit` the fraction at which the leave
 * begins; between them the envelope is 1.
 */
export const envelope = (progress: number, enter = 0.18, exit = 0.82) =>
  progress < enter
    ? smooth(progress / enter)
    : progress <= exit
      ? 1
      : 1 - smooth((progress - exit) / (1 - exit));

/**
 * The three-edge variant for poses that rise, *hold*, then release before the
 * frame ends — `petting` uses it because the squish is held through the middle
 * of the gesture rather than at a point.
 */
export const windowed = (
  progress: number,
  enter: number,
  hold: number,
  exit: number,
) =>
  progress < enter
    ? smooth(progress / enter)
    : progress <= hold
      ? 1
      : 1 - smooth((progress - hold) / (exit - hold));
