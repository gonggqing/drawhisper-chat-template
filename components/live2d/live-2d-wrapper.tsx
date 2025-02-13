"use client";

import Script from "next/script";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Live2D component with SSR disabled
const Live2D = dynamic(() => import("@/components/live2d/canvas"), {
    ssr: false,
});

export default function Live2DWrapper({children} : {children: React.ReactNode}) {
    const [isCoreDone, setIsCoreDone] = useState(false);
    const [isLive2DDone, setIsLive2DDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Scripts must be loaded in this specific order
    const handleCoreLoad = () => {
        console.log("Live2D Cubism Core loaded");
        setIsCoreDone(true);
    };

    const handleLive2DLoad = () => {
        console.log("Live2D library loaded");
        setIsLive2DDone(true);
    };

    const handleScriptError = (scriptName: string) => {
        setError(`Failed to load ${scriptName}`);
        console.error(`Script loading failed: ${scriptName}`);
    };

    // Both scripts must be loaded for the Live2D to work
    const isLoaded = isCoreDone && isLive2DDone;

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            {/* Load Live2D Core for cubism4 */}
            <Script 
                src="/scripts/live2dcubismcore.min.js"
                onLoad={handleCoreLoad}
                onError={() => handleScriptError("Live2D Cubism Core")}
            />
            {/* Then load Live2D library for cubism2 */}
            <Script 
                src="/scripts/live2d.min.js"
                onLoad={handleLive2DLoad}
                onError={() => handleScriptError("Live2D library")}
            />
            {isLoaded && <Live2D>{children}</Live2D>}
        </div>
    );
}
