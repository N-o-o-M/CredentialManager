import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Invalid email or password');
      console.error('Login error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error('Error signing in with Google');
      console.error('Google login error:', error.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) throw error;

      toast.success('Password reset link sent to your email!');
      setShowResetForm(false);
    } catch (error: any) {
      toast.error('Error sending reset link');
      console.error('Reset password error:', error.message);
    } finally {
      setLoading(false);
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
        <h2 className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
        
        {showResetForm ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowResetForm(false)}
              className={`w-full ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
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
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowResetForm(true)}
              className="mt-2 w-full text-blue-500 hover:text-blue-600 text-sm"
            >
              Forgot Password?
            </button>

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
                onClick={handleGoogleLogin}
                className={`mt-4 w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </div>

            <p className={`mt-4 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                Sign up
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}