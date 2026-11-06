'use client';
import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; r: number; speed: number; angle: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // ── Orbs ──
      const orbs = [
        { x: W * 0.75, y: H * 0.3, r: 180, c1: 'rgba(251,146,60,0.13)', c2: 'rgba(239,68,68,0.04)' },
        { x: W * 0.85, y: H * 0.7, r: 120, c1: 'rgba(249,115,22,0.10)', c2: 'rgba(0,0,0,0)' },
        { x: W * 0.1,  y: H * 0.2, r: 90,  c1: 'rgba(251,146,60,0.07)', c2: 'rgba(0,0,0,0)' },
      ];
      orbs.forEach((o, i) => {
        const ox = o.x + Math.sin(t + i) * 18;
        const oy = o.y + Math.cos(t * 0.7 + i) * 14;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c1);
        g.addColorStop(1, o.c2);
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // ── Grid ──
      ctx.strokeStyle = 'rgba(251,146,60,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 12; i++) {
        const x = (W / 12) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let j = 0; j <= 8; j++) {
        const y = (H / 8) * j;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── Particles ──
      particles.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${p.opacity})`;
        ctx.fill();
      });

      // ── Diagonal accent ──
      ctx.save();
      ctx.strokeStyle = 'rgba(239,68,68,0.08)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 14]);
      ctx.beginPath();
      ctx.moveTo(W * 0.55, 0);
      ctx.lineTo(W * 0.95, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── HOLOGRAM TEXT — full canvas size ──────────────────────
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Breathing pulse
      const breathe = 0.045 + Math.sin(t * 0.85) * 0.02;
      // Gentle float
      const floatY = Math.sin(t * 0.45) * 8;

      // --- Fit "SOFTNEX" to fill full canvas width ---
      // We measure at 100px then scale to fit W with small padding
      const padding = W * 0.04;
      ctx.font = `900 100px 'Inter','Helvetica Neue',Arial,sans-serif`;
      const measureMain = ctx.measureText('SOFTNEX');
      const mainFontSize = Math.floor((W - padding * 2) / (measureMain.width / 100));

      // --- Fit "DIGITAL" similarly but with letter-spacing trick ---
      // "DIGITAL" will be placed below, sized to match same width
      const subLetterSpacing = 28; // px of extra spacing between letters
      const digitalChars = 'DIGITAL'.split('');
      ctx.font = `800 100px 'Inter','Helvetica Neue',Arial,sans-serif`;
      const measureSub = ctx.measureText('DIGITAL');
      // total sub width = measured width + (chars-1)*spacing at 100px
      const totalSubAt100 = measureSub.width + (digitalChars.length - 1) * subLetterSpacing;
      const subFontSize = Math.floor((W - padding * 2) / (totalSubAt100 / 100));
      const subSpacing = subLetterSpacing * (subFontSize / 100);

      // Vertical split: SOFTNEX top half, DIGITAL bottom half
      // Together they fill nearly full height
      const gap = H * 0.04;
      const mainY = cy - gap * 0.5 - mainFontSize * 0.08 + floatY;
      const subY  = cy + gap * 0.5 + subFontSize * 0.52 + floatY;

      // ── Draw SOFTNEX ──
      ctx.font = `900 ${mainFontSize}px 'Inter','Helvetica Neue',Arial,sans-serif`;

      // Glow
      ctx.shadowColor = `rgba(249,115,22,${breathe * 2})`;
      ctx.shadowBlur  = 60;
      ctx.fillStyle   = `rgba(249,115,22,${breathe * 0.6})`;
      ctx.fillText('SOFTNEX', cx, mainY);

      // Stroke outline
      ctx.shadowBlur  = 0;
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = `rgba(249,115,22,${breathe * 1.3})`;
      ctx.lineWidth   = Math.max(1.5, mainFontSize * 0.006);
      ctx.strokeText('SOFTNEX', cx, mainY);

      // ── Draw DIGITAL with manual letter spacing ──
      ctx.font = `800 ${subFontSize}px 'Inter','Helvetica Neue',Arial,sans-serif`;

      // Measure total render width for centering
      let totalW = 0;
      const charWidths: number[] = [];
      digitalChars.forEach((ch) => {
        const w = ctx.measureText(ch).width;
        charWidths.push(w);
        totalW += w;
      });
      totalW += (digitalChars.length - 1) * subSpacing;

      let startX = cx - totalW / 2;
      digitalChars.forEach((ch, idx) => {
        const charCx = startX + charWidths[idx] / 2;

        // Glow
        ctx.shadowColor = `rgba(239,68,68,${breathe * 1.8})`;
        ctx.shadowBlur  = 40;
        ctx.fillStyle   = `rgba(239,68,68,${breathe * 0.55})`;
        ctx.fillText(ch, charCx, subY);

        // Stroke
        ctx.shadowBlur  = 0;
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = `rgba(239,68,68,${breathe * 1.2})`;
        ctx.lineWidth   = Math.max(1, subFontSize * 0.006);
        ctx.strokeText(ch, charCx, subY);

        startX += charWidths[idx] + subSpacing;
      });

      // ── Scanlines across full canvas ──
      const scanAlpha = breathe * 0.28;
      for (let sy = 0; sy < H; sy += 7) {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(W, sy);
        ctx.strokeStyle = `rgba(249,115,22,${scanAlpha})`;
        ctx.lineWidth   = 0.4;
        ctx.stroke();
      }

      // ── Moving sweep streak ──
      const streakY = (t * 55) % H;
      const sg = ctx.createLinearGradient(0, streakY, W, streakY);
      sg.addColorStop(0,   'rgba(249,115,22,0)');
      sg.addColorStop(0.5, `rgba(249,115,22,${breathe * 2.2})`);
      sg.addColorStop(1,   'rgba(249,115,22,0)');
      ctx.beginPath();
      ctx.moveTo(0, streakY);
      ctx.lineTo(W, streakY);
      ctx.strokeStyle = sg;
      ctx.lineWidth   = 3;
      ctx.stroke();

      ctx.restore();
      // ── END HOLOGRAM ──────────────────────────────────────────

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}