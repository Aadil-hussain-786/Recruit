"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.075, // Reduced from 0.1 for smoother interpolation
                duration: 1.2, // Reduced from 1.5 for faster catch-up
                smoothWheel: true,
                wheelMultiplier: 0.8, // Reduced from 1 for less aggressive scrolling
                touchMultiplier: 1.5, // Reduced from 2 for less aggressive touch scrolling
                infinite: false,
                gestureOrientation: 'vertical', // Only handle vertical gestures
                smoothTouch: false, // Disable smooth touch for better performance on mobile
            }}
        >
            {children}
        </ReactLenis>
    );
}
