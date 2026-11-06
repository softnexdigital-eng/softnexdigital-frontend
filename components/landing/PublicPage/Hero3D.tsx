'use client';
import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let isVisible = true;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Minimized to 8 particles maximum
    const particles: { x: number; y: number; r: number; speed: number; angle: number; opacity: number }[] = [];
    const particleCount = Math.min(8, Math.floor((canvas.width * canvas.height) / 150000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const digitalChars = 'DIGITAL'.split('');

    const draw = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.006; // Slower animation

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Simplified orbs with fixed size
      const orbs = [
        { x: W * 0.75, y: H * 0.3, r: 100, c1: 'rgba(251,146,60,0.08)', c2: 'rgba(239,68,68,0)' },
        { x: W * 0.85, y: H * 0.7, r: 60, c1: 'rgba(249,115,22,0.06)', c2: 'rgba(0,0,0,0)' },
      ];
      orbs.forEach((o, i) => {
        const ox = o.x + Math.sin(t + i) * 15;
        const oy = o.y + Math.cos(t * 0.7 + i) * 10;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(1, o.r));
        g.addColorStop(0, o.c1);
        g.addColorStop(1, o.c2);
        ctx.beginPath();
        ctx.arc(ox, oy, Math.max(1, o.r), 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Lighter grid (every other line)
      ctx.strokeStyle = 'rgba(251,146,60,0.04)';
      ctx.lineWidth = 1;
      const gridSpacingX = W / 6;
      const gridSpacingY = H / 6;
      for (let i = 0; i <= 6; i++) {
        const x = gridSpacingX * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let j = 0; j <= 4; j++) {
        const y = gridSpacingY * j;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${p.opacity})`;
        ctx.fill();
      });

      // Removed expensive scanlines
      // Removed moving sweep streak

      // Simplified hologram text (no glow every frame)
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const breathe = 0.035 + Math.sin(t * 0.85) * 0.015;
      const textFont = `600 80px 'Inter',sans-serif`;
      const subTextFont = `500 70px 'Inter',sans-serif`;

      const mainY = cy - 40;
      const subY = cy + 50;

      ctx.font = textFont;
      ctx.fillStyle = `rgba(249,115,22,${0.3 + breathe * 0.3})`;
      ctx.fillText('SOFTNEX', cx, mainY);

      ctx.font = subTextFont;
      ctx.fillStyle = `rgba(239,68,68,${0.25 + breathe * 0.2})`;
      
      // Simplified DIGITAL drawing
      let offsetX = cx - 100;
      digitalChars.forEach((ch) => {
        ctx.fillText(ch, offsetX, subY);
        offsetX += 25;
      });

      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (!isVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        } else if (isVisible && !animId) {
          draw();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    draw();
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none"
      style={{ 
        display: 'block',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
}
