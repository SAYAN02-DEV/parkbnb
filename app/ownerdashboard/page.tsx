"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import AddStation from '@/components/AddStation';
import { MapProvider } from '@/contexts/MapContext';

const OwnerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [bookings, setBookings] = useState<{ id: string; bookingId?: string; userId: string; isOccupied: boolean; date: string }[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ totalStations: 0, totalSlots: 0, occupied: 0, available: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const fetchedRef = useRef(false);
  const statsFetchedRef = useRef(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/ownerstations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      });

      const data = await response.json();
      
      if (response.ok && data.allBookings) {
        setBookings(data.allBookings);
        setMessage('');
      } else {
        setMessage(data.message || 'Failed to fetch bookings');
        setBookings([]);
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProcessLeave = async () => {
    if (!selectedBookingId) {
      setMessage('Please select a booking');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/userleave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          bookingId: selectedBookingId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Success! Customer departure processed.');
        setSelectedBookingId('');
        
        await fetchBookings();
      } else {
        setMessage(data.message || 'Failed to process leave');
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Not authenticated. Please sign in first.');
        setStats({ totalStations: 0, totalSlots: 0, occupied: 0, available: 0 });
        return;
      }

      const response = await fetch('/api/v1/ownerdashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      });

      const data = await response.json();

      if (response.ok) {
        const totalSlots = Number(data.totalSlots || 0);
        const available = Number(data.availableSlots || 0);
        const occupied = Math.max(0, totalSlots - available);

        setStats({
          totalStations: 1,
          totalSlots,
          occupied,
          available
        });
        setMessage('');
      } else {
        setMessage(data.message || 'Failed to fetch dashboard stats');
        setStats({ totalStations: 0, totalSlots: 0, occupied: 0, available: 0 });
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setStats({ totalStations: 0, totalSlots: 0, occupied: 0, available: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch bookings when userleave section is activated
  useEffect(() => {
    if (activeSection === 'userleave' && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchBookings();
    } else if (activeSection !== 'userleave') {
      fetchedRef.current = false;
    }
  }, [activeSection, fetchBookings]);

  useEffect(() => {
    if (activeSection === 'overview' && !statsFetchedRef.current) {
      statsFetchedRef.current = true;
      fetchDashboardStats();
    } else if (activeSection !== 'overview') {
      statsFetchedRef.current = false;
    }
  }, [activeSection, fetchDashboardStats]);
  
  return (
    <div className="min-h-screen bg-[#0E0F12] text-white">
      <Navbar />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_45%)]" />

      {activeSection === 'addstation' ? (
        <MapProvider>
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <button 
              onClick={() => setActiveSection('overview')}
              className="mb-8 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
            >
              ← Back
            </button>
            <AddStation />
          </div>
        </MapProvider>
      ) : activeSection === 'userleave' ? (
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <button 
            onClick={() => setActiveSection('overview')}
            className="mb-8 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            ← Back
          </button>
          
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold text-white mb-8 font-serif">Process Customer Departure</h1>
            
            <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-8 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)]">
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-3">
                  Select Booking ID
                </label>
                
                {loading && bookings.length === 0 ? (
                  <p className="text-[#C4C7C5]">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-[#C4C7C5]">No active bookings found</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bookings.map((booking, index) => (
                      <div
                        key={booking.id || booking.bookingId || `${booking.userId}-${booking.date}-${index}`}
                        onClick={() => setSelectedBookingId(booking.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          selectedBookingId === booking.id
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-[#0F1115] border-[#232830] hover:border-[#A8C7FA]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">Booking ID: {booking.bookingId || booking.id}</p>
                            <p className="text-sm text-[#8E918F]">User ID: {booking.userId}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.isOccupied 
                              ? 'bg-red-900 text-red-200' 
                              : 'bg-green-900 text-green-200'
                          }`}>
                            {booking.isOccupied ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleProcessLeave}
                disabled={loading || !selectedBookingId}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 rounded-xl transition"
              >
                {loading ? 'Processing...' : 'Process Departure'}
              </button>

              {message && (
                <div className={`mt-4 p-4 rounded-lg text-sm ${
                  message.includes('Success') 
                    ? 'bg-green-900 text-green-200' 
                    : 'bg-red-900 text-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="uppercase tracking-[0.4em] text-xs text-[#7DD3FC] mb-4">Operations</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-3 font-serif">Owner Dashboard</h1>
          <p className="text-[#B7BDC6] text-lg">Manage your parking stations and monitor activity</p>
        </div>

        {/* Main Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Add Station Card */}
          <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)]" onClick={() => setActiveSection('addstation')}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#0F1115] border border-[#232830] flex items-center justify-center text-[#7DD3FC]">
                +
              </div>
              <span className="text-xs text-[#9AA2AE]">Create</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Add Station</h3>
            <p className="text-[#B7BDC6]">Register a new parking station</p>
            <button className="mt-6 w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
              + Add Now
            </button>
          </div>

          {/* User Leave Card */}
          <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)]" onClick={() => setActiveSection('userleave')}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#0F1115] border border-[#232830] flex items-center justify-center text-[#FCA5A5]">
                ↘
              </div>
              <span className="text-xs text-[#9AA2AE]">Departures</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">User Leave</h3>
            <p className="text-[#B7BDC6]">Mark customer as departed</p>
            <button className="mt-6 w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
              Process Leave
            </button>
          </div>

          {/* Analytics Card */}
          <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-8 hover:border-[#A8C7FA] transition-all cursor-pointer shadow-[0_20px_60px_-50px_rgba(0,0,0,0.85)]" onClick={() => setActiveSection('analytics')}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#0F1115] border border-[#232830] flex items-center justify-center text-[#A7F3D0]">
                ▸
              </div>
              <span className="text-xs text-[#9AA2AE]">Insights</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Analytics</h3>
            <p className="text-[#B7BDC6]">View parking statistics</p>
            <button className="mt-6 w-full py-2.5 px-4 bg-white text-black font-medium rounded-2xl hover:bg-gray-100 transition-all">
              View Analytics
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-6">
            <p className="text-[#8E918F] text-sm mb-2">Total Stations</p>
            <p className="text-3xl font-bold">{statsLoading ? '—' : stats.totalStations}</p>
          </div>
          <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-6">
            <p className="text-[#8E918F] text-sm mb-2">Total Slots</p>
            <p className="text-3xl font-bold">{statsLoading ? '—' : stats.totalSlots}</p>
          </div>
          <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-6">
            <p className="text-[#8E918F] text-sm mb-2">Occupied</p>
            <p className="text-3xl font-bold text-red-400">{statsLoading ? '—' : stats.occupied}</p>
          </div>
          <div className="bg-[#15181D] border border-[#232830] rounded-2xl p-6">
            <p className="text-[#8E918F] text-sm mb-2">Available</p>
            <p className="text-3xl font-bold text-green-400">{statsLoading ? '—' : stats.available}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#15181D] border border-[#232830] rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#131314] rounded-2xl border border-[#333537]">
              <div>
                <p className="font-medium">No recent activity</p>
                <p className="text-sm text-[#8E918F]">Your activities will appear here</p>
              </div>
              <div className="w-2 h-2 bg-[#444746] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
