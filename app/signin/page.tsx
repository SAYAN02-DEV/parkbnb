"use client";
import axios from 'axios';
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

const Signin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('latitude', latitude.toString());
        localStorage.setItem('longitude', longitude.toString());
      });
    }
  }, []);


  const clickSignin = async () => {
    setLoading(true);
    
    try {
      const endpoint = isOwner ? '/api/v1/ownersignin' : '/api/v1/signin';
      const response = await axios.post(endpoint, {
        password: password,
        email: email,
        longitude: localStorage.getItem('longitude'),
        latitude: localStorage.getItem('latitude')
      });
      
      if (response.status === 200 && response.data.token) {
        const serverIsOwner = Boolean(response.data.isOwner);
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', email);
        localStorage.setItem('isOwner', serverIsOwner.toString());
        
        console.log("signing succeed")
       if(serverIsOwner) router.push('/ownerdashboard');
       else router.push('/userdashboard');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Background matches Gemini's deep #131314 dark mode canvas */
    <div className="min-h-screen flex items-center justify-center bg-[#131314] p-4 font-sans">

      <div className="w-full max-w-md bg-[#1E1F20] rounded-3xl p-8 border border-[#333537] shadow-xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          {}
          <h2 className="text-3xl font-medium mb-2 bg-clip-text text-white">
            Welcome Back
          </h2>
          <p className="text-[#C4C7C5]">Sign in to your account</p>
        </div>

        {/* User/Owner Toggle */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setIsOwner(false)}
            className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
              !isOwner
                ? 'bg-[#A8C7FA] text-black border border-[#A8C7FA]'
                : 'bg-[#131314] text-[#C4C7C5] border border-[#444746] hover:border-[#A8C7FA]'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsOwner(true)}
            className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all ${
              isOwner
                ? 'bg-[#A8C7FA] text-black border border-[#A8C7FA]'
                : 'bg-[#131314] text-[#C4C7C5] border border-[#444746] hover:border-[#A8C7FA]'
            }`}
          >
            Owner
          </button>
        </div>

        {/* Email input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#C4C7C5] mb-2">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#131314] border border-[#444746] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#A8C7FA] focus:border-[#A8C7FA] text-[#E3E3E3] placeholder-[#8E918F] transition-all"
          />
        </div>

        {/* Password input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#C4C7C5] mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#131314] border border-[#444746] rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#A8C7FA] focus:border-[#A8C7FA] text-[#E3E3E3] placeholder-[#8E918F] transition-all"
          />
        </div>

        {/* Sign In Button */}
        <button 
          onClick={clickSignin}
          disabled={loading || !email || !password}
          /* Gemini Button Gradient with subtle glowing shadow */
          className="w-full py-3.5 px-4 bg-white text-black border border-[#444746] rounded-2xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : `Sign In as ${isOwner ? 'Owner' : 'User'}`}
        </button>
      </div>
    </div>
  )
}

export default Signin