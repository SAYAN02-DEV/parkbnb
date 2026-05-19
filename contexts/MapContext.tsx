"use client"
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type MarkerData = {
    id: string;
    longitude: number;
    latitude: number;
    color?: string;
    popup?: string;
}

export type RouteData = {
    coordinates: [number, number][];
    duration: number;
    distance: number;
}

type MapContextType = {
    markers: MarkerData[];
    route: RouteData | null;
    addMarker: (marker: MarkerData) => void;
    removeMarker: (id: string) => void;
    updateMarker: (id: string, updates: Partial<MarkerData>) => void;
    clearMarkers: () => void;
    setRoute: (route: RouteData | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [route, setRoute] = useState<RouteData | null>(null);

    const addMarker = useCallback((marker: MarkerData) => {
        setMarkers(prev => [...prev, marker]);
    }, []);

    const removeMarker = useCallback((id: string) => {
        setMarkers(prev => prev.filter(m => m.id !== id));
    }, []);

    const updateMarker = useCallback((id: string, updates: Partial<MarkerData>) => {
        setMarkers(prev => prev.map(m => 
            m.id === id ? { ...m, ...updates } : m
        ));
    }, []);

    const clearMarkers = useCallback(() => {
        setMarkers([]);
    }, []);

    const contextValue = useMemo(() => ({
        markers,
        route,
        addMarker,
        removeMarker,
        updateMarker,
        clearMarkers,
        setRoute
    }), [markers, route, addMarker, removeMarker, updateMarker, clearMarkers]);

    return (
        <MapContext.Provider value={contextValue}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within MapProvider');
    }
    return context;
};