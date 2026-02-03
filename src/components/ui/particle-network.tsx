"use client";

import React, { useEffect, useRef } from "react";

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

    useEffect(() => {
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

        const PARTICLE_COUNT = 80;
        const CONNECTION_DISTANCE = 120;
        const MOUSE_INFLUENCE_RADIUS = 150;

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

            // Gradient Line Style
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.2)");

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
                const opacity = 0.2 * p.z;
                ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
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
                        const lineOpacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
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
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative bg-gray-900 overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 block" />
            {/* Optional Overlay Text or Label if needed */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <p className="text-[10px] text-gray-600 tracking-widest uppercase">Global Trade Network</p>
            </div>
        </div>
    );
}
