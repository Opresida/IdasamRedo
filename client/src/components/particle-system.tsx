
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'token' | 'spark' | 'glow';
  rotation: number;
  rotationSpeed: number;
}

interface ParticleSystemProps {
  count?: number;
  className?: string;
  mouseTracking?: boolean;
  tokenRain?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  count = 150, 
  className = "",
  mouseTracking = true,
  tokenRain = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      const types: Particle['type'][] = tokenRain ? ['token', 'token', 'spark'] : ['spark', 'glow', 'token'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        x: tokenRain ? Math.random() * canvas.width : Math.random() * canvas.width,
        y: tokenRain ? -20 : Math.random() * canvas.height,
        z: Math.random() * 100 + 50,
        vx: tokenRain ? (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.3,
        vy: tokenRain ? Math.random() * 2 + 1 : (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.1,
        size: type === 'token' ? Math.random() * 6 + 3 : Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 300 + 200,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
    };

    const initParticles = () => {
      particlesRef.current = Array.from({ length: count }, createParticle);
    };

    const updateParticle = (particle: Particle) => {
      // Update position with 3D movement
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
      particle.rotation += particle.rotationSpeed;
      particle.life++;

      // Enhanced mouse interaction
      if (mouseTracking && mouseRef.current.isMoving) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxDistance = particle.type === 'token' ? 150 : 80;
        if (distance < maxDistance) {
          const force = ((maxDistance - distance) / maxDistance) * 0.02;
          const attraction = particle.type === 'token' ? 1.5 : 0.8;
          
          particle.vx += (dx / distance) * force * attraction;
          particle.vy += (dy / distance) * force * attraction;
          
          // Add some sparkle effect around cursor
          if (particle.type === 'spark' && distance < 50) {
            particle.opacity = Math.min(1, particle.opacity + 0.3);
          }
        }
      }

      // Parallax effect based on Z depth
      const perspective = 1 - (particle.z / 150);
      const actualVx = particle.vx * perspective;
      const actualVy = particle.vy * perspective;

      // Boundary handling with wrapping
      if (particle.x < -20) particle.x = canvas.width + 20;
      if (particle.x > canvas.width + 20) particle.x = -20;
      
      if (tokenRain) {
        if (particle.y > canvas.height + 20) {
          Object.assign(particle, createParticle());
          return;
        }
      } else {
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;
      }

      // Dynamic opacity based on life and type
      const lifeRatio = particle.life / particle.maxLife;
      const baseOpacity = particle.type === 'token' ? 0.8 : 0.5;
      particle.opacity = Math.max(0, baseOpacity - (lifeRatio * 0.6)) * perspective;

      // Reset particle if it's dead
      if (particle.life >= particle.maxLife) {
        Object.assign(particle, createParticle());
      }
    };

    const drawParticle = (particle: Particle) => {
      const perspective = 1 - (particle.z / 150);
      const size = particle.size * perspective;
      
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      
      switch (particle.type) {
        case 'token':
          // Draw $GOMA token
          ctx.fillStyle = '#00f5c3';
          ctx.shadowColor = '#00f5c3';
          ctx.shadowBlur = 15 * perspective;
          
          // Token body
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Token inner glow
          ctx.globalAlpha = particle.opacity * 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          // Token symbol (simplified $)
          if (size > 3) {
            ctx.globalAlpha = particle.opacity * 0.8;
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = Math.max(1, size * 0.1);
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.5);
            ctx.lineTo(0, size * 0.5);
            ctx.stroke();
          }
          break;
          
        case 'spark':
          // Draw spark particle
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 8 * perspective;
          
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'glow':
          // Draw glow particle
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
          gradient.addColorStop(0, 'rgba(0, 245, 195, 0.8)');
          gradient.addColorStop(0.5, 'rgba(0, 245, 195, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 245, 195, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      ctx.restore();
    };

    const drawConnections = () => {
      const maxDistance = 80;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = (maxDistance - distance) / maxDistance * 0.3;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = '#00f5c3';
            ctx.lineWidth = 0.5;
            ctx.shadowColor = '#00f5c3';
            ctx.shadowBlur = 5;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            
            ctx.restore();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(updateParticle);
      drawConnections();
      particlesRef.current.forEach(drawParticle);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isMoving = true;
      
      // Reset moving state after a delay
      setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);
    };

    const handleMouseEnter = () => {
      mouseRef.current.isMoving = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isMoving = false;
    };

    const handleResize = () => {
      resizeCanvas();
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleSystem;
