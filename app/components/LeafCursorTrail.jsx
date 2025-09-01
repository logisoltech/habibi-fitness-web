"use client";

import { useEffect, useRef } from 'react';

export default function LeafCursorTrail() {
  const trailRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef();

  useEffect(() => {
    // Create trail elements
    const trailCount = 8;
    const trails = [];

    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-leaf-trail';
      trail.style.cssText = `
        position: fixed;
        width: ${20 - i * 2}px;
        height: ${20 - i * 2}px;
        pointer-events: none;
        z-index: 9999;
        opacity: ${(trailCount - i) / trailCount * 0.6};
        background: url('/images/leaf.png') no-repeat center;
        background-size: contain;
        transform: rotate(${i * 45}deg);
        transition: all 0.1s ease-out;
        filter: drop-shadow(0 0 ${5 + i}px rgba(116, 235, 110, 0.3));
      `;
      document.body.appendChild(trail);
      trails.push({
        element: trail,
        x: 0,
        y: 0,
        delay: i * 50,
      });
    }

    trailRef.current = trails;

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Animation loop
    const animate = () => {
      trailRef.current.forEach((trail, index) => {
        const targetX = mouseRef.current.x;
        const targetY = mouseRef.current.y;
        
        // Smooth following with delay
        trail.x += (targetX - trail.x) * (0.2 - index * 0.02);
        trail.y += (targetY - trail.y) * (0.2 - index * 0.02);
        
        trail.element.style.left = `${trail.x - 10}px`;
        trail.element.style.top = `${trail.y - 10}px`;
        
        // Add floating effect
        const time = Date.now() * 0.002;
        const floatX = Math.sin(time + index) * 3;
        const floatY = Math.cos(time + index * 0.5) * 2;
        
        trail.element.style.transform = `
          translate(${floatX}px, ${floatY}px) 
          rotate(${index * 45 + time * 20}deg)
          scale(${0.8 + Math.sin(time + index) * 0.2})
        `;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse enter/leave handlers for auth pages
    const handleMouseEnter = () => {
      trailRef.current.forEach(trail => {
        trail.element.style.opacity = trail.element.style.opacity.replace('0', '0.6');
      });
    };

    const handleMouseLeave = () => {
      trailRef.current.forEach(trail => {
        trail.element.style.opacity = '0';
      });
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    
    // Only show trail on auth pages
    const authPages = document.querySelector('[data-page="auth"]');
    if (authPages || window.location.pathname.includes('/auth/')) {
      document.addEventListener('mouseenter', handleMouseEnter);
      document.addEventListener('mouseleave', handleMouseLeave);
      animate();
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Cleanup trail elements
      trailRef.current.forEach(trail => {
        if (trail.element.parentNode) {
          trail.element.parentNode.removeChild(trail.element);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything directly
}


