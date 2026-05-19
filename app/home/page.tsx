"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { MapProvider } from '@/contexts/MapContext';
import Map from '@/components/Map';

const page = () => {
  const router = useRouter();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleListStation = () => {
    const ownerFlag = localStorage.getItem('isOwner');
    if (ownerFlag === 'true') {
      router.push('/ownerdashboard');
    } else {
      router.push('/userdashboard');
    }
  };

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
    <div className="min-h-screen bg-[#0D0F12] text-white">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.15),transparent_45%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-[#7DD3FC] mb-4">Park smarter</p>
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-white">
                Find and book parking in seconds, right where you are.
              </h1>
              <p className="mt-5 text-[#B7BDC6] text-base sm:text-lg">
                ParkBnB connects drivers to nearby stations with real-time availability and instant booking.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/userdashboard')}
                  className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
                >
                  Find Nearby
                </button>
                <button
                  onClick={handleListStation}
                  className="px-6 py-3 rounded-full border border-[#2B2F36] text-white hover:border-[#7DD3FC] hover:text-[#7DD3FC] transition"
                >
                  List Your Station
                </button>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-4">
                  <p className="text-xs text-[#9AA2AE]">Avg. availability</p>
                  <p className="text-2xl font-semibold text-[#7DD3FC]">92%</p>
                </div>
                <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-4">
                  <p className="text-xs text-[#9AA2AE]">Stations nearby</p>
                  <p className="text-2xl font-semibold text-white">30+</p>
                </div>
                <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-4">
                  <p className="text-xs text-[#9AA2AE]">Avg. walk</p>
                  <p className="text-2xl font-semibold text-[#34D399]">3 min</p>
                </div>
              </div>
            </div>

            <MapProvider>
              <div className="bg-[#111318] border border-[#232830] rounded-3xl p-4 sm:p-5 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-between px-2 pb-4">
                  <div>
                    <p className="text-sm text-[#9AA2AE]">Your current area</p>
                    <p className="text-lg font-medium text-white">Live availability map</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                    <span className="text-xs text-[#9AA2AE]">Live</span>
                  </div>
                </div>
                <div className="h-96 rounded-2xl overflow-hidden border border-[#1E232B]">
                  {coords ? (
                    <Map latitude={coords.latitude} longitude={coords.longitude} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#9AA2AE]">
                      {geoError ? geoError : 'Getting your location...'}
                    </div>
                  )}
                </div>
              </div>
            </MapProvider>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-6">
              <p className="text-sm text-[#9AA2AE] mb-2">Instant booking</p>
              <p className="text-xl font-semibold text-white">Reserve a spot before you arrive.</p>
            </div>
            <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-6">
              <p className="text-sm text-[#9AA2AE] mb-2">Trusted stations</p>
              <p className="text-xl font-semibold text-white">Verified owners and clear pricing.</p>
            </div>
            <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-6">
              <p className="text-sm text-[#9AA2AE] mb-2">Smart routing</p>
              <p className="text-xl font-semibold text-white">Get the fastest walk-to-spot route.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;