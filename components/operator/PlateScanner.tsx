"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onResult: (plate: string) => void;
}

type ScanState = "starting" | "ready" | "analyzing" | "detected" | "camera-error" | "ocr-error";

export function PlateScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanState, setScanState] = useState<ScanState>("starting");
  const [detected, setDetected] = useState("");

  useEffect(() => {
    let alive = true;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then((stream) => {
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setScanState("ready");
      })
      .catch(() => { if (alive) setScanState("camera-error"); });

    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Full frame snap
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    // Crop to just the guide-box region (75% wide, 30% tall, centered)
    // This discards Bengali text / background that surrounds the plate number.
    const cx = Math.floor(canvas.width * 0.125);
    const cy = Math.floor(canvas.height * 0.35);
    const cw = Math.floor(canvas.width * 0.75);
    const ch = Math.floor(canvas.height * 0.30);
    const crop = document.createElement("canvas");
    crop.width = cw;
    crop.height = ch;
    crop.getContext("2d")!.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

    setScanState("analyzing");

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(crop);
      await worker.terminate();

      // Keep only plate-valid characters (A-Z, 0-9, dash).
      // Bengali characters are outside Tesseract's English charset and come out
      // as garbage symbols — the replace strips them along with everything else.
      const cleaned = text
        .toUpperCase()
        .replace(/[^A-Z0-9\s\-]/g, "")   // strip non-plate chars incl. Bengali noise
        .replace(/\s+/g, "-")             // spaces → dashes
        .replace(/-+/g, "-")              // collapse consecutive dashes
        .replace(/^-|-$/g, "")            // trim edge dashes
        .trim();

      setDetected(cleaned);
      setScanState(cleaned ? "detected" : "ocr-error");
    } catch {
      setScanState("ocr-error");
    }
  }

  function retake() {
    setDetected("");
    setScanState("ready");
  }

  return (
    <div className="space-y-3">
      {/* Camera viewfinder */}
      <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: 200 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
        />

        {/* Dark overlay + bright guide box — helps user frame the plate */}
        {scanState === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-white rounded"
              style={{
                width: "75%",
                height: "30%",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        )}

        {scanState === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-sm">Starting camera…</span>
          </div>
        )}

        {scanState === "analyzing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65">
            <p className="text-white text-sm font-medium">Analyzing plate…</p>
            <p className="text-white/60 text-xs mt-1">Reading license number</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {scanState === "camera-error" && (
        <p className="text-sm text-destructive text-center">
          Camera unavailable — check browser permissions, or use manual entry.
        </p>
      )}

      {scanState === "ready" && (
        <>
          <p className="text-xs text-center text-muted-foreground">
            Align the license plate inside the frame, then tap Capture
          </p>
          <button
            onClick={capture}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Capture & Detect
          </button>
        </>
      )}

      {(scanState === "detected" || scanState === "ocr-error") && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {scanState === "ocr-error"
                ? "Couldn't read plate — enter manually"
                : "Detected — confirm or edit"}
            </p>
            <input
              type="text"
              value={detected}
              onChange={(e) => setDetected(e.target.value.toUpperCase())}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. DHA-GA-11-1001"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={retake}
              className="flex-1 rounded-md border px-4 py-2 text-sm"
            >
              Retake
            </button>
            <button
              onClick={() => detected.trim() && onResult(detected.trim())}
              disabled={!detected.trim()}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Look Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
