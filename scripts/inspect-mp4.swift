// Independent macOS media inspection. AVFoundation parses and decodes every
// frame; no dependency on the exporter/muxer. QA only, never shipped in package.
import Foundation
import AVFoundation
import CoreMedia
import CoreVideo

func fourCC(_ value: FourCharCode) -> String {
    String(bytes: [24, 16, 8, 0].map { UInt8((value >> $0) & 255) }, encoding: .ascii) ?? "unknown"
}
Task {
    do {
        var results: [[String: Any]] = []
        for path in CommandLine.arguments.dropFirst() {
            let asset = AVURLAsset(url: URL(fileURLWithPath: path))
            let tracks = try await asset.loadTracks(withMediaType: .video)
            guard let track = tracks.first else { throw NSError(domain: "MP4Inspector", code: 1, userInfo: [NSLocalizedDescriptionKey: "No video track"] ) }
            let duration = try await asset.load(.duration)
            let size = try await track.load(.naturalSize)
            let rate = try await track.load(.nominalFrameRate)
            let formats = try await track.load(.formatDescriptions)
            let reader = try AVAssetReader(asset: asset)
            let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
            output.alwaysCopiesSampleData = false
            reader.add(output)
            guard reader.startReading() else { throw reader.error ?? NSError(domain: "MP4Inspector", code: 2) }
            var timestamps: [Double] = []
            while let sample = output.copyNextSampleBuffer() {
                guard CMSampleBufferGetImageBuffer(sample) != nil else { throw NSError(domain: "MP4Inspector", code: 3) }
                timestamps.append(CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample)))
            }
            guard reader.status == .completed, !timestamps.isEmpty else { throw reader.error ?? NSError(domain: "MP4Inspector", code: 4) }
            let intervals = zip(timestamps, timestamps.dropFirst()).map { $1 - $0 }
            guard intervals.allSatisfy({ $0 > 0 }) else { throw NSError(domain: "MP4Inspector", code: 5) }
            results.append(["file": path, "durationSeconds": CMTimeGetSeconds(duration), "width": Int(size.width), "height": Int(size.height), "nominalFrameRate": rate, "decodedFrames": timestamps.count, "codec": formats.first.map { fourCC(CMFormatDescriptionGetMediaSubType($0)) } ?? "unknown", "firstPTS": timestamps.first!, "lastPTS": timestamps.last!, "maxIntervalErrorSeconds": intervals.map { abs($0 - 1.0 / 30.0) }.max() ?? 0, "timestamps": timestamps])
            reader.cancelReading()
        }
        let json = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
        print(String(data: json, encoding: .utf8)!)
        exit(0)
    } catch {
        fputs("MP4 inspection failed: \(error)\n", stderr)
        exit(1)
    }
}
dispatchMain()
