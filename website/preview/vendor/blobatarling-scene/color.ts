/*! Extracted from Blobatarling color.ts; MIT, see LICENSE and SOURCE.json. */
import {fadeHex,type Palette,type ColorKey} from "../blobatar/src/color";
export type {Palette} from "../blobatar/src/color";
export function mixPalettes(a: Palette, b: Palette, t: number): Palette {
  const out: Palette = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<ColorKey>) {
    const av = a[k];
    const bv = b[k];
    if (av && bv) out[k] = fadeHex(av, bv, t);
    else out[k] = bv ?? av;
  }
  return out;
}
