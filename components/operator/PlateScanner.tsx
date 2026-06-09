"use client";
import { useEffect, useRef, useState } from "react";

const OVERRIDE_PLATES = {
  green:  "DHA-GA-11-4001",
  yellow: "DHA-GA-11-6001",
  red:    "DHA-GA-11-4002",
} as const;

type Light = keyof typeof OVERRIDE_PLATES;

const LIGHT_STYLE: Record<Light, { dim: string; bright: string }> = {
  green:  { dim: "bg-green-950/50",  bright: "bg-green-400  shadow-[0_0_10px_3px_rgba(74,222,128,0.75)]" },
  yellow: { dim: "bg-yellow-950/50", bright: "bg-yellow-300 shadow-[0_0_10px_3px_rgba(253,224,71,0.75)]" },
  red:    { dim: "bg-red-950/50",    bright: "bg-red-500     shadow-[0_0_10px_3px_rgba(239,68,68,0.75)]" },
};

const LIGHTS: Light[] = ["green", "yellow", "red"];

interface Props {
  onResult: (plate: string) => void;
}

type ScanState = "starting" | "ready" | "scanning" | "analyzing" | "camera-error";

export function PlateScanner({ onResult }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const t1Ref     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLightRef = useRef<Light | null>(null);

  const [scanState, setScanState] = useState<ScanState>("starting");
  const [selectedLight, setSelectedLight] = useState<Light | null>(null);

  // Camera init + cleanup
  useEffect(() => {
    let alive = true;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
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
      if (t1Ref.current) clearTimeout(t1Ref.current);
      if (t2Ref.current) clearTimeout(t2Ref.current);
    };
  }, []);

  // If light was tapped before camera was ready
  useEffect(() => {
    if (scanState === "ready" && pendingLightRef.current) {
      startSequence(pendingLightRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState]);

  function startSequence(light: Light) {
    if (t1Ref.current) clearTimeout(t1Ref.current);
    if (t2Ref.current) clearTimeout(t2Ref.current);

    setScanState("scanning");

    // At ~1.5 s: snap a frame to canvas and switch to "analyzing" overlay
    t1Ref.current = setTimeout(() => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
      }
      setScanState("analyzing");
    }, 3000);

    // At 5 s: fire the hardcoded plate
    t2Ref.current = setTimeout(() => {
      onResult(OVERRIDE_PLATES[light]);
    }, 5000);
  }

  function handleLightClick(light: Light) {
    pendingLightRef.current = light;
    setSelectedLight(light);
    if (scanState === "ready" || scanState === "scanning" || scanState === "analyzing") {
      startSequence(light);
    }
  }

  const isActive = scanState === "ready" || scanState === "scanning" || scanState === "analyzing";

  return (
    <div className="space-y-2">
      {/* Viewfinder */}
      <div className="relative rounded-lg overflow-hidden bg-black" style={{ minHeight: 200 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
        />

        {/* Dark overlay + guide box */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-white/80 rounded"
              style={{
                width: "75%",
                height: "30%",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        )}

        {/* State overlays */}
        {scanState === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/70 text-sm">Starting camera…</span>
          </div>
        )}

        {scanState === "scanning" && (
          <div className="absolute bottom-10 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-white text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
              Scanning…
            </span>
          </div>
        )}

        {scanState === "analyzing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
            <p className="text-white text-sm font-medium">Analyzing plate…</p>
            <p className="text-white/60 text-xs mt-1">Reading license number</p>
          </div>
        )}

        {/* Traffic light — bottom-right corner */}
        {scanState !== "camera-error" && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 items-center bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-2">
            {LIGHTS.map((light) => (
              <button
                key={light}
                onClick={() => handleLightClick(light)}
                aria-pressed={selectedLight === light}
                className={`w-5 h-5 rounded-full transition-all duration-150 ${
                  selectedLight === light ? LIGHT_STYLE[light].bright : LIGHT_STYLE[light].dim
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden canvas — used to capture the frame at the mid-point */}
      <canvas ref={canvasRef} className="hidden" />

      {scanState === "camera-error" && (
        <p className="text-sm text-destructive text-center">
          Camera unavailable — check browser permissions, or use manual entry.
        </p>
      )}

      {isActive && !selectedLight && (
        <p className="text-xs text-center text-muted-foreground">
          Tap a signal to begin — then align the plate in the frame
        </p>
      )}

      {scanState === "scanning" && (
        <p className="text-xs text-center text-muted-foreground">Hold steady…</p>
      )}
    </div>
  );
}
