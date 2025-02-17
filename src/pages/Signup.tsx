import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(error.message || 'Error creating account');
      }
      console.error('Signup error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Error signing up with Google');
      console.error('Google signup error:', error.message);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className={`p-8 rounded-lg shadow-md w-96 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-500 p-3 rounded-lg">
            <Key className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create an Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              required
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Confirm Password</label>
            <input
              type="password"
              required
              minLength={8}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className={`mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign up with Google
          </button>
        </div>

        <p className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}