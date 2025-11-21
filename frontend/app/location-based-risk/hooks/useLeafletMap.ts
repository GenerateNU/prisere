import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook to initialize and manage Leaflet map instance
 */
export const useLeafletMap = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    isLeafletLoaded: boolean,
    currentLocation: [number, number]
) => {
    const mapInstanceRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize map
    useEffect(() => {
        if (
            !containerRef.current ||
            containerRef.current === null ||
            !window.L ||
            mapInstanceRef.current ||
            !isLeafletLoaded
        )
            return;

        // Initialize map with a slight delay to ensure Leaflet is fully ready
        const timer = setTimeout(() => {
            if (!containerRef.current || containerRef.current === null || mapInstanceRef.current) return;

            try {
                // Initialize map
                const map = window.L.map(containerRef.current as HTMLDivElement).setView(currentLocation, 0);
                mapInstanceRef.current = map;

                // Add tile layer
                window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 10,
                    attribution: "© OpenStreetMap contributors",
                }).addTo(map);

                setIsReady(true);
            } catch (err) {
                console.error("Error initializing map:", err);
            }
        }, 50);

        // Cleanup
        return () => {
            clearTimeout(timer);
        };
    }, [isLeafletLoaded]);

    // Update map view when currentLocation changes
    useEffect(() => {
        if (mapInstanceRef.current && isReady) {
            mapInstanceRef.current.setView(currentLocation, 13);
        }
    }, [currentLocation, isReady]);

    const panTo = useCallback(
        (lat: number, lng: number) => {
            if (mapInstanceRef.current && isReady) {
                mapInstanceRef.current.panTo([lat, lng]);
            }
        },
        [isReady]
    );

    return {
        map: mapInstanceRef.current,
        isReady,
        panTo,
    };
};
