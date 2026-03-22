import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loader from '../components/ui/Loader';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Icons
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const UserCheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ClockIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShieldExclamationIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function AdminPage() {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const mongoUser = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login');
      return;
    }
    if (mongoUser) {
      if (mongoUser.role !== 'admin') {
        navigate('/');
        return;
      }
      fetchUsers();
    }
  }, [isSignedIn, mongoUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const executeStatusChange = async () => {
    if (!confirmModal) return;
    const { userId, action } = confirmModal;
    
    try {
      setConfirmModal(null);
      const token = await getToken();
      await axios.patch(`${API_URL}/admin/users/${userId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUsers();
      
      const successMessages = {
        approve: 'User approved successfully',
        reject: 'User request rejected',
        revoke: 'User access revoked'
      };
      const toastTypes = {
        approve: 'success',
        reject: 'error',
        revoke: 'warning'
      };
      
      showToast(successMessages[action], toastTypes[action]);
      
      // Update selected drawer user if it's open
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revoked' }));
      }
    } catch (err) {
      console.error(err);
      showToast(`Failed to ${action} user`, 'error');
    }
  };

  // Derived State
  const stats = useMemo(() => {
    return {
      total: users.length,
      approved: users.filter(u => u.status === 'approved').length,
      pending: users.filter(u => u.status === 'pending').length,
      revokedRejected: users.filter(u => ['revoked', 'rejected'].includes(u.status)).length
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, statusFilter]);

  if (loading && users.length === 0) return <div className="min-h-screen pt-20 bg-gray-50 dark:bg-netflix-black"><Loader text="Loading admin dashboard..." /></div>;
  if (error) return <div className="min-h-screen pt-20 bg-gray-50 dark:bg-netflix-black text-gray-900 dark:text-white text-center">{error}</div>;

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-netflix-black px-4 sm:px-6 lg:px-8 pb-10 font-sans selection:bg-accent-red/30 transition-colors duration-300">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 flex items-center p-4 rounded-lg shadow-2xl transition-all duration-300 animate-fade-up ${
          toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/90 text-green-900 dark:text-green-100 border border-green-300 dark:border-green-500/50' :
          toast.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/90 text-orange-900 dark:text-orange-100 border border-orange-300 dark:border-orange-500/50' :
          'bg-red-100 dark:bg-red-900/90 text-red-900 dark:text-red-100 border border-red-300 dark:border-red-500/50'
        }`}>
          {toast.type === 'success' && <CheckIcon />}
          {toast.type === 'warning' && <AlertIcon />}
          {toast.type === 'error' && <XIcon />}
          <span className="ml-3 font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold border-l-4 border-accent-red pl-3 text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm md:text-base">Monitor network activity and manage platform access.</p>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-black border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between group hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
            <div>
              <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg text-gray-600 dark:text-zinc-300"><UsersIcon /></div>
          </div>
          <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-green-900/20 dark:to-black border border-gray-200 dark:border-green-900/30 rounded-xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between group hover:border-green-300 dark:hover:border-green-800/50 transition-colors">
            <div>
              <p className="text-gray-500 dark:text-green-400 text-sm font-medium mb-1">Approved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{stats.approved}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-green-900/30 rounded-lg text-gray-600 dark:text-green-400"><UserCheckIcon /></div>
          </div>
          <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-yellow-900/20 dark:to-black border border-gray-200 dark:border-yellow-900/30 rounded-xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between group hover:border-yellow-300 dark:hover:border-yellow-800/50 transition-colors">
            <div>
              <p className="text-gray-500 dark:text-yellow-400 text-sm font-medium mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{stats.pending}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-yellow-900/30 rounded-lg text-gray-600 dark:text-yellow-400"><ClockIcon /></div>
          </div>
          <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-red-900/20 dark:to-black border border-gray-200 dark:border-red-900/30 rounded-xl p-5 shadow-sm dark:shadow-lg flex items-center justify-between group hover:border-red-300 dark:hover:border-red-800/50 transition-colors">
            <div>
              <p className="text-gray-500 dark:text-red-400 text-sm font-medium mb-1">Revoked / Rejected</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{stats.revokedRejected}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-red-900/30 rounded-lg text-gray-600 dark:text-red-400"><ShieldExclamationIcon /></div>
          </div>
        </div>

        {/* --- SEARCH & FILTERS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-white transition-colors">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-accent-red focus:border-accent-red block pl-10 p-2.5 transition-shadow dark:shadow-inner"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-black/50 p-1 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-x-auto w-full md:w-auto hide-scrollbar">
            {['all', 'pending', 'approved', 'revoked', 'rejected'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all whitespace-nowrap ${
                  statusFilter === filter 
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* --- USERS TABLE --- */}
        <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-md dark:shadow-2xl dark:backdrop-blur-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700 dark:text-zinc-300">
              <thead className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5 font-semibold">User Details</th>
                  <th className="px-6 py-5 font-semibold">Role</th>
                  <th className="px-6 py-5 font-semibold">Status</th>
                  <th className="px-6 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50 text-sm">
                {filteredUsers.map((u, idx) => (
                  <tr 
                    key={u._id} 
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors animate-fade-up group cursor-pointer" 
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-white font-bold shadow-inner">
                          {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="font-bold text-gray-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">{u.name || 'Anonymous User'}</div>
                          <div className="text-gray-500 dark:text-zinc-500 text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded inline-flex text-[10px] font-bold tracking-wide uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all ${
                        u.status === 'approved' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 dark:ring-1 dark:ring-green-500/30 dark:shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 
                        u.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 dark:ring-1 dark:ring-yellow-500/30 dark:shadow-[0_0_10px_rgba(234,179,8,0.1)] animate-pulse' : 
                        u.status === 'revoked' ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 dark:ring-1 dark:ring-orange-500/30' :
                        'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 dark:ring-1 dark:ring-red-500/30'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'approved' ? 'bg-green-500 dark:bg-green-400' : u.status === 'pending' ? 'bg-yellow-500 dark:bg-yellow-400' : u.status === 'revoked' ? 'bg-orange-500 dark:bg-orange-400' : 'bg-red-500 dark:bg-red-400'
                        }`} />
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap lg:opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmModal({ userId: u._id, action: 'approve', name: u.email }); }}
                        disabled={(u.status === 'approved' && u.role !== 'admin') || u.role === 'admin'}
                        className="bg-green-50 hover:bg-green-100 dark:bg-green-600/20 dark:hover:bg-green-500 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 border border-green-200 dark:border-green-500/30 hover:border-green-300 dark:hover:border-green-400 disabled:border-gray-200 dark:disabled:border-zinc-800 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-white px-3 py-1.5 rounded transition shadow-sm flex inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <CheckIcon /> <span className="hidden xl:inline">{u.status === 'revoked' ? 'Re-Approve' : 'Approve'}</span>
                      </button>
                      
                      {u.status === 'approved' ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmModal({ userId: u._id, action: 'revoke', name: u.email }); }}
                          disabled={u.role === 'admin'}
                          className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-600/20 dark:hover:bg-orange-500 disabled:bg-gray-100 dark:disabled:bg-zinc-800 border border-orange-200 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-400 disabled:border-gray-200 dark:disabled:border-zinc-800 text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-white px-3 py-1.5 rounded transition shadow-sm flex inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <AlertIcon /> <span className="hidden xl:inline">Revoke</span>
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmModal({ userId: u._id, action: 'reject', name: u.email }); }}
                          disabled={u.status === 'rejected' || u.role === 'admin' || u.status === 'revoked'}
                          className="bg-red-50 hover:bg-red-100 dark:bg-red-600/20 dark:hover:bg-red-500 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-400 disabled:border-gray-200 dark:disabled:border-zinc-800 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-white px-3 py-1.5 rounded transition shadow-sm flex inline-flex items-center gap-1 text-xs font-semibold"
                        >
                           <XIcon /> <span className="hidden xl:inline">Reject</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty States */}
            {users.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
                <UsersIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No users found in the database.</p>
              </div>
            )}
            {users.length > 0 && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
                <SearchIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No users match your filters.</p>
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-4 text-accent-red hover:underline text-sm font-medium">Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 capitalize">{confirmModal.action} User?</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
              Are you sure you want to {confirmModal.action} the access request for <span className="text-gray-900 dark:text-zinc-200 font-semibold">{confirmModal.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={executeStatusChange}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition shadow-lg ${
                  confirmModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500' :
                  confirmModal.action === 'revoke' ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500' :
                  'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                }`}
              >
                Yes, {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- USER DETAILS DRAWER --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedUser(null)} />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border-l border-gray-200 dark:border-zinc-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300 translate-x-0">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition">
                <CloseIcon />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-accent-red/20 to-accent-red border border-accent-red/50 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name || 'Anonymous User'}</h3>
                  <p className="text-gray-500 dark:text-zinc-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Platform Access</p>
                  <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 dark:text-zinc-400 text-sm">Role</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-medium capitalize">{selectedUser.role}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 dark:text-zinc-400 text-sm">Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        selectedUser.status === 'approved' ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-500/10' : 
                        selectedUser.status === 'pending' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/10' : 
                        selectedUser.status === 'revoked' ? 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10' :
                        'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/10'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-zinc-400 text-sm">Join Date</span>
                      <span className="text-gray-900 dark:text-zinc-200 text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Activity</p>
                  <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 dark:text-zinc-400 text-sm">Last Active</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse"></div>
                        <span className="text-gray-900 dark:text-zinc-200 text-sm font-medium">Recently active</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-zinc-600 mt-2 italic">Detailed session logs are currently unavailable.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/30">
              <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmModal({ userId: selectedUser._id, action: 'approve', name: selectedUser.email })}
                  disabled={(selectedUser.status === 'approved' && selectedUser.role !== 'admin') || selectedUser.role === 'admin'}
                  className="bg-green-50 dark:bg-green-600/10 hover:bg-green-100 dark:hover:bg-green-600/20 disabled:opacity-30 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckIcon /> {selectedUser.status === 'revoked' ? 'Re-Approve' : 'Approve'}
                </button>
                {selectedUser.status === 'approved' ? (
                  <button 
                    onClick={() => setConfirmModal({ userId: selectedUser._id, action: 'revoke', name: selectedUser.email })}
                    disabled={selectedUser.role === 'admin'}
                    className="bg-orange-50 dark:bg-orange-600/10 hover:bg-orange-100 dark:hover:bg-orange-600/20 disabled:opacity-30 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <AlertIcon /> Revoke
                  </button>
                ) : (
                  <button 
                    onClick={() => setConfirmModal({ userId: selectedUser._id, action: 'reject', name: selectedUser.email })}
                    disabled={selectedUser.status === 'rejected' || selectedUser.role === 'admin' || selectedUser.status === 'revoked'}
                    className="bg-red-50 dark:bg-red-600/10 hover:bg-red-100 dark:hover:bg-red-600/20 disabled:opacity-30 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <XIcon /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
