"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Uncomment when navigation is needed
import Image from 'next/image';
// import { Button } from '@/components/ui/button'; // Assuming shadcn/ui components
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

export default function LoginPage() {
  const [username, setUsername] = useState('admin'); // Default to admin for testing
  const [password, setPassword] = useState('admin'); // Default to admin for testing
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, { // Using the API_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Handle successful login, e.g., store token, redirect
      console.log('Login successful:', data);
      if (data.token) {
        // In a real app, store the token securely (e.g., localStorage, sessionStorage, or context/state management)
        localStorage.setItem('authToken', data.token);
        router.push('/admin/dashboard'); // Redirect to dashboard
      } else {
        setError('Login successful, but no token received.');
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C]">
      <div className="p-8 bg-[#1C1C1C] shadow-md rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image src="/images/logo_login.png" alt="Kapexia Logo" width={120} height={120} />
        </div>
        {/* <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1> */}
        {/* <p className="text-center text-gray-600 mb-6">Kapexia CRM</p> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200">Username</label>
            <input
              id="username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-[#232323] text-gray-100 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">Password</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-[#232323] text-gray-100 placeholder-gray-400"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#119d85] hover:bg-[#0e7c6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#119d85]" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">&copy; {new Date().getFullYear()} Kapexia. All rights reserved.</p>
      </div>
    </div>
  );
}

