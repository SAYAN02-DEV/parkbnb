'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { MapProvider } from '@/contexts/MapContext';
import axios from 'axios';

interface ParkingLot {
  id: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
  bookedSlots: number;
}

interface Booking {
  bookingId: string;
  parkingId: string;
  userId: string;
  bookingDate: string;
  status: string;
}

const Page = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyLots, setNearbyLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const fetchedRef = useRef(false);

  const fetchBookings = useCallback(async (bookingType: 'current' | 'past') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/v1/userdetails',
        {},
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.status === 200) {
        if (bookingType === 'current') {
          // currentBooking is a String in your Mongoose model
          const currentBookingId = response.data.currentBooking;
          
          if (currentBookingId) {
            setBookings([{
              bookingId: currentBookingId,
              parkingId: 'Check details', // Mongoose model doesn't store this, so we provide a fallback
              userId: '',
              bookingDate: '',
              status: 'Active'
            }]);
          } else {
            setBookings([]);
          }
        } else if (bookingType === 'past') {
          // pastBooking is an Array of Objects in your Mongoose model
          const pastBookingsList = response.data.pastBooking || [];
          
          const formattedPastBookings = pastBookingsList.map((item: { bookingId: string }) => ({
            bookingId: item.bookingId,
            parkingId: 'Check details', // Mongoose model doesn't store this, so we provide a fallback
            userId: '',
            bookingDate: '',
            status: 'Completed'
          }));
          
          setBookings(formattedPastBookings);
        }
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((activeSection === 'currentbookings' || activeSection === 'pastbookings') && !fetchedRef.current) {
      fetchedRef.current = true;
      const bookingType = activeSection === 'currentbookings' ? 'current' : 'past';
      fetchBookings(bookingType);
    } else if (activeSection === 'overview') {
      fetchedRef.current = false;
    }
  }, [activeSection, fetchBookings]);

  const handleViewNearby = async () => {
    setMessage('');
    setLoading(true);
    
    try {
      const latitude = localStorage.getItem('latitude');
      const longitude = localStorage.getItem('longitude');
      const token = localStorage.getItem('token');

      if (!latitude || !longitude) {
        setMessage('Location not available. Please check location permissions.');
        setLoading(false);
        return;
      }

      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/v1/viewnearby',
        {
          userLat: parseFloat(latitude),
          userLong: parseFloat(longitude)
        },
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.status === 200) {
        setNearbyLots(response.data);
        setShowNearby(true);
        if (response.data.length === 0) {
          setMessage('No nearby parking lots found');
        }
      }
    } catch (error) {
      setMessage('Error fetching nearby lots: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLot = (lotId: string) => {
    setSelectedLot(lotId);
  };

  const handleBookNow = async () => {
    if (!selectedLot) return;

    setBookingLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setBookingLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/v1/confirmbooking',
        {
          parkingId: selectedLot
        },
        {
          headers: {
            'token': token
          }
        }
      );

      if (response.status === 200) {
        setMessage(`✓ Booking confirmed! Booking ID: ${response.data.bookingId}`);
        setShowNearby(false);
        setSelectedLot(null);
        setNearbyLots([]);
        setTimeout(() => {
          setMessage('');
        }, 5000);
      }
    } catch {
      console.log("someting on userdashboard ");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-white">
      <Navbar />

      {activeSection === 'currentbookings' ? (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button 
            onClick={() => setActiveSection('overview')}
            className="mb-6 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            ← Back
          </button>
          
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">Current Bookings</h1>
            
            <div className="bg-[#1E1F20] border border-[#333537] rounded-3xl p-8">
              {loading && bookings.length === 0 ? (
                <p className="text-[#C4C7C5]">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-[#C4C7C5]">No current bookings found</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="p-4 rounded-lg border bg-[#131314] border-[#333537] hover:border-[#A8C7FA] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{booking.bookingId}</p>
                          <p className="text-sm text-[#8E918F]">Parking: {booking.parkingId}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200">
                          {booking.status || 'Active'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message && (
                <div className={`mt-4 p-4 rounded-lg text-sm ${
                  message.includes('Error') 
                    ? 'bg-red-900 text-red-200' 
                    : 'bg-green-900 text-green-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeSection === 'pastbookings' ? (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button 
            onClick={() => setActiveSection('overview')}
            className="mb-6 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            ← Back
          </button>
          
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">Past Bookings</h1>
            
            <div className="bg-[#1E1F20] border border-[#333537] rounded-3xl p-8">
              {loading && bookings.length === 0 ? (
                <p className="text-[#C4C7C5]">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-[#C4C7C5]">No past bookings found</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="p-4 rounded-lg border bg-[#131314] border-[#333537] hover:border-[#A8C7FA] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{booking.bookingId}</p>
                          <p className="text-sm text-[#8E918F]">Parking: {booking.parkingId}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-200">
                          {booking.status || 'Completed'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message && (
                <div className={`mt-4 p-4 rounded-lg text-sm ${
                  message.includes('Error') 
                    ? 'bg-red-900 text-red-200' 
                    : 'bg-green-900 text-green-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeSection === 'nearbyparking' ? (
        <MapProvider>
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center justify-center gap-8 min-h-[500px]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">User Dashboard</h1>
                  <p className="text-slate-400 mb-8">Find and book nearby parking lots</p>
                </div>

                <button
                  onClick={handleViewNearby}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? 'Loading...' : 'View Nearby Parking'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>

                {message && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 max-w-md">
                    {message}
                  </div>
                )}
              </div>
              {showNearby ? (
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Nearby Parking Lots</h1>
                      <p className="text-slate-400">Found {nearbyLots.length} parking lot(s) nearby</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSection('overview');
                        setShowNearby(false);
                        setSelectedLot(null);
                        setNearbyLots([]);
                      }}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
                    >
                      Back
                    </button>
                  </div>

                {message && (
                  <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400">
                    {message}
                  </div>
                )}

                {nearbyLots.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Parking Lots List */}
                    <div className="lg:col-span-1">
                      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                        <div className="bg-slate-800 p-4 border-b border-slate-700">
                          <h2 className="text-lg font-semibold text-white">Available Lots</h2>
                        </div>
                        <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                          {nearbyLots.map((lot) => (
                            <button
                              key={lot.id}
                              onClick={() => handleSelectLot(lot.id)}
                              className={`w-full p-4 text-left transition-all ${
                                selectedLot === lot.id
                                  ? 'bg-blue-600/20 border-l-4 border-blue-600'
                                  : 'hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-white">Lot ID</h3>
                                <span className="text-xs text-slate-400">{lot.id.slice(0, 8)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-slate-400">Available</p>
                                  <p className="text-green-400 font-semibold">{lot.totalSlots - lot.bookedSlots}/{lot.totalSlots}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Booked</p>
                                  <p className="text-orange-400 font-semibold">{lot.bookedSlots}</p>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-slate-400">
                                <p>Lat: {lot.latitude.toFixed(4)}</p>
                                <p>Lng: {lot.longitude.toFixed(4)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selected Lot Details */}
                    <div className="lg:col-span-2">
                      {selectedLot ? (
                        (() => {
                          const selected = nearbyLots.find(lot => lot.id === selectedLot);
                          return selected ? (
                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                              <h2 className="text-2xl font-bold text-white mb-6">Parking Lot Details</h2>
                              
                              <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-slate-800 rounded-lg p-4">
                                  <p className="text-slate-400 text-sm mb-2">Total Slots</p>
                                  <p className="text-3xl font-bold text-white">{selected.totalSlots}</p>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4">
                                  <p className="text-slate-400 text-sm mb-2">Available Slots</p>
                                  <p className="text-3xl font-bold text-green-400">{selected.totalSlots - selected.bookedSlots}</p>
                                </div>
                              </div>

                              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                                <h3 className="text-white font-semibold mb-4">Location Coordinates</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-slate-400 text-sm">Latitude</p>
                                    <p className="text-white font-mono">{selected.latitude.toFixed(6)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm">Longitude</p>
                                    <p className="text-white font-mono">{selected.longitude.toFixed(6)}</p>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={handleBookNow}
                                disabled={selected.totalSlots - selected.bookedSlots === 0 || bookingLoading}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                {bookingLoading
                                  ? 'Booking...'
                                  : selected.totalSlots - selected.bookedSlots === 0
                                  ? 'No Slots Available'
                                  : 'Book Now'}
                              </button>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 flex items-center justify-center min-h-96">
                          <p className="text-slate-400 text-center">Select a parking lot to see details and book</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
                    <p className="text-slate-400 text-lg">No nearby parking lots found in your area</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-8 min-h-[500px]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">Find Parking</h1>
                  <p className="text-slate-400 mb-8">Search for nearby parking lots</p>
                </div>

                <button
                  onClick={handleViewNearby}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? 'Loading...' : 'View Nearby Parking'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </button>

                {message && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 max-w-md">
                    {message}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </MapProvider>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">User Dashboard</h1>
            <p className="text-[#C4C7C5]">Manage your parking bookings</p>
          </div>

          {/* Main Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Current Bookings Card */}
            <div 
              className="bg-[#1E1F20] border border-[#333537] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer" 
              onClick={() => setActiveSection('currentbookings')}
            >
              <h3 className="text-2xl font-bold mb-2">Current Bookings</h3>
              <p className="text-[#C4C7C5] mb-6">View your active parking bookings</p>
              <button className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
                View Now
              </button>
            </div>

            {/* Past Bookings Card */}
            <div 
              className="bg-[#1E1F20] border border-[#333537] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer" 
              onClick={() => setActiveSection('pastbookings')}
            >
              <h3 className="text-2xl font-bold mb-2">Past Bookings</h3>
              <p className="text-[#C4C7C5] mb-6">View your completed parking bookings</p>
              <button className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
                View History
              </button>
            </div>

            {/* Find Parking Card */}
            <div 
              className="bg-[#1E1F20] border border-[#333537] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer" 
              onClick={() => setActiveSection('nearbyparking')}
            >
              <h3 className="text-2xl font-bold mb-2">Find Parking</h3>
              <p className="text-[#C4C7C5] mb-6">Find and book nearby parking lots</p>
              <button className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
                Search Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;