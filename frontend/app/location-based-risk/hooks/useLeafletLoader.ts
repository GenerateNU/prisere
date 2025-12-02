import { useEffect, useState } from "react";

/**
 * Hook to dynamically load Leaflet library
 */
export const useLeafletLoader = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (window.L) {
            setIsLoaded(true);
            return;
        }

        const loadLeaflet = async () => {
            try {
                // Load CSS
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
                document.head.appendChild(link);

                // Load JS
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";

                await new Promise<void>((resolve, reject) => {
                    script.onload = () => setTimeout(() => resolve(), 1000);
                    script.onerror = () => reject(new Error("Failed to load Leaflet"));
                    document.head.appendChild(script);
                });
                setIsLoaded(true);
            } catch (_err) {
                setError(true);
            }
        };

        loadLeaflet();
    }, []);
    return { isLoaded, error };
};
