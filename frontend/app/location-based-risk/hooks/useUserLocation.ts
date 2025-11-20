"use client";
import { useState, useCallback } from "react";

export const useUserLocation = (options: any = {}) => {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                setLoading(false);
            },
            (err) => {
                let errorMessage = err.message;

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = "Location permission denied";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage =
                            "Location unavailable. Try enabling location services or moving to a location with better signal.";
                        break;
                    case err.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                }

                setError(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000,
                ...options,
            }
        );
    }, [options]);

    return { location, error, loading, getLocation };
};
