import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      baseAlpha: number;
      pulseSpeed: number;
    }

    const particleCount = Math.min(55, Math.floor((width * height) / 32000));
    const particles: Particle[] = [];

    const isDark = theme === "dark";

    // Palette:
    // Dark mode: Beige background (#f5f0e6) with Sky Blue (#38bdf8), subtle Cream (#fdfbf7), and deep Navy (#0a192f)
    // Light mode: Navy background (#0a192f) with Sky Blue (#38bdf8) and Off-White (#f8fafc)
    const colors = isDark
      ? [
          "56, 189, 248",   // Sky Blue
          "10, 25, 47",     // Navy
          "180, 160, 140",  // Muted Beige
        ]
      : [
          "56, 189, 248",   // Sky Blue
          "248, 250, 252",  // Off-white
          "14, 165, 233",   // Vivid Sky Blue
        ];

    for (let i = 0; i < particleCount; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      const baseA = Math.random() * 0.25 + 0.08;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2.0 + 0.8,
        color: col,
        alpha: baseA,
        baseAlpha: baseA,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      time += 0.005;

      // 1. Base gradient background
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.85
      );

      if (isDark) {
        // Dark Mode: Beige background
        bgGrad.addColorStop(0, "#faf6ef");
        bgGrad.addColorStop(0.5, "#f5f0e6");
        bgGrad.addColorStop(1, "#ebdcc9");
      } else {
        // Light Mode: Navy Blue background
        bgGrad.addColorStop(0, "#0e2444");
        bgGrad.addColorStop(0.5, "#0a192f");
        bgGrad.addColorStop(1, "#061020");
      }

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Ambient Flow Waves
      ctx.save();
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const waveOffset = w * 1.8;
        const baseY = height * (0.35 + w * 0.22);
        ctx.moveTo(0, baseY);

        for (let x = 0; x <= width; x += 30) {
          const sin1 = Math.sin(x * 0.0018 + time + waveOffset) * 40;
          const sin2 = Math.sin(x * 0.0035 - time * 0.8 + waveOffset) * 20;
          const cos1 = Math.cos(x * 0.001 + time * 0.5) * 12;
          const y = baseY + sin1 + sin2 + cos1;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - 60, width, baseY + 120);
        if (isDark) {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.02)");
          grad.addColorStop(0.5, "rgba(253, 251, 247, 0.03)");
          grad.addColorStop(1, "rgba(245, 240, 230, 0)");
        } else {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.04)");
          grad.addColorStop(0.5, "rgba(14, 165, 233, 0.025)");
          grad.addColorStop(1, "rgba(10, 25, 47, 0)");
        }

        ctx.fillStyle = grad;
        ctx.fill();

        // Wave crest highlight line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 30) {
          const sin1 = Math.sin(x * 0.0018 + time + waveOffset) * 40;
          const sin2 = Math.sin(x * 0.0035 - time * 0.8 + waveOffset) * 20;
          const cos1 = Math.cos(x * 0.001 + time * 0.5) * 12;
          const y = baseY + sin1 + sin2 + cos1;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isDark
          ? "rgba(56, 189, 248, 0.06)"
          : "rgba(56, 189, 248, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Particle Constellation Network
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        p.alpha = p.baseAlpha + Math.sin(time * 3 + i) * 0.08;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.04, p.alpha)})`;
        ctx.shadowColor = `rgba(${p.color}, 0.6)`;
        ctx.shadowBlur = 6;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.07;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 4. Digital Grid Telemetry Overlay
      ctx.save();
      ctx.strokeStyle = isDark
        ? "rgba(10, 25, 47, 0.03)"
        : "rgba(56, 189, 248, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 64;
      const offsetX = (time * 10) % gridSize;
      const offsetY = (time * 5) % gridSize;

      for (let x = -gridSize + offsetX; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = -gridSize + offsetY; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Cinematic Edge Vignette
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.45,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      if (isDark) {
        vignette.addColorStop(0, "rgba(245, 240, 230, 0)");
        vignette.addColorStop(1, "rgba(215, 200, 180, 0.3)");
      } else {
        vignette.addColorStop(0, "rgba(10, 25, 47, 0)");
        vignette.addColorStop(1, "rgba(6, 16, 32, 0.55)");
      }
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          filter: "contrast(1.02) brightness(1.01)",
        }}
      />
    </div>
  );
}
