'use client';

import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.73,
        height * 0.38,
        0,
        width * 0.73,
        height * 0.38,
        Math.max(width, height) * 0.62,
      );
      glow.addColorStop(0, 'rgba(248, 113, 113, 0.11)');
      glow.addColorStop(1, 'rgba(248, 113, 113, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    });

    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
