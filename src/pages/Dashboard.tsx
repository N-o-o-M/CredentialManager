import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Credential } from '../types';
import { Copy, Edit, Trash2, Key, Plus, LogOut, Eye, EyeOff, Search, Lock, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateStrongPassword, checkPasswordStrength } from '../lib/crypto';

function Dashboard() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const fetchCredentials = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      console.error('Error fetching credentials:', error.message);
      toast.error('Error fetching credentials');
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const filteredCredentials = credentials.filter(cred => 
    cred.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cred.notes && cred.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error('Error logging out');
      console.error('Logout error:', error.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(16);
    const form = document.querySelector('form') as HTMLFormElement;
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.value = newPassword;
      toast.success('Strong password generated!');
    }
  };

  const handleSave = async (e: React.FormEvent, isEditing: boolean = false) => {
    e.preventDefault();
    try {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to save credentials');
      }

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const password = formData.get('password') as string;
      
      // Check password strength
      const { score, feedback } = checkPasswordStrength(password);
      if (score < 3) {
        toast.error('Please use a stronger password: ' + feedback.join(', '));
        return;
      }
      
      const credentialData = {
        platform: formData.get('platform') as string,
        username: formData.get('username') as string,
        password,
        url: formData.get('url') as string,
        notes: formData.get('notes') as string,
        user_id: session.user.id
      };

      if (isEditing && editingCredential) {
        const { error } = await supabase
          .from('credentials')
          .update(credentialData)
          .eq('id', editingCredential.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
        toast.success('Credential updated successfully!');
      } else {
        const { error } = await supabase
          .from('credentials')
          .insert([credentialData]);

        if (error) throw error;
        toast.success('Credential added successfully!');
      }

      await fetchCredentials();
      setShowAddForm(false);
      setEditingCredential(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Error saving credential');
      console.error('Save error:', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!session?.user?.id) return;
      if (!confirm('Are you sure you want to delete this credential?')) return;

      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success('Credential deleted successfully!');
      await fetchCredentials();
    } catch (error: any) {
      toast.error('Error deleting credential');
      console.error('Delete error:', error.message);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Key className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credential Manager</h1>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Securely manage your passwords</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingCredential(null);
              }}
              className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className={`h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {(showAddForm || editingCredential) && (
          <div className={`rounded-xl shadow-lg p-6 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingCredential ? 'Edit Credential' : 'Add New Credential'}
            </h2>
            <form onSubmit={(e) => handleSave(e, !!editingCredential)} className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Platform</label>
                <input
                  type="text"
                  name="platform"
                  required
                  defaultValue={editingCredential?.platform}
                  className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  defaultValue={editingCredential?.username}
                  className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="relative">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Password</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showFormPassword ? "text" : "password"}
                      name="password"
                      required
                      defaultValue={editingCredential?.password}
                      className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className={`absolute right-2 top-[60%] transform -translate-y-1/2 ${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>URL (optional)</label>
                <input
                  type="url"
                  name="url"
                  defaultValue={editingCredential?.url}
                  className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingCredential?.notes}
                  className={`mt-1 block w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                  }`}
                ></textarea>
              </div>
              <div className="col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCredential(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingCredential ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Platform</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Username</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Password</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>URL</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Notes</th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredCredentials.map((cred) => (
                  <tr key={cred.id} className={`transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Lock className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{cred.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>{cred.username}</span>
                        <button
                          onClick={() => handleCopy(cred.username)}
                          className={`transition-colors ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          {showPassword[cred.id] ? cred.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(cred.id)}
                          className={`transition-colors ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {showPassword[cred.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(cred.password)}
                          className={`transition-colors ${
                            isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cred.url && (
                        <a
                          href={cred.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {new URL(cred.url).hostname}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cred.notes && (
                        <span className={`truncate max-w-xs block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {cred.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingCredential(cred)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cred.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCredentials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Lock className={`h-8 w-8 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {searchTerm ? 'No credentials found matching your search.' : 'No credentials found. Add your first one!'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;