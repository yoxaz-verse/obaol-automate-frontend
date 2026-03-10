import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Particle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    size: number;
}

export default function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;

        const PARTICLE_COUNT = 85;
        const CONNECTION_DISTANCE = 130;
        const MOUSE_INFLUENCE_RADIUS = 200;

        // Colors based on theme
        const particleBaseColor = isDark ? "251, 146, 60" : "150, 150, 150";
        const lineBaseColor = isDark ? "251, 146, 60" : "100, 100, 100";

        // Initialize Canvas Size
        const handleResize = () => {
            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * containerWidth,
                    y: Math.random() * containerHeight,
                    z: Math.random() * 2 + 0.5, // Depth factor (0.5 to 2.5)
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    vz: 0,
                    size: Math.random() * 2 + 1,
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                // Update position
                p.x += p.vx * p.z; // Parallax effect
                p.y += p.vy * p.z;

                // Mouse Interaction
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

                if (distanceToMouse < MOUSE_INFLUENCE_RADIUS) {
                    const force = (MOUSE_INFLUENCE_RADIUS - distanceToMouse) / MOUSE_INFLUENCE_RADIUS;
                    p.x -= dx * force * 0.03 * p.z;
                    p.y -= dy * force * 0.03 * p.z;
                }

                // Boundary Wrap
                if (p.x < 0) p.x = containerWidth;
                if (p.x > containerWidth) p.x = 0;
                if (p.y < 0) p.y = containerHeight;
                if (p.y > containerHeight) p.y = 0;

                // Draw Particle
                ctx.beginPath();
                const opacity = (isDark ? 0.2 : 0.4) * p.z;
                ctx.fillStyle = `rgba(${particleBaseColor}, ${opacity})`;
                ctx.arc(p.x, p.y, p.size * (p.z * 0.6), 0, Math.PI * 2);
                ctx.fill();

                // Draw Connections
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        ctx.beginPath();
                        const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * (isDark ? 0.15 : 0.25);
                        ctx.strokeStyle = `rgba(${lineBaseColor}, ${lineOpacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            // Update CSS variables for the glow effect
            canvas.style.setProperty('--mouse-x', `${mouseX}px`);
            canvas.style.setProperty('--mouse-y', `${mouseY}px`);
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        }

        window.addEventListener("resize", handleResize);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        handleResize(); // Initial setup
        drawParticles();

        return () => {
            window.removeEventListener("resize", handleResize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted, theme, resolvedTheme]);

    if (!mounted) return <div className="w-full h-full relative overflow-hidden" />;

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 block" />

            {/* Cursor Glow Layer */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 mix-blend-screen transition-opacity duration-1000"
                style={{
                    background: `radial-gradient(600px circle at ${mounted ? 'var(--mouse-x, -1000px)' : '-1000px'} ${mounted ? 'var(--mouse-y, -1000px)' : '-1000px'}, ${isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)'}, transparent 80%)`
                }}
            />

            <div className="absolute bottom-4 left-4 pointer-events-none">
                <p className="text-[10px] text-default-400 tracking-tight uppercase font-bold opacity-50">Global Trade Network</p>
            </div>
        </div>
    );
}
