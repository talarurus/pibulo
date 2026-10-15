import {MP4ExportError, MP4_LIMITS} from './mp4-plan.js';

/** Bounded seekable sink: muxers rewrite metadata/offsets, so concatenating write
 * callbacks would corrupt MP4. Fixed pages handle rewrites without retaining a
 * complete raw frame sequence or repeatedly growing a contiguous file buffer.
 */
export class MP4Buffer {
  private readonly pages = new Map<number, Uint8Array<ArrayBuffer>>();
  private length = 0;
  write(data: Uint8Array, position: number) {
    if (!Number.isSafeInteger(position) || position < 0 || position + data.byteLength > MP4_LIMITS.maxBytes)
      throw new MP4ExportError('output-limit', 'Video exceeds the 64 MiB output limit. Try a smaller preset or recording.');
    const pageSize = 65536;
    for (let offset=0; offset<data.byteLength;) {
      const absolute = position + offset, pageIndex = Math.floor(absolute / pageSize), within = absolute % pageSize;
      let page = this.pages.get(pageIndex);
      if (!page) {page = new Uint8Array(pageSize); this.pages.set(pageIndex,page);}
      const length = Math.min(pageSize - within,data.byteLength - offset);
      page.set(data.subarray(offset,offset+length),within); offset += length;
    }
    this.length = Math.max(this.length,position + data.byteLength);
  }
  blob(): Blob {
    const parts: Uint8Array<ArrayBuffer>[] = [];
    for (let offset=0; offset<this.length; offset+=65536) {
      const page = this.pages.get(offset / 65536) ?? new Uint8Array(65536);
      parts.push(page.subarray(0,Math.min(65536,this.length-offset)));
    }
    return new Blob(parts,{type:'video/mp4'});
  }
  clear() {this.pages.clear(); this.length = 0;}
}
