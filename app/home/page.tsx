"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { MapProvider } from '@/contexts/MapContext';
import Map from '@/components/Map';

const page = () => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setGeoError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <MapProvider>
        <div className="flex justify-center items-center p-8">
          <div className="w-full max-w-2xl">
            <div className="h-96 rounded-xl overflow-hidden shadow-lg border border-slate-800">
              {coords ? (
                <Map latitude={coords.latitude} longitude={coords.longitude} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  {geoError ? geoError : 'Getting your location...'}
                </div>
              )}
              {/* <AddStation/> */}
            </div>
          </div>
        </div>
      </MapProvider>
    </div>
  );
};

export default page;