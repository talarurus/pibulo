import {compileMotionRecording} from '@talarurus/pibulo/motion';
import {checkMP4Support, exportMP4, MP4ExportError} from '@talarurus/pibulo/export/mp4';

/** Call from an explicit browser UI action. The host owns the download URL. */
export async function makeVideo(recordingJSON:string, signal:AbortSignal):Promise<Blob> {
  const result=compileMotionRecording(recordingJSON,{originMs:0});
  if(!result.ok)throw new Error(result.error);
  const options={width:512,height:512,background:'#0a0a0b',reducedMotion:false};
  const support=await checkMP4Support(options);
  if(!support.supported)throw new MP4ExportError('unsupported',support.reason);
  const video=await exportMP4(result.motion,options,{signal,onProgress:progress=>console.log(progress.completedFrames,progress.totalFrames)});
  return video.blob;
}
