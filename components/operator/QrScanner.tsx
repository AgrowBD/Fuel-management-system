"use client";
import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  onResult: (value: string) => void;
  onError?: (err: string) => void;
}

export function QrScanner({ onResult, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Always-current ref so the effect closure never goes stale
  const onResultRef = useRef(onResult);
  // Gate: html5-qrcode fires the callback on every frame the QR is visible.
  // This ref ensures we call onResult exactly once then stop the scanner.
  const firedRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Unique ID per mount — html5-qrcode keys internal state by element ID;
    // a fixed ID collides after unmount/remount (e.g. page refresh) and the
    // library throws silently, leaving the camera frozen.
    const id = `qr-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    const el = document.createElement("div");
    el.id = id;
    containerRef.current.appendChild(el);

    const scanner = new Html5Qrcode(id);
    firedRef.current = false;

    // Responsive QR box — 65% of viewport width, capped at 260px
    const boxSize = Math.min(260, Math.floor(window.innerWidth * 0.65));

    scanner
      .start(
        { facingMode: "environment" }, // back camera on mobile
        { fps: 10, qrbox: { width: boxSize, height: boxSize } },
        (decodedText) => {
          if (firedRef.current) return;
          firedRef.current = true;
          // Stop the scanner before surfacing the result so no further
          // frame callbacks fire while React is still re-rendering.
          scanner.stop().catch(() => {}).finally(() => {
            onResultRef.current(decodedText.trim().toUpperCase());
          });
        },
        undefined // ignore per-frame QR-not-found errors
      )
      .catch((err) => {
        onError?.(String(err));
      });

    return () => {
      if (scanner.isScanning) scanner.stop().catch(() => {});
      el.remove(); // remove our imperative DOM node so React's tree stays clean
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full rounded-md overflow-hidden"
      style={{ minHeight: 280 }}
    />
  );
}
