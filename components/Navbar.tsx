"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');
    const ownerFlag = localStorage.getItem('isOwner');
    if (token) {
       setIsLoggedIn(true);
      setEmail(userEmail || '');
      setIsOwner(ownerFlag === 'true');
    }
  }, []);

  const handleDashboardRedirect = () => {
    if (isOwner) {
      router.push('/ownerdashboard');
    } else {
      router.push('/userdashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('isOwner');
    localStorage.removeItem('latitude');
    localStorage.removeItem('longitude');
    setIsLoggedIn(false);
    router.push('/home');
  };

  return (
    /* Matched the main background and added a subtle bottom border */
    <nav className="bg-[#131314] border-b border-[#333537] sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          {/* Surface color with border, glowing border on hover */}
          <div className="w-10 h-10 bg-[#1E1F20] border border-[#444746] rounded-xl flex items-center justify-center transition-all group-hover:border-[#A8C7FA]">
            {/* Using the accent blue color for the icon */}
            <svg className="w-6 h-6 text-[#A8C7FA]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </div>
          {/* Adjusted text color and font weight to match the headers */}
          <span className="text-2xl font-medium text-[#E3E3E3] group-hover:text-white transition-colors">
            ParkBnB
          </span>
        </Link>

        {/* Sign In / Logout Button */}
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handleDashboardRedirect}
              className="text-[#C4C7C5] text-sm hover:text-white transition-colors"
            >
              {email}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 text-white font-medium border rounded-2xl transition-all hover:bg-white/20 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2.5 text-white font-medium border border-[#444746] rounded-2xl transition-all hover:border-[#A8C7FA] hover:text-[#A8C7FA]"
            >
              Register
            </button>
            <button
              onClick={() => router.push('/signin')}
              className="px-6 py-2.5 bg-white text-black font-medium border border-[#444746] rounded-2xl transition-all hover:bg-gray-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar