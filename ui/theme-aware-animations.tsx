/**
 * @fileoverview Theme-aware animation components
 * @description Animation effects with theme integration: glow effects, background patterns, shimmer loading, glassmorphism
 * @note Floating/parallax/magnetic effects are disabled for stability
 */

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Enhanced floating animation (DISABLED for stability)
 * @component
 * @param {Object} props - Component props
 * @returns {JSX.Element} Static element (animation disabled)
 */
export function FloatingElement({ children, intensity = 'medium', className, disabled = false }: { children: React.ReactNode; intensity?: string; className?: string; disabled?: boolean }) {
    const { actualTheme } = useTheme();
    
    // Always return static element - no animations for professional stability
    return <div className={className}>{children}</div>;
}

// Advanced glow effect that adapts to theme
export function GlowEffect({ children, color = 'primary', intensity = 'medium', className, pulse = false }: { children: React.ReactNode; color?: string; intensity?: string; className?: string; pulse?: boolean }) {
    const { actualTheme, getGlowColor } = useTheme();
    
    const glowColors = {
        primary: getGlowColor(intensity),
        emerald: actualTheme === 'light' ? '#10b98140' : actualTheme === 'dark' ? '#34d39950' : '#86efac60',
        blue: actualTheme === 'light' ? '#3b82f640' : actualTheme === 'dark' ? '#60a5fa50' : '#93c5fd60',
        purple: actualTheme === 'light' ? '#8b5cf640' : actualTheme === 'dark' ? '#a78bfa50' : '#c4b5fd60',
        rose: actualTheme === 'light' ? '#f43f5e40' : actualTheme === 'dark' ? '#fb7185' : '#fda4af60'
    };

    return (
        <div className={cn('relative', className)}>
            <div 
                className={cn(
                    'absolute inset-0 rounded-inherit transition-all duration-500',
                    // Disable pulse animation for stability
                    actualTheme === 'oled' ? 'blur-md' : 'blur-sm'
                )}
                style={{
                    background: `radial-gradient(circle, ${glowColors[color]} 0%, transparent 70%)`,
                    opacity: actualTheme === 'light' ? 0.3 : actualTheme === 'dark' ? 0.6 : 0.8
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// Sophisticated background patterns that adapt to theme
export function BackgroundPattern({ pattern = 'dots', className, opacity = 'subtle' }: { [key: string]: any }) {
    const { actualTheme } = useTheme();
    
    const opacityLevels = {
        subtle: actualTheme === 'light' ? '0.03' : actualTheme === 'dark' ? '0.05' : '0.08',
        medium: actualTheme === 'light' ? '0.06' : actualTheme === 'dark' ? '0.08' : '0.12',
        strong: actualTheme === 'light' ? '0.1' : actualTheme === 'dark' ? '0.12' : '0.16'
    };

    const patterns = {
        dots: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        grid: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
        diagonal: `repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 20px)`,
        hexagon: `radial-gradient(circle at 25px 25px, currentColor 2px, transparent 2px), radial-gradient(circle at 75px 75px, currentColor 2px, transparent 2px)`
    };

    const patternSizes = {
        dots: '20px 20px',
        grid: '20px 20px, 20px 20px',
        diagonal: '20px 20px',
        hexagon: '100px 100px'
    };

    return (
        <div
            className={cn(
                'absolute inset-0 pointer-events-none transition-opacity duration-1000',
                className
            )}
            style={{
                backgroundImage: patterns[pattern],
                backgroundSize: patternSizes[pattern],
                opacity: opacityLevels[opacity],
                color: actualTheme === 'light' ? '#1f2937' : actualTheme === 'dark' ? '#f9fafb' : '#ffffff'
            }}
        />
    );
}

// Parallax scroll effect with theme-aware performance optimization - DISABLED
export function ParallaxContainer({ children, speed = 0.5, className }: { [key: string]: any }) {
    // Return static container - no parallax for stability
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}

// Advanced shimmer loading effect
export function ShimmerEffect({ className, width = '100%', height = '1rem' }: { [key: string]: any }) {
    const { actualTheme } = useTheme();
    
    const shimmerGradient = actualTheme === 'light'
        ? 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)'
        : actualTheme === 'dark'
        ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
        : 'linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%)';

    return (
        <div
            className={cn('animate-shimmer rounded', className)}
            style={{
                width,
                height,
                background: shimmerGradient,
                backgroundSize: '200% 100%'
            }}
        >
            {/* Removed Next.js-specific <style jsx>; global keyframes are declared in ThemeProvider */}
        </div>
    );
}

// Magnetic hover effect for interactive elements - DISABLED for stability
export function MagneticHover({ children, strength = 0.3, className }: { [key: string]: any }) {
    // Return static element - no magnetic effect for stability
    return (
        <div className={cn('', className)}>
            {children}
        </div>
    );
}

// Theme-aware glass morphism container
export function GlassmorphismCard({ children, className, blur = 'md', opacity = 'medium' }: { [key: string]: any }) {
    const { actualTheme, getBlurIntensity } = useTheme();
    
    const blurIntensities = {
        sm: actualTheme === 'light' ? 'backdrop-blur-sm' : actualTheme === 'dark' ? 'backdrop-blur-md' : 'backdrop-blur-lg',
        md: actualTheme === 'light' ? 'backdrop-blur-md' : actualTheme === 'dark' ? 'backdrop-blur-lg' : 'backdrop-blur-xl',
        lg: actualTheme === 'light' ? 'backdrop-blur-lg' : actualTheme === 'dark' ? 'backdrop-blur-xl' : 'backdrop-blur-2xl'
    };

    const opacityClasses = {
        subtle: actualTheme === 'light' ? 'bg-white/60' : actualTheme === 'dark' ? 'bg-gray-900/60' : 'bg-black/80',
        medium: actualTheme === 'light' ? 'bg-white/80' : actualTheme === 'dark' ? 'bg-gray-900/80' : 'bg-black/90',
        strong: actualTheme === 'light' ? 'bg-white/90' : actualTheme === 'dark' ? 'bg-gray-900/90' : 'bg-black/95'
    };

    return (
        <div className={cn(
            'relative overflow-hidden rounded-xl border transition-all duration-300',
            blurIntensities[blur],
            opacityClasses[opacity],
            actualTheme === 'light' ? 'border-white/20' : actualTheme === 'dark' ? 'border-white/10' : 'border-white/5',
            actualTheme === 'oled' && 'shadow-2xl shadow-black/50',
            className
        )}>
            {children}
        </div>
    );
}

